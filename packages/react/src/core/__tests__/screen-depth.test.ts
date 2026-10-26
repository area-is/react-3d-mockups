import { describe, expect, it } from 'vitest'
import { Matrix4, PerspectiveCamera, Vector3, Vector4 } from 'three'
import { screenDepthScale } from '../screen/surface'

/**
 * The HTML bridge's CSS chain, as matrices: the element carrying
 * `perspective: p` (its perspective origin at `origin`), the camera element
 * (`translateZ(p) scale3d(s) matrix3d(view, y flipped)`, round its centre)
 * and a world point under it. Returns where the point lands on the page and
 * its w - the divisor that multiplies any rounding in the chain.
 */
function cssProject(
  camera: PerspectiveCamera,
  size: { width: number; height: number },
  point: Vector3,
  scale: number,
  origin = { x: size.width / 2, y: size.height / 2 }
): { x: number; y: number; w: number } {
  const p = camera.projectionMatrix.elements[5]! * (size.height / 2)
  const perspective = new Matrix4().identity()
  perspective.elements[11] = -1 / p
  const chain = new Matrix4()
    .makeTranslation(origin.x, origin.y, 0)
    .multiply(perspective)
    .multiply(new Matrix4().makeTranslation(-origin.x, -origin.y, 0))
    // The camera element's transform round its own centre.
    .multiply(new Matrix4().makeTranslation(size.width / 2, size.height / 2, 0))
    .multiply(new Matrix4().makeTranslation(0, 0, p))
    .multiply(new Matrix4().makeScale(scale, scale, scale))
    .multiply(new Matrix4().makeScale(1, -1, 1))
    .multiply(camera.matrixWorldInverse)
  const v = new Vector4(point.x, point.y, point.z, 1).applyMatrix4(chain)
  return { x: v.x / v.w, y: v.y / v.w, w: v.w }
}

/** Where three itself draws `point` on a canvas of `size` CSS px. */
function glProject(camera: PerspectiveCamera, size: { width: number; height: number }, point: Vector3) {
  const ndc = point.clone().project(camera)
  return { x: ((ndc.x + 1) / 2) * size.width, y: ((1 - ndc.y) / 2) * size.height }
}

/** The Galaxy Watch explorer on a 430 px wide iPhone: an odd, fractional canvas. */
const size = { width: 396, height: 395.59375 }
const camera = new PerspectiveCamera(30, size.width / size.height, 0.1, 100)
camera.position.set(0, 0.4, 7.7)
camera.lookAt(0, 0, 0)
camera.updateMatrixWorld()
const p = camera.projectionMatrix.elements[5]! * (size.height / 2)

/** The watch face's centre, turned towards the camera a little. */
const face = new Vector3(0.3, 0.1, 0.37)
const depth = -face.clone().applyMatrix4(camera.matrixWorldInverse).z

describe('screenDepthScale', () => {
  it('is the perspective over the depth, and 1 for anything not in front of the camera', () => {
    expect(screenDepthScale(543, 7.24)).toBeCloseTo(75, 6)
    expect(screenDepthScale(543, 0)).toBe(1)
    expect(screenDepthScale(543, -2)).toBe(1)
    expect(screenDepthScale(0, 7)).toBe(1)
    expect(screenDepthScale(543, Number.NaN)).toBe(1)
    expect(screenDepthScale(543, Number.MIN_VALUE)).toBe(1)
  })

  it('moves nothing on the page: the chain still draws every point where WebGL does', () => {
    const s = screenDepthScale(p, depth)
    for (const point of [face, new Vector3(-1, 1, 0.37), new Vector3(1.05, -1.05, 0.2), new Vector3(0, 0, -0.5)]) {
      const gl = glProject(camera, size, point)
      for (const scale of [1, s]) {
        const css = cssProject(camera, size, point, scale)
        expect(css.x).toBeCloseTo(gl.x, 6)
        expect(css.y).toBeCloseTo(gl.y, 6)
      }
    }
  })

  it('puts the screen on the perspective plane, where w is 1', () => {
    expect(cssProject(camera, size, face, 1).w).toBeLessThan(0.02)
    expect(cssProject(camera, size, face, screenDepthScale(p, depth)).w).toBeCloseTo(1, 9)
  })

  it('stops a sub-pixel perspective origin from throwing the screen off its glass', () => {
    // WebKit rounds the perspective origin and the camera element's own
    // origin differently on a fractional canvas: take them 0.4 px apart.
    const rounded = { x: size.width / 2, y: size.height / 2 + 0.4 }
    const shift = (scale: number) =>
      cssProject(camera, size, face, scale, rounded).y - cssProject(camera, size, face, scale).y
    expect(Math.abs(shift(1))).toBeGreaterThan(20)
    expect(Math.abs(shift(screenDepthScale(p, depth)))).toBeLessThan(1e-6)
  })
})
