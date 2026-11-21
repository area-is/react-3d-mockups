'use client'

import { TabbiedPattern } from 'tabbied/react'
import { bloks } from 'tabbied/patterns'

/**
 * Background first, transparent, so the page's own black shows between the
 * tiles; then five greys only a step or two above it. Neutral on purpose: the
 * page's one colour is the accent green, and the band is a texture to close
 * the page on, not another thing to look at.
 */
const PALETTE = ['transparent', '#0f1114', '#121417', '#15171b', '#181b1f', '#1c1f24']

/**
 * The decorative band across the foot of every site page, above the footer:
 * Tabbied's `bloks` - quarter-circles, half-rounds and squares on a grid -
 * full width and a fixed height, so the page reserves its space before the
 * pattern paints.
 *
 * A fixed seed, so it is the same arrangement on every load and in every
 * screenshot, and no redraw timer: nothing at the bottom of a page should move
 * on its own. `decorative` (the default) keeps it out of the accessibility
 * tree.
 */
export function FooterBand() {
  return (
    <div className="footer-band" aria-hidden>
      <TabbiedPattern
        pattern={bloks}
        seed="rd3m-foot"
        palette={PALETTE}
        cellSize={40}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
