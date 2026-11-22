import * as THREE from 'three'

/**
 * A centered rounded-rectangle `THREE.Shape`, used for the phone silhouette,
 * cover glass and back panel.
 */
export function roundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape()
  const x = -width / 2
  const y = -height / 2
  const r = Math.min(radius, width / 2, height / 2)

  shape.moveTo(x + r, y)
  shape.lineTo(x + width - r, y)
  shape.quadraticCurveTo(x + width, y, x + width, y + r)
  shape.lineTo(x + width, y + height - r)
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  shape.lineTo(x + r, y + height)
  shape.quadraticCurveTo(x, y + height, x, y + height - r)
  shape.lineTo(x, y + r)
  shape.quadraticCurveTo(x, y, x + r, y)

  return shape
}

/**
 * `roundedRectShape`'s silhouette with a radius per corner: the same quadratic
 * Bezier corners, traced from the same point in the same order, so with four
 * equal radii it is that shape exactly.
 *
 * A foldable's hinged halves are built from this, not from
 * `mixedRoundedRectShape`, because the flat pose is one `roundedRectShape`
 * slab and the halves have to be that slab cut in two. A Bezier corner sits
 * further out than the circular arc of the same radius (about 4% of the
 * radius on each axis), so halves with arc corners changed the outline of
 * every free corner as the hinge crossed into flat - invisible on a Fold's
 * 2 mm corners, a plain jump on the iPhone Duo's 8 mm ones.
 */
export function bezierRoundedRectShape(
  width: number,
  height: number,
  corners: { tl: number; tr: number; br: number; bl: number }
): THREE.Shape {
  const x = -width / 2
  const y = -height / 2
  const limit = Math.min(width / 2, height / 2)
  const clamp = (r: number) => Math.max(0, Math.min(r, limit))
  const tl = clamp(corners.tl)
  const tr = clamp(corners.tr)
  const br = clamp(corners.br)
  const bl = clamp(corners.bl)
  const s = new THREE.Shape()
  s.moveTo(x + bl, y)
  s.lineTo(x + width - br, y)
  if (br) s.quadraticCurveTo(x + width, y, x + width, y + br)
  s.lineTo(x + width, y + height - tr)
  if (tr) s.quadraticCurveTo(x + width, y + height, x + width - tr, y + height)
  s.lineTo(x + tl, y + height)
  if (tl) s.quadraticCurveTo(x, y + height, x, y + height - tl)
  s.lineTo(x, y + bl)
  if (bl) s.quadraticCurveTo(x, y, x + bl, y)
  return s
}

/**
 * The same silhouette with a radius PER CORNER, in CSS `border-radius` order
 * (top-left, top-right, bottom-right, bottom-left) so it can be built from the
 * same numbers a screen's `border-radius` is built from.
 *
 * The corners here are TRUE CIRCULAR ARCS, unlike `roundedRectShape`'s
 * quadratic Beziers. That matters wherever the shape has to line up with a DOM
 * element's `border-radius`, which is a real elliptical arc: a quadratic Bezier
 * bulges about 6% of the radius outside the arc it approximates, and on a
 * heavily rounded screen (a watch face is rounded by a third of its width, a
 * record label by half) that overshoot is a visible slice of the render.
 */
export function roundedRectShapeCorners(
  width: number,
  height: number,
  corners: readonly [number, number, number, number]
): THREE.Shape {
  const shape = new THREE.Shape()
  const x = -width / 2
  const y = -height / 2
  const limit = Math.min(width / 2, height / 2)
  const [tl, tr, br, bl] = corners.map((r) => Math.max(0, Math.min(r, limit))) as [
    number,
    number,
    number,
    number,
  ]
  const HALF_PI = Math.PI / 2
  // A zero radius is a plain corner: absarc would emit a degenerate arc there.
  const corner = (cx: number, cy: number, r: number, from: number) => {
    if (r > 0) shape.absarc(cx, cy, r, from, from + HALF_PI, false)
    else shape.lineTo(cx, cy)
  }

  // Counter-clockwise from the bottom edge, so the corners come round in the
  // order bottom-right, top-right, top-left, bottom-left.
  shape.moveTo(x + bl, y)
  shape.lineTo(x + width - br, y)
  corner(x + width - br, y + br, br, -HALF_PI)
  shape.lineTo(x + width, y + height - tr)
  corner(x + width - tr, y + height - tr, tr, 0)
  shape.lineTo(x + tl, y + height)
  corner(x + tl, y + height - tl, tl, HALF_PI)
  shape.lineTo(x, y + bl)
  corner(x + bl, y + bl, bl, Math.PI)
  shape.closePath()

  return shape
}
