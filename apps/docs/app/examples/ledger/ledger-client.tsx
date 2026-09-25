'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { RotateCcw } from 'lucide-react'
import { SceneBoundary } from '@/components/scene-boundary'
import { lazyScene } from '../_shared/stage'
import { CATEGORIES, DAILY_BUDGET, QUICK_ADDS, SEED_TRANSACTIONS, addTransaction, eur, summarize, type Tx } from './ledger-data'
import type { LedgerState } from './ledger-screens'

const Hero = dynamic(() => import('./ledger-scene'), {
  ssr: false,
  loading: () => <div className="ex-loading">Warming up the GPU…</div>,
})
const FoldStage = lazyScene<{ state: LedgerState }>(() => import('./ledger-extras').then((m) => m.FoldScene))
const FlipStage = lazyScene<{ state: LedgerState }>(() => import('./ledger-extras').then((m) => m.FlipScene))

/**
 * The landing page for Ledger, a personal-finance app.
 *
 * The state is the week's transactions, held here and handed to every
 * device on the page. The "add an expense" buttons under the hero are
 * ordinary page buttons - a mockup surface never takes pointer input - and
 * pressing one updates the laptop, the phone and the watch in one render,
 * which is the whole point of the screens being real DOM.
 */
export function Ledger() {
  const [transactions, setTransactions] = useState<Tx[]>(SEED_TRANSACTIONS)
  const state = useMemo<LedgerState>(() => ({ transactions, summary: summarize(transactions) }), [transactions])
  const added = transactions.length - SEED_TRANSACTIONS.length

  return (
    <main className="lg">
      <header className="lg-top">
        <span className="lg-brand">
          <span className="lg-brand-mark" aria-hidden />
          Ledger
        </span>
        <nav className="lg-nav" aria-label="Site">
          <span>Product</span>
          <span>Pricing</span>
          <span>Changelog</span>
        </nav>
        <div className="lg-top-right">
          <span className="lg-cta">Get the app</span>
        </div>
      </header>

      <section className="lg-hero">
        <p className="lg-eyebrow">Personal finance · Mac, iPhone and Apple Watch</p>
        <h1>
          Every euro,
          <br />
          on every screen.
        </h1>
        <p className="lg-lede">
          Log a coffee on your wrist and it is on your laptop before you have finished it. Ledger keeps one set of
          books and shows them wherever you are looking.
        </p>
      </section>

      <section className="lg-stage-wrap" aria-label="Ledger on a laptop, a phone and a watch">
        <div className="lg-stage">
          <SceneBoundary>
            <Hero state={state} />
          </SceneBoundary>
        </div>
        <div className="lg-try">
          <span className="lg-try-label">Try it: add an expense</span>
          <div className="lg-try-buttons">
            {QUICK_ADDS.map((q) => (
              <button key={q.label} type="button" className="lg-try-btn" onClick={() => setTransactions((t) => addTransaction(t, q))}>
                <span className="lg-try-dot" style={{ background: CATEGORIES[q.category].color }} aria-hidden />
                {q.label}
                <span className="lg-try-amount">{eur(q.amount)}</span>
              </button>
            ))}
            <button type="button" className="lg-try-reset" onClick={() => setTransactions(SEED_TRANSACTIONS)} disabled={added === 0}>
              <RotateCcw size={14} strokeWidth={2.2} aria-hidden />
              Reset
            </button>
          </div>
          <p className="lg-try-note" role="status" aria-live="polite">
            {added === 0
              ? `Today's spend is ${eur(state.summary.today)} of a ${eur(DAILY_BUDGET)} budget. Drag the scene to look around it.`
              : `${added} added. Today is at ${eur(state.summary.today)}: ${state.summary.leftToday >= 0 ? `${eur(state.summary.leftToday)} left` : `${eur(state.summary.leftToday)} over`}. The chart, the list, the ring and the complication all moved.`}
          </p>
        </div>
      </section>

      <section className="lg-features">
        <article className="lg-feature">
          <div className="lg-feature-stage">
            <FoldStage state={state} />
          </div>
          <div className="lg-feature-copy">
            <h2>The whole week on one screen</h2>
            <p>
              On a Fold the app opens into two columns: every transaction on the left, the week&rsquo;s shape on the
              right. Same books, more room.
            </p>
          </div>
        </article>
        <article className="lg-feature">
          <div className="lg-feature-stage">
            <FlipStage state={state} />
          </div>
          <div className="lg-feature-copy">
            <h2>A glance is enough</h2>
            <p>
              Closed, a Flip shows what is left today and the last thing you bought, with the three things you buy
              most a tap away.
            </p>
          </div>
        </article>
      </section>

      <section className="lg-claims">
        {[
          ['One set of books', 'Every device reads and writes the same ledger. Nothing syncs, because nothing is apart.'],
          ['Budgets that bend', 'A daily budget rolls what you did not spend into tomorrow, and says so.'],
          ['Yours, on your devices', 'End-to-end encrypted. No ads, no data broker, no bank login stored anywhere.'],
        ].map(([title, body]) => (
          <div key={title} className="lg-claim">
            <h3>{title}</h3>
            <p>{body}</p>
          </div>
        ))}
      </section>

      <footer className="lg-foot">
        <span>Ledger is a fictional app. The three devices are one WebGL canvas, and the app on them is one React state.</span>
        <Link href="/docs">Read the react-3d-mockups docs →</Link>
      </footer>
    </main>
  )
}
