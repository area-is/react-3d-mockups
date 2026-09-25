import type { Metadata, Viewport } from 'next'
import { SITE_URL, pageMetadata } from '@/lib/site'

/**
 * An example page's metadata: its title and description, plus the canonical
 * link, `og:url` and social cards every other page on the site carries.
 *
 * `metadataBase` is set here rather than inherited because each example is
 * its own root layout - there is no parent above it that could set it - and
 * without one a relative canonical does not resolve against the site at all.
 */
export function exampleMetadata(slug: string, { title, description }: { title: string; description: string }): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    ...pageMetadata({ path: `/examples/${slug}`, title, description }),
  }
}

/**
 * The browser chrome matches the example bar at the top (`.ex-bar` in
 * example-bar.css), not the example, so the two read as one frame.
 */
export const EXAMPLE_VIEWPORT: Viewport = {
  themeColor: '#111318',
}
