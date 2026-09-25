import type { MetadataRoute } from 'next'
import { BASE_PATH, asset } from '@/lib/base-path.mjs'
import { SITE_DESCRIPTION, THEME_COLOR } from '@/lib/site'

/**
 * The web app manifest, served at `/react-3d-mockups/manifest.webmanifest`.
 *
 * Every path is prefixed by hand. A manifest's URLs resolve against the
 * manifest's own URL or the origin, never against `basePath`, so a bare
 * `start_url: '/'` would launch an installed shortcut at `area.is/` - the
 * apex's site, not this one - and bare icon paths would 404 the same way.
 * The icons are the app-directory ones (`icon.svg`, `apple-icon.png`), which
 * Next serves at these paths as well as linking them from every page.
 *
 * The start URL is the prefix without a trailing slash, the one URL the home
 * page answers at - with the slash it is a 308 to it. The scope has to match
 * it for the same reason: scope is a plain prefix test, and `/react-3d-mockups`
 * does not start with `/react-3d-mockups/`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'React 3D Mockups',
    short_name: '3D Mockups',
    description: SITE_DESCRIPTION,
    id: BASE_PATH,
    start_url: BASE_PATH,
    scope: BASE_PATH,
    display: 'browser',
    background_color: THEME_COLOR,
    theme_color: THEME_COLOR,
    icons: [
      { src: asset('/icon.svg'), sizes: 'any', type: 'image/svg+xml' },
      { src: asset('/apple-icon.png'), sizes: '180x180', type: 'image/png' },
    ],
  }
}
