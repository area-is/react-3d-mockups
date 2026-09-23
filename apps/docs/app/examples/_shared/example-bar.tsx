import Link from 'next/link'
import { Logo } from '@/components/logo'
import { nextExample } from '@/components/site-examples'
import { GITHUB_URL } from '@/lib/site'
// Imported here, not by the layouts: two of the twelve do not load the shared
// example stylesheet, and the bar has to look the same on all of them.
import './example-bar.css'

/**
 * The strip across the top of every example: what this page is, whose it is,
 * where its code lives and which example comes next.
 *
 * The examples are dressed as real businesses on purpose, and on a phone that
 * dress was all there was - the "example · built with" pill was the first
 * thing the header dropped below 760px, so /examples/fleet at 375px showed a
 * freight company's wordmark and a "Get a quote" button and nothing linking
 * back to the library. This bar is outside the example's own markup, in the
 * site's colours, on every breakpoint: the page can look like anybody, the
 * frame round it always says it is ours.
 *
 * `tabbied` credits the pattern library the example's artwork is drawn with,
 * for the examples that use it.
 */
export function ExampleBar({ slug, tabbied = true }: { slug: string; tabbied?: boolean }) {
  const next = nextExample(slug)
  const source = `${GITHUB_URL}/tree/main/apps/docs/app/examples/${slug}`

  return (
    <aside className="ex-bar" aria-label="About this example">
      <div className="ex-bar-inner">
        <Link href="/" className="ex-bar-home">
          <Logo size={17} />
          react-3d-mockups
        </Link>
        <span className="ex-bar-tag">Example</span>
        <span className="ex-bar-note">
          A fictional brand, built with the library
          {tabbied ? (
            <>
              {' and '}
              <a href="https://tabbied.com" target="_blank" rel="noreferrer">
                Tabbied
              </a>
            </>
          ) : null}
        </span>
        <span className="ex-bar-links">
          {/* Labelled in full: on a phone the visible text shrinks to
              "Source" and "Next", which say too little read out alone. */}
          <a href={source} target="_blank" rel="noreferrer" aria-label="View this example's source on GitHub">
            <span className="ex-bar-wide">View source</span>
            <span className="ex-bar-narrow">Source</span>
          </a>
          <Link href={next.href} aria-label={`Next example: ${next.title}`}>
            Next<span className="ex-bar-wide">: {next.title}</span> →
          </Link>
        </span>
      </div>
    </aside>
  )
}
