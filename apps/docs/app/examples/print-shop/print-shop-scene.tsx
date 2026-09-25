'use client'

import { useEffect, useRef, type Ref } from 'react'
import { Float } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import type { Group } from 'three'
import { Book, MockupCanvas, PosterFrame } from 'react-3d-mockups'
import type { TabbiedPatternHandle } from 'tabbied/react'
import { JacketBack, JacketCover, JacketSpine } from '@/components/screens/book-jacket'
import { useNarrow } from '../_shared/use-narrow'
import { FRAMES, MATS, PAPER, PosterArt, SIZES, find, type Order } from './print-shop-art'

/**
 * The framed print, with a hardback standing beside it for scale.
 *
 * Every prop is read straight off the order, so the configurator's state IS
 * the scene: a new sheet size rebuilds the frame around it, a new frame
 * colour re-stains the molding, a mat cuts a board, and the sheet's content
 * re-renders because it is the same React tree as the rest of the page.
 *
 * The frame is built at true size, so a 24 x 36" sheet is half as tall again
 * as an 18 x 24" one, and with the camera fixed for the smallest it ran off
 * the stage. The view pulls back for a bigger sheet instead: the pair scales
 * down about the point where it stands, eased so a size change reads as the
 * camera stepping back rather than a jump cut. It does not pull back all the
 * way - the frame still grows on screen a little - and the book does the
 * rest: a 234 mm trade hardback, drawn at the frame's scale, is the thing a
 * visitor already knows the size of, so a sheet that dwarfs it is a big one.
 *
 * `zoom` is on, unusually for an example: a customer buying a print wants to
 * get close to it, and a pinch on the frame is the natural way to.
 */

/** PosterFrame's modelling scale: world units per millimetre. */
const PER_MM = 1 / 140
/** The book is modelled at 56 mm per unit; this brings it to the frame's scale. */
const BOOK_SCALE = 56 / 140
/** The 22 mm molding, on both sides. */
const MOLDING_MM = 44
const BOOK_MM = { width: 156, height: 234 }
/** Between the frame's edge and the book's. */
const GAP_MM = 70
/** The smallest framed sheet, which the camera is set for. */
const BASE_MM = SIZES[0].mm.height + MOLDING_MM
/** How much of a bigger sheet's extra height still shows on screen: 0 is none, 1 is all of it. */
const GROWTH = 0.35
/** Where the pair stands. Fixed, so the contact shadow never moves. */
const GROUND = -2.45

function scaleFor(heightMm: number): number {
  return (BASE_MM / heightMm) ** (1 - GROWTH)
}

/**
 * The pair on its ground line. Scale eases toward the size's target in a
 * frame loop that only runs while it is moving - the canvas draws on demand,
 * so each step asks for the next frame and the loop stops once it lands.
 */
function Arrangement({ order, artRef, narrow }: { order: Order; artRef: Ref<TabbiedPatternHandle>; narrow: boolean }) {
  const { mm } = find(SIZES, order.size)
  const frame = { width: mm.width + MOLDING_MM, height: mm.height + MOLDING_MM }
  const span = frame.width + GAP_MM + BOOK_MM.width
  const target = scaleFor(frame.height)

  const group = useRef<Group>(null)
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => invalidate(), [target, invalidate])
  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    const s = g.scale.x
    const next = Math.abs(target - s) < 1e-4 ? target : s + (target - s) * (1 - Math.exp(-dt * 7))
    g.scale.setScalar(next)
    if (next !== target) invalidate()
  })

  return (
    <group position={[narrow ? 0.15 : 0, GROUND, 0]} rotation={[0, -0.24, 0]}>
      <group ref={group}>
        <PosterFrame
          size={mm}
          color={find(FRAMES, order.frame).color}
          mat={find(MATS, order.mat).mat}
          surfaceBackground={PAPER}
          position={[(-span / 2 + frame.width / 2) * PER_MM, (frame.height / 2) * PER_MM, 0]}
          rotation={[0.02, 0, 0]}
        >
          <PosterArt order={order} ref={artRef} />
        </PosterFrame>
        <Book
          color="#1f3a5f"
          scale={BOOK_SCALE}
          position={[(span / 2 - BOOK_MM.width / 2) * PER_MM, (BOOK_MM.height / 2) * PER_MM, 0.9]}
          rotation={[0, 0.34, 0]}
        >
          <Book.Cover>
            <JacketCover cloth="#1f3a5f" />
          </Book.Cover>
          <Book.Spine>
            <JacketSpine cloth="#1f3a5f" />
          </Book.Spine>
          <Book.Back>
            <JacketBack cloth="#1f3a5f" />
          </Book.Back>
        </Book>
      </group>
    </group>
  )
}

export default function PrintShopScene({ order, artRef }: { order: Order; artRef: Ref<TabbiedPatternHandle> }) {
  // A phone's stage is tall and narrow, and the pair is wider than it is
  // tall, so the camera stands further back there.
  const narrow = useNarrow()
  return (
    <MockupCanvas
      zoom
      camera={{ position: [0, 0.5, narrow ? 16 : 13.2], fov: 38 }}
      shadowY={GROUND - 0.02}
      label="3D mockup of the framed print beside a hardback book, for scale"
    >
      <Float speed={1.1} rotationIntensity={0.06} floatIntensity={0.18} floatingRange={[0, 0.06]}>
        <Arrangement order={order} artRef={artRef} narrow={narrow} />
      </Float>
    </MockupCanvas>
  )
}
