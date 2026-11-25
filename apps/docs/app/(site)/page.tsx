import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, LayoutGrid } from 'lucide-react'
import { highlight } from 'fumadocs-core/highlight'
import { HeroCarousel } from '@/components/hero-carousel'
import { ModelGallery } from '@/components/model-gallery'
import { ModelLifecycleProvider } from '@/components/model-lifecycle'
import { OLDER_MODELS } from '@/lib/model-lifecycle'
import { DEVICES, OBJECTS } from '@/lib/mockup-catalog.mjs'
import { asset } from '@/lib/base-path.mjs'
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
import { CopyButton } from './_components/copy-button'
import { FilmPlayer } from './_components/film-player'
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
 * What the library is, in four claims, each beside a picture of it.
 *
 * No rules between them: the space down the page is the separation, and a
 * border around a paragraph of prose only ever reads as a box to escape from.
 * Each claim is one sentence and a qualifier - anything longer stops being a
 * claim and becomes documentation.
 *
 * Each claim opens with a small white line drawing of what it says, where a
 * green index used to number them: decoration, so it carries no alt text.
 * They were drawn by an image model (OpenAI's gpt-image-2.6-sunburst, low
 * quality, transparent background), trimmed and saved at three times the
 * size they are shown.
 *
 * The pictures are pen drawings in white ink, made by the same model with
 * `scripts/generate-feature-art.py` - the marks' style at the detail of an
 * engraving. They replaced renders of the real mockups
 * (`scripts/generate-feature-shots.mjs`, `npm run features`, still in
 * public/features). Either way not live canvases: four more WebGL contexts to
 * illustrate four sentences would cost the page more than the carousel above
 * them does. `width` and `height` are the files' own, so the browser reserves
 * each one's box before it loads.
 */
const FEATURES = [
  {
    title: 'Rendering',
    mark: { src: '/features/line-rendering.webp', width: 197, height: 216 },
    image: {
      src: '/features/pen-rendering.webp',
      width: 940,
      height: 1000,
      alt: 'A pen drawing of the back of a phone, its camera plateau lit by a studio softbox',
    },
    body: (
      <>
        WebGL through three.js and react-three-fiber: physically-based materials, studio
        lighting and soft contact shadows, rendered only when something moves, with
        device-pixel-ratio clamping to keep hi-dpi screens cheap.
      </>
    ),
  },
  {
    title: 'Live screen content',
    mark: { src: '/features/line-live-screen.webp', width: 279, height: 216 },
    image: {
      src: '/features/pen-live-screen.webp',
      width: 1000,
      height: 740,
      alt: 'A pen drawing of a laptop showing a website with a video player on its screen',
    },
    body: (
      <>
        Pass React components, video or an <code>&lt;iframe&gt;</code> as children: it stays
        live DOM, CSS3D-transformed onto the glass, with state and playback running.
        Screens are display-only by default - a drag orbits the device. The experimental{' '}
        <code>experimentalScreenInput</code> prop lets them take clicks, scrolling and typing.
      </>
    ),
  },
  {
    title: 'Procedural objects',
    mark: { src: '/features/line-procedural.webp', width: 171, height: 216 },
    image: {
      src: '/features/pen-procedural.webp',
      width: 1000,
      height: 385,
      alt: 'A pen drawing of a city bus with a blank side advert panel, over construction lines',
    },
    body: (
      <>
        Every phone, laptop, carton and billboard is built from geometry at runtime: no GLB
        to download, nothing to host.
      </>
    ),
  },
  {
    title: 'Composable',
    mark: { src: '/features/line-composable.webp', width: 360, height: 216 },
    image: {
      src: '/features/pen-composable.webp',
      width: 1000,
      height: 706,
      alt: 'A pen drawing of a laptop and a phone side by side, joined by dotted guide lines',
    },
    body: (
      <>
        Take the one-liner <code>&lt;GalaxyMockup&gt;</code>, or compose{' '}
        <code>&lt;MockupCanvas&gt;</code> and <code>&lt;Galaxy&gt;</code> into a three.js
        scene you already have.
      </>
    ),
  },
]

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
            command,
            code: <CodeBlock code={command} lang="bash" />,
          }))}
        />
        <div className="code-panel">
          <div className="code-panel-head">
            <span className="code-panel-label">App.tsx</span>
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

/** The film, from R2 (`app/media/[name]/route.ts`), and its poster, a static asset. */
const FILM = { src: '/media/react-3d-mockups.mp4', poster: '/promo/react-3d-mockups-poster.webp' }

/**
 * The library's film: 38 seconds of the catalogue and the features, every
 * frame of it a react-3d-mockups component rendered to video with Remotion
 * (`examples/remotion`, `PromoFilm`). A plain `<video>` (see `FilmPlayer`
 * for the cover that starts it): the file is served
 * from R2 with byte ranges, so it starts playing before it has downloaded
 * and seeks without a player library, Safari included. `preload="none"`
 * keeps its ten-odd megabytes off the page until
 * someone presses play; the poster and the box's aspect ratio hold its
 * place, so nothing shifts when it does.
 */
function Film() {
  return (
    <section className="film" aria-labelledby="film-title">
      <div className="film-copy">
        <h2 id="film-title">A 38-second film</h2>
        <p>
          Every device and object in the film is a react-3d-mockups component, rendered to video
          with Remotion. Its{' '}
          <a className="accent-link" href={`${GITHUB_URL}/tree/main/examples/remotion`}>
            source is in the repository
          </a>
          .
        </p>
      </div>
      <FilmPlayer
        src={asset(FILM.src)}
        poster={asset(FILM.poster)}
        duration="0:38"
        label="The react-3d-mockups film: the catalogue of 3D models and the library's features"
      />
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

      <Film />

      <section className="features" aria-label="What the library does">
        {FEATURES.map((feature) => (
          <article className="feature" key={feature.title}>
            <div className="feature-copy">
              <img
                className="feature-mark"
                src={asset(feature.mark.src)}
                width={Math.round(feature.mark.width / 3)}
                height={feature.mark.height / 3}
                alt=""
                loading="lazy"
                decoding="async"
              />
              <h2>{feature.title}</h2>
              <p>{feature.body}</p>
            </div>
            <figure className="feature-figure">
              <img
                src={asset(feature.image.src)}
                width={feature.image.width}
                height={feature.image.height}
                alt={feature.image.alt}
                loading="lazy"
                decoding="async"
              />
            </figure>
          </article>
        ))}
      </section>

    </>
  )
}
