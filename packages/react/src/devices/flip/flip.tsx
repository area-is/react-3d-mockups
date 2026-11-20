import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import {
  FLIP_COLORWAYS,
  findColorway,
  foldOpenAngle,
  coverScreenLit,
  FLAT_EPSILON,
  railColor,
  FLIP_VARIANTS,
  FLIP_DEFAULT_VARIANT,
  SCREEN_REGIONS,
  flipDisplayStandoff,
  flipHingeReach,
  hingeSpine,
  type FlipVariant,
  roundedRectShape,
} from '../../core'
import { checkColorway, checkDeviceVariant } from '../../core/lifecycle'
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
  stadiumCutter,
  holeCutter,
  USB_CUT_DEPTH,
  CREASE_OVERLAP,
  HINGE_SEAL,
  hingeCapShape,
} from '../details'
import { collectSlots, createSlots, resolveSurface, type SurfaceProps } from '../../slots'

type GroupProps = ThreeElements['group']

export interface FlipProps extends Omit<GroupProps, 'children' | 'color'>, SurfaceProps {
  /**
   * Anything you want on the active display: React components, an <iframe>, a
   * <video>… Wrap in `<Flip.Screen>` to set per-screen surface props.
   */
  children?: React.ReactNode
  /** Which Galaxy Z Flip device to render. */
  variant?: FlipVariant
  /**
   * How far the clamshell is open, as a boolean for the two poses or a number
   * of degrees for anything between.
   *
   * `true` (default) renders the unfolded tall phone - your content fills the
   * 6.85" main display. `false` renders the folded compact - your content
   * fills the nearly-square cover display, with the two lens rings and
   * flash sitting on the glass beside it.
   *
   * A number (0 = shut, 180 = flat) renders the real Flex Mode pose: the lower
   * half holds still and the cover half swings open about the crease, the
   * Armor FlexHinge, whose glossy curved housing the two back shells close
   * around as the phone shuts, until only its crown caps the folded pair, and
   * your content bends across the fold - e.g. `openAngle={100}` for
   * the classic half-open standing pose. It is one motion from shut to flat:
   * `false` and `0` are the shut end of it, not a separate pose, so nothing
   * jumps as the hinge leaves 0 and a screen on the cover keeps its state
   * through it. Only the flat-open pose is drawn apart - as one seamless
   * screen - and it takes only a flat hinge. The crease is the one line that
   * never moves, so the open phone is centred on it and the folded one hangs
   * below it, hinge up - upside down from the way a shut Flip is usually held.
   * For that view, turn it a half-turn about z and lower it by its folded
   * height. At intermediate angles the
   * display is composited from two planes that depth-blend against the chassis,
   * so content there is display-only and stateful screen content is best kept
   * simple.
   */
  openAngle?: boolean | number
  /**
   * `landscape` lays the device on its side and swaps the virtual display to
   * H×W with upright content - exactly like rotating the real device.
   */
  orientation?: 'portrait' | 'landscape'
  /**
   * Draw the system status bar across the top of the main display: `true` for
   * the platform's defaults, or an object to set the clock, the meters and the
   * ink. The cover screen does not get one - a 4.1" flap runs One UI's cover
   * face, which has a clock of its own and no status bar.
   */
  statusBar?: StatusBarOption
  /**
   * Back glass / cover color, and the whole finish: the metal frame, buttons,
   * hinge band and camera rings follow from it. A retail colorway id from
   * `FLIP_COLORWAYS` gets that model's measured rail; any other CSS color gets
   * one derived from it (see `railColor`). A colorway id wins over a CSS color
   * of the same name - pass hex if you meant the CSS one.
   */
  color?: string
  /**
   * CSS pixel width of the active display in the current orientation. Height
   * follows the panel aspect. Defaults to the device's logical resolution for
   * whichever screen is lit (see `coverScreenUntil`).
   */
  resolution?: number
  /**
   * The hinge angle, in degrees, up to which the cover screen stays lit as the
   * phone opens; above it your content moves to the main display. Defaults to
   * 30 (`COVER_SCREEN_UNTIL`), where Android's reference foldable swaps; `90`
   * keeps the cover on through the half-open tent pose, `0` swaps the moment
   * the hinge moves. Shut, the cover is always lit, and flat, the main display.
   */
  coverScreenUntil?: number
}

/** An extruded rounded-rect slab with a soft edge bevel (one flip half / body). */
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

/** Cutters for the free edge's machining (USB-C, speaker slot, mic holes) at `edgeY`. */
function freeEdgeCutters(
  edge: { usb: { x: number; width: number; height: number }; speaker: { x: number; width: number; height: number }; mics: { x: number; r: number }[] },
  edgeY: number
): THREE.BufferGeometry[] {
  return [
    stadiumCutter(edge.usb.width, edge.usb.height, USB_CUT_DEPTH).translate(edge.usb.x, edgeY, 0),
    stadiumCutter(edge.speaker.width, edge.speaker.height, 0.06).translate(edge.speaker.x, edgeY, 0),
    ...edge.mics.map(({ x, r }) => holeCutter(r, 0.05).translate(x, edgeY, 0)),
  ]
}

/**
 * A procedurally built Samsung Galaxy Z Flip 7. One device, two form factors:
 * the unfolded tall phone (6.85" main display) and the folded compact whose
 * front is nearly all cover screen, switched with the `openAngle` prop. Detail
 * geometry (separate protruding lens rings, hinge band with its engraved wordmark, button
 * pills, ports) follows published specifications and product photography. No 3D asset
 * files are loaded - everything is generated from geometry at runtime.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
function FlipImpl({
  children,
  variant = FLIP_DEFAULT_VARIANT,
  openAngle = true,
  orientation = 'portrait',
  color: colorProp,
  surfaceBackground = '#000000',
  resolution,
  surfaceStyle,
  statusBar,
  coverScreenUntil,
  ...groupProps
}: FlipProps) {
  checkDeviceVariant('flip', variant, 'Flip')
  checkColorway(FLIP_COLORWAYS, variant, colorProp, 'Flip')
  const screenSlot = collectSlots(children, SCREEN_REGIONS).screen
  const spec = FLIP_VARIANTS[variant]
  // `color` doubles as the colorway selector: a catalog id resolves to
  // that retail finish, anything else is passed through as a raw CSS
  // color. Ids win over same-named CSS colors - pass hex for those.
  const retail = findColorway(FLIP_COLORWAYS[variant], colorProp)
  const color = retail?.color ?? colorProp ?? '#22252b'
  const frameColor = retail?.frameColor ?? railColor(color)
  // Resolve the pose: an explicit fold angle wins over the boolean.
  const angle = foldOpenAngle(openAngle)
  /*
   * Two ways to draw it, and only one seam between them.
   *
   * Everything short of flat is ONE rig - two halves turning about the crease
   * and the hinge housing between their backs (see `hingeSpine`) - from fully
   * shut to a hair under flat. Shut is not a pose of its own: it is that rig
   * at 0 degrees. It used to be a second model, and the two did not agree: a
   * half-degree into the swing the hinge stood 4.6 mm further out than it had
   * shut, the side keys, the SIM tray, the speaker and the mics were on the
   * opposite rails (the shut model was drawn hinge-down and turned over
   * without being mirrored), the lenses went from printed discs to hardware,
   * and the cover screen was torn down and rebuilt on the way.
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
   * screen has none. So the band is now narrow enough to be invisible (a
   * twentieth of a degree) rather than gone: `openAngle` / `openAngle={true}`
   * / `openAngle={180}` all render the seamless flat pose, and every angle
   * below it renders its own pose through the hinged rig with no mode change
   * along the way. The flat pose is drawn to be that rig's own limit - the
   * same panes, lip and groove across the back, and a crease shadow that has
   * faded to nothing by the time it arrives - so the one swap left shows
   * nothing.
   */
  const flat = angle >= FLAT_EPSILON
  // Which display is lit is not the pose: the cover screen stays lit through
  // the first part of the opening (`coverScreenUntil`), so one of the two is
  // lit at every angle - it used to go dark at the first half-degree, while
  // the main display lit instead still faced its own lower half.
  const coverLit = coverScreenLit(angle, coverScreenUntil)
  const state = coverLit ? spec.closed : spec.open
  const { display } = state
  const cam = spec.rearCamera
  const landscape = orientation === 'landscape'
  const aspect = display.height / display.width
  const res = resolution ?? Math.round(state.resolution * (landscape ? aspect : 1))
  // Screens occlude against EVERY registered body, this device's own halves
  // included - see the fold's matching note. Self-occlusion is what keeps a
  // half's display from painting through its own back in the flex pose, and
  // the occlusion test's majority rule keeps a grazing corner ray from
  // blacking out a display that is plainly in view.

  const openBody = spec.open.body
  const half = spec.closed.body
  // Cover-half center offset from the open body's center (+y = upper half).
  const halfOffsetY = openBody.height / 2 - half.height / 2

  // The main display stands this far above the chassis face, so the two
  // halves' displays meet on the crease and the shut stack keeps its air.
  const lift = flipDisplayStandoff(spec)

  // Machined chassis geometry, built ONLY for the path being rendered. Every
  // `cutGeometry` is a CSG boolean over a tessellated slab - the most
  // expensive work this component does - and the two paths share no shell, so
  // building both up front paid for one that never reached the scene graph.
  // The hinged shell is the same at every angle, so a swing never rebuilds
  // it. Keying one memo on `flat` also hands the render branches a
  // discriminated union to narrow on.
  const shell = React.useMemo(() => {
    if (flat) {
      // One slab with the free-edge kit machined out of its bottom edge.
      return {
        mode: 'open' as const,
        body: cutGeometry(
          slabGeometry(openBody.width, openBody.height, openBody.radius, openBody.depth, openBody.bevel),
          freeEdgeCutters(spec.bottomEdge, -openBody.height / 2)
        ),
      }
    }

    // Nearly square corners along a fold edge: the display bends there (the
    // real rails run straight into the hinge, which is why the unfolded
    // phone's sides are one line), so the halves stay tight at the crease
    // instead of opening rounded-corner gaps - and the folded pair's hinge
    // corners are square for the same reason.
    const halfSlab = (foldEdge: 'top' | 'bottom') => {
      const rFree = half.radius - half.bevel
      const rFold = 0.01
      const corners =
        foldEdge === 'bottom'
          ? { tl: rFree, tr: rFree, br: rFold, bl: rFold }
          : { tl: rFold, tr: rFold, br: rFree, bl: rFree }
      const shape = mixedRoundedRectShape(
        half.width - half.bevel * 2,
        half.height - half.bevel * 2,
        corners
      )
      const core = half.depth - half.bevel * 2
      const g = new THREE.ExtrudeGeometry(shape, {
        depth: core,
        bevelEnabled: true,
        bevelThickness: half.bevel,
        bevelSize: half.bevel,
        bevelSegments: 4,
        curveSegments: 16,
      })
      g.translate(0, 0, -core / 2)
      return g
    }

    // The lower half machines the free-edge kit into its own bottom edge.
    return {
      mode: 'hinged' as const,
      upper: halfSlab('bottom'),
      lower: cutGeometry(halfSlab('top'), freeEdgeCutters(spec.bottomEdge, -half.height / 2)),
    }
  }, [flat, openBody, half, spec.bottomEdge])
  React.useEffect(
    () => () => {
      for (const value of Object.values(shell)) {
        if (value instanceof THREE.BufferGeometry) value.dispose()
      }
    },
    [shell]
  )

  const coverGlassGeometry = React.useMemo(
    () =>
      new THREE.ShapeGeometry(
        roundedRectShape(spec.coverGlass.width, spec.coverGlass.height, spec.coverGlass.radius),
        16
      ),
    [spec.coverGlass]
  )

  // Back frame: the metal lip surrounding both glass panels, at the SAME
  // height as the panes. Without it the panes float proud of the chassis back
  // face, and past ~12° of tilt they project beyond the rounded-corner
  // silhouette (the dark panel visibly "grows outside" the body). With the
  // frame on the panes' own plane, the border occludes them at every angle -
  // exactly how the real glass sits in its surrounding lip.
  //
  // The flat body wears it as one piece; hinged, each half wears its own half
  // of it, cut square along the fold line, so the lip is there at every angle
  // rather than arriving with the flat pose.
  const backFrameGeometry = React.useMemo(() => {
    const pane = () =>
      roundedRectShape(spec.coverGlass.width, spec.coverGlass.height, spec.coverGlass.radius).getPoints(24)
    if (flat) {
      const outer = roundedRectShape(
        spec.open.body.width - 0.006,
        spec.open.body.height - 0.006,
        spec.open.body.radius - 0.003
      )
      const offsetY = spec.open.body.height / 2 - spec.closed.body.height / 2
      for (const cy of [offsetY, -offsetY]) {
        outer.holes.push(new THREE.Path(pane().map((p) => new THREE.Vector2(p.x, p.y + cy))))
      }
      return new THREE.ShapeGeometry(outer, 24)
    }
    // One half's, in that half's own frame with the fold line along its
    // bottom edge (the upper half; the lower half wears it turned over).
    const w = spec.open.body.width / 2 - 0.003
    const top = spec.closed.body.height / 2 - 0.003
    const bottom = -spec.closed.body.height / 2
    const r = spec.open.body.radius - 0.003
    const outer = new THREE.Shape()
    outer.moveTo(-w, bottom)
    outer.lineTo(w, bottom)
    outer.lineTo(w, top - r)
    outer.quadraticCurveTo(w, top, w - r, top)
    outer.lineTo(-w + r, top)
    outer.quadraticCurveTo(-w, top, -w, top - r)
    outer.lineTo(-w, bottom)
    outer.holes.push(new THREE.Path(pane()))
    return new THREE.ShapeGeometry(outer, 24)
  }, [flat, spec.open.body, spec.closed.body, spec.coverGlass])

  const hingeLogoGeometry = React.useMemo(
    () => createLogoGeometry('samsung', spec.hinge.emboss.length, spec.hinge.emboss.length * 0.155),
    [spec.hinge.emboss.length]
  )

  React.useEffect(() => {
    return () => {
      coverGlassGeometry.dispose()
      hingeLogoGeometry.dispose()
    }
  }, [coverGlassGeometry, hingeLogoGeometry])
  React.useEffect(() => () => backFrameGeometry.dispose(), [backFrameGeometry])

  // CSS px per world unit for display overlays.
  const pxPerUnit = res / (landscape ? display.height : display.width)
  const px = (units: number) => units * pxPerUnit

  // Maps a cover-display physical rect (center x,y + size, +y up) to CSS.
  const coverAt = (
    x: number,
    y: number,
    w: number,
    h: number,
    extra: React.CSSProperties
  ): React.CSSProperties => ({
    position: 'absolute',
    ...(landscape
      ? {
          left: `calc(50% - ${px(y) + px(h) / 2}px)`,
          top: `calc(50% - ${px(x) + px(w) / 2}px)`,
          width: px(h),
          height: px(w),
        }
      : {
          left: `calc(50% + ${px(x) - px(w) / 2}px)`,
          top: `calc(50% - ${px(y) + px(h) / 2}px)`,
          width: px(w),
          height: px(h),
        }),
    ...extra,
  })

  // The two separate lens rings + flash, in cover-half local coordinates -
  // each module rises straight from the cover glass with no plate joining
  // them, like the retail device. `sign` is +1 when the cluster faces the
  // viewer (closed front) and -1 on the open back.
  const cameraCluster = (sign: 1 | -1, surfaceZ: number) => (
    <group>
      {cam.rings.map(({ x, y, r, pupil }, i) => (
        <group key={i} position={[x, y, surfaceZ]} rotation-y={sign === 1 ? Math.PI : 0}>
          <LensRing r={r} proud={cam.raise + 0.016} seat={0.03} frameColor={frameColor} pupil={pupil} />
        </group>
      ))}
      {/* the LED flash window, flush on the cover glass beside the rings */}
      <group position={[cam.flash.x, cam.flash.y, surfaceZ]} rotation-y={sign === 1 ? Math.PI : 0}>
        <FlashModule r={cam.flash.r} />
      </group>
    </group>
  )

  // Side keys + SIM on the cover half's rails (half-local coordinates).
  const rails = (
    <group>
      {spec.buttons.map(({ y, length }, i) => (
        <SideKey
          key={i}
          side={1}
          railX={half.width / 2}
          y={y}
          length={length}
          thickness={spec.buttonProfile.thickness}
          protrusion={spec.buttonProfile.protrusion}
          color={frameColor}
        />
      ))}
      <RoundedBox
        args={[0.012, spec.sim.length, 0.074]}
        radius={0.005}
        position={[-half.width / 2 + 0.005, spec.sim.y, 0]}
      >
        <meshStandardMaterial color="#15181d" transparent opacity={0.35} roughness={0.5} />
      </RoundedBox>
    </group>
  )

  // Interiors for the free edge's machined cavities (the cavities themselves
  // are cut from the slab geometry): USB-C receptacle, speaker sleeve, mic
  // plugs. `edgeY` is that edge's y in the current pose.
  const freeEdgeKit = (edgeY: number) => {
    const inward: 1 | -1 = edgeY > 0 ? -1 : 1
    return (
      <group>
        <UsbC
          x={spec.bottomEdge.usb.x}
          y={edgeY}
          width={spec.bottomEdge.usb.width}
          height={spec.bottomEdge.usb.height}
          inward={inward}
        />
        <EdgeSocket
          position={[spec.bottomEdge.speaker.x, edgeY, 0]}
          width={spec.bottomEdge.speaker.width}
          height={spec.bottomEdge.speaker.height}
          depth={0.06}
          inward={inward}
        />
        {spec.bottomEdge.mics.map(({ x, r }, i) => (
          <EdgeSocket key={i} position={[x, edgeY, 0]} r={r} depth={0.05} lip={0.008} inward={inward} />
        ))}
      </group>
    )
  }

  const endSeams = (ys: number[], depth: number) =>
    ys.map((y, i) => (
      <React.Fragment key={i}>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * (openBody.width / 2 - 0.005), y, 0]}>
            <boxGeometry args={[0.012, 0.022, depth * 0.8]} />
            <meshStandardMaterial color="#22262c" transparent opacity={0.35} roughness={0.65} />
          </mesh>
        ))}
      </React.Fragment>
    ))

  // The main display's punch-hole camera - shared by the flat-open screen and
  // the flex pose's upper half (the hole rides the display's top edge, which
  // is that half's top edge too).
  const punchHoleOverlay = (
    <div
      aria-hidden
      data-mockup-cutout=""
      style={{
        position: 'absolute',
        ...(landscape
          ? {
              left: px(spec.open.punchHole.offsetY - spec.open.punchHole.radius),
              top: '50%',
              transform: 'translateY(-50%)',
            }
          : {
              top: px(spec.open.punchHole.offsetY - spec.open.punchHole.radius),
              left: '50%',
              transform: 'translateX(-50%)',
            }),
        width: px(spec.open.punchHole.radius * 2),
        height: px(spec.open.punchHole.radius * 2),
        borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 38%, #1b2436 0%, #05060a 55%, #000 100%)',
        boxShadow: '0 0 0 1.5px rgba(255, 255, 255, 0.05)',
        pointerEvents: 'none',
        zIndex: 2147483647,
      }}
    />
  )

  // The main display only. Folded, the front is the cover screen, which runs
  // One UI's cover face - a clock widget, no status bar - so there is nothing
  // to draw there.
  const statusBarPlacement = {
    platform: 'oneui',
    formFactor: 'phone',
    width: res,
    corner: px(display.radius),
    cutout: landscape
      ? undefined
      : {
          halfWidth: px(spec.open.punchHole.radius),
          centerY: px(spec.open.punchHole.offsetY),
          offsetX: 0,
        },
  } satisfies StatusBarPlacement
  const statusBarOverlay = renderStatusBar(statusBar, statusBarPlacement)
  /* The strip the bar costs the content, wherever that bar is drawn. */
  const safeTop = statusBarSafeAreaTop(statusBar, statusBarPlacement)

  // One whole display on one plane: the main display of the flat pose, and
  // the cover screen while that is the lit one.
  const screenAt = (surfaceZ: number) => (
    <DeviceScreen
      width={landscape ? display.height : display.width}
      height={landscape ? display.width : display.height}
      radius={display.radius}
      position={[0, 0, surfaceZ]}
      rotation={landscape ? [0, 0, -Math.PI / 2] : [0, 0, 0]}
      {...resolveSurface(screenSlot, {
        surfaceBackground,
        resolution: res,
        surfaceStyle,
      })}
      safeAreaTop={coverLit ? 0 : safeTop}
      overlay={
        coverLit ? (
          // The two lens rings + flash stand ON the cover screen. The hardware
          // itself is the 3D cluster on this half's back, proud of the glass
          // at every hinge angle; these paint the same footprints into the
          // DOM beneath it, so no content shows round a lens's edge or in the
          // well of its barrel, and on a screen that takes input they are
          // what catches the pointer there (`data-mockup-cutout`).
          // No pill behind them: the retail modules protrude individually.
          //
          // `x` is negated: the spec places them in the half's own frame, seen
          // from the main-display side like every half-local coordinate (the
          // 3D cluster on the half's back reads it that way), and the cover is
          // that half's BACK. Unmirrored, the folded phone wore its lenses
          // top-right while the half-open one wore them top-left - where the
          // retail Flip has them with the hinge at the bottom.
          <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2147483647 }}>
            {cam.rings.map(({ x, y, r }, i) => (
              <div
                key={i}
                data-mockup-cutout=""
                style={coverAt(-x, y, r * 2, r * 2, {
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 38% 38%, #262f42 0%, #0a0c12 55%, #000 100%)',
                  boxShadow: 'inset 0 0 0 2px rgba(215, 222, 232, 0.35)',
                })}
              />
            ))}
            <div
              data-mockup-cutout=""
              style={coverAt(-cam.flash.x, cam.flash.y, cam.flash.r * 2, cam.flash.r * 2, {
                borderRadius: '50%',
                background: 'radial-gradient(circle at 45% 40%, #fdf7e4 0%, #d9d2bd 70%, #b7b19e 100%)',
              })}
            />
          </div>
        ) : (
          <>
            {punchHoleOverlay}
            {statusBarOverlay}
          </>
        )
      }
    >
      {screenSlot?.children}
    </DeviceScreen>
  )
  const frontZ = openBody.depth / 2 + lift

  const frameMaterial = <meshPhysicalMaterial color={frameColor} metalness={0.85} roughness={0.32} />

  if (shell.mode === 'hinged') {
    // Each half pivots around a shared virtual axis at the fold line, ON the
    // main display's surface: the two half-screens then meet exactly at the
    // crease at every angle - nearly shut included - instead of
    // interpenetrating (crossed DOM planes glitch near 0°), and both back
    // faces stay a constant `reach` from it.
    const pz = openBody.depth / 2 + lift
    const halfH = half.height
    // The Armor FlexHinge housing between the backs: a barrel of that same
    // radius. Flat, it is centred on the crease and tangent to both back
    // shells; as the phone shuts the shells close around it, so its axis
    // slides in between the halves and only its crown is left standing proud
    // of the folded pair - see `hingeSpine` for the motion.
    const spine = hingeSpine(angle, flipHingeReach(spec), spec.hinge.overhang)
    const alpha = spine.fold
    // The halves are built folding symmetrically, each `alpha` off flat; the
    // whole assembly is then turned by `alpha` about the crease, so the lower
    // half never moves - it lies exactly where the flat-open pose puts it at
    // every angle - and the upper (cover) half swings the full fold about the
    // crease, through the space in front of the main display, until it lies
    // shut on the lower half.
    // Run the spine and its caps essentially edge to edge - the halves'
    // fold-side corners are square, so a shorter spine would show the
    // V's interior past its ends at shallow angles (the detached-pill read).
    const spineLen = openBody.width - 0.03
    // The barrel is drawn a little past where it meets each half, so its
    // edges are buried in the shells rather than left on their bevels.
    const arc = spine.halfArc + HINGE_SEAL * Math.sin(alpha)
    // The engraving shows only while the exposed band is wide enough to carry
    // it, and comes and goes over the last of that width rather than at once.
    const embossShown = Math.max(
      0,
      Math.min(1, (spine.width - (spec.hinge.emboss.length * 0.155 + 0.05)) / 0.04)
    )
    // End caps: the fold's own cross-section, from the crease out to the barrel.
    const capSection = hingeCapShape(spine)
    // How deep the fold's shadow lies in the crease: none on a flat panel,
    // all of it once the halves are thirty degrees off flat. It used to be
    // full strength at every angle short of flat and gone at flat, a dark
    // band across the display that vanished in the last twentieth of a degree.
    const foldedness = Math.min(1, alpha / (Math.PI / 12))
    const creaseDepth = 0.24 * foldedness * foldedness * (3 - 2 * foldedness)
    // What each half's back wears besides its pane: the metal lip round it,
    // and its own side of the dark groove the flat-open back shows across the
    // hinge - a near-black core along the hinge end with a soft shadowed
    // shoulder beside it, and the seam on each rail. Flat, the two sides meet
    // as that groove; folding, they part round the housing. `fold` is the
    // side of the half the fold line is on.
    const backDress = (fold: -1 | 1) => (
      <>
        <mesh
          geometry={backFrameGeometry}
          rotation={[0, Math.PI, fold === 1 ? Math.PI : 0]}
          position-z={-half.depth / 2 - 0.0022}
        >
          {frameMaterial}
        </mesh>
        <mesh position={[0, fold * (halfH / 2 - 0.0065), -half.depth / 2 - 0.004]} rotation-y={Math.PI}>
          <planeGeometry args={[openBody.width - 0.05, 0.013]} />
          <meshStandardMaterial color="#07080b" metalness={0.1} roughness={0.7} />
        </mesh>
        <mesh position={[0, fold * (halfH / 2 - 0.023), -half.depth / 2 - 0.004]} rotation-y={Math.PI}>
          <planeGeometry args={[openBody.width - 0.05, 0.02]} />
          <meshStandardMaterial color="#0a0c10" transparent opacity={0.38} roughness={0.7} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * (openBody.width / 2 - 0.004), fold * (halfH / 2 - 0.0125), 0]}>
            <boxGeometry args={[0.014, 0.025, half.depth * 0.9]} />
            <meshStandardMaterial color="#101216" transparent opacity={0.5} roughness={0.6} />
          </mesh>
        ))}
      </>
    )
    // Screen halves: the fold splits the panel at the hinge line; each plane
    // shows its half of one shared virtual viewport via a clipped wrapper.
    const r = display.radius
    const halfScreen = (part: 'upper' | 'lower') => {
      const upper = part === 'upper'
      const radius: [number, number, number, number] = landscape
        ? upper
          ? [r, 0, 0, r]
          : [0, r, r, 0]
        : upper
          ? [r, r, 0, 0]
          : [0, 0, r, r]
      // Each pane overhangs the fold line by CREASE_OVERLAP (center shifted
      // half of it foldward), so the two planes - and their inset depth
      // masks - overlap across the crease instead of pairing their mask
      // insets into a dark seam.
      const localY = (upper ? 1 : -1) * (display.height / 4 - halfH / 2 - CREASE_OVERLAP / 2)
      // The fold's soft shadow falling into the crease: peaks ON the fold
      // line and tapers through the overhang at the same slope the other
      // pane's ramp has beneath it, so the shadow reads continuous whichever
      // pane composites on top.
      const shade = 0.18
      const shadeLen = px(shade + CREASE_OVERLAP)
      const creaseShadow = (dir: 'right' | 'left' | 'bottom' | 'top') =>
        `linear-gradient(to ${dir}, transparent, rgba(0,0,0,${creaseDepth}) ${
          (shade / (shade + CREASE_OVERLAP)) * 100
        }%, rgba(0,0,0,${creaseDepth * (1 - CREASE_OVERLAP / shade)}))`
      // The half panes lean on the depth buffer harder than most screens: at
      // every intermediate hinge angle one half is PARTIALLY covered by the
      // other panel, which only per-pixel compositing can resolve.
      return (
        <DeviceScreen
          width={landscape ? display.height / 2 + CREASE_OVERLAP : display.width}
          height={landscape ? display.width : display.height / 2 + CREASE_OVERLAP}
          radius={radius}
          position={[0, localY, half.depth / 2 + lift]}
          rotation={landscape ? [0, 0, -Math.PI / 2] : [0, 0, 0]}
          {...resolveSurface(screenSlot, {
            surfaceBackground,
            // each half pane carries half the virtual display's height, plus
            // the overhang's pixels
            resolution: landscape
              ? (res * (display.height / 2 + CREASE_OVERLAP)) / display.height
              : res,
            surfaceStyle,
          })}
          safeAreaTop={upper ? safeTop : 0}
          // Content windows onto the whole display; say so to useSurface().
          surface={{
            width: landscape ? display.height : display.width,
            height: landscape ? display.width : display.height,
            resolution: res,
          }}
          overlay={
            <>
              {upper ? punchHoleOverlay : null}
              {upper ? statusBarOverlay : null}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  pointerEvents: 'none',
                  zIndex: 2147483646,
                  ...(landscape
                    ? upper
                      ? { top: 0, bottom: 0, right: 0, width: shadeLen, background: creaseShadow('right') }
                      : { top: 0, bottom: 0, left: 0, width: shadeLen, background: creaseShadow('left') }
                    : upper
                      ? { left: 0, right: 0, bottom: 0, height: shadeLen, background: creaseShadow('bottom') }
                      : { left: 0, right: 0, top: 0, height: shadeLen, background: creaseShadow('top') }),
                }}
              />
            </>
          }
        >
          {/* one full-size window onto the shared virtual display, offset so
              this pane shows its own half plus the overhang's continuation.
              Sized in px, not %, so the overhang doesn't skew the mapping. */}
          <div
            style={{
              position: 'absolute',
              left: landscape && !upper ? -px(display.height / 2 - CREASE_OVERLAP) : 0,
              top: !landscape && !upper ? -px(display.height / 2 - CREASE_OVERLAP) : 0,
              width: landscape ? px(display.height) : '100%',
              height: landscape ? '100%' : px(display.height),
            }}
          >
            {screenSlot?.children}
          </div>
        </DeviceScreen>
      )
    }

    return (
      <group {...groupProps}>
        <group key="hinged" rotation-z={landscape ? Math.PI / 2 : 0}>
          {/* turn the symmetric fold by `alpha` about the crease: the lower
              half holds still and the cover half swings */}
          <group position={[0, 0, pz]} rotation-x={alpha}>
          <group position={[0, 0, -pz]}>
          {/* upper (cover) half folds toward the viewer around the hinge */}
          <group position={[0, 0, pz]} rotation-x={alpha}>
            <group position={[0, halfH / 2, -pz]}>
              <mesh geometry={shell.upper}>
                {frameMaterial}
              </mesh>
              <mesh geometry={coverGlassGeometry} rotation-y={Math.PI} position-z={-half.depth / 2 - 0.002}>
                <meshPhysicalMaterial color={coverOffColor(color)} metalness={0.2} roughness={0.18} clearcoat={1} clearcoatRoughness={0.12} />
              </mesh>
              {backDress(-1)}
              {cameraCluster(-1, -half.depth / 2 - 0.002)}
              {rails}
              {endSeams([halfH / 2 - spec.endSeamInset], half.depth)}
              {coverLit ? (
                // The cover screen, lit from shut through the first part of
                // the opening, facing out of the back of this half.
                <group position-z={-half.depth / 2 - 0.006} rotation-y={Math.PI}>
                  {screenAt(0)}
                </group>
              ) : (
                halfScreen('upper')
              )}
            </group>
          </group>

          {/* lower half folds the opposite way */}
          <group position={[0, 0, pz]} rotation-x={-alpha}>
            <group position={[0, -halfH / 2, -pz]}>
              <mesh geometry={shell.lower}>
                {frameMaterial}
              </mesh>
              <mesh geometry={coverGlassGeometry} rotation-y={Math.PI} position-z={-half.depth / 2 - 0.002}>
                <meshPhysicalMaterial color={color} metalness={0.3} roughness={0.3} clearcoat={1} clearcoatRoughness={0.25} />
              </mesh>
              {backDress(1)}
              {freeEdgeKit(-halfH / 2)}
              {endSeams([-(halfH / 2 - spec.endSeamInset)], half.depth)}
              {!coverLit && halfScreen('lower')}
            </group>
          </group>

          {/* the hinge housing between the backs: a barrel whose exposed arc
              grows as the phone closes and whose axis slides in between the
              halves as it does - frame-colored but glossier than the satin
              rails, with the tone-on-tone SAMSUNG engraving centered on its
              crown while the exposed band is wide enough to carry it */}
          <group position={[0, 0, pz]}>
            <mesh rotation-z={Math.PI / 2} position-z={spine.inset}>
              <cylinderGeometry
                args={[spine.radius, spine.radius, spineLen, 48, 1, true, Math.PI - arc, 2 * arc]}
              />
              <meshPhysicalMaterial color={frameColor} metalness={0.85} roughness={0.22} clearcoat={0.4} side={THREE.DoubleSide} />
            </mesh>
            {embossShown > 0 && (
              <mesh geometry={hingeLogoGeometry} rotation-y={Math.PI} position={[0, 0, -spine.crown - 0.002]}>
                <meshPhysicalMaterial
                  transparent
                  opacity={0.45 * embossShown}
                  color="#33363c"
                  metalness={0.7}
                  roughness={0.35}
                  polygonOffset
                  polygonOffsetFactor={-1}
                />
              </mesh>
            )}
            {/* frame-metal caps closing the fold's V at both ends: the fold's
                cross-section, stood on end - its bisector along -z, its span
                along y */}
            {([1, -1] as const).map((s) => (
              <mesh
                key={s}
                rotation={[0, Math.PI / 2, -Math.PI / 2]}
                position={[s * (spineLen / 2 + 0.004), 0, 0]}
              >
                <shapeGeometry args={[capSection, 24]} />
                <meshPhysicalMaterial color={frameColor} metalness={0.7} roughness={0.38} side={THREE.DoubleSide} />
              </mesh>
            ))}
          </group>
          </group>
          </group>
        </group>
      </group>
    )
  }

  return (
    <group {...groupProps}>
      <group key="open" rotation-z={landscape ? Math.PI / 2 : 0}>
        {/* chassis */}
        <mesh geometry={shell.body}>
          {frameMaterial}
        </mesh>

        {/* lower back glass colorway */}
        <mesh geometry={coverGlassGeometry} rotation-y={Math.PI} position={[0, -halfOffsetY, -openBody.depth / 2 - 0.002]}>
          <meshPhysicalMaterial color={color} metalness={0.3} roughness={0.3} clearcoat={1} clearcoatRoughness={0.25} />
        </mesh>

        {/* upper back: the cover screen glass (off, dark tint of the colorway) +
            the lens rings riding it */}
        <group position={[0, halfOffsetY, 0]}>
          <mesh geometry={coverGlassGeometry} rotation-y={Math.PI} position-z={-openBody.depth / 2 - 0.002}>
            <meshPhysicalMaterial color={coverOffColor(color)} metalness={0.2} roughness={0.18} clearcoat={1} clearcoatRoughness={0.12} />
          </mesh>
          {cameraCluster(-1, -openBody.depth / 2 - 0.002)}
          {rails}
        </group>

        {/* the frame lip around both panes, on their plane - keeps the dark
            panels inside the silhouette at every viewing angle */}
        <mesh geometry={backFrameGeometry} rotation-y={Math.PI} position-z={-openBody.depth / 2 - 0.0022}>
          {frameMaterial}
        </mesh>

        {/* faint hinge seam across the middle of the frame rails */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * (openBody.width / 2 - 0.004), 0, 0]}>
            <boxGeometry args={[0.014, 0.05, openBody.depth * 0.9]} />
            <meshStandardMaterial color="#101216" transparent opacity={0.5} roughness={0.6} />
          </mesh>
        ))}

        {/* hinge crevice: fully open, the two back panels don't meet - a
            dark groove runs across the vertical middle (see the retail
            product photos), rail to rail: near-black core seam with soft
            shadowed shoulders where each half's glass edge falls away. Each
            hinged half carries its own side of this along its hinge end, so
            this is where the two arrive. */}
        <group position={[0, 0, -openBody.depth / 2 - 0.004]} rotation-y={Math.PI}>
          <mesh>
            <planeGeometry args={[openBody.width - 0.05, 0.026]} />
            <meshStandardMaterial color="#07080b" metalness={0.1} roughness={0.7} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[0, side * 0.023, 0]}>
              <planeGeometry args={[openBody.width - 0.05, 0.02]} />
              <meshStandardMaterial color="#0a0c10" transparent opacity={0.38} roughness={0.7} />
            </mesh>
          ))}
        </group>
        {endSeams([openBody.height / 2 - spec.endSeamInset, -openBody.height / 2 + spec.endSeamInset], openBody.depth)}

        {freeEdgeKit(-openBody.height / 2)}
        {screenAt(frontZ)}
      </group>
    </group>
  )
}
FlipImpl.displayName = 'Flip'

/** The device's compound slots, shared by `<Flip>` and `<FlipMockup>`. */
export const flipSlots = createSlots(SCREEN_REGIONS)

export const Flip = Object.assign(FlipImpl, flipSlots)

/** The cover screen shows near-black glass when off, tinted faintly by the colorway. */
function coverOffColor(color: string): string {
  return `#${new THREE.Color(color).lerp(new THREE.Color('#06070a'), 0.82).getHexString()}`
}
