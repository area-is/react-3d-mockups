'use client'

import { CustomBoxMockup, CustomPanelMockup, MailerBoxMockup, ProductBoxMockup } from 'react-3d-mockups'
import { useNarrow } from '../_shared/use-narrow'
import { BoxFace, PanelFace } from './packaging-art'
import { STOCKS, find, type Spec } from './packaging-data'

/**
 * The box the customer is configuring, in whichever style they chose.
 * Three different models, one artwork component: the size, the stock and
 * the print all come off the spec, and switching the style swaps the
 * mockup under the same faces. The stock is painted as every face's
 * surface background, so the artwork prints ON the board.
 */
export function BoxScene({ spec }: { spec: Spec }) {
  const stock = find(STOCKS, spec.stock).color
  const face = (main: boolean, seed: string) => <BoxFace spec={spec} main={main} seed={seed} />
  // The boxes' own framings fill a landscape canvas; this stage is a tall
  // column beside the sliders, so the camera stands further back - and
  // further still on a phone, where the column is taller again.
  const narrow = useNarrow()
  const camera = { position: [0, 0.9, narrow ? 11 : 9.6] as [number, number, number], fov: 40 }
  if (spec.style === 'mailer') {
    return (
      <MailerBoxMockup float size={spec.size} color={stock} surfaceBackground={stock} tapeColor="rgba(120, 90, 50, 0.55)" rotation={[0, 0.42, 0]} camera={camera}>
        <MailerBoxMockup.Top>{face(true, 'ochre-top')}</MailerBoxMockup.Top>
        <MailerBoxMockup.Front>{face(false, 'ochre-front')}</MailerBoxMockup.Front>
        <MailerBoxMockup.Back>{face(false, 'ochre-back')}</MailerBoxMockup.Back>
        <MailerBoxMockup.Left>{face(false, 'ochre-left')}</MailerBoxMockup.Left>
        <MailerBoxMockup.Right>{face(false, 'ochre-right')}</MailerBoxMockup.Right>
      </MailerBoxMockup>
    )
  }
  if (spec.style === 'product') {
    return (
      <ProductBoxMockup float size={spec.size} color={stock} surfaceBackground={stock} rotation={[0, -0.4, 0]} camera={camera}>
        <ProductBoxMockup.Front>{face(true, 'ochre-front')}</ProductBoxMockup.Front>
        <ProductBoxMockup.Back>{face(false, 'ochre-back')}</ProductBoxMockup.Back>
        <ProductBoxMockup.Left>{face(false, 'ochre-left')}</ProductBoxMockup.Left>
        <ProductBoxMockup.Right>{face(false, 'ochre-right')}</ProductBoxMockup.Right>
        <ProductBoxMockup.Top>{face(false, 'ochre-top')}</ProductBoxMockup.Top>
      </ProductBoxMockup>
    )
  }
  return (
    <CustomBoxMockup float size={spec.size} color={stock} surfaceBackground={stock} rotation={[0, -0.4, 0]} camera={camera}>
      <CustomBoxMockup.Front>{face(true, 'ochre-front')}</CustomBoxMockup.Front>
      <CustomBoxMockup.Back>{face(false, 'ochre-back')}</CustomBoxMockup.Back>
      <CustomBoxMockup.Left>{face(false, 'ochre-left')}</CustomBoxMockup.Left>
      <CustomBoxMockup.Right>{face(false, 'ochre-right')}</CustomBoxMockup.Right>
      <CustomBoxMockup.Top>{face(false, 'ochre-top')}</CustomBoxMockup.Top>
    </CustomBoxMockup>
  )
}

/** A 600 x 400 mm counter display board in the same stock and artwork. */
export function PanelScene({ spec }: { spec: Spec }) {
  const stock = find(STOCKS, spec.stock).color
  return (
    <CustomPanelMockup float size={{ width: 600, height: 400, thickness: 5 }} color={stock} surfaceBackground={stock} rotation={[0, -0.3, 0]}>
      <PanelFace spec={spec} />
    </CustomPanelMockup>
  )
}
