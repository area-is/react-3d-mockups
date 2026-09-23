'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePrefersReducedMotion } from 'react-3d-mockups'
import { lazyScene } from '../_shared/stage'
import { Crest } from './matchday-art'
import { CLUB, FIXTURES, MATCH, clock } from './matchday-data'

const CoachStage = lazyScene(() => import('./matchday-scenes').then((m) => m.CoachScene))
const BroadcastStage = lazyScene<{ seconds: number }>(() => import('./matchday-scenes').then((m) => m.BroadcastScene))
const WatchStage = lazyScene<{ seconds: number }>(() => import('./matchday-scenes').then((m) => m.WatchScene))
const PassStage = lazyScene(() => import('./matchday-scenes').then((m) => m.PassScene))

/**
 * The match clock: one number, ticking once a second, handed to the TV,
 * the watch and the page's own live strip. It holds still under
 * `prefers-reduced-motion`, which is the same courtesy the mockups'
 * float animation pays.
 */
function useMatchClock(): number {
  const still = usePrefersReducedMotion()
  const [seconds, setSeconds] = useState(MATCH.startMinute * 60 + MATCH.startSecond)
  useEffect(() => {
    if (still) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [still])
  return seconds
}

/**
 * Alcântara FC's website on a match day. The coach is on its way, the
 * match is live on the TV and on your wrist, and there is a season ticket
 * to be had. The clock is the page's, and it runs.
 */
export function Matchday() {
  const seconds = useMatchClock()

  return (
    <main className="md">
      <header className="md-top">
        <span className="md-brand">
          <Crest size={30} />
          {CLUB.name}
        </span>
        <nav className="md-nav" aria-label="Site">
          <span>Fixtures</span>
          <span>Tickets</span>
          <span>Shop</span>
          <span>Academy</span>
        </nav>
        <div className="md-top-right">
          <span className="md-cta">Season tickets</span>
        </div>
      </header>

      <section className="md-hero">
        <div className="md-live" role="status" aria-live="polite">
          <span className="md-live-dot" aria-hidden />
          Live · {MATCH.home.short} {MATCH.score.home}–{MATCH.score.away} {MATCH.away.short} · {clock(seconds)}
        </div>
        <h1>
          Match day.
          <br />
          {CLUB.motto}
        </h1>
        <p className="md-lede">
          {MATCH.home.name} against {MATCH.away.name}, {MATCH.date} at {MATCH.kickoff}, {CLUB.ground}. The coach
          leaves the ground at nine; the North Stand sings from half past two.
        </p>
      </section>

      <section className="md-coach" aria-label="The team coach">
        <div className="md-coach-stage">
          <CoachStage />
        </div>
        <p className="md-caption">The team coach, wrapped in perforated film over the glass with the doors kept clear, and the destination sign set for the day. Drag it round.</p>
      </section>

      <section className="md-match">
        <div className="md-match-head">
          <h2>Live from the Rio</h2>
          <p>
            The broadcast and the wrist read the same clock, and it is running: the page&rsquo;s state is the match
            state. Solano&rsquo;s second went in at 63&rsquo;.
          </p>
        </div>
        <div className="md-match-grid">
          <article className="md-card md-card-wide">
            <div className="md-card-stage">
              <BroadcastStage seconds={seconds} />
            </div>
            <div className="md-card-copy">
              <strong>The broadcast</strong>
              <span>Score bug, live clock and the goal lower-third on a 65&Prime; set.</span>
            </div>
          </article>
          <article className="md-card">
            <div className="md-card-stage">
              <WatchStage seconds={seconds} />
            </div>
            <div className="md-card-copy">
              <strong>On your wrist</strong>
              <span>The score, the minute and the last scorer, on a round dial.</span>
            </div>
          </article>
        </div>
        <div className="md-stats">
          {MATCH.stats.map(([label, home, away]) => (
            <div key={label} className="md-stat">
              <span>{home}</span>
              <strong>{label}</strong>
              <span>{away}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="md-pass">
        <div className="md-pass-stage">
          <PassStage />
        </div>
        <div className="md-pass-copy">
          <p className="md-eyebrow">Season 2026 / 27</p>
          <h2>Your seat, all season.</h2>
          <p>
            Nineteen home matches, the cup, and a card that gets you through the turnstile before the queue. North
            Stand from €240, family enclosure from €140.
          </p>
          <div className="md-fixtures">
            {FIXTURES.map((f) => (
              <div key={f.date} className="md-fixture" data-live={'live' in f && f.live}>
                <span>{f.date}</span>
                <strong>{f.vs}</strong>
                <span>
                  {f.where} · {f.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="md-foot">
        <span>Alcântara FC is a fictional club. The coach, the broadcast, the watch and the pass are live mockups; the clock is the page&rsquo;s.</span>
        <Link href="/docs">Read the react-3d-mockups docs →</Link>
      </footer>
    </main>
  )
}
