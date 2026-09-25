'use client'

import Link from 'next/link'
import { useId, useState } from 'react'
import { CATEGORIES, DEVICES, OBJECTS } from '@/lib/mockup-catalog.mjs'

interface CatalogEntry {
  id: string
  label: string
  href: string
  thumb: string
  category: string
}

const MODELS: CatalogEntry[] = [...DEVICES, ...OBJECTS]
const KINDS: string[] = CATEGORIES

/**
 * Every model in the library as a thumbnail grid, filtered by kind - the
 * Gallery docs page.
 *
 * The thumbnails are the pre-rendered shots the sidebar uses
 * (scripts/generate-thumbs.mjs), so the page costs no WebGL at all: a plain
 * `<img>` each, already basePath-prefixed by the catalog, lazy below the fold.
 * The links go through next/link, which adds the prefix itself - so `href`
 * stays unprefixed.
 *
 * The chips are toggle buttons (`aria-pressed`) in a labelled group: one kind
 * at a time, pressing the pressed one again - or "All" - shows everything. The
 * count under them is a polite live region, so a screen reader hears what a
 * filter did without the focus moving.
 */
export function ModelGallery() {
  const [kind, setKind] = useState<string | null>(null)
  const labelId = useId()
  const shown = kind ? MODELS.filter((m) => m.category === kind) : MODELS
  const count = (k: string) => MODELS.filter((m) => m.category === k).length

  return (
    <div className="model-gallery not-prose">
      <div className="model-gallery-chips" role="group" aria-labelledby={labelId}>
        <span id={labelId} className="model-gallery-chips-label">
          Filter by kind
        </span>
        <button
          type="button"
          className="model-gallery-chip"
          aria-pressed={kind === null}
          onClick={() => setKind(null)}
        >
          All <span className="model-gallery-chip-count">{MODELS.length}</span>
        </button>
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            className="model-gallery-chip"
            aria-pressed={kind === k}
            onClick={() => setKind(kind === k ? null : k)}
          >
            {k} <span className="model-gallery-chip-count">{count(k)}</span>
          </button>
        ))}
      </div>

      <p className="model-gallery-status" aria-live="polite">
        {kind ? `${shown.length} of ${MODELS.length} models: ${kind}` : `All ${MODELS.length} models`}
      </p>

      <ul className="model-gallery-grid">
        {shown.map((m) => (
          <li key={m.id}>
            <Link href={m.href} className="model-gallery-card">
              <span className="model-gallery-thumb">
                {/* Decorative: the label beside it names the link. */}
                <img src={m.thumb} alt="" width={360} height={360} loading="lazy" decoding="async" />
              </span>
              <span className="model-gallery-label">{m.label}</span>
              <span className="model-gallery-kind">{m.category}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
