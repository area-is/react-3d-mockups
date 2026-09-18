'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TabbiedPattern } from 'tabbied/react'
import { ExampleBadge, TabbiedLink } from '../_shared/badge'
import { lazyScene } from '../_shared/stage'
import { CHANNELS, DEFAULT_SETTINGS, FINISHES, MATTES, PLANS, findChannel, type Settings } from './ambient-data'

type Props = { settings: Settings }
const FrameStage = lazyScene<Props>(() => import('./ambient-scenes').then((m) => m.FrameScene))
const DeskStage = lazyScene<Props>(() => import('./ambient-scenes').then((m) => m.DeskScene))
const TabletStage = lazyScene<Props>(() => import('./ambient-scenes').then((m) => m.TabletScene))
const WristStage = lazyScene<Props>(() => import('./ambient-scenes').then((m) => m.WristScene))

/**
 * Ambient's landing page. A channel, a bezel and a matte are the whole
 * product, so they are the whole interface: pick them under the Frame and
 * the display on the desk, the tablet on the shelf and the watch follow.
 */
export function Ambient() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const set = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }))
  const channel = findChannel(settings.channel)

  return (
    <main className="ab" style={{ ['--ab-ground' as string]: channel.palette[0], ['--ab-ink' as string]: channel.palette[1] }}>
      <header className="ab-top">
        <span className="ab-brand">
          <span className="ab-brand-mark" aria-hidden />
          Ambient
        </span>
        <nav className="ab-nav" aria-label="Site">
          <span>Channels</span>
          <span>Screens</span>
          <span>Artists</span>
          <span>Plans</span>
        </nav>
        <div className="ab-top-right">
          <ExampleBadge className="ab-badge" />
          <span className="ab-cta">Try it free for a month</span>
        </div>
      </header>

      <section className="ab-hero">
        <p className="ab-eyebrow">Living art for the screens you already own</p>
        <h1>Never the same picture twice.</h1>
        <p className="ab-lede">
          Six channels of generative art that redraw themselves every few seconds, on the TV when it is off, the
          monitor when you are away, the tablet on the shelf and the watch on your wrist. All of them turn together.
        </p>
      </section>

      <section className="ab-wall" aria-label="Ambient on a Frame TV">
        <div className="ab-wall-stage">
          <FrameStage settings={settings} />
        </div>
        <div className="ab-controls">
          <div className="ab-control">
            <span className="ab-control-label">Channel</span>
            <div className="ab-channels" role="group" aria-label="Channel">
              {CHANNELS.map((c) => (
                <button key={c.id} type="button" className="ab-channel" aria-pressed={c.id === settings.channel} onClick={() => set({ channel: c.id })}>
                  <span className="ab-channel-chip" style={{ background: c.palette[0] }}>
                    <TabbiedPattern pattern={c.pattern} seed={`chip-${c.id}`} palette={c.palette} options={{ grid: '2x3' }} fit="cover" />
                  </span>
                  <span className="ab-channel-name">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="ab-control-row">
            <div className="ab-control">
              <span className="ab-control-label">Bezel</span>
              <div className="ab-finishes" role="group" aria-label="Bezel finish">
                {FINISHES.map((f) => (
                  <button key={f.id} type="button" className="ab-finish" aria-pressed={f.id === settings.finish} aria-label={f.label} title={f.label} onClick={() => set({ finish: f.id })}>
                    <span style={{ background: f.color }} />
                  </button>
                ))}
              </div>
            </div>
            <div className="ab-control">
              <span className="ab-control-label">Matte</span>
              <div className="ab-seg" role="group" aria-label="Matte">
                {MATTES.map((m) => (
                  <button key={m.id} type="button" aria-pressed={m.id === settings.matte} onClick={() => set({ matte: m.id })}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="ab-control-note">
              <strong>{channel.name}.</strong> {channel.mood} Every channel is a <TabbiedLink /> pattern; the screens
              redraw it on a shared clock, so a room of them turns as one.
            </p>
          </div>
        </div>
      </section>

      <section className="ab-screens">
        <div className="ab-screens-head">
          <h2>Every screen in the house</h2>
          <p>The same channel, a different composition on each, and all of them changing at the same moment.</p>
        </div>
        <div className="ab-grid">
          <article className="ab-card ab-card-wide">
            <div className="ab-card-stage">
              <DeskStage settings={settings} />
            </div>
            <div className="ab-card-copy">
              <strong>On the desk</strong>
              <span>A screensaver with the time, on a 27&Prime; display.</span>
            </div>
          </article>
          <article className="ab-card">
            <div className="ab-card-stage">
              <WristStage settings={settings} />
            </div>
            <div className="ab-card-copy">
              <strong>On your wrist</strong>
              <span>A watch face that is a little different every time you look.</span>
            </div>
          </article>
          <article className="ab-card ab-card-wide">
            <div className="ab-card-stage">
              <TabletStage settings={settings} />
            </div>
            <div className="ab-card-copy">
              <strong>On the shelf</strong>
              <span>A tablet on a stand as a digital frame, matted like a print.</span>
            </div>
          </article>
        </div>
      </section>

      <section className="ab-plans">
        {PLANS.map((plan, i) => (
          <div key={plan.name} className="ab-plan" data-featured={i === 1}>
            <span className="ab-plan-name">{plan.name}</span>
            <span className="ab-plan-price">{plan.price}</span>
            <span className="ab-plan-note">{plan.note}</span>
          </div>
        ))}
      </section>

      <footer className="ab-foot">
        <span>Ambient is a fictional service. Every screen on this page is a live mockup redrawing a generative pattern.</span>
        <Link href="/docs">Read the react-3d-mockups docs →</Link>
      </footer>
    </main>
  )
}
