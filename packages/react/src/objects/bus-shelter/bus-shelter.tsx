import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import {
  BUS_SHELTER,
  BUS_SHELTER_REGIONS,
  WOOD,
  createSurfaceSheenMaterial,
  grainMap,
  grainNormal,
  roundedRectShape,
  smoothShaded,
} from '../../core'
import { DeviceScreen } from '../../screen/device-screen'
import { LEDText, isLedText } from '../../led-text'
import { collectSlots, createSlots, resolveSurface, type SurfaceProps } from '../../slots'

type GroupProps = ThreeElements['group']

export interface BusShelterProps extends Omit<GroupProps, 'children' | 'color'>, SurfaceProps {
  /**
   * Region content. Bare children fill the outward 6-sheet lightbox face;
   * name regions explicitly with `<BusShelter.Poster>`, `<BusShelter.Inner>`
   * (the waiting-area lightbox face), `<BusShelter.Arrivals>` and
   * `<BusShelter.ArrivalsBack>`. The arrivals slots take an array of strings
   * for the built-in dot-matrix LED board (one row per arrival, rows scroll
   * when they overflow), a single string for a one-line message - or any
   * React node for full custom control; the waiting-area face mirrors
   * `<BusShelter.Arrivals>` unless `<BusShelter.ArrivalsBack>` is given.
   */
  children?: React.ReactNode
  /** Street-furniture steel color (roof, posts, frames, bench). */
  color?: string
}

/**
 * A procedurally built glass transit shelter with a backlit 6-sheet
 * advertising lightbox as its end panel: cantilevered roof canopy with
 * recessed soffit and structural rafters, multi-pane tempered glass back wall
 * on stainless spider-clamps, slatted hardwood bench on contoured steel legs,
 * side-mounted bus-stop flag, and the 1185 x 1750 mm poster live on both faces
 * of the lightbox. No 3D asset files are loaded.
 *
 * The origin is the envelope center; the pavement sits
 * `BUS_SHELTER.standHeight` below it. The lightbox faces ±X (along the
 * sidewalk) - pose the shelter in three-quarter view to feature it. Must be
 * rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 *
 * ```tsx
 * <BusShelter>
 *   <BusShelter.Poster><YourPoster /></BusShelter.Poster>
 *   <BusShelter.Arrivals>{['12  City Centre  3 min', '7  Station  9 min']}</BusShelter.Arrivals>
 * </BusShelter>
 * ```
 */
function BusShelterImpl({
  children,
  color = '#2f333a',
  surfaceBackground = '#ffffff',
  resolution = BUS_SHELTER.resolution,
  surfaceStyle,
  ...groupProps
}: BusShelterProps) {
  const regions = collectSlots(children, BUS_SHELTER_REGIONS)
  const { body, roof, backGlass, post, bench, lightbox, poster, flag, display, standHeight } = BUS_SHELTER

  // Plain strings become the built-in LED arrivals board - an array is one
  // row per arrival; custom nodes pass straight through.
  const toBoard = (content: React.ReactNode) =>
    isLedText(content) ? (
      <LEDText
        text={content}
        mode={typeof content === 'string' ? 'auto' : 'rows'}
        align="left"
        background="#0b0c0e"
        dotSize={3}
      />
    ) : (
      content
    )
  const board = toBoard(regions.arrivals?.children)
  // The waiting-area face mirrors the street face unless overridden.
  const backBoard = regions.arrivalsBack === undefined ? board : toBoard(regions.arrivalsBack.children)

  // Powder-coated architectural steel: moderate metalness with a satin clearcoat
  // so dark street-furniture greys catch clean bevel highlights instead of crushing black.
  const steel = { color, metalness: 0.36, roughness: 0.38, clearcoat: 0.22, clearcoatRoughness: 0.36 }
  const stainless = { color: '#c4cad2', metalness: 0.84, roughness: 0.26 }
  const soffitMetal = { color: '#b4bac2', metalness: 0.28, roughness: 0.44 }
  const glassMaterial = (
    <meshPhysicalMaterial
      color="#bfd0dc"
      metalness={0.08}
      roughness={0.05}
      transmission={0.78}
      transparent
      opacity={0.34}
      clearcoat={1}
      clearcoatRoughness={0.06}
    />
  )

  const roofY = body.height / 2 - roof.thickness / 2
  const roofBottomY = roofY - roof.thickness / 2
  const floorY = -standHeight
  const backLineZ = -body.depth / 2 + 0.1
  const glassZ = backLineZ - 0.055

  // Sculpted C-contoured bench leg frame, extruded across a slim plate width.
  const benchLegGeometry = React.useMemo(() => {
    const h = bench.height - 0.04
    const d = bench.depth - 0.06
    const t = 0.048
    const s = new THREE.Shape()
    // Closed C-bracket with broad foot bar and cantilevered seat cradle
    s.moveTo(-d / 2 + 0.03, 0)
    s.lineTo(d / 2 - 0.03, 0)
    s.lineTo(d / 2 - 0.03, t)
    s.lineTo(-d / 2 + 0.03 + t * 1.4, t)
    s.lineTo(-d / 2 + 0.08 + t, h - t)
    s.lineTo(d / 2, h - t)
    s.lineTo(d / 2, h)
    s.lineTo(-d / 2 + 0.02, h)
    s.lineTo(-d / 2 + 0.02, h - t * 1.2)
    s.lineTo(-d / 2 + 0.03, 0)
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.055,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 2,
    })
    g.translate(0, 0, -0.0275)
    // Extrusion along +Z becomes width along X; profile X runs along Z (bench depth).
    g.rotateY(-Math.PI / 2)
    return smoothShaded(g)
  }, [bench.height, bench.depth])

  // Lightbox glazing sheen: physically-lit Fresnel reflection over both live posters.
  const posterGlassGeometry = React.useMemo(
    () => new THREE.ShapeGeometry(roundedRectShape(poster.width, poster.height, poster.radius), 8),
    [poster]
  )
  const posterSheen = React.useMemo(
    () => createSurfaceSheenMaterial({ roughness: 0.06, envMapIntensity: 0.95 }),
    []
  )

  React.useEffect(() => {
    return () => {
      benchLegGeometry.dispose()
      posterGlassGeometry.dispose()
      posterSheen.dispose()
    }
  }, [benchLegGeometry, posterGlassGeometry, posterSheen])

  // Three tempered glass bays spanning cleanly along the rear wall to the lightbox.
  const glassLeft = -body.width / 2 + 0.34
  const glassRight = lightbox.x - lightbox.depth / 2 - 0.06
  const glassSpan = glassRight - glassLeft
  const paneGap = 0.024
  const paneWidth = (glassSpan - paneGap * 2) / 3
  const paneCenters = [0, 1, 2].map((i) => glassLeft + paneWidth / 2 + i * (paneWidth + paneGap))
  const paneBottomY = floorY + 0.165
  const paneCenterY = paneBottomY + backGlass.height / 2
  const paneTopY = paneBottomY + backGlass.height

  // Three rear structural columns supporting the cantilevered roof rafters.
  const columnXs = [glassLeft + 0.06, glassLeft + paneWidth + paneGap / 2, glassLeft + (paneWidth + paneGap) * 2 - paneGap / 2]

  // Four slatted hardwood bench planks running horizontally.
  const seatSlatCount = 4
  const slatDepth = 0.105
  const slatThickness = 0.042
  const slatStep = (bench.depth - slatDepth) / (seatSlatCount - 1)
  const seatY = floorY + bench.height

  // Lightbox door-frame perimeter bezel around each poster opening.
  const frameBarH = (lightbox.height - poster.height) / 2
  const frameBarW = (lightbox.width - poster.width) / 2

  // Bus-stop flag: post stands at the rear edge of the sign blade, with twin clamps
  // holding the double-sided blade clear of the post (never bisecting it).
  const flagPostZ = -flag.width / 2 - flag.postRadius - 0.032
  const flagCenterY = roofY + 0.52

  const surfaceDefaults = {
    surfaceBackground,
    resolution,
    surfaceStyle,
  }
  // The arrivals board is a dark LED surface at the display's own resolution.
  const boardDefaults = {
    surfaceBackground: '#0b0c0e',
    resolution: display.resolution,
    surfaceStyle,
  }
  const posterProps = {
    width: poster.width,
    height: poster.height,
    radius: poster.radius,
  }

  return (
    <group {...groupProps}>
      {/* architectural cantilevered roof canopy: fascia shell, recessed soffit,
          transverse steel rafters, and a linear ceiling luminaire */}
      <group>
        <RoundedBox args={[roof.width, roof.thickness, roof.depth]} radius={0.028} position={[0, roofY, 0]}>
          <meshPhysicalMaterial {...steel} />
        </RoundedBox>
        {/* top perimeter rain-drip fascia cap */}
        <RoundedBox
          args={[roof.width + 0.03, 0.032, roof.depth + 0.03]}
          radius={0.012}
          position={[0, roofY + roof.thickness / 2 - 0.01, 0]}
        >
          <meshPhysicalMaterial {...steel} roughness={0.34} />
        </RoundedBox>
        {/* recessed satin-aluminum soffit panel underneath the canopy */}
        <mesh position={[0, roofBottomY - 0.002, 0]}>
          <boxGeometry args={[roof.width - 0.22, 0.012, roof.depth - 0.22]} />
          <meshPhysicalMaterial {...soffitMetal} />
        </mesh>
        {/* cantilevered roof rafters projecting forward from each rear column */}
        {[...columnXs, lightbox.x].map((rx) => (
          <RoundedBox
            key={rx}
            args={[0.075, 0.065, roof.depth - 0.14]}
            radius={0.014}
            position={[rx, roofBottomY - 0.022, 0]}
          >
            <meshPhysicalMaterial {...steel} />
          </RoundedBox>
        ))}
        {/* recessed linear ceiling LED luminaire bar */}
        <mesh position={[-0.35, roofBottomY - 0.012, -0.05]}>
          <boxGeometry args={[3.4, 0.014, 0.11]} />
          <meshPhysicalMaterial color="#f8f9fb" emissive="#fff7e6" emissiveIntensity={0.7} roughness={0.25} />
        </mesh>
      </group>

      {/* multi-pane tempered glass back wall with bottom/top clamp rails and
          stainless spider-clamp brackets tying each bay to the columns */}
      <group>
        {paneCenters.map((px, idx) => (
          <group key={idx} position={[px, paneCenterY, glassZ]}>
            <mesh>
              <boxGeometry args={[paneWidth, backGlass.height, backGlass.thickness]} />
              {glassMaterial}
            </mesh>
            {/* subtle etched glass safety manifestation bands at ~900 and ~1500 mm */}
            {[1.286, 2.143].map((h) => (
              <mesh
                key={h}
                position={[0, floorY + h - paneCenterY, backGlass.thickness / 2 + 0.002]}
              >
                <planeGeometry args={[paneWidth - 0.04, 0.072]} />
                <meshPhysicalMaterial
                  color="#eef3f7"
                  transparent
                  opacity={0.34}
                  roughness={0.55}
                  side={THREE.DoubleSide}
                />
              </mesh>
            ))}
          </group>
        ))}

        {/* slim horizontal bottom and top glass clamping rails tying into the lightbox */}
        <RoundedBox
          args={[glassSpan + 0.14, 0.075, 0.072]}
          radius={0.015}
          position={[(glassLeft + glassRight) / 2 + 0.04, paneBottomY - 0.012, glassZ]}
        >
          <meshPhysicalMaterial {...steel} />
        </RoundedBox>
        <RoundedBox
          args={[glassSpan + 0.14, 0.055, 0.068]}
          radius={0.014}
          position={[(glassLeft + glassRight) / 2 + 0.04, paneTopY + 0.01, glassZ]}
        >
          <meshPhysicalMaterial {...steel} />
        </RoundedBox>
        {/* vertical end trim mullion anchoring the rightmost glass bay beside the lightbox */}
        <RoundedBox
          args={[0.052, backGlass.height + 0.06, 0.068]}
          radius={0.012}
          position={[glassRight + 0.024, paneCenterY, glassZ]}
        >
          <meshPhysicalMaterial {...steel} />
        </RoundedBox>
      </group>

      {/* rear structural columns with flanged floor base plates, bolt heads,
          and stainless spider-clamp standoff brackets into the back glass */}
      {columnXs.map((cx) => (
        <group key={cx} position={[cx, 0, backLineZ]}>
          <mesh position={[0, (floorY + roofBottomY) / 2, 0]}>
            <cylinderGeometry args={[post.radius, post.radius, roofBottomY - floorY, 18]} />
            <meshPhysicalMaterial {...steel} />
          </mesh>
          {/* floor anchor flange collar + 4 bolt heads */}
          <mesh position={[0, floorY + 0.018, 0]}>
            <cylinderGeometry args={[post.radius * 1.95, post.radius * 2.05, 0.036, 20]} />
            <meshPhysicalMaterial {...steel} roughness={0.48} />
          </mesh>
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((a) => (
            <mesh
              key={a}
              position={[Math.cos(a) * post.radius * 1.45, floorY + 0.042, Math.sin(a) * post.radius * 1.45]}
            >
              <cylinderGeometry args={[0.013, 0.013, 0.016, 6]} />
              <meshPhysicalMaterial {...stainless} />
            </mesh>
          ))}
          {/* stainless spider-clamp standoffs tying column to glass wall */}
          {[paneBottomY + 0.35, paneTopY - 0.35].map((sy) => (
            <group key={sy} position={[0, sy, 0]}>
              <mesh rotation-x={Math.PI / 2} position={[0, 0, (glassZ - backLineZ) / 2]}>
                <cylinderGeometry args={[0.022, 0.022, Math.abs(glassZ - backLineZ) + 0.02, 12]} />
                <meshPhysicalMaterial {...stainless} />
              </mesh>
              <mesh rotation-x={Math.PI / 2} position={[0, 0, glassZ - backLineZ - backGlass.thickness / 2 - 0.008]}>
                <cylinderGeometry args={[0.042, 0.042, 0.018, 16]} />
                <meshPhysicalMaterial {...stainless} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* slatted hardwood bench on contoured steel leg frames along the back wall */}
      <group position={[bench.x, 0, -body.depth / 2 + bench.depth / 2 + 0.2]}>
        {/* 4 chamfered timber slats with clean air gaps */}
        {Array.from({ length: seatSlatCount }, (_, i) => {
          const z = -bench.depth / 2 + slatDepth / 2 + i * slatStep
          return (
            <RoundedBox
              key={i}
              args={[bench.width, slatThickness, slatDepth]}
              radius={0.012}
              position={[0, seatY, z]}
            >
              <meshPhysicalMaterial
                color="#8a6c4b"
                metalness={0}
                roughness={0.68}
                map={grainMap(WOOD, 0.32, 1.8, true)}
                normalMap={grainNormal(WOOD, 0.32, 1.8, true)}
                normalScale={0.55}
              />
            </RoundedBox>
          )
        })}
        {/* longitudinal steel under-bar unifying the slats */}
        <mesh position={[0, seatY - slatThickness / 2 - 0.02, 0]}>
          <boxGeometry args={[bench.width - 0.32, 0.036, 0.06]} />
          <meshPhysicalMaterial {...steel} />
        </mesh>
        {/* sculpted steel leg frames + flanged feet */}
        {([1, -1] as const).map((s) => (
          <group key={s} position={[s * (bench.width / 2 - 0.36), floorY, 0]}>
            <mesh geometry={benchLegGeometry}>
              <meshPhysicalMaterial {...steel} />
            </mesh>
            <RoundedBox args={[0.13, 0.024, bench.depth - 0.04]} radius={0.008} position={[0, 0.012, 0]}>
              <meshPhysicalMaterial {...steel} roughness={0.48} />
            </RoundedBox>
          </group>
        ))}
      </group>

      {/* bus-stop flag: side-mounted transit blade cantilevered off a vertical post
          with twin stainless clamp collars so the pole never bisects the sign */}
      <group position={[flag.x, 0, 0]}>
        {/* vertical post rising cleanly from a flanged roof mount */}
        <mesh position={[0, roofY + 0.42, flagPostZ]}>
          <cylinderGeometry args={[flag.postRadius, flag.postRadius, 0.84, 16]} />
          <meshPhysicalMaterial {...steel} />
        </mesh>
        <mesh position={[0, roofY + roof.thickness / 2 + 0.018, flagPostZ]}>
          <cylinderGeometry args={[flag.postRadius * 2.1, flag.postRadius * 2.2, 0.036, 16]} />
          <meshPhysicalMaterial {...steel} />
        </mesh>
        {/* post top cap */}
        <mesh position={[0, roofY + 0.845, flagPostZ]}>
          <cylinderGeometry args={[flag.postRadius * 1.15, flag.postRadius * 1.15, 0.02, 16]} />
          <meshPhysicalMaterial {...stainless} />
        </mesh>
        {/* twin stainless clamp brackets joining the post to the sign blade */}
        {([1, -1] as const).map((v) => (
          <group key={v} position={[0, flagCenterY + v * (flag.height * 0.3), flagPostZ]}>
            <mesh>
              <cylinderGeometry args={[flag.postRadius + 0.012, flag.postRadius + 0.012, 0.042, 16]} />
              <meshPhysicalMaterial {...stainless} />
            </mesh>
            <mesh position={[0, 0, flag.postRadius + 0.026]}>
              <boxGeometry args={[0.034, 0.034, 0.055]} />
              <meshPhysicalMaterial {...stainless} />
            </mesh>
          </group>
        ))}
        {/* double-sided aluminum-framed transit sign blade with subtle roundel badge */}
        <group position={[0, flagCenterY, 0]}>
          <RoundedBox args={[0.048, flag.height, flag.width]} radius={0.018}>
            <meshPhysicalMaterial {...steel} />
          </RoundedBox>
          {([1, -1] as const).map((s) => (
            <group key={s} position-x={s * 0.025} rotation-y={s === 1 ? Math.PI / 2 : -Math.PI / 2}>
              {/* crisp white enamel sign face */}
              <mesh>
                <planeGeometry args={[flag.width - 0.055, flag.height - 0.055]} />
                <meshPhysicalMaterial color="#eef1f5" metalness={0.05} roughness={0.32} clearcoat={0.5} />
              </mesh>
              {/* transit header accent stripe */}
              <mesh position={[0, flag.height * 0.27, 0.001]}>
                <planeGeometry args={[flag.width - 0.085, 0.068]} />
                <meshPhysicalMaterial color="#1f4e8c" metalness={0.05} roughness={0.4} />
              </mesh>
              {/* classic transit roundel emblem */}
              <mesh position={[0, -0.055, 0.001]}>
                <ringGeometry args={[0.065, 0.1, 24]} />
                <meshPhysicalMaterial color="#c9362b" metalness={0.05} roughness={0.4} />
              </mesh>
              <mesh position={[0, -0.055, 0.0015]}>
                <planeGeometry args={[0.24, 0.042]} />
                <meshPhysicalMaterial color="#1f4e8c" metalness={0.05} roughness={0.4} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* RTPI arrivals display hanging under the roof near the front edge */}
      {regions.arrivals != null && (
        <group position={[display.x, roofY - roof.thickness / 2 - display.drop - display.height / 2 - 0.05, body.depth / 2 - 0.3]}>
          {([1, -1] as const).map((s) => (
            <mesh key={s} position={[s * (display.width / 2 - 0.12), display.height / 2 + 0.05 + display.drop / 2, 0]}>
              <cylinderGeometry args={[0.018, 0.018, display.drop + 0.1, 12]} />
              <meshPhysicalMaterial {...steel} />
            </mesh>
          ))}
          <RoundedBox args={[display.width + 0.09, display.height + 0.09, 0.09]} radius={0.02}>
            <meshPhysicalMaterial color="#1c1e22" metalness={0.38} roughness={0.42} />
          </RoundedBox>
          <DeviceScreen
            width={display.width}
            height={display.height}
            radius={0.01}
            {...resolveSurface(regions.arrivals, boardDefaults)}
            position={[0, 0, 0.049]}
          >
            {board}
          </DeviceScreen>
          {/* the waiting-area face - mirrors the street face by default */}
          {backBoard != null && (
            <DeviceScreen
              width={display.width}
              height={display.height}
              radius={0.01}
              {...resolveSurface(regions.arrivalsBack, boardDefaults)}
              position={[0, 0, -0.049]}
              rotation={[0, Math.PI, 0]}
            >
              {backBoard}
            </DeviceScreen>
          )}
        </group>
      )}

      {/* the 6-sheet lightbox as the end panel: tapered plinth collar to the
          pavement, header yoke to the roof, and framed hinged vitrine doors
          around both backlit 6-sheet poster faces */}
      <group position={[lightbox.x, -0.05, 0]}>
        {/* lower structural pedestal + floor collar */}
        <RoundedBox args={[0.28, 0.36, 0.94]} radius={0.02} position={[0, floorY + 0.05 + 0.22, 0]}>
          <meshPhysicalMaterial {...steel} />
        </RoundedBox>
        <RoundedBox args={[0.36, 0.07, 1.06]} radius={0.018} position={[0, floorY + 0.05 + 0.035, 0]}>
          <meshPhysicalMaterial {...steel} roughness={0.48} />
        </RoundedBox>
        {/* upper structural header into the roof canopy */}
        <RoundedBox args={[0.28, 0.36, 0.94]} radius={0.02} position={[0, roofBottomY + 0.05 - 0.18, 0]}>
          <meshPhysicalMaterial {...steel} />
        </RoundedBox>
        {/* main cabinet body */}
        <RoundedBox args={[lightbox.depth, lightbox.height, lightbox.width]} radius={0.036}>
          <meshPhysicalMaterial {...steel} />
        </RoundedBox>
        {/* side maintenance cylinder lock on the street-facing front edge */}
        <mesh rotation-x={Math.PI / 2} position={[0, -0.25, lightbox.width / 2 + 0.002]}>
          <cylinderGeometry args={[0.026, 0.026, 0.012, 16]} />
          <meshPhysicalMaterial {...stainless} />
        </mesh>

        {/* hinged vitrine door frames + backlit diffusers + glass sheen on both faces */}
        {([1, -1] as const).map((s) => (
          <group key={s} rotation-y={s === 1 ? Math.PI / 2 : -Math.PI / 2}>
            {/* backlit white diffuser behind each poster */}
            <mesh position-z={lightbox.depth / 2 + 0.002}>
              <planeGeometry args={[poster.width + 0.06, poster.height + 0.06]} />
              <meshPhysicalMaterial color="#f4f6f8" emissive="#eef2f6" emissiveIntensity={0.55} roughness={0.6} />
            </mesh>
            {/* subtle stepped perimeter door-bezel framing the poster glass */}
            <RoundedBox
              args={[lightbox.width - 0.04, frameBarH * 0.72, 0.018]}
              radius={0.006}
              position={[0, poster.height / 2 + frameBarH * 0.56, lightbox.depth / 2 + 0.003]}
            >
              <meshPhysicalMaterial color="#1b1e23" metalness={0.35} roughness={0.42} />
            </RoundedBox>
            <RoundedBox
              args={[lightbox.width - 0.04, frameBarH * 0.72, 0.018]}
              radius={0.006}
              position={[0, -(poster.height / 2 + frameBarH * 0.56), lightbox.depth / 2 + 0.003]}
            >
              <meshPhysicalMaterial color="#1b1e23" metalness={0.35} roughness={0.42} />
            </RoundedBox>
            {([1, -1] as const).map((side) => (
              <RoundedBox
                key={side}
                args={[frameBarW * 0.72, poster.height + 0.04, 0.018]}
                radius={0.006}
                position={[side * (poster.width / 2 + frameBarW * 0.56), 0, lightbox.depth / 2 + 0.003]}
              >
                <meshPhysicalMaterial color="#1b1e23" metalness={0.35} roughness={0.42} />
              </RoundedBox>
            ))}
            {/* physically-lit Fresnel glazing sheen over the backlit poster */}
            <mesh geometry={posterGlassGeometry} material={posterSheen} position-z={lightbox.depth / 2 + 0.009} />
          </group>
        ))}

        {/* live 6-sheet posters, outward (+X) and inward (−X) */}
        <DeviceScreen
          {...posterProps}
          {...resolveSurface(regions.poster, surfaceDefaults)}
          position={[lightbox.depth / 2 + 0.006, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          {regions.poster?.children}
        </DeviceScreen>
        {regions.inner != null && (
          <DeviceScreen
            {...posterProps}
            {...resolveSurface(regions.inner, surfaceDefaults)}
            position={[-lightbox.depth / 2 - 0.006, 0, 0]}
            rotation={[0, -Math.PI / 2, 0]}
          >
            {regions.inner.children}
          </DeviceScreen>
        )}
      </group>
    </group>
  )
}
BusShelterImpl.displayName = 'BusShelter'

/** The shelter's compound slots, shared by `<BusShelter>` and `<BusShelterMockup>`. */
export const busShelterSlots = createSlots(BUS_SHELTER_REGIONS)

export const BusShelter = Object.assign(BusShelterImpl, busShelterSlots)
