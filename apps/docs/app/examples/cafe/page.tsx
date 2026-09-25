import type { Metadata } from 'next'
import { exampleMetadata } from '../_shared/metadata'
import { Cafe } from './cafe-client'

export const metadata: Metadata = exampleMetadata('cafe', {
  title: 'Ninefold - coffee shop example | React 3D Mockups',
  description:
    'An isolated example page: a neighbourhood coffee shop whose storefront, pavement board, oat-milk carton and loyalty card are live 3D mockups, with the shop repainted and opened from the page. Built with react-3d-mockups and tabbied.',
})

/**
 * A complete, isolated local-business example. The storefront's ten live
 * surfaces are dressed in cafe-scenes.tsx; the page's two controls reach
 * into them from cafe-client.tsx.
 */
export default function CafeExamplePage() {
  return <Cafe />
}
