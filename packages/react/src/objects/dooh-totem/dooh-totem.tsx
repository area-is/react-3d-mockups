import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import {
  DOOH_TOTEM,
  DOOH_TOTEM_REGIONS,
  createSurfaceSheenMaterial,
  doohTotemSpec,
  type DoohTotemSize,
  roundedRectShape,
  smoothShaded,
} from '../../core'
import { DeviceScreen } from '../../screen/device-screen'
import { collectSlots, createSlots, resolveSurface, type SurfaceProps } from '../../slots'

type GroupProps = ThreeElements['group']

export interface DOOHTotemProps extends Omit<GroupProps, 'children' | 'color'>, SurfaceProps {
  /**
   * The creative on the portrait 9:16 displays. Bare children fill the front
   * display; name displays explicitly with `<DOOHTotem.Front>` and
   * `<DOOHTotem.Back>` (real totems are double-sided).
   */
  children?: React.ReactNode
  /**
   * Physical enclosure size in millimeters, e.g.
   * `{ width: 1100, height: 2500 }` for a slimmer kiosk. Defaults to the
   * 1300 x 2800 mm digital 6-sheet class; the display scales with the
   * cabinet.
   */
  size?: DoohTotemSize
  /** Enclosure colorway (street-furniture dark gray by default). */
  color?: string
}

/**
 * A procedurally built digital out-of-home totem (digital 6-sheet class): a
 * smooth-beveled powder-coated enclosure over a recessed shadow-gap kick
 * plinth, 3D slatted ventilation louvres, framed cover glass with Fresnel
 * studio reflections and ambient light sensor on both faces, side service
 * lock, and a live portrait 9:16 display behind the front glass (plus an
 * optional back display - real units are double-sided). No 3D asset files are
 * loaded.
 *
 * The origin is the enclosure center; the pavement sits
 * `DOOH_TOTEM.standHeight` below it. Must be rendered inside a
 * react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 *
 * ```tsx
 * <DOOHTotem>
 *   <DOOHTotem.Front><YourCreative /></DOOHTotem.Front>
 *   <DOOHTotem.Back><NightCreative /></DOOHTotem.Back>
 * </DOOHTotem>
 * ```
 */
function DOOHTotemImpl({
  children,
  size,
  color = '#2f333a',
  surfaceBackground = '#000000',
  resolution = DOOH_TOTEM.resolution,
  surfaceStyle,
  ...groupProps
}: DOOHTotemProps) {
  const regions = collectSlots(children, DOOH_TOTEM_REGIONS)
  const { body, glass, display, plinth, louvre, standHeight } = React.useMemo(
    () => (size ? doohTotemSpec(size) : DOOH_TOTEM),
    [size?.width, size?.height]
  )

  const bodyGeometry = React.useMemo(() => {
    const shape = roundedRectShape(
      body.width - body.bevel * 2,
      body.height - body.bevel * 2,
      body.radius - body.bevel
    )
    const depth = body.depth - body.bevel * 2
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: body.bevel,
      bevelSize: body.bevel,
      bevelSegments: 4,
      curveSegments: 20,
    })
    geometry.translate(0, 0, -depth / 2)
    return smoothShaded(geometry)
  }, [body])

  const glassGeometry = React.useMemo(
    () => new THREE.ShapeGeometry(roundedRectShape(glass.width, glass.height, glass.radius), 16),
    [glass]
  )

  // Slim chamfered gasket frame framing the outer edge of the cover glass.
  const glassTrimGeometry = React.useMemo(() => {
    const rim = 0.022
    const shape = roundedRectShape(glass.width + rim * 2, glass.height + rim * 2, glass.radius + rim)
    shape.holes.push(roundedRectShape(glass.width, glass.height, glass.radius))
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 0.01,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.004,
      bevelSegments: 2,
      curveSegments: 16,
    })
    return smoothShaded(g)
  }, [glass])

  // Physically-lit Fresnel reflection over the tempered cover glass.
  const glassSheen = React.useMemo(
    () => createSurfaceSheenMaterial({ roughness: 0.05, envMapIntensity: 1.05 }),
    []
  )

  React.useEffect(() => {
    return () => {
      bodyGeometry.dispose()
      glassGeometry.dispose()
      glassTrimGeometry.dispose()
      glassSheen.dispose()
    }
  }, [bodyGeometry, glassGeometry, glassTrimGeometry, glassSheen])

  // Powder-coated architectural aluminum: catches clean curved highlights on
  // the smooth-shaded shoulder instead of crushing flat black.
  const cabinetMaterial = { color, metalness: 0.36, roughness: 0.36, clearcoat: 0.26, clearcoatRoughness: 0.32 }
  const louvreBlades = 5
  const slatStep = (louvre.height * 0.78) / (louvreBlades - 1)

  const surfaceDefaults = {
    surfaceBackground,
    resolution,
    surfaceStyle,
  }
  const screenProps = {
    width: display.width,
    height: display.height,
    radius: display.radius,
  }

  return (
    <group {...groupProps}>
      {/* smooth-beveled powder-coated enclosure */}
      <mesh geometry={bodyGeometry}>
        <meshPhysicalMaterial {...cabinetMaterial} />
      </mesh>

      {/* subtle side service-door hairline seam and brushed security keylock */}
      <mesh position={[body.width / 2 + 0.001, 0, body.depth * 0.12]}>
        <boxGeometry args={[0.003, body.height - body.radius * 1.4, 0.006]} />
        <meshPhysicalMaterial color="#121418" metalness={0.2} roughness={0.8} />
      </mesh>
      <group position={[body.width / 2 + 0.002, -body.height * 0.22, 0]}>
        <mesh rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.026, 0.026, 0.008, 16]} />
          <meshPhysicalMaterial color="#bfc5cd" metalness={0.86} roughness={0.26} />
        </mesh>
        <mesh position={[0.005, 0, 0]}>
          <boxGeometry args={[0.002, 0.024, 0.006]} />
          <meshStandardMaterial color="#14161a" roughness={0.9} />
        </mesh>
      </group>

      {/* both faces: matte display surround, chamfered trim bezel, ambient sensor,
          Fresnel cover glass, and real 3D slatted ventilation louvres */}
      {([1, -1] as const).map((s) => (
        <group key={s} rotation-y={s === 1 ? 0 : Math.PI}>
          {/* chamfered gasket trim framing the tempered glass opening */}
          <mesh geometry={glassTrimGeometry} position-z={body.depth / 2 - 0.003}>
            <meshPhysicalMaterial color="#1a1d22" metalness={0.42} roughness={0.34} />
          </mesh>
          {/* matte black surround - reads through the glass around the display */}
          <mesh geometry={glassGeometry} position-z={body.depth / 2 + 0.001}>
            <meshPhysicalMaterial color="#06080c" metalness={0.12} roughness={0.38} clearcoat={0.5} />
          </mesh>
          {/* flush ambient-light brightness sensor dot centered in upper bezel */}
          <mesh
            rotation-x={Math.PI / 2}
            position={[0, (glass.height + display.height) / 4, body.depth / 2 + 0.0025]}
          >
            <cylinderGeometry args={[0.016, 0.016, 0.002, 14]} />
            <meshPhysicalMaterial color="#111a28" metalness={0.3} roughness={0.12} clearcoat={1} />
          </mesh>
          {/* physically-lit Fresnel cover glass reflection over the display */}
          <mesh geometry={glassGeometry} material={glassSheen} position-z={body.depth / 2 + 0.006} />

          {/* 3D slatted ventilation louvre grilles above and below the glass */}
          {([1, -1] as const).map((v) => (
            <group key={v} position={[0, v * louvre.y, body.depth / 2]}>
              {/* dark recessed grille cavity backing */}
              <RoundedBox args={[louvre.width, louvre.height, 0.012]} radius={0.006} position-z={-0.001}>
                <meshPhysicalMaterial color="#0e1014" metalness={0.2} roughness={0.85} />
              </RoundedBox>
              {/* angled horizontal metallic louvre slats catching top key light */}
              {Array.from({ length: louvreBlades }, (_, i) => {
                const sy = ((louvreBlades - 1) / 2 - i) * slatStep
                return (
                  <mesh key={i} position={[0, sy, 0.007]} rotation-x={0.45}>
                    <boxGeometry args={[louvre.width - 0.04, 0.01, 0.022]} />
                    <meshPhysicalMaterial color={color} metalness={0.42} roughness={0.38} />
                  </mesh>
                )
              })}
            </group>
          ))}
        </group>
      ))}

      {/* shadow-gap reveal collar + brushed charcoal kick plinth */}
      <mesh position={[0, -standHeight + plinth.height + 0.014, 0]}>
        <boxGeometry args={[plinth.width - 0.06, 0.035, plinth.depth - 0.06]} />
        <meshPhysicalMaterial color="#121418" metalness={0.2} roughness={0.8} />
      </mesh>
      <RoundedBox
        args={[plinth.width, plinth.height, plinth.depth]}
        radius={0.024}
        position={[0, -standHeight + plinth.height / 2, 0]}
      >
        <meshPhysicalMaterial color="#1f2329" metalness={0.42} roughness={0.48} />
      </RoundedBox>

      {/* the live portrait display, just behind the front cover glass */}
      <DeviceScreen
        {...screenProps}
        {...resolveSurface(regions.front, surfaceDefaults)}
        position={[0, 0, body.depth / 2 + 0.002]}
      >
        {regions.front?.children}
      </DeviceScreen>

      {/* the back display - real totems are double-sided */}
      {regions.back != null && (
        <DeviceScreen
          {...screenProps}
          {...resolveSurface(regions.back, surfaceDefaults)}
          position={[0, 0, -(body.depth / 2 + 0.002)]}
          rotation={[0, Math.PI, 0]}
        >
          {regions.back.children}
        </DeviceScreen>
      )}
    </group>
  )
}
DOOHTotemImpl.displayName = 'DOOHTotem'

/** The totem's compound slots, shared by `<DOOHTotem>` and `<DOOHTotemMockup>`. */
export const doohTotemSlots = createSlots(DOOH_TOTEM_REGIONS)

export const DOOHTotem = Object.assign(DOOHTotemImpl, doohTotemSlots)
