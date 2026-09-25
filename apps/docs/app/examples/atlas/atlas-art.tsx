'use client'

import type { CSSProperties, ReactNode } from 'react'
import { FONT } from '@/components/screens/swiss-art'
import { SERIF } from '@/components/screens/label-art'
import { asset } from '@/lib/base-path.mjs'
import { Face } from '../_shared/face'
import { BOOK, CONTENTS, MAG, findPhoto, type Photo } from './atlas-data'

/**
 * Atlas in print: the magazine, the hardback, a print and a notecard.
 *
 * An editorial identity is a masthead and a grid. The masthead is the
 * serif, enormous; everything else is small sans on a strict margin. The
 * photographs do the rest, and they are plain `<img>`s that cover their
 * box - a magazine cover is a bitmap, and this is the shortest path to
 * one on a surface.
 */

const PAPER = '#f6f3ec'
const INK = '#171512'
const RED = '#c8321e'

const MAST: CSSProperties = { fontFamily: SERIF, fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 0.85 }
const SMALL: CSSProperties = { fontFamily: FONT, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.3 }

/** A photograph covering its box. */
export function Picture({ photo, style }: { photo: Photo; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset(photo.src)}
      alt=""
      draggable={false}
      style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: photo.position, ...style }}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  The magazine (480 x 620 cover)                                     */
/* ------------------------------------------------------------------ */

export function MagCover({ cover }: { cover: string }) {
  const photo = findPhoto(cover)
  const others = [findPhoto('island'), findPhoto('harbour'), findPhoto('market')].filter((p) => p.id !== cover)
  return (
    <Face background={INK} color="#fff" style={{ display: 'flex', flexDirection: 'column', padding: '6cqw' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Picture photo={photo} />
      </div>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.72) 100%)' }} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ ...MAST, fontSize: '26cqw' }}>{MAG.name}</span>
        <span style={{ ...SMALL, fontSize: '3cqw', textAlign: 'right', paddingTop: '1.5cqw' }}>
          No. {MAG.issue}
          <br />
          {MAG.season}
          <br />
          {MAG.price}
        </span>
      </div>
      <div style={{ position: 'relative', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '2.2cqw' }}>
        <span style={{ ...SMALL, fontSize: '3.6cqw', color: '#ffd27a' }}>The {MAG.theme} issue</span>
        <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '9cqw', lineHeight: 1.02, letterSpacing: '-0.02em' }}>{photo.story}</span>
        <div style={{ display: 'flex', gap: '4cqw', ...SMALL, fontSize: '3.1cqw', opacity: 0.9 }}>
          {others.map((o) => (
            <span key={o.id}>{o.story}</span>
          ))}
        </div>
      </div>
    </Face>
  )
}

export function MagBack({ cover }: { cover: string }) {
  const photo = findPhoto([...['island', 'harbour', 'market']].find((id) => id !== cover) ?? 'harbour')
  return (
    <Face background={PAPER} color={INK} style={{ display: 'flex', flexDirection: 'column', padding: '7cqw', gap: '4cqw' }}>
      <div style={{ height: '42cqh', flex: 'none', overflow: 'hidden' }}>
        <Picture photo={photo} />
      </div>
      <span style={{ ...SMALL, fontSize: '3cqw', opacity: 0.6 }}>{photo.caption}</span>
      <span style={{ ...SMALL, fontSize: '3.8cqw', color: RED }}>In this issue</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6cqw' }}>
        {CONTENTS.map(([page, title, by]) => (
          <div key={page} style={{ display: 'grid', gridTemplateColumns: '8cqw 1fr', gap: '2cqw', ...SMALL, fontSize: '3.1cqw' }}>
            <span style={{ fontVariantNumeric: 'tabular-nums', opacity: 0.55 }}>{page}</span>
            <span>
              {title} <span style={{ opacity: 0.55, fontWeight: 500 }}>· {by}</span>
            </span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', ...SMALL, fontSize: '2.8cqw', opacity: 0.6 }}>
        <span>atlasquarterly.eu</span>
        <span>{MAG.strap}</span>
      </div>
    </Face>
  )
}

/** The spine (1856 x 38): reads top to bottom, at three times the cover's dpi. */
export function MagSpine() {
  return (
    <Face background={INK} color="#fff" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2cqw' }}>
      <span style={{ ...MAST, fontSize: '70cqh', letterSpacing: '-0.02em' }}>{MAG.name}</span>
      <span style={{ ...SMALL, fontSize: '40cqh' }}>
        No. {MAG.issue} · {MAG.theme} · {MAG.season}
      </span>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  The hardback (480 x 720)                                           */
/* ------------------------------------------------------------------ */

export function BookCover() {
  return (
    <Face background="#1f3a5f" color={PAPER} style={{ display: 'flex', flexDirection: 'column', padding: '8cqw', gap: '5cqw' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ ...MAST, fontSize: '7cqw' }}>{MAG.name}</span>
        <span style={{ ...SMALL, fontSize: '2.8cqw', opacity: 0.7 }}>{BOOK.sub}</span>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Picture photo={findPhoto('harbour')} />
      </div>
      <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '17cqw', lineHeight: 0.95, letterSpacing: '-0.03em' }}>{BOOK.title}</span>
    </Face>
  )
}

export function BookBack() {
  return (
    <Face background="#1f3a5f" color={PAPER} style={{ display: 'flex', flexDirection: 'column', padding: '8cqw', gap: '4cqw' }}>
      <span style={{ ...SMALL, fontSize: '3.6cqw', opacity: 0.7 }}>From the editors of {MAG.name}</span>
      <p style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: '5.2cqw', lineHeight: 1.25 }}>{BOOK.blurb}</p>
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', ...SMALL, fontSize: '2.8cqw', opacity: 0.7 }}>
        <span>{BOOK.pages} pages · cloth</span>
        <span>€48</span>
      </div>
    </Face>
  )
}

export function BookSpine() {
  return (
    <Face background="#1f3a5f" color={PAPER} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '14cqw 0' }}>
      <span style={{ ...MAST, fontSize: '42cqw', writingMode: 'vertical-rl' }}>{MAG.name}</span>
      <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '40cqw', letterSpacing: '-0.02em', writingMode: 'vertical-rl' }}>{BOOK.title}</span>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  The print (540 x 726) and the notecard (380 x 533)                 */
/* ------------------------------------------------------------------ */

export function Print({ cover }: { cover: string }) {
  const photo = findPhoto(cover)
  return (
    <Face background={PAPER} color={INK} style={{ display: 'flex', flexDirection: 'column', padding: '6cqw 6cqw 5cqw', gap: '3cqw' }}>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Picture photo={photo} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', ...SMALL, fontSize: '2.4cqw' }}>
        <span>{photo.caption}</span>
        <span style={{ opacity: 0.55 }}>
          {MAG.name} print No. {MAG.issue} · 1 / 50
        </span>
      </div>
    </Face>
  )
}

export function CardFront({ cover }: { cover: string }) {
  return (
    <Face background={INK}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Picture photo={findPhoto(cover)} />
      </div>
    </Face>
  )
}

export function CardInside({ cover, side }: { cover: string; side: 'left' | 'right' }) {
  const photo = findPhoto(cover)
  return (
    <Face background={PAPER} color={INK} style={{ display: 'flex', flexDirection: 'column', padding: '9cqw', gap: '4cqw' }}>
      {side === 'left' ? (
        <>
          <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: '9cqw', lineHeight: 1.05 }}>Wish you were here.</span>
          <span style={{ ...SMALL, fontSize: '3.2cqw', opacity: 0.6, marginTop: 'auto' }}>
            {photo.caption} · from {MAG.name} No. {MAG.issue}
          </span>
        </>
      ) : (
        <>
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} style={{ borderBottom: `0.35cqw solid ${INK}`, opacity: 0.25, height: '6cqw' }} />
          ))}
        </>
      )}
    </Face>
  )
}

export function CardBack() {
  return (
    <Face background={PAPER} color={INK} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '8cqw' }}>
      <span style={{ ...SMALL, fontSize: '3cqw', opacity: 0.55 }}>{MAG.name} notecards · set of six</span>
    </Face>
  )
}

export type { ReactNode }
