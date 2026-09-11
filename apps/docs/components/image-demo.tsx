'use client'

import type { CSSProperties } from 'react'
import {
  IPhoneMockup,
  LaptopMockup,
  PosterFrameMockup,
  ShoppingBagMockup,
  VinylRecordMockup,
} from 'react-3d-mockups'
import { LazyScene } from './lazy-scene'

/**
 * The live half of the Images guide: one mockup per example, each carrying a
 * plain `<img>` on its surface. The pictures are the same files the page's
 * snippets name (`/art/*.webp`), so what the snippet says and what the stage
 * shows can never be two different things.
 *
 * Each example is its own canvas, mounted only while it is near the viewport
 * (`LazyScene`) - the same discipline the prop explorer keeps, for the same
 * reason: browsers cap live WebGL contexts and kill the oldest one silently.
 */

/** Full-bleed picture: the surface is the frame, so the image fills it. */
const cover: CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }

const EXAMPLES = {
  poster: () => (
    <PosterFrameMockup float>
      <img src="/art/poster.webp" alt="" style={cover} />
    </PosterFrameMockup>
  ),
  wallpaper: () => (
    <IPhoneMockup variant="pro" color="deepblue" statusBar float>
      <img src="/art/wallpaper.webp" alt="" style={cover} />
    </IPhoneMockup>
  ),
  album: () => (
    <VinylRecordMockup float>
      <img src="/art/album.webp" alt="" style={cover} />
    </VinylRecordMockup>
  ),
  laptop: () => (
    <LaptopMockup variant="air15" float>
      <img src="/art/coffee.webp" alt="" style={cover} />
    </LaptopMockup>
  ),
  bag: () => (
    <ShoppingBagMockup color="#c19a6b" surfaceBackground="#c19a6b" float>
      {/* A transparent PNG/WebP sits on the board: the surface background is
          the bag's own colour, so everything the picture leaves clear is kraft. */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '18% 14%',
          boxSizing: 'border-box',
        }}
      >
        <img src="/art/fox.webp" alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
    </ShoppingBagMockup>
  ),
} as const

export type ImageExample = keyof typeof EXAMPLES

export function ImageDemo({ example, height = 440 }: { example: ImageExample; height?: number }) {
  const Scene = EXAMPLES[example]
  return (
    <div className="img-demo" style={{ height }}>
      <LazyScene>
        <Scene />
      </LazyScene>
    </div>
  )
}
