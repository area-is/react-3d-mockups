'use client'

import { SERIF, Ean13 } from './label-art'
import { CUT, Cut, Face, Small, isDark, quietInk, stockInk } from './sample-kit'

/**
 * A birthday card from Paper & Tulip, a small stationery press - all four
 * panels, because a greeting card is the one print object whose inside
 * matters as much as its outside.
 *
 * The front is a bunch of tulips and one line, the inside left a scatter of
 * confetti, the inside right the printed wish with a handwritten note under
 * it, and the back the press's mark and the small print a card carries. It
 * prints straight onto the card (`stockInk`), so a kraft or a black stock
 * changes it the way it would change the real thing; the confetti colours
 * are inks that stay put, and the pen is blue on a light card and a pale
 * blue on a dark one - nobody writes in navy on black.
 */

const PINK = '#ec7fa3'
const APRICOT = '#f4a259'
const LEAF = '#5f9e58'

/** The press's mark: a tulip in one line. */
function TulipMark({ size, color }: { size: string; color: string }) {
  return (
    <svg viewBox="0 0 32 44" style={{ width: size, height: 'auto', display: 'block', flex: 'none' }} aria-hidden>
      <g fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 6l5 5 5-8 5 8 5-5v9a10 10 0 0 1-20 0z" />
        <path d="M16 25v17" />
        <path d="M16 36c-4-6-9-7-12-6 2 5 7 7 12 6zM16 33c3-5 7-6 10-5-2 4-6 6-10 5z" />
      </g>
    </svg>
  )
}

/** The front: the tulips, the wish, and nothing else. */
export function TulipFront({ material }: { material: string }) {
  return (
    <Face ink={stockInk(material)} style={{ alignItems: 'center', textAlign: 'center', padding: '11cqw 8cqw 0' }}>
      <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: '15cqw', lineHeight: 0.92, letterSpacing: '-0.03em' }}>
        Happy
        <br />
        birthday
      </div>
      <Cut of={CUT.tulips} style={{ left: '50%', bottom: '-4cqh', height: '66cqh', transform: 'translateX(-50%) rotate(-4deg)' }} />
    </Face>
  )
}

/** A scatter of confetti: fixed positions, so every render throws it the same way. */
const CONFETTI: [number, number, number, 'dot' | 'bar' | 'ring' | 'tri', 0 | 1 | 2 | 3][] = [
  [12, 9, 20, 'bar', 0], [30, 5, 0, 'dot', 1], [51, 11, 40, 'ring', 2], [74, 6, -20, 'bar', 1], [88, 14, 10, 'tri', 3],
  [8, 22, 60, 'tri', 2], [22, 17, 0, 'ring', 3], [63, 21, -35, 'bar', 3], [83, 27, 0, 'dot', 0], [42, 26, 15, 'dot', 2],
  [15, 78, -25, 'ring', 1], [33, 86, 50, 'bar', 2], [57, 80, 0, 'dot', 3], [77, 88, -10, 'tri', 0], [90, 76, 30, 'bar', 1],
  [6, 92, 0, 'dot', 0], [46, 93, 25, 'tri', 1], [67, 71, 70, 'bar', 0], [24, 69, 0, 'dot', 3], [86, 62, 0, 'ring', 2],
]

/** The inside left: confetti round the edges, and the one small line a card puts there. */
export function TulipInsideLeft({ material }: { material: string }) {
  const ink = stockInk(material)
  const colours = [PINK, APRICOT, LEAF, ink]
  return (
    <Face ink={ink} style={{ alignItems: 'center', justifyContent: 'center' }}>
      {CONFETTI.map(([x, y, r, shape, c], i) => {
        const color = colours[c]!
        const base = { position: 'absolute' as const, left: `${x}cqw`, top: `${y}cqh`, transform: `translate(-50%, -50%) rotate(${r}deg)` }
        if (shape === 'dot') return <span key={i} style={{ ...base, width: '3.4cqw', height: '3.4cqw', borderRadius: '50%', background: color }} />
        if (shape === 'bar') return <span key={i} style={{ ...base, width: '8cqw', height: '2.4cqw', borderRadius: '0.6cqw', background: color }} />
        if (shape === 'ring') return <span key={i} style={{ ...base, width: '5cqw', height: '5cqw', borderRadius: '50%', border: `1.1cqw solid ${color}`, boxSizing: 'border-box' }} />
        return <span key={i} style={{ ...base, width: 0, height: 0, borderLeft: '2.6cqw solid transparent', borderRight: '2.6cqw solid transparent', borderBottom: `4.4cqw solid ${color}` }} />
      })}
      <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '6cqw', color: quietInk(material, 0.3) }}>make a wish</div>
    </Face>
  )
}

/** The inside right: the printed wish, and the note somebody wrote under it. */
export function TulipInsideRight({ material }: { material: string }) {
  const pen = isDark(material) ? '#a9c1ff' : '#23449b'
  return (
    <Face ink={stockInk(material)} style={{ padding: '14cqw 11cqw 12cqw' }}>
      <div style={{ fontFamily: SERIF, fontWeight: 400, fontSize: '7.6cqw', lineHeight: 1.14, letterSpacing: '-0.02em', textAlign: 'center', textWrap: 'balance' }}>
        Here’s to another year of being exactly you.
      </div>
      <div style={{ width: '10cqw', height: '0.5cqw', background: PINK, alignSelf: 'center', margin: '7cqw 0 0', flex: 'none' }} />
      <div
        style={{
          marginTop: 'auto',
          color: pen,
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: '6.6cqw',
          lineHeight: 1.32,
          transform: 'rotate(-2.5deg)',
          transformOrigin: '0 0',
        }}
      >
        Sam -
        <br />
        have the best day. Dinner’s on me next week, and no arguing about it this time.
        <br />
        <span style={{ display: 'block', textAlign: 'right', marginTop: '3cqw' }}>Love, Jo x</span>
      </div>
    </Face>
  )
}

/** The back: the press's mark at the foot, and the small print. */
export function TulipBack({ material }: { material: string }) {
  const ink = stockInk(material)
  const quiet = quietInk(material, 0.35)
  return (
    <Face ink={ink} style={{ alignItems: 'center', textAlign: 'center', padding: '0 10cqw 9cqw' }}>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.4cqw' }}>
        <TulipMark size="9cqw" color={PINK} />
        <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '6cqw', letterSpacing: '-0.02em' }}>Paper &amp; Tulip</div>
        <Small size="3cqw" style={{ color: quiet }}>
          “Tulips” by Rosa Lind · Designed and printed in Bristol
          <br />
          on 100% recycled board · Blank inside
        </Small>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', alignSelf: 'stretch', marginTop: '7cqw' }}>
        <Small size="2.8cqw" style={{ color: quiet, textAlign: 'left' }}>
          PT-0142
          <br />
          paperandtulip.co.uk
        </Small>
        <div style={{ background: '#ffffff', padding: '1.4cqw 2cqw 0.8cqw' }}>
          <Ean13 digits="506012345014" color="#141414" style={{ width: '26cqw' }} />
        </div>
      </div>
    </Face>
  )
}
