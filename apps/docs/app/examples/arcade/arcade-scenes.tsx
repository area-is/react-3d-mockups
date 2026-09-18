'use client'

import { GalaxyMockup, ProductBoxMockup, TVSetMockup, VinylRecordMockup } from 'react-3d-mockups'
import { useNarrow } from '../_shared/use-narrow'
import { BoxBack, BoxFront, BoxSpine, Label, PhoneGame, SleeveBack, SleeveFront, TVGame } from './arcade-art'
import type { Level } from './arcade-data'

/**
 * Moth on a TV, in a case, on a record and on a phone. The TV and the
 * phone each run their own instance of the game; the case and the sleeve
 * carry the key art. All four take the level the page picked.
 */

export function TVScene({ level, lit, onLit }: { level: Level; lit?: number; onLit?: (lit: number, total: number) => void }) {
  const narrow = useNarrow()
  return (
    <TVSetMockup float variant="legs" size={65} color="#15171b" surfaceBackground={level.sky} rotation={[0, -0.16, 0]} camera={narrow ? undefined : { position: [0, 0.3, 6.3], fov: 40 }}>
      <TVGame level={level} lit={lit} litRef={onLit} />
    </TVSetMockup>
  )
}

export function PhoneScene({ level }: { level: Level }) {
  return (
    <GalaxyMockup float variant="s26" color="#15131c" statusBar surfaceBackground={level.sky} rotation={[0, -0.3, 0]}>
      <PhoneGame level={level} />
    </GalaxyMockup>
  )
}

/** A game case: a slim carton at the size the shops shelve them. */
export function BoxScene({ level }: { level: Level }) {
  return (
    <ProductBoxMockup float size={{ width: 106, height: 170, depth: 12 }} color={level.sky} surfaceBackground={level.sky} rotation={[0, -0.42, 0]}>
      <ProductBoxMockup.Front>
        <BoxFront level={level} />
      </ProductBoxMockup.Front>
      <ProductBoxMockup.Back>
        <BoxBack level={level} />
      </ProductBoxMockup.Back>
      <ProductBoxMockup.Left>
        <BoxSpine level={level} />
      </ProductBoxMockup.Left>
    </ProductBoxMockup>
  )
}

export function RecordScene({ level }: { level: Level }) {
  return (
    <VinylRecordMockup float color={level.sky} vinylColor="#b8781c" surfaceBackground={level.sky} rotation={[0, -0.12, 0]} camera={{ position: [0, 0.4, 8.8], fov: 40 }}>
      <VinylRecordMockup.Cover>
        <SleeveFront level={level} />
      </VinylRecordMockup.Cover>
      <VinylRecordMockup.Back>
        <SleeveBack level={level} />
      </VinylRecordMockup.Back>
      <VinylRecordMockup.Label surfaceBackground={level.lamp}>
        <Label side="A" level={level} />
      </VinylRecordMockup.Label>
      <VinylRecordMockup.BackLabel surfaceBackground={level.lamp}>
        <Label side="B" level={level} />
      </VinylRecordMockup.BackLabel>
    </VinylRecordMockup>
  )
}
