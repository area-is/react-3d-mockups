import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { BILLBOARD, BILLBOARD_REGIONS } from '../../core'
import { DeviceScreen } from '../../screen/device-screen'
import { collectSlots, createSlots, resolveSurface, type SurfaceProps } from '../../slots'

type GroupProps = ThreeElements['group']

export interface BillboardProps extends Omit<GroupProps, 'children' | 'color'>, SurfaceProps {
  /**
   * The creative - any React node. It fills the whole face, full bleed;
   * wrap in `<Billboard.Face>` to set per-surface props.
   */
  children?: React.ReactNode
  /** Steel color (panel, pole, catwalk, light fixtures). */
  color?: string
}

/**
 * A procedurally built highway bulletin: a 14' x 48' live face in a framed
 * steel panel with structural rear ribs and cross-bracing, monopole column on
 * a bolted concrete footing with gusset plates, galvanized maintenance catwalk
 * with knee brackets and end rails, fixed access ladder, and cantilevered LED
 * floodlights along the walkway. No 3D asset files are loaded.
 *
 * The group origin is the face center; the ground sits
 * `BILLBOARD.standHeight` below it. Must be rendered inside a
 * react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 *
 * ```tsx
 * <Billboard rotation={[0, -0.2, 0]}>
 *   <Billboard.Face><YourCreative /></Billboard.Face>
 * </Billboard>
 * ```
 */
function BillboardImpl({
  children,
  color = '#2c313a',
  surfaceBackground = '#ffffff',
  resolution = BILLBOARD.resolution,
  surfaceStyle,
  ...groupProps
}: BillboardProps) {
  const faceSlot = collectSlots(children, BILLBOARD_REGIONS).face
  const { face, panel, apron, standHeight, pole, catwalk, lights } = BILLBOARD

  const panelTop = panel.height / 2
  const apronCenterY = -panelTop - apron.height / 2 + 0.02
  const groundY = -standHeight

  // Painted structural steel tuned so dark highway-grey catches studio bevel
  // highlights instead of crushing flat black, paired with lighter galvanized
  // steel on the walkway, ladder, bolts, and rear bracing for authentic contrast.
  const steel = { color, metalness: 0.38, roughness: 0.42, clearcoat: 0.14, clearcoatRoughness: 0.4 }
  const galvanizedColor = React.useMemo(
    () => `#${new THREE.Color(color).lerp(new THREE.Color('#a6aeb8'), 0.58).getHexString()}`,
    [color]
  )
  const galvanized = { color: galvanizedColor, metalness: 0.68, roughness: 0.36 }
  const concrete = { color: '#8f9398', metalness: 0.04, roughness: 0.9 }

  // The access ladder and the gap it is held off the pole in. The pole's skin
  // curves away from its centerline, so the bracket at a rail has further to
  // reach than one at the middle would: measure to the skin AT the rail's x,
  // then bury the end a little inside it so no seam opens up at any angle.
  const poleZ = -pole.radius - panel.depth / 2 - 0.02
  const ladder = React.useMemo(() => {
    const railX = 0.11
    const z = poleZ - pole.radius - 0.055
    const skinZ = poleZ - Math.sqrt(Math.max(0, pole.radius ** 2 - railX ** 2))
    return { railX, z, rungs: 12, standoff: skinZ - z + 0.02 }
  }, [poleZ, pole.radius])
  const rungY = (i: number) =>
    groundY + 0.35 + i * ((standHeight + apronCenterY - 0.5) / (ladder.rungs - 1))

  // Monopole ends cleanly inside the base flange at groundY (never protruding
  // beneath the foundation collar).
  const poleBottomY = groundY + 0.08
  const poleTopY = apronCenterY + 0.08
  const poleHeight = poleTopY - poleBottomY
  const poleCenterY = (poleTopY + poleBottomY) / 2

  const catwalkY = apronCenterY + apron.height / 2 - catwalk.drop - 0.14
  const catwalkZ = apron.depth / 2 - 0.04 + catwalk.depth / 2
  const trimBarH = (panel.height - face.height) / 2
  const trimBarW = (panel.width - face.width) / 2
  const torsionZ = -panel.depth / 2 - pole.radius

  return (
    <group {...groupProps}>
      {/* steel face panel with stepped picture-frame perimeter trim lip */}
      <RoundedBox args={[panel.width, panel.height, panel.depth]} radius={panel.radius}>
        <meshPhysicalMaterial {...steel} />
      </RoundedBox>
      {/* front perimeter trim molding framing the live vinyl face */}
      {([1, -1] as const).map((v) => (
        <RoundedBox
          key={`th${v}`}
          args={[panel.width, trimBarH * 0.9, 0.024]}
          radius={0.008}
          position={[0, v * (face.height / 2 + trimBarH * 0.5), panel.depth / 2 + 0.006]}
        >
          <meshPhysicalMaterial {...steel} roughness={0.36} />
        </RoundedBox>
      ))}
      {([1, -1] as const).map((s) => (
        <RoundedBox
          key={`tv${s}`}
          args={[trimBarW * 0.9, face.height + 0.02, 0.024]}
          radius={0.008}
          position={[s * (face.width / 2 + trimBarW * 0.5), 0, panel.depth / 2 + 0.006]}
        >
          <meshPhysicalMaterial {...steel} roughness={0.36} />
        </RoundedBox>
      ))}

      {/* torsion box + slatted apron skirt flush under the face - the
          structural band the pole actually connects to */}
      <RoundedBox args={[apron.width, apron.height, apron.depth]} radius={0.02} position={[0, apronCenterY, -0.04]}>
        <meshPhysicalMaterial {...steel} roughness={0.5} />
      </RoundedBox>
      {Array.from({ length: 13 }, (_, i) => (
        <mesh key={i} position={[(i - 6) * (apron.width / 13.4), apronCenterY, apron.depth / 2 - 0.028]}>
          <boxGeometry args={[0.022, apron.height - 0.06, 0.022]} />
          <meshPhysicalMaterial {...galvanized} />
        </mesh>
      ))}

      {/* monopole column terminating cleanly inside its bolted steel base plate,
          triangular welded gussets, and concrete foundation plinth */}
      <mesh position={[0, poleCenterY, poleZ]}>
        <cylinderGeometry args={[pole.radius, pole.radius, poleHeight, 24]} />
        <meshPhysicalMaterial {...steel} />
      </mesh>
      {/* heavy T-saddle neck joining pole into apron & torsion tube */}
      <RoundedBox args={[0.64, apron.height - 0.06, pole.radius + 0.14]} radius={0.02} position={[0, apronCenterY, -panel.depth / 2 - pole.radius / 2 - 0.02]}>
        <meshPhysicalMaterial {...steel} />
      </RoundedBox>
      {/* concrete foundation plinth resting flush on groundY */}
      <mesh position={[0, groundY + 0.05, poleZ]}>
        <cylinderGeometry args={[pole.collarRadius + 0.05, pole.collarRadius + 0.07, 0.1, 24]} />
        <meshPhysicalMaterial {...concrete} />
      </mesh>
      {/* bolted steel base flange plate */}
      <mesh position={[0, groundY + 0.118, poleZ]}>
        <cylinderGeometry args={[pole.collarRadius + 0.025, pole.collarRadius + 0.025, 0.036, 24]} />
        <meshPhysicalMaterial {...steel} roughness={0.48} />
      </mesh>
      {/* 8 galvanized hex anchor bolts around the base flange */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8
        const r = pole.collarRadius - 0.01
        return (
          <mesh key={i} position={[Math.cos(a) * r, groundY + 0.145, poleZ + Math.sin(a) * r]}>
            <cylinderGeometry args={[0.015, 0.015, 0.022, 6]} />
            <meshPhysicalMaterial {...galvanized} />
          </mesh>
        )
      })}
      {/* 4 welded steel gusset stiffeners bracing column to base flange */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((a) => (
        <mesh
          key={a}
          position={[Math.cos(a) * (pole.radius + 0.028), groundY + 0.21, poleZ + Math.sin(a) * (pole.radius + 0.028)]}
          rotation-y={-a}
        >
          <boxGeometry args={[0.065, 0.16, 0.018]} />
          <meshPhysicalMaterial {...steel} />
        </mesh>
      ))}

      {/* maintenance catwalk hung off the apron front: galvanized deck,
          guardrails with end returns, and cantilevered knee brackets */}
      <group position={[0, catwalkY, catwalkZ]}>
        {/* walkway deck with longitudinal rib texture */}
        <mesh>
          <boxGeometry args={[catwalk.width, catwalk.thickness, catwalk.depth]} />
          <meshPhysicalMaterial {...galvanized} roughness={0.46} />
        </mesh>
        {[-0.08, 0, 0.08].map((dz) => (
          <mesh key={dz} position={[0, catwalk.thickness / 2 + 0.004, dz]}>
            <boxGeometry args={[catwalk.width - 0.04, 0.008, 0.025]} />
            <meshPhysicalMaterial {...steel} roughness={0.55} />
          </mesh>
        ))}
        {/* front top rail + mid rail */}
        <mesh position={[0, catwalk.railHeight, catwalk.depth / 2 - 0.02]}>
          <boxGeometry args={[catwalk.width, 0.026, 0.026]} />
          <meshPhysicalMaterial {...galvanized} />
        </mesh>
        <mesh position={[0, catwalk.railHeight * 0.55, catwalk.depth / 2 - 0.02]}>
          <boxGeometry args={[catwalk.width, 0.018, 0.018]} />
          <meshPhysicalMaterial {...galvanized} />
        </mesh>
        {/* end return guardrails closing both ends of the catwalk */}
        {([1, -1] as const).map((side) => (
          <group key={side} position={[side * (catwalk.width / 2 - 0.02), 0, 0]}>
            <mesh position={[0, catwalk.railHeight, 0]}>
              <boxGeometry args={[0.024, 0.024, catwalk.depth]} />
              <meshPhysicalMaterial {...galvanized} />
            </mesh>
            <mesh position={[0, catwalk.railHeight * 0.55, 0]}>
              <boxGeometry args={[0.018, 0.018, catwalk.depth]} />
              <meshPhysicalMaterial {...galvanized} />
            </mesh>
          </group>
        ))}
        {/* guardrail stanchions + underside angled steel knee brackets */}
        {Array.from({ length: catwalk.posts }, (_, i) => {
          const px = (i - (catwalk.posts - 1) / 2) * ((catwalk.width - 0.1) / (catwalk.posts - 1))
          return (
            <group key={i} position-x={px}>
              <mesh position={[0, catwalk.railHeight / 2, catwalk.depth / 2 - 0.02]}>
                <boxGeometry args={[0.024, catwalk.railHeight, 0.024]} />
                <meshPhysicalMaterial {...galvanized} />
              </mesh>
              {/* angled knee bracket supporting the catwalk from the apron */}
              <mesh position={[0, -0.095, -0.02]} rotation-x={0.62}>
                <boxGeometry args={[0.03, 0.028, 0.34]} />
                <meshPhysicalMaterial {...steel} />
              </mesh>
            </group>
          )
        })}
      </group>

      {/* cantilevered hooded rectangular LED floodlights projecting out from
          the catwalk and aimed back up at the bulletin face */}
      {Array.from({ length: lights.count }, (_, i) => {
        const x = (i - (lights.count - 1) / 2) * (face.width / lights.count) * 0.84
        const fixtureZ = apron.depth / 2 - 0.04 + catwalk.depth
        const armReach = 0.36
        return (
          <group key={i} position={[x, catwalkY - 0.01, fixtureZ]}>
            {/* clamp collar on catwalk edge */}
            <mesh position={[0, 0.01, -0.02]}>
              <boxGeometry args={[0.055, 0.06, 0.055]} />
              <meshPhysicalMaterial {...steel} />
            </mesh>
            {/* horizontal galvanized steel extension arm */}
            <mesh position={[0, 0.01, armReach / 2]}>
              <boxGeometry args={[0.028, 0.028, armReach]} />
              <meshPhysicalMaterial {...galvanized} />
            </mesh>
            {/* angled yoke riser at tip of the arm */}
            <mesh position={[0, 0.07, armReach - 0.01]}>
              <boxGeometry args={[0.026, 0.12, 0.026]} />
              <meshPhysicalMaterial {...galvanized} />
            </mesh>
            {/* hooded rectangular die-cast LED floodlight head aimed up at the face */}
            <group position={[0, 0.135, armReach - 0.01]} rotation-x={-0.68}>
              <RoundedBox args={[0.24, 0.058, 0.15]} radius={0.012}>
                <meshPhysicalMaterial {...steel} roughness={0.34} />
              </RoundedBox>
              {/* glowing recessed LED lens face pointed toward the bulletin (-Z/+Y) */}
              <mesh position={[0, 0.03, 0]} rotation-x={-Math.PI / 2}>
                <planeGeometry args={[0.195, 0.11]} />
                <meshPhysicalMaterial color="#fffdf5" emissive="#ffefc4" emissiveIntensity={1.1} roughness={0.2} />
              </mesh>
            </group>
          </group>
        )
      })}

      {/* rear structural steelwork: heavy horizontal torsion tube, vertical
          panel stringer ribs, upper/lower tie beams, and diagonal struts */}
      <group>
        {/* heavy horizontal torsion tube behind the apron */}
        <mesh rotation-z={Math.PI / 2} position={[0, apronCenterY, torsionZ]}>
          <cylinderGeometry args={[pole.radius * 0.74, pole.radius * 0.74, panel.width * 0.78, 20]} />
          <meshPhysicalMaterial {...steel} roughness={0.48} />
        </mesh>
        {/* end cap flanges on the torsion tube */}
        {([1, -1] as const).map((s) => (
          <mesh key={s} rotation-z={Math.PI / 2} position={[s * panel.width * 0.39, apronCenterY, torsionZ]}>
            <cylinderGeometry args={[pole.radius * 0.82, pole.radius * 0.82, 0.03, 20]} />
            <meshPhysicalMaterial {...galvanized} />
          </mesh>
        ))}
        {/* 7 vertical structural steel stringer ribs running up the rear panel */}
        {Array.from({ length: 7 }, (_, i) => {
          const rx = (i - 3) * (panel.width * 0.145)
          return (
            <mesh key={i} position={[rx, -0.08, -panel.depth / 2 - 0.042]}>
              <boxGeometry args={[0.055, panel.height + 0.16, 0.075]} />
              <meshPhysicalMaterial {...galvanized} roughness={0.48} />
            </mesh>
          )
        })}
        {/* two horizontal rear tie beams linking the vertical stringers */}
        {[-0.42, 0.44].map((by) => (
          <mesh key={by} position={[0, by, -panel.depth / 2 - 0.068]}>
            <boxGeometry args={[panel.width * 0.9, 0.06, 0.05]} />
            <meshPhysicalMaterial {...steel} roughness={0.46} />
          </mesh>
        ))}
        {/* angled steel diagonal bracing struts from torsion tube up to the rear beam */}
        {[-1.55, -0.58, 0.58, 1.55].map((bx) => (
          <mesh
            key={bx}
            position={[bx, (apronCenterY + 0.44) / 2, (torsionZ - panel.depth / 2 - 0.068) / 2]}
            rotation-x={Math.atan2(-panel.depth / 2 - 0.068 - torsionZ, 0.44 - apronCenterY)}
          >
            <boxGeometry args={[0.045, Math.hypot(0.44 - apronCenterY, -panel.depth / 2 - 0.068 - torsionZ), 0.045]} />
            <meshPhysicalMaterial {...galvanized} />
          </mesh>
        ))}
      </group>

      {/* fixed access ladder up the rear of the pole, bolted on with
          standoff brackets - a fixed ladder is held clear of the structure
          so a climber's boots have somewhere to go, but it is BOLTED to it,
          not floating beside it */}
      <group position={[0, 0, ladder.z]}>
        {([1, -1] as const).map((s) => (
          <mesh key={s} position={[s * ladder.railX, (apronCenterY - standHeight) / 2 + 0.12, 0]}>
            <boxGeometry args={[0.024, standHeight + apronCenterY - 0.08, 0.024]} />
            <meshPhysicalMaterial {...galvanized} />
          </mesh>
        ))}
        {Array.from({ length: ladder.rungs }, (_, i) => (
          <mesh key={i} rotation-z={Math.PI / 2} position={[0, rungY(i), 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.22, 8]} />
            <meshPhysicalMaterial {...galvanized} />
          </mesh>
        ))}
        {/* the brackets: one pair every third rung, each running from the
            rail into the pole's skin so the two read as one assembly */}
        {[0, 3, 6, 9, 11].map((i) =>
          ([1, -1] as const).map((s) => (
            <mesh
              key={`${i}:${s}`}
              position={[s * ladder.railX, rungY(i), ladder.standoff / 2]}
            >
              <boxGeometry args={[0.018, 0.018, ladder.standoff]} />
              <meshPhysicalMaterial {...steel} roughness={0.5} />
            </mesh>
          ))
        )}
      </group>

      {/* the live face: real DOM, CSS3D-transformed onto the vinyl */}
      <DeviceScreen
        width={face.width}
        height={face.height}
        radius={face.radius}
        position={[0, 0, panel.depth / 2 + 0.006]}
        {...resolveSurface(faceSlot, {
          surfaceBackground,
          resolution,
          surfaceStyle,
        })}
      >
        {faceSlot?.children}
      </DeviceScreen>
    </group>
  )
}
BillboardImpl.displayName = 'Billboard'

/** The bulletin's compound slots, shared by `<Billboard>` and `<BillboardMockup>`. */
export const billboardSlots = createSlots(BILLBOARD_REGIONS)

export const Billboard = Object.assign(BillboardImpl, billboardSlots)
