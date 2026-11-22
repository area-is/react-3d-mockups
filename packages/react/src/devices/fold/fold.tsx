import * as React from 'react'
import * as THREE from 'three'
import type { ThreeElements } from '@react-three/fiber'
import {
  FOLD_COLORWAYS,
  IPHONE_DUO_COLORWAYS,
  findColorway,
  foldOpenAngle,
  coverScreenLit,
  FLAT_EPSILON,
  railColor,
  FOLD_VARIANTS,
  FOLD_DEFAULT_VARIANT,
  IPHONE_DUO_VARIANTS,
  IPHONE_DUO_DEFAULT_VARIANT,
  SCREEN_REGIONS,
  foldDisplayStandoff,
  foldHingeReach,
  hingeSpine,
  type Colorway,
  type FoldSpec,
  type FoldVariant,
  type IPhoneDuoVariant,
  roundedRectShape,
} from '../../core'
import { checkColorway, checkDeviceVariant } from '../../core/lifecycle'
import { bezierRoundedRectShape } from '../../core/geometry/rounded-rect'
import { DeviceScreen } from '../../screen/device-screen'
import {
  renderStatusBar,
  statusBarSafeAreaTop,
  type StatusBarOption,
  type StatusBarPlacement,
} from '../../screen/status-bar'
import { createLogoGeometry } from '../logos'
import {
  SideKey,
  LensRing,
  FlashModule,
  UsbC,
  EdgeSocket,
  cutGeometry,
  mixedRoundedRectShape,
  smoothShaded,
  stadiumCutter,
  holeCutter,
  USB_CUT_DEPTH,
  CREASE_OVERLAP,
  HINGE_SEAL,
  hingeCapShape,
} from '../details'
import { collectSlots, createSlots, resolveSurface, type SurfaceProps } from '../../slots'

type GroupProps = ThreeElements['group']

/**
 * Everything both book-folds take. Each brand's component adds its own
 * `variant` union on top.
 */
export interface FoldCommonProps extends Omit<GroupProps, 'children' | 'color'>, SurfaceProps {
  /**
   * Anything you want on the active display: React components, an <iframe>, a
   * <video>… Wrap in `<Fold.Screen>` / `<IPhoneDuo.Screen>` to set per-screen
   * surface props.
   */
  children?: React.ReactNode
  /**
   * How far the book is open, as a boolean for the two poses or a number of
   * degrees for anything between.
   *
   * `true` (default) renders the unfolded tablet - your content fills the large,
   * nearly square inner display (with a faint center crease). `false` renders the
   * folded candy-bar - your content fills the cover display and the rear
   * camera pill shows on the back.
   *
   * A number (0 = shut, 180 = flat) renders the real Flex Mode book pose: the
   * camera half holds still and the cover half swings open about the crease,
   * the Armor FlexHinge, whose rounded spine (with the SAMSUNG engraving)
   * the two back shells close around as the book shuts, until only its crown
   * caps the folded bar's edge, and your content bends across the crease -
   * e.g. `openAngle={110}` for the half-open standing pose. It is one motion
   * from shut to flat: `false` and `0` are the shut end of it, not a separate
   * pose, so nothing jumps as the hinge leaves 0 and a screen on the cover
   * keeps its state through it. Only the flat-open pose is drawn apart - as
   * one seamless screen - and it takes only a flat hinge. The crease is the
   * one line that never moves, so the open device
   * is centred on it and the folded one lies on the camera half, half its own
   * width to the right. At intermediate angles the display is composited from two
   * planes that depth-blend against the chassis, so content there is
   * display-only and stateful screen content is best kept simple.
   */
  openAngle?: boolean | number
  /**
   * `landscape` lays the device on its side and swaps the virtual display to
   * H×W with upright content - exactly like rotating the real device.
   */
  orientation?: 'portrait' | 'landscape'
  /**
   * Draw the system status bar across the top of the screen: `true` for the
   * platform's defaults - One UI's on a Galaxy Z Fold, iOS's on the iPhone
   * Duo - or an object to set the clock, the meters and the ink. It is
   * placed from this device's own punch hole - including the inner display's
   * off-centre one - so it clears the camera on every face, and falls back
   * to a plain strip on a face with no camera hole at all (the Duo's inner
   * display).
   */
  statusBar?: StatusBarOption
  /**
   * Back panel color, and the whole finish: the metal frame, buttons, hinge
   * and camera rings follow from it. A retail colorway id from the family's
   * catalog (`FOLD_COLORWAYS`, `IPHONE_DUO_COLORWAYS`) gets that model's
   * measured rail; any other CSS color gets one derived from it (see
   * `railColor`). A colorway id wins over a CSS color of the same name - pass
   * hex if you meant the CSS one.
   */
  color?: string
  /**
   * CSS pixel width of the active display in the current orientation. Height
   * follows the panel aspect. Defaults to the device's logical resolution for
   * whichever screen is lit (see `coverScreenUntil`).
   */
  resolution?: number
  /**
   * The hinge angle, in degrees, up to which the cover display stays lit as
   * the device opens; above it your content moves to the inner display.
   * Defaults to 30 (`COVER_SCREEN_UNTIL`), where Android's reference foldable
   * swaps. `90` keeps the cover on like the tent posture does, propped half
   * open; `0` swaps the moment the hinge moves, as a Pixel does in the hand.
   * Shut, the cover is always lit, and flat, the inner display.
   */
  coverScreenUntil?: number
}

/** The shared implementation's props: the spec to build and the catalog its `color` resolves against. */
interface FoldBodyProps extends FoldCommonProps {
  spec: FoldSpec
  catalog: Colorway[]
}

/** An extruded rounded-rect slab with a soft edge bevel (the flat-open body). */
function slabGeometry(width: number, height: number, radius: number, depth: number, bevel: number) {
  const shape = roundedRectShape(width - bevel * 2, height - bevel * 2, radius - bevel)
  const core = depth - bevel * 2
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: core,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 16,
  })
  g.translate(0, 0, -core / 2)
  return g
}

/**
 * How close to the crease a half's back plate stops: half the width of the
 * dark seam the flat-open back shows between its two halves. Each half draws
 * its own side of that seam along its hinge end, so the flat pose's seam is
 * simply the two meeting - and as the book folds they part round the spine,
 * where they read as the shadowed lip of each back cover.
 */
const SEAM_HALF = 0.008

/**
 * A plate lying on one half of the body - a back panel, a pane of cover glass
 * - inset `margin` from the three free edges and `foldMargin` from the fold
 * line, which it runs into with square corners. The free corners are
 * `roundedRectShape`'s own, so two of these meeting at the fold line trace
 * exactly the outline one plate over the whole body would. `fold` says which
 * side of the plate the fold line is on, in the plate's own frame; the
 * geometry is offset so the mesh sits at the half's centre.
 */
function halfPlate(
  body: { width: number; height: number; radius: number },
  margin: number,
  foldMargin: number,
  fold: -1 | 1
): THREE.ShapeGeometry {
  const width = body.width / 2 - margin - foldMargin
  const height = body.height - margin * 2
  // The radius the whole-body plate would take, so the free corners match it.
  const r = Math.min(Math.max(0.02, body.radius - margin), width, height / 2)
  const rl = fold === -1 ? 0 : r
  const rr = fold === 1 ? 0 : r
  const x = -width / 2
  const y = -height / 2
  const shape = new THREE.Shape()
  shape.moveTo(x + rl, y)
  shape.lineTo(x + width - rr, y)
  if (rr) shape.quadraticCurveTo(x + width, y, x + width, y + rr)
  shape.lineTo(x + width, y + height - rr)
  if (rr) shape.quadraticCurveTo(x + width, y + height, x + width - rr, y + height)
  shape.lineTo(x + rl, y + height)
  if (rl) shape.quadraticCurveTo(x, y + height, x, y + height - rl)
  shape.lineTo(x, y + rl)
  if (rl) shape.quadraticCurveTo(x, y, x + rl, y)
  const g = new THREE.ShapeGeometry(shape, 16)
  g.translate((fold * (margin - foldMargin)) / 2, 0, 0)
  return g
}

/**
 * The book-fold both brands are built from - a device machined out of its
 * `FoldSpec`, whichever name is on it. One device, two form factors: the
 * unfolded tablet (big inner display) and the folded candy-bar - two stacked
 * slabs with the real crevice of air between them - switched with the
 * `openAngle` prop. The spec's `brand` decides the rest: a Samsung wears the
 * SAMSUNG emboss on its spine, its two-tone camera plateau and One UI's
 * status bar; an Apple the badge on the camera half's back, the iPhone's
 * glossy camera pill, a mirror-polished frame and iOS's status bar. No 3D
 * asset files are loaded - the whole device is generated from geometry at
 * runtime.
 */
function FoldBody({
  children,
  spec,
  catalog,
  openAngle = true,
  orientation = 'portrait',
  color: colorProp,
  surfaceBackground = '#000000',
  resolution,
  surfaceStyle,
  statusBar,
  coverScreenUntil,
  ...groupProps
}: FoldBodyProps) {
  const screenSlot = collectSlots(children, SCREEN_REGIONS).screen
  const brand = spec.brand ?? 'samsung'
  // `color` doubles as the colorway selector: a catalog id resolves to
  // that retail finish, anything else is passed through as a raw CSS
  // color. Ids win over same-named CSS colors - pass hex for those.
  const retail = findColorway(catalog, colorProp)
  const color = retail?.color ?? colorProp ?? '#3a3d42'
  const frameColor = retail?.frameColor ?? railColor(color)
  // Resolve the pose: an explicit fold angle wins over the boolean.
  const angle = foldOpenAngle(openAngle)
  /*
   * Two ways to draw it, and only one seam between them.
   *
   * Everything short of flat is ONE rig - two halves turning about the crease
   * and the spine between their backs (see `hingeSpine`) - from fully shut to
   * a hair under flat. Shut is not a pose of its own: it is that rig at 0
   * degrees. It used to be a second model, built from its own measurements,
   * and the two did not agree: the spine stood 3.5 mm further out a
   * half-degree into the swing than it had shut, the folded bar's corners
   * went from round to square, and the cover screen was torn down and
   * rebuilt on the way.
   *
   * Only a genuinely flat hinge takes the other, single-screen path.
   *
   * That one used to claim everything from 177 degrees up, and three degrees
   * is enough to feel: the device snapped fully flat as the slider crossed 177
   * and stayed there for the rest of the travel, so dragging near the top read
   * as a magnet pulling to 180. Worse, each crossing swapped one DeviceScreen
   * for two (and back), tearing down the live DOM and flashing its content -
   * and around the boundary a drag crosses it repeatedly.
   *
   * The flat path is still worth keeping for flat: splitting the display into
   * two half-panes leaves a hard seam down the crease, where one continuous
   * screen draws the soft gradient the real inner display has. So the band is
   * now narrow enough to be invisible (a twentieth of a degree) rather than
   * gone: `openAngle` / `openAngle={true}` / `openAngle={180}` all render the seamless flat
   * pose, and every angle below it renders its own pose through the hinged
   * rig with no mode change along the way. The flat pose is drawn to be that
   * rig's own limit - the same plates, the same seam down the back - so the
   * one swap left shows nothing but the screen.
   */
  const flat = angle >= FLAT_EPSILON
  const cam = spec.rearCamera
  const { body } = spec.open
  /*
   * Which display is lit is not the pose. Opening from shut, the cover
   * display stays lit up to `coverScreenUntil` degrees and the inner one
   * takes over after, so one of them is lit at every angle - the cover used
   * to go dark at the first half-degree, while the inner display it lit
   * instead was still facing itself, and the device read as switched off
   * for the first third of every opening. Everything about the screen -
   * size, resolution, camera hole, status bar - follows the lit face.
   */
  const coverLit = coverScreenLit(angle, coverScreenUntil)
  const face = coverLit ? spec.closed : spec.open
  const { display } = face
  const landscape = orientation === 'landscape'
  const aspect = display.height / display.width
  const res = resolution ?? Math.round(face.resolution * (landscape ? aspect : 1))
  // Screens occlude against EVERY registered body, this device's own panels
  // included. Excluding them (to stop a grazing corner ray blacking out a
  // visible display) meant a panel's DOM screen composited straight over its
  // own chassis - the flex pose's far display piercing through the near one,
  // and the main display showing through the device's own back. The occlusion
  // test now needs a MAJORITY of its samples blocked before it hides, which
  // handles the grazing case without giving up self-occlusion.

  // The inner display stands this far above the chassis face, so the two
  // halves' displays meet on the crease and the shut stack keeps its air.
  const lift = foldDisplayStandoff(spec)

  // Machined chassis geometry, built ONLY for the path being rendered. Each
  // `cutGeometry` is a CSG boolean over a tessellated slab - easily the most
  // expensive thing this component does - and the two paths never share a
  // shell, so building both on every mount paid that cost twice over for a
  // shell that never reaches the scene graph. The hinged shell is the same at
  // every angle, so a swing never rebuilds it. One memo keyed on `flat` also
  // gives the render branches below a discriminated union to narrow on.
  const shell = React.useMemo(() => {
    const b = spec.open.body
    const edge = spec.bottomEdge
    const bottom = -b.height / 2
    // What lies on the two halves is the same in both paths: the back panel
    // and the cover glass each stop at the seam down the middle, and the
    // inner glass runs into the crease.
    const plates = {
      // The camera half's back panel, and the glass over the whole outer
      // face of the cover half - both drawn turned to face backward, so the
      // fold line is on the other side of the shape.
      back: halfPlate(b, 0.025, SEAM_HALF, 1),
      cover: halfPlate(b, 0.015, SEAM_HALF, -1),
      // the black ring around the inner display, on the left and right halves
      glassLeft: halfPlate(b, 0.015, 0, 1),
      glassRight: halfPlate(b, 0.015, 0, -1),
    }

    if (flat) {
      return {
        mode: 'open' as const,
        ...plates,
        body: cutGeometry(slabGeometry(b.width, b.height, b.radius, b.depth, b.bevel), [
          stadiumCutter(edge.usb.width, edge.usb.height, USB_CUT_DEPTH).translate(edge.usb.x, bottom, 0),
          ...edge.speakers.map((sp) =>
            stadiumCutter(sp.width, sp.height, 0.06).translate(sp.x, bottom, 0)
          ),
          ...(edge.mics ?? []).map(({ x, r }) => holeCutter(r, 0.05).translate(x, bottom, 0)),
        ]),
      }
    }

    // Hinged panels: the open slab split at the hinge line, each half
    // machining only the bottom-edge openings that live on its side. The
    // fold-side corners are nearly square (the display bends there - the real
    // rails run straight into the hinge, which is why the unfolded device's
    // top edge is one line), so the two panels stay tight at the crease
    // instead of opening rounded-corner gaps - and the folded bar's hinge
    // corners are square for the same reason.
    const hw = b.width / 2
    const cutters = (side: -1 | 1) => {
      const localX = (x: number) => x - (side * hw) / 2
      const items: THREE.BufferGeometry[] = []
      if (Math.sign(edge.usb.x) === side)
        items.push(stadiumCutter(edge.usb.width, edge.usb.height, USB_CUT_DEPTH).translate(localX(edge.usb.x), bottom, 0))
      for (const sp of edge.speakers)
        if (Math.sign(sp.x) === side)
          items.push(stadiumCutter(sp.width, sp.height, 0.06).translate(localX(sp.x), bottom, 0))
      for (const m of edge.mics ?? [])
        if (Math.sign(m.x) === side)
          items.push(holeCutter(m.r, 0.05).translate(localX(m.x), bottom, 0))
      return items
    }
    const panelSlab = (foldSide: -1 | 1) => {
      const rFree = b.radius - b.bevel
      const rFold = 0.008
      const corners =
        foldSide === 1
          ? { tl: rFree, tr: rFold, br: rFold, bl: rFree }
          : { tl: rFold, tr: rFree, br: rFree, bl: rFold }
      // Bezier corners, as the flat slab's are: these halves have to be that
      // slab cut in two, or every free corner changes shape at flat.
      const shape = bezierRoundedRectShape(hw - b.bevel * 2, b.height - b.bevel * 2, corners)
      const core = b.depth - b.bevel * 2
      const g = new THREE.ExtrudeGeometry(shape, {
        depth: core,
        bevelEnabled: true,
        bevelThickness: b.bevel,
        bevelSize: b.bevel,
        bevelSegments: 4,
        curveSegments: 16,
      })
      g.translate(0, 0, -core / 2)
      return g
    }
    return {
      mode: 'hinged' as const,
      ...plates,
      left: cutGeometry(panelSlab(1), cutters(-1)),
      right: cutGeometry(panelSlab(-1), cutters(1)),
    }
  }, [flat, spec.open.body, spec.bottomEdge])
  React.useEffect(
    () => () => {
      for (const value of Object.values(shell)) {
        if (value instanceof THREE.BufferGeometry) value.dispose()
      }
    },
    [shell]
  )

  // Camera pedestal: the light plateau plate with the dark pill on top of it.
  const pillGeometry = (part: { width: number; height: number; radius: number; raise: number }) => {
    const bevel = 0.014
    const shape = roundedRectShape(part.width - bevel * 2, part.height - bevel * 2, part.radius - bevel)
    return smoothShaded(
      new THREE.ExtrudeGeometry(shape, {
        depth: Math.max(0.008, part.raise - bevel),
        bevelEnabled: true,
        bevelThickness: bevel,
        bevelSize: bevel,
        bevelSegments: 3,
        curveSegments: 16,
      })
    )
  }
  const plateauGeometry = React.useMemo(() => pillGeometry(cam.plateau), [cam.plateau])
  const islandGeometry = React.useMemo(() => (cam.island ? pillGeometry(cam.island) : null), [cam.island])
  // The mic grille pill on the plateau's face (the Duo).
  const micGeometry = React.useMemo(
    () => (cam.mic ? new THREE.ShapeGeometry(roundedRectShape(cam.mic.width, cam.mic.height, cam.mic.height / 2), 12) : null),
    [cam.mic]
  )

  // The cover display's own panel, a shade off the glass around it, on the
  // outer face of the cover half - what shows there while the cover is not
  // the lit one. Drawn mirrored (it faces backward), so its hinge-side corners
  // are given on the shape's left and land against the spine.
  const coverPanelGeometry = React.useMemo(() => {
    const c = spec.closed
    const r = c.display.radius + 0.02
    const rh = (c.display.hingeRadius ?? c.display.radius) + 0.02
    return new THREE.ShapeGeometry(
      mixedRoundedRectShape(c.display.width + 0.03, c.display.height + 0.06, { tl: rh, tr: r, br: r, bl: rh }),
      16
    )
  }, [spec.closed])
  React.useEffect(() => () => coverPanelGeometry.dispose(), [coverPanelGeometry])

  // Where the cover screen sits on the back of the unfolded body: on the
  // cover half, inset from the body's left edge by half the folded
  // width, shifted by the display's own offset - which points at the free
  // edge, the far left of the open back, so it is negated here along with
  // the punch camera's offset, mirrored from the cover-screen spec.
  const coverBackX = (spec.open.body.width - spec.closed.body.width) / 2
  const coverDisplayX = -(spec.closed.display.offsetX ?? 0)
  const coverPunchX = coverDisplayX - (spec.closed.punchHole.offsetX ?? 0)
  const coverPunchY = spec.closed.display.height / 2 - spec.closed.punchHole.offsetY
  const coverPunchR = spec.closed.punchHole.radius

  // The vertical SAMSUNG emboss on the hinge spine - vector geometry from the
  // SVG. The iPhone Duo's spine is bare titanium and carries none.
  const emboss = spec.hinge.emboss
  const spineLogoGeometry = React.useMemo(
    () => (emboss ? createLogoGeometry('samsung', emboss.length, emboss.length * 0.155) : null),
    [emboss]
  )
  // The Apple badge on the camera half's back (iPhone Duo): the same
  // tone-on-tone glossy inlay the slab iPhones carry - a touch darker than
  // the glass, glinting lighter only as it catches light.
  const backLogoGeometry = React.useMemo(
    () => (spec.logo ? createLogoGeometry('apple', spec.logo.width, spec.logo.height) : null),
    [spec.logo]
  )
  const backLogoColor = React.useMemo(
    () => `#${new THREE.Color(color).lerp(new THREE.Color('#000000'), 0.15).getHexString()}`,
    [color]
  )

  React.useEffect(() => {
    return () => {
      plateauGeometry.dispose()
      islandGeometry?.dispose()
      micGeometry?.dispose()
      spineLogoGeometry?.dispose()
      backLogoGeometry?.dispose()
    }
  }, [
    plateauGeometry,
    islandGeometry,
    micGeometry,
    spineLogoGeometry,
    backLogoGeometry,
  ])

  // CSS px per world unit for display overlays.
  const pxPerUnit = res / (landscape ? display.height : display.width)
  const px = (units: number) => units * pxPerUnit

  // The front camera on the face being drawn. The cover screen always has a
  // hole; the inner display may not - the iPhone Duo's inner camera sits
  // under the panel, so there is nothing to draw and nothing for the status
  // bar to clear.
  const hole = coverLit ? spec.closed.punchHole : spec.open.punchHole
  const holeX = (coverLit ? spec.closed.punchHole.offsetX : spec.open.punchHole?.offsetX) ?? 0
  const holeOffsetY = hole?.offsetY ?? 0
  const holeR = hole?.radius ?? 0

  // Samsung's Armor Aluminum is a satin finish; the Duo's grade 5 titanium is
  // mirror-polished, the one finish Apple calls out on the enclosure.
  const backMaterial = (
    <meshPhysicalMaterial color={color} metalness={0.3} roughness={0.34} clearcoat={0.8} clearcoatRoughness={0.3} />
  )
  const glassMaterial = <meshPhysicalMaterial color="#040507" metalness={0.1} roughness={0.09} clearcoat={1} />
  const chassisMaterial = (
    <meshPhysicalMaterial
      color={frameColor}
      metalness={brand === 'apple' ? 0.92 : 0.85}
      roughness={brand === 'apple' ? 0.14 : 0.32}
    />
  )

  const spineLogoMaterial = (strength: number) => (
    <meshPhysicalMaterial
      transparent
      opacity={0.45 * strength}
      color="#3c4046"
      metalness={0.7}
      roughness={0.35}
      polygonOffset
      polygonOffsetFactor={-1}
    />
  )

  // Camera cluster on a back face at `backZ` (local to its slab/body group).
  const cameraCluster = (backZ: number) => (
    <>
      <mesh
        geometry={plateauGeometry}
        rotation-y={Math.PI}
        position={[cam.plateau.x, cam.plateau.y, backZ - 0.002]}
      >
        <meshPhysicalMaterial color={color} metalness={0.4} roughness={0.32} clearcoat={0.8} />
      </mesh>
      {/* the lens housing matches the body color on the real device - an
          anodized boss, not a black plate (only the lens glass is dark) */}
      {cam.island && islandGeometry && (
        <mesh
          geometry={islandGeometry}
          rotation-y={Math.PI}
          position={[cam.island.x, cam.island.y, backZ - cam.plateau.raise]}
        >
          <meshPhysicalMaterial color={color} metalness={0.4} roughness={0.32} clearcoat={0.8} />
        </mesh>
      )}
      {cam.rings.map(({ x, y, r, pupil, glint }, i) => (
        <group
          key={i}
          position={[
            x ?? cam.island?.x ?? cam.plateau.x,
            y,
            backZ - cam.plateau.raise - (cam.island?.raise ?? 0),
          ]}
        >
          <LensRing
            r={r}
            proud={cam.ringProud ?? 0.028}
            seat={0.03}
            frameColor={frameColor}
            pupil={pupil}
            collar={cam.ringCollar}
            step={cam.ringStep}
            glint={glint}
            sealed={brand === 'apple'}
          />
        </group>
      ))}
      {/* the mic grille pill on the plateau's face (the Duo) */}
      {cam.mic && micGeometry && (
        <mesh
          geometry={micGeometry}
          rotation-y={Math.PI}
          position={[cam.mic.x, cam.mic.y, backZ - cam.plateau.raise - 0.0015]}
        >
          <meshStandardMaterial color="#3a3c40" metalness={0.5} roughness={0.55} />
        </mesh>
      )}
      {/* the LED flash window, seated on the back beside the plateau - or up
          on the plateau's face where the spec puts it there */}
      <group
        position={[
          cam.flash.x,
          cam.flash.y,
          cam.flash.seat === 'plateau' ? backZ - cam.plateau.raise - 0.0015 : backZ - 0.002,
        ]}
      >
        <FlashModule r={cam.flash.r} fresnel={brand === 'apple'} />
      </group>
    </>
  )

  // The brand badge on the camera half's back, given that back face's z and
  // the badge's centre in the pose's own back-face coordinates.
  const backLogo = (backZ: number, at: { x: number; y: number }) =>
    backLogoGeometry && (
      <mesh geometry={backLogoGeometry} rotation-y={Math.PI} position={[at.x, at.y, backZ - 0.0085]}>
        <meshPhysicalMaterial
          color={backLogoColor}
          metalness={0.55}
          roughness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={1.2}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>
    )

  // Side keys on the camera half's free rail.
  const sideKeys = (railX: number) =>
    spec.buttons.map((key, i) =>
      key.edge === 'top' ? null : (
        <SideKey
          key={i}
          side={1}
          railX={railX}
          y={key.y}
          length={key.length}
          thickness={spec.buttonProfile.thickness}
          protrusion={spec.buttonProfile.protrusion}
          color={frameColor}
        />
      )
    )

  // Keys on the camera half's top edge (the Duo's volume keys): the same
  // pill, turned a quarter to stand on the top rail. `shift` carries the
  // spec's x, measured from the folded bar's centre line, across onto the
  // camera half. A quarter
  // turn about z maps the key's rail axis onto -x, hence the negated x.
  const topKeys = (shift: number) =>
    spec.buttons.map((key, i) =>
      key.edge !== 'top' ? null : (
        <group key={i} rotation-z={Math.PI / 2}>
          <SideKey
            side={1}
            railX={body.height / 2}
            y={-(key.x + shift)}
            length={key.length}
            thickness={spec.buttonProfile.thickness}
            protrusion={spec.buttonProfile.protrusion}
            color={frameColor}
          />
        </group>
      )
    )

  // Antenna seam inserts on both rails of the flat body.
  const antennaSeams = (depth: number) =>
    spec.antennaLines?.map((y, i) => (
      <React.Fragment key={i}>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * (body.width / 2 - 0.005), y, 0]}>
            <boxGeometry args={[0.012, 0.026, depth * 0.8]} />
            <meshStandardMaterial color="#22262c" transparent opacity={0.35} roughness={0.65} />
          </mesh>
        ))}
      </React.Fragment>
    ))

  // The inner display's soft center crease and punch-hole camera, positioned
  // in the full virtual-display coordinate space - shared by the flat-open
  // screen (via the overlay slot) and the flex pose (inside each half's
  // clipped full-size wrapper, where the same coordinates apply).
  const creaseOverlay = (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        ...(landscape
          ? { left: 0, right: 0, top: '50%', height: px(0.06), transform: 'translateY(-50%)' }
          : { top: 0, bottom: 0, left: '50%', width: px(0.06), transform: 'translateX(-50%)' }),
        background: landscape
          ? 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.14) 50%, rgba(0,0,0,0) 100%)'
          : 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.14) 50%, rgba(0,0,0,0) 100%)',
        pointerEvents: 'none',
        zIndex: 2147483646,
      }}
    />
  )
  /*
   * The brand's system on both faces, but the inner display is a tablet and
   * the cover is a phone, and both systems set them at different sizes. The
   * hole is off-centre on the Galaxy's inner display, so its signed offset is
   * passed through and the bar clears it rather than assuming a centred
   * camera; a face with no hole (the Duo's inner display) gets the plain
   * strip.
   */
  const statusBarPlacement = {
    platform: brand === 'apple' ? 'ios' : 'oneui',
    formFactor: coverLit ? 'phone' : 'tablet',
    width: res,
    corner: px(display.radius),
    cutout:
      landscape || !hole
        ? undefined
        : { halfWidth: px(holeR), centerY: px(holeOffsetY), offsetX: px(holeX) },
  } satisfies StatusBarPlacement
  const statusBarOverlay = renderStatusBar(statusBar, statusBarPlacement)
  /* The strip the bar costs the content on whichever face is being drawn. */
  const safeTop = statusBarSafeAreaTop(statusBar, statusBarPlacement)
  const punchHoleOverlay = hole && (
    <div
      aria-hidden
      data-mockup-cutout=""
      style={{
        position: 'absolute',
        ...(landscape
          ? {
              left: px(holeOffsetY - holeR),
              top: `calc(50% - ${px(holeX)}px)`,
              transform: 'translateY(-50%)',
            }
          : {
              top: px(holeOffsetY - holeR),
              left: `calc(50% + ${px(holeX)}px)`,
              transform: 'translateX(-50%)',
            }),
        width: px(holeR * 2),
        height: px(holeR * 2),
        borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 38%, #1b2436 0%, #05060a 55%, #000 100%)',
        boxShadow: '0 0 0 1.5px rgba(255, 255, 255, 0.05)',
        pointerEvents: 'none',
        zIndex: 2147483647,
      }}
    />
  )

  // The cover display may round its hinge-side corners differently and sit
  // off the body's centre line; the inner display is centred and uniform.
  const closedDisplay = spec.closed.display
  const screenRadius: number | [number, number, number, number] =
    !coverLit || closedDisplay.hingeRadius === undefined
      ? display.radius
      : [closedDisplay.hingeRadius, display.radius, display.radius, closedDisplay.hingeRadius]
  const screenX = coverLit ? (closedDisplay.offsetX ?? 0) : 0
  // One whole display on one plane: the inner display of the flat pose, and
  // the cover display while that is the lit one.
  const screen = (surfaceZ: number) => (
    <DeviceScreen
      width={landscape ? display.height : display.width}
      height={landscape ? display.width : display.height}
      radius={screenRadius}
      position={[screenX, 0, surfaceZ]}
      rotation={landscape ? [0, 0, -Math.PI / 2] : [0, 0, 0]}
      {...resolveSurface(screenSlot, {
        surfaceBackground,
        resolution: res,
        surfaceStyle,
      })}
      safeAreaTop={safeTop}
      overlay={
        <>
          {!coverLit && creaseOverlay}
          {punchHoleOverlay}
          {statusBarOverlay}
        </>
      }
    >
      {screenSlot?.children}
    </DeviceScreen>
  )

  // What the outer face of the cover half carries, in the unfolded body's
  // coordinates on a back face at `backZ`: the cover display's panel under
  // its glass, and on it either the cover screen, turned to face out of the
  // back while it is the lit one, or the punch camera of a dark one. A lit
  // screen draws its own camera hole over the content, as every other
  // display here does, so the two never show together: with both, the glossy
  // lens stood a hair proud of the lit screen and read as a grey disc on it.
  const coverFace = (backZ: number) => (
    <group position={[-coverBackX, 0, 0]}>
      <mesh geometry={coverPanelGeometry} rotation-y={Math.PI} position={[coverDisplayX, 0, backZ - 0.003]}>
        <meshPhysicalMaterial color="#0a0b0f" metalness={0.15} roughness={0.14} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
      {coverLit ? (
        <group position-z={backZ - 0.006} rotation-y={Math.PI}>
          {screen(0)}
        </group>
      ) : (
        // its punch camera, where the cover panel's spec puts it
        <mesh rotation-x={Math.PI / 2} position={[coverPunchX, coverPunchY, backZ - 0.005]}>
          <cylinderGeometry args={[coverPunchR, coverPunchR, 0.004, 20]} />
          <meshPhysicalMaterial color="#1a2130" metalness={0.4} roughness={0.2} clearcoat={1} />
        </mesh>
      )}
    </group>
  )

  if (shell.mode === 'hinged') {
    // Each panel pivots around a shared virtual axis at the fold line, ON the
    // inner display's surface: the two half-screens then meet exactly at the
    // crease at every angle - nearly shut included - instead of
    // interpenetrating (crossed DOM planes glitch near 0°), and both back
    // faces stay a constant `reach` from it.
    const b = body
    const hw = b.width / 2
    const pz = b.depth / 2 + lift
    // The Armor FlexHinge spine between the backs: a barrel of that same
    // radius. Flat, it is centred on the crease and tangent to both back
    // shells; as the book shuts the shells close around it, so its axis
    // slides in between the halves and only its crown is left standing proud
    // of the folded bar - see `hingeSpine` for the motion.
    const spine = hingeSpine(angle, foldHingeReach(spec), spec.hinge.overhang)
    const alpha = spine.fold
    // The panels are built folding symmetrically, each `alpha` off flat; the
    // whole assembly is then turned by `alpha` about the crease, so the
    // camera half never moves - it lies exactly where the flat-open pose puts
    // it at every angle - and the cover half swings the full fold about the
    // crease, through the space in front of the inner display, the way a
    // book's cover opens, until it lies shut on the camera half.
    // Run the spine and its caps essentially edge to edge - the panels'
    // fold-side corners are square, so a shorter spine would show the
    // V's interior past its ends at shallow angles (the detached-pill read).
    const spineH = b.height - 0.03
    const capT = 0.05
    // The barrel is drawn a little past where it meets each half, so its
    // edges are buried in the shells rather than left on their bevels.
    const arc = spine.halfArc + HINGE_SEAL * Math.sin(alpha)
    // The vertical SAMSUNG engraving fits only while the exposed band is
    // wider than the wordmark; flatter than that the shells have closed over
    // it. It comes and goes over the last of that width rather than at once.
    const embossShown = emboss
      ? Math.max(0, Math.min(1, (spine.width - (emboss.length * 0.155 + 0.06)) / 0.04))
      : 0
    // End caps: the fold's own cross-section, from the crease out to the
    // barrel (shape v runs toward the back; world z = pz - v).
    const capSection = hingeCapShape(spine)
    // One half's side of the seam the flat-open back shows down its middle:
    // a near-black core along the hinge end and a soft shadowed shoulder
    // beside it, on a back face whose fold line is on the `fold` side.
    const seamEdge = (fold: -1 | 1) => (
      <>
        <mesh position={[fold * (hw / 2 - SEAM_HALF / 2), 0, -b.depth / 2 - 0.0045]} rotation-y={Math.PI}>
          <planeGeometry args={[SEAM_HALF, b.height]} />
          <meshStandardMaterial color="#07080b" metalness={0.1} roughness={0.7} />
        </mesh>
        <mesh position={[fold * (hw / 2 - 0.013), 0, -b.depth / 2 - 0.0045]} rotation-y={Math.PI}>
          <planeGeometry args={[0.01, b.height]} />
          <meshStandardMaterial color="#0a0c10" transparent opacity={0.3} roughness={0.7} />
        </mesh>
      </>
    )
    const r = display.radius
    const halfScreen = (side: 'left' | 'right') => {
      const left = side === 'left'
      const radius: [number, number, number, number] = landscape
        ? left
          ? [0, 0, r, r]
          : [r, r, 0, 0]
        : left
          ? [r, 0, 0, r]
          : [0, r, r, 0]
      // Each pane overhangs the fold line by CREASE_OVERLAP (center shifted
      // half of it foldward), so the two planes - and their inset depth
      // masks - overlap across the crease instead of pairing their mask
      // insets into a dark seam.
      const localX = (left ? 1 : -1) * (hw / 2 - display.width / 4 + CREASE_OVERLAP / 2)
      // The half panes lean on the depth buffer harder than most screens: at
      // every intermediate hinge angle one half is PARTIALLY covered by the
      // other panel, which only per-pixel compositing can resolve.
      return (
        <DeviceScreen
          width={landscape ? display.height : display.width / 2 + CREASE_OVERLAP}
          height={landscape ? display.width / 2 + CREASE_OVERLAP : display.height}
          radius={radius}
          position={[localX, 0, b.depth / 2 + lift]}
          rotation={landscape ? [0, 0, -Math.PI / 2] : [0, 0, 0]}
          {...resolveSurface(screenSlot, {
            surfaceBackground,
            // each half pane carries half the virtual display's width, plus
            // the overhang's pixels
            resolution: landscape ? res : (res * (display.width / 2 + CREASE_OVERLAP)) / display.width,
            surfaceStyle,
          })}
          safeAreaTop={safeTop}
          // Content windows onto the whole display; say so to useSurface().
          surface={{
            width: landscape ? display.height : display.width,
            height: landscape ? display.width : display.height,
            resolution: res,
          }}
        >
          {/* one full-size window onto the shared virtual display, offset so
              this pane shows its own half plus the overhang's continuation.
              Sized in px, not %, so the overhang doesn't skew the mapping.
              In landscape the device lies on its side: the LEFT half lands
              at the bottom of the upright content, so it windows the BOTTOM
              half - not the top, which briefly mirrored the content across
              the crease relative to the flat-open pose. */}
          <div
            style={{
              position: 'absolute',
              left: landscape || left ? 0 : -px(display.width / 2 - CREASE_OVERLAP),
              top: landscape && left ? -px(display.width / 2 - CREASE_OVERLAP) : 0,
              width: landscape ? '100%' : px(display.width),
              height: landscape ? px(display.width) : '100%',
            }}
          >
            {screenSlot?.children}
            {creaseOverlay}
            {punchHoleOverlay}
            {statusBarOverlay}
          </div>
        </DeviceScreen>
      )
    }

    return (
      <group {...groupProps}>
        <group key="hinged" rotation-z={landscape ? Math.PI / 2 : 0}>
          {/* turn the symmetric fold by `alpha` about the crease: the camera
              half holds still and the cover half swings */}
          <group position={[0, 0, pz]} rotation-y={alpha}>
          <group position={[0, 0, -pz]}>
          {/* left (cover-screen) panel folds toward the viewer */}
          <group position={[0, 0, pz]} rotation-y={alpha}>
            <group position={[-hw / 2, 0, -pz]}>
              <mesh geometry={shell.left}>
                {chassisMaterial}
              </mesh>
              {/* its whole outer face is the cover display's glass */}
              <mesh geometry={shell.cover} rotation-y={Math.PI} position-z={-b.depth / 2 - 0.002}>
                {glassMaterial}
              </mesh>
              <mesh geometry={shell.glassLeft} position-z={b.depth / 2 + 0.002}>
                {glassMaterial}
              </mesh>
              {seamEdge(1)}
              {/* body-coordinate details, shifted into this half's local frame */}
              <group position-x={hw / 2}>
                {coverFace(-b.depth / 2)}
                {/* bottom edge: the interiors of this half's machined cavities */}
                {spec.bottomEdge.speakers.filter((sp) => sp.x < 0).map((sp, i) => (
                  <EdgeSocket
                    key={i}
                    position={[sp.x, -b.height / 2, 0]}
                    width={sp.width}
                    height={sp.height}
                    depth={0.06}
                  />
                ))}
                {spec.bottomEdge.mics?.filter((m) => m.x < 0).map(({ x, r: mr }, i) => (
                  <EdgeSocket key={i} position={[x, -b.height / 2, 0]} r={mr} depth={0.05} lip={0.008} />
                ))}
                {spec.antennaLines?.map((y, i) => (
                  <mesh key={i} position={[-(b.width / 2 - 0.005), y, 0]}>
                    <boxGeometry args={[0.012, 0.026, b.depth * 0.8]} />
                    <meshStandardMaterial color="#22262c" transparent opacity={0.35} roughness={0.65} />
                  </mesh>
                ))}
              </group>
              {!coverLit && halfScreen('left')}
            </group>
          </group>

          {/* right (camera) panel folds the opposite way */}
          <group position={[0, 0, pz]} rotation-y={-alpha}>
            <group position={[hw / 2, 0, -pz]}>
              <mesh geometry={shell.right}>
                {chassisMaterial}
              </mesh>
              <mesh geometry={shell.back} rotation-y={Math.PI} position-z={-b.depth / 2 - 0.002}>
                {backMaterial}
              </mesh>
              <mesh geometry={shell.glassRight} position-z={b.depth / 2 + 0.002}>
                {glassMaterial}
              </mesh>
              {seamEdge(-1)}
              <group position-x={-hw / 2}>
                {cameraCluster(-b.depth / 2)}
                {spec.logo && backLogo(-b.depth / 2, spec.logo)}
                {sideKeys(b.width / 2)}
                {topKeys(coverBackX)}
                <UsbC
                  x={spec.bottomEdge.usb.x}
                  y={-b.height / 2}
                  width={spec.bottomEdge.usb.width}
                  height={spec.bottomEdge.usb.height}
                />
                {spec.bottomEdge.speakers.filter((sp) => sp.x > 0).map((sp, i) => (
                  <EdgeSocket
                    key={i}
                    position={[sp.x, -b.height / 2, 0]}
                    width={sp.width}
                    height={sp.height}
                    depth={0.06}
                  />
                ))}
                {spec.bottomEdge.mics?.filter((m) => m.x > 0).map(({ x, r: mr }, i) => (
                  <EdgeSocket key={i} position={[x, -b.height / 2, 0]} r={mr} depth={0.05} lip={0.008} />
                ))}
                {spec.antennaLines?.map((y, i) => (
                  <mesh key={i} position={[b.width / 2 - 0.005, y, 0]}>
                    <boxGeometry args={[0.012, 0.026, b.depth * 0.8]} />
                    <meshStandardMaterial color="#22262c" transparent opacity={0.35} roughness={0.65} />
                  </mesh>
                ))}
              </group>
              {!coverLit && halfScreen('right')}
            </group>
          </group>

          {/* the spine between the backs: a barrel whose exposed arc grows as
              the book closes and whose axis slides in between the halves as
              it does - plus end caps closing the V at the top and bottom
              edges, and the vertical SAMSUNG engraving while the band is
              wide enough to carry it */}
          <group position={[0, 0, pz]}>
            <mesh position-z={spine.inset}>
              <cylinderGeometry
                args={[spine.radius, spine.radius, spineH, 48, 1, true, Math.PI - arc, 2 * arc]}
              />
              <meshPhysicalMaterial
                color={frameColor}
                metalness={0.85}
                roughness={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
            {([1, -1] as const).map((s) => (
              <mesh
                key={s}
                position={[0, s === 1 ? spineH / 2 - capT : -spineH / 2, 0]}
                rotation-x={-Math.PI / 2}
              >
                <extrudeGeometry args={[capSection, { depth: capT, bevelEnabled: false, curveSegments: 24 }]} />
                <meshPhysicalMaterial color={frameColor} metalness={0.8} roughness={0.4} />
              </mesh>
            ))}
            {embossShown > 0 && spineLogoGeometry && (
              <mesh
                geometry={spineLogoGeometry}
                rotation={[0, Math.PI, Math.PI / 2]}
                position-z={-spine.crown - 0.002}
              >
                {spineLogoMaterial(embossShown)}
              </mesh>
            )}
          </group>
          </group>
          </group>
        </group>
      </group>
    )
  }

  const hw = body.width / 2
  return (
    <group {...groupProps}>
      <group key="open" rotation-z={landscape ? Math.PI / 2 : 0}>
        {/* chassis */}
        <mesh geometry={shell.body}>
          {chassisMaterial}
        </mesh>

        {/* back panel colorway, on the camera half */}
        <mesh geometry={shell.back} rotation-y={Math.PI} position={[hw / 2, 0, -body.depth / 2 - 0.002]}>
          {backMaterial}
        </mesh>
        {/* the cover display's glass, over the whole back of the cover half */}
        <mesh geometry={shell.cover} rotation-y={Math.PI} position={[-hw / 2, 0, -body.depth / 2 - 0.002]}>
          {glassMaterial}
        </mesh>

        {/* cover glass (the black ring around the active display) */}
        <mesh geometry={shell.glassLeft} position={[-hw / 2, 0, body.depth / 2 + 0.002]}>
          {glassMaterial}
        </mesh>
        <mesh geometry={shell.glassRight} position={[hw / 2, 0, body.depth / 2 + 0.002]}>
          {glassMaterial}
        </mesh>

        {/* hinge crevice: fully open the spine retracts flush - only a thin
            dark seam separates the two halves (retail photos), so no wide
            spine band and no wordmark here: a near-black core line with
            soft shadowed shoulders, top to bottom. Each hinged half carries
            its own side of this along its hinge end, so this is where the
            two arrive. */}
        <group position={[0, 0, -body.depth / 2 - 0.0045]} rotation-y={Math.PI}>
          <mesh>
            <planeGeometry args={[SEAM_HALF * 2, body.height]} />
            <meshStandardMaterial color="#07080b" metalness={0.1} roughness={0.7} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.013, 0, 0]}>
              <planeGeometry args={[0.01, body.height]} />
              <meshStandardMaterial color="#0a0c10" transparent opacity={0.3} roughness={0.7} />
            </mesh>
          ))}
        </group>

        {/* the cover display, dark, on the back of the left half */}
        {coverFace(-body.depth / 2)}

        {cameraCluster(-body.depth / 2)}
        {spec.logo && backLogo(-body.depth / 2, spec.logo)}
        {sideKeys(body.width / 2)}
        {topKeys(coverBackX)}
        {antennaSeams(body.depth)}

        {/* bottom edge: the machined cavities' interiors */}
        <UsbC
          x={spec.bottomEdge.usb.x}
          y={-body.height / 2}
          width={spec.bottomEdge.usb.width}
          height={spec.bottomEdge.usb.height}
        />
        {spec.bottomEdge.speakers.map((sp, i) => (
          <EdgeSocket
            key={i}
            position={[sp.x, -body.height / 2, 0]}
            width={sp.width}
            height={sp.height}
            depth={0.06}
          />
        ))}
        {spec.bottomEdge.mics?.map(({ x, r }, i) => (
          <EdgeSocket key={i} position={[x, -body.height / 2, 0]} r={r} depth={0.05} lip={0.008} />
        ))}

        {screen(body.depth / 2 + lift)}
      </group>
    </group>
  )
}
FoldBody.displayName = 'FoldBody'

/** The compound slots both book-folds share with their mockups. */
export const foldSlots = createSlots(SCREEN_REGIONS)

export interface FoldProps extends FoldCommonProps {
  /** Which Galaxy Z Fold device to render. */
  variant?: FoldVariant
}

/**
 * A procedurally built Samsung Galaxy Z Fold - the Z Fold 7, the wide Z Fold 8
 * or the Z Fold 8 Ultra, chosen with `variant`. One device, two form factors:
 * the unfolded tablet (big inner display) and the folded candy-bar - two
 * stacked slabs with the real crevice of air between them - switched with the
 * `openAngle` prop. No 3D asset files are loaded - the whole device is generated
 * from geometry at runtime.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
function FoldImpl({ variant = FOLD_DEFAULT_VARIANT, ...props }: FoldProps) {
  checkDeviceVariant('fold', variant, 'Fold')
  checkColorway(FOLD_COLORWAYS, variant, props.color, 'Fold')
  return <FoldBody spec={FOLD_VARIANTS[variant]} catalog={FOLD_COLORWAYS[variant]} {...props} />
}
FoldImpl.displayName = 'Fold'

export const Fold = Object.assign(FoldImpl, foldSlots)

export interface IPhoneDuoProps extends FoldCommonProps {
  /**
   * Which iPhone Duo to render: `duo` (the 2026 original - the default and
   * only model today).
   */
  variant?: IPhoneDuoVariant
}

/**
 * A procedurally built Apple iPhone Duo: the passport-shaped book-fold that
 * opens around a vertical hinge into a landscape 7.6" tablet with no camera
 * hole in its inner panel, and folds to a 5.4" cover screen with the
 * two-lens pill and the Apple badge on its back. Mirror-polished titanium
 * frame, bare hinge cover, Touch ID in the side button. It shares its
 * `openAngle` pose vocabulary - the two poses and every Flex angle between -
 * with `<Fold>`, and draws iOS's status bar rather than One UI's.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
function IPhoneDuoImpl({ variant = IPHONE_DUO_DEFAULT_VARIANT, ...props }: IPhoneDuoProps) {
  checkDeviceVariant('iphoneDuo', variant, 'IPhoneDuo')
  checkColorway(IPHONE_DUO_COLORWAYS, variant, props.color, 'IPhoneDuo')
  return (
    <FoldBody spec={IPHONE_DUO_VARIANTS[variant]} catalog={IPHONE_DUO_COLORWAYS[variant]} {...props} />
  )
}
IPhoneDuoImpl.displayName = 'IPhoneDuo'

export const IPhoneDuo = Object.assign(IPhoneDuoImpl, foldSlots)
