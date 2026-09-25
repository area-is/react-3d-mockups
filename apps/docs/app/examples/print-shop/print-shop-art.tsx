'use client'

import type { CSSProperties, ReactNode, Ref } from 'react'
import { TabbiedPattern, type TabbiedPatternHandle } from 'tabbied/react'
import { damier, dipole, epicentre, flux, gyre, halftone, maelstrom, radius } from 'tabbied/patterns'
import type { PatternDefinition } from 'tabbied'
import { FONT, TONES, luminance, type Tone } from '@/components/screens/swiss-art'
import { mix } from '@/components/screens/sample-kit'

/**
 * Grid Editions: the shop's catalogue, and the artwork it prints.
 *
 * Everything the configurator can change is an `Order` - a design, an ink
 * set, a sheet size, a frame, a mat, bordered or full bleed, and the seed
 * that picks the composition - and the artwork is a plain React component
 * that renders an order. That is the whole trick of this example: the sheet
 * inside the 3D frame is real DOM, so a click on a swatch in the page
 * re-renders the print on the wall at the same moment, with no texture to
 * bake and nothing to re-upload.
 *
 * The pictures come from `tabbied`: every design is a generative pattern
 * with a fixed vocabulary of marks, and the seed is the composition. A
 * customer who does not like the arrangement shuffles until they do, and the
 * seed is printed on the sheet as the edition number, because it IS the
 * edition - the same seed reprints the same picture.
 */

/* ------------------------------------------------------------------ */
/*  The catalogue                                                      */
/* ------------------------------------------------------------------ */

export interface Design {
  id: string
  /** The name on the plate line, not the pattern's slug. */
  name: string
  pattern: PatternDefinition
  /**
   * The grid the design is composed on. A poster wants a countable number of
   * large marks, so these are coarse; with `fit="cover"` the grid holds
   * whatever shape the sheet is cut to.
   */
  grid: string
  blurb: string
}

export const DESIGNS = [
  { id: 'gyre', name: 'Slow turns', pattern: gyre, grid: '6x9', blurb: 'Concentric rings of dashes, turning.' },
  { id: 'halftone', name: 'Raster', pattern: halftone, grid: '8x12', blurb: 'A dot screen walked through its range.' },
  { id: 'dipole', name: 'Field', pattern: dipole, grid: '8x12', blurb: 'Lines of force between two poles.' },
  { id: 'epicentre', name: 'Point source', pattern: epicentre, grid: '6x9', blurb: 'Dots swelling out from a centre.' },
  { id: 'radius', name: 'Quarter round', pattern: radius, grid: '4x6', blurb: 'Quarter circles snapping between corners.' },
  { id: 'maelstrom', name: 'Undertow', pattern: maelstrom, grid: '8x12', blurb: 'Dashes caught in a slow spiral.' },
  { id: 'flux', name: 'Ripple', pattern: flux, grid: '6x9', blurb: 'Rings spreading from a single drop.' },
  { id: 'damier', name: 'Checker', pattern: damier, grid: '6x9', blurb: 'A checkerboard with squares knocked out.' },
] as const satisfies readonly Design[]

export type DesignId = (typeof DESIGNS)[number]['id']

/**
 * The ink sets. Each is one of the site's Swiss palettes (`TONES`): a ground
 * and two or three inks, which is what a screen print is - a few flat
 * colours, never a gradient.
 */
export const INKS = [
  { id: 'midnight', name: 'Midnight', tone: TONES.midnight },
  { id: 'signal', name: 'Signal', tone: TONES.paper },
  { id: 'ember', name: 'Ember', tone: TONES.ember },
  { id: 'moss', name: 'Moss', tone: TONES.moss },
  { id: 'cobalt', name: 'Bauhaus', tone: TONES.cobalt },
  { id: 'plum', name: 'Plum', tone: TONES.plum },
] as const satisfies readonly { id: string; name: string; tone: Tone }[]

export type InkId = (typeof INKS)[number]['id']

/** Sheet sizes, in the millimetres the frame is built from. */
export const SIZES = [
  { id: '18x24', label: '18 × 24″', mm: { width: 457, height: 610 }, price: 48 },
  { id: '24x36', label: '24 × 36″', mm: { width: 610, height: 914 }, price: 72 },
  { id: 'a1', label: 'A1', mm: { width: 594, height: 841 }, price: 64 },
] as const

export type SizeId = (typeof SIZES)[number]['id']

export const FRAMES = [
  { id: 'black', label: 'Black ash', color: '#22262e' },
  { id: 'oak', label: 'Oak', color: '#b98b5a' },
  { id: 'walnut', label: 'Walnut', color: '#5a3d2b' },
  { id: 'white', label: 'White', color: '#f2f0ea' },
] as const

export type FrameId = (typeof FRAMES)[number]['id']

/** `mat` as the frame takes it: off, the default museum board, or a board in a colour. */
export const MATS = [
  { id: 'none', label: 'No mat', mat: false, price: 0 },
  { id: 'museum', label: 'Museum white', mat: true, price: 12 },
  { id: 'charcoal', label: 'Charcoal', mat: '#1d1f24', price: 12 },
] as const

export type MatId = (typeof MATS)[number]['id']

export const BLEEDS = [
  { id: 'bordered', label: 'Bordered' },
  { id: 'full', label: 'Full bleed' },
] as const

export type BleedId = (typeof BLEEDS)[number]['id']

export interface Order {
  design: DesignId
  ink: InkId
  size: SizeId
  frame: FrameId
  mat: MatId
  bleed: BleedId
  /** The composition. Printed on the sheet as the edition number. */
  seed: string
}

/**
 * The order the page opens on. A fixed seed rather than a random one, so the
 * server and the client agree on the first picture and the first visitor
 * sees the composition the copy was written against.
 */
export const DEFAULT_ORDER: Order = {
  design: 'gyre',
  ink: 'midnight',
  size: '18x24',
  frame: 'black',
  mat: 'none',
  bleed: 'bordered',
  seed: 'k9Pz',
}

export function find<T extends { id: string }>(list: readonly T[], id: string): T {
  return list.find((item) => item.id === id) ?? list[0]!
}

export function priceOf(order: Order): number {
  return find(SIZES, order.size).price + find(MATS, order.mat).price
}

/** Four characters, the way Tabbied's own share links spell a seed. */
export function newSeed(): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let seed = ''
  for (let i = 0; i < 4; i++) seed += alphabet[Math.floor(Math.random() * alphabet.length)]
  return seed
}

/* ------------------------------------------------------------------ */
/*  The artwork                                                        */
/* ------------------------------------------------------------------ */

/** The print stock: cotton rag, a warm off-white. */
export const PAPER = '#f5f2eb'
export const INK = '#1a1917'
/** The tote's natural kraft - the bag's colour, and the stock its print sits on. */
export const KRAFT = '#c9a77a'

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

/** Below this an ink disappears into the stock it is pulled on. */
const LEGIBLE = 1.8

/**
 * An ink set as pulled straight onto a stock, with no ground of its own.
 *
 * The sheet in the frame is printed full colour, ground and all. The tote and
 * the card are screen printed onto what they are made of, the way merch is:
 * the kraft or the card is the background, and only the marks go down. A
 * set's light inks (Midnight's white and cyan, Ember's cream) would vanish
 * there, so each one that falls under `LEGIBLE` takes another of the set's
 * own colours instead - its ground, its text ink, or its accent knocked
 * halfway into the ground - whichever stand out most on the stock first.
 * The print keeps the set's own colours, only the ones that read there.
 */
export function stockPalette(tone: Tone, stock: string): string[] {
  const deep = [tone.ground, tone.text, mix(tone.accent, tone.ground, 0.5)]
    .filter((c) => contrast(c, stock) >= LEGIBLE)
    .sort((a, b) => contrast(b, stock) - contrast(a, stock))
  let next = 0
  const marks = tone.palette.slice(1).map((c) => (contrast(c, stock) >= LEGIBLE ? c : (deep[next++ % Math.max(deep.length, 1)] ?? INK)))
  return ['transparent', ...marks]
}

/**
 * The picture block of an order: the pattern at the design's grid, from the
 * order's seed. Shared by every surface the shop prints on, so the tote and
 * the card carry the same edition as the sheet in the frame.
 *
 * On the sheet it is the full print, the ink set's ground and all. Given a
 * `stock`, it is the marks alone, pulled onto that stock (`stockPalette`).
 *
 * `fit="cover"` keeps the composed grid whatever the block's shape - the
 * three sheet sizes are three aspects, and a card is a fourth - rather than
 * letting the pattern get denser as the surface gets bigger.
 */
export function Picture({
  order,
  ref,
  stock,
  style,
}: {
  order: Order
  ref?: Ref<TabbiedPatternHandle>
  stock?: string
  style?: CSSProperties
}) {
  const design = find(DESIGNS, order.design)
  const ink = find(INKS, order.ink)
  return (
    <div style={{ position: 'relative', background: stock ? 'transparent' : ink.tone.ground, overflow: 'hidden', ...style }}>
      <TabbiedPattern
        ref={ref}
        pattern={design.pattern}
        seed={order.seed}
        palette={stock ? stockPalette(ink.tone, stock) : ink.tone.palette}
        options={{ grid: design.grid }}
        fit="cover"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}

/**
 * A surface with the layout INSIDE it. Container-relative units resolve
 * against the nearest ancestor container, never the element itself, so the
 * outer div declares the container and the inner one lays out in `cqw`.
 */
function Sheet({ background, style, children }: { background: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <div style={{ width: '100%', height: '100%', containerType: 'size', background, overflow: 'hidden' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: 0,
          color: INK,
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

/** The plate line a print carries under the picture: title, ink, edition, press. */
function Plate({ order, size = '2.1cqw' }: { order: Order; size?: string }) {
  const design = find(DESIGNS, order.design)
  const ink = find(INKS, order.ink)
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: '2cqw',
        fontSize: size,
        fontWeight: 600,
        letterSpacing: '-0.01em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      <span>
        {design.name}
        <span style={{ opacity: 0.5 }}> · {ink.name}</span>
      </span>
      <span style={{ opacity: 0.5 }}>No. {order.seed} · Grid Editions</span>
    </div>
  )
}

/**
 * The sheet in the frame.
 *
 * Bordered is how a print is actually sold: the picture in a field with the
 * paper showing around it and the plate line set under it, the way a giclée
 * leaves its margin for the mat or the frame's lip. Full bleed drops both,
 * and the picture runs to the edge of the glass.
 *
 * `ref` reaches the pattern itself, for the "download proof" button: the
 * sheet is a real `<css-doodle>` in the page, so the shop can hand the
 * customer a vector SVG of exactly the composition they are looking at.
 */
export function PosterArt({ order, ref }: { order: Order; ref?: Ref<TabbiedPatternHandle> }) {
  const bordered = order.bleed === 'bordered'
  return (
    <Sheet background={PAPER} style={bordered ? { padding: '7cqw 7cqw 6cqw', gap: '3.2cqw' } : undefined}>
      <Picture order={order} ref={ref} style={{ flex: 1, minHeight: 0 }} />
      {bordered ? <Plate order={order} /> : null}
    </Sheet>
  )
}

/**
 * The tote. The bag's own stock is the ground - the mockup paints the bag's
 * colour as the surface background - so the marks are printed on kraft, not
 * on a sheet glued to it, and the wordmark sits under them in ink.
 */
export function ToteArt({ order }: { order: Order }) {
  return (
    <Sheet background="transparent" style={{ padding: '13cqw 12cqw 15cqw', gap: '3.5cqw' }}>
      <Picture order={order} stock={KRAFT} style={{ flex: 1, minHeight: 0 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '3.2cqw', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1 }}>
        <span>Grid Editions</span>
        <span style={{ opacity: 0.55, fontWeight: 600, fontSize: '2.4cqw' }}>No. {order.seed}</span>
      </div>
    </Sheet>
  )
}

/** The card's front: the same marks straight on the card, a deeper margin, the plate line set small. */
export function CardArt({ order }: { order: Order }) {
  return (
    <Sheet background={PAPER} style={{ padding: '9cqw 9cqw 8cqw', gap: '4cqw' }}>
      <Picture order={order} stock={PAPER} style={{ flex: 1, minHeight: 0 }} />
      <Plate order={order} size="2.6cqw" />
    </Sheet>
  )
}
