'use client'

import dynamic from 'next/dynamic'
import { nutation } from 'tabbied/patterns'
import { LazyScene } from '@/components/lazy-scene'
import { Pattern } from '@/components/screens/swiss-art'
import { PALETTE } from './campaign-identity'

/**
 * The client half of the case study: the stages the server page drops its
 * mockups into, and the one bare pattern it shows beside the inks.
 *
 * Each scene is a separate dynamic import with SSR off - WebGL only exists
 * in the browser - and mounts through `LazyScene`, so only the objects near
 * the viewport hold a WebGL context. The stage's parent gives it a fixed
 * height (`.cp-stage`), which is what keeps the page from jumping as scenes
 * come and go.
 */

const loading = () => <div className="cp-loading">Warming up the GPU…</div>

const SCENES = {
  bulletin: dynamic(() => import('./campaign-scenes').then((m) => m.BulletinScene), { ssr: false, loading }),
  shelter: dynamic(() => import('./campaign-scenes').then((m) => m.ShelterScene), { ssr: false, loading }),
  totem: dynamic(() => import('./campaign-scenes').then((m) => m.TotemScene), { ssr: false, loading }),
  phone: dynamic(() => import('./campaign-scenes').then((m) => m.PhoneScene), { ssr: false, loading }),
  tote: dynamic(() => import('./campaign-scenes').then((m) => m.ToteScene), { ssr: false, loading }),
  pass: dynamic(() => import('./campaign-scenes').then((m) => m.PassScene), { ssr: false, loading }),
  banner: dynamic(() => import('./campaign-scenes').then((m) => m.BannerScene), { ssr: false, loading }),
}

export type SceneName = keyof typeof SCENES

export function Stage({ scene }: { scene: SceneName }) {
  const Scene = SCENES[scene]
  return (
    <LazyScene>
      <Scene />
    </LazyScene>
  )
}

/** The mark on its own, live, so the page shows the identity before any object wears it. */
export function MarkSwatch() {
  return <Pattern pattern={nutation} live seed="aperture-swatch" palette={PALETTE} grid="4x6" />
}
