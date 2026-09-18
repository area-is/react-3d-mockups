import type { Metadata } from 'next'
import { Ledger } from './ledger-client'

export const metadata: Metadata = {
  title: 'Ledger - multi-device app example | React 3D Mockups',
  description:
    'An isolated example page: a finance app on a laptop, a phone and a watch composed into one 3D scene, sharing one React state that the page can change live. Built with react-3d-mockups.',
}

/**
 * A complete, isolated app-landing example whose hero composes three bare
 * devices into a single canvas. The technique is in ledger-scene.tsx (the
 * composition) and ledger-client.tsx (one state, every screen).
 */
export default function LedgerExamplePage() {
  return <Ledger />
}
