import * as React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { MailerBox, MilkCarton, MockupCanvas, ProductBox, ShoppingBag, VinylRecord, mockupInfo } from 'react-3d-mockups'
import { MAILER_BOX_FRAMING, MILK_CARTON_FRAMING, PRODUCT_BOX_FRAMING, SHOPPING_BAG_FRAMING, VINYL_RECORD_FRAMING } from 'react-3d-mockups/core'
import { BoxEnd, BoxSide, BoxTop } from '@/app/examples/fleet/fleet-art'
import { LIVERIES } from '@/app/examples/fleet/fleet-data'
import { CartonBack, CartonFacts, CartonFront, CartonRoof, CartonStory } from '@/components/screens/carton-art'
import { BagBack, BagFront, CerealBack, CerealFacts, CerealFront, CerealStory, CerealTop } from '@/components/screens/package-art'
import { SleeveBack, SleeveCover, SleeveLabelA, SleeveLabelB } from '@/components/screens/record-sleeve'
import { OverlapProbe } from '../../campaigns/kit'
import { useMockupCapture } from '../../use-mockup-capture'
import { easeInOut, tween, type Vec3 } from '../../reel/motion'
import { Feature, Ground } from '../cards'
import { CodeCard, t, type Segment } from '../code'
import { useDoodlesDrawn } from '../doodles'

/*
 * "Composable by design": bare objects dropped into one `<MockupCanvas>`,
 * at their true sizes on one floor - a Northline mailer, the Harlow Valley
 * carton, Ridgeway Mills' cereal, Marigold & Moss's bag and the Alhambra
 * record. They join one a beat, line up, then regroup, and the code card's
 * positions follow them: a scene is just React state.
 */

/** World units are 100 mm here; each object is scaled from its own unit to that. */
const MM_PER_UNIT = 100
const FLOOR = -2

type Kind = 'mailerBox' | 'milkCarton' | 'productBox' | 'shoppingBag' | 'vinylRecord'

const SCALE: Record<Kind, number> = {
  mailerBox: mockupInfo('mailerBox').mmPerUnit / MM_PER_UNIT,
  milkCarton: mockupInfo('milkCarton').mmPerUnit / MM_PER_UNIT,
  productBox: mockupInfo('productBox').mmPerUnit / MM_PER_UNIT,
  shoppingBag: mockupInfo('shoppingBag').mmPerUnit / MM_PER_UNIT,
  vinylRecord: mockupInfo('vinylRecord').mmPerUnit / MM_PER_UNIT,
}

/** How high an object's origin sits above the floor it stands on. */
const LIFT: Record<Kind, number> = {
  mailerBox: MAILER_BOX_FRAMING.extent({}) * SCALE.mailerBox,
  milkCarton: MILK_CARTON_FRAMING.extent({}) * SCALE.milkCarton,
  productBox: PRODUCT_BOX_FRAMING.extent({}) * SCALE.productBox,
  shoppingBag: SHOPPING_BAG_FRAMING.extent({}) * SCALE.shoppingBag,
  vinylRecord: VINYL_RECORD_FRAMING.extent() * SCALE.vinylRecord,
}

interface Placement {
  x: number
  z: number
  yaw: number
}

interface Piece {
  kind: Kind
  tag: string
  /** Beat it joins on. */
  at: number
  line: Placement
  group: Placement
}

/*
 * Both layouts keep every object clear of the others: each one's footprint,
 * turned to its yaw, clears its neighbours', and a render with
 * REMOTION_OVERLAP_PROBE=1 reports any two objects that still meet. The group
 * is two rows: the tall bag and the record at the back, the low boxes in
 * front of them.
 *
 * The move between them is in two steps, so nothing passes through anything
 * on the way: first each object steps back or forward into its row (and
 * turns), while they are still spread along the line and clear of each
 * other side to side; then the rows close up sideways, each object keeping
 * its order in its row, so the gaps shrink but never close.
 */
const PIECES: Piece[] = [
  { kind: 'shoppingBag', tag: 'ShoppingBag', at: 0, line: { x: -6.2, z: 0, yaw: 0.35 }, group: { x: -2.2, z: -1.9, yaw: 0.15 } },
  { kind: 'productBox', tag: 'ProductBox', at: 7, line: { x: -3.0, z: 0, yaw: 0.45 }, group: { x: -2.9, z: 0.9, yaw: 0.5 } },
  { kind: 'milkCarton', tag: 'MilkCarton', at: 15, line: { x: -0.9, z: 0, yaw: 0.6 }, group: { x: -1.0, z: 0.9, yaw: -0.4 } },
  { kind: 'vinylRecord', tag: 'VinylRecord', at: 22, line: { x: 1.9, z: 0, yaw: -0.35 }, group: { x: 1.9, z: -1.9, yaw: -0.3 } },
  { kind: 'mailerBox', tag: 'MailerBox', at: 30, line: { x: 6.4, z: 0, yaw: -0.5 }, group: { x: 1.9, z: 1.3, yaw: -0.25 } },
]

/** Into the rows: depth and turn. */
const SPLIT_FROM = 48
const SPLIT_TO = 64
/** Then together: along the rows. */
const CLOSE_TO = 86

const NORTHLINE = LIVERIES[0]!
const CARTON = '#f4f3ef'
const CEREAL = '#f4f1ea'
const OLIVE = '#7d8a5c'
const SLEEVE = '#d8552a'

function faces(kind: Kind) {
  switch (kind) {
    case 'mailerBox':
      return (
        <>
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
        </>
      )
    case 'milkCarton':
      return (
        <>
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
        </>
      )
    case 'productBox':
      return (
        <>
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
        </>
      )
    case 'shoppingBag':
      return (
        <>
          <BagFront material={OLIVE} />
          <ShoppingBag.Back>
            <BagBack material={OLIVE} />
          </ShoppingBag.Back>
        </>
      )
    case 'vinylRecord':
      return (
        <>
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
        </>
      )
  }
}

function ObjectOf({ kind, position, rotation, scale }: { kind: Kind; position: Vec3; rotation: Vec3; scale: number }) {
  const props = { position, rotation, scale, name: kind }
  switch (kind) {
    case 'mailerBox':
      return <MailerBox {...props} color="#e9e5dc" tapeColor="rgba(20, 33, 61, 0.55)">{faces(kind)}</MailerBox>
    case 'milkCarton':
      return <MilkCarton {...props} color={CARTON}>{faces(kind)}</MilkCarton>
    case 'productBox':
      return <ProductBox {...props} color={CEREAL}>{faces(kind)}</ProductBox>
    case 'shoppingBag':
      return <ShoppingBag {...props} color={OLIVE}>{faces(kind)}</ShoppingBag>
    case 'vinylRecord':
      return <VinylRecord {...props} color={SLEEVE}>{faces(kind)}</VinylRecord>
  }
}

/** Where a piece stands this frame, and how far it has popped in. */
function poseOf(piece: Piece, frame: number) {
  const split = tween(frame, SPLIT_FROM, SPLIT_TO, 0, 1, easeInOut)
  const close = tween(frame, SPLIT_TO, CLOSE_TO, 0, 1, easeInOut)
  const x = piece.line.x + (piece.group.x - piece.line.x) * close
  const z = piece.line.z + (piece.group.z - piece.line.z) * split
  const yaw = piece.line.yaw + (piece.group.yaw - piece.line.yaw) * split
  // A pop rather than a drop: the object is added to the scene, not thrown into it.
  const t = tween(frame, piece.at, piece.at + 9, 0, 1, (v) => 1 + 2.2 * (v - 1) ** 3 + 1.2 * (v - 1) ** 2)
  return { x, z, yaw, pop: Math.max(0.0001, t) }
}

const fmt = (n: number) => (Math.round(n * 10) / 10).toFixed(1)

export function ComposeShot() {
  const frame = useCurrentFrame()
  const { width } = useVideoConfig()
  const u = width / 1920
  const delayCapture = useMockupCapture()
  useDoodlesDrawn('Composed scene', 3)
  const k = tween(frame, SPLIT_FROM, CLOSE_TO, 0, 1, easeInOut)
  const spin = frame * 0.003
  // Back far enough to take in the whole line, then in on the group.
  const camera = { position: [0, 3.4 - k * 1, 30 - k * 12] as Vec3, fov: 30 }
  const code: Segment[][] = [
    [t('punct', '<'), t('tag', 'MockupCanvas'), t('punct', '>')],
    ...PIECES.filter((piece) => frame >= piece.at).map((piece) => {
      const p = poseOf(piece, frame)
      return [
        t('punct', '  <'),
        t('tag', piece.tag),
        t('attr', ' position'),
        t('punct', '={['),
        t('value', `${fmt(p.x)}, 0, ${fmt(p.z)}`),
        t('punct', ']} />'),
      ] as Segment[]
    }),
    [t('punct', '</'), t('tag', 'MockupCanvas'), t('punct', '>')],
  ]
  return (
    <Ground glow={0.1}>
      <div style={{ position: 'absolute', left: 720 * u, top: 0, width: 1200 * u, height: 1080 * u }}>
        <MockupCanvas controls={false} delayCapture={delayCapture} camera={camera} shadowY={FLOOR} label="Five objects composed in one scene">
          <group rotation={[0, spin, 0]}>
            {PIECES.map((piece) => {
              const p = poseOf(piece, frame)
              const scale = SCALE[piece.kind] * p.pop
              return (
                <ObjectOf
                  key={piece.kind}
                  kind={piece.kind}
                  position={[p.x, FLOOR + LIFT[piece.kind] * p.pop, p.z]}
                  rotation={[0, p.yaw, 0]}
                  scale={scale}
                />
              )
            })}
          </group>
          <OverlapProbe names={PIECES.map((piece) => piece.kind)} frame={frame} />
        </MockupCanvas>
      </div>
      <Feature kicker="Composable by design" title="Compose whole scenes." sub="Bare objects in one canvas, at true size. A layout is just props." width={600} style={{ left: 110 * u, top: 130 * u }} />
      <CodeCard lines={code} start={Infinity} width={640} size={22} caret={false} style={{ position: 'absolute', left: 110 * u, top: 620 * u }} />
    </Ground>
  )
}
