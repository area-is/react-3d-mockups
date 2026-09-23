import { defineConfig, defineDocs } from 'fumadocs-mdx/config'
import { pageSchema } from 'fumadocs-core/source/schema'
import { z } from 'zod'

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
  },
})

export default defineConfig()
