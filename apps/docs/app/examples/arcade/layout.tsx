import { fraunces, inter, jetbrainsMono, notoSansKR } from '@/lib/fonts'
import '../../globals.css'
import '../_shared/example.css'
import './arcade.css'

// Root layout for the standalone /examples/arcade route: no site chrome, only
// the shared stylesheet and fonts, like the other examples.
export default function ArcadeExampleLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable} ${notoSansKR.variable}`}>
      <body>{children}</body>
    </html>
  )
}
