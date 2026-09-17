import type { NextConfig } from 'next'
import { createMDX } from 'fumadocs-mdx/next'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
import { BASE_PATH } from './lib/base-path.mjs'

const nextConfig: NextConfig = {
  // Compile the workspace package (and keep HMR working against its dist output).
  transpilePackages: ['react-3d-mockups'],
  /*
   * The site is served at a path on the apex, not on its own hostname, so the
   * Worker only ever sees requests under this prefix. `basePath` is what makes
   * Next emit its own URLs - link hrefs, router navigations, `/_next/*`, route
   * handlers - underneath it. Everything the repo hard-codes instead goes
   * through `asset()` from the same module; see the note there.
   */
  basePath: BASE_PATH,

  /*
   * Send anything outside the prefix to its place under it.
   *
   * On the apex this never fires: the Worker's routes are the prefix, so a
   * request for `/` is the apex app's and never reaches us. A Workers preview
   * URL is a whole hostname, though - Workers Builds publishes one per commit
   * and the PR comment links it - and there the site's own root answers 404,
   * which reads as a broken deploy rather than as a site mounted one level
   * down. `basePath` is inlined into the client bundle at build time and
   * cannot vary per host, so the only place to reconcile the two is the
   * request: redirect the unprefixed path to the prefixed one.
   *
   * `basePath: false` is what stops Next prefixing these `source`s for us,
   * which would make them match the prefixed paths they redirect TO.
   */
  async redirects() {
    return [
      { source: '/', destination: BASE_PATH, basePath: false, permanent: false },
      {
        /*
         * Everything else, deep links included. The lookahead is the loop
         * guard: without it this matches its own destination. It tests for the
         * prefix as a whole segment, so `/react-3d-mockups-elsewhere` is still
         * somebody else's path and gets moved under ours like anything else.
         *
         * The destination spells the parameter out as `:path(.*)` rather than
         * `:path`, which reads redundant and is not: the Worker's adapter
         * compiles the destination with path-to-regexp, where a bare `:path`
         * is one segment and refuses a value with slashes in it - so a
         * one-segment `/docs` redirected and `/docs/api/milk-carton` fell
         * through to a 404. `next start` is forgiving enough not to show it,
         * which is exactly why it is written down here.
         */
        source: `/:path((?!${BASE_PATH.slice(1)}(?:/|$)).*)`,
        destination: `${BASE_PATH}/:path(.*)`,
        basePath: false,
        permanent: false,
      },
    ]
  },
}

const withMDX = createMDX()

// Makes `next dev` see the same Cloudflare env the deployed Worker gets, so a
// binding added to wrangler.jsonc works in dev without a separate code path.
// No-op in `next build` and in the Worker itself.
void initOpenNextCloudflareForDev()

export default withMDX(nextConfig)
