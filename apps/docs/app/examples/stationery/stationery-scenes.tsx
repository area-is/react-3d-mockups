'use client'

import { AFrameSignMockup, BusinessCardMockup, GreetingCardMockup, PosterFrameMockup } from 'react-3d-mockups'
import { InviteBack, InviteFront, InviteInsideLeft, InviteInsideRight, ReplyBack, ReplyFront, SignBack, TablePlan, WelcomeSign } from './stationery-art'
import { PALETTES, type Suite } from './stationery-data'

/**
 * The four pieces on four canvases. The stock of each is the palette's
 * paper, painted as the surface background, so an empty panel is paper
 * rather than white.
 */

const paper = (suite: Suite) => (PALETTES.find((p) => p.id === suite.palette) ?? PALETTES[0]).paper

export function InviteScene({ suite }: { suite: Suite }) {
  return (
    <GreetingCardMockup float color={paper(suite)} surfaceBackground={paper(suite)} openAngle={70} rotation={[0, -0.35, 0]}>
      <GreetingCardMockup.Front>
        <InviteFront suite={suite} />
      </GreetingCardMockup.Front>
      <GreetingCardMockup.InsideLeft>
        <InviteInsideLeft suite={suite} />
      </GreetingCardMockup.InsideLeft>
      <GreetingCardMockup.InsideRight>
        <InviteInsideRight suite={suite} />
      </GreetingCardMockup.InsideRight>
      <GreetingCardMockup.Back>
        <InviteBack suite={suite} />
      </GreetingCardMockup.Back>
    </GreetingCardMockup>
  )
}

export function ReplyScene({ suite }: { suite: Suite }) {
  return (
    <BusinessCardMockup float color={paper(suite)} surfaceBackground={paper(suite)} rotation={[-0.12, -0.3, 0]}>
      <BusinessCardMockup.Front>
        <ReplyFront suite={suite} />
      </BusinessCardMockup.Front>
      <BusinessCardMockup.Back>
        <ReplyBack suite={suite} />
      </BusinessCardMockup.Back>
    </BusinessCardMockup>
  )
}

export function SignScene({ suite }: { suite: Suite }) {
  return (
    <AFrameSignMockup float color="#e8e2d6" surfaceBackground={paper(suite)} rotation={[0, -0.25, 0]}>
      <AFrameSignMockup.Front>
        <WelcomeSign suite={suite} />
      </AFrameSignMockup.Front>
      <AFrameSignMockup.Back>
        <SignBack suite={suite} />
      </AFrameSignMockup.Back>
    </AFrameSignMockup>
  )
}

export function PlanScene({ suite }: { suite: Suite }) {
  return (
    <PosterFrameMockup float color="#e9e3d8" mat surfaceBackground={paper(suite)} rotation={[0, 0.22, 0]}>
      <TablePlan suite={suite} />
    </PosterFrameMockup>
  )
}
