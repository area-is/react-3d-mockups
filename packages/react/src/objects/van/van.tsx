import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import {
  VAN,
  VAN_REGIONS,
  clipRoundedRect,
  clipRoundedRectOutline,
  VAN_FULL_WRAP,
  VAN_FULL_WRAP_RESOLUTION,
  type VanCoverage,
} from '../../core'
import { DeviceScreen, SCREEN_MASK_INSET } from '../../screen/device-screen'
import { collectSlots, createSlots, resolveSurface, type SurfaceProps } from '../../slots'
import { RoadWheel, WheelArchFlare } from '../road-wheel'

type GroupProps = ThreeElements['group']

type Side = 1 | -1
const SIDES = [1, -1] as const

/** A carve rect in wrap coordinates, as the clip-path helpers take it. */
interface CarveRect {
  minX: number
  minY: number
  maxX: number
  maxY: number
  r: number
}

/**
 * The shell is extruded with a small in-plane bevel: its flat side caps are
 * the nominal profile, and the band between them stands this far outside it
 * (the nose face, roof and rocker all sit `SHELL_FLARE` proud of their spec
 * line across the middle of the width). Everything that has to clear the
 * shell - roof hardware, the nose and tail faces - measures from here, and
 * the full wrap's clip insets by the same amount so the livery ends where
 * the flat side cap does instead of overhanging the bevel.
 */
const SHELL_FLARE = 0.015

/**
 * How far every wrap plane floats off the body it lies on. A blending
 * occluder is one huge flat plane, and at the framing distance the depth
 * buffer resolves only ~10-15 mm against it: anything meant to hide UNDER
 * a wrap that sits closer than that behind the plane z-fights through the
 * livery as dashes, and anything meant to show OVER it has to clear the
 * plane by as much. So the planes stand 20 mm off, recessed trim keeps to
 * within ~2 mm of the body surface, and proud hardware starts at the plane
 * (the bus keeps the same 20 mm convention).
 */
const WRAP_LIFT = 0.02

/**
 * How far every hole in a blending occluder stands outside its DOM slit. A
 * 5 mm slit is under a pixel at the framing distance, and a hole that small
 * only half-clears its pixel - the page bleeds through the DOM slit as a
 * pale line. At 13 mm the hole covers whole pixels, so it shows the dark
 * seam strip behind; the strip is wider still (and 18 mm back, where it
 * cannot z-fight the plane), so the hole only ever shows dark metal, even
 * with the parallax of a three-quarter view.
 */
const HOLE_MARGIN = 0.004

/**
 * How far past its slit, ACROSS it, a seam strip reaches when a wrap covers
 * it. The strip lies `WRAP_LIFT` behind the plane, so a three-quarter view
 * looks through the hole at a slant: at 55° off the normal the line of
 * sight lands ~28 mm to one side of the slit, and the strip has to still be
 * there - otherwise the hole shows body paint and the seam reads pale.
 * Under a wrap nothing but the hole ever shows, so the width is free; the
 * strip's ENDS keep to a few mm, so they stay inside the body outline.
 */
const SEAM_REACH = 0.03

/**
 * Cab door, in world units on the side elevation - proportioned from step-van
 * references: the shut line runs up the vertical B-pillar edge, across a flat
 * top just under the roof rail, down a front edge raked parallel to the
 * A-pillar to the beltline, then near-vertical to the wheel arch. The door
 * glass repeats the same raked front with a flat top and a vertical rear
 * edge. Seams are a real door gap (~5 mm), not the chunky bars of a cartoon.
 */
const SEAM_RAKE = 0.486 // dx per unit dy of the windshield slope
/** Raked front seam above the beltline, parallel to the A-pillar. */
const RAKED_SEAM = { bottomX: 2.06, bottomY: 0.245, topY: 0.8825, half: 0.0025 } as const
const rakedSeamX = (y: number) => RAKED_SEAM.bottomX - SEAM_RAKE * (y - RAKED_SEAM.bottomY)
/**
 * Door glass frame: raked front, flat top, vertical rear (world coords). The
 * front edge keeps ~40 mm behind the raked shut line, so the gasket's carve
 * and the seam's hole never meet (see `sideSeamHoles`).
 */
const DOOR_GLASS = { rearX: 1.09, frontX: 2.02, bottomY: 0.26, topY: 0.8 } as const
/**
 * The rubber gasket seated around the door glass, as the outline grows past
 * the glass edge. A wrap installer trims at the rubber, not at the glass, so
 * the full wrap carves this outline and the gasket shows bare through it.
 */
const GLASS_GASKET = 0.016

/**
 * The shell's side profile as a THREE shape - shared by the extruded body
 * (`inset` 0) and the full wrap's depth occluder, so per-pixel blending
 * hides exactly what the wrap's clip covers and nothing more (wheels in the
 * arches and carved glass stay visible; proud hardware draws over the
 * livery). The occluder is drawn INSET exactly as the wrap's clip-path is
 * (`buildFullWrapClip` traces the same points): a mask that reached the
 * nominal outline would clear the canvas across the band between it and
 * the clipped DOM edge, and the page would show through as a hairline all
 * along the nose.
 */
function vanProfileShape(inset = 0): THREE.Shape {
  const { rockerY, wheels, profile } = VAN
  const { bumperTopY, hoodX, hoodY, cowlX, cowlY, windshieldTopX, windshieldTopY, roofStartX } = profile
  const arch = wheels.archRadius
  const bottom = rockerY + inset
  const top = profile.roofY - inset
  const tail = profile.tailX + inset
  const nose = profile.noseX - inset
  const s = new THREE.Shape()
  // counterclockwise from the rear rocker, arcs cut the wheel arches
  s.moveTo(tail + 0.06, bottom)
  s.lineTo(wheels.rearX - arch, bottom)
  s.absarc(wheels.rearX, bottom, arch, Math.PI, 0, true)
  s.lineTo(wheels.frontX - arch, bottom)
  s.absarc(wheels.frontX, bottom, arch, Math.PI, 0, true)
  s.lineTo(nose - 0.09, bottom)
  s.quadraticCurveTo(nose, bottom, nose, bottom + 0.09)
  s.lineTo(nose, bumperTopY)
  // clamshell hood: short nose face up to the near-horizontal hood top,
  // back to the cowl crease where the windshield starts
  s.lineTo(hoodX - inset, hoodY - inset)
  s.lineTo(cowlX - inset, cowlY)
  // raked windshield to the header, then the high-roof cap ramps back
  s.lineTo(windshieldTopX - inset, windshieldTopY)
  s.quadraticCurveTo(windshieldTopX - inset - 0.12, top, roofStartX, top)
  s.lineTo(tail + 0.09, top)
  s.quadraticCurveTo(tail, top, tail, top - 0.09)
  s.lineTo(tail, bottom + 0.06)
  s.quadraticCurveTo(tail, bottom, tail + 0.06, bottom)
  return s
}

/**
 * Axis-aligned shut-line slits (the raked front segment above the beltline
 * is `RAKED_SEAM`). Every full wrap carves these - a real crevice is a GAP
 * the film tucks into, never a ridge over it - and the blending occluder
 * opens matching holes so the recessed seam meshes show through. Edges
 * meet exactly but never cross each other or the glass carve: overlapping
 * holes cancel back to filled under the nonzero rule.
 */
const DOOR_SEAMS = [
  // B-pillar edge, sill to door top
  { minX: 1.0275, maxX: 1.0325, minY: -0.86, maxY: 0.8775 },
  // door top, under the roof rail, corner-meeting the raked front seam
  { minX: 1.0275, maxX: 1.7477, minY: 0.8775, maxY: 0.8825 },
  // front edge below the beltline, stopped above the wheel arch (whose
  // crown passes y −0.47 here, and the occluder's hole grows past the slit)
  { minX: 2.0575, maxX: 2.0625, minY: -0.46, maxY: 0.245 },
  // sill seam, clear of the B-slit and the arch's front edge (x 1.467)
  { minX: 1.042, maxX: 1.462, minY: -0.8595, maxY: -0.8545 },
] as const

/**
 * Vertical seams between the box's side sheets - a step-van body is skinned
 * in ~1.2 m aluminium panels - placed clear of both arches so no seam ever
 * runs into an opening, and stopped short of the top and bottom rails that
 * cap them. Recessed like the door seams, they lie under the panel wrap and
 * are carved as slits out of the full wrap, where a real film tucks in.
 */
const BOX_SEAMS = [-2.45, -1.05, 0.05].map((x) => ({
  minX: x - 0.0025,
  maxX: x + 0.0025,
  minY: VAN.rockerY + 0.075,
  maxY: VAN.profile.roofY - 0.075,
}))

/** Every axis-aligned slit a full side wrap carves. */
const SIDE_SEAMS = [...DOOR_SEAMS, ...BOX_SEAMS]

/**
 * The side occluder's holes over those slits, each grown by `HOLE_MARGIN`.
 * The DOM slits may meet at corners (the nonzero rule sorts them out), but
 * a mask's holes must never touch or cross each other or its outline -
 * earcut cannot triangulate that, and the whole mask quietly loses every
 * hole. So where two seams meet, one hole runs on through the corner and
 * the other stops a hair short of it.
 */
function sideSeamHoles(): { rects: CarveRect[]; raked: { bottomY: number; topY: number; half: number } } {
  const m = HOLE_MARGIN
  const gap = 0.001
  const [bPillar, doorTop, front, sill] = DOOR_SEAMS
  const rTopX = rakedSeamX(RAKED_SEAM.topY)
  const grow = (s: { minX: number; maxX: number; minY: number; maxY: number }): CarveRect => ({
    minX: s.minX - m,
    maxX: s.maxX + m,
    minY: s.minY - m,
    maxY: s.maxY + m,
    r: 0.004,
  })
  const rects: CarveRect[] = [
    // B-pillar, running on up through the door-top seam's corner
    { ...grow(bPillar), maxY: doorTop.maxY + m },
    // door top, from just clear of the B-pillar hole out over the raked seam's top
    { ...grow(doorTop), minX: bPillar.maxX + m + gap, maxX: rTopX + RAKED_SEAM.half + m },
    // front edge below the beltline, up through the raked seam's foot
    grow(front),
    grow(sill),
    ...BOX_SEAMS.map(grow),
  ]
  // The raked seam stops short of both rect holes it meets.
  const raked = { bottomY: front.maxY + m + gap, topY: doorTop.minY - m - gap, half: RAKED_SEAM.half + m }
  return { rects, raked }
}

/**
 * The rear frame and its roll-up door, in world x. The frame (corner posts,
 * header, sill) and the door's slat crests share one face `REAR_FACE_X`; the
 * grooves between slats sink `ROLLUP_CREST` behind it, and the live rear
 * wrap floats just in front of the crests. Both rear wrap regions carve a
 * slit over every groove - a film laid on a roll-up door follows each slat
 * and tucks into every joint, which is exactly the look of a wrapped truck.
 */
const ROLLUP_CREST = 0.017
const ROLLUP_GROOVE_HALF = 0.003
/** Half the shut gap around the door leaf, between it and the frame. */
const ROLLUP_EDGE_GAP = 0.003
const REAR_FACE_X = VAN.profile.tailX - 0.035
const ROLLUP_GROOVE_X = REAR_FACE_X + ROLLUP_CREST
const REAR_SCREEN_X = REAR_FACE_X - WRAP_LIFT
/** The side wrap planes' z, off the shell's flat side cap. */
const SIDE_PLANE_Z = VAN.body.width / 2 + WRAP_LIFT
/**
 * Seam strips sunk in the rear grooves and shut gap: from the groove floor
 * to 2 mm proud of the crests, so the strip - not the pale groove floor -
 * is what the occluder's hole reveals.
 */
const REAR_STRIP = { x: (ROLLUP_GROOVE_X + REAR_FACE_X - 0.002) / 2, depth: ROLLUP_GROOVE_X - (REAR_FACE_X - 0.002) } as const
const rollupPitch = (VAN.rollup.topY - VAN.rollup.bottomY) / VAN.rollup.slats
/** Y of every slat joint on the door. */
const ROLLUP_GROOVES = Array.from({ length: VAN.rollup.slats - 1 }, (_, i) => VAN.rollup.bottomY + rollupPitch * (i + 1))

/**
 * Tail-lamp stacks set into the rear corner posts - brake, turn, reverse -
 * and the high-mount third brake light in the header. Each lens stands
 * proud of the rear wrap plane, and the full wrap carves it to `margin` of
 * clear install space, so the livery reads cut around lamps mounted ON the
 * body rather than sunken behind it.
 */
const TAIL_LAMPS = {
  z: 0.84,
  width: 0.12,
  margin: 0.006,
  lenses: [
    { y: 0.1, height: 0.2, color: '#8c1524', emissive: '#c11a30', intensity: 0.45 },
    { y: -0.09, height: 0.12, color: '#f2a33c', emissive: '#ffb340', intensity: 0.4 },
    { y: -0.23, height: 0.12, color: '#e9ecef', emissive: '#f2f5f8', intensity: 0.2 },
  ],
} as const
const THIRD_BRAKE = { y: 1.0675, height: 0.035, halfWidth: 0.25, margin: 0.005 } as const

/** Trace a rounded rect (world coords, counterclockwise) onto a path or shape. */
function traceRoundedRect<T extends THREE.Path>(p: T, minX: number, minY: number, maxX: number, maxY: number, r: number): T {
  p.moveTo(minX + r, minY)
  p.lineTo(maxX - r, minY)
  p.quadraticCurveTo(maxX, minY, maxX, minY + r)
  p.lineTo(maxX, maxY - r)
  p.quadraticCurveTo(maxX, maxY, maxX - r, maxY)
  p.lineTo(minX + r, maxY)
  p.quadraticCurveTo(minX, maxY, minX, maxY - r)
  p.lineTo(minX, minY + r)
  p.quadraticCurveTo(minX, minY, minX + r, minY)
  p.closePath()
  return p
}

/** Rounded-rect hole path (world coords) matching one wrap-clip carve. */
function roundedHolePath(minX: number, minY: number, maxX: number, maxY: number, r: number): THREE.Path {
  return traceRoundedRect(new THREE.Path(), minX, minY, maxX, maxY, r)
}

/**
 * The cab door glass outline, grown outward by `inflate` (0 for the glass
 * itself, `GLASS_GASKET` for the rubber around it): rear and bottom edges
 * move straight out, the raked front edge moves along its own normal, and
 * the corner radii grow with it so the gasket stays concentric with the
 * glass. One set of numbers feeds the glass mesh, the gasket plate, the
 * occluder hole and (reverse-traced) the wrap clip.
 */
function doorGlassCorners(inflate = 0) {
  const k = SEAM_RAKE
  const rearX = DOOR_GLASS.rearX - inflate
  const frontX = DOOR_GLASS.frontX + inflate * (Math.sqrt(1 + k * k) + k)
  const bottomY = DOOR_GLASS.bottomY - inflate
  const topY = DOOR_GLASS.topY + inflate
  const ftX = frontX - k * (topY - bottomY)
  const len = Math.hypot(ftX - frontX, topY - bottomY)
  return {
    rearX,
    frontX,
    bottomY,
    topY,
    ftX,
    ux: (ftX - frontX) / len,
    uy: (topY - bottomY) / len,
    rB: 0.03 + inflate,
    rT: 0.05 + inflate,
  }
}

/**
 * The cab door glass as a THREE shape (world coords, counterclockwise):
 * raked front edge parallel to the A-pillar, flat top under the roof rail,
 * vertical rear edge - rounded corners.
 */
function doorGlassShape(inflate = 0): THREE.Shape {
  const { rearX, frontX, bottomY, topY, ftX, ux, uy, rB, rT } = doorGlassCorners(inflate)
  const s = new THREE.Shape()
  s.moveTo(rearX + rB, bottomY)
  s.lineTo(frontX - rB, bottomY)
  s.quadraticCurveTo(frontX, bottomY, frontX + ux * rB, bottomY + uy * rB)
  s.lineTo(ftX - ux * rT, topY - uy * rT)
  s.quadraticCurveTo(ftX, topY, ftX - rT, topY)
  s.lineTo(rearX + rT, topY)
  s.quadraticCurveTo(rearX, topY, rearX, topY - rT)
  s.lineTo(rearX, bottomY + rB)
  s.quadraticCurveTo(rearX, bottomY, rearX + rB, bottomY)
  s.closePath()
  return s
}

/**
 * SVG path (CSS px, y-down) clipping the full-coverage wrap: the shell's own
 * side profile - including the wheel-arch arcs - as the outer boundary, with
 * the hardware cutouts as opposite-winding holes. `mirrored` builds the
 * street-side (−Z) variant, whose CSS x axis runs nose→tail; mirroring also
 * flips every arc's sweep flag so the geometry stays identical.
 */
function buildFullWrapClip(pxPerUnit: number, mirrored: boolean, overWindows: boolean): string {
  const { rockerY, wheels, profile } = VAN
  // Keep the wrap just inside the shell's beveled edge (see `SHELL_FLARE`).
  const inset = SHELL_FLARE
  const X = (x: number) => ((mirrored ? profile.noseX - x : x - profile.tailX) * pxPerUnit).toFixed(1)
  const Y = (y: number) => ((profile.roofY - y) * pxPerUnit).toFixed(1)
  const P = (x: number, y: number) => `${X(x)} ${Y(y)}`
  const R = (u: number) => (u * pxPerUnit).toFixed(1)
  // One sweep flag serves the whole trace (see core's clip-path helper); the
  // street-side mirror flips orientation, and the flag with it.
  const sweep = mirrored ? 0 : 1

  const bottom = rockerY + inset
  const top = profile.roofY - inset
  const tail = profile.tailX + inset
  const nose = profile.noseX - inset
  const arch = wheels.archRadius

  // The same trace as shellGeometry's profile shape, world-counterclockwise.
  const outline =
    `M ${P(tail + 0.06, bottom)} ` +
    `L ${P(wheels.rearX - arch, bottom)} ` +
    `A ${R(arch)} ${R(arch)} 0 0 ${sweep} ${P(wheels.rearX + arch, bottom)} ` +
    `L ${P(wheels.frontX - arch, bottom)} ` +
    `A ${R(arch)} ${R(arch)} 0 0 ${sweep} ${P(wheels.frontX + arch, bottom)} ` +
    `L ${P(nose - 0.09, bottom)} Q ${P(nose, bottom)} ${P(nose, bottom + 0.09)} ` +
    `L ${P(nose, profile.bumperTopY)} ` +
    `L ${P(profile.hoodX - inset, profile.hoodY - inset)} ` +
    `L ${P(profile.cowlX - inset, profile.cowlY)} ` +
    `L ${P(profile.windshieldTopX - inset, profile.windshieldTopY)} ` +
    `Q ${P(profile.windshieldTopX - inset - 0.12, top)} ${P(profile.roofStartX, top)} ` +
    `L ${P(tail + 0.09, top)} Q ${P(tail, top)} ${P(tail, top - 0.09)} ` +
    `L ${P(tail, bottom + 0.06)} Q ${P(tail, bottom)} ${P(tail + 0.06, bottom)} Z `

  // The door glass AND its gasket, traced world-clockwise (reverse of the
  // mesh shape): the film is cut at the rubber, so the carve is the gasket's
  // outline, not the glass's.
  const { rearX, frontX, bottomY: gB, topY: gT, ftX, ux: gUx, uy: gUy, rB: rB2, rT: rT2 } = doorGlassCorners(GLASS_GASKET)
  const glass =
    `M ${P(rearX + rB2, gB)} Q ${P(rearX, gB)} ${P(rearX, gB + rB2)} ` +
    `L ${P(rearX, gT - rT2)} Q ${P(rearX, gT)} ${P(rearX + rT2, gT)} ` +
    `L ${P(ftX - rT2, gT)} Q ${P(ftX, gT)} ${P(ftX - gUx * rT2, gT - gUy * rT2)} ` +
    `L ${P(frontX + gUx * rB2, gB + gUy * rB2)} Q ${P(frontX, gB)} ${P(frontX - rB2, gB)} Z `

  // The cab-door shut lines and the box's sheet seams are carved as slits -
  // the crevice is a gap the film tucks into on a real wrap. No other
  // hardware carves: the sides composite per-pixel ('blending'), so the
  // proud rails, mirrors, handles and markers draw over the livery on their
  // own - hardware remounted over vinyl.
  const seams = SIDE_SEAMS.map((s) => clipRoundedRect(P, R, sweep, { ...s, r: 0.002 })).join('')
  // The raked front seam: a fixed-order parallelogram - the CSS x mirror
  // flips outline and hole winding together, so one point order serves
  // both sides.
  const rh = RAKED_SEAM.half
  const rTopX = rakedSeamX(RAKED_SEAM.topY)
  const raked =
    `M ${P(rTopX - rh, RAKED_SEAM.topY)} L ${P(rTopX + rh, RAKED_SEAM.topY)} ` +
    `L ${P(RAKED_SEAM.bottomX + rh, RAKED_SEAM.bottomY)} L ${P(RAKED_SEAM.bottomX - rh, RAKED_SEAM.bottomY)} Z `
  return (outline + seams + raked + (overWindows ? '' : glass)).trim()
}

/**
 * Half-length (across z) of the slat-joint slits: the door leaf under a
 * full wrap, the panel under a panel wrap - held clear of the wrap's
 * outline and of the door-edge slits by 3 x `HOLE_MARGIN`. Shared by the
 * carves and the strips sunk behind them.
 */
function rearSlatSpan(full: boolean): number {
  const clear = HOLE_MARGIN * 3
  // The panel's slits stop 30 mm short of its edge: the strip behind runs
  // on to the mask's edge, and that overrun is what a slanted view finds.
  return full ? VAN.rollup.halfWidth - 0.0025 - clear : VAN.rear.width / 2 - 0.03
}

/**
 * Everything a rear wrap carves, as rects in world (z, y). Both coverages
 * carve the roll-up door's slat joints; the full-coverage wrap - which runs
 * past the door leaf onto the frame - additionally carves the shut gap
 * around the leaf, every tail-lamp lens and the third brake light, each to
 * a slim install margin. Slits meet the door-edge slits exactly but never
 * cross them: overlapping holes cancel back to filled under the nonzero rule.
 */
function rearCarves(full: boolean): CarveRect[] {
  const spec = full ? VAN.rearFull : VAN.rear
  const halfW = spec.width / 2
  const bottomY = spec.y - spec.height / 2
  const { halfWidth, topY } = VAN.rollup
  const g = ROLLUP_GROOVE_HALF
  const carves: CarveRect[] = []
  // Slat joints span the door leaf under a full wrap, the panel under a
  // panel wrap. Each stops well inside the outline and short of the
  // door-edge slits: the occluder grows every carve into a hole, and its
  // holes must stay clear of its outline and of each other (see
  // `sideSeamHoles`), so the slits keep 3 x `HOLE_MARGIN` between them.
  const clear = HOLE_MARGIN * 3
  const zMax = rearSlatSpan(full)
  for (const y of ROLLUP_GROOVES) carves.push({ minX: -zMax, maxX: zMax, minY: y - g, maxY: y + g, r: 0.002 })
  if (!full) return carves
  // The shut gap: up both door edges from the wrap's bottom, across the top.
  for (const s of SIDES) {
    carves.push({ minX: s * halfWidth - 0.0025, maxX: s * halfWidth + 0.0025, minY: bottomY + 0.002 + clear, maxY: topY - 0.0025 - clear, r: 0.002 })
  }
  carves.push({ minX: -halfWidth - 0.0025, maxX: halfWidth + 0.0025, minY: topY - 0.0025, maxY: topY + 0.0025, r: 0.002 })
  for (const s of SIDES) {
    for (const lens of TAIL_LAMPS.lenses) {
      const m = TAIL_LAMPS.margin
      const z = s * TAIL_LAMPS.z
      carves.push({
        minX: z - TAIL_LAMPS.width / 2 - m,
        maxX: z + TAIL_LAMPS.width / 2 + m,
        minY: lens.y - lens.height / 2 - m,
        maxY: lens.y + lens.height / 2 + m,
        r: 0.02,
      })
    }
  }
  const m = THIRD_BRAKE.margin
  carves.push({
    minX: -THIRD_BRAKE.halfWidth - m,
    maxX: THIRD_BRAKE.halfWidth + m,
    minY: THIRD_BRAKE.y - THIRD_BRAKE.height / 2 - m,
    maxY: THIRD_BRAKE.y + THIRD_BRAKE.height / 2 + m,
    r: 0.012,
  })
  return carves
}

/** SVG path clipping the rear wrap: its rounded outline minus `rearCarves`. */
function buildRearClip(pxPerUnit: number, full: boolean): string {
  const spec = full ? VAN.rearFull : VAN.rear
  const halfW = spec.width / 2
  const topY = spec.y + spec.height / 2
  const bottomY = spec.y - spec.height / 2
  // The rear plane faces −X; its CSS x axis runs along world +z unmirrored.
  const P = (z: number, y: number) => `${((z + halfW) * pxPerUnit).toFixed(1)} ${((topY - y) * pxPerUnit).toFixed(1)}`
  const R = (u: number) => (u * pxPerUnit).toFixed(1)
  const outline = clipRoundedRectOutline(P, R, 1, { minX: -halfW, minY: bottomY, maxX: halfW, maxY: topY, r: spec.radius })
  return (outline + rearCarves(full).map((c) => clipRoundedRect(P, R, 1, c)).join('')).trim()
}

/**
 * Depth occluder for the rear wrap: the screen's own silhouette (held the
 * standard hair inside the DOM edge) with a hole over every carve. Without
 * it the default rectangular mask would clear the canvas across the slat
 * slits too, and the PAGE would show through each joint instead of the dark
 * groove behind. Built in the screen's local plane: x along world +z, y
 * relative to the panel centre.
 */
function rearOccluderGeometry(full: boolean): THREE.BufferGeometry {
  const spec = full ? VAN.rearFull : VAN.rear
  const inset = Math.min(spec.width, spec.height) * SCREEN_MASK_INSET
  const hw = spec.width / 2 - inset
  const hh = spec.height / 2 - inset
  const shape = traceRoundedRect(new THREE.Shape(), -hw, -hh, hw, hh, Math.max(0, spec.radius - inset))
  for (const c of rearCarves(full)) {
    const m = HOLE_MARGIN
    shape.holes.push(roundedHolePath(c.minX - m, c.minY - spec.y - m, c.maxX + m, c.maxY - spec.y + m, c.r + m))
  }
  return new THREE.ShapeGeometry(shape, 8)
}

/**
 * The cargo box roof is crowned - a shallow arch across the width so rain
 * runs off - and the crown fades out over the cab, whose roof is the flat
 * cap the profile draws. A hard-edged slab roof is the single biggest
 * "toy" cue on a box body from any three-quarter view above eye level.
 */
const ROOF_CROWN = {
  sag: 0.035,
  x0: VAN.profile.tailX + 0.09,
  x1: VAN.profile.roofStartX - 0.02,
  halfWidth: VAN.body.width / 2 - VAN.body.bevel,
} as const

/** Crown height above the shell's roof band at (x, z). */
function roofCrown(x: number, z: number): number {
  const { sag, x0, x1, halfWidth } = ROOF_CROWN
  const radius = (halfWidth * halfWidth + sag * sag) / (2 * sag)
  const arc = Math.sqrt(Math.max(0, radius * radius - z * z)) - (radius - sag)
  const ease = (t: number) => {
    const u = Math.min(1, Math.max(0, t))
    return u * u * (3 - 2 * u)
  }
  return arc * ease((x1 - x) / 0.5) * ease((x - x0) / 0.3)
}

/** Y of the roof skin at (x, z): the shell's flared roof band plus the crown. */
const roofTop = (x: number, z: number) => VAN.profile.roofY + SHELL_FLARE + 0.002 + roofCrown(x, z)

function roofCrownGeometry(): THREE.BufferGeometry {
  const { x0, x1, halfWidth } = ROOF_CROWN
  const nx = 40
  const nz = 16
  const positions: number[] = []
  const indices: number[] = []
  for (let i = 0; i <= nx; i++) {
    const x = x0 + ((x1 - x0) * i) / nx
    for (let j = 0; j <= nz; j++) {
      const z = -halfWidth + (2 * halfWidth * j) / nz
      positions.push(x, roofTop(x, z), z)
    }
  }
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < nz; j++) {
      const a = i * (nz + 1) + j
      const b = a + 1
      const c = a + nz + 1
      const d = c + 1
      indices.push(a, b, c, b, d, c)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

/**
 * The roll-up door leaf as one extrusion: a stack of interlocking slats,
 * each a flat face with chamfered top and bottom edges, dropping to the
 * groove floor at every joint. The profile is drawn in (y, proudness) and
 * extruded across the door width, so the whole door is one draw call whose
 * shading sells the slats - the dark strips sunk in each groove do the rest.
 */
function rollupDoorGeometry(): THREE.BufferGeometry {
  const { halfWidth, bottomY, topY, slats } = VAN.rollup
  const g = ROLLUP_GROOVE_HALF
  const chamfer = 0.012
  const s = new THREE.Shape()
  s.moveTo(bottomY, 0)
  for (let i = 0; i < slats; i++) {
    const y0 = bottomY + i * rollupPitch + (i === 0 ? ROLLUP_EDGE_GAP : g)
    const y1 = bottomY + (i + 1) * rollupPitch - (i === slats - 1 ? ROLLUP_EDGE_GAP : g)
    s.lineTo(y0, 0)
    s.lineTo(y0 + chamfer, ROLLUP_CREST)
    s.lineTo(y1 - chamfer, ROLLUP_CREST)
    s.lineTo(y1, 0)
  }
  s.lineTo(topY, 0)
  s.lineTo(topY, -0.004)
  s.lineTo(bottomY, -0.004)
  s.closePath()
  const width = (halfWidth - ROLLUP_EDGE_GAP) * 2
  const geometry = new THREE.ExtrudeGeometry(s, { depth: width, bevelEnabled: false })
  // shape x → world y, shape y (proudness) → world −x, extrusion along z
  geometry.rotateZ(Math.PI / 2)
  geometry.translate(0, 0, -width / 2)
  return geometry
}

export interface VanProps extends Omit<GroupProps, 'children' | 'color'>, SurfaceProps {
  /**
   * Livery content. Bare children fill the curb-side (+Z) wrap panel; name
   * regions explicitly with `<Van.CurbSide>`, `<Van.StreetSide>`, `<Van.Rear>`
   * and `<Van.LicensePlate>`. A string inside `<Van.LicensePlate>` renders
   * the built-in plate face (dark plate type on the white blank); any React
   * node renders as-is on both plates.
   */
  children?: React.ReactNode
  /** Body paint. Wrap fleets are usually white. */
  color?: string
  /**
   * CSS pixel width of the virtual wrap panel. Height follows the panel
   * aspect; the default tracks `coverage` (panel dpi, or its full-side
   * equivalent).
   */
  resolution?: number
  /**
   * How much of the vehicle the live wraps cover.
   *
   * - `'panel'` (default) - the classic mid-panel ad rect.
   * - `'full'` - the whole side elevation and rear face, with the glass and
   *   hardware carved out of the wrap so they stay visible through it.
   * - `'perforated'` - the same full wrap, but running OVER the glass as
   *   perforated window film (the full-print fleet look). Operational glass
   *   is always carved out regardless.
   */
  coverage?: VanCoverage
}

/**
 * A procedurally built delivery step van (generic MT45 / Utilimaster-class
 * walk-in body, no brand): the shell is the side profile - stub clamshell
 * hood, cowl break, raked windshield, high roof, wheel-arch cutouts -
 * extruded across the width, with a crowned box roof, dark wheel wells,
 * dual rear wheels on eight-lug rims, gasketed cab glass behind a two-piece
 * windshield, door shut lines and paddle handles, West-Coast mirrors,
 * aluminium top, bottom and rub rails with rear corner caps, a slatted
 * roll-up rear door with its latch bar, corner tail lamps, marker lights,
 * a diamond-plate step bumper and mud flaps added on. The flat cargo side
 * carries a live vinyl-wrap panel for your livery - or, with
 * `coverage="full"`, the whole side elevation and the whole rear face. No
 * 3D asset files are loaded.
 *
 * The origin is the body center; the road sits `VAN.groundY` below it. The
 * wrap panel faces +Z. Must be rendered inside a react-three-fiber `<Canvas>`
 * (or `<MockupCanvas>`).
 *
 * ```tsx
 * <Van coverage="full">
 *   <YourLivery />
 *   <Van.Rear><RearDoor /></Van.Rear>
 *   <Van.LicensePlate>AREA 51</Van.LicensePlate>
 * </Van>
 * ```
 */
function VanImpl({
  children,
  color = '#eef0f2',
  surfaceBackground = '#ffffff',
  resolution,
  coverage = 'panel',
  surfaceStyle,
  ...groupProps
}: VanProps) {
  const regions = collectSlots(children, VAN_REGIONS)
  const { body, rockerY, wheels, profile, wrap, rear: rearPanel, rearFull, rollup } = VAN
  // Screens occlude against OTHER registered bodies only - see the bus's
  // matching note: the convex shell's own ray hits at oblique angles were
  // false positives, and the backface culler covers every view the body
  // itself could block.

  // The side rect the DeviceScreens cover: the classic mid-panel, or the
  // whole side elevation with the hardware carved out via clip-path.
  const fullWrap = coverage !== 'panel'
  // Perforated film runs the graphic over the glass; a plain full wrap carves it out.
  const overGlass = coverage === 'perforated'
  const plateSlot = regions.licensePlate
  const plateContent = plateSlot?.children
  // A string becomes the built-in plate face (plate type on the white
  // blank); custom nodes render as-is on both plates.
  const plateFace =
    typeof plateContent === 'string' ? (
      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f4f6f8',
          border: '2px solid #a9aeb6',
          borderRadius: 4,
          containerType: 'size',
        }}
      >
        <span
          style={{
            color: '#181b20',
            fontFamily: '"Arial Narrow", "Helvetica Neue", Arial, sans-serif',
            fontWeight: 700,
            fontSize: '52cqh',
            letterSpacing: '0.1em',
            whiteSpace: 'pre',
          }}
        >
          {plateContent}
        </span>
      </div>
    ) : (
      plateContent
    )
  const side = fullWrap
    ? { width: VAN_FULL_WRAP.width, height: VAN_FULL_WRAP.height, x: VAN_FULL_WRAP.x, y: VAN_FULL_WRAP.y, radius: 0 }
    : { width: wrap.width, height: wrap.height, x: wrap.x, y: wrap.y, radius: wrap.radius }
  const rearSpec = fullWrap ? rearFull : rearPanel
  const sideResolution = resolution ?? (fullWrap ? VAN_FULL_WRAP_RESOLUTION : VAN.resolution)
  const surfaceDefaults = { surfaceBackground, surfaceStyle }
  const curbSurface = resolveSurface(regions.curbSide, { ...surfaceDefaults, resolution: sideResolution })
  const streetSurface = resolveSurface(regions.streetSide, { ...surfaceDefaults, resolution: sideResolution })
  // The rear panel shares the side wrap's dpi.
  const rearSurface = resolveSurface(regions.rear, {
    ...surfaceDefaults,
    resolution: Math.round(rearSpec.width * (sideResolution / side.width)),
  })
  // Clips are built at each surface's resolved resolution, so a slot-level
  // `resolution` override keeps the carve aligned with its wrap.
  const sideClip = React.useMemo(() => {
    if (!fullWrap) return null
    return {
      curb: `path("${buildFullWrapClip(curbSurface.resolution / VAN_FULL_WRAP.width, false, overGlass)}")`,
      street: `path("${buildFullWrapClip(streetSurface.resolution / VAN_FULL_WRAP.width, true, overGlass)}")`,
    }
  }, [fullWrap, curbSurface.resolution, streetSurface.resolution, overGlass])
  const rearClip = React.useMemo(
    () => `path("${buildRearClip(rearSurface.resolution / rearSpec.width, fullWrap)}")`,
    [fullWrap, rearSurface.resolution, rearSpec.width]
  )
  const curbStyle = sideClip ? { clipPath: sideClip.curb, ...curbSurface.screenStyle } : curbSurface.screenStyle
  const streetStyle = sideClip ? { clipPath: sideClip.street, ...streetSurface.screenStyle } : streetSurface.screenStyle
  const rearStyle = { clipPath: rearClip, ...rearSurface.screenStyle }

  // Depth occluders for the full-coverage sides: the wrap outline as real
  // geometry (door glass carved when the wrap keeps clear of it), so
  // per-pixel blending hides only what the livery visually covers.
  const sideOccluderGeometries = React.useMemo(() => {
    if (!fullWrap) return null
    const build = (mirroredSide: boolean) => {
      // Held the standard hair inside the DOM's own (already inset) edge.
      const s = vanProfileShape(SHELL_FLARE + 0.004)
      // The glass carve is huge, so it only needs a hair of margin - and a
      // small one keeps it clear of the raked seam's hole at the beltline.
      if (!overGlass) s.holes.push(doorGlassShape(GLASS_GASKET + 0.002))
      const { rects, raked } = sideSeamHoles()
      for (const hole of rects) s.holes.push(roundedHolePath(hole.minX, hole.minY, hole.maxX, hole.maxY, hole.r))
      const rakedHole = new THREE.Path()
      const rTopX = rakedSeamX(raked.topY)
      const rBottomX = rakedSeamX(raked.bottomY)
      rakedHole.moveTo(rTopX - raked.half, raked.topY)
      rakedHole.lineTo(rTopX + raked.half, raked.topY)
      rakedHole.lineTo(rBottomX + raked.half, raked.bottomY)
      rakedHole.lineTo(rBottomX - raked.half, raked.bottomY)
      rakedHole.closePath()
      s.holes.push(rakedHole)
      const geometry = new THREE.ShapeGeometry(s, 16)
      geometry.translate(-VAN_FULL_WRAP.x, -VAN_FULL_WRAP.y, 0)
      if (mirroredSide) geometry.scale(-1, 1, 1)
      return geometry
    }
    return { curb: build(false), street: build(true) }
  }, [fullWrap, overGlass])
  React.useEffect(
    () => () => {
      sideOccluderGeometries?.curb.dispose()
      sideOccluderGeometries?.street.dispose()
    },
    [sideOccluderGeometries]
  )
  // The rear wrap always carves the door's slat joints, so it always needs
  // its own mask with matching holes (see `rearOccluderGeometry`).
  const rearOccluder = React.useMemo(() => rearOccluderGeometry(fullWrap), [fullWrap])
  React.useEffect(() => () => rearOccluder.dispose(), [rearOccluder])
  // Only the full-coverage sides need a custom depth mask: their DOM is
  // clipped to the wrap outline, so the mask must carve the same glass out of
  // the silhouette - otherwise the livery's rectangle would hide the mirrors,
  // handles, rails and markers that stand proud of it. A panel ad is a plain
  // rect, and its own silhouette already is its mask.
  const sideScreenOcclusion = (blendGeometry?: THREE.BufferGeometry) =>
    fullWrap ? { occluderGeometry: blendGeometry } : {}

  const shellGeometry = React.useMemo(() => {
    const s = vanProfileShape()
    const depth = body.width - body.bevel * 2
    const geometry = new THREE.ExtrudeGeometry(s, {
      depth,
      bevelEnabled: true,
      bevelThickness: body.bevel,
      // a small in-plane bevel keeps the profile within ~15mm of its nominal
      // outline, so glass planes and lamps placed on it stay visible
      bevelSize: SHELL_FLARE,
      bevelSegments: 3,
      curveSegments: 24,
    })
    geometry.translate(0, 0, -depth / 2)
    return geometry
  }, [body, rockerY, wheels, profile])

  // Windshield plane, laid on the cowl-to-header segment of the profile.
  const windshield = React.useMemo(() => {
    const dx = profile.windshieldTopX - profile.cowlX
    const dy = profile.windshieldTopY - profile.cowlY
    const length = Math.hypot(dx, dy)
    return {
      tilt: Math.atan2(-dx / length, dy / length),
      length,
      mid: [
        (profile.cowlX + profile.windshieldTopX) / 2 + (dy / length) * 0.035,
        (profile.cowlY + profile.windshieldTopY) / 2 + (-dx / length) * 0.035,
      ] as const,
    }
  }, [profile])

  // Cab door glass: raked front parallel to the A-pillar, flat top and a
  // vertical rear edge with rounded corners, like the references. Built in
  // world side-elevation coords from the same shape as the wrap carve, with
  // the gasket a flat plate of the inflated outline behind it.
  const doorGlassGeometry = React.useMemo(
    () => new THREE.ExtrudeGeometry(doorGlassShape(), { depth: 0.02, bevelEnabled: false }),
    []
  )
  // Under a full wrap the gasket plate, like the seam strips, reaches past
  // its carve so a slanted view through the hole still lands on rubber; a
  // bare side keeps the true gasket width.
  const gasketGeometries = React.useMemo(
    () => ({
      bare: new THREE.ShapeGeometry(doorGlassShape(GLASS_GASKET), 12),
      wrapped: new THREE.ShapeGeometry(doorGlassShape(GLASS_GASKET + SEAM_REACH), 12),
    }),
    []
  )
  // Which flanks carry a full wrap: the curb side always has its screen,
  // the street side only when its region is given.
  const flankWrapped = (s: Side) => fullWrap && (s === 1 || regions.streetSide != null)
  const roofGeometry = React.useMemo(roofCrownGeometry, [])
  const doorGeometry = React.useMemo(rollupDoorGeometry, [])

  React.useEffect(() => {
    return () => {
      shellGeometry.dispose()
      doorGlassGeometry.dispose()
      gasketGeometries.bare.dispose()
      gasketGeometries.wrapped.dispose()
      roofGeometry.dispose()
      doorGeometry.dispose()
    }
  }, [shellGeometry, doorGlassGeometry, gasketGeometries, roofGeometry, doorGeometry])

  // Automotive paint is a dielectric base under a clear lacquer - modelling
  // it as half-metal desaturates the body into dull sheet and kills the wet
  // highlight the clearcoat is there to provide.
  const paint = { color, metalness: 0.08, roughness: 0.42, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.1 }
  // Automotive laminate: a near-black dielectric with a mirror-smooth
  // surface, so the studio panels read as reflections instead of grey plastic.
  const glassMaterial = (
    <meshPhysicalMaterial
      color="#080c13"
      metalness={0}
      roughness={0.05}
      clearcoat={1}
      clearcoatRoughness={0.03}
      envMapIntensity={1.8}
    />
  )
  // Matte black trim, soft rubber, satin aluminium extrusions, bright
  // chrome, dark steel - the four finishes a work truck is built from.
  const trim = { color: '#23262b', metalness: 0.1, roughness: 0.7 }
  const rubber = { color: '#131417', metalness: 0, roughness: 0.95 }
  const alu = { color: '#c3c7cd', metalness: 0.85, roughness: 0.38, envMapIntensity: 1.0 }
  const chrome = { color: '#e2e6ea', metalness: 1, roughness: 0.14, envMapIntensity: 1.3 }
  const steel = { color: '#1b1e23', metalness: 0.5, roughness: 0.65 }
  const seam = { color: '#191b1f', metalness: 0.2, roughness: 0.8 }
  const trimMaterial = <meshPhysicalMaterial {...trim} />

  // Where the outer tires sit: their outboard sidewall just inside the side
  // cap, so the wheel fills its arch instead of hiding up inside it.
  const wheelZ = body.width / 2 - 0.135
  // Rails break at the arches like the sheets they cap: rear corner to the
  // rear arch, rear arch to the front arch, ending at the B-pillar seam.
  const railSpans = [
    [profile.tailX + 0.07, wheels.rearX - wheels.archRadius - 0.03],
    [wheels.rearX + wheels.archRadius + 0.03, 1.02],
  ] as const
  const flankH = profile.roofY - rockerY
  const flankMidY = (profile.roofY + rockerY) / 2

  return (
    <group {...groupProps}>
      {/* painted shell */}
      <mesh geometry={shellGeometry}>
        <meshPhysicalMaterial {...paint} />
      </mesh>

      {/* crowned box roof, fading into the flat cab roof (see `roofCrown`) */}
      <mesh geometry={roofGeometry}>
        <meshPhysicalMaterial {...paint} roughness={0.5} />
      </mesh>
      {/* roof vent over the cargo bay, and the stub antenna on the cab roof */}
      <RoundedBox args={[0.36, 0.05, 0.36]} radius={0.015} smoothness={2} bevelSegments={2} position={[-1.9, roofTop(-1.9, 0) + 0.02, 0]}>
        <meshPhysicalMaterial color="#3a3d43" metalness={0.2} roughness={0.75} />
      </RoundedBox>
      <group position={[1.08, roofTop(1.08, -0.56), -0.56]}>
        <mesh position={[0, 0.015, 0]}>
          <cylinderGeometry args={[0.022, 0.028, 0.03, 12]} />
          {trimMaterial}
        </mesh>
        <mesh position={[0, 0.11, 0]} rotation-z={0.12}>
          <cylinderGeometry args={[0.007, 0.009, 0.19, 8]} />
          {trimMaterial}
        </mesh>
      </group>

      {/* wheel wells: a dark half-tub inside each arch, open to both sides,
          so the opening reads as a recess with a wheel in it instead of a
          hole printed on a flat slab - plus the rolled arch lip */}
      {([wheels.frontX, wheels.rearX] as const).map((x) => (
        <group key={x} position={[x, rockerY, 0]}>
          <mesh rotation-x={Math.PI / 2}>
            <cylinderGeometry
              args={[
                wheels.archRadius - SHELL_FLARE - 0.006,
                wheels.archRadius - SHELL_FLARE - 0.006,
                body.width - 0.07,
                24,
                1,
                true,
                Math.PI / 2,
                Math.PI,
              ]}
            />
            <meshPhysicalMaterial color="#0b0c0f" metalness={0} roughness={1} side={THREE.DoubleSide} />
          </mesh>
          {SIDES.map((s) => (
            <WheelArchFlare key={s} radius={wheels.archRadius} tube={0.02} z={s * (body.width / 2 + 0.012)} side={s} />
          ))}
        </group>
      ))}

      {/* running gear: axles (a differential pumpkin on the rear one), the
          underbody pan closing the gap between the rockers, and the fuel
          tank slung under the curb side - what a low camera sees */}
      <mesh rotation-x={Math.PI / 2} position={[wheels.frontX, wheels.centerY, 0]}>
        <cylinderGeometry args={[0.05, 0.05, body.width - 0.36, 12]} />
        <meshPhysicalMaterial {...steel} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[wheels.rearX, wheels.centerY, 0]}>
        <cylinderGeometry args={[0.06, 0.06, body.width - 0.36, 12]} />
        <meshPhysicalMaterial {...steel} />
      </mesh>
      <mesh position={[wheels.rearX, wheels.centerY + 0.01, 0.05]}>
        <sphereGeometry args={[0.13, 16, 12]} />
        <meshPhysicalMaterial {...steel} />
      </mesh>
      <mesh position={[0, rockerY - 0.075, 0]}>
        <boxGeometry args={[body.length - 0.9, 0.15, body.width - 0.4]} />
        <meshPhysicalMaterial color="#0d0e11" metalness={0.1} roughness={0.95} />
      </mesh>
      <RoundedBox args={[0.8, 0.2, 0.42]} radius={0.05} smoothness={2} bevelSegments={2} position={[0.3, -1.0, 0.55]}>
        <meshPhysicalMaterial {...steel} roughness={0.55} />
      </RoundedBox>

      {/* wheels: lathed tires on eight-lug rims - singles up front, duals on
          the drive axle, the inner tire set back by the spec's `dualOffset`.
          Dual rears are the one glance-cue that says "truck" rather than
          "van", and the inner tire shows between the arch and the ground */}
      {([wheels.frontX, wheels.rearX] as const).map((x) =>
        SIDES.map((s) => (
          <React.Fragment key={`${x}${s}`}>
            <RoadWheel
              radius={wheels.radius}
              width={wheels.width}
              face={s}
              lugs={8}
              rimRatio={0.6}
              rimColor="#c9cdd3"
              position={[x, wheels.centerY, s * wheelZ]}
            />
            {x === wheels.rearX && (
              <RoadWheel
                radius={wheels.radius}
                width={wheels.width}
                face={s === 1 ? -1 : 1}
                lugs={8}
                rimRatio={0.6}
                rimColor="#c9cdd3"
                position={[x, wheels.centerY, s * (wheelZ - wheels.dualOffset)]}
              />
            )}
          </React.Fragment>
        ))
      )}

      {/* the box's side hardware, both flanks: aluminium top rail under the
          roof edge, bottom rail along the rocker, a black rub rail at the
          floor line (both broken at the arches), the rear corner cap, side
          marker lights and the cab-door step. All stand proud of the wrap
          plane, so a full livery reads cut around them like remounted trim */}
      {SIDES.map((s) => {
        const z = s * (body.width / 2)
        // Rails and caps run from the side cap out past the wrap plane, so
        // every visible face of them stands over the livery.
        const railZ = z + s * ((WRAP_LIFT + 0.025) / 2)
        const railDepth = WRAP_LIFT + 0.025
        return (
          <group key={s}>
            <mesh position={[(profile.tailX + 0.07 + 1.28) / 2, profile.roofY - 0.03, railZ]}>
              <boxGeometry args={[1.28 - (profile.tailX + 0.07), 0.06, railDepth]} />
              <meshPhysicalMaterial {...alu} />
            </mesh>
            {railSpans.map(([x0, x1]) => (
              <React.Fragment key={x0}>
                <mesh position={[(x0 + x1) / 2, rockerY + 0.03, railZ]}>
                  <boxGeometry args={[x1 - x0, 0.06, railDepth]} />
                  <meshPhysicalMaterial {...alu} />
                </mesh>
                <mesh position={[(x0 + x1) / 2, -0.5, z + s * ((WRAP_LIFT + 0.02) / 2)]}>
                  <boxGeometry args={[x1 - x0, 0.05, WRAP_LIFT + 0.02]} />
                  <meshPhysicalMaterial {...trim} />
                </mesh>
              </React.Fragment>
            ))}
            {/* rear corner cap, the side leg (the rear leg is with the tail) */}
            <mesh position={[profile.tailX + 0.035, flankMidY, railZ]}>
              <boxGeometry args={[0.07, flankH, railDepth]} />
              <meshPhysicalMaterial {...alu} />
            </mesh>
            {/* amber marker at the front of the box, red at the rear, on the top rail */}
            {(
              [
                { x: 0.9, color: '#f2a33c', emissive: '#ffb340' },
                { x: -2.62, color: '#8c1524', emissive: '#c11a30' },
              ] as const
            ).map(({ x, color: c, emissive }) => (
              <RoundedBox key={x} args={[0.07, 0.03, 0.014]} radius={0.006} smoothness={2} bevelSegments={2} position={[x, profile.roofY - 0.03, z + s * (railDepth + 0.007)]}>
                <meshPhysicalMaterial color={c} emissive={emissive} emissiveIntensity={0.4} roughness={0.25} clearcoat={1} />
              </RoundedBox>
            ))}
            <RoundedBox args={[0.36, 0.05, 0.07]} radius={0.015} smoothness={2} bevelSegments={2} position={[1.25, rockerY - 0.045, z - s * 0.035]}>
              {trimMaterial}
            </RoundedBox>
          </group>
        )
      })}

      {/* shut lines and sheet seams, both sides: the cab door's A-pillar,
          B-pillar and sill seams (`DOOR_SEAMS`) and the box's panel joints
          (`BOX_SEAMS`) - recessed dark strips sunk to the body surface, a
          GAP like the rear door's shut gap, never a ridge. The full wrap
          carves matching slits (and the blending occluder matching holes),
          so every crevice reads through the livery. Bare, a strip is a hair
          wider than its slit; under a wrap only the hole is ever seen, and
          the strip grows to `SEAM_REACH` so that, 19 mm down behind the
          plane, a three-quarter view still finds dark metal through the
          hole rather than the paint beside it. */}
      {SIDES.map((s) => {
        const rTopX = rakedSeamX(RAKED_SEAM.topY)
        const rakedLen = Math.hypot(RAKED_SEAM.bottomX - rTopX, RAKED_SEAM.topY - RAKED_SEAM.bottomY)
        const rakedAngle = Math.atan2(RAKED_SEAM.topY - RAKED_SEAM.bottomY, rTopX - RAKED_SEAM.bottomX)
        const reach = flankWrapped(s) ? SEAM_REACH : 0.004
        return (
          <group key={s}>
            {SIDE_SEAMS.map((seamRect) => {
              const vertical = seamRect.maxY - seamRect.minY > seamRect.maxX - seamRect.minX
              // a horizontal strip's reach stops at the rocker edge (the sill seam)
              const reachY = vertical ? 0.004 : Math.min(reach, seamRect.minY - rockerY - 0.002)
              return (
                <mesh
                  key={`${seamRect.minX}${seamRect.minY}`}
                  position={[(seamRect.minX + seamRect.maxX) / 2, (seamRect.minY + seamRect.maxY) / 2, s * (body.width / 2 - 0.004)]}
                >
                  <boxGeometry
                    args={[
                      seamRect.maxX - seamRect.minX + 2 * (vertical ? reach : 0.004),
                      seamRect.maxY - seamRect.minY + 2 * reachY,
                      0.01,
                    ]}
                  />
                  <meshPhysicalMaterial {...seam} />
                </mesh>
              )
            })}
            {/* raked front seam strip, rotated along the A-pillar slope */}
            <mesh
              position={[(rTopX + RAKED_SEAM.bottomX) / 2, (RAKED_SEAM.topY + RAKED_SEAM.bottomY) / 2, s * (body.width / 2 - 0.004)]}
              rotation-z={rakedAngle}
            >
              <boxGeometry args={[rakedLen + 0.008, RAKED_SEAM.half * 2 + reach * 2, 0.01]} />
              <meshPhysicalMaterial {...seam} />
            </mesh>
          </group>
        )
      })}

      {/* cab door glass, both sides, seated in its rubber gasket: the gasket
          is a flat plate of the inflated outline lying on the body, the
          glass an extrusion standing a few mm proud of it - both well
          behind the wrap plane, seen through the full wrap's carve. When
          perforated film runs over the glass, both sink into the shell
          instead, clear of the plane's z-fighting band (`WRAP_LIFT`). */}
      {SIDES.map((s) => {
        const covered = overGlass && flankWrapped(s)
        const tuck = covered ? 0.02 : 0
        // The 0.02 extrusion always runs +z, so each side's base leaves the
        // outer face 4 mm proud of the cap (or 16 mm inside it when tucked).
        const base = s === 1 ? body.width / 2 - 0.016 - tuck : -body.width / 2 - 0.004 + tuck
        return (
          <group key={s}>
            <mesh
              geometry={flankWrapped(s) && !overGlass ? gasketGeometries.wrapped : gasketGeometries.bare}
              position={[0, 0, s * (body.width / 2 + 0.002 - tuck)]}
            >
              <meshPhysicalMaterial color="#0f1013" metalness={0} roughness={0.9} side={THREE.DoubleSide} />
            </mesh>
            <mesh geometry={doorGlassGeometry} position={[0, 0, base]}>
              {glassMaterial}
            </mesh>
          </group>
        )
      })}

      {/* paddle door handles in a dark recess under the sill, near the
          rear edge of the door where the references mount them */}
      {SIDES.map((s) => (
        <group key={s}>
          <mesh position={[1.3, 0.12, s * (SIDE_PLANE_Z + 0.008)]}>
            <boxGeometry args={[0.2, 0.065, 0.012]} />
            <meshPhysicalMaterial color="#111317" metalness={0.2} roughness={0.8} />
          </mesh>
          <RoundedBox args={[0.15, 0.028, 0.018]} radius={0.008} smoothness={2} bevelSegments={2} position={[1.31, 0.125, s * (SIDE_PLANE_Z + 0.021)]}>
            <meshPhysicalMaterial {...chrome} roughness={0.3} />
          </RoundedBox>
        </group>
      ))}

      {/* West-Coast mirrors: a tall head hung on a tubular frame - two arms
          off the A-pillar at the beltline and below, a vertical tube joining
          them - with a convex spot mirror beneath. The long reach past the
          body is what a walk-in cab needs to see down its own flank */}
      {SIDES.map((s) => {
        const frameZ = s * 1.19
        const headZ = s * 1.215
        return (
          <group key={s}>
            {[0.74, 0.32].map((y) => (
              <mesh key={y} rotation-x={Math.PI / 2} position={[2.03, y, s * ((body.width / 2 + 1.19) / 2)]}>
                <cylinderGeometry args={[0.012, 0.012, 1.19 - body.width / 2 + 0.02, 8]} />
                {trimMaterial}
              </mesh>
            ))}
            <mesh position={[2.03, 0.53, frameZ]}>
              <cylinderGeometry args={[0.012, 0.012, 0.5, 8]} />
              {trimMaterial}
            </mesh>
            <RoundedBox args={[0.045, 0.36, 0.17]} radius={0.012} smoothness={2} bevelSegments={2} position={[2.0, 0.53, headZ]}>
              {trimMaterial}
            </RoundedBox>
            <mesh position={[1.972, 0.53, headZ]} rotation-y={-Math.PI / 2}>
              <planeGeometry args={[0.15, 0.33]} />
              {glassMaterial}
            </mesh>
            <mesh position={[1.995, 0.27, headZ]} rotation-z={Math.PI / 2}>
              <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
              {trimMaterial}
            </mesh>
            <mesh position={[1.983, 0.27, headZ]} rotation-y={-Math.PI / 2}>
              <circleGeometry args={[0.042, 16]} />
              {glassMaterial}
            </mesh>
          </group>
        )
      })}

      {/* windshield on the cowl-to-header segment: a two-piece screen in a
          black rubber gasket, split by the centre post every walk-in cab
          has, with the two wipers parked across its base - the give-away
          cue of a working cab. Local x is the glass normal, y runs up the rake */}
      <group position={[windshield.mid[0], windshield.mid[1], 0]} rotation-z={windshield.tilt}>
        <mesh rotation-y={Math.PI / 2} position-x={-0.006}>
          <planeGeometry args={[body.width - 0.2, windshield.length - 0.04]} />
          <meshPhysicalMaterial color="#0f1013" metalness={0} roughness={0.9} />
        </mesh>
        <mesh rotation-y={Math.PI / 2}>
          <planeGeometry args={[body.width - 0.28, windshield.length - 0.1]} />
          {glassMaterial}
        </mesh>
        <mesh position-x={0.004}>
          <boxGeometry args={[0.008, windshield.length - 0.1, 0.035]} />
          <meshPhysicalMaterial color="#0f1013" metalness={0} roughness={0.9} />
        </mesh>
        {[-0.3, 0.34].map((z) => (
          <group key={z} position={[0.024, -windshield.length / 2 + 0.26, z]} rotation-x={0.42}>
            <mesh>
              <boxGeometry args={[0.01, 0.46, 0.014]} />
              <meshPhysicalMaterial color="#0e0f12" metalness={0.2} roughness={0.85} />
            </mesh>
            <mesh position={[0.006, 0.02, 0]}>
              <boxGeometry args={[0.006, 0.42, 0.03]} />
              <meshPhysicalMaterial color="#0e0f12" metalness={0.2} roughness={0.85} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ---- the nose ---- */}
      {/* chromed grille surround between the headlamps under the hood line,
          a dark mesh panel behind it and five bright slats across */}
      <RoundedBox args={[0.05, 0.3, 0.92]} radius={0.03} smoothness={2} bevelSegments={2} position={[profile.noseX + 0.012, -0.1, 0]}>
        <meshPhysicalMaterial {...chrome} />
      </RoundedBox>
      <mesh position={[profile.noseX + 0.02, -0.1, 0]}>
        <boxGeometry args={[0.03, 0.26, 0.86]} />
        <meshPhysicalMaterial color="#101215" metalness={0.3} roughness={0.7} />
      </mesh>
      {[-2, -1, 0, 1, 2].map((k) => (
        <mesh key={k} position={[profile.noseX + 0.04, -0.1 + k * 0.048, 0]}>
          <boxGeometry args={[0.02, 0.026, 0.84]} />
          <meshPhysicalMaterial color="#2c3037" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {/* headlamp clusters flanking the grille, tops kissing the hood line:
          a dark housing, a clear lens over two projector reflectors, and
          the amber turn signal wrapping the outer end */}
      {SIDES.map((s) => (
        <group key={s} position={[0, -0.09, s * 0.72]}>
          <RoundedBox args={[0.07, 0.25, 0.46]} radius={0.03} smoothness={2} bevelSegments={2} position={[profile.noseX + 0.005, 0, 0]}>
            <meshPhysicalMaterial color="#0d0f12" metalness={0.3} roughness={0.55} />
          </RoundedBox>
          <RoundedBox args={[0.02, 0.19, 0.36]} radius={0.02} smoothness={2} bevelSegments={2} position={[profile.noseX + 0.042, 0, -s * 0.04]}>
            <meshPhysicalMaterial color="#dfe5ee" emissive="#dfe9f5" emissiveIntensity={0.15} metalness={0.2} roughness={0.15} clearcoat={1} />
          </RoundedBox>
          {[-0.13, 0.05].map((dz) => (
            <mesh key={dz} rotation-z={Math.PI / 2} position={[profile.noseX + 0.055, 0, s * dz]}>
              <cylinderGeometry args={[0.052, 0.052, 0.016, 16]} />
              <meshPhysicalMaterial color="#f4f7fb" emissive="#eef4ff" emissiveIntensity={0.6} metalness={0.4} roughness={0.15} clearcoat={1} />
            </mesh>
          ))}
          <RoundedBox args={[0.02, 0.15, 0.07]} radius={0.015} smoothness={2} bevelSegments={2} position={[profile.noseX + 0.052, 0, s * 0.185]}>
            <meshPhysicalMaterial color="#f2a33c" emissive="#ffb340" emissiveIntensity={0.4} roughness={0.25} clearcoat={1} />
          </RoundedBox>
        </group>
      ))}
      {/* license-plate plinth between grille and bumper, sized off the plate
          so the surround stays even if the plate format ever changes. A
          RoundedBox's flat face is only (h - 2r) x (w - 2r), so pad by
          2r + 0.004 per axis to keep 2 mm of flat plinth all round the plate.
          The plate itself is a screen, so it lifts `WRAP_LIFT` off the plinth
          like every other live surface */}
      <RoundedBox args={[0.03, VAN.plate.height + 0.032, VAN.plate.width + 0.032]} radius={0.012} smoothness={2} bevelSegments={2} position={[profile.noseX + 0.012, -0.42, 0]}>
        <meshPhysicalMaterial color="#dfe2e6" metalness={0.1} roughness={0.5} />
      </RoundedBox>
      {plateSlot != null && (
        <DeviceScreen
          width={VAN.plate.width}
          height={VAN.plate.height}
          radius={VAN.plate.radius}
          {...resolveSurface(plateSlot, {
            ...surfaceDefaults,
            surfaceBackground: '#f4f6f8',
            resolution: VAN.plate.resolution,
          })}
          position={[profile.noseX + 0.027 + WRAP_LIFT, -0.42, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          {plateFace}
        </DeviceScreen>
      )}
      {/* black bumper across the nose, wrapping the corners: a deep upper
          bar stepped over a set-back lower bar - the relief that separates
          a moulded bumper from a painted band - with round fog lamps in the
          lower bar and a valance closing under it */}
      <RoundedBox args={[0.16, 0.14, body.width + 0.05]} radius={0.04} smoothness={2} bevelSegments={2} position={[profile.noseX + 0.03, -0.66, 0]}>
        {trimMaterial}
      </RoundedBox>
      <RoundedBox args={[0.13, 0.13, body.width + 0.05]} radius={0.035} smoothness={2} bevelSegments={2} position={[profile.noseX + 0.015, -0.8, 0]}>
        {trimMaterial}
      </RoundedBox>
      <mesh position={[profile.noseX - 0.01, -0.89, 0]}>
        <boxGeometry args={[0.06, 0.05, body.width - 0.5]} />
        <meshPhysicalMaterial {...rubber} />
      </mesh>
      {SIDES.map((s) => (
        <group key={s} position={[profile.noseX + 0.08, -0.8, s * 0.6]}>
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.052, 0.052, 0.02, 16]} />
            <meshPhysicalMaterial color="#0e0f11" metalness={0.3} roughness={0.55} />
          </mesh>
          <mesh rotation-z={Math.PI / 2} position-x={0.008}>
            <cylinderGeometry args={[0.04, 0.04, 0.012, 16]} />
            <meshPhysicalMaterial color="#e8edf4" emissive="#dfe9f5" emissiveIntensity={0.25} metalness={0.3} roughness={0.2} clearcoat={1} />
          </mesh>
        </group>
      ))}

      {/* ---- the tail ---- */}
      {/* rear frame around the door opening: corner posts, header and sill,
          all on one face `REAR_FACE_X` level with the door's slat crests */}
      {SIDES.map((s) => (
        <mesh key={s} position={[(REAR_FACE_X + profile.tailX) / 2, flankMidY, s * ((rollup.halfWidth + ROLLUP_EDGE_GAP + body.width / 2) / 2)]}>
          <boxGeometry args={[profile.tailX - REAR_FACE_X, flankH, body.width / 2 - rollup.halfWidth - ROLLUP_EDGE_GAP]} />
          <meshPhysicalMaterial {...paint} />
        </mesh>
      ))}
      <mesh position={[(REAR_FACE_X + profile.tailX) / 2, (rollup.topY + ROLLUP_EDGE_GAP + profile.roofY) / 2, 0]}>
        <boxGeometry args={[profile.tailX - REAR_FACE_X, profile.roofY - rollup.topY - ROLLUP_EDGE_GAP, rollup.halfWidth * 2]} />
        <meshPhysicalMaterial {...paint} />
      </mesh>
      <mesh position={[(REAR_FACE_X + profile.tailX) / 2, (rockerY + rollup.bottomY - ROLLUP_EDGE_GAP) / 2, 0]}>
        <boxGeometry args={[profile.tailX - REAR_FACE_X, rollup.bottomY - ROLLUP_EDGE_GAP - rockerY, rollup.halfWidth * 2]} />
        <meshPhysicalMaterial {...paint} />
      </mesh>
      {/* the roll-up door leaf, with dark strips sunk in its slat joints
          and shut gap - every rear wrap carves a slit over each joint and
          its occluder a matching hole, so the slats read through any
          livery. The strips only span the live wrap (its hole width plus a
          margin): outside it the door's own grooves and gap are the detail,
          and a bare door shows them as pressed metal, not painted stripes */}
      <mesh geometry={doorGeometry} position-x={ROLLUP_GROOVE_X}>
        <meshPhysicalMaterial {...paint} />
      </mesh>
      {regions.rear != null &&
        ROLLUP_GROOVES.map((y) => (
          <mesh key={y} position={[REAR_STRIP.x, y, 0]}>
            <boxGeometry
              args={[
                REAR_STRIP.depth,
                ROLLUP_GROOVE_HALF * 2 + SEAM_REACH * 2,
                2 *
                  (fullWrap
                    ? rearSlatSpan(true) + 0.012
                    : rearPanel.width / 2 - Math.min(rearPanel.width, rearPanel.height) * SCREEN_MASK_INSET - 0.001),
              ]}
            />
            <meshPhysicalMaterial {...seam} />
          </mesh>
        ))}
      {regions.rear != null && fullWrap && (
        <>
          {SIDES.map((s) => (
            <mesh key={s} position={[REAR_STRIP.x, (rearFull.y - rearFull.height / 2 + rollup.topY) / 2, s * rollup.halfWidth]}>
              <boxGeometry args={[REAR_STRIP.depth, rollup.topY - (rearFull.y - rearFull.height / 2) + 0.016, 0.005 + SEAM_REACH * 2]} />
              <meshPhysicalMaterial {...seam} />
            </mesh>
          ))}
          <mesh position={[REAR_STRIP.x, rollup.topY, 0]}>
            <boxGeometry args={[REAR_STRIP.depth, 0.005 + SEAM_REACH * 2, rollup.halfWidth * 2 + 0.005 + SEAM_REACH * 2]} />
            <meshPhysicalMaterial {...seam} />
          </mesh>
        </>
      )}
      {/* latch bar across the bottom slat with its centre handle, and the
          pull strap hanging off it - under every rear wrap's bottom edge,
          rooted in the frame face and clearing the wrap plane */}
      <mesh position={[(REAR_SCREEN_X - 0.025 + REAR_FACE_X) / 2, -0.72, 0]}>
        <boxGeometry args={[REAR_FACE_X - REAR_SCREEN_X + 0.025, 0.045, rollup.halfWidth * 2 + 0.02]} />
        <meshPhysicalMaterial {...alu} />
      </mesh>
      <RoundedBox args={[0.03, 0.03, 0.12]} radius={0.008} smoothness={2} bevelSegments={2} position={[REAR_SCREEN_X - 0.04, -0.72, 0]}>
        {trimMaterial}
      </RoundedBox>
      <mesh position={[REAR_SCREEN_X - 0.028, -0.79, 0.4]}>
        <boxGeometry args={[0.008, 0.1, 0.045]} />
        <meshPhysicalMaterial {...rubber} />
      </mesh>
      {/* tail-lamp stacks in the corner posts: brake / turn / reverse, each
          lens rooted in the post face and reaching past the wrap plane */}
      {SIDES.map((s) => (
        <group key={s} position={[(REAR_SCREEN_X - 0.03 + REAR_FACE_X) / 2, 0, s * TAIL_LAMPS.z]}>
          {TAIL_LAMPS.lenses.map((lens) => (
            <RoundedBox key={lens.y} args={[REAR_FACE_X - REAR_SCREEN_X + 0.03, lens.height, TAIL_LAMPS.width]} radius={0.015} smoothness={2} bevelSegments={2} position={[0, lens.y, 0]}>
              <meshPhysicalMaterial color={lens.color} emissive={lens.emissive} emissiveIntensity={lens.intensity} roughness={0.25} clearcoat={1} />
            </RoundedBox>
          ))}
        </group>
      ))}
      {/* high-mount third brake light in the header, and three red LED
          markers on the rear top rail */}
      <RoundedBox args={[REAR_FACE_X - REAR_SCREEN_X + 0.025, THIRD_BRAKE.height, THIRD_BRAKE.halfWidth * 2]} radius={0.01} smoothness={2} bevelSegments={2} position={[(REAR_SCREEN_X - 0.025 + REAR_FACE_X) / 2, THIRD_BRAKE.y, 0]}>
        <meshPhysicalMaterial color="#8c1524" emissive="#c11a30" emissiveIntensity={0.45} roughness={0.25} clearcoat={1} />
      </RoundedBox>
      <mesh position={[(REAR_SCREEN_X - 0.03 + REAR_FACE_X) / 2, profile.roofY - 0.005, 0]}>
        <boxGeometry args={[REAR_FACE_X - REAR_SCREEN_X + 0.03, 0.07, body.width + 0.06]} />
        <meshPhysicalMaterial {...alu} />
      </mesh>
      {[-0.14, 0, 0.14].map((z) => (
        <RoundedBox key={z} args={[0.014, 0.028, 0.07]} radius={0.006} smoothness={2} bevelSegments={2} position={[REAR_SCREEN_X - 0.037, profile.roofY - 0.005, z]}>
          <meshPhysicalMaterial color="#8c1524" emissive="#c11a30" emissiveIntensity={0.45} roughness={0.25} clearcoat={1} />
        </RoundedBox>
      ))}
      {/* rear corner caps, the rear legs (the side legs are with the
          flanks): narrow enough to sit outside the full rear wrap's rect,
          so they can run from the shell corner out past the wrap plane */}
      {SIDES.map((s) => (
        <mesh key={s} position={[(REAR_SCREEN_X - 0.032 + profile.tailX) / 2, flankMidY, s * (body.width / 2 - 0.0125)]}>
          <boxGeometry args={[profile.tailX - REAR_SCREEN_X + 0.032, flankH, 0.025]} />
          <meshPhysicalMaterial {...alu} />
        </mesh>
      ))}
      {/* license recess and plate on the sill, left of centre, under every
          rear wrap's bottom edge */}
      <RoundedBox args={[0.03, 0.17, 0.34]} radius={0.012} smoothness={2} bevelSegments={2} position={[REAR_FACE_X - 0.012, -0.78, -0.3]}>
        <meshPhysicalMaterial color="#15171a" metalness={0.2} roughness={0.7} />
      </RoundedBox>
      {/* flat face of a RoundedBox is (h - 2r) x (w - 2r): pad by 2r + 0.004 so the plate sits on flat plinth */}
      <RoundedBox args={[0.014, VAN.plate.height + 0.024, VAN.plate.width + 0.024]} radius={0.008} smoothness={2} bevelSegments={2} position={[REAR_FACE_X - 0.026, -0.78, -0.3]}>
        <meshPhysicalMaterial color="#e6e9ed" metalness={0.05} roughness={0.5} />
      </RoundedBox>
      {plateSlot != null && (
        <DeviceScreen
          width={VAN.plate.width}
          height={VAN.plate.height}
          radius={VAN.plate.radius}
          {...resolveSurface(plateSlot, {
            ...surfaceDefaults,
            surfaceBackground: '#f4f6f8',
            resolution: VAN.plate.resolution,
          })}
          position={[REAR_FACE_X - 0.033 - WRAP_LIFT, -0.78, -0.3]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          {plateFace}
        </DeviceScreen>
      )}
      {/* full-width step bumper hung under the tail on two brackets, its
          top a galvanised diamond plate with raised tread bars - the step
          a driver climbs to reach the door */}
      <mesh position={[profile.tailX - 0.12, -0.955, 0]}>
        <boxGeometry args={[0.24, 0.07, body.width + 0.04]} />
        <meshPhysicalMaterial {...steel} />
      </mesh>
      <mesh position={[profile.tailX - 0.13, -0.918, 0]}>
        <boxGeometry args={[0.22, 0.006, body.width]} />
        <meshPhysicalMaterial color="#9ea3aa" metalness={0.75} roughness={0.5} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => -0.8 + i * 0.2).map((z) => (
        <mesh key={z} position={[profile.tailX - 0.13, -0.912, z]}>
          <boxGeometry args={[0.18, 0.006, 0.014]} />
          <meshPhysicalMaterial color="#b3b8bf" metalness={0.75} roughness={0.45} />
        </mesh>
      ))}
      {SIDES.map((s) => (
        <mesh key={s} position={[profile.tailX + 0.16, -0.93, s * 0.62]}>
          <boxGeometry args={[0.5, 0.05, 0.06]} />
          <meshPhysicalMaterial {...steel} />
        </mesh>
      ))}
      {/* mud flaps behind the rear duals, hung from an aluminium strip */}
      {SIDES.map((s) => (
        <group key={s} position={[wheels.rearX - wheels.archRadius - 0.05, 0, s * 0.71]}>
          <mesh position-y={rockerY - 0.16}>
            <boxGeometry args={[0.02, 0.32, 0.54]} />
            <meshPhysicalMaterial {...rubber} />
          </mesh>
          <mesh position-y={rockerY - 0.005}>
            <boxGeometry args={[0.03, 0.025, 0.56]} />
            <meshPhysicalMaterial {...alu} />
          </mesh>
        </group>
      ))}

      {/* the live wraps: real DOM on the curb side, street side and rear door */}
      <DeviceScreen
        width={side.width}
        height={side.height}
        radius={side.radius}
        {...curbSurface}
        position={[side.x, side.y, SIDE_PLANE_Z]}
        {...sideScreenOcclusion(sideOccluderGeometries?.curb)}
        screenStyle={curbStyle}
      >
        {regions.curbSide?.children}
      </DeviceScreen>
      {regions.streetSide != null && (
        <DeviceScreen
          width={side.width}
          height={side.height}
          radius={side.radius}
          {...streetSurface}
          position={[side.x, side.y, -SIDE_PLANE_Z]}
          rotation={[0, Math.PI, 0]}
          {...sideScreenOcclusion(sideOccluderGeometries?.street)}
          screenStyle={streetStyle}
        >
          {regions.streetSide.children}
        </DeviceScreen>
      )}
      {regions.rear != null && (
        <DeviceScreen
          width={rearSpec.width}
          height={rearSpec.height}
          radius={rearSpec.radius}
          {...rearSurface}
          position={[REAR_SCREEN_X, rearSpec.y, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          occluderGeometry={rearOccluder}
          screenStyle={rearStyle}
        >
          {regions.rear.children}
        </DeviceScreen>
      )}
    </group>
  )
}
VanImpl.displayName = 'Van'

/** The van's compound slots, shared by `<Van>` and `<VanMockup>`. */
export const vanSlots = createSlots(VAN_REGIONS)

export const Van = Object.assign(VanImpl, vanSlots)
