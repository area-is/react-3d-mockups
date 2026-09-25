import localFont from 'next/font/local'

/**
 * Hangul, for the book. Inter has no Korean glyphs, so without this the
 * jacket's 새돌출판사 fell through to whatever sans the viewer's system had
 * - a different face on every machine. Noto Serif KR: a Myeongjo, the face
 * Korean literary publishing sets its titles and colophons in, beside the
 * jacket's Inter.
 *
 * The file is subset to the 22 syllables `book-jacket.tsx` contains, with the
 * full weight axis kept - 9 KB, where the 2,350 KS X 1001 syllables come to
 * 549 KB in a serif. A syllable added to the jacket needs the file cut again
 * (see `app/fonts/LICENSES.md`); until then it falls back to the system's
 * Korean face. The `unicode-range` keeps it out of the request list on
 * pages with no Hangul at all.
 *
 * It lives in a module of its own, apart from `fonts.ts`, so only the root
 * layouts whose pages can show the book jacket - the site (the home
 * carousel), the docs, the harness and the print shop example (the book
 * stands beside the frame for scale) - declare the face at all. The other
 * examples and the embedded page never set Korean, and neither does any
 * artwork but the jacket (`FONT_KO` in `book-jacket.tsx`; the shared `FONT`
 * is Inter alone).
 */
export const notoSerifKR = localFont({
  src: '../app/fonts/NotoSerifKR-Variable-Jacket.woff2',
  weight: '200 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-noto-serif-kr',
  declarations: [{ prop: 'unicode-range', value: 'U+AC00-D7A3, U+1100-11FF, U+3130-318F' }],
  // Not preloaded: a preload fetches the file whatever the `unicode-range`
  // says, which defeated the range on every page.
  preload: false,
})
