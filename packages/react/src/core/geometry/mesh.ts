import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * Re-weld an extruded solid so its rounded edges shade smoothly. ExtrudeGeometry
 * emits an unindexed mesh with one flat normal per face, so a rolled bevel - a
 * camera plateau's edge, an island's shoulder, a kiosk cabinet's corner -
 * renders as a stack of visible bands however many segments it has. Merging
 * the coincident vertices and recomputing the normals turns the roll into one
 * continuous highlight, which is what real machined or formed surfaces show.
 * Consumes `geometry`.
 */
export function smoothShaded(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  geometry.deleteAttribute('normal')
  geometry.deleteAttribute('uv')
  const welded = mergeVertices(geometry)
  welded.computeVertexNormals()
  geometry.dispose()
  return welded
}

export interface SurfaceSheenOptions {
  /** Microfacet roughness of the clear topcoat (0.04 glass, 0.16 gloss laminate). */
  roughness?: number
  /** Environment reflection strength. */
  envMapIntensity?: number
  /** Optional clearcoat strength (defaults to 0 - base Fresnel handles dielectric sheen). */
  clearcoat?: number
}

/**
 * A clear gloss film or glazing reflection drawn as light only over a live DOM
 * surface. The DOM sits behind the WebGL canvas and catches no studio lights,
 * yet softboxes sliding across glass, acrylic, or gloss laminate as an object
 * turns are what separate real glazed or laminated surfaces from flat paper.
 *
 * The material is physically lit pure black (`color: '#000000'`), so it adds
 * zero diffuse tint of its own and reflects the studio environment with true
 * dielectric Fresnel falloff (subtle head-on, bright at grazing angles). Its
 * fragment alpha is set to the reflection's own brightness (`max(r, g, b)`)
 * with `premultipliedAlpha: true`, so over a live screen it brightens where it
 * reflects a studio light and leaves the underlying print untouched elsewhere.
 */
export function createSurfaceSheenMaterial({
  roughness = 0.16,
  envMapIntensity = 1,
  clearcoat = 0,
}: SurfaceSheenOptions = {}): THREE.MeshPhysicalMaterial {
  const material = new THREE.MeshPhysicalMaterial({
    color: '#000000',
    metalness: 0,
    roughness,
    clearcoat,
    clearcoatRoughness: roughness,
    envMapIntensity,
    transparent: true,
    depthWrite: false,
    // The reflection is light added over the DOM: premultiplied, so the canvas
    // carries the specular highlight as-is and the print shows through by alpha.
    premultipliedAlpha: true,
  })
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>
      gl_FragColor.a = clamp(max(gl_FragColor.r, max(gl_FragColor.g, gl_FragColor.b)), 0.0, 1.0);`
    )
  }
  material.customProgramCacheKey = () => 'react-3d-mockups-surface-sheen'
  return material
}
