import * as React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion'
import { easeInOut, easeOut, tween } from '../reel/motion'
import { BRAND, Logo, MONO, SANS, Wordmark } from './brand'

/** The ground every card stands on: the site's near-black, a faint green glow, a fine grid. */
export function Ground({ glow = 0.18, grid = true, children }: { glow?: number; grid?: boolean; children?: React.ReactNode }) {
  const { width } = useVideoConfig()
  const u = width / 1920
  return (
    <AbsoluteFill style={{ background: BRAND.bg, overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 55% at 50% 46%, rgba(49,211,34,${glow}) 0%, rgba(49,211,34,0) 70%)` }} />
      {grid ? (
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)`,
            backgroundSize: `${64 * u}px ${64 * u}px`,
            backgroundPosition: 'center center',
            maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, #000 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, #000 30%, transparent 80%)',
          }}
        />
      ) : null}
      {children}
    </AbsoluteFill>
  )
}

/** A word-by-word rise, for headlines. */
export function Rise({ text, start, step = 3, style }: { text: string; start: number; step?: number; style?: React.CSSProperties }) {
  const frame = useCurrentFrame()
  const words = text.split(' ')
  return (
    <span style={{ display: 'inline-block', ...style }}>
      {words.map((word, i) => {
        const t = tween(frame, start + i * step, start + i * step + 16, 0, 1, easeOut)
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: '0.12em', marginBottom: '-0.12em' }}>
            <span style={{ display: 'inline-block', transform: `translateY(${(1 - t) * 110}%)`, opacity: t, marginRight: i < words.length - 1 ? '0.26em' : 0 }}>{word}</span>
          </span>
        )
      })}
    </span>
  )
}

/** A small label above a headline: the feature's name. */
export function Kicker({ children, start, color = BRAND.green, style }: { children: React.ReactNode; start: number; color?: string; style?: React.CSSProperties }) {
  const frame = useCurrentFrame()
  const { width } = useVideoConfig()
  const u = width / 1920
  const t = tween(frame, start, start + 14, 0, 1, easeOut)
  return (
    <div style={{ fontFamily: MONO, fontSize: 22 * u, letterSpacing: '0.02em', color, opacity: t, transform: `translateY(${(1 - t) * 12 * u}px)`, ...style }}>{children}</div>
  )
}

/* ------------------------------------------------------------------ */
/*  Title                                                              */
/* ------------------------------------------------------------------ */

/** The mark builds panel by panel, the name comes up beside it, then the line under it. */
export function TitleCard() {
  const frame = useCurrentFrame()
  const { width } = useVideoConfig()
  const u = width / 1920
  // Each panel drops onto the one below it, a beat apart (15 frames at 120 BPM).
  const drop = (i: number) => tween(frame, 6 + i * 15, 6 + i * 15 + 14, 1, 0, easeOut)
  const lift = [0, 1, 2].map((i) => drop(i) * 70)
  const show = [0, 1, 2].map((i) => tween(frame, 6 + i * 15, 6 + i * 15 + 6, 0, 1))
  const name = tween(frame, 50, 68, 0, 1, easeOut)
  const line = tween(frame, 66, 84, 0, 1, easeOut)
  const out = tween(frame, 104, 120, 0, 1, easeInOut)
  return (
    <Ground glow={0.16 + 0.08 * name}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: 1 - out, transform: `scale(${1 + out * 0.06})` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 44 * u }}>
          <Logo size={190 * u} lift={lift} show={show} />
          <div style={{ opacity: name, transform: `translateX(${(1 - name) * -24 * u}px)`, clipPath: `inset(-20% ${(1 - name) * 100}% -20% 0)` }}>
            <Wordmark size={112 * u} />
          </div>
        </div>
        <div style={{ marginTop: 40 * u, fontFamily: SANS, fontWeight: 500, fontSize: 40 * u, color: BRAND.muted, letterSpacing: '-0.01em', opacity: line, transform: `translateY(${(1 - line) * 14 * u}px)` }}>
          Live 3D mockups for React.
        </div>
      </AbsoluteFill>
    </Ground>
  )
}

/* ------------------------------------------------------------------ */
/*  End card                                                           */
/* ------------------------------------------------------------------ */

export function EndCard() {
  const frame = useCurrentFrame()
  const { width } = useVideoConfig()
  const u = width / 1920
  const mark = tween(frame, 4, 24, 0, 1, easeOut)
  const install = tween(frame, 22, 40, 0, 1, easeOut)
  const url = tween(frame, 34, 52, 0, 1, easeOut)
  // The cursor blinks on the beat.
  const blink = Math.floor(frame / 15) % 2 === 0 ? 1 : 0
  return (
    <Ground glow={0.22}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 * u, opacity: mark, transform: `translateY(${(1 - mark) * 20 * u}px)` }}>
          <Logo size={120 * u} />
          <Wordmark size={84 * u} />
        </div>
        <div
          style={{
            marginTop: 64 * u,
            padding: `${22 * u}px ${34 * u}px`,
            borderRadius: 14 * u,
            background: BRAND.panel,
            border: `${1.5 * u}px solid ${BRAND.border}`,
            fontFamily: MONO,
            fontSize: 38 * u,
            color: BRAND.text,
            opacity: install,
            transform: `translateY(${(1 - install) * 16 * u}px)`,
            boxShadow: `0 ${24 * u}px ${60 * u}px rgba(0,0,0,0.5)`,
          }}
        >
          <span style={{ color: BRAND.green }}>$</span> npm install react-3d-mockups
          <span style={{ display: 'inline-block', width: 18 * u, height: 40 * u, marginLeft: 10 * u, verticalAlign: 'text-bottom', background: BRAND.green, opacity: blink }} />
        </div>
        <div style={{ marginTop: 36 * u, fontFamily: SANS, fontWeight: 500, fontSize: 34 * u, color: BRAND.muted, opacity: url }}>
          area.is/react-3d-mockups
        </div>
      </AbsoluteFill>
    </Ground>
  )
}

/* ------------------------------------------------------------------ */
/*  Feature headline                                                   */
/* ------------------------------------------------------------------ */

/** A feature's name in mono, its claim large, one line of proof under it. */
export function Feature({
  kicker,
  title,
  sub,
  start = 4,
  out,
  width = 760,
  style,
}: {
  kicker: string
  title: string
  sub?: string
  start?: number
  /** Frame the block leaves on, if it leaves before the shot ends. */
  out?: number
  width?: number
  style?: React.CSSProperties
}) {
  const frame = useCurrentFrame()
  const { width: videoWidth } = useVideoConfig()
  const u = videoWidth / 1920
  const subIn = tween(frame, start + 14, start + 30, 0, 1, easeOut)
  const leave = out === undefined ? 0 : tween(frame, out, out + 10, 0, 1, easeInOut)
  return (
    <div style={{ position: 'absolute', width: width * u, opacity: 1 - leave, transform: `translateY(${-leave * 16 * u}px)`, ...style }}>
      <Kicker start={start}>{kicker}</Kicker>
      <div style={{ marginTop: 18 * u, fontFamily: SANS, fontWeight: 700, fontSize: 84 * u, lineHeight: 1.02, letterSpacing: '-0.04em', color: BRAND.text }}>
        <Rise text={title} start={start + 4} />
      </div>
      {sub ? (
        <div style={{ marginTop: 24 * u, fontFamily: SANS, fontWeight: 500, fontSize: 30 * u, lineHeight: 1.4, color: BRAND.muted, opacity: subIn, transform: `translateY(${(1 - subIn) * 12 * u}px)` }}>
          {sub}
        </div>
      ) : null}
    </div>
  )
}
