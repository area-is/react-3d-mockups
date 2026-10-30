import { describe, expect, it } from 'vitest'
import { mockupInfo } from '../metrics'
import { deviceLifecycle } from '../lifecycle'
import { LAPTOP_COLORWAYS } from '../colorways'
import { LAPTOP_MM_PER_UNIT, LAPTOP_VARIANTS, type LaptopSpec } from '../devices/laptop/dimensions'

/**
 * The MacBook Pro 14" and 16" with PROLED XDR display (October 2026), checked
 * against what Apple published rather than against numbers copied out of the
 * specs: the closed bodies and panels on its tech-specs page, the panel
 * diagonals and point grids those imply, and the island measured off its
 * product imagery.
 */

const mm = (units: number) => units * LAPTOP_MM_PER_UNIT
/** Inches across a modelled rect, from its millimetres. */
const diagonal = (rect: { width: number; height: number }) => Math.hypot(rect.width, rect.height) / 25.4

const PUBLISHED = {
  proled14: { body: [310.8, 216.3, 15.0], inches: 14.2, panel: [3024, 1986], points: [1512, 993], mini: 'pro14' },
  proled16: { body: [355.5, 244.2, 16.0], inches: 16.3, panel: [3472, 2266], points: [1736, 1133], mini: 'pro16' },
} as const

describe.each(Object.entries(PUBLISHED))('%s', (variant, published) => {
  const key = variant as keyof typeof PUBLISHED
  const spec = LAPTOP_VARIANTS[key]

  it('has Apple’s published closed body', () => {
    const [width, depth, height] = published.body
    expect(mm(spec.footprint.width)).toBeCloseTo(width, 0)
    expect(mm(spec.footprint.depth)).toBeCloseTo(depth, 0)
    // The Pros leave 0.8 mm under the slabs for the feet, as the mini-LED
    // models' 15.5 / 16.8 mm do.
    expect(mm(spec.base.thickness + spec.lid.thickness) + 0.8).toBeCloseTo(height, 0)
  })

  it('renders the panel at its own aspect, on Apple’s 2x point grid', () => {
    const [w, h] = published.panel
    expect(spec.display.width / spec.display.height).toBeCloseTo(w / h, 4)
    expect(mockupInfo('laptop', { variant: key }).primary.px).toEqual({
      width: published.points[0],
      height: published.points[1],
    })
    // 254 ppi: a tenth of a millimetre per pixel.
    expect(mm(spec.display.width)).toBeCloseTo(w / 10, 0)
    expect(diagonal(mockupInfo('laptop', { variant: key }).primary.mm)).toBeCloseTo(published.inches, 1)
  })

  it('is a new, smaller body than the mini-LED Pro it is sold beside', () => {
    const mini = LAPTOP_VARIANTS[published.mini]
    expect(spec.footprint.width).toBeLessThan(mini.footprint.width)
    expect(spec.footprint.depth).toBeLessThan(mini.footprint.depth)
    // ...around a panel 22 / 32 px taller at the same 254 ppi.
    expect(spec.display.height).toBeGreaterThan(mini.display.height)
  })

  it('frames the panel in ~4.2 mm bezels', () => {
    const side = mm(spec.footprint.width - spec.display.width) / 2
    const top = mm(spec.footprint.depth / 2 - (spec.display.offsetY + spec.display.height / 2))
    expect(side).toBeCloseTo(4.2, 0)
    expect(top).toBeCloseTo(4.3, 0)
    // The glass reaches past the panel on every side.
    expect(spec.glass).toBeDefined()
    expect(spec.glass!.rim).toBeLessThan((spec.footprint.width - spec.display.width) / 2)
  })

  it('floats a Dynamic Island below the top edge instead of a notch', () => {
    expect(spec.notch).toBeUndefined()
    const island = spec.island!
    expect(island).toBeDefined()
    expect(mm(island.width)).toBeCloseTo(11.75, 0)
    expect(mm(island.height)).toBeCloseTo(6.2, 0)
    // It floats: live panel shows above it, ~1.5 mm of it.
    const gap = mm(island.offsetY - island.height / 2)
    expect(gap).toBeGreaterThan(1)
    expect(gap).toBeLessThan(2)
  })

  it('keeps the Pro’s deck, ports and grilles, with the M5 Air’s symbol legends and a lit logo', () => {
    const mini = LAPTOP_VARIANTS[published.mini]
    expect(spec.keyboard.tray).toBe(true)
    expect(spec.legends).toBe('symbols')
    expect(spec.logo.lit).toBe(true)
    expect(mini.logo.lit).toBeUndefined()
    expect(spec.ports.left.length).toBe(mini.ports.left.length)
    expect(spec.ports.right.length).toBe(mini.ports.right.length)
    // The connectors keep the mini-LED's distances from the back edge.
    const fromBack = (s: LaptopSpec, side: 'left' | 'right') => s.ports[side].map((p) => mm(p.z + s.footprint.depth / 2))
    for (const side of ['left', 'right'] as const) {
      fromBack(spec, side).forEach((d, i) => expect(d).toBeCloseTo(fromBack(mini, side)[i]!, 0))
    }
    // The palm rest is the mini-LED's: the trackpad as far from the front.
    const toFront = (s: LaptopSpec) => mm(s.footprint.depth / 2 - (s.trackpad.offsetZ + s.trackpad.depth / 2))
    expect(toFront(spec)).toBeCloseTo(toFront(mini), 1)
    // The grilles: centred on the well, 1.8 mm in from the side, clear of it.
    const { footprint, keyboard, speakers } = spec
    expect(speakers!.offsetZ).toBe(keyboard.offsetZ)
    expect(mm(footprint.width / 2 - speakers!.x - speakers!.width / 2)).toBeCloseTo(1.8, 0)
    expect(speakers!.x - speakers!.width / 2).toBeGreaterThan(keyboard.width / 2)
    // The trackpad 2-3.5 mm below the well, as on every MacBook.
    const gap = mm(spec.trackpad.offsetZ - spec.trackpad.depth / 2 - (keyboard.offsetZ + keyboard.depth / 2))
    expect(gap).toBeGreaterThan(1.3)
    expect(gap).toBeLessThan(3.5)
  })

  it('ships in Space Black and Silver', () => {
    expect(LAPTOP_COLORWAYS[key].map((c) => c.id)).toEqual(['spaceblack', 'silver'])
  })

  it('starts a line of its own, so the mini-LED Pro stays current', () => {
    expect(deviceLifecycle('laptop', key).status).toBe('current')
    expect(deviceLifecycle('laptop', published.mini).status).toBe('current')
    expect(deviceLifecycle('laptop', published.mini).successors).toEqual([])
  })
})

describe('the island and the notch', () => {
  it('are never both on one panel', () => {
    for (const [variant, spec] of Object.entries(LAPTOP_VARIANTS)) {
      expect([variant, Boolean(spec.notch && spec.island)]).toEqual([variant, false])
    }
  })

  it('leaves the PROLED Pros as the only laptops with an island', () => {
    const withIsland = Object.entries(LAPTOP_VARIANTS)
      .filter(([, spec]) => spec.island)
      .map(([variant]) => variant)
    expect(withIsland).toEqual(['proled14', 'proled16'])
  })
})
