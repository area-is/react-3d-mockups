/**
 * The bridge that puts a screen's live DOM on the glass: a separate React root
 * on an element portalled next to the canvas, CSS3D-transformed every frame to
 * sit exactly over its anchor in the scene, with a depth-tested mesh in the
 * scene that clears the canvas to transparent where the DOM should show.
 *
 * Adapted from `<Html transform occlude="blending">` in @react-three/drei
 * (MIT License, Copyright (c) 2020 react-spring), trimmed to the one way the
 * screens use it. The CSS matrix maths below is drei's, unchanged.
 *
 * It is ours rather than drei's for one reason: React root lifetime. drei
 * creates the wrapper element once per component and unmounts the root
 * synchronously in a layout-effect cleanup - inside React's commit, which
 * React reports in development as "Attempted to synchronously unmount a root
 * while React was already rendering", once for every screen on every mount
 * under StrictMode (and every Next.js and Vite dev server runs StrictMode).
 * Reusing the element across mounts was also what let a late teardown wipe a
 * live screen (see `DeviceScreen`). Here every mount gets a fresh element and
 * its own root, and an outgoing root unmounts after the commit that removed
 * it, on its detached element, where it can touch nothing live.
 */
import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { DoubleSide, OrthographicCamera, PerspectiveCamera, Vector3 } from 'three'
import type * as THREE from 'three'
import { addAfterEffect, useFrame, useThree } from '@react-three/fiber'
import { stackSurfaces, surfaceCorners } from '../core/screen/stacking'
import { traceTransparent } from '../core/screen/clip-trace'

/**
 * EXPERIMENTAL: running totals for `experimentalScreenInput`, so a test page
 * can show what the per-frame readback and tracing cost on the machine it
 * runs on. Reset it by assigning zeros.
 */
export const experimental_screenInputStats = { frames: 0, readMs: 0, traceMs: 0, pixels: 0, vertices: 0 }

const v1 = /* @__PURE__ */ new Vector3()
const v2 = /* @__PURE__ */ new Vector3()
const v3 = /* @__PURE__ */ new Vector3()

function isBehindCamera(object: THREE.Object3D, camera: THREE.Camera): boolean {
  const objectPos = v1.setFromMatrixPosition(object.matrixWorld)
  const cameraPos = v2.setFromMatrixPosition(camera.matrixWorld)
  return objectPos.sub(cameraPos).angleTo(camera.getWorldDirection(v3)) > Math.PI / 2
}

/**
 * The screens of one scene, stacked together.
 *
 * Every screen's DOM sits under the canvas and shows through the hole its
 * depth mask clears, and what shows through a hole is whichever screen's DOM
 * is on top there - so where two screens overlap on the page, the nearer one
 * has to have the higher z-index. Each portal used to set its own from its
 * anchor's camera distance (drei's way), which puts a large surface over a
 * small one in front of it whenever the large one's centre is the nearer:
 * a record sleeve standing behind a milk carton showed through the carton.
 * Now every portal of a scene registers here, and once a frame the first of
 * them to run stacks them all by their planes (see `stackSurfaces`).
 */
interface Layer {
  anchor: React.RefObject<THREE.Group | null>
  geometry: React.RefObject<THREE.BufferGeometry>
  element: HTMLElement
  /** Stacked above the canvas (`input`) rather than under it. */
  above: boolean
}

interface Stack {
  layers: Set<Layer>
  /** The renderer frame the stack was last sorted for. */
  frame: number
}

const stacks = new WeakMap<THREE.Object3D, Stack>()

function joinStack(scene: THREE.Object3D, layer: Layer): () => void {
  let stack = stacks.get(scene)
  if (!stack) {
    stack = { layers: new Set(), frame: -1 }
    stacks.set(scene, stack)
  }
  stack.layers.add(layer)
  stack.frame = -1
  return () => {
    stack.layers.delete(layer)
    stack.frame = -1
  }
}

/** Gives every screen of `scene` its z-index for this frame, below `ceiling` (where the canvas sits). */
function restack(scene: THREE.Object3D, camera: THREE.Camera, frame: number, ceiling: number): void {
  const stack = stacks.get(scene)
  if (!stack || stack.frame === frame) return
  stack.frame = frame
  if (!(camera instanceof PerspectiveCamera || camera instanceof OrthographicCamera)) return
  const layers: Layer[] = []
  const surfaces = []
  for (const layer of stack.layers) {
    const anchor = layer.anchor.current
    if (!anchor) continue
    anchor.updateWorldMatrix(true, false)
    layers.push(layer)
    surfaces.push({ corners: surfaceCorners(layer.geometry.current, anchor.matrixWorld) })
  }
  stackSurfaces(surfaces, camera).forEach((index, rank) => {
    const above = layers[index]!.above
    const zIndex = `${above ? ceiling + 1 + rank : Math.min(ceiling - 1, rank + 1)}`
    const element = layers[index]!.element
    if (element.style.zIndex !== zIndex) element.style.zIndex = zIndex
  })
}

const epsilon = (value: number) => (Math.abs(value) < 1e-10 ? 0 : value)

function cssMatrix(matrix: THREE.Matrix4, multipliers: number[], prepend = ''): string {
  let out = 'matrix3d('
  for (let i = 0; i !== 16; i++) out += epsilon(multipliers[i]! * matrix.elements[i]!) + (i !== 15 ? ',' : ')')
  return prepend + out
}

const CAMERA_MULTIPLIERS = [1, -1, 1, 1, 1, -1, 1, 1, 1, -1, 1, 1, 1, -1, 1, 1]
const cameraCssMatrix = (matrix: THREE.Matrix4) => cssMatrix(matrix, CAMERA_MULTIPLIERS)
const objectCssMatrix = (matrix: THREE.Matrix4, f: number) =>
  cssMatrix(
    matrix,
    [1 / f, 1 / f, 1 / f, 1, -1 / f, -1 / f, -1 / f, -1, 1 / f, 1 / f, 1 / f, 1, 1, 1, 1, 1],
    'translate(-50%,-50%)'
  )

/** Clears the canvas to transparent wherever the mask is the nearest surface. */
const CLEAR_FRAGMENT = /* glsl */ `
  void main() {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  }
`

/** One mount of the portal: its wrapper element, its React root, and that root's refs. */
interface Mounted {
  element: HTMLDivElement
  root: ReactDOM.Root
  outer: React.RefObject<HTMLDivElement | null>
  inner: React.RefObject<HTMLDivElement | null>
}

export interface ScreenPortalProps {
  /** The element the screen's wrapper is appended to. */
  target: HTMLElement
  /** The depth mask's geometry, in the anchor's local units: the screen's silhouette. */
  geometry: THREE.BufferGeometry
  /** Scales the DOM onto the glass, as drei's `distanceFactor`. */
  distanceFactor: number
  /** The z-index band, as drei's `zIndexRange`; the canvas sits at its midpoint. */
  zIndexRange: [number, number]
  /** Class for the wrapper element (compositor-layer promotion, see `SCREEN_LAYER_CLASS`). */
  wrapperClass?: string
  /** `pointer-events` of the element holding the content. */
  pointerEvents?: React.CSSProperties['pointerEvents']
  /**
   * EXPERIMENTAL (`experimentalScreenInput`): stack the DOM ABOVE the canvas,
   * where pointers reach it, and clip it every frame to the pixels the canvas
   * left transparent for it - the part of the screen no hardware covers.
   */
  input?: boolean
  children?: React.ReactNode
}

export function ScreenPortal({
  target,
  geometry,
  distanceFactor,
  zIndexRange,
  wrapperClass,
  pointerEvents = 'auto',
  input = false,
  children,
}: ScreenPortalProps) {
  const gl = useThree((state) => state.gl)
  const camera = useThree((state) => state.camera)
  const scene = useThree((state) => state.scene)
  const size = useThree((state) => state.size)
  const group = React.useRef<THREE.Group>(null)
  const mounted = React.useRef<Mounted | null>(null)
  const visible = React.useRef(true)
  const geometryRef = React.useRef(geometry)
  geometryRef.current = geometry

  // Depth blending: the canvas composites OVER the screens, at the band's midpoint.
  React.useLayoutEffect(() => {
    const style = gl.domElement.style
    style.zIndex = `${Math.floor(zIndexRange[0] / 2)}`
    style.position = 'absolute'
  }, [gl, zIndexRange])

  React.useLayoutEffect(() => {
    const element = document.createElement('div')
    element.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;overflow:hidden;'
    if (wrapperClass) element.className = wrapperClass
    // Above the canvas, nothing may show until the first frame has been traced.
    if (input) {
      element.style.clipPath = 'inset(50%)'
      element.dataset.screenInput = ''
    }
    const mount: Mounted = {
      element,
      root: ReactDOM.createRoot(element),
      // Refs of this root's own. Shared refs broke every screen: an outgoing
      // root unmounting a tick later nulls the refs it rendered, and with one
      // pair for all roots it nulled the live root's - StrictMode's discarded
      // first mount left every screen without its transform.
      outer: React.createRef(),
      inner: React.createRef(),
    }
    mounted.current = mount
    visible.current = true
    scene.updateMatrixWorld()
    target.appendChild(element)
    const leaveStack = joinStack(scene, { anchor: group, geometry: geometryRef, element, above: input })
    // A press or a wheel on the screen is the content's, not the orbit controls'.
    const keep = (event: Event) => event.stopPropagation()
    if (input) {
      element.addEventListener('pointerdown', keep)
      element.addEventListener('wheel', keep)
    }
    return () => {
      element.removeEventListener('pointerdown', keep)
      element.removeEventListener('wheel', keep)
      leaveStack()
      element.remove()
      if (mounted.current === mount) mounted.current = null
      // Not here: this cleanup runs inside React's commit, where unmounting a
      // root cannot flush (see the file comment). The element is already
      // detached, so the root has nothing live left to touch.
      queueMicrotask(() => mount.root.unmount())
    }
  }, [target, wrapperClass, scene, input])

  // Every commit re-renders the content into the screen's root, so whatever
  // the parent passes down - and every context bridged with it - stays live.
  React.useLayoutEffect(() => {
    const mount = mounted.current
    mount?.root.render(
      <div
        ref={mount.outer}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size.width,
          height: size.height,
          transformStyle: 'preserve-3d',
          pointerEvents: 'none',
        }}
      >
        <div ref={mount.inner} style={{ position: 'absolute', pointerEvents }}>
          <div>{children}</div>
        </div>
      </div>
    )
  })

  // EXPERIMENTAL (`input`): once the frame has rendered, read the canvas's
  // alpha under this screen and clip the DOM to the transparent part of it.
  // It runs after every root has drawn and before the browser composites, so
  // the drawing buffer still holds this frame; `drew` keeps it to frames this
  // canvas actually drew, since an undrawn buffer reads back empty.
  const drew = React.useRef(false)
  React.useEffect(() => {
    if (!input) return
    const corner = new Vector3()
    let buffer = new Uint8Array(0)
    return addAfterEffect(() => {
      if (!drew.current) return
      drew.current = false
      const anchor = group.current
      const mount = mounted.current
      const geometry = geometryRef.current
      if (!anchor || !mount || !visible.current) return
      const canvas = gl.domElement
      const dpr = canvas.width / size.width
      if (!geometry.boundingBox) geometry.computeBoundingBox()
      const box = geometry.boundingBox!
      // The screen's projected bounds in device pixels, top-down, with a
      // margin for antialiasing. Outside them the DOM draws nothing anyway.
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      for (const [x, y] of [
        [box.min.x, box.min.y],
        [box.max.x, box.min.y],
        [box.max.x, box.max.y],
        [box.min.x, box.max.y],
      ] as const) {
        corner.set(x, y, 0).applyMatrix4(anchor.matrixWorld).project(camera)
        const px = (corner.x * 0.5 + 0.5) * canvas.width
        const py = (0.5 - corner.y * 0.5) * canvas.height
        minX = Math.min(minX, px)
        maxX = Math.max(maxX, px)
        minY = Math.min(minY, py)
        maxY = Math.max(maxY, py)
      }
      const x0 = Math.max(0, Math.floor(minX) - 2)
      const y0 = Math.max(0, Math.floor(minY) - 2)
      const x1 = Math.min(canvas.width, Math.ceil(maxX) + 2)
      const y1 = Math.min(canvas.height, Math.ceil(maxY) + 2)
      const w = x1 - x0
      const h = y1 - y0
      if (w <= 0 || h <= 0) {
        mount.element.style.clipPath = 'inset(50%)'
        return
      }
      if (buffer.length < w * h * 4) buffer = new Uint8Array(w * h * 4)
      const context = gl.getContext()
      const t0 = performance.now()
      // Rows come back bottom-up.
      context.readPixels(x0, canvas.height - y1, w, h, context.RGBA, context.UNSIGNED_BYTE, buffer)
      const t1 = performance.now()
      const { path, vertices } = traceTransparent(
        (x, y) => buffer[((h - 1 - y) * w + x) * 4 + 3]! < 128,
        w,
        h,
        (x) => +((x0 + x) / dpr).toFixed(2),
        (y) => +((y0 + y) / dpr).toFixed(2)
      )
      const stats = experimental_screenInputStats
      stats.frames++
      stats.readMs += t1 - t0
      stats.traceMs += performance.now() - t1
      stats.pixels += w * h
      stats.vertices += vertices
      mount.element.style.clipPath = path ? `path(evenodd, "${path}")` : 'inset(50%)'
    })
  }, [input, gl, camera, size])

  useFrame((state) => {
    const anchor = group.current
    const mount = mounted.current
    drew.current = true
    if (!anchor || !mount) return
    const { element, outer, inner } = mount
    camera.updateMatrixWorld()
    anchor.updateWorldMatrix(true, false)

    const shown = !isBehindCamera(anchor, camera)
    if (shown !== visible.current) {
      visible.current = shown
      element.style.display = shown ? 'block' : 'none'
    }
    restack(scene, camera, state.gl.info.render.frame, Math.floor(zIndexRange[0] / 2))

    const widthHalf = size.width / 2
    const heightHalf = size.height / 2
    const fov = camera.projectionMatrix.elements[5]! * heightHalf
    const ortho = camera as THREE.OrthographicCamera
    const cameraTransform = ortho.isOrthographicCamera
      ? `scale(${fov})translate(${epsilon(-(ortho.right + ortho.left) / 2)}px,${epsilon((ortho.top + ortho.bottom) / 2)}px)`
      : `translateZ(${fov}px)`
    element.style.width = `${size.width}px`
    element.style.height = `${size.height}px`
    element.style.perspective = ortho.isOrthographicCamera ? '' : `${fov}px`
    if (outer.current && inner.current) {
      outer.current.style.transform = `${cameraTransform}${cameraCssMatrix(camera.matrixWorldInverse)}translate(${widthHalf}px,${heightHalf}px)`
      inner.current.style.transform = objectCssMatrix(anchor.matrixWorld, 1 / (distanceFactor / 400))
    }
  })

  return (
    <group ref={group}>
      <mesh geometry={geometry}>
        <shaderMaterial side={DoubleSide} fragmentShader={CLEAR_FRAGMENT} />
      </mesh>
    </group>
  )
}
