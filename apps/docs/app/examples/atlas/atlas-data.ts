/**
 * Atlas, a travel quarterly. Issue 12 is about islands, and its pictures
 * were generated - three photographs from GPT Image 2.5 at its `low`
 * setting, sized to the surfaces they print on (see the Images guide in
 * the docs for the call). The data is shared by the page and the print.
 */

export const MAG = {
  name: 'Atlas',
  issue: 12,
  theme: 'Islands',
  season: 'Autumn 2026',
  price: '€14',
  strap: 'A quarterly of places and the ways to reach them',
}

export interface Photo {
  id: string
  src: string
  /** 1400 x 933 in the file, every one; kept for `aspect-ratio`. */
  alt: string
  caption: string
  /** `object-position`, for the crops the portrait surfaces make. */
  position: string
  /** The story it opens. */
  story: string
  standfirst: string
}

export const PHOTOS: Photo[] = [
  {
    id: 'island',
    src: '/art/island.webp',
    alt: 'A rocky island with a white lighthouse in a blue sea',
    caption: 'Farol da Ponta, last light',
    position: '60% 45%',
    story: "The lighthouse keeper's last winter",
    standfirst: 'When the light is automated in March, the last family on the rock will leave with it.',
  },
  {
    id: 'harbour',
    src: '/art/harbour.webp',
    alt: 'Painted wooden boats in a small harbour at dusk',
    caption: 'Porto Novo, blue hour',
    position: '50% 55%',
    story: 'Harbours after dark',
    standfirst: 'Six nights on the quay with the men who paint the boats and the women who name them.',
  },
  {
    id: 'market',
    src: '/art/market.webp',
    alt: 'Oranges, lemons and figs piled under a striped awning',
    caption: 'Mercado do Sal, noon',
    position: '50% 50%',
    story: 'A market at noon',
    standfirst: 'Everything on this stall grew within sight of it, and the stall has been here since 1931.',
  },
]

export const CONTENTS = [
  ['08', 'Departures', 'The ferry timetable, annotated'],
  ['14', "The lighthouse keeper's last winter", 'by Ilse Marr'],
  ['32', 'Harbours after dark', 'by Tomas Brandt'],
  ['48', 'A market at noon', 'by Priya Desai'],
  ['64', 'Twelve islands, twelve beds', 'where to sleep'],
  ['80', 'The tide table', 'until December'],
] as const

export const BOOK = {
  title: 'Coastlines',
  sub: 'Five years of Atlas',
  blurb: 'Sixty stories and two hundred photographs from the first twenty issues, on the edges of Europe where the land gives out.',
  pages: 312,
}

export function findPhoto(id: string): Photo {
  return PHOTOS.find((p) => p.id === id) ?? PHOTOS[0]!
}
