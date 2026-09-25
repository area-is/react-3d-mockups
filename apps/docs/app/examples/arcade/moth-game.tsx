'use client'

import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from 'react-3d-mockups'
import { asset } from '@/lib/base-path.mjs'
import type { Level, Scene } from './arcade-data'

/**
 * The game itself: a moth that cannot help flying at the next lamp, on a
 * `<canvas>` driven by requestAnimationFrame.
 *
 * It is here to make one point about the library. The screen of a mockup
 * is real DOM, so a canvas on it is a real canvas, running its own frame
 * loop at the TV's resolution while the TV floats in WebGL - two render
 * loops, neither aware of the other. The same component runs on the
 * phone at a portrait size, because a canvas is just a box.
 *
 * ### How a night is drawn
 *
 * Back to front: a sky graded to the horizon, stars and a moon (or, in the
 * attic, a shaft of moonlight from a skylight); the far silhouettes; the
 * lamps and their light; the near silhouettes, between you and the light;
 * the moth; and a vignette. The silhouettes are generated cut-outs, black
 * on transparent (`/art/arcade-*.webp`), tinted per level on an offscreen
 * canvas once they load - so one garden wall serves every palette the
 * garden will ever have. Tiled layers alternate with their mirror image, so
 * the seam is a reflection rather than a repeat.
 *
 * The light is additive (`lighter`): a lamp's bloom brightens the haze and
 * the silhouettes' edges it falls across, which is what makes the dark read
 * as dark rather than as a flat colour. The lanterns' glass is left open
 * in the silhouettes, so each lamp's glow is painted first and its ironwork
 * drawn over it.
 *
 * The moth is a painted cut-out with its wings drawn as two halves, each
 * scaled about the body as it beats, and tinted toward the lamp it is
 * flying at the closer it gets. It sheds a little dust of scales as it
 * goes.
 *
 * Drawn at half the surface's resolution and scaled up by CSS: a game that
 * runs at 1920 x 1080 on a screen a few hundred pixels wide is spending its
 * fill rate on nothing. Under `prefers-reduced-motion` one frame is drawn
 * (again as each image arrives) and the loop never starts.
 */

/** A layer of silhouettes: which file, where it stands, how tall and how much it drifts. */
interface Layer {
  src: string
  /** 'bottom': its foot at `y` (a fraction of the height). 'top': hung from `y`. */
  anchor: 'bottom' | 'top'
  y: number
  /** Height as a fraction of the canvas's; 'top' layers use it as a minimum width in heights. */
  height: number
  /** How far it slides against the moth, as a fraction of the width. */
  parallax: number
  tint: 'far' | 'near'
  /** Where the tiling starts, in tiles: keeps a mirrored seam off the middle of the screen. */
  offset?: number
}

/** A lamp post sprite: its width over height, and where its glass is, as fractions of the sprite. */
interface LampSprite {
  src: string
  aspect: number
  glass: { x: number; y: number; rx: number; ry: number }
}

const LAMPS: Record<'garden' | 'harbour', LampSprite> = {
  garden: { src: '/art/arcade-lamp-garden.webp', aspect: 103 / 640, glass: { x: 0.5, y: 0.178, rx: 0.34, ry: 0.052 } },
  harbour: { src: '/art/arcade-lamp-harbour.webp', aspect: 187 / 640, glass: { x: 0.83, y: 0.257, rx: 0.1, ry: 0.04 } },
}

const SCENES: Record<Scene, { layers: Layer[]; lamp: LampSprite | null; ground: number; stars: boolean; water: number | null }> = {
  garden: {
    layers: [
      { src: '/art/arcade-garden-far.webp', anchor: 'bottom', y: 0.83, height: 0.4, parallax: 0.015, tint: 'far' },
      { src: '/art/arcade-garden-near.webp', anchor: 'bottom', y: 1.02, height: 0.3, parallax: 0.05, tint: 'near', offset: 0.3 },
    ],
    lamp: LAMPS.garden,
    ground: 0.9,
    stars: true,
    water: null,
  },
  harbour: {
    layers: [
      { src: '/art/arcade-harbour-far.webp', anchor: 'bottom', y: 0.62, height: 0.15, parallax: 0.01, tint: 'far' },
      { src: '/art/arcade-harbour-near.webp', anchor: 'bottom', y: 1.01, height: 0.46, parallax: 0.05, tint: 'near', offset: 0.18 },
    ],
    lamp: LAMPS.harbour,
    ground: 0.93,
    stars: true,
    water: 0.62,
  },
  attic: {
    layers: [
      { src: '/art/arcade-attic-far.webp', anchor: 'top', y: -0.3, height: 1.5, parallax: 0.012, tint: 'far' },
      { src: '/art/arcade-attic-near.webp', anchor: 'bottom', y: 1.02, height: 0.44, parallax: 0.045, tint: 'near', offset: 0.36 },
    ],
    lamp: null,
    ground: 1,
    stars: false,
    water: null,
  },
}

const images = new Map<string, HTMLImageElement>()

/**
 * One shared <img> per file, however many games are running. `onReady` gets
 * the image, and may run before this returns when the file is already in.
 */
function load(src: string, onReady: (img: HTMLImageElement) => void): HTMLImageElement {
  let img = images.get(src)
  if (!img) {
    img = new Image()
    img.decoding = 'async'
    img.src = asset(src)
    images.set(src, img)
  }
  const ready = img
  if (ready.complete && ready.naturalWidth) onReady(ready)
  else ready.addEventListener('load', () => onReady(ready), { once: true })
  return ready
}

/** A black-on-clear silhouette repainted in one colour, on its own canvas. */
function tinted(img: HTMLImageElement, color: string): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = img.naturalWidth
  c.height = img.naturalHeight
  const g = c.getContext('2d')!
  g.drawImage(img, 0, 0)
  g.globalCompositeOperation = 'source-in'
  g.fillStyle = color
  g.fillRect(0, 0, c.width, c.height)
  return c
}

/** Deterministic noise, so the stars are the same stars on every frame and every screen. */
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

export function MothGame({ width, height, level, onLit }: { width: number; height: number; level: Level; onLit?: (lit: number, total: number) => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const still = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const W = canvas.width
    const H = canvas.height
    const unit = Math.min(W, H)
    const portrait = H > W
    const speed = unit / 540
    const scene = SCENES[level.scene]

    /* ---- assets -------------------------------------------------------- */

    let redraw = () => {}
    const tints = new Map<string, HTMLCanvasElement>()
    for (const l of scene.layers) {
      load(l.src, (img) => {
        tints.set(l.src, tinted(img, l.tint === 'far' ? level.far : level.near))
        redraw()
      })
    }
    let lampTint: HTMLCanvasElement | null = null
    if (scene.lamp) {
      load(scene.lamp.src, (img) => {
        lampTint = tinted(img, level.near)
        redraw()
      })
    }
    const mothImg = load('/art/arcade-moth.webp', () => redraw())

    /* ---- the night ----------------------------------------------------- */

    const rand = rng(level.id.length * 7919 + level.lamps)
    const stars = scene.stars
      ? Array.from({ length: Math.round((W * H) / 2600) }, () => ({
          x: rand() * W,
          y: rand() * H * 0.62,
          r: (rand() * 0.9 + 0.35) * (unit / 540),
          phase: rand() * Math.PI * 2,
          rate: 0.6 + rand() * 1.6,
        }))
      : []

    // Lamps along the ground, at staggered depths (a far one is smaller and
    // hazier), or, in the attic, bulbs hung at staggered drops from the beams.
    const DEPTH = [1, 0.8, 0.92, 0.74, 0.96, 0.84]
    const lamps = Array.from({ length: level.lamps }, (_, i) => {
      const f = level.lamps === 1 ? 0.5 : i / (level.lamps - 1)
      const depth = DEPTH[i % DEPTH.length]!
      const x = W * (portrait ? 0.14 + 0.72 * f : 0.1 + 0.8 * f)
      if (!scene.lamp) {
        const drop = H * (0.26 + 0.2 * (((i * 5) % 3) / 2))
        return { x, y: drop, depth, glow: i === 0 ? 1 : 0, lit: i === 0, flicker: 0, post: 0, width: 0 }
      }
      const post = H * (portrait ? 0.52 : 0.6) * depth
      const width = post * scene.lamp.aspect
      const g = scene.lamp.glass
      // The glass sits where the sprite has it, measured from the post's foot.
      const top = H * scene.ground - post
      return { x, y: top + post * g.y, depth, glow: i === 0 ? 1 : 0, lit: i === 0, flicker: 0, post, width }
    })
    const radius = (depth: number) => unit * 0.034 * depth

    const moth = { x: W * 0.5, y: H * 0.8, vx: 0, vy: 0, target: 0, heading: -Math.PI / 2, near: 0 }
    const dust: { x: number; y: number; vx: number; vy: number; life: number }[] = []
    let lit = 1
    let t = 0
    let raf = 0
    let last = 0
    onLit?.(lit, lamps.length)

    /* ---- drawing ------------------------------------------------------- */

    const hexA = (hex: string, a: number) => {
      const n = Number.parseInt(hex.slice(1), 16)
      return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${Math.max(0, Math.min(1, a))})`
    }

    const drawLayer = (layer: Layer) => {
      const art = tints.get(layer.src)
      if (!art) return
      const drift = (moth.x / W - 0.5) * W * layer.parallax
      if (layer.anchor === 'top') {
        // Hung from the top and never tiled: one span of rafters, as wide as the room.
        const w = Math.max(W * 1.12, H * layer.height)
        const h = (w * art.height) / art.width
        ctx.drawImage(art, (W - w) / 2 - drift, H * layer.y, w, h)
        return
      }
      const h = H * layer.height
      const w = (h * art.width) / art.height
      const y = H * layer.y - h
      // Tiled from the centre outward, each tile the mirror of the last.
      const start = W / 2 - w / 2 - drift - (layer.offset ?? 0) * w - Math.ceil((W / 2 + w) / w) * w
      for (let x = start, i = 0; x < W + w; x += w, i++) {
        if (x + w < 0) continue
        if (i % 2) {
          ctx.save()
          ctx.translate(x + w, y)
          ctx.scale(-1, 1)
          ctx.drawImage(art, 0, 0, w, h)
          ctx.restore()
        } else {
          ctx.drawImage(art, x, y, w, h)
        }
      }
    }

    const drawSky = () => {
      const sky = ctx.createLinearGradient(0, 0, 0, H)
      sky.addColorStop(0, level.sky)
      sky.addColorStop(scene.water ?? 0.78, level.horizon)
      sky.addColorStop(1, level.sky)
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, H)

      for (const s of stars) {
        const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.rate + s.phase))
        ctx.fillStyle = `rgba(235, 240, 255, ${(a * 0.8).toFixed(3)})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      if (scene.stars) {
        // The moon, low on the far side from the first lamp, in its own halo.
        const mx = W * (level.scene === 'harbour' ? 0.2 : 0.8)
        const my = H * (portrait ? 0.14 : 0.2)
        const mr = unit * 0.045
        const halo = ctx.createRadialGradient(mx, my, mr * 0.8, mx, my, mr * 7)
        halo.addColorStop(0, 'rgba(220, 230, 255, 0.22)')
        halo.addColorStop(1, 'rgba(220, 230, 255, 0)')
        ctx.fillStyle = halo
        ctx.fillRect(mx - mr * 7, my - mr * 7, mr * 14, mr * 14)
        const face = ctx.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, mr * 0.1, mx, my, mr)
        face.addColorStop(0, '#fbf6e4')
        face.addColorStop(1, '#d9d2bc')
        ctx.fillStyle = face
        ctx.beginPath()
        ctx.arc(mx, my, mr, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // The attic's skylight: a pale shaft falling across the room.
        const beam = ctx.createLinearGradient(W * 0.2, 0, W * 0.45, H)
        beam.addColorStop(0, 'rgba(190, 205, 255, 0.13)')
        beam.addColorStop(1, 'rgba(190, 205, 255, 0)')
        ctx.fillStyle = beam
        ctx.beginPath()
        ctx.moveTo(W * 0.14, 0)
        ctx.lineTo(W * 0.3, 0)
        ctx.lineTo(W * 0.62, H)
        ctx.lineTo(W * 0.3, H)
        ctx.closePath()
        ctx.fill()
      }
    }

    const drawWater = () => {
      if (scene.water == null) return
      const top = H * scene.water
      const water = ctx.createLinearGradient(0, top, 0, H)
      water.addColorStop(0, hexA(level.horizon, 0.9))
      water.addColorStop(1, level.sky)
      ctx.fillStyle = water
      ctx.fillRect(0, top, W, H - top)
      // Each lit lamp laid on the water as a broken column of light.
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      for (const lamp of lamps) {
        if (lamp.glow < 0.05) continue
        for (let k = 0; k < 14; k++) {
          const y = top + (k + 0.5) * ((H - top) / 14)
          const wob = Math.sin(t * 1.7 + k * 1.3 + lamp.x) * unit * 0.012
          const len = unit * 0.05 * (1 - k / 18) * (0.6 + 0.4 * Math.sin(t * 2.3 + k))
          ctx.fillStyle = hexA(level.lamp, 0.16 * lamp.glow * (1 - k / 16))
          ctx.fillRect(lamp.x - len / 2 + wob, y, len, unit * 0.005)
        }
      }
      ctx.restore()
    }

    const drawLamps = () => {
      for (const lamp of lamps) {
        const target = lamp.lit ? 1 : 0.08
        lamp.glow += (target - lamp.glow) * 0.06
        // A newly lit lamp catches rather than fades up.
        if (lamp.flicker > 0) {
          lamp.flicker -= 1 / 60
          if (Math.sin(lamp.flicker * 90) > 0.2) lamp.glow *= 0.55
        }
        const g = lamp.glow * (lamp.lit ? 0.94 + 0.06 * Math.sin(t * 3 + lamp.x) : 1)
        const r = radius(lamp.depth)

        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        // bloom
        const bloom = ctx.createRadialGradient(lamp.x, lamp.y, 0, lamp.x, lamp.y, r * 11)
        bloom.addColorStop(0, hexA(level.lamp, 0.5 * g))
        bloom.addColorStop(0.25, hexA(level.lamp, 0.16 * g))
        bloom.addColorStop(1, hexA(level.lamp, 0))
        ctx.fillStyle = bloom
        ctx.fillRect(lamp.x - r * 11, lamp.y - r * 11, r * 22, r * 22)
        // a cone of light to the ground under a lantern
        if (scene.lamp && g > 0.1) {
          const foot = H * scene.ground
          const cone = ctx.createLinearGradient(0, lamp.y, 0, foot)
          cone.addColorStop(0, hexA(level.lamp, 0.13 * g))
          cone.addColorStop(1, hexA(level.lamp, 0))
          ctx.fillStyle = cone
          ctx.beginPath()
          ctx.moveTo(lamp.x - r * 0.9, lamp.y)
          ctx.lineTo(lamp.x + r * 0.9, lamp.y)
          ctx.lineTo(lamp.x + r * 5.5, foot)
          ctx.lineTo(lamp.x - r * 5.5, foot)
          ctx.closePath()
          ctx.fill()
        }
        ctx.restore()

        if (scene.lamp && lampTint) {
          // The glass, lit, then the ironwork over it.
          const s = scene.lamp.glass
          const left = lamp.x - lamp.width * s.x
          const top = lamp.y - lamp.post * s.y
          ctx.fillStyle = hexA(level.lamp, 0.12 + 0.88 * g)
          ctx.beginPath()
          ctx.ellipse(lamp.x, lamp.y, lamp.width * s.rx, lamp.post * s.ry, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.drawImage(lampTint, left, top, lamp.width, lamp.post)
        } else if (!scene.lamp) {
          // A bare bulb on its flex, hung from the beams.
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)'
          ctx.lineWidth = Math.max(1, unit * 0.003)
          ctx.beginPath()
          ctx.moveTo(lamp.x, 0)
          ctx.lineTo(lamp.x, lamp.y - r * 1.1)
          ctx.stroke()
          ctx.fillStyle = '#1a120c'
          ctx.fillRect(lamp.x - r * 0.42, lamp.y - r * 1.45, r * 0.84, r * 0.6)
          const bulb = ctx.createRadialGradient(lamp.x, lamp.y, 0, lamp.x, lamp.y, r)
          bulb.addColorStop(0, hexA('#fff6e0', 0.25 + 0.75 * g))
          bulb.addColorStop(1, hexA(level.lamp, 0.2 + 0.8 * g))
          ctx.fillStyle = bulb
          ctx.beginPath()
          ctx.ellipse(lamp.x, lamp.y, r * 0.72, r * 0.9, 0, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    const drawHaze = () => {
      const top = H * 0.45
      const haze = ctx.createLinearGradient(0, top, 0, H)
      haze.addColorStop(0, hexA(level.haze, 0))
      haze.addColorStop(1, hexA(level.haze, 0.55))
      ctx.fillStyle = haze
      ctx.fillRect(0, top, W, H - top)
    }

    // The moth is drawn on a scratch canvas first, so the lamp's colour can
    // be laid over its wings and nowhere else.
    const scratch = document.createElement('canvas')
    const sctx = scratch.getContext('2d')!
    const drawMoth = () => {
      if (!mothImg.naturalWidth) return
      const size = unit * 0.115
      const iw = mothImg.naturalWidth
      const ih = mothImg.naturalHeight
      const w = size
      const h = (size * ih) / iw
      scratch.width = Math.ceil(w) + 2
      scratch.height = Math.ceil(h) + 2
      const beat = 0.28 + 0.72 * Math.abs(Math.cos(t * 17))
      sctx.clearRect(0, 0, scratch.width, scratch.height)
      for (const side of [-1, 1]) {
        sctx.save()
        sctx.translate(scratch.width / 2, 0)
        sctx.scale(beat, 1)
        if (side < 0) sctx.drawImage(mothImg, 0, 0, iw / 2, ih, -w / 2, 1, w / 2, h)
        else sctx.drawImage(mothImg, iw / 2, 0, iw / 2, ih, 0, 1, w / 2, h)
        sctx.restore()
      }
      // the body, never foreshortened
      sctx.drawImage(mothImg, iw * 0.46, 0, iw * 0.08, ih, scratch.width / 2 - w * 0.04, 1, w * 0.08, h)
      sctx.globalCompositeOperation = 'source-atop'
      sctx.fillStyle = hexA(level.lamp, 0.12 + 0.4 * moth.near)
      sctx.fillRect(0, 0, scratch.width, scratch.height)
      sctx.globalCompositeOperation = 'source-over'

      ctx.save()
      ctx.translate(moth.x, moth.y)
      ctx.rotate(moth.heading + Math.PI / 2)
      ctx.shadowColor = hexA(level.lamp, 0.35 * moth.near)
      ctx.shadowBlur = unit * 0.03
      ctx.drawImage(scratch, -scratch.width / 2, -scratch.height / 2)
      ctx.restore()
    }

    const drawDust = () => {
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      for (const d of dust) {
        ctx.fillStyle = hexA(level.moth, 0.35 * d.life)
        ctx.beginPath()
        ctx.arc(d.x, d.y, unit * 0.0035, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }

    const drawVignette = () => {
      const v = ctx.createRadialGradient(W / 2, H * 0.45, unit * 0.35, W / 2, H * 0.5, Math.hypot(W, H) * 0.62)
      v.addColorStop(0, 'rgba(0, 0, 0, 0)')
      v.addColorStop(1, 'rgba(0, 0, 0, 0.55)')
      ctx.fillStyle = v
      ctx.fillRect(0, 0, W, H)
    }

    const draw = () => {
      ctx.globalCompositeOperation = 'source-over'
      drawSky()
      const [far, ...rest] = scene.layers
      if (far) drawLayer(far)
      drawWater()
      drawHaze()
      drawLamps()
      for (const layer of rest) drawLayer(layer)
      drawDust()
      drawMoth()
      drawVignette()
    }

    /* ---- the moth's flight ---------------------------------------------- */

    const step = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60
      last = now
      const k = dt * 60
      t += dt
      const target = lamps[moth.target]!
      const dx = target.x - moth.x
      const dy = target.y - moth.y
      const d = Math.hypot(dx, dy) || 1
      // pulled at the lamp, blown about a little, and never straight
      moth.vx += ((dx / d) * 0.2 + Math.cos(t * 2.3) * 0.13 + Math.sin(t * 7.1) * 0.05) * speed * k
      moth.vy += ((dy / d) * 0.2 + Math.sin(t * 1.9) * 0.13) * speed * k
      moth.vx *= 0.955 ** k
      moth.vy *= 0.955 ** k
      moth.x += moth.vx * k
      moth.y += moth.vy * k
      const heading = Math.atan2(moth.vy, moth.vx)
      let turn = heading - moth.heading
      turn = Math.atan2(Math.sin(turn), Math.cos(turn))
      moth.heading += turn * Math.min(1, 0.18 * k)
      moth.near += (Math.max(0, 1 - d / (unit * 0.45)) - moth.near) * 0.1
      if (Math.random() < 0.35 * k) {
        dust.push({ x: moth.x, y: moth.y, vx: (Math.random() - 0.5) * speed * 0.6, vy: speed * (0.2 + Math.random() * 0.4), life: 1 })
      }
      for (const p of dust) {
        p.x += p.vx * k
        p.y += p.vy * k
        p.life -= dt * 0.8
      }
      while (dust.length && dust[0]!.life <= 0) dust.shift()

      if (d < radius(target.depth) * 2.2) {
        if (!target.lit) {
          target.lit = true
          target.flicker = 0.45
          lit += 1
          onLit?.(lit, lamps.length)
        }
        moth.target = (moth.target + 1) % lamps.length
        if (moth.target === 0) {
          // every lamp lit: the night resets, and the moth starts again
          for (const [i, lamp] of lamps.entries()) lamp.lit = i === 0
          lit = 1
          onLit?.(lit, lamps.length)
        }
      }
      draw()
      raf = requestAnimationFrame(step)
    }

    if (still) {
      // One frame, redrawn as each picture arrives.
      redraw = draw
      draw()
      return
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [level, still, onLit])

  return <canvas ref={ref} width={Math.round(width / 2)} height={Math.round(height / 2)} style={{ display: 'block', width: '100%', height: '100%' }} />
}
