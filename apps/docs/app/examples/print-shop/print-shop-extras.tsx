'use client'

import { GreetingCardMockup, ShoppingBagMockup } from 'react-3d-mockups'
import { CardArt, PAPER, ToteArt, type Order } from './print-shop-art'

/**
 * The same edition on the shop's other goods. Both are separate canvases,
 * mounted by `LazyScene` only while they are near the viewport, because
 * browsers cap live WebGL contexts and a product page is not the place to
 * find that cap.
 */

/** Natural kraft, painted as the surface background so the print sits ON the bag. */
const KRAFT = '#c9a77a'

export function ToteScene({ order }: { order: Order }) {
  return (
    <ShoppingBagMockup float color={KRAFT} surfaceBackground={KRAFT} handleColor="#6b5236" rotation={[0, 0.32, 0]}>
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
