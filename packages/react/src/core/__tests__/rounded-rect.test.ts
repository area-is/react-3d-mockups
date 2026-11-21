import { describe, expect, it } from 'vitest'
import { bezierRoundedRectShape, roundedRectShape } from '../geometry/rounded-rect'
import { FOLD_VARIANTS, IPHONE_DUO_VARIANTS } from '../devices/fold/dimensions'
import { FLIP_VARIANTS } from '../devices/flip/dimensions'

/**
 * The foldables' flat pose is one `roundedRectShape` slab, and every other
 * angle is two halves built with `bezierRoundedRectShape`. Their free corners
 * have to be the same curve, or the outline of every corner the hinge does not
 * touch changes the moment the hinge crosses into flat - which it did on the
 * iPhone Duo, whose halves were traced in circular arcs.
 */
describe('bezierRoundedRectShape', () => {
  const points = (shape: ReturnType<typeof roundedRectShape>) =>
    shape.getPoints(16).map((p) => [p.x, p.y] as const)

  it('is roundedRectShape exactly when the four radii agree', () => {
    for (const [w, h, r] of [
      [4.466, 3.189, 0.326],
      [2.023, 4.519, 0.187],
      [1, 1, 0.5],
      [1, 1, 0.8], // clamped to half the shorter side, as roundedRectShape does
    ] as const) {
      const a = points(roundedRectShape(w, h, r))
      const b = points(bezierRoundedRectShape(w, h, { tl: r, tr: r, br: r, bl: r }))
      expect(b.length).toBe(a.length)
      b.forEach(([x, y], i) => {
        const [ax, ay] = a[i]!
        expect(x).toBeCloseTo(ax, 12)
        expect(y).toBeCloseTo(ay, 12)
      })
    }
  })

  // A foldable's half, rounded on its free side and square along the fold,
  // placed where the hinged rig puts it at flat: its free corners must land on
  // the flat slab's own corners, point for point.
  const specs = [
    ...Object.values(FOLD_VARIANTS).map((s) => ({ axis: 'x' as const, body: s.open.body })),
    ...Object.values(IPHONE_DUO_VARIANTS).map((s) => ({ axis: 'x' as const, body: s.open.body })),
    ...Object.values(FLIP_VARIANTS).map((s) => ({ axis: 'y' as const, body: s.open.body })),
  ]

  it.each(specs)('lines a hinged half up with the flat slab ($axis fold)', ({ axis, body }) => {
    const { width, height, radius, bevel } = body
    const flat = points(roundedRectShape(width - bevel * 2, height - bevel * 2, radius - bevel))
    const r = radius - bevel
    const fold = 0.008
    // The half on the positive side of the fold line, with its free corners
    // away from it.
    const half =
      axis === 'x'
        ? bezierRoundedRectShape(width / 2 - bevel * 2, height - bevel * 2, { tl: fold, tr: r, br: r, bl: fold })
        : bezierRoundedRectShape(width - bevel * 2, height / 2 - bevel * 2, { tl: r, tr: r, br: fold, bl: fold })
    const [dx, dy] = axis === 'x' ? [width / 4, 0] : [0, height / 4]
    const moved = points(half).map(([x, y]) => [x + dx, y + dy] as const)
    // Every point of the flat outline in the free corners on that side.
    const corner = (x: number, y: number) =>
      axis === 'x'
        ? x > width / 2 - bevel - r - 1e-9 && Math.abs(y) > height / 2 - bevel - r - 1e-9
        : y > height / 2 - bevel - r - 1e-9 && Math.abs(x) > width / 2 - bevel - r - 1e-9
    const wanted = flat.filter(([x, y]) => corner(x, y))
    expect(wanted.length).toBeGreaterThan(10)
    for (const [x, y] of wanted) {
      const nearest = Math.min(...moved.map(([mx, my]) => Math.hypot(mx - x, my - y)))
      expect(nearest).toBeLessThan(1e-9)
    }
  })
})
