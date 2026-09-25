'use client'

import { useRef, useState, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Download, Shuffle } from 'lucide-react'
import { TabbiedPattern, type TabbiedPatternHandle } from 'tabbied/react'
import { LazyScene } from '@/components/lazy-scene'
import { SceneBoundary } from '@/components/scene-boundary'
import { TabbiedLink } from '../_shared/badge'
import {
  BLEEDS,
  DEFAULT_ORDER,
  DESIGNS,
  FRAMES,
  INKS,
  MATS,
  SIZES,
  find,
  newSeed,
  priceOf,
  type Order,
} from './print-shop-art'

// WebGL only exists in the browser, so the scenes skip SSR. The controls
// around them render on the server like any other product page.
const Scene = dynamic(() => import('./print-shop-scene'), {
  ssr: false,
  loading: () => <div className="ps-loading">Warming up the GPU…</div>,
})
const ToteScene = dynamic(() => import('./print-shop-extras').then((m) => m.ToteScene), { ssr: false })
const CardScene = dynamic(() => import('./print-shop-extras').then((m) => m.CardScene), { ssr: false })

/** One group of choices. A `fieldset`, so the label and its buttons read as one control. */
function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="ps-field">
      <legend className="ps-field-label">
        {label}
        {hint ? <span className="ps-field-hint">{hint}</span> : null}
      </legend>
      {children}
    </fieldset>
  )
}

/**
 * The shop page: the framed print on the left, the configurator on the right.
 *
 * The state is one `Order`, held here and handed to every scene on the page.
 * The controls are ordinary buttons in the page rather than anything on the
 * sheet, because mockup surfaces are display-only by design - the canvas
 * owns every gesture so the frame can be turned - and a shop's controls
 * belong beside the product anyway.
 */
export function PrintShop() {
  const [order, setOrder] = useState<Order>(DEFAULT_ORDER)
  const [bag, setBag] = useState(0)
  const [note, setNote] = useState<string | null>(null)
  const artRef = useRef<TabbiedPatternHandle>(null)

  const design = find(DESIGNS, order.design)
  const ink = find(INKS, order.ink)
  const set = (patch: Partial<Order>) => setOrder((o) => ({ ...o, ...patch }))

  /**
   * The proof is the actual `<css-doodle>` on the sheet, exported as native
   * vector SVG - the same composition the customer is looking at in the
   * frame, at any resolution. Tabbied loads its converter on demand, so the
   * page pays nothing for the feature until somebody uses it.
   */
  const downloadProof = async () => {
    const handle = artRef.current
    if (!handle) {
      setNote('The sheet is still rendering - try again in a moment.')
      return
    }
    try {
      const { warnings } = await handle.exportSvg({ download: true, name: `grid-editions-${design.id}-${order.seed}` })
      setNote(warnings.length ? 'Proof saved. Some effects went out as SVG filters.' : `Proof saved: ${design.name}, No. ${order.seed}, as SVG.`)
    } catch {
      setNote('This design could not be exported just now.')
    }
  }

  return (
    <main className="ps">
      <header className="ps-top">
        <span className="ps-brand">
          <span className="ps-brand-mark" aria-hidden />
          Grid Editions
        </span>
        <nav className="ps-nav" aria-label="Shop">
          <span className="ps-nav-link is-active">Prints</span>
          <span className="ps-nav-link">Editions</span>
          <span className="ps-nav-link">Studio</span>
        </nav>
        <div className="ps-top-right">
          <span className="ps-bag" aria-live="polite">
            Bag · {bag}
          </span>
        </div>
      </header>

      <section className="ps-hero">
        <div className="ps-stage">
          {/* The canvas bleeds past its box so the frame is never cut off by
              the canvas edge while it floats or turns; the box's `overflow:
              clip` does the visible cropping. */}
          <div className="ps-stage-bleed">
            <SceneBoundary>
              <Scene order={order} artRef={artRef} />
            </SceneBoundary>
          </div>
          <p className="ps-stage-hint">Shown with a hardback for scale · drag to turn, pinch to zoom</p>
        </div>

        <div className="ps-config">
          <p className="ps-eyebrow">Made to order · Edition of one</p>
          <h1 className="ps-title">{design.name}</h1>
          <p className="ps-lede">
            {design.blurb} Choose an ink set, shuffle the composition until it is the one, and we plot it on
            310 gsm cotton rag and frame it by hand.
          </p>

          <Field label="Design">
            <div className="ps-designs" role="group" aria-label="Design">
              {DESIGNS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className="ps-design"
                  aria-pressed={d.id === order.design}
                  onClick={() => set({ design: d.id })}
                >
                  {/* A chip is the design at its coarsest grid in the current
                      ink set, so the swatches recolour with the print. */}
                  <span className="ps-design-chip" style={{ background: ink.tone.ground }}>
                    <TabbiedPattern pattern={d.pattern} seed="chip" palette={ink.tone.palette} options={{ grid: '2x3' }} fit="cover" />
                  </span>
                  <span className="ps-design-name">{d.name}</span>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Ink set">
            <div className="ps-inks" role="group" aria-label="Ink set">
              {INKS.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  className="ps-ink"
                  aria-pressed={i.id === order.ink}
                  aria-label={i.name}
                  title={i.name}
                  onClick={() => set({ ink: i.id })}
                >
                  <span className="ps-ink-dots" style={{ background: i.tone.ground }}>
                    {i.tone.palette.slice(1, 4).map((c, n) => (
                      <span key={n} style={{ background: c }} />
                    ))}
                  </span>
                  <span className="ps-ink-name">{i.name}</span>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Size">
            <div className="ps-seg" role="group" aria-label="Size">
              {SIZES.map((s) => (
                <button key={s.id} type="button" aria-pressed={s.id === order.size} onClick={() => set({ size: s.id })}>
                  {s.label}
                  <span className="ps-seg-sub">${s.price}</span>
                </button>
              ))}
            </div>
          </Field>

          <div className="ps-field-row">
            <Field label="Frame">
              <div className="ps-frames" role="group" aria-label="Frame">
                {FRAMES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className="ps-frame"
                    aria-pressed={f.id === order.frame}
                    aria-label={f.label}
                    title={f.label}
                    onClick={() => set({ frame: f.id })}
                  >
                    <span className="ps-frame-swatch" style={{ background: f.color }} />
                    <span className="ps-frame-name">{f.label}</span>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Mat">
              <div className="ps-seg" role="group" aria-label="Mat">
                {MATS.map((m) => (
                  <button key={m.id} type="button" aria-pressed={m.id === order.mat} onClick={() => set({ mat: m.id })}>
                    {m.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="ps-field-row">
            <Field label="Print">
              <div className="ps-seg" role="group" aria-label="Print">
                {BLEEDS.map((b) => (
                  <button key={b.id} type="button" aria-pressed={b.id === order.bleed} onClick={() => set({ bleed: b.id })}>
                    {b.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Composition" hint="the seed is the edition number">
              <div className="ps-seed-row">
                <code className="ps-seed">No. {order.seed}</code>
                <button type="button" className="ps-shuffle" onClick={() => set({ seed: newSeed() })}>
                  <Shuffle size={15} strokeWidth={2.2} aria-hidden />
                  Shuffle
                </button>
              </div>
            </Field>
          </div>

          <div className="ps-buy">
            <span className="ps-price">
              ${priceOf(order)}
              <span className="ps-price-sub">framed, shipped in 5 days</span>
            </span>
            <button
              type="button"
              className="ps-btn"
              onClick={() => {
                setBag((n) => n + 1)
                setNote(`Added ${design.name} No. ${order.seed} to your bag.`)
              }}
            >
              Add to bag
            </button>
            <button type="button" className="ps-btn-ghost" onClick={downloadProof}>
              <Download size={15} strokeWidth={2.2} aria-hidden />
              Download proof (SVG)
            </button>
          </div>
          <p className="ps-note" role="status" aria-live="polite">
            {note ?? ' '}
          </p>
        </div>
      </section>

      <section className="ps-also">
        <div className="ps-also-head">
          <h2>The same edition, on other things</h2>
          <p>
            One React component draws the picture; the sheet, the tote and the card all render it. Change anything
            above and every surface on this page reprints together.
          </p>
        </div>
        <div className="ps-also-grid">
          <article className="ps-also-card">
            <div className="ps-also-stage">
              <LazyScene>
                <ToteScene order={order} />
              </LazyScene>
            </div>
            <div className="ps-also-meta">
              <strong>Tote bag</strong>
              <span>Natural kraft · $28</span>
            </div>
          </article>
          <article className="ps-also-card">
            <div className="ps-also-stage">
              <LazyScene>
                <CardScene order={order} />
              </LazyScene>
            </div>
            <div className="ps-also-meta">
              <strong>Folded card</strong>
              <span>Set of six, blank inside · $16</span>
            </div>
          </article>
        </div>
      </section>

      <footer className="ps-foot">
        <span>
          Grid Editions is a fictional shop. The prints are real: every one is a <TabbiedLink /> pattern rendered live.
        </span>
        <Link href="/docs">Read the react-3d-mockups docs →</Link>
      </footer>
    </main>
  )
}
