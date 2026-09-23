import { fraunces, inter, jetbrainsMono, notoSansKR } from '@/lib/fonts'
import { ExampleBar } from '../_shared/example-bar'
import { EXAMPLE_VIEWPORT } from '../_shared/metadata'
import '../../globals.css'
import '../_shared/example.css'
import './ambient.css'

export const viewport = EXAMPLE_VIEWPORT

// Root layout for the standalone /examples/ambient route: no site chrome,
// only the shared stylesheet and fonts, like the other examples.
export default function AmbientExampleLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable} ${notoSansKR.variable}`}>
      <body>
        <ExampleBar slug="ambient" />
        {children}
      </body>
    </html>
  )
}
