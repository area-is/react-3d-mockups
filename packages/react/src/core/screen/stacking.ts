import type { BufferGeometry, Camera, Matrix4 } from 'three'
import { Vector3 } from 'three'

/**
 * The order the DOM screens of one scene stack in.
 *
 * Every live surface is DOM under the canvas, shown through a hole its depth
 * mask clears in the canvas. The hole is depth-tested, so it opens only where
 * that surface is the nearest thing - but what shows through it is whichever
 * screen's DOM is on top at that pixel, and DOM stacks by z-index, not by the
 * depth buffer. So wherever two surfaces overlap on screen, the nearer one's
 * DOM has to be the higher.
 *
 * A z-index from each surface's centre distance (what drei does) gets that
 * wrong as soon as surfaces of different sizes overlap: a record sleeve
 * standing behind a milk carton has its centre nearer the camera than the
 * carton's front panel, so its DOM went on top and the sleeve's photograph
 * showed through the carton. This orders them by their planes instead - the
 * painter's algorithm: of two surfaces that overlap on screen, one lies
 * wholly on the camera's side of the other's plane, and that one is in front.
 * Where neither does (the planes cross), centre distance decides, as before.
 */

/** A surface as the sort sees it: its outline in world space, four corners in order round the quad. */
export interface StackedSurface {
  corners: readonly [Vector3, Vector3, Vector3, Vector3]
}

const cameraPosition = /* @__PURE__ */ new Vector3()
const cameraDirection = /* @__PURE__ */ new Vector3()
const scratch = /* @__PURE__ */ new Vector3()
const edgeA = /* @__PURE__ */ new Vector3()
const edgeB = /* @__PURE__ */ new Vector3()

interface Measured {
  corners: readonly Vector3[]
  center: Vector3
  /** Unit normal, or null for a degenerate (zero-area) outline. */
  normal: Vector3 | null
  distance: number
  /** Screen-space bounds in normalised device coordinates; null when part of it is behind the camera. */
  bounds: { minX: number; minY: number; maxX: number; maxY: number } | null
  /** Plane tolerance: a hair of the surface's own size, so faces sharing an edge count as touching. */
  tolerance: number
}

function measure(surface: StackedSurface, camera: Camera): Measured {
  const corners = surface.corners
  const center = new Vector3()
  for (const corner of corners) center.add(corner)
  center.multiplyScalar(1 / corners.length)
  edgeA.subVectors(corners[1], corners[0])
  edgeB.subVectors(corners[3], corners[0])
  const normal = new Vector3().crossVectors(edgeA, edgeB)
  const area = normal.length()
  const size = Math.max(edgeA.length(), edgeB.length())
  let bounds: Measured['bounds'] = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  for (const corner of corners) {
    if (scratch.subVectors(corner, cameraPosition).dot(cameraDirection) <= 0) {
      bounds = null
      break
    }
    scratch.copy(corner).project(camera)
    bounds.minX = Math.min(bounds.minX, scratch.x)
    bounds.maxX = Math.max(bounds.maxX, scratch.x)
    bounds.minY = Math.min(bounds.minY, scratch.y)
    bounds.maxY = Math.max(bounds.maxY, scratch.y)
  }
  return {
    corners,
    center,
    normal: area > 1e-12 ? normal.multiplyScalar(1 / area) : null,
    distance: center.distanceTo(cameraPosition),
    bounds,
    tolerance: Math.max(1e-7, size * 1e-4),
  }
}

function overlapOnScreen(a: Measured, b: Measured): boolean {
  if (!a.bounds || !b.bounds) return true
  return a.bounds.minX < b.bounds.maxX && b.bounds.minX < a.bounds.maxX && a.bounds.minY < b.bounds.maxY && b.bounds.minY < a.bounds.maxY
}

/**
 * Tested against `a`'s plane: 1 when `b` lies wholly beyond it (so `a` is in
 * front), -1 when `b` lies wholly on the camera's side (so `b` is), 0 when `b`
 * straddles it, lies in it, or `a` is seen edge-on.
 */
function planeTest(a: Measured, b: Measured): number {
  if (!a.normal) return 0
  const toCamera = scratch.subVectors(cameraPosition, a.center).dot(a.normal)
  if (Math.abs(toCamera) <= a.tolerance) return 0
  const facing = Math.sign(toCamera)
  let beyond = true
  let nearer = true
  for (const corner of b.corners) {
    const side = scratch.subVectors(corner, a.center).dot(a.normal) * facing
    if (side > a.tolerance) beyond = false
    if (side < -a.tolerance) nearer = false
  }
  if (beyond && nearer) return 0
  return beyond ? 1 : nearer ? -1 : 0
}

/**
 * The surfaces' indices from back to front: the order to give them rising
 * z-indexes in. Surfaces that do not overlap on screen are free to go in any
 * order, and are left in centre-distance order (farthest first).
 */
export function stackSurfaces(surfaces: readonly StackedSurface[], camera: Camera): number[] {
  camera.updateMatrixWorld()
  cameraPosition.setFromMatrixPosition(camera.matrixWorld)
  camera.getWorldDirection(cameraDirection)
  const measured = surfaces.map((surface) => measure(surface, camera))
  const count = measured.length
  // behind[i] lists the surfaces that must be stacked under i.
  const behind: number[][] = measured.map(() => [])
  const waiting = new Array<number>(count).fill(0)
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const a = measured[i]!
      const b = measured[j]!
      if (!overlapOnScreen(a, b)) continue
      let front = planeTest(a, b)
      if (front === 0) front = -planeTest(b, a)
      if (front > 0) {
        behind[i]!.push(j)
        waiting[i]!++
      } else if (front < 0) {
        behind[j]!.push(i)
        waiting[j]!++
      }
    }
  }
  // Kahn's sort, farthest first among the surfaces that are free to go next.
  // A cycle (three surfaces each over the next, which planes allow) is broken
  // at its farthest member.
  const order: number[] = []
  const placed = new Array<boolean>(count).fill(false)
  for (let step = 0; step < count; step++) {
    let pick = -1
    let fallback = -1
    for (let i = 0; i < count; i++) {
      if (placed[i]) continue
      if (fallback === -1 || measured[i]!.distance > measured[fallback]!.distance) fallback = i
      if (waiting[i] === 0 && (pick === -1 || measured[i]!.distance > measured[pick]!.distance)) pick = i
    }
    const next = pick === -1 ? fallback : pick
    placed[next] = true
    order.push(next)
    for (let i = 0; i < count; i++) {
      if (!placed[i] && behind[i]!.includes(next)) waiting[i]!--
    }
  }
  return order
}

/**
 * A surface's outline in world space, from its depth-mask geometry (which is
 * the screen's silhouette, in its anchor's own units) and the anchor's world
 * matrix: the corners of the silhouette's bounding rectangle, in its plane.
 */
export function surfaceCorners(geometry: BufferGeometry, matrixWorld: Matrix4): StackedSurface['corners'] {
  if (!geometry.boundingBox) geometry.computeBoundingBox()
  const box = geometry.boundingBox!
  const z = (box.min.z + box.max.z) / 2
  return [
    new Vector3(box.min.x, box.min.y, z).applyMatrix4(matrixWorld),
    new Vector3(box.max.x, box.min.y, z).applyMatrix4(matrixWorld),
    new Vector3(box.max.x, box.max.y, z).applyMatrix4(matrixWorld),
    new Vector3(box.min.x, box.max.y, z).applyMatrix4(matrixWorld),
  ]
}
