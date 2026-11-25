import defaultMdxComponents from 'fumadocs-ui/mdx'
import { Card, Cards as FumadocsCards } from 'fumadocs-ui/components/card'
import type { ComponentProps } from 'react'
import type { MDXComponents } from 'mdx/types'
import { Callout } from './callout'
import { BareVsMockup } from './bare-vs-mockup'
import { DeviceDisclaimer } from './device-disclaimer'
import { ModelGallery } from './model-gallery'
// Through a `next/dynamic` shell: every docs page gets this map, and a static
// import here shipped the whole 3D stack to prose-only pages.
import { ImageDemo, InputDemo, MockupExplorer } from './lazy-mdx-demos'

/** Fumadocs' card grid with a hook for docs.css (`.docs-cards`), which draws
    the cards as plain links - no box - set apart by the grid's spacing. */
function Cards({ className, ...props }: ComponentProps<typeof FumadocsCards>) {
  return <FumadocsCards {...props} className={className ? `docs-cards ${className}` : 'docs-cards'} />
}

// The cast bridges a structural mismatch between fumadocs-ui's component map
// and @types/mdx under our @types/react version; the shapes agree at runtime.
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Card,
    Cards,
    Callout,
    BareVsMockup,
    DeviceDisclaimer,
    ModelGallery,
    MockupExplorer,
    ImageDemo,
    InputDemo,
    ...components,
  } as unknown as MDXComponents
}

export const useMDXComponents = getMDXComponents
