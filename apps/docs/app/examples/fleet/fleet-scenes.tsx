'use client'

import { GalaxyMockup, MailerBoxMockup, SemiTrailerMockup, VanMockup } from 'react-3d-mockups'
import { useNarrow } from '../_shared/use-narrow'
import { BoxEnd, BoxSide, BoxTop, Rear, Side, TrackApp } from './fleet-art'
import { COMPANY, type CoverageId, type Livery } from './fleet-data'

/**
 * The fleet, dressed. Every vehicle reads the page's livery, and the van
 * reads its coverage too: `panel` keeps the wrap clear of the arches, the
 * lights and the glass, `full` runs it corner post to corner post with the
 * hardware remounted over it, `perforated` carries it over the cab glass
 * as window film. The mockup does the carving; the wrap is the same
 * component in all three.
 */

/**
 * The hero. A 53 ft trailer's own framing fits its whole length into the
 * canvas height, which on a wide stage leaves it small in the middle; on a
 * wide screen the camera comes in so the side fills most of the width. A
 * phone keeps the stock framing, where the same pose would crop both ends.
 */
export function TrailerScene({ livery }: { livery: Livery }) {
  const narrow = useNarrow()
  return (
    <SemiTrailerMockup
      float
      color={livery.body}
      skirtColor={livery.ink}
      surfaceBackground={livery.body}
      rotation={[0, -0.36, 0]}
      camera={narrow ? undefined : { position: [0, 0.4, 7.2], fov: 40 }}
    >
      <SemiTrailerMockup.CurbSide>
        <Side livery={livery} seed="northline-curb" />
      </SemiTrailerMockup.CurbSide>
      <SemiTrailerMockup.StreetSide>
        <Side livery={livery} seed="northline-street" mirror />
      </SemiTrailerMockup.StreetSide>
      <SemiTrailerMockup.Rear>
        <Rear livery={livery} seed="northline-rear" />
      </SemiTrailerMockup.Rear>
    </SemiTrailerMockup>
  )
}

export function VanScene({ livery, coverage }: { livery: Livery; coverage: CoverageId }) {
  return (
    <VanMockup float color={livery.body} coverage={coverage} surfaceBackground={livery.body} rotation={[0, -0.55, 0]}>
      {/* On a full wrap the surface runs over the cab, whose glass is cut
          out; the panel wrap stops at the box, so nothing to reserve. */}
      <VanMockup.CurbSide>
        <Side livery={livery} seed="northline-van-curb" cab={coverage === 'panel' ? 0 : 0.24} />
      </VanMockup.CurbSide>
      <VanMockup.StreetSide>
        <Side livery={livery} seed="northline-van-street" mirror cab={coverage === 'panel' ? 0 : 0.24} />
      </VanMockup.StreetSide>
      <VanMockup.Rear>
        <Rear livery={livery} seed="northline-van-rear" />
      </VanMockup.Rear>
      <VanMockup.LicensePlate>{COMPANY.plate}</VanMockup.LicensePlate>
    </VanMockup>
  )
}

export function BoxScene({ livery }: { livery: Livery }) {
  return (
    <MailerBoxMockup float color="#e9e5dc" tapeColor="rgba(20, 33, 61, 0.55)" surfaceBackground={livery.body} rotation={[0, 0.4, 0]}>
      <MailerBoxMockup.Top>
        <BoxTop livery={livery} />
      </MailerBoxMockup.Top>
      <MailerBoxMockup.Front>
        <BoxSide livery={livery} />
      </MailerBoxMockup.Front>
      <MailerBoxMockup.Back>
        <BoxSide livery={livery} />
      </MailerBoxMockup.Back>
      <MailerBoxMockup.Left>
        <BoxEnd livery={livery} />
      </MailerBoxMockup.Left>
      <MailerBoxMockup.Right>
        <BoxEnd livery={livery} />
      </MailerBoxMockup.Right>
    </MailerBoxMockup>
  )
}

export function PhoneScene({ livery }: { livery: Livery }) {
  return (
    <GalaxyMockup float variant="s26" color="silvershadow" statusBar={{ color: '#14213d' }} surfaceBackground="#f4f5f7" rotation={[0, -0.3, 0]}>
      <TrackApp livery={livery} />
    </GalaxyMockup>
  )
}
