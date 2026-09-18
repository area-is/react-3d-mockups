'use client'

import { BusMockup, GalaxyWatchMockup, IDCardMockup, TVSetMockup } from 'react-3d-mockups'
import { useNarrow } from '../_shared/use-narrow'
import { Broadcast, CoachRear, CoachSide, SeasonPass, WatchTracker } from './matchday-art'
import { CLUB } from './matchday-data'

/**
 * The club's four objects. The coach is wrapped `perforated`: the film
 * runs over the passenger glass as it does on a real coach, while the
 * doors and the driver's window stay clear, which is why the side art is
 * laid out in zones. Its destination sign is an array of strings, which
 * the bus flips between like an alternating sign. The broadcast and the
 * watch take the page's running clock.
 */

export function CoachScene() {
  const narrow = useNarrow()
  return (
    <BusMockup
      float
      coverage="perforated"
      color={CLUB.green}
      surfaceBackground={CLUB.green}
      rotation={[0, -0.42, 0]}
      // A bus is long; its stock framing leaves it small on a wide stage.
      camera={narrow ? undefined : { position: [0, 0.6, 7.4], fov: 40 }}
    >
      <BusMockup.CurbSide>
        <CoachSide doors />
      </BusMockup.CurbSide>
      <BusMockup.StreetSide>
        <CoachSide />
      </BusMockup.StreetSide>
      <BusMockup.Rear>
        <CoachRear />
      </BusMockup.Rear>
      <BusMockup.DestinationSign>{['MATCH DAY', 'ALCÂNTARA FC', 'KICK OFF 15:00']}</BusMockup.DestinationSign>
    </BusMockup>
  )
}

export function BroadcastScene({ seconds }: { seconds: number }) {
  const narrow = useNarrow()
  return (
    <TVSetMockup float variant="legs" size={65} color="#15171b" surfaceBackground={CLUB.deep} rotation={[0, -0.18, 0]} camera={narrow ? undefined : { position: [0, 0.3, 6.4], fov: 40 }}>
      <Broadcast seconds={seconds} />
    </TVSetMockup>
  )
}

export function WatchScene({ seconds }: { seconds: number }) {
  return (
    <GalaxyWatchMockup float variant="watch8" color="graphite" bandColor={CLUB.green} surfaceBackground="#000" rotation={[0, 0.3, 0]}>
      <WatchTracker seconds={seconds} />
    </GalaxyWatchMockup>
  )
}

export function PassScene() {
  return (
    <IDCardMockup float color="#0e3a22" lanyardColor={CLUB.gold} surfaceBackground={CLUB.green} rotation={[0, -0.25, 0.04]}>
      <SeasonPass />
    </IDCardMockup>
  )
}
