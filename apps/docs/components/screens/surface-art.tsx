'use client'

import { asset } from '@/lib/base-path.mjs'
import { PAPER, materialTone } from './swiss-art'

/**
 * The artwork the prop explorer prints onto a mockup's surfaces: the area
 * wordmark, labelled with whichever region it fills. Print and packaging
 * objects have several panels, so the label is what tells the back cover from
 * the spine while you turn the object around.
 *
 * On an object whose `color` is the stock it is printed on (`material`), it
 * prints straight onto that stock: no ground of its own, so the card, board
 * or paint shows through, and the ink flips with it - white on a dark stock,
 * near-black on a light one. Anywhere else - a billboard's poster, a frame's
 * print, where `color` is the hardware around a separate sheet - it keeps its
 * green field.
 */
export function SurfaceArt({ label, material }: { label: string; material?: string }) {
  const ink = material ? materialTone(material).text : undefined
  return (
    <div className="mx-surface-art" data-material={material ? 'true' : undefined} style={ink ? { color: ink } : undefined}>
      <span className="mx-surface-art-label">{label}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="mx-surface-art-mark"
        src={asset('/assets/area_ag_white.svg')}
        alt="area"
        // The mark is drawn white; on a light stock it is knocked down to the ink.
        style={ink && ink !== PAPER ? { filter: 'brightness(0)', opacity: 0.88 } : undefined}
      />
    </div>
  )
}
