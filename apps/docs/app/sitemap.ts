import type { MetadataRoute } from 'next'
import { source } from '@/lib/source'
import { SITE_URL } from '@/lib/site'
import { SITE_EXAMPLES } from '@/components/site-examples'

/**
 * Every indexable route.
 *
 * The ~50 per-mockup API pages are the reason this file exists: they are
 * deliberately kept out of the sidebar tree and are only reachable through
 * client-rendered grids, so a crawler following links alone finds few of them.
 * `source.getPages()` enumerates them from the same content collection the
 * pages themselves are built from, so the sitemap cannot drift.
 *
 * `lastModified` is each docs page's own last commit, resolved while its MDX
 * compiles (see `lastModified` in source.config.ts) - not here, because the
 * Worker runs this route per request with no git, and a date computed at
 * request time told crawlers every page had changed on every fetch. The home
 * page and the examples carry no date: better none than a wrong one.
 *
 * `/harness` and `/embedded` are excluded here and disallowed in robots.ts -
 * they are tooling and an iframe target, not pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const home = {
    url: SITE_URL,
    changeFrequency: 'weekly' as const,
    priority: 1,
  }

  const examples = SITE_EXAMPLES.map((example) => ({
    url: `${SITE_URL}${example.href}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const docs = source.getPages().map((page) => ({
    url: `${SITE_URL}${page.url}`,
    ...(page.data.lastModified ? { lastModified: page.data.lastModified } : {}),
    changeFrequency: 'weekly' as const,
    priority: page.url === '/docs' ? 0.9 : 0.6,
  }))

  return [home, ...examples, ...docs]
}
