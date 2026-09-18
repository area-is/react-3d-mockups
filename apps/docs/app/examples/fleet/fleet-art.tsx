'use client'

import type { CSSProperties } from 'react'
import { chase } from 'tabbied/patterns'
import { Pattern } from '@/components/screens/swiss-art'
import { Face } from '../_shared/face'
import { COMPANY, PARCEL, type Livery } from './fleet-data'

/**
 * Northline's livery, as it prints on a trailer, a van, a box and a phone.
 *
 * A wrap is read at speed from three lanes over, so it is three things: a
 * field of marks at the front of the body, the name as large as the panel
 * allows, and one arrow. The field is `chase` from Tabbied - blocks of
 * lines in the livery's two inks - seeded, because a fleet is painted once.
 * Every measurement is in container units: the same component wraps the
 * trailer's 15 m side, the van's, and the top of a shipping box.
 */

const HEAVY: CSSProperties = { fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.86, textTransform: 'uppercase' }

/** The mark: an arrow, the length of its box. */
export function Arrow({ color, style }: { color: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 60" style={{ display: 'block', ...style }} aria-hidden>
      <path d="M4 30h86M66 8l24 22-24 22" fill="none" stroke={color} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** The field of marks, seeded per surface. */
function Field({ livery, seed, grid = '4x6' }: { livery: Livery; seed: string; grid?: string }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Pattern pattern={chase} seed={seed} palette={[livery.body, livery.ink, livery.accent]} grid={grid} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Vehicles                                                           */
/* ------------------------------------------------------------------ */

/**
 * A side panel, any width. The field takes the leading part, the name the
 * middle, the arrow and the contact the tail. `mirror` flips the order for
 * the street side, so the field is always at the rear of the body.
 *
 * `cab` is the fraction of the panel's trailing end that is the cab on a
 * full van wrap: the film runs over the cab door but the window is cut out
 * of it, so nothing that has to be read is set there. The type is sized
 * by whichever of the panel's height and width runs out first, because a
 * trailer side is six times wider than tall and a van's barely three.
 */
export function Side({ livery, seed, mirror, cab = 0 }: { livery: Livery; seed: string; mirror?: boolean; cab?: number }) {
  // The name has to fit the width left after the field, the tail and the
  // cab; on a wrap with a cab the field gives up some of its share.
  const field = cab ? 19 : 27
  const nameMax = (100 - cab * 100 - field - 14) / 5.6
  const reserve = `${cab * 100}cqw`
  return (
    <Face background={livery.body} color={livery.ink} style={{ display: 'flex', flexDirection: mirror ? 'row-reverse' : 'row' }}>
      <div style={{ position: 'relative', width: `${field}cqw`, flex: 'none', overflow: 'hidden' }}>
        <Field livery={livery} seed={seed} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '6cqh 3cqw', gap: '6cqh', minWidth: 0 }}>
        <span style={{ ...HEAVY, fontSize: `min(54cqh, ${nameMax}cqw)`, whiteSpace: 'nowrap' }}>{COMPANY.name}</span>
        <span style={{ fontSize: `min(13cqh, ${nameMax / 3.2}cqw)`, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, color: livery.accent, whiteSpace: 'nowrap' }}>{COMPANY.tag}</span>
      </div>
      <div
        style={{
          flex: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: mirror ? 'flex-start' : 'flex-end',
          justifyContent: 'center',
          gap: '8cqh',
          padding: '6cqh 3cqw',
          marginRight: mirror ? 0 : reserve,
          marginLeft: mirror ? reserve : 0,
        }}
      >
        <Arrow color={livery.accent} style={{ height: `min(30cqh, ${nameMax / 1.6}cqw)`, transform: mirror ? 'scaleX(-1)' : undefined }} />
        <span style={{ fontSize: `min(11cqh, ${nameMax / 3.6}cqw)`, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.3, textAlign: mirror ? 'left' : 'right', whiteSpace: 'nowrap' }}>
          {COMPANY.url}
          <br />
          {COMPANY.phone}
        </span>
      </div>
    </Face>
  )
}

/** The rear: the name stacked, the arrow pointing up the road. */
export function Rear({ livery, seed }: { livery: Livery; seed: string }) {
  return (
    <Face background={livery.body} color={livery.ink} style={{ display: 'flex', flexDirection: 'column', padding: '6cqw', gap: '5cqw' }}>
      <div style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Field livery={livery} seed={seed} grid="2x3" />
      </div>
      <span style={{ ...HEAVY, fontSize: '15cqw' }}>{COMPANY.name}</span>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '3cqw' }}>
        <span style={{ fontSize: '5.4cqw', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
          How is my
          <br />
          driving?
          <br />
          <span style={{ color: livery.accent }}>{COMPANY.phone}</span>
        </span>
        <Arrow color={livery.accent} style={{ width: '26cqw', transform: 'rotate(-90deg)' }} />
      </div>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  The box                                                            */
/* ------------------------------------------------------------------ */

/** The top of the mailer (513 x 364): the name and the field, taped over. */
export function BoxTop({ livery }: { livery: Livery }) {
  return (
    <Face background={livery.body} color={livery.ink} style={{ display: 'flex', padding: '5cqw', gap: '4cqw' }}>
      <div style={{ position: 'relative', width: '34cqw', flex: 'none', overflow: 'hidden' }}>
        <Field livery={livery} seed="northline-box" grid="2x3" />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
        <span style={{ ...HEAVY, fontSize: '9cqw' }}>{COMPANY.name}</span>
        <span style={{ fontSize: '3.6cqw', fontWeight: 700, lineHeight: 1.3, color: livery.accent }}>
          {COMPANY.tag}.
          <br />
          <span style={{ color: livery.ink }}>Handled by people who lift with their knees.</span>
        </span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '3.4cqw', fontWeight: 700, lineHeight: 1.3 }}>
            {COMPANY.url}
            <br />
            {COMPANY.phone}
          </span>
          <Arrow color={livery.accent} style={{ width: '18cqw' }} />
        </div>
      </div>
    </Face>
  )
}

/** A long side of the box (513 x 171). */
export function BoxSide({ livery }: { livery: Livery }) {
  return (
    <Face background={livery.body} color={livery.ink} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5cqw' }}>
      <span style={{ ...HEAVY, fontSize: '40cqh' }}>{COMPANY.name}</span>
      <span style={{ fontSize: '15cqh', fontWeight: 700, color: livery.accent, whiteSpace: 'nowrap' }}>{COMPANY.tag}</span>
    </Face>
  )
}

/** An end of the box (364 x 171): this way up. */
export function BoxEnd({ livery }: { livery: Livery }) {
  return (
    <Face background={livery.body} color={livery.ink} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4cqw' }}>
      <Arrow color={livery.accent} style={{ width: '16cqw', transform: 'rotate(-90deg)' }} />
      <span style={{ fontSize: '16cqh', fontWeight: 700, letterSpacing: '-0.01em' }}>This way up</span>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  The app                                                            */
/* ------------------------------------------------------------------ */

/** Track a parcel, on a Galaxy (360 x 780). */
export function TrackApp({ livery }: { livery: Livery }) {
  const INK = '#14213d'
  const PAPER = '#f4f5f7'
  const MUTED = '#6b7280'
  const doneCount = PARCEL.steps.filter((s) => s.done).length
  return (
    <Face background={PAPER} color={INK} style={{ display: 'flex', flexDirection: 'column', paddingTop: 'calc(var(--mockup-safe-area-top, 0px) + 8px)', letterSpacing: '-0.012em' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 20px 10px' }}>
        <span style={{ ...HEAVY, fontSize: 20 }}>{COMPANY.name}</span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: MUTED }}>Track</span>
      </header>
      <div style={{ position: 'relative', margin: '0 16px', height: 150, borderRadius: 18, overflow: 'hidden', background: livery.ink }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <Pattern pattern={chase} seed="northline-app" palette={[livery.ink, livery.accent, '#ffffff']} grid="4x6" />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${livery.ink} 45%, transparent 90%)` }} />
        <div style={{ position: 'absolute', left: 18, bottom: 16, color: '#fff' }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: livery.accent }}>Arriving</div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, marginTop: 4 }}>{PARCEL.eta}</div>
          <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.8, marginTop: 5 }}>
            {PARCEL.from} → {PARCEL.to}
          </div>
        </div>
      </div>
      <div style={{ padding: '16px 20px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.03em' }}>{PARCEL.id}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>
          {doneCount} of {PARCEL.steps.length}
        </span>
      </div>
      <div style={{ padding: '0 20px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {PARCEL.steps.map((step, i) => (
          <div key={step.what} style={{ display: 'grid', gridTemplateColumns: '18px 1fr auto', columnGap: 12, alignItems: 'start', padding: '11px 0' }}>
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingTop: 3 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: step.done ? livery.accent : 'transparent', border: `2px solid ${step.done ? livery.accent : '#cbd0d8'}`, boxSizing: 'border-box' }} />
              {i < PARCEL.steps.length - 1 ? <span style={{ width: 2, height: 22, background: step.done ? livery.accent : '#dfe3e8' }} /> : null}
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: step.done ? INK : MUTED }}>{step.what}</span>
              <span style={{ fontSize: 12, color: MUTED }}>{step.where}</span>
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: MUTED, fontVariantNumeric: 'tabular-nums' }}>{step.at}</span>
          </div>
        ))}
      </div>
      <div style={{ margin: '0 16px 26px', padding: '14px 18px', borderRadius: 999, background: livery.ink, color: '#fff', textAlign: 'center', fontSize: 14, fontWeight: 700 }}>
        Leave it with a neighbour
      </div>
    </Face>
  )
}
