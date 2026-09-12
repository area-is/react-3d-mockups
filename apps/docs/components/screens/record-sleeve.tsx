'use client'

import type { CSSProperties, ReactNode } from 'react'
import { chase } from 'tabbied/patterns'
import { Pattern, Sheet, type Tone } from './swiss-art'

/**
 * The carousel's LP: *Late Set at the Alhambra*, the Marcus Hale Trio, on
 * Obsidian Records - all four faces the `<VinylRecord>` model prints.
 *
 * The sleeve used to carry a gold Swiss pattern, which was a handsome square
 * and not a record. A jacket is a genre object: anybody who has held one
 * knows a cover is a photograph and a flat field, and that the back is a
 * track list with times, a personnel block and a session credit. So it is
 * built to that, in the idiom the object belongs to - Reid Miles's Blue Note
 * sleeves of 1957-1966: one saturated ground, a black-and-white photograph
 * cropped hard and bled off the edge, and the type set huge, tight and flush
 * left in a single family.
 *
 * The photograph (`/art/jazz-trio.png` → `jazz-trio.webp`) is a cut-out on a
 * transparent ground, which is the whole reason this works: the trio stands
 * ON the orange field rather than inside a rectangle of studio wall, so the
 * field is the cover's colour and not a mount. That is the same trick the
 * era's sleeves used with a litho mask.
 *
 * ### Deliberately no barcode
 *
 * The milk carton and the book both carry a real scannable symbol, because a
 * carton and a book do. A 1961 jacket does not: retail barcodes reached
 * records in the late seventies. The back carries what this sleeve's own
 * decade printed instead - `STEREO`, the catalogue number set twice, and the
 * label's street address.
 *
 * Measurements are in `cqw` against each face's own width, so the jacket's
 * 313 mm square and the disc's 100 mm label set their type at the same
 * physical size relative to the thing it is printed on.
 */

/* ------------------------------------------------------------------ */
/*  The label's inks                                                   */
/* ------------------------------------------------------------------ */

/** The jacket's ground - a hot flat orange, printed as one solid. */
const FIELD = '#d8552a'
/** The ink everything is set in: not black, the warm near-black of litho. */
const INK = '#141210'
/** The paper of the back, which is uncoated board rather than a printed field. */
const BOARD = '#e8e0d0'
/** The disc's own label stock. */
const LABEL = '#efe7d6'

const ARTIST = 'The Marcus Hale Trio'
const TITLE = ['Late Set', 'at the', 'Alhambra']
const LABEL_NAME = 'Obsidian'
const CATALOG = 'OBS-4014'

const SIDE_A = [
  ['A1', 'Late Set at the Alhambra', '7:42'],
  ['A2', 'Cold Water Blues', '5:18'],
  ['A3', 'Bongcheon Walk', '6:04'],
]
const SIDE_B = [
  ['B1', 'Eleven Past', '9:31'],
  ['B2', 'For Someone Leaving', '4:47'],
  ['B3', 'Second Chorus', '6:55'],
]

const PERSONNEL = [
  ['Marcus Hale', 'piano'],
  ['Reuben Diallo', 'bass'],
  ['Clifford Nance', 'drums'],
]

/** The jacket's front: an orange field, so the tone's ground IS the ink field. */
const coverTone: Tone = {
  ground: FIELD,
  text: BOARD,
  accent: INK,
  palette: [FIELD, INK, BOARD],
}

/** The jacket's reverse: board, set in the same near-black. */
const backTone: Tone = {
  ground: BOARD,
  text: INK,
  accent: FIELD,
  palette: [BOARD, FIELD, INK],
}

/** Uppercase micro-type - the catalogue numbers, the side marks, the credits. */
function Micro({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span
      style={{
        fontSize: '2.6cqw',
        fontWeight: 700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        lineHeight: 1,
        ...style,
      }}
    >
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Front                                                             */
/* ------------------------------------------------------------------ */

/**
 * Front cover. Type in the top third, the trio bled off the bottom edge.
 *
 * The photograph is wider than it is tall once cropped, and it is given the
 * full width at the foot rather than being centred: the bassist leaving the
 * left edge is what makes the field read as a field the band is standing in,
 * instead of a card they have been pasted onto.
 */
export function SleeveCover() {
  return (
    <Sheet tone={coverTone} style={{ flexDirection: 'column', padding: '7cqw', position: 'relative' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/art/jazz-trio.webp"
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          left: '-4cqw',
          right: '-4cqw',
          // Pushed below the sleeve's foot so the players' heads clear the
          // title band: a record sleeve crops at the shins, it does not
          // shrink the band to fit the frame.
          bottom: '-11cqw',
          width: '108cqw',
          // 1000 x 993 in the file
          aspectRatio: '1000 / 993',
          objectFit: 'contain',
          objectPosition: '50% 100%',
          // The cut-out is already monochrome; this only deepens the blacks so
          // they hold against a ground this saturated.
          filter: 'grayscale(1) contrast(1.12) brightness(0.98)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '2.4cqw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Micro style={{ color: BOARD }}>{LABEL_NAME}</Micro>
          <Micro style={{ color: BOARD, opacity: 0.8 }}>{CATALOG} · Stereo</Micro>
        </div>
        <div style={{ height: '0.5cqw', background: BOARD, flex: 'none', opacity: 0.9 }} />
        <h2
          style={{
            margin: 0,
            marginTop: '1.5cqw',
            fontSize: '13.5cqw',
            fontWeight: 700,
            letterSpacing: '-0.05em',
            lineHeight: 0.9,
            color: BOARD,
            whiteSpace: 'pre-line',
          }}
        >
          {TITLE.join('\n')}
        </h2>
        <span
          style={{
            fontSize: '5cqw',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            // Cream, like the title: the artist line lands on the drum kit,
            // and near-black ink disappeared into it. Only the flat ground
            // below the photograph would carry dark ink, and the type does
            // not live there.
            color: BOARD,
          }}
        >
          {ARTIST}
        </span>
      </div>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ */
/*  Back                                                              */
/* ------------------------------------------------------------------ */

const note = (size = '2.5cqw'): CSSProperties => ({
  margin: 0,
  fontSize: size,
  lineHeight: 1.5,
  letterSpacing: '-0.005em',
})

/** One side's track list: number, title, time, with the time flush right. */
function Side({ label, tracks }: { label: string; tracks: string[][] }) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.4cqw' }}>
      <Micro style={{ color: FIELD }}>{label}</Micro>
      {tracks.map(([no, name, time]) => (
        <div
          key={no}
          style={{ display: 'flex', alignItems: 'baseline', gap: '1.4cqw', fontSize: '2.6cqw', lineHeight: 1.28 }}
        >
          <span style={{ fontWeight: 700, opacity: 0.45, minWidth: '4cqw' }}>{no}</span>
          <span style={{ fontWeight: 600, letterSpacing: '-0.01em', flex: 1, minWidth: 0 }}>{name}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', opacity: 0.6 }}>{time}</span>
        </div>
      ))}
    </div>
  )
}

/** The reverse: track lists, liner note, personnel, and the session credit. */
export function SleeveBack() {
  return (
    <Sheet tone={backTone} style={{ flexDirection: 'column', padding: '6cqw', gap: '3cqw' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: '5.2cqw', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1 }}>
          {TITLE.join(' ')}
        </span>
        <Micro style={{ opacity: 0.6 }}>{CATALOG}</Micro>
      </div>
      <div style={{ height: '0.4cqw', background: INK, flex: 'none', opacity: 0.35 }} />

      <div style={{ display: 'flex', gap: '6cqw' }}>
        <Side label="Side A" tracks={SIDE_A} />
        <Side label="Side B" tracks={SIDE_B} />
      </div>

      <div style={{ display: 'flex', gap: '6cqw', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2cqw' }}>
          <p style={note()}>
            Hale booked the room for one night and kept it for three. The trio had been playing the
            Alhambra&apos;s late set for a year by then - the second show, the one that starts at
            half past midnight, when nobody is listening for the tune they came in humming.
          </p>
          <p style={{ ...note('2.25cqw'), opacity: 0.66 }}>
            Recorded 14-16 March 1961 at Ferrier Studio, Newark, New Jersey. Engineer: A. Ferrier.
            Cover photograph: uncredited. Notes: T. Brandt.
          </p>
        </div>

        <div style={{ flex: 'none', width: '28cqw', display: 'flex', flexDirection: 'column', gap: '1.6cqw' }}>
          <Micro style={{ color: FIELD }}>Personnel</Micro>
          {PERSONNEL.map(([who, what]) => (
            <div key={who} style={{ fontSize: '2.6cqw', lineHeight: 1.25 }}>
              <div style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>{who}</div>
              <div style={{ opacity: 0.6 }}>{what}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }} />

      {/* A 1961 sleeve's foot: no barcode, because there were none. */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '4cqw' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2cqw' }}>
          <span style={{ fontSize: '4.4cqw', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>
            {LABEL_NAME}
            <span style={{ color: FIELD }}> Records</span>
          </span>
          <Micro style={{ fontSize: '2.1cqw', opacity: 0.55 }}>
            41 Bleecker Street · New York 12 · N.Y.
          </Micro>
        </div>
        <Micro style={{ fontSize: '3.4cqw', letterSpacing: '0.3em' }}>Stereo</Micro>
      </div>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ */
/*  The disc                                                          */
/* ------------------------------------------------------------------ */

/**
 * A centre label.
 *
 * The model punches the spindle hole out of this surface, so the middle band
 * is left empty by construction: the label's own type lives in the top and
 * bottom thirds, which is also where a real one puts it. The arc a pressing
 * plant sets its label name on is the one thing not reproduced - a curved
 * baseline needs an SVG `textPath`, and at the size this is seen it would
 * read as a smudge either way.
 */
function Label({ side, tracks }: { side: string; tracks: string[][] }) {
  return (
    <Sheet
      tone={{ ground: LABEL, text: INK, accent: FIELD, palette: [LABEL, FIELD, INK] }}
      /* A round label is a square surface the model masks to a circle, so the
         type has to stay inside the inscribed circle - hence the deep padding
         rather than the 7cqw a square face would take. */
      style={{ flexDirection: 'column', alignItems: 'center', padding: '13cqw 12cqw', textAlign: 'center' }}
    >
      {/* The pattern ring: a plant's label often carries a printed band at the
          rim. One seeded draw, because a pressed label does not animate. */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.08, pointerEvents: 'none' }}>
        <Pattern pattern={chase} seed={`label-${side}`} palette={[LABEL, FIELD, INK]} grid="11x11" />
      </div>

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2cqw' }}>
        <span style={{ fontSize: '9cqw', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, color: FIELD }}>
          {LABEL_NAME}
        </span>
        <span style={{ fontSize: '3.4cqw', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          {CATALOG} · {side}
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0 }} />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8cqw' }}>
        {tracks.map(([, name, time]) => (
          <span key={name} style={{ fontSize: '3.1cqw', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.15 }}>
            {name} <span style={{ opacity: 0.5, fontVariantNumeric: 'tabular-nums' }}>{time}</span>
          </span>
        ))}
        <span style={{ fontSize: '2.8cqw', fontWeight: 700, letterSpacing: '0.14em', opacity: 0.55, marginTop: '0.8cqw' }}>
          33⅓ RPM
        </span>
      </div>
    </Sheet>
  )
}

export const SleeveLabelA = () => <Label side="Side A" tracks={SIDE_A} />
export const SleeveLabelB = () => <Label side="Side B" tracks={SIDE_B} />
