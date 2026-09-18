'use client'

import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from 'react-3d-mockups'
import type { Level } from './arcade-data'

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
 * Drawn at half the surface's resolution and scaled up by CSS: a game
 * that runs at 1920 x 1080 on a screen a few hundred pixels wide is
 * spending its fill rate on nothing. Under `prefers-reduced-motion` one
 * frame is drawn and the loop never starts.
 */
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
    const speed = unit / 540

    // Lamps along a line, staggered, the first already lit.
    const lamps = Array.from({ length: level.lamps }, (_, i) => {
      const f = level.lamps === 1 ? 0.5 : i / (level.lamps - 1)
      return {
        x: W * (0.1 + 0.8 * f),
        y: H * (0.22 + 0.3 * (((i * 5) % 3) / 2)),
        r: unit * 0.032,
        lit: i === 0,
        glow: i === 0 ? 1 : 0,
      }
    })
    const moth = { x: W * 0.5, y: H * 0.86, vx: 0, vy: 0, target: 0, heading: 0 }
    let lit = 1
    let t = 0
    let raf = 0
    onLit?.(lit, lamps.length)

    const draw = () => {
      // sky, then the haze that the lamps sit in
      ctx.fillStyle = level.sky
      ctx.fillRect(0, 0, W, H)
      const haze = ctx.createLinearGradient(0, H * 0.45, 0, H)
      haze.addColorStop(0, 'rgba(0,0,0,0)')
      haze.addColorStop(1, level.haze)
      ctx.fillStyle = haze
      ctx.fillRect(0, 0, W, H)
      // the wall the lamps hang on
      ctx.fillStyle = 'rgba(0,0,0,0.28)'
      ctx.fillRect(0, H * 0.72, W, H)
      for (const lamp of lamps) {
        lamp.glow += ((lamp.lit ? 1 : 0.12) - lamp.glow) * 0.04
        // post
        ctx.strokeStyle = 'rgba(255,255,255,0.12)'
        ctx.lineWidth = unit * 0.006
        ctx.beginPath()
        ctx.moveTo(lamp.x, lamp.y + lamp.r)
        ctx.lineTo(lamp.x, H * 0.72)
        ctx.stroke()
        // glow
        const g = ctx.createRadialGradient(lamp.x, lamp.y, 0, lamp.x, lamp.y, lamp.r * 9)
        g.addColorStop(0, hexA(level.lamp, 0.55 * lamp.glow))
        g.addColorStop(0.35, hexA(level.lamp, 0.16 * lamp.glow))
        g.addColorStop(1, hexA(level.lamp, 0))
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(lamp.x, lamp.y, lamp.r * 9, 0, Math.PI * 2)
        ctx.fill()
        // bulb
        ctx.fillStyle = hexA(level.lamp, 0.25 + 0.75 * lamp.glow)
        ctx.beginPath()
        ctx.arc(lamp.x, lamp.y, lamp.r, 0, Math.PI * 2)
        ctx.fill()
      }
      // the moth: a body and two wings, beating
      const wing = Math.sin(t * 26)
      ctx.save()
      ctx.translate(moth.x, moth.y)
      ctx.rotate(moth.heading)
      ctx.fillStyle = level.moth
      const s = unit * 0.02
      for (const side of [-1, 1]) {
        ctx.save()
        ctx.scale(1, side)
        ctx.beginPath()
        ctx.ellipse(-s * 0.2, -s * (1.1 + 0.6 * wing), s * 1.5, s * (0.9 + 0.5 * Math.abs(wing)), -0.3, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      ctx.beginPath()
      ctx.ellipse(0, 0, s * 1.6, s * 0.55, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    const step = () => {
      t += 1 / 60
      const target = lamps[moth.target]!
      const dx = target.x - moth.x
      const dy = target.y - moth.y
      const d = Math.hypot(dx, dy) || 1
      // pulled at the lamp, blown about a little, and never straight
      moth.vx += ((dx / d) * 0.2 + Math.cos(t * 2.3) * 0.13 + Math.sin(t * 7.1) * 0.05) * speed
      moth.vy += ((dy / d) * 0.2 + Math.sin(t * 1.9) * 0.13) * speed
      moth.vx *= 0.955
      moth.vy *= 0.955
      moth.x += moth.vx
      moth.y += moth.vy
      moth.heading = Math.atan2(moth.vy, moth.vx)
      if (d < target.r * 2.2) {
        if (!target.lit) {
          target.lit = true
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
      draw()
      return
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [level, still, onLit])

  return <canvas ref={ref} width={Math.round(width / 2)} height={Math.round(height / 2)} style={{ display: 'block', width: '100%', height: '100%' }} />
}

/** `#rrggbb` with an alpha, for the gradients. */
function hexA(hex: string, a: number): string {
  const n = Number.parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${Math.max(0, Math.min(1, a))})`
}
