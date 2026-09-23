import type { Metadata } from 'next'
import { exampleMetadata } from '../_shared/metadata'
import { Ambient } from './ambient-client'

export const metadata: Metadata = exampleMetadata('ambient', {
  title: 'Ambient - living art example | React 3D Mockups',
  description:
    'An isolated example page: a subscription of generative art shown on a wall-hung Frame TV, a Studio Display, a tablet on a stand and an Apple Watch, all redrawing together and set from the page. Built with react-3d-mockups and tabbied.',
})

/**
 * A complete, isolated example built on live surfaces: four screens
 * redrawing a generative channel from one clock. The screens are in
 * ambient-art.tsx; the channel, bezel and matte come from ambient-client.tsx.
 */
export default function AmbientExamplePage() {
  return <Ambient />
}
