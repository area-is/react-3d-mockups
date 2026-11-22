import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import {
  ROLLUP_BANNER,
  ROLLUP_BANNER_REGIONS,
  rollupBannerSpec,
  type RollupBannerSize,
  roundedRectShape,
  smoothShaded,
} from '../../core'
import { DeviceScreen } from '../../screen/device-screen'
import { collectSlots, createSlots, resolveSurface, type SurfaceProps } from '../../slots'

type GroupProps = ThreeElements['group']

export interface RollupBannerProps extends Omit<GroupProps, 'children' | 'color'>, SurfaceProps {
  /**
   * Banner graphic - any React node. It fills the visible graphic, full
   * bleed; wrap in `<RollupBanner.Banner>` to set per-surface props.
   */
  children?: React.ReactNode
  /**
   * Physical graphic size in millimeters, e.g. `{ width: 1000 }` for a wide
   * stand or `{ width: 600, height: 1600 }` for a compact one. Defaults to
   * the standard 850 x 2000 mm unit.
   */
  size?: RollupBannerSize
  /** Hardware color (cassette, pole, top rail). Brushed aluminum by default. */
  color?: string
}

/** Build the sculpted teardrop/wedge side profile of a wide-base exhibition cassette. */
function teardropProfile(depth: number, height: number, expand = 0): THREE.Shape {
  const zFront = depth * 0.42 + expand
  const zBack = -depth * 0.58 - expand
  const yBot = -expand
  const yTop = height + expand
  const s = new THREE.Shape()
  s.moveTo(zBack + 0.04, yBot)
  s.lineTo(zFront - 0.04, yBot)
  // Low sleek rounded front nose sweeping smoothly up to the top exit ridge
  s.quadraticCurveTo(zFront + 0.012, yBot, zFront, yBot + 0.045)
  s.bezierCurveTo(zFront - 0.02, yTop * 0.68, 0.14, yTop * 0.98, 0.045, yTop)
  // Flat ridge crown where the banner exit channel sits
  s.lineTo(-0.055, yTop)
  // Contoured rear deck sloping down past the pole socket to a low rounded heel
  s.bezierCurveTo(-0.18, yTop * 0.96, zBack + 0.04, yTop * 0.64, zBack, yBot + 0.045)
  s.quadraticCurveTo(zBack - 0.012, yBot, zBack + 0.04, yBot)
  s.closePath()
  return s
}

/**
 * A procedurally built retractable roll-up banner stand (the 850 x 2000 mm
 * trade-show standard): a floor-hugging teardrop-profile wide-base brushed
 * aluminum cassette with dark end caps, chrome accents and rubber feet, a
 * 3-section telescoping rear support pole in a deck socket, a chamfered top
 * aluminum snap-rail with end plugs and rear hook, and the graphic rising out
 * of the cassette exit slot as a live full-bleed DOM surface. No 3D asset
 * files are loaded.
 *
 * The origin is the graphic center; the floor sits
 * `ROLLUP_BANNER.standHeight` below it. Must be rendered inside a
 * react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 *
 * ```tsx
 * <RollupBanner>
 *   <RollupBanner.Banner><YourBannerArt /></RollupBanner.Banner>
 * </RollupBanner>
 * ```
 */
function RollupBannerImpl({
  children,
  size,
  color = '#b9bdc4',
  surfaceBackground = '#ffffff',
  resolution = ROLLUP_BANNER.resolution,
  surfaceStyle,
  ...groupProps
}: RollupBannerProps) {
  const bannerSlot = collectSlots(children, ROLLUP_BANNER_REGIONS).banner
  const { graphic, cassette, pole, rail, standHeight } = React.useMemo(
    () => (size ? rollupBannerSpec(size) : ROLLUP_BANNER),
    [size?.width, size?.height]
  )

  const floorY = -standHeight
  const cassetteBaseY = floorY + 0.01
  const cassetteBodyH = cassette.height - 0.014

  const geometries = React.useMemo(() => {
    const backing = new THREE.ShapeGeometry(
      roundedRectShape(graphic.width + 0.004, graphic.height + 0.02, graphic.radius),
      8
    )

    // Smoothly shaded teardrop aluminum cassette body, extruded across width.
    const bodyRaw = new THREE.ExtrudeGeometry(teardropProfile(cassette.depth, cassetteBodyH, 0), {
      depth: cassette.width,
      bevelEnabled: false,
      curveSegments: 24,
    })
    bodyRaw.translate(0, 0, -cassette.width / 2)
    bodyRaw.rotateY(-Math.PI / 2)
    const cassetteBody = smoothShaded(bodyRaw)

    // Sculpted proud end caps matching the teardrop silhouette.
    const capThickness = 0.032
    const capRaw = new THREE.ExtrudeGeometry(teardropProfile(cassette.depth, cassetteBodyH, 0.009), {
      depth: capThickness - 0.012,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.005,
      bevelSegments: 2,
      curveSegments: 24,
    })
    capRaw.translate(0, 0, -(capThickness - 0.012) / 2)
    capRaw.rotateY(-Math.PI / 2)
    const endCap = smoothShaded(capRaw)

    // Slim chrome side trim inlay echoing the teardrop contour on each cap.
    const accentRaw = new THREE.ExtrudeGeometry(teardropProfile(cassette.depth * 0.72, cassetteBodyH * 0.56, 0), {
      depth: 0.008,
      bevelEnabled: false,
      curveSegments: 18,
    })
    accentRaw.translate(0, 0, -0.004)
    accentRaw.rotateY(-Math.PI / 2)
    const capAccent = smoothShaded(accentRaw)

    return { backing, cassetteBody, endCap, capAccent }
  }, [graphic, cassette, cassetteBodyH])

  React.useEffect(() => {
    return () => {
      geometries.backing.dispose()
      geometries.cassetteBody.dispose()
      geometries.endCap.dispose()
      geometries.capAccent.dispose()
    }
  }, [geometries])

  const aluminum = { color, metalness: 0.76, roughness: 0.34, clearcoat: 0.15, clearcoatRoughness: 0.3 }
  const chrome = { color: '#dde1e7', metalness: 0.9, roughness: 0.18 }
  const darkCap = { color: '#272a30', metalness: 0.25, roughness: 0.46 }
  const rubber = { color: '#1a1c20', metalness: 0, roughness: 0.92 }

  // 3-section telescoping rear bungee pole rising from the cassette socket to the top hook.
  const poleZ = -0.115
  const poleBottomY = cassetteBaseY + cassetteBodyH * 0.62
  const poleTopY = graphic.height / 2 + 0.005
  const poleTotalH = poleTopY - poleBottomY
  const segH = poleTotalH / 3
  const railY = graphic.height / 2 + rail.height / 2 - 0.008

  return (
    <group {...groupProps}>
      {/* curl-free grey-back vinyl backing the graphic prints on */}
      <mesh geometry={geometries.backing} position-z={-0.004}>
        <meshPhysicalMaterial color="#c4c5c2" metalness={0} roughness={0.82} side={THREE.DoubleSide} />
      </mesh>

      {/* sculpted wide-base teardrop aluminum cassette */}
      <group position={[0, cassetteBaseY, 0]}>
        <mesh geometry={geometries.cassetteBody}>
          <meshPhysicalMaterial {...aluminum} />
        </mesh>

        {/* dark sculpted end caps with subtle brushed-chrome side inlay */}
        {([1, -1] as const).map((side) => (
          <group key={side} position-x={side * (cassette.width / 2 + 0.014)}>
            <mesh geometry={geometries.endCap}>
              <meshPhysicalMaterial {...darkCap} />
            </mesh>
            <mesh
              geometry={geometries.capAccent}
              position={[side * 0.015, cassetteBodyH * 0.12, -0.015]}
            >
              <meshPhysicalMaterial {...chrome} />
            </mesh>
          </group>
        ))}

        {/* recessed dark banner exit slot bezel along the top ridge */}
        <RoundedBox
          args={[graphic.width + 0.045, 0.024, 0.056]}
          radius={0.008}
          position={[0, cassetteBodyH + 0.004, 0]}
        >
          <meshPhysicalMaterial {...darkCap} roughness={0.55} />
        </RoundedBox>
        {/* dark narrow slit directly around the emerging graphic */}
        <mesh position={[0, cassetteBodyH + 0.015, 0]}>
          <boxGeometry args={[graphic.width + 0.016, 0.006, 0.016]} />
          <meshPhysicalMaterial color="#111317" metalness={0.1} roughness={0.85} />
        </mesh>

        {/* 4 low-profile non-slip rubber pads under the cassette base */}
        {([1, -1] as const).map((sx) =>
          ([cassette.depth * 0.24, -cassette.depth * 0.4] as const).map((fz, i) => (
            <mesh key={`${sx}${i}`} position={[sx * (cassette.width / 2 - 0.07), -0.005, fz]}>
              <cylinderGeometry args={[0.028, 0.032, 0.012, 14]} />
              <meshPhysicalMaterial {...rubber} />
            </mesh>
          ))
        )}

        {/* moulded rear pole socket collar seated into the cassette back slope */}
        <mesh position={[0, cassetteBodyH * 0.88, poleZ]}>
          <cylinderGeometry args={[pole.radius * 1.9, pole.radius * 2.2, 0.045, 16]} />
          <meshPhysicalMaterial {...darkCap} />
        </mesh>
      </group>

      {/* 3-section telescoping rear support pole with ferrule joints */}
      <group position={[0, 0, poleZ]}>
        {[0, 1, 2].map((i) => {
          const r = pole.radius * (1.06 - i * 0.14)
          const cy = poleBottomY + segH * (i + 0.5)
          return (
            <React.Fragment key={i}>
              <mesh position-y={cy}>
                <cylinderGeometry args={[r, r, segH + 0.01, 14]} />
                <meshPhysicalMaterial {...aluminum} roughness={0.28} />
              </mesh>
              {/* dark locking ferrule collar between sections */}
              {i > 0 && (
                <mesh position-y={poleBottomY + segH * i}>
                  <cylinderGeometry args={[r * 1.38, r * 1.48, 0.055, 16]} />
                  <meshPhysicalMaterial {...darkCap} />
                </mesh>
              )}
            </React.Fragment>
          )
        })}
        {/* rounded pole tip plug seating into the rear rail bracket */}
        <mesh position-y={poleTopY + 0.005}>
          <cylinderGeometry args={[pole.radius * 0.72, pole.radius * 0.78, 0.025, 12]} />
          <meshPhysicalMaterial {...darkCap} />
        </mesh>
      </group>

      {/* top aluminum snap-rail with dark sculpted end-cap plugs */}
      <group position={[0, railY, -0.012]}>
        <RoundedBox args={[graphic.width + 0.025, rail.height, rail.depth]} radius={0.014}>
          <meshPhysicalMaterial {...aluminum} />
        </RoundedBox>
        {/* front snap-rail lip seam */}
        <mesh position={[0, -rail.height * 0.34, rail.depth / 2 - 0.002]}>
          <boxGeometry args={[graphic.width + 0.02, 0.006, 0.008]} />
          <meshPhysicalMaterial {...darkCap} />
        </mesh>
        {/* left and right molded end-cap plugs */}
        {([1, -1] as const).map((side) => (
          <RoundedBox
            key={side}
            args={[0.022, rail.height + 0.004, rail.depth + 0.004]}
            radius={0.008}
            position-x={side * ((graphic.width + 0.025) / 2 + 0.008)}
          >
            <meshPhysicalMaterial {...darkCap} />
          </RoundedBox>
        ))}
        {/* rear hanger hook bracket bridging rail back to the pole tip */}
        <RoundedBox args={[0.06, 0.036, Math.abs(poleZ) + 0.01]} radius={0.01} position={[0, -0.004, poleZ / 2]}>
          <meshPhysicalMaterial {...darkCap} />
        </RoundedBox>
        <mesh position={[0, -0.018, poleZ + 0.012]}>
          <cylinderGeometry args={[pole.radius * 1.4, pole.radius * 1.4, 0.036, 14]} />
          <meshPhysicalMaterial {...darkCap} />
        </mesh>
      </group>

      {/* the live graphic: real DOM, CSS3D-transformed onto the vinyl */}
      <DeviceScreen
        width={graphic.width}
        height={graphic.height}
        radius={graphic.radius}
        position={[0, 0, 0.002]}
        {...resolveSurface(bannerSlot, {
          surfaceBackground,
          resolution,
          surfaceStyle,
        })}
      >
        {bannerSlot?.children}
      </DeviceScreen>
    </group>
  )
}
RollupBannerImpl.displayName = 'RollupBanner'

/** The stand's compound slots, shared by `<RollupBanner>` and `<RollupBannerMockup>`. */
export const rollupBannerSlots = createSlots(ROLLUP_BANNER_REGIONS)

export const RollupBanner = Object.assign(RollupBannerImpl, rollupBannerSlots)
