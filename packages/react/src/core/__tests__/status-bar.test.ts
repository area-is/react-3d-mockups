import { describe, expect, it } from 'vitest'
import {
  resolveStatusBarContent,
  statusBarLayout,
  statusBarMetrics,
  STATUS_BAR_DEFAULTS,
} from '../screen/status-bar'
import { IPHONE_VARIANTS } from '../devices/iphone/dimensions'
import { GALAXY_VARIANTS } from '../devices/galaxy/dimensions'

/**
 * The status bar's whole claim to accuracy is that it is placed from the
 * hardware rather than from a constant, so these check the derivation against
 * the real cutout data the device specs carry - not against numbers copied out
 * of the implementation.
 */

/** The cutout in surface pixels, exactly as a device binding computes it. */
const islandCutout = (variant: keyof typeof IPHONE_VARIANTS) => {
  const spec = IPHONE_VARIANTS[variant]
  const pxPerUnit = spec.resolution / spec.display.width
  return {
    halfWidth: (spec.island.width * pxPerUnit) / 2,
    centerY: spec.island.offsetY * pxPerUnit,
    offsetX: 0,
  }
}

const holeCutout = (variant: keyof typeof GALAXY_VARIANTS) => {
  const spec = GALAXY_VARIANTS[variant]
  const pxPerUnit = spec.resolution / spec.display.width
  return {
    halfWidth: spec.punchHole.radius * pxPerUnit,
    centerY: spec.punchHole.offsetY * pxPerUnit,
    offsetX: 0,
  }
}

describe('statusBarLayout', () => {
  it('centres the glyph row on the cutout, and the band around it', () => {
    const cutout = islandCutout('pro')
    const layout = statusBarLayout({
      platform: 'ios',
      formFactor: 'phone',
      width: IPHONE_VARIANTS.pro.resolution,
      cutout,
    })
    expect(layout.centerY).toBeCloseTo(cutout.centerY, 6)
    // Whatever glass sits above the camera sits below it.
    expect(layout.bandHeight).toBeCloseTo(cutout.centerY * 2, 6)
  })

  it('splits iOS around the island and centres each cluster in its ear', () => {
    const width = IPHONE_VARIANTS.pro.resolution
    const cutout = islandCutout('pro')
    const layout = statusBarLayout({ platform: 'ios', formFactor: 'phone', width, cutout })

    expect(layout.split).toBe(true)
    // The left ear runs from the display edge to the island; the clock sits in
    // the middle of it, and the trailing cluster mirrors that on the right.
    expect(layout.leadingX).toBeCloseTo((width / 2 - cutout.halfWidth) / 2, 6)
    expect(layout.trailingX).toBeCloseTo((width / 2 + cutout.halfWidth + width) / 2, 6)
    expect(width - layout.trailingX).toBeCloseTo(layout.leadingX, 6)
  })

  it('keeps One UI flush to its insets rather than splitting', () => {
    const width = GALAXY_VARIANTS.s26.resolution
    const layout = statusBarLayout({
      platform: 'oneui',
      formFactor: 'phone',
      width,
      cutout: holeCutout('s26'),
    })
    const { inset } = statusBarMetrics('oneui', 'phone')

    expect(layout.split).toBe(false)
    expect(layout.leadingX).toBe(inset)
    expect(layout.trailingX).toBe(width - inset)
  })

  it('falls back to the fixed band when the device has no cutout', () => {
    const metrics = statusBarMetrics('ios', 'tablet')
    const layout = statusBarLayout({ platform: 'ios', formFactor: 'tablet', width: 1032 })

    expect(layout.split).toBe(false)
    expect(layout.bandHeight).toBe(metrics.height)
    expect(layout.centerY).toBe(metrics.height / 2)
    expect(layout.leadingX).toBe(metrics.inset)
    expect(layout.trailingX).toBe(1032 - metrics.inset)
  })

  it('shifts the clusters when the cutout is off-centre, as on the Fold inner display', () => {
    const width = 1000
    const offsetX = 120
    const centred = statusBarLayout({
      platform: 'ios',
      formFactor: 'phone',
      width,
      cutout: { halfWidth: 40, centerY: 20, offsetX: 0 },
    })
    const shifted = statusBarLayout({
      platform: 'ios',
      formFactor: 'phone',
      width,
      cutout: { halfWidth: 40, centerY: 20, offsetX },
    })
    // A hole nudged right leaves more room on the left and less on the right,
    // and both ear centres move with it - by half the shift each.
    expect(shifted.leadingX - centred.leadingX).toBeCloseTo(offsetX / 2, 6)
    expect(shifted.trailingX - centred.trailingX).toBeCloseTo(offsetX / 2, 6)
  })

  it('moves the clusters in past a corner larger than the inset, and not otherwise', () => {
    const metrics = statusBarMetrics('ios', 'tablet')
    const flat = statusBarLayout({ platform: 'ios', formFactor: 'tablet', width: 1032 })
    const rounded = statusBarLayout({ platform: 'ios', formFactor: 'tablet', width: 1032, corner: 60 })
    const small = statusBarLayout({ platform: 'ios', formFactor: 'tablet', width: 1032, corner: 8 })

    expect(rounded.leadingX).toBeGreaterThan(flat.leadingX)
    expect(1032 - rounded.trailingX).toBeCloseTo(rounded.leadingX, 6)
    expect(small.leadingX).toBe(metrics.inset)
    // The top of the clock is on the glass - inside the arc's circle, centred
    // at (r, r) - where the bare inset would have left it off the corner.
    const top = rounded.centerY - metrics.fontSize / 2
    const inside = (x: number) => (x - 60) ** 2 + (top - 60) ** 2 <= 60 ** 2
    expect(inside(rounded.leadingX)).toBe(true)
    expect(inside(metrics.inset)).toBe(false)
  })

  it('gives a tablet a smaller clock than a phone on the same platform', () => {
    expect(statusBarMetrics('ios', 'tablet').fontSize).toBeLessThan(
      statusBarMetrics('ios', 'phone').fontSize
    )
  })
})

describe('resolveStatusBarContent', () => {
  it('defaults to the keynote time and a full device', () => {
    expect(resolveStatusBarContent()).toEqual(STATUS_BAR_DEFAULTS)
    expect(STATUS_BAR_DEFAULTS.time).toBe('9:41')
  })

  it('clamps meters a caller can overshoot', () => {
    const resolved = resolveStatusBarContent({ signal: 9, wifi: -2, battery: 4 })
    expect(resolved.signal).toBe(4)
    expect(resolved.wifi).toBe(0)
    expect(resolved.battery).toBe(1)
  })

  it('shows the percentage on One UI unless told otherwise, and hides it on iOS unless asked', () => {
    expect(resolveStatusBarContent(undefined, 'oneui').batteryPercent).toBe(true)
    expect(resolveStatusBarContent(undefined, 'ios').batteryPercent).toBe(false)
    expect(resolveStatusBarContent({ batteryPercent: false }, 'oneui').batteryPercent).toBe(false)
    expect(resolveStatusBarContent({ batteryPercent: true }, 'ios').batteryPercent).toBe(true)
  })

  it('gives an iPad the period iPadOS prints, and nothing else', () => {
    expect(resolveStatusBarContent(undefined, 'ios', 'tablet').time).toBe('9:41 AM')
    expect(resolveStatusBarContent(undefined, 'ios', 'phone').time).toBe('9:41')
    expect(resolveStatusBarContent(undefined, 'oneui', 'tablet').time).toBe('9:41')
    expect(resolveStatusBarContent({ time: '10:09' }, 'ios', 'tablet').time).toBe('10:09')
    // The date is opt-in: nothing resolves one.
    expect(resolveStatusBarContent(undefined, 'ios', 'tablet').date).toBeUndefined()
  })

  it('rounds fractional bar counts rather than emitting half a bar', () => {
    expect(resolveStatusBarContent({ signal: 2.6 }).signal).toBe(3)
  })

  it('survives a non-finite level instead of drawing an empty meter', () => {
    expect(resolveStatusBarContent({ battery: Number.NaN }).battery).toBe(1)
  })
})
