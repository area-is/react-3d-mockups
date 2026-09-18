import Link from 'next/link'

/**
 * The "example · built with …" chip every example page wears in its top bar.
 *
 * Two links, not one: the chip names both libraries the page is built on,
 * and each name goes where it says. The react-3d-mockups link is a Next
 * `<Link>` to the site root; the Tabbied one is a plain anchor to
 * tabbied.com, because that is somebody else's site.
 */
export function ExampleBadge({ className, tabbied = true }: { className?: string; tabbied?: boolean }) {
  return (
    <span className={className}>
      example · built with <Link href="/">react-3d-mockups</Link>
      {tabbied ? (
        <>
          {' + '}
          <a href="https://tabbied.com" target="_blank" rel="noreferrer">
            tabbied
          </a>
        </>
      ) : null}
    </span>
  )
}

/** "Tabbied", as a link, for prose that names it. */
export function TabbiedLink({ children = 'Tabbied' }: { children?: React.ReactNode }) {
  return (
    <a href="https://tabbied.com" target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}
