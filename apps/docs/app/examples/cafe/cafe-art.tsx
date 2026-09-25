'use client'

import type { CSSProperties, ReactNode } from 'react'
import { annulus } from 'tabbied/patterns'
import { Pattern } from '@/components/screens/swiss-art'
import { mix } from '@/components/screens/sample-kit'
import { SERIF } from '@/components/screens/label-art'
import { asset } from '@/lib/base-path.mjs'
import { Face } from '../_shared/face'
import { BAKES, DRINKS, SHOP, price, type MenuItem } from './cafe-data'

/**
 * Everything Ninefold prints, paints and chalks.
 *
 * Four objects, one small identity: a serif wordmark (Fraunces, the face
 * the site's printed objects already set their display type in), cream on
 * the shop's paint, and oat and green. The windows carry a ring pattern
 * from Tabbied - `annulus`, rings that thicken row by row, which on a coffee
 * shop reads as cups seen from above - as vinyl on the glass; it stays on
 * the windows, so the carton and the card are drawn instead from the
 * things themselves: oats, a glass of the drink, a rubber stamp. The
 * pattern is seeded: a shopfront does not redraw itself.
 *
 * The pictures are generated cut-outs on a transparent ground
 * (`/art/cafe-*.webp`): a flat white and a cardamom bun in the two front
 * display bays, a sheaf of oats and a glass of oat milk on the carton, the
 * stamp on the card and the flat white again on its back.
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
      <span style={{ ...WORDMARK, fontSize: '66cqh' }}>{SHOP.name}</span>
      <span style={{ fontSize: '32cqh', fontWeight: 600, letterSpacing: '-0.01em', opacity: 0.85 }}>{sub}</span>
    </Face>
  )
}

/** What a poster can show in front of its rings: the cut-out and its width over height. */
const POSTER_ART = {
  flatwhite: { src: '/art/cafe-flatwhite.webp', aspect: 640 / 539 },
  bun: { src: '/art/cafe-bun.webp', aspect: 640 / 566 },
} as const

/**
 * The sheen on a pane: a highlight down the top and a shadow into the foot.
 * The slot paints the glass tint underneath (see `cafe-scenes.tsx`); this is
 * what makes the tint read as glass.
 */
const SHEEN = 'linear-gradient(168deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 32%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.22) 100%)'

/**
 * A window: the ring print and a line of type, as vinyl on the glass. On
 * every pane but the door.
 *
 * The glass is the ground. It used to be a cream sheet over the whole pane,
 * which read as a poster pasted over the window rather than lettering on it;
 * now only the marks go down, in the shop's colours lifted so they read on
 * dark glass - cream and oat, and the paint mixed toward cream. `art` stands
 * the thing on sale in the window, with the rings fading out around it
 * rather than a panel behind it.
 */
export function WindowPoster({ title, sub, seed, paint, art }: { title: string; sub: string; seed: string; paint: string; art?: keyof typeof POSTER_ART }) {
  const picture = art ? POSTER_ART[art] : null
  const knockout = 'radial-gradient(closest-side at 50% 52%, transparent 52%, #000 86%)'
  return (
    <Face background={SHEEN} color={CREAM} style={{ display: 'flex', flexDirection: 'column', padding: '6cqw', gap: '4cqw', textShadow: '0 0.3cqw 1.2cqw rgba(0,0,0,0.25)' }}>
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.82, ...(picture ? { WebkitMaskImage: knockout, maskImage: knockout } : null) }}>
          <Pattern pattern={annulus} seed={seed} palette={['transparent', CREAM, OAT, mix(paint, CREAM, 0.45)]} grid="4x6" />
        </div>
        {picture ? (
          <div style={{ position: 'absolute', inset: 0, containerType: 'size' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(picture.src)}
              alt=""
              draggable={false}
              decoding="async"
              style={{
                position: 'absolute',
                left: '50%',
                top: '52%',
                height: 'min(80cqh, 64cqw)',
                width: 'auto',
                aspectRatio: picture.aspect,
                transform: 'translate(-50%, -50%)',
                filter: 'drop-shadow(0 2cqh 2.4cqh rgba(0, 0, 0, 0.45))',
              }}
            />
          </div>
        ) : null}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '3cqw' }}>
        <span style={{ ...WORDMARK, fontSize: '9cqw' }}>{title}</span>
        <span style={{ fontSize: '4cqw', fontWeight: 600, letterSpacing: '-0.01em', textAlign: 'right', opacity: 0.85, whiteSpace: 'pre-line' }}>{sub}</span>
      </div>
    </Face>
  )
}

/**
 * The glazed door (260 x 726): the hanging sign, and the hours under it.
 *
 * The slot paints the glass tint underneath; this face only adds the sheen -
 * a highlight down the top and a shadow into the foot - so the pane reads as
 * glass without being transparent. Transparent would show the rear window's
 * poster straight through the shop.
 */
export function Door({ open, paint }: { open: boolean; paint: string }) {
  return (
    <Face
      background={SHEEN}
      color={CREAM}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14cqw 10cqw' }}
    >
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
        <span style={{ fontSize: '5cqw', fontWeight: 600, letterSpacing: '-0.01em', opacity: 0.8 }}>{open ? "We're" : "Sorry, we're"}</span>
        <span style={{ ...WORDMARK, fontSize: '21cqw' }}>{open ? 'Open' : 'Closed'}</span>
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
        <span style={{ ...WORDMARK, fontSize: '14cqw' }}>{SHOP.name}</span>
        <div style={{ fontSize: '4.4cqw', fontWeight: 600, letterSpacing: '-0.01em', opacity: 0.75, marginTop: '1.5cqw' }}>Today</div>
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
      <span style={{ marginTop: '6cqw', ...WORDMARK, fontSize: '8cqw' }}>{SHOP.name}</span>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  The oat milk                                                       */
/* ------------------------------------------------------------------ */

export const BOARD = '#efe6d3'
const CARTON_GREEN = '#2e4638'

/** A cut-out on a carton or a card, by its path and its width over height. */
function Picture({ src, aspect, style }: { src: string; aspect: number; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={asset(src)} alt="" draggable={false} decoding="async" style={{ position: 'absolute', height: 'auto', aspectRatio: aspect, ...style }} />
  )
}

const OATS = { src: '/art/cafe-oats.webp', aspect: 356 / 520 }
const GLASS = { src: '/art/cafe-oatglass.webp', aspect: 640 / 672 }
const FLATWHITE = { src: '/art/cafe-flatwhite.webp', aspect: 640 / 539 }

/** The carton's green foot, where every wall of it stands. */
function Foot({ children }: { children?: ReactNode }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '15cqw', background: CARTON_GREEN, color: CREAM, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 7cqw', fontSize: '4cqw', fontWeight: 600, letterSpacing: '-0.01em' }}>
      {children}
    </div>
  )
}

/**
 * The carton's walls (420 x 864), each a job of its own: the front sells it
 * (a sheaf of oats in a pool of oat colour, the name set large), one side
 * shows it poured, the other says what is in it, and the back is the
 * barista's page. A green foot runs round all four.
 */
export function CartonFace({ side }: { side: 'front' | 'back' | 'left' | 'right' }) {
  if (side === 'front') {
    return (
      <Face background={BOARD} color={INK} style={{ display: 'flex', flexDirection: 'column', padding: '8cqw 7cqw 21cqw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ ...WORDMARK, fontSize: '8cqw', color: CARTON_GREEN }}>{SHOP.name}</span>
          <span style={{ fontSize: '3.4cqw', fontWeight: 700, color: CREAM, background: CARTON_GREEN, padding: '1cqw 2.6cqw', borderRadius: '99cqw' }}>Barista</span>
        </div>
        <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
          <div style={{ position: 'absolute', left: '50%', top: '50%', width: '74cqw', height: '74cqw', transform: 'translate(-50%, -52%)', borderRadius: '50%', background: `radial-gradient(closest-side, ${mix(OAT, BOARD, 0.35)} 0%, ${mix(OAT, BOARD, 0.72)} 72%, transparent 100%)` }} />
          <Picture src={OATS.src} aspect={OATS.aspect} style={{ left: '50%', top: '50%', height: '92%', transform: 'translate(-50%, -50%) rotate(-4deg)', filter: 'drop-shadow(0 1.4cqw 1.6cqw rgba(36,32,26,0.22))' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6cqw' }}>
          <span style={{ ...WORDMARK, fontSize: '19cqw', color: CARTON_GREEN }}>Oat</span>
          <span style={{ fontSize: '4.8cqw', fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.3 }}>Barista oat drink, made to steam</span>
        </div>
        <Foot>
          <span>1 L</span>
          <span>Made in {SHOP.city}</span>
        </Foot>
      </Face>
    )
  }
  if (side === 'left') {
    return (
      <Face background={BOARD} color={INK} style={{ display: 'flex', flexDirection: 'column', padding: '9cqw 7cqw 21cqw', gap: '3cqw' }}>
        <span style={{ ...WORDMARK, fontSize: '13cqw', color: CARTON_GREEN, lineHeight: 0.95 }}>
          Pour,
          <br />
          steam,
          <br />
          pour.
        </span>
        <span style={{ fontSize: '4.4cqw', fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.35, opacity: 0.8 }}>It froths like milk and tastes of oats, and it holds a rosetta.</span>
        <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
          <Picture src={GLASS.src} aspect={GLASS.aspect} style={{ left: '50%', bottom: 0, width: '100%', maxHeight: '100%', objectFit: 'contain', transform: 'translateX(-50%)' }} />
        </div>
        <Foot>
          <span style={{ ...WORDMARK, fontSize: '6cqw' }}>{SHOP.name}</span>
          <span>Oat · 1 L</span>
        </Foot>
      </Face>
    )
  }
  if (side === 'right') {
    const rows: [string, string][] = [
      ['Energy', '59 kcal'],
      ['Fat', '3.0 g'],
      ['of which saturates', '0.3 g'],
      ['Carbohydrate', '6.7 g'],
      ['of which sugars', '4.0 g'],
      ['Fibre', '0.8 g'],
      ['Protein', '1.0 g'],
      ['Salt', '0.10 g'],
      ['Calcium', '120 mg'],
    ]
    return (
      <Face background={BOARD} color={INK} style={{ display: 'flex', flexDirection: 'column', padding: '9cqw 7cqw 21cqw', gap: '4cqw', letterSpacing: '-0.01em' }}>
        <span style={{ ...WORDMARK, fontSize: '9cqw', color: CARTON_GREEN }}>What is in it</span>
        <span style={{ fontSize: '4cqw', lineHeight: 1.45 }}>Water, Portuguese oats (11 %), rapeseed oil, calcium, a pinch of salt. Nothing else - which is why it froths.</span>
        <div style={{ borderTop: `0.8cqw solid ${INK}`, borderBottom: `0.8cqw solid ${INK}`, fontSize: '3.7cqw' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.6cqw 0', fontWeight: 700, borderBottom: `0.3cqw solid ${INK}` }}>
            <span>Per 100 ml</span>
            <span />
          </div>
          {rows.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.1cqw 0', paddingLeft: k.startsWith('of') ? '4cqw' : 0, borderBottom: `0.2cqw solid ${mix(INK, BOARD, 0.7)}` }}>
              <span>{k}</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</span>
            </div>
          ))}
        </div>
        <span style={{ marginTop: 'auto', fontSize: '3.5cqw', fontWeight: 600, opacity: 0.7 }}>Shake well · Keep cold · Best within 5 days of opening</span>
        <Foot>
          <span>Vegan</span>
          <span>No added sugar</span>
        </Foot>
      </Face>
    )
  }
  return (
    <Face background={BOARD} color={INK} style={{ display: 'flex', flexDirection: 'column', padding: '9cqw 7cqw 21cqw', gap: '4cqw', letterSpacing: '-0.01em' }}>
      <span style={{ ...WORDMARK, fontSize: '11cqw', color: CARTON_GREEN }}>For the steam wand</span>
      <span style={{ fontSize: '4.2cqw', lineHeight: 1.5 }}>
        Start it cold, straight from the fridge. Stretch it early, just past the surface, then roll it until the jug is too hot
        to hold for more than a second - about 60 °C. Past 65 it goes flat, like milk does.
      </span>
      <span style={{ fontSize: '4.2cqw', lineHeight: 1.5 }}>It is the drink we pour every oat latte with, on Rua da Boavista since 2019.</span>
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <Picture src={OATS.src} aspect={OATS.aspect} style={{ right: '-4cqw', bottom: 0, height: '100%', maxHeight: '64cqw', transform: 'rotate(8deg)', opacity: 0.95 }} />
      </div>
      <Foot>
        <span style={{ ...WORDMARK, fontSize: '6cqw' }}>{SHOP.name}</span>
        <span>ninefold.pt</span>
      </Foot>
    </Face>
  )
}

/**
 * The roof panels (432 x 255): the name on the green. The cap rides over the
 * middle of the front one, so the type keeps to the foot of the panel, where
 * the roof meets the wall.
 */
export function CartonGable() {
  return (
    <Face background={CARTON_GREEN} color={CREAM} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 7cqw 7cqh' }}>
      <span style={{ ...WORDMARK, fontSize: '9cqw' }}>{SHOP.name} Oat</span>
      <span style={{ fontSize: '4cqw', fontWeight: 600, letterSpacing: '-0.01em', color: OAT }}>Keep cold</span>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  The loyalty card                                                   */
/* ------------------------------------------------------------------ */

/** How each stamp landed: a stamp is never square to the card. */
const STAMP_TILT = [-9, 6, -3, 11, -6, 4, -12, 8, -2]

/**
 * Front (520 x 298): nine slots, three of them stamped. A slot is a dashed
 * box with its number; a stamp is the rubber-stamp cup (`/art/cafe-stamp.webp`),
 * each set at its own angle, in the green ink a counter stamp pad has.
 */
export function CardFront({ stamped = 3 }: { stamped?: number }) {
  return (
    <Face background={CREAM} color={INK} style={{ display: 'flex', padding: '6cqw 7cqw', gap: '5cqw', alignItems: 'stretch' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2cqw' }}>
        <span style={{ ...WORDMARK, fontSize: '9cqw' }}>{SHOP.name}</span>
        <span style={{ fontSize: '3.4cqw', fontWeight: 600, lineHeight: 1.35, opacity: 0.75 }}>Nine coffees, then one on us.</span>
        <span style={{ marginTop: 'auto', fontSize: '2.6cqw', fontWeight: 600, opacity: 0.55 }}>
          {SHOP.address} · {SHOP.city}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 10.5cqw)', gridAutoRows: '10.5cqw', gap: '1.6cqw', flex: 'none', alignSelf: 'center' }} aria-hidden>
        {Array.from({ length: 9 }, (_, i) => (
          <span
            key={i}
            style={{
              position: 'relative',
              borderRadius: '2cqw',
              border: `0.35cqw dashed ${mix(INK, CREAM, 0.55)}`,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              padding: '0.8cqw 1.1cqw',
              fontSize: '2.2cqw',
              fontWeight: 600,
              color: mix(INK, CREAM, 0.5),
            }}
          >
            {i + 1}
            {i < stamped ? (
              <Picture
                src="/art/cafe-stamp.webp"
                aspect={360 / 405}
                style={{ left: '50%', top: '50%', height: '118%', transform: `translate(-50%, -50%) rotate(${STAMP_TILT[i]}deg)`, mixBlendMode: 'multiply', opacity: 0.92 }}
              />
            ) : null}
          </span>
        ))}
      </div>
    </Face>
  )
}

/** Back: the shop's paint, a flat white set down on it, the name and the hours. */
export function CardBack({ paint }: { paint: string }) {
  return (
    <Face background={paint} color={CREAM} style={{ display: 'flex', flexDirection: 'column', padding: '6cqw 7cqw' }}>
      <Picture
        src={FLATWHITE.src}
        aspect={FLATWHITE.aspect}
        style={{ right: '-15cqw', top: '50%', height: '92%', transform: 'translateY(-50%) rotate(-8deg)', filter: 'drop-shadow(0 2cqw 3cqw rgba(0,0,0,0.35))' }}
      />
      <span style={{ position: 'relative', fontSize: '3cqw', fontWeight: 600, letterSpacing: '-0.01em', opacity: 0.85 }}>{SHOP.kind}</span>
      <div style={{ position: 'relative', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '2.4cqw', maxWidth: '50cqw' }}>
        <span style={{ ...WORDMARK, fontSize: '12cqw' }}>{SHOP.name}</span>
        <span style={{ fontSize: '2.8cqw', fontWeight: 600, lineHeight: 1.5, whiteSpace: 'pre-line', opacity: 0.9 }}>{SHOP.hours.replace(/ · /g, '\n')}</span>
      </div>
    </Face>
  )
}

/** A hairline the page reuses between sections. */
export const rule = (color = INK): CSSProperties => ({ height: 1, background: color, opacity: 0.15 })
export type { ReactNode }
