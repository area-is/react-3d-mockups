'use client'

import { AppleWatchMockup, GalaxyTabMockup, StudioDisplayMockup, TVSetMockup } from 'react-3d-mockups'
import { useNarrow } from '../_shared/use-narrow'
import { FrameArt, Screensaver, TabletFrame, WatchArt } from './ambient-art'
import { FINISHES, findChannel, type Settings } from './ambient-data'

/**
 * The four screens Ambient runs on. The Frame hangs flush on the wall
 * with no stand, so the hero is a picture on a wall; its bezel is the
 * page's finish. Every surface background is the channel's ground, so
 * the moment before a pattern paints is the right colour.
 */

export function FrameScene({ settings }: { settings: Settings }) {
  const narrow = useNarrow()
  const finish = FINISHES.find((f) => f.id === settings.finish) ?? FINISHES[0]
  return (
    <TVSetMockup
      float
      variant="frame"
      size={55}
      color={finish.color}
      surfaceBackground={findChannel(settings.channel).palette[0]}
      rotation={[0, -0.14, 0]}
      camera={narrow ? undefined : { position: [0, 0.2, 5.6], fov: 40 }}
    >
      <FrameArt settings={settings} />
    </TVSetMockup>
  )
}

export function DeskScene({ settings }: { settings: Settings }) {
  return (
    <StudioDisplayMockup float surfaceBackground={findChannel(settings.channel).palette[0]} rotation={[0, -0.22, 0]}>
      <Screensaver settings={settings} />
    </StudioDisplayMockup>
  )
}

export function TabletScene({ settings }: { settings: Settings }) {
  return (
    <GalaxyTabMockup float variant="tabs11" orientation="landscape" color="silver" surfaceBackground="#f2efe8" rotation={[0, 0.24, 0]} camera={{ position: [0, 0.4, 6.6], fov: 40 }}>
      <TabletFrame settings={settings} />
    </GalaxyTabMockup>
  )
}

export function WristScene({ settings }: { settings: Settings }) {
  return (
    <AppleWatchMockup float color="silver" bandColor="#d9d4c8" surfaceBackground={findChannel(settings.channel).palette[0]} rotation={[0, 0.3, 0]}>
      <WatchArt settings={settings} />
    </AppleWatchMockup>
  )
}
