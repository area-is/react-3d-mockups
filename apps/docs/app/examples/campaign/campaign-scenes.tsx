'use client'

import { useEffect, useState } from 'react'
import {
  BillboardMockup,
  BusShelterMockup,
  DOOHTotemMockup,
  GalaxyMockup,
  IDCardMockup,
  RollupBannerMockup,
  ShoppingBagMockup,
} from 'react-3d-mockups'
import { ACID, BAG, NIGHT } from './campaign-identity'
import { Board, Bulletin, Pass, PhoneApp, Poster, Tote, Wayfinding } from './campaign-art'

/**
 * Every object in the case study, dressed. Each is its own canvas, so each
 * is its own export here and the page mounts them one at a time through
 * `LazyScene` - a case study long enough to scroll is a page with more
 * WebGL contexts than a browser will keep alive at once.
 *
 * The street furniture is all set in the same dark steel, and every
 * `surfaceBackground` is the identity's night, so the moment before a
 * pattern paints is the ground it will paint on rather than a white flash.
 */

/** The dark steel the street furniture is finished in. */
const STEEL = '#23262d'

/**
 * Whether the viewport is a phone's. The hero's camera is chosen for a wide
 * box; on a narrow one the same pose crops the face at both edges, so the
 * bulletin falls back to its stock framing there.
 */
function useNarrow(query = '(max-width: 760px)') {
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const sync = () => setNarrow(mql.matches)
    sync()
    mql.addEventListener('change', sync)
    return () => mql.removeEventListener('change', sync)
  }, [query])
  return narrow
}

/**
 * The hero. The bulletin's own framing fits the whole monopole into the
 * canvas, which makes a 48-foot face a postage stamp in a wide box. So the
 * object is dropped until the face sits at the orbit's centre (the face is
 * 1.1 units above the stage origin) and the camera brought in to fill three
 * quarters of the width with it; the pole runs off the foot of the box, the
 * way a bulletin does when you stand under it. No contact shadow: the ground
 * is out of frame and the plane would cut across the pole instead.
 */
export function BulletinScene() {
  const narrow = useNarrow()
  return (
    <BillboardMockup
      float
      color={STEEL}
      surfaceBackground={NIGHT}
      rotation={[0, -0.2, 0]}
      position={narrow ? undefined : [0, -0.95, 0]}
      camera={narrow ? undefined : { position: [0, 0.35, 6.6], fov: 36 }}
      shadows={narrow}
    >
      <Bulletin />
    </BillboardMockup>
  )
}

export function ShelterScene() {
  return (
    <BusShelterMockup float color={STEEL} surfaceBackground={NIGHT} rotation={[0, -0.62, 0]}>
      <BusShelterMockup.Poster>
        <Poster seed="aperture-6sheet" />
      </BusShelterMockup.Poster>
      <BusShelterMockup.Inner>
        <Poster seed="aperture-6sheet" />
      </BusShelterMockup.Inner>
      {/* Strings become the built-in dot-matrix arrivals board, one row each. */}
      <BusShelterMockup.Arrivals>{['Aperture shuttle   4 min', '15  Alcântara      9 min', '728 Cais do Sodré 12 min']}</BusShelterMockup.Arrivals>
    </BusShelterMockup>
  )
}

export function TotemScene() {
  return (
    <DOOHTotemMockup float color={STEEL} surfaceBackground={NIGHT} rotation={[0, -0.4, 0]}>
      <DOOHTotemMockup.Front>
        <Poster live seed="aperture-totem" />
      </DOOHTotemMockup.Front>
      <DOOHTotemMockup.Back>
        <Board />
      </DOOHTotemMockup.Back>
    </DOOHTotemMockup>
  )
}

export function PhoneScene() {
  return (
    <GalaxyMockup float variant="s26" color="#15131c" statusBar surfaceBackground={NIGHT} rotation={[0, -0.32, 0]}>
      <PhoneApp />
    </GalaxyMockup>
  )
}

export function ToteScene() {
  return (
    <ShoppingBagMockup float color={BAG} surfaceBackground={BAG} handleColor="#2b2833" rotation={[0, 0.3, 0]}>
      <Tote />
    </ShoppingBagMockup>
  )
}

export function PassScene() {
  return (
    <IDCardMockup float color="#121017" lanyardColor={ACID} surfaceBackground={NIGHT} rotation={[0, -0.25, 0.04]}>
      <Pass />
    </IDCardMockup>
  )
}

export function BannerScene() {
  return (
    <RollupBannerMockup float color={STEEL} surfaceBackground={NIGHT} rotation={[0, -0.3, 0]}>
      <Wayfinding />
    </RollupBannerMockup>
  )
}
