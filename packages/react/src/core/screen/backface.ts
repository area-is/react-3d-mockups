import type { Camera, Object3D } from 'three'
import { Quaternion, Vector3 } from 'three'

/**
 * Hide the DOM screen whenever its plane faces away from the camera, or its
 * anchor is not being drawn at all.
 *
 * CSS backface-visibility can't see the HTML bridge's transform chain, and two
 * overlapping DOM planes (a card's front and back) otherwise paint in DOM
 * order - the reverse face would bleed through, mirrored. Hiding the plane
 * whenever its normal points away from the camera is deterministic, and the
 * depth mask alone cannot do it (a back-facing screen's mask still clears the
 * canvas over it).
 *
 * The same goes for a screen whose anchor, or any ancestor of it, is set
 * `visible = false`. three skips drawing that subtree - body and depth mask
 * alike - but the DOM is not in the scene graph and knows nothing about it, so
 * a hidden device used to leave its screen floating in mid-air with no
 * hardware around it.
 *
 * Bindings call the returned function once per frame with the screen's anchor
 * object, its content element, and the active camera.
 */
export type BackfaceCuller = (anchor: Object3D, content: HTMLElement, camera: Camera) => void

/**
 * Facing threshold below which the plane also hides: within a fraction of a
 * degree of edge-on the DOM plane is a degenerate sub-pixel sliver whose
 * CSS3D matrix shimmers and paints OVER chassis parts (the browser composites
 * the bridge above WebGL). Occlusion by the body is the depth mask's job, so
 * this stays tiny - a slanted side view must keep showing the foreshortened
 * live screen, exactly like a real device seen edge-ish on.
 */
const GRAZING_DOT = 0.015

export function createBackfaceCuller(): BackfaceCuller {
  // Scratch values reused across frames - no per-frame allocation.
  const n = new Vector3()
  const p = new Vector3()
  const q = new Quaternion()
  return (anchor, content, camera) => {
    anchor.getWorldQuaternion(q)
    anchor.getWorldPosition(p)
    n.set(0, 0, 1).applyQuaternion(q)
    p.subVectors(camera.position, p).normalize()
    const visibility = isDrawn(anchor) && n.dot(p) > GRAZING_DOT ? '' : 'hidden'
    if (content.style.visibility !== visibility) content.style.visibility = visibility
  }
}

/** Whether three would draw `object`: it and every ancestor are `visible`. */
function isDrawn(object: Object3D): boolean {
  for (let node: Object3D | null = object; node; node = node.parent) {
    if (!node.visible) return false
  }
  return true
}
