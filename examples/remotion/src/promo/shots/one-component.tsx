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
 * itself out, and the Galaxy turns round to show the screen as `<YourApp />`
 * lands in it.
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

const TYPE_FROM = 16
const SPEED = 2.4
/** Characters before `<YourApp />` finishes, so the turn lands on it. */
const UNTIL_APP = SNIPPET.slice(0, 6).reduce((n, line) => n + line.reduce((m, [, text]) => m + text.length, 0), 0)
const TURN = TYPE_FROM + UNTIL_APP / SPEED

export function OneComponentShot() {
  const frame = useCurrentFrame()
  const { width } = useVideoConfig()
  const u = width / 1920
  const stage = useStage(true)
  useDoodlesDrawn('One component', 1)
  // Back to the camera until the app is in it, then round to a three-quarter view, then a slow turntable.
  const turn = tween(frame, TURN - 6, TURN + 30, 0, 1, easeInOut)
  const rotation: Vec3 = [0.05, -Math.PI + turn * (Math.PI - 0.34) + Math.max(0, frame - TURN - 30) * 0.004, 0]
  return (
    <Ground glow={0.14}>
      <div style={{ position: 'absolute', left: 900 * u, top: 20 * u, width: 980 * u, height: 1040 * u }}>
        <GalaxyMockup {...stage} variant="s26" statusBar={{ color: '#141414' }} rotation={rotation}>
          <SwissStack pattern={gyre} seed="promo-rotation" tone="midnight" grid="6x9" index="01" kicker="Rotation" title={'Slow\nturns'} meta="Neue Grafik · Zürich" />
        </GalaxyMockup>
      </div>
      <div style={{ position: 'absolute', left: 110 * u, top: 140 * u }}>
        <Kicker start={2}>npm install react-3d-mockups</Kicker>
        <div style={{ marginTop: 18 * u, fontFamily: SANS, fontWeight: 700, fontSize: 92 * u, lineHeight: 1, letterSpacing: '-0.045em', color: BRAND.text }}>
          <Rise text="Your component" start={4} />
          <br />
          <Rise text="in 3D." start={10} style={{ color: BRAND.green }} />
        </div>
        <CodeCard lines={SNIPPET} start={TYPE_FROM} speed={SPEED} file="hero.tsx" width={820} size={25} style={{ marginTop: 48 * u }} />
      </div>
    </Ground>
  )
}
