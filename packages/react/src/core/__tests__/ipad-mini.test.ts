import { describe, expect, it } from 'vitest'
import { mockupInfo } from '../metrics'
import { IPAD_DEFAULT_VARIANT, IPAD_VARIANTS, TABLET_MM_PER_UNIT } from '../devices/tablet/dimensions'
import { IPAD_COLORWAYS } from '../colorways'
import { deviceLifecycle } from '../lifecycle'

/**
 * The iPad mini (A20 Pro, October 2026), checked against what Apple published
 * on its tech-specs page rather than against numbers copied out of the spec:
 * the body, the 8.5" panel's diagonal and aspect, and the 2x point grid.
 */

const mm = (units: number) => units * TABLET_MM_PER_UNIT
/** Inches across a modelled rect, from its millimetres. */
const diagonal = (rect: { width: number; height: number }) => Math.hypot(rect.width, rect.height) / 25.4

const mini = IPAD_VARIANTS.ipadmini

describe('iPad mini (A20 Pro)', () => {
  it('has the published 195.3 x 132.6 x 5.4 mm body', () => {
    expect(mm(mini.body.height)).toBeCloseTo(195.3, 1)
    expect(mm(mini.body.width)).toBeCloseTo(132.6, 1)
    expect(mm(mini.body.depth)).toBeCloseTo(5.4, 1)
  })

  it('models the 8.5" 2316x1512 panel at 326 ppi, in a uniform ~7.4 mm bezel', () => {
    expect(diagonal(mockupInfo('ipad', { variant: 'ipadmini' }).primary.mm)).toBeCloseTo(8.5, 1)
    expect(mini.display.height / mini.display.width).toBeCloseTo(2316 / 1512, 3)
    // 326 ppi: 2316 px is 180.45 mm, 1512 px is 117.81 mm. (From the spec's
    // rect: mockupInfo rounds its millimetres to 0.1.)
    const panel = { width: mm(mini.display.width), height: mm(mini.display.height) }
    expect(panel.height).toBeCloseTo((2316 / 326) * 25.4, 1)
    expect(panel.width).toBeCloseTo((1512 / 326) * 25.4, 1)
    const bezelX = (mm(mini.body.width) - panel.width) / 2
    const bezelY = (mm(mini.body.height) - panel.height) / 2
    expect(bezelX).toBeCloseTo(7.4, 1)
    expect(bezelY).toBeCloseTo(7.4, 1)
  })

  it('lays content out on the panel at 2x: 756x1158 pt, swapped in landscape', () => {
    expect(mockupInfo('ipad', { variant: 'ipadmini' }).primary.px).toEqual({ width: 756, height: 1158 })
    expect(mockupInfo('ipad', { variant: 'ipadmini', orientation: 'landscape' }).primary.px).toEqual({
      width: 1158,
      height: 756,
    })
  })

  it('has no speaker holes, no Smart Connector and a flash beside its single lens', () => {
    // The Acoustic Display plays through the glass.
    expect(mini.speakers).toBeUndefined()
    expect(mini.pogo).toBeUndefined()
    expect(mini.rearCamera.style).toBe('single')
    if (mini.rearCamera.style !== 'single') return
    const { flash, mic, x, y } = mini.rearCamera
    expect(flash).toBeDefined()
    // Lens, mic and flash down one column along the long edge.
    expect(mic.x).toBe(x)
    expect(flash!.x).toBe(x)
    expect(flash!.y).toBeLessThan(mic.y)
    expect(mic.y).toBeLessThan(y)
  })

  it('puts the volume keys on the top edge and the front camera off centre', () => {
    expect(mini.topButton).toBeDefined()
    expect(mini.sideButtons.length).toBe(2)
    for (const key of mini.sideButtons) {
      expect(key.edge).toBe('top')
      // ...at the far end of the top edge from the Touch ID button.
      if (key.edge === 'top') expect(Math.sign(key.x)).toBe(-Math.sign(mini.topButton!.x))
    }
    expect(mm(mini.frontCamera!.offsetY)).toBeCloseTo(12.8, 1)
  })

  it('leaves every other iPad as it was', () => {
    for (const [variant, spec] of Object.entries(IPAD_VARIANTS)) {
      if (variant === 'ipadmini') continue
      expect(spec.frontCamera).toBeUndefined()
      expect(spec.speakers).toBeDefined()
      expect(spec.sideButtons.every((key) => key.edge !== 'top')).toBe(true)
      if (spec.rearCamera.style === 'single') expect(spec.rearCamera.flash).toBeUndefined()
    }
  })

  it('starts a line of its own without moving the family default', () => {
    const life = deviceLifecycle('ipad', 'ipadmini')
    expect(life.line).toBe('iPad mini')
    expect(life.status).toBe('current')
    expect(life.announced).toBe('2026-10')
    for (const other of ['ipadpro13', 'ipadpro11', 'ipadair13', 'ipadair11', 'ipad11'] as const) {
      expect(deviceLifecycle('ipad', other).status).toBe('current')
    }
    expect(IPAD_DEFAULT_VARIANT).toBe('ipadpro13')
  })

  it('comes in Midnight and Starlight', () => {
    expect(IPAD_COLORWAYS.ipadmini.map(({ id }) => id)).toEqual(['midnight', 'starlight'])
  })
})
