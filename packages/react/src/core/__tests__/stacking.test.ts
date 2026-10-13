import { describe, expect, it } from 'vitest'
import { BufferGeometry, Float32BufferAttribute, Matrix4, PerspectiveCamera, Vector3 } from 'three'
import { stackSurfaces, surfaceCorners, type StackedSurface } from '../screen/stacking'

/** A camera at `position` looking at the origin. */
function cameraAt(position: [number, number, number]): PerspectiveCamera {
  const camera = new PerspectiveCamera(40, 16 / 9, 0.1, 1000)
  camera.position.set(...position)
  camera.lookAt(0, 0, 0)
  camera.updateMatrixWorld()
  return camera
}

/** A quad facing +z, `width` x `height`, centred on `center`. */
function facing(center: [number, number, number], width: number, height: number): StackedSurface {
  const [x, y, z] = center
  return {
    corners: [
      new Vector3(x - width / 2, y - height / 2, z),
      new Vector3(x + width / 2, y - height / 2, z),
      new Vector3(x + width / 2, y + height / 2, z),
      new Vector3(x - width / 2, y + height / 2, z),
    ],
  }
}

/** Rank of each surface in the stack, 0 at the back. */
function ranks(surfaces: StackedSurface[], camera: PerspectiveCamera): number[] {
  const order = stackSurfaces(surfaces, camera)
  const rank: number[] = []
  order.forEach((index, at) => (rank[index] = at))
  return rank
}

describe('stackSurfaces', () => {
  it('puts a small surface in front over a large one behind it whose centre is nearer the camera', () => {
    // The carton and the record sleeve: the sleeve stands behind the carton,
    // but it is big and off to the side of the carton, so its centre is the
    // nearer of the two centres - which is what used to put it on top.
    const camera = cameraAt([0, 0, 10])
    const sleeve = facing([0, 0, 0], 10, 4)
    const carton = facing([4.2, 0, 0.6], 1.2, 2)
    const center = (s: StackedSurface) => s.corners.reduce((sum, c) => sum.add(c), new Vector3()).multiplyScalar(1 / 4)
    expect(center(sleeve).distanceTo(camera.position)).toBeLessThan(center(carton).distanceTo(camera.position))
    const [sleeveRank, cartonRank] = ranks([sleeve, carton], camera)
    expect(cartonRank).toBeGreaterThan(sleeveRank!)
  })

  it('orders two faces of a box that share an edge, from either side', () => {
    // A box's front (+z) and right (+x) faces, unit cube at the origin.
    const front: StackedSurface = {
      corners: [new Vector3(-0.5, -0.5, 0.5), new Vector3(0.5, -0.5, 0.5), new Vector3(0.5, 0.5, 0.5), new Vector3(-0.5, 0.5, 0.5)],
    }
    const right: StackedSurface = {
      corners: [new Vector3(0.5, -0.5, 0.5), new Vector3(0.5, -0.5, -0.5), new Vector3(0.5, 0.5, -0.5), new Vector3(0.5, 0.5, 0.5)],
    }
    // Seen from in front and a little to the right, both faces show; neither covers
    // the other, so any order is right - but the sort must not throw or loop.
    expect(stackSurfaces([front, right], cameraAt([2, 0.5, 6])).sort()).toEqual([0, 1])
    // A third surface far behind the box, overlapping both on screen, goes under both.
    const wall = facing([0, 0, -3], 12, 8)
    const [frontRank, rightRank, wallRank] = ranks([front, right, wall], cameraAt([2, 0.5, 6]))
    expect(wallRank).toBe(0)
    expect(frontRank).toBeGreaterThan(0)
    expect(rightRank).toBeGreaterThan(0)
  })

  it('leaves surfaces that do not overlap on screen in centre-distance order', () => {
    const camera = cameraAt([0, 0, 10])
    const near = facing([-3, 0, 2], 1, 1)
    const far = facing([3, 0, -2], 1, 1)
    expect(stackSurfaces([near, far], camera)).toEqual([1, 0])
  })

  it('stacks a stack of parallel cards back to front', () => {
    const camera = cameraAt([1, 1, 10])
    const cards = [facing([0, 0, -1], 3, 2), facing([0.4, 0.2, 1], 3, 2), facing([0.2, 0.1, 0], 3, 2)]
    expect(stackSurfaces(cards, camera)).toEqual([0, 2, 1])
  })

  it('reads a surface outline from its mask geometry and world matrix', () => {
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute([-1, -2, 0, 1, -2, 0, 1, 2, 0, -1, 2, 0], 3))
    const matrix = new Matrix4().makeTranslation(5, 0, 0)
    const corners = surfaceCorners(geometry, matrix)
    expect(corners.map((c) => c.toArray())).toEqual([
      [4, -2, 0],
      [6, -2, 0],
      [6, 2, 0],
      [4, 2, 0],
    ])
  })
})
