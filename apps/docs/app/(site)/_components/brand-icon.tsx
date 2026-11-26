import type { SimpleIcon } from 'simple-icons'

/**
 * A brand mark from Simple Icons (CC0), drawn in the text's colour so it
 * takes the label's state - muted at rest, full ink when active - rather than
 * the brand's own colour, which would put four logos' colours in one corner
 * of a page that otherwise uses one accent. Decorative: the label beside it
 * names the thing.
 */
export function BrandIcon({ icon, size = 14 }: { icon: SimpleIcon; size?: number }) {
  return (
    <svg className="brand-icon" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
      <path d={icon.path} />
    </svg>
  )
}
