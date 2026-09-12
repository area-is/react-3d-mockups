/**
 * Where this site is mounted.
 *
 * The docs are served at a path on the apex - `https://area.is/react-3d-mockups`
 * - rather than on their own hostname, so the Worker only ever sees requests
 * beginning with this prefix. `next.config.ts` feeds it to Next as `basePath`,
 * which rewrites everything Next itself emits: `next/link` hrefs, router
 * navigations, `/_next/*` assets, route handlers.
 *
 * `asset()` is for everything Next does NOT rewrite, which is any path this
 * repo hard-codes as a root-absolute string: a plain `<img src="/art/…">`, a
 * `url()` in CSS, an API endpoint handed to a library. Those are invisible to
 * `basePath` and would resolve against the apex's root - somebody else's site
 * - and 404. `next/image` and `next/link` do their own prefixing, so anything
 * going through them must NOT be passed through here or it gets the prefix
 * twice.
 *
 * Plain `.mjs` with no imports on purpose: `next.config.ts`, the build-time
 * scripts under `scripts/`, and the client components all read it, and those
 * three worlds have no other module format in common. It is also why the
 * prefix is a literal rather than an environment variable - `basePath` is
 * inlined into the client bundle at build time and cannot be switched at
 * runtime, so a variable would only create the illusion that it could be.
 */

/** The path the site is mounted at, with no trailing slash. */
export const BASE_PATH = '/react-3d-mockups'

/**
 * Prefix a root-absolute path to a file in `public/`, or to an endpoint this
 * app serves. Pass the path exactly as it sits under `public/`, leading slash
 * included: `asset('/art/fox.webp')`.
 */
export const asset = (path) => `${BASE_PATH}${path}`
