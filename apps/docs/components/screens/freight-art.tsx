'use client'

import type { CSSProperties } from 'react'
import { SERIF, JetPrint, RecycleMark, UpcA } from './label-art'
import { CUT, Cut, Face, Small, isDark, quietInk, stockInk } from './sample-kit'

/**
 * Two jobs that print straight onto what they are made of: a produce
 * haulier's trailer, whose `color` is its paint, and a candle maker's box,
 * whose `color` is its board. Neither has a ground of its own - the ink
 * flips with the stock (`stockInk`) and each brand keeps one solid colour
 * that stays put.
 */

/* ------------------------------------------------------------------ */
/*  Fieldline Fresh (semi trailer)                                     */
/* ------------------------------------------------------------------ */

const FIELD = { green: '#2f7d32', red: '#c8322b' }
const fieldGreen = (material: string) => (isDark(material) ? '#7fcf6f' : FIELD.green)
const HAULIER_PHONE = '01632 960 377'

/**
 * One side of the trailer (a 13.6 m box at 5.8:1). The curb side's wrap runs
 * tail to nose and the street side's nose to tail, so `street` mirrors it:
 * the name leads from the tractor end on both, the apples trail behind.
 */
export function FieldlineSide({ material, street }: { material: string; street?: boolean }) {
  const ink = stockInk(material)
  const green = fieldGreen(material)
  const fromNose = (cqw: number): CSSProperties => (street ? { left: `${cqw}cqw` } : { right: `${cqw}cqw` })
  const fromTail = (cqw: number): CSSProperties => (street ? { right: `${cqw}cqw` } : { left: `${cqw}cqw` })
  return (
    <Face ink={ink}>
      <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '15cqh', background: FIELD.green }} />
      <div
        style={{
          position: 'absolute',
          ...fromTail(3),
          bottom: '3.4cqh',
          fontSize: '8cqh',
          fontWeight: 600,
          color: '#ffffff',
          whiteSpace: 'nowrap',
        }}
      >
        Chilled 0–4 °C · fieldlinefresh.co.uk · {HAULIER_PHONE}
      </div>
      <Cut of={CUT.apples} style={{ ...fromTail(4), top: '22cqh', height: '48cqh' }} />
      <div style={{ position: 'absolute', ...fromNose(4), top: '14cqh', display: 'flex', flexDirection: 'column', alignItems: street ? 'flex-start' : 'flex-end' }}>
        <div style={{ fontSize: '40cqh', fontWeight: 800, letterSpacing: '-0.055em', lineHeight: 0.9, whiteSpace: 'nowrap' }}>
          Fieldline <span style={{ color: green }}>Fresh</span>
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '17cqh', lineHeight: 1.1, marginTop: '3cqh', whiteSpace: 'nowrap' }}>
          Farm to shelf in 24 hours.
        </div>
      </div>
    </Face>
  )
}

/** The rear door: the name stacked narrow, and the line every haulier prints on the back. */
export function FieldlineRear({ material }: { material: string }) {
  const green = fieldGreen(material)
  return (
    <Face ink={stockInk(material)} style={{ alignItems: 'center', textAlign: 'center', padding: '10cqh 8cqw 9cqh' }}>
      <div style={{ fontSize: '16cqw', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.9 }}>
        Fieldline
        <br />
        <span style={{ color: green }}>Fresh</span>
      </div>
      <Cut of={CUT.apples} style={{ left: '8cqw', top: '38cqh', width: '84cqw' }} />
      <div style={{ marginTop: 'auto' }}>
        <Small size="6.4cqw" style={{ fontWeight: 600 }}>
          How’s my driving?
        </Small>
        <div style={{ fontSize: '8cqw', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '1cqw', whiteSpace: 'nowrap' }}>{HAULIER_PHONE}</div>
      </div>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  Ember & Oak (custom box, 180 × 120 × 60 mm)                        */
/* ------------------------------------------------------------------ */

const EMBER = '#c4552b'
const emberOn = (material: string) => (isDark(material) ? '#ef8a5a' : EMBER)

/** The maker's name. */
function EmberName({ size, style }: { size: string; style?: CSSProperties }) {
  return (
    <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: size, letterSpacing: '-0.025em', lineHeight: 1, whiteSpace: 'nowrap', ...style }}>
      Ember <span style={{ fontStyle: 'italic' }}>&amp;</span> Oak
    </span>
  )
}

/** A flame, the maker's mark. */
function Flame({ size, color }: { size: string; color: string }) {
  return (
    <svg viewBox="0 0 20 28" style={{ width: size, height: 'auto', display: 'block', flex: 'none' }} aria-hidden>
      <path d="M10 1c2 6 8 9 8 16a8 8 0 0 1-16 0c0-4 2-6 4-8 0 3 1 5 3 5-1-5 0-9 1-13z" fill={color} />
    </svg>
  )
}

/** The front: the candle, the maker, the scent. */
export function EmberFront({ material }: { material: string }) {
  const ember = emberOn(material)
  const quiet = quietInk(material, 0.35)
  return (
    <Face ink={stockInk(material)} style={{ padding: '7cqw 7cqw 6cqw 52cqw' }}>
      <div aria-hidden style={{ position: 'absolute', left: '8cqw', bottom: '9cqh', width: '36cqw', height: '4cqh', borderRadius: '50%', background: 'rgba(0,0,0,0.28)', filter: 'blur(1.2cqw)' }} />
      <Cut of={CUT.candle} style={{ left: '6cqw', bottom: '11cqh', height: '80cqh' }} />
      <Flame size="3.6cqw" color={ember} />
      <EmberName size="7cqw" style={{ marginTop: '3cqw', display: 'block' }} />
      <div style={{ width: '9cqw', height: '0.5cqw', background: ember, margin: '5cqw 0 4cqw', flex: 'none' }} />
      <div style={{ fontSize: '5.4cqw', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1 }}>Cedar &amp; Smoke</div>
      <Small size="2.7cqw" style={{ color: quiet, marginTop: '2cqw' }}>
        Soy wax · cotton wick
        <br />
        220 g · about 45 hours
      </Small>
      <Small size="2.5cqw" style={{ marginTop: 'auto', color: quiet }}>
        No. 04 of the Hearth collection
      </Small>
    </Face>
  )
}

/** The back: what it smells of, how to burn it, and the code the till reads. */
export function EmberBack({ material }: { material: string }) {
  const ember = emberOn(material)
  const quiet = quietInk(material, 0.35)
  const rules = ['Trim the wick to 5 mm before every light.', 'Burn until the whole top has melted, up to four hours.', 'Never leave a lit candle unattended.']
  return (
    <Face ink={stockInk(material)} style={{ padding: '7cqw 8cqw 6cqw', flexDirection: 'row', gap: '7cqw' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ fontSize: '4.2cqw', fontWeight: 700, letterSpacing: '-0.03em', color: ember }}>A fire in the next room</div>
        <Small size="2.8cqw" style={{ marginTop: '2cqw' }}>
          Cedarwood and a thread of woodsmoke, over bergamot and a little oak moss. Poured in small batches in our Asheville workshop.
        </Small>
        <div style={{ fontSize: '3.2cqw', fontWeight: 700, marginTop: '4cqw' }}>Burning well</div>
        <ol style={{ margin: '1.4cqw 0 0', paddingLeft: '3.6cqw', fontSize: '2.6cqw', lineHeight: 1.45, color: quiet }}>
          {rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', flex: 'none' }}>
        <EmberName size="4.2cqw" />
        <div style={{ background: '#ffffff', padding: '1.4cqw 2cqw 0.8cqw' }}>
          <UpcA digits="86012400412" color="#141414" style={{ width: '24cqw' }} />
        </div>
      </div>
    </Face>
  )
}

/** An end: the name, turned to run up the panel. */
export function EmberEnd({ material }: { material: string }) {
  return (
    <Face ink={stockInk(material)} style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: 'rotate(-90deg)', display: 'flex', alignItems: 'center', gap: '8cqw' }}>
        <Flame size="10cqw" color={emberOn(material)} />
        <EmberName size="22cqw" />
      </div>
    </Face>
  )
}

/** The other end: the notes, top to base, the way a perfumer lists them. */
export function EmberNotes({ material }: { material: string }) {
  const ember = emberOn(material)
  const notes: [string, string][] = [
    ['Top', 'Bergamot'],
    ['Heart', 'Cedarwood'],
    ['Base', 'Woodsmoke, oak moss'],
  ]
  return (
    <Face ink={stockInk(material)} style={{ justifyContent: 'center', padding: '0 12cqw', gap: '9cqw' }}>
      {notes.map(([k, v]) => (
        <div key={k}>
          <div style={{ fontSize: '8cqw', fontWeight: 700, color: ember }}>{k}</div>
          <div style={{ fontFamily: SERIF, fontSize: '11cqw', lineHeight: 1.05, letterSpacing: '-0.02em', marginTop: '1.6cqw' }}>{v}</div>
        </div>
      ))}
    </Face>
  )
}

/** The lid: the maker and the scent, centred, the way the box is opened. */
export function EmberLid({ material }: { material: string }) {
  return (
    <Face ink={stockInk(material)} style={{ alignItems: 'center', justifyContent: 'center', gap: '2.4cqw' }}>
      <Flame size="3.4cqw" color={emberOn(material)} />
      <EmberName size="8cqw" />
      <Small size="2.8cqw" style={{ color: quietInk(material, 0.35) }}>
        Cedar &amp; Smoke · hand-poured in Asheville, North Carolina
      </Small>
    </Face>
  )
}

/** The base: the batch jetted on, and the box's own recycling line. */
export function EmberBase({ material }: { material: string }) {
  const ink = stockInk(material)
  return (
    <Face ink={ink} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '0 8cqw' }}>
      <JetPrint color={ink} size="3cqw">
        {'POURED 14 SEP 2026\nBATCH 0926-B · 220 G'}
      </JetPrint>
      <RecycleMark color={ink} size="8cqw" label={<Small size="2.6cqw">Box: please recycle</Small>} />
    </Face>
  )
}
