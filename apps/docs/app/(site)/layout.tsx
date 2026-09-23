import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { SiteNav } from '@/components/site-nav'
import { SITE_EXAMPLES } from '@/components/site-examples'
import { fraunces, inter, jetbrainsMono, notoSansKR } from '@/lib/fonts'
import {
  CHANGELOG_URL,
  GITHUB_URL,
  LICENSE_URL,
  NPM_URL,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
  THEME_COLOR,
  socialMetadata,
} from '@/lib/site'
import '../globals.css'
import '../screens.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: '%s | React 3D Mockups' },
  description: SITE_DESCRIPTION,
  ...socialMetadata({ title: SITE_TITLE, description: SITE_DESCRIPTION }),
}

// `themeColor` lives on `viewport`, not `metadata`, in this version of Next.
// The site is dark in every colour scheme, so it is one colour, not a pair.
export const viewport: Viewport = {
  themeColor: THEME_COLOR,
}

/**
 * The footer's links: the site's own places first, then where the project
 * lives off-site. Examples points at the first one rather than at a list,
 * because there is no index page - every example carries a bar linking on to
 * the next, which is the index.
 */
const FOOTER_LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: 'Docs', href: '/docs' },
  { label: 'Gallery', href: '/docs/gallery' },
  { label: 'Examples', href: SITE_EXAMPLES[0].href },
  { label: 'GitHub', href: GITHUB_URL, external: true },
  { label: 'npm', href: NPM_URL, external: true },
  { label: 'Changelog', href: CHANGELOG_URL, external: true },
  { label: 'License', href: LICENSE_URL, external: true },
]

// Root layout for the marketing site (the home page and its 404). The docs and
// embedded routes have their own root layouts, so the site styles never mix
// with the Fumadocs/Tailwind styles and vice versa.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable} ${notoSansKR.variable}`}>
      <body>
        <div className="site">
          <header className="site-header">
            <div className="container header-inner">
              <Link href="/" className="brand">
                <Logo size={25} className="brand-logo" />
                React 3D Mockups
              </Link>
              <SiteNav />
            </div>
          </header>

          <main>{children}</main>

          <footer className="site-footer">
            <div className="container footer-inner">
              <span>MIT © {new Date().getFullYear()} subwaymatch</span>
              <nav className="footer-links" aria-label="Footer">
                {FOOTER_LINKS.map((link) =>
                  link.external ? (
                    <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  ) : (
                    <Link key={link.label} href={link.href}>
                      {link.label}
                    </Link>
                  )
                )}
              </nav>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
