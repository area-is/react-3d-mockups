import * as React from 'react'
import { Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { easeInOut, easeOut, tween } from '../../reel/motion'
import { BRAND, MONO, SANS } from '../brand'
import { Feature, Ground } from '../cards'

/*
 * The twelve sample sites in the docs, as a wall of browser windows, each
 * scrolling down its own page past the 3D scene in it. The pictures are
 * screenshots of the sites (`scripts/shoot-sites.mjs`), two screens tall.
 */

const SITES: { slug: string; brand: string; kind: string }[] = [
  { slug: 'ledger', brand: 'Ledger', kind: 'Finance app' },
  { slug: 'stream', brand: 'Prism', kind: 'Streaming' },
  { slug: 'arcade', brand: 'Moth', kind: 'Indie game' },
  { slug: 'ambient', brand: 'Ambient', kind: 'Living art' },
  { slug: 'print-shop', brand: 'Grid Editions', kind: 'Print shop' },
  { slug: 'packaging', brand: 'Carton & Co', kind: 'Packaging' },
  { slug: 'stationery', brand: 'Ampersand', kind: 'Stationery' },
  { slug: 'atlas', brand: 'Atlas', kind: 'Magazine' },
  { slug: 'campaign', brand: 'Aperture', kind: 'Festival' },
  { slug: 'cafe', brand: 'Ninefold', kind: 'Café' },
  { slug: 'fleet', brand: 'Northline', kind: 'Freight' },
  { slug: 'matchday', brand: 'Alcântara FC', kind: 'Football club' },
]

const COLUMNS = 4
const WIN_W = 540
const WIN_H = 338
const CHROME = 38
const GAP = 36

function Window({ slug, brand, kind, scroll }: { slug: string; brand: string; kind: string; scroll: number }) {
  const { width } = useVideoConfig()
  const u = width / 1920
  return (
    <div style={{ width: WIN_W * u }}>
      <div
        style={{
          width: WIN_W * u,
          height: (WIN_H + CHROME) * u,
          borderRadius: 12 * u,
          overflow: 'hidden',
          background: BRAND.panel,
          border: `${1.5 * u}px solid ${BRAND.border}`,
          boxShadow: `0 ${24 * u}px ${60 * u}px rgba(0,0,0,0.55)`,
        }}
      >
        <div style={{ height: CHROME * u, display: 'flex', alignItems: 'center', gap: 7 * u, padding: `0 ${14 * u}px`, borderBottom: `${1 * u}px solid ${BRAND.border}` }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <span key={c} style={{ width: 10 * u, height: 10 * u, borderRadius: '50%', background: c, opacity: 0.8 }} />
          ))}
          <span style={{ marginLeft: 12 * u, flex: 1, height: 22 * u, borderRadius: 6 * u, background: '#141821', fontFamily: MONO, fontSize: 12 * u, lineHeight: `${22 * u}px`, color: BRAND.low, paddingLeft: 10 * u, whiteSpace: 'nowrap', overflow: 'hidden' }}>
            area.is/react-3d-mockups/examples/{slug}
          </span>
        </div>
        <div style={{ position: 'relative', width: WIN_W * u, height: WIN_H * u, overflow: 'hidden' }}>
          <Img
            src={staticFile(`promo/sites/${slug}.webp`)}
            style={{ position: 'absolute', left: 0, top: 0, width: WIN_W * u, height: 'auto', transform: `translateY(${-scroll * (WIN_W * 1.25 - WIN_H) * u}px)` }}
          />
        </div>
      </div>
      <div style={{ marginTop: 12 * u, display: 'flex', gap: 10 * u, alignItems: 'baseline', fontFamily: SANS }}>
        <span style={{ fontWeight: 700, fontSize: 22 * u, color: BRAND.text }}>{brand}</span>
        <span style={{ fontWeight: 500, fontSize: 18 * u, color: BRAND.low }}>{kind}</span>
      </div>
    </div>
  )
}

export function SitesShot() {
  const frame = useCurrentFrame()
  const { width, durationInFrames } = useVideoConfig()
  const u = width / 1920
  const pan = tween(frame, 0, durationInFrames, 0, 1, easeInOut)
  return (
    <Ground glow={0.1} grid={false}>
      <div style={{ position: 'absolute', inset: 0, perspective: 2200 * u, perspectiveOrigin: '30% 50%' }}>
        <div
          style={{
            position: 'absolute',
            left: 780 * u,
            top: 70 * u,
            display: 'grid',
            gridTemplateColumns: `repeat(${COLUMNS}, ${WIN_W * u}px)`,
            gap: GAP * u,
            transformOrigin: '0% 50%',
            transform: `rotateY(-18deg) rotateX(5deg) translateX(${(-pan * 420 + 20) * u}px)`,
          }}
        >
          {SITES.map((site, i) => {
            const column = i % COLUMNS
            const row = Math.floor(i / COLUMNS)
            // Columns rise in on the beat, one after another.
            const enter = tween(frame, column * 7 + row * 3, 12 + column * 7 + row * 3, 0, 1, easeOut)
            const scroll = tween(frame, 20 + i * 3, durationInFrames, 0, 1, easeInOut)
            return (
              <div key={site.slug} style={{ opacity: enter, transform: `translateY(${(1 - enter) * 80 * u}px)` }}>
                <Window {...site} scroll={scroll} />
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${BRAND.bg} 0%, ${BRAND.bg} 34%, rgba(8,9,12,0.0) 52%)` }} />
      <Feature kicker="Sample sites" title="Twelve sites, built with it." sub="Finance, games, print, packaging and more. All in the repo." width={600} style={{ left: 110 * u, top: 300 * u }} />
    </Ground>
  )
}
