'use client'

import type { CSSProperties, ReactNode } from 'react'
import { halftone } from 'tabbied/patterns'
import { Pattern } from '@/components/screens/swiss-art'
import { Face } from '../_shared/face'
import {
  CATEGORIES,
  DAILY_BUDGET,
  DAYS,
  GOAL,
  TODAY,
  TODAY_LABEL,
  WEEK_LABEL,
  WEEKLY_BUDGET,
  eur,
  eur0,
  type Category,
  type Summary,
  type Tx,
} from './ledger-data'

/**
 * Ledger on every screen it ships on.
 *
 * Five surfaces, one `LedgerState`: the dashboard on the laptop, the app on
 * the phone, the complication on the watch, the two-column layout on the
 * Fold and the widget on the Flip's cover. They are written in pixels, not
 * container units, because each device's virtual display is a fixed CSS
 * pixel grid (1512 wide on the 14" MacBook Pro, 402 on the iPhone, 208 on
 * the watch) and an app is laid out for its device the way any app is.
 *
 * Nothing here is a picture of state. A transaction added from the page
 * lands in the list, the bar chart, the ring and the complication in the
 * same render, because they are the same React tree.
 */

export interface LedgerState {
  transactions: Tx[]
  summary: Summary
}

/* ------------------------------------------------------------------ */
/*  The app's ink                                                      */
/* ------------------------------------------------------------------ */

export const INK = '#0f1420'
const PANEL = '#161c2a'
const PANEL_2 = '#1d2434'
const LINE = 'rgba(238, 241, 246, 0.09)'
const TEXT = '#eef1f6'
const MUTED = '#8b93a7'
export const LIME = '#c8f05a'
const TABULAR: CSSProperties = { fontVariantNumeric: 'tabular-nums' }

/** The progress ring: today's spend against the daily budget. */
function Ring({ size, stroke, value, max, children }: { size: number; stroke: number; value: number; max: number; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.min(value / max, 1)
  const over = value > max
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TEXT} strokeOpacity={0.1} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={over ? '#fb7185' : LIME}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.2, 0.7, 0.2, 1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        {children}
      </div>
    </div>
  )
}

function Dot({ category, size = 8 }: { category: Category; size?: number }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: CATEGORIES[category].color, flex: 'none', display: 'inline-block' }} />
}

/** The week as bars, today's in lime, the daily budget as a hairline. */
function Bars({ byDay, height, labelSize = 11 }: { byDay: number[]; height: number; labelSize?: number }) {
  const max = Math.max(...byDay, DAILY_BUDGET) * 1.15
  return (
    <div style={{ position: 'relative', height, display: 'flex', alignItems: 'flex-end', gap: '6%' }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: labelSize + 8 + (height - labelSize - 8) * (DAILY_BUDGET / max),
          borderTop: `1px dashed ${MUTED}`,
          opacity: 0.6,
        }}
      />
      {byDay.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
          <div
            style={{
              width: '100%',
              height: `${Math.max(2, (v / max) * 100)}%`,
              borderRadius: 6,
              background: i === TODAY ? LIME : PANEL_2,
              border: i === TODAY ? 'none' : `1px solid ${LINE}`,
              transition: 'height 0.5s cubic-bezier(0.2, 0.7, 0.2, 1)',
            }}
          />
          <span style={{ fontSize: labelSize, fontWeight: 600, color: i === TODAY ? TEXT : MUTED }}>{DAYS[i]}</span>
        </div>
      ))}
    </div>
  )
}

/** One transaction row. `fresh` slides the newest one in. */
function Row({ tx, size = 14, fresh, showDay }: { tx: Tx; size?: number; fresh?: boolean; showDay?: boolean }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        gap: size * 0.8,
        padding: `${size * 0.7}px 0`,
        borderBottom: `1px solid ${LINE}`,
        fontSize: size,
        animation: fresh ? 'ledger-in 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) both' : undefined,
      }}
    >
      <Dot category={tx.category} size={size * 0.7} />
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontWeight: 600, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.label}</span>
        <span style={{ fontSize: size * 0.8, color: MUTED }}>
          {CATEGORIES[tx.category].label} · {showDay ? `${DAYS[tx.day]} ` : ''}
          {tx.time}
        </span>
      </div>
      <span style={{ fontWeight: 700, letterSpacing: '-0.02em', ...TABULAR }}>−{eur(tx.amount)}</span>
    </div>
  )
}

const KEYFRAMES = `@keyframes ledger-in { from { opacity: 0; transform: translateY(-6px); } }`

/* ------------------------------------------------------------------ */
/*  MacBook Pro 14": the dashboard (1512 x 982)                        */
/* ------------------------------------------------------------------ */

export function Dashboard({ state }: { state: LedgerState }) {
  const { summary } = state
  const newest = summary.recent[0]
  const top = (Object.keys(CATEGORIES) as Category[]).sort((a, b) => summary.byCategory[b] - summary.byCategory[a])
  const catMax = summary.byCategory[top[0]!] || 1
  const tile = (label: string, value: string, sub: string, accent?: boolean) => (
    <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 16, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>{label}</span>
      <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1, color: accent ? LIME : TEXT, ...TABULAR }}>{value}</span>
      <span style={{ fontSize: 12.5, color: MUTED }}>{sub}</span>
    </div>
  )
  const nav = ['Overview', 'Accounts', 'Budgets', 'Goals', 'Reports']
  return (
    <Face background={INK} color={TEXT} style={{ display: 'grid', gridTemplateColumns: '224px 1fr', letterSpacing: '-0.012em' }}>
      <style>{KEYFRAMES}</style>
      <aside style={{ borderRight: `1px solid ${LINE}`, padding: '28px 22px', display: 'flex', flexDirection: 'column', gap: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em' }}>
          <span style={{ width: 16, height: 16, borderRadius: 5, background: LIME }} />
          Ledger
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 600 }}>
          {nav.map((item, i) => (
            <span key={item} style={{ padding: '9px 12px', borderRadius: 10, background: i === 0 ? PANEL_2 : 'transparent', color: i === 0 ? TEXT : MUTED }}>
              {item}
            </span>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
          <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #f472b6, #a78bfa)' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600 }}>Mira Kowalczyk</span>
            <span style={{ color: MUTED, fontSize: 12 }}>Personal · EUR</span>
          </div>
        </div>
      </aside>

      <main style={{ padding: '30px 36px', display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
        <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>{WEEK_LABEL}</div>
            <h1 style={{ margin: '4px 0 0', fontSize: 30, fontWeight: 800, letterSpacing: '-0.035em', color: TEXT }}>Overview</h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <span style={{ padding: '10px 16px', borderRadius: 999, border: `1px solid ${LINE}`, fontSize: 13.5, fontWeight: 600, color: MUTED }}>Export</span>
            <span style={{ padding: '10px 16px', borderRadius: 999, background: LIME, color: INK, fontSize: 13.5, fontWeight: 700 }}>+ Add expense</span>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {tile('Spent this week', eur(summary.week), `of ${eur0(WEEKLY_BUDGET)} budget`)}
          {tile('Left this week', eur(summary.leftWeek), summary.leftWeek < 0 ? 'over budget' : `${DAYS.length - TODAY - 1} days to go`, true)}
          {tile('Today', eur(summary.today), summary.leftToday >= 0 ? `${eur(summary.leftToday)} left of ${eur0(DAILY_BUDGET)}` : `${eur(summary.leftToday)} over`)}
          {tile('Biggest category', CATEGORIES[top[0]!].label, `${eur(summary.byCategory[top[0]!])} this week`)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
            <section style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 16, padding: '20px 22px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>Spending by day</span>
                <span style={{ fontSize: 12.5, color: MUTED }}>dashed line: {eur0(DAILY_BUDGET)} a day</span>
              </div>
              <Bars byDay={summary.byDay} height={210} />
            </section>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, flex: 1, minHeight: 0 }}>
              <section style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 16, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>By category</span>
                {top.map((c) => (
                  <div key={c} style={{ display: 'grid', gridTemplateColumns: '92px 1fr 64px', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                      <Dot category={c} /> {CATEGORIES[c].label}
                    </span>
                    <div style={{ height: 8, borderRadius: 4, background: PANEL_2, overflow: 'hidden' }}>
                      <div style={{ width: `${(summary.byCategory[c] / catMax) * 100}%`, height: '100%', background: CATEGORIES[c].color, transition: 'width 0.5s ease' }} />
                    </div>
                    <span style={{ textAlign: 'right', color: MUTED, ...TABULAR }}>{eur(summary.byCategory[c])}</span>
                  </div>
                ))}
              </section>
              {/* The goal card: the one picture in the app, a Tabbied
                  halftone in the app's inks, seeded so it is the same
                  card every visit - a savings goal is not a screensaver. */}
              <section style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: PANEL_2, border: `1px solid ${LINE}` }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.55 }}>
                  <Pattern pattern={halftone} seed="ledger-goal" palette={[PANEL_2, LIME]} grid="6x9" />
                </div>
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${PANEL} 30%, transparent 75%)` }} />
                <div style={{ position: 'absolute', left: 22, right: 22, bottom: 18 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: LIME }}>Savings goal</div>
                  <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 2 }}>{GOAL.name}</div>
                  <div style={{ height: 6, borderRadius: 3, background: 'rgba(238,241,246,0.12)', margin: '10px 0 6px', overflow: 'hidden' }}>
                    <div style={{ width: `${(GOAL.saved / GOAL.target) * 100}%`, height: '100%', background: LIME }} />
                  </div>
                  <div style={{ fontSize: 12.5, color: MUTED, ...TABULAR }}>
                    {eur0(GOAL.saved)} of {eur0(GOAL.target)} · {Math.round((GOAL.saved / GOAL.target) * 100)}%
                  </div>
                </div>
              </section>
            </div>
          </div>

          <section style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 16, padding: '20px 22px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Recent</span>
              <span style={{ fontSize: 12.5, color: MUTED }}>{state.transactions.length} this week</span>
            </div>
            <div style={{ overflow: 'hidden', flex: 1, minHeight: 0 }}>
              {summary.recent.slice(0, 9).map((tx) => (
                <Row key={tx.id} tx={tx} size={13.5} fresh={tx === newest && tx.id > 14} showDay />
              ))}
            </div>
          </section>
        </div>
      </main>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  iPhone: the app (402 x 874)                                        */
/* ------------------------------------------------------------------ */

export function MobileApp({ state }: { state: LedgerState }) {
  const { summary } = state
  const newest = summary.recent[0]
  const tabs = ['Home', 'Budgets', 'Goals', 'You']
  return (
    <Face background={INK} color={TEXT} style={{ display: 'flex', flexDirection: 'column', paddingTop: 'calc(var(--mockup-safe-area-top, 0px) + 8px)', letterSpacing: '-0.012em' }}>
      <style>{KEYFRAMES}</style>
      <header style={{ padding: '10px 22px 0' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>{TODAY_LABEL}</div>
        <h1 style={{ margin: '2px 0 0', fontSize: 30, fontWeight: 800, letterSpacing: '-0.035em', color: TEXT }}>Today</h1>
      </header>

      <div style={{ margin: '16px 18px 0', padding: '18px 20px', borderRadius: 22, background: PANEL, border: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: 18 }}>
        <Ring size={118} stroke={11} value={summary.today} max={DAILY_BUDGET}>
          <span style={{ fontSize: 11, fontWeight: 600, color: MUTED }}>spent</span>
          <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.03em', ...TABULAR }}>{eur(summary.today)}</span>
        </Ring>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 13, color: MUTED }}>Daily budget {eur0(DAILY_BUDGET)}</span>
          <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: summary.leftToday < 0 ? '#fb7185' : LIME, ...TABULAR }}>
            {eur(summary.leftToday)} {summary.leftToday < 0 ? 'over' : 'left'}
          </span>
          <span style={{ fontSize: 12.5, color: MUTED }}>
            {eur(summary.week)} this week
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '14px 18px 0', overflow: 'hidden' }}>
        {(Object.keys(CATEGORIES) as Category[]).map((c) => (
          <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 11px', borderRadius: 999, background: PANEL, border: `1px solid ${LINE}`, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
            <Dot category={c} size={7} />
            {eur0(summary.byCategory[c])}
          </span>
        ))}
      </div>

      <div style={{ padding: '18px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.03em' }}>Today</span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: MUTED }}>{summary.todays.length} transactions</span>
      </div>
      <div style={{ padding: '2px 22px 0', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {summary.todays.map((tx) => (
          <Row key={tx.id} tx={tx} size={15} fresh={tx === newest && tx.id > 14} />
        ))}
      </div>

      <nav style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '12px 10px 30px', borderTop: `1px solid ${LINE}`, fontSize: 12, fontWeight: 700 }}>
        {tabs.map((tab, i) => (
          <span key={tab} style={{ padding: '7px 14px', borderRadius: 999, background: i === 0 ? LIME : 'transparent', color: i === 0 ? INK : MUTED }}>
            {tab}
          </span>
        ))}
      </nav>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  Apple Watch: the complication (208 x 248)                          */
/* ------------------------------------------------------------------ */

export function WatchFace({ state }: { state: LedgerState }) {
  const { summary } = state
  const newest = summary.recent[0]
  return (
    <Face background="#000" color={TEXT} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 12px', letterSpacing: '-0.012em' }}>
      <div style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
        <span style={{ color: LIME }}>Ledger</span>
        <span style={{ ...TABULAR }}>9:41</span>
      </div>
      <Ring size={122} stroke={10} value={summary.today} max={DAILY_BUDGET}>
        <span style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1, ...TABULAR }}>{eur0(summary.leftToday)}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: MUTED, marginTop: 3 }}>{summary.leftToday < 0 ? 'over' : 'left today'}</span>
      </Ring>
      {newest ? (
        <div style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <Dot category={newest.category} size={7} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{newest.label}</span>
          </span>
          <span style={{ ...TABULAR }}>−{eur(newest.amount)}</span>
        </div>
      ) : null}
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  Galaxy Z Fold, open: the whole week (820 x 910)                    */
/* ------------------------------------------------------------------ */

export function TabletApp({ state }: { state: LedgerState }) {
  const { summary } = state
  const newest = summary.recent[0]
  const top = (Object.keys(CATEGORIES) as Category[]).sort((a, b) => summary.byCategory[b] - summary.byCategory[a])
  const catMax = summary.byCategory[top[0]!] || 1
  return (
    <Face background={INK} color={TEXT} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', paddingTop: 'var(--mockup-safe-area-top, 0px)', letterSpacing: '-0.012em' }}>
      <style>{KEYFRAMES}</style>
      <section style={{ padding: '22px 24px', borderRight: `1px solid ${LINE}`, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>{WEEK_LABEL}</div>
        <h1 style={{ margin: '2px 0 12px', fontSize: 26, fontWeight: 800, letterSpacing: '-0.035em', color: TEXT }}>This week</h1>
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {summary.recent.slice(0, 12).map((tx) => (
            <Row key={tx.id} tx={tx} size={13.5} fresh={tx === newest && tx.id > 14} showDay />
          ))}
        </div>
      </section>
      <section style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', borderRadius: 18, background: PANEL, border: `1px solid ${LINE}` }}>
          <Ring size={96} stroke={9} value={summary.today} max={DAILY_BUDGET}>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.03em', ...TABULAR }}>{eur0(summary.today)}</span>
            <span style={{ fontSize: 10, color: MUTED }}>today</span>
          </Ring>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 12.5, color: MUTED }}>Left this week</span>
            <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: LIME, ...TABULAR }}>{eur(summary.leftWeek)}</span>
            <span style={{ fontSize: 12, color: MUTED }}>of {eur0(WEEKLY_BUDGET)}</span>
          </div>
        </div>
        <div style={{ padding: '16px 18px 12px', borderRadius: 18, background: PANEL, border: `1px solid ${LINE}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Spending by day</div>
          <Bars byDay={summary.byDay} height={150} labelSize={10.5} />
        </div>
        <div style={{ padding: '16px 18px', borderRadius: 18, background: PANEL, border: `1px solid ${LINE}`, display: 'flex', flexDirection: 'column', gap: 9 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>By category</div>
          {top.map((c) => (
            <div key={c} style={{ display: 'grid', gridTemplateColumns: '84px 1fr 60px', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600 }}>
                <Dot category={c} size={7} /> {CATEGORIES[c].label}
              </span>
              <div style={{ height: 7, borderRadius: 4, background: PANEL_2, overflow: 'hidden' }}>
                <div style={{ width: `${(summary.byCategory[c] / catMax) * 100}%`, height: '100%', background: CATEGORIES[c].color, transition: 'width 0.5s ease' }} />
              </div>
              <span style={{ textAlign: 'right', color: MUTED, ...TABULAR }}>{eur(summary.byCategory[c])}</span>
            </div>
          ))}
        </div>
      </section>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  Galaxy Z Flip, closed: the cover widget (316 x 349)                */
/* ------------------------------------------------------------------ */

export function CoverWidget({ state }: { state: LedgerState }) {
  const { summary } = state
  const newest = summary.recent[0]
  return (
    <Face background="#000" color={TEXT} style={{ display: 'flex', flexDirection: 'column', padding: '22px 22px 18px', letterSpacing: '-0.012em' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.03em', color: LIME }}>Ledger</span>
        <span style={{ fontSize: 14, fontWeight: 700, ...TABULAR }}>9:41</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 'auto' }}>
        <Ring size={116} stroke={11} value={summary.today} max={DAILY_BUDGET}>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.035em', ...TABULAR }}>{eur0(summary.leftToday)}</span>
          <span style={{ fontSize: 10.5, color: MUTED }}>{summary.leftToday < 0 ? 'over' : 'left'}</span>
        </Ring>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <span style={{ fontSize: 12, color: MUTED }}>Spent today</span>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', ...TABULAR }}>{eur(summary.today)}</span>
          {newest ? (
            <span style={{ fontSize: 12, color: MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Last: {newest.label}
            </span>
          ) : null}
        </div>
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
        {['Coffee', 'Groceries', 'Transport'].map((q, i) => (
          <span key={q} style={{ flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: 999, background: i === 0 ? LIME : PANEL_2, color: i === 0 ? INK : TEXT, fontSize: 11.5, fontWeight: 700 }}>
            + {q}
          </span>
        ))}
      </div>
    </Face>
  )
}
