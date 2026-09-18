'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ExampleBadge, TabbiedLink } from '../_shared/badge'
import { lazyScene } from '../_shared/stage'
import { Tile } from './stream-art'
import { DEFAULT_FEATURED, PLANS, SHOWS, findShow } from './stream-data'

type Props = { featured: string }
const TVStage = lazyScene<Props>(() => import('./stream-scenes').then((m) => m.TVScene))
const FoldStage = lazyScene<Props>(() => import('./stream-scenes').then((m) => m.FoldScene))
const FlipStage = lazyScene<Props>(() => import('./stream-scenes').then((m) => m.FlipScene))
const IPadStage = lazyScene<Props>(() => import('./stream-scenes').then((m) => m.IPadScene))

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
        <span className="st-brand">
          <span className="st-brand-mark" aria-hidden />
          Prism
        </span>
        <nav className="st-nav" aria-label="Site">
          <span>Browse</span>
          <span>Live</span>
          <span>Kids</span>
          <span>Plans</span>
        </nav>
        <div className="st-top-right">
          <ExampleBadge className="st-badge" />
          <span className="st-cta">Start your free week</span>
        </div>
      </header>

      <section className="st-hero">
        <p className="st-eyebrow">Series, films and live sport · 4K on every screen</p>
        <h1>Something good is on.</h1>
        <p className="st-lede">
          Prism is the same home on your TV, your tablet and the phone in your pocket, with tonight&rsquo;s feature
          waiting on every one of them.
        </p>
      </section>

      <section className="st-tv" aria-label="Prism on a TV">
        <div className="st-tv-stage">
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
            Every poster is a <TabbiedLink /> pattern in the title&rsquo;s own palette, so the catalogue has no image
            files at all. The TV&rsquo;s hero is live: it recomposes every few seconds.
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
              <FoldStage featured={featured} />
            </div>
            <div className="st-card-copy">
              <strong>On a Fold</strong>
              <span>The home screen with room for the rows.</span>
            </div>
          </article>
          <article className="st-card">
            <div className="st-card-stage">
              <FlipStage featured={featured} />
            </div>
            <div className="st-card-copy">
              <strong>On a Flip, in Flex Mode</strong>
              <span>The picture on the top half, the controls on the bottom, split at the hinge.</span>
            </div>
          </article>
          <article className="st-card">
            <div className="st-card-stage">
              <IPadStage featured={featured} />
            </div>
            <div className="st-card-copy">
              <strong>On an iPad</strong>
              <span>The title page, with every episode.</span>
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

      <footer className="st-foot">
        <span>Prism is a fictional service and so are its shows. The four screens are live mockups sharing one featured title.</span>
        <Link href="/docs">Read the react-3d-mockups docs →</Link>
      </footer>
    </main>
  )
}
