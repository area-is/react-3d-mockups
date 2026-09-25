import type { Metadata } from 'next'
import { exampleMetadata } from '../_shared/metadata'
import { Fleet } from './fleet-client'

export const metadata: Metadata = exampleMetadata('fleet', {
  title: 'Northline - fleet livery example | React 3D Mockups',
  description:
    'An isolated example page: a freight company whose trailer, van, shipping box and tracking app wear one livery, with the van’s wrap coverage and the livery switched from the page. Built with react-3d-mockups and tabbied.',
})

/**
 * A complete, isolated B2B example built around the vehicle wraps. The
 * livery is one component (fleet-art.tsx) and the page's two controls
 * change every vehicle at once (fleet-client.tsx).
 */
export default function FleetExamplePage() {
  return <Fleet />
}
