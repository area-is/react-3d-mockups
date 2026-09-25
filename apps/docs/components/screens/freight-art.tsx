'use client'

import type { CSSProperties } from 'react'
import { asset } from '@/lib/base-path.mjs'
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
/*  Ember & Oak (custom box)                                           */
/* ------------------------------------------------------------------ */

const EMBER = '#c4552b'
const emberOn = (material: string) => (isDark(material) ? '#ef8a5a' : EMBER)

/**
 * A custom box is whatever size its `size` says, so every face here has to
 * hold at any proportion: a front can be a tall carton (240 × 320), a wide
 * gift box (180 × 120) or a 5:1 strip (300 × 60), and an end can be a sliver
 * or a letterbox. So the layouts switch on the face's own shape with
 * container queries - the face is the query container (`Face`) - and every
 * size is written as the smaller of a share of the width and a share of the
 * height, so the type fits whichever runs out first.
 */
const EMBER_CSS = `
.eo-front { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 4cqmin; --t: min(12cqw, 8cqh); }
.eo-front .eo-copy { display: flex; flex-direction: column; align-items: center; text-align: center; }
.eo-front .eo-candle { order: 2; flex: 1; min-height: 0; position: relative; }
@container (min-aspect-ratio: 6/5) {
  .eo-front { flex-direction: row; --t: min(8.4cqw, 17cqh); }
  .eo-front .eo-candle { order: 0; flex: 0 0 40%; }
  .eo-front .eo-copy { flex: 1; min-width: 0; align-items: flex-start; text-align: left; justify-content: center; }
}
.eo-back { flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: space-between; gap: 4cqmin; --t: min(4.2cqw, 3cqh); }
.eo-back .eo-code { align-self: flex-start; display: flex; flex-direction: column; gap: 2cqmin; }
@container (min-aspect-ratio: 6/5) {
  .eo-back { flex-direction: row; --t: min(2.8cqw, 4.4cqh); }
  .eo-back .eo-code { align-self: stretch; justify-content: space-between; align-items: flex-end; }
}
@container (min-aspect-ratio: 3/1) { .eo-back { --t: min(2.8cqw, 10cqh); } .eo-back .eo-rules { display: none; } }
.eo-end { flex: none; display: flex; align-items: center; gap: calc(var(--n) * 0.35); transform: rotate(-90deg); --n: min(22cqw, 13cqh); }
@container (min-aspect-ratio: 1/1) { .eo-end { transform: none; --n: min(9cqw, 40cqh); } }
.eo-notes { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: calc(var(--n) * 0.9); padding: 0 10cqw; --n: min(10cqw, 5cqh); }
@container (min-aspect-ratio: 1/1) { .eo-notes { flex-direction: row; justify-content: space-around; align-items: center; padding: 0 4cqw; --n: min(4cqw, 18cqh); } }
`

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

/** The front: the candle, the maker, the scent - side by side on a wide box, stacked on a tall one. */
export function EmberFront({ material }: { material: string }) {
  const ember = emberOn(material)
  const quiet = quietInk(material, 0.35)
  const t = (k: number) => `calc(var(--t) * ${k})`
  return (
    <Face ink={stockInk(material)} style={{ padding: 'min(6cqw, 8cqh)' }}>
      <style>{EMBER_CSS}</style>
      <div className="eo-front">
        <div className="eo-candle">
          <div aria-hidden style={{ position: 'absolute', left: '12%', right: '12%', bottom: 0, height: '6%', borderRadius: '50%', background: 'rgba(0,0,0,0.28)', filter: 'blur(1.2cqmin)' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset(CUT.candle.src)}
            alt=""
            draggable={false}
            decoding="async"
            style={{ position: 'absolute', inset: '0 0 2%', width: '100%', height: '98%', objectFit: 'contain', objectPosition: '50% 100%' }}
          />
        </div>
        <div className="eo-copy">
          <Flame size={t(0.36)} color={ember} />
          <EmberName size={t(1)} style={{ marginTop: t(0.3), display: 'block' }} />
          <div style={{ width: t(1.1), height: t(0.06), background: ember, margin: `${t(0.5)} 0 ${t(0.42)}`, flex: 'none' }} />
          <div style={{ fontSize: t(0.64), fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1, whiteSpace: 'nowrap' }}>Cedar &amp; Smoke</div>
          <Small size={t(0.32)} style={{ color: quiet, marginTop: t(0.24) }}>
            Soy wax · cotton wick · 220 g · about 45 hours
          </Small>
        </div>
      </div>
    </Face>
  )
}

/** The back: what it smells of, how to burn it, and the code the till reads. */
export function EmberBack({ material }: { material: string }) {
  const ember = emberOn(material)
  const quiet = quietInk(material, 0.35)
  const t = (k: number) => `calc(var(--t) * ${k})`
  const rules = ['Trim the wick to 5 mm before every light.', 'Burn until the whole top has melted, up to four hours.', 'Never leave a lit candle unattended.']
  return (
    <Face ink={stockInk(material)} style={{ padding: 'min(7cqw, 10cqh)' }}>
      <style>{EMBER_CSS}</style>
      <div className="eo-back">
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: t(1.5), fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, color: ember }}>A fire in the next room</div>
          <Small size={t(1)} style={{ marginTop: t(0.7) }}>
            Cedarwood and a thread of woodsmoke, over bergamot and a little oak moss. Poured in small batches in our Asheville workshop.
          </Small>
          <div className="eo-rules">
            <div style={{ fontSize: t(1.14), fontWeight: 700, marginTop: t(1.4) }}>Burning well</div>
            <ol style={{ margin: `${t(0.5)} 0 0`, paddingLeft: t(1.3), fontSize: t(0.92), lineHeight: 1.45, color: quiet }}>
              {rules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ol>
          </div>
        </div>
        <div className="eo-code">
          <EmberName size={t(1.5)} />
          <div style={{ background: '#ffffff', padding: `${t(0.5)} ${t(0.7)} ${t(0.3)}`, alignSelf: 'flex-start' }}>
            <UpcA digits="86012400412" color="#141414" style={{ width: t(8.6) }} />
          </div>
        </div>
      </div>
    </Face>
  )
}

/** An end: the name, turned to run up a tall panel and left level on a wide one. */
export function EmberEnd({ material }: { material: string }) {
  return (
    <Face ink={stockInk(material)} style={{ alignItems: 'center', justifyContent: 'center' }}>
      <style>{EMBER_CSS}</style>
      <div className="eo-end">
        <Flame size="calc(var(--n) * 0.45)" color={emberOn(material)} />
        <EmberName size="var(--n)" />
      </div>
    </Face>
  )
}

/** The other end: the notes, top to base, the way a perfumer lists them - down a tall panel, across a wide one. */
export function EmberNotes({ material }: { material: string }) {
  const ember = emberOn(material)
  const notes: [string, string][] = [
    ['Top', 'Bergamot'],
    ['Heart', 'Cedarwood'],
    ['Base', 'Woodsmoke'],
  ]
  return (
    <Face ink={stockInk(material)}>
      <style>{EMBER_CSS}</style>
      <div className="eo-notes">
        {notes.map(([k, v]) => (
          <div key={k}>
            <div style={{ fontSize: 'calc(var(--n) * 0.8)', fontWeight: 700, color: ember }}>{k}</div>
            <div style={{ fontFamily: SERIF, fontSize: 'calc(var(--n) * 1.1)', lineHeight: 1.05, letterSpacing: '-0.02em', marginTop: 'calc(var(--n) * 0.16)', whiteSpace: 'nowrap' }}>
              {v}
            </div>
          </div>
        ))}
      </div>
    </Face>
  )
}

/** The lid: the maker and the scent, centred, the way the box is opened. */
export function EmberLid({ material }: { material: string }) {
  return (
    <Face ink={stockInk(material)} style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 'min(2.4cqw, 6cqh)', padding: '0 6cqw' }}>
      <Flame size="min(3.4cqw, 10cqh)" color={emberOn(material)} />
      <EmberName size="min(8cqw, 22cqh)" />
      <Small size="min(2.8cqw, 7.4cqh)" style={{ color: quietInk(material, 0.35) }}>
        Cedar &amp; Smoke · hand-poured in Asheville, North Carolina
      </Small>
    </Face>
  )
}

/** The base: the batch jetted on, and the box's own recycling line. */
export function EmberBase({ material }: { material: string }) {
  const ink = stockInk(material)
  return (
    <Face ink={ink} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '6cqw', padding: '0 8cqw' }}>
      <JetPrint color={ink} size="min(3cqw, 9cqh)" style={{ flex: 'none', whiteSpace: 'pre' }}>
        {'POURED 14 SEP 2026\nBATCH 0926-B · 220 G'}
      </JetPrint>
      <RecycleMark color={ink} size="min(8cqw, 24cqh)" label={<Small size="min(2.6cqw, 7.4cqh)">Box: please recycle</Small>} />
    </Face>
  )
}
