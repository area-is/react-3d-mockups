'use client'

import { useEffect, useRef, useState } from 'react'
import { SceneBoundary } from './scene-boundary'

/**
 * How many scenes may stay mounted - each one a live WebGL context - once
 * they have scrolled out of view.
 *
 * Browsers cap live contexts (as few as 8 on mobile Chrome) and silently kill
 * the oldest once the cap is exceeded; on a page carrying several canvases that
 * leaves the earlier ones showing the "sad canvas" icon with the CSS3D screen
 * floating detached. Four keeps well clear of it with room for a page's own.
 */
const MAX_LIVE = 4

interface Slot {
  /** Near the viewport right now. */
  visible: boolean
  /** When it was last near the viewport, for picking which one to evict. */
  seen: number
  release: () => void
}

const live = new Set<Slot>()

/** Unmount the least recently seen scenes that are out of view, down to the cap. */
function enforceCap() {
  if (live.size <= MAX_LIVE) return
  const idle = [...live].filter((slot) => !slot.visible).sort((a, b) => a.seen - b.seen)
  for (const slot of idle) {
    if (live.size <= MAX_LIVE) break
    live.delete(slot)
    slot.release()
  }
}

/**
 * Mounts its children once the wrapper comes near the viewport, and keeps them
 * mounted - up to `MAX_LIVE` scenes page-wide - after it scrolls away.
 *
 * It used to unmount a scene the moment it left the viewport. That kept the
 * context count down, but every scroll back created a brand-new context and
 * paid for it all again: shaders compiled, geometry rebuilt, the "Loading"
 * placeholder and the stall - eight contexts for one scroll down and up a
 * device page. Now a scene out of view costs nothing to keep (the library
 * stops drawing a canvas that is off screen), so it stays, and returning to it
 * is instant. Only past the cap is the least recently seen one released; a
 * scene that is in view is never evicted.
 *
 * The wrapper fills its parent, so it must sit inside a container with a
 * fixed height (`.mockup-viewport`) for layout to hold while unmounted.
 */
export function LazyScene({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const slot: Slot = { visible: false, seen: 0, release: () => setMounted(false) }
    const observer = new IntersectionObserver(
      ([entry]) => {
        slot.visible = entry?.isIntersecting ?? false
        slot.seen = performance.now()
        if (!slot.visible || live.has(slot)) return
        live.add(slot)
        setMounted(true)
        enforceCap()
      },
      // Pre-mount roughly one card ahead of the scroll direction (the
      // fixed-height viewport means mounting never shifts layout under the
      // observer).
      { rootMargin: '320px 0px' }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      live.delete(slot)
    }
  }, [])

  return (
    <div ref={ref} style={{ width: '100%', height: '100%' }}>
      {mounted ? <SceneBoundary>{children}</SceneBoundary> : null}
    </div>
  )
}
