import { SITE_URL } from '@/lib/site'
import { absoluteUrl, pagesInOrder, type DocsPage } from '@/lib/source'

/*
 * /llms-full.txt: every docs page as Markdown, in sidebar order, in one file -
 * the companion to /llms.txt for tools that want the whole text at once.
 *
 * The Markdown is Fumadocs' processed output (`postprocess.includeProcessedMarkdown`
 * in source.config.ts), with the live-demo tags taken out and root-relative
 * links made absolute, since this file is read far away from the site it
 * describes. Static - it only changes when the content does.
 */
export const dynamic = 'force-static'

/**
 * The live demos - a prop explorer, a 3D scene, the gallery grid - as tags
 * they say nothing to someone reading text, so they go. Their text-bearing
 * neighbours (`<Card>`, `<Callout>`) stay.
 */
const LIVE_DEMO = /^[ \t]*<(?:MockupExplorer|BareVsMockup|ImageDemo|ModelGallery)\b[\s\S]*?\/>[ \t]*\n?/gm

/** `](/docs/x)` and `href="/docs/x"` -> the published address. */
const absoluteLinks = (markdown: string) =>
  markdown.replace(/\]\(\/(?!\/)/g, `](${SITE_URL}/`).replace(/href="\/(?!\/)/g, `href="${SITE_URL}/`)

async function pageText(page: DocsPage) {
  const body = absoluteLinks((await page.data.getText('processed')).replace(LIVE_DEMO, ''))
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  const description = page.data.description ? `\n\n> ${page.data.description}` : ''
  return `# ${page.data.title}\n\nURL: ${absoluteUrl(page.url)}${description}\n\n${body}`
}

export async function GET() {
  const pages = await Promise.all(pagesInOrder().map(pageText))
  return new Response(`${pages.join('\n\n---\n\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
