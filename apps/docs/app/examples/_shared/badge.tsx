/**
 * "Tabbied", as a link, for prose that names it. A plain anchor to
 * tabbied.com, because that is somebody else's site.
 *
 * The examples are dressed as independent sites, with no strip of the
 * library's own across the top, so where an example's artwork is drawn with
 * Tabbied, the credit is in its own prose, through this link.
 */
export function TabbiedLink({ children = 'Tabbied' }: { children?: React.ReactNode }) {
  return (
    <a href="https://tabbied.com" target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}
