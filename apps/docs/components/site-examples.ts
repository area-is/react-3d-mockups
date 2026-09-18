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
  /** One line on what it shows - the dropdown has room for it, the sheet doesn't. */
  description: string
}

export const SITE_EXAMPLES: SiteExample[] = [
  {
    href: '/examples/print-shop',
    title: 'Print Shop',
    description: 'A poster configurator that reprints the sheet in its frame',
  },
  {
    href: '/examples/campaign',
    title: 'Campaign',
    description: 'One generative identity across the city, billboard to crew pass',
  },
  {
    href: '/examples/ledger',
    title: 'Ledger',
    description: 'A finance app on a laptop, a phone and a watch in one scene',
  },
  {
    href: '/examples/cafe',
    title: 'Café',
    description: 'A coffee shop: storefront, chalkboard, oat-milk carton, loyalty card',
  },
  {
    href: '/examples/fleet',
    title: 'Fleet',
    description: 'A freight livery on a trailer, a van, a box and a tracking app',
  },
  {
    href: '/examples/stream',
    title: 'Stream',
    description: 'A streaming service on a TV, a Fold, a Flip and an iPad',
  },
  {
    href: '/examples/packaging',
    title: 'Packaging',
    description: 'A box configurator rebuilt from millimetre sliders',
  },
  {
    href: '/examples/stationery',
    title: 'Stationery',
    description: 'A wedding suite typeset from the names you type',
  },
  {
    href: '/examples/matchday',
    title: 'Match day',
    description: 'A football club: team coach, live broadcast, watch, season pass',
  },
  {
    href: '/examples/atlas',
    title: 'Atlas',
    description: 'A magazine issue with generated photographs, print and annual',
  },
  {
    href: '/examples/arcade',
    title: 'Arcade',
    description: 'An indie game running live on a TV, boxed, on vinyl, on a phone',
  },
  {
    href: '/examples/ambient',
    title: 'Ambient',
    description: 'Living art on a Frame TV, a display, a tablet and a watch',
  },
]
