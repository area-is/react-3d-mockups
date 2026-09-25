import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { Logo } from '@/components/logo'
import { GITHUB_URL } from '@/lib/site'

/** Shared options for the Fumadocs layouts under /docs. */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Logo size={26} style={{ flexShrink: 0 }} />
          React 3D Mockups
        </>
      ),
    },
    githubUrl: GITHUB_URL,
    links: [{ text: 'Home', url: '/' }],
  }
}
