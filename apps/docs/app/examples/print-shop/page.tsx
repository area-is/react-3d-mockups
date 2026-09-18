import type { Metadata } from 'next'
import { PrintShop } from './print-shop-client'

export const metadata: Metadata = {
  title: 'Grid Editions - print shop example | React 3D Mockups',
  description:
    'An isolated example page: a generative-print shop whose controls re-render the poster inside a 3D frame in real time, built with react-3d-mockups and tabbied.',
}

/**
 * A complete, isolated product-configurator example: a fictional print shop
 * where the page's own controls - design, ink set, size, frame, mat, seed -
 * rewrite the sheet inside a 3D poster frame as they are clicked. The
 * point is that the surface is live DOM: see print-shop-art.tsx for the
 * artwork and print-shop-client.tsx for the state that drives every scene.
 */
export default function PrintShopExamplePage() {
  return <PrintShop />
}
