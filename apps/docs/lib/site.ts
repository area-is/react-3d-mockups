/**
 * Where this site lives, for everything that needs an absolute URL: canonical
 * links, Open Graph / Twitter cards, `sitemap.xml` and `robots.txt`.
 *
 * The fallback is the real production URL, so a plain checkout builds correct
 * canonicals without anybody having to remember a dashboard setting.
 * `NEXT_PUBLIC_SITE_URL` overrides it, and has to be a *build* variable
 * (Workers & Pages → area-3d-mockups-docs → Settings → Build → Variables)
 * because `metadataBase` is baked in at build time, not read at runtime.
 *
 * It carries the `basePath` too. `metadataBase` keeps its own path when it
 * resolves a relative one - Next joins them, `posix.join('/react-3d-mockups',
 * '/og.png')` - and `app/sitemap.ts` builds every URL from this string, so the
 * prefix has to be in it exactly once. Getting it wrong is not fatal but is
 * visible: social cards would point their image at a path that does not serve
 * it, and canonical links would name the wrong origin.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://area.is/react-3d-mockups'
).replace(/\/$/, '')

/** The home page's title and description, also the site-wide fallbacks. */
export const SITE_TITLE = 'React 3D Mockups: 3D device mockups for React'
export const SITE_DESCRIPTION =
  'GPU-accelerated 3D device mockups for React, built on three.js. Drop any content onto the screen of a 3D device and it renders live - real DOM, not a texture.'

/**
 * The repository and the package, for every outbound link the site makes.
 *
 * One place because the repo has been renamed once already (it was
 * `area-is/3d-mockups`), and the header, the footer, the example bars and the
 * structured data each carried their own copy of the old URL - they all went
 * on pointing at it after the move.
 */
export const GITHUB_URL = 'https://github.com/area-is/react-3d-mockups'
export const NPM_URL = 'https://www.npmjs.com/package/react-3d-mockups'
export const CHANGELOG_URL = `${GITHUB_URL}/blob/main/CHANGELOG.md`
export const LICENSE_URL = `${GITHUB_URL}/blob/main/LICENSE`

/**
 * The install line, peers included. npm 7+ and pnpm 8+ would pull three,
 * fiber and drei in on their own, but Yarn classic does not, and a line that
 * works in only two of three package managers reads as a broken quick start
 * to whoever is on the third.
 */
const INSTALL_PACKAGES = 'react-3d-mockups three @react-three/fiber @react-three/drei'
export const INSTALL_COMMANDS = {
  npm: `npm install ${INSTALL_PACKAGES}`,
  pnpm: `pnpm add ${INSTALL_PACKAGES}`,
  yarn: `yarn add ${INSTALL_PACKAGES}`,
} as const

/**
 * The site chrome's own colour, for `theme-color` (the address bar on mobile
 * browsers) and the web manifest. Matches `--bg` in globals.css.
 */
export const THEME_COLOR = '#08090c'

/** The social card shipped at `public/og.png` (1200×630, a real render). */
export const OG_IMAGE = {
  url: '/og.png',
  width: 1200,
  height: 630,
  alt: 'react-3d-mockups: a live 3D phone mockup with real DOM on the glass',
}

/** An Open Graph image; `url` is relative to `metadataBase` or absolute. */
export interface SocialImage {
  url: string
  width?: number
  height?: number
  alt?: string
}

/**
 * Shared Open Graph / Twitter block; pages override `title` and `description`.
 *
 * `url` is the page's own path (without the basePath - `metadataBase` carries
 * it) and becomes `og:url`. Next merges metadata shallowly, so a page that
 * sets `openGraph` at all replaces its layout's whole block: leaving `url` out
 * here does not inherit the layout's, it drops `og:url` altogether - and a
 * layout-level one would have named the home page on every page under it.
 *
 * `twitterCard: 'summary'` is for a square image, which the large card would
 * crop to a 2:1 strip through the middle.
 */
export function socialMetadata({
  title,
  description,
  url,
  image = OG_IMAGE,
  twitterCard = 'summary_large_image',
}: {
  title: string
  description: string
  url?: string
  image?: SocialImage
  twitterCard?: 'summary' | 'summary_large_image'
}) {
  return {
    openGraph: {
      type: 'website' as const,
      siteName: 'react-3d-mockups',
      title,
      description,
      ...(url === undefined ? {} : { url }),
      images: [image],
    },
    twitter: {
      card: twitterCard,
      title,
      description,
      images: [image.url],
    },
  }
}

/**
 * A page's canonical link and `og:url` together, plus its social cards. The
 * two URLs have to agree, and the easiest way to keep them agreeing is to
 * never write one without the other. `path` is relative to `metadataBase`
 * (so without the basePath), or absolute.
 */
export function pageMetadata(args: Parameters<typeof socialMetadata>[0] & { path: string }) {
  return {
    alternates: { canonical: args.path },
    ...socialMetadata({ ...args, url: args.path }),
  }
}

/**
 * A JSON-LD `<script>` payload. `JSON.stringify` does not escape `<`, so a
 * string containing `</script>` would end the element early; the Next guide on
 * JSON-LD recommends replacing it with its unicode escape, which JSON parsers
 * read back as the same character.
 */
export function jsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
