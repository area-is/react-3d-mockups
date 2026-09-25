import type { Metadata } from 'next'
import { exampleMetadata } from '../_shared/metadata'
import { Matchday } from './matchday-client'

export const metadata: Metadata = exampleMetadata('matchday', {
  title: 'Alcântara FC - match day example | React 3D Mockups',
  description:
    'An isolated example page: a football club on a match day, with a fully wrapped team coach, a broadcast whose clock runs live on a TV and a watch, and a season ticket on a lanyard. Built with react-3d-mockups.',
})

/**
 * A complete, isolated example with running state: a match clock the page
 * owns, shown on two devices at once. Objects are dressed in
 * matchday-art.tsx; the clock lives in matchday-client.tsx.
 */
export default function MatchdayExamplePage() {
  return <Matchday />
}
