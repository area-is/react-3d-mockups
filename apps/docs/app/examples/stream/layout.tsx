import { fraunces, inter, jetbrainsMono } from '@/lib/fonts'
import { ExampleBar } from '../_shared/example-bar'
import { EXAMPLE_VIEWPORT } from '../_shared/metadata'
import '../../globals.css'
import '../_shared/example.css'
import './stream.css'

export const viewport = EXAMPLE_VIEWPORT

// Root layout for the standalone /examples/stream route: no site chrome, only
// the shared stylesheet and fonts, like the other examples.
export default function StreamExampleLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable}`}>
      <body>
        <ExampleBar slug="stream" />
        {children}
      </body>
    </html>
  )
}
