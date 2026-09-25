import { fraunces, inter, jetbrainsMono } from '@/lib/fonts'
import { ExampleBar } from '../_shared/example-bar'
import { EXAMPLE_VIEWPORT } from '../_shared/metadata'
import '../../globals.css'
import '../_shared/example.css'
import './packaging.css'

export const viewport = EXAMPLE_VIEWPORT

// Root layout for the standalone /examples/packaging route: no site chrome,
// only the shared stylesheet and fonts, like the other examples.
export default function PackagingExampleLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable}`}>
      <body>
        <ExampleBar slug="packaging" />
        {children}
      </body>
    </html>
  )
}
