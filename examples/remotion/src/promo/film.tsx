import * as React from 'react'
import { linearTiming, TransitionSeries } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import { slide } from '@remotion/transitions/slide'
import { wipe } from '@remotion/transitions/wipe'
import type { TransitionPresentation } from '@remotion/transitions'
import { EndCard, TitleCard } from './cards'
import { DocsFonts } from './docs-fonts'
import { FontGate } from '../campaigns/kit'
import { PROMO_FONTS } from './brand'
import { ComposeShot } from './shots/compose'
import { LiveDomShot } from './shots/live-dom'
import { OneComponentShot } from './shots/one-component'
import { CatalogueShot, CATALOGUE_LENGTH } from './shots/catalogue'
import { ProceduralShot } from './shots/procedural'
import { SitesShot } from './shots/sites'
import { VideoShot } from './shots/video'

/*
 * REACT 3D MOCKUPS - the library's own film.
 *
 * Cut to a 120 BPM grid: a beat is 15 frames and a bar 60, and every shot is
 * a whole number of bars, so music made for the film later can land its
 * downbeats on the cuts. Each transition starts on a bar line: a shot runs
 * its bars plus the transition's length, and the next one starts as the
 * transition does.
 *
 * Nineteen bars, 38 seconds: a bar for the title, four for the catalogue (a
 * family every two beats), two for each feature and two for the end card.
 */

export const BEAT = 15
export const BAR = 60
const T = 8

interface Shot {
  id: string
  bars: number
  /** Given the frame the shot starts on in the film. */
  render: (start: number) => React.ReactNode
  /** How the cut into the next shot is made. */
  into?: TransitionPresentation<Record<string, unknown>>
}

const SHOTS: Shot[] = [
  { id: 'title', bars: 1, render: () => <TitleCard />, into: fade() as never },
  { id: 'one-component', bars: 2, render: () => <OneComponentShot />, into: slide({ direction: 'from-right' }) as never },
  { id: 'catalogue', bars: CATALOGUE_LENGTH / BAR, render: () => <CatalogueShot />, into: wipe({ direction: 'from-left' }) as never },
  { id: 'live-dom', bars: 2, render: () => <LiveDomShot />, into: slide({ direction: 'from-bottom' }) as never },
  { id: 'procedural', bars: 2, render: () => <ProceduralShot />, into: wipe({ direction: 'from-right' }) as never },
  { id: 'compose', bars: 2, render: () => <ComposeShot />, into: slide({ direction: 'from-right' }) as never },
  { id: 'video', bars: 2, render: (start) => <VideoShot start={start} total={PROMO_DURATION} />, into: fade() as never },
  { id: 'sites', bars: 2, render: () => <SitesShot />, into: fade() as never },
  { id: 'end', bars: 2, render: () => <EndCard /> },
]

export const PROMO_DURATION = SHOTS.reduce((n, shot) => n + shot.bars * BAR, 0)

/** The frame each shot starts on, for anything placed against the film's timeline. */
export const PROMO_STARTS: Record<string, number> = Object.fromEntries(
  SHOTS.map((shot, i) => [shot.id, SHOTS.slice(0, i).reduce((n, s) => n + s.bars * BAR, 0)])
)

export function PromoFilm() {
  const timing = linearTiming({ durationInFrames: T })
  return (
    <DocsFonts>
      <FontGate fonts={PROMO_FONTS}>
        <TransitionSeries>
          {SHOTS.flatMap((shot, i) => {
            const last = i === SHOTS.length - 1
            const parts = [
              <TransitionSeries.Sequence key={shot.id} durationInFrames={shot.bars * BAR + (last ? 0 : T)} name={shot.id}>
                {shot.render(PROMO_STARTS[shot.id]!)}
              </TransitionSeries.Sequence>,
            ]
            if (!last) parts.push(<TransitionSeries.Transition key={`${shot.id}-into`} presentation={shot.into ?? fade()} timing={timing} />)
            return parts
          })}
        </TransitionSeries>
      </FontGate>
    </DocsFonts>
  )
}
