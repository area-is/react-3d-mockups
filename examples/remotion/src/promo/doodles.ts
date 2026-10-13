import * as React from 'react'
import { useDelayRender } from 'remotion'

/*
 * The docs artwork's patterns are Tabbied designs, drawn by `<css-doodle>`
 * asynchronously after they mount, and their own `onReady` is not reachable
 * through the art components. This holds a shot's first frame until every
 * pattern on the page has cells in it, so no frame catches a blank panel.
 *
 * Every pattern in the film keeps one seed for the length of its shot: a new
 * seed would morph the cells through Tabbied's CSS transitions, which run on
 * the browser's clock and land differently in every render.
 */
export function useDoodlesDrawn(label: string, expect = 1) {
  const { delayRender, continueRender } = useDelayRender()
  React.useLayoutEffect(() => {
    const handle = delayRender(`Patterns drawn: ${label}`, { timeoutInMilliseconds: 60_000 })
    let finished = false
    let calm = 0
    const started = performance.now()
    const finish = () => {
      if (finished) return
      finished = true
      clearInterval(timer)
      // Two more frames, so the cells' first paint has reached the screen.
      requestAnimationFrame(() => requestAnimationFrame(() => continueRender(handle)))
    }
    const timer = setInterval(() => {
      const doodles = Array.from(document.querySelectorAll('css-doodle'))
      const drawn = doodles.filter((doodle) => doodle.shadowRoot?.querySelector('cssd-cell')).length
      calm = doodles.length >= expect && drawn === doodles.length ? calm + 1 : 0
      if (calm >= 3) finish()
      else if (performance.now() - started > 30_000) {
        console.warn(`[promo] ${label}: ${drawn} of ${doodles.length} patterns drawn after 30 s, expected ${expect}`)
        finish()
      }
    }, 50)
    return () => {
      clearInterval(timer)
      if (!finished) continueRender(handle)
    }
  }, [delayRender, continueRender, label, expect])
}
