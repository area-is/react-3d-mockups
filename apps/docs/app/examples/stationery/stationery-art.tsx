'use client'

import type { CSSProperties, ReactNode } from 'react'
import { tulle } from 'tabbied/patterns'
import { Pattern } from '@/components/screens/swiss-art'
import { SERIF } from '@/components/screens/label-art'
import { FONT } from '@/components/screens/swiss-art'
import { asset } from '@/lib/base-path.mjs'
import { Face } from '../_shared/face'
import { PALETTES, TABLES, TIMELINE, monogram, names, type Suite } from './stationery-data'

/**
 * The suite's four pieces, each a function of the `Suite` being typed.
 *
 * The typography is the whole design: a display face for the names (a
 * serif with an optical-size axis, or the sans, as the couple chooses), the
 * sans for everything small, and a great deal of paper. The ornaments are
 * `tulle` from Tabbied, a sparse field of dots in the accent, faint enough
 * to read as a texture in the stock rather than a print on it, and one
 * watercolour olive sprig over the names on the invitation and the sign - a
 * generated cut-out on a transparent ground (`/art/stationery-olive.webp`).
 */

function tone(suite: Suite) {
  return PALETTES.find((p) => p.id === suite.palette) ?? PALETTES[0]
}

function display(suite: Suite): CSSProperties {
  return suite.face === 'serif'
    ? { fontFamily: SERIF, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }
    : { fontFamily: FONT, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 0.95 }
}

/** The tulle, faint, under everything. */
function Tulle({ suite, seed, opacity = 0.22 }: { suite: Suite; seed: string; opacity?: number }) {
  const t = tone(suite)
  return (
    <div style={{ position: 'absolute', inset: 0, opacity, pointerEvents: 'none' }}>
      <Pattern pattern={tulle} seed={seed} palette={[t.paper, t.accent, t.ink]} grid="4x6" />
    </div>
  )
}

/** The olive sprig (606 x 640), set as a crest over the names. `width` is in cqw. */
function Sprig({ width, style }: { width: number; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset('/art/stationery-olive.webp')}
      alt=""
      draggable={false}
      decoding="async"
      style={{ display: 'block', position: 'relative', width: `${width}cqw`, height: 'auto', aspectRatio: 606 / 640, transform: 'rotate(-38deg)', ...style }}
    />
  )
}

function Small({ children, style, suite }: { children: ReactNode; style?: CSSProperties; suite: Suite }) {
  return (
    <span style={{ fontFamily: FONT, fontSize: '3.6cqw', fontWeight: 600, letterSpacing: '-0.005em', lineHeight: 1.4, color: tone(suite).accent, ...style }}>
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  The invitation (A7 card, 380 x 533 per panel)                      */
/* ------------------------------------------------------------------ */

export function InviteFront({ suite }: { suite: Suite }) {
  const t = tone(suite)
  const n = names(suite)
  return (
    <Face background={t.paper} color={t.ink} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '10cqw 8cqw' }}>
      <Tulle suite={suite} seed="ampersand-front" />
      <Small suite={suite}>{monogram(suite)}</Small>
      <Sprig width={30} style={{ marginTop: '2cqw' }} />
      <div style={{ marginTop: 'auto', marginBottom: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2cqw' }}>
        <span style={{ ...display(suite), fontSize: '15cqw' }}>{n.first}</span>
        <span style={{ ...display(suite), fontSize: '9cqw', color: t.accent, fontStyle: suite.face === 'serif' ? 'italic' : 'normal' }}>&amp;</span>
        <span style={{ ...display(suite), fontSize: '15cqw' }}>{n.second}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.6cqw' }}>
        <span style={{ fontFamily: FONT, fontSize: '3.8cqw', fontWeight: 600, letterSpacing: '-0.01em' }}>{suite.date || 'A date to be fixed'}</span>
        <Small suite={suite} style={{ color: t.ink, opacity: 0.7 }}>
          {suite.venue || 'Somewhere lovely'} · {suite.city || ''}
        </Small>
      </div>
    </Face>
  )
}

export function InviteInsideLeft({ suite }: { suite: Suite }) {
  const t = tone(suite)
  const n = names(suite)
  return (
    <Face background={t.paper} color={t.ink} style={{ display: 'flex', flexDirection: 'column', padding: '10cqw 9cqw', gap: '5cqw' }}>
      <Small suite={suite}>Together with their families</Small>
      <p style={{ margin: 0, ...display(suite), fontSize: '7.2cqw', lineHeight: 1.15 }}>
        {n.first} and {n.second} invite you to celebrate their marriage.
      </p>
      <p style={{ margin: 0, fontFamily: FONT, fontSize: '3.6cqw', lineHeight: 1.5, opacity: 0.85 }}>
        {suite.date || 'On a day to be fixed'}, at {suite.venue || 'a place to be fixed'}
        {suite.city ? `, ${suite.city}` : ''}. Dinner and dancing to follow. Children welcome, dogs encouraged.
      </p>
      <p style={{ margin: 'auto 0 0', fontFamily: FONT, fontSize: '3.2cqw', lineHeight: 1.5, opacity: 0.65 }}>
        Kindly reply by {suite.reply || 'the date on the card'} using the enclosed card, or at ampersand.pt/{n.first.toLowerCase()}
      </p>
    </Face>
  )
}

export function InviteInsideRight({ suite }: { suite: Suite }) {
  const t = tone(suite)
  return (
    <Face background={t.paper} color={t.ink} style={{ display: 'flex', flexDirection: 'column', padding: '10cqw 9cqw', gap: '4cqw' }}>
      <Small suite={suite}>The day</Small>
      {TIMELINE.map(([time, what, where]) => (
        <div key={time} style={{ display: 'grid', gridTemplateColumns: '14cqw 1fr', columnGap: '3cqw', alignItems: 'baseline', paddingBottom: '3cqw', borderBottom: `0.3cqw solid ${t.accent}` }}>
          <span style={{ fontFamily: FONT, fontSize: '3.6cqw', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{time}</span>
          <span style={{ display: 'flex', flexDirection: 'column', gap: '0.6cqw' }}>
            <span style={{ ...display(suite), fontSize: '6cqw' }}>{what}</span>
            <span style={{ fontFamily: FONT, fontSize: '3.2cqw', opacity: 0.7 }}>{where}</span>
          </span>
        </div>
      ))}
    </Face>
  )
}

export function InviteBack({ suite }: { suite: Suite }) {
  const t = tone(suite)
  return (
    <Face background={t.paper} color={t.ink} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '10cqw' }}>
      <Tulle suite={suite} seed="ampersand-back" opacity={0.45} />
      <Small suite={suite} style={{ position: 'relative', color: t.ink, opacity: 0.6 }}>
        Ampersand · Lisbon
      </Small>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  The reply card (520 x 298)                                          */
/* ------------------------------------------------------------------ */

export function ReplyFront({ suite }: { suite: Suite }) {
  const t = tone(suite)
  const line = (label: string) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2cqw', fontFamily: FONT, fontSize: '3cqw' }}>
      <span style={{ fontWeight: 600, opacity: 0.75 }}>{label}</span>
      <span style={{ flex: 1, borderBottom: `0.25cqw solid ${t.ink}`, opacity: 0.5, transform: 'translateY(-0.6cqw)' }} />
    </div>
  )
  return (
    <Face background={t.paper} color={t.ink} style={{ display: 'flex', flexDirection: 'column', padding: '6cqw 7cqw', gap: '3.6cqw' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ ...display(suite), fontSize: '7.5cqw' }}>Kindly reply</span>
        <Small suite={suite} style={{ fontSize: '2.6cqw' }}>by {suite.reply || 'soon'}</Small>
      </div>
      {line('Name(s)')}
      <div style={{ display: 'flex', gap: '6cqw', fontFamily: FONT, fontSize: '3cqw', fontWeight: 600 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '1.6cqw' }}>
          <span style={{ width: '3.4cqw', height: '3.4cqw', border: `0.3cqw solid ${t.ink}`, boxSizing: 'border-box' }} /> Joyfully accepts
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '1.6cqw' }}>
          <span style={{ width: '3.4cqw', height: '3.4cqw', border: `0.3cqw solid ${t.ink}`, boxSizing: 'border-box' }} /> Regretfully declines
        </span>
      </div>
      {line('Anything we should know')}
    </Face>
  )
}

export function ReplyBack({ suite }: { suite: Suite }) {
  const t = tone(suite)
  return (
    <Face background={t.paper} color={t.ink} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Tulle suite={suite} seed="ampersand-reply" opacity={0.5} />
      <span style={{ position: 'relative', ...display(suite), fontSize: '16cqw', color: t.accent }}>{monogram(suite)}</span>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  The welcome sign (A-frame, 420 x 667)                               */
/* ------------------------------------------------------------------ */

export function WelcomeSign({ suite }: { suite: Suite }) {
  const t = tone(suite)
  const n = names(suite)
  return (
    <Face background={t.paper} color={t.ink} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '12cqw 9cqw', gap: '4cqw' }}>
      <Tulle suite={suite} seed="ampersand-sign" />
      <Small suite={suite}>Welcome to the wedding of</Small>
      <Sprig width={28} />
      <div style={{ marginTop: 'auto', marginBottom: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5cqw', position: 'relative' }}>
        <span style={{ ...display(suite), fontSize: '17cqw' }}>{n.first}</span>
        <span style={{ ...display(suite), fontSize: '9cqw', color: t.accent, fontStyle: suite.face === 'serif' ? 'italic' : 'normal' }}>&amp;</span>
        <span style={{ ...display(suite), fontSize: '17cqw' }}>{n.second}</span>
      </div>
      <span style={{ position: 'relative', fontFamily: FONT, fontSize: '3.8cqw', fontWeight: 600 }}>{suite.date || 'Today'}</span>
      <Small suite={suite} style={{ position: 'relative', color: t.ink, opacity: 0.65 }}>
        Ceremony at {TIMELINE[0][0]} · Please take a seat anywhere
      </Small>
    </Face>
  )
}

/** The back of the sign: what happens after. */
export function SignBack({ suite }: { suite: Suite }) {
  const t = tone(suite)
  return (
    <Face background={t.paper} color={t.ink} style={{ display: 'flex', flexDirection: 'column', padding: '12cqw 10cqw', gap: '5cqw' }}>
      <Small suite={suite}>After the ceremony</Small>
      {TIMELINE.slice(1).map(([time, what, where]) => (
        <div key={time} style={{ display: 'flex', flexDirection: 'column', gap: '1cqw', paddingBottom: '4cqw', borderBottom: `0.3cqw solid ${t.accent}` }}>
          <span style={{ ...display(suite), fontSize: '9cqw' }}>{what}</span>
          <span style={{ fontFamily: FONT, fontSize: '3.6cqw', fontWeight: 600, opacity: 0.75 }}>
            {time} · {where}
          </span>
        </div>
      ))}
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  The table plan (18 x 24 poster, 540 x 726)                          */
/* ------------------------------------------------------------------ */

export function TablePlan({ suite }: { suite: Suite }) {
  const t = tone(suite)
  const n = names(suite)
  return (
    <Face background={t.paper} color={t.ink} style={{ display: 'flex', flexDirection: 'column', padding: '8cqw', gap: '5cqw' }}>
      <Tulle suite={suite} seed="ampersand-plan" opacity={0.16} />
      <div style={{ position: 'relative', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5cqw' }}>
        <Small suite={suite}>
          {n.first} &amp; {n.second} · {suite.date || ''}
        </Small>
        <span style={{ ...display(suite), fontSize: '11cqw' }}>Find your seat</span>
      </div>
      <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '1fr', gap: '4cqw 6cqw' }}>
        {TABLES.map(([table, guests]) => (
          <div key={table} style={{ display: 'flex', flexDirection: 'column', gap: '1.2cqw', minHeight: 0 }}>
            <span style={{ ...display(suite), fontSize: '4.8cqw', color: t.accent, paddingBottom: '1cqw', borderBottom: `0.3cqw solid ${t.accent}` }}>{table}</span>
            {guests.map((g) => (
              <span key={g} style={{ fontFamily: FONT, fontSize: '2.7cqw', fontWeight: 500, lineHeight: 1.25 }}>
                {g}
              </span>
            ))}
          </div>
        ))}
      </div>
    </Face>
  )
}
