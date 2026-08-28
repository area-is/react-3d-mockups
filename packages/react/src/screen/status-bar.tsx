import * as React from 'react'
import {
  resolveStatusBarContent,
  statusBarLayout,
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
 * squarer, bolder one.
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
  /**
   * Ink. Defaults to white, which is what sits over the dark wallpapers and
   * full-bleed art these mockups usually carry; pass a dark value for a light
   * screen, exactly as an app picks its status-bar style.
   */
  color?: string
}

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

/** iOS battery: a 25x13 rounded capsule, a 1pt outline, a nub, an inset fill. */
function IosBattery({
  h,
  level,
  state,
  color,
}: {
  h: number
  level: number
  state: 'normal' | 'charging' | 'low'
  color: string
}) {
  const w = h * (25 / 13)
  const fill = state === 'low' ? '#ff3b30' : state === 'charging' ? '#34c759' : color
  return (
    <svg width={w} height={h} viewBox="0 0 27 13" aria-hidden focusable="false" style={{ width: w, height: h }}>
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
      <path
        d="M25.8 4.6c1 .3 1.4 1 1.4 1.9s-.4 1.6-1.4 1.9z"
        fill={color}
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

/** One UI battery: squarer body, heavier outline, nub on the trailing edge. */
function OneUiBattery({
  h,
  level,
  state,
  color,
}: {
  h: number
  level: number
  state: 'normal' | 'charging' | 'low'
  color: string
}) {
  const w = h * (24 / 12)
  const fill = state === 'low' ? '#ff4d4f' : state === 'charging' ? '#3ddc84' : color
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
    </svg>
  )
}

/**
 * The clock and the trailing cluster, placed by `statusBarLayout`.
 *
 * The two are absolutely positioned rather than laid out in a flex row,
 * because on iOS they are not a row: each is centred in its own ear either
 * side of the Dynamic Island, and the gap between them is hardware.
 */
export function StatusBar({
  platform,
  formFactor,
  width,
  cutout,
  color = '#ffffff',
  ...content
}: StatusBarProps) {
  const layout = statusBarLayout({ platform, formFactor, width, cutout })
  const { time, signal, wifi, battery, batteryState, batteryPercent, carrier } =
    resolveStatusBarContent(content)
  const ios = platform === 'ios'
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
        <span
          style={{
            fontSize: layout.fontSize,
            fontWeight: layout.fontWeight,
            letterSpacing: `${layout.letterSpacing}em`,
          }}
        >
          {time}
        </span>
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
        {batteryPercent ? (
          <span style={{ fontSize: layout.fontSize * 0.86, fontWeight: layout.fontWeight }}>
            {Math.round(battery * 100)}
          </span>
        ) : null}
        {ios ? (
          <>
            <IosSignal h={h} lit={signal} color={color} />
            <IosWifi h={h} lit={wifi} color={color} />
            <IosBattery h={h} level={battery} state={batteryState} color={color} />
          </>
        ) : (
          <>
            <OneUiSignal h={h} lit={signal} color={color} />
            <OneUiWifi h={h} lit={wifi} color={color} />
            <OneUiBattery h={h} level={battery} state={batteryState} color={color} />
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
  }
): React.ReactNode {
  if (!option) return null
  return <StatusBar {...base} {...(option === true ? {} : option)} />
}
