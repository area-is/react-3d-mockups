'use client'

import { BookMockup, GreetingCardMockup, MagazineMockup, PosterFrameMockup } from 'react-3d-mockups'
import { BookBack, BookCover, BookSpine, CardBack, CardFront, CardInside, MagBack, MagCover, MagSpine, Print } from './atlas-art'

/** The issue, the annual, a print and a notecard, each on its own canvas. */

export function MagazineScene({ cover, glossy }: { cover: string; glossy: boolean }) {
  return (
    <MagazineMockup float glossy={glossy} backColor="#171512" surfaceBackground="#171512" rotation={[0, -0.3, 0]}>
      <MagazineMockup.Cover>
        <MagCover cover={cover} />
      </MagazineMockup.Cover>
      <MagazineMockup.Back surfaceBackground="#f6f3ec">
        <MagBack cover={cover} />
      </MagazineMockup.Back>
      <MagazineMockup.Spine>
        <MagSpine />
      </MagazineMockup.Spine>
    </MagazineMockup>
  )
}

export function BookScene() {
  return (
    <BookMockup float color="#1f3a5f" surfaceBackground="#1f3a5f" rotation={[0, 0.34, 0]}>
      <BookMockup.Cover>
        <BookCover />
      </BookMockup.Cover>
      <BookMockup.Back>
        <BookBack />
      </BookMockup.Back>
      <BookMockup.Spine>
        <BookSpine />
      </BookMockup.Spine>
    </BookMockup>
  )
}

export function PrintScene({ cover }: { cover: string }) {
  return (
    <PosterFrameMockup float color="#b98b5a" surfaceBackground="#f6f3ec" rotation={[0, 0.22, 0]}>
      <Print cover={cover} />
    </PosterFrameMockup>
  )
}

export function CardScene({ cover }: { cover: string }) {
  return (
    <GreetingCardMockup float color="#f6f3ec" surfaceBackground="#f6f3ec" rotation={[0, -0.32, 0]}>
      <GreetingCardMockup.Front>
        <CardFront cover={cover} />
      </GreetingCardMockup.Front>
      <GreetingCardMockup.InsideLeft>
        <CardInside cover={cover} side="left" />
      </GreetingCardMockup.InsideLeft>
      <GreetingCardMockup.InsideRight>
        <CardInside cover={cover} side="right" />
      </GreetingCardMockup.InsideRight>
      <GreetingCardMockup.Back>
        <CardBack />
      </GreetingCardMockup.Back>
    </GreetingCardMockup>
  )
}
