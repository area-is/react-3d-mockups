import { describe, expect, it } from 'vitest'
import { statusBarSafeAreaTop, type StatusBarPlacement } from '../status-bar'
import { statusBarLayout, statusBarMetrics } from '../../core'
import { IPHONE_VARIANTS } from '../../core/devices/iphone/dimensions'

/**
 * The inset the surface publishes to its content as `--mockup-safe-area-top`.
 *
 * What matters here is that it agrees with the bar that is actually drawn -
 * the two come from one `statusBarLayout` call precisely so a screen's padding
 * and the band it is clearing can never drift apart - and that a cutout still
 * counts when the bar is switched off, because an island is hardware and eats
 * the strip either way.
 */

const spec = IPHONE_VARIANTS.pro
const pxPerUnit = spec.resolution / spec.display.width

const phone = (withCutout: boolean): StatusBarPlacement => ({
  platform: 'ios',
  formFactor: 'phone',
  width: spec.resolution,
  corner: spec.display.radius * pxPerUnit,
  cutout: withCutout
    ? {
        halfWidth: (spec.island.width * pxPerUnit) / 2,
        centerY: spec.island.offsetY * pxPerUnit,
        offsetX: 0,
      }
    : undefined,
})

describe('statusBarSafeAreaTop', () => {
  it('matches the band the bar actually draws', () => {
    const placement = phone(true)
    expect(statusBarSafeAreaTop(true, placement)).toBeCloseTo(
      statusBarLayout(placement).bandHeight,
      6
    )
  })

  it('still reserves the cutout when the bar is off - an island is hardware', () => {
    const placement = phone(true)
    const band = statusBarLayout(placement).bandHeight
    expect(band).toBeGreaterThan(0)
    expect(statusBarSafeAreaTop(false, placement)).toBeCloseTo(band, 6)
    expect(statusBarSafeAreaTop(undefined, placement)).toBeCloseTo(band, 6)
  })

  it('gives the content the whole panel when there is neither bar nor cutout', () => {
    expect(statusBarSafeAreaTop(false, phone(false))).toBe(0)
    expect(statusBarSafeAreaTop(undefined, phone(false))).toBe(0)
  })

  it('falls back to the platform band height with a bar but no cutout', () => {
    expect(statusBarSafeAreaTop(true, phone(false))).toBe(
      statusBarMetrics('ios', 'phone').height
    )
  })

  it('reads the tuned object form of the prop as "on"', () => {
    const placement = phone(false)
    expect(statusBarSafeAreaTop({ time: '10:10', color: '#000' }, placement)).toBe(
      statusBarMetrics('ios', 'phone').height
    )
  })
})
