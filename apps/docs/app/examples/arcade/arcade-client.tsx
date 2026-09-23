'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { lazyScene } from '../_shared/stage'
import { MothMark } from './arcade-art'
import { GAME, LEVELS, OST, findLevel, type Level } from './arcade-data'

type Props = { level: Level }
const TVStage = lazyScene<Props & { lit?: number; onLit?: (lit: number, total: number) => void }>(() => import('./arcade-scenes').then((m) => m.TVScene))
const PhoneStage = lazyScene<Props>(() => import('./arcade-scenes').then((m) => m.PhoneScene))
const BoxStage = lazyScene<Props>(() => import('./arcade-scenes').then((m) => m.BoxScene))
const RecordStage = lazyScene<Props>(() => import('./arcade-scenes').then((m) => m.RecordScene))

/**
 * Moth's launch page. The game is playing on the TV at the top, for real:
 * a canvas with its own frame loop on the mockup's screen. The page picks
 * the night, and the TV, the phone, the case and the record follow it. The
 * lamp count under the TV is reported back by the game as it plays.
 */
export function Arcade() {
  const [levelId, setLevelId] = useState('garden')
  const [lamps, setLamps] = useState<[number, number]>([1, 5])
  const level = findLevel(levelId)
  const onLit = useCallback((lit: number, total: number) => setLamps([lit, total]), [])

  return (
    <main className="ar" style={{ ['--ar-sky' as string]: level.sky, ['--ar-lamp' as string]: level.lamp }}>
      <header className="ar-top">
        <span className="ar-brand">
          <MothMark size="28px" color="currentColor" />
          {GAME.title}
        </span>
        <nav className="ar-nav" aria-label="Site">
          <span>The game</span>
          <span>Soundtrack</span>
          <span>Press</span>
          <span>{GAME.studio}</span>
        </nav>
        <div className="ar-top-right">
          <span className="ar-cta">Wishlist · {GAME.price}</span>
        </div>
      </header>

      <section className="ar-hero">
        <p className="ar-eyebrow">
          {GAME.platforms} · {GAME.release}
        </p>
        <h1>{GAME.tag}.</h1>
        <p className="ar-lede">
          You are not the moth. You are the person who leaves the lamps on. Seven nights, forty lamps, and a small
          creature that will find every one of them if you let it.
        </p>
      </section>

      <section className="ar-play" aria-label="Moth, playing on a TV">
        <div className="ar-tv-stage">
          <TVStage level={level} lit={lamps[0]} onLit={onLit} />
        </div>
        <div className="ar-panel">
          <div className="ar-panel-row">
            <span className="ar-panel-label">Tonight</span>
            <div className="ar-levels" role="group" aria-label="Night">
              {LEVELS.map((l) => (
                <button key={l.id} type="button" className="ar-level" aria-pressed={l.id === levelId} style={{ ['--l-sky' as string]: l.sky, ['--l-lamp' as string]: l.lamp }} onClick={() => setLevelId(l.id)}>
                  <span className="ar-level-chip" aria-hidden />
                  <span>
                    <strong>{l.name}</strong>
                    <small>{l.lamps} lamps</small>
                  </span>
                </button>
              ))}
            </div>
            <span className="ar-lamps" role="status" aria-live="polite">
              <span className="ar-lamps-dot" aria-hidden />
              {lamps[0]} of {lamps[1]} lit
            </span>
          </div>
          <p className="ar-panel-note">
            {level.blurb} The picture on the TV is a real <code>&lt;canvas&gt;</code> running its own frame loop on the
            mockup&rsquo;s screen; the count on the left is the game reporting back to the page.
          </p>
        </div>
      </section>

      <section className="ar-shop">
        <div className="ar-shop-head">
          <h2>Take it home</h2>
          <p>On a phone in your pocket, in a case on the shelf, and on amber vinyl for the nights you are not playing.</p>
        </div>
        <div className="ar-grid">
          <article className="ar-card">
            <div className="ar-card-stage">
              <PhoneStage level={level} />
            </div>
            <div className="ar-card-copy">
              <strong>Pocket edition</strong>
              <span>The same night, portrait, one tap per lamp.</span>
            </div>
          </article>
          <article className="ar-card">
            <div className="ar-card-stage">
              <BoxStage level={level} />
            </div>
            <div className="ar-card-copy">
              <strong>Boxed, for the shelf</strong>
              <span>A slim case with a code inside and nothing else.</span>
            </div>
          </article>
          <article className="ar-card">
            <div className="ar-card-stage">
              <RecordStage level={level} />
            </div>
            <div className="ar-card-copy">
              <strong>{OST.title}</strong>
              <span>
                {OST.artist}, on {OST.colour.toLowerCase()} vinyl · €28
              </span>
            </div>
          </article>
        </div>
      </section>

      <footer className="ar-foot">
        <span>Moth is a fictional game by a fictional studio. The one on the TV is a hundred lines of canvas, and it is actually running.</span>
        <Link href="/docs/screen-content">What a screen can show →</Link>
      </footer>
    </main>
  )
}
