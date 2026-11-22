import * as React from 'react'
import * as THREE from 'three'
import type { ThreeElements } from '@react-three/fiber'
import {
  FIBRE,
  POSTER_FRAME,
  POSTER_FRAME_REGIONS,
  createSurfaceSheenMaterial,
  grainMap,
  grainNormal,
  posterFrameSpec,
  type PosterFrameSize,
  roundedRectShape,
  smoothShaded,
} from '../../core'
import { DeviceScreen } from '../../screen/device-screen'
import { collectSlots, createSlots, resolveSurface, type SurfaceProps } from '../../slots'

type GroupProps = ThreeElements['group']

export interface PosterFrameProps extends Omit<GroupProps, 'children' | 'color'>, SurfaceProps {
  /**
   * Poster art - any React node. It fills the visible opening, full bleed;
   * wrap in `<PosterFrame.Poster>` to set per-surface props.
   */
  children?: React.ReactNode
  /**
   * Physical sheet size in millimeters, e.g. `{ width: 610, height: 914 }`
   * for 24" x 36" or `{ width: 594, height: 841 }` for A1. Defaults to the
   * 457 x 610 mm (18" x 24") poster.
   */
  size?: PosterFrameSize
  /** Frame molding color. */
  color?: string
  /**
   * Mount the art behind a 2.5" gallery matboard instead of full bleed:
   * `true` for the default off-white board, or a CSS color for the board in
   * that stock (`mat="#1d1f24"` for a dark mount).
   */
  mat?: boolean | string
  /** Simulated glazing: physically-lit studio reflections across the acrylic pane. */
  glazing?: boolean
}

/**
 * Build a 45° beveled gallery mat inner collar sloping from the raised mat
 * face down to the artwork window: the bright white conservation-board core
 * revealed by a bevel cutter is the signature visual cue of a framed mat.
 */
function matBevelGeometry(
  innerW: number,
  innerH: number,
  bevelW: number,
  depth: number
): THREE.BufferGeometry {
  const hw0 = innerW / 2
  const hh0 = innerH / 2
  const hw1 = hw0 + bevelW
  const hh1 = hh0 + bevelW
  // 4 mitered trapezoidal slopes around the opening (inner edges at z=0, outer at z=depth)
  const corners0: [number, number][] = [
    [-hw0, -hh0],
    [hw0, -hh0],
    [hw0, hh0],
    [-hw0, hh0],
  ]
  const corners1: [number, number][] = [
    [-hw1, -hh1],
    [hw1, -hh1],
    [hw1, hh1],
    [-hw1, hh1],
  ]
  const positions: number[] = []
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4
    const [x0a, y0a] = corners0[i]!
    const [x0b, y0b] = corners0[j]!
    const [x1a, y1a] = corners1[i]!
    const [x1b, y1b] = corners1[j]!
    // Two triangles per trapezoid, wound counter-clockwise when viewed from +Z
    // so normals point forward (+Z) and inward toward the artwork opening
    positions.push(
      x1a, y1a, depth, x0b, y0b, 0, x0a, y0a, 0,
      x1a, y1a, depth, x1b, y1b, depth, x0b, y0b, 0
    )
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.computeVertexNormals()
  return geometry
}

/**
 * Build a real toothed zinc sawtooth picture hanger profile: flat mounting
 * wings at left and right for the tacks, with serrated V-teeth along the
 * central hanging arch.
 */
function sawtoothHangerGeometry(width: number, height: number, thickness: number): THREE.BufferGeometry {
  const hw = width / 2
  const hh = height / 2
  const teeth = 5
  const notchSpan = width * 0.56
  const notchX0 = -notchSpan / 2
  const toothW = notchSpan / teeth
  const toothH = height * 0.42
  const shape = new THREE.Shape()
  shape.moveTo(-hw, -hh)
  shape.lineTo(notchX0, -hh)
  // Serrated V-teeth along the central nail-catch underside
  for (let i = 0; i < teeth; i++) {
    const x0 = notchX0 + i * toothW
    shape.lineTo(x0 + toothW * 0.5, -hh + toothH)
    shape.lineTo(x0 + toothW, -hh)
  }
  shape.lineTo(hw, -hh)
  shape.lineTo(hw, hh * 0.5)
  shape.lineTo(notchSpan / 2 + 0.015, hh * 0.5)
  shape.lineTo(notchSpan / 2, hh)
  shape.lineTo(-notchSpan / 2, hh)
  shape.lineTo(-notchSpan / 2 - 0.015, hh * 0.5)
  shape.lineTo(-hw, hh * 0.5)
  shape.closePath()
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: thickness * 0.18,
    bevelSize: thickness * 0.14,
    bevelSegments: 1,
  })
  g.translate(0, 0, -thickness / 2)
  return g
}

/**
 * A procedurally built gallery poster frame: a smooth-beveled extruded molding
 * whose rabbet lip overlaps the sheet edge like a real frame, a shallowly
 * recessed live 18" x 24" poster behind physically-lit acrylic glazing, an
 * optional 45° white-core beveled gallery matboard, and a kraft dust cover
 * framed by the rear rails with a real toothed sawtooth hanger, brass tacks,
 * corner retaining clips, and felt wall bumpers. No 3D asset files are loaded.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 *
 * ```tsx
 * <PosterFrame color="#22262e">
 *   <PosterFrame.Poster><YourPosterArt /></PosterFrame.Poster>
 * </PosterFrame>
 * ```
 */
function PosterFrameImpl({
  children,
  size,
  color = '#22262e',
  mat = false,
  glazing = true,
  surfaceBackground = '#ffffff',
  resolution = POSTER_FRAME.resolution,
  surfaceStyle,
  ...groupProps
}: PosterFrameProps) {
  const posterSlot = collectSlots(children, POSTER_FRAME_REGIONS).poster
  const { poster, opening, frame, recess, matWidth, hanger, bumper } = React.useMemo(
    () => (size ? posterFrameSpec(size) : POSTER_FRAME),
    [size?.width, size?.height]
  )

  const outerWidth = poster.width + frame.width * 2
  const outerHeight = poster.height + frame.width * 2
  // `mat` answers both questions the board raises - whether there is one, and
  // what stock it is cut from - so the boolean and the color come off it here
  // and nothing downstream has to know it was ever one prop or two.
  const matted = mat !== false
  const matColor = typeof mat === 'string' ? mat : '#f6f3ec'

  // with a mat, the live art shrinks to the mat window
  const art = matted
    ? { width: opening.width - matWidth * 2, height: opening.height - matWidth * 2 }
    : { width: opening.width, height: opening.height }

  const matDepth = 0.014
  const matBevelW = 0.014

  const frameGeometry = React.useMemo(() => {
    const shape = roundedRectShape(
      outerWidth - frame.bevel * 2,
      outerHeight - frame.bevel * 2,
      frame.radius - frame.bevel
    )
    // the through-hole is the visible opening - the rabbet lip overlaps the sheet
    shape.holes.push(roundedRectShape(opening.width, opening.height, opening.radius))
    const depth = frame.depth - frame.bevel * 2
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: frame.bevel,
      bevelSize: frame.bevel,
      bevelSegments: 3,
      curveSegments: 12,
    })
    geometry.translate(0, 0, -depth / 2)
    return smoothShaded(geometry)
  }, [outerWidth, outerHeight, frame, opening])

  const backingGeometry = React.useMemo(
    () => new THREE.ShapeGeometry(roundedRectShape(poster.width, poster.height, poster.radius), 8),
    [poster]
  )

  const matGeometry = React.useMemo(() => {
    if (!matted) return null
    const shape = roundedRectShape(poster.width - 0.01, poster.height - 0.01, poster.radius)
    // Cut the outer mat face slightly wider than the art opening so the 45°
    // white-core bevel slopes visibly down to the artwork edge.
    shape.holes.push(roundedRectShape(art.width + matBevelW * 2, art.height + matBevelW * 2, 0.002))
    return new THREE.ShapeGeometry(shape, 8)
  }, [matted, poster, art.width, art.height])

  const matCoreBevelGeometry = React.useMemo(
    () => (matted ? matBevelGeometry(art.width, art.height, matBevelW, matDepth) : null),
    [matted, art.width, art.height]
  )

  // Dust cover inset slightly inside the rear molding rail so the frame border
  // reads cleanly around the kraft backing sheet.
  const dustCoverInset = frame.width * 0.45
  const dustCoverGeometry = React.useMemo(
    () =>
      new THREE.ShapeGeometry(
        roundedRectShape(outerWidth - dustCoverInset * 2, outerHeight - dustCoverInset * 2, Math.max(0.004, frame.radius * 0.5)),
        8
      ),
    [outerWidth, outerHeight, dustCoverInset, frame.radius]
  )

  const glazingGeometry = React.useMemo(
    () =>
      new THREE.ShapeGeometry(
        roundedRectShape(opening.width + 0.004, opening.height + 0.004, opening.radius),
        8
      ),
    [opening]
  )

  const sawtoothGeometry = React.useMemo(
    () => sawtoothHangerGeometry(hanger.width * 1.15, hanger.height * 1.25, hanger.thickness),
    [hanger]
  )

  // Physically-lit Fresnel reflection over the clear acrylic glazing: moves
  // smoothly with the studio lights as the camera orbits.
  const glazingSheen = React.useMemo(
    () => createSurfaceSheenMaterial({ roughness: 0.05, envMapIntensity: 0.95 }),
    []
  )

  React.useEffect(() => {
    return () => {
      frameGeometry.dispose()
      backingGeometry.dispose()
      matGeometry?.dispose()
      matCoreBevelGeometry?.dispose()
      dustCoverGeometry.dispose()
      glazingGeometry.dispose()
      sawtoothGeometry.dispose()
      glazingSheen.dispose()
    }
  }, [
    frameGeometry,
    backingGeometry,
    matGeometry,
    matCoreBevelGeometry,
    dustCoverGeometry,
    glazingGeometry,
    sawtoothGeometry,
    glazingSheen,
  ])

  const sheetZ = frame.depth / 2 - recess
  const backZ = -frame.depth / 2

  return (
    <group {...groupProps}>
      {/* smooth-beveled molding with a true through-hole and overlapping rabbet lip */}
      <mesh geometry={frameGeometry}>
        <meshPhysicalMaterial
          color={color}
          metalness={0.14}
          roughness={0.4}
          clearcoat={0.42}
          clearcoatRoughness={0.3}
        />
      </mesh>

      {/* the sheet/backing continuing behind the lip */}
      <mesh geometry={backingGeometry} position-z={sheetZ - 0.008}>
        <meshPhysicalMaterial color="#f4f2ec" metalness={0} roughness={0.9} />
      </mesh>

      {/* optional gallery matboard: raised conservation board with a crisp 45°
          white-core bevel cut framing the recessed artwork window */}
      {matGeometry && matCoreBevelGeometry && (
        <group position-z={sheetZ + 0.0005}>
          <mesh geometry={matGeometry} position-z={matDepth}>
            <meshPhysicalMaterial
              color={matColor}
              metalness={0}
              roughness={0.94}
              normalMap={grainNormal(FIBRE, 2.2)}
              normalScale={0.16}
            />
          </mesh>
          <mesh geometry={matCoreBevelGeometry}>
            <meshPhysicalMaterial color="#fbf9f3" metalness={0} roughness={0.88} />
          </mesh>
        </group>
      )}

      {/* clear acrylic glazing: physically-lit Fresnel reflections moving across
          both the art and matboard as you orbit */}
      {glazing && (
        <mesh
          geometry={glazingGeometry}
          material={glazingSheen}
          position-z={frame.depth / 2 - 0.005}
        />
      )}

      {/* kraft dust cover inset cleanly inside the rear molding rails */}
      <mesh geometry={dustCoverGeometry} rotation-y={Math.PI} position-z={backZ - 0.005}>
        <meshPhysicalMaterial
          color="#8d7c62"
          metalness={0}
          roughness={0.95}
          map={grainMap(FIBRE, 1.5)}
          normalMap={grainNormal(FIBRE, 1.5)}
          normalScale={0.28}
        />
      </mesh>

      {/* real toothed zinc sawtooth hanger with two domed brass tacks on the top rail */}
      <group position={[0, outerHeight / 2 - frame.width / 2, backZ - hanger.thickness / 2 - 0.005]}>
        <mesh geometry={sawtoothGeometry}>
          <meshPhysicalMaterial color="#b9bcc0" metalness={0.88} roughness={0.34} />
        </mesh>
        {([1, -1] as const).map((s) => (
          <mesh
            key={s}
            rotation-x={Math.PI / 2}
            position={[s * (hanger.width * 0.44), 0, -hanger.thickness * 0.55]}
          >
            <cylinderGeometry args={[0.011, 0.013, 0.008, 12]} />
            <meshPhysicalMaterial color="#c9a556" metalness={0.86} roughness={0.28} />
          </mesh>
        ))}
      </group>

      {/* framer's corner splines / turn-retainers on the upper corners + felt
          wall bumpers in the bottom corners */}
      {([1, -1] as const).map((side) => (
        <React.Fragment key={side}>
          {/* bottom felt wall bumpers */}
          <mesh
            rotation-x={Math.PI / 2}
            position={[
              side * (outerWidth / 2 - frame.width / 2),
              -outerHeight / 2 + frame.width / 2,
              backZ - bumper.thickness / 2 - 0.004,
            ]}
          >
            <cylinderGeometry args={[bumper.radius, bumper.radius * 1.06, bumper.thickness, 20]} />
            <meshPhysicalMaterial color="#27282b" metalness={0} roughness={0.96} />
          </mesh>
          {/* subtle corner steel spline cleats near upper rail joints */}
          <mesh
            position={[
              side * (outerWidth / 2 - frame.width * 0.65),
              outerHeight / 2 - frame.width * 0.65,
              backZ - 0.006,
            ]}
            rotation-z={side * (Math.PI / 4)}
          >
            <boxGeometry args={[frame.width * 0.55, 0.018, 0.004]} />
            <meshPhysicalMaterial color="#46494f" metalness={0.75} roughness={0.42} />
          </mesh>
        </React.Fragment>
      ))}

      {/* the live art: real DOM, CSS3D-transformed onto the recessed sheet */}
      <DeviceScreen
        width={art.width}
        height={art.height}
        radius={matted ? 0.002 : opening.radius}
        position={[0, 0, sheetZ]}
        {...resolveSurface(posterSlot, {
          surfaceBackground,
          resolution,
          surfaceStyle,
        })}
      >
        {posterSlot?.children}
      </DeviceScreen>
    </group>
  )
}
PosterFrameImpl.displayName = 'PosterFrame'

/** The frame's compound slots, shared by `<PosterFrame>` and `<PosterFrameMockup>`. */
export const posterFrameSlots = createSlots(POSTER_FRAME_REGIONS)

export const PosterFrame = Object.assign(PosterFrameImpl, posterFrameSlots)
