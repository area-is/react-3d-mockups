import type * as PageTree from 'fumadocs-core/page-tree'
import { absoluteUrl, source } from '@/lib/source'
import { DEVICES, OBJECTS } from '@/lib/mockup-catalog.mjs'

/*
 * /llms.txt (https://llmstxt.org): an index of every docs page - title,
 * absolute URL, one-line description - grouped the way the sidebar groups
 * them, for tools that read documentation on a user's behalf. The full text
 * of every page is at /llms-full.txt.
 *
 * Built from the full page tree, not the sidebar's filtered one: the
 * per-model pages the sidebar reaches through its thumbnail grids are listed
 * here like any other page. Static - it only changes when the content does.
 */
export const dynamic = 'force-static'

const HEADER = `# react-3d-mockups

> 3D device and object mockups for React, rendered with three.js and react-three-fiber. Your content - React components, images, video, iframes - renders as live DOM on the screen or printable surface of a procedurally generated model: ${DEVICES.length} devices (phones, foldables, tablets, laptops, watches, a monitor) and ${OBJECTS.length} objects (print, packaging, out-of-home, vehicles, a TV, custom-size panels and boxes).

Install with \`npm install react-3d-mockups three @react-three/fiber @react-three/drei\` (React 19). Screens are display-only: content renders live, but pointer input goes to the orbit controls, never to the screen. WebGL only exists in the browser, so SSR frameworks load mockups client side. The full text of every page below is at ${absoluteUrl('/llms-full.txt')}.`

function item(url: string) {
  const page = source.getPages().find((p) => p.url === url)
  if (!page) return undefined
  const description = page.data.description?.trim()
  const link = `[${page.data.title}](${absoluteUrl(page.url)})`
  return description ? `- ${link}: ${description}` : `- ${link}`
}

export function GET() {
  const out: string[] = [HEADER]
  const walk = (nodes: PageTree.Node[], depth: number) => {
    for (const node of nodes) {
      if (node.type === 'separator') {
        out.push('', `${'#'.repeat(depth)} ${typeof node.name === 'string' ? node.name : ''}`.trimEnd(), '')
      } else if (node.type === 'page') {
        const line = item(node.url)
        if (line) out.push(line)
      } else if (node.type === 'folder') {
        if (node.index) {
          const line = item(node.index.url)
          if (line) out.push(line)
        }
        // A folder's own separators ("Devices", "Objects") sit one level down.
        walk(node.children, depth + 1)
      }
    }
  }
  walk(source.getPageTree().children, 2)
  return new Response(`${out.join('\n').replace(/\n{3,}/g, '\n\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
