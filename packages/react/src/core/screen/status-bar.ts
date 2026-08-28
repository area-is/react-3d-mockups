/**
 * The system status bar: where it sits, how big its parts are.
 *
 * A mockup is judged on the details a person already knows by heart, and the
 * strip across the top of a phone is the one every viewer has looked at ten
 * thousand times. So none of this is invented: the band is derived from the
 * hardware the library already measures, and the parts are given in the units
 * the platforms themselves specify.
 *
 * **The band is placed by the camera, not by a constant.** Both platforms
 * centre the status bar on the front camera - iOS on the Dynamic Island, One UI
 * on the punch hole - because that is the strip of glass the cutout already
 * costs them. Every device here carries its cutout's real size and offset (see
 * `IPHONE_VARIANTS[].island`, `GALAXY_VARIANTS[].punchHole`, and the same on
 * the foldables), so deriving the band from it means the time and the icons
 * line up with the hardware drawn behind them on every variant, at whatever
 * logical resolution that variant declares. A hardcoded "44pt" would be right
 * for one phone and wrong for the next.
 *
 * **The parts are absolute, not proportional.** A status bar does not scale
 * with the display: iOS sets the clock at 17pt on a 402pt iPhone and ~13pt on
 * a 1032pt iPad, and One UI likewise works in fixed dp. So these are point
 * values, applied against each device's own logical grid - which is exactly
 * what makes an iPad's bar read as an iPad's rather than as a big phone's.
 *
 * Nothing here renders anything; it is arithmetic a binding can test. The DOM
 * lives in `src/screen/status-bar.tsx`.
 */

/**
 * Which system's status bar to draw.
 *
 * `ios` covers iPhone and iPad; `oneui` covers Samsung's Galaxy phones,
 * foldables and tablets. They differ in more than styling - the clock is
 * centred in the left "ear" on iOS and flush-left on One UI - so this picks a
 * layout, not a skin.
 */
export type StatusBarPlatform = 'ios' | 'oneui'

/** Phone-sized or tablet-sized: the platforms set their bars differently. */
export type StatusBarFormFactor = 'phone' | 'tablet'

/** A front-camera cutout, in the surface's own CSS pixels. */
export interface StatusBarCutout {
  /** Half the cutout's width - the pill's or the hole's. */
  halfWidth: number
  /** Centre of the cutout below the top display edge. */
  centerY: number
  /** Signed offset of that centre from the display's vertical centre line. */
  offsetX: number
}

/** Sizes for one platform at one form factor, in logical points/dp. */
export interface StatusBarMetrics {
  /** Type size of the clock. */
  fontSize: number
  /** Cap height of the glyph row - signal, wifi, battery. */
  iconHeight: number
  /** Space between adjacent glyphs in the trailing cluster. */
  gap: number
  /** Leading/trailing inset when the bar is not placed against a cutout. */
  inset: number
  /** Band height used when the device has no cutout to centre on. */
  height: number
  /** Weight the clock is set at. */
  fontWeight: number
  /** Tracking, in em. */
  letterSpacing: number
}

/**
 * iOS. The clock is SF Pro at 17pt semibold on iPhone - the size Apple has kept
 * across every notch and island generation - and drops to 14pt on iPad, where
 * the bar is a 24pt strip with no cutout to work around.
 */
const IOS_PHONE: StatusBarMetrics = {
  fontSize: 17,
  iconHeight: 12,
  gap: 5,
  inset: 28,
  height: 54,
  fontWeight: 600,
  letterSpacing: 0,
}

const IOS_TABLET: StatusBarMetrics = {
  fontSize: 14,
  iconHeight: 11,
  gap: 6,
  inset: 24,
  height: 24,
  fontWeight: 600,
  letterSpacing: 0,
}

/**
 * One UI. Samsung sets a smaller, bolder clock than Apple and puts it flush
 * left rather than centring it, with the trailing cluster tight against the
 * right inset. The band is shallower: a punch hole costs less glass than an
 * island, and One UI spends less of it.
 */
const ONEUI_PHONE: StatusBarMetrics = {
  fontSize: 13,
  iconHeight: 11,
  gap: 5,
  inset: 16,
  height: 30,
  fontWeight: 700,
  letterSpacing: 0,
}

const ONEUI_TABLET: StatusBarMetrics = {
  fontSize: 14,
  iconHeight: 12,
  gap: 6,
  inset: 22,
  height: 32,
  fontWeight: 700,
  letterSpacing: 0,
}

const METRICS: Record<StatusBarPlatform, Record<StatusBarFormFactor, StatusBarMetrics>> = {
  ios: { phone: IOS_PHONE, tablet: IOS_TABLET },
  oneui: { phone: ONEUI_PHONE, tablet: ONEUI_TABLET },
}

/** The measurements for one platform and form factor. */
export function statusBarMetrics(
  platform: StatusBarPlatform,
  formFactor: StatusBarFormFactor
): StatusBarMetrics {
  return METRICS[platform][formFactor]
}

export interface StatusBarLayoutOptions {
  platform: StatusBarPlatform
  formFactor: StatusBarFormFactor
  /** The surface's width in CSS px - the device's logical point grid. */
  width: number
  /** The front-camera cutout, when the device has one. */
  cutout?: StatusBarCutout
}

/** Where the bar's parts land on the surface, in CSS px from the top-left. */
export interface StatusBarLayout extends StatusBarMetrics {
  /** Height of the band the bar reserves at the top of the screen. */
  bandHeight: number
  /** Vertical centre of the glyph row, below the top display edge. */
  centerY: number
  /** Left edge of the clock. */
  leadingX: number
  /** Right edge of the trailing cluster. */
  trailingX: number
  /**
   * Whether the two clusters are split around a cutout. iOS centres each in
   * its "ear"; One UI keeps them at the insets and simply clears the hole.
   */
  split: boolean
}

/**
 * Place the status bar on a surface.
 *
 * With a cutout, the glyph row is centred on it vertically, and the band runs
 * to the bottom of the cutout plus the same margin it has above - which is what
 * makes the bar look like it was designed around the camera rather than dropped
 * on top of it.
 *
 * Horizontally the platforms part company. iOS centres the clock in the space
 * left of the island and the icons in the space right of it, so both drift
 * outward as the island grows; One UI leaves both at a fixed inset, because a
 * punch hole is small enough to ignore. Without a cutout (every iPad, and the
 * Galaxy Tab) there are no ears, so both sit at the inset and the band takes
 * its fixed height.
 */
export function statusBarLayout({
  platform,
  formFactor,
  width,
  cutout,
}: StatusBarLayoutOptions): StatusBarLayout {
  const metrics = statusBarMetrics(platform, formFactor)

  if (!cutout) {
    return {
      ...metrics,
      bandHeight: metrics.height,
      centerY: metrics.height / 2,
      leadingX: metrics.inset,
      trailingX: width - metrics.inset,
      split: false,
    }
  }

  const centerY = cutout.centerY
  // Symmetrical about the cutout: whatever glass sits above it sits below it.
  const bandHeight = centerY * 2
  const cutoutCenterX = width / 2 + cutout.offsetX
  const earStart = cutoutCenterX - cutout.halfWidth
  const earEnd = cutoutCenterX + cutout.halfWidth
  const split = platform === 'ios'

  return {
    ...metrics,
    bandHeight,
    centerY,
    // On iOS the clock is centred in the left ear; the caller measures its own
    // text, so this is the ear's centre and the binding shifts by half a width.
    leadingX: split ? earStart / 2 : metrics.inset,
    trailingX: split ? (earEnd + width) / 2 : width - metrics.inset,
    split,
  }
}

/** Battery states the bar can show; each paints its fill differently. */
export type StatusBarBattery = 'normal' | 'charging' | 'low'

/**
 * What the bar says.
 *
 * The defaults are the ones the industry already agreed on: 9:41 is the time in
 * every Apple keynote shot, and a full-strength, fully-charged device is what a
 * product image shows. `carrier` is One UI only - iOS has not shown one in the
 * status bar for years.
 */
export interface StatusBarContent {
  /** Clock face. Defaults to `9:41`, Apple's canonical keynote time. */
  time?: string
  /** Cellular bars lit, 0-4. */
  signal?: number
  /** Wi-Fi arcs lit, 0-3. */
  wifi?: number
  /** Charge level, 0-1. */
  battery?: number
  batteryState?: StatusBarBattery
  /** Show the charge as a number beside the icon - a One UI habit. */
  batteryPercent?: boolean
  /** Carrier name, One UI only. */
  carrier?: string
}

/** Fully resolved content, defaults applied. */
export type ResolvedStatusBarContent = Required<Omit<StatusBarContent, 'carrier'>> & {
  carrier?: string
}

export const STATUS_BAR_DEFAULTS: ResolvedStatusBarContent = {
  time: '9:41',
  signal: 4,
  wifi: 3,
  battery: 1,
  batteryState: 'normal',
  batteryPercent: false,
}

/** Apply the defaults, and clamp anything a caller can get wrong. */
export function resolveStatusBarContent(content?: StatusBarContent): ResolvedStatusBarContent {
  const merged = { ...STATUS_BAR_DEFAULTS, ...content }
  return {
    ...merged,
    signal: clamp(Math.round(merged.signal), 0, 4),
    wifi: clamp(Math.round(merged.wifi), 0, 3),
    battery: clamp(merged.battery, 0, 1),
  }
}

const clamp = (n: number, lo: number, hi: number): number =>
  Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : hi
