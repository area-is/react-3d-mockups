'use client'

import { materialTone } from './swiss-art'

/**
 * The explorer's fallback for a printed face that has no sample artwork of
 * its own: a hairline frame round the live area, labelled with the region it
 * fills. Every face the reference pages stage has a job printed on it (see
 * `carousel-art.tsx`), so this only shows for a region added to an object
 * before anybody has drawn for it - where a plain label that says which face
 * is which is more use than a stand-in picture.
 *
 * On an object whose `color` is the stock it is printed on (`material`), it
 * prints straight onto that stock - no ground of its own, the ink flipped to
 * suit it. Anywhere else it keeps a neutral grey card.
 */
export function SurfaceArt({ label, material }: { label: string; material?: string }) {
  const ink = material ? materialTone(material).text : undefined
  return (
    <div className="mx-surface-art" data-material={material ? 'true' : undefined} style={ink ? { color: ink } : undefined}>
      <span className="mx-surface-art-label">{label}</span>
    </div>
  )
}
