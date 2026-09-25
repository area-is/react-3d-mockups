import type { Metadata } from 'next'
import Link from 'next/link'
import { TabbiedLink } from '../_shared/badge'
import { exampleMetadata } from '../_shared/metadata'
import { MarkSwatch, Stage, type SceneName } from './campaign-client'
import { FESTIVAL, INKS } from './campaign-identity'

export const metadata: Metadata = exampleMetadata('campaign', {
  title: 'Aperture Festival - campaign example | React 3D Mockups',
  description:
    'An isolated example page: a studio case study rolling one generative identity across a billboard, a bus shelter, a digital totem, a phone, a tote, a crew pass and a roll-up, built with react-3d-mockups and tabbied.',
})

/**
 * Every object the identity is shown on, in the order the page walks the
 * city: the biggest first, the ones a visitor holds last.
 */
const PIECES: { scene: SceneName; title: string; note: string }[] = [
  {
    scene: 'shelter',
    title: 'Bus shelter',
    note: 'A backlit 6-sheet on both faces of the lightbox. The arrivals board is real DOM too: three strings, and the shelter draws them as an LED display.',
  },
  {
    scene: 'totem',
    title: 'Digital totem',
    note: 'Double-sided, and live. The front is the poster redrawing itself every few seconds; the back is Friday’s running order. Turn it to see both.',
  },
  {
    scene: 'phone',
    title: 'The app',
    note: 'Tonight’s running order in the identity, with the mark live in the hero band and the system status bar drawn over it.',
  },
  {
    scene: 'tote',
    title: 'Tote',
    note: 'Two inks on a black bag. The face is transparent, so the bag’s own stock is the margin and the rings print in acid and bone.',
  },
  {
    scene: 'pass',
    title: 'Crew pass',
    note: 'An all-areas badge on an acid lanyard. The print wraps the punched slot, exactly as an edge-to-edge badge does.',
  },
  {
    scene: 'banner',
    title: 'Wayfinding',
    note: 'A roll-up at the gates. Same mark, same inks, one arrow.',
  },
]

/**
 * A complete, isolated case-study page: a design studio presenting one
 * generative identity across seven objects, each a live 3D mockup. The
 * point is the repetition - every surface renders the same React component
 * from campaign-art.tsx, seeded on paper and live on glass - and the
 * scrolling layout, where each scene is mounted only when it is near.
 */
export default function CampaignExamplePage() {
  return (
    <main className="cp">
      <header className="cp-top">
        <span className="cp-brand">
          <span className="cp-brand-mark" aria-hidden />
          Raster Studio
        </span>
        <span className="cp-crumb">
          Work <span aria-hidden>/</span> Aperture Festival 2026
        </span>
      </header>

      <section className="cp-hero">
        <p className="cp-eyebrow">Case study · Identity, campaign &amp; wayfinding</p>
        <h1>
          One pattern.
          <br />
          Every surface in the city.
        </h1>
        <p className="cp-lede">
          {FESTIVAL.name} is {FESTIVAL.tagline.toLowerCase()} on the Lisbon docks. It needed an identity that could be a
          billboard on Tuesday and a crew pass on Friday, so we built it from a single generative mark, four inks and
          a wordmark, and shipped it as one React component.
        </p>
      </section>

      <section className="cp-bulletin" aria-label="The campaign billboard">
        <div className="cp-bulletin-stage">
          <Stage scene="bulletin" />
        </div>
        <p className="cp-caption">14 × 48 ft bulletin, A2 westbound. Drag to walk around it.</p>
      </section>

      <section className="cp-system">
        <div className="cp-system-copy">
          <h2>The system</h2>
          <p>
            Three parts, and nothing that has to be exported. The mark is generated, so it is never the same twice
            and never wrong; the inks are four; the wordmark is one word. Every application on this page is that
            component rendering into a differently shaped box.
          </p>
        </div>
        <div className="cp-system-grid">
          <article className="cp-part">
            <div className="cp-swatch">
              <MarkSwatch />
            </div>
            <h3>The mark</h3>
            <p>
              <em>Nutation</em>, from <TabbiedLink />: lines radiating from a point and turning slightly off it, the way
              light leaves an aperture. Seeded on paper, live on glass.
            </p>
          </article>
          <article className="cp-part">
            <div className="cp-inks">
              {INKS.map((ink) => (
                <div key={ink.name} className="cp-ink" style={{ background: ink.hex }}>
                  <span>{ink.name}</span>
                  <code>{ink.hex}</code>
                </div>
              ))}
            </div>
            <h3>The inks</h3>
            <p>Night for the ground, acid for the one loud thing on any surface, rose and sky for the mark, bone for the type.</p>
          </article>
          <article className="cp-part">
            <div className="cp-wordmark">
              <span className="cp-wordmark-name">{FESTIVAL.name}</span>
              <span className="cp-wordmark-dates">{FESTIVAL.dates}</span>
              <span className="cp-wordmark-place">{FESTIVAL.place}</span>
            </div>
            <h3>The wordmark</h3>
            <p>Inter at its heaviest, set tight. It holds at eight feet on the bulletin and at eight millimetres on the pass.</p>
          </article>
        </div>
      </section>

      <section className="cp-city">
        <div className="cp-city-head">
          <h2>Across the city</h2>
          <p>
            Every object below is a live mockup wearing the same component. The printed pieces pin their seed, so the
            6-sheet is the same 6-sheet on every visit; the screens read a shared clock and recompose together. Drag
            any of them.
          </p>
        </div>
        <div className="cp-grid">
          {PIECES.map((piece) => (
            <article className="cp-piece" key={piece.scene}>
              <div className="cp-stage">
                <Stage scene={piece.scene} />
              </div>
              <div className="cp-piece-meta">
                <strong>{piece.title}</strong>
                <span>{piece.note}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="cp-foot">
        <div className="cp-credits">
          <span>
            <strong>Client</strong> Aperture Festival, a fiction
          </span>
          <span>
            <strong>Identity</strong> Raster Studio, another
          </span>
          <span>
            <strong>Patterns</strong> <TabbiedLink>tabbied</TabbiedLink>
          </span>
          <span>
            <strong>Mockups</strong> react-3d-mockups
          </span>
        </div>
        <Link href="/docs">Read the react-3d-mockups docs →</Link>
      </footer>
    </main>
  )
}
