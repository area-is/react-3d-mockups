import { Callout as FumadocsCallout } from 'fumadocs-ui/components/callout'
import type { ComponentProps } from 'react'

/**
 * Fumadocs' callout with a hook for docs.css (`.docs-callout`), which takes
 * away its card - the fill, the outer border and the shadow - and leaves the
 * coloured rule and the icon to mark it.
 */
export function Callout({ className, ...props }: ComponentProps<typeof FumadocsCallout>) {
  return <FumadocsCallout {...props} className={className ? `docs-callout ${className}` : 'docs-callout'} />
}
