import { describe, expect, it } from 'vitest'
import { mockupInfo } from '../metrics'
import {
  GALAXY_TAB_DEFAULT_VARIANT,
  GALAXY_TAB_VARIANTS,
  TABLET_MM_PER_UNIT,
} from '../devices/tablet/dimensions'
import { GALAXY_TAB_COLORWAYS } from '../colorways'
import { DEVICE_LINEUP, deviceLifecycle } from '../lifecycle'

/**
 * The Galaxy Tab S12 Ultra (September 2026), checked against what Samsung
 * published rather than against numbers copied out of the spec: the body on
 * its product page, the panel diagonal its modelled rect implies, and the
 * xhdpi grid the family uses. It is the S11 Ultra's chassis, so the tests
 * also pin that it stays one.
 */

/** Inches across a modelled rect, from its millimetres. */
const diagonal = (mm: { width: number; height: number }) => Math.hypot(mm.width, mm.height) / 25.4

describe('Galaxy Tab S12 Ultra', () => {
  const s12 = GALAXY_TAB_VARIANTS.tabs12ultra
  const mm = (units: number) => units * TABLET_MM_PER_UNIT

  it('has the published 326.3 x 208.5 x 5.1 mm body', () => {
    // Portrait-first: the long side is the height.
    expect(mm(s12.body.height)).toBeCloseTo(326.3, 0)
    expect(mm(s12.body.width)).toBeCloseTo(208.5, 0)
    expect(mm(s12.body.depth)).toBeCloseTo(5.1, 1)
  })

  it('carries a 14.6" 2960x1848 panel on the xhdpi grid, in both orientations', () => {
    const portrait = mockupInfo('galaxyTab', { variant: 'tabs12ultra' }).primary
    const landscape = mockupInfo('galaxyTab', { variant: 'tabs12ultra', orientation: 'landscape' }).primary
    expect(diagonal(portrait.mm)).toBeCloseTo(14.6, 1)
    expect(s12.display.height / s12.display.width).toBeCloseTo(2960 / 1848, 3)
    // 2960x1848 at half scale.
    expect(portrait.px).toEqual({ width: 924, height: 1480 })
    expect(landscape.px).toEqual({ width: 1480, height: 924 })
  })

  it('is the S11 Ultra chassis: same body, panel, notch and rear hardware', () => {
    const s11 = GALAXY_TAB_VARIANTS.tabs11ultra
    expect(s12).toEqual(s11)
    expect(s12.notch).toBeDefined()
    expect(s12.rearCamera.style).toBe('rings')
    if (s12.rearCamera.style === 'rings') expect(s12.rearCamera.rings).toHaveLength(2)
    expect(mockupInfo('galaxyTab', { variant: 'tabs12ultra' }).primary).toEqual(
      mockupInfo('galaxyTab', { variant: 'tabs11ultra' }).primary
    )
  })

  it('ships in Gray and Silver', () => {
    expect(GALAXY_TAB_COLORWAYS.tabs12ultra.map((entry) => entry.id)).toEqual(['gray', 'silver'])
    for (const entry of GALAXY_TAB_COLORWAYS.tabs12ultra) expect(entry.color).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('supersedes the S11 Ultra in its line without moving the family default', () => {
    expect(DEVICE_LINEUP.galaxyTab.tabs12ultra).toEqual({
      name: 'Galaxy Tab S12 Ultra',
      line: 'Galaxy Tab S Ultra',
      announced: '2026-09',
    })
    expect(deviceLifecycle('galaxyTab', 'tabs12ultra').status).toBe('current')
    expect(deviceLifecycle('galaxyTab', 'tabs11ultra').status).toBe('superseded')
    expect(deviceLifecycle('galaxyTab', 'tabs11ultra').successors).toEqual([
      { variant: 'tabs12ultra', name: 'Galaxy Tab S12 Ultra' },
    ])
    expect(deviceLifecycle('galaxyTab', 'tabs11').status).toBe('current')
    expect(GALAXY_TAB_DEFAULT_VARIANT).toBe('tabs11')
  })
})
