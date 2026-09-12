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

/** The social card shipped at `public/og.png` (1200×630, a real render). */
export const OG_IMAGE = {
  url: '/og.png',
  width: 1200,
  height: 630,
  alt: 'react-3d-mockups: a live 3D phone mockup with real DOM on the glass',
}

/** Shared Open Graph / Twitter block; pages override `title` and `description`. */
export function socialMetadata({ title, description }: { title: string; description: string }) {
  return {
    openGraph: {
      type: 'website' as const,
      siteName: 'react-3d-mockups',
      title,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [OG_IMAGE.url],
    },
  }
}
