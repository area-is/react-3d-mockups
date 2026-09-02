import * as React from 'react'
import * as THREE from 'three'
import type { ThreeElements } from '@react-three/fiber'
import {
  CUSTOM_PANEL,
  CUSTOM_PANEL_REGIONS,
  customPanelScale,
  roundedRectShape,
  type CustomSizeMm,
} from '../../core'
import { DeviceScreen } from '../../screen/device-screen'
import { collectSlots, createSlots, resolveSurface, type SurfaceProps } from '../../slots'

type GroupProps = ThreeElements['group']

export interface CustomPanelProps extends Omit<GroupProps, 'children' | 'color'>, SurfaceProps {
  /**
   * Face designs, full bleed. Bare children fill the front face; name faces
   * explicitly with `<CustomPanel.Front>` and `<CustomPanel.Back>`.
   */
  children?: React.ReactNode
  /** Panel size in real millimeters: `{ width, height, thickness? }`. */
  size: CustomSizeMm
  /** Stock color (edges, and the back when no back content is set). */
  color?: string
  /** Corner rounding in millimeters. */
  cornerRadius?: number
}

/**
 * A flat rectangular panel at ANY size you specify in millimeters - foam
 * board, acrylic sign, art print, table card. The longest edge normalizes
 * to the stage, so every size fills the default camera; the mm dimensions
 * set the aspect ratio and relative thickness. Front and back are live DOM.
 * No 3D asset files are loaded.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 *
 * ```tsx
 * <CustomPanel size={{ width: 600, height: 900, thickness: 5 }}>
 *   <CustomPanel.Front><YourArtwork /></CustomPanel.Front>
 *   <CustomPanel.Back><BackArtwork /></CustomPanel.Back>
 * </CustomPanel>
 * ```
 */
function CustomPanelImpl({
  children,
  size,
  color = '#f2f1ed',
  cornerRadius = 2,
  surfaceBackground = '#ffffff',
  resolution = CUSTOM_PANEL.resolution,
  surfaceStyle,
  ...groupProps
}: CustomPanelProps) {
  const regions = collectSlots(children, CUSTOM_PANEL_REGIONS)
  const scale = customPanelScale(size)
  const w = size.width * scale
  const h = size.height * scale
  const t = Math.max(0.012, (size.thickness ?? CUSTOM_PANEL.thickness) * scale)
  /*
   * The corner rounding is IN THE FACE - a die-cut corner on a flat sheet -
   * so the stock is a rounded rectangle extruded to its thickness, with the
   * edges merely softened. It used to be a rounded box, which rounds the
   * edges by the same amount as the corners: a 20 mm corner radius rounded
   * the edges by 20 mm too, and the print, sized to the whole face, hung that
   * far past the flat on every side.
   */
  const radius = Math.max(0, Math.min(cornerRadius * scale, Math.min(w, h) / 2 - 0.001))
  const bevel = Math.min(0.004, t / 2 - 0.001)

  const bodyGeometry = React.useMemo(() => {
    const shape = roundedRectShape(w - bevel * 2, h - bevel * 2, Math.max(0, radius - bevel))
    const depth = t - bevel * 2
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 2,
      curveSegments: 16,
    })
    geometry.translate(0, 0, -depth / 2)
    return geometry
  }, [w, h, t, radius, bevel])
  React.useEffect(() => () => bodyGeometry.dispose(), [bodyGeometry])

  const surfaceDefaults = {
    surfaceBackground,
    resolution,
    surfaceStyle,
  }
  const faceProps = {
    width: w,
    height: h,
    radius,
  }

  return (
    <group {...groupProps}>
      <mesh geometry={bodyGeometry}>
        <meshPhysicalMaterial color={color} metalness={0} roughness={0.65} />
      </mesh>

      <DeviceScreen
        {...faceProps}
        {...resolveSurface(regions.front, surfaceDefaults)}
        position={[0, 0, t / 2 + 0.003]}
      >
        {regions.front?.children}
      </DeviceScreen>
      {regions.back != null && (
        <DeviceScreen
          {...faceProps}
          {...resolveSurface(regions.back, surfaceDefaults)}
          position={[0, 0, -t / 2 - 0.003]}
          rotation={[0, Math.PI, 0]}
        >
          {regions.back.children}
        </DeviceScreen>
      )}
    </group>
  )
}
CustomPanelImpl.displayName = 'CustomPanel'

/** The panel's compound slots, shared by `<CustomPanel>` and `<CustomPanelMockup>`. */
export const customPanelSlots = createSlots(CUSTOM_PANEL_REGIONS)

export const CustomPanel = Object.assign(CustomPanelImpl, customPanelSlots)
