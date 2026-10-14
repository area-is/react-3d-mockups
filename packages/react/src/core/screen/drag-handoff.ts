/**
 * EXPERIMENTAL (`experimentalScreenInput`): drag-to-rotate on a screen that
 * takes input.
 *
 * A screen taking input sits above the canvas, so a press on it reaches the
 * content and never the orbit controls, which listen on the canvas. This
 * hands a press over once it turns out to be a drag: a tap or a click stays
 * the content's, and once the pointer has travelled `SCREEN_DRAG_THRESHOLD_PX`
 * the press is replayed on the canvas from where it began, the controls
 * capture the pointer, and the rest of the gesture turns the model. The
 * content then gets no click for it.
 *
 * Some presses are the content's to drag, and are never handed over:
 * - in a text field, a slider, a select or editable text (`NO_HANDOFF`),
 *   where a drag selects text or moves a thumb;
 * - inside anything marked `data-mockup-no-rotate`, for content with drags
 *   of its own (a drawing pad, a carousel);
 * - one the content captures (`setPointerCapture`), which is how most custom
 *   drag code claims a pointer - for touch and pen, only on an element other
 *   than the one pressed, which the browser captures to by itself;
 * - on touch, a mostly vertical one: that is the page's (or the screen's own)
 *   scroll, as it is everywhere else on the mockup (`canvasTouchAction`).
 *
 * DOM only, no React and no three.js.
 */

/** How far (CSS px) a press travels before it stops being a tap for the content and turns the model. */
export const SCREEN_DRAG_THRESHOLD_PX = 10

/** Presses that start inside these keep their drag. */
export const NO_HANDOFF = 'input, textarea, select, [contenteditable=""], [contenteditable="true"], [data-mockup-no-rotate]'

/** How long after a handed-over gesture a click on the screen is swallowed. */
const CLICK_GRACE_MS = 400

export interface ScreenDragHandoff {
  /**
   * Call from the screen wrapper's `pointerdown` listener, in the bubble
   * phase, so the content's own handlers have had their say. Taps are left
   * alone; a press that becomes a drag is handed to the canvas.
   */
  onPointerDown(event: PointerEvent): void
  /** Cancel any gesture in flight and detach every listener. */
  dispose(): void
}

const pointerInit = (event: PointerEvent, x: number, y: number, buttons: number): PointerEventInit => ({
  bubbles: true,
  cancelable: true,
  composed: true,
  pointerId: event.pointerId,
  pointerType: event.pointerType,
  isPrimary: event.isPrimary,
  button: 0,
  buttons,
  clientX: x,
  clientY: y,
  screenX: event.screenX - event.clientX + x,
  screenY: event.screenY - event.clientY + y,
  width: event.width,
  height: event.height,
  pressure: buttons ? event.pressure || 0.5 : 0,
})

/**
 * The handoff for one screen: `screen` is the element whose clicks are
 * swallowed after a drag, `getCanvas` the canvas the orbit controls listen
 * on (looked up per gesture), `enabled` whether the controls are on at all -
 * with them off there is nothing to hand to, and the content keeps the drag.
 */
export function createScreenDragHandoff(
  screen: HTMLElement,
  getCanvas: () => HTMLElement | null | undefined,
  enabled: () => boolean = () => true
): ScreenDragHandoff {
  let cancelGesture: (() => void) | null = null
  let swallowUntil = 0

  const onClick = (event: MouseEvent) => {
    if (performance.now() > swallowUntil) return
    swallowUntil = 0
    event.preventDefault()
    event.stopPropagation()
  }
  // Capture phase, so the content's own handlers never see it.
  screen.addEventListener('click', onClick, true)

  const onPointerDown = (event: PointerEvent) => {
    if (cancelGesture || !enabled() || !event.isPrimary) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const origin = event.target instanceof Element ? event.target : null
    if (origin?.closest(NO_HANDOFF)) return
    const canvas = getCanvas()
    if (!canvas) return

    const id = event.pointerId
    const start = { x: event.clientX, y: event.clientY }
    let handed = false
    // Once the canvas holds the pointer, its events land on it by themselves;
    // until then (or if capture never takes), each one is forwarded by hand.
    const forward = (e: PointerEvent) => e.target !== canvas

    const end = () => {
      window.removeEventListener('pointermove', onMove, true)
      window.removeEventListener('pointerup', onUp, true)
      window.removeEventListener('pointercancel', onCancel, true)
      window.removeEventListener('gotpointercapture', onCapture, true)
      cancelGesture = null
    }
    const onCapture = (e: PointerEvent) => {
      if (handed || e.pointerId !== id || e.target === canvas) return
      // A touch is captured to what it pressed without anyone asking (the
      // browser's implicit capture); only a capture elsewhere is the content
      // claiming the drag.
      if (e.pointerType !== 'mouse' && e.target === origin) return
      end()
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      if (handed) {
        if (forward(e)) canvas.dispatchEvent(new PointerEvent('pointermove', pointerInit(e, e.clientX, e.clientY, 1)))
        return
      }
      const dx = e.clientX - start.x
      const dy = e.clientY - start.y
      if (Math.hypot(dx, dy) < SCREEN_DRAG_THRESHOLD_PX) return
      // Vertical on touch is a scroll; the browser has it already.
      if (e.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx)) return end()
      handed = true
      // From where the press began, so the model turns by the whole drag.
      canvas.dispatchEvent(new PointerEvent('pointerdown', pointerInit(e, start.x, start.y, 1)))
      canvas.dispatchEvent(new PointerEvent('pointermove', pointerInit(e, e.clientX, e.clientY, 1)))
      // A mouse drag over text has begun a selection the content never wanted.
      window.getSelection()?.removeAllRanges()
    }
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      if (handed) {
        if (forward(e)) canvas.dispatchEvent(new PointerEvent('pointerup', pointerInit(e, e.clientX, e.clientY, 0)))
        // The click this release makes is the drag's, not the content's.
        swallowUntil = performance.now() + CLICK_GRACE_MS
      }
      end()
    }
    const onCancel = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      if (handed && forward(e)) canvas.dispatchEvent(new PointerEvent('pointercancel', pointerInit(e, e.clientX, e.clientY, 0)))
      end()
    }

    cancelGesture = end
    // Capture phase on the window: content that stops propagation of its
    // own moves cannot hide them from the handoff.
    window.addEventListener('pointermove', onMove, true)
    window.addEventListener('pointerup', onUp, true)
    window.addEventListener('pointercancel', onCancel, true)
    window.addEventListener('gotpointercapture', onCapture, true)
  }

  return {
    onPointerDown,
    dispose: () => {
      cancelGesture?.()
      screen.removeEventListener('click', onClick, true)
    },
  }
}
