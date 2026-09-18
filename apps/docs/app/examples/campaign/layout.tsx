import { fraunces, inter, jetbrainsMono, notoSansKR } from '@/lib/fonts'
import '../../globals.css'
import './campaign.css'

// Root layout for the standalone /examples/campaign route. Like the other
// examples it carries no site chrome: the page is a self-contained case
// study, sharing only the site stylesheet and fonts.
export default function CampaignExampleLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable} ${notoSansKR.variable}`}>
      <body>{children}</body>
    </html>
  )
}
