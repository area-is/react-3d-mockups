/**
 * "Tabbied", as a link, for prose that names it. A plain anchor to
 * tabbied.com, because that is somebody else's site.
 *
 * The "example · built with …" chip that used to sit in every example's top
 * bar is gone: it was the first thing each header hid on a phone, so the
 * credit now lives in the example bar above the page (example-bar.tsx).
 */
export function TabbiedLink({ children = 'Tabbied' }: { children?: React.ReactNode }) {
  return (
    <a href="https://tabbied.com" target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}
