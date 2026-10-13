import * as React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { AppleWatch, IPhone, Laptop, MockupCanvas } from 'react-3d-mockups'
import { Dashboard, INK, MobileApp, WatchFace, type LedgerState } from '@/app/examples/ledger/ledger-screens'
import { QUICK_ADDS, SEED_TRANSACTIONS, addTransaction, eur, summarize, type Tx } from '@/app/examples/ledger/ledger-data'
import { useMockupCapture } from '../../use-mockup-capture'
import { easeInOut, easeOut, floatAt, floated, tween, type Vec3 } from '../../reel/motion'
import { BRAND, MONO } from '../brand'
import { Feature, Ground } from '../cards'
import { useDoodlesDrawn } from '../doodles'

/*
 * "Any content on the surface": the Ledger sample site's laptop, phone and
 * watch in one canvas, rendering one React state. A purchase lands on every
 * beat, and the dashboard, the app and the watch complication all move with
 * it - real DOM on the glass, not a picture of an app.
 */

/** Frames a purchase is added on: beats into the shot. */
const ADDS = [52, 82, 112, 142]

function ledgerAt(frame: number): { state: LedgerState; last: (typeof QUICK_ADDS)[number] | null; since: number } {
  let list: Tx[] = SEED_TRANSACTIONS
  let last: (typeof QUICK_ADDS)[number] | null = null
  let since = Infinity
  ADDS.forEach((at, i) => {
    if (frame >= at) {
      last = QUICK_ADDS[i % QUICK_ADDS.length]!
      list = addTransaction(list, last)
      since = frame - at
    }
  })
  return { state: { transactions: list, summary: summarize(list) }, last, since }
}

export function LiveDomShot() {
  const frame = useCurrentFrame()
  const { width, fps } = useVideoConfig()
  const u = width / 1920
  const delayCapture = useMockupCapture()
  useDoodlesDrawn('Ledger', 1)
  const { state, last, since } = React.useMemo(() => ledgerAt(frame), [frame])
  // A slow push towards the laptop's glass, so the type is seen to stay sharp.
  const push = tween(frame, 0, 240, 0, 1, easeInOut)
  const camera = { position: [0.2 + push * 0.3, 0.55 - push * 0.1, 11 - push * 1.2] as Vec3, fov: 38 }
  const laptop = floated(floatAt(frame, fps, 0.5, 0), [0, -0.5, -0.4], [0, -0.16, 0])
  const phone = floated(floatAt(frame, fps, 0.8, 1.7), [2.5, -0.95, 1.55], [0, -0.34, 0])
  const watch = floated(floatAt(frame, fps, 0.7, 3.1), [-2.45, -0.8, 1.35], [0, 0.42, 0])
  const pop = since === Infinity ? 0 : tween(since, 0, 8, 0, 1, easeOut) * (1 - tween(since, 22, 30, 0, 1))
  return (
    <Ground glow={0.1}>
      <div style={{ position: 'absolute', left: 640 * u, top: 0, width: 1280 * u, height: 1080 * u }}>
        <MockupCanvas controls={false} delayCapture={delayCapture} camera={camera} shadowY={-1.75} label="Ledger on a laptop, a phone and a watch">
          <Laptop variant="pro14" color="#2c2e33" position={laptop.position} rotation={laptop.rotation} surfaceBackground={INK}>
            <Dashboard state={state} />
          </Laptop>
          <IPhone variant="pro" color="deepblue" statusBar position={phone.position} rotation={phone.rotation} scale={0.55} surfaceBackground={INK}>
            <MobileApp state={state} />
          </IPhone>
          <AppleWatch color="jetblack" bandColor="#1d2028" position={watch.position} rotation={watch.rotation} scale={0.44} surfaceBackground="#000">
            <WatchFace state={state} />
          </AppleWatch>
        </MockupCanvas>
      </div>
      <Feature kicker="Any content on the surface" title="Real DOM, not a texture." sub="Components, video and iframes stay live. Here one React state drives three screens." width={620} style={{ left: 110 * u, top: 150 * u }} />
      <div
        style={{
          position: 'absolute',
          left: 110 * u,
          top: 690 * u,
          padding: `${16 * u}px ${22 * u}px`,
          borderRadius: 12 * u,
          background: BRAND.panel,
          border: `${1.5 * u}px solid ${pop > 0.05 ? BRAND.green : BRAND.border}`,
          fontFamily: MONO,
          fontSize: 24 * u,
          color: BRAND.text,
          opacity: tween(frame, 40, 52, 0, 1),
          transform: `scale(${1 + pop * 0.04})`,
          transformOrigin: 'left center',
        }}
      >
        <span style={{ color: '#ff7b72' }}>setTransactions</span>
        <span style={{ color: '#7d8590' }}>(</span>
        <span style={{ color: '#a5d6ff' }}>{last ? `'${last.label}'` : '…'}</span>
        <span style={{ color: '#7d8590' }}>)</span>
        <span style={{ color: BRAND.green, marginLeft: 18 * u }}>{last ? `+${eur(last.amount)}` : ''}</span>
        <div style={{ marginTop: 8 * u, fontSize: 19 * u, color: BRAND.low }}>
          today {eur(state.summary.today)} · this week {eur(state.summary.week)}
        </div>
      </div>
    </Ground>
  )
}
