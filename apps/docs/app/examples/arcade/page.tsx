import type { Metadata } from 'next'
import { Arcade } from './arcade-client'

export const metadata: Metadata = {
  title: 'Moth - indie game example | React 3D Mockups',
  description:
    'An isolated example page: an indie game launch whose TV and phone run a live canvas game on their screens, with a boxed edition and a vinyl soundtrack in the same key art. Built with react-3d-mockups.',
}

/**
 * A complete, isolated example whose screens run a frame loop of their
 * own: the game is in moth-game.tsx, the packaging in arcade-art.tsx.
 */
export default function ArcadeExamplePage() {
  return <Arcade />
}
