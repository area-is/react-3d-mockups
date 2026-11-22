import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import {
  MAGAZINE,
  MAGAZINE_REGIONS,
  magazineSpec,
  type MagazineSize,
  SHEETS,
  createSurfaceSheenMaterial,
  grainMap,
  grainNormal,
  roundedRectShape,
  sheetBlockGeometry,
} from '../../core'
import { DeviceScreen } from '../../screen/device-screen'
import { collectSlots, createSlots, resolveSurface, type SurfaceProps } from '../../slots'

type GroupProps = ThreeElements['group']

export interface MagazineProps extends Omit<GroupProps, 'children' | 'color'>, SurfaceProps {
  /**
   * Cover art - full bleed on the front cover. Bare children fill the front
   * cover; name faces explicitly with `<Magazine.Cover>`, `<Magazine.Back>`
   * and `<Magazine.Spine>`. Spine content is rotated to read top-to-bottom
   * like a real shelf spine: your DOM's left edge lands at the spine's top
   * and its top edge faces the front cover.
   */
  children?: React.ReactNode
  /**
   * Physical trim size in millimeters, e.g. `{ width: 210, height: 297 }`
   * for A4 or `{ thickness: 12 }` for a thick issue. Defaults to the
   * 216 x 279 x 6 mm US letter trim.
   */
  size?: MagazineSize
  /** Paper color of the trimmed page edges. */
  pageColor?: string
  /** Back cover color (the unprinted default is a light stock gray). */
  backColor?: string
  /**
   * Glossy cover stock: physically-lit studio reflections sliding across the
   * cover art as it turns, plus a clearcoat on the spine and back. Off by
   * default - the default stock is matte paper, flat under any light.
   */
  glossy?: boolean
}

/**
 * A procedurally built perfect-bound magazine: a thin letter-trim page block
 * with visible paper edges, a flat glued spine, and live full-bleed front
 * and back covers on matte stock (opt into `glossy` for a coated sheen). No 3D
 * asset files are loaded.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 *
 * ```tsx
 * <Magazine glossy>
 *   <Magazine.Cover><CoverArt /></Magazine.Cover>
 *   <Magazine.Back><BackAd /></Magazine.Back>
 * </Magazine>
 * ```
 */
function MagazineImpl({
  children,
  size,
  pageColor = '#fbfaf7',
  backColor = '#e9e7e2',
  glossy = false,
  surfaceBackground = '#ffffff',
  resolution = MAGAZINE.resolution,
  surfaceStyle,
  ...groupProps
}: MagazineProps) {
  const regions = collectSlots(children, MAGAZINE_REGIONS)
  const { body, cover } = React.useMemo(
    () => (size ? magazineSpec(size) : MAGAZINE),
    [size?.width, size?.height, size?.thickness]
  )
  // Screens occlude against OTHER registered bodies only - the page block
  // is convex, so the backface culler already covers every view it could
  // block itself, and own-body ray grazes would false-hide the thin spine
  // strip at the shallow angles a spine is naturally viewed from.

  // The spine and back share one cover-stock finish: matte by default
  // (rough, no clearcoat - flat under any light, like uncoated paper),
  // or the coated gloss look when `glossy` is on.
  const coverStockMaterial = glossy ? (
    <meshPhysicalMaterial color={backColor} metalness={0} roughness={0.32} clearcoat={0.55} />
  ) : (
    <meshPhysicalMaterial color={backColor} metalness={0} roughness={0.72} />
  )

  const backGeometry = React.useMemo(
    () =>
      new THREE.ShapeGeometry(
        roundedRectShape(body.width - 0.01, body.height - 0.01, body.radius),
        12
      ),
    [body]
  )

  const coverSheenGeometry = React.useMemo(
    () => new THREE.ShapeGeometry(roundedRectShape(cover.width, cover.height, cover.radius), 12),
    [cover]
  )

  const glossSheen = React.useMemo(
    () => (glossy ? createSurfaceSheenMaterial({ roughness: 0.14, envMapIntensity: 0.92 }) : null),
    [glossy]
  )

  // the trimmed block's three open edges show their leaves; the cuts are
  // square, so a plain box loses nothing to the old hair of rounding
  const blockGeometry = React.useMemo(
    () => sheetBlockGeometry(body.width, body.height, body.thickness, Math.max(1, Math.round(body.thickness / 0.09))),
    [body]
  )
  React.useEffect(
    () => () => {
      backGeometry.dispose()
      coverSheenGeometry.dispose()
      glossSheen?.dispose()
      blockGeometry.dispose()
    },
    [backGeometry, coverSheenGeometry, glossSheen, blockGeometry]
  )

  const surfaceDefaults = {
    surfaceBackground,
    resolution,
    surfaceStyle,
  }

  return (
    <group {...groupProps}>
      {/* trimmed page block - the paper edges you see on the three open sides */}
      <mesh geometry={blockGeometry}>
        <meshPhysicalMaterial
          color={pageColor}
          metalness={0}
          roughness={0.9}
          map={grainMap(SHEETS, 1, 3)}
          normalMap={grainNormal(SHEETS, 1, 3)}
        />
      </mesh>

      {/* perfect-bound spine: the cover stock wraps only the bound edge,
          trimmed flush with the block on the other sides (the hair of
          offset just avoids z-fighting with the page block faces) */}
      <RoundedBox
        args={[0.016, body.height - 0.002, body.thickness + 0.001]}
        radius={0.004}
        position-x={-body.width / 2}
      >
        {coverStockMaterial}
      </RoundedBox>

      {/* back cover, on the same stock as the spine */}
      <mesh geometry={backGeometry} rotation-y={Math.PI} position-z={-body.thickness / 2 - 0.002}>
        {coverStockMaterial}
      </mesh>

      {/* physically-lit coated gloss sheen over the printed covers when glossy */}
      {glossSheen && (
        <mesh geometry={coverSheenGeometry} material={glossSheen} position-z={body.thickness / 2 + 0.0055} />
      )}
      {glossSheen && regions.back != null && (
        <mesh
          geometry={coverSheenGeometry}
          material={glossSheen}
          position-z={-body.thickness / 2 - 0.0055}
          rotation={[0, Math.PI, 0]}
        />
      )}

      {/* the live cover: real DOM, CSS3D-transformed onto the front */}
      <DeviceScreen
        {...resolveSurface(regions.cover, surfaceDefaults)}
        width={cover.width}
        height={cover.height}
        radius={cover.radius}
        position={[0, 0, body.thickness / 2 + 0.004]}
      >
        {regions.cover?.children}
      </DeviceScreen>

      {/* live back cover - same stock, same sheen */}
      {regions.back != null && (
        <DeviceScreen
          {...resolveSurface(regions.back, surfaceDefaults)}
          width={cover.width}
          height={cover.height}
          radius={cover.radius}
          position={[0, 0, -body.thickness / 2 - 0.004]}
          rotation={[0, Math.PI, 0]}
        >
          {regions.back.children}
        </DeviceScreen>
      )}

      {/* live spine: the bound edge's narrow strip, rotated so content
          reads top-to-bottom like a real shelf spine - DOM left lands at
          the spine's top, DOM top faces the front cover. Rendered at 3x
          the cover dpi: at print scale the strip is only a few mm tall,
          and small type needs the extra pixels to stay crisp. */}
      {regions.spine != null && (
        <DeviceScreen
          {...resolveSurface(regions.spine, {
            ...surfaceDefaults,
            resolution: Math.round(resolution * 3 * ((body.height - 0.008) / cover.width)),
          })}
          width={body.height - 0.008}
          height={body.thickness - 0.004}
          radius={0.006}
          position={[-body.width / 2 - 0.01, 0, 0]}
          rotation={[0, -Math.PI / 2, -Math.PI / 2]}
        >
          {regions.spine.children}
        </DeviceScreen>
      )}
    </group>
  )
}
MagazineImpl.displayName = 'Magazine'

/** The magazine's compound slots, shared by `<Magazine>` and `<MagazineMockup>`. */
export const magazineSlots = createSlots(MAGAZINE_REGIONS)

export const Magazine = Object.assign(MagazineImpl, magazineSlots)
