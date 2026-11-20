/**
 * A foldable's hinge, as pure geometry - shared by the book-folds and the
 * clamshells, and by everything that has to agree on the pose: the scene
 * component that draws the spine and the framing that grounds its shadow.
 *
 * Both families are two rigid halves turning about one line, the crease, which
 * lies ON the display surface so the two half-screens meet there at every
 * angle. Seen down that line the device is a planar linkage:
 *
 *   - each half is turned `fold` off flat (0 flat, a quarter turn shut), so
 *     the two back faces stay a constant `reach` from the crease - the body's
 *     thickness plus the air the display keeps above it;
 *   - between the backs sits the hinge housing: a barrel of radius `reach`
 *     whose axis runs parallel to the crease, on the fold's bisector.
 *
 * The one thing that moves along that bisector is the barrel, and where it
 * sits is the whole difference between a hinge and a pop.
 *
 * Flat, its axis is on the crease and it is hidden: its crown is flush with
 * both backs. Shut, a barrel still centred on the crease would stand a full
 * `reach` proud of the folded stack - a half-round as thick as the whole
 * device, 4.4 mm on a Fold whose real spine stands 1.1 mm proud - so the
 * folded pose used to be a second model with its own, shallower spine, and the
 * device jumped from one to the other at the first half-degree. On the
 * hardware the halves close AROUND the housing instead: their hinge ends tuck
 * in beside it until only `overhang` of it is left showing.
 *
 * So the barrel's axis slides in from the crease, between the halves, as the
 * device shuts: by nothing when flat, by `reach - overhang` when shut, and by
 * the same share of that as the fold has turned - `1 - cos(fold)` - between.
 * The crown's distance behind the crease is then simply `reach` and
 * `overhang` blended by `cos(fold)`, which is flush when flat, `overhang`
 * when shut, monotonic, and moving slowest at the flat end where there is
 * nothing to see. One rigid barrel, one continuous motion, both end poses.
 *
 * Pure math, no renderer: see `__tests__/hinge.test.ts`.
 */

/**
 * The least a foldable's display stands above its chassis face: clear of the
 * cover glass drawn beneath it.
 */
export const MIN_DISPLAY_STANDOFF = 0.006

/**
 * How far a foldable's inner display stands above its chassis face, given the
 * air its halves keep between them when shut.
 *
 * The halves turn about the crease, and the crease has to lie on the display
 * surface for the two half-screens to meet along it at every angle. Shut, the
 * two display surfaces are therefore back on one plane, and the chassis faces
 * are twice the standoff apart - so half the shut gap is the standoff that
 * makes the folded stack come out at its published thickness.
 */
export function displayStandoff(shutGap: number): number {
  return Math.max(MIN_DISPLAY_STANDOFF, shutGap / 2)
}

export interface HingeSpine {
  /** How far each half is turned off flat, in radians: 0 flat, π/2 shut. */
  fold: number
  /** The barrel's radius: the crease's distance to either half's back face. */
  radius: number
  /** How far the barrel's axis sits from the crease, in between the halves. */
  inset: number
  /** How far the barrel's crown stands behind the crease, along the bisector. */
  crown: number
  /**
   * Where the barrel emerges from each half: the distance from the crease,
   * down that half's hinge-end face toward its back, at which the barrel
   * crosses it. `radius` when flat (the back corner itself, so the barrel
   * wraps the fold with no step); less as the halves close over it.
   */
  seat: number
  /** Half the exposed arc, in radians at the barrel's own axis, from the crown. */
  halfArc: number
  /** Width of the exposed band: the chord between the two seats. */
  width: number
}

/**
 * The hinge housing's pose at `openAngle` degrees (0 shut, 180 flat).
 *
 * @param reach    Crease to back face: the half's thickness plus the display's
 *                 standoff above it.
 * @param overhang How far the housing stands proud of the halves' hinge ends
 *                 when the device is shut.
 */
export function hingeSpine(openAngle: number, reach: number, overhang: number): HingeSpine {
  const angle = Math.max(0, Math.min(180, openAngle))
  const fold = ((180 - angle) / 2) * (Math.PI / 180)
  const cos = Math.cos(fold)
  const sin = Math.sin(fold)
  const inset = (reach - Math.min(overhang, reach)) * (1 - cos)
  // The barrel's circle against a half's hinge-end face - the line from the
  // crease straight toward that half's back: |seat * n - inset * b| = reach,
  // with the face's direction `n` at `fold` from the bisector `b`.
  const seat = -inset * cos + Math.sqrt(reach * reach - inset * inset * sin * sin)
  const halfArc = Math.atan2(seat * sin, seat * cos + inset)
  return { fold, radius: reach, inset, crown: reach - inset, seat, halfArc, width: 2 * seat * sin }
}

/**
 * How far the hinge reaches past the crease on the side the moving half
 * leaves from, with the other half held still - the pose every foldable here
 * is drawn in. It is what stands lowest when the device lies with that side
 * down: `overhang` when shut, the swinging half's back corner as it comes
 * round, and nothing once it is flat.
 */
export function hingeReach(openAngle: number, reach: number, overhang: number): number {
  const spine = hingeSpine(openAngle, reach, overhang)
  // The swinging half has turned `2 * fold` from flat; its back corner at the
  // hinge end rides a circle of radius `reach` about the crease.
  const corner = reach * Math.sin(2 * spine.fold)
  // The barrel's own extreme on that side counts only while it is on the
  // exposed arc - past that it is inside the half.
  const exposed = Math.PI / 2 - spine.fold <= spine.halfArc
  const barrel = exposed ? spine.radius - spine.inset * Math.sin(spine.fold) : 0
  return Math.max(corner, barrel)
}
