import Link from 'next/link'
import { ArrowRight, CodeXml } from 'lucide-react'
import { ExamplesMenu } from '@/components/examples-menu'
import { Logo } from '@/components/logo'
import { SITE_EXAMPLES, nextExample } from '@/components/site-examples'
import { GITHUB_URL } from '@/lib/site'
// Imported here, not by the layouts: two of the twelve do not load the shared
// example stylesheet, and the bar has to look the same on all of them.
import './example-bar.css'

/**
 * The strip across the top of every example: whose it is, which example this
 * is, the way to every other one, where its code lives and which comes next.
 *
 * The examples are dressed as real businesses on purpose, and on a phone that
 * dress was all there was - the "example · built with" pill was the first
 * thing the header dropped below 760px, so /examples/fleet at 375px showed a
 * freight company's wordmark and a "Get a quote" button and nothing linking
 * back to the library. This bar is outside the example's own markup, in the
 * site's colours, on every breakpoint: the page can look like anybody, the
 * frame round it always says it is ours.
 *
 * It reads like the site's own header, shrunk to a strip: the library's name
 * on the left with a breadcrumb to this example, and on the right the same
 * `Examples` menu the site header has (with this page marked in it), the
 * source, and the next example as the one button.
 *
 * `tabbied` credits the pattern library the example's artwork is drawn with,
 * for the examples that use it.
 */
export function ExampleBar({ slug, tabbied = true }: { slug: string; tabbied?: boolean }) {
  const current = SITE_EXAMPLES.find((e) => e.slug === slug)
  const next = nextExample(slug)
  const source = `${GITHUB_URL}/tree/main/apps/docs/app/examples/${slug}`

  return (
    <aside className="ex-bar" aria-label="About this example">
      <div className="ex-bar-inner">
        <div className="ex-bar-lead">
          <Link href="/" className="ex-bar-home">
            <Logo size={18} />
            <span className="ex-bar-name">React 3D Mockups</span>
          </Link>
          {current ? (
            <span className="ex-bar-crumb">
              <span className="ex-bar-slash" aria-hidden>
                /
              </span>
              <span className="ex-bar-current">{current.title}</span>
              <span className="ex-bar-tag">Example</span>
            </span>
          ) : null}
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
        </div>
        <nav className="ex-bar-links" aria-label="Examples">
          <Link href="/docs" className="ex-bar-link ex-bar-docs">
            Docs
          </Link>
          <ExamplesMenu current={slug} />
          {/* Labelled in full: on a phone the visible text goes and only the
              icon is left, which says nothing read out alone. */}
          <a href={source} target="_blank" rel="noreferrer" className="ex-bar-link" aria-label="View this example's source on GitHub">
            <CodeXml size={15} strokeWidth={2.1} aria-hidden />
            <span className="ex-bar-wide">Source</span>
          </a>
          <Link href={next.href} className="ex-bar-next" aria-label={`Next example: ${next.title}`}>
            {/* One flex item, so the row's gap cannot open between "Next" and its colon. */}
            <span>
              Next<span className="ex-bar-wide">: {next.title}</span>
            </span>
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </Link>
        </nav>
      </div>
    </aside>
  )
}
