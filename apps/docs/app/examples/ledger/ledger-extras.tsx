'use client'

import { FlipMockup, FoldMockup } from 'react-3d-mockups'
import { CoverWidget, INK, TabletApp, type LedgerState } from './ledger-screens'

/**
 * The two foldables further down the page, each on its own canvas because
 * each is its own section. Same state as the hero: add a coffee up there
 * and it is on the Fold's list and the Flip's cover by the time you scroll.
 */

export function FoldScene({ state }: { state: LedgerState }) {
  return (
    <FoldMockup float variant="fold7" color="silvershadow" statusBar surfaceBackground={INK} rotation={[0, -0.26, 0]}>
      <TabletApp state={state} />
    </FoldMockup>
  )
}

export function FlipScene({ state }: { state: LedgerState }) {
  return (
    <FlipMockup float variant="flip7" openAngle={false} color="jetblack" surfaceBackground="#000" rotation={[0, -0.32, 0]}>
      <CoverWidget state={state} />
    </FlipMockup>
  )
}
