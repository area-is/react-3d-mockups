import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, defineDocs } from 'fumadocs-mdx/config'
import { pageSchema } from 'fumadocs-core/source/schema'
import { z } from 'zod'

/**
 * Each page's last commit date, as `page.data.lastModified` - the sitemap's
 * `lastmod`.
 *
 * Resolved here, while the MDX compiles, because this is the one place that
 * reliably has git: the Worker serves the sitemap by running its route per
 * request, with no repository and no child processes, so a date computed in
 * the route itself came out as the time of the request on every fetch. Here it
 * is baked into the compiled page.
 *
 * One `git log` for the whole repository; the first time a file appears
 * walking back from HEAD is its last change. Commits that exist only because a
 * shallow clone was cut there are skipped: the boundary commit has no parent
 * to diff against, so it lists every file as changed that day, and a CI clone
 * of depth 1 would otherwise stamp every page with the latest commit's date.
 * A page with no known date gets none - better no `lastmod` than a wrong one.
 */
let commitDates: Promise<Map<string, Date>> | undefined
function gitCommitDates(): Promise<Map<string, Date>> {
  commitDates ??= Promise.resolve().then(() => {
    const dates = new Map<string, Date>()
    try {
      const git = (args: string[]) =>
        execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20 })
      const root = git(['rev-parse', '--show-toplevel']).trim()
      const shallow = resolve(git(['rev-parse', '--git-path', 'shallow']).trim())
      const boundaries = new Set(existsSync(shallow) ? readFileSync(shallow, 'utf8').split('\n') : [])
      const log = git(['-c', 'core.quotepath=off', 'log', '--format=%x00%H %cI', '--name-only'])
      for (const entry of log.split('\0')) {
        const [head = '', ...files] = entry.trim().split('\n')
        const [hash = '', iso] = head.split(' ')
        if (!iso || boundaries.has(hash)) continue
        const date = new Date(iso)
        if (Number.isNaN(date.getTime())) continue
        for (const file of files) {
          const path = resolve(root, file)
          if (file && !dates.has(path)) dates.set(path, date)
        }
      }
    } catch {
      // No git, or no history: no dates at all.
    }
    return dates
  })
  return commitDates
}

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    /*
     * `keywords` are extra search terms for a page: the spellings people type
     * that its title does not contain ("nextjs" for "Next.js and SSR"). The
     * search route indexes them and ranks a page whose title or keywords match
     * the whole query above pages that only mention it in passing - see
     * app/api/search/route.ts. The per-model API pages take theirs from
     * lib/mockup-catalog.mjs instead, because the device pages are generated
     * (scripts/generate-variant-pages.mjs) and would lose frontmatter edits.
     */
    schema: pageSchema.extend({
      keywords: z.array(z.string()).optional(),
    }),
    // Exposes `page.data.getText('processed')` - the Markdown behind
    // /llms-full.txt. Plain headings: the `[#id]` suffixes are for the site,
    // not for a reader. (The live-demo tags are stripped in that route -
    // remark-llms ignores a `filterElement` passed here.)
    postprocess: { includeProcessedMarkdown: { headingIds: false } },
    lastModified: async (filePath) => (await gitCommitDates()).get(resolve(filePath)),
  },
})

export default defineConfig()
