/**
 * EXPERIMENTAL (`experimentalScreenInput`): the code a screen taking input
 * needs - the clipper and the drag handoff - in one module that
 * `ScreenPortal` imports dynamically the first time a screen takes input.
 * An app's bundler splits it into its own chunk, so a mockup with input off
 * never downloads it.
 */
import { Vector3 } from 'three'
import type * as THREE from 'three'
import { traceTransparent } from '../core/screen/clip-trace'
import { experimental_screenInputStats } from './screen-input-stats'

export { createScreenDragHandoff } from '../core/screen/drag-handoff'

/** What one screen's clip is traced from, read fresh each frame. */
export interface ClipTarget {
  canvas: HTMLCanvasElement
  context: WebGLRenderingContext | WebGL2RenderingContext
  /** The canvas's CSS width, to turn device pixels back into CSS pixels. */
  cssWidth: number
  camera: THREE.Camera
  /** The screen's anchor in the scene, and its silhouette in the anchor's units. */
  anchor: THREE.Object3D
  geometry: THREE.BufferGeometry
  /** The layer the clip-path goes on, the canvas's size and origin. */
  element: HTMLElement
}

/**
 * A clipper for one screen. Call it after a frame has rendered, before the
 * browser composites, while the drawing buffer still holds the frame: it
 * reads the canvas's alpha under the screen's projected bounds and clips the
 * layer to the transparent part - where the screen's depth mask was the
 * nearest surface, which is the part of the screen no hardware covers.
 */
export function createScreenClipper(): (target: ClipTarget) => void {
  const corner = new Vector3()
  let buffer = new Uint8Array(0)
  return ({ canvas, context, cssWidth, camera, anchor, geometry, element }) => {
    const dpr = canvas.width / cssWidth
    if (!geometry.boundingBox) geometry.computeBoundingBox()
    const box = geometry.boundingBox!
    // The screen's projected bounds in device pixels, top-down, with a margin
    // for antialiasing. Outside them the DOM draws nothing anyway.
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const [x, y] of [
      [box.min.x, box.min.y],
      [box.max.x, box.min.y],
      [box.max.x, box.max.y],
      [box.min.x, box.max.y],
    ] as const) {
      corner.set(x, y, 0).applyMatrix4(anchor.matrixWorld).project(camera)
      const px = (corner.x * 0.5 + 0.5) * canvas.width
      const py = (0.5 - corner.y * 0.5) * canvas.height
      minX = Math.min(minX, px)
      maxX = Math.max(maxX, px)
      minY = Math.min(minY, py)
      maxY = Math.max(maxY, py)
    }
    const x0 = Math.max(0, Math.floor(minX) - 2)
    const y0 = Math.max(0, Math.floor(minY) - 2)
    const x1 = Math.min(canvas.width, Math.ceil(maxX) + 2)
    const y1 = Math.min(canvas.height, Math.ceil(maxY) + 2)
    const w = x1 - x0
    const h = y1 - y0
    if (w <= 0 || h <= 0) {
      element.style.clipPath = 'inset(50%)'
      return
    }
    if (buffer.length < w * h * 4) buffer = new Uint8Array(w * h * 4)
    const t0 = performance.now()
    // Rows come back bottom-up.
    context.readPixels(x0, canvas.height - y1, w, h, context.RGBA, context.UNSIGNED_BYTE, buffer)
    const t1 = performance.now()
    const { path, vertices } = traceTransparent(
      (x, y) => buffer[((h - 1 - y) * w + x) * 4 + 3]! < 128,
      w,
      h,
      (x) => +((x0 + x) / dpr).toFixed(2),
      (y) => +((y0 + y) / dpr).toFixed(2)
    )
    const stats = experimental_screenInputStats
    stats.frames++
    stats.readMs += t1 - t0
    stats.traceMs += performance.now() - t1
    stats.pixels += w * h
    stats.vertices += vertices
    element.style.clipPath = path ? `path(evenodd, "${path}")` : 'inset(50%)'
  }
}
