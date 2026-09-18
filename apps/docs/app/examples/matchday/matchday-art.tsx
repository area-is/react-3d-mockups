'use client'

import type { CSSProperties, ReactNode } from 'react'
import { Face } from '../_shared/face'
import { asset } from '@/lib/base-path.mjs'
import { CLUB, MATCH, PASS, clock, lastGoal } from './matchday-data'

/**
 * Alcântara FC on a coach, a broadcast, a wrist and a lanyard.
 *
 * The club's identity is a green, a gold, a heavy sans and a striker: the
 * player is a generated cut-out on a transparent ground
 * (`/art/player.webp`), so he stands ON the coach's green and in front of
 * the broadcast's pitch rather than in a rectangle. The clock on the TV
 * and the watch is the same number, handed in by the page, and it runs.
 */

const HEAVY: CSSProperties = { fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.86, textTransform: 'uppercase' }
const TAB: CSSProperties = { fontVariantNumeric: 'tabular-nums' }

/** The crest: a shield, the initials, a star for the one title. */
export function Crest({ size, style }: { size: string | number; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 116" style={{ width: size, height: 'auto', display: 'block', flex: 'none', ...style }} aria-hidden>
      <path d="M50 4 92 18v44c0 26-19 42-42 50C27 104 8 88 8 62V18z" fill={CLUB.gold} />
      <path d="M50 12 84 23v39c0 21-15 34-34 41-19-7-34-20-34-41V23z" fill={CLUB.green} />
      <text x="50" y="72" textAnchor="middle" fontFamily="var(--font-inter), Inter, sans-serif" fontWeight="800" fontSize="34" fill={CLUB.white} letterSpacing="-2">
        AFC
      </text>
      <path d="m50 30 3.4 7 7.6 1-5.5 5.3 1.3 7.6L50 47.3 43.2 51l1.3-7.6L39 38.1l7.6-1z" fill={CLUB.gold} />
    </svg>
  )
}

export function Player({ height, left, right, bottom = '-3cqh', style }: { height: string; left?: string; right?: string; bottom?: string; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset('/art/player.webp')}
      alt=""
      draggable={false}
      style={{ position: 'absolute', left, right, bottom, height, width: 'auto', aspectRatio: '1024 / 1473', pointerEvents: 'none', ...style }}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  The coach                                                          */
/* ------------------------------------------------------------------ */

/**
 * A full side of the coach (1920 x 455), printed as perforated film over
 * the glass. The doors stay clear of any wrap, and on the curb side there
 * are two of them - one a third of the way along, one at the cab - so the
 * side is laid out in zones: the striker and the crest at the rear, the
 * name in the long stretch between the doors, nothing over the cab. The
 * street side has no doors and runs the same zones without the gaps.
 */
export function CoachSide({ doors }: { doors?: boolean }) {
  return (
    <Face background={CLUB.green} color={CLUB.white}>
      <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '7cqh', background: CLUB.gold }} />
      {/* the rear: the striker, and the crest above his shoulder */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '32cqw' }}>
        <Player height="108cqh" left="2cqw" bottom="-3cqh" />
        <Crest size="9cqw" style={{ position: 'absolute', right: '2cqw', top: '10cqh' }} />
      </div>
      {/* the long stretch: the name, the motto */}
      <div
        style={{
          position: 'absolute',
          left: doors ? '49cqw' : '36cqw',
          width: doors ? '34cqw' : '58cqw',
          top: 0,
          bottom: '7cqh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '7cqh',
        }}
      >
        <span style={{ ...HEAVY, fontSize: doors ? '5.3cqw' : '8.6cqw', whiteSpace: 'nowrap' }}>{CLUB.name}</span>
        <span style={{ fontSize: doors ? '2cqw' : '2.8cqw', fontWeight: 700, letterSpacing: '-0.02em', color: CLUB.gold, whiteSpace: 'nowrap' }}>
          {CLUB.motto} · Since {CLUB.founded}
        </span>
      </div>
    </Face>
  )
}

/** The tail of the coach. */
export function CoachRear() {
  return (
    <Face background={CLUB.green} color={CLUB.white} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4cqw', padding: '6cqw' }}>
      <Crest size="26cqw" />
      <span style={{ ...HEAVY, fontSize: '9cqw', textAlign: 'center' }}>{CLUB.motto}</span>
      <span style={{ fontSize: '3.4cqw', fontWeight: 700, color: CLUB.gold }}>alcantarafc.pt</span>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  The broadcast (1920 x 1080)                                        */
/* ------------------------------------------------------------------ */

/** The score bug every broadcast carries top-left, with the live clock. */
function ScoreBug({ seconds, size = 1 }: { seconds: number; size?: number }) {
  const s = (n: number) => n * size
  return (
    <div style={{ display: 'inline-flex', alignItems: 'stretch', borderRadius: s(10), overflow: 'hidden', fontWeight: 800, letterSpacing: '-0.02em', boxShadow: `0 ${s(6)}px ${s(24)}px rgba(0,0,0,0.35)` }}>
      <span style={{ display: 'flex', alignItems: 'center', padding: `${s(10)}px ${s(18)}px`, background: CLUB.green, color: CLUB.white, fontSize: s(26) }}>{MATCH.home.short}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: s(10), padding: `${s(10)}px ${s(18)}px`, background: '#0c0f14', color: '#fff', fontSize: s(30), ...TAB }}>
        {MATCH.score.home}
        <span style={{ opacity: 0.4 }}>–</span>
        {MATCH.score.away}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', padding: `${s(10)}px ${s(18)}px`, background: '#1f2a44', color: '#fff', fontSize: s(26) }}>{MATCH.away.short}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: s(8), padding: `${s(10)}px ${s(18)}px`, background: '#fff', color: '#0c0f14', fontSize: s(24), ...TAB }}>
        <span style={{ width: s(9), height: s(9), borderRadius: '50%', background: '#e11d48' }} />
        {clock(seconds)}
      </span>
    </div>
  )
}

export function Broadcast({ seconds }: { seconds: number }) {
  const goal = lastGoal()
  return (
    <Face background={CLUB.deep} color={CLUB.white} style={{ letterSpacing: '-0.012em' }}>
      {/* the pitch: a wash of turf and its markings, seen from the gantry */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(90% 70% at 50% 100%, #1f7a45 0%, #14532d 55%, ${CLUB.deep} 100%)` }} />
      <div aria-hidden style={{ position: 'absolute', left: '-10%', right: '-10%', bottom: '8%', height: '46%', border: '3px solid rgba(255,255,255,0.35)', borderBottom: 0, transform: 'perspective(900px) rotateX(58deg)', transformOrigin: 'bottom' }} />
      <div aria-hidden style={{ position: 'absolute', left: '30%', right: '30%', bottom: '8%', height: '18%', border: '3px solid rgba(255,255,255,0.35)', borderBottom: 0, transform: 'perspective(900px) rotateX(58deg)', transformOrigin: 'bottom' }} />
      <Player height="92%" left="52%" bottom="-4%" />
      <div style={{ position: 'absolute', left: 60, top: 52 }}>
        <ScoreBug seconds={seconds} size={1.15} />
      </div>
      <div style={{ position: 'absolute', right: 60, top: 58, textAlign: 'right', fontSize: 20, fontWeight: 700, opacity: 0.85 }}>
        {MATCH.competition}
        <br />
        <span style={{ opacity: 0.7 }}>{CLUB.ground}</span>
      </div>
      {/* the lower third */}
      <div style={{ position: 'absolute', left: 60, bottom: 70, display: 'flex', alignItems: 'stretch', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '18px 30px', background: CLUB.gold, color: CLUB.deep }}>
          <span style={{ ...HEAVY, fontSize: 44 }}>Goal</span>
          <span style={{ fontSize: 18, fontWeight: 700, marginTop: 4, ...TAB }}>{goal.minute}&rsquo;</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, padding: '18px 34px', background: 'rgba(12, 15, 20, 0.9)', minWidth: 420 }}>
          <span style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{goal.who}</span>
          <span style={{ fontSize: 17, fontWeight: 600, opacity: 0.75 }}>
            {CLUB.name} · second of the afternoon · {MATCH.score.home}–{MATCH.score.away}
          </span>
        </div>
      </div>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  The watch (240 x 240, round)                                       */
/* ------------------------------------------------------------------ */

export function WatchTracker({ seconds }: { seconds: number }) {
  const goal = lastGoal()
  return (
    <Face background="#000" color="#fff" style={{ borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, textAlign: 'center', letterSpacing: '-0.012em' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `10px solid ${CLUB.green}`, boxSizing: 'border-box' }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: CLUB.gold, display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#e11d48' }} /> Live · {clock(seconds)}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 800 }}>{MATCH.home.short}</span>
        <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1, ...TAB }}>
          {MATCH.score.home}–{MATCH.score.away}
        </span>
        <span style={{ fontSize: 15, fontWeight: 800, opacity: 0.6 }}>{MATCH.away.short}</span>
      </div>
      <span style={{ fontSize: 11.5, fontWeight: 600, opacity: 0.75 }}>
        ⚽ {goal.who} {goal.minute}&rsquo;
      </span>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  The season pass (420 x 666)                                        */
/* ------------------------------------------------------------------ */

export function SeasonPass() {
  const row = (label: string, value: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8cqw' }}>
      <span style={{ fontSize: '2.8cqw', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.6 }}>{label}</span>
      <span style={{ fontSize: '4.6cqw', fontWeight: 800, letterSpacing: '-0.02em' }}>{value}</span>
    </div>
  )
  return (
    <Face background={CLUB.green} color={CLUB.white} style={{ display: 'flex', flexDirection: 'column', padding: '7cqw', letterSpacing: '-0.012em' }}>
      <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, top: '46cqh', height: '2cqw', background: CLUB.gold }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '3cqw', marginTop: '12cqw' }}>
        <Crest size="16cqw" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1cqw' }}>
          <span style={{ ...HEAVY, fontSize: '7.2cqw' }}>{CLUB.name}</span>
          <span style={{ fontSize: '3.4cqw', fontWeight: 700, color: CLUB.gold }}>Season ticket · {PASS.season}</span>
        </div>
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '4cqw' }}>
        <span style={{ ...HEAVY, fontSize: '10cqw' }}>{PASS.holder}</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3.5cqw 4cqw' }}>
          {row('Stand', PASS.stand)}
          {row('Block', PASS.block)}
          {row('Row', PASS.row)}
          {row('Seat', PASS.seat)}
        </div>
        {/* a barcode: the bars a turnstile reads, drawn from the number */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6cqw', height: '9cqw', marginTop: '2cqw' }} aria-hidden>
          {PASS.number.replace(/\s/g, '').split('').map((d, i) => (
            <span key={i} style={{ width: `${0.8 + (Number(d) % 3) * 0.5}cqw`, height: '100%', background: CLUB.white, opacity: 0.9 }} />
          ))}
        </div>
        <span style={{ fontSize: '3cqw', fontWeight: 600, letterSpacing: '0.08em', opacity: 0.75, ...TAB }}>{PASS.number}</span>
      </div>
    </Face>
  )
}

export type { ReactNode }
