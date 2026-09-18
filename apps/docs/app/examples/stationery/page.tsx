import type { Metadata } from 'next'
import { Stationery } from './stationery-client'

export const metadata: Metadata = {
  title: 'Ampersand - wedding stationery example | React 3D Mockups',
  description:
    'An isolated example page: a stationery studio whose form fields typeset an invitation, a reply card, a welcome sign and a table plan as you type. Built with react-3d-mockups and tabbied.',
}

/**
 * A complete, isolated example built on text input: the words typed into
 * the form are the artwork. The pieces are in stationery-art.tsx and the
 * form that drives them in stationery-client.tsx.
 */
export default function StationeryExamplePage() {
  return <Stationery />
}
