import * as React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { easeOut, tween } from '../reel/motion'
import { BRAND, MONO } from './brand'

/*
 * A code card in the docs site's dark panel, typed out against the frame.
 * Lines are written as tagged segments - `t('tag', '<GalaxyMockup')` - rather
 * than parsed, so the colours are exactly what the film means them to be.
 */

export const CODE = {
  text: '#d6dbe7',
  punct: '#7d8590',
  tag: '#7ee787',
  attr: '#79c0ff',
  string: '#a5d6ff',
  keyword: '#ff7b72',
  value: '#ffa657',
  comment: '#6e7681',
} as const

export type Tone = keyof typeof CODE
export type Segment = [tone: Tone, text: string]
export const t = (tone: Tone, text: string): Segment => [tone, text]

export function CodeCard({
  lines,
  start = 0,
  speed = 2.2,
  file,
  width,
  size = 30,
  caret = true,
  style,
}: {
  lines: Segment[][]
  /** Frame the typing starts on; `Infinity` shows it all at once. */
  start?: number
  /** Characters a frame. */
  speed?: number
  file?: string
  width: number
  size?: number
  caret?: boolean
  style?: React.CSSProperties
}) {
  const frame = useCurrentFrame()
  const { width: videoWidth } = useVideoConfig()
  const u = videoWidth / 1920
  const typed = start === Infinity ? Infinity : Math.max(0, (frame - start) * speed)
  let budget = typed
  let caretAt: [number, number] | null = null
  const shown = lines.map((line, row) => {
    const length = line.reduce((n, [, text]) => n + text.length, 0)
    const take = Math.min(length, Math.floor(budget))
    budget -= length
    if (caretAt === null && take < length) caretAt = [row, take]
    let left = take
    return line.map(([tone, text]) => {
      const part = text.slice(0, Math.max(0, left))
      left -= text.length
      return [tone, part] as Segment
    })
  })
  if (caretAt === null && lines.length) caretAt = [lines.length - 1, -1]
  const blink = Math.floor(frame / 15) % 2 === 0
  const enter = tween(frame, Math.min(start, 1e6) - 14, Math.min(start, 1e6) + 4, 0, 1, easeOut)
  return (
    <div
      style={{
        width: width * u,
        borderRadius: 16 * u,
        background: BRAND.panel,
        border: `${1.5 * u}px solid ${BRAND.border}`,
        boxShadow: `0 ${30 * u}px ${80 * u}px rgba(0,0,0,0.55)`,
        overflow: 'hidden',
        opacity: start === Infinity ? 1 : enter,
        transform: `translateY(${(1 - (start === Infinity ? 1 : enter)) * 24 * u}px)`,
        ...style,
      }}
    >
      {file ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 * u, padding: `${14 * u}px ${20 * u}px`, borderBottom: `${1.5 * u}px solid ${BRAND.border}` }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <span key={c} style={{ width: 12 * u, height: 12 * u, borderRadius: '50%', background: c, opacity: 0.85 }} />
          ))}
          <span style={{ marginLeft: 10 * u, fontFamily: MONO, fontSize: 17 * u, color: BRAND.low }}>{file}</span>
        </div>
      ) : null}
      <div style={{ padding: `${24 * u}px ${28 * u}px`, fontFamily: MONO, fontSize: size * u, lineHeight: 1.55, whiteSpace: 'pre', color: CODE.text }}>
        {shown.map((line, row) => (
          <div key={row} style={{ minHeight: `${1.55}em` }}>
            {line.map(([tone, text], i) => (
              <span key={i} style={{ color: CODE[tone] }}>
                {text}
              </span>
            ))}
            {caret && caretAt && caretAt[0] === row ? (
              <span style={{ display: 'inline-block', width: '0.55em', height: '1.1em', verticalAlign: 'text-bottom', background: BRAND.green, opacity: blink ? 0.9 : 0 }} />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
