/*
 * Stands in for the docs site's `@/lib/base-path.mjs` (see remotion.config.ts).
 *
 * On the site, `asset('/art/x.webp')` prefixes the site's base path to a file
 * in `apps/docs/public`. Here the same call hands back the URL webpack gives
 * that file when it bundles it, so the docs artwork draws its own pictures
 * without a copy of them in this project's `public/`.
 */

declare const require: {
  context(directory: string, deep: boolean, filter: RegExp): { keys(): string[]; (id: string): string | { default: string } }
}

// Only the pictures the film's artwork prints, so the bundle does not carry the whole folder.
const art = require.context('../../../../apps/docs/public/art', false, /^\.\/(news-|halden-|sunpeel-|halmoni|jazz-trio|milk-farm|cereal-|parfait|marigold|island|harbour|market).*\.webp$/)

export const BASE_PATH = ''

export function asset(path: string): string {
  const key = path.startsWith('/art/') ? `./${path.slice('/art/'.length)}` : null
  if (key === null || !art.keys().includes(key)) {
    throw new Error(`[promo] The docs artwork asked for ${path}, which src/promo/docs-asset.ts does not bundle. Add it to the pattern there.`)
  }
  const found = art(key)
  return typeof found === 'string' ? found : found.default
}
