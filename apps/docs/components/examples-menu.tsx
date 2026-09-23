'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { SITE_EXAMPLE_GROUPS } from './site-examples'
import { asset } from '@/lib/base-path.mjs'

/**
 * "Examples" header dropdown: the standalone example pages, a column per use
 * case (see site-examples.ts for why), each row a glimpse of the page beside
 * its name. The glimpses are `npm run example-thumbs`, a few KB each, and the
 * menu only renders when it is open, so a visitor who never opens it never
 * fetches them.
 */
export function ExamplesMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('pointerdown', close)
    return () => window.removeEventListener('pointerdown', close)
  }, [open])

  return (
    <span className="nav-menu" data-open={open} ref={ref}>
      <button
        type="button"
        className="nav-menu-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        Examples
        {/* Drawn rather than typed: the glyph this replaces was a literal ▼,
            which renders at whatever weight and baseline the fallback font
            happens to have. The icon also turns over when the menu opens, so
            the button says which way it will go. */}
        <ChevronDown className="nav-menu-caret" size={14} strokeWidth={2} aria-hidden />
      </button>
      {open ? (
        <span className="nav-menu-pop" role="menu">
          {SITE_EXAMPLE_GROUPS.map((group) => (
            // The heading is for the eye; the group's label is what a screen
            // reader announces on entering it, so the heading itself is hidden
            // rather than read twice.
            <span key={group.label} className="nav-menu-group" role="group" aria-label={group.label}>
              <span className="nav-menu-heading" aria-hidden>
                {group.label}
              </span>
              {group.examples.map((example) => (
                <Link
                  key={example.href}
                  href={example.href}
                  className="nav-menu-item"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  <img
                    className="nav-menu-thumb"
                    src={asset(`/examples/${example.slug}.webp`)}
                    alt=""
                    width="96"
                    height="60"
                    decoding="async"
                  />
                  {example.title}
                </Link>
              ))}
            </span>
          ))}
        </span>
      ) : null}
    </span>
  )
}
