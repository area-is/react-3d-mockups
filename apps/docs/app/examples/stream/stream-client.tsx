'use client'

import { useState } from 'react'
import Link from 'next/link'
import { pindot } from 'tabbied/patterns'
import { TabbiedPattern } from 'tabbied/react'
import { TabbiedLink } from '../_shared/badge'
import { lazyScene } from '../_shared/stage'
import { Tile } from './stream-art'
import { DEFAULT_FEATURED, PLANS, SHOWS, findShow } from './stream-data'

type Props = { featured: string }
const TVStage = lazyScene<Props>(() => import('./stream-scenes').then((m) => m.TVScene))
const FoldStage = lazyScene<Props>(() => import('./stream-scenes').then((m) => m.FoldScene))
const FlipStage = lazyScene<Props>(() => import('./stream-scenes').then((m) => m.FlipScene))
const IPadStage = lazyScene<Props>(() => import('./stream-scenes').then((m) => m.IPadScene))

/**
 * The ground under every screen: Tabbied's pindot on a transparent ground,
 * in cool darks a step or two above the page with one in the accent's teal,
 * like the spill of light a screen throws on a dark floor. It is a texture,
 * not a picture - the key art on the screens is the picture - so it stays
 * close to the page and fades out before the stage's edge. The cells are a
 * fixed size rather than a fixed count, so the dots keep one pitch on the
 * wide TV stage and the narrow device stages alike.
 */
const GROUND_PALETTE = ['transparent', '#131724', '#161b29', '#1a2030', '#1d2436', '#11252c']

function Ground({ seed }: { seed: string }) {
  return (
    <div className="st-ground" aria-hidden>
      <TabbiedPattern pattern={pindot} seed={seed} palette={GROUND_PALETTE} fit="grid" cellSize={128} />
    </div>
  )
}

/**
 * Prism's landing page. One piece of state - which title is featured -
 * chosen in the row of key art under the TV, and every screen on the page
 * rebuilds itself around it: the home on the TV and the Fold, the title
 * page on the iPad, the player on the Flip.
 */
export function Stream() {
  const [featured, setFeatured] = useState(DEFAULT_FEATURED)
  const show = findShow(featured)

  return (
    <main className="st">
      <header className="st-top">
        <Link href="/examples/stream" className="st-brand">
          <span className="st-brand-mark" aria-hidden />
          Prism
        </Link>
        <nav className="st-nav" aria-label="Site">
          <span>Browse</span>
          <span>Live</span>
          <span>Kids</span>
          <span>Plans</span>
        </nav>
        <div className="st-top-right">
          <span className="st-cta">Start your free week</span>
        </div>
      </header>

      <section className="st-hero">
        <p className="st-eyebrow">Series, films and live sport · 4K on every screen</p>
        <h1>Something good is on</h1>
        <p className="st-lede">
          Prism is the same home on your TV, your tablet and the phone in your pocket, with tonight&rsquo;s feature
          waiting on every one of them.
        </p>
      </section>

      <section className="st-tv" aria-label="Prism on a TV">
        <div className="st-tv-stage">
          <Ground seed="prism-tv" />
          <TVStage featured={featured} />
        </div>
        <div className="st-picker">
          <div className="st-picker-head">
            <span className="st-picker-label">Pick tonight&rsquo;s feature</span>
            <span className="st-picker-now">
              Now: <strong>{show.title}</strong> · {show.meta}
            </span>
          </div>
          <div className="st-picker-row" role="group" aria-label="Featured title">
            {SHOWS.map((s) => (
              <button key={s.id} type="button" className="st-pick" aria-pressed={s.id === featured} onClick={() => setFeatured(s.id)}>
                <Tile show={{ ...s, progress: undefined }} size={11} labeled={false} style={{ aspectRatio: '2 / 3' }} />
                <span className="st-pick-title">{s.title}</span>
              </button>
            ))}
          </div>
          <p className="st-picker-note">
            Every poster is a <TabbiedLink /> pattern in the title&rsquo;s own palette with the show&rsquo;s one object
            standing in front of it. The TV&rsquo;s hero is live: the pattern behind it recomposes every few seconds.
          </p>
        </div>
      </section>

      <section className="st-anywhere">
        <div className="st-anywhere-head">
          <h2>Watch anywhere</h2>
          <p>The feature you picked follows you: the tablet home on a Fold, the player on a Flip standing half open, the title page on an iPad.</p>
        </div>
        <div className="st-grid">
          <article className="st-card">
            <div className="st-card-stage">
              <Ground seed="prism-fold" />
              <FoldStage featured={featured} />
            </div>
            <div className="st-card-copy">
              <strong>On a Fold</strong>
              <span>The home screen with room for the rows</span>
            </div>
          </article>
          <article className="st-card">
            <div className="st-card-stage">
              <Ground seed="prism-flip" />
              <FlipStage featured={featured} />
            </div>
            <div className="st-card-copy">
              <strong>On a Flip, in Flex Mode</strong>
              <span>The picture on the top half, the controls on the bottom, split at the hinge</span>
            </div>
          </article>
          <article className="st-card">
            <div className="st-card-stage">
              <Ground seed="prism-ipad" />
              <IPadStage featured={featured} />
            </div>
            <div className="st-card-copy">
              <strong>On an iPad</strong>
              <span>The title page, with every episode</span>
            </div>
          </article>
        </div>
      </section>

      <section className="st-plans">
        {PLANS.map((plan, i) => (
          <div key={plan.name} className="st-plan" data-featured={i === 1}>
            <span className="st-plan-name">{plan.name}</span>
            <span className="st-plan-price">
              {plan.price}
              <small>/month</small>
            </span>
            <span className="st-plan-note">{plan.note}</span>
          </div>
        ))}
      </section>
    </main>
  )
}
