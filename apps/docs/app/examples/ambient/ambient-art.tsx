'use client'

import type { CSSProperties } from 'react'
import { FONT, Pattern } from '@/components/screens/swiss-art'
import { Face } from '../_shared/face'
import { MATTES, findChannel, type Settings } from './ambient-data'

/**
 * A channel on each kind of screen.
 *
 * All of them are `live`: they read the site's shared clock and turn to a
 * new composition every couple of seconds, together, which is the product.
 * Each surface keys its seed by its own name, so a room of screens shows
 * the same channel in different compositions rather than one picture
 * repeated - a gallery, not a mirror.
 */

function ink(palette: string[]): string {
  // The palette's ground decides whether the caption is light or dark.
  const n = Number.parseInt(palette[0]!.slice(1), 16)
  const lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255
  return lum > 0.5 ? 'rgba(20, 18, 16, 0.75)' : 'rgba(255, 255, 255, 0.8)'
}

const CAPTION: CSSProperties = { fontFamily: FONT, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1 }

/** The Frame TV (1920 x 1080): art mode, with or without a matte. */
export function FrameArt({ settings }: { settings: Settings }) {
  const channel = findChannel(settings.channel)
  const matte = MATTES.find((m) => m.id === settings.matte)?.color ?? null
  return (
    <Face background={matte ?? channel.palette[0]} style={{ padding: matte ? '5cqh 5cqh' : 0, boxSizing: 'border-box' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', background: channel.palette[0], overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <Pattern pattern={channel.pattern} live seed={`ambient-frame-${channel.id}`} palette={channel.palette} grid={channel.grid} />
        </div>
      </div>
      <span style={{ position: 'absolute', right: '5cqh', bottom: '1.4cqh', ...CAPTION, fontSize: '1.6cqh', color: matte ? (matte === '#111111' ? 'rgba(255,255,255,0.6)' : 'rgba(20,18,16,0.55)') : ink(channel.palette) }}>
        Ambient · {channel.name}
      </span>
    </Face>
  )
}

/** The Studio Display (2560 x 1440): the screensaver, with the time. */
export function Screensaver({ settings }: { settings: Settings }) {
  const channel = findChannel(settings.channel)
  return (
    <Face background={channel.palette[0]} style={{ display: 'flex', alignItems: 'flex-end', padding: '4cqh 4cqw' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Pattern pattern={channel.pattern} live seed={`ambient-desk-${channel.id}`} palette={channel.palette} grid={channel.grid} />
      </div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.2cqh', color: ink(channel.palette) }}>
        <span style={{ ...CAPTION, fontSize: '12cqh', fontWeight: 700, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>9:41</span>
        <span style={{ ...CAPTION, fontSize: '2.4cqh' }}>
          Tuesday 22 September · Ambient · {channel.name}
        </span>
      </div>
    </Face>
  )
}

/** A tablet on a stand (1280 x 800): a digital frame, matted. */
export function TabletFrame({ settings }: { settings: Settings }) {
  const channel = findChannel(settings.channel)
  return (
    <Face background="#f2efe8" style={{ padding: '6cqh 6cqh', boxSizing: 'border-box' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', background: channel.palette[0], overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <Pattern pattern={channel.pattern} live seed={`ambient-tab-${channel.id}`} palette={channel.palette} grid={channel.grid} />
        </div>
      </div>
      <span style={{ position: 'absolute', left: '6cqh', bottom: '1.8cqh', ...CAPTION, fontSize: '2cqh', color: 'rgba(20,18,16,0.55)' }}>
        {channel.name} · {channel.mood}
      </span>
    </Face>
  )
}

/** The watch (208 x 248): the channel as a face, the time over it. */
export function WatchArt({ settings }: { settings: Settings }) {
  const channel = findChannel(settings.channel)
  return (
    <Face background={channel.palette[0]} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '16px 14px' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Pattern pattern={channel.pattern} live seed={`ambient-wrist-${channel.id}`} palette={channel.palette} grid="2x3" />
      </div>
      <div style={{ position: 'relative', textAlign: 'center', color: ink(channel.palette) }}>
        <div style={{ ...CAPTION, fontSize: 44, fontWeight: 800, letterSpacing: '-0.05em', fontVariantNumeric: 'tabular-nums', textShadow: '0 1px 12px rgba(0,0,0,0.25)' }}>9:41</div>
        <div style={{ ...CAPTION, fontSize: 11, marginTop: 4, opacity: 0.85 }}>Tue 22 · {channel.name}</div>
      </div>
    </Face>
  )
}
