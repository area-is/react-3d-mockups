import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import {
  MILK_CARTON,
  MILK_CARTON_REGIONS,
  gearShape,
  milkCartonLayout,
  roundedRectShape,
  type MilkCartonSizeMm,
} from '../../core'
import { DeviceScreen } from '../../screen/device-screen'
import { collectSlots, createSlots, resolveSurface, type SurfaceProps } from '../../slots'

type GroupProps = ThreeElements['group']

export interface MilkCartonProps extends Omit<GroupProps, 'children' | 'color'>, SurfaceProps {
  /**
   * Panel designs, full bleed. Bare children fill the front panel; name the
   * others with `<MilkCarton.Back>`, `<MilkCarton.Right>`,
   * `<MilkCarton.Left>` and the two roof panels,
   * `<MilkCarton.GableFront>` / `<MilkCarton.GableBack>`.
   */
  children?: React.ReactNode
  /**
   * Carton size in real millimeters: `{ width, height, depth }`, where
   * `height` is the overall height with the roof and fin included. The
   * longest edge normalizes to the stage, so any size fills the default
   * camera while the mm dimensions set the true proportions. Defaults to the
   * 95×241×95 mm US half-gallon carton.
   */
  size?: MilkCartonSizeMm
  /** Board color. Poly-coated white by default; try a brand dip or kraft. */
  color?: string
  /** Screw cap color. */
  capColor?: string
  /** Render the screw cap on the front roof panel. */
  cap?: boolean
}

type V3 = [number, number, number]

/**
 * A procedurally built gable-top beverage carton: poly-coated board walls, the
 * roof folding up to a ridge, an ear fold pinching each end inward the way the
 * excess board really folds, the sealed fin standing on top, and a screw cap on
 * the front roof panel. Every wall is live DOM, and so are both roof panels -
 * the cap rides over the front one exactly like a real spout rides over the
 * print. No 3D asset files are loaded.
 *
 * Board is the thing to get right. A carton is one sheet creased on rules and
 * folded, and every edge on it is a fold - which is never a knife edge but a
 * small radius of bent board. So the walls' corners are rounded, the eave
 * where the roof leaves the wall is a fillet rather than a crease line, the
 * ridge runs out onto a flat the fin stands on, and the fin itself is four
 * plies thick with a pressed round top and a knuckle at each end where the
 * ears fold into it. The first pass here had all of those as single planes
 * meeting at lines, and it read as a paper model of a carton rather than the
 * carton.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 *
 * ```tsx
 * <MilkCarton>
 *   <YourFrontPanel />
 *   <MilkCarton.Right><NutritionPanel /></MilkCarton.Right>
 * </MilkCarton>
 * ```
 */
function MilkCartonImpl({
  children,
  size,
  color = '#f4f3ef',
  capColor = '#d7dbdf',
  cap = true,
  surfaceBackground = '#ffffff',
  resolution = MILK_CARTON.resolution,
  surfaceStyle,
  ...groupProps
}: MilkCartonProps) {
  const regions = collectSlots(children, MILK_CARTON_REGIONS)
  const { body, gable, fin, cap: capSize, height } = React.useMemo(
    () => milkCartonLayout(size),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size?.width, size?.height, size?.depth]
  )

  // The carton is centered on its own group, so the walls run from the base up
  // to the eave and the roof takes it the rest of the way to the fin's top.
  const base = -height / 2
  const eave = base + body.height
  const top = base + height
  /*
   * The roof panel's pose, from the triangle it spans: it leans back from
   * vertical by `tilt`, and its outward normal (0, normalY, normalZ) is that
   * same triangle's other leg. Both come from the spec's slant rather than
   * from a hand-tuned angle, so a carton of any proportion keeps its roof
   * panels, its cap and its live surfaces on the same plane.
   */
  const tilt = Math.atan2(body.depth / 2, gable.rise)
  const normalY = body.depth / 2 / gable.slant
  const normalZ = gable.rise / gable.slant

  /*
   * The roof profile, front to back, in the (z, y) plane.
   *
   * The slope is not a line drawn from the eave: the eave is a FOLD, so the
   * roof leaves the wall on a fillet of the board's own fold radius - tangent
   * to the wall at the eave, tangent to the slope a little way up. The slope
   * is the tangent to that arc at the roof's pitch, which lifts the ridge by a
   * hair over where a sharp crease would have put it; the fin absorbs that so
   * the carton stays exactly as tall as the spec says.
   *
   * Everything up here is a function of z alone, which is what lets the roof
   * loft in strips.
   */
  const hw = body.width / 2
  const hd = body.depth / 2
  const crease = gable.crease
  /** The corner fold, never wide enough to eat the slope it rounds. */
  const fold = Math.min(body.radius, hw / 2, (hd - crease) / 2)
  const pitch = gable.rise / hd
  const along = Math.hypot(1, pitch)
  /** Where the eave fillet hands over to the straight slope. */
  const filletEndZ = hd - fold + (fold * pitch) / along
  const filletEndY = eave + fold / along
  const heightAt = React.useCallback(
    (z: number): number => {
      const az = Math.abs(z)
      if (az >= filletEndZ) {
        // On the fillet: the upper arc of the circle sat on the eave, inside
        // the corner, that the wall and the slope are both tangent to.
        const dz = az - (hd - fold)
        return eave + Math.sqrt(Math.max(0, fold * fold - dz * dz))
      }
      return filletEndY + (filletEndZ - Math.max(az, crease)) * pitch
    },
    [hd, fold, eave, filletEndZ, filletEndY, crease, pitch]
  )
  /** Height of the ridge flat, where the fin stands. */
  const apex = heightAt(crease)
  /** The fin makes up whatever the roof left between the flat and the top. */
  const finHeight = Math.max(top - apex, fin.height * 0.5)

  /*
   * The closed roof, as one buffer wound outward: the two slopes lofted in
   * strips across the width, a wall of board at each rounded corner from the
   * eave up to wherever the slope has climbed to, and an ear fold closing each
   * end. The carton is solid, so nothing needs a back face.
   *
   * The ear folds are why an end is not a flat triangle. The side panel
   * carries its full depth up past the eave while the roof narrows toward the
   * ridge, and the excess board has to go somewhere: it creases down the
   * middle and folds INWARD. The crease starts flush with the wall at the eave
   * midpoint, dives in as it rises, is deepest just under the fin
   * (`gable.tuckAt`, where the two halves close on each other), and is pinched
   * flat into the fin's root. Modelling that crease as a LINE with two
   * stations on it - rather than a single point every triangle fanned to - is
   * what makes the end read as an inverted V of folded board with two wings
   * either side, instead of a cone punched into the carton.
   */
  const roofGeometry = React.useMemo(() => {
    const positions: number[] = []
    const push = (...vs: V3[]) => {
      for (const v of vs) positions.push(...v)
    }
    /** One triangle, wound outward: the far side of a pair mirrors across z or x. */
    const tri = (flip: boolean, p: V3, q: V3, r: V3) => (flip ? push(p, r, q) : push(p, q, r))

    /*
     * The corner fold in plan, sampled from the front face round to the side
     * face: `z` walking in from the outer face, `x` walking out to the full
     * width. Sampled finely enough that the eave fillet - which lives in the
     * same band of z - comes out as an arc rather than a chamfer.
     */
    const CORNER_STEPS = 9
    const arc = Array.from({ length: CORNER_STEPS + 1 }, (_, i) => {
      const angle = (i / CORNER_STEPS) * (Math.PI / 2)
      return { z: hd - fold + fold * Math.cos(angle), x: hw - fold + fold * Math.sin(angle) }
    })

    // The top surface, lofted between stations in z: each station is a
    // horizontal line at that z, so a strip is one quad however the footprint
    // narrows underneath it.
    const stations: { z: number; x: number }[] = [
      ...arc,
      { z: crease, x: hw },
      { z: -crease, x: hw },
      ...arc.map(({ z, x }) => ({ z: -z, x })).reverse(),
    ]
    for (let i = 0; i < stations.length - 1; i++) {
      const near = stations[i]!
      const far = stations[i + 1]!
      const nearY = heightAt(near.z)
      const farY = heightAt(far.z)
      tri(false, [-near.x, nearY, near.z], [near.x, nearY, near.z], [far.x, farY, far.z])
      tri(false, [-near.x, nearY, near.z], [far.x, farY, far.z], [-far.x, farY, far.z])
    }

    // The four corner walls, from the eave up to the slope above - full height
    // where they meet the side face, nothing where they meet the front, which
    // is where the fillet has come back down to the eave.
    for (const sx of [1, -1] as const) {
      for (const sz of [1, -1] as const) {
        for (let i = 0; i < arc.length - 1; i++) {
          const a = arc[i]!
          const b = arc[i + 1]!
          const foot = (p: { x: number; z: number }): V3 => [sx * p.x, eave, sz * p.z]
          const crown = (p: { x: number; z: number }): V3 => [sx * p.x, heightAt(p.z), sz * p.z]
          const flip = sx * sz < 0
          tri(flip, foot(a), foot(b), crown(b))
          tri(flip, foot(a), crown(b), crown(a))
        }
      }
    }

    for (const s of [1, -1] as const) {
      const e = hd - fold
      const shoulder = heightAt(e)
      const wall = s * hw
      // The rim of the opening the ear closes, walked in one direction so
      // every face comes out wound the same way.
      const A: V3 = [wall, eave, e]
      const M: V3 = [wall, eave, 0]
      const B: V3 = [wall, eave, -e]
      const Bs: V3 = [wall, shoulder, -e]
      const Bt: V3 = [wall, apex, -crease]
      const At: V3 = [wall, apex, crease]
      const As: V3 = [wall, shoulder, e]
      // The crease line, dived into the carton: shallow low down, deepest just
      // under the fin, where the two halves of the ear close on each other.
      const low: V3 = [s * (hw - gable.tuck * 0.45), eave + gable.rise * 0.38, 0]
      const peak: V3 = [s * (hw - gable.tuck), eave + gable.rise * gable.tuckAt, 0]
      const flip = s === -1
      // the bottom of the V, dying out flush at the eave
      tri(flip, A, M, low)
      tri(flip, M, B, low)
      // the two wings, each a folded quad between a rim edge and the crease
      tri(flip, B, Bs, peak)
      tri(flip, B, peak, low)
      tri(flip, As, A, low)
      tri(flip, As, low, peak)
      // the upper wings, running up the slope edges to the fin's root
      tri(flip, Bs, Bt, peak)
      tri(flip, At, As, peak)
      // the pinch itself, closed into the fin
      tri(flip, Bt, At, peak)
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    // A planar projection is all the paper grain needs: it is noise, so a
    // seam where the projection turns a corner is invisible.
    const uvs: number[] = []
    for (let i = 0; i < positions.length; i += 3) {
      uvs.push(positions[i]! * 2 + positions[i + 2]! * 2, positions[i + 1]! * 2)
    }
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geometry.computeVertexNormals()
    return geometry
  }, [hw, hd, fold, crease, eave, apex, gable.rise, gable.tuck, gable.tuckAt, heightAt])
  React.useEffect(() => () => roofGeometry.dispose(), [roofGeometry])

  /*
   * The walls: the body's rounded rectangle, extruded from the base to the
   * eave. Not a rounded box - that rounds the top and bottom edges too, and
   * the top edge is where the roof's own fillet takes over, so a second
   * rounding there left a groove along the eave. The bottom fold is a scored
   * crease on a real carton and reads right crisp.
   */
  const wallGeometry = React.useMemo(() => {
    const geometry = new THREE.ExtrudeGeometry(roundedRectShape(body.width, body.depth, body.radius), {
      depth: body.height,
      bevelEnabled: false,
      curveSegments: 8,
    })
    // Extruded along +Z; stood upright so the extrusion runs up y.
    geometry.rotateX(-Math.PI / 2)
    geometry.translate(0, base, 0)
    return geometry
  }, [body.width, body.depth, body.radius, body.height, base])
  React.useEffect(() => () => wallGeometry.dispose(), [wallGeometry])

  /*
   * The sealed fin: its profile - four plies thick at the root where the ears
   * fold in, tapering to the sealed top edge, which is pressed round - swept
   * across the carton's width.
   */
  const finGeometry = React.useMemo(() => {
    const t0 = fin.thickness
    const t1 = t0 * fin.taper
    const h = finHeight
    const profile = new THREE.Shape()
    profile.moveTo(-t0 / 2, 0)
    profile.lineTo(t0 / 2, 0)
    profile.lineTo(t1 / 2, h - t1 / 2)
    profile.absarc(0, h - t1 / 2, t1 / 2, 0, Math.PI, false)
    profile.lineTo(-t0 / 2, 0)
    const geometry = new THREE.ExtrudeGeometry(profile, {
      depth: body.width,
      bevelEnabled: false,
      curveSegments: 10,
    })
    // Extruded along +Z; turned so the sweep runs along x and centred.
    geometry.rotateY(Math.PI / 2)
    geometry.translate(-body.width / 2, apex, 0)
    return geometry
  }, [fin.thickness, fin.taper, finHeight, body.width, apex])
  React.useEffect(() => () => finGeometry.dispose(), [finGeometry])

  /*
   * The cap's grip: the same gear profile the watch crown is machined from,
   * extruded down the cap's axis so the ribs run the height of the skirt. A
   * closure is knurled for the same reason a crown is - so a wet hand can
   * turn it - and it is the detail that separates a screw cap from a puck.
   *
   * Extruded along +Z and stood upright by the mesh, because that is the axis
   * ExtrudeGeometry works on.
   */
  const capGeometry = React.useMemo(() => {
    if (!cap) return null
    const skirt = capSize.height - capSize.rim * 2
    return new THREE.ExtrudeGeometry(gearShape(capSize.radius, capSize.flutes, capSize.fluteDepth), {
      depth: Math.max(skirt, capSize.height * 0.2),
      bevelEnabled: false,
    })
  }, [cap, capSize.radius, capSize.flutes, capSize.fluteDepth, capSize.height, capSize.rim])
  React.useEffect(() => () => capGeometry?.dispose(), [capGeometry])

  /*
   * The board's grain: a speck of noise, drawn once into a canvas, used as the
   * roughness map and a whisper of bump. Coated board is not a flat colour -
   * it has the tooth of the paper under the polyethylene, which is what makes
   * a flat wall read as material rather than as a fill. Generated rather than
   * loaded, like everything else here, and deterministic so two cartons match.
   */
  const grain = React.useMemo(() => {
    if (typeof document === 'undefined') return null
    let seed = 7
    const next = () => (seed = (seed * 16807) % 2147483647) / 2147483647
    /** A square of white noise, `lo..hi` grey. */
    const noise = (size: number, lo: number, hi: number) => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      const image = ctx.createImageData(size, size)
      for (let i = 0; i < image.data.length; i += 4) {
        const v = lo + next() * (hi - lo)
        image.data[i] = image.data[i + 1] = image.data[i + 2] = v
        image.data[i + 3] = 255
      }
      ctx.putImageData(image, 0, 0)
      return canvas
    }
    // Two scales, like the real thing: a soft mottle a millimetre or two
    // across - coarse noise blown up with the browser's own bilinear filter -
    // and a faint speckle of tooth over it. Per-texel noise alone is finer
    // than a pixel at any sensible distance and just shimmers.
    const size = 256
    const mottle = noise(48, 176, 255)
    const tooth = noise(size, 0, 255)
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx || !mottle || !tooth) return null
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(mottle, 0, 0, size, size)
    ctx.globalAlpha = 0.12
    ctx.drawImage(tooth, 0, 0)
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    // One tile per world unit - about 55 mm on the stock carton, so the
    // mottle lands at the scale coated board actually shows it.
    texture.repeat.set(1, 1)
    return texture
  }, [])
  React.useEffect(() => () => grain?.dispose(), [grain])

  /*
   * Poly-coated board: matte paper under a thin polyethylene skin. Mostly
   * rough, with a soft sheen rather than a gloss - the first pass had it near
   * a clearcoat, which is a plastic bottle's finish, not a carton's.
   */
  const board = {
    color,
    metalness: 0,
    roughness: 0.62,
    clearcoat: 0.2,
    clearcoatRoughness: 0.55,
    sheen: 0.35,
    sheenRoughness: 0.75,
    sheenColor: new THREE.Color('#ffffff'),
    ...(grain ? { roughnessMap: grain, bumpMap: grain, bumpScale: 0.002 } : {}),
  }
  const plastic = { color: capColor, metalness: 0, roughness: 0.38, clearcoat: 0.55 }

  const panelDefaults = { surfaceBackground, resolution, surfaceStyle }
  const pxPerUnit = resolution / body.width
  // The end panels are as wide as the carton is deep, so they take their own
  // px width at the front panel's dpi rather than the front panel's number.
  const endDefaults = { ...panelDefaults, resolution: Math.round(body.depth * pxPerUnit) }
  const shared = { radius: body.radius }
  // Live surfaces float a hair off the board, clear of z-fighting.
  const LIFT = 0.004
  // The side seam's lap, ~6 mm on the stock carton, and its step, one ply.
  const seamLap = Math.min(body.width * 0.07, height * 0.028)
  const seamPly = LIFT * 0.85

  const knuckleWidth = Math.min(fin.height * 0.6, body.width * 0.12)
  const knuckleThickness = fin.thickness * (1 + fin.knuckle)

  return (
    <group {...groupProps}>
      {/* the walls */}
      <mesh geometry={wallGeometry}>
        <meshPhysicalMaterial {...board} />
      </mesh>

      {/* The side seam: a carton is one blank wrapped round and glued down one
          vertical edge, and the outer ply's edge stands a board's thickness
          proud the whole height of the wall, a few millimetres in from the
          corner. On the back-left edge, where a real one is, so it rides over
          the back print rather than the front - and kept under the live
          panel's lift, so a printed back covers it the way print does. It is
          half a millimetre of step, so it reads as a line, never a bar. */}
      <mesh
        position={[-(hw - body.radius - seamLap / 2), base + body.height / 2, -(hd + seamPly * 0.4)]}
      >
        <boxGeometry args={[seamLap, body.height, seamPly]} />
        <meshPhysicalMaterial {...board} />
      </mesh>

      {/* the folded roof */}
      <mesh geometry={roofGeometry}>
        <meshPhysicalMaterial {...board} />
      </mesh>

      {/* The sealed fin, pinched up from all four panels. */}
      <mesh geometry={finGeometry}>
        <meshPhysicalMaterial {...board} />
      </mesh>

      {/* The seal's root: a bead of folded board where the fin leaves the roof,
          so the fin grows out of the ridge instead of standing on it. */}
      <mesh position={[0, apex + fin.thickness * 0.08, 0]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[fin.thickness * 0.55, fin.thickness * 0.55, body.width, 24]} />
        <meshPhysicalMaterial {...board} />
      </mesh>

      {/* The knuckles: each end of the fin is where an ear's worth of board
          folds in and gets sealed, so the fin is fatter there than in the run
          between - the detail that says the top was folded rather than cut. */}
      {([1, -1] as const).map((s) => (
        <RoundedBox
          key={`knuckle-${s}`}
          args={[knuckleWidth, finHeight * 0.92, knuckleThickness]}
          radius={Math.min(fin.radius, knuckleThickness * 0.4, knuckleWidth * 0.4)}
          steps={1}
          smoothness={4}
          position={[s * (hw - knuckleWidth / 2), apex + (finHeight * 0.92) / 2, 0]}
        >
          <meshPhysicalMaterial {...board} />
        </RoundedBox>
      ))}

      {/* the screw cap, moulded onto the front roof panel. Its collar sits on
          the panel and the cap stands proud of it, so it masks whatever the
          gable panel is printing - the same way it would on a real carton. */}
      {cap && capGeometry && (
        <group
          position={[
            0,
            eave + gable.rise * capSize.offset,
            (body.depth / 2) * (1 - capSize.offset),
          ]}
          // Rotating +Y onto the panel's outward normal stands the cap up off
          // the slant rather than off the floor.
          rotation-x={Math.atan2(gable.rise, body.depth / 2)}
        >
          {/* the moulded base the spout is welded into, a low ring proud of
              the board around the collar's foot */}
          <mesh position={[0, capSize.collar * 0.15, 0]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[capSize.flange * 1.04, capSize.flange * 0.11, 10, 48]} />
            <meshPhysicalMaterial {...plastic} roughness={0.5} />
          </mesh>
          {/* the moulded neck flange the cap screws onto */}
          <mesh position={[0, capSize.collar / 2, 0]}>
            <cylinderGeometry args={[capSize.flange, capSize.flange, capSize.collar, 48]} />
            <meshPhysicalMaterial {...plastic} roughness={0.45} />
          </mesh>
          {/* the smooth band the ribs run out into at the foot of the skirt */}
          <mesh position={[0, capSize.collar + capSize.rim / 2, 0]}>
            <cylinderGeometry args={[capSize.radius, capSize.radius, capSize.rim, 48]} />
            <meshPhysicalMaterial {...plastic} />
          </mesh>
          {/* the ribbed skirt itself */}
          <mesh
            geometry={capGeometry}
            position={[0, capSize.collar + capSize.rim, 0]}
            rotation-x={-Math.PI / 2}
          >
            <meshPhysicalMaterial {...plastic} />
          </mesh>
          {/* the flat top, drawn in a hair over the skirt like a moulded
              closure's, so the ribs end on a shoulder rather than an edge */}
          <mesh position={[0, capSize.collar + capSize.height - capSize.rim / 2, 0]}>
            <cylinderGeometry
              args={[capSize.radius - capSize.fluteDepth, capSize.radius, capSize.rim, 48]}
            />
            <meshPhysicalMaterial {...plastic} roughness={0.3} />
          </mesh>
        </group>
      )}

      {/* live front panel - always mounted, like the other printed packs: the
          front is the face a carton is designed on, so `surfaceBackground`
          answers for it even before there is artwork */}
      <DeviceScreen
        {...shared}
        {...resolveSurface(regions.front, panelDefaults)}
        width={body.width}
        height={body.height}
        position={[0, base + body.height / 2, body.depth / 2 + LIFT]}
      >
        {regions.front?.children}
      </DeviceScreen>

      {/* live back panel */}
      {regions.back != null && (
        <DeviceScreen
          {...shared}
          {...resolveSurface(regions.back, panelDefaults)}
          width={body.width}
          height={body.height}
          position={[0, base + body.height / 2, -body.depth / 2 - LIFT]}
          rotation={[0, Math.PI, 0]}
        >
          {regions.back.children}
        </DeviceScreen>
      )}

      {/* live end panels */}
      {regions.right != null && (
        <DeviceScreen
          {...shared}
          {...resolveSurface(regions.right, endDefaults)}
          width={body.depth}
          height={body.height}
          position={[body.width / 2 + LIFT, base + body.height / 2, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          {regions.right.children}
        </DeviceScreen>
      )}
      {regions.left != null && (
        <DeviceScreen
          {...shared}
          {...resolveSurface(regions.left, endDefaults)}
          width={body.depth}
          height={body.height}
          position={[-body.width / 2 - LIFT, base + body.height / 2, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          {regions.left.children}
        </DeviceScreen>
      )}

      {/* live roof panels. Both are the same surface on the same slant, so the
          back one is the front one seen from the other side: half a turn of
          the group, then the identical local pose. */}
      {([1, -1] as const).map((s) => {
        const slot = s === 1 ? regions.gableFront : regions.gableBack
        if (slot == null) return null
        return (
          <group key={`gable-${s}`} rotation-y={s === 1 ? 0 : Math.PI}>
            <DeviceScreen
              {...shared}
              {...resolveSurface(slot, panelDefaults)}
              width={body.width}
              height={gable.slant}
              position={[
                0,
                eave + gable.rise / 2 + normalY * LIFT,
                body.depth / 4 + normalZ * LIFT,
              ]}
              rotation={[-tilt, 0, 0]}
            >
              {slot.children}
            </DeviceScreen>
          </group>
        )
      })}
    </group>
  )
}
MilkCartonImpl.displayName = 'MilkCarton'

/** The carton's compound slots, shared by `<MilkCarton>` and `<MilkCartonMockup>`. */
export const milkCartonSlots = createSlots(MILK_CARTON_REGIONS)

export const MilkCarton = Object.assign(MilkCartonImpl, milkCartonSlots)
