import { describe, expect, it } from 'vitest'
import { MIN_DISPLAY_STANDOFF, displayStandoff, hingeReach, hingeSpine } from '../devices/hinge'
import {
  FOLD_FRAMING,
  FOLD_MM_PER_UNIT,
  FOLD_VARIANTS,
  IPHONE_DUO_FRAMING,
  IPHONE_DUO_VARIANTS,
  foldDisplayStandoff,
  foldHingeReach,
  type FoldSpec,
} from '../devices/fold/dimensions'
import {
  FLIP_FRAMING,
  FLIP_MM_PER_UNIT,
  FLIP_VARIANTS,
  flipDisplayStandoff,
  flipHingeReach,
} from '../devices/flip/dimensions'

/**
 * The foldables' hinge, as one continuous motion.
 *
 * A foldable used to be three models - shut, hinged, flat - swapped on the
 * hinge angle, and the shut one did not agree with where the hinged one
 * arrived: half a degree into the swing the spine stood a body's thickness
 * further out than it had shut. Nothing here renders; it holds the linkage to
 * the two things that made that a jump - the poses at the ends, and the size
 * of the step between any two angles next to each other.
 */

/** Every foldable's hinge: the crease-to-back reach and the shut overhang. */
const HINGES: [name: string, reach: number, overhang: number][] = [
  ...Object.entries(FOLD_VARIANTS).map(
    ([name, spec]) => [name, foldHingeReach(spec), spec.hinge.overhang] as [string, number, number]
  ),
  ...Object.entries(IPHONE_DUO_VARIANTS).map(
    ([name, spec]) => [name, foldHingeReach(spec), spec.hinge.overhang] as [string, number, number]
  ),
  ...Object.entries(FLIP_VARIANTS).map(
    ([name, spec]) => [name, flipHingeReach(spec), spec.hinge.overhang] as [string, number, number]
  ),
]

/** Hinge angles a quarter of a degree apart, shut to flat. */
const SWEEP = Array.from({ length: 721 }, (_, i) => i / 4)

describe('hingeSpine', () => {
  it.each(HINGES)('%s: hides the housing when flat', (_name, reach, overhang) => {
    const flat = hingeSpine(180, reach, overhang)
    expect(flat.fold).toBe(0)
    // Centred on the crease, crown flush with both backs, nothing exposed.
    expect(flat.inset).toBe(0)
    expect(flat.crown).toBeCloseTo(reach, 9)
    expect(flat.seat).toBeCloseTo(reach, 9)
    expect(flat.halfArc).toBeCloseTo(0, 9)
    expect(flat.width).toBeCloseTo(0, 9)
  })

  it.each(HINGES)('%s: leaves only the overhang standing when shut', (_name, reach, overhang) => {
    const shut = hingeSpine(0, reach, overhang)
    expect(shut.fold).toBeCloseTo(Math.PI / 2, 9)
    expect(shut.crown).toBeCloseTo(overhang, 9)
    // The halves have closed round it: its axis is inside the stack...
    expect(shut.inset).toBeCloseTo(reach - overhang, 9)
    // ...and it emerges from their hinge ends part way across each, not at
    // the back corners - a cap over the seam, not a half-round on the end.
    expect(shut.seat).toBeGreaterThan(0)
    expect(shut.seat).toBeLessThan(reach)
    expect(shut.width).toBeCloseTo(2 * shut.seat, 9)
  })

  it.each(HINGES)('%s: moves a hair per degree, at the shut end most of all', (_name, reach, overhang) => {
    // The first degree off shut is the one that used to jump: the crown went
    // from `overhang` to a full `reach` behind the crease.
    const first = Math.abs(hingeSpine(1, reach, overhang).crown - hingeSpine(0, reach, overhang).crown)
    expect(first).toBeLessThan(reach * 0.01)
    for (let i = 1; i < SWEEP.length; i++) {
      const a = hingeSpine(SWEEP[i - 1]!, reach, overhang)
      const b = hingeSpine(SWEEP[i]!, reach, overhang)
      // A quarter of a degree never moves anything by more than a quarter of
      // a percent of the body's thickness, or the arc by more than its own
      // share of the turn.
      expect(Math.abs(b.crown - a.crown)).toBeLessThan(reach * 0.0025)
      expect(Math.abs(b.inset - a.inset)).toBeLessThan(reach * 0.0025)
      expect(Math.abs(b.seat - a.seat)).toBeLessThan(reach * 0.0025)
      expect(Math.abs(b.halfArc - a.halfArc)).toBeLessThan(0.0045)
    }
  })

  it.each(HINGES)('%s: only ever recedes as the device opens', (_name, reach, overhang) => {
    // How far the crown stands proud of the halves' own back corners.
    const proud = (spine: ReturnType<typeof hingeSpine>) => spine.crown - reach * Math.cos(spine.fold)
    for (let i = 1; i < SWEEP.length; i++) {
      const a = hingeSpine(SWEEP[i - 1]!, reach, overhang)
      const b = hingeSpine(SWEEP[i]!, reach, overhang)
      // Opening carries the crown back toward flush and the barrel's axis back
      // out to the crease; nothing reverses along the way.
      expect(b.crown).toBeGreaterThanOrEqual(a.crown)
      expect(b.inset).toBeLessThanOrEqual(a.inset)
      // And the spine is never a recess between the shells: from flush when
      // flat it only stands prouder of their corners, up to `overhang` shut.
      expect(proud(b)).toBeGreaterThanOrEqual(-1e-12)
      expect(proud(b)).toBeLessThanOrEqual(proud(a) + 1e-12)
    }
    expect(proud(hingeSpine(0, reach, overhang))).toBeCloseTo(overhang, 9)
  })

  it.each(HINGES)('%s: bares its band as the device shuts, then holds it', (_name, reach, overhang) => {
    const shut = hingeSpine(0, reach, overhang).width
    for (let i = 1; i < SWEEP.length; i++) {
      const a = hingeSpine(SWEEP[i - 1]!, reach, overhang)
      const b = hingeSpine(SWEEP[i]!, reach, overhang)
      // From flat down to square the exposed band only widens...
      if (SWEEP[i - 1]! >= 90) expect(b.width).toBeLessThan(a.width)
      // ...and by a quarter open it is as wide as it gets, to a few percent:
      // the rest of the swing closes the halves round it, not over it.
      if (SWEEP[i]! <= 45) expect(Math.abs(b.width - shut)).toBeLessThan(shut * 0.05)
    }
  })

  it.each(HINGES)('%s: keeps the barrel inside both backs', (_name, reach, overhang) => {
    for (const angle of SWEEP) {
      const spine = hingeSpine(angle, reach, overhang)
      // Furthest the barrel reaches toward either back face, from the crease.
      // A back face is `reach` out, so anything more would break through it.
      expect(spine.radius - spine.inset * Math.cos(spine.fold)).toBeLessThanOrEqual(reach + 1e-12)
      // And where it emerges is on the barrel: the seat is a point of its circle.
      const across = spine.seat * Math.sin(spine.fold)
      const along = spine.seat * Math.cos(spine.fold) + spine.inset
      expect(Math.hypot(across, along)).toBeCloseTo(spine.radius, 9)
    }
  })

  it('reads an out-of-range angle as the nearest end', () => {
    expect(hingeSpine(-30, 0.12, 0.03)).toEqual(hingeSpine(0, 0.12, 0.03))
    expect(hingeSpine(400, 0.12, 0.03)).toEqual(hingeSpine(180, 0.12, 0.03))
  })
})

describe('hingeReach', () => {
  it.each(HINGES)('%s: is the overhang shut, a body thickness square, nothing flat', (_name, reach, overhang) => {
    expect(hingeReach(0, reach, overhang)).toBeCloseTo(overhang, 9)
    expect(hingeReach(90, reach, overhang)).toBeCloseTo(reach, 9)
    expect(hingeReach(180, reach, overhang)).toBeCloseTo(0, 9)
    for (let i = 1; i < SWEEP.length; i++) {
      const step = Math.abs(hingeReach(SWEEP[i]!, reach, overhang) - hingeReach(SWEEP[i - 1]!, reach, overhang))
      expect(step).toBeLessThan(reach * 0.006)
    }
  })
})

describe('display standoff', () => {
  it('is half the shut gap, and never less than clears the cover glass', () => {
    expect(displayStandoff(0.02)).toBeCloseTo(0.01, 9)
    expect(displayStandoff(0.012)).toBeCloseTo(MIN_DISPLAY_STANDOFF, 9)
    expect(displayStandoff(0)).toBe(MIN_DISPLAY_STANDOFF)
  })
})

/**
 * The folded device is the unfolded one, shut - so the published folded
 * figures are not a second set of dimensions to draw from, they are a check
 * on the first: two halves and the air between them have to come to the
 * folded thickness, and half the unfolded span plus the hinge's overhang to
 * the folded one.
 */
describe('the folded figures follow from the unfolded body', () => {
  const foldMm = (units: number) => units * FOLD_MM_PER_UNIT
  const flipMm = (units: number) => units * FLIP_MM_PER_UNIT

  it.each([
    ['fold7', FOLD_VARIANTS.fold7, 72.8, 8.9],
    ['fold8', FOLD_VARIANTS.fold8, 81.9, 9.7],
    ['fold8ultra', FOLD_VARIANTS.fold8ultra, 72.8, 8.9],
    ['duo', IPHONE_DUO_VARIANTS.duo, 84.1, 11.3],
  ] as [string, FoldSpec, number, number][])(
    '%s shuts to its published width and thickness',
    (_name, spec, width, thickness) => {
      const standoff = foldDisplayStandoff(spec)
      // Two halves, and the air their displays keep between them.
      const stack = 2 * (spec.open.body.depth + standoff)
      expect(Math.abs(foldMm(stack) - thickness)).toBeLessThan(0.1)
      // The spec's own folded depth says the same thing.
      expect(Math.abs(stack - spec.closed.body.depth)).toBeLessThan(0.002)
      // Half the unfolded width, and the spine standing proud of it.
      const bar = spec.open.body.width / 2 + spec.hinge.overhang
      expect(Math.abs(foldMm(bar) - width)).toBeLessThan(0.15)
      // The halves are as tall shut as open.
      expect(spec.closed.body.height).toBe(spec.open.body.height)
    }
  )

  it.each([
    ['flip7', FLIP_VARIANTS.flip7, 85.5, 13.7],
    ['flip8', FLIP_VARIANTS.flip8, 85.7, 13.1],
  ] as const)('%s shuts to its published height and thickness', (_name, spec, height, thickness) => {
    const stack = 2 * (spec.closed.body.depth + flipDisplayStandoff(spec))
    expect(Math.abs(flipMm(stack) - thickness)).toBeLessThan(0.1)
    const folded = spec.closed.body.height + spec.hinge.overhang
    expect(Math.abs(flipMm(folded) - height)).toBeLessThan(0.15)
    // A half is half the phone, to the hundredth of a millimetre.
    expect(Math.abs(spec.closed.body.height - spec.open.body.height / 2)).toBeLessThan(0.001)
    expect(spec.closed.body.depth).toBe(spec.open.body.depth)
    expect(spec.closed.body.width).toBe(spec.open.body.width)
  })
})

/**
 * The ground line under a foldable is read off the same linkage. On its side
 * the book-fold's used to switch formulas three degrees into the swing, and
 * the shadow plane dropped a body's thickness at that angle.
 */
describe('foldable framing follows the hinge without a step', () => {
  it.each([
    ['fold7', FOLD_FRAMING, { variant: 'fold7' as const }, FOLD_VARIANTS.fold7],
    ['fold8', FOLD_FRAMING, { variant: 'fold8' as const }, FOLD_VARIANTS.fold8],
    ['duo', IPHONE_DUO_FRAMING, { variant: 'duo' as const }, IPHONE_DUO_VARIANTS.duo],
  ] as const)('%s on its side', (_name, framing, props, spec) => {
    const extent = (openAngle: number | boolean) =>
      (framing.extent as (p: object) => number)({ ...props, openAngle, orientation: 'landscape' })
    // Shut, only the spine's overhang hangs below the crease; flat, a whole half.
    expect(extent(false)).toBeCloseTo(spec.hinge.overhang, 9)
    expect(extent(0)).toBe(extent(false))
    expect(extent(true)).toBeCloseTo(spec.open.body.width / 2, 9)
    for (let i = 1; i < SWEEP.length; i++) {
      // A quarter of a degree of a half's free edge, at most.
      const most = (spec.open.body.width / 2) * ((0.25 * Math.PI) / 180) * 1.05 + 1e-9
      expect(Math.abs(extent(SWEEP[i]!) - extent(SWEEP[i - 1]!))).toBeLessThan(most)
    }
  })

  it('stands a book-fold upright on the same foot at every angle', () => {
    const feet = SWEEP.map((openAngle) => FOLD_FRAMING.extent({ openAngle }))
    expect(new Set(feet).size).toBe(1)
    expect(feet[0]).toBe(FOLD_VARIANTS.fold7.open.body.height / 2)
  })

  it.each(['portrait', 'landscape'] as const)('grounds a clamshell on the same foot at every angle (%s)', (orientation) => {
    const feet = SWEEP.map((openAngle) => FLIP_FRAMING.extent({ openAngle, orientation }))
    expect(new Set(feet).size).toBe(1)
  })
})
