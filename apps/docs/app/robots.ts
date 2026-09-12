import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { asset } from '@/lib/base-path.mjs'

/**
 * `/harness` is the visual-regression fixture and `/embedded` exists to be
 * iframed by a demo; both already carry `robots: { index: false }` in their
 * layouts, and this keeps well-behaved crawlers from spending the budget to
 * find that out.
 *
 * ⚠️ This is NOT the robots.txt that governs this site. Under `basePath` it is
 * served at `/react-3d-mockups/robots.txt`, and a crawler only ever reads
 * `https://area.is/robots.txt` - a path this Worker never sees. The rules
 * below have to be mirrored, prefixed, in whatever serves the apex:
 *
 * ```
 * Disallow: /react-3d-mockups/harness
 * Disallow: /react-3d-mockups/embedded
 * Sitemap: https://area.is/react-3d-mockups/sitemap.xml
 * ```
 *
 * The sitemap itself is fine where it lands - a sitemap may list any URL at or
 * below its own path, and every URL in this one is - but nothing discovers it
 * unless the apex points at it or it is submitted in Search Console. This file
 * stays as the single written record of the rules, and because it costs
 * nothing: one prerendered text route nobody requests.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    // Prefixed, unlike everywhere else in the app: a robots.txt path is
    // resolved against the ORIGIN root, never against `basePath`, so bare
    // `/harness` here would mean `area.is/harness` - a route this Worker does
    // not own. Written this way the block is also correct to paste straight
    // into the apex's own robots.txt, which is the file that actually governs.
    rules: [
      { userAgent: '*', allow: asset('/'), disallow: [asset('/harness'), asset('/embedded')] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
