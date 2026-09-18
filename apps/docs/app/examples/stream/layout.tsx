import { fraunces, inter, jetbrainsMono, notoSansKR } from '@/lib/fonts'
import '../../globals.css'
import '../_shared/example.css'
import './stream.css'

// Root layout for the standalone /examples/stream route: no site chrome, only
// the shared stylesheet and fonts, like the other examples.
export default function StreamExampleLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable} ${notoSansKR.variable}`}>
      <body>{children}</body>
    </html>
  )
}
