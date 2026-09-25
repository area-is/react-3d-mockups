import localFont from 'next/font/local'

// Variable fonts shared by every root layout (site, docs, examples, embedded).
// Weights stay flexible for later, while the UI sticks to 100-increment stops.
// The Korean face is in `fonts-ko.ts`, declared only where the book jacket
// can render.
//
// Inter is subset to the Latin the site actually sets (see
// app/fonts/LICENSES.md for the ranges): the full family shipped Cyrillic,
// Greek and Vietnamese too, 352 KB on every page for a site written in
// English. Anything outside the subset falls back glyph by glyph.
export const inter = localFont({
  src: '../app/fonts/InterVariable.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-inter',
})

export const jetbrainsMono = localFont({
  src: '../app/fonts/JetBrainsMono-Variable.woff2',
  weight: '100 800',
  style: 'normal',
  display: 'swap',
  variable: '--font-jetbrains-mono',
})

/**
 * The serif the printed objects set their display type in - the cereal's
 * flavour, the florist's wordmark, the record's liner notes. Fraunces is a
 * variable face with an optical-size axis, so one file sets a 12 cqw
 * flavour name and nine-point notes and looks like two different fonts
 * doing it, the way a real printer's serif does; it replaces a Georgia
 * stack that only ever looked like a screen font photographed.
 */
export const fraunces = localFont({
  src: [
    { path: '../app/fonts/Fraunces-Variable.woff2', style: 'normal' },
    { path: '../app/fonts/Fraunces-Italic-Variable.woff2', style: 'italic' },
  ],
  weight: '100 900',
  display: 'swap',
  variable: '--font-fraunces',
  // Only the demo artwork sets Fraunces, so it is not preloaded: a preload
  // fetched both files on every page, prose pages included, before anything
  // needed them. Without one the browser loads a face when text in it is
  // first laid out - on the home page, once the carousel's artwork mounts.
  preload: false,
})
