'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { SceneBoundary } from '@/components/scene-boundary'
import { TabbiedLink } from '../_shared/badge'
import { lazyScene } from '../_shared/stage'
import dynamic from 'next/dynamic'
import {
  CUSTOMER,
  DEFAULT_SPEC,
  PRINTS,
  QUANTITIES,
  STOCKS,
  STYLES,
  areaM2,
  clampSize,
  eur,
  find,
  priceOf,
  type Size,
  type Spec,
} from './packaging-data'

const BoxStage = dynamic(() => import('./packaging-scenes').then((m) => m.BoxScene), {
  ssr: false,
  loading: () => <div className="ex-loading">Warming up the GPU…</div>,
})
const PanelStage = lazyScene<{ spec: Spec }>(() => import('./packaging-scenes').then((m) => m.PanelScene))

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="pk-field">
      <legend className="pk-field-label">
        {label}
        {hint ? <span>{hint}</span> : null}
      </legend>
      {children}
    </fieldset>
  )
}

const DIMS: { key: keyof Size; label: string }[] = [
  { key: 'width', label: 'Width' },
  { key: 'height', label: 'Height' },
  { key: 'depth', label: 'Depth' },
]

/**
 * Carton & Co's configurator. A box is a `Spec` - style, millimetres,
 * stock, print, quantity - and the model on the left is that spec: the
 * sliders change real dimensions and the mockup rebuilds its geometry to
 * them, which is what "made to your millimetre" means when the mockup
 * takes millimetres.
 */
export function Packaging() {
  const [spec, setSpec] = useState<Spec>(DEFAULT_SPEC)
  const style = find(STYLES, spec.style)
  const price = priceOf(spec)
  const set = (patch: Partial<Spec>) => setSpec((s) => ({ ...s, ...patch }))
  const setDim = (key: keyof Size, value: number) => setSpec((s) => ({ ...s, size: { ...s.size, [key]: value } }))

  return (
    <main className="pk">
      <header className="pk-top">
        <span className="pk-brand">
          <span className="pk-brand-mark" aria-hidden />
          Carton &amp; Co
        </span>
        <nav className="pk-nav" aria-label="Site">
          <span className="is-active">Configure</span>
          <span>Materials</span>
          <span>Print</span>
          <span>Samples</span>
        </nav>
        <div className="pk-top-right">
          <span className="pk-cta">Talk to a packer</span>
        </div>
      </header>

      <section className="pk-hero">
        <div className="pk-stage">
          <div className="pk-stage-bleed">
            <SceneBoundary>
              <BoxStage spec={spec} />
            </SceneBoundary>
          </div>
          <div className="pk-readout" aria-live="polite">
            <strong>
              {spec.size.width} × {spec.size.height} × {spec.size.depth} mm
            </strong>
            <span>
              {style.label} · {areaM2(spec.size).toFixed(3)} m² of {find(STOCKS, spec.stock).label.toLowerCase()}
            </span>
          </div>
        </div>

        <div className="pk-config">
          <p className="pk-eyebrow">Boxes made to your millimetre</p>
          <h1>Size it. See it.</h1>
          <p className="pk-lede">
            Three box styles, three boards, any dimensions between a ring box and a wine case. The proof on the left is
            built from your numbers, so what you see is the box that arrives.
          </p>

          <Field label="Style">
            <div className="pk-styles" role="group" aria-label="Box style">
              {STYLES.map((s) => (
                <button key={s.id} type="button" className="pk-style" aria-pressed={s.id === spec.style} onClick={() => set({ style: s.id, size: clampSize(spec.size, s.id) })}>
                  <strong>{s.label}</strong>
                  <span>{s.note}</span>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Size" hint={`${style.min.width}–${style.max.width} mm wide for this style`}>
            <div className="pk-sliders">
              {DIMS.map(({ key, label }) => (
                <label key={key} className="pk-slider">
                  <span className="pk-slider-label">
                    {label}
                    <output>{spec.size[key]} mm</output>
                  </span>
                  <input
                    type="range"
                    min={style.min[key]}
                    max={style.max[key]}
                    step={5}
                    value={spec.size[key]}
                    onChange={(e) => setDim(key, Number(e.target.value))}
                  />
                </label>
              ))}
            </div>
          </Field>

          <div className="pk-row">
            <Field label="Board">
              <div className="pk-stocks" role="group" aria-label="Board">
                {STOCKS.map((s) => (
                  <button key={s.id} type="button" className="pk-stock" aria-pressed={s.id === spec.stock} aria-label={s.label} title={s.label} onClick={() => set({ stock: s.id })}>
                    <span style={{ background: s.color }} />
                    {s.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Quantity">
              <div className="pk-seg" role="group" aria-label="Quantity">
                {QUANTITIES.map((q) => (
                  <button key={q} type="button" aria-pressed={q === spec.quantity} onClick={() => set({ quantity: q })}>
                    {q.toLocaleString('en-US')}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <Field label="Print">
            <div className="pk-seg pk-seg-tall" role="group" aria-label="Print">
              {PRINTS.map((p) => (
                <button key={p.id} type="button" aria-pressed={p.id === spec.print} onClick={() => set({ print: p.id })}>
                  {p.label}
                  <small>{p.note}</small>
                </button>
              ))}
            </div>
          </Field>

          <div className="pk-estimate">
            <div className="pk-estimate-price">
              <strong>{eur(price.each)}</strong>
              <span>per box · {eur(price.total, 0)} for {spec.quantity.toLocaleString('en-US')}</span>
            </div>
            <button type="button" className="pk-btn">
              Request a sample
            </button>
          </div>
          <p className="pk-note">
            The artwork on the proof is {CUSTOMER.name}&rsquo;s, a ceramics studio: a <TabbiedLink /> pattern in one ink,
            chosen dark or light for the board. Drag the box to see every face.
          </p>
        </div>
      </section>

      <section className="pk-panel">
        <div className="pk-panel-stage">
          <PanelStage spec={spec} />
        </div>
        <div className="pk-panel-copy">
          <h2>The same artwork, on the counter</h2>
          <p>
            A 600 × 400 mm display board in the board you chose, with the print you chose. Any panel, any size, the
            same way: give it millimetres.
          </p>
          <span className="pk-panel-price">From {eur(14)} each</span>
        </div>
      </section>

      <footer className="pk-foot">
        <span>Carton &amp; Co is a fictional supplier. The boxes are real geometry, rebuilt from millimetres as you move the sliders.</span>
        <Link href="/docs">Read the react-3d-mockups docs →</Link>
      </footer>
    </main>
  )
}
