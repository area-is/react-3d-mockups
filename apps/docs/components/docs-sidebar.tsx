'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type * as PageTree from 'fumadocs-core/page-tree'
import { SidebarSeparator, useFolderDepth } from 'fumadocs-ui/components/sidebar/base'
import { CATEGORIES, DEVICES, OBJECTS } from '@/lib/mockup-catalog.mjs'

interface CatalogEntry {
  id: string
  label: string
  href: string
  thumb: string
  category: string
}

/**
 * A section's entries under the gallery's categories, in the gallery's order.
 *
 * Twenty-odd devices in one undivided grid meant scanning every tile for the
 * one tablet; under "Phones", "Foldables", "Tablets" the eye goes straight to
 * the row. Same names as the gallery's filter chips, so the two agree.
 */
function byCategory(entries: CatalogEntry[]): [string, CatalogEntry[]][] {
  return (CATEGORIES as string[])
    .map((category): [string, CatalogEntry[]] => [category, entries.filter((e) => e.category === category)])
    .filter(([, group]) => group.length > 0)
}

const ALL: CatalogEntry[] = [...DEVICES, ...OBJECTS]

/**
 * Which categories each grid holds. By category rather than by catalog list,
 * so the TV set - an object in the catalog, a display by any other measure -
 * sits with the monitors instead of under a second "Laptops and displays"
 * heading among the print pieces.
 */
const DEVICE_CATEGORIES = new Set(['Phones', 'Foldables', 'Tablets', 'Laptops and displays', 'Wearables'])
const DEVICE_TILES = ALL.filter((e) => DEVICE_CATEGORIES.has(e.category))
const OBJECT_TILES = ALL.filter((e) => !DEVICE_CATEGORIES.has(e.category))

/**
 * The "Devices" and "Objects" sidebar sections, rendered as 2-column grids of
 * mockup screenshots - one tile per device VARIANT (the S26 and the S26 Ultra
 * each get their own) and one per object.
 *
 * Only the separator slot is overridden. The pages these grids stand in for
 * are dropped from the page tree upstream (see `hideGridPages` in
 * lib/sidebar-tree.ts), so every remaining link still renders through
 * Fumadocs' own item component and keeps its stock styling.
 */

/** Pages the grids cover; the tree filter reads the same set. */
export const GRID_URLS: string[] = [...DEVICES, ...OBJECTS].map((e: CatalogEntry) => e.href)

/**
 * Fumadocs styles its sidebar separators in a module-private component
 * (`layouts/docs/slots/sidebar.tsx`), so the class list is mirrored here to
 * keep "Devices" and "Objects" in the same voice as "Guides".
 */
const SEPARATOR_CLASS =
  'inline-flex items-center gap-2 mb-1 px-2 mt-6 empty:mb-0 [&_svg]:size-4 [&_svg]:shrink-0'

/** Matches Fumadocs' own per-depth indent for sidebar rows. */
function useItemOffset() {
  const depth = useFolderDepth()
  return { paddingInlineStart: `calc(${2 + 3 * depth} * var(--spacing))` }
}

function GridSection({ label, entries }: { label: string; entries: CatalogEntry[] }) {
  const pathname = usePathname()
  const style = useItemOffset()
  return (
    <>
      <SidebarSeparator className={`${SEPARATOR_CLASS} w-full justify-between`} style={style}>
        {label}
        <span className="text-xs tabular-nums">{entries.length}</span>
      </SidebarSeparator>
      <div className="mockup-grid">
        {byCategory(entries).map(([category, group]) => (
          <Fragment key={category}>
            <span className="mockup-grid-heading">{category}</span>
            {group.map((e) => (
              <Link key={e.id} href={e.href} className="mockup-tile" data-active={pathname === e.href}>
                <span className="mockup-tile-thumb">
                  {/* Pre-rendered shot of the real WebGL mockup (scripts/generate-thumbs.mjs). */}
                  <img src={e.thumb} alt="" loading="lazy" width="120" height="62" />
                </span>
                <span className="mockup-tile-label">{e.label}</span>
              </Link>
            ))}
          </Fragment>
        ))}
      </div>
    </>
  )
}

export function DocsSidebarSeparator({ item }: { item: PageTree.Separator }) {
  const style = useItemOffset()
  const label = typeof item.name === 'string' ? item.name : undefined
  if (label === 'Devices') return <GridSection label="Devices" entries={DEVICE_TILES} />
  if (label === 'Objects') return <GridSection label="Objects" entries={OBJECT_TILES} />
  return (
    <SidebarSeparator className={`${SEPARATOR_CLASS} first:mt-0`} style={style}>
      {item.icon}
      {item.name}
    </SidebarSeparator>
  )
}
