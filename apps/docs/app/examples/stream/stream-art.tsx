'use client'

import type { CSSProperties, ReactNode } from 'react'
import { Pattern } from '@/components/screens/swiss-art'
import { asset } from '@/lib/base-path.mjs'
import { Face } from '../_shared/face'
import { SHOWS, findShow, type Show } from './stream-data'

/**
 * Prism on every screen it plays on: the TV's home, the Fold's tablet
 * layout, the Flip in flex mode, the iPad's title page. Each takes the id
 * of the featured title and builds itself around that show's key art.
 *
 * The key art is two layers. The ground is generative, drawn at whatever
 * size the tile happens to be: `fit="cover"` on a coarse grid gives a
 * poster a countable number of marks whether it is a 1920 px TV hero or a
 * 120 px thumbnail. In front of it stands the show's one object, a
 * photographed cut-out, placed in container units so it keeps its place on
 * every size of tile. The hero's ground is `live` on the TV - a home screen
 * that moves is the screen you buy a subscription from.
 */

export const INK = '#08090f'
const PANEL = 'rgba(255, 255, 255, 0.06)'
const TEXT = '#f2f3f8'
const MUTED = '#9aa1b6'
export const PRISM = 'linear-gradient(135deg, #8b7cf8 0%, #22d3ee 100%)'

/**
 * Where a tile's object stands: over the label on a poster (`top`), in the
 * middle of a bare thumbnail or the player (`middle`), or to the right of a
 * hero whose copy runs down the left (`right`).
 */
export type ArtPlace = 'top' | 'middle' | 'right'

const ART_PLACE: Record<ArtPlace, CSSProperties> = {
  top: { left: '50%', top: '7cqh', height: 'min(60cqh, 76cqw)', transform: 'translateX(-50%)' },
  middle: { left: '50%', top: '50%', height: 'min(78cqh, 76cqw)', transform: 'translate(-50%, -50%)' },
  right: { right: '7cqw', top: '50%', height: 'min(80cqh, 40cqw)', transform: 'translateY(-50%)' },
}

/** A show's art in a box, with the title over it. */
export function Tile({
  show,
  size = 14,
  live,
  grid,
  labeled = true,
  art = labeled ? 'top' : 'middle',
  style,
  children,
}: {
  show: Show
  size?: number
  live?: boolean
  grid?: string
  labeled?: boolean
  art?: ArtPlace
  style?: CSSProperties
  children?: ReactNode
}) {
  return (
    <div style={{ position: 'relative', borderRadius: size * 0.7, overflow: 'hidden', background: show.palette[0], ...style }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Pattern pattern={show.pattern} seed={`prism-${show.id}`} live={live} palette={show.palette} grid={grid ?? '2x3'} />
      </div>
      {/* the show's object, in front of the pattern: a pool of shadow under
          it so it stands on the ground rather than being pasted on */}
      <div style={{ position: 'absolute', inset: 0, containerType: 'size' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(show.art.src)}
          alt=""
          draggable={false}
          decoding="async"
          style={{
            position: 'absolute',
            width: 'auto',
            aspectRatio: show.art.aspect,
            filter: 'drop-shadow(0 2cqh 2.6cqh rgba(0, 0, 0, 0.5))',
            pointerEvents: 'none',
            ...ART_PLACE[art],
          }}
        />
      </div>
      {labeled ? (
        <>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,9,15,0.85) 0%, rgba(8,9,15,0) 55%)' }} />
          <div style={{ position: 'absolute', left: size * 0.9, right: size * 0.9, bottom: size * 0.7, color: TEXT }}>
            <div style={{ fontSize: size, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{show.title}</div>
            <div style={{ fontSize: size * 0.72, fontWeight: 600, color: MUTED, marginTop: 2 }}>{show.kind}</div>
          </div>
        </>
      ) : null}
      {show.progress !== undefined ? (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: Math.max(3, size * 0.25), background: 'rgba(255,255,255,0.15)' }}>
          <div style={{ width: `${show.progress * 100}%`, height: '100%', background: PRISM }} />
        </div>
      ) : null}
      {children}
    </div>
  )
}

function Wordmark({ size }: { size: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.4, fontSize: size, fontWeight: 800, letterSpacing: '-0.04em', color: TEXT }}>
      <span style={{ width: size * 0.8, height: size * 0.8, borderRadius: size * 0.2, background: PRISM, display: 'inline-block' }} />
      Prism
    </span>
  )
}

function Pill({ children, primary, size = 14 }: { children: ReactNode; primary?: boolean; size?: number }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.5,
        padding: `${size * 0.7}px ${size * 1.3}px`,
        borderRadius: 999,
        fontSize: size,
        fontWeight: 700,
        background: primary ? TEXT : PANEL,
        color: primary ? INK : TEXT,
        border: primary ? 'none' : '1px solid rgba(255,255,255,0.14)',
      }}
    >
      {children}
    </span>
  )
}

const Play = ({ size, color = INK }: { size: number; color?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
    <path d="M7 4.5v15l12-7.5z" fill={color} />
  </svg>
)

/* ------------------------------------------------------------------ */
/*  TV: home (1920 x 1080)                                             */
/* ------------------------------------------------------------------ */

export function TVHome({ featured }: { featured: string }) {
  const show = findShow(featured)
  const continuing = SHOWS.filter((s) => s.progress !== undefined)
  const rail = ['Home', 'Search', 'Series', 'Films', 'Kids', 'My list']
  return (
    <Face background={INK} color={TEXT} style={{ display: 'grid', gridTemplateColumns: '150px 1fr', letterSpacing: '-0.012em' }}>
      <aside style={{ display: 'flex', flexDirection: 'column', gap: 26, padding: '48px 0 0 40px', fontSize: 17, fontWeight: 600, color: MUTED, zIndex: 1 }}>
        <Wordmark size={24} />
        <div style={{ height: 10 }} />
        {rail.map((item, i) => (
          <span key={item} style={{ color: i === 0 ? TEXT : MUTED }}>
            {item}
          </span>
        ))}
      </aside>
      <main style={{ position: 'relative', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* the hero: the featured title's art, bleeding under the rail */}
        <div style={{ position: 'absolute', left: -150, right: 0, top: 0, height: 640 }}>
          <Tile show={show} live grid={show.grid} labeled={false} art="right" style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${INK} 0%, rgba(8,9,15,0.85) 22%, rgba(8,9,15,0.2) 60%, rgba(8,9,15,0) 100%), linear-gradient(to top, ${INK} 0%, rgba(8,9,15,0) 45%)` }} />
        </div>
        <div style={{ position: 'relative', padding: '150px 60px 0 40px', maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', color: '#22d3ee' }}>Tonight&rsquo;s feature</span>
          <h1 style={{ margin: 0, fontSize: 78, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.95, color: TEXT }}>{show.title}</h1>
          <span style={{ fontSize: 18, fontWeight: 600, color: MUTED }}>
            {show.kind} · {show.meta}
          </span>
          <p style={{ margin: 0, fontSize: 19, lineHeight: 1.45, color: '#c9cddb', maxWidth: 620 }}>{show.blurb}</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            <Pill primary size={17}>
              <Play size={18} /> {show.progress ? 'Resume' : 'Play'}
            </Pill>
            <Pill size={17}>+ My list</Pill>
          </div>
        </div>
        <div style={{ position: 'relative', marginTop: 'auto', padding: '0 60px 44px 40px', display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Continue watching</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
              {continuing.map((s) => (
                <Tile key={s.id} show={s} size={15} style={{ aspectRatio: '16 / 9', outline: s.id === featured ? `3px solid ${TEXT}` : 'none', outlineOffset: -3 }} />
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>New this week</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 14 }}>
              {SHOWS.map((s) => (
                <Tile key={s.id} show={{ ...s, progress: undefined }} size={13} style={{ aspectRatio: '2 / 3', outline: s.id === featured ? `3px solid ${TEXT}` : 'none', outlineOffset: -3 }} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  Fold, open: the tablet home (820 x 910)                            */
/* ------------------------------------------------------------------ */

export function FoldHome({ featured }: { featured: string }) {
  const show = findShow(featured)
  return (
    <Face background={INK} color={TEXT} style={{ display: 'flex', flexDirection: 'column', paddingTop: 'var(--mockup-safe-area-top, 0px)', letterSpacing: '-0.012em' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px 10px' }}>
        <Wordmark size={20} />
        <div style={{ display: 'flex', gap: 18, fontSize: 13.5, fontWeight: 600, color: MUTED }}>
          <span style={{ color: TEXT }}>Home</span>
          <span>Series</span>
          <span>Films</span>
          <span>Kids</span>
        </div>
      </header>
      <div style={{ margin: '0 20px', height: 330, position: 'relative', borderRadius: 20, overflow: 'hidden', flex: 'none' }}>
        <Tile show={show} live grid={show.grid} labeled={false} art="right" style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,9,15,0.92) 0%, rgba(8,9,15,0.2) 55%, rgba(8,9,15,0) 100%)' }} />
        <div style={{ position: 'absolute', left: 22, right: 22, bottom: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '-0.01em', color: '#22d3ee' }}>Tonight&rsquo;s feature</span>
          <span style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>{show.title}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>
            {show.kind} · {show.meta}
          </span>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Pill primary size={13}>
              <Play size={14} /> Play
            </Pill>
            <Pill size={13}>+ My list</Pill>
          </div>
        </div>
      </div>
      <div style={{ padding: '18px 20px 0', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Continue watching</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {SHOWS.filter((s) => s.progress !== undefined).map((s) => (
              <Tile key={s.id} show={s} size={12.5} style={{ aspectRatio: '16 / 9' }} />
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>New this week</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {SHOWS.slice(0, 8).map((s) => (
              <Tile key={s.id} show={{ ...s, progress: undefined }} size={11.5} style={{ aspectRatio: '2 / 3' }} />
            ))}
          </div>
        </div>
      </div>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  Flip, flex mode: video up top, controls below (360 x 838)          */
/* ------------------------------------------------------------------ */

/**
 * The Flip stands half-open on a table, so the app splits at the hinge:
 * the picture on the upper half, the controls on the lower, which is what
 * Flex Mode is for. The two halves are laid out at exactly 50 % each, so
 * the split lands on the crease whatever the angle.
 */
export function FlipPlayer({ featured }: { featured: string }) {
  const show = findShow(featured)
  const episode = show.episodes?.[Math.floor((show.progress ?? 0) * show.episodes.length)] ?? show.title
  return (
    <Face background="#000" color={TEXT} style={{ display: 'flex', flexDirection: 'column', letterSpacing: '-0.012em' }}>
      <div style={{ position: 'relative', height: '50%', flex: 'none' }}>
        <Tile show={show} live grid={show.grid} labeled={false} style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />
        <div style={{ position: 'absolute', left: 16, right: 16, top: 'calc(var(--mockup-safe-area-top, 0px) + 12px)', display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
          <span>{show.title}</span>
          <span style={{ color: '#22d3ee' }}>4K · HDR</span>
        </div>
      </div>
      <div style={{ height: '50%', flex: 'none', display: 'flex', flexDirection: 'column', padding: '22px 22px 28px', gap: 14, background: INK }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>{show.kind === 'Series' ? 'Now playing' : 'Film'}</div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05, marginTop: 3 }}>{episode}</div>
          <div style={{ fontSize: 12.5, color: MUTED, marginTop: 4 }}>{show.meta}</div>
        </div>
        <div style={{ marginTop: 'auto' }}>
          <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
            <div style={{ width: `${(show.progress ?? 0.3) * 100}%`, height: '100%', background: PRISM }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 600, color: MUTED, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
            <span>31:04</span>
            <span>52:10</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 28 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: MUTED }}>−10</span>
          <span style={{ width: 62, height: 62, borderRadius: '50%', background: TEXT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width={26} height={26} aria-hidden>
              <path d="M7 4h4v16H7zM13 4h4v16h-4z" fill={INK} />
            </svg>
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: MUTED }}>+10</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: MUTED }}>
          <span>Subtitles · EN</span>
          <span>Cast to TV</span>
        </div>
      </div>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  iPad, landscape: the title page (1376 x 1032)                      */
/* ------------------------------------------------------------------ */

export function IPadTitle({ featured }: { featured: string }) {
  const show = findShow(featured)
  const episodes = show.episodes ?? [show.title]
  return (
    <Face background={INK} color={TEXT} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', paddingTop: 'var(--mockup-safe-area-top, 0px)', letterSpacing: '-0.012em' }}>
      <div style={{ position: 'relative' }}>
        <Tile show={show} grid={show.grid} labeled={false} art="top" style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, rgba(8,9,15,0) 60%, ${INK} 100%), linear-gradient(to top, rgba(8,9,15,0.9) 0%, rgba(8,9,15,0) 50%)` }} />
        <div style={{ position: 'absolute', left: 36, top: 30 }}>
          <Wordmark size={22} />
        </div>
        <div style={{ position: 'absolute', left: 36, right: 60, bottom: 36, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', color: '#22d3ee' }}>{show.kind}</span>
          <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.95 }}>{show.title}</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: MUTED }}>{show.meta}</span>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.45, color: '#c9cddb' }}>{show.blurb}</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Pill primary size={14}>
              <Play size={15} /> {show.progress ? 'Resume' : 'Play'}
            </Pill>
            <Pill size={14}>+ My list</Pill>
            <Pill size={14}>Trailer</Pill>
          </div>
        </div>
      </div>
      <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em' }}>{show.kind === 'Series' ? 'Episodes' : 'About this film'}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>{show.kind === 'Series' ? `Season ${show.meta.slice(1, 2)}` : show.meta}</span>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {episodes.map((ep, i) => {
            const watched = show.progress !== undefined && i < Math.floor(show.progress * episodes.length)
            return (
              <div key={ep} style={{ display: 'grid', gridTemplateColumns: '150px 1fr auto', gap: 16, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.09)' }}>
                <Tile show={{ ...show, progress: watched ? 1 : undefined }} size={12} labeled={false} style={{ aspectRatio: '16 / 9', opacity: watched ? 0.6 : 1 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>
                    {i + 1}. {ep}
                  </span>
                  <span style={{ fontSize: 13, color: MUTED }}>{watched ? 'Watched' : `${44 + ((i * 7) % 15)} min`}</span>
                </div>
                <Play size={22} color={MUTED} />
              </div>
            )
          })}
        </div>
      </div>
    </Face>
  )
}
