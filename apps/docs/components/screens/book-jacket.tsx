'use client'

import type { CSSProperties, ReactNode } from 'react'
import { epicentre } from 'tabbied/patterns'
import { FONT, INK, Pattern, Sheet, type Tone } from './swiss-art'
import { Ean13 } from './label-art'
import { asset } from '@/lib/base-path.mjs'

/**
 * The jacket on the carousel's hardcover: `봄은 늦게 온다` / *Spring Comes
 * Late*, a memoir.
 *
 * The book used to carry a poster. A Swiss pattern full-bleed on the front
 * board is a fine composition and a bad book - it reads as a print that
 * happens to be book-shaped, and with only the front face printed the object
 * turned into a blank slab the moment the carousel rotated it. So this is
 * built as the thing it is: a printed dust jacket, wrapping all three faces
 * the model exposes.
 *
 * What makes a book look like a book is almost entirely the parts that are
 * not the front cover. The spine carries author, title and imprint along its
 * length, because that is the only face a shelf ever shows. The back carries
 * the apparatus - a pull quote, flap copy, an author line, the imprint's mark,
 * and a real EAN-13 of a Korean ISBN in its white box, because a barcode
 * prints on white whatever the jacket is printed on. Get those two faces
 * right and the front is allowed to be quiet.
 *
 * The photograph does the work the pattern used to. It is a cut-out on a
 * transparent ground (`/art/halmoni.webp`), so it sits ON the jacket's paper
 * rather than in a window cut into it - which is what lets her shoulder run
 * off the bottom edge the way a real jacket crops a portrait. The Tabbied
 * pattern is kept to one band under the title: an ornament, concentric rings
 * for a book about looking back, not the field.
 *
 * ### The jacket is printed paper, not cloth
 *
 * Everything else printed on the carousel uses `materialTone`, so the
 * artwork sits directly on the object's finish. A jacket is the exception,
 * and for once the physical fact and the design need agree: a dust jacket IS
 * a separate printed sheet wrapped around the cloth. So it brings its own
 * paper, and the colourway drives the jacket's accent instead of its ground -
 * one design, four bindings, the way a publisher actually issues a series.
 * It also keeps the portrait legible: her indigo jacket vanished into navy
 * cloth when the ground was the material.
 */

/* ------------------------------------------------------------------ */
/*  The jacket's paper                                                 */
/* ------------------------------------------------------------------ */

/** Uncoated cream stock - what a literary hardback's jacket is printed on. */
const PAPER = '#efe9dd'

/** sRGB relative luminance, 0-1. Duplicated from `swiss-art` only because that one is not exported. */
function luminance(hex: string): number {
  const h = hex.replace('#', '')
  const n =
    h.length === 3
      ? [...h].map((c) => Number.parseInt(c + c, 16))
      : [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16))
  const [r, g, b] = n.map((v) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * The jacket, given the binding cloth underneath it.
 *
 * The cloth becomes the accent - the rule, the kicker, the pattern's second
 * ink - so all four bindings print one design. A cloth too pale to read on
 * cream (the bone binding) falls back to the house indigo rather than
 * printing an invisible title; a jacket is not obliged to match its boards,
 * and an unreadable accent is not a design choice.
 */
function jacketTone(cloth: string): Tone {
  const accent = luminance(cloth) > 0.42 ? '#2f4a6d' : cloth
  return { ground: PAPER, text: INK, accent, palette: [PAPER, accent, INK] }
}

/* ------------------------------------------------------------------ */
/*  The book                                                          */
/* ------------------------------------------------------------------ */

const TITLE = ['Spring', 'Comes', 'Late']
const TITLE_KO = '봄은 늦게 온다'
const AUTHOR = 'Kim Soon-ja'
const AUTHOR_KO = '김순자'
const IMPRINT = 'Saedol Press'
/** 978-89-94963-01-3: the Bookland prefix, Korea's 89 group, then the title. */
const ISBN_DIGITS = '978899496301'
const ISBN_TEXT = 'ISBN 978-89-94963-01-3'

/** Uppercase micro-type, set in the jacket's own tracking. */
function Micro({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span
      style={{
        fontSize: '3.2cqw',
        fontWeight: 600,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        lineHeight: 1,
        ...style,
      }}
    >
      {children}
    </span>
  )
}

/**
 * The cut-out portrait, cropped by the jacket's edges.
 *
 * Anchored to the bottom-right corner and running off both of them, at a
 * width that leaves the lower left to the author's name. `object-position`
 * is top-left so that when the box is narrower than the photo it is her
 * shoulder that leaves the sheet, not her face.
 */
function Portrait() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset('/art/halmoni.webp')}
      alt=""
      draggable={false}
      style={{
        position: 'absolute',
        right: '-3cqw',
        bottom: 0,
        width: '58cqw',
        // 860 x 1281 in the file; held here so the aspect never depends on load order
        aspectRatio: '860 / 1281',
        objectFit: 'cover',
        objectPosition: '0% 0%',
        pointerEvents: 'none',
      }}
    />
  )
}

/**
 * Front board. Title at the head, one band of pattern under it as a rule with
 * some weather in it, and the portrait rising into the lower two-thirds.
 */
export function JacketCover({ cloth }: { cloth: string }) {
  const t = jacketTone(cloth)
  return (
    <Sheet tone={t} style={{ flexDirection: 'column', padding: '7cqw', position: 'relative' }}>
      <Portrait />

      {/* the type block sits over the photograph, so it is its own layer */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '3cqw' }}>
        <Micro style={{ color: t.accent }}>A memoir</Micro>
        <h2
          style={{
            margin: 0,
            fontSize: '15.5cqw',
            fontWeight: 700,
            letterSpacing: '-0.045em',
            lineHeight: 0.94,
            whiteSpace: 'pre-line',
          }}
        >
          {TITLE.join('\n')}
        </h2>
        <span style={{ fontSize: '5.4cqw', fontWeight: 500, letterSpacing: '-0.01em', opacity: 0.62 }}>
          {TITLE_KO}
        </span>
      </div>

      {/* The ornament breaks the left margin and stops short of the portrait.
          Run full-bleed it crossed her face, which is the one thing a jacket
          may not do; anchored left it reads as the rule it is standing in for. */}
      <div
        style={{
          position: 'relative',
          marginTop: '4cqw',
          marginLeft: '-7cqw',
          width: '48cqw',
          height: '11cqw',
          flex: 'none',
          borderTop: `0.5cqw solid ${t.accent}`,
        }}
      >
        <Pattern pattern={epicentre} seed="jacket-band" palette={t.palette} grid="5x2" />
      </div>

      <div style={{ flex: 1, minHeight: 0 }} />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.6cqw' }}>
        <span
          style={{
            fontSize: '6.6cqw',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.02,
            // Stops short of where the portrait's left edge lands, so the two
            // never meet at the foot whatever the name's length.
            maxWidth: '36cqw',
          }}
        >
          {AUTHOR}
        </span>
        <Micro style={{ fontSize: '2.8cqw', opacity: 0.6 }}>{IMPRINT}</Micro>
      </div>
    </Sheet>
  )
}

/**
 * The spine - the only face a shelf shows.
 *
 * The strip is tall and thin, so the type is laid out across it and the whole
 * line turned a quarter-turn: `rotate(90deg)` reads top-to-bottom, which is
 * how both Korean and American spines are set (a British one would run the
 * other way). The rotated line's own length is the book's height, and it is
 * sized in `cqw` - the spine's thickness - because that is what constrains a
 * spine's type: 17cqw of a 27 mm backbone is about 4.6 mm of cap height,
 * which is what a trade hardback carries.
 */
export function JacketSpine({ cloth }: { cloth: string }) {
  const t = jacketTone(cloth)
  return (
    <Sheet tone={t} style={{ alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div
        style={{
          transform: 'rotate(90deg)',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'baseline',
          gap: '11cqw',
          lineHeight: 1,
        }}
      >
        <span style={{ fontSize: '20cqw', fontWeight: 600, letterSpacing: '0.02em' }}>{AUTHOR}</span>
        <span style={{ fontSize: '25cqw', fontWeight: 700, letterSpacing: '-0.02em' }}>
          {TITLE.join(' ')}
        </span>
        <span
          style={{
            fontSize: '14cqw',
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: t.accent,
          }}
        >
          {IMPRINT}
        </span>
      </div>
    </Sheet>
  )
}

const blurb = (size = '3.5cqw'): CSSProperties => ({
  margin: 0,
  fontSize: size,
  lineHeight: 1.52,
  letterSpacing: '-0.008em',
})

/**
 * Back board: the apparatus. A pull quote, the flap copy, an author line, and
 * the foot that every book has - imprint, price, and the barcode in the white
 * box it is legally required to be scannable from.
 */
export function JacketBack({ cloth }: { cloth: string }) {
  const t = jacketTone(cloth)
  return (
    <Sheet tone={t} style={{ flexDirection: 'column', padding: '7cqw', gap: '4cqw' }}>
      <Micro style={{ color: t.accent }}>Memoir · 344 pages</Micro>

      <p
        style={{
          margin: 0,
          fontSize: '6.2cqw',
          fontWeight: 600,
          letterSpacing: '-0.03em',
          lineHeight: 1.14,
        }}
      >
        “I was sixty before I learned to say the word I wanted.”
      </p>

      <div style={{ height: '0.4cqw', background: t.accent, flex: 'none', opacity: 0.5 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.6cqw' }}>
        <p style={blurb()}>
          Kim Soon-ja was born in a market town in 1938, the fourth daughter in a house that had
          wanted sons. She was nine when the country divided, nineteen when she married a man she
          had met twice, and forty-one when she opened the shop on Bongcheon-ro that fed her family
          for thirty years.
        </p>
        <p style={blurb()}>
          She began writing this book at eighty-two, in a school notebook, in the hour before the
          shop opened. It is an account of a century in one woman&apos;s hands: what the war took,
          what the winters cost, what she refused to hand on to her daughters.
        </p>
        <p style={{ ...blurb('3.2cqw'), opacity: 0.66 }}>
          Kim Soon-ja lives in Seoul, two streets from the shop. This is her first and, she insists,
          her only book.
        </p>
      </div>

      <div style={{ flex: 1, minHeight: 0 }} />

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '4cqw' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4cqw' }}>
          <span style={{ fontSize: '4.4cqw', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>
            {IMPRINT}
          </span>
          <Micro style={{ fontSize: '2.5cqw', opacity: 0.6 }}>{AUTHOR_KO} · 새돌출판사</Micro>
          <span style={{ fontSize: '2.6cqw', opacity: 0.6, letterSpacing: '0.02em' }}>{ISBN_TEXT}</span>
        </div>

        {/* A barcode is only a barcode on white, whatever the jacket is. */}
        <div
          style={{
            flex: 'none',
            background: '#ffffff',
            padding: '1.6cqw 1.8cqw 1.2cqw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: '0.8cqw',
          }}
        >
          <span
            style={{
              fontFamily: FONT,
              fontSize: '2.1cqw',
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: INK,
            }}
          >
            ₩18,000
          </span>
          <Ean13 digits={ISBN_DIGITS} color={INK} style={{ width: '30cqw', height: 'auto' }} />
        </div>
      </div>
    </Sheet>
  )
}
