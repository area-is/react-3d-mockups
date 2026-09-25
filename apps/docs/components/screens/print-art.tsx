'use client'

import { FONT } from './swiss-art'
import { asset } from '@/lib/base-path.mjs'

/**
 * Standalone print pieces: the print-shop example's gig poster, the
 * carousel's billboard and A-frame boards, and the two the screenshot
 * harness poses on the bus and the TV. Self-contained inline styles, so the
 * demos don't lean on page CSS - each fills its live surface at 100%.
 */

/** 18x24 gig poster. */
export function PosterArt() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: 30,
        background: 'linear-gradient(200deg, #f5e9d4 0%, #f2ddb8 100%)',
        color: '#1c1a16',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ fontSize: 12, letterSpacing: '-0.01em' }}>Live At The Foundry</div>
      <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 0.94, letterSpacing: -3, marginTop: 18 }}>
        SIGNAL
        <br />
        <span style={{ color: '#d1461f' }}>/ NOISE</span>
      </div>
      <svg viewBox="0 0 100 26" aria-hidden style={{ width: '100%', marginTop: 'auto' }}>
        {Array.from({ length: 40 }, (_, i) => (
          <rect key={i} x={i * 2.5} y={13 - Math.abs(Math.sin(i * 0.55)) * 11} width={1.4} height={Math.abs(Math.sin(i * 0.55)) * 22 + 2} fill="#1c1a16" />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginTop: 16 }}>
        <span>SAT AUG 22 · 9PM</span>
        <span>DOORS 8PM · ALL AGES</span>
      </div>
    </div>
  )
}

/**
 * 14x48 bulletin creative (1200 x 350 at the default resolution): Halden, a
 * fictional headphone maker, selling quiet.
 *
 * Built the way a bulletin is: one line a driver can read in the three
 * seconds they have, set huge on a single saturated ground, the product as
 * large as the board allows, and the brand in the corner. The headphones are
 * a generated cut-out on a transparent ground (`/art/halden-headphones.webp`),
 * so they sit on the cobalt rather than in a box, inside the one graphic:
 * rings of sound spreading out from them and fading, which is the promise.
 * Measured in container units against the face, so the layout holds at any
 * `resolution`.
 */
export function BillboardAdArt() {
  const ring = (r: number, alpha: number) => (
    <div
      key={r}
      aria-hidden
      style={{
        position: 'absolute',
        left: `${HALDEN_CENTRE - r}cqw`,
        top: `calc(50cqh - ${r}cqw)`,
        width: `${r * 2}cqw`,
        aspectRatio: 1,
        borderRadius: '50%',
        border: `0.28cqw solid rgba(255, 255, 255, ${alpha})`,
      }}
    />
  )
  return (
    <div style={{ width: '100%', height: '100%', containerType: 'size', background: HALDEN.ground, overflow: 'hidden' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', color: HALDEN.ink, fontFamily: FONT, userSelect: 'none' }}>
        {[ring(12, 0.2), ring(18, 0.14), ring(25, 0.09), ring(33, 0.05)]}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset('/art/halden-headphones.webp')}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            height: '94cqh',
            top: '3cqh',
            left: `${HALDEN_CENTRE}cqw`,
            transform: 'translateX(-50%) rotate(-6deg)',
            aspectRatio: '484 / 560',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'absolute', left: '4.5cqw', top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '7cqw', fontWeight: 800, letterSpacing: '-0.055em', lineHeight: 0.92 }}>
            Hear the room
            <br />
            <span style={{ color: HALDEN.accent }}>go quiet.</span>
          </div>
        </div>
        {/* the brand in the corner, clear of the product */}
        <div style={{ position: 'absolute', right: '4cqw', bottom: '12cqh', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1cqw', textAlign: 'right' }}>
          <span style={{ fontSize: '3.1cqw', fontWeight: 800, letterSpacing: '0.18em', lineHeight: 1, marginRight: '-0.18em' }}>HALDEN</span>
          <span style={{ fontSize: '1.2cqw', fontWeight: 600, lineHeight: 1.3, color: HALDEN.accent, whiteSpace: 'nowrap' }}>
            Q2 wireless
            <br />
            Adaptive noise cancelling
          </span>
        </div>
      </div>
    </div>
  )
}

/** The bulletin's inks: one cobalt, a white, and a pale blue for the second voice. */
const HALDEN = { ground: '#1f3fd1', ink: '#f5f7ff', accent: '#a9bbff' }
/** Where the headphones and their rings are centred, in cqw of the face. */
const HALDEN_CENTRE = 65

/** King-size bus ad - one message, big type, 4.8:1. */
export function BusAdArt() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: '0 36px',
        background: '#f4c534',
        color: '#171614',
        display: 'flex',
        alignItems: 'center',
        gap: 28,
      }}
    >
      <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1, whiteSpace: 'nowrap' }}>
        Fresh flowers, city-wide.
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ fontSize: 22, fontWeight: 700, whiteSpace: 'nowrap' }}>
        BLOOM<span style={{ color: '#2a8f68' }}>&amp;CO.</span> · bloomand.co
      </div>
    </div>
  )
}

/** TV streaming-app hero. */
export function TVShowArt() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        background: 'linear-gradient(200deg, #1c2b45 0%, #0a0f1a 70%)',
        color: '#eef2f8',
        display: 'flex',
        flexDirection: 'column',
        padding: 60,
        overflow: 'hidden',
      }}
    >
      <div style={{ fontSize: 26, letterSpacing: 6, color: '#5ad0a6', fontWeight: 700 }}>NORTHWIND ORIGINAL</div>
      <div style={{ fontSize: 110, fontWeight: 800, letterSpacing: -3, lineHeight: 0.98, marginTop: 24 }}>
        THE RIDGE
      </div>
      <div style={{ fontSize: 30, color: '#9db0cd', marginTop: 18 }}>New season · Fridays</div>
      <div style={{ display: 'flex', gap: 24, marginTop: 'auto' }}>
        {['#25467a', '#2a8f68', '#8a3547', '#66513a', '#31552e'].map((c) => (
          <div key={c} style={{ width: 300, height: 170, borderRadius: 14, background: `linear-gradient(160deg, ${c}, #10151f)` }} />
        ))}
      </div>
    </div>
  )
}

/** Chalkboard menu for the A-frame: Inter, regular casing, tightened - the way a café that owns a stencil letters a board. */
export function ChalkMenuArt() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: 24,
        background: '#232823',
        color: '#f0ede4',
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        fontFamily: FONT,
        fontWeight: 500,
        letterSpacing: '-0.02em',
      }}
    >
      <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.035em' }}>Ridgeline Café</div>
      <svg viewBox="0 0 100 8" style={{ width: '80%', margin: '10px auto 18px' }} aria-hidden>
        <path d="M2 5 Q 25 1, 50 4 T 98 3" fill="none" stroke="#e8b64c" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {[
        ['flat white', '4.5'],
        ['batch brew', '3.5'],
        ['oat latte', '5'],
        ['cardamom bun', '5'],
        ['trail toastie', '9'],
        ['soup of the day', '8'],
      ].map(([item, price]) => (
        <div key={item} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, padding: '10px 8px', borderBottom: '1px dashed rgba(240,237,228,0.25)' }}>
          <span>{item}</span>
          <span style={{ color: '#e8b64c' }}>{price}</span>
        </div>
      ))}
      <div style={{ marginTop: 'auto', fontSize: 17, color: '#b9c4b4' }}>open till dusk ☀</div>
    </div>
  )
}

/**
 * The other side of the sandwich board.
 *
 * A sidewalk sign is seen from both directions, and the back of a real one is
 * never blank - it carries the hours for whoever is walking the other way. It
 * is the same board and the same chalk as the menu, set as a week rather than
 * a price list so the two faces do not read as a duplicate when the sign turns.
 */
export function ChalkHoursArt() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: 24,
        background: '#232823',
        color: '#f0ede4',
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        fontFamily: FONT,
        fontWeight: 500,
        letterSpacing: '-0.02em',
      }}
    >
      <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.035em' }}>Open</div>
      <svg viewBox="0 0 100 8" style={{ width: '80%', margin: '10px auto 18px' }} aria-hidden>
        <path d="M2 4 Q 28 7, 52 3 T 98 5" fill="none" stroke="#e8b64c" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {[
        ['mon – thu', '7 – 4'],
        ['fri', '7 – 6'],
        ['sat', '8 – 6'],
        ['sun', '8 – 2'],
      ].map(([days, hours]) => (
        <div key={days} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, padding: '10px 8px', borderBottom: '1px dashed rgba(240,237,228,0.25)' }}>
          <span>{days}</span>
          <span style={{ color: '#e8b64c' }}>{hours}</span>
        </div>
      ))}
      <div style={{ marginTop: 'auto', fontSize: 17, color: '#b9c4b4', lineHeight: 1.5 }}>
        kitchen closes half an hour before
        <br />
        dogs welcome ❧
      </div>
    </div>
  )
}
