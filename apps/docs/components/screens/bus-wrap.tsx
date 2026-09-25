'use client'

import type { CSSProperties, ReactNode } from 'react'
import { LEDText } from 'react-3d-mockups'
import { asset } from '@/lib/base-path.mjs'
import { FONT, INK, materialTone } from './swiss-art'
import { mix } from './sample-kit'

/**
 * A full transit wrap for the home carousel's bus: Sunpeel, a sparkling fruit
 * water, one flavour per bus.
 *
 * A bus is bought as a colour, so the carousel's swatches are the range: each
 * one is a flavour, and it recolours the whole vehicle - the paint on the
 * nose and roof (the Bus's own `color`), the wrap's ground, and the fruit on
 * both flanks and the tail. The fruit is a generated cut-out on a transparent
 * ground (`/art/sunpeel-*.webp`), so it sits on the wrap's colour rather
 * than in a box, under the one graphic the brand owns: a low sun rising
 * behind it.
 *
 * A bus painted in any other colour runs the first flavour's fruit on its
 * own paint, with the ink flipped to suit it (`flavourOf`), so the wrap still
 * follows `color` wherever the reference pages let a reader change it.
 *
 * The flanks are laid out in the bus's own zones (BUS in the library's
 * dimensions): the name always toward the nose and the fruit toward the
 * tail, on both sides. On the street side the wrap's x axis runs nose to
 * tail and the driver's window is carved out of its first eighth; on the
 * curb side it runs tail to nose, and the two door leaves are carved, so the
 * name there sits in the stretch between them.
 */

export interface Flavour {
  id: string
  name: string
  /** The wrap's ground and the bus's paint. */
  ground: string
  /** Type and rules on that ground. */
  ink: string
  /** The sun behind the fruit: a lighter tint of the ground. */
  sun: string
  image: string
  /** Width over height of the cut-out, so its box is reserved before it loads. */
  aspect: number
}

export const SUNPEEL_FLAVOURS: Flavour[] = [
  { id: 'blood-orange', name: 'Blood orange', ground: '#ff5f1f', ink: '#2a0b06', sun: '#ffa062', image: '/art/sunpeel-blood-orange.webp', aspect: 720 / 405 },
  { id: 'lime', name: 'Lime', ground: '#c6e84a', ink: '#123d1f', sun: '#e2f59a', image: '/art/sunpeel-lime.webp', aspect: 720 / 403 },
  { id: 'grapefruit', name: 'Pink grapefruit', ground: '#ff8fa3', ink: '#3d0b1c', sun: '#ffc3cd', image: '/art/sunpeel-grapefruit.webp', aspect: 720 / 467 },
]

/**
 * The flavour a bus painted `ground` is running. A paint that is not one of
 * the range keeps its own colour and runs the first flavour's fruit on it:
 * the ink flips with the paint, and the sun is the flavour's own, pulled
 * toward the paint, so it reads as a tint on white and as a glow on black.
 */
export function flavourOf(ground: string | undefined): Flavour {
  const first = SUNPEEL_FLAVOURS[0]!
  const known = SUNPEEL_FLAVOURS.find((f) => f.ground.toLowerCase() === ground?.toLowerCase())
  if (known || !ground?.startsWith('#')) return known ?? first
  const ink = materialTone(ground).text
  return { ...first, id: 'custom', ground, ink: ink === INK ? first.ink : ink, sun: mix(first.sun, ground, 0.45) }
}

const WORDMARK: CSSProperties = { fontWeight: 800, letterSpacing: '-0.065em', lineHeight: 0.8, whiteSpace: 'nowrap' }

/** Container units, measured on the surface itself - see `Face` in the examples. */
function Wrap({ flavour, style, children }: { flavour: Flavour; style?: CSSProperties; children: ReactNode }) {
  return (
    <div style={{ width: '100%', height: '100%', containerType: 'size', background: flavour.ground, overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', color: flavour.ink, fontFamily: FONT, userSelect: 'none', ...style }}>
        {children}
      </div>
    </div>
  )
}

function Fruit({ flavour, style }: { flavour: Flavour; style: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset(flavour.image)}
      alt=""
      draggable={false}
      decoding="async"
      style={{ position: 'absolute', height: 'auto', aspectRatio: flavour.aspect, pointerEvents: 'none', ...style }}
    />
  )
}

/** The brand's one graphic: a sun on the horizon, cut off by whatever edge it rises from. */
function Sun({ flavour, style }: { flavour: Flavour; style: CSSProperties }) {
  return <div aria-hidden style={{ position: 'absolute', aspectRatio: 1, borderRadius: '50%', background: flavour.sun, ...style }} />
}

/** Name, flavour and line, set as one block. `size` is the wordmark's in cqw. */
function Lockup({ flavour, size }: { flavour: Flavour; size: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${size * 0.2}cqw` }}>
      <span style={{ ...WORDMARK, fontSize: `${size}cqw` }}>sunpeel</span>
      <span style={{ fontSize: `${size * 0.36}cqw`, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1, whiteSpace: 'nowrap' }}>
        {flavour.name}
      </span>
      <span style={{ fontSize: `${size * 0.17}cqw`, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.2, whiteSpace: 'nowrap', opacity: 0.8 }}>
        Sparkling fruit water · Squeezed, never sweetened
      </span>
    </div>
  )
}

/**
 * One flank of the bus (1920 x 455 at the wrap's resolution). `doors` is the
 * curb side: tail at the left, a door leaf at 43-52 % and another from 88 %.
 * `panel` is the king-size ad instead of the full wrap - see `SunpeelBoard`.
 */
export function SunpeelSide({ ground, doors, panel }: { ground?: string; doors?: boolean; panel?: boolean }) {
  if (panel) return <SunpeelBoard ground={ground} nose={doors ? 'right' : 'left'} />
  const flavour = flavourOf(ground)
  // Tail zone: the street side's last half, the curb side's first 42 %.
  const fruitLeft = doors ? 1 : 54
  const textLeft = doors ? 54.5 : 15
  return (
    <Wrap flavour={flavour}>
      <Sun flavour={flavour} style={{ left: `${fruitLeft + 6}cqw`, top: '8cqh', width: '30cqw' }} />
      <Fruit flavour={flavour} style={{ left: `${fruitLeft}cqw`, bottom: '10cqh', width: '41cqw' }} />
      {/* a rule along the skirt, broken only by the wheel arches the clip cuts */}
      <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '6cqh', background: flavour.ink }} />
      {/* Centred on the band above the wheel arches (their tops are at 73 %
          of the height), so no line of it runs into a cut-out. */}
      <div style={{ position: 'absolute', left: `${textLeft}cqw`, top: 0, bottom: '28cqh', display: 'flex', alignItems: 'center' }}>
        <Lockup flavour={flavour} size={doors ? 7.2 : 8.6} />
      </div>
    </Wrap>
  )
}

/** The tail (396 x 348): the sun, the fruit and the name, stacked between the lamps. `panel` is the 21" x 70" tail ad instead. */
export function SunpeelRear({ ground, panel }: { ground?: string; panel?: boolean }) {
  const flavour = flavourOf(ground)
  if (panel) {
    return (
      <Wrap flavour={flavour}>
        <Sun flavour={flavour} style={{ left: '4cqw', top: '-30cqh', width: '40cqw' }} />
        <Fruit flavour={flavour} style={{ left: '3cqw', top: '8cqh', width: '40cqw' }} />
        <div style={{ position: 'absolute', left: '50cqw', top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2cqw' }}>
          <span style={{ ...WORDMARK, fontSize: '12cqw' }}>sunpeel</span>
          <span style={{ fontSize: '4.4cqw', fontWeight: 800, letterSpacing: '-0.03em' }}>{flavour.name}</span>
        </div>
      </Wrap>
    )
  }
  return (
    <Wrap flavour={flavour}>
      <Sun flavour={flavour} style={{ left: '22cqw', top: '4cqh', width: '56cqw' }} />
      <Fruit flavour={flavour} style={{ left: '12cqw', top: '14cqh', width: '76cqw' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: '12cqh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3cqw' }}>
        <span style={{ ...WORDMARK, fontSize: '19cqw' }}>sunpeel</span>
        <span style={{ fontSize: '6.4cqw', fontWeight: 800, letterSpacing: '-0.03em' }}>{flavour.name}</span>
      </div>
    </Wrap>
  )
}

/**
 * The king-size side panel (30" x 144", 4.8:1), for a bus on `coverage="panel"`:
 * the same three things as the wrap - sun, fruit, name - in a strip. The name
 * leads from the `nose` end, so the curb side (whose panel runs tail to nose)
 * and the street side (nose to tail) both read front to back.
 */
export function SunpeelBoard({ ground, nose = 'left' }: { ground?: string; nose?: 'left' | 'right' }) {
  const flavour = flavourOf(ground)
  const at = (cqw: number): CSSProperties => (nose === 'left' ? { left: `${cqw}cqw` } : { right: `${cqw}cqw` })
  return (
    <Wrap flavour={flavour}>
      <Sun flavour={flavour} style={{ ...at(31), top: '-12cqh', width: '22cqw' }} />
      <Fruit flavour={flavour} style={{ ...at(28), top: '6cqh', width: '28cqw' }} />
      <div style={{ position: 'absolute', ...at(4), top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
        <Lockup flavour={flavour} size={5.4} />
      </div>
      <div
        style={{
          position: 'absolute',
          ...(nose === 'left' ? { right: '4cqw' } : { left: '4cqw' }),
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          fontSize: '4.2cqw',
          fontWeight: 800,
          letterSpacing: '-0.045em',
          lineHeight: 0.95,
          textAlign: nose === 'left' ? 'right' : 'left',
        }}
      >
        Ice cold.
        <br />
        Zero sugar.
      </div>
    </Wrap>
  )
}

/**
 * The destination sign, in the library's own dot-matrix face: the route and
 * where it is going, then where it goes by, flipping like the real thing.
 */
export function SunpeelRoute() {
  return <LEDText mode="cycle" text={['42  Garden Gate', '42  via Harbourside']} />
}
