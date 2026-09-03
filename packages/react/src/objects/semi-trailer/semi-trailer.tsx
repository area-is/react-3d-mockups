import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { SEMI_TRAILER, SEMI_TRAILER_REGIONS } from '../../core'
import { DeviceScreen } from '../../screen/device-screen'
import { collectSlots, createSlots, resolveSurface, type SurfaceProps } from '../../slots'
import { RoadWheel } from '../road-wheel'

type GroupProps = ThreeElements['group']
type V3 = [number, number, number]

export interface SemiTrailerProps extends Omit<GroupProps, 'children' | 'color'>, SurfaceProps {
  /**
   * Wrap content. Bare children fill the curb-side (+Z) panel; name panels
   * explicitly with `<SemiTrailer.CurbSide>`, `<SemiTrailer.StreetSide>` and
   * `<SemiTrailer.Rear>` (the rear-door panel, between the lock rods).
   */
  children?: React.ReactNode
  /** Box paint. Wrap trailers are usually white. */
  color?: string
  /** Side-skirt paint. Defaults to the box `color`. */
  skirtColor?: string
}

/*
 * Finishes, named for what they stand in for. A dry van is four materials
 * seen together - white sheet, bright extruded aluminium, dark painted or
 * galvanised steel, and rubber - and it is the contrast between them along
 * the rails, posts and undercarriage that turns a white slab into a trailer.
 */
const ALU = { color: '#b7bbc2', metalness: 0.78, roughness: 0.42 }
const GALV = { color: '#868c94', metalness: 0.6, roughness: 0.58 }
const STEEL = { color: '#2a2d32', metalness: 0.5, roughness: 0.6 }
const FRAME = { color: '#191b1f', metalness: 0.3, roughness: 0.82 }
const RUBBER = { color: '#141518', metalness: 0, roughness: 0.94 }
const CHROME = { color: '#c9cdd3', metalness: 0.85, roughness: 0.3 }
const RED_LENS = { color: '#8c1524', emissive: '#c11a30', emissiveIntensity: 0.45, roughness: 0.3 }
const AMBER_LENS = { color: '#f2a33c', emissive: '#ffb340', emissiveIntensity: 0.4, roughness: 0.3 }
const TAPE_RED = { color: '#a01822', emissive: '#c01a28', emissiveIntensity: 0.25, roughness: 0.3 }
const TAPE_WHITE = { color: '#c8ccd2', emissive: '#e8ecf2', emissiveIntensity: 0.25, roughness: 0.3 }

/**
 * A surface-mount oval marker lamp: black bezel, coloured lens, standing a
 * few millimetres proud so it catches its own highlight. Faces local +Z.
 */
function MarkerLamp({
  position,
  rotation = [0, 0, 0],
  lens,
  size = [0.05, 0.024],
}: {
  position: V3
  rotation?: V3
  lens: typeof RED_LENS
  size?: [number, number]
}) {
  const [w, h] = size
  return (
    <group position={position} rotation={rotation}>
      <mesh position-z={0.0035}>
        <boxGeometry args={[w + 0.008, h + 0.008, 0.006]} />
        <meshPhysicalMaterial color="#111216" metalness={0.2} roughness={0.7} />
      </mesh>
      <mesh position-z={0.009}>
        <boxGeometry args={[w, h, 0.007]} />
        <meshPhysicalMaterial {...lens} />
      </mesh>
    </group>
  )
}

/**
 * A square-section bar aimed from one point to another. Every diagonal on
 * the underside - skirt struts, guard braces, landing-gear braces, trailing
 * arms - is this, so the aiming math lives in one place.
 */
function Bar({ from, to, section, finish }: { from: V3; to: V3; section: number; finish: typeof FRAME }) {
  const a = new THREE.Vector3(...from)
  const b = new THREE.Vector3(...to)
  const dir = b.clone().sub(a)
  const length = dir.length()
  const euler = new THREE.Euler().setFromQuaternion(
    new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.divideScalar(length))
  )
  return (
    <mesh position={a.add(b).multiplyScalar(0.5).toArray() as V3} rotation={[euler.x, euler.y, euler.z]}>
      <boxGeometry args={[section, length, section]} />
      <meshPhysicalMaterial {...finish} />
    </mesh>
  )
}

/**
 * The floor crossmembers, one draw call. Seen from below they are what says
 * "there is a floor up there" instead of a hollow shell; from the side their
 * ends show as the dark stitch line under the bottom rail.
 */
function Crossmembers({ count, pitch, y, size }: { count: number; pitch: number; y: number; size: V3 }) {
  const ref = React.useRef<THREE.InstancedMesh>(null!)
  React.useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    for (let i = 0; i < count; i++) {
      ref.current.setMatrixAt(i, m.makeTranslation(-((count - 1) * pitch) / 2 + i * pitch, y, 0))
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [count, pitch, y])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={size} />
      <meshPhysicalMaterial {...FRAME} />
    </instancedMesh>
  )
}

/**
 * A procedurally built 53 ft dry-van semi trailer, parked on its landing
 * gear: smooth wrap-ready sides between aluminium top and bottom rails, a
 * bowed roof, corner posts, a rear door frame with two swing doors on hinges
 * and four lock rods, tandem air-ride axles on dual wheels, a kingpin plate,
 * side skirts on struts, mud flaps, ICC under-ride guard, marker lamps and
 * DOT reflective tape. Both sides and the rear doors are live DOM. No 3D
 * asset files are loaded.
 *
 * The origin is the box center; the road sits `SEMI_TRAILER.groundY` below
 * it. Must be rendered inside a react-three-fiber `<Canvas>` (or
 * `<MockupCanvas>`).
 *
 * ```tsx
 * <SemiTrailer>
 *   <YourWrap />
 *   <SemiTrailer.Rear><RearDoors /></SemiTrailer.Rear>
 * </SemiTrailer>
 * ```
 */
function SemiTrailerImpl({
  children,
  color = '#eef0f2',
  skirtColor,
  surfaceBackground = '#ffffff',
  resolution = SEMI_TRAILER.resolution,
  surfaceStyle,
  ...groupProps
}: SemiTrailerProps) {
  const regions = collectSlots(children, SEMI_TRAILER_REGIONS)
  const { body, groundY, wheels, landingGear, side, rear: rearSpec, rails, rearFrame, skirt, guard } = SEMI_TRAILER
  const hl = body.length / 2
  const hh = body.height / 2
  const hw = body.width / 2
  const floorY = -hh
  // Rails, corner posts and the rear frame's side flanges all stand this far
  // proud of the sheet. It is less than the side panels' own stand-off, so
  // nothing here can ever cross in front of the wrap from any angle.
  const railZ = hw + rails.stand
  // The rear frame's face. The rear panel floats 0.03 behind the box, so the
  // doors are built out to meet it, and the frame reaches 1 mm past that
  // plane - enough to read as a frame around recessed doors, not enough to
  // clip the panel's edge at a grazing angle.
  const frameX = -hl - rearFrame.depth
  const doorFaceX = -hl - 0.024
  const headerBottom = 0.547
  const sillTop = -0.561
  // the frame runs up to the roof crown and down past the floor into the sill
  const rearTop = hh + 0.011
  const rearBottom = floorY - 0.045
  const rearMidY = (rearTop + rearBottom) / 2
  // dual tire pair per side: outer tire face tucked just inside the box side
  const dualOuterZ = hw - 0.03 - wheels.width / 2
  const dualInnerZ = dualOuterZ - wheels.width - wheels.dualGap
  const dualMidZ = (dualOuterZ + dualInnerZ) / 2
  const guardY = groundY + guard.height
  const guardX = frameX - 0.02 + 0.0225

  const sheet = { color, metalness: 0.15, roughness: 0.45, clearcoat: 0.5, clearcoatRoughness: 0.35 }
  const surfaceDefaults = { surfaceBackground, surfaceStyle }

  // The roof bow: a shallow lens on top of the box, peaking ~25 mm over the
  // flat roof. Real roofs are crowned so water sheds; here it is what keeps
  // the top edge from reading as a ruler line against the sky.
  const crownLength = body.length - body.radius * 2
  const crownGeometry = React.useMemo(() => {
    const halfW = hw - body.radius
    const shape = new THREE.Shape()
    shape.moveTo(-halfW, 0)
    shape.quadraticCurveTo(0, 0.024, halfW, 0)
    shape.closePath()
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: crownLength, bevelEnabled: false, curveSegments: 10 })
    geometry.rotateY(Math.PI / 2)
    geometry.translate(-crownLength / 2, 0, 0)
    return geometry
  }, [hw, body.radius, crownLength])
  React.useEffect(() => () => crownGeometry.dispose(), [crownGeometry])

  // The side skirt panel, with the diagonal cut at its front end that every
  // aero skirt carries so it clears the landing gear and the tractor's wheels.
  // Built with its top edge at local y=0 so it can be hinged inward there.
  const skirtGeometry = React.useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(skirt.rear, 0)
    shape.lineTo(skirt.front, 0)
    shape.lineTo(skirt.front, -skirt.height + skirt.chamfer * 0.7)
    shape.lineTo(skirt.front - skirt.chamfer, -skirt.height)
    shape.lineTo(skirt.rear, -skirt.height)
    shape.closePath()
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.012, bevelEnabled: false })
    geometry.translate(0, 0, -0.006)
    return geometry
  }, [skirt])
  React.useEffect(() => () => skirtGeometry.dispose(), [skirtGeometry])

  // hinge, rod-guide and handle heights are staggered so none of the door
  // hardware runs into its neighbour
  const hingeYs = [-0.4, -0.13, 0.14, 0.41]
  const guideYs = [-0.28, 0, 0.28]
  const handleY = -0.47

  return (
    <group {...groupProps}>
      {/* the box - smooth-sided, wrap-ready - under its bowed roof and the
          front cap that closes the crown's leading edge */}
      <RoundedBox args={[body.length, body.height, body.width]} radius={body.radius}>
        <meshPhysicalMaterial {...sheet} />
      </RoundedBox>
      <mesh geometry={crownGeometry} position={[0, hh - 0.002, 0]}>
        <meshPhysicalMaterial {...sheet} clearcoat={0.2} />
      </mesh>
      <mesh position={[hl - 0.02, hh + 0.0005, 0]}>
        <boxGeometry args={[0.05, 0.021, body.width - 0.04]} />
        <meshPhysicalMaterial {...ALU} />
      </mesh>

      {/* top and bottom rails: the extruded aluminium that frames the sheet.
          They stop short of the corner posts and the rear frame's flanges so
          no two coplanar faces fight */}
      {([1, -1] as const).map((s) => (
        <group key={s}>
          <mesh position={[-0.0025, hh - rails.top / 2, s * (railZ - 0.00625)]}>
            <boxGeometry args={[body.length - 0.125, rails.top, 0.0125]} />
            <meshPhysicalMaterial {...ALU} />
          </mesh>
          <mesh position={[-0.0025, floorY + rails.bottom / 2, s * (railZ - 0.00625)]}>
            <boxGeometry args={[body.length - 0.125, rails.bottom, 0.0125]} />
            <meshPhysicalMaterial {...ALU} />
          </mesh>
          {/* DOT reflective tape along the bottom rail - ≥50% length coverage */}
          {Array.from({ length: 20 }, (_, i) => (
            <mesh key={i} position={[-hl + 0.5 + i * 0.29, floorY + 0.045, s * (railZ + 0.001)]}>
              <planeGeometry args={[0.17, 0.045]} />
              <meshPhysicalMaterial {...(i % 2 ? TAPE_WHITE : TAPE_RED)} side={2} />
            </mesh>
          ))}
          {/* front corner post: the radiused aluminium cap on the leading
              edge, wrapping both the side and the nose */}
          <RoundedBox
            args={[0.07, body.height, 0.07]}
            radius={0.02}
            smoothness={2}
            position={[hl - 0.035 + rails.stand, 0, s * (hw - 0.035 + rails.stand)]}
          >
            <meshPhysicalMaterial {...ALU} />
          </RoundedBox>
          {/* amber clearance lamps at the front top corners, one on each face,
              ambers along the top rail, and the amber intermediate side
              marker at the midpoint of the bottom rail (in the tape's gap) */}
          <MarkerLamp
            position={[hl - 0.0305, 0.5, s * railZ]}
            rotation={[0, s === 1 ? 0 : Math.PI, 0]}
            lens={AMBER_LENS}
            size={[0.034, 0.024]}
          />
          <MarkerLamp position={[hl, 0.5, s * 0.43]} rotation={[0, Math.PI / 2, 0]} lens={AMBER_LENS} />
          {[2, 0, -2].map((x) => (
            <MarkerLamp
              key={x}
              position={[x, hh - rails.top / 2, s * railZ]}
              rotation={[0, s === 1 ? 0 : Math.PI, 0]}
              lens={AMBER_LENS}
              size={[0.05, 0.02]}
            />
          ))}
          <MarkerLamp position={[0.005, floorY + 0.045, s * railZ]} rotation={[0, s === 1 ? 0 : Math.PI, 0]} lens={AMBER_LENS} />
          {/* red side markers at the rear: high on the frame flange, low on the rail */}
          <MarkerLamp position={[-hl + 0.03, 0.5, s * railZ]} rotation={[0, s === 1 ? 0 : Math.PI, 0]} lens={RED_LENS} />
          <MarkerLamp position={[-hl + 0.13, floorY + 0.045, s * railZ]} rotation={[0, s === 1 ? 0 : Math.PI, 0]} lens={RED_LENS} />
        </group>
      ))}

      {/* nose box: the two glad hands and the 7-way socket the tractor hooks
          up to, on the street side of the front wall */}
      <group position={[hl + 0.003, 0.2, -0.3]}>
        <mesh>
          <boxGeometry args={[0.006, 0.1, 0.16]} />
          <meshPhysicalMaterial {...GALV} />
        </mesh>
        {([
          ['#b3202a', -0.045],
          ['#2a5db0', 0.005],
        ] as const).map(([lensColor, z]) => (
          <mesh key={z} rotation-z={Math.PI / 2} position={[0.014, 0.02, z]}>
            <cylinderGeometry args={[0.014, 0.014, 0.022, 12]} />
            <meshPhysicalMaterial color={lensColor} metalness={0.3} roughness={0.5} />
          </mesh>
        ))}
        <mesh rotation-z={Math.PI / 2} position={[0.01, -0.03, 0.05]}>
          <cylinderGeometry args={[0.016, 0.016, 0.014, 12]} />
          <meshPhysicalMaterial {...FRAME} />
        </mesh>
      </group>

      {/* rear frame: corner posts, header and sill in painted steel, with
          side flanges wrapping onto the walls. Every face stays outboard of
          the rear panel's edges (half-width 0.45) */}
      {([1, -1] as const).map((s) => (
        <group key={s}>
          <mesh position={[frameX + rearFrame.depth / 2, rearMidY, s * (railZ - rearFrame.post / 2)]}>
            <boxGeometry args={[rearFrame.depth, rearTop - rearBottom, rearFrame.post]} />
            <meshPhysicalMaterial {...STEEL} />
          </mesh>
          <mesh position={[-hl + 0.03, rearMidY, s * (railZ - 0.00625)]}>
            <boxGeometry args={[0.06, rearTop - rearBottom, 0.0125]} />
            <meshPhysicalMaterial {...STEEL} />
          </mesh>
          {/* the swing door: a composite slab meeting the post, its face
              0.006 behind the live panel just as the walls sit behind theirs */}
          <mesh position={[doorFaceX + 0.012, (headerBottom + sillTop) / 2, s * 0.2285]}>
            <boxGeometry args={[0.024, headerBottom - sillTop, 0.451]} />
            <meshPhysicalMaterial {...sheet} />
          </mesh>
          {/* four hinges per door: butt on the post, pin, short strap onto the door */}
          {hingeYs.map((y) => (
            <group key={y}>
              <mesh position={[frameX - 0.014, y, s * 0.49]}>
                <boxGeometry args={[0.03, 0.055, 0.05]} />
                <meshPhysicalMaterial {...GALV} />
              </mesh>
              <mesh position={[frameX - 0.03, y, s * 0.458]}>
                <cylinderGeometry args={[0.011, 0.011, 0.075, 10]} />
                <meshPhysicalMaterial {...GALV} />
              </mesh>
              <mesh position={[frameX - 0.008, y, s * 0.44]}>
                <boxGeometry args={[0.014, 0.045, 0.05]} />
                <meshPhysicalMaterial {...GALV} />
              </mesh>
            </group>
          ))}
          {/* lock rods: full-height bars in guides bolted to the door, cams
              hooking the header and sill, a lever handle low on each rod
              held in a keeper toward the door's middle */}
          {rearFrame.lockRods.map((r) => {
            const z = s * r
            const lever = r > 0.29 ? -s : s
            return (
              <group key={r}>
                <mesh position={[frameX - 0.03, rearMidY, z]}>
                  <cylinderGeometry args={[0.011, 0.011, rearTop - rearBottom - 0.03, 10]} />
                  <meshPhysicalMaterial {...CHROME} />
                </mesh>
                {guideYs.map((y) => (
                  <mesh key={y} position={[frameX - 0.014, y, z]}>
                    <boxGeometry args={[0.042, 0.05, 0.04]} />
                    <meshPhysicalMaterial {...GALV} />
                  </mesh>
                ))}
                {[0.575, -0.6].map((y) => (
                  <mesh key={y} position={[frameX - 0.014, y, z]}>
                    <boxGeometry args={[0.03, 0.03, 0.05]} />
                    <meshPhysicalMaterial {...GALV} />
                  </mesh>
                ))}
                <mesh position={[frameX - 0.03, handleY, z]}>
                  <cylinderGeometry args={[0.017, 0.017, 0.03, 12]} />
                  <meshPhysicalMaterial {...GALV} />
                </mesh>
                <mesh position={[frameX - 0.03, handleY, z + lever * 0.05]}>
                  <boxGeometry args={[0.02, 0.022, 0.1]} />
                  <meshPhysicalMaterial {...GALV} />
                </mesh>
                <mesh position={[frameX - 0.012, handleY, z + lever * 0.1]}>
                  <boxGeometry args={[0.03, 0.036, 0.022]} />
                  <meshPhysicalMaterial {...GALV} />
                </mesh>
              </group>
            )
          })}
          {/* white inverted-L conspicuity at the upper rear corners, and the
              red clearance lamp in the corner it frames */}
          <mesh position={[frameX - 0.001, 0.415, s * 0.49]} rotation-y={-Math.PI / 2}>
            <planeGeometry args={[0.05, 0.25]} />
            <meshPhysicalMaterial {...TAPE_WHITE} side={2} />
          </mesh>
          <mesh position={[frameX - 0.001, 0.571, s * 0.29]} rotation-y={-Math.PI / 2}>
            <planeGeometry args={[0.16, 0.03]} />
            <meshPhysicalMaterial {...TAPE_WHITE} side={2} />
          </mesh>
          <MarkerLamp position={[frameX, 0.571, s * 0.49]} rotation={[0, -Math.PI / 2, 0]} lens={RED_LENS} size={[0.045, 0.024]} />
          {/* tail lamp cluster set into the sill - stop/tail, stop/tail,
              turn - and the rubber dock bumper outboard of it */}
          <mesh position={[frameX - 0.004, -0.596, s * 0.3]}>
            <boxGeometry args={[0.01, 0.052, 0.17]} />
            <meshPhysicalMaterial color="#111216" metalness={0.2} roughness={0.7} />
          </mesh>
          {([
            [0.24, RED_LENS],
            [0.3, RED_LENS],
            [0.36, AMBER_LENS],
          ] as const).map(([lz, lens]) => (
            <mesh key={lz} rotation-z={Math.PI / 2} position={[frameX - 0.009, -0.596, s * lz]}>
              <cylinderGeometry args={[0.02, 0.02, 0.01, 14]} />
              <meshPhysicalMaterial {...lens} />
            </mesh>
          ))}
          <mesh position={[frameX - 0.0225, -0.596, s * 0.465]}>
            <boxGeometry args={[0.045, 0.06, 0.09]} />
            <meshPhysicalMaterial {...RUBBER} />
          </mesh>
        </group>
      ))}
      {/* the header reaches forward over the roof's rear edge to cap the crown */}
      <mesh position={[frameX + (rearFrame.depth + 0.03) / 2, (rearTop + headerBottom) / 2, 0]}>
        <boxGeometry args={[rearFrame.depth + 0.03, rearTop - headerBottom, body.width + 0.009]} />
        <meshPhysicalMaterial {...STEEL} />
      </mesh>
      <mesh position={[frameX + rearFrame.depth / 2, (sillTop + rearBottom) / 2, 0]}>
        <boxGeometry args={[rearFrame.depth, sillTop - rearBottom, body.width + 0.009]} />
        <meshPhysicalMaterial {...STEEL} />
      </mesh>
      {/* three red identification lamps centered on the header, and the
          licence plate on the sill */}
      {[-0.07, 0, 0.07].map((z) => (
        <MarkerLamp key={z} position={[frameX, 0.571, z]} rotation={[0, -Math.PI / 2, 0]} lens={RED_LENS} size={[0.04, 0.022]} />
      ))}
      <mesh position={[frameX - 0.003, -0.596, 0]}>
        <boxGeometry args={[0.006, 0.045, 0.085]} />
        <meshPhysicalMaterial color="#e4e6ea" metalness={0.1} roughness={0.5} />
      </mesh>
      {/* full-width rear conspicuity tape across the bottom of the doors,
          below the rear panel's edge */}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[doorFaceX - 0.001, -0.535, -0.42 + i * 0.14]} rotation-y={-Math.PI / 2}>
          <planeGeometry args={[0.12, 0.045]} />
          <meshPhysicalMaterial {...(i % 2 ? TAPE_WHITE : TAPE_RED)} side={2} />
        </mesh>
      ))}

      {/* ICC under-ride guard: the bar a car's bumper meets, hung on two
          uprights from the sill with braces back to the frame, tape on its face */}
      <mesh position={[guardX, guardY, 0]}>
        <boxGeometry args={[0.045, 0.045, guard.halfWidth * 2]} />
        <meshPhysicalMaterial {...STEEL} />
      </mesh>
      {([1, -1] as const).map((s) => (
        <group key={s}>
          <mesh position={[guardX, (guardY + rearBottom) / 2, s * guard.uprights]}>
            <boxGeometry args={[0.045, rearBottom - guardY, 0.045]} />
            <meshPhysicalMaterial {...STEEL} />
          </mesh>
          <Bar from={[guardX, guardY + 0.015, s * guard.uprights]} to={[-2.93, -0.635, s * guard.uprights]} section={0.03} finish={STEEL} />
        </group>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[guardX - 0.0235, guardY, -0.4 + i * 0.16]} rotation-y={-Math.PI / 2}>
          <planeGeometry args={[0.13, 0.04]} />
          <meshPhysicalMaterial {...(i % 2 ? TAPE_WHITE : TAPE_RED)} side={2} />
        </mesh>
      ))}

      {/* underframe: crossmembers on 12" centres, the upper coupler plate and
          kingpin at the front, the air tank, and the slider box the
          suspension hangs from at the rear */}
      <Crossmembers count={48} pitch={0.1345} y={floorY - 0.0225} size={[0.032, 0.045, body.width - 0.03]} />
      <mesh position={[2.72, floorY - 0.051, 0]}>
        <boxGeometry args={[0.85, 0.012, 0.86]} />
        <meshPhysicalMaterial {...STEEL} />
      </mesh>
      {/* the 2" kingpin under its flange - what the fifth wheel locks onto */}
      <mesh position={[2.88, floorY - 0.061, 0]}>
        <cylinderGeometry args={[0.024, 0.024, 0.008, 16]} />
        <meshPhysicalMaterial {...GALV} />
      </mesh>
      <mesh position={[2.88, floorY - 0.083, 0]}>
        <cylinderGeometry args={[0.0102, 0.0102, 0.04, 12]} />
        <meshPhysicalMaterial {...GALV} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[-1.25, -0.71, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.6, 18]} />
        <meshPhysicalMaterial {...GALV} />
      </mesh>
      {([1, -1] as const).map((s) => (
        <mesh key={s} position={[-2.28, -0.6585, s * 0.19]}>
          <boxGeometry args={[1.45, 0.06, 0.05]} />
          <meshPhysicalMaterial {...FRAME} />
        </mesh>
      ))}
      {[-1.575, -2.985].map((x) => (
        <mesh key={x} position={[x, -0.6585, 0]}>
          <boxGeometry args={[0.05, 0.06, 0.43]} />
          <meshPhysicalMaterial {...FRAME} />
        </mesh>
      ))}

      {/* tandem air-ride axles: each axle tube carries a brake drum and air
          chamber per side, hangs from the slider on a trailing arm and rides
          on an air spring behind the axle; dual wheels on the shared road
          wheel, the inner one dished inward like a real dual */}
      {wheels.axles.map((x) => (
        <group key={x}>
          <mesh rotation-x={Math.PI / 2} position={[x, wheels.centerY, 0]}>
            <cylinderGeometry args={[0.026, 0.026, body.width - 0.15, 12]} />
            <meshPhysicalMaterial {...FRAME} />
          </mesh>
          {([1, -1] as const).map((s) => (
            <React.Fragment key={s}>
              <mesh rotation-x={Math.PI / 2} position={[x, wheels.centerY, s * 0.324]}>
                <cylinderGeometry args={[0.085, 0.085, 0.36, 20]} />
                <meshPhysicalMaterial color="#26282d" metalness={0.4} roughness={0.7} />
              </mesh>
              <mesh rotation-z={Math.PI / 2} position={[x + 0.13, wheels.centerY + 0.04, s * 0.15]}>
                <cylinderGeometry args={[0.038, 0.038, 0.09, 14]} />
                <meshPhysicalMaterial {...FRAME} />
              </mesh>
              <mesh position={[x + 0.21, -0.7435, s * 0.19]}>
                <boxGeometry args={[0.05, 0.11, 0.045]} />
                <meshPhysicalMaterial {...FRAME} />
              </mesh>
              <Bar from={[x + 0.21, -0.8, s * 0.19]} to={[x - 0.2, -0.85, s * 0.19]} section={0.045} finish={FRAME} />
              <mesh position={[x - 0.18, -0.7635, s * 0.19]}>
                <cylinderGeometry args={[0.055, 0.055, 0.15, 16]} />
                <meshPhysicalMaterial {...RUBBER} />
              </mesh>
              <RoadWheel
                radius={wheels.radius}
                width={wheels.width}
                face={s}
                lugs={10}
                rimRatio={wheels.rimRatio}
                position={[x, wheels.centerY, s * dualOuterZ]}
              />
              <RoadWheel
                radius={wheels.radius}
                width={wheels.width}
                face={s === 1 ? -1 : 1}
                lugs={10}
                rimRatio={wheels.rimRatio}
                rimColor="#3c4046"
                position={[x, wheels.centerY, s * dualInnerZ]}
              />
            </React.Fragment>
          ))}
        </group>
      ))}
      {/* mud flaps behind the rear axle, on a hanger bar off the slider */}
      {([1, -1] as const).map((s) => (
        <group key={s} position={[wheels.axles[1] - 0.32, 0, s * dualMidZ]}>
          <mesh position={[0, -0.695, 0]}>
            <boxGeometry args={[0.03, 0.02, 0.32]} />
            <meshPhysicalMaterial {...GALV} />
          </mesh>
          <mesh position={[0, -0.845, 0]}>
            <boxGeometry args={[0.008, 0.28, 0.29]} />
            <meshPhysicalMaterial {...RUBBER} />
          </mesh>
        </group>
      ))}

      {/* landing gear: mounting brackets under the floor, two-stage legs on
          sand shoes, the cross shaft and brace between them, diagonal braces
          back to the frame, and the crank stowed on the curb side */}
      {([1, -1] as const).map((s) => (
        <group key={s} position={[landingGear.x, 0, s * landingGear.spread]}>
          <mesh position={[0, floorY - 0.075, 0]}>
            <boxGeometry args={[0.13, 0.06, 0.075]} />
            <meshPhysicalMaterial {...FRAME} />
          </mesh>
          <mesh position={[0, -0.7885, 0]}>
            <boxGeometry args={[0.058, 0.2, 0.058]} />
            <meshPhysicalMaterial {...GALV} />
          </mesh>
          <mesh position={[0, -0.955, 0]}>
            <boxGeometry args={[0.044, 0.19, 0.044]} />
            <meshPhysicalMaterial {...GALV} />
          </mesh>
          <mesh position={[0, groundY + 0.01, 0]}>
            <boxGeometry args={[0.095, 0.02, 0.15]} />
            <meshPhysicalMaterial {...GALV} />
          </mesh>
          <Bar from={[0, -0.88, 0]} to={[-0.6, -0.64, 0]} section={0.028} finish={FRAME} />
        </group>
      ))}
      <mesh rotation-x={Math.PI / 2} position={[landingGear.x, -0.76, 0]}>
        <cylinderGeometry args={[0.014, 0.014, landingGear.spread * 2, 10]} />
        <meshPhysicalMaterial {...GALV} />
      </mesh>
      <mesh position={[landingGear.x, -0.88, 0]}>
        <boxGeometry args={[0.03, 0.03, landingGear.spread * 2]} />
        <meshPhysicalMaterial {...FRAME} />
      </mesh>
      <group position={[landingGear.x, -0.76, landingGear.spread]}>
        <mesh rotation-x={Math.PI / 2} position={[0, 0, 0.11]}>
          <cylinderGeometry args={[0.01, 0.01, 0.16, 8]} />
          <meshPhysicalMaterial {...GALV} />
        </mesh>
        <mesh position={[0, -0.075, 0.18]}>
          <boxGeometry args={[0.016, 0.15, 0.016]} />
          <meshPhysicalMaterial {...GALV} />
        </mesh>
        <mesh rotation-x={Math.PI / 2} position={[0, -0.15, 0.215]}>
          <cylinderGeometry args={[0.008, 0.008, 0.07, 8]} />
          <meshPhysicalMaterial {...FRAME} />
        </mesh>
      </group>

      {/* aero side skirts: thin composite panels hinged just under the
          bottom rail and tilted slightly inward, on diagonal struts up to the
          crossmembers. Paintable separately from the box */}
      {([1, -1] as const).map((s) => (
        <group key={s}>
          <group position={[0, skirt.top, s * (hw - 0.0075)]} rotation-x={s * skirt.tilt}>
            <mesh geometry={skirtGeometry}>
              <meshPhysicalMaterial color={skirtColor ?? color} metalness={0.3} roughness={0.5} />
            </mesh>
          </group>
          {[-1.35, -0.65, 0.05, 0.75, 1.3].map((x) => (
            <Bar key={x} from={[x, -0.8, s * 0.486]} to={[x, -0.638, s * 0.34]} section={0.022} finish={GALV} />
          ))}
        </group>
      ))}

      {/* the live wraps: both smooth sides and the rear doors */}
      <DeviceScreen
        {...resolveSurface(regions.curbSide, { ...surfaceDefaults, resolution })}
        width={side.width}
        height={side.height}
        radius={side.radius}
        position={[0, 0.02, body.width / 2 + 0.006]}
      >
        {regions.curbSide?.children}
      </DeviceScreen>
      {regions.streetSide != null && (
        <DeviceScreen
          {...resolveSurface(regions.streetSide, { ...surfaceDefaults, resolution })}
          width={side.width}
          height={side.height}
          radius={side.radius}
          position={[0, 0.02, -body.width / 2 - 0.006]}
          rotation={[0, Math.PI, 0]}
        >
          {regions.streetSide.children}
        </DeviceScreen>
      )}
      {regions.rear != null && (
        <DeviceScreen
          {...resolveSurface(regions.rear, {
            ...surfaceDefaults,
            // the rear panel shares the side panel's dpi
            resolution: Math.round(resolution * (rearSpec.width / side.width)),
          })}
          width={rearSpec.width}
          height={rearSpec.height}
          radius={rearSpec.radius}
          position={[-body.length / 2 - 0.03, 0.02, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          // the lock rods are real geometry in front of the panel now; the
          // DOM only carries the seam where the wrap splits across the two doors
          overlay={
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 'calc(50% - 1px)',
                width: 2,
                pointerEvents: 'none',
                zIndex: 2147483647,
                background: 'rgba(18,20,24,0.6)',
              }}
            />
          }
        >
          {regions.rear.children}
        </DeviceScreen>
      )}
    </group>
  )
}
SemiTrailerImpl.displayName = 'SemiTrailer'

/** The trailer's compound slots, shared by `<SemiTrailer>` and `<SemiTrailerMockup>`. */
export const semiTrailerSlots = createSlots(SEMI_TRAILER_REGIONS)

export const SemiTrailer = Object.assign(SemiTrailerImpl, semiTrailerSlots)
