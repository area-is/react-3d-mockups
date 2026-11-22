import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import {
  ID_CARD,
  ID_CARD_REGIONS,
  WEAVE,
  clipRoundedRect,
  clipRoundedRectOutline,
  createSurfaceSheenMaterial,
  grainNormal,
  roundedRectShape,
  roundedRectShapeCorners,
  smoothShaded,
} from '../../core'
import { DeviceScreen, SCREEN_MASK_INSET } from '../../screen/device-screen'
import { collectSlots, createSlots, resolveSurface, type SurfaceProps } from '../../slots'

type GroupProps = ThreeElements['group']

export interface IDCardProps extends Omit<GroupProps, 'children' | 'color'>, SurfaceProps {
  /**
   * Face designs - full bleed over the WHOLE card (punch strip included);
   * the slot punch is carved out of the live area. Bare children fill the
   * front face; name faces explicitly with `<IDCard.Front>` and
   * `<IDCard.Back>` (plain stock when the back is omitted).
   */
  children?: React.ReactNode
  /** Card stock color - the edges and the inside of the punched slot. */
  color?: string
  /** Woven lanyard strap color. */
  lanyardColor?: string
}

/**
 * Build a gently draped woven ribbon half rising out of the folded crimp.
 * Separating the two strap layers cleanly in Z (`side` = +1 front fold, -1
 * back fold) eliminates the coplanar z-fighting seam above the metal crimp
 * while giving the hanging V a natural soft catenary drape.
 */
function lanyardRibbonGeometry(
  width: number,
  thickness: number,
  length: number,
  spreadAngle: number,
  backTilt: number,
  side: 1 | -1
): THREE.BufferGeometry {
  const segs = 28
  const g = new THREE.BoxGeometry(width, length, thickness, 1, segs, 1)
  // Shift so local y = 0 sits at the crimp mouth and runs up to y = length.
  g.translate(0, length / 2, 0)
  const pos = g.getAttribute('position')
  const sinS = Math.sin(side * spreadAngle)
  const cosS = Math.cos(side * spreadAngle)
  const tanTilt = Math.tan(backTilt)
  for (let i = 0; i < pos.count; i++) {
    const x0 = pos.getX(i)
    const y0 = pos.getY(i)
    const z0 = pos.getZ(i)
    const t = y0 / length
    // Gentle easing out of the crimp mouth into the hanging V angle: keeps the
    // two folded halves neatly stacked inside the crimp and opening smoothly above it.
    const flare = Math.min(1, t * 5.5)
    const smoothFlare = flare * flare * (3 - 2 * flare)
    const cx = side * Math.sin(spreadAngle) * y0 * (0.25 + 0.75 * smoothFlare)
    // Separate front/back layers cleanly at the crimp, then settle smoothly into backTilt.
    const layerSep = side * (thickness * 0.65) * (1 - 0.6 * smoothFlare)
    const drapeZ = -y0 * tanTilt - 0.08 * Math.sin(Math.PI * t) + layerSep
    // Rotate cross-section X slightly to stay perpendicular to the rising ribbon.
    const rotAngle = side * spreadAngle * (0.25 + 0.75 * smoothFlare)
    const rx = x0 * Math.cos(rotAngle)
    const ry = y0 * (0.985 + 0.015 * cosS) - x0 * Math.sin(rotAngle) * Math.sign(sinS || 1) * side
    pos.setXYZ(i, cx + rx, ry, drapeZ + z0)
  }
  g.computeVertexNormals()
  return g
}

/**
 * A procedurally built ID badge on a lanyard: a gloss-laminated portrait CR80
 * card with a real punched slot, a smooth-beveled swivel J-hook with gate
 * thumb-lever pierced through it, an oval connector ring, a ribbed brushed-metal
 * crimp sleeve, and two layered woven strap halves rising cleanly in a draped
 * hanging V with zero z-fighting. The printable face is live DOM covering the
 * ENTIRE card - front and, optionally, back - with the slot punch carved out
 * of the live area. No 3D asset files are loaded.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 *
 * ```tsx
 * <IDCard>
 *   <IDCard.Front><BadgeFront /></IDCard.Front>
 *   <IDCard.Back><BadgeBack /></IDCard.Back>
 * </IDCard>
 * ```
 */
function IDCardImpl({
  children,
  color = '#f4f5f7',
  lanyardColor = '#b3223a',
  // Printed straight onto the stock: whatever the content leaves clear is `color`.
  surfaceBackground = color,
  resolution = ID_CARD.resolution,
  surfaceStyle,
  ...groupProps
}: IDCardProps) {
  const regions = collectSlots(children, ID_CARD_REGIONS)
  const { body, slot, face, hook, strap } = ID_CARD

  const cardGeometry = React.useMemo(() => {
    const shape = roundedRectShape(
      body.width - body.bevel * 2,
      body.height - body.bevel * 2,
      body.radius - body.bevel
    )
    // the slot punch is a real hole through the card
    const punch = roundedRectShape(slot.width, slot.height, slot.height / 2)
    const punchPath = new THREE.Path()
    punch.getPoints(16).forEach((p, i) => {
      const y = p.y + slot.centerY
      if (i === 0) punchPath.moveTo(p.x, y)
      else punchPath.lineTo(p.x, y)
    })
    shape.holes.push(punchPath)
    const depth = body.thickness - body.bevel * 2
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: body.bevel,
      bevelSize: body.bevel,
      bevelSegments: 2,
      curveSegments: 12,
    })
    geometry.translate(0, 0, -depth / 2)
    return geometry
  }, [body, slot])

  // Smooth-shaded stamped-steel J-hook profile.
  const hookGeometry = React.useMemo(() => {
    const a0 = (hook.mouthEnd * Math.PI) / 180
    const a1 = ((hook.mouthStart + 360) * Math.PI) / 180
    const s = new THREE.Shape()
    s.absarc(0, 0, hook.outerR, a0, a1, false)
    s.absarc(0, 0, hook.innerR, a1, a0, true)
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, {
      depth: hook.depth - 0.008,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.004,
      bevelSegments: 2,
      curveSegments: 32,
    })
    g.translate(0, 0, -(hook.depth - 0.008) / 2)
    return smoothShaded(g)
  }, [hook])

  // Draped woven strap halves: front (+1) and back (-1) layers separated cleanly
  // at the crimp mouth so they never z-fight.
  const strapGeometries = React.useMemo(
    () =>
      ([1, -1] as const).map((side) =>
        lanyardRibbonGeometry(strap.width, strap.thickness, strap.length, strap.spreadAngle, strap.backTilt, side)
      ),
    [strap]
  )

  // Depth occluder matching the clipped face: the card outline with the
  // slot punched out, so blending mode never depth-hides the hook where it
  // should show through the real opening. Also reused for the PVC gloss sheen
  // so reflections never paint across the punched hole.
  const faceOccluderGeometry = React.useMemo(() => {
    const inset = Math.min(face.width, face.height) * SCREEN_MASK_INSET
    const r = Math.max(0, face.radius - inset)
    const shape = roundedRectShapeCorners(face.width - inset * 2, face.height - inset * 2, [r, r, r, r])
    const punchH = slot.height + inset * 2
    const punch = roundedRectShapeCorners(slot.width + inset * 2, punchH, [
      punchH / 2,
      punchH / 2,
      punchH / 2,
      punchH / 2,
    ])
    const punchPath = new THREE.Path()
    punch.getPoints(24).forEach((p, i) => {
      if (i === 0) punchPath.moveTo(p.x, p.y + slot.centerY)
      else punchPath.lineTo(p.x, p.y + slot.centerY)
    })
    shape.holes.push(punchPath)
    return new THREE.ShapeGeometry(shape, 24)
  }, [face, slot])

  const pvcSheen = React.useMemo(
    () => createSurfaceSheenMaterial({ roughness: 0.14, envMapIntensity: 0.92 }),
    []
  )

  React.useEffect(() => {
    return () => {
      cardGeometry.dispose()
      hookGeometry.dispose()
      strapGeometries.forEach((g) => g.dispose())
      faceOccluderGeometry.dispose()
      pvcSheen.dispose()
    }
  }, [cardGeometry, hookGeometry, strapGeometries, faceOccluderGeometry, pvcSheen])

  const metal = <meshPhysicalMaterial color="#c3c7cd" metalness={0.9} roughness={0.26} />
  const crimpGroove = <meshPhysicalMaterial color="#6d727a" metalness={0.82} roughness={0.44} />
  const fabric = (
    // ribbed polyester webbing: ~20 ribs across its 15 mm width
    <meshPhysicalMaterial
      color={lanyardColor}
      metalness={0}
      roughness={0.85}
      sheen={1}
      sheenColor="#ffffff"
      sheenRoughness={0.6}
      normalMap={grainNormal(WEAVE, 2.2, 22)}
    />
  )

  // Hardware chain, referenced from the standard retail swivel J-hook:
  // J-hook -> stem -> swivel barrel + collar -> oval connector ring -> ribbed crimp -> draped strap.
  const ringY = slot.centerY + (hook.outerR + hook.innerR) / 2 - 0.01
  const stemBottom = ringY + hook.innerR - 0.03
  const stemTop = ringY + hook.outerR + hook.stem.height - 0.03
  const barrelY = stemTop + hook.barrel.height / 2 - 0.03
  const linkRingY = barrelY + hook.barrel.height / 2 + 0.025
  const crimpY = linkRingY + hook.crimp.height / 2 + 0.02

  // Full-bleed live faces with the real slot punched out of the DOM too.
  const slotClip = React.useCallback(
    (res: number) => {
      const ppu = res / face.width
      const P = (x: number, y: number) =>
        `${((x + face.width / 2) * ppu).toFixed(2)} ${((face.height / 2 - y) * ppu).toFixed(2)}`
      const R = (u: number) => `${(u * ppu).toFixed(2)}`
      const outline = clipRoundedRectOutline(P, R, 1, {
        minX: -face.width / 2,
        minY: -face.height / 2,
        maxX: face.width / 2,
        maxY: face.height / 2,
        r: face.radius,
      })
      const hole = clipRoundedRect(P, R, 1, {
        minX: -slot.width / 2,
        minY: slot.centerY - slot.height / 2,
        maxX: slot.width / 2,
        maxY: slot.centerY + slot.height / 2,
        r: slot.height / 2,
      })
      return `path("${(outline + hole).trim()}")`
    },
    [face, slot]
  )

  // Spring gate: a thin flat strip closing the mouth, with a small stamped
  // thumb-lever nub on the outward side.
  const gate = React.useMemo(() => {
    const rMid = (hook.outerR + hook.innerR) / 2
    const aNose = (hook.mouthStart * Math.PI) / 180
    const nose = { x: rMid * Math.cos(aNose), y: rMid * Math.sin(aNose) }
    const root = { x: hook.stem.width / 2 + 0.008, y: hook.outerR + 0.02 }
    return {
      length: Math.hypot(nose.x - root.x, nose.y - root.y) + 0.02,
      angle: Math.atan2(nose.y - root.y, nose.x - root.x) + Math.PI / 2,
      mid: { x: (nose.x + root.x) / 2, y: (nose.y + root.y) / 2 },
    }
  }, [hook])

  const surfaceDefaults = {
    surfaceBackground,
    resolution,
    surfaceStyle,
  }
  const front = resolveSurface(regions.front, surfaceDefaults)
  const back = resolveSurface(regions.back, surfaceDefaults)
  const faceProps = {
    width: face.width,
    height: face.height,
    radius: face.radius,
    occluderGeometry: faceOccluderGeometry,
  }

  return (
    <group {...groupProps}>
      {/* PVC card with the punched slot */}
      <mesh geometry={cardGeometry}>
        <meshPhysicalMaterial color={color} metalness={0} roughness={0.48} clearcoat={0.5} clearcoatRoughness={0.3} />
      </mesh>

      {/* smooth-beveled stamped-steel J-hook pierced through the slot */}
      <group position={[0, ringY, 0]} rotation-y={Math.PI / 2}>
        <mesh geometry={hookGeometry}>{metal}</mesh>
        {/* spring gate closing the mouth + thumb-lever trigger tab */}
        <group position={[gate.mid.x, gate.mid.y, 0]} rotation-z={gate.angle}>
          <RoundedBox args={[0.016, gate.length, 0.012]} radius={0.005}>
            {metal}
          </RoundedBox>
          <RoundedBox args={[0.036, 0.018, 0.014]} radius={0.005} position={[0.018, gate.length * 0.12, 0]}>
            {metal}
          </RoundedBox>
        </group>
      </group>
      {/* stem rising edge-on from the ring to the swivel */}
      <RoundedBox
        args={[hook.depth - 0.004, stemTop - stemBottom, hook.stem.width]}
        radius={0.008}
        position={[0, (stemTop + stemBottom) / 2, 0]}
      >
        {metal}
      </RoundedBox>
      {/* swivel barrel with its machined collar */}
      <mesh position={[0, barrelY, 0]}>
        <cylinderGeometry args={[hook.barrel.radius, hook.barrel.radius, hook.barrel.height, 18]} />
        {metal}
      </mesh>
      <mesh position={[0, barrelY + hook.barrel.height / 2 - 0.025, 0]}>
        <cylinderGeometry args={[hook.barrel.collar, hook.barrel.collar, 0.042, 18]} />
        {metal}
      </mesh>
      {/* oval wire link joining the swivel head into the strap crimp */}
      <mesh position={[0, linkRingY, 0]} scale={[1.35, 0.85, 1]}>
        <torusGeometry args={[hook.barrel.collar * 0.82, 0.018, 12, 24]} />
        {metal}
      </mesh>
      {/* ribbed brushed-metal crimp sleeve clamping the folded lanyard ends */}
      <group position={[0, crimpY, 0]}>
        <RoundedBox args={[hook.crimp.width, hook.crimp.height, hook.crimp.depth]} radius={0.018}>
          {metal}
        </RoundedBox>
        {/* pressed horizontal crimp grooves front & back */}
        {[-0.045, 0, 0.045].map((dy) => (
          <mesh key={dy} position={[0, dy, 0]}>
            <boxGeometry args={[hook.crimp.width - 0.02, 0.012, hook.crimp.depth + 0.004]} />
            {crimpGroove}
          </mesh>
        ))}
      </group>

      {/* layered, gently draped woven lanyard strap halves (zero z-fighting) */}
      {strapGeometries.map((geometry, idx) => (
        <mesh key={idx} geometry={geometry} position={[0, crimpY + hook.crimp.height / 2 - 0.018, 0]}>
          {fabric}
        </mesh>
      ))}

      {/* subtle PVC gloss laminate reflection over the printed faces (punched at the slot) */}
      <mesh
        geometry={faceOccluderGeometry}
        material={pvcSheen}
        position={[0, face.offsetY, body.thickness / 2 + 0.0045]}
      />
      {regions.back != null && (
        <mesh
          geometry={faceOccluderGeometry}
          material={pvcSheen}
          position={[0, face.offsetY, -body.thickness / 2 - 0.0045]}
          rotation={[0, Math.PI, 0]}
        />
      )}

      {/* live front face - full bleed over the whole card, slot carved out */}
      <DeviceScreen
        {...faceProps}
        {...front}
        screenStyle={{ ...front.screenStyle, clipPath: slotClip(front.resolution) }}
        position={[0, face.offsetY, body.thickness / 2 + 0.003]}
      >
        {regions.front?.children}
      </DeviceScreen>

      {/* live back face - only mounted when there's a design for it */}
      {regions.back != null && (
        <DeviceScreen
          {...faceProps}
          {...back}
          screenStyle={{ ...back.screenStyle, clipPath: slotClip(back.resolution) }}
          position={[0, face.offsetY, -body.thickness / 2 - 0.003]}
          rotation={[0, Math.PI, 0]}
        >
          {regions.back.children}
        </DeviceScreen>
      )}
    </group>
  )
}
IDCardImpl.displayName = 'IDCard'

/** The badge's compound slots, shared by `<IDCard>` and `<IDCardMockup>`. */
export const idCardSlots = createSlots(ID_CARD_REGIONS)

export const IDCard = Object.assign(IDCardImpl, idCardSlots)
