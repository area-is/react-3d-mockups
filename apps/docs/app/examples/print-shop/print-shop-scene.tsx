'use client'

import type { Ref } from 'react'
import { PosterFrameMockup } from 'react-3d-mockups'
import type { TabbiedPatternHandle } from 'tabbied/react'
import { FRAMES, MATS, PAPER, PosterArt, SIZES, find, type Order } from './print-shop-art'

/**
 * The framed print on the wall. Every prop here is read straight off the
 * order, so the configurator's state IS the scene: a new sheet size rebuilds
 * the frame around it, a new frame colour re-stains the molding, a mat cuts
 * a board, and the sheet's content re-renders because it is the same React
 * tree as the rest of the page.
 *
 * `zoom` is on, unusually for an example: a customer buying a print wants to
 * get close to it, and a pinch on the frame is the natural way to.
 */
export default function PrintShopScene({ order, artRef }: { order: Order; artRef: Ref<TabbiedPatternHandle> }) {
  return (
    <PosterFrameMockup
      float
      zoom
      size={find(SIZES, order.size).mm}
      color={find(FRAMES, order.frame).color}
      mat={find(MATS, order.mat).mat}
      surfaceBackground={PAPER}
      rotation={[0.02, -0.26, 0]}
    >
      <PosterArt order={order} ref={artRef} />
    </PosterFrameMockup>
  )
}
