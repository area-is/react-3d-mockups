# Moving the site to `area.is/react-3d-mockups`

> How the site is built and deployed at all - Workers Builds, the OpenNext
> indirections, the bundle size - is in the root
> [README](../../README.md#deploying-the-docs). This file is only about
> changing the URL it answers on, which is the one deployment change with
> enough moving parts to be worth writing down.

Today the site answers on its own hostname, `3d-mockups.area.is`. Serving it at
a **path** on the apex instead is not a DNS change - it is two changes that
have to land together.

## Why it is not just a routing change

A hostname binding gives the Worker the entire origin: every request to
`3d-mockups.area.is` reaches it, so the app can serve from `/` and emit
root-absolute URLs (`/docs`, `/_next/static/…`, `/thumbs/ipad-pro-13.png`)
that all land back on itself.

Under `area.is/react-3d-mockups` the Worker sees **only** requests beginning
with that prefix. Every root-absolute URL the app emits now points at the
apex's root - somebody else's site - and 404s. So the routing change has to be
matched by teaching the app that it lives under a prefix, which in Next.js is
`basePath`.

> **The cheap alternative.** If you only want a tidier URL to hand out, and not
> to actually move the site, add a redirect rule from `area.is/react-3d-mockups*`
> to `https://3d-mockups.area.is/…` and stop reading. That is one rule, no code
> change, and no risk. Everything below is for genuinely relocating the site.

## Part 1 - Cloudflare

### A Custom Domain cannot do this

Workers **Custom Domains** bind a whole hostname and have no path component -
which is almost certainly what `3d-mockups.area.is` is today. A path prefix
must be a **Route**. The differences that matter:

| | Custom Domain | Route |
| --- | --- | --- |
| Path | whole hostname only | pattern with a path |
| DNS | creates its own record | needs an existing **proxied** record |
| Certificate | issued for you | uses the zone's |

So `area.is` must already have a proxied (orange-cloud) record on the apex. If
area.is is a live site, it does.

### Add the routes

Put them in `wrangler.jsonc` rather than clicking them into the dashboard, so
the binding is reviewable and redeployable:

```jsonc
"routes": [
  { "pattern": "area.is/react-3d-mockups", "zone_name": "area.is" },
  { "pattern": "area.is/react-3d-mockups/*", "zone_name": "area.is" }
]
```

Two patterns, not one `…/react-3d-mockups*`: a single trailing wildcard would
also swallow `/react-3d-mockups-anything-else`. The bare pattern catches the
index, the `/*` one catches everything under it.

Add `www.area.is/react-3d-mockups…` as well if `www` is served rather than
redirected.

### Precedence over whatever serves the apex

Routes are matched most-specific-first, so these win over a broader
`area.is/*` route serving the rest of the site. A Worker route also takes
precedence over a Cloudflare Pages project on the same hostname, so an apex
served by Pages keeps working and only this path is carved out of it.

### Keep the old URLs alive

Add a **Redirect Rule** (Rules → Redirect Rules) on the zone:

- **If** `http.host eq "3d-mockups.area.is"`
- **Then** dynamic redirect to
  `concat("https://area.is/react-3d-mockups", http.request.uri.path)`,
  status **301**, preserve query string.

The catch: a redirect rule only runs if Cloudflare terminates the request, so
`3d-mockups.area.is` still needs a **proxied** DNS record after you remove its
Custom Domain. Leave a proxied placeholder (the conventional one is an `AAAA`
to `100::`) or the hostname stops resolving and the redirect never fires.

## Part 2 - the app

### `basePath`

```ts
// next.config.ts
const nextConfig: NextConfig = {
  transpilePackages: ['react-3d-mockups'],
  basePath: '/react-3d-mockups',
}
```

It is inlined into the client bundle at build time - it cannot be switched by
an environment variable at runtime.

Set the site URL to match, as a **build** variable (Workers & Pages →
area-3d-mockups-docs → Settings → Build → Variables), for the reason
`lib/site.ts` already spells out:

```
NEXT_PUBLIC_SITE_URL=https://area.is/react-3d-mockups
```

`app/sitemap.ts` and `app/robots.ts` build every URL from `SITE_URL`, and
`page.url` from the fumadocs source is already `/docs/…`, so the sitemap comes
out correct with no further change.

### What `basePath` handles for you

`next/link` hrefs, router navigations, `/_next/*` assets, and route handlers.

Two more that are easy to go and check by hand, so: both are fine.
`usePathname()` returns the path **without** the prefix (app-router resolves it
as `hasBasePath(p) ? removeBasePath(p) : p`), so the `/docs/api/<id>`
comparisons in `components/mockup-breadcrumb.tsx` and `lib/sidebar-tree.ts`
keep working untouched. And `metadataBase` keeps its own path when it resolves
a relative one - Next joins them, `posix.join('/react-3d-mockups', '/og.png')`
- so the social card in `lib/site.ts` needs no change either.

### What it does not - the list for this repo

`basePath` rewrites what Next emits. Anything the app hard-codes as a
root-absolute string is invisible to it:

1. **`components/docs-sidebar.tsx`** - `<img src={e.thumb}>`, where `thumb` is
   `/thumbs/<id>.png` from `lib/mockup-catalog.mjs`. A plain `<img>`, so every
   sidebar thumbnail 404s. Fix it once at the catalog:

   ```js
   const BASE = '/react-3d-mockups'
   thumb: `${BASE}/thumbs/${id}.png`,
   ```

   (`href` in the same file is fed to `<Link>`, so it must *not* get the
   prefix - Next adds that itself.)

2. **`components/screens/surface-art.tsx`** - `<img src="/assets/area_ag_white.svg">`.
   Same fix, or move it to `next/image` with the prefix in the `src`.

3. **Search.** `fumadocs-core`'s fetch client defaults its endpoint to
   `join(BASE_PATH, '/api/search')`, where that `BASE_PATH` comes from
   `import.meta.env.BASE_URL` - a Vite variable, undefined under Next, so it
   resolves to a bare `/api/search` and misses the prefix. Point it explicitly:

   ```tsx
   // app/docs/layout.tsx
   <RootProvider search={{ options: { api: '/react-3d-mockups/api/search' } }}>
   ```

4. **`robots.txt`.** Crawlers only ever read `https://area.is/robots.txt`,
   which this Worker never sees, so `app/robots.ts` becomes dead weight. Fold
   its rules into the apex's own robots.txt, prefixed:

   ```
   Disallow: /react-3d-mockups/harness
   Disallow: /react-3d-mockups/embedded
   Sitemap: https://area.is/react-3d-mockups/sitemap.xml
   ```

   The sitemap itself is fine where it lands - a sitemap may list any URL at or
   below its own path, and every URL in this one is - but nothing will discover
   it unless the apex points at it, or you submit it in Search Console.

5. **The screenshot scripts.** `visual-check.mjs` and `generate-thumbs.mjs`
   request `${BASE}/harness?…`. Both already take a `--base`, so no edit is
   needed - just pass the prefix:

   ```bash
   npm run visual -- --base=http://localhost:3000/react-3d-mockups
   ```

## Part 3 - the order to do it in

Nothing here is atomic, so sequence it to keep the live site up:

1. Make the app changes locally. Run `npm run preview:docs` from the repo root
   - that is the real Worker, not `next dev`, so it is the first honest test -
   and click through the docs, the sidebar thumbnails, the search dialog and an
   example page.
2. Deploy with the new routes added and the old Custom Domain **still in
   place**. Both URLs now serve; the old one is the fallback.
3. Verify `https://area.is/react-3d-mockups` in a clean browser profile.
   Watch the network panel for 404s on `/_next/*`, `/thumbs/*` and
   `/api/search` - those are the three that a missed prefix shows up as.
4. Add the redirect rule from the old hostname.
5. Only then remove the Custom Domain, leaving the proxied placeholder record
   behind it.
6. Update the outbound references: the docs link in the root `README.md` and
   the npm package's `homepage`, both of which still name the workers.dev URL.

## Things that change quietly

- **Origin.** The site now shares `https://area.is` with everything else on the
  apex: same cookie jar, same `localStorage`, same service-worker scope. If
  area.is sets cookies at the apex, this app sends them on every request.
- **Search Console.** `area.is/react-3d-mockups` is a URL-prefix property, not
  a domain property. The old subdomain's history does not transfer; the 301 is
  what carries the ranking across.
