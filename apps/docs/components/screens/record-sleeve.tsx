'use client'

import type { CSSProperties, ReactNode } from 'react'
import { chase } from 'tabbied/patterns'
import { FONT, Pattern, Sheet, luminance, type Tone } from './swiss-art'
import { SERIF } from './label-art'
import { asset } from '@/lib/base-path.mjs'

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
 * ON the field rather than inside a rectangle of studio wall, so the field is
 * the cover's colour and not a mount. That is the same trick the era's
 * sleeves used with a litho mask.
 *
 * Both faces of the jacket print straight onto its stock (`material` - the
 * record's own `color`), with no ground of their own, so the field is
 * whatever colour the jacket is: the hot orange this was designed on, or any
 * other. The type picks cream or near-black by contrast with it, and the
 * label's orange stays the accent unless the stock is close enough to
 * swallow it. The disc labels are their own paper and keep their own inks.
 *
 * ### Deliberately no barcode
 *
 * The milk carton and the book both carry a real scannable symbol, because a
 * carton and a book do. A 1961 jacket does not: retail barcodes reached
 * records in the late seventies. The back carries what this sleeve's own
 * decade printed instead - the stereo notice in its box, the catalogue number
 * set twice, and the label's street address.
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

/** WCAG contrast ratio between two hex colours. */
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * The inks for a face printed straight onto the jacket stock: the design's
 * cream wherever it still reads - 3:1, the bar for type this size, which the
 * orange clears - and near-black on a stock too pale for it, a bone or a
 * lime; and the label's orange as the accent unless the stock would swallow
 * it. The ground is transparent: the stock is the surface behind the face
 * (`surfaceBackground`), so it is never painted over.
 */
function inksOn(material: string) {
  const ink = contrast(BOARD, material) >= 3 ? BOARD : INK
  const accent = contrast(FIELD, material) >= 2 ? FIELD : ink
  const tone: Tone = { ground: 'transparent', text: ink, accent, palette: ['transparent', ink, accent] }
  return { ink, accent, tone }
}

/** The sleeve's small type - the label name, the catalogue number - regular casing, tightened. */
function Micro({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span
      style={{
        fontSize: '2.6cqw',
        fontWeight: 700,
        letterSpacing: '-0.01em',
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
export function SleeveCover({ material = FIELD }: { material?: string }) {
  const { ink, tone } = inksOn(material)
  return (
    <Sheet tone={tone} style={{ flexDirection: 'column', padding: '7cqw', position: 'relative' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset('/art/jazz-trio.webp')}
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

      {/* The bass's scroll and the players' heads reach into the type: a halo
          of the stock itself, inherited by every line, lifts it off the
          photograph whichever ink is in play. */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.4cqw',
          textShadow: `0 0 0.5cqw ${material}, 0 0 1.2cqw ${material}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Micro>{LABEL_NAME}</Micro>
          <Micro style={{ opacity: 0.8 }}>{CATALOG} · Stereo</Micro>
        </div>
        <div style={{ height: '0.5cqw', background: ink, flex: 'none', opacity: 0.9 }} />
        <div
          style={{
            margin: 0,
            marginTop: '1.5cqw',
            fontSize: '13.5cqw',
            fontWeight: 700,
            letterSpacing: '-0.05em',
            lineHeight: 0.9,
            whiteSpace: 'pre-line',
          }}
        >
          {TITLE.join('\n')}
        </div>
        <span
          style={{
            fontSize: '5cqw',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1,
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

/**
 * The jacket's reverse, built to the scale a real one is printed at.
 *
 * What makes an LP back look like an LP back is that the type is SMALL. A
 * 12" jacket is a big sheet - 313 mm on a side - and the notes on it were
 * set at eight to ten point. 1cqw here is 3.1 mm, so the liner notes at
 * 1.28cqw are a real 11 pt, the track titles at 1.35cqw about 12, and the
 * title at 4.6cqw is 40 pt, which is as large as a Blue Note back ever went.
 * The first draft set everything three times that size and read as a flyer.
 * Seen on the carousel the notes are a grey texture with a title over it,
 * and that IS what a record looks like from across the room.
 *
 * The layout is the one the label's backs used from 1957 on: title and
 * artist across the head with the stereo notice and the catalogue number in
 * the corner; a photograph and the two sides' programmes under it; the notes
 * in three justified columns; the session credit and the label's address
 * across the foot. The notes are set in a serif and everything else in the
 * sans. That mix is period-correct - the headings were Franklin or Standard
 * and the notes were Times or Century, because those were the cases the
 * typesetter had - and it is half of why a real back reads as printed matter
 * rather than a web page.
 */

/** Who wrote what, for the programme's parentheses. */
const COMPOSER: Record<string, string> = {
  A1: 'M. Hale',
  A2: 'M. Hale',
  A3: 'M. Hale',
  B1: 'R. Diallo',
  B2: 'Hale-Brandt',
  B3: 'M. Hale',
}

/** The liner notes, as T. Brandt filed them. */
const NOTES = [
  'The Alhambra is a room on the second floor of a building on Bleecker Street that has been, in its time, a dance hall, a union office and a place to buy hats. It seats a hundred and ten people if the fire marshal is not counting. The late set begins at half past midnight, and by then most of the audience has been in the room for hours; they have heard the tune they came in humming, and what they want now is to be surprised.',
  'Marcus Hale has played that set every Thursday for the better part of a year. He is thirty-one, a Detroit man by way of two years in an Army band and a long apprenticeship in the section of a big band that shall go nameless here. He does not play many notes. What he plays is time - the placement of a chord a hair behind the beat, so that the whole trio seems to lean back on its heels - and the men he plays with have learned to lean with him.',
  'Reuben Diallo is the bassist, and the one member of this group who has recorded before, on two dates for this label with the Winslow quintet. His sound is large and dry and unhurried. Clifford Nance came to New York from Kansas City eighteen months ago with a cymbal, a snare drum and a letter of introduction, and has since been heard with everybody. He uses brushes for most of this record, which was his idea, and the right one.',
  'The title piece is Hale’s, a long blues in F that the trio opens most nights and had never played the same way twice until Anton Ferrier’s tape machine made it hold still. Cold Water Blues and Bongcheon Walk are his as well. Eleven Past was written by Diallo on the night the club’s clock stopped. For Someone Leaving is the ballad, taken at a walk, and Second Chorus is exactly what it says: the trio played the first chorus on the first night, listened back, and went out and played the second.',
  'These sides were recorded over three nights in March of this year at Ferrier’s studio in Newark, in front of a small invited audience whose presence you may occasionally detect. Nothing has been edited. What you hear is the late set, as it was played, by the people who play it.',
]

/**
 * The stereo notice, as the early stereo issues carried it: a box in the
 * corner, the word set wide, and the warning underneath in the smallest type
 * on the sleeve, because in 1961 a stereo groove could still ruin a mono
 * cartridge and the label was obliged to say so.
 */
function StereoBox() {
  return (
    <div
      style={{
        flex: 'none',
        width: '15cqw',
        border: '0.22cqw solid currentColor',
        padding: '0.9cqw 1cqw 0.8cqw',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.55cqw',
      }}
    >
      {/* The one word on the sleeve in spaced capitals: it is the mark the
          era printed, not a typographic choice of ours. */}
      <span style={{ fontSize: '2.1cqw', fontWeight: 800, letterSpacing: '0.16em', lineHeight: 1, textTransform: 'uppercase' }}>
        Stereo
      </span>
      <span style={{ fontSize: '0.78cqw', lineHeight: 1.3, letterSpacing: '0.01em' }}>
        A stereophonic recording. Play only on equipment made for stereo reproduction; a monaural pickup
        will damage the groove.
      </span>
    </div>
  )
}

/**
 * The photograph on the back: the same session as the front, cropped to the
 * pianist. The cut-out sits in a box painted the grey of a studio wall, so
 * it reads as a print pasted up rather than a figure floating on the board,
 * and the box is `overflow: hidden` with the image set twice its width - a
 * crop, not a shrink.
 */
function Snapshot({ style }: { style?: CSSProperties }) {
  return (
    <div
      style={{
        position: 'relative',
        flex: 'none',
        width: '30cqw',
        height: '22cqw',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #4a4643 0%, #2a2724 60%, #1c1a18 100%)',
        ...style,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset('/art/jazz-trio.webp')}
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          width: '64cqw',
          aspectRatio: '1000 / 993',
          left: '-33.5cqw',
          top: '-19.5cqw',
          filter: 'grayscale(1) contrast(1.08)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

/** One side's programme: numbered, with the composer in parentheses and the time flush right. */
function Programme({ side, tracks, accent }: { side: string; tracks: string[][]; accent: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95cqw', minWidth: 0 }}>
      <span style={{ fontSize: '1.6cqw', fontWeight: 800, letterSpacing: '-0.01em', color: accent, lineHeight: 1 }}>
        {side}
      </span>
      {tracks.map(([no, name, time], i) => (
        <div key={no} style={{ display: 'flex', alignItems: 'baseline', gap: '1cqw', fontSize: '1.35cqw', lineHeight: 1.25 }}>
          <span style={{ fontWeight: 700, minWidth: '1.7cqw', fontVariantNumeric: 'tabular-nums' }}>{i + 1}.</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>{name}</span>{' '}
            <span style={{ opacity: 0.62, whiteSpace: 'nowrap' }}>({COMPOSER[no!]})</span>
          </span>
          <span style={{ fontVariantNumeric: 'tabular-nums', opacity: 0.7 }}>{time}</span>
        </div>
      ))}
    </div>
  )
}

/** The label's mark: a record, in the two inks. */
function LabelMark({ size }: { size: string }) {
  return (
    <svg viewBox="0 0 40 40" style={{ width: size, height: size, display: 'block', flex: 'none' }} aria-hidden>
      <circle cx={20} cy={20} r={19} fill={INK} />
      <circle cx={20} cy={20} r={12} fill="none" stroke={BOARD} strokeWidth={0.8} opacity={0.5} />
      <circle cx={20} cy={20} r={15.5} fill="none" stroke={BOARD} strokeWidth={0.8} opacity={0.35} />
      <circle cx={20} cy={20} r={7} fill={FIELD} />
      <circle cx={20} cy={20} r={1.4} fill={BOARD} />
    </svg>
  )
}

/** Rules are set in the face's ink, whichever that is. */
const hairline: CSSProperties = { height: '0.18cqw', background: 'currentColor', opacity: 0.55, flex: 'none' }

/** The reverse: head, programme, notes, credits, foot - at nine point. */
export function SleeveBack({ material = BOARD }: { material?: string }) {
  const { accent, tone } = inksOn(material)
  return (
    <Sheet tone={tone} style={{ flexDirection: 'column', padding: '5cqw 5cqw 4.4cqw', gap: '2.3cqw' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '4cqw' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4cqw', minWidth: 0, paddingTop: '0.4cqw' }}>
          <span style={{ fontSize: '4.6cqw', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1, whiteSpace: 'nowrap' }}>
            {TITLE.join(' ')}
          </span>
          <span style={{ fontSize: '2.3cqw', fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1 }}>
            {ARTIST}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2.2cqw', flex: 'none' }}>
          <StereoBox />
          <span style={{ fontSize: '1.7cqw', fontWeight: 800, letterSpacing: '0.04em', lineHeight: 1, paddingTop: '0.5cqw' }}>{CATALOG}</span>
        </div>
      </div>

      <div style={{ height: '0.35cqw', background: 'currentColor', flex: 'none' }} />

      <div style={{ display: 'flex', gap: '3.6cqw', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8cqw', flex: 'none' }}>
          <Snapshot />
          <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '0.95cqw', lineHeight: 1.3, opacity: 0.75, width: '30cqw' }}>
            Hale at the Alhambra, the third night. Photograph: Ilse Marr.
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.8cqw' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2cqw' }}>
            <Programme side="Side One" tracks={SIDE_A} accent={accent} />
            <Programme side="Side Two" tracks={SIDE_B} accent={accent} />
          </div>
          <div style={{ fontSize: '1.15cqw', lineHeight: 1.4 }}>
            {PERSONNEL.map(([who, what], i) => (
              <span key={who}>
                <span style={{ fontWeight: 700 }}>{who}</span>, {what}
                {i < PERSONNEL.length - 1 ? ' · ' : '.'}
              </span>
            ))}
            <span style={{ opacity: 0.65 }}> All compositions Obsidian Music Co., BMI. Total playing time 40:17.</span>
          </div>
        </div>
      </div>

      <div style={hairline} />

      {/* the notes: three columns of nine-point serif, justified, first lines indented */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          columnCount: 3,
          columnGap: '3.2cqw',
          fontFamily: SERIF,
          fontSize: '1.28cqw',
          lineHeight: 1.42,
          textAlign: 'justify',
          hyphens: 'auto',
        }}
      >
        {NOTES.map((para, i) => (
          <p key={i} style={{ margin: 0, textIndent: i === 0 ? 0 : '1.6em' }}>
            {i === 0 && (
              <span style={{ fontFamily: FONT, fontWeight: 800, letterSpacing: '-0.01em', fontSize: '1.05em' }}>The Alhambra</span>
            )}
            {i === 0 ? para.replace(/^The Alhambra/, '') : para}
          </p>
        ))}
        <p style={{ margin: 0, textIndent: '1.6em', fontFamily: FONT, fontWeight: 700, fontSize: '0.95em', letterSpacing: 0, textAlign: 'right' }}>
          — T. Brandt
        </p>
      </div>

      <div style={{ fontSize: '1.05cqw', lineHeight: 1.4, opacity: 0.8 }}>
        Recorded March 14, 15 &amp; 16, 1961, at Ferrier Studio, Newark, New Jersey. Recording engineer: Anton Ferrier.
        Supervision: E. Wolfe. Cover photograph: Ilse Marr. Cover design: R. Lund. Liner notes: T. Brandt.
      </div>

      <div style={hairline} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '3cqw' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5cqw' }}>
          <LabelMark size="4.6cqw" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7cqw' }}>
            <span style={{ fontSize: '2.7cqw', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>
              {LABEL_NAME}
              <span style={{ color: accent }}> Records</span>
            </span>
            <span style={{ fontSize: '1.05cqw', fontWeight: 600, letterSpacing: 0, lineHeight: 1, opacity: 0.75 }}>
              Obsidian Records Inc. · 41 Bleecker Street · New York 12, N.Y.
            </span>
          </div>
        </div>
        <span style={{ fontSize: '1.05cqw', fontWeight: 600, letterSpacing: 0, lineHeight: 1, opacity: 0.75, textAlign: 'right' }}>
          {CATALOG} · Printed in U.S.A.
        </span>
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
        <span style={{ fontSize: '3.4cqw', fontWeight: 700, letterSpacing: '0.02em' }}>
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
        <span style={{ fontSize: '2.8cqw', fontWeight: 700, letterSpacing: '0.02em', opacity: 0.55, marginTop: '0.8cqw' }}>
          33⅓ rpm
        </span>
      </div>
    </Sheet>
  )
}

export const SleeveLabelA = () => <Label side="Side A" tracks={SIDE_A} />
export const SleeveLabelB = () => <Label side="Side B" tracks={SIDE_B} />
