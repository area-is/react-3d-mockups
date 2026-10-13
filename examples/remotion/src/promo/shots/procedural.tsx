import * as React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { FOLD_COLORWAYS, FoldMockup } from 'react-3d-mockups'
import { Newspaper } from '@/components/screens/device-apps'
import { useStage } from '../../campaigns/kit'
import { easeInOut, tween, type Vec3 } from '../../reel/motion'
import { Feature, Ground } from '../cards'
import { CodeCard, t } from '../code'

/*
 * "Procedural objects": nothing here was modelled in a 3D tool. The Fold is
 * built from geometry as it mounts, so its hinge and its finish are props -
 * it opens from shut onto The Meridian (the cover display carries the
 * paper's phone layout until the inner screen takes over), then turns to
 * show its back, in one colourway throughout: Mint, light enough to read
 * against the dark ground.
 */

const COLOUR = FOLD_COLORWAYS.fold7.find((c) => c.id === 'mint')!

export function ProceduralShot() {
  const frame = useCurrentFrame()
  const { width } = useVideoConfig()
  const u = width / 1920
  const stage = useStage(true)
  // From 1 degree, not 0: below half a degree the Fold swaps to its separate shut model.
  const openAngle = Math.round(tween(frame, 4, 40, 1, 150, easeInOut))
  const colour = COLOUR
  const turn = tween(frame, 44, 118, 0, 1, easeInOut)
  const rotation: Vec3 = [0.08, -0.32 + turn * 3.1, 0]
  return (
    <Ground glow={0.12}>
      <div style={{ position: 'absolute', left: 780 * u, top: 30 * u, width: 1120 * u, height: 1020 * u }}>
        <FoldMockup {...stage} variant="fold7" openAngle={openAngle} color={colour.id} statusBar={{ color: '#141414' }} rotation={rotation}>
          <Newspaper />
        </FoldMockup>
      </div>
      <Feature
        kicker="Procedural objects"
        title="No 3D files. Just props."
        sub="Every model is built from geometry at runtime."
        width={640}
        style={{ left: 110 * u, top: 130 * u }}
      />
      <CodeCard
        start={12}
        speed={6}
        width={640}
        size={26}
        caret={false}
        style={{ position: 'absolute', left: 110 * u, top: 620 * u }}
        lines={[
          [t('punct', '<'), t('tag', 'FoldMockup')],
          [t('attr', '  variant'), t('punct', '='), t('string', '"fold7"')],
          [t('attr', '  openAngle'), t('punct', '={'), t('value', String(openAngle)), t('punct', '}')],
          [t('attr', '  color'), t('punct', '='), t('string', `"${colour.id}"`)],
          [t('punct', '>')],
          [t('punct', '  <'), t('tag', 'Newspaper'), t('punct', ' />')],
          [t('punct', '</'), t('tag', 'FoldMockup'), t('punct', '>')],
        ]}
      />
    </Ground>
  )
}
