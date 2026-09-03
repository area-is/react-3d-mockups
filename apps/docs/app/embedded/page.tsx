import type { Metadata } from 'next'
import { EmbeddedScreen } from '@/components/screens/embedded-screen'

export const metadata: Metadata = {
  title: 'Embedded | React 3D Mockups',
  robots: { index: false },
}

// A minimal standalone route (no site chrome) designed to be iframed into a
// device screen. See the “Embed a whole page” demo.
export default function EmbeddedPage() {
  return <EmbeddedScreen />
}
