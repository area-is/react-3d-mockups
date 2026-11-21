import { fraunces, inter, jetbrainsMono } from '@/lib/fonts'
import { notoSerifKR } from '@/lib/fonts-ko'
import '../../globals.css'
import './print-shop.css'

// Root layout for the standalone /examples/print-shop route. Like the other
// examples it carries no site chrome: the page is a self-contained shop,
// sharing only the site stylesheet and fonts. The one example that declares
// the Korean face: the hardback beside the frame is the book jacket.
export default function PrintShopExampleLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable} ${notoSerifKR.variable}`}>
      <body>
        {children}
      </body>
    </html>
  )
}
