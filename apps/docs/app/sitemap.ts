import type { MetadataRoute } from 'next'
import { source } from '@/lib/source'
import { SITE_URL } from '@/lib/site'
import { SITE_EXAMPLES } from '@/components/site-examples'

/** What `lastModified` falls back to when git cannot say. */
const BUILD_TIME = new Date()

/**
 * The last commit date of every file under the given paths, keyed by path
 * relative to the app directory (`content/docs/quick-start.mdx`).
 *
 * One `git log` for the lot rather than one per page: the first time a path
 * appears walking back from HEAD is its last change. Commits git only has
 * because a shallow clone was cut there are skipped - the boundary commit
 * has no parent to diff against, so it claims every file it contains as
 * changed that day, which would stamp every untouched page with the date the
 * clone happened to start at. Those files fall back to the build time.
 *
 * Returns an empty map, never throws, when there is no git (a tarball
 * checkout, a runtime without child processes): the sitemap is worth more
 * with a build-time date than not built at all. The node modules are loaded
 * inside the `try` for the same reason - the file is also bundled for the
 * Worker, where the sitemap is served prerendered and this never runs.
 */
async function lastCommitDates(paths: string[]): Promise<Map<string, Date>> {
  const dates = new Map<string, Date>()
  try {
    const { execFileSync } = await import('node:child_process')
    const { existsSync, readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const cwd = process.cwd()
    const git = (args: string[]) =>
      execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20 })

    const shallowFile = resolve(cwd, git(['rev-parse', '--git-path', 'shallow']).trim())
    const boundaries = new Set(existsSync(shallowFile) ? readFileSync(shallowFile, 'utf8').split('\n') : [])

    // `--relative` prints paths relative to the app directory, matching the
    // pathspecs, which git also reads relative to `cwd`.
    const log = git(['log', '--format=%x00%H %cI', '--name-only', '--relative', '--', ...paths])
    for (const entry of log.split('\0')) {
      const [head, ...files] = entry.trim().split('\n')
      const [hash, iso] = head.split(' ')
      if (!iso || boundaries.has(hash)) continue
      const date = new Date(iso)
      if (Number.isNaN(date.getTime())) continue
      for (const file of files) {
        if (file && !dates.has(file)) dates.set(file, date)
      }
    }
  } catch {
    // No git, not a repository, or no history: every page gets BUILD_TIME.
  }
  return dates
}

/** The newest of the dates for these files, or of any file under a `dir/`. */
function newest(dates: Map<string, Date>, targets: string[]): Date {
  let latest: Date | undefined
  for (const [file, date] of dates) {
    const hit = targets.some((t) => (t.endsWith('/') ? file.startsWith(t) : file === t))
    if (hit && (!latest || date > latest)) latest = date
  }
  return latest ?? BUILD_TIME
}

/**
 * Every indexable route.
 *
 * The ~50 per-mockup API pages are the reason this file exists: they are
 * deliberately kept out of the sidebar tree and are only reachable through
 * client-rendered grids, so a crawler following links alone finds few of them.
 * `source.getPages()` enumerates them from the same content collection the
 * pages themselves are built from, so the sitemap cannot drift.
 *
 * `lastModified` is each page's own last commit: the MDX file for a docs
 * page, the example's folder for an example, the page and its carousel for
 * the home page. A single build date on every URL tells a crawler nothing,
 * and it has to recrawl everything to find the one page that changed.
 *
 * `/harness` and `/embedded` are excluded here and disallowed in robots.ts -
 * they are tooling and an iframe target, not pages.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dates = await lastCommitDates(['content/docs', 'app', 'components'])

  const home = {
    url: SITE_URL,
    lastModified: newest(dates, ['app/(site)/page.tsx', 'components/hero-carousel.tsx']),
    changeFrequency: 'weekly' as const,
    priority: 1,
  }

  const examples = SITE_EXAMPLES.map((example) => ({
    url: `${SITE_URL}${example.href}`,
    lastModified: newest(dates, [`app/examples/${example.slug}/`]),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const docs = source.getPages().map((page) => ({
    url: `${SITE_URL}${page.url}`,
    lastModified: newest(dates, [`content/docs/${page.path}`]),
    changeFrequency: 'weekly' as const,
    priority: page.url === '/docs' ? 0.9 : 0.6,
  }))

  return [home, ...examples, ...docs]
}
