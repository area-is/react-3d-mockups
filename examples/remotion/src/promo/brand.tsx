import * as React from 'react'
import '@fontsource-variable/inter'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource-variable/fraunces'

/*
 * The library's own look, as the docs site wears it: a near-black ground, one
 * green, Inter for words and JetBrains Mono for code.
 */

export const BRAND = {
  bg: '#08090c',
  panel: '#0b0d12',
  border: '#1e222b',
  text: '#e8eaf0',
  muted: '#9aa1af',
  low: '#838a99',
  green: '#31d322',
  greenMid: '#2d9f4f',
  greenDeep: '#276d3e',
  greenShade: '#1e5a32',
  grad: 'linear-gradient(135deg, #20c531 0%, #50e042 100%)',
} as const

export const SANS = '"Inter Variable", Inter, sans-serif'
export const MONO = '"JetBrains Mono", ui-monospace, monospace'
export const SERIF = '"Fraunces Variable", Fraunces, serif'

/** The fonts the film sets, for `FontGate`. */
export const PROMO_FONTS = ['700 40px "Inter Variable"', '500 40px "Inter Variable"', '400 40px "JetBrains Mono"', '600 40px "Fraunces Variable"', '40px Anton']

/* The stacked-screens mark, transcribed from the docs site's `components/logo.tsx`. */
const PANEL_SHADE = 'M 3.51 3.51 A 12 12 0 0 1 12 0 L 106 0 A 12 12 0 0 1 118 12 L 118 72 A 12 12 0 0 1 114.49 80.49 L 123.49 71.49 A 12 12 0 0 0 127 63 L 127 3 A 12 12 0 0 0 115 -9 L 21 -9 A 12 12 0 0 0 12.51 -5.49 Z'
const PANEL_FACE = 'M 12 0 L 106 0 A 12 12 0 0 1 118 12 L 118 72 A 12 12 0 0 1 106 84 L 12 84 A 12 12 0 0 1 0 72 L 0 12 A 12 12 0 0 1 12 0 Z'
const PANELS = [
  { y: 145, shade: '#1E5A32', face: '#276D3E' },
  { y: 115, shade: '#1E5A32', face: '#2D9F4F' },
  { y: 85, shade: '#276D3E', face: '#31D322' },
] as const

/**
 * The mark, its three panels placed separately so the film can stack them:
 * `lift[i]` raises panel `i` (bottom first) by that many artwork units, and
 * `show[i]` fades it.
 */
export function Logo({ size, lift = [0, 0, 0], show = [1, 1, 1] }: { size: number; lift?: readonly number[]; show?: readonly number[] }) {
  return (
    <svg viewBox="46.51 46.51 162.97 162.97" width={size} height={size} style={{ overflow: 'visible', display: 'block' }} aria-hidden>
      {PANELS.map((panel, i) => (
        <g key={i} transform={`translate(0 ${-(lift[i] ?? 0)})`} opacity={show[i] ?? 1}>
          <g transform={`matrix(0.866025 0.5 0.866025 -0.5 40.53 ${panel.y})`}>
            <path d={PANEL_SHADE} fill={panel.shade} />
            <path d={PANEL_FACE} fill={panel.face} />
          </g>
        </g>
      ))}
    </svg>
  )
}

/** The wordmark as the site sets it beside the mark. */
export function Wordmark({ size, color = BRAND.text }: { size: number; color?: string }) {
  return (
    <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: '-0.035em', color, whiteSpace: 'nowrap' }}>React 3D Mockups</span>
  )
}
