'use client'

import { FlipMockup, FoldMockup, IPadMockup, TVSetMockup } from 'react-3d-mockups'
import { useNarrow } from '../_shared/use-narrow'
import { FlipPlayer, FoldHome, INK, IPadTitle, TVHome } from './stream-art'

/**
 * Prism's four screens, each its own canvas. All four take the featured
 * title from the page, so picking a film in the row under the TV changes
 * the hero on the TV, the Fold and the iPad and what is playing on the
 * Flip in the same render.
 */

/**
 * The hero. The set's stock framing keeps it well inside the canvas, which
 * on a wide stage is a small television in a lot of room; the camera comes
 * in on wide screens so the screen is the hero. Phones keep the stock pose.
 */
export function TVScene({ featured }: { featured: string }) {
  const narrow = useNarrow()
  return (
    <TVSetMockup
      float
      variant="pedestal"
      size={65}
      color="#15171b"
      surfaceBackground={INK}
      rotation={[0, -0.2, 0]}
      camera={narrow ? undefined : { position: [0, 0.3, 6.3], fov: 40 }}
    >
      <TVHome featured={featured} />
    </TVSetMockup>
  )
}

export function FoldScene({ featured }: { featured: string }) {
  return (
    // The stock camera (z 7.4) let the open Fold fill its card edge to edge;
    // a step back leaves it some room.
    <FoldMockup float variant="fold7" color="jetblack" statusBar surfaceBackground={INK} rotation={[0, -0.24, 0]} camera={{ position: [0, 0.5, 8.6], fov: 40 }}>
      <FoldHome featured={featured} />
    </FoldMockup>
  )
}

/**
 * Half open on the table, the way a Flip is watched: Flex Mode. Tipped back
 * about 55 degrees, so the lower half lies away from the viewer and the
 * picture on the upper half faces them; upright, the upper half leaned out
 * over the camera and showed its screen to the floor.
 */
export function FlipScene({ featured }: { featured: string }) {
  return (
    <FlipMockup float variant="flip7" openAngle={100} color="blueshadow" statusBar surfaceBackground="#000" rotation={[-0.96, -0.3, 0]}>
      <FlipPlayer featured={featured} />
    </FlipMockup>
  )
}

export function IPadScene({ featured }: { featured: string }) {
  return (
    <IPadMockup float variant="ipadpro13" orientation="landscape" color="spaceblack" statusBar surfaceBackground={INK} rotation={[0, -0.22, 0]}>
      <IPadTitle featured={featured} />
    </IPadMockup>
  )
}
