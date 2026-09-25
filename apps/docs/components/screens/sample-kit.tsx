'use client'

import type { CSSProperties, ReactNode } from 'react'
import { asset } from '@/lib/base-path.mjs'
import { FONT, INK, PAPER, materialTone } from './swiss-art'

/**
 * The parts the reference pages' sample artwork is built from: the objects
 * the home carousel does not stage - the magazine, the cards, the street
 * furniture, the shop, the vehicles, the two custom shapes - each dressed as
 * a job for a fictional client rather than as a labelled swatch.
 *
 * Three rules hold across all of it.
 *
 * - **A picture is a cut-out.** Every photograph is a generated object on a
 *   transparent ground (`/art/sample-*.webp`), so it stands on whatever the
 *   face is printed on - a stock, a paint, a lightbox - instead of arriving in
 *   a rectangle of its own background.
 * - **Stock shows through.** On an object whose `color` is the thing it is
 *   printed on (a card, a box, a van), the face has no ground: the ink flips
 *   with the stock (`stockInk`) and the brand's own colours are solid inks
 *   that stay put. A lightbox, a screen or a sign brings its own ground,
 *   because that is what a poster in a frame does.
 * - **Container units.** Everything is measured in `cq` units against the
 *   face itself (`Face`), so one layout holds at whatever resolution the
 *   surface is rendered.
 */

/* ------------------------------------------------------------------ */
/*  Cut-outs                                                           */
/* ------------------------------------------------------------------ */

export interface Cutout {
  src: string
  /** Width over height, so the box is reserved before the file loads. */
  aspect: number
}

const cut = (name: string, width: number, height: number): Cutout => ({
  src: `/art/sample-${name}.webp`,
  aspect: width / height,
})

/** The generated cut-outs, by subject. */
export const CUT = {
  apples: cut('apples', 1006, 240),
  bust: cut('bust', 380, 620),
  candle: cut('candle', 379, 480),
  chrome: cut('chrome', 560, 539),
  croissant: cut('croissant', 480, 372),
  icedCoffee: cut('icedcoffee', 330, 640),
  monstera: cut('monstera', 547, 560),
  mug: cut('mug', 480, 417),
  portrait: cut('portrait', 420, 420),
  sneaker: cut('sneaker', 640, 374),
  sourdough: cut('sourdough', 471, 420),
  tulips: cut('tulips', 412, 620),
  vase: cut('vase', 284, 640),
} satisfies Record<string, Cutout>

/**
 * A cut-out, absolutely placed. Give it one of `width` or `height` in
 * `style` and the other follows from the file's aspect.
 */
export function Cut({ of, style }: { of: Cutout; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset(of.src)}
      alt=""
      draggable={false}
      decoding="async"
      style={{
        position: 'absolute',
        display: 'block',
        width: 'auto',
        height: 'auto',
        aspectRatio: of.aspect,
        pointerEvents: 'none',
        ...style,
      }}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  Faces                                                              */
/* ------------------------------------------------------------------ */

/**
 * One printed face: the outer element is the query container, the inner one
 * lays out in the units it defines (see `Sheet` in `swiss-art` for why it
 * takes two). No `ground` means the stock shows through.
 */
export function Face({
  ground = 'transparent',
  ink,
  style,
  children,
}: {
  ground?: string
  ink: string
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <div style={{ width: '100%', height: '100%', containerType: 'size', background: ground, overflow: 'hidden', position: 'relative' }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          color: ink,
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

/* ------------------------------------------------------------------ */
/*  Ink                                                                */
/* ------------------------------------------------------------------ */

/** The one ink a job prints in on this stock: near-black on a light one, paper white on a dark one. */
export function stockInk(material: string): string {
  return materialTone(material).text
}

/** Whether `material` is a dark stock - the brand inks that need a lighter pull check this. */
export function isDark(material: string): boolean {
  return stockInk(material) !== INK
}

function channels(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h.slice(0, 6)
  return [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16)) as [number, number, number]
}

/** `from` mixed toward `to` by `t` (0-1), as a hex colour. */
export function mix(from: string, to: string, t: number): string {
  const a = channels(from)
  const b = channels(to)
  return `#${a.map((v, i) => Math.round(v + (b[i]! - v) * t).toString(16).padStart(2, '0')).join('')}`
}

/** A second, quieter ink: the ink knocked back toward the stock it sits on. */
export function quietInk(material: string, amount = 0.42): string {
  const ink = stockInk(material)
  return mix(ink, material.startsWith('#') ? material : ink === PAPER ? INK : PAPER, amount)
}

/* ------------------------------------------------------------------ */
/*  Type                                                               */
/* ------------------------------------------------------------------ */

/** A line of small type: regular casing, tightened, never tracked capitals. */
export function Small({ children, size, style }: { children: ReactNode; size: string; style?: CSSProperties }) {
  return (
    <span style={{ display: 'block', fontSize: size, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.4, ...style }}>
      {children}
    </span>
  )
}

/** Display type: heavy, tight, set in regular casing. */
export function Headline({ children, size, style }: { children: ReactNode; size: string; style?: CSSProperties }) {
  return (
    <div style={{ fontSize: size, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.92, whiteSpace: 'pre-line', ...style }}>
      {children}
    </div>
  )
}
