import type { Metadata } from 'next'
import { Atlas } from './atlas-client'

export const metadata: Metadata = {
  title: 'Atlas - magazine issue example | React 3D Mockups',
  description:
    'An isolated example page: a travel quarterly’s issue page, with the magazine, a hardback annual, a framed print and a notecard carrying generated photographs, and the cover chosen from the page. Built with react-3d-mockups.',
}

/**
 * A complete, isolated editorial example built on bitmaps: the artwork
 * is three generated photographs placed as plain images (atlas-art.tsx),
 * and the page picks which one is the cover (atlas-client.tsx).
 */
export default function AtlasExamplePage() {
  return <Atlas />
}
