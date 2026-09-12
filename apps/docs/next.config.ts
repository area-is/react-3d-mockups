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
}

const withMDX = createMDX()

// Makes `next dev` see the same Cloudflare env the deployed Worker gets, so a
// binding added to wrangler.jsonc works in dev without a separate code path.
// No-op in `next build` and in the Worker itself.
void initOpenNextCloudflareForDev()

export default withMDX(nextConfig)
