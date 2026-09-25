'use client'

import { SERIF, Ean13, Ean5 } from './label-art'
import { CUT, Cut, Face, Small } from './sample-kit'

/**
 * Kiln, a quarterly about ceramics: the cover, the back page it sells, and
 * the spine that has to name it on a shelf.
 *
 * A craft title's cover is one object, photographed well, under a masthead
 * that owns the top third - so the vase stands at the right on the clay
 * colour the issue is printed in, and the cover lines run down the left in
 * the gap it leaves, the way they have to on a real one. The back is an ad,
 * because a magazine's back page is the one it charges most for: a potter's
 * supplier, one mug, one line.
 */

/** Terracotta and the slip-white the type is set in. */
const CLAY = { ground: '#b4553a', ink: '#f7ebdc', shade: '#8f3f29', soft: '#f2c9a8' }

/** The masthead: a heavy Fraunces, set tight enough that the four letters lock. */
function Masthead({ size }: { size: string }) {
  return (
    <div
      style={{
        fontFamily: SERIF,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: '-0.055em',
        lineHeight: 0.78,
      }}
    >
      Kiln
    </div>
  )
}

/** One cover line: a heavy head and a quiet deck, with the page it turns to. */
function Line({ head, deck, page }: { head: string; deck: string; page: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2cqw' }}>
      <span style={{ fontSize: '4.4cqw', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1 }}>{head}</span>
      <Small size="2.7cqw" style={{ opacity: 0.85 }}>
        {deck} <span style={{ opacity: 0.7 }}>p.{page}</span>
      </Small>
    </div>
  )
}

/** The front cover. */
export function KilnCover() {
  return (
    <Face ground={CLAY.ground} ink={CLAY.ink} style={{ padding: '5cqw 6cqw 5.5cqw' }}>
      {/* the plinth the vase stands on, and its shadow */}
      <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '15cqh', background: CLAY.shade }} />
      <div
        aria-hidden
        style={{ position: 'absolute', right: '3cqw', bottom: '13.6cqh', width: '40cqw', height: '4cqh', borderRadius: '50%', background: 'rgba(40,12,4,0.45)', filter: 'blur(1.4cqw)' }}
      />
      <Cut of={CUT.vase} style={{ right: '6cqw', bottom: '14.4cqh', height: '58cqh' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '2.6cqw', fontWeight: 600, letterSpacing: '-0.01em' }}>
        <span>A quarterly of clay and fire</span>
        <span>No. 14 · Autumn 2026</span>
      </div>
      <div style={{ marginTop: '2cqw' }}>
        <Masthead size="40cqw" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3.6cqw', width: '47cqw', marginTop: '4cqw', position: 'relative' }}>
        <div>
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: '7.6cqw', lineHeight: 0.95, letterSpacing: '-0.02em' }}>
            The fire
            <br />
            comes back
          </div>
          <Small size="2.7cqw" style={{ marginTop: '1.8cqw', opacity: 0.85 }}>
            Inside the last wood-fired kilns on the Dorset coast <span style={{ opacity: 0.7 }}>p.34</span>
          </Small>
        </div>
        <Line head="40 glazes, 12 studios" deck="The recipes, shared for once" page="52" />
        <Line head="Throwing big" deck="A week with the metre-tall jar" page="71" />
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative' }}>
        <div style={{ background: '#ffffff', padding: '1.1cqw 1.4cqw 0.6cqw', display: 'flex', alignItems: 'flex-end', gap: '1cqw', color: '#141414' }}>
          <Ean13 digits="977204935601" color="#141414" style={{ width: '19cqw' }} />
          <Ean5 digits="00014" color="#141414" style={{ width: '8cqw' }} />
        </div>
        <Small size="2.6cqw" style={{ textAlign: 'right', fontWeight: 600 }}>
          £12 · US$18
          <br />
          kilnquarterly.com
        </Small>
      </div>
    </Face>
  )
}

/** The back page: Tidewater Clay Co., selling the stoneware the issue is about. */
export function KilnBack() {
  const ink = '#123b3a'
  return (
    <Face ground="#ece2d0" ink={ink} style={{ padding: '7cqw 7cqw 6cqw' }}>
      <div aria-hidden style={{ position: 'absolute', left: '50%', top: '44cqh', width: '64cqw', aspectRatio: 1, borderRadius: '50%', background: '#dfd0b6', transform: 'translate(-50%, -50%)' }} />
      <Cut of={CUT.mug} style={{ left: '17cqw', top: '26cqh', width: '66cqw' }} />

      <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: '11cqw', lineHeight: 0.92, letterSpacing: '-0.035em', position: 'relative' }}>
        Made to
        <br />
        be held.
      </div>

      <div style={{ marginTop: 'auto', position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '4cqw' }}>
        <div>
          <div style={{ fontSize: '5cqw', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>Tidewater Clay Co.</div>
          <Small size="2.8cqw" style={{ marginTop: '1.4cqw', opacity: 0.8 }}>
            Stoneware, thrown by hand in St Ives.
            <br />
            The Harbour mug, in reactive teal · £34
          </Small>
        </div>
        <Small size="2.6cqw" style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
          tidewaterclay.co
        </Small>
      </div>
    </Face>
  )
}

/**
 * The spine, which the library turns to read top to bottom: the title at
 * the head, where a shelf is read from, and the issue at the foot.
 */
export function KilnSpine() {
  return (
    <Face
      ground={CLAY.ground}
      ink={CLAY.ink}
      style={{ flexDirection: 'row', alignItems: 'center', gap: '3cqw', padding: '0 2.2cqw', fontSize: '46cqh', fontWeight: 600, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}
    >
      <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: '72cqh', letterSpacing: '-0.04em', lineHeight: 1 }}>Kiln</span>
      <span style={{ opacity: 0.85 }}>The fire comes back · 40 glazes, 12 studios · Throwing big</span>
      <span style={{ marginLeft: 'auto' }}>No. 14 · Autumn 2026</span>
    </Face>
  )
}
