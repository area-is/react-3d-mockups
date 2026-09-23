'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
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
 *
 * `poster` is what shows until the scene has something to show - before it
 * mounts, and after, until it says it is ready. Children written as a
 * function are handed that `ready` callback to pass as the canvas's
 * `onCreated`, which r3f calls once the scene graph is built, just before the
 * first frame; plain children count as ready the moment they mount.
 */
export function LazyScene({
  children,
  poster,
}: {
  children: ReactNode | ((ready: () => void) => ReactNode)
  poster?: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [ready, setReady] = useState(false)
  const markReady = useCallback(() => setReady(true), [])
  const deferred = typeof children === 'function'

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const slot: Slot = {
      visible: false,
      seen: 0,
      release: () => {
        setMounted(false)
        setReady(false)
      },
    }
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

  const shown = mounted && (ready || !deferred)
  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {poster ? (
        <div className="scene-poster-layer" data-hidden={shown} aria-hidden>
          {poster}
        </div>
      ) : null}
      {mounted ? (
        <SceneBoundary>{typeof children === 'function' ? children(markReady) : children}</SceneBoundary>
      ) : null}
    </div>
  )
}
