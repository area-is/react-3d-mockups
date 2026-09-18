import { fraunces, inter, jetbrainsMono, notoSansKR } from '@/lib/fonts'
import '../../globals.css'
import '../_shared/example.css'
import './cafe.css'

// Root layout for the standalone /examples/cafe route: no site chrome, only
// the shared stylesheet and fonts, like the other examples.
export default function CafeExampleLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable} ${notoSansKR.variable}`}>
      <body>{children}</body>
    </html>
  )
}
