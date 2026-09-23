import { fraunces, inter, jetbrainsMono, notoSansKR } from '@/lib/fonts'
import { ExampleBar } from '../_shared/example-bar'
import { EXAMPLE_VIEWPORT } from '../_shared/metadata'
import '../../globals.css'
import './print-shop.css'

export const viewport = EXAMPLE_VIEWPORT

// Root layout for the standalone /examples/print-shop route. Like the other
// examples it carries no site chrome: the page is a self-contained shop,
// sharing only the site stylesheet and fonts.
export default function PrintShopExampleLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable} ${notoSansKR.variable}`}>
      <body>
        <ExampleBar slug="print-shop" />
        {children}
      </body>
    </html>
  )
}
