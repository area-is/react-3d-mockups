import { createFromSource } from 'fumadocs-core/search/server'
import type { SortedResult } from 'fumadocs-core/search'
import { source } from '@/lib/source'
import { DEVICES, OBJECTS } from '@/lib/mockup-catalog.mjs'

/*
 * Docs search, with keywords.
 *
 * The stock index is full text over each page's title, description, headings
 * and paragraphs, ranked by BM25 over whichever single block matched best. Two
 * things go wrong with that on a catalog like this one:
 *
 * - a spelling the page never uses finds nothing - "nextjs" against a page
 *   titled "Next.js and SSR";
 * - a short block that happens to contain the word outranks the page that is
 *   about it - "fold" finds "Brochure (tri-fold)" before the Galaxy Z Fold,
 *   "galaxy" lands on a Galaxy Tab, "van livery" on the devices table.
 *
 * So every page carries `keywords` - frontmatter for the guides, the catalog
 * entry for the per-model pages (lib/mockup-catalog.mjs says why) - which are
 * indexed as one extra block so a query can reach the page through them, and
 * then used again to re-rank: a page whose title or keywords answer the WHOLE
 * query moves ahead of pages that only mention it. The extra block is dropped
 * from what the dialog shows; it is plumbing, not a result.
 */

interface Entry {
  href: string
  keywords: string[]
}

const CATALOG_KEYWORDS = new Map<string, string[]>(
  [...DEVICES, ...OBJECTS].map((entry: Entry) => [entry.href, entry.keywords])
)

type Page = ReturnType<typeof source.getPages>[number]

function keywordsOf(page: Page): string[] {
  return [...(page.data.keywords ?? []), ...(CATALOG_KEYWORDS.get(page.url) ?? [])]
}

/** The indexed form of a page's keywords, so the block can be recognized and hidden. */
const keywordBlock = (keywords: string[]) => keywords.join(', ')

const server = createFromSource(source, {
  language: 'english',
  buildIndex(page) {
    const data = page.data
    const structuredData = data.structuredData
    const keywords = keywordsOf(page)
    return {
      id: page.url,
      url: page.url,
      title: data.title,
      description: data.description,
      structuredData: keywords.length
        ? {
            ...structuredData,
            contents: [...structuredData.contents, { heading: undefined, content: keywordBlock(keywords) }],
          }
        : structuredData,
    }
  },
})

/** Lowercase words, punctuation dropped: "Next.js" -> ["next", "js"]. */
const words = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)

/** The same, run together: "Next.js", "next js" and "nextjs" all read "nextjs". */
const squash = (text: string) => words(text).join('')

interface Terms {
  title: string
  keywords: string[]
  block: string
}

/** Everything the ranking reads, by URL - built on first search, like the index. */
let termsByUrl: Map<string, Terms> | undefined
function terms() {
  termsByUrl ??= new Map(
    source.getPages().map((page) => {
      const keywords = keywordsOf(page)
      return [page.url, { title: page.data.title, keywords, block: keywordBlock(keywords) }]
    })
  )
  return termsByUrl
}

/**
 * How squarely a page answers the query, from its title and keywords alone:
 * 4 the title is the query, 3 a keyword is, 2 every query word is in the
 * title, 1 every query word is in the title or keywords, 0 none of those.
 */
function relevance(query: string, page: Terms | undefined): number {
  const q = words(query)
  if (!page || q.length === 0) return 0
  const whole = q.join('')
  if (squash(page.title) === whole) return 4
  if (page.keywords.some((k) => squash(k) === whole)) return 3
  const titleWords = new Set(words(page.title))
  if (q.every((w) => titleWords.has(w))) return 2
  const allWords = new Set([...titleWords, ...page.keywords.flatMap(words)])
  return q.every((w) => allWords.has(w)) ? 1 : 0
}

const unmark = (text: string) => text.replace(/<\/?mark>/g, '')

/**
 * Re-order the stock results page by page. The engine returns each page as a
 * `page` row followed by its matching blocks; the groups are kept intact and
 * sorted by `relevance`, stably, so among equals the engine's order stands.
 */
function rerank(query: string, results: SortedResult[]): SortedResult[] {
  const byUrl = terms()
  const groups: { url: string; rows: SortedResult[] }[] = []
  for (const row of results) {
    if (row.type === 'page' || groups.length === 0) groups.push({ url: row.url, rows: [] })
    const group = groups[groups.length - 1]!
    const page = byUrl.get(group.url)
    // The keyword block matched: the page row above it already says so.
    if (row.type === 'text' && row.url === group.url && page && unmark(row.content) === page.block) continue
    group.rows.push(row)
  }
  return groups
    .map((group, index) => ({ group, index, score: relevance(query, byUrl.get(group.url)) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .flatMap(({ group }) => group.rows)
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const query = params.get('query')
  if (!query) return Response.json([])
  const limit = Number(params.get('limit'))
  const results = await server.search(query, {
    tag: params.get('tag')?.split(','),
    locale: params.get('locale'),
    limit: Number.isInteger(limit) && limit > 0 ? limit : undefined,
  })
  return Response.json(rerank(query, results))
}
