import { docs } from 'collections/server'
import { loader } from 'fumadocs-core/source'
import type * as PageTree from 'fumadocs-core/page-tree'
import { SITE_URL } from '@/lib/site'

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
})

export type DocsPage = ReturnType<typeof source.getPages>[number]

/** A docs URL (`/docs/...`) as the absolute address it is published at. */
export const absoluteUrl = (url: string) => `${SITE_URL}${url}`

/**
 * Every page in reading order: the sidebar's order (meta.json), including the
 * per-model pages the sidebar itself hides behind its thumbnail grids, then
 * anything the tree does not reach.
 */
export function pagesInOrder(): DocsPage[] {
  const out: DocsPage[] = []
  const seen = new Set<string>()
  const add = (url: string) => {
    const page = source.getPages().find((p) => p.url === url)
    if (page && !seen.has(url)) {
      seen.add(url)
      out.push(page)
    }
  }
  const walk = (nodes: PageTree.Node[]) => {
    for (const node of nodes) {
      if (node.type === 'page') add(node.url)
      else if (node.type === 'folder') {
        if (node.index) add(node.index.url)
        walk(node.children)
      }
    }
  }
  walk(source.getPageTree().children)
  for (const page of source.getPages()) add(page.url)
  return out
}
