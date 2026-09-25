'use client'

import dynamic from 'next/dynamic'
import { SceneBoundary } from './scene-boundary'
import { CarouselHintText } from './carousel-hint'

/**
 * The carousel's frame before the carousel exists: the same rows with the same
 * classes - readout bar, stage, foot - held invisible where there is nothing
 * to show yet (the gesture hint included: it arrives with the model it is
 * about), plus a loading line on the stage.
 *
 * This is what the server renders, and what stands in while the scene's chunk
 * loads and WebGL is probed. It used to be nothing at all: the first paint put
 * the features list directly under the headline, and when the stage arrived a
 * second later it pushed everything below it down by the height of the stage -
 * a layout shift of 0.64 on its own. Built from the real rows rather than a
 * guessed height, it is as tall as the carousel at every breakpoint, because
 * the stylesheet sizing one sizes the other.
 */
function CarouselPlaceholder() {
  return (
    <section className="carousel" aria-label="Mockup carousel" aria-busy="true">
      <div className="carousel-bar">
        <div className="carousel-nav">
          <span className="carousel-arrow carousel-hold" aria-hidden />
          <p className="carousel-readout" />
          <span className="carousel-arrow carousel-hold" aria-hidden />
        </div>
        <div className="carousel-finishes carousel-hold" aria-hidden>
          <span className="carousel-swatches">
            <span className="carousel-swatch" />
          </span>
        </div>
      </div>
      <div className="carousel-viewport">
        <div className="carousel-stage">
          <div className="carousel-loading">Warming up the GPU…</div>
        </div>
      </div>
      <div className="carousel-foot">
        <div className="carousel-tools carousel-hold" aria-hidden>
          <span className="carousel-tool">Pause</span>
          <span className="carousel-tools-rule" />
          <span className="carousel-tool">Copy code</span>
        </div>
        <p className="carousel-hint carousel-hold">
          <CarouselHintText />
        </p>
      </div>
    </section>
  )
}

// WebGL only exists in the browser, so skip SSR for the carousel scene.
const CarouselScene = dynamic(() => import('./scenes/carousel-scene'), {
  ssr: false,
  loading: () => <CarouselPlaceholder />,
})

export function HeroCarousel() {
  return (
    <SceneBoundary placeholder={<CarouselPlaceholder />}>
      <CarouselScene />
    </SceneBoundary>
  )
}
