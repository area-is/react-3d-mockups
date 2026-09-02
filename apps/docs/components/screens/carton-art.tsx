'use client'

import type { CSSProperties, ReactNode } from 'react'
import { bauhaus, halftone, ortho } from 'tabbied/patterns'
import { FONT, Micro, Pattern, SIGNAL, materialTone, rule, sheet, type Tone } from './swiss-art'

/**
 * The milk carton's print: what a real half-gallon carries on each of its
 * faces, set in the carousel's own Swiss idiom rather than as a poster stuck
 * to a carton.
 *
 * A carton is the one object on the stage that is read rather than looked at
 * - everyone has turned one round at breakfast - so the faces carry what a
 * dairy actually prints: the brand and the fat on the front, the nutrition
 * table, ingredients and barcode on one side, where the milk comes from on
 * the other, a recipe on the back, and the best-before date jetted onto the
 * roof next to the cap. Every panel prints straight onto the board
 * (`materialTone`), so the carousel's finish swatches change the carton the
 * print sits on, the way a brand's white and kraft variants do.
 *
 * Measurements are in `cqw` against the panel's own width, so the type holds
 * its size on the carton however the panel is painted: 3.4cqw on a 95 mm face
 * is 3.2 mm of type, which is what a nutrition table is set at.
 */

const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'

/* ------------------------------------------------------------------ */
/*  EAN-13                                                             */
/* ------------------------------------------------------------------ */

const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011']
const G = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111']
const R = ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100']
/** Which of L and G each left-hand digit is set in, keyed by the first digit. */
const PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL']

/** The check digit for twelve digits of an EAN-13. */
function ean13Check(twelve: string): number {
  let sum = 0
  for (let i = 0; i < 12; i++) sum += Number(twelve[i]) * (i % 2 === 0 ? 1 : 3)
  return (10 - (sum % 10)) % 10
}

/** The 95 modules of a full 13-digit code, as a string of 0s and 1s. */
function ean13Modules(code: string): string {
  const parity = PARITY[Number(code[0])]!
  let bits = '101'
  for (let i = 1; i <= 6; i++) {
    const d = Number(code[i])
    bits += parity[i - 1] === 'L' ? L[d] : G[d]
  }
  bits += '01010'
  for (let i = 7; i <= 12; i++) bits += R[Number(code[i])]
  return bits + '101'
}

/**
 * A real, scannable EAN-13: guards, parity-encoded left half, right half,
 * and the digits set under the bars the way a printer's plate has them. The
 * article number is fictional; the check digit is not.
 */
function Ean13({ digits, color, style }: { digits: string; color: string; style?: CSSProperties }) {
  const code = digits.slice(0, 12) + ean13Check(digits.slice(0, 12))
  const bits = ean13Modules(code)
  // Quiet zones of 11 and 7 modules, the bars 60 tall, the guards 5 taller.
  const X0 = 11
  const bars: ReactNode[] = []
  for (let i = 0; i < bits.length; ) {
    if (bits[i] === '0') {
      i++
      continue
    }
    let j = i
    while (j < bits.length && bits[j] === '1') j++
    const guard = i < 3 || (i >= 45 && i < 50) || i >= 92
    bars.push(<rect key={i} x={X0 + i} y={0} width={j - i} height={guard ? 65 : 60} fill={color} />)
    i = j
  }
  const digit = (d: string, x: number, key: string) => (
    <text key={key} x={x} y={74} textAnchor="middle" fontSize={9} fontFamily={FONT} fill={color}>
      {d}
    </text>
  )
  return (
    <svg viewBox="0 0 113 78" style={{ display: 'block', ...style }} aria-hidden>
      {bars}
      {digit(code[0]!, 5, 'first')}
      {[...code.slice(1, 7)].map((d, i) => digit(d, X0 + 3 + 7 * i + 3.5, `l${i}`))}
      {[...code.slice(7)].map((d, i) => digit(d, X0 + 50 + 7 * i + 3.5, `r${i}`))}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Pieces                                                             */
/* ------------------------------------------------------------------ */

const face = (tone: Tone, extra?: CSSProperties): CSSProperties => ({
  ...sheet(tone),
  flexDirection: 'column',
  padding: '6cqw',
  gap: '3cqw',
  ...extra,
})

const body = (size = '3.4cqw'): CSSProperties => ({
  fontSize: size,
  lineHeight: 1.35,
  letterSpacing: '-0.005em',
})

/** The wordmark: two lines, tight, flush left. */
function Wordmark({ size, style }: { size: string; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontSize: size,
        fontWeight: 700,
        letterSpacing: '-0.05em',
        lineHeight: 0.86,
        whiteSpace: 'pre-line',
        ...style,
      }}
    >
      {'Berg\nmilch'}
    </div>
  )
}

/** A nutrition row: label, value, with the sub-rows indented and lighter. */
function Row({
  label,
  value,
  sub,
  heavy,
}: {
  label: string
  value: string
  sub?: boolean
  heavy?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '2cqw',
        padding: '1.1cqw 0',
        paddingLeft: sub ? '3cqw' : 0,
        borderTop: sub ? 'none' : '0.25cqw solid currentColor',
        opacity: sub ? 0.72 : 1,
        fontWeight: heavy ? 700 : 500,
        ...body(sub ? '3.1cqw' : '3.4cqw'),
      }}
    >
      <span>{label}</span>
      <span style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  )
}

/** The paperboard recycling mark: the code a carton carries, 21 PAP. */
function Recycle({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 40 46" style={{ width: '11cqw', display: 'block' }} aria-hidden>
      <path
        d="M20 3 4 31h32z"
        fill="none"
        stroke={color}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
      <text x={20} y={26} textAnchor="middle" fontSize={11} fontWeight={700} fontFamily={FONT} fill={color}>
        21
      </text>
      <text x={20} y={44} textAnchor="middle" fontSize={9} fontWeight={600} fontFamily={FONT} fill={color} letterSpacing={1}>
        PAP
      </text>
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Faces                                                              */
/* ------------------------------------------------------------------ */

/** The front: brand, product, fat, volume - and the picture. */
export function CartonFront({ material }: { material: string }) {
  const t = materialTone(material)
  return (
    <div style={face(t)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Micro>Vollmilch</Micro>
        <Micro style={{ color: SIGNAL }}>3.5 % Fett</Micro>
      </div>
      <div style={rule(t.text)} />
      <Wordmark size="27cqw" style={{ marginTop: '1cqw' }} />
      <Micro style={{ opacity: 0.72 }}>Pasteurisiert · Homogenisiert</Micro>
      <div style={{ flex: 1, minHeight: 0, position: 'relative', margin: '2cqw 0' }}>
        <Pattern pattern={halftone} seed="carton-front" palette={t.palette} grid="5x7" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontSize: '19cqw', fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 0.9 }}>
          1 L
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1.4cqw' }}>
          <Micro>Schweizer Milch</Micro>
          <Micro style={{ opacity: 0.72 }}>Aus dem Emmental</Micro>
        </div>
      </div>
    </div>
  )
}

/** The right side: the nutrition table, ingredients, storage, the barcode. */
export function CartonFacts({ material }: { material: string }) {
  const t = materialTone(material)
  return (
    <div style={face(t, { gap: '2.2cqw' })}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: '5.2cqw', fontWeight: 700, letterSpacing: '-0.02em' }}>Nährwerte</span>
        <Micro style={{ opacity: 0.72 }}>pro 100 ml</Micro>
      </div>
      <div>
        <Row label="Energie" value="264 kJ / 63 kcal" heavy />
        <Row label="Fett" value="3.5 g" />
        <Row label="davon gesättigte Fettsäuren" value="2.3 g" sub />
        <Row label="Kohlenhydrate" value="4.8 g" />
        <Row label="davon Zucker" value="4.8 g" sub />
        <Row label="Eiweiss" value="3.3 g" />
        <Row label="Salz" value="0.1 g" />
        <Row label="Calcium" value="120 mg (15 %*)" />
        <div style={{ borderTop: '0.25cqw solid currentColor' }} />
      </div>
      <p style={{ margin: 0, ...body('2.7cqw'), opacity: 0.72 }}>
        * Referenzmenge für einen durchschnittlichen Erwachsenen (8400 kJ / 2000 kcal).
      </p>
      <p style={{ margin: 0, marginTop: '1cqw', ...body() }}>
        <strong>Zutaten:</strong> Vollmilch (Schweiz), pasteurisiert, homogenisiert.
      </p>
      <p style={{ margin: 0, ...body() }}>
        Kühl lagern bei 2–6 °C. Nach dem Öffnen innert 3 Tagen konsumieren. Mindestens haltbar bis:
        siehe Oberseite.
      </p>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '3cqw' }}>
        <Ean13 digits="761234567890" color={t.text} style={{ width: '46cqw' }} />
        <Recycle color={t.text} />
      </div>
      <Micro style={{ opacity: 0.72, fontSize: '2.7cqw' }}>Molkerei Bergmilch AG · CH-3400 Burgdorf</Micro>
    </div>
  )
}

/** The left side: where it comes from. */
export function CartonStory({ material }: { material: string }) {
  const t = materialTone(material)
  return (
    <div style={face(t)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Micro style={{ color: SIGNAL }}>Von 42 Höfen</Micro>
        <Micro>Emmental</Micro>
      </div>
      <div style={rule(t.text)} />
      <div style={{ fontSize: '12.5cqw', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 0.92, whiteSpace: 'pre-line' }}>
        {'Was die Kuh\nfrisst, schmeckt\nman.'}
      </div>
      <p style={{ margin: 0, marginTop: '1cqw', ...body('3.6cqw') }}>
        Unsere Milch stammt von 42 Familienbetrieben rund um Burgdorf. Von Mai bis Oktober weiden
        die Kühe auf Alpwiesen, im Winter fressen sie das Heu von denselben Wiesen. Gemolken wird
        morgens, abgefüllt am selben Tag.
      </p>
      <div style={{ flex: 1, minHeight: 0, position: 'relative', margin: '2cqw 0' }}>
        <Pattern pattern={ortho} seed="carton-story" palette={t.palette} grid="4x6" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Micro>bergmilch.ch</Micro>
        <Micro style={{ opacity: 0.72 }}>Seit 1931</Micro>
      </div>
    </div>
  )
}

/** The back: a recipe, which is what the back of a milk carton is for. */
export function CartonBack({ material }: { material: string }) {
  const t = materialTone(material)
  const steps = [
    '200 ml Bergmilch erhitzen, nicht kochen.',
    'Aufschäumen, bis der Schaum steht.',
    'Über zwei Espressi giessen. Nicht rühren.',
  ]
  return (
    <div style={face(t)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Micro>Serviervorschlag</Micro>
        <Micro style={{ color: SIGNAL }}>N° 07</Micro>
      </div>
      <div style={rule(t.text)} />
      <div style={{ fontSize: '12.5cqw', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 0.92, whiteSpace: 'pre-line' }}>
        {'Milchkaffee\nfür zwei'}
      </div>
      <ol style={{ margin: 0, marginTop: '1cqw', padding: 0, listStyle: 'none', display: 'grid', gap: '1.6cqw' }}>
        {steps.map((step, i) => (
          <li key={step} style={{ display: 'flex', gap: '2.4cqw', ...body('3.6cqw') }}>
            <span style={{ color: SIGNAL, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div style={{ flex: 1, minHeight: 0, position: 'relative', margin: '2cqw 0' }}>
        <Pattern pattern={bauhaus} seed="carton-back" palette={t.palette} grid="4x6" />
      </div>
      <Wordmark size="9cqw" />
    </div>
  )
}

/**
 * The front roof panel, the cap sitting in the middle of it: the best-before
 * date and the lot, jetted on in the dot-matrix the filling line prints with,
 * kept to the band above the cap where a real one lands.
 */
export function CartonRoof({ material }: { material: string }) {
  const t = materialTone(material)
  const jet: CSSProperties = {
    fontFamily: MONO,
    fontSize: '4.6cqw',
    fontWeight: 500,
    letterSpacing: '0.14em',
    lineHeight: 1.25,
    whiteSpace: 'nowrap',
  }
  return (
    <div style={{ ...sheet(t), flexDirection: 'column', padding: '4cqw 5cqw', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Micro style={{ fontSize: '2.6cqw', opacity: 0.72 }}>Mindestens haltbar bis</Micro>
          <div style={{ ...jet, marginTop: '1cqw' }}>12.09.2026</div>
        </div>
        <div style={{ ...jet, textAlign: 'right' }}>
          L 2245
          <br />
          06:41
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Micro style={{ fontSize: '2.6cqw' }}>Bergmilch · Vollmilch 3.5 %</Micro>
        <Micro style={{ fontSize: '2.6cqw', opacity: 0.72 }}>1 L</Micro>
      </div>
    </div>
  )
}
