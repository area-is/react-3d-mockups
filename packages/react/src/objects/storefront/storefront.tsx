import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import {
  STOREFRONT,
  STOREFRONT_REGIONS,
  smoothShaded,
  storefrontLayout,
} from '../../core'
import { DeviceScreen } from '../../screen/device-screen'
import { collectSlots, createSlots, resolveSurface, type SlotProps, type SurfaceProps } from '../../slots'

type GroupProps = ThreeElements['group']

export interface StorefrontProps extends Omit<GroupProps, 'children' | 'color'>, SurfaceProps {
  /**
   * Region content. Bare children fill the front fascia sign; name regions
   * explicitly with the fascia slots (`<Storefront.Fascia>`,
   * `<Storefront.LeftSign>`, `<Storefront.RightSign>`, `<Storefront.RearSign>`)
   * and the pane slots - `<Storefront.FrontLeft>` and `<Storefront.FrontRight>`
   * are the two display bays either side of the front mullion,
   * `<Storefront.Door>` is the glazed door leaf, and `<Storefront.Left>` /
   * `<Storefront.Right>` / `<Storefront.Rear>` are the wide center panes of
   * the other three elevations (left/right named as you face the shop).
   */
  children?: React.ReactNode
  /** Shopfront paint (fascia surrounds, frames, door, stall risers). */
  color?: string
  /**
   * Glazing color - every display pane, the transom lights and the door leaf.
   * The default is the blue-gray of glass reflecting a street. Warm it toward
   * bronze (`'#6b5a44'`) or green (`'#4d6b60'`) for tinted glass, or darken it
   * for a shop that reads as closed. It tints the reflection rather than
   * painting the pane flat: the material keeps its mirror finish either way.
   */
  windowColor?: string
  /**
   * CSS pixel width of the virtual fascia signs. The window panes keep their
   * own fixed default widths; override per slot with each slot's `resolution`.
   */
  resolution?: number
}

/**
 * A procedurally built free-standing corner shop: four glazed shopfront
 * elevations under a stepped classical cornice and coped flat roof, the
 * parapet sitting just above the cornice so the painted composition IS the
 * whole building - no masonry. The front (+Z) is the classic high-street
 * shopfront - painted timber surround, panelled stall riser over a slate
 * plinth, big display window with a mullion and transom lights, glazed door
 * with kickplate and pull handle, corniced fascia on scrolled console
 * brackets. The other three elevations repeat the same composition without
 * the door - windows only - and each carries its own live fascia sign.
 * Every big pane is a mockup surface too: both front display bays, the
 * glazed door leaf and the center pane of each other elevation.
 * The roof is plain hardware. No 3D asset files are loaded.
 *
 * The origin is the building center; the pavement sits
 * `STOREFRONT.standHeight` below it. Must be rendered inside a
 * react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 *
 * ```tsx
 * <Storefront>
 *   <Storefront.Fascia><YourSign /></Storefront.Fascia>
 *   <Storefront.FrontLeft><YourPoster /></Storefront.FrontLeft>
 * </Storefront>
 * ```
 */
function StorefrontImpl({
  children,
  color = '#2e4638',
  windowColor = '#5a6d75',
  surfaceBackground = '#ffffff',
  resolution = STOREFRONT.resolution,
  surfaceStyle,
  ...groupProps
}: StorefrontProps) {
  const regions = collectSlots(children, STOREFRONT_REGIONS)
  const { body, fascia, sign, sideSign, rearSign: rearSignSpec, riser, window: win, roof, standHeight, paneRadius, paneResolution } = STOREFRONT

  // Shop glass reflects the street: a lighter blue-gray with strong env
  // reflections, instead of a pitch-black hole in the façade.
  const glassMaterial = (
    <meshPhysicalMaterial
      color={windowColor}
      metalness={0.48}
      roughness={0.05}
      clearcoat={1}
      clearcoatRoughness={0.07}
      envMapIntensity={1.65}
    />
  )
  // Satin painted shopfront joinery with a subtle lacquer sheen.
  const paint = { color, metalness: 0.04, roughness: 0.46, clearcoat: 0.34, clearcoatRoughness: 0.34 }
  // Dark slate/granite pavement plinth base under every stall riser and pilaster.
  const plinthStone = { color: '#262a2e', metalness: 0.08, roughness: 0.68 }
  // Brushed stainless/brass door furniture & threshold hardware.
  const hardware = { color: '#c8ccd2', metalness: 0.88, roughness: 0.26 }

  // Classic S-scroll architectural console bracket extruded in profile:
  // sits at each fascia end supporting the projecting cornice.
  const corbelGeometry = React.useMemo(() => {
    const s = new THREE.Shape()
    // Profile in (Z_out, Y_up) plane, 0.30 tall, projecting 0.145 forward at the top
    s.moveTo(0, 0.15)
    s.lineTo(0.145, 0.15)
    s.lineTo(0.145, 0.095)
    s.bezierCurveTo(0.145, 0.04, 0.09, 0.03, 0.08, -0.025)
    s.bezierCurveTo(0.07, -0.085, 0.09, -0.125, 0.045, -0.15)
    s.lineTo(0, -0.15)
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.105,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.01,
      bevelSegments: 2,
      curveSegments: 14,
    })
    g.translate(0, 0, -0.0525)
    // Map profile X -> +Z (projecting outward from fascia) and extrusion Z -> X (width).
    g.rotateY(-Math.PI / 2)
    return smoothShaded(g)
  }, [])
  React.useEffect(() => () => corbelGeometry.dispose(), [corbelGeometry])

  const fasciaTop = fascia.y + fascia.height / 2
  const corniceBedY = fasciaTop + 0.028
  const corniceCrownY = fasciaTop + 0.085
  const riserTop = -standHeight + riser.height
  const plinthH = 0.11
  const frontZ = body.depth / 2
  // Unified corner pilasters terminate cleanly beneath the cornice bed moulding,
  // eliminating the overlapping corner turrets that previously poked above the roof.
  const pilasterTop = fasciaTop
  const pilasterH = pilasterTop + standHeight
  const pilasterY = (pilasterTop - standHeight) / 2

  // The façade layout - riser, glazing extent, transom, pane band and the two
  // front bays - is declared in the spec so it can be measured (see
  // storefrontLayout in core).
  const { windowH, glazeX, glazeW, transomY, paneH, paneCY, bayL, bayR, elevationPaneWidth, door } =
    storefrontLayout()

  const surfaceDefaults = {
    surfaceBackground,
    resolution,
    surfaceStyle,
  }

  // Reusable panelled stall-riser section: base timber + dark slate kick plinth
  // + projecting window sill ledge + crisp framed wainscoting panels.
  const riserSection = (centerX: number, width: number, z: number, panelCount: number) => {
    const pad = 0.1
    const gap = 0.07
    const panelW = Math.max(0.18, (width - pad * 2 - gap * (panelCount - 1)) / panelCount)
    const panelH = riser.height - plinthH - 0.15
    const panelY = -standHeight + plinthH + (riser.height - plinthH) / 2 - 0.01
    return (
      <group>
        {/* main riser backing */}
        <RoundedBox args={[width, riser.height, 0.11]} radius={0.012} position={[centerX, -standHeight + riser.height / 2, z + 0.016]}>
          <meshPhysicalMaterial {...paint} />
        </RoundedBox>
        {/* dark slate/granite pavement plinth kickstrip */}
        <RoundedBox args={[width + 0.01, plinthH, 0.125]} radius={0.01} position={[centerX, -standHeight + plinthH / 2, z + 0.02]}>
          <meshPhysicalMaterial {...plinthStone} />
        </RoundedBox>
        {/* projecting moulded sill ledge directly under the display glazing */}
        <RoundedBox args={[width + 0.02, 0.052, 0.145]} radius={0.012} position={[centerX, riserTop - 0.01, z + 0.032]}>
          <meshPhysicalMaterial {...paint} />
        </RoundedBox>
        {/* framed wainscoting panels along the riser */}
        {panelCount > 0 &&
          Array.from({ length: panelCount }, (_, i) => {
            const px = centerX - width / 2 + pad + panelW / 2 + i * (panelW + gap)
            return (
              <group key={i} position={[px, panelY, z + 0.072]}>
                {/* recessed shadow surround */}
                <mesh>
                  <boxGeometry args={[panelW, panelH, 0.008]} />
                  <meshPhysicalMaterial color={color} metalness={0.05} roughness={0.78} />
                </mesh>
                {/* raised beveled field panel */}
                <RoundedBox args={[panelW - 0.055, panelH - 0.055, 0.02]} radius={0.007} position-z={0.004}>
                  <meshPhysicalMaterial {...paint} />
                </RoundedBox>
              </group>
            )
          })}
      </group>
    )
  }

  // One windows-only elevation, built facing local +Z at `faceDist` - the
  // same composition as the front minus the door - with its fascia sign
  // and a live center pane between the two mullions.
  const windowedElevation = (
    faceDist: number,
    faceLen: number,
    signWidth: number,
    signSlot: SlotProps | undefined,
    windowSlot: SlotProps | undefined
  ) => {
    const glazeL = faceLen - 0.6
    const panelCount = faceLen > 4.6 ? 4 : 3
    return (
      <>
        {/* fascia signboard */}
        <RoundedBox args={[faceLen - 0.04, fascia.height, 0.12]} radius={0.015} position={[0, fascia.y, faceDist + 0.02]}>
          <meshPhysicalMaterial {...paint} />
        </RoundedBox>
        {/* panelled stall riser with slate plinth and window sill */}
        {riserSection(0, faceLen - 0.24, faceDist, panelCount)}
        {/* pilaster-to-pilaster glazing - windows only, no door */}
        <mesh position={[0, riserTop + windowH / 2, faceDist + 0.004]}>
          <planeGeometry args={[glazeL, windowH]} />
          {glassMaterial}
        </mesh>
        {/* moulded vertical mullions with subtle outer beading */}
        {([1, -1] as const).map((s) => (
          <group key={s} position={[s * (glazeL / 3), riserTop + windowH / 2, faceDist + 0.026]}>
            <RoundedBox args={[0.1, windowH, 0.11]} radius={0.012}>
              <meshPhysicalMaterial {...paint} />
            </RoundedBox>
            <RoundedBox args={[0.046, windowH - 0.04, 0.025]} radius={0.008} position-z={0.052}>
              <meshPhysicalMaterial {...paint} />
            </RoundedBox>
          </group>
        ))}
        {/* window head architrave */}
        <RoundedBox args={[faceLen - 0.08, 0.105, 0.125]} radius={0.014} position={[0, win.top + 0.02, faceDist + 0.028]}>
          <meshPhysicalMaterial {...paint} />
        </RoundedBox>
        {/* transom rail + upper transom light dividers */}
        <RoundedBox args={[glazeL + 0.12, 0.06, 0.105]} radius={0.012} position={[0, transomY, faceDist + 0.025]}>
          <meshPhysicalMaterial {...paint} />
        </RoundedBox>
        {([-1, 1] as const).map((s) => (
          <RoundedBox key={s} args={[0.045, win.top - transomY, 0.085]} radius={0.01} position={[s * (glazeL / 6), (win.top + transomY) / 2, faceDist + 0.02]}>
            <meshPhysicalMaterial {...paint} />
          </RoundedBox>
        ))}
        {/* sculpted S-scroll console corbel brackets at each fascia end */}
        {([1, -1] as const).map((s) => (
          <mesh
            key={s}
            geometry={corbelGeometry}
            position={[s * (faceLen / 2 - 0.14), fascia.y + fascia.height / 2 - 0.15, faceDist + 0.045]}
          >
            <meshPhysicalMaterial {...paint} />
          </mesh>
        ))}
        {signSlot != null && (
          <DeviceScreen
            {...resolveSurface(signSlot, surfaceDefaults)}
            width={signWidth}
            height={sign.height}
            radius={sign.radius}
            position={[0, fascia.y, faceDist + 0.085]}
          >
            {signSlot.children}
          </DeviceScreen>
        )}
        {/* live center pane between the two mullions */}
        {windowSlot != null && (
          <DeviceScreen
            {...resolveSurface(windowSlot, { ...surfaceDefaults, resolution: paneResolution.side })}
            width={elevationPaneWidth(faceLen)}
            height={paneH}
            radius={paneRadius}
            position={[0, paneCY, faceDist + 0.012]}
          >
            {windowSlot.children}
          </DeviceScreen>
        )}
      </>
    )
  }

  const frontLeftRiserW = win.doorX + body.width / 2 - 0.12
  const frontLeftRiserX = -body.width / 2 + 0.12 + frontLeftRiserW / 2

  return (
    <group {...groupProps}>
      {/* the building volume, painted like the joinery so slivers between
          the applied elements read as the same shopfront timber */}
      <mesh>
        <boxGeometry args={[body.width, body.height, body.depth]} />
        <meshPhysicalMaterial {...paint} roughness={0.72} />
      </mesh>

      {/* continuous stepped classical cornice wrapping cleanly around all 4 sides */}
      <RoundedBox
        args={[body.width + 0.18, 0.056, body.depth + 0.18]}
        radius={0.012}
        position={[0, corniceBedY, 0]}
      >
        <meshPhysicalMaterial {...paint} />
      </RoundedBox>
      <RoundedBox
        args={[body.width + 0.3, 0.075, body.depth + 0.3]}
        radius={0.018}
        position={[0, corniceCrownY, 0]}
      >
        <meshPhysicalMaterial {...paint} />
      </RoundedBox>

      {/* capped flat roof with dark lead/zinc perimeter parapet coping */}
      <RoundedBox
        args={[body.width + roof.overhang * 2 + 0.04, roof.thickness, body.depth + roof.overhang * 2 + 0.04]}
        radius={0.018}
        position={[0, body.height / 2 + roof.thickness / 2, 0]}
      >
        <meshPhysicalMaterial color="#34383e" metalness={0.22} roughness={0.68} />
      </RoundedBox>
      {/* raised roof parapet coping strips framing the roof deck */}
      {([1, -1] as const).map((sz) => (
        <RoundedBox
          key={`copz${sz}`}
          args={[body.width + 0.08, 0.045, 0.14]}
          radius={0.012}
          position={[0, body.height / 2 + roof.thickness + 0.015, sz * (body.depth / 2 - 0.03)]}
        >
          <meshPhysicalMaterial color="#2b2f35" metalness={0.28} roughness={0.58} />
        </RoundedBox>
      ))}
      {([1, -1] as const).map((sx) => (
        <RoundedBox
          key={`copx${sx}`}
          args={[0.14, 0.045, body.depth - 0.08]}
          radius={0.012}
          position={[sx * (body.width / 2 - 0.03), body.height / 2 + roof.thickness + 0.015, 0]}
        >
          <meshPhysicalMaterial color="#2b2f35" metalness={0.28} roughness={0.58} />
        </RoundedBox>
      ))}

      {/* four unified corner pilasters with moulded slate bases and capital bands -
          terminating cleanly beneath the cornice with zero corner overlap */}
      {([1, -1] as const).map((sx) =>
        ([1, -1] as const).map((sz) => (
          <group key={`${sx}${sz}`} position={[sx * (body.width / 2 - 0.03), 0, sz * (body.depth / 2 - 0.03)]}>
            <RoundedBox args={[0.22, pilasterH, 0.22]} radius={0.016} position-y={pilasterY}>
              <meshPhysicalMaterial {...paint} />
            </RoundedBox>
            {/* slate base plinth */}
            <RoundedBox args={[0.25, plinthH + 0.04, 0.25]} radius={0.012} position-y={-standHeight + (plinthH + 0.04) / 2}>
              <meshPhysicalMaterial {...plinthStone} />
            </RoundedBox>
            {/* moulded capital necking ring under the cornice */}
            <RoundedBox args={[0.26, 0.065, 0.26]} radius={0.012} position-y={pilasterTop - 0.035}>
              <meshPhysicalMaterial {...paint} />
            </RoundedBox>
          </group>
        ))
      )}

      {/* ---------- front elevation (+Z): the full shopfront ---------- */}
      <RoundedBox args={[body.width - 0.04, fascia.height, 0.12]} radius={0.015} position={[0, fascia.y, frontZ + 0.02]}>
        <meshPhysicalMaterial {...paint} />
      </RoundedBox>

      {/* panelled stall riser under the windows - stops cleanly at the door bay */}
      {riserSection(frontLeftRiserX, frontLeftRiserW, frontZ, 3)}

      {/* brushed-metal threshold plate under the door leaf */}
      <RoundedBox
        args={[win.doorWidth, 0.036, 0.05]}
        radius={0.008}
        position={[win.doorX + win.doorWidth / 2, -standHeight + 0.018, frontZ + 0.038]}
      >
        <meshPhysicalMaterial {...hardware} roughness={0.38} />
      </RoundedBox>

      {/* display glazing: window bays left of the door */}
      <mesh position={[glazeX, riserTop + windowH / 2, frontZ + 0.004]}>
        <planeGeometry args={[glazeW, windowH]} />
        {glassMaterial}
      </mesh>
      {/* painted pilaster panel between the window bay and the door bay */}
      <RoundedBox
        args={[win.doorX - (glazeX + glazeW / 2) + 0.08, windowH + riser.height, 0.105]}
        radius={0.012}
        position={[
          (glazeX + glazeW / 2 + win.doorX) / 2,
          riserTop + (windowH - riser.height) / 2,
          frontZ + 0.018,
        ]}
      >
        <meshPhysicalMaterial {...paint} />
      </RoundedBox>
      {/* mullion with moulded outer bead + window head architrave */}
      <group position={[win.mullionX, riserTop + windowH / 2, frontZ + 0.026]}>
        <RoundedBox args={[0.1, windowH, 0.11]} radius={0.012}>
          <meshPhysicalMaterial {...paint} />
        </RoundedBox>
        <RoundedBox args={[0.046, windowH - 0.04, 0.025]} radius={0.008} position-z={0.052}>
          <meshPhysicalMaterial {...paint} />
        </RoundedBox>
      </group>
      <RoundedBox args={[body.width - 0.08, 0.105, 0.125]} radius={0.014} position={[0, win.top + 0.02, frontZ + 0.028]}>
        <meshPhysicalMaterial {...paint} />
      </RoundedBox>
      {/* transom rail + dividers: the band above reads as transom lights */}
      <RoundedBox args={[glazeW + 0.12, 0.06, 0.105]} radius={0.012} position={[glazeX, transomY, frontZ + 0.025]}>
        <meshPhysicalMaterial {...paint} />
      </RoundedBox>
      {[-1.61, -0.07, 0.52].map((x) => (
        <RoundedBox key={x} args={[0.045, win.top - transomY, 0.085]} radius={0.01} position={[x, (win.top + transomY) / 2, frontZ + 0.02]}>
          <meshPhysicalMaterial {...paint} />
        </RoundedBox>
      ))}

      {/* glazed door with moulded leaf, brushed kickplate, rose-mounted pull
          handle, and cylinder lock escutcheon */}
      <RoundedBox
        args={[win.doorWidth, windowH + riser.height, 0.085]}
        radius={0.015}
        position={[win.doorX + win.doorWidth / 2, riserTop + (windowH - riser.height) / 2, frontZ + 0.015]}
      >
        <meshPhysicalMaterial {...paint} />
      </RoundedBox>
      {/* brushed stainless kickplate at bottom of the door leaf */}
      <RoundedBox
        args={[win.doorWidth - 0.06, 0.15, 0.012]}
        radius={0.004}
        position={[win.doorX + win.doorWidth / 2, -standHeight + 0.115, frontZ + 0.058]}
      >
        <meshPhysicalMaterial {...hardware} roughness={0.32} />
      </RoundedBox>
      <mesh position={[win.doorX + win.doorWidth / 2, riserTop + windowH / 2 - 0.15, frontZ + 0.056]}>
        <planeGeometry args={[win.doorWidth - 0.22, windowH + riser.height - 0.34]} />
        {glassMaterial}
      </mesh>
      {/* vertical pull (~300 mm) on the lock stile with circular mounting roses */}
      <group position={[win.doorX + 0.155, -standHeight + 0.909, frontZ + 0.058]}>
        <mesh position-z={0.032}>
          <cylinderGeometry args={[0.015, 0.015, 0.28, 14]} />
          <meshPhysicalMaterial {...hardware} />
        </mesh>
        {([1, -1] as const).map((s) => (
          <group key={s} position={[0, s * 0.112, 0]}>
            {/* standoff post */}
            <mesh rotation-x={Math.PI / 2} position-z={0.018}>
              <cylinderGeometry args={[0.009, 0.009, 0.032, 10]} />
              <meshPhysicalMaterial {...hardware} />
            </mesh>
            {/* rose escutcheon plate against the door stile */}
            <mesh rotation-x={Math.PI / 2} position-z={0.004}>
              <cylinderGeometry args={[0.026, 0.028, 0.008, 16]} />
              <meshPhysicalMaterial {...hardware} />
            </mesh>
          </group>
        ))}
        {/* cylinder lock escutcheon below the handle */}
        <mesh rotation-x={Math.PI / 2} position={[0, -0.2, 0.005]}>
          <cylinderGeometry args={[0.022, 0.022, 0.008, 16]} />
          <meshPhysicalMaterial {...hardware} />
        </mesh>
      </group>

      {/* sculpted S-scroll console brackets carrying the cornice at the fascia ends */}
      {([1, -1] as const).map((s) => (
        <mesh
          key={s}
          geometry={corbelGeometry}
          position={[s * (body.width / 2 - 0.14), fascia.y + fascia.height / 2 - 0.15, frontZ + 0.045]}
        >
          <meshPhysicalMaterial {...paint} />
        </mesh>
      ))}

      {/* front fascia sign */}
      <DeviceScreen
        {...resolveSurface(regions.fascia, surfaceDefaults)}
        width={sign.width}
        height={sign.height}
        radius={sign.radius}
        position={[0, fascia.y, frontZ + 0.085]}
      >
        {regions.fascia?.children}
      </DeviceScreen>

      {/* the two front display bays, live either side of the mullion */}
      {regions.frontLeft != null && (
        <DeviceScreen
          {...resolveSurface(regions.frontLeft, { ...surfaceDefaults, resolution: paneResolution.frontLeft })}
          width={bayL.x1 - bayL.x0}
          height={paneH}
          radius={paneRadius}
          position={[(bayL.x0 + bayL.x1) / 2, paneCY, frontZ + 0.012]}
        >
          {regions.frontLeft.children}
        </DeviceScreen>
      )}
      {regions.frontRight != null && (
        <DeviceScreen
          {...resolveSurface(regions.frontRight, { ...surfaceDefaults, resolution: paneResolution.frontRight })}
          width={bayR.x1 - bayR.x0}
          height={paneH}
          radius={paneRadius}
          position={[(bayR.x0 + bayR.x1) / 2, paneCY, frontZ + 0.012]}
        >
          {regions.frontRight.children}
        </DeviceScreen>
      )}
      {/* the glazed door leaf, live above its kick rail */}
      {regions.door != null && (
        <DeviceScreen
          {...resolveSurface(regions.door, { ...surfaceDefaults, resolution: paneResolution.door })}
          width={door.width}
          height={door.height}
          radius={paneRadius}
          position={[win.doorX + win.doorWidth / 2, riserTop + windowH / 2 - 0.15, frontZ + 0.062]}
        >
          {regions.door.children}
        </DeviceScreen>
      )}

      {/* ---------- windows-only elevations: right (+X), left (−X), rear (−Z),
          left/right named as you face the shop from the street ---------- */}
      <group rotation-y={Math.PI / 2}>
        {windowedElevation(body.width / 2, body.depth, sideSign.width, regions.rightSign, regions.right)}
      </group>
      <group rotation-y={-Math.PI / 2}>
        {windowedElevation(body.width / 2, body.depth, sideSign.width, regions.leftSign, regions.left)}
      </group>
      <group rotation-y={Math.PI}>
        {windowedElevation(body.depth / 2, body.width, rearSignSpec.width, regions.rearSign, regions.rear)}
      </group>
    </group>
  )
}
StorefrontImpl.displayName = 'Storefront'

/** The shop's compound slots, shared by `<Storefront>` and `<StorefrontMockup>`. */
export const storefrontSlots = createSlots(STOREFRONT_REGIONS)

export const Storefront = Object.assign(StorefrontImpl, storefrontSlots)
