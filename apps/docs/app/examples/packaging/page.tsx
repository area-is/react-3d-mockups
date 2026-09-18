import type { Metadata } from 'next'
import { Packaging } from './packaging-client'

export const metadata: Metadata = {
  title: 'Carton & Co - packaging configurator example | React 3D Mockups',
  description:
    'An isolated example page: a packaging supplier whose configurator rebuilds a mailer box, folding carton or rigid box from millimetre sliders, a board and a print. Built with react-3d-mockups and tabbied.',
}

/**
 * A complete, isolated configurator built on the custom-size objects. The
 * spec that drives the geometry is in packaging-data.ts; the three models
 * it can become are in packaging-scenes.tsx.
 */
export default function PackagingExamplePage() {
  return <Packaging />
}
