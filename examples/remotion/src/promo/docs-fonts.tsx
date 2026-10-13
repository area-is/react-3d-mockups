import * as React from 'react'
import { useDelayRender } from 'remotion'
import inter from '../../../../apps/docs/app/fonts/InterVariable.woff2'
import fraunces from '../../../../apps/docs/app/fonts/Fraunces-Variable.woff2'
import frauncesItalic from '../../../../apps/docs/app/fonts/Fraunces-Italic-Variable.woff2'
import mono from '../../../../apps/docs/app/fonts/JetBrainsMono-Variable.woff2'
import korean from '../../../../apps/docs/app/fonts/NotoSerifKR-Variable-Jacket.woff2'

/*
 * The docs artwork names its faces through the site's next/font variables
 * (`--font-inter`, `--font-fraunces`, `--font-jetbrains-mono`,
 * `--font-noto-serif-kr`). This loads the site's own font files and sets those
 * variables, so the carousel's prints and screens are set exactly as the site
 * sets them.
 */

const FACES: { family: string; url: string; style?: string; weight: string }[] = [
  { family: 'Docs Inter', url: inter, weight: '100 900' },
  { family: 'Docs Fraunces', url: fraunces, weight: '100 900' },
  { family: 'Docs Fraunces', url: frauncesItalic, style: 'italic', weight: '100 900' },
  { family: 'Docs JetBrains Mono', url: mono, weight: '100 800' },
  { family: 'Docs Noto Serif KR', url: korean, weight: '200 900' },
]

export const DOCS_FONT_VARS = {
  '--font-inter': '"Docs Inter"',
  '--font-fraunces': '"Docs Fraunces"',
  '--font-jetbrains-mono': '"Docs JetBrains Mono"',
  '--font-noto-serif-kr': '"Docs Noto Serif KR"',
} as React.CSSProperties

let loading: Promise<unknown> | null = null

function loadFaces() {
  loading ??= Promise.all(
    FACES.map(async ({ family, url, style, weight }) => {
      const face = new FontFace(family, `url(${url}) format('woff2')`, { style: style ?? 'normal', weight })
      await face.load()
      document.fonts.add(face)
    })
  )
  return loading
}

/** Wraps the film: sets the variables, and holds the first frame until the faces are in. */
export function DocsFonts({ children }: { children: React.ReactNode }) {
  const { delayRender, continueRender, cancelRender } = useDelayRender()
  const [handle] = React.useState(() => delayRender('The docs site fonts'))
  React.useEffect(() => {
    loadFaces().then(() => continueRender(handle), cancelRender)
  }, [continueRender, cancelRender, handle])
  return <div style={{ position: 'absolute', inset: 0, ...DOCS_FONT_VARS }}>{children}</div>
}
