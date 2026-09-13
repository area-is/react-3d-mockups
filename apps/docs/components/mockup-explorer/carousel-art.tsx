'use client'

import type { ReactNode } from 'react'
import {
  SwissBill,
  SwissChecker,
  SwissDialA,
  SwissEpicentre,
  SwissField,
  SwissRaster,
  SwissRhythm,
  SwissRotation,
} from '../screens/swiss-art'
import { JacketBack, JacketCover, JacketSpine } from '../screens/book-jacket'
import { SleeveBack, SleeveCover, SleeveLabelA, SleeveLabelB } from '../screens/record-sleeve'
import { Newspaper, SwissSite, WatchFace } from '../screens/device-apps'
import { CartonBack, CartonFacts, CartonFront, CartonRoof, CartonStory } from '../screens/carton-art'
import {
  BagBack,
  BagFront,
  CerealBack,
  CerealFacts,
  CerealFront,
  CerealStory,
  CerealTop,
  MailerEnd,
  MailerFront,
  MailerLid,
} from '../screens/package-art'
import { ChalkHoursArt, ChalkMenuArt } from '../screens/print-art'

/**
 * What the home page's carousel puts on each object - so that an object's own
 * reference page can stage exactly the same thing.
 *
 * The carousel is the best argument this library has: eighteen objects, every
 * surface real DOM, the screens redrawing themselves. The reference pages used
 * to answer it with `LiveCounter` and `SurfaceArt` - a seconds counter and a
 * labelled swatch. Both are honest demos of the mechanism and neither shows
 * what the mechanism is *for*, so somebody who arrived from the carousel and
 * clicked through to the component found a plainer thing than the one that
 * brought them. Now the page stages the carousel's own artwork, and the
 * surface tabs print its source, which is the answer to "how is that done".
 *
 * ### Names, not nodes
 *
 * The map holds component *names* rather than elements, because a name is
 * worth two things here: `ART` below turns it into the live surface, and
 * `SCREEN_SOURCES` turns it into the source the tab shows. Keying on the
 * element would have meant a second table for the label, free to disagree
 * with the first.
 *
 * That second half is generated: `scripts/extract-demo-sources.mjs` reads the
 * imports at the top of THIS file to learn which components can be staged,
 * then walks each one's own imports and collects everything it is built from.
 * So a piece added to the carousel is a piece whose whole source the tab
 * already knows how to print - there is no list of art files to keep up.
 *
 * ### It is a second list, and that is the cost
 *
 * `carousel-scene.tsx` has its own table of what goes on what. This one is
 * keyed by the explorer's `kind` and by region, because the carousel stages
 * one variant per family and only its primary face, while a reference page
 * has every variant and every region - so neither table is derivable from the
 * other. They share the artwork components themselves, which is the part that
 * matters; what can drift is only which piece goes where, and a piece landing
 * on the wrong page is visible the moment anybody looks at it.
 */

/** Region name → the artwork component the carousel stages there. */
export type CarouselFaces = Readonly<Record<string, string>>

export const CAROUSEL_ART: Readonly<Record<string, CarouselFaces>> = {
  // Devices carry one region, `screen`.
  galaxy: { screen: 'SwissRotation' },
  iphone: { screen: 'SwissRaster' },
  fold: { screen: 'Newspaper' },
  flip: { screen: 'SwissField' },
  laptop: { screen: 'SwissSite' },
  ipad: { screen: 'SwissEpicentre' },
  galaxyTab: { screen: 'SwissChecker' },
  appleWatch: { screen: 'SwissDialA' },
  galaxyWatch: { screen: 'WatchFace' },
  studioDisplay: { screen: 'SwissRhythm' },

  // Print objects carry as many faces as the thing has.
  book: { cover: 'JacketCover', spine: 'JacketSpine', back: 'JacketBack' },
  vinylRecord: {
    cover: 'SleeveCover',
    back: 'SleeveBack',
    label: 'SleeveLabelA',
    backLabel: 'SleeveLabelB',
  },
  milkCarton: {
    front: 'CartonFront',
    right: 'CartonFacts',
    left: 'CartonStory',
    back: 'CartonBack',
    gableFront: 'CartonRoof',
  },
  productBox: {
    front: 'CerealFront',
    right: 'CerealFacts',
    left: 'CerealStory',
    top: 'CerealTop',
    back: 'CerealBack',
  },
  mailerBox: { top: 'MailerLid', front: 'MailerFront', right: 'MailerEnd', left: 'MailerEnd' },
  shoppingBag: { front: 'BagFront', back: 'BagBack' },
  posterFrame: { poster: 'SwissBill' },
  aFrameSign: { front: 'ChalkMenuArt', back: 'ChalkHoursArt' },
}

/**
 * Name → element, given the finish currently selected.
 *
 * The pieces that print onto the material take it (`material`, or `cloth` for
 * the book's jacket, which is a sheet wrapped around one); the pieces that are
 * their own sheet ignore it. That split is the same one the carousel makes.
 */
const ART: Readonly<Record<string, (finish: string) => ReactNode>> = {
  SwissRotation: () => <SwissRotation />,
  SwissRaster: () => <SwissRaster />,
  SwissField: () => <SwissField />,
  SwissEpicentre: () => <SwissEpicentre />,
  SwissChecker: () => <SwissChecker />,
  SwissDialA: () => <SwissDialA />,
  SwissRhythm: () => <SwissRhythm />,
  SwissBill: () => <SwissBill />,
  Newspaper: () => <Newspaper />,
  SwissSite: () => <SwissSite />,
  WatchFace: () => <WatchFace />,

  JacketCover: (finish) => <JacketCover cloth={finish} />,
  JacketSpine: (finish) => <JacketSpine cloth={finish} />,
  JacketBack: (finish) => <JacketBack cloth={finish} />,

  SleeveCover: () => <SleeveCover />,
  SleeveBack: () => <SleeveBack />,
  SleeveLabelA: () => <SleeveLabelA />,
  SleeveLabelB: () => <SleeveLabelB />,

  CartonFront: (finish) => <CartonFront material={finish} />,
  CartonFacts: (finish) => <CartonFacts material={finish} />,
  CartonStory: (finish) => <CartonStory material={finish} />,
  CartonBack: (finish) => <CartonBack material={finish} />,
  CartonRoof: (finish) => <CartonRoof material={finish} />,

  CerealFront: (finish) => <CerealFront material={finish} />,
  CerealFacts: (finish) => <CerealFacts material={finish} />,
  CerealStory: (finish) => <CerealStory material={finish} />,
  CerealTop: (finish) => <CerealTop material={finish} />,
  CerealBack: (finish) => <CerealBack material={finish} />,

  MailerLid: (finish) => <MailerLid material={finish} />,
  MailerFront: (finish) => <MailerFront material={finish} />,
  MailerEnd: (finish) => <MailerEnd material={finish} />,

  BagFront: (finish) => <BagFront material={finish} />,
  BagBack: (finish) => <BagBack material={finish} />,

  ChalkMenuArt: () => <ChalkMenuArt />,
  ChalkHoursArt: () => <ChalkHoursArt />,
}

/**
 * Which component the carousel stages on one region of one kind, or `null`
 * where there is none - an object the carousel does not stage, or a face it
 * does not print. The caller falls back to its own demo content there, which
 * is what keeps this an enhancement rather than a dependency.
 *
 * Separate from `carouselArtNode` so the source panel can ask for the name
 * without building an element it will not render.
 */
export function carouselArtName(kind: string, region: string): string | null {
  const name = CAROUSEL_ART[kind]?.[region]
  return name && ART[name] ? name : null
}

/** The live surface for a name from `carouselArtName`, on the given finish. */
export function carouselArtNode(name: string, finish: string): ReactNode {
  return ART[name]?.(finish) ?? null
}
