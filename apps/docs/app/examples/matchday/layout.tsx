import { fraunces, inter, jetbrainsMono } from '@/lib/fonts'
import { ExampleBar } from '../_shared/example-bar'
import { EXAMPLE_VIEWPORT } from '../_shared/metadata'
import '../../globals.css'
import '../_shared/example.css'
import './matchday.css'

export const viewport = EXAMPLE_VIEWPORT

// Root layout for the standalone /examples/matchday route: no site chrome,
// only the shared stylesheet and fonts, like the other examples.
export default function MatchdayExampleLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable}`}>
      <body>
        <ExampleBar slug="matchday" tabbied={false} />
        {children}
      </body>
    </html>
  )
}
