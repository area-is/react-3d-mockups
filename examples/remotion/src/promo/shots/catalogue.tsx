import * as React from 'react'
import { Sequence, useCurrentFrame, useVideoConfig } from 'remotion'
import {
  AppleWatch,
  Billboard,
  Book,
  Bus,
  Flip,
  Fold,
  Galaxy,
  GalaxyTab,
  GalaxyWatch,
  IPad,
  IPhone,
  Laptop,
  MailerBox,
  MilkCarton,
  MockupCanvas,
  ProductBox,
  ShoppingBag,
  StudioDisplay,
  TVSet,
  VinylRecord,
  mockupInfo,
  type MockupKind,
} from 'react-3d-mockups'
import { bauhaus, chase, damier, dipole, epicentre, gyre, halftone, moire, radiance, sunray } from 'tabbied/patterns'
import { SwissDial, SwissSplit, SwissStack } from '@/components/screens/swiss-art'
import { Newspaper, WatchFace } from '@/components/screens/device-apps'
import { BillboardAdArt, TVShowArt } from '@/components/screens/print-art'
import { SUNPEEL_FLAVOURS, SunpeelRear, SunpeelSide } from '@/components/screens/bus-wrap'
import { CartonBack, CartonFacts, CartonFront, CartonRoof, CartonStory } from '@/components/screens/carton-art'
import { BagBack, BagFront, CerealBack, CerealFacts, CerealFront, CerealStory, CerealTop } from '@/components/screens/package-art'
import { JacketBack, JacketCover, JacketSpine } from '@/components/screens/book-jacket'
import { SleeveBack, SleeveCover, SleeveLabelA, SleeveLabelB } from '@/components/screens/record-sleeve'
import { BoxEnd, BoxSide, BoxTop } from '@/app/examples/fleet/fleet-art'
import { LIVERIES } from '@/app/examples/fleet/fleet-data'
import { useMockupCapture } from '../../use-mockup-capture'
import { easeInOut, easeOut, tween, type Vec3 } from '../../reel/motion'
import { BRAND, MONO, SANS } from '../brand'
import { Ground, Kicker, Rise } from '../cards'
import { useDoodlesDrawn } from '../doodles'
import { Lineup } from '../lineup'

/*
 * The catalogue, a family a beat-pair: eight of the library's families, each
 * a row of its models together in one canvas at their true sizes against
 * each other, wearing the artwork the home page carousel gives them - the
 * Swiss posters on the screens, Ridgeway Mills' cereal, the Harlow Valley
 * carton, Marigold & Moss's bag, the Sunpeel bus wrap. The rows are laid out
 * from each model's measured bounds (`Lineup`), so nothing touches.
 *
 * The screens' patterns are pinned to a seed here; the site reseeds them on
 * the wall clock, which a render cannot share.
 */

export const CATEGORY_LENGTH = 30

/** Every model in a row is scaled from its own units to this many millimetres a unit. */
const MM = 100
const size = (kind: MockupKind) => mockupInfo(kind as never, {} as never).mmPerUnit / MM

const FLOOR = -2.5

const NAVY_CLOTH = '#1f3a5f'
const SLEEVE = '#d8552a'
const CARTON = '#f4f3ef'
const CEREAL = '#f4f1ea'
const OLIVE = '#7d8a5c'
const SUNPEEL = SUNPEEL_FLAVOURS[0]!.ground
const NORTHLINE = LIVERIES[0]!

interface Model {
  name: string
  /** Its yaw in the row: the outer ones turn in towards the middle. */
  yaw: number
  render: (rotation: Vec3) => React.ReactNode
}

interface Category {
  name: string
  /** Patterns the artwork draws, which the first frame waits for. */
  patterns: number
  models: Model[]
}

const LIGHT_BAR = { color: '#efede6' }
const DARK_BAR = { color: '#141414' }

const CATEGORIES: Category[] = [
  {
    name: 'Phones',
    patterns: 3,
    models: [
      {
        name: 'iPhone 17 Pro',
        yaw: 0.42,
        render: (rotation) => (
          <IPhone variant="pro" color="cosmicorange" statusBar={LIGHT_BAR} rotation={rotation} scale={size('iphone')}>
            <SwissStack pattern={halftone} seed="promo-raster" tone="ember" grid="6x9" index="02" kicker="Raster" title={'Half\ntone'} meta="Plate 02 · 175 lpi" />
          </IPhone>
        ),
      },
      {
        name: 'Galaxy S26 Ultra',
        yaw: 0,
        render: (rotation) => (
          <Galaxy variant="s26ultra" color="titaniumsilverblue" statusBar={DARK_BAR} rotation={rotation} scale={size('galaxy')}>
            <SwissStack pattern={bauhaus} seed="promo-bauhaus" tone="cobalt" grid="6x9" index="03" kicker="Bauhaus" title={'Prime\nshapes'} meta="Dessau · 1925" />
          </Galaxy>
        ),
      },
      {
        name: 'iPhone Air',
        yaw: -0.42,
        render: (rotation) => (
          <IPhone variant="air" color="skyblue" statusBar={DARK_BAR} rotation={rotation} scale={size('iphone')}>
            <SwissStack pattern={sunray} seed="promo-sunray" tone="tangerine" grid="6x9" index="05" kicker="Strahl" title={'Sun\nrays'} meta="Plate 05 · Offset" />
          </IPhone>
        ),
      },
    ],
  },
  {
    name: 'Foldables',
    patterns: 1,
    models: [
      {
        name: 'Galaxy Z Fold7',
        yaw: 0.3,
        render: (rotation) => (
          <Fold variant="fold7" openAngle={160} color="silvershadow" statusBar={DARK_BAR} rotation={rotation} scale={size('fold')}>
            <Newspaper />
          </Fold>
        ),
      },
      {
        name: 'Galaxy Z Flip7',
        yaw: -0.36,
        render: (rotation) => (
          <Flip variant="flip7" openAngle={150} color="mint" statusBar={LIGHT_BAR} rotation={rotation} scale={size('flip')}>
            <SwissStack pattern={dipole} seed="promo-field" tone="moss" grid="8x12" index="04" kicker="Feld" title={'Line\nfield'} meta="Studies in radiance" />
          </Flip>
        ),
      },
    ],
  },
  {
    name: 'Laptops & tablets',
    patterns: 3,
    models: [
      {
        name: 'MacBook Air 13″',
        yaw: 0.38,
        render: (rotation) => (
          <Laptop variant="air13" color="midnight" rotation={rotation} scale={size('laptop')}>
            <SwissSplit pattern={moire} seed="promo-moire" tone="midnight" grid="6x9" index="09" kicker="Moiré" title={'Inter\nference'} meta="Kunstgewerbemuseum" />
          </Laptop>
        ),
      },
      {
        name: 'iPad Pro 13″',
        yaw: 0,
        render: (rotation) => (
          <IPad variant="ipadpro13" color="silver" statusBar={LIGHT_BAR} rotation={rotation} scale={size('ipad')}>
            <SwissStack pattern={epicentre} seed="promo-epicentre" tone="plum" grid="6x9" index="06" kicker="Zentrum" title={'Point\nsource'} meta="Kunsthalle · Saal 4" />
          </IPad>
        ),
      },
      {
        name: 'Galaxy Tab S11',
        yaw: -0.38,
        render: (rotation) => (
          <GalaxyTab variant="tabs11" color="gray" statusBar={DARK_BAR} rotation={rotation} scale={size('galaxyTab')}>
            <SwissStack pattern={damier} seed="promo-damier" tone="sea" grid="6x9" index="07" kicker="Damier" title={'Black\nwhite'} meta="Positive & negative" />
          </GalaxyTab>
        ),
      },
    ],
  },
  {
    name: 'Wearables',
    patterns: 2,
    models: [
      {
        name: 'Apple Watch Ultra 4',
        yaw: 0.4,
        render: (rotation) => (
          <AppleWatch variant="ultra4" color="natural" rotation={rotation} scale={size('appleWatch')}>
            <SwissDial pattern={gyre} seed="promo-dial" tone="electric" grid="4x6" kicker="Zürich" title="9:41" />
          </AppleWatch>
        ),
      },
      {
        name: 'Galaxy Watch 8',
        yaw: 0,
        render: (rotation) => (
          <GalaxyWatch variant="watch8" color="silver" rotation={rotation} scale={size('galaxyWatch')}>
            <WatchFace />
          </GalaxyWatch>
        ),
      },
      {
        name: 'Apple Watch Series 11',
        yaw: -0.4,
        render: (rotation) => (
          <AppleWatch variant="series11" color="rosegold" rotation={rotation} scale={size('appleWatch')}>
            <SwissDial pattern={radiance} seed="promo-dial-b" tone="terracotta" grid="4x6" kicker="Basel" title="10:09" />
          </AppleWatch>
        ),
      },
    ],
  },
  {
    name: 'Displays',
    patterns: 1,
    models: [
      {
        name: 'Studio Display',
        yaw: 0.32,
        render: (rotation) => (
          <StudioDisplay rotation={rotation} scale={size('studioDisplay')}>
            <SwissSplit pattern={chase} seed="promo-rhythm" tone="graphite" grid="6x9" index="08" kicker="Rhythmus" title={'Bar\nafter bar'} meta="Typografische Monatsblätter" />
          </StudioDisplay>
        ),
      },
      {
        name: 'TV set',
        yaw: -0.32,
        render: (rotation) => (
          <TVSet variant="pedestal" rotation={rotation} scale={size('tv')}>
            <TVShowArt />
          </TVSet>
        ),
      },
    ],
  },
  {
    name: 'Print',
    // The jacket's pattern and the sleeve's two.
    patterns: 3,
    models: [
      {
        name: 'Book',
        yaw: 0.45,
        render: (rotation) => (
          <Book color={NAVY_CLOTH} rotation={rotation} scale={size('book')}>
            <JacketCover cloth={NAVY_CLOTH} />
            <Book.Spine>
              <JacketSpine cloth={NAVY_CLOTH} />
            </Book.Spine>
            <Book.Back>
              <JacketBack cloth={NAVY_CLOTH} />
            </Book.Back>
          </Book>
        ),
      },
      {
        name: 'Vinyl record',
        yaw: -0.3,
        render: (rotation) => (
          <VinylRecord color={SLEEVE} rotation={rotation} scale={size('vinylRecord')}>
            <SleeveCover material={SLEEVE} />
            <VinylRecord.Back>
              <SleeveBack material={SLEEVE} />
            </VinylRecord.Back>
            <VinylRecord.Label>
              <SleeveLabelA />
            </VinylRecord.Label>
            <VinylRecord.BackLabel>
              <SleeveLabelB />
            </VinylRecord.BackLabel>
          </VinylRecord>
        ),
      },
    ],
  },
  {
    name: 'Packaging',
    patterns: 0,
    models: [
      {
        name: 'Milk carton',
        yaw: 0.6,
        render: (rotation) => (
          <MilkCarton color={CARTON} rotation={rotation} scale={size('milkCarton')}>
            <CartonFront material={CARTON} />
            <MilkCarton.Right>
              <CartonFacts material={CARTON} />
            </MilkCarton.Right>
            <MilkCarton.Left>
              <CartonStory material={CARTON} />
            </MilkCarton.Left>
            <MilkCarton.Back>
              <CartonBack material={CARTON} />
            </MilkCarton.Back>
            <MilkCarton.GableFront>
              <CartonRoof material={CARTON} />
            </MilkCarton.GableFront>
          </MilkCarton>
        ),
      },
      {
        name: 'Product box',
        yaw: 0.4,
        render: (rotation) => (
          <ProductBox color={CEREAL} rotation={rotation} scale={size('productBox')}>
            <CerealFront material={CEREAL} />
            <ProductBox.Right>
              <CerealFacts material={CEREAL} />
            </ProductBox.Right>
            <ProductBox.Left>
              <CerealStory material={CEREAL} />
            </ProductBox.Left>
            <ProductBox.Top>
              <CerealTop material={CEREAL} />
            </ProductBox.Top>
            <ProductBox.Back>
              <CerealBack material={CEREAL} />
            </ProductBox.Back>
          </ProductBox>
        ),
      },
      {
        name: 'Shopping bag',
        yaw: -0.12,
        render: (rotation) => (
          <ShoppingBag color={OLIVE} rotation={rotation} scale={size('shoppingBag')}>
            <BagFront material={OLIVE} />
            <ShoppingBag.Back>
              <BagBack material={OLIVE} />
            </ShoppingBag.Back>
          </ShoppingBag>
        ),
      },
      {
        name: 'Mailer box',
        yaw: -0.5,
        render: (rotation) => (
          <MailerBox color="#e9e5dc" tapeColor="rgba(20, 33, 61, 0.55)" rotation={rotation} scale={size('mailerBox')}>
            <BoxTop livery={NORTHLINE} />
            <MailerBox.Front>
              <BoxSide livery={NORTHLINE} />
            </MailerBox.Front>
            <MailerBox.Back>
              <BoxSide livery={NORTHLINE} />
            </MailerBox.Back>
            <MailerBox.Right>
              <BoxEnd livery={NORTHLINE} />
            </MailerBox.Right>
            <MailerBox.Left>
              <BoxEnd livery={NORTHLINE} />
            </MailerBox.Left>
          </MailerBox>
        ),
      },
    ],
  },
  {
    name: 'Out of home',
    patterns: 0,
    models: [
      {
        name: 'Billboard',
        yaw: 0.3,
        render: (rotation) => (
          <Billboard color="#2c313a" rotation={rotation} scale={size('billboard')}>
            <BillboardAdArt />
          </Billboard>
        ),
      },
      {
        name: 'City bus',
        yaw: -0.55,
        render: (rotation) => (
          <Bus coverage="perforated" color={SUNPEEL} rotation={rotation} scale={size('bus')}>
            <Bus.StreetSide>
              <SunpeelSide ground={SUNPEEL} />
            </Bus.StreetSide>
            <Bus.CurbSide>
              <SunpeelSide ground={SUNPEEL} doors />
            </Bus.CurbSide>
            <Bus.Rear>
              <SunpeelRear ground={SUNPEEL} />
            </Bus.Rear>
            <Bus.DestinationSign>42 DOWNTOWN VIA 5TH AVE</Bus.DestinationSign>
          </Bus>
        ),
      },
    ],
  },
]

export const CATALOGUE_LENGTH = CATEGORIES.length * CATEGORY_LENGTH

/** The overshooting pop a model is added to the row with. */
const popIn = (frame: number, at: number) => tween(frame, at, at + 9, 0, 1, (v) => 1 + 2.2 * (v - 1) ** 3 + 1.2 * (v - 1) ** 2)

/** One family: its row pops in a model at a time while the camera drifts across it. */
function CategoryRow({ category }: { category: Category }) {
  const frame = useCurrentFrame()
  const delayCapture = useMockupCapture()
  useDoodlesDrawn(category.name, category.patterns)
  const drift = tween(frame, 0, CATEGORY_LENGTH + 10, 0, 1, easeInOut)
  const camera = { position: [0.9 - drift * 1.8, 1.7, 18.4 - drift * 1.4] as Vec3, fov: 30 }
  return (
    <MockupCanvas controls={false} delayCapture={delayCapture} camera={camera} shadowY={FLOOR} label={`${category.name}: ${category.models.map((m) => m.name).join(', ')}`}>
      <Lineup
        floor={FLOOR}
        width={11}
        height={6.2}
        items={category.models.map((model, i) => ({
          key: model.name,
          pop: popIn(frame, i * 3),
          node: model.render([0, model.yaw, 0]),
        }))}
      />
    </MockupCanvas>
  )
}

export function CatalogueShot() {
  const frame = useCurrentFrame()
  const { width } = useVideoConfig()
  const u = width / 1920
  const index = Math.min(CATEGORIES.length - 1, Math.floor(frame / CATEGORY_LENGTH))
  const current = CATEGORIES[index]!
  const local = frame - index * CATEGORY_LENGTH
  const count = Math.round(tween(frame, 2, 30, 0, 58, easeOut))
  const caption = tween(local, 4, 12, 0, 1, easeOut)
  return (
    <Ground glow={0.12}>
      <div style={{ position: 'absolute', left: 600 * u, top: 0, width: 1320 * u, height: 1000 * u }}>
        {CATEGORIES.map((category, i) => (
          <Sequence
            key={category.name}
            from={i * CATEGORY_LENGTH}
            // The last family stays up through the cut out of the shot.
            durationInFrames={i === CATEGORIES.length - 1 ? undefined : CATEGORY_LENGTH}
            layout="none"
            name={category.name}
          >
            <div style={{ position: 'absolute', inset: 0 }}>
              <CategoryRow category={category} />
            </div>
          </Sequence>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 600 * u,
          width: 1320 * u,
          top: 940 * u,
          textAlign: 'center',
          fontFamily: MONO,
          fontSize: 24 * u,
          color: BRAND.muted,
          opacity: caption,
          transform: `translateY(${(1 - caption) * 10 * u}px)`,
        }}
      >
        {current.models.map((m) => m.name).join('  ·  ')}
      </div>
      <div style={{ position: 'absolute', left: 110 * u, top: 200 * u, width: 520 * u }}>
        <Kicker start={0}>The catalogue</Kicker>
        <div style={{ marginTop: 16 * u, fontFamily: SANS, fontWeight: 700, fontSize: 132 * u, lineHeight: 0.95, letterSpacing: '-0.05em', color: BRAND.text, fontVariantNumeric: 'tabular-nums' }}>
          {count} <span style={{ fontSize: 84 * u }}>models</span>
        </div>
        <div style={{ marginTop: 18 * u, fontFamily: SANS, fontWeight: 500, fontSize: 30 * u, color: BRAND.muted }}>
          <Rise text="33 devices · 25 objects" start={6} step={2} />
        </div>
        <div style={{ marginTop: 56 * u, display: 'flex', flexDirection: 'column', gap: 12 * u }}>
          {CATEGORIES.map((category, i) => {
            const on = i === index
            const done = i < index
            return (
              <div key={category.name} style={{ display: 'flex', alignItems: 'center', gap: 14 * u, fontFamily: MONO, fontSize: 26 * u, color: on ? BRAND.text : BRAND.low, opacity: on ? 1 : done ? 0.7 : 0.45 }}>
                <span style={{ width: 11 * u, height: 11 * u, borderRadius: 2 * u, background: on || done ? BRAND.green : 'transparent', border: `${1.5 * u}px solid ${on || done ? BRAND.green : BRAND.border}` }} />
                {category.name}
              </div>
            )
          })}
        </div>
      </div>
    </Ground>
  )
}
