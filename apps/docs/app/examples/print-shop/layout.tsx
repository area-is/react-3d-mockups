import { fraunces, inter, jetbrainsMono, notoSansKR } from '@/lib/fonts'
import '../../globals.css'
import './print-shop.css'

// Root layout for the standalone /examples/print-shop route. Like
// /examples/hero-phone it carries no site chrome: the page is a
// self-contained shop, sharing only the site stylesheet and fonts.
export default function PrintShopExampleLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable} ${notoSansKR.variable}`}>
      <body>{children}</body>
    </html>
  )
}
