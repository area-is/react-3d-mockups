'use client'

import type { CSSProperties, ReactNode } from 'react'
import { annulus, damier } from 'tabbied/patterns'
import { Pattern } from '@/components/screens/swiss-art'
import { SERIF } from '@/components/screens/label-art'
import { Face } from '../_shared/face'
import { BAKES, DRINKS, SHOP, price, type MenuItem } from './cafe-data'

/**
 * Everything Ninefold prints, paints and chalks.
 *
 * Four objects, one small identity: a serif wordmark (Fraunces, the face
 * the site's printed objects already set their display type in), cream on
 * the shop's paint, and a ring pattern from Tabbied - `annulus`, rings that
 * thicken row by row, which on a coffee shop reads as cups seen from above
 * - printed in oat and green. The pattern is seeded everywhere: a shopfront
 * and a milk carton do not redraw themselves.
 *
 * Measurements are in container units, so the same poster fits the
 * storefront's 480 px display bay and the carton's 420 px wall.
 */

export const CREAM = '#f3ead9'
export const INK = '#24201a'
export const OAT = '#d5a860'
export const TERRACOTTA = '#c65d3b'

const WORDMARK: CSSProperties = { fontFamily: SERIF, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 0.9 }

/* ------------------------------------------------------------------ */
/*  The storefront                                                     */
/* ------------------------------------------------------------------ */

/** The fascia sign (800 x 67): the name, the trade, painted on the paint. */
export function Fascia({ paint, sub = SHOP.kind }: { paint: string; sub?: string }) {
  return (
    <Face background={paint} color={CREAM} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4cqw' }}>
      <span style={{ ...WORDMARK, fontSize: '62cqh', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{SHOP.name}</span>
      <span style={{ fontSize: '28cqh', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.85 }}>{sub}</span>
    </Face>
  )
}

/** A window poster: a ring print, a line of type. On every pane but the door. */
export function WindowPoster({ title, sub, seed, paint }: { title: string; sub: string; seed: string; paint: string }) {
  return (
    <Face background={CREAM} color={INK} style={{ display: 'flex', flexDirection: 'column', padding: '6cqw', gap: '4cqw' }}>
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <Pattern pattern={annulus} seed={seed} palette={[CREAM, paint, OAT, INK]} grid="4x6" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '3cqw' }}>
        <span style={{ ...WORDMARK, fontSize: '9cqw' }}>{title}</span>
        <span style={{ fontSize: '4cqw', fontWeight: 600, letterSpacing: '-0.01em', textAlign: 'right', opacity: 0.75, whiteSpace: 'pre-line' }}>{sub}</span>
      </div>
    </Face>
  )
}

/** The glazed door (260 x 726): the hanging sign, and the hours under it. */
export function Door({ open, paint }: { open: boolean; paint: string }) {
  return (
    <Face background="transparent" color={CREAM} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14cqw 10cqw' }}>
      <div
        style={{
          width: '78cqw',
          padding: '8cqw 6cqw',
          background: open ? paint : INK,
          color: CREAM,
          textAlign: 'center',
          boxShadow: '0 1.5cqw 3cqw rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '3cqw',
          transition: 'background 0.4s ease',
        }}
      >
        <span style={{ fontSize: '4.2cqw', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.8 }}>{open ? "We're" : "Sorry, we're"}</span>
        <span style={{ ...WORDMARK, fontSize: '19cqw', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{open ? 'Open' : 'Closed'}</span>
        <span style={{ fontSize: '4.2cqw', fontWeight: 600, lineHeight: 1.35, opacity: 0.8 }}>{open ? 'Come in, the bread is warm' : 'Back tomorrow at 7'}</span>
      </div>
      <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: '4cqw', fontWeight: 600, lineHeight: 1.5, color: CREAM, textShadow: '0 0 2cqw rgba(0,0,0,0.5)', whiteSpace: 'pre-line' }}>
        {SHOP.hours.replace(/ · /g, '\n')}
      </div>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  The A-frame                                                        */
/* ------------------------------------------------------------------ */

/** Chalk on the board: the day's list, in the same array the page prints. */
function ChalkList({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.2cqw' }}>
      <span style={{ ...WORDMARK, fontStyle: 'italic', fontWeight: 500, fontSize: '7cqw', color: OAT }}>{title}</span>
      {items.map((item) => (
        <div key={item.name} style={{ display: 'flex', alignItems: 'baseline', gap: '2cqw', fontSize: '4.1cqw', fontWeight: 600, letterSpacing: '-0.01em' }}>
          <span>{item.name}</span>
          <span style={{ flex: 1, borderBottom: '0.3cqw dotted rgba(243,234,217,0.4)', transform: 'translateY(-0.9cqw)' }} />
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{price(item.price)}</span>
        </div>
      ))}
    </div>
  )
}

/** The front of the board (420 x 667): today's drinks and bakes. */
export function BoardFront() {
  return (
    <Face background="transparent" color={CREAM} style={{ display: 'flex', flexDirection: 'column', padding: '9cqw 8cqw', gap: '6cqw' }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ ...WORDMARK, fontSize: '13cqw', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{SHOP.name}</span>
        <div style={{ fontSize: '3.6cqw', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.75, marginTop: '1.5cqw' }}>Today</div>
      </div>
      <ChalkList title="Coffee" items={DRINKS} />
      <ChalkList title="From the oven" items={BAKES} />
      <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: '3.4cqw', fontWeight: 600, opacity: 0.7 }}>Oat milk is ours · Cards welcome</div>
    </Face>
  )
}

/** The back of the board: one line for the people walking the other way. */
export function BoardBack() {
  return (
    <Face background="transparent" color={CREAM} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10cqw', textAlign: 'center', gap: '5cqw' }}>
      <span style={{ ...WORDMARK, fontStyle: 'italic', fontWeight: 500, fontSize: '9cqw', color: OAT }}>Bread comes out at</span>
      <span style={{ ...WORDMARK, fontSize: '30cqw' }}>7:30</span>
      <span style={{ fontSize: '4cqw', fontWeight: 600, lineHeight: 1.5, opacity: 0.8 }}>Buns at 8, 11 and 3.
        <br />
        When it is gone, it is gone.</span>
      <span style={{ marginTop: '6cqw', ...WORDMARK, fontSize: '7cqw', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{SHOP.name}</span>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  The oat milk                                                       */
/* ------------------------------------------------------------------ */

export const BOARD = '#efe6d3'
const CARTON_GREEN = '#2e4638'

/** The carton's walls (420 x 864). Front carries the name; the others, the rings. */
export function CartonFace({ side, seed }: { side: 'front' | 'back' | 'side'; seed: string }) {
  return (
    <Face background={BOARD} color={INK} style={{ display: 'flex', flexDirection: 'column', padding: '8cqw 7cqw', gap: '4cqw' }}>
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <Pattern pattern={annulus} seed={seed} palette={[BOARD, CARTON_GREEN, OAT, INK]} grid="4x6" />
      </div>
      {side === 'front' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6cqw' }}>
          <span style={{ ...WORDMARK, fontSize: '17cqw', color: CARTON_GREEN }}>Ninefold Oat</span>
          <span style={{ fontSize: '4.6cqw', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.3 }}>Barista oat drink · made to steam</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '4cqw', fontWeight: 600, opacity: 0.7, marginTop: '1cqw' }}>
            <span>1 L</span>
            <span>Roasted in {SHOP.city}</span>
          </div>
        </div>
      ) : side === 'back' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2cqw', fontSize: '3.7cqw', lineHeight: 1.45 }}>
          <span style={{ ...WORDMARK, fontSize: '8cqw', color: CARTON_GREEN }}>What is in it</span>
          <span>Water, Portuguese oats (11 %), rapeseed oil, a pinch of salt, calcium. Nothing else - which is why it froths.</span>
          <span style={{ fontWeight: 600, opacity: 0.7 }}>Shake well · Keep cold · Best within 5 days of opening</span>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ ...WORDMARK, fontSize: '9cqw', color: CARTON_GREEN }}>Ninefold</span>
          <span style={{ fontSize: '4cqw', fontWeight: 600, opacity: 0.7 }}>Oat · 1 L</span>
        </div>
      )}
    </Face>
  )
}

/** The roof panels (432 x 255): a strip of rings, the cap riding over the front one. */
export function CartonGable() {
  return (
    <Face background={BOARD} color={INK} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.9 }}>
        <Pattern pattern={annulus} seed="ninefold-gable" palette={[BOARD, CARTON_GREEN, OAT]} grid="2x3" />
      </div>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  The loyalty card                                                   */
/* ------------------------------------------------------------------ */

/** Front (520 x 298): nine cups, three of them had. */
export function CardFront({ stamped = 3 }: { stamped?: number }) {
  return (
    <Face background={CREAM} color={INK} style={{ display: 'flex', padding: '6cqw 7cqw', gap: '6cqw', alignItems: 'center' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2cqw' }}>
        <span style={{ ...WORDMARK, fontSize: '9cqw' }}>{SHOP.name}</span>
        <span style={{ fontSize: '3.4cqw', fontWeight: 600, lineHeight: 1.35, opacity: 0.75 }}>Nine coffees, then one on us.</span>
        <span style={{ marginTop: 'auto', fontSize: '2.6cqw', fontWeight: 600, opacity: 0.55 }}>{SHOP.address} · {SHOP.city}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.4cqw', flex: 'none' }} aria-hidden>
        {Array.from({ length: 9 }, (_, i) => (
          <span
            key={i}
            style={{
              width: '9cqw',
              height: '9cqw',
              borderRadius: '50%',
              border: `0.5cqw solid ${INK}`,
              background: i < stamped ? INK : 'transparent',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: CREAM,
              fontSize: '4cqw',
              fontWeight: 700,
            }}
          >
            {i < stamped ? '✓' : ''}
          </span>
        ))}
      </div>
    </Face>
  )
}

/** Back: the rings in the paint, and the hours. */
export function CardBack({ paint }: { paint: string }) {
  return (
    <Face background={paint} color={CREAM} style={{ display: 'flex', flexDirection: 'column', padding: '6cqw 7cqw' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>
        <Pattern pattern={damier} seed="ninefold-card" palette={[paint, CREAM, OAT]} grid="4x6" />
      </div>
      <div style={{ position: 'relative', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <span style={{ ...WORDMARK, fontSize: '11cqw', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{SHOP.name}</span>
        <span style={{ fontSize: '2.8cqw', fontWeight: 600, lineHeight: 1.5, textAlign: 'right', whiteSpace: 'pre-line' }}>{SHOP.hours.replace(/ · /g, '\n')}</span>
      </div>
    </Face>
  )
}

/** A hairline the page reuses between sections. */
export const rule = (color = INK): CSSProperties => ({ height: 1, background: color, opacity: 0.15 })
export type { ReactNode }
