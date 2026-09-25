'use client'

import { LEDText } from 'react-3d-mockups'
import { SERIF } from './label-art'
import { CUT, Cut, Face, Headline, Small } from './sample-kit'

/**
 * What the street furniture carries: the objects that are lightboxes,
 * screens and stands rather than printed stock, so every piece here brings
 * its own ground the way a poster in a frame does.
 *
 * - a conference roll-up for SIGNAL, a design-systems summit;
 * - the shelter's two six-sheets: Stride running shoes facing the street and
 *   a museum show facing the people waiting;
 * - the shelter's real-time board, in the library's own LED face;
 * - a cold-brew ad on the totem's front screen.
 */

/* ------------------------------------------------------------------ */
/*  SIGNAL '26 (roll-up banner)                                        */
/* ------------------------------------------------------------------ */

const SIGNAL = { ground: '#17124a', ink: '#f3f2ff', lime: '#c8ff4d', quiet: '#aeb0e6' }

/** The summit's roll-up: the name up top, the chrome knot, the dates, the line-up, the ticket line. */
export function SignalBanner() {
  const speakers = ['Ana Ribeiro', 'Theo Lang', 'Priya Menon', 'Kwame Asante', 'Mira Holt', 'Jonas Weber']
  return (
    <Face
      ground={SIGNAL.ground}
      ink={SIGNAL.ink}
      style={{ padding: '8cqw 8cqw 8cqh', background: `radial-gradient(90% 40% at 50% 40%, #3a2f9e 0%, ${SIGNAL.ground} 70%)` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.4cqw', color: SIGNAL.lime, fontSize: '4.2cqw', fontWeight: 700 }}>
        <span style={{ width: '3cqw', height: '3cqw', borderRadius: '50%', background: SIGNAL.lime }} />
        Design Systems Summit
      </div>
      <Headline size="25cqw" style={{ marginTop: '4cqw', letterSpacing: '-0.06em' }}>
        {'SIGNAL\n’26'}
      </Headline>
      {/* the knot, bleeding off both edges */}
      <div style={{ position: 'relative', height: '30cqh', margin: '1cqh -8cqw 0', flex: 'none' }}>
        <Cut of={CUT.chrome} style={{ left: '50%', top: 0, height: '100%', transform: 'translateX(-50%)' }} />
      </div>
      <div style={{ fontSize: '8cqw', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, marginTop: '3cqw' }}>
        Lisbon
        <br />
        <span style={{ color: SIGNAL.lime }}>14–16 Oct 2026</span>
      </div>
      <Small size="4cqw" style={{ marginTop: '4cqw', color: SIGNAL.quiet }}>
        Three days, forty talks, one question: what does a system owe the people who build with it?
      </Small>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.6cqw 4cqw', marginTop: '5cqw' }}>
        {speakers.map((s) => (
          <span key={s} style={{ fontSize: '3.8cqw', fontWeight: 700, letterSpacing: '-0.02em' }}>
            {s}
          </span>
        ))}
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '4.2cqw', fontWeight: 700 }}>signal-summit.org</span>
        <span style={{ background: SIGNAL.lime, color: SIGNAL.ground, fontSize: '3.8cqw', fontWeight: 800, padding: '1.8cqw 3.4cqw', borderRadius: '8cqw' }}>
          Tickets on sale
        </span>
      </div>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  The bus shelter                                                    */
/* ------------------------------------------------------------------ */

const STRIDE = { ground: '#11402f', ink: '#f1ecdf', coral: '#ff7a59', disc: '#0b3325' }

/** The shoe brand's mark: three strides, slanted. */
function StrideMark({ size, color }: { size: string; color: string }) {
  return (
    <svg viewBox="0 0 30 20" style={{ width: size, height: 'auto', display: 'block', flex: 'none' }} aria-hidden>
      <g fill={color}>
        <path d="M6 20h5l8-20h-5z" />
        <path d="M14 20h5l8-20h-5z" opacity={0.7} />
        <path d="M-2 20h5l8-20H6z" opacity={0.4} />
      </g>
    </svg>
  )
}

/** The street-facing six-sheet: Stride, one shoe, one line. */
export function StridePoster() {
  return (
    <Face ground={STRIDE.ground} ink={STRIDE.ink} style={{ padding: '8cqw 8cqw 8cqw' }}>
      <div aria-hidden style={{ position: 'absolute', left: '14cqw', top: '38cqh', width: '100cqw', aspectRatio: 1, borderRadius: '50%', background: STRIDE.disc }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '2cqw' }}>
        <StrideMark size="8cqw" color={STRIDE.coral} />
        <span style={{ fontSize: '6.4cqw', fontWeight: 800, letterSpacing: '-0.05em' }}>stride</span>
      </div>
      <Headline size="14.5cqw" style={{ marginTop: '8cqw', position: 'relative' }}>
        {'Go the\nlong way\nhome.'}
      </Headline>
      <Cut of={CUT.sneaker} style={{ left: '4cqw', top: '48cqh', width: '104cqw', transform: 'rotate(-12deg)' }} />
      <div style={{ marginTop: 'auto', position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: '5.2cqw', fontWeight: 800, letterSpacing: '-0.035em' }}>Cloudline 3</div>
          <Small size="3.4cqw" style={{ opacity: 0.8 }}>
            Made for the miles after work.
          </Small>
        </div>
        <span style={{ fontSize: '5.2cqw', fontWeight: 800, color: STRIDE.coral }}>£140</span>
      </div>
    </Face>
  )
}

const MUSEUM = { ground: '#5b1f25', ink: '#f4e9dc', gold: '#d9b36c' }

/** The waiting-side six-sheet: a museum's winter show, the bust lit from the left. */
export function MarblePoster() {
  return (
    <Face
      ground={MUSEUM.ground}
      ink={MUSEUM.ink}
      style={{ padding: '8cqw', background: `radial-gradient(70% 55% at 62% 46%, #7a2c33 0%, ${MUSEUM.ground} 70%, #3f1418 100%)` }}
    >
      <div aria-hidden style={{ position: 'absolute', inset: '4cqw', border: `0.35cqw solid ${MUSEUM.gold}`, opacity: 0.6 }} />
      <Cut of={CUT.bust} style={{ right: '5cqw', bottom: '14cqh', height: '56cqh' }} />
      <Small size="3.4cqw" style={{ color: MUSEUM.gold, fontWeight: 600, position: 'relative' }}>
        Harbour Museum · Free entry
      </Small>
      <div style={{ fontFamily: SERIF, fontWeight: 400, fontSize: '13cqw', lineHeight: 0.9, letterSpacing: '-0.035em', marginTop: '5cqw', position: 'relative' }}>
        Marble
        <br />
        <span style={{ fontStyle: 'italic' }}>&amp; Memory</span>
      </div>
      <Small size="3.6cqw" style={{ marginTop: '4cqw', maxWidth: '38cqw', position: 'relative', opacity: 0.88 }}>
        Roman portraits from the Aldridge Collection, shown together for the first time.
      </Small>
      <div style={{ marginTop: 'auto', position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontSize: '5cqw', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          3 Oct 2026 –
          <br />
          21 Feb 2027
        </div>
        <Small size="3.2cqw" style={{ textAlign: 'right', color: MUSEUM.gold }}>
          harbourmuseum.org
        </Small>
      </div>
    </Face>
  )
}

/**
 * The real-time board facing the road: three departures in the library's own
 * dot-matrix face, columns held by runs of spaces the way a real RTPI feed
 * pads them.
 */
export function ShelterArrivals() {
  return <LEDText mode="rows" text={['42  Garden Gate  2 min', '17  Harbourside  6 min', 'N3  Airport     14 min']} />
}

/** The board's back, facing the bench: the stop's name, and the notice that scrolls. */
export function ShelterNotice() {
  return <LEDText mode="rows" text={['Stop GG  Garden Gate', 'Route 17 diverted via Mill Lane until 30 Oct']} />
}

/* ------------------------------------------------------------------ */
/*  Coldwell (DOOH totem, front)                                       */
/* ------------------------------------------------------------------ */

const COLD = { ground: '#12233f', ink: '#f3ead9', amber: '#f2b544' }

/** The totem's street face: Coldwell cold brew, one glass and three words. */
export function ColdwellScreen() {
  return (
    <Face
      ground={COLD.ground}
      ink={COLD.ink}
      style={{ padding: '9cqw 8cqw', background: `linear-gradient(180deg, #1b3563 0%, ${COLD.ground} 55%, #0a1426 100%)` }}
    >
      <div style={{ fontSize: '6cqw', fontWeight: 800, letterSpacing: '-0.05em', color: COLD.amber }}>coldwell</div>
      <Headline size="14cqw" style={{ marginTop: '6cqw', position: 'relative' }}>
        {'Cold,\nall the\nway down.'}
      </Headline>
      <div aria-hidden style={{ position: 'absolute', right: '4cqw', bottom: '14.6cqh', width: '44cqw', height: '3cqh', borderRadius: '50%', background: 'rgba(0,0,0,0.45)', filter: 'blur(1.6cqw)' }} />
      <Cut of={CUT.icedCoffee} style={{ right: '7cqw', bottom: '15.6cqh', height: '48cqh' }} />
      <div style={{ marginTop: 'auto', position: 'relative' }}>
        <Small size="4.2cqw" style={{ maxWidth: '42cqw', opacity: 0.88 }}>
          Steeped for eighteen hours. Poured over ice.
        </Small>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '3cqw', marginTop: '4cqw' }}>
          <span style={{ fontSize: '9cqw', fontWeight: 800, letterSpacing: '-0.05em', color: COLD.amber }}>£3.40</span>
          <Small size="3.6cqw">at the kiosk, 20 m ahead</Small>
        </div>
      </div>
    </Face>
  )
}
