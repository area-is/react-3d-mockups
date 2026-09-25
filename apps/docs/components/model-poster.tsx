import { DEVICES, OBJECTS } from '@/lib/mockup-catalog.mjs'

interface CatalogEntry {
  component: string
  variant?: string
  thumb: string
}

const ENTRIES: CatalogEntry[] = [...DEVICES, ...OBJECTS]

/**
 * The sidebar thumbnail of the model a `<Component variant>` renders: the
 * variant's own, else the family's first, else nothing.
 */
export function posterFor(component: string, variant?: string): string | null {
  const family = ENTRIES.filter((e) => e.component === component)
  return (family.find((e) => (e.variant ?? '') === (variant ?? '')) ?? family[0])?.thumb ?? null
}

/**
 * What a docs example shows before its scene has drawn: the model it is about
 * to render, greyed back to a silhouette.
 *
 * An example mounts when it scrolls near, and a first mount builds geometry
 * and compiles shaders - on a phone, long enough to scroll past a stage
 * holding nothing but the transparency checkerboard. The poster is the
 * sidebar's thumbnail (`npm run thumbs`), so it is a real render of that very
 * model, and it costs one small image the sidebar has usually loaded already.
 * Greyed, because its screens are the thumbnails' chroma green, which on a
 * stage about to show real content would read as the content.
 */
export function ModelPoster({ component, variant }: { component: string; variant?: string }) {
  const src = posterFor(component, variant)
  return src ? <img className="scene-poster" src={src} alt="" width="360" height="360" decoding="async" /> : null
}
