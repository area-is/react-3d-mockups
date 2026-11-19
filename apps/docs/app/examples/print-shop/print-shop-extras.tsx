'use client'

import { GreetingCardMockup, ShoppingBagMockup } from 'react-3d-mockups'
import { CardArt, KRAFT, PAPER, ToteArt, type Order } from './print-shop-art'

/**
 * The same edition on the shop's other goods. Both are separate canvases,
 * mounted by `LazyScene` only while they are near the viewport, because
 * browsers cap live WebGL contexts and a product page is not the place to
 * find that cap.
 */

/**
 * The bag's stock framing runs the handles off the top of a landscape stage,
 * which a card's edge used to excuse. With no card, a handle sliced by an
 * invisible line reads as a box, so the camera stands a step further back
 * and the whole bag, handles and all, sits on the dots.
 */
const TOTE_CAMERA = { position: [0, 0.5, 10.4] as [number, number, number], fov: 40 }

export function ToteScene({ order }: { order: Order }) {
  return (
    <ShoppingBagMockup float color={KRAFT} surfaceBackground={KRAFT} handleColor="#6b5236" rotation={[0, 0.32, 0]} camera={TOTE_CAMERA}>
      <ToteArt order={order} />
    </ShoppingBagMockup>
  )
}

export function CardScene({ order }: { order: Order }) {
  return (
    <GreetingCardMockup float color={PAPER} surfaceBackground={PAPER} rotation={[0, -0.3, 0]}>
      <CardArt order={order} />
    </GreetingCardMockup>
  )
}
