'use client'

import { Float } from '@react-three/drei'
import { Flip, FoldMockup, MockupCanvas } from 'react-3d-mockups'
import { FLIP_FRAMING, FLIP_VARIANTS, framedShadowY } from 'react-3d-mockups/core'
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

/**
 * Shut, a Flip hangs below its crease hinge-up, its cover upside down; the
 * cover widget is read the way the phone is held, hinge-down, so it is turned
 * a half-turn about z, which stands it on the crease above the camera's
 * target. It is lowered by half its folded height so it sits on the target,
 * in the middle of the stage, and the shadow comes up by the same half to
 * stay under it. The one-liner pins the shadow to the hanging pose, so this
 * stage is composed by hand, floating like the hero's devices.
 */
const FLIP_SHUT_HEIGHT = FLIP_VARIANTS.flip7.closed.body.height
const FLIP_SHADOW_Y = framedShadowY(FLIP_FRAMING, { variant: 'flip7', openAngle: false }, true) + FLIP_SHUT_HEIGHT / 2

export function FlipScene({ state }: { state: LedgerState }) {
  return (
    <MockupCanvas label="3D mockup of a Galaxy Z Flip phone" shadowY={FLIP_SHADOW_Y}>
      <Float speed={1.25} rotationIntensity={0.1} floatIntensity={0.3}>
        <Flip variant="flip7" openAngle={false} color="jetblack" surfaceBackground="#000" position={[0, -FLIP_SHUT_HEIGHT / 2, 0]} rotation={[0, -0.32, Math.PI]}>
          <CoverWidget state={state} />
        </Flip>
      </Float>
    </MockupCanvas>
  )
}
