import * as React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { GalaxyMockup } from 'react-3d-mockups'
import { gyre } from 'tabbied/patterns'
import { SwissStack } from '@/components/screens/swiss-art'
import { useStage } from '../../campaigns/kit'
import { easeInOut, tween, type Vec3 } from '../../reel/motion'
import { BRAND, SANS } from '../brand'
import { CodeCard, t, type Segment } from '../code'
import { Ground, Kicker, Rise } from '../cards'
import { useDoodlesDrawn } from '../doodles'

/*
 * The site's own pitch, "Your component in 3D": the quick-start snippet types
 * itself out beside a Galaxy that faces the camera from the first frame, its
 * screen already lit, and swings slowly across as the code lands. It is the
 * Icy Blue S26 under a cool key light, so the phone stands off the near-black
 * ground instead of sinking into it.
 */

const SNIPPET: Segment[][] = [
  [t('keyword', 'import'), t('punct', ' { '), t('text', 'GalaxyMockup'), t('punct', ' } '), t('keyword', 'from'), t('string', " 'react-3d-mockups'")],
  [],
  [t('keyword', 'export function'), t('value', ' Hero'), t('punct', '() {')],
  [t('keyword', '  return'), t('punct', ' (')],
  [t('punct', '    <'), t('tag', 'GalaxyMockup'), t('attr', ' autoRotate float'), t('punct', '>')],
  [t('punct', '      <'), t('tag', 'YourApp'), t('punct', ' />')],
  [t('punct', '    </'), t('tag', 'GalaxyMockup'), t('punct', '>')],
  [t('punct', '  )')],
  [t('punct', '}')],
]

const TYPE_FROM = 10
const SPEED = 6

export function OneComponentShot() {
  const frame = useCurrentFrame()
  const { width } = useVideoConfig()
  const u = width / 1920
  const stage = useStage(true)
  useDoodlesDrawn('One component', 1)
  // Facing the camera from the start, a three-quarter view easing across to the other side.
  const swing = tween(frame, 0, 130, 0, 1, easeInOut)
  const rotation: Vec3 = [0.05, 0.42 - swing * 0.8, 0]
  return (
    <Ground glow={0.14}>
      {/* The key light: a cool pool behind the phone, so its edges read against the ground. */}
      <div
        style={{
          position: 'absolute',
          left: 900 * u,
          top: 20 * u,
          width: 980 * u,
          height: 1040 * u,
          background: 'radial-gradient(ellipse 42% 46% at 50% 48%, rgba(170, 200, 255, 0.24) 0%, rgba(120, 160, 230, 0.08) 45%, rgba(0, 0, 0, 0) 75%)',
        }}
      />
      <div style={{ position: 'absolute', left: 900 * u, top: 20 * u, width: 980 * u, height: 1040 * u }}>
        <GalaxyMockup {...stage} variant="s26" color="icyblue" statusBar={{ color: '#141414' }} rotation={rotation}>
          <SwissStack pattern={gyre} seed="promo-rotation" tone="midnight" grid="6x9" index="01" kicker="Rotation" title={'Slow\nturns'} meta="Neue Grafik · Zürich" />
        </GalaxyMockup>
      </div>
      <div style={{ position: 'absolute', left: 110 * u, top: 140 * u }}>
        <Kicker start={0}>npm install react-3d-mockups</Kicker>
        <div style={{ marginTop: 18 * u, fontFamily: SANS, fontWeight: 700, fontSize: 92 * u, lineHeight: 1, letterSpacing: '-0.045em', color: BRAND.text }}>
          <Rise text="Your component" start={2} step={2} />
          <br />
          <Rise text="in 3D." start={6} step={2} style={{ color: BRAND.green }} />
        </div>
        <CodeCard lines={SNIPPET} start={TYPE_FROM} speed={SPEED} file="hero.tsx" width={820} size={25} style={{ marginTop: 48 * u }} />
      </div>
    </Ground>
  )
}
