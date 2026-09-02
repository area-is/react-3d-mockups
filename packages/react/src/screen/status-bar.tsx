import * as React from 'react'
import {
  resolveStatusBarContent,
  statusBarLayout,
  type StatusBarBattery,
  type StatusBarContent,
  type StatusBarCutout,
  type StatusBarFormFactor,
  type StatusBarPlatform,
} from '../core'

/**
 * The system status bar, drawn over the top of a live screen.
 *
 * Every glyph is an inline SVG on its own point grid rather than a font glyph
 * or an image: a mockup is looked at closely and at an angle, and the parts
 * people recognise - the four ascending cellular bars, the three Wi-Fi arcs,
 * the battery capsule with its nub - have to stay crisp at any size and take
 * the surface's colour. The proportions are each platform's own, so an iOS
 * battery is Apple's rounded 25x13 capsule and a One UI battery is Samsung's
 * pill with the percentage set into it.
 *
 * It is positioned, never in flow: the bar sits above whatever the caller
 * passes as children and always at the top of the panel, which is what a real
 * status bar does. Content laid out underneath it is the caller's business -
 * the same as on a real device, where the bar overlaps whatever is behind it.
 */

export interface StatusBarProps extends StatusBarContent {
  platform: StatusBarPlatform
  formFactor: StatusBarFormFactor
  /** Surface width in CSS px. */
  width: number
  /** The device's front-camera cutout, when it has one. */
  cutout?: StatusBarCutout
  /** The display's corner radius in CSS px, so the clusters clear the arc. */
  corner?: number
  /**
   * Ink. Defaults to white, which is what sits over the dark wallpapers and
   * full-bleed art these mockups usually carry; pass a dark value for a light
   * screen, exactly as an app picks its status-bar style.
   */
  color?: string
}

/** The tint a battery's fill takes in each state, if not the ink. */
const batteryFill = (state: StatusBarBattery, ink: string, low: string, charging: string) =>
  state === 'low' ? low : state === 'charging' ? charging : ink

/**
 * A meter with its number set into it: ink over the empty run of the track,
 * knocked out of the filled run. This is how iOS 16's capsule and One UI 8.5's
 * pill both print the percentage - the digits invert where they cross the
 * fill, so they never vanish into it at any level.
 *
 * Two clipped copies of the same shape, sharing one label: the filled run is
 * painted in the meter's colour with the label masked out of it, and the rest
 * is painted faintly with the label drawn on top in ink.
 */
function LabeledMeter({
  x,
  y,
  width,
  height,
  rx,
  level,
  color,
  fill,
  label,
}: {
  x: number
  y: number
  width: number
  height: number
  rx: number
  level: number
  /** Ink: the empty run and the digits over it. */
  color: string
  /** The filled run - ink, or a charge or low-battery tint. */
  fill: string
  /** The label, in the given paint. Rendered once per layer. */
  label: (paint: string) => React.ReactNode
}) {
  // One bar per screen, many screens per page: the ids have to be unique.
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, '')
  const filled = width * level
  return (
    <>
      <defs>
        <clipPath id={`${id}f`}>
          <rect x={x} y={y} width={filled} height={height} />
        </clipPath>
        <clipPath id={`${id}r`}>
          <rect x={x + filled} y={y} width={width - filled} height={height} />
        </clipPath>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={x} y={y} width={width} height={height}>
          <rect x={x} y={y} width={width} height={height} fill="#fff" />
          {label('#000')}
        </mask>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={rx}
        fill={fill}
        clipPath={`url(#${id}f)`}
        mask={`url(#${id}m)`}
      />
      <g clipPath={`url(#${id}r)`}>
        <rect x={x} y={y} width={width} height={height} rx={rx} fill={color} opacity={0.32} />
        {label(color)}
      </g>
    </>
  )
}

/**
 * The baseline that centres a run of digits on `cy`: half a cap height below
 * it. Set explicitly rather than with `dominant-baseline`, which the fallback
 * fonts do not all agree on.
 */
const baseline = (cy: number, fontSize: number) => cy + fontSize * 0.36

/** A charge bolt, on a 6x10 grid at the origin. */
const Bolt = ({ x, y, scale, paint }: { x: number; y: number; scale: number; paint: string }) => (
  <path
    d="M3.6 0 0 5.6h2.4L1.9 10 6 4.2H3.5z"
    fill={paint}
    transform={`translate(${x} ${y}) scale(${scale})`}
  />
)

/** iOS cellular: four bars, equal width, ascending, square-ish corners. */
function IosSignal({ h, lit, color }: { h: number; lit: number; color: string }) {
  const w = h * 1.42
  const bars = 4
  const barW = (w / bars) * 0.62
  const step = w / bars
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden focusable="false">
      {Array.from({ length: bars }, (_, i) => {
        const barH = h * (0.42 + (i * 0.58) / (bars - 1))
        return (
          <rect
            key={i}
            x={i * step}
            y={h - barH}
            width={barW}
            height={barH}
            rx={barW * 0.3}
            fill={color}
            opacity={i < lit ? 1 : 0.32}
          />
        )
      })}
    </svg>
  )
}

/** iOS Wi-Fi: a dot with three concentric arcs opening upward. */
function IosWifi({ h, lit, color }: { h: number; lit: number; color: string }) {
  const w = h * 1.38
  // Drawn on a 20x14 grid, so the arc weights stay in proportion at any size.
  const arcs = [
    { r: 4.2, o: 1 },
    { r: 7.6, o: 2 },
    { r: 11, o: 3 },
  ]
  return (
    <svg width={w} height={h} viewBox="0 0 20 14" aria-hidden focusable="false" style={{ width: w, height: h }}>
      <circle cx="10" cy="12" r="1.7" fill={color} opacity={lit > 0 ? 1 : 0.32} />
      {arcs.map(({ r, o }) => (
        <path
          key={r}
          d={`M ${10 - r} 12 A ${r} ${r} 0 0 1 ${10 + r} 12`}
          fill="none"
          stroke={color}
          strokeWidth={1.9}
          strokeLinecap="round"
          opacity={lit >= o ? 1 : 0.32}
        />
      ))}
    </svg>
  )
}

/**
 * iOS battery: Apple's 25x13 rounded capsule with a nub on the trailing edge.
 * Plain, it is a faint outline with the charge inset in it. With the
 * percentage on - which iOS 16 brought to every iPhone - the outline goes and
 * the capsule itself becomes the meter, the number set into it.
 */
function IosBattery({
  h,
  level,
  state,
  color,
  percent,
}: {
  h: number
  level: number
  state: StatusBarBattery
  color: string
  percent: boolean
}) {
  const w = h * (27 / 13)
  const fill = batteryFill(state, color, '#ff3b30', '#34c759')
  const label = String(Math.round(level * 100))
  // The bolt shares the capsule with two digits; with three there is no room,
  // and the green fill already says it is charging.
  const bolt = state === 'charging' && label.length < 3
  const size = label.length >= 3 ? 9.6 : bolt ? 9.4 : 11
  return (
    <svg width={w} height={h} viewBox="0 0 27 13" aria-hidden focusable="false" style={{ width: w, height: h }}>
      <path d="M25.8 4.6c1 .3 1.4 1 1.4 1.9s-.4 1.6-1.4 1.9z" fill={color} opacity="0.42" />
      {percent ? (
        <LabeledMeter
          x={0}
          y={0}
          width={25}
          height={13}
          rx={4.2}
          level={level}
          color={color}
          fill={fill}
          label={(paint) => (
            <>
              {bolt ? <Bolt x={2} y={2.6} scale={0.78} paint={paint} /> : null}
              <text
                // Sized by what it has to fit: three digits squeeze down the
                // way SF's compact numerals do on the real thing, and two
                // give a little to the bolt. Not `textLength` - Chromium
                // scales those glyphs about the origin rather than the anchor
                // and paints them somewhere else.
                x={bolt ? 17 : 12.5}
                y={baseline(6.5, size)}
                textAnchor="middle"
                fontSize={size}
                fontWeight={700}
                fill={paint}
              >
                {label}
              </text>
            </>
          )}
        />
      ) : (
        <>
          <rect
            x="0.6"
            y="0.6"
            width="23.8"
            height="11.8"
            rx="3.6"
            fill="none"
            stroke={color}
            strokeWidth="1.1"
            opacity="0.42"
          />
          <rect
            x="2.1"
            y="2.1"
            width={Math.max(0, 20.8 * level)}
            height="8.8"
            rx="2.2"
            fill={fill}
          />
          {state === 'charging' ? <Bolt x={9.6} y={1.6} scale={0.98} paint="#000" /> : null}
        </>
      )}
    </svg>
  )
}

/** One UI cellular: four bars, tighter and squarer than Apple's. */
function OneUiSignal({ h, lit, color }: { h: number; lit: number; color: string }) {
  const bars = 4
  const w = h * 1.3
  const barW = (w / bars) * 0.7
  const step = w / bars
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden focusable="false">
      {Array.from({ length: bars }, (_, i) => {
        const barH = h * (0.34 + (i * 0.66) / (bars - 1))
        return (
          <rect
            key={i}
            x={i * step}
            y={h - barH}
            width={barW}
            height={barH}
            rx={barW * 0.22}
            fill={color}
            opacity={i < lit ? 1 : 0.3}
          />
        )
      })}
    </svg>
  )
}

/** One UI Wi-Fi: a solid fan rather than Apple's separated arcs. */
function OneUiWifi({ h, lit, color }: { h: number; lit: number; color: string }) {
  const w = h * 1.3
  return (
    <svg width={w} height={h} viewBox="0 0 20 15" aria-hidden focusable="false" style={{ width: w, height: h }}>
      <path
        d="M10 14.2 0.7 4.6A13.2 13.2 0 0 1 19.3 4.6Z"
        fill={color}
        opacity={lit >= 3 ? 1 : 0.3}
      />
      {lit > 0 && lit < 3 && (
        <path d="M10 14.2 4.6 8.6a7.6 7.6 0 0 1 10.8 0Z" fill={color} />
      )}
    </svg>
  )
}

/**
 * One UI battery. Since One UI 8.5 it is a pill, a touch taller than the
 * icons beside it, filled to the charge with the percentage set into the
 * fill - so that is the default. Without the percentage it falls back to the
 * squarer outline capsule of the releases before, nub on the trailing edge.
 */
function OneUiBattery({
  h,
  level,
  state,
  color,
  percent,
}: {
  h: number
  level: number
  state: StatusBarBattery
  color: string
  percent: boolean
}) {
  const fill = batteryFill(state, color, '#ff4d4f', '#3ddc84')
  if (percent) {
    const label = String(Math.round(level * 100))
    const H = 14
    // The pill grows with what it carries: three digits, and a bolt on charge.
    const W = (label.length >= 3 ? 30 : 25) + (state === 'charging' ? 10 : 0)
    const height = h * 1.12
    const width = height * (W / H)
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${W} ${H}`}
        aria-hidden
        focusable="false"
        style={{ width, height }}
      >
        <LabeledMeter
          x={0}
          y={0}
          width={W}
          height={H}
          rx={H / 2}
          level={level}
          color={color}
          fill={fill}
          label={(paint) => (
            <>
              {state === 'charging' ? <Bolt x={3} y={2.25} scale={0.95} paint={paint} /> : null}
              <text
                x={W / 2 + (state === 'charging' ? 5 : 0)}
                y={baseline(H / 2, 11.6)}
                textAnchor="middle"
                fontSize={11.6}
                fontWeight={700}
                fill={paint}
              >
                {label}
              </text>
            </>
          )}
        />
      </svg>
    )
  }
  const w = h * (24 / 12)
  return (
    <svg width={w} height={h} viewBox="0 0 26 12" aria-hidden focusable="false" style={{ width: w, height: h }}>
      <rect
        x="0.7"
        y="0.7"
        width="22.6"
        height="10.6"
        rx="2.6"
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        opacity="0.45"
      />
      <rect x="24.4" y="3.6" width="1.6" height="4.8" rx="0.8" fill={color} opacity="0.45" />
      <rect x="2.4" y="2.4" width={Math.max(0, 19.2 * level)} height="7.2" rx="1.4" fill={fill} />
      {state === 'charging' ? <Bolt x={9.4} y={1.2} scale={0.96} paint="#000" /> : null}
    </svg>
  )
}

/**
 * The clock and the trailing cluster, placed by `statusBarLayout`.
 *
 * The two are absolutely positioned rather than laid out in a flex row,
 * because on iOS they are not a row: each is centred in its own ear either
 * side of the Dynamic Island, and the gap between them is hardware.
 *
 * The trailing cluster runs in each system's own order. iOS reads signal,
 * Wi-Fi, battery; One UI reads Wi-Fi, signal, battery. And the percentage,
 * when shown, goes where each puts it: inside the iPhone's capsule, written
 * out as `100%` before the iPad's, and inside One UI's pill.
 */
export function StatusBar({
  platform,
  formFactor,
  width,
  cutout,
  corner,
  color = '#ffffff',
  ...content
}: StatusBarProps) {
  const layout = statusBarLayout({ platform, formFactor, width, cutout, corner })
  const { time, date, signal, wifi, battery, batteryState, batteryPercent, carrier } =
    resolveStatusBarContent(content, platform, formFactor)
  const ios = platform === 'ios'
  const tablet = formFactor === 'tablet'
  const h = layout.iconHeight

  const clusterStyle: React.CSSProperties = {
    position: 'absolute',
    top: layout.centerY,
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: layout.gap,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  }
  const textStyle: React.CSSProperties = {
    fontSize: layout.fontSize,
    fontWeight: layout.fontWeight,
    letterSpacing: `${layout.letterSpacing}em`,
  }

  return (
    <div
      aria-hidden
      data-status-bar={platform}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height: layout.bandHeight,
        color,
        // Apple ships San Francisco and Samsung ships One UI Sans; neither is
        // ours to bundle, so this asks for the platform's own UI face first and
        // falls back to whatever the host has. On a Mac and on an Android
        // device the first name resolves and the bar is set in the real thing.
        fontFamily: ios
          ? '-apple-system, "SF Pro Text", "SF Pro Display", system-ui, sans-serif'
          : '"One UI Sans", "Samsung Sans", Roboto, system-ui, sans-serif',
        fontVariantNumeric: 'tabular-nums',
        pointerEvents: 'none',
        /*
         * No z-index. The bar is the surface's last child, so it already
         * paints over the content, and asking for one costs a great deal more
         * than it buys: a stacking context on a stack of CSS3D-transformed
         * layers pushes Chromium to rasterize each screen on its own
         * full-resolution layer, which blows the tile budget and leaves the
         * glass blank - the same failure the fill-mode note in the docs'
         * carousel describes. Painting order is enough.
         */
      }}
    >
      <div
        style={{
          ...clusterStyle,
          // iOS centres the clock in the left ear, so the anchor is that ear's
          // centre and the text is pulled back by half of itself. One UI sets
          // it flush to the inset, where a left edge is a left edge.
          left: layout.leadingX,
          transform: layout.split ? 'translate(-50%, -50%)' : 'translateY(-50%)',
        }}
      >
        <span style={textStyle}>{time}</span>
        {ios && tablet && date ? (
          <span style={{ ...textStyle, marginLeft: layout.gap * 0.5 }}>{date}</span>
        ) : null}
        {!ios && carrier ? (
          <span style={{ fontSize: layout.fontSize * 0.86, fontWeight: 500, opacity: 0.85 }}>
            {carrier}
          </span>
        ) : null}
      </div>

      <div
        style={{
          ...clusterStyle,
          left: layout.trailingX,
          transform: layout.split ? 'translate(-50%, -50%)' : 'translate(-100%, -50%)',
        }}
      >
        {ios ? (
          <>
            <IosSignal h={h} lit={signal} color={color} />
            <IosWifi h={h} lit={wifi} color={color} />
            {tablet && batteryPercent ? (
              <span style={{ ...textStyle, marginLeft: layout.gap * 0.4 }}>
                {Math.round(battery * 100)}%
              </span>
            ) : null}
            <IosBattery
              h={h}
              level={battery}
              state={batteryState}
              color={color}
              percent={batteryPercent && !tablet}
            />
          </>
        ) : (
          <>
            <OneUiWifi h={h} lit={wifi} color={color} />
            <OneUiSignal h={h} lit={signal} color={color} />
            <OneUiBattery
              h={h}
              level={battery}
              state={batteryState}
              color={color}
              percent={batteryPercent}
            />
          </>
        )}
      </div>
    </div>
  )
}

/**
 * How a device exposes the bar: `true` for the defaults, or an object to set
 * the time, the meters and the ink.
 *
 * A boolean rather than a component, because the bar is not content - it is
 * part of the device, drawn in the device's own units and placed against the
 * device's own camera cutout. Passing it as children would put the caller in
 * charge of geometry only the model knows.
 */
export type StatusBarOption = boolean | (StatusBarContent & { color?: string })

/** Resolve the prop into the element the device overlays, or nothing. */
export function renderStatusBar(
  option: StatusBarOption | undefined,
  base: {
    platform: StatusBarPlatform
    formFactor: StatusBarFormFactor
    width: number
    cutout?: StatusBarCutout
    corner?: number
  }
): React.ReactNode {
  if (!option) return null
  return <StatusBar {...base} {...(option === true ? {} : option)} />
}
