import * as React from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useDelayRender } from 'remotion'

/*
 * A row of models standing on one floor, spaced by what they actually draw.
 *
 * Each model is measured the first frame it exists - the bounds of its meshes
 * as posed, in its own frame - then stood on the floor, centred on its own
 * footprint and set beside the last one with a gap, and the whole row is
 * scaled to fit the box it is given. Models keep their sizes relative to each
 * other (pass each one scaled from its own units to a common one), and
 * because they are spaced by their bounds, no two can ever touch, whatever
 * their shapes or yaws. The frame is held until the row has been laid out,
 * so a model is never drawn where it does not belong.
 */

export interface LineupItem {
  key: string
  /** A bare model, posed - its rotation and scale - but not placed. */
  node: React.ReactNode
  /** 0..1, how far it has popped in; it grows out of the floor. */
  pop?: number
}

const tmp = new THREE.Box3()
const chain = new THREE.Matrix4()

/** A model's bounds in `root`'s own frame: every visible mesh, through the transforms between them. */
function boundsIn(root: THREE.Object3D): THREE.Box3 | null {
  root.updateWorldMatrix(true, true)
  const box = new THREE.Box3()
  root.traverseVisible((node) => {
    const mesh = node as THREE.Mesh
    if (!mesh.isMesh || !mesh.geometry) return
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox()
    const own = mesh.geometry.boundingBox
    if (!own || own.isEmpty()) return
    chain.identity()
    for (let at: THREE.Object3D | null = mesh; at && at !== root; at = at.parent) chain.premultiply(at.matrix)
    box.union(tmp.copy(own).applyMatrix4(chain))
  })
  return box.isEmpty() ? null : box
}

export function Lineup({
  items,
  width,
  height,
  floor,
  gap = 0.16,
}: {
  items: LineupItem[]
  /** The widest the row may be, in world units. */
  width: number
  /** The tallest any model may be, in world units. */
  height: number
  /** Where the floor is. */
  floor: number
  /** The space between neighbours, as a share of their average width. */
  gap?: number
}) {
  const row = React.useRef<THREE.Group>(null)
  const slots = React.useRef<(THREE.Group | null)[]>([])
  const inners = React.useRef<(THREE.Group | null)[]>([])
  const invalidate = useThree((state) => state.invalidate)
  const { delayRender, continueRender } = useDelayRender()
  const [hold] = React.useState(() => delayRender('Lining up the models'))
  const phase = React.useRef<'measure' | 'release' | 'done'>('measure')
  const release = React.useCallback(() => {
    if (phase.current === 'done') return
    phase.current = 'done'
    continueRender(hold)
  }, [continueRender, hold])
  React.useEffect(() => release, [release])

  useFrame(() => {
    if (phase.current === 'release') return release()
    if (phase.current !== 'measure') return
    const boxes = items.map((_, i) => (inners.current[i] ? boundsIn(inners.current[i]!) : null))
    if (!row.current || boxes.some((box) => !box)) {
      // Not everything has geometry yet: look again next frame.
      invalidate()
      return
    }
    const widths = boxes.map((box) => box!.max.x - box!.min.x)
    const tallest = Math.max(...boxes.map((box) => box!.max.y - box!.min.y))
    const space = (gap * widths.reduce((sum, w) => sum + w, 0)) / widths.length
    const total = widths.reduce((sum, w) => sum + w, 0) + space * (widths.length - 1)
    let x = -total / 2
    boxes.forEach((box, i) => {
      const b = box!
      inners.current[i]!.position.set(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2)
      slots.current[i]!.position.set(x + widths[i]! / 2, 0, 0)
      x += widths[i]! + space
    })
    row.current.scale.setScalar(Math.min(width / total, height / tallest))
    row.current.position.set(0, floor, 0)
    phase.current = 'release'
    invalidate()
  })

  return (
    <group ref={row}>
      {items.map((item, i) => (
        <group key={item.key} ref={(g) => void (slots.current[i] = g)}>
          <group scale={Math.max(1e-4, item.pop ?? 1)}>
            <group ref={(g) => void (inners.current[i] = g)}>{item.node}</group>
          </group>
        </group>
      ))}
    </group>
  )
}
