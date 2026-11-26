import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, LayoutGrid } from 'lucide-react'
import { highlight } from 'fumadocs-core/highlight'
import { siNpm, siPnpm, siReact, siYarn } from 'simple-icons'
import { HeroCarousel } from '@/components/hero-carousel'
import { ModelGallery } from '@/components/model-gallery'
import { ModelLifecycleProvider } from '@/components/model-lifecycle'
import { OLDER_MODELS } from '@/lib/model-lifecycle'
import { DEVICES, OBJECTS } from '@/lib/mockup-catalog.mjs'
import {
  AUTHOR,
  GITHUB_URL,
  INSTALL_COMMANDS,
  NPM_URL,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
  jsonLd,
  pageMetadata,
} from '@/lib/site'
import { BrandIcon } from './_components/brand-icon'
import { CopyButton } from './_components/copy-button'
import { InstallTabs } from './_components/install-tabs'

// Absolute, not '/': joined onto `metadataBase` a bare slash comes out as
// `…/react-3d-mockups/`, which is a 308 to the slashless URL - a canonical
// naming a redirect rather than the page.
export const metadata: Metadata = pageMetadata({ path: SITE_URL, title: SITE_TITLE, description: SITE_DESCRIPTION })

/** Counted from the catalog, so the hero's "all N models" cannot go stale. */
const MODEL_COUNT = DEVICES.length + OBJECTS.length

const importSnippet = `import { GalaxyMockup } from 'react-3d-mockups'

<GalaxyMockup autoRotate float>
  <YourApp />
</GalaxyMockup>`

/**
 * What the page is about, for search engines: a library, its repository and
 * its licence. `SoftwareSourceCode` rather than `SoftwareApplication` because
 * what is published is source you install, not an app you run.
 */
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareSourceCode',
  name: 'react-3d-mockups',
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  codeRepository: GITHUB_URL,
  programmingLanguage: 'TypeScript',
  runtimePlatform: 'React',
  license: 'https://opensource.org/licenses/MIT',
  author: { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url },
  sameAs: [NPM_URL],
}

/**
 * A code block, coloured by the same Shiki that sets the docs' examples.
 *
 * Shiki's own `<pre>` carries the theme's background and foreground inline,
 * which would win over any stylesheet; dropping the element's attributes keeps
 * the token colours (they are on the spans) and hands the block's look back
 * to `.quickstart-code pre` in globals.css, which draws no box at all.
 */
async function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return highlight(code, {
    lang,
    theme: 'github-dark',
    components: {
      pre: ({ style: _style, className: _className, ...props }) => <pre {...props} />,
    },
  })
}

/** Each package manager's mark, beside its name in the install switcher. */
const PM_ICONS = { npm: siNpm, pnpm: siPnpm, yarn: siYarn } satisfies Record<keyof typeof INSTALL_COMMANDS, unknown>

/**
 * Install and a first component, straight under the carousel: someone who
 * has just watched a model spin is one copy away from their own.
 */
function QuickStart() {
  return (
    <section className="quickstart">
      <div className="quickstart-copy">
        <h2>Quick start</h2>
        <p>
          One component. Anything you pass as children shows up on the glass, live. three.js,
          react-three-fiber and drei are peer dependencies, installed alongside it.
        </p>
        <Link className="accent-link" href="/docs">
          Read the docs →
        </Link>
      </div>
      <div className="quickstart-code">
        {/* Peers listed in full: npm 7+ and pnpm 8+ would pull them in
            anyway, Yarn classic would not. */}
        <InstallTabs
          options={Object.entries(INSTALL_COMMANDS).map(([id, command]) => ({
            id,
            icon: <BrandIcon icon={PM_ICONS[id as keyof typeof INSTALL_COMMANDS]} />,
            command,
            code: <CodeBlock code={command} lang="bash" />,
          }))}
        />
        <div className="code-panel">
          <div className="code-panel-head">
            <span className="code-panel-label">
              <BrandIcon icon={siReact} />
              App.tsx
            </span>
            <CopyButton text={importSnippet} label="Copy code example" />
          </div>
          <CodeBlock code={importSnippet} lang="tsx" />
        </div>
      </div>
    </section>
  )
}

/**
 * Every model, under the quick start: the docs' Gallery component without its
 * filters, count or older-models switch - the newest model of each line as a
 * plain grid, each linking to its page. The thumbnails are pre-rendered
 * images, so the section adds no WebGL to the page. The lifecycle provider
 * tells it which models a newer one has replaced, as the docs layout does for
 * the docs.
 */
function Gallery() {
  return (
    <section className="home-gallery" aria-labelledby="gallery-title">
      <h2 id="gallery-title">Gallery</h2>
      <ModelLifecycleProvider value={OLDER_MODELS}>
        <ModelGallery controls={false} />
      </ModelLifecycleProvider>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(STRUCTURED_DATA) }} />

      {/* The title and the two ways in - start, browse - and nothing else:
          the carousel directly under it is the hero's picture, and every
          line added here pushes it further below the fold. The install
          command is the first thing under the carousel instead. */}
      <section className="hero">
        <p className="eyebrow">An open-source React library</p>
        <h1>3D mockups for React</h1>
        <div className="hero-cta">
          <Link className="btn btn-primary" href="/docs/quick-start">
            Get started
            <ArrowRight className="btn-icon btn-icon-trail" size={16} strokeWidth={2.25} aria-hidden />
          </Link>
          <Link className="btn btn-secondary" href="/docs/gallery">
            <LayoutGrid className="btn-icon" size={16} strokeWidth={2} aria-hidden />
            Browse all {MODEL_COUNT} models
          </Link>
        </div>
      </section>

      <HeroCarousel />

      <QuickStart />

      <Gallery />
    </>
  )
}
