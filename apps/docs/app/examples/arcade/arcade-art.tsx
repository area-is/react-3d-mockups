'use client'

import type { CSSProperties, ReactNode } from 'react'
import { Face } from '../_shared/face'
import { GAME, OST, type Level } from './arcade-data'
import { MothGame } from './moth-game'

/**
 * Moth's key art and its packaging. The moth is an SVG - the game's own
 * drawing, in vector - and everything is set on the level's night sky so
 * the box, the sleeve and the screens agree about what colour dark is.
 */

const HEAVY: CSSProperties = { fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.86 }

/** The moth, wings open, in the level's ink. */
export function MothMark({ size, color, style }: { size: string; color: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 120 80" style={{ width: size, height: 'auto', display: 'block', ...style }} aria-hidden>
      <ellipse cx="34" cy="30" rx="30" ry="18" transform="rotate(-18 34 30)" fill={color} opacity="0.9" />
      <ellipse cx="86" cy="30" rx="30" ry="18" transform="rotate(18 86 30)" fill={color} opacity="0.9" />
      <ellipse cx="40" cy="54" rx="20" ry="11" transform="rotate(20 40 54)" fill={color} opacity="0.75" />
      <ellipse cx="80" cy="54" rx="20" ry="11" transform="rotate(-20 80 54)" fill={color} opacity="0.75" />
      <ellipse cx="60" cy="42" rx="6" ry="22" fill={color} />
      <path d="M56 22 48 8M64 22l8-14" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Screens: the TV (1920 x 1080) and the phone (360 x 780)            */
/* ------------------------------------------------------------------ */

/** The game on the TV, with the title and the lamp count over it. */
export function TVGame({ level, lit = 1, litRef }: { level: Level; lit?: number; litRef?: (lit: number, total: number) => void }) {
  return (
    <Face background={level.sky} color={level.moth} style={{ letterSpacing: '-0.012em' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <MothGame width={1920} height={1080} level={level} onLit={litRef} />
      </div>
      <div style={{ position: 'absolute', left: 64, top: 52, display: 'flex', alignItems: 'center', gap: 18 }}>
        <MothMark size="64px" color={level.moth} />
        <span style={{ ...HEAVY, fontSize: 56 }}>{GAME.title}</span>
      </div>
      <div style={{ position: 'absolute', right: 64, top: 60, textAlign: 'right', fontSize: 22, fontWeight: 700, opacity: 0.8 }}>
        {level.name}
        <br />
        <span style={{ color: level.lamp, fontVariantNumeric: 'tabular-nums' }}>
          {lit} of {level.lamps} lamps
        </span>
      </div>
      <div style={{ position: 'absolute', left: 64, bottom: 56, fontSize: 20, fontWeight: 600, opacity: 0.6 }}>The moth flies itself. Your job is the lamps.</div>
    </Face>
  )
}

/** The game on the phone, portrait, with the tap hint a phone game has. */
export function PhoneGame({ level }: { level: Level }) {
  return (
    <Face background={level.sky} color={level.moth} style={{ letterSpacing: '-0.012em' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <MothGame width={360} height={780} level={level} />
      </div>
      <div style={{ position: 'absolute', left: 20, right: 20, top: 'calc(var(--mockup-safe-area-top, 0px) + 14px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, ...HEAVY, fontSize: 22 }}>
          <MothMark size="26px" color={level.moth} /> {GAME.title}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: level.lamp }}>{level.name}</span>
      </div>
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 28, textAlign: 'center', fontSize: 13, fontWeight: 600, opacity: 0.6 }}>Tap anywhere to light a lamp</div>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  The box (a game case, 106 x 170 x 12 mm)                            */
/* ------------------------------------------------------------------ */

export function BoxFront({ level }: { level: Level }) {
  return (
    <Face background={level.sky} color={level.moth} style={{ display: 'flex', flexDirection: 'column', padding: '7cqw', letterSpacing: '-0.012em' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(45% 30% at 62% 38%, ${level.lamp}66 0%, transparent 70%)` }} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '3.4cqw', fontWeight: 700, opacity: 0.8 }}>
        <span>{GAME.studio}</span>
        <span style={{ border: `0.5cqw solid ${level.moth}`, padding: '0.8cqw 1.6cqw', borderRadius: '1cqw' }}>{GAME.rating}</span>
      </div>
      <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MothMark size="62cqw" color={level.moth} />
      </div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '2cqw' }}>
        <span style={{ ...HEAVY, fontSize: '22cqw' }}>{GAME.title}</span>
        <span style={{ fontSize: '4cqw', fontWeight: 700, color: level.lamp }}>{GAME.tag}</span>
      </div>
    </Face>
  )
}

export function BoxBack({ level }: { level: Level }) {
  const bullets = ['Seven nights, forty lamps, one moth', 'A soundtrack by Lune Rouge', 'Plays in an evening, stays for a week', 'No text, no menus, no wrong way']
  return (
    <Face background={level.sky} color={level.moth} style={{ display: 'flex', flexDirection: 'column', padding: '7cqw', gap: '4cqw', letterSpacing: '-0.012em' }}>
      <span style={{ fontSize: '5.2cqw', fontWeight: 700, lineHeight: 1.2 }}>A moth cannot help flying at the light. You cannot help helping it.</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2cqw', fontSize: '3.4cqw', fontWeight: 600, opacity: 0.85 }}>
        {bullets.map((b) => (
          <span key={b}>· {b}</span>
        ))}
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '3cqw', fontWeight: 600, opacity: 0.7 }}>
        <span>
          {GAME.platforms}
          <br />
          {GAME.release}
        </span>
        <span>{GAME.studio}</span>
      </div>
    </Face>
  )
}

export function BoxSpine({ level }: { level: Level }) {
  return (
    <Face background={level.sky} color={level.moth} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2cqh' }}>
      <MothMark size="60cqh" color={level.moth} />
      <span style={{ ...HEAVY, fontSize: '52cqh', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{GAME.title}</span>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  The soundtrack (520 x 520 sleeve, 166 x 166 labels)                 */
/* ------------------------------------------------------------------ */

export function SleeveFront({ level }: { level: Level }) {
  return (
    <Face background={level.sky} color={level.moth} style={{ display: 'flex', flexDirection: 'column', padding: '7cqw', letterSpacing: '-0.012em' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(40% 40% at 50% 46%, ${level.lamp}55 0%, transparent 70%)` }} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', fontSize: '2.8cqw', fontWeight: 700, opacity: 0.75 }}>
        <span>{OST.label}</span>
        <span>{OST.catalog}</span>
      </div>
      <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MothMark size="54cqw" color={level.moth} />
      </div>
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <span style={{ ...HEAVY, fontSize: '14cqw' }}>{GAME.title}</span>
        <span style={{ fontSize: '3cqw', fontWeight: 700, textAlign: 'right', lineHeight: 1.3, color: level.lamp }}>
          Original soundtrack
          <br />
          {OST.artist}
        </span>
      </div>
    </Face>
  )
}

function Tracks({ side, tracks, level }: { side: string; tracks: readonly (readonly string[])[]; level: Level }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4cqw' }}>
      <span style={{ fontSize: '2.6cqw', fontWeight: 800, color: level.lamp }}>{side}</span>
      {tracks.map(([name, time], i) => (
        <div key={name} style={{ display: 'flex', gap: '1.5cqw', fontSize: '2.7cqw', fontWeight: 600 }}>
          <span style={{ opacity: 0.5, fontVariantNumeric: 'tabular-nums' }}>{i + 1}.</span>
          <span style={{ flex: 1 }}>{name}</span>
          <span style={{ opacity: 0.6, fontVariantNumeric: 'tabular-nums' }}>{time}</span>
        </div>
      ))}
    </div>
  )
}

export function SleeveBack({ level }: { level: Level }) {
  return (
    <Face background={level.sky} color={level.moth} style={{ display: 'flex', flexDirection: 'column', padding: '7cqw', gap: '5cqw', letterSpacing: '-0.012em' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ ...HEAVY, fontSize: '7cqw' }}>{OST.title}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6cqw' }}>
        <Tracks side="Side A" tracks={OST.sideA} level={level} />
        <Tracks side="Side B" tracks={OST.sideB} level={level} />
      </div>
      <p style={{ margin: 0, fontSize: '2.6cqw', lineHeight: 1.45, opacity: 0.7 }}>
        Written and recorded by {OST.artist} over the winter the game was made, on a piano, a tape machine and the
        radiator in the corner. Pressed on {OST.colour.toLowerCase()} vinyl, 180 g.
      </p>
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '2.4cqw', fontWeight: 600, opacity: 0.6 }}>
        <span>
          {OST.label} · {OST.catalog}
        </span>
        <span>33⅓ rpm · Stereo</span>
      </div>
    </Face>
  )
}

export function Label({ side, level }: { side: 'A' | 'B'; level: Level }) {
  return (
    <Face background={level.lamp} color={level.sky} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '12cqw 10cqw', textAlign: 'center' }}>
      <span style={{ ...HEAVY, fontSize: '13cqw' }}>{GAME.title}</span>
      <span style={{ fontSize: '6cqw', fontWeight: 800 }}>Side {side}</span>
      <span style={{ fontSize: '4.2cqw', fontWeight: 700, opacity: 0.7 }}>
        {OST.catalog} · 33⅓
      </span>
    </Face>
  )
}

export type { ReactNode }
