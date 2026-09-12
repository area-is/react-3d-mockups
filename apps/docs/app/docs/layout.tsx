import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { RootProvider } from 'fumadocs-ui/provider/next'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { source } from '@/lib/source'
import { baseOptions } from '@/lib/layout.shared'
import { DocsSidebarSeparator } from '@/components/docs-sidebar'
import { hideGridPages } from '@/lib/sidebar-tree'
import { inter, jetbrainsMono } from '@/lib/fonts'
import { asset } from '@/lib/base-path.mjs'
import { SITE_URL, socialMetadata } from '@/lib/site'
import './docs.css'
import '../screens.css'

const DOCS_DESCRIPTION = 'Installation, usage guides and API reference for React 3D Mockups.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s | React 3D Mockups',
    default: 'Documentation | React 3D Mockups',
  },
  description: DOCS_DESCRIPTION,
  ...socialMetadata({ title: 'React 3D Mockups documentation', description: DOCS_DESCRIPTION }),
}

// Root layout for the documentation. It is deliberately separate from the
// site root layout: the docs use Fumadocs UI on Tailwind, the site keeps its
// own stylesheet, and neither can leak resets into the other.
export default function DocsRootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        {/*
          * fumadocs' fetch client defaults its endpoint to
          * `join(BASE_PATH, '/api/search')`, where that `BASE_PATH` is
          * `import.meta.env.BASE_URL` - a Vite variable, undefined under Next -
          * so it resolves to a bare `/api/search` and misses our prefix
          * entirely. Pointing it explicitly is the whole fix.
          */}
        <RootProvider search={{ options: { api: asset('/api/search') } }}>
          <DocsLayout
            tree={hideGridPages(source.getPageTree())}
            {...baseOptions()}
            sidebar={{ components: { Separator: DocsSidebarSeparator } }}
          >
            {children}
          </DocsLayout>
        </RootProvider>
      </body>
    </html>
  )
}
