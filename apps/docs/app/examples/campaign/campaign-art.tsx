'use client'

import type { CSSProperties, ReactNode } from 'react'
import { flux, nutation } from 'tabbied/patterns'
import type { PatternDefinition } from 'tabbied'
import { FONT, Pattern } from '@/components/screens/swiss-art'
import { MONO } from '@/components/screens/label-art'
import { asset } from '@/lib/base-path.mjs'
import { ACID, BAG, BONE, FESTIVAL, NIGHT, PALETTE, RUNNING_ORDER } from './campaign-identity'

/**
 * The Aperture campaign, as it prints on every surface in the case study.
 *
 * The identity is three parts. The mark is `nutation` from Tabbied - lines
 * radiating from a point and spinning slightly off it, which is what a beam
 * of light through an aperture does - with `flux`, rings spreading from a
 * drop, as the secondary. The inks are four bright colours on the night.
 * The wordmark is Inter at its heaviest, set tight.
 *
 * What differs from surface to surface is only the seed and the grid. A
 * printed piece pins its seed, so the 6-sheet in the shelter is the same
 * 6-sheet every time the page loads - a poster does not reprint itself. A
 * screen is `live`: the totem and the app redraw every couple of seconds
 * from the site's shared clock, which is the one thing a DOM surface can do
 * that a texture cannot, and the reason the case study is built this way.
 *
 * The performer is a generated cut-out on a transparent ground
 * (`/art/performer.webp`), so he stands ON the pattern rather than in a
 * rectangle cut into it, and the same file works on the billboard's wide
 * face and the 6-sheet's tall one by being anchored to the bottom edge and
 * allowed to run off it.
 *
 * Measurements are container-relative, so one layout holds from a 420 px
 * badge to a 1200 px billboard face.
 */

/* ------------------------------------------------------------------ */
/*  Parts                                                              */
/* ------------------------------------------------------------------ */

/**
 * A face: the outer element is the size container, the inner one lays out
 * in the units the outer defines - `cqw` on an element that is itself the
 * container falls back to the viewport, which is how a badge once got a
 * wordmark set at half the browser window.
 */
export function Face({ background = NIGHT, style, children }: { background?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <div style={{ width: '100%', height: '100%', containerType: 'size', background, overflow: 'hidden', position: 'relative' }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          color: BONE,
          fontFamily: FONT,
          userSelect: 'none',
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  )
}

/** The mark, full bleed under everything else on the face. */
export function Mark({
  seed,
  live,
  grid = '6x9',
  pattern = nutation,
  palette = PALETTE,
  style,
}: {
  seed?: string
  live?: boolean
  grid?: string
  pattern?: PatternDefinition
  palette?: string[]
  style?: CSSProperties
}) {
  return (
    <div style={{ position: 'absolute', inset: 0, ...style }}>
      <Pattern pattern={pattern} seed={seed} live={live} palette={palette} grid={grid} />
    </div>
  )
}

/**
 * A wash over the mark where the type sits, so bone type never lands on a
 * bone mark. Solid at the edges that carry type, clear through the middle
 * where the pattern is the point.
 */
function Scrim({ top = 0.55, bottom = 0.7 }: { top?: number; bottom?: number }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(to bottom, rgba(11, 10, 18, ${top}) 0%, rgba(11, 10, 18, 0) 34%, rgba(11, 10, 18, 0) 58%, rgba(11, 10, 18, ${bottom}) 100%)`,
        pointerEvents: 'none',
      }}
    />
  )
}

/**
 * The performer, anchored to the foot of the face and allowed off it.
 * `height` is the whole control: the cut-out keeps its own proportions.
 * The filter only deepens the blacks - the file is already monochrome - so
 * the figure holds against inks this loud.
 */
export function Performer({ height, right = '-6cqw', bottom = '-2cqh', style }: { height: string; right?: string; bottom?: string; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset('/art/performer.webp')}
      alt=""
      draggable={false}
      style={{
        position: 'absolute',
        right,
        bottom,
        height,
        width: 'auto',
        // 781 x 1514 in the file
        aspectRatio: '781 / 1514',
        filter: 'grayscale(1) contrast(1.18) brightness(1.04)',
        pointerEvents: 'none',
        ...style,
      }}
    />
  )
}

/** The wordmark: one word, the heaviest weight, tight. */
export function Wordmark({ size, color = BONE, style }: { size: string; color?: string; style?: CSSProperties }) {
  return (
    <div style={{ fontSize: size, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.86, color, ...style }}>
      {FESTIVAL.name}
    </div>
  )
}

/** Headliners loud, the rest in a running line. */
function Lineup({ size, big, more }: { size: string; big: string; more?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25em' }}>
      {FESTIVAL.headliners.map((name) => (
        <span key={name} style={{ fontSize: big, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1, color: ACID }}>
          {name}
        </span>
      ))}
      <span style={{ fontSize: size, fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.01em', marginTop: '0.4em' }}>
        {more ? `and ${FESTIVAL.lineup.length} more` : FESTIVAL.lineup.join(' · ')}
      </span>
    </div>
  )
}

const rule = (opacity = 0.85): CSSProperties => ({ height: '0.5cqw', minHeight: 1, background: BONE, opacity, flex: 'none' })

/* ------------------------------------------------------------------ */
/*  Surfaces                                                           */
/* ------------------------------------------------------------------ */

/**
 * The portrait poster: the 6-sheet in the shelter, the totem's front. The
 * type block takes the left half, the performer the right, and both are
 * measured in `cqw` so the figure is the same width relative to the sheet
 * on the 6-sheet's 2:3 and the totem's 9:16.
 */
export function Poster({ seed = 'aperture-poster', live, grid = '6x9' }: { seed?: string; live?: boolean; grid?: string }) {
  return (
    <Face>
      <Mark seed={seed} live={live} grid={grid} />
      <Scrim />
      <Performer height="104cqw" right="-10cqw" bottom="-2cqw" />
      <div style={{ position: 'relative', height: '100%', boxSizing: 'border-box', padding: '7cqw', display: 'flex', flexDirection: 'column' }}>
        <Wordmark size="15.5cqw" />
        <div style={{ marginTop: '2.6cqw', display: 'flex', flexDirection: 'column', gap: '1.1cqw' }}>
          <span style={{ fontSize: '4.6cqw', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: ACID }}>{FESTIVAL.dates}</span>
          <span style={{ fontSize: '3.1cqw', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.15 }}>
            {FESTIVAL.tagline}
            <br />
            {FESTIVAL.place}
          </span>
        </div>
        <div style={{ marginTop: 'auto', maxWidth: '50cqw', display: 'flex', flexDirection: 'column', gap: '2.6cqw' }}>
          <Lineup size="2.8cqw" big="3.9cqw" />
          <div style={rule()} />
          <span style={{ fontSize: '2.7cqw', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1 }}>{FESTIVAL.tickets}</span>
        </div>
      </div>
    </Face>
  )
}

/**
 * The billboard. A bulletin is read at sixty miles an hour, so it carries
 * one message in big type - the name, the dates, three headliners - and the
 * performer, and nothing else the poster says.
 */
export function Bulletin() {
  return (
    <Face>
      <Mark seed="aperture-bulletin" grid="8x12" />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to right, rgba(11, 10, 18, 0.72) 0%, rgba(11, 10, 18, 0.35) 45%, rgba(11, 10, 18, 0) 75%)`,
          pointerEvents: 'none',
        }}
      />
      <Performer height="112cqh" right="2.5cqw" bottom="-9cqh" />
      <div
        style={{
          position: 'relative',
          height: '100%',
          boxSizing: 'border-box',
          padding: '3.2cqw 3.6cqw',
          display: 'grid',
          gridTemplateColumns: '38cqw 1fr 24cqw',
          columnGap: '3cqw',
          alignItems: 'end',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5cqw' }}>
          <Wordmark size="6.8cqw" />
          <span style={{ fontSize: '2.3cqw', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: ACID }}>{FESTIVAL.dates}</span>
          <span style={{ fontSize: '1.6cqw', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
            {FESTIVAL.place}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4cqw', paddingBottom: '0.2cqw' }}>
          <Lineup size="1.5cqw" big="2.7cqw" more />
          <div style={{ ...rule(0.7), height: '0.16cqw', maxWidth: '26cqw' }} />
          <span style={{ fontSize: '1.45cqw', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1 }}>{FESTIVAL.tickets}</span>
        </div>
        <div />
      </div>
    </Face>
  )
}

/**
 * The totem's back: the running order, as a board. Rings rather than beams
 * at the head, live, because a screen in a queue should be seen to be one.
 */
export function Board() {
  return (
    <Face>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '36cqh' }}>
        <Pattern pattern={flux} live seed="aperture-board" palette={PALETTE} grid="4x6" />
        <div
          aria-hidden
          style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(11, 10, 18, 0.35), rgba(11, 10, 18, 0) 40%, ${NIGHT} 100%)` }}
        />
      </div>
      <div style={{ position: 'relative', height: '100%', boxSizing: 'border-box', padding: '6cqw', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Wordmark size="7cqw" />
          <span style={{ fontSize: '3cqw', fontWeight: 700, letterSpacing: '-0.01em', color: ACID }}>Friday 24</span>
        </div>
        <div style={{ marginTop: 'auto' }}>
          <span style={{ fontSize: '3.2cqw', fontWeight: 700, letterSpacing: '-0.01em', color: ACID }}>Tonight</span>
          <h3 style={{ margin: '1cqw 0 4cqw', fontSize: '9.5cqw', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.95, color: BONE }}>
            Running order
          </h3>
          {RUNNING_ORDER.map(({ time, act, stage }) => (
            <div
              key={time}
              style={{
                display: 'grid',
                gridTemplateColumns: '14cqw 1fr auto',
                columnGap: '3cqw',
                alignItems: 'baseline',
                padding: '2.3cqw 0',
                borderTop: '0.3cqw solid rgba(244, 241, 255, 0.22)',
                fontSize: '3.7cqw',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              <span style={{ color: ACID, fontVariantNumeric: 'tabular-nums' }}>{time}</span>
              <span>{act}</span>
              <span style={{ fontSize: '2.7cqw', fontWeight: 600, opacity: 0.7 }}>{stage}</span>
            </div>
          ))}
          <div style={{ marginTop: '4cqw', fontSize: '2.7cqw', fontWeight: 600, lineHeight: 1.3, opacity: 0.7 }}>
            Gates 18:00 · Last shuttle 02:30 · Free water at every bar
          </div>
        </div>
      </div>
    </Face>
  )
}

/**
 * The festival app, on the phone. The phone's viewport is a fixed 360 px,
 * so this one is set in pixels like any app. The hero band is live: the
 * app is the surface a visitor looks at most, and it should move.
 */
export function PhoneApp() {
  const tabs = ['Tonight', 'Map', 'Tickets', 'Me']
  return (
    <Face style={{ display: 'flex', flexDirection: 'column', paddingTop: 'calc(var(--mockup-safe-area-top, 0px) + 10px)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 20px 12px' }}>
        <Wordmark size="22px" />
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', color: ACID }}>Fri 24 July</span>
      </header>
      <div style={{ position: 'relative', margin: '0 16px', height: 220, borderRadius: 18, overflow: 'hidden', flex: 'none' }}>
        <Mark live seed="aperture-app" grid="4x6" />
        <div
          aria-hidden
          style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(11, 10, 18, 0) 30%, rgba(11, 10, 18, 0.82) 100%)' }}
        />
        <div style={{ position: 'absolute', left: 16, right: 16, bottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em', color: ACID }}>Up next · 21:30</div>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, marginTop: 4 }}>Oro &amp; Ash</div>
          <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, marginTop: 5 }}>Dock stage · 8 min walk</div>
        </div>
      </div>
      <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.03em' }}>Tonight</span>
        <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.6 }}>All stages</span>
      </div>
      <div style={{ padding: '4px 20px 0', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {RUNNING_ORDER.slice(1).map(({ time, act, stage }) => (
          <div
            key={time}
            style={{
              display: 'grid',
              gridTemplateColumns: '48px 1fr auto',
              columnGap: 12,
              alignItems: 'baseline',
              padding: '12px 0',
              borderBottom: '1px solid rgba(244, 241, 255, 0.14)',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            <span style={{ color: ACID, fontVariantNumeric: 'tabular-nums' }}>{time}</span>
            <span>{act}</span>
            <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.6 }}>{stage}</span>
          </div>
        ))}
      </div>
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '12px 10px 26px',
          borderTop: '1px solid rgba(244, 241, 255, 0.14)',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '-0.01em',
        }}
      >
        {tabs.map((tab, i) => (
          <span
            key={tab}
            style={{
              padding: '7px 14px',
              borderRadius: 999,
              background: i === 0 ? ACID : 'transparent',
              color: i === 0 ? NIGHT : BONE,
              opacity: i === 0 ? 1 : 0.6,
            }}
          >
            {tab}
          </span>
        ))}
      </nav>
    </Face>
  )
}

/**
 * The crew pass. The mark takes the top half - the model punches the slot
 * out of it - and the acid band across the middle is the credential; the
 * name lives on the plain night below, where security reads it.
 */
export function Pass() {
  return (
    <Face>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '50cqh' }}>
        <Pattern pattern={nutation} seed="aperture-pass" palette={PALETTE} grid="4x6" />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50cqh',
          height: '9.5cqw',
          background: ACID,
          color: NIGHT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 7cqw',
          boxSizing: 'border-box',
          fontSize: '4.2cqw',
          fontWeight: 800,
          letterSpacing: '-0.02em',
        }}
      >
        <span>All areas</span>
        <span>Crew</span>
      </div>
      <div style={{ position: 'relative', height: '100%', boxSizing: 'border-box', padding: '7cqw', display: 'flex', flexDirection: 'column' }}>
        {/* Clears the punched slot at the head of the card. */}
        <Wordmark size="9cqw" style={{ marginTop: '12cqw' }} />
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1.8cqw' }}>
          <span style={{ fontSize: '9.5cqw', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.95 }}>Ana Ferreira</span>
          <span style={{ fontSize: '3.9cqw', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.2, opacity: 0.85 }}>Stage manager · Dock stage</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4.5cqw', fontFamily: MONO, fontSize: '3cqw', fontWeight: 600, opacity: 0.7 }}>
            <span>AP26 · 0417</span>
            <span>24–26 Jul</span>
          </div>
        </div>
      </div>
    </Face>
  )
}

/**
 * The tote: two inks screen-printed on a black bag. The face is transparent
 * so the bag's own stock is the margin - the mockup paints the bag colour
 * under the print - and the rings are drawn in that stock, acid and bone.
 */
export function Tote() {
  return (
    <Face background="transparent">
      <div style={{ position: 'relative', height: '100%', boxSizing: 'border-box', padding: '12cqw 10cqw 14cqw', display: 'flex', flexDirection: 'column', gap: '4cqw' }}>
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <Pattern pattern={flux} seed="aperture-tote" palette={[BAG, ACID, BONE]} grid="4x6" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Wordmark size="9cqw" color={ACID} />
          <span style={{ fontSize: '3cqw', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1 }}>Lisbon · 2026</span>
        </div>
      </div>
    </Face>
  )
}

/** Wayfinding at the gates, on the roll-up: the mark, the wordmark, an arrow and a gate. */
export function Wayfinding() {
  return (
    <Face>
      <Mark seed="aperture-gate" grid="4x6" />
      <Scrim top={0.6} bottom={0.8} />
      <div style={{ position: 'relative', height: '100%', boxSizing: 'border-box', padding: '9cqw 8cqw', display: 'flex', flexDirection: 'column' }}>
        <Wordmark size="14cqw" />
        <span style={{ marginTop: '2.4cqw', fontSize: '4cqw', fontWeight: 700, letterSpacing: '-0.02em', color: ACID }}>{FESTIVAL.dates}</span>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '3cqw' }}>
          <svg viewBox="0 0 100 60" style={{ width: '44cqw', height: 'auto', display: 'block' }} aria-hidden>
            <path d="M6 30h84M64 8l26 22-26 22" fill="none" stroke={ACID} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: '24cqw', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.9 }}>Gate B</span>
          <div style={{ marginTop: '2cqw', paddingTop: '3cqw', borderTop: '0.5cqw solid rgba(244, 241, 255, 0.5)', fontSize: '4cqw', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.4 }}>
            Dock stage
            <br />
            Box office
            <br />
            Step-free access
          </div>
        </div>
      </div>
    </Face>
  )
}
