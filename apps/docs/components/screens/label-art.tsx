'use client'

import { useId, type CSSProperties, type ReactNode } from 'react'
import { FONT } from './swiss-art'

/**
 * The furniture every real package carries and no poster does: the Nutrition
 * Facts panel, the UPC, the round seals, the recycling marks and the jet-printed
 * date. Shared by the milk carton and the cereal box, which are the two objects
 * on the carousel that are modelled on something you could pick up in a store,
 * so their labels have to be the labels a store shelf actually has on it.
 *
 * Everything scales with the panel it is on. A caller sets `fontSize` on the
 * component (in `cqw`, against the face's own width) and every rule, gap and
 * type size inside is in `em`, so the same panel sets at nutrition-label size
 * on a 95 mm carton side and at a hair smaller on a 55 mm cereal-box side.
 */

/** A dairy or a mill sets its name in something with serifs; Inter is for the small print. */
export const SERIF = 'Georgia, "Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Times New Roman", serif'
/** The filling line's ink-jet: the one face of a package that is not typeset. */
export const MONO = 'var(--font-jetbrains-mono), "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace'

/**
 * A picture on the pack - the generated photograph or illustration a real
 * package prints where a poster would have a pattern - full-bleed in its box
 * unless told otherwise. `position` crops it (`object-position`), which is
 * how the carton's story side shows the herd from the same painting the
 * front shows the glass in.
 */
export function Photo({ src, position = '50% 50%', fit = 'cover', style }: { src: string; position?: string; fit?: 'cover' | 'contain'; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      draggable={false}
      style={{ display: 'block', width: '100%', height: '100%', objectFit: fit, objectPosition: position, ...style }}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  UPC-A                                                              */
/* ------------------------------------------------------------------ */

const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011']
const R = ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100']

/** The check digit for the first eleven digits of a UPC-A. */
function upcCheck(eleven: string): number {
  let sum = 0
  for (let i = 0; i < 11; i++) sum += Number(eleven[i]) * (i % 2 === 0 ? 3 : 1)
  return (10 - (sum % 10)) % 10
}

/**
 * A real, scannable UPC-A - the symbol on every US grocery package. Left
 * guard, six L-coded digits, the centre guard, six R-coded digits, right
 * guard; the number system digit set small to the left and the check digit
 * small to the right, both with their bars running the full height the way
 * a printer's plate has them. The article number is fictional; the check
 * digit is not.
 */
export function UpcA({ digits, color, style }: { digits: string; color: string; style?: CSSProperties }) {
  const code = digits.slice(0, 11) + upcCheck(digits.slice(0, 11))
  let bits = '101'
  for (let i = 0; i < 6; i++) bits += L[Number(code[i])]
  bits += '01010'
  for (let i = 6; i < 12; i++) bits += R[Number(code[i])]
  bits += '101'
  // Nine modules of quiet zone each side. The two outer digits' bars are as
  // tall as the guards, so the human-readable digits fit under the middle ten.
  const X0 = 9
  const tall = (i: number) => i < 10 || (i >= 45 && i < 50) || i >= 85
  const bars: ReactNode[] = []
  for (let i = 0; i < bits.length; ) {
    if (bits[i] === '0') {
      i++
      continue
    }
    let j = i
    while (j < bits.length && bits[j] === '1') j++
    bars.push(<rect key={i} x={X0 + i} y={0} width={j - i} height={tall(i) ? 66 : 60} fill={color} />)
    i = j
  }
  const digit = (d: string, x: number, key: string, size = 9) => (
    <text key={key} x={x} y={74} textAnchor="middle" fontSize={size} fontFamily={FONT} fill={color}>
      {d}
    </text>
  )
  return (
    <svg viewBox="0 0 113 78" style={{ display: 'block', ...style }} aria-hidden>
      {bars}
      {digit(code[0]!, 4, 'ns', 7)}
      {[...code.slice(1, 6)].map((d, i) => digit(d, X0 + 10 + 7 * i + 3.5, `l${i}`))}
      {[...code.slice(6, 11)].map((d, i) => digit(d, X0 + 50 + 7 * i + 3.5, `r${i}`))}
      {digit(code[11]!, 109, 'ck', 7)}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Nutrition Facts                                                    */
/* ------------------------------------------------------------------ */

export interface NutrientRow {
  label: string
  amount: string
  /** Percent daily value; omitted where the FDA format prints none (trans fat, total sugars). */
  dv?: string
  /** Indented under its parent: saturated fat under total fat, added sugars two deep. */
  indent?: 0 | 1 | 2
  /** The bold entries: the main nutrients. Sub-rows are set regular. */
  bold?: boolean
}

export interface NutritionFactsProps {
  servings: string
  servingSize: string
  calories: string
  rows: NutrientRow[]
  /** The vitamin and mineral block under the thick rule. */
  micros: NutrientRow[]
  /** Ink and the label ground: a nutrition panel is black on white wherever the package is printed. */
  color?: string
  background?: string
  /** Base size, in the caller's units - every measurement inside is relative to it. */
  fontSize: string
  /** Shorter footnote and tighter leading for a narrow side panel. */
  compact?: boolean
  style?: CSSProperties
}

/**
 * The FDA's 2020 Nutrition Facts panel, rule for rule: the heavy title, the
 * servings line, the 7pt bar over "Amount per serving", calories set at
 * three times the body, the % Daily Value column, the thick bar before the
 * vitamins and the footnote. What a US package prints is regulated down to
 * the rule weights, which is what makes it instantly recognisable - and why
 * an approximation reads as a table, not as a label.
 */
export function NutritionFacts({
  servings,
  servingSize,
  calories,
  rows,
  micros,
  color = '#111111',
  background = '#ffffff',
  fontSize,
  compact,
  style,
}: NutritionFactsProps) {
  const line = (weight: string): CSSProperties => ({ borderTop: `${weight} solid ${color}`, flex: 'none' })
  const row = (r: NutrientRow, i: number, last: boolean) => (
    <div
      key={`${r.label}-${i}`}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '0.6em',
        padding: compact ? '0.16em 0' : '0.22em 0',
        paddingLeft: `${(r.indent ?? 0) * 1.1}em`,
        borderBottom: last ? 'none' : `0.07em solid ${color}`,
        lineHeight: 1.15,
      }}
    >
      <span>
        <span style={{ fontWeight: r.bold ? 700 : 400 }}>{r.label}</span> {r.amount}
      </span>
      {r.dv != null && <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{r.dv}</span>}
    </div>
  )
  return (
    <div
      style={{
        boxSizing: 'border-box',
        border: `0.12em solid ${color}`,
        padding: '0.35em 0.45em 0.45em',
        background,
        color,
        fontFamily: FONT,
        fontSize,
        lineHeight: 1.2,
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
        ...style,
      }}
    >
      <div style={{ fontWeight: 900, fontSize: '2.15em', lineHeight: 0.95, letterSpacing: '-0.03em' }}>
        Nutrition Facts
      </div>
      <div style={{ padding: '0.35em 0 0.2em', borderBottom: `0.07em solid ${color}` }}>{servings} servings per container</div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '0.6em',
          fontWeight: 700,
          fontSize: '1.15em',
          padding: '0.25em 0',
        }}
      >
        <span>Serving size</span>
        <span style={{ textAlign: 'right' }}>{servingSize}</span>
      </div>
      <div style={line('0.7em')} />
      <div style={{ fontWeight: 700, fontSize: '0.82em', paddingTop: '0.3em' }}>Amount per serving</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '0.6em' }}>
        <span style={{ fontWeight: 900, fontSize: '1.9em', lineHeight: 1 }}>Calories</span>
        <span style={{ fontWeight: 900, fontSize: '3em', lineHeight: 0.85 }}>{calories}</span>
      </div>
      <div style={{ ...line('0.35em'), marginTop: '0.3em' }} />
      <div
        style={{
          textAlign: 'right',
          fontWeight: 700,
          fontSize: '0.9em',
          padding: '0.25em 0',
          borderBottom: `0.07em solid ${color}`,
        }}
      >
        % Daily Value*
      </div>
      {rows.map((r, i) => row(r, i, i === rows.length - 1))}
      <div style={line('0.7em')} />
      {micros.map((r, i) => row(r, i, i === micros.length - 1))}
      <div style={{ ...line('0.35em'), marginTop: '0.1em' }} />
      <p style={{ margin: 0, paddingTop: '0.3em', fontSize: '0.78em', lineHeight: 1.25 }}>
        * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily
        diet. 2,000 calories a day is used for general nutrition advice.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Seals and marks                                                    */
/* ------------------------------------------------------------------ */

/**
 * A round seal with its legend running round the rim and a word or a glyph
 * in the middle: the "Grade A" on a carton, the "whole grain" on a cereal
 * box, the claim stamps a package wears like badges. `size` is the diameter
 * in the caller's units.
 */
export function RoundSeal({
  size,
  legend,
  center,
  color,
  fill = 'transparent',
  ring = true,
  style,
}: {
  size: string
  legend: string
  center: ReactNode
  color: string
  fill?: string
  ring?: boolean
  style?: CSSProperties
}) {
  // Ids are document-global and every seal on the stage shares one document.
  const rim = useId()
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none', ...style }}>
      <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden>
        <circle cx={50} cy={50} r={48} fill={fill} stroke={color} strokeWidth={2.4} />
        {ring && <circle cx={50} cy={50} r={33} fill="none" stroke={color} strokeWidth={1.2} />}
        <defs>
          <path id={rim} d="M50 50 m-40.5 0 a40.5 40.5 0 1 1 81 0 a40.5 40.5 0 1 1 -81 0" />
        </defs>
        <text fontFamily={FONT} fontSize={8.6} fontWeight={700} letterSpacing={1.4} fill={color}>
          <textPath href={`#${rim}`} startOffset="0">
            {legend}
          </textPath>
        </text>
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: '24%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color,
          fontFamily: FONT,
          lineHeight: 0.95,
        }}
      >
        {center}
      </div>
    </div>
  )
}

/** The chasing arrows: the "please recycle" every carton and box carries. */
export function RecycleMark({ color, size, label }: { color: string; size: string; label?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', color, fontFamily: FONT }}>
      <svg viewBox="0 0 48 48" style={{ width: size, height: size, display: 'block', flex: 'none' }} aria-hidden>
        <g fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 14 24 4l6 10" />
          <path d="M30 14 36 24" />
          <path d="M9 30 3 20l11-2" />
          <path d="M9 30l6 10h12" />
          <path d="M39 30l6-10-11-2" />
          <path d="M39 30l-6 10" />
        </g>
        <g fill={color}>
          <path d="M27 40l6-4-1 8z" />
          <path d="M14 18l-6 3 6 3z" transform="rotate(-30 14 21)" />
          <path d="M34 18l6 3-6 3z" transform="rotate(30 34 21)" />
        </g>
      </svg>
      {label && <span style={{ fontSize: '0.8em', lineHeight: 1.1 }}>{label}</span>}
    </div>
  )
}

/**
 * The ink-jet: a best-before or a lot code sprayed on by the filling line,
 * in the dot-matrix mono that sits on top of the print job rather than in it.
 */
export function JetPrint({ children, color, size, style }: { children: ReactNode; color: string; size: string; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: size,
        fontWeight: 500,
        letterSpacing: '0.12em',
        lineHeight: 1.3,
        whiteSpace: 'pre-line',
        color,
        opacity: 0.86,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/** A claim in a pill: "VITAMIN D", "FAMILY SIZE" - a shape a shelf reads from ten feet. */
export function Pill({
  children,
  color,
  ink,
  size,
  style,
}: {
  children: ReactNode
  /** Fill. */
  color: string
  /** Type colour on the fill. */
  ink: string
  size: string
  style?: CSSProperties
}) {
  return (
    <span
      style={{
        display: 'inline-block',
        background: color,
        color: ink,
        fontFamily: FONT,
        fontSize: size,
        fontWeight: 800,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        lineHeight: 1,
        padding: '0.45em 0.9em 0.4em',
        borderRadius: '2em',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  )
}
