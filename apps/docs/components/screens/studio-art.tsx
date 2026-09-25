'use client'

import type { CSSProperties } from 'react'
import { SERIF } from './label-art'
import { Face, Small, isDark, quietInk, stockInk } from './sample-kit'

/**
 * Atelier Moreau, a small architecture practice: the founder's business card
 * and the sign on the studio door, which is what the custom panel is shaped
 * like at its 300 × 200 mm default.
 *
 * An architect's print is mostly paper, so both jobs are one ink on the
 * stock plus the practice's mark - an arcade of three arches - in a
 * terracotta that holds on a white card and a black one alike. The ink
 * flips with the stock (`stockInk`); the terracotta lifts a step on a dark
 * one so the mark keeps its weight.
 */

const TERRACOTTA = '#c4633f'
const markOn = (material: string) => (isDark(material) ? '#e8845e' : TERRACOTTA)

/** The mark: three arches on a plinth line. */
export function ArchesMark({ size, color }: { size: string; color: string }) {
  return (
    <svg viewBox="0 0 64 40" style={{ width: size, height: 'auto', display: 'block', flex: 'none' }} aria-hidden>
      <g fill="none" stroke={color} strokeWidth={3.2} strokeLinejoin="round">
        <path d="M5 37V19a8 8 0 0 1 16 0v18" />
        <path d="M24 37V15a8 8 0 0 1 16 0v22" />
        <path d="M43 37V19a8 8 0 0 1 16 0v18" />
        <path d="M1 38h62" strokeLinecap="round" />
      </g>
    </svg>
  )
}

/** The practice's name: Fraunces at a book weight, the way an architect's letterhead is set. */
function Name({ size, style }: { size: string; style?: CSSProperties }) {
  return (
    <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: size, letterSpacing: '-0.02em', lineHeight: 1, whiteSpace: 'nowrap', ...style }}>
      Atelier Moreau
    </span>
  )
}

/** The card's front: the practice at the head, the person in the middle, how to reach her at the foot. */
export function MoreauCard({ material }: { material: string }) {
  const quiet = quietInk(material, 0.35)
  return (
    <Face ink={stockInk(material)} style={{ padding: '7.4cqw 8cqw 7cqw' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.2cqw' }}>
        <ArchesMark size="7cqw" color={markOn(material)} />
        <Name size="3.6cqw" />
      </div>
      <div style={{ marginTop: 'auto' }}>
        <div style={{ fontSize: '7.4cqw', fontWeight: 700, letterSpacing: '-0.045em', lineHeight: 1 }}>Inès Moreau</div>
        <Small size="3.1cqw" style={{ color: quiet, marginTop: '1.2cqw' }}>
          Architect ARB · Founding director
        </Small>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4cqw', marginTop: '6.4cqw' }}>
        <Small size="2.75cqw">
          +44 117 496 0318
          <br />
          ines@ateliermoreau.co.uk
        </Small>
        <Small size="2.75cqw" style={{ textAlign: 'right', color: quiet }}>
          Studio 4, 18 Quay Street
          <br />
          Bristol BS1 4DB
        </Small>
      </div>
    </Face>
  )
}

/** The card's back: the mark and the name, and the stock doing the rest. */
export function MoreauCardBack({ material }: { material: string }) {
  return (
    <Face ink={stockInk(material)} style={{ alignItems: 'center', justifyContent: 'center', gap: '4cqw' }}>
      <ArchesMark size="22cqw" color={markOn(material)} />
      <Name size="5.4cqw" />
      <Small size="2.6cqw" style={{ color: quietInk(material, 0.35) }}>
        Architecture &amp; interiors · ateliermoreau.co.uk
      </Small>
    </Face>
  )
}

/**
 * The studio's door sign. What a practice screws beside its door is the
 * letterhead at 300 mm: the mark, the name, what they do and which bell.
 */
export function MoreauSign({ material }: { material: string }) {
  const quiet = quietInk(material, 0.35)
  const mark = markOn(material)
  return (
    <Face ink={stockInk(material)} style={{ padding: '8cqw 8.5cqw 7.5cqw' }}>
      <ArchesMark size="17cqw" color={mark} />
      <div style={{ marginTop: 'auto' }}>
        <Name size="10.4cqw" />
        <Small size="3.8cqw" style={{ color: quiet, marginTop: '2.4cqw' }}>
          Architecture &amp; interiors
        </Small>
      </div>
      <div style={{ height: '0.45cqw', background: mark, margin: '5cqw 0 3.6cqw', flex: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Small size="3.2cqw">Studio 4 · First floor</Small>
        <Small size="3.2cqw" style={{ color: quiet }}>
          Please ring and come up
        </Small>
      </div>
    </Face>
  )
}

/**
 * The sign's back, which faces the wall: the signmaker's label, the way a
 * made thing is signed where nobody sees it.
 */
export function MoreauSignBack({ material }: { material: string }) {
  const quiet = quietInk(material, 0.35)
  return (
    <Face ink={stockInk(material)} style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '2.6cqw' }}>
      <ArchesMark size="9cqw" color={quiet} />
      <Small size="3cqw" style={{ color: quiet }}>
        Atelier Moreau · door sign, 1 of 1
        <br />
        300 × 200 mm, lacquered birch ply
        <br />
        Made by Keel &amp; Plane, Bristol · 09 / 2026
      </Small>
      <Small size="2.6cqw" style={{ color: quiet, marginTop: '2cqw', fontWeight: 700 }}>
        ↑ This way up · fix to wall with the two brass screws supplied
      </Small>
    </Face>
  )
}
