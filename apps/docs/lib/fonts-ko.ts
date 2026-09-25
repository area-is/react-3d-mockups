import localFont from 'next/font/local'

/**
 * Hangul, for the book. Inter has no Korean glyphs, so without this the
 * jacket's 새돌출판사 fell through to whatever sans the viewer's system had
 * - a different face on every machine. Noto Sans KR, subset to the 2,350
 * syllables of KS X 1001 (which is every syllable ordinary Korean text
 * uses) with its full weight axis. The `unicode-range` keeps it out of the
 * request list on pages with no Hangul at all; on a page that shows the
 * book it is one file, about the size of Inter's.
 *
 * It lives in a module of its own, apart from `fonts.ts`, so only the root
 * layouts whose pages can show the book jacket - the site (the home
 * carousel), the docs and the harness - declare the face at all. The
 * example sites and the embedded page never set Korean, and neither does
 * any artwork but the jacket (`FONT_KO` in `book-jacket.tsx`; the shared
 * `FONT` is Inter alone).
 */
export const notoSansKR = localFont({
  src: '../app/fonts/NotoSansKR-Variable-KSX1001.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-noto-sans-kr',
  declarations: [{ prop: 'unicode-range', value: 'U+AC00-D7A3, U+1100-11FF, U+3130-318F' }],
  // Not preloaded: a preload fetches the file whatever the `unicode-range`
  // says, which defeated the range on every page.
  preload: false,
})
