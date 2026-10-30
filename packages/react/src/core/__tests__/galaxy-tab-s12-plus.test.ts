import { describe, expect, it } from 'vitest'
import { mockupInfo } from '../metrics'
import {
  GALAXY_TAB_DEFAULT_VARIANT,
  GALAXY_TAB_FRAMING,
  GALAXY_TAB_VARIANTS,
  TABLET_MM_PER_UNIT,
} from '../devices/tablet/dimensions'
import { GALAXY_TAB_COLORWAYS } from '../colorways'
import { deviceLifecycle } from '../lifecycle'

/**
 * The Galaxy Tab S12+ (September 2026), checked against what Samsung
 * published rather than against numbers copied out of the spec: the body on
 * its spec sheet, the diagonal and aspect of its 2800x1752 panel, and the
 * half-scale dp grid the other Galaxy Tabs use.
 */

const spec = GALAXY_TAB_VARIANTS.tabs12plus
const mm = (units: number) => units * TABLET_MM_PER_UNIT
/** Inches across a modelled rect, from its millimetres. */
const diagonal = (rect: { width: number; height: number }) => Math.hypot(rect.width, rect.height) / 25.4

describe('Galaxy Tab S12+', () => {
  it('has the published 289.5 x 187.8 x 5.3 mm body', () => {
    expect(mm(spec.body.height)).toBeCloseTo(289.5, 1)
    expect(mm(spec.body.width)).toBeCloseTo(187.8, 1)
    expect(mm(spec.body.depth)).toBeCloseTo(5.3, 1)
  })

  it('measures a 12.6" panel at 2800:1752 on a 876x1400 dp grid', () => {
    const portrait = mockupInfo('galaxyTab', { variant: 'tabs12plus' }).primary
    const landscape = mockupInfo('galaxyTab', { variant: 'tabs12plus', orientation: 'landscape' }).primary
    // 2800x1752 at half scale, the xhdpi basis of the other Galaxy Tabs.
    expect(portrait.px).toEqual({ width: 876, height: 1400 })
    expect(landscape.px).toEqual({ width: 1400, height: 876 })
    expect(spec.display.height / spec.display.width).toBeCloseTo(2800 / 1752, 4)
    expect(diagonal(portrait.mm)).toBeCloseTo(12.6, 2)
  })

  it('leaves a uniform ~9 mm bezel with the front camera in it, not in a notch', () => {
    const sides = (mm(spec.body.width) - mm(spec.display.width)) / 2
    const ends = (mm(spec.body.height) - mm(spec.display.height)) / 2
    expect(sides).toBeCloseTo(9.0, 0)
    expect(ends).toBeCloseTo(9.1, 0)
    expect(Math.abs(sides - ends)).toBeLessThan(0.2)
    // The S11's arrangement: no cutout in the panel, so the scene draws the
    // camera dot in the landscape-top bezel. Only the Ultra has a notch.
    expect(spec.notch).toBeUndefined()
    expect(GALAXY_TAB_VARIANTS.tabs11.notch).toBeUndefined()
    expect(GALAXY_TAB_VARIANTS.tabs11ultra.notch).toBeDefined()
  })

  it('carries one rear ring with its flash inboard, at the camera corner', () => {
    const camera = spec.rearCamera
    if (camera.style !== 'rings') throw new Error('expected Galaxy Tab rings')
    expect(camera.rings).toHaveLength(1)
    const [ring] = camera.rings
    // 16.3 mm from the landscape-top edge, 16.2 mm from the camera end.
    expect(mm(spec.body.width / 2 - ring!.x)).toBeCloseTo(16.3, 1)
    expect(mm(spec.body.height / 2 - ring!.y)).toBeCloseTo(16.2, 1)
    // The flash shares the ring's row, further from the end.
    expect(camera.flash.x).toBe(ring!.x)
    expect(camera.flash.y).toBeLessThan(ring!.y)
  })

  it('puts the keys at the camera end and the USB-C at the other', () => {
    // Long-edge keys, placed by `y` (the iPad mini's top-edge keys take `x`).
    for (const key of spec.sideButtons) {
      expect(key.edge).not.toBe('top')
      if (key.edge !== 'top') expect(key.y).toBeGreaterThan(0)
    }
    expect(spec.usbEdge).toBe('bottom')
  })

  it('starts a line of its own and leaves the family default alone', () => {
    const life = deviceLifecycle('galaxyTab', 'tabs12plus')
    expect(life.line).toBe('Galaxy Tab S+')
    expect(life.status).toBe('current')
    // There was no Tab S11+: the S11 is still Samsung's current 11".
    expect(deviceLifecycle('galaxyTab', 'tabs11').status).toBe('current')
    expect(GALAXY_TAB_DEFAULT_VARIANT).toBe('tabs11')
  })

  it('grounds on its own body', () => {
    expect(GALAXY_TAB_FRAMING.extent({ variant: 'tabs12plus' })).toBeCloseTo(spec.body.height / 2, 6)
    expect(GALAXY_TAB_FRAMING.extent({ variant: 'tabs12plus', orientation: 'landscape' })).toBeCloseTo(
      spec.body.width / 2,
      6
    )
  })

  it('ships in Gray and Silver', () => {
    expect(GALAXY_TAB_COLORWAYS.tabs12plus.map((c) => c.id)).toEqual(['gray', 'silver'])
    for (const entry of GALAXY_TAB_COLORWAYS.tabs12plus) expect(entry.color).toMatch(/^#[0-9a-f]{6}$/)
  })
})
