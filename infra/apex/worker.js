/**
 * The apex of area.is, until the real apex app ships.
 *
 * The docs Worker is routed at `area.is/react-3d-mockups*` and nothing else
 * answers on the apex: `/`, `/robots.txt` and `/sitemap.xml` went to the
 * placeholder AAAA record (`100::`, the discard prefix) and came back as
 * Cloudflare 522s. That is worse than it looks for the docs themselves. A
 * crawler reads robots.txt only at the host root, and a robots.txt that keeps
 * failing with a 5xx can be taken as "do not crawl this host" - the whole
 * host, the docs included. And the docs' own sitemap is only discoverable
 * through the root robots.txt's `Sitemap:` line.
 *
 * So this answers exactly those three, plus a real 404 for everything else.
 * It deliberately does not redirect every unknown path to the docs: a stray
 * URL that 302s to a product page is a soft 404 to a search engine.
 *
 * Routes (wrangler.jsonc) are `area.is/*`; the docs Worker's routes are more
 * specific and win, so nothing under /react-3d-mockups ever reaches this.
 * Replace this Worker with the apex app when there is one - its robots.txt has
 * to carry the same lines (see ROBOTS below and apps/docs/app/robots.ts).
 */

const ORIGIN = 'https://area.is'
const DOCS = '/react-3d-mockups'

/**
 * Mirrors apps/docs/app/robots.ts, which is only ever served at
 * /react-3d-mockups/robots.txt - a path no crawler reads for rules.
 */
const ROBOTS = `User-agent: *
Allow: /
Disallow: ${DOCS}/harness
Disallow: ${DOCS}/embedded

Sitemap: ${ORIGIN}${DOCS}/sitemap.xml
`

/** A sitemap index, so a crawler that asks the root for one is sent to the docs'. */
const SITEMAP_INDEX = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${ORIGIN}${DOCS}/sitemap.xml</loc></sitemap>
</sitemapindex>
`

const NOT_FOUND = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Not found | area.is</title>
<body style="font:16px/1.5 system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 16px;color:#1b1d22">
<h1 style="font-size:1.4rem">Nothing here yet</h1>
<p>You might be looking for <a href="${DOCS}">React 3D Mockups</a>.</p>
</body>
</html>
`

function respond(body, status, type, request, extra = {}) {
  return new Response(request.method === 'HEAD' ? null : body, {
    status,
    headers: { 'content-type': type, 'cache-control': 'public, max-age=3600', ...extra },
  })
}

export default {
  async fetch(request) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, HEAD' } })
    }
    const { pathname } = new URL(request.url)
    switch (pathname) {
      case '/':
        // Temporary on purpose: the apex will be its own site, and a 301 would
        // be cached by browsers and search engines long after it is.
        return new Response(null, { status: 302, headers: { location: `${ORIGIN}${DOCS}`, 'cache-control': 'no-store' } })
      case '/robots.txt':
        return respond(ROBOTS, 200, 'text/plain; charset=utf-8', request)
      case '/sitemap.xml':
        return respond(SITEMAP_INDEX, 200, 'application/xml; charset=utf-8', request)
      default:
        return respond(NOT_FOUND, 404, 'text/html; charset=utf-8', request, { 'cache-control': 'public, max-age=300' })
    }
  },
}
