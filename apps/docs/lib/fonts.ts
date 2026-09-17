import localFont from 'next/font/local'

// Variable fonts shared by every root layout (site, docs, embedded). Weights
// stay flexible for later, while the UI sticks to 100-increment stops.
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
})

/** The chalk on the A-frame: a neat hand, not a scribble. */
export const caveat = localFont({
  src: '../app/fonts/Caveat-Variable.woff2',
  weight: '400 700',
  style: 'normal',
  display: 'swap',
  variable: '--font-caveat',
})
