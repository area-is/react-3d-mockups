/**
 * The standalone examples the site links to.
 *
 * One list, several renderings: the header's `Examples` dropdown on a wide
 * screen, the nav sheet's rows on a narrow one, the sitemap, and the bar
 * across the top of every example with its "next example" link. They were
 * written out separately to begin with, which meant the second example added
 * would have appeared in the dropdown and quietly not on any phone.
 *
 * Grouped by what the example is selling, because twelve bare brand names -
 * Ledger, Atlas, Prism - say nothing about which one shows the thing a
 * visitor came to mock up. The flat `SITE_EXAMPLES` order is the groups laid
 * end to end, so "next example" walks the same sequence the menu reads in.
 */
export interface SiteExample {
  /** The route segment under `/examples`, and the example's source folder. */
  slug: string
  href: string
  title: string
}

export interface SiteExampleGroup {
  label: string
  examples: SiteExample[]
}

const example = (slug: string, title: string): SiteExample => ({
  slug,
  href: `/examples/${slug}`,
  title,
})

export const SITE_EXAMPLE_GROUPS: SiteExampleGroup[] = [
  {
    label: 'Apps and screens',
    examples: [
      example('ledger', 'Ledger'),
      example('stream', 'Stream'),
      example('arcade', 'Arcade'),
      example('ambient', 'Ambient'),
    ],
  },
  {
    label: 'Print and packaging',
    examples: [
      example('print-shop', 'Print Shop'),
      example('packaging', 'Packaging'),
      example('stationery', 'Stationery'),
      example('atlas', 'Atlas'),
    ],
  },
  {
    label: 'Brand and out of home',
    examples: [
      example('campaign', 'Campaign'),
      example('cafe', 'Café'),
      example('fleet', 'Fleet'),
      example('matchday', 'Match day'),
    ],
  },
]

export const SITE_EXAMPLES: SiteExample[] = SITE_EXAMPLE_GROUPS.flatMap((group) => group.examples)

/** The example after `slug`, wrapping from the last back to the first. */
export function nextExample(slug: string): SiteExample {
  const i = SITE_EXAMPLES.findIndex((e) => e.slug === slug)
  return SITE_EXAMPLES[(i + 1) % SITE_EXAMPLES.length]
}
