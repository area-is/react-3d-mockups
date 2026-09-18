'use client'

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import { LazyScene } from '@/components/lazy-scene'

/**
 * A scene the page mounts only when it is near.
 *
 * `load` is a dynamic import of one scene component. It is loaded with SSR
 * off - WebGL only exists in the browser - and mounted through `LazyScene`,
 * so a page of several canvases only ever holds the contexts for the ones
 * in view. The stage's parent must give it a definite height; that is what
 * keeps the page still while scenes come and go.
 *
 * Called at module level, once per scene, so `dynamic()` runs once.
 */
export function lazyScene<P extends object>(load: () => Promise<ComponentType<P>>): ComponentType<P> {
  const Scene = dynamic(load, {
    ssr: false,
    loading: () => <div className="ex-loading">Warming up the GPU…</div>,
  })
  return function Stage(props: P) {
    return (
      <LazyScene>
        <Scene {...props} />
      </LazyScene>
    )
  }
}
