import * as React from 'react'
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion'
import {
  AppleWatchMockup,
  BillboardMockup,
  BookMockup,
  BusMockup,
  FlipMockup,
  IPadMockup,
  IPhoneMockup,
  MilkCartonMockup,
  ProductBoxMockup,
  ShoppingBagMockup,
  StudioDisplayMockup,
  VinylRecordMockup,
} from 'react-3d-mockups'
import { chase, dipole, epicentre, gyre, halftone } from 'tabbied/patterns'
import { SwissDial, SwissSplit, SwissStack } from '@/components/screens/swiss-art'
import { BillboardAdArt } from '@/components/screens/print-art'
import { SUNPEEL_FLAVOURS, SunpeelRear, SunpeelSide } from '@/components/screens/bus-wrap'
import { CartonBack, CartonFacts, CartonFront, CartonRoof, CartonStory } from '@/components/screens/carton-art'
import { BagBack, BagFront, CerealBack, CerealFacts, CerealFront, CerealStory, CerealTop } from '@/components/screens/package-art'
import { JacketBack, JacketCover, JacketSpine } from '@/components/screens/book-jacket'
import { SleeveBack, SleeveCover, SleeveLabelA, SleeveLabelB } from '@/components/screens/record-sleeve'
import { useStage } from '../../campaigns/kit'
import { easeOut, tween, type Vec3 } from '../../reel/motion'
import { BRAND, MONO, SANS } from '../brand'
import { Ground, Kicker, Rise } from '../cards'
import { useDoodlesDrawn } from '../doodles'

/*
 * The catalogue, two beats a model: twelve of the home page carousel's
 * models, each wearing the artwork the carousel gives it - the Swiss posters
 * on the screens, the Harlow Valley carton, Ridgeway Mills' cereal, Marigold
 * & Moss's bag, the Sunpeel bus wrap. The screens' patterns are pinned to a
 * seed here (the site reseeds them on the wall clock, which a render cannot
 * share).
 */

export const PARADE_BEAT = 30

type Stage = ReturnType<typeof useStage>

interface Model {
  name: string
  group: string
  /** Patterns the artwork draws, which the shot waits for. */
  patterns: number
  yaw: number
  render: (stage: Stage, rotation: Vec3) => React.ReactNode
}

const OLIVE = '#7d8a5c'
const NAVY_CLOTH = '#1f3a5f'
const SLEEVE = '#d8552a'
const CARTON = '#f4f3ef'
const CEREAL = '#f4f1ea'
const SUNPEEL = SUNPEEL_FLAVOURS[0]!.ground

const MODELS: Model[] = [
  {
    name: 'iPhone 17 Pro',
    group: 'Phones',
    patterns: 1,
    yaw: -0.38,
    render: (stage, rotation) => (
      <IPhoneMockup {...stage} variant="pro" statusBar={{ color: '#efede6' }} rotation={rotation}>
        <SwissStack pattern={halftone} seed="promo-raster" tone="ember" grid="6x9" index="02" kicker="Raster" title={'Half\ntone'} meta="Plate 02 · 175 lpi" />
      </IPhoneMockup>
    ),
  },
  {
    name: 'Galaxy Z Flip7',
    group: 'Foldables',
    patterns: 1,
    yaw: -0.42,
    render: (stage, rotation) => (
      <FlipMockup {...stage} variant="flip7" openAngle={150} statusBar={{ color: '#efede6' }} rotation={rotation}>
        <SwissStack pattern={dipole} seed="promo-field" tone="moss" grid="8x12" index="04" kicker="Feld" title={'Line\nfield'} meta="Studies in radiance" />
      </FlipMockup>
    ),
  },
  {
    name: 'iPad Pro 13″',
    group: 'Tablets',
    patterns: 1,
    yaw: -0.34,
    render: (stage, rotation) => (
      <IPadMockup {...stage} variant="ipadpro13" statusBar={{ color: '#efede6' }} rotation={rotation}>
        <SwissStack pattern={epicentre} seed="promo-epicentre" tone="plum" grid="6x9" index="06" kicker="Zentrum" title={'Point\nsource'} meta="Kunsthalle · Saal 4" />
      </IPadMockup>
    ),
  },
  {
    name: 'Apple Watch Ultra 4',
    group: 'Wearables',
    patterns: 1,
    yaw: -0.42,
    render: (stage, rotation) => (
      <AppleWatchMockup {...stage} variant="ultra4" rotation={rotation}>
        <SwissDial pattern={gyre} seed="promo-dial" tone="electric" grid="4x6" kicker="Zürich" title="9:41" />
      </AppleWatchMockup>
    ),
  },
  {
    name: 'Studio Display',
    group: 'Displays',
    patterns: 1,
    yaw: -0.3,
    render: (stage, rotation) => (
      <StudioDisplayMockup {...stage} rotation={rotation}>
        <SwissSplit pattern={chase} seed="promo-rhythm" tone="graphite" grid="6x9" index="08" kicker="Rhythmus" title={'Bar\nafter bar'} meta="Typografische Monatsblätter" />
      </StudioDisplayMockup>
    ),
  },
  {
    name: 'Billboard',
    group: 'Out of home',
    patterns: 0,
    yaw: -0.36,
    render: (stage, rotation) => (
      <BillboardMockup {...stage} color="#2c313a" rotation={rotation}>
        <BillboardAdArt />
      </BillboardMockup>
    ),
  },
  {
    name: 'Transit bus',
    group: 'Vehicles',
    patterns: 0,
    yaw: -0.35,
    render: (stage, rotation) => (
      <BusMockup {...stage} coverage="perforated" color={SUNPEEL} rotation={rotation}>
        <BusMockup.StreetSide>
          <SunpeelSide ground={SUNPEEL} />
        </BusMockup.StreetSide>
        <BusMockup.CurbSide>
          <SunpeelSide ground={SUNPEEL} doors />
        </BusMockup.CurbSide>
        <BusMockup.Rear>
          <SunpeelRear ground={SUNPEEL} />
        </BusMockup.Rear>
        <BusMockup.DestinationSign>42 DOWNTOWN VIA 5TH AVE</BusMockup.DestinationSign>
      </BusMockup>
    ),
  },
  {
    name: 'Book',
    group: 'Print',
    patterns: 1,
    yaw: 0.5,
    render: (stage, rotation) => (
      <BookMockup {...stage} color={NAVY_CLOTH} rotation={rotation}>
        <JacketCover cloth={NAVY_CLOTH} />
        <BookMockup.Spine>
          <JacketSpine cloth={NAVY_CLOTH} />
        </BookMockup.Spine>
        <BookMockup.Back>
          <JacketBack cloth={NAVY_CLOTH} />
        </BookMockup.Back>
      </BookMockup>
    ),
  },
  {
    name: 'Vinyl record',
    group: 'Print',
    patterns: 2,
    yaw: -0.4,
    render: (stage, rotation) => (
      <VinylRecordMockup {...stage} color={SLEEVE} rotation={rotation}>
        <SleeveCover material={SLEEVE} />
        <VinylRecordMockup.Back>
          <SleeveBack material={SLEEVE} />
        </VinylRecordMockup.Back>
        <VinylRecordMockup.Label>
          <SleeveLabelA />
        </VinylRecordMockup.Label>
        <VinylRecordMockup.BackLabel>
          <SleeveLabelB />
        </VinylRecordMockup.BackLabel>
      </VinylRecordMockup>
    ),
  },
  {
    name: 'Milk carton',
    group: 'Packaging',
    patterns: 0,
    yaw: 0.62,
    render: (stage, rotation) => (
      <MilkCartonMockup {...stage} color={CARTON} rotation={rotation}>
        <CartonFront material={CARTON} />
        <MilkCartonMockup.Right>
          <CartonFacts material={CARTON} />
        </MilkCartonMockup.Right>
        <MilkCartonMockup.Left>
          <CartonStory material={CARTON} />
        </MilkCartonMockup.Left>
        <MilkCartonMockup.Back>
          <CartonBack material={CARTON} />
        </MilkCartonMockup.Back>
        <MilkCartonMockup.GableFront>
          <CartonRoof material={CARTON} />
        </MilkCartonMockup.GableFront>
      </MilkCartonMockup>
    ),
  },
  {
    name: 'Product box',
    group: 'Packaging',
    patterns: 0,
    yaw: -0.55,
    render: (stage, rotation) => (
      <ProductBoxMockup {...stage} color={CEREAL} rotation={rotation}>
        <CerealFront material={CEREAL} />
        <ProductBoxMockup.Right>
          <CerealFacts material={CEREAL} />
        </ProductBoxMockup.Right>
        <ProductBoxMockup.Left>
          <CerealStory material={CEREAL} />
        </ProductBoxMockup.Left>
        <ProductBoxMockup.Top>
          <CerealTop material={CEREAL} />
        </ProductBoxMockup.Top>
        <ProductBoxMockup.Back>
          <CerealBack material={CEREAL} />
        </ProductBoxMockup.Back>
      </ProductBoxMockup>
    ),
  },
  {
    name: 'Shopping bag',
    group: 'Packaging',
    patterns: 0,
    yaw: 0.42,
    render: (stage, rotation) => (
      <ShoppingBagMockup {...stage} color={OLIVE} rotation={rotation}>
        <BagFront material={OLIVE} />
        <ShoppingBagMockup.Back>
          <BagBack material={OLIVE} />
        </ShoppingBagMockup.Back>
      </ShoppingBagMockup>
    ),
  },
]

export const PARADE_LENGTH = MODELS.length * PARADE_BEAT

const GROUPS = ['Phones', 'Foldables', 'Tablets', 'Wearables', 'Displays', 'Out of home', 'Vehicles', 'Print', 'Packaging']

/** One model's two beats: it swings in from a quarter turn and settles. */
function ModelBeat({ model }: { model: Model }) {
  const frame = useCurrentFrame()
  const stage = useStage(false)
  useDoodlesDrawn(model.name, model.patterns)
  const swing = tween(frame, 0, 18, 0, 1, easeOut)
  const rotation: Vec3 = [0.04, model.yaw + (1 - swing) * 1.1 - frame * 0.004, 0]
  return <>{model.render(stage, rotation)}</>
}

export function ParadeShot() {
  const frame = useCurrentFrame()
  const { width } = useVideoConfig()
  const u = width / 1920
  const index = Math.min(MODELS.length - 1, Math.floor(frame / PARADE_BEAT))
  const current = MODELS[index]!
  const count = Math.round(tween(frame, 6, 40, 0, 58, easeOut))
  return (
    <Ground glow={0.12}>
      <div style={{ position: 'absolute', left: 640 * u, top: 40 * u, width: 1240 * u, height: 1000 * u }}>
        {MODELS.map((model, i) => (
          <Sequence key={model.name} from={i * PARADE_BEAT} durationInFrames={PARADE_BEAT} layout="none" name={model.name}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <ModelBeat model={model} />
            </div>
          </Sequence>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 110 * u, top: 210 * u, width: 560 * u }}>
        <Kicker start={0}>The catalogue</Kicker>
        <div style={{ marginTop: 16 * u, fontFamily: SANS, fontWeight: 700, fontSize: 132 * u, lineHeight: 0.95, letterSpacing: '-0.05em', color: BRAND.text, fontVariantNumeric: 'tabular-nums' }}>
          {count} <span style={{ fontSize: 84 * u }}>models</span>
        </div>
        <div style={{ marginTop: 18 * u, fontFamily: SANS, fontWeight: 500, fontSize: 30 * u, color: BRAND.muted }}>
          <Rise text="33 devices · 25 objects" start={10} step={2} />
        </div>
        <div style={{ marginTop: 56 * u, display: 'flex', flexDirection: 'column', gap: 10 * u }}>
          {GROUPS.map((group) => {
            const on = group === current.group
            return (
              <div key={group} style={{ display: 'flex', alignItems: 'center', gap: 14 * u, fontFamily: MONO, fontSize: 24 * u, color: on ? BRAND.text : BRAND.low, opacity: on ? 1 : 0.55 }}>
                <span style={{ width: 10 * u, height: 10 * u, borderRadius: 2 * u, background: on ? BRAND.green : 'transparent', border: `${1.5 * u}px solid ${on ? BRAND.green : BRAND.border}` }} />
                {group}
                {on ? <span style={{ color: BRAND.green, marginLeft: 6 * u }}>{current.name}</span> : null}
              </div>
            )
          })}
        </div>
      </div>
    </Ground>
  )
}
