import * as React from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { HorizontalBlurShader } from 'three/examples/jsm/shaders/HorizontalBlurShader.js'
import { VerticalBlurShader } from 'three/examples/jsm/shaders/VerticalBlurShader.js'

export interface StageShadowsProps {
  /** Y of the shadow plane, in world units. */
  y: number
  opacity: number
  /** Side of the square the shadow covers, in world units. */
  scale: number
  blur: number
  /** How far above the plane an object still casts, in world units. */
  far: number
  /** Render-target size in px. */
  resolution?: number
}

/**
 * The soft contact shadow under a mockup: drei's `ContactShadows` technique -
 * render the scene's depth from below into a texture, blur it twice, lay it on
 * a plane - with one difference that matters more than all the rest of the
 * stage put together. It re-renders only when something it would draw has
 * MOVED.
 *
 * drei's version redraws every frame by default: a second full pass of the
 * scene plus four blur passes, even when nothing is moving. That was roughly
 * half the triangles of every mockup frame. And a mockup's shadow almost never
 * changes: the orbit controls move the CAMERA, not the object, and the shadow
 * is cast straight down in world space, so dragging, zooming and auto-rotating
 * all leave it exactly as it was. What does change it - `float`, a new pose or
 * variant, an object the caller animates - moves a mesh, so the check is a
 * comparison of every drawable mesh's world matrix (and geometry) against the
 * last time the shadow was drawn. It is a few hundred matrices compared per
 * rendered frame, against a full scene render it usually saves.
 */
export function StageShadows({ y, opacity, scale, blur, far, resolution = 512 }: StageShadowsProps) {
  const scene = useThree((state) => state.scene)
  const gl = useThree((state) => state.gl)
  const group = React.useRef<THREE.Group>(null!)
  const shadowCamera = React.useRef<THREE.OrthographicCamera>(null!)

  const pass = React.useMemo(() => {
    const target = new THREE.WebGLRenderTarget(resolution, resolution)
    const blurTarget = new THREE.WebGLRenderTarget(resolution, resolution)
    target.texture.generateMipmaps = blurTarget.texture.generateMipmaps = false
    const plane = new THREE.PlaneGeometry(scale, scale).rotateX(Math.PI / 2)
    const blurPlane = new THREE.Mesh(plane)
    const depth = new THREE.MeshDepthMaterial()
    depth.depthTest = depth.depthWrite = false
    // Same shader patch as drei: black, fading with distance above the plane
    // so the contact point stays darkest.
    depth.onBeforeCompile = (shader) => {
      shader.uniforms = { ...shader.uniforms, ucolor: { value: new THREE.Color('#000000') } }
      shader.fragmentShader = shader.fragmentShader
        .replace('void main() {', 'uniform vec3 ucolor;\nvoid main() {')
        .replace(
          'vec4( vec3( 1.0 - fragCoordZ ), opacity );',
          'vec4( ucolor * fragCoordZ * 2.0, ( 1.0 - fragCoordZ ) * 1.0 );'
        )
    }
    // Cloned uniforms: handing the shader module straight to the material (as
    // drei does) shares ONE uniforms object between every shadow on the page.
    const horizontal = new THREE.ShaderMaterial({
      ...HorizontalBlurShader,
      uniforms: THREE.UniformsUtils.clone(HorizontalBlurShader.uniforms),
    })
    const vertical = new THREE.ShaderMaterial({
      ...VerticalBlurShader,
      uniforms: THREE.UniformsUtils.clone(VerticalBlurShader.uniforms),
    })
    horizontal.depthTest = vertical.depthTest = false
    return { target, blurTarget, plane, blurPlane, depth, horizontal, vertical }
  }, [resolution, scale])

  React.useEffect(
    () => () => {
      pass.target.dispose()
      pass.blurTarget.dispose()
      pass.plane.dispose()
      pass.depth.dispose()
      pass.horizontal.dispose()
      pass.vertical.dispose()
    },
    [pass]
  )

  // The scene as the shadow last saw it; forgotten whenever the shadow's own
  // settings change, so the next frame redraws it.
  const tracker = React.useMemo(createMotionTracker, [])
  React.useEffect(() => tracker.forget(), [tracker, pass, y, blur, far])

  useFrame(() => {
    const camera = shadowCamera.current
    if (!camera || !tracker.moved(scene, group.current)) return
    const { target, blurTarget, blurPlane, depth, horizontal, vertical } = pass

    const background = scene.background
    const overrideMaterial = scene.overrideMaterial
    group.current.visible = false
    scene.background = null
    scene.overrideMaterial = depth
    gl.setRenderTarget(target)
    gl.render(scene, camera)

    const blurPass = (amount: number) => {
      blurPlane.visible = true
      blurPlane.material = horizontal
      horizontal.uniforms.tDiffuse!.value = target.texture
      horizontal.uniforms.h!.value = amount / 256
      gl.setRenderTarget(blurTarget)
      gl.render(blurPlane, camera)
      blurPlane.material = vertical
      vertical.uniforms.tDiffuse!.value = blurTarget.texture
      vertical.uniforms.v!.value = amount / 256
      gl.setRenderTarget(target)
      gl.render(blurPlane, camera)
      blurPlane.visible = false
    }
    blurPass(blur)
    blurPass(blur * 0.4)

    gl.setRenderTarget(null)
    group.current.visible = true
    scene.overrideMaterial = overrideMaterial
    scene.background = background
  })

  return (
    <group ref={group} position={[0, y, 0]} rotation-x={Math.PI / 2}>
      <mesh geometry={pass.plane} scale={[1, -1, 1]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial transparent map={pass.target.texture} opacity={opacity} depthWrite={false} />
      </mesh>
      <orthographicCamera ref={shadowCamera} args={[-scale / 2, scale / 2, scale / 2, -scale / 2, 0, far]} />
    </group>
  )
}

/**
 * Tracks whether anything the shadow pass would draw has changed since it last
 * ran.
 *
 * Every visible mesh contributes its world matrix and its geometry's identity
 * (plus, for instanced meshes, the instance count and buffer version), in
 * traversal order - so a moved, added, removed, hidden or re-shaped mesh all
 * read as a change. The shadow's own group is skipped: it is hidden while the
 * pass runs. Two buffers are swapped rather than one allocated per frame.
 */
function createMotionTracker() {
  let seen: number[] = []
  let scratch: number[] = []
  let length = 0
  let changed = false
  let skip: THREE.Object3D | null = null

  const push = (value: number) => {
    if (!changed && (length >= seen.length || seen[length] !== value)) changed = true
    scratch[length++] = value
  }
  const visit = (object: THREE.Object3D) => {
    if (!object.visible || object === skip) return
    const mesh = object as THREE.Mesh
    if (mesh.isMesh) {
      push(mesh.geometry.id)
      const instanced = object as THREE.InstancedMesh
      if (instanced.isInstancedMesh) {
        push(instanced.count)
        push(instanced.instanceMatrix.version)
      }
      const e = mesh.matrixWorld.elements
      for (let i = 0; i < 16; i++) push(e[i]!)
    }
    for (const child of object.children) visit(child)
  }

  return {
    /** Whether the scene moved since the last call that returned true. */
    moved(scene: THREE.Scene, own: THREE.Object3D): boolean {
      // Frame callbacks that ran before this one (float, a caller's own
      // animation) have moved objects without three recomputing their world
      // matrices yet - that normally happens inside the render call. Do it
      // now, or the check would always be one frame behind the scene.
      scene.updateMatrixWorld()
      length = 0
      changed = false
      skip = own
      visit(scene)
      skip = null
      if (!changed && length === seen.length) return false
      scratch.length = length
      ;[seen, scratch] = [scratch, seen]
      return true
    },
    /** Forget the last state, so the next check reports a change. */
    forget() {
      seen = []
    },
  }
}
