'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ExampleBadge, TabbiedLink } from '../_shared/badge'
import { lazyScene } from '../_shared/stage'
import { DEFAULT_SUITE, FACES, PALETTES, names, type Suite } from './stationery-data'

type Props = { suite: Suite }
const InviteStage = lazyScene<Props>(() => import('./stationery-scenes').then((m) => m.InviteScene))
const ReplyStage = lazyScene<Props>(() => import('./stationery-scenes').then((m) => m.ReplyScene))
const SignStage = lazyScene<Props>(() => import('./stationery-scenes').then((m) => m.SignScene))
const PlanStage = lazyScene<Props>(() => import('./stationery-scenes').then((m) => m.PlanScene))

function Text({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="am-text">
      <span>{label}</span>
      <input type="text" value={value} placeholder={placeholder} maxLength={40} onChange={(e) => onChange(e.target.value)} spellCheck={false} />
    </label>
  )
}

/**
 * Ampersand's suite builder. The form on the left is the whole interface:
 * two names, a date, a venue, a reply-by date, a palette and a face. Every
 * keystroke re-renders the invitation, the reply card, the welcome sign and
 * the table plan, because each is a component reading the same `Suite`.
 * There is no preview button; the pieces on the right are the preview.
 */
export function Stationery() {
  const [suite, setSuite] = useState<Suite>(DEFAULT_SUITE)
  const set = (patch: Partial<Suite>) => setSuite((s) => ({ ...s, ...patch }))
  const n = names(suite)
  const palette = PALETTES.find((p) => p.id === suite.palette) ?? PALETTES[0]

  return (
    <main className="am" style={{ ['--am-accent' as string]: palette.accent, ['--am-ink' as string]: palette.id === 'ink' ? '#1f2937' : palette.ink }}>
      <header className="am-top">
        <span className="am-brand">Ampersand</span>
        <nav className="am-nav" aria-label="Site">
          <span>Suites</span>
          <span>Paper</span>
          <span>Calligraphy</span>
          <span>Journal</span>
        </nav>
        <div className="am-top-right">
          <ExampleBadge className="am-badge" />
          <span className="am-cta">Order samples</span>
        </div>
      </header>

      <section className="am-hero">
        <p className="am-eyebrow">Wedding stationery · letterpress and litho, Lisbon</p>
        <h1>Your names, on everything.</h1>
        <p className="am-lede">
          Type them once. The invitation, the reply card, the sign at the gate and the table plan set themselves as
          you go, in the paper and the palette you choose.
        </p>
      </section>

      <section className="am-builder">
        <form className="am-form" onSubmit={(e) => e.preventDefault()}>
          <div className="am-form-row">
            <Text label="First name" value={suite.first} onChange={(v) => set({ first: v })} placeholder="June" />
            <Text label="Second name" value={suite.second} onChange={(v) => set({ second: v })} placeholder="Tomás" />
          </div>
          <Text label="The date" value={suite.date} onChange={(v) => set({ date: v })} placeholder="Saturday 6 June 2027" />
          <div className="am-form-row">
            <Text label="Venue" value={suite.venue} onChange={(v) => set({ venue: v })} placeholder="Quinta da Regaleira" />
            <Text label="Town" value={suite.city} onChange={(v) => set({ city: v })} placeholder="Sintra" />
          </div>
          <Text label="Reply by" value={suite.reply} onChange={(v) => set({ reply: v })} placeholder="6 April" />

          <fieldset className="am-field">
            <legend>Palette</legend>
            <div className="am-palettes" role="group" aria-label="Palette">
              {PALETTES.map((p) => (
                <button key={p.id} type="button" className="am-palette" aria-pressed={p.id === suite.palette} onClick={() => set({ palette: p.id })}>
                  <span className="am-palette-chip" style={{ background: p.paper }}>
                    <span style={{ background: p.ink }} />
                    <span style={{ background: p.accent }} />
                  </span>
                  {p.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="am-field">
            <legend>Typeface</legend>
            <div className="am-seg" role="group" aria-label="Typeface">
              {FACES.map((f) => (
                <button key={f.id} type="button" aria-pressed={f.id === suite.face} data-face={f.id} onClick={() => set({ face: f.id })}>
                  {f.label}
                </button>
              ))}
            </div>
          </fieldset>

          <p className="am-form-note">
            Four pieces, one set of words. The faint dots in the paper are a <TabbiedLink /> pattern in the palette&rsquo;s
            accent. Drag any piece to turn it over.
          </p>
        </form>

        <div className="am-pieces">
          <article className="am-piece">
            <div className="am-piece-stage">
              <InviteStage suite={suite} />
            </div>
            <div className="am-piece-meta">
              <strong>The invitation</strong>
              <span>A7, folded. The day inside.</span>
            </div>
          </article>
          <article className="am-piece">
            <div className="am-piece-stage">
              <ReplyStage suite={suite} />
            </div>
            <div className="am-piece-meta">
              <strong>The reply card</strong>
              <span>
                Reply by {suite.reply || 'soon'}, {n.first} &amp; {n.second}&rsquo;s monogram on the back.
              </span>
            </div>
          </article>
          <article className="am-piece">
            <div className="am-piece-stage">
              <SignStage suite={suite} />
            </div>
            <div className="am-piece-meta">
              <strong>The welcome sign</strong>
              <span>At the gate. The afternoon on the back.</span>
            </div>
          </article>
          <article className="am-piece">
            <div className="am-piece-stage">
              <PlanStage suite={suite} />
            </div>
            <div className="am-piece-meta">
              <strong>The table plan</strong>
              <span>18 × 24″, framed, eight tables named for trees.</span>
            </div>
          </article>
        </div>
      </section>

      <footer className="am-foot">
        <span>Ampersand is a fictional studio. The four pieces are live mockups reading one set of fields.</span>
        <Link href="/docs">Read the react-3d-mockups docs →</Link>
      </footer>
    </main>
  )
}
