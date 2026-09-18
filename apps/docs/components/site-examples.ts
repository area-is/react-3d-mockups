/**
 * The standalone examples the site links to.
 *
 * One list, two renderings: the header's `Examples` dropdown on a wide screen
 * and the nav sheet's rows on a narrow one. They were written out separately
 * to begin with, which meant the second example added would have appeared in
 * the dropdown and quietly not on any phone.
 */
export interface SiteExample {
  href: string
  title: string
}

export const SITE_EXAMPLES: SiteExample[] = [
  { href: '/examples/print-shop', title: 'Print Shop' },
  { href: '/examples/campaign', title: 'Campaign' },
  { href: '/examples/ledger', title: 'Ledger' },
  { href: '/examples/cafe', title: 'Café' },
  { href: '/examples/fleet', title: 'Fleet' },
  { href: '/examples/stream', title: 'Stream' },
  { href: '/examples/packaging', title: 'Packaging' },
  { href: '/examples/stationery', title: 'Stationery' },
  { href: '/examples/matchday', title: 'Match day' },
  { href: '/examples/atlas', title: 'Atlas' },
  { href: '/examples/arcade', title: 'Arcade' },
  { href: '/examples/ambient', title: 'Ambient' },
]
