import * as React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { AppleWatch, Flip, FoldMockup, Galaxy, IPhone, IPhoneMockup, Laptop, MockupCanvas, mockupInfo, type MockupKind } from 'react-3d-mockups'
import { floatPose } from 'react-3d-mockups/core'
import { bauhaus, dipole, halftone, sunray } from 'tabbied/patterns'
import { SwissStack } from '@/components/screens/swiss-art'
import { Newspaper } from '@/components/screens/device-apps'
import { Dashboard, INK, MobileApp, WatchFace, type LedgerState } from '@/app/examples/ledger/ledger-screens'
import { QUICK_ADDS, SEED_TRANSACTIONS, addTransaction, summarize, type Tx } from '@/app/examples/ledger/ledger-data'
import { FontGate, statusBarFont } from '../campaigns/kit'
import { useMockupCapture } from '../use-mockup-capture'
import { floated, type Vec3 } from '../reel/motion'
import { DocsFonts } from '../promo/docs-fonts'
import { PROMO_FONTS, SANS } from '../promo/brand'
import { Ground } from '../promo/cards'
import { useDoodlesDrawn } from '../promo/doodles'

/*
 * Short loops to post where a 38-second film is too long: a feed, a comment,
 * a README. Nothing but devices turning - no logo, no captions. Every motion
 * is periodic over the clip's length (whole turns, whole float bobs, whole
 * cycles on the screens), so the last frame runs straight back into the
 * first and a GIF of it loops without a seam.
 *
 * `scripts/render-clips.sh` renders them and encodes each as MP4, GIF and
 * animated WebP.
 */

export const TURN_LENGTH = 180
export const FOLD_LENGTH = 240
export const TRIO_LENGTH = 240
export const PHONES_LENGTH = 240

/** 0 → 1 over the clip; the frame after the last is 0 again. */
function useLoop() {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  return frame / durationInFrames
}

/** The library's idle float, stretched so one full bob takes exactly the clip. */
function loopFloat(loop: number, intensity = 1, phase = 0) {
  // floatPose's curve runs at 0.4 rad/s: one period is 2π / 0.4 seconds.
  return floatPose(loop * ((Math.PI * 2) / 0.4), intensity, phase)
}

/** A yaw that makes `turns` whole turns over the clip, from `from`. */
const spin = (loop: number, from = 0, turns = 1) => from + loop * Math.PI * 2 * turns

function Clip({ children }: { children: React.ReactNode }) {
  return (
    <DocsFonts>
      <FontGate fonts={PROMO_FONTS} style={statusBarFont('"Inter Variable"')}>
        <Ground glow={0.1} grid={false}>
          {children}
        </Ground>
      </FontGate>
    </DocsFonts>
  )
}

/* ------------------------------------------------------------------ */
/*  iPhone                                                             */
/* ------------------------------------------------------------------ */

/**
 * A music player whose every motion is a whole number of cycles over the
 * clip, so it loops with the phone. The reel's `MusicScreen` runs on the
 * video's clock and would jump at the seam.
 */
function LoopingPlayer({ loop, accent = '#ff6b4a' }: { loop: number; accent?: string }) {
  const turn = loop * Math.PI * 2
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: SANS,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #2a1712 0%, #0d0a0a 70%)',
        color: '#fff',
        padding: '22% 9% 10%',
      }}
    >
      <div
        style={{
          aspectRatio: '1',
          borderRadius: 28,
          background: `conic-gradient(from ${loop * 360}deg, ${accent}, #ffd166, #7b5cff, ${accent})`,
          boxShadow: `0 30px 60px ${accent}55`,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <div style={{ width: '34%', aspectRatio: '1', borderRadius: '50%', background: '#0d0a0a', border: '10px solid rgba(255,255,255,.18)' }} />
      </div>
      <div style={{ marginTop: '11%', fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em' }}>Afterglow Drive</div>
      <div style={{ marginTop: 6, fontSize: 20, opacity: 0.6 }}>The Parallax Club</div>
      <div style={{ marginTop: '9%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,.18)' }}>
        <div style={{ width: '41%', height: '100%', borderRadius: 3, background: accent }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 16, opacity: 0.6, fontVariantNumeric: 'tabular-nums' }}>
        <span>1:28</span>
        <span>-2:06</span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 6, marginTop: '8%' }}>
        {Array.from({ length: 18 }, (_, i) => {
          const h = 0.25 + 0.75 * Math.abs(Math.sin(turn * (4 + (i % 5)) + i * 1.7))
          return <div key={i} style={{ flex: 1, height: `${h * 100}%`, borderRadius: 4, background: i % 3 ? accent : '#ffd166', opacity: 0.9 }} />
        })}
      </div>
    </div>
  )
}

/** 1080 × 1080: an iPhone 18 Pro Max making one turn, a live player on its glass. */
export function TurnClip() {
  const loop = useLoop()
  const delayCapture = useMockupCapture()
  const pose = floated(loopFloat(loop, 0.8), [0, 0, 0], [0.1, spin(loop, -0.5), 0])
  return (
    <Clip>
      <IPhoneMockup
        controls={false}
        float={false}
        delayCapture={delayCapture}
        variant="18promax"
        color="glacier"
        statusBar
        position={pose.position}
        rotation={pose.rotation}
        label="An iPhone 18 Pro Max mockup turning, a music player on its screen"
      >
        <LoopingPlayer loop={loop} />
      </IPhoneMockup>
    </Clip>
  )
}

/* ------------------------------------------------------------------ */
/*  Fold                                                               */
/* ------------------------------------------------------------------ */

/** 1080 × 1080: a Galaxy Z Fold7, half open, making one turn with a newspaper across both pages. */
export function FoldClip() {
  const loop = useLoop()
  const delayCapture = useMockupCapture()
  const pose = floated(loopFloat(loop, 0.6, 1.1), [0, 0, 0], [0.12, spin(loop, -0.35), 0])
  return (
    <Clip>
      <FoldMockup
        controls={false}
        float={false}
        delayCapture={delayCapture}
        variant="fold7"
        openAngle={140}
        // The mockup frames the Fold for its open pose; turning, it needs the room.
        scale={0.8}
        color="silvershadow"
        statusBar={{ color: '#141414' }}
        position={pose.position}
        rotation={pose.rotation}
        label="A Galaxy Z Fold7 mockup turning, a newspaper on its screen"
      >
        <Newspaper />
      </FoldMockup>
    </Clip>
  )
}

/* ------------------------------------------------------------------ */
/*  Laptop, phone and watch                                            */
/* ------------------------------------------------------------------ */

/**
 * The Ledger sample's three screens on one React state. Three purchases land
 * and are taken off again, newest first, so the state is back where it
 * started by the seam.
 */
const ADDS = [30, 60, 90]
const UNDOS = [150, 180, 210]

function ledgerAt(frame: number): LedgerState {
  const added = ADDS.filter((at) => frame >= at).length - UNDOS.filter((at) => frame >= at).length
  let list: Tx[] = SEED_TRANSACTIONS
  for (let i = 0; i < added; i++) list = addTransaction(list, QUICK_ADDS[i]!)
  return { transactions: list, summary: summarize(list) }
}

/** 1920 × 1080: a MacBook Pro, an iPhone and an Apple Watch, each making one turn. */
export function TrioClip() {
  const frame = useCurrentFrame()
  const loop = useLoop()
  const delayCapture = useMockupCapture()
  const state = React.useMemo(() => ledgerAt(frame), [frame])
  const laptop = floated(loopFloat(loop, 0.5, 0), [0, -0.45, -0.6], [0.05, spin(loop, -0.2), 0])
  const phone = floated(loopFloat(loop, 0.8, 1.7), [3.7, -0.75, 0.9], [0.06, spin(loop, -0.4, -1), 0])
  const watch = floated(loopFloat(loop, 0.7, 3.1), [-3.7, -0.75, 0.9], [0.08, spin(loop, 0.45, -1), 0])
  return (
    <Clip>
      <MockupCanvas
        controls={false}
        delayCapture={delayCapture}
        camera={{ position: [0, 0.7, 10.6], fov: 36 }}
        shadowY={-1.75}
        label="A laptop, a phone and a watch turning, one budgeting app on all three"
      >
        <Laptop variant="pro14" color="#2c2e33" position={laptop.position} rotation={laptop.rotation} surfaceBackground={INK}>
          <Dashboard state={state} />
        </Laptop>
        <IPhone variant="pro" color="deepblue" statusBar position={phone.position} rotation={phone.rotation} scale={0.6} surfaceBackground={INK}>
          <MobileApp state={state} />
        </IPhone>
        <AppleWatch color="jetblack" bandColor="#1d2028" position={watch.position} rotation={watch.rotation} scale={0.5} surfaceBackground="#000">
          <WatchFace state={state} />
        </AppleWatch>
      </MockupCanvas>
    </Clip>
  )
}

/* ------------------------------------------------------------------ */
/*  A row of phones                                                    */
/* ------------------------------------------------------------------ */

/** Every model scaled from its own units to this many millimetres a unit, so they keep their true sizes. */
const MM = 100
const trueSize = (kind: MockupKind) => mockupInfo(kind as never, {} as never).mmPerUnit / MM

const LIGHT_BAR = { color: '#efede6' }
const DARK_BAR = { color: '#141414' }

/** 1920 × 1080: four phones at their true sizes, each turning once, a quarter turn apart. */
export function PhonesClip() {
  const loop = useLoop()
  const delayCapture = useMockupCapture()
  useDoodlesDrawn('Phones', 4)
  const at = (i: number, x: number) => floated(loopFloat(loop, 0.6, i * 1.6), [x, 0, 0], [0.06, spin(loop, -0.6 + (i * Math.PI) / 2), 0])
  const poses = [at(0, -1.8), at(1, -0.6), at(2, 0.6), at(3, 1.8)]
  return (
    <Clip>
      <MockupCanvas
        controls={false}
        delayCapture={delayCapture}
        camera={{ position: [0, 0.25, 5.4], fov: 30 }}
        shadowY={-0.95}
        label="Four phone mockups turning side by side"
      >
        <IPhone variant="pro" color="cosmicorange" statusBar={LIGHT_BAR} {...poses[0]!} scale={trueSize('iphone')}>
          <SwissStack pattern={halftone} seed="clip-raster" tone="ember" grid="6x9" index="02" kicker="Raster" title={'Half\ntone'} meta="Plate 02 · 175 lpi" />
        </IPhone>
        <Galaxy variant="s26ultra" color="titaniumsilverblue" statusBar={DARK_BAR} {...poses[1]!} scale={trueSize('galaxy')}>
          <SwissStack pattern={bauhaus} seed="clip-bauhaus" tone="cobalt" grid="6x9" index="03" kicker="Bauhaus" title={'Prime\nshapes'} meta="Dessau · 1925" />
        </Galaxy>
        <Flip variant="flip7" openAngle={180} color="mint" statusBar={LIGHT_BAR} {...poses[2]!} scale={trueSize('flip')}>
          <SwissStack pattern={dipole} seed="clip-field" tone="moss" grid="8x12" index="04" kicker="Feld" title={'Line\nfield'} meta="Studies in radiance" />
        </Flip>
        <IPhone variant="air" color="skyblue" statusBar={DARK_BAR} {...poses[3]!} scale={trueSize('iphone')}>
          <SwissStack pattern={sunray} seed="clip-sunray" tone="tangerine" grid="6x9" index="05" kicker="Strahl" title={'Sun\nrays'} meta="Plate 05 · Offset" />
        </IPhone>
      </MockupCanvas>
    </Clip>
  )
}
