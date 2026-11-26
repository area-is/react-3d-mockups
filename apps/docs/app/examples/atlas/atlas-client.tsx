'use client'

import { useState } from 'react'
import Link from 'next/link'
import { halftone } from 'tabbied/patterns'
import { TabbiedPattern } from 'tabbied/react'
import { lazyScene } from '../_shared/stage'
import { Picture } from './atlas-art'
import { BOOK, CONTENTS, MAG, PHOTOS, findPhoto } from './atlas-data'

const MagazineStage = lazyScene<{ cover: string; glossy: boolean }>(() => import('./atlas-scenes').then((m) => m.MagazineScene))
const BookStage = lazyScene(() => import('./atlas-scenes').then((m) => m.BookScene))
const PrintStage = lazyScene<{ cover: string }>(() => import('./atlas-scenes').then((m) => m.PrintScene))
const CardStage = lazyScene<{ cover: string }>(() => import('./atlas-scenes').then((m) => m.CardScene))

/**
 * The ground under every object on the page, in place of a panel: Tabbied's
 * `halftone`, a fine screen of dots in the masthead's ink on a transparent
 * ground, growing heavier towards the foot of the stage the way a floor
 * darkens under what stands on it. The pictures in a magazine are printed
 * as dots like these, so the issue stands on its own print screen. The
 * stylesheet keeps it faint and fades it out before the stage's edge, so
 * no box shows.
 */
const GROUND_PALETTE = ['transparent', '#171512']

function StageGround({ seed }: { seed: string }) {
  return (
    <div className="at-stage-ground" aria-hidden>
      <TabbiedPattern pattern={halftone} seed={seed} palette={GROUND_PALETTE} fit="grid" cellSize={16} />
    </div>
  )
}

/**
 * Atlas's issue page. An editor's two decisions are the page's two
 * controls: which photograph is the cover, and whether the issue prints
 * gloss or matte. The cover choice carries to the print and the notecard,
 * because the pictures in the shop are the pictures in the issue.
 */
export function Atlas() {
  const [cover, setCover] = useState('island')
  const [glossy, setGlossy] = useState(false)
  const photo = findPhoto(cover)

  return (
    <main className="at">
      <header className="at-top">
        <span className="at-brand">{MAG.name}</span>
        <nav className="at-nav" aria-label="Site">
          <span>Issues</span>
          <span>Stories</span>
          <span>Prints</span>
          <span>Subscribe</span>
        </nav>
        <div className="at-top-right">
          <span className="at-cta">Subscribe · €48 a year</span>
        </div>
      </header>

      <section className="at-hero">
        <div className="at-hero-copy">
          <p className="at-eyebrow">
            Issue {MAG.issue} · {MAG.theme} · {MAG.season}
          </p>
          <h1>Twelve islands, one ferry timetable</h1>
          <p className="at-lede">
            The autumn issue goes out to the rocks: a lighthouse being switched off, harbours that only wake after
            dark, and a market stall older than the town around it. Ninety-six pages, {MAG.price}.
          </p>

          <div className="at-controls">
            <div className="at-control">
              <span className="at-control-label">Cover</span>
              <div className="at-covers" role="group" aria-label="Cover photograph">
                {PHOTOS.map((p) => (
                  <button key={p.id} type="button" className="at-cover" aria-pressed={p.id === cover} aria-label={p.caption} title={p.caption} onClick={() => setCover(p.id)}>
                    <Picture photo={p} />
                  </button>
                ))}
              </div>
            </div>
            <div className="at-control">
              <span className="at-control-label">Stock</span>
              <div className="at-seg" role="group" aria-label="Cover stock">
                <button type="button" aria-pressed={!glossy} onClick={() => setGlossy(false)}>
                  Matte
                </button>
                <button type="button" aria-pressed={glossy} onClick={() => setGlossy(true)}>
                  Gloss
                </button>
              </div>
            </div>
          </div>
          <p className="at-control-note">
            {photo.caption}: <em>{photo.story}</em>. The cover you choose is the print and the notecard below too.
            Turn the issue over for the contents.
          </p>
        </div>
        <div className="at-hero-stage">
          <StageGround seed="atlas-issue" />
          <MagazineStage cover={cover} glossy={glossy} />
        </div>
      </section>

      <section className="at-contents">
        <h2>In this issue</h2>
        <div className="at-contents-grid">
          {CONTENTS.map(([page, title, by]) => (
            <div key={page} className="at-contents-row">
              <span className="at-contents-page">{page}</span>
              <span className="at-contents-title">{title}</span>
              <span className="at-contents-by">{by}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="at-shop">
        <div className="at-shop-head">
          <h2>From the issue</h2>
          <p>The pictures, on things you can keep: a print of the cover, a notecard of it, and the annual with five years of them.</p>
        </div>
        <div className="at-shop-grid">
          <article className="at-item">
            <div className="at-item-stage">
              <StageGround seed="atlas-print" />
              <PrintStage cover={cover} />
            </div>
            <div className="at-item-meta">
              <strong>The print</strong>
              <span>18 × 24″, edition of fifty, oak frame · €120</span>
            </div>
          </article>
          <article className="at-item">
            <div className="at-item-stage">
              <StageGround seed="atlas-card" />
              <CardStage cover={cover} />
            </div>
            <div className="at-item-meta">
              <strong>The notecards</strong>
              <span>Six, folded, blank inside · €16</span>
            </div>
          </article>
          <article className="at-item">
            <div className="at-item-stage">
              <StageGround seed="atlas-annual" />
              <BookStage />
            </div>
            <div className="at-item-meta">
              <strong>{BOOK.title}</strong>
              <span>
                {BOOK.sub}, {BOOK.pages} pages, cloth · €48
              </span>
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
