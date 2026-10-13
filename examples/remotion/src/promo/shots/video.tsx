import * as React from 'react'
import { Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import '@fontsource/anton'
import { IPhoneMockup } from 'react-3d-mockups'
import { ProductScreen } from '../../campaigns/kite/art'
import { statusBarFont, useStage } from '../../campaigns/kit'
import { easeOut, tween, type Vec3 } from '../../reel/motion'
import { BRAND, MONO } from '../brand'
import { Feature, Ground } from '../cards'
import { CodeCard, t } from '../code'

/*
 * "Render it to video": a player with a live turntable in it - the iPhone
 * from the KITE film, on its product page - over a timeline whose playhead
 * and counter are this film's own, and a track of the three campaign films
 * the Remotion example renders (stills in `public/promo/films`).
 */

const CLIPS = [
  { name: 'KiteFilm', frames: ['kite-150', 'kite-300', 'kite-620'] },
  { name: 'GroveFilm', frames: ['grove-60', 'grove-200', 'grove-560'] },
  { name: 'LumenFilm', frames: ['lumen-100', 'lumen-330', 'lumen-560'] },
]

const PANEL_X = 770
const PANEL_W = 1040

export function VideoShot({ start, total }: { start: number; total: number }) {
  const frame = useCurrentFrame()
  const { width, fps, durationInFrames } = useVideoConfig()
  const u = width / 1920
  const stage = useStage(true)
  const filmFrame = start + frame
  const rotation: Vec3 = [0.05, -0.45 + Math.sin(frame / 38) * 0.55, 0]
  const pick = Math.floor(frame / 30) % 3
  const playhead = frame / durationInFrames
  const enter = tween(frame, 0, 18, 0, 1, easeOut)
  const secs = (n: number) => `${String(Math.floor(n / fps / 60)).padStart(2, '0')}:${String(Math.floor(n / fps) % 60).padStart(2, '0')}.${String(n % fps).padStart(2, '0')}`
  return (
    <Ground glow={0.1}>
      {/* the player */}
      <div
        style={{
          position: 'absolute',
          left: PANEL_X * u,
          top: 96 * u,
          width: PANEL_W * u,
          borderRadius: 14 * u,
          overflow: 'hidden',
          background: BRAND.panel,
          border: `${1.5 * u}px solid ${BRAND.border}`,
          boxShadow: `0 ${30 * u}px ${80 * u}px rgba(0,0,0,0.55)`,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 30 * u}px)`,
        }}
      >
        <div style={{ height: 42 * u, display: 'flex', alignItems: 'center', gap: 8 * u, padding: `0 ${16 * u}px`, borderBottom: `${1.5 * u}px solid ${BRAND.border}`, fontFamily: MONO, fontSize: 16 * u, color: BRAND.low }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <span key={c} style={{ width: 11 * u, height: 11 * u, borderRadius: '50%', background: c, opacity: 0.8 }} />
          ))}
          <span style={{ marginLeft: 12 * u }}>Remotion Studio · PromoFilm</span>
          <span style={{ marginLeft: 'auto', color: BRAND.text }}>1920 × 1080 · 30 fps</span>
        </div>
        <div style={{ position: 'relative', height: 540 * u, background: 'radial-gradient(ellipse 60% 70% at 50% 50%, #1b1e25 0%, #07080b 80%)', ...statusBarFont('"Inter Variable"') }}>
          <IPhoneMockup {...stage} variant="18promax" color="black" statusBar={{ color: '#000000' }} rotation={rotation}>
            <ProductScreen pick={pick} />
          </IPhoneMockup>
        </div>
      </div>
      {/* the timeline */}
      <div style={{ position: 'absolute', left: PANEL_X * u, top: 712 * u, width: PANEL_W * u, height: 290 * u, borderRadius: 14 * u, background: BRAND.panel, border: `${1.5 * u}px solid ${BRAND.border}`, overflow: 'hidden', opacity: enter }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 46 * u, padding: `0 ${18 * u}px`, borderBottom: `${1.5 * u}px solid ${BRAND.border}`, fontFamily: MONO, fontSize: 18 * u, color: BRAND.muted, gap: 24 * u }}>
          <span style={{ color: BRAND.green }}>▶</span>
          <span style={{ color: BRAND.text, fontVariantNumeric: 'tabular-nums' }}>{secs(filmFrame)}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            frame {String(filmFrame).padStart(4, '0')} / {total}
          </span>
          <span style={{ marginLeft: 'auto', color: BRAND.low }}>rendered with Remotion</span>
        </div>
        {/* ruler */}
        <div style={{ position: 'relative', height: 26 * u, borderBottom: `${1 * u}px solid ${BRAND.border}` }}>
          {Array.from({ length: 41 }, (_, i) => (
            <span key={i} style={{ position: 'absolute', left: `${(i / 40) * 100}%`, bottom: 0, width: 1 * u, height: (i % 5 === 0 ? 14 : 7) * u, background: BRAND.border }} />
          ))}
        </div>
        {/* the track: the campaign films, one clip each */}
        <div style={{ display: 'flex', gap: 8 * u, padding: `${16 * u}px ${18 * u}px`, transform: `translateX(${-playhead * 120 * u}px)` }}>
          {CLIPS.map((clip) => (
            <div key={clip.name} style={{ flex: '0 0 auto', borderRadius: 8 * u, overflow: 'hidden', border: `${1.5 * u}px solid #2b4a2f`, background: '#0f1a12' }}>
              <div style={{ display: 'flex' }}>
                {clip.frames.map((still) => (
                  <Img key={still} src={staticFile(`promo/films/${still}.webp`)} style={{ display: 'block', width: 112 * u, height: 63 * u, objectFit: 'cover' }} />
                ))}
              </div>
              <div style={{ padding: `${8 * u}px ${10 * u}px`, fontFamily: MONO, fontSize: 15 * u, color: '#8fd896' }}>{clip.name}</div>
            </div>
          ))}
        </div>
        {/* playhead */}
        <div style={{ position: 'absolute', top: 46 * u, bottom: 0, left: `${3 + playhead * 94}%`, width: 2 * u, background: BRAND.green, boxShadow: `0 0 ${12 * u}px ${BRAND.green}` }} />
      </div>
      <Feature kicker="Video with Remotion" title="Render it to video." sub="Each frame waits until the mockup has drawn it, so every MP4 comes out frame-perfect. This film is one." width={600} style={{ left: 110 * u, top: 130 * u }} />
      <CodeCard
        start={24}
        speed={3}
        width={600}
        size={22}
        caret={false}
        style={{ position: 'absolute', left: 110 * u, top: 700 * u }}
        lines={[
          [t('punct', '<'), t('tag', 'IPhoneMockup')],
          [t('attr', '  delayCapture'), t('punct', '={'), t('text', 'useMockupCapture()'), t('punct', '}')],
          [t('attr', '  time'), t('punct', '={'), t('text', 'frame / fps'), t('punct', '}')],
          [t('punct', '/>')],
        ]}
      />
    </Ground>
  )
}
