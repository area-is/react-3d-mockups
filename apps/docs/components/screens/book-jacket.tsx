'use client'

import type { CSSProperties, ReactNode } from 'react'
import { epicentre } from 'tabbied/patterns'
import { FONT, INK, Pattern, Sheet, type Tone } from './swiss-art'
import { Ean13, Ean5 } from './label-art'
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
 * the apparatus - a pull quote, the flap copy, the author with her photograph,
 * the imprint's colophon, and the barcode block a Korean book prints: the
 * EAN-13 of the ISBN with the five-digit 부가기호 beside it and the price set
 * as `정가 18,000원`, all in the white box a barcode is scanned from. Get those
 * two faces right and the front is allowed to be quiet.
 *
 * The photograph does the work the pattern used to. It is a cut-out on a
 * transparent ground (`/art/halmoni.webp`), so it sits ON the jacket's paper
 * rather than in a window cut into it - which is what lets her shoulder run
 * off the bottom edge the way a real jacket crops a portrait. The Tabbied
 * pattern is kept to one band under the title: an ornament, concentric rings
 * for a book about looking back, not the field. The back crops the same
 * photograph down to the head-and-shoulders every author page carries.
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
 * The cloth becomes the accent - the kicker, the pattern's second ink, the
 * imprint's mark - so all four bindings print one design. A cloth too pale
 * to read on cream (the bone binding) falls back to the house indigo rather
 * than printing an invisible title; a jacket is not obliged to match its
 * boards, and an unreadable accent is not a design choice.
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
/** The imprint, set in its own language on every face: 새돌출판사, Saedol Press. */
const IMPRINT = '새돌출판사'
const IMPRINT_LATIN = 'Saedol Press'
/** 978-89-94963-01-3: the Bookland prefix, Korea's 89 group, then the title. */
const ISBN_DIGITS = '978899496301'
const ISBN_TEXT = 'ISBN 978-89-94963-01-3'
/** The 부가기호: general readership, a hardback, Korean literature. */
const ADDON = '03810'
const PRICE = '정가 18,000원'

/** The jacket's small type: regular casing, tightened. */
function Micro({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span
      style={{
        fontSize: '3.2cqw',
        fontWeight: 600,
        letterSpacing: '-0.01em',
        lineHeight: 1,
        ...style,
      }}
    >
      {children}
    </span>
  )
}

/**
 * The imprint's name, in Hangul - Noto Sans KR, through the font stack.
 * Set tight like the Latin: Hangul syllables are square and evenly spaced
 * already, and tracking them out reads as letters, not a word.
 */
function Imprint({ style }: { style?: CSSProperties }) {
  return (
    <span style={{ fontSize: '3cqw', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1, whiteSpace: 'nowrap', ...style }}>
      {IMPRINT}
    </span>
  )
}

/**
 * The publisher's mark: the first syllable of the name in a box, the way a
 * Korean house sets its colophon mark - one character, one ink.
 */
function ImprintMark({ color, size }: { color: string; size: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flex: 'none',
        border: `0.35cqw solid ${color}`,
        color,
        fontSize: `calc(${size} * 0.58)`,
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      새
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
 * Front board. Title at the head, one band of pattern under it as an
 * ornament, and the portrait rising into the lower two-thirds.
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
          may not do; anchored left it reads as the ornament it is. No rule
          over it: the rings stand on their own, the way a printer's flower
          does under a title. */}
      <div
        style={{
          position: 'relative',
          marginTop: '4cqw',
          marginLeft: '-7cqw',
          width: '48cqw',
          height: '11cqw',
          flex: 'none',
        }}
      >
        <Pattern pattern={epicentre} seed="jacket-band" palette={t.palette} grid="5x2" />
      </div>

      <div style={{ flex: 1, minHeight: 0 }} />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.8cqw' }}>
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
        <Imprint style={{ fontSize: '2.9cqw', opacity: 0.6 }} />
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
        <span style={{ fontSize: '20cqw', fontWeight: 600, letterSpacing: '-0.01em' }}>{AUTHOR}</span>
        <span style={{ fontSize: '25cqw', fontWeight: 700, letterSpacing: '-0.02em' }}>
          {TITLE.join(' ')}
        </span>
        <span style={{ fontSize: '15cqw', fontWeight: 600, letterSpacing: '0.02em', color: t.accent }}>{IMPRINT}</span>
      </div>
    </Sheet>
  )
}

const blurb = (size = '2.95cqw'): CSSProperties => ({
  margin: 0,
  fontSize: size,
  lineHeight: 1.46,
  letterSpacing: '-0.005em',
})

/**
 * The author's photograph: the same cut-out as the front, cropped to a
 * head-and-shoulders in a small square, in black and white, on the flat
 * grey a studio portrait is shot against. The box is `overflow: hidden` and
 * the image is set wider than it, which is what makes it a crop rather than
 * a shrink: her face is a third of the way across the file and near its top,
 * and the offsets below put that third in the box, hair to collar.
 */
function AuthorPhoto({ size }: { size: string }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none', overflow: 'hidden', background: '#d3ccc0' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset('/art/halmoni.webp')}
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          width: `calc(${size} * 2)`,
          aspectRatio: '860 / 1281',
          left: `calc(${size} * -0.44)`,
          top: `calc(${size} * -0.05)`,
          filter: 'grayscale(1) contrast(1.05)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

/**
 * The barcode block, as a Korean book prints it: the ISBN in figures and the
 * price (정가, the list price) on one line, then the EAN-13 with the 부가기호 add-on to its right.
 * A barcode is only a barcode on white, so the box is white whatever the
 * jacket is, and the symbol keeps to its nominal size - about 37 mm across
 * on a 156 mm cover, with the add-on beside it - because a barcode set big
 * to fill a corner is the surest tell of a mockup.
 */
function IsbnBlock() {
  return (
    <div
      style={{
        flex: 'none',
        background: '#ffffff',
        color: INK,
        fontFamily: FONT,
        padding: '1.4cqw 1.6cqw 1.3cqw',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8cqw',
      }}
    >
      <span style={{ fontSize: '1.9cqw', fontWeight: 600, letterSpacing: '0.01em', whiteSpace: 'nowrap', lineHeight: 1 }}>
        {ISBN_TEXT}
      </span>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4cqw' }}>
        <Ean13 digits={ISBN_DIGITS} color={INK} style={{ width: '22.5cqw', height: 'auto' }} />
        <Ean5 digits={ADDON} color={INK} style={{ width: '10.5cqw', height: 'auto' }} />
      </div>
      <span style={{ fontSize: '1.9cqw', fontWeight: 700, letterSpacing: 0, whiteSpace: 'nowrap', lineHeight: 1, textAlign: 'right' }}>
        {PRICE}
      </span>
    </div>
  )
}

/**
 * Back board: the apparatus, in the order a reader takes it in. A line from
 * the book set large enough to be read across a table; the flap copy; the
 * author, with her photograph, where every back cover puts her; and the foot
 * every book has - the imprint's colophon on the left, the barcode block on
 * the right.
 *
 * The foot is pinned. The copy is the one thing on the board whose height
 * the design does not control - it wraps a line longer or shorter with the
 * viewer's font rasteriser - so everything above the foot sits in a block
 * that gives way (`flex: 1`, `overflow: hidden`) and the foot keeps its own
 * height. A barcode pushed off the bottom of a board is the one thing a
 * back cover must never do; a bio clipped by a line, in the worst case, is
 * something a reader would not notice. The sizes leave the block a good
 * fifteen per cent of slack, so on any real machine neither happens.
 */
export function JacketBack({ cloth }: { cloth: string }) {
  const t = jacketTone(cloth)
  return (
    <Sheet tone={t} style={{ flexDirection: 'column', padding: '6.5cqw 7cqw 7cqw', gap: '3cqw' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '3cqw', flex: 'none' }}>
        <Micro style={{ color: t.accent }}>Memoir · 344 pages</Micro>
        <Micro style={{ fontSize: '2.6cqw', opacity: 0.55 }}>{AUTHOR_KO} 지음</Micro>
      </div>

      {/* the part that gives way - see above */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '3cqw' }}>
        <p
          style={{
            margin: 0,
            fontSize: '5.4cqw',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            lineHeight: 1.16,
            maxWidth: '78cqw',
            flex: 'none',
          }}
        >
          “I was sixty before I learned to say the word I wanted.”
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.2cqw', flex: 'none' }}>
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
        </div>

        {/* one line of praise, set the way a jacket sets it: the quote, then the name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.3cqw', borderLeft: `0.5cqw solid ${t.accent}`, paddingLeft: '3cqw', flex: 'none' }}>
          <p style={{ ...blurb('3cqw'), fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.38 }}>
            “A century in one woman&apos;s hands, told without a wasted word.”
          </p>
          <Micro style={{ fontSize: '2.2cqw', opacity: 0.6 }}>Yoon Mi-rae · author of The Salt Years</Micro>
        </div>

        {/* the author, where a reader looks for her: after the copy, with a face */}
        <div style={{ display: 'flex', gap: '3.2cqw', alignItems: 'flex-start', paddingTop: '0.6cqw', flex: 'none' }}>
          <AuthorPhoto size="13.5cqw" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.3cqw', minWidth: 0 }}>
            <span style={{ fontSize: '3.2cqw', fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.1 }}>
              {AUTHOR} <span style={{ fontWeight: 500, opacity: 0.6 }}>{AUTHOR_KO}</span>
            </span>
            <p style={{ ...blurb('2.65cqw'), opacity: 0.72, lineHeight: 1.4 }}>
              Lives in Seoul, two streets from the shop. This is her first and, she insists, her only
              book.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '3cqw', flex: 'none', paddingTop: '1cqw' }}>
        {/* the colophon: the mark, the name, and the Latin form under it */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.2cqw', minWidth: 0 }}>
          <ImprintMark color={t.accent} size="9cqw" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.3cqw' }}>
            <Imprint style={{ fontSize: '4cqw', fontWeight: 700 }} />
            <Micro style={{ fontSize: '2.2cqw', opacity: 0.6, whiteSpace: 'nowrap' }}>{IMPRINT_LATIN}</Micro>
          </div>
        </div>
        <IsbnBlock />
      </div>
    </Sheet>
  )
}
