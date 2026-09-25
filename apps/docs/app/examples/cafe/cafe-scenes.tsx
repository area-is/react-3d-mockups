'use client'

import { AFrameSignMockup, BusinessCardMockup, MilkCartonMockup, StorefrontMockup } from 'react-3d-mockups'
import { BOARD, BoardBack, BoardFront, CREAM, CardBack, CardFront, CartonFace, CartonGable, Door, Fascia, WindowPoster } from './cafe-art'

/**
 * Ninefold's four objects, each on its own canvas. The storefront reads
 * the page's two controls - whether the shop is open, and what colour it is
 * painted - and the loyalty card's back is painted to match, because a
 * shop that repaints its front reprints its cards.
 */

/** The glazing tint, lit and unlit - the panes' material and the door's paint. */
const GLASS_OPEN = '#5a6d75'
const GLASS_CLOSED = '#3a4448'

export function StorefrontScene({ open, paint }: { open: boolean; paint: string }) {
  // Every pane is the glass tint with its vinyl on it, not a sheet over it.
  const glass = open ? GLASS_OPEN : GLASS_CLOSED
  return (
    <StorefrontMockup
      float
      color={paint}
      // Darker glass once the lights are off: the panes are a reflection tint,
      // so a shop that has closed reads as closed from across the street.
      windowColor={open ? GLASS_OPEN : GLASS_CLOSED}
      surfaceBackground={CREAM}
      rotation={[0, -0.28, 0]}
    >
      <StorefrontMockup.Fascia surfaceBackground={paint}>
        <Fascia paint={paint} />
      </StorefrontMockup.Fascia>
      <StorefrontMockup.FrontLeft surfaceBackground={glass}>
        <WindowPoster title="Oat latte" sub={'€4,20\nours, made to steam'} seed="ninefold-left" paint={paint} art="flatwhite" />
      </StorefrontMockup.FrontLeft>
      <StorefrontMockup.FrontRight surfaceBackground={glass}>
        <WindowPoster title="Bread daily" sub={'sourdough at 7:30\nbuns at 8, 11 and 3'} seed="ninefold-right" paint={paint} art="bun" />
      </StorefrontMockup.FrontRight>
      {/* The door is painted in the glass tint rather than left transparent.
          A surface is DOM under the canvas, so transparent pixels fall
          through to whatever is behind them - here the rear window's poster,
          which showed through the door from the front. Opaque glass, in the
          same tint as the panes, and the shop has a back wall again. */}
      <StorefrontMockup.Door surfaceBackground={glass}>
        <Door open={open} paint={paint} />
      </StorefrontMockup.Door>
      <StorefrontMockup.LeftSign surfaceBackground={paint}>
        <Fascia paint={paint} sub="Est. 2019" />
      </StorefrontMockup.LeftSign>
      <StorefrontMockup.RightSign surfaceBackground={paint}>
        <Fascia paint={paint} sub="Bakery" />
      </StorefrontMockup.RightSign>
      <StorefrontMockup.RearSign surfaceBackground={paint}>
        <Fascia paint={paint} sub="Roastery" />
      </StorefrontMockup.RearSign>
      <StorefrontMockup.Left surfaceBackground={glass}>
        <WindowPoster title="Filter" sub={'today Huila\n€3,20'} seed="ninefold-side-l" paint={paint} />
      </StorefrontMockup.Left>
      <StorefrontMockup.Right surfaceBackground={glass}>
        <WindowPoster title="Cold brew" sub={'on tap\n€4,00'} seed="ninefold-side-r" paint={paint} />
      </StorefrontMockup.Right>
      <StorefrontMockup.Rear surfaceBackground={glass}>
        <WindowPoster title="Beans" sub={'250 g · €11'} seed="ninefold-rear" paint={paint} />
      </StorefrontMockup.Rear>
    </StorefrontMockup>
  )
}

export function BoardScene() {
  return (
    <AFrameSignMockup float color="#4a3826" rotation={[0, -0.22, 0]}>
      <AFrameSignMockup.Front>
        <BoardFront />
      </AFrameSignMockup.Front>
      <AFrameSignMockup.Back>
        <BoardBack />
      </AFrameSignMockup.Back>
    </AFrameSignMockup>
  )
}

export function CartonScene() {
  return (
    <MilkCartonMockup float color={BOARD} surfaceBackground={BOARD} capColor="#2e4638" rotation={[0, -0.3, 0]}>
      <MilkCartonMockup.Front>
        <CartonFace side="front" />
      </MilkCartonMockup.Front>
      <MilkCartonMockup.Back>
        <CartonFace side="back" />
      </MilkCartonMockup.Back>
      <MilkCartonMockup.Left>
        <CartonFace side="left" />
      </MilkCartonMockup.Left>
      <MilkCartonMockup.Right>
        <CartonFace side="right" />
      </MilkCartonMockup.Right>
      <MilkCartonMockup.GableFront>
        <CartonGable />
      </MilkCartonMockup.GableFront>
      <MilkCartonMockup.GableBack>
        <CartonGable />
      </MilkCartonMockup.GableBack>
    </MilkCartonMockup>
  )
}

export function CardScene({ paint }: { paint: string }) {
  return (
    <BusinessCardMockup float color={CREAM} edgeColor={paint} surfaceBackground={CREAM} rotation={[-0.1, -0.35, 0]}>
      <BusinessCardMockup.Front>
        <CardFront />
      </BusinessCardMockup.Front>
      <BusinessCardMockup.Back surfaceBackground={paint}>
        <CardBack paint={paint} />
      </BusinessCardMockup.Back>
    </BusinessCardMockup>
  )
}
