import type { Metadata } from 'next'
import { exampleMetadata } from '../_shared/metadata'
import { Stream } from './stream-client'

export const metadata: Metadata = exampleMetadata('stream', {
  title: 'Prism - streaming service example | React 3D Mockups',
  description:
    'An isolated example page: a streaming service on a 65-inch TV, a Galaxy Z Fold, a Z Flip in Flex Mode and an iPad, all following the title the page features. Built with react-3d-mockups and tabbied.',
})

/**
 * A complete, isolated entertainment example: one featured title, four
 * screens. The screens are in stream-art.tsx and the state that drives
 * them in stream-client.tsx.
 */
export default function StreamExamplePage() {
  return <Stream />
}
