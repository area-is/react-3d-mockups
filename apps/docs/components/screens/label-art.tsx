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
  /** The figure after the label. A classic panel's vitamin block prints none. */
  amount?: string
  /** Percent daily value; omitted where the FDA format prints none (trans fat, total sugars). */
  dv?: string
  /** Indented under its parent: saturated fat under total fat, added sugars two deep. */
  indent?: 0 | 1 | 2
  /** The bold entries: the main nutrients. Sub-rows are set regular. */
  bold?: boolean
}

/**
 * Which of the FDA's two panels to print.
 *
 * `current` is the 2016 rule everything on a shelf has carried since 2021:
 * servings per container above a bold serving size, calories set enormous,
 * added sugars, and vitamins with their amounts as well as their percentages.
 *
 * `classic` is the 1993 panel - the one most people picture when they picture
 * a nutrition label, and the one the milk carton prints: serving size first,
 * "Calories from Fat" beside the calories, "Sugars" with nothing under it, and
 * the vitamins as bare percentages two to a line with a bullet between.
 */
export type NutritionFormat = 'current' | 'classic'

export interface NutritionFactsProps {
  servings: string
  servingSize: string
  calories: string
  rows: NutrientRow[]
  /** The vitamin and mineral block under the thick rule. */
  micros: NutrientRow[]
  format?: NutritionFormat
  /** `classic` only: the figure printed beside the calories. */
  caloriesFromFat?: string
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
 * The FDA's Nutrition Facts panel, rule for rule: the heavy title, the
 * servings, the 7pt bar over "Amount per serving", the % Daily Value column,
 * the thick bar before the vitamins and the footnote. What a US package
 * prints is regulated down to the rule weights, which is what makes it
 * instantly recognisable - and why an approximation reads as a table, not as
 * a label.
 *
 * Both published formats are here, because a shelf has both on it: see
 * `NutritionFormat`. They share the ink, the rules and the row, and differ in
 * the order of the head, what sits beside the calories and how the vitamins
 * are set.
 *
 * One detail worth naming, because it is the tell on a fake: the hairline
 * above an indented row starts at the indent, not at the border. So a row
 * draws its own rule rather than the one under it, and the inset falls out of
 * where the row begins.
 */
export function NutritionFacts({
  servings,
  servingSize,
  calories,
  rows,
  micros,
  format = 'current',
  caloriesFromFat,
  color = '#111111',
  background = '#ffffff',
  fontSize,
  compact,
  style,
}: NutritionFactsProps) {
  const classic = format === 'classic'
  const line = (weight: string): CSSProperties => ({ borderTop: `${weight} solid ${color}`, flex: 'none' })
  const hair = `0.07em solid ${color}`
  const pad = compact ? '0.16em 0' : '0.22em 0'
  const figure = (r: NutrientRow) => (
    <span>
      <span style={{ fontWeight: r.bold ? 700 : 400 }}>{r.label}</span>
      {r.amount ? ` ${r.amount}` : ''}
    </span>
  )
  /** The 2020 panel's row: rules run the full width, under each entry. */
  const row = (r: NutrientRow, i: number, last: boolean) => (
    <div
      key={`${r.label}-${i}`}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '0.6em',
        padding: pad,
        paddingLeft: `${(r.indent ?? 0) * 1.1}em`,
        borderBottom: last ? 'none' : hair,
        lineHeight: 1.15,
      }}
    >
      {figure(r)}
      {r.dv != null && <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{r.dv}</span>}
    </div>
  )
  /** The 1993 panel's row: its own rule above it, starting at the indent. */
  const insetRow = (r: NutrientRow, i: number) => (
    <div key={`${r.label}-${i}`} style={{ paddingLeft: `${(r.indent ?? 0) * 1.15}em`, flex: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6em', padding: pad, borderTop: hair, lineHeight: 1.15 }}>
        {figure(r)}
        {r.dv != null && <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{r.dv}</span>}
      </div>
    </div>
  )
  /** The classic vitamin block: percentages, two to a line, a bullet between. */
  const microPairs = () => {
    const pairs: NutrientRow[][] = []
    for (let i = 0; i < micros.length; i += 2) pairs.push(micros.slice(i, i + 2))
    return pairs.map(([a, b], i) => (
      <div key={a!.label} style={{ display: 'flex', alignItems: 'baseline', padding: pad, borderTop: i === 0 ? 'none' : hair, lineHeight: 1.15 }}>
        <span style={{ flex: 1 }}>
          {a!.label} {a!.dv}
        </span>
        {b && (
          <>
            <span style={{ flex: 'none', padding: '0 0.7em' }}>•</span>
            <span style={{ flex: 1 }}>
              {b.label} {b.dv}
            </span>
          </>
        )}
      </div>
    ))
  }
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
      <div style={{ fontWeight: 900, fontSize: classic ? '2.6em' : '2.15em', lineHeight: 0.95, letterSpacing: '-0.03em' }}>
        Nutrition Facts
      </div>
      {classic ? (
        <>
          <div style={{ paddingTop: '0.25em' }}>Serving Size {servingSize}</div>
          <div style={{ paddingBottom: '0.3em' }}>Servings Per Container {servings}</div>
          <div style={line('0.62em')} />
          <div style={{ fontWeight: 700, padding: '0.28em 0', borderBottom: hair }}>Amount Per Serving</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.6em', padding: '0.2em 0 0.28em' }}>
            <span style={{ fontSize: '1.5em', lineHeight: 1 }}>
              <span style={{ fontWeight: 900 }}>Calories</span> {calories}
            </span>
            {caloriesFromFat != null && <span style={{ fontSize: '1.15em' }}>Calories from Fat {caloriesFromFat}</span>}
          </div>
          <div style={line('0.35em')} />
          <div style={{ textAlign: 'right', fontWeight: 700, padding: '0.25em 0' }}>% Daily Value*</div>
          {rows.map(insetRow)}
          <div style={{ ...line('0.62em'), marginTop: '0.1em' }} />
          {microPairs()}
          <div style={{ ...line('0.12em'), marginTop: '0.1em' }} />
          <p style={{ margin: 0, paddingTop: '0.3em', fontSize: '0.88em', lineHeight: 1.25 }}>
            *Percent Daily Values are based on a 2,000 calorie diet.
          </p>
        </>
      ) : (
        <>
          <div style={{ padding: '0.35em 0 0.2em', borderBottom: hair }}>{servings} servings per container</div>
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
              borderBottom: hair,
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
        </>
      )}
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

/* ------------------------------------------------------------------ */
/*  EAN-13                                                             */
/* ------------------------------------------------------------------ */

/** G-codes: the R-codes read backwards. EAN-13's left half mixes L and G. */
const G = R.map((bits) => [...bits].reverse().join(''))

/**
 * Which of the left six digits are set in G rather than L. EAN-13 has no
 * module of its own for the first digit - it is carried entirely by this
 * parity pattern, which is the trick that fits thirteen digits into twelve
 * digits' worth of bars.
 */
const PARITY = [
  'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
  'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL',
]

/** The check digit for the first twelve digits of an EAN-13. */
function eanCheck(twelve: string): number {
  let sum = 0
  for (let i = 0; i < 12; i++) sum += Number(twelve[i]) * (i % 2 === 0 ? 1 : 3)
  return (10 - (sum % 10)) % 10
}

/**
 * A real, scannable EAN-13 - the symbol on the back of every book, where the
 * first three digits are the `978`/`979` Bookland prefix and the rest is the
 * ISBN without its own check digit.
 *
 * Same construction as `UpcA` above: guards at 101, a 01010 through the
 * middle, and the human-readable digits under the bars - except that the
 * leading digit sits outside the symbol in the left quiet zone, because it
 * has no bars of its own.
 */
export function Ean13({ digits, color, style }: { digits: string; color: string; style?: CSSProperties }) {
  const code = digits.slice(0, 12) + eanCheck(digits.slice(0, 12))
  const parity = PARITY[Number(code[0])]!
  let bits = '101'
  for (let i = 1; i < 7; i++) bits += (parity[i - 1] === 'L' ? L : G)[Number(code[i])]
  bits += '01010'
  for (let i = 7; i < 13; i++) bits += R[Number(code[i])]
  bits += '101'
  // Eleven modules of quiet zone on the left, where the lead digit is set.
  const X0 = 11
  const guard = (i: number) => i < 3 || (i >= 45 && i < 50) || i >= 92
  const bars: ReactNode[] = []
  for (let i = 0; i < bits.length; ) {
    if (bits[i] === '0') {
      i++
      continue
    }
    let j = i
    while (j < bits.length && bits[j] === '1') j++
    bars.push(<rect key={i} x={X0 + i} y={0} width={j - i} height={guard(i) ? 72 : 66} fill={color} />)
    i = j
  }
  const digit = (d: string, x: number, key: string) => (
    <text key={key} x={x} y={78} textAnchor="middle" fontSize={9} fontFamily={FONT} fill={color}>
      {d}
    </text>
  )
  return (
    <svg viewBox="0 0 120 82" style={{ display: 'block', ...style }} aria-hidden>
      {bars}
      {digit(code[0]!, 5, 'lead')}
      {[...code.slice(1, 7)].map((d, i) => digit(d, X0 + 3 + 7 * i + 3.5, `l${i}`))}
      {[...code.slice(7)].map((d, i) => digit(d, X0 + 50 + 7 * i + 3.5, `r${i}`))}
    </svg>
  )
}
