'use client'

import { useId, type CSSProperties, type ReactNode } from 'react'
import { asset } from '@/lib/base-path.mjs'
import { Face } from '../_shared/face'
import { GAME, OST, type Level } from './arcade-data'
import { MothGame } from './moth-game'

/**
 * Moth's key art and its packaging, drawn from the same pieces as the game:
 * the painted moth (`/art/arcade-moth.webp`), the level's silhouettes and a
 * lamp, lit in the level's colours - so the box, the sleeve and the screens
 * agree about what the night looks like.
 */

const HEAVY: CSSProperties = { fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.86 }

/**
 * The mark: the moth in one ink, for the places a painting will not do - the
 * site's header, the spine. Forewings swept back to a point, rounder hind
 * wings with an eye spot knocked out of each, a segmented body and combed
 * antennae; drawn to read at 18 px.
 */
export function MothMark({ size, color, style }: { size: string; color: string; style?: CSSProperties }) {
  const fore = 'M58 33C47 21 26 12 6 15C8 27 15 39 29 45C40 49 50 46 58 41Z'
  const hind = 'M58 43C47 45 34 51 30 61C28 71 38 77 48 72C54 68 57 58 58 49Z'
  const spots = `moth-spots-${useId().replace(/:/g, '')}`
  return (
    <svg viewBox="0 0 120 84" style={{ width: size, height: 'auto', display: 'block', flex: 'none', ...style }} aria-hidden>
      <defs>
        <mask id={spots}>
          <rect width="120" height="84" fill="#fff" />
          <circle cx="41" cy="62" r="3.6" fill="#000" />
          <circle cx="79" cy="62" r="3.6" fill="#000" />
        </mask>
      </defs>
      <g fill={color} mask={`url(#${spots})`}>
        <path d={fore} />
        <path d={fore} transform="matrix(-1 0 0 1 120 0)" />
        <path d={hind} opacity="0.82" />
        <path d={hind} opacity="0.82" transform="matrix(-1 0 0 1 120 0)" />
      </g>
      <ellipse cx="60" cy="47" rx="4.2" ry="17" fill={color} />
      <g stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none">
        <path d="M58.5 31C56 22 51 15 44 10M61.5 31C64 22 69 15 76 10" />
        <path d="M55.5 23l-4 1.5M53.5 19l-4 .8M51 15.5l-3.6.2M64.5 23l4 1.5M66.5 19l4 .8M69 15.5l3.6.2" strokeWidth="1.4" />
      </g>
    </svg>
  )
}

/** The painted moth, as the game draws it. */
export function MothPicture({ size, style }: { size: string; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset('/art/arcade-moth.webp')}
      alt=""
      draggable={false}
      decoding="async"
      style={{ width: size, height: 'auto', aspectRatio: '480 / 355', display: 'block', flex: 'none', ...style }}
    />
  )
}

/** The silhouettes' pixel sizes, so a masked box can hold each one's shape before it loads. */
const ART = {
  'garden-far': [1024, 415],
  'garden-near': [1024, 392],
  'harbour-far': [1024, 196],
  'harbour-near': [1024, 602],
  'attic-far': [1024, 469],
  'attic-near': [1024, 439],
  'lamp-garden': [103, 640],
  'lamp-harbour': [187, 640],
} as const

/**
 * A silhouette in any colour: a box in that colour with the cut-out as its
 * mask. The same trick the game plays on a canvas, done in CSS.
 */
function Silhouette({ name, color, style }: { name: keyof typeof ART; color: string; style?: CSSProperties }) {
  const [w, h] = ART[name]
  const url = `url(${asset(`/art/arcade-${name}.webp`)})`
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        aspectRatio: `${w} / ${h}`,
        background: color,
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskSize: '100% 100%',
        maskSize: '100% 100%',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        ...style,
      }}
    />
  )
}

/** A few stars, placed the same way every time. */
const STARS = Array.from({ length: 26 }, (_, i) => ({ x: (i * 37.3) % 100, y: (i * 21.7) % 58, r: 0.25 + ((i * 7) % 5) * 0.08 }))

/**
 * The key art: one lamp in the level's night, lit, with the moth on its way
 * to it. Full bleed, in container units, so the case and the sleeve crop it
 * to their own shapes; the type is laid over it by whoever uses it.
 */
function KeyArt({ level }: { level: Level }) {
  const garden = level.scene === 'garden'
  const harbour = level.scene === 'harbour'
  const glass = harbour ? { left: 66, top: 36 } : garden ? { left: 58, top: 30 } : { left: 58, top: 36 }
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', containerType: 'size', background: `linear-gradient(180deg, ${level.sky} 0%, ${level.horizon} 74%, ${level.sky} 100%)` }}>
      {level.scene !== 'attic'
        ? STARS.map((st, i) => (
            <span key={i} style={{ position: 'absolute', left: `${st.x}cqw`, top: `${st.y}cqh`, width: `${st.r}cqw`, height: `${st.r}cqw`, borderRadius: '50%', background: 'rgba(235,240,255,0.7)' }} />
          ))
        : null}
      {level.scene === 'attic' ? (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, transparent 12%, rgba(190,205,255,0.12) 22%, rgba(190,205,255,0.05) 40%, transparent 52%)' }} />
      ) : (
        <div style={{ position: 'absolute', left: harbour ? '9cqw' : '72cqw', top: harbour ? '19cqh' : '10cqh', width: '9cqw', height: '9cqw', borderRadius: '50%', background: 'radial-gradient(circle at 38% 38%, #fbf6e4, #d9d2bc)', boxShadow: '0 0 6cqw 2cqw rgba(220,230,255,0.18)' }} />
      )}

      {garden ? <Silhouette name="garden-far" color={level.far} style={{ left: '-20cqw', bottom: '14cqh', width: '140cqw' }} /> : null}
      {harbour ? <Silhouette name="harbour-far" color={level.far} style={{ left: '-10cqw', bottom: '30cqh', width: '120cqw' }} /> : null}
      {level.scene === 'attic' ? <Silhouette name="attic-far" color={level.far} style={{ left: '-14cqw', top: '-24cqh', width: '128cqw' }} /> : null}

      {/* the lamp's light, then the lamp */}
      <div style={{ position: 'absolute', left: `${glass.left}cqw`, top: `${glass.top}cqh`, width: '120cqw', height: '120cqw', transform: 'translate(-50%, -50%)', background: `radial-gradient(closest-side, ${level.lamp}aa 0%, ${level.lamp}33 18%, ${level.lamp}10 42%, transparent 70%)` }} />
      {/* A lamp is sized by the height, so everything about it is measured in
          cqh: its glass lands on the glow on a tall case and a square sleeve alike. */}
      {garden ? <Silhouette name="lamp-garden" color={level.near} style={{ left: `calc(${glass.left}cqw - 5.3cqh)`, top: `${glass.top - 11.75}cqh`, height: '66cqh' }} /> : null}
      {harbour ? <Silhouette name="lamp-harbour" color={level.near} style={{ left: `calc(${glass.left}cqw - 15cqh)`, top: `${glass.top - 15.9}cqh`, height: '62cqh' }} /> : null}
      {level.scene === 'attic' ? (
        <>
          <div style={{ position: 'absolute', left: `${glass.left}cqw`, top: 0, width: '0.5cqw', height: `${glass.top - 4}cqh`, background: 'rgba(0,0,0,0.7)' }} />
          <div style={{ position: 'absolute', left: `${glass.left}cqw`, top: `${glass.top}cqh`, width: '7cqw', height: '9cqw', transform: 'translate(-40%, -50%)', borderRadius: '50%', background: `radial-gradient(circle, #fff6e0, ${level.lamp})` }} />
        </>
      ) : (
        <div style={{ position: 'absolute', left: `${glass.left}cqw`, top: `${glass.top}cqh`, width: harbour ? '3.6cqh' : '7cqh', height: harbour ? '5cqh' : '6.6cqh', transform: 'translate(-50%, -50%)', borderRadius: '40%', background: level.lamp, filter: 'blur(0.3cqh)' }} />
      )}

      {garden ? <Silhouette name="garden-near" color={level.near} style={{ left: '-30cqw', bottom: '-2cqh', width: '160cqw' }} /> : null}
      {harbour ? <Silhouette name="harbour-near" color={level.near} style={{ left: '-18cqw', bottom: '-2cqh', width: '112cqw' }} /> : null}
      {level.scene === 'attic' ? <Silhouette name="attic-near" color={level.near} style={{ left: '-40cqw', bottom: '-2cqh', width: '150cqw' }} /> : null}

      <MothPicture size="30cqw" style={{ position: 'absolute', left: '14cqw', top: '44cqh', transform: 'rotate(28deg)', filter: `drop-shadow(0 0 3cqw ${level.lamp}66)` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,0.5) 100%)' }} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Screens: the TV (1920 x 1080) and the phone (360 x 780)            */
/* ------------------------------------------------------------------ */

/** The game on the TV, with the title and the lamp count over it. */
export function TVGame({ level, lit = 1, litRef }: { level: Level; lit?: number; litRef?: (lit: number, total: number) => void }) {
  return (
    <Face background={level.sky} color={level.moth} style={{ letterSpacing: '-0.012em' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <MothGame width={1920} height={1080} level={level} onLit={litRef} />
      </div>
      <div style={{ position: 'absolute', left: 64, top: 52, display: 'flex', alignItems: 'center', gap: 18 }}>
        <MothPicture size="84px" style={{ filter: `drop-shadow(0 0 14px ${level.lamp}55)` }} />
        <span style={{ ...HEAVY, fontSize: 56 }}>{GAME.title}</span>
      </div>
      <div style={{ position: 'absolute', right: 64, top: 60, textAlign: 'right', fontSize: 22, fontWeight: 700, opacity: 0.8 }}>
        {level.name}
        <br />
        <span style={{ color: level.lamp, fontVariantNumeric: 'tabular-nums' }}>
          {lit} of {level.lamps} lamps
        </span>
      </div>
      <div style={{ position: 'absolute', left: 64, bottom: 56, fontSize: 20, fontWeight: 600, opacity: 0.6 }}>The moth flies itself. Your job is the lamps.</div>
    </Face>
  )
}

/** The game on the phone, portrait, with the tap hint a phone game has. */
export function PhoneGame({ level }: { level: Level }) {
  return (
    <Face background={level.sky} color={level.moth} style={{ letterSpacing: '-0.012em' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <MothGame width={360} height={780} level={level} />
      </div>
      <div style={{ position: 'absolute', left: 20, right: 20, top: 'calc(var(--mockup-safe-area-top, 0px) + 14px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, ...HEAVY, fontSize: 22 }}>
          <MothPicture size="30px" /> {GAME.title}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: level.lamp }}>{level.name}</span>
      </div>
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 28, textAlign: 'center', fontSize: 13, fontWeight: 600, opacity: 0.6 }}>Tap anywhere to light a lamp</div>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  The box (a game case, 106 x 170 x 12 mm)                            */
/* ------------------------------------------------------------------ */

export function BoxFront({ level }: { level: Level }) {
  return (
    <Face background={level.sky} color={level.moth} style={{ display: 'flex', flexDirection: 'column', padding: '7cqw', letterSpacing: '-0.012em' }}>
      <KeyArt level={level} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '3.4cqw', fontWeight: 700, opacity: 0.85 }}>
        <span>{GAME.studio}</span>
        <span style={{ border: `0.5cqw solid ${level.moth}`, padding: '0.8cqw 1.6cqw', borderRadius: '1cqw' }}>{GAME.rating}</span>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '2cqw', textShadow: '0 0.6cqw 3cqw rgba(0,0,0,0.5)' }}>
        <span style={{ ...HEAVY, fontSize: '22cqw' }}>{GAME.title}</span>
        <span style={{ fontSize: '4cqw', fontWeight: 700, color: level.lamp }}>{GAME.tag}</span>
      </div>
    </Face>
  )
}

export function BoxBack({ level }: { level: Level }) {
  const bullets = ['Seven nights, forty lamps, one moth', 'A soundtrack by Lune Rouge', 'Plays in an evening, stays for a week', 'No text, no menus, no wrong way']
  return (
    <Face background={level.sky} color={level.moth} style={{ display: 'flex', flexDirection: 'column', padding: '7cqw', gap: '4cqw', letterSpacing: '-0.012em' }}>
      <span style={{ fontSize: '5.2cqw', fontWeight: 700, lineHeight: 1.2 }}>A moth cannot help flying at the light. You cannot help helping it.</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2cqw', fontSize: '3.4cqw', fontWeight: 600, opacity: 0.85 }}>
        {bullets.map((b) => (
          <span key={b}>· {b}</span>
        ))}
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '3cqw', fontWeight: 600, opacity: 0.7 }}>
        <span>
          {GAME.platforms}
          <br />
          {GAME.release}
        </span>
        <span>{GAME.studio}</span>
      </div>
    </Face>
  )
}

/**
 * The spine: a 12 mm strip down the case's side, so everything on it is sized
 * by its width - the mark at the head, the title running up it the way a
 * shelf of games reads, and the studio at the foot.
 */
export function BoxSpine({ level }: { level: Level }) {
  return (
    <Face background={level.sky} color={level.moth} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '14cqw 0 12cqw' }}>
      <MothMark size="72cqw" color={level.moth} />
      <span style={{ ...HEAVY, fontSize: '64cqw', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{GAME.title}</span>
      <span style={{ fontSize: '26cqw', fontWeight: 700, writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: level.lamp, whiteSpace: 'nowrap' }}>{GAME.studio}</span>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  The soundtrack (520 x 520 sleeve, 166 x 166 labels)                 */
/* ------------------------------------------------------------------ */

export function SleeveFront({ level }: { level: Level }) {
  return (
    <Face background={level.sky} color={level.moth} style={{ display: 'flex', flexDirection: 'column', padding: '7cqw', letterSpacing: '-0.012em' }}>
      <KeyArt level={level} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', fontSize: '2.8cqw', fontWeight: 700, opacity: 0.8 }}>
        <span>{OST.label}</span>
        <span>{OST.catalog}</span>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textShadow: '0 0.5cqw 2.5cqw rgba(0,0,0,0.55)' }}>
        <span style={{ ...HEAVY, fontSize: '14cqw' }}>{GAME.title}</span>
        <span style={{ fontSize: '3cqw', fontWeight: 700, textAlign: 'right', lineHeight: 1.3, color: level.lamp }}>
          Original soundtrack
          <br />
          {OST.artist}
        </span>
      </div>
    </Face>
  )
}

function Tracks({ side, tracks, level }: { side: string; tracks: readonly (readonly string[])[]; level: Level }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4cqw' }}>
      <span style={{ fontSize: '2.6cqw', fontWeight: 800, color: level.lamp }}>{side}</span>
      {tracks.map(([name, time], i) => (
        <div key={name} style={{ display: 'flex', gap: '1.5cqw', fontSize: '2.7cqw', fontWeight: 600 }}>
          <span style={{ opacity: 0.5, fontVariantNumeric: 'tabular-nums' }}>{i + 1}.</span>
          <span style={{ flex: 1 }}>{name}</span>
          <span style={{ opacity: 0.6, fontVariantNumeric: 'tabular-nums' }}>{time}</span>
        </div>
      ))}
    </div>
  )
}

export function SleeveBack({ level }: { level: Level }) {
  return (
    <Face background={level.sky} color={level.moth} style={{ display: 'flex', flexDirection: 'column', padding: '7cqw', gap: '5cqw', letterSpacing: '-0.012em' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ ...HEAVY, fontSize: '7cqw' }}>{OST.title}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6cqw' }}>
        <Tracks side="Side A" tracks={OST.sideA} level={level} />
        <Tracks side="Side B" tracks={OST.sideB} level={level} />
      </div>
      <p style={{ margin: 0, fontSize: '2.6cqw', lineHeight: 1.45, opacity: 0.7 }}>
        Written and recorded by {OST.artist} over the winter the game was made, on a piano, a tape machine and the
        radiator in the corner. Pressed on {OST.colour.toLowerCase()} vinyl, 180 g.
      </p>
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '2.4cqw', fontWeight: 600, opacity: 0.6 }}>
        <span>
          {OST.label} · {OST.catalog}
        </span>
        <span>33⅓ rpm · Stereo</span>
      </div>
    </Face>
  )
}

export function Label({ side, level }: { side: 'A' | 'B'; level: Level }) {
  return (
    <Face background={level.lamp} color={level.sky} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '12cqw 10cqw', textAlign: 'center' }}>
      <span style={{ ...HEAVY, fontSize: '13cqw' }}>{GAME.title}</span>
      <span style={{ fontSize: '6cqw', fontWeight: 800 }}>Side {side}</span>
      <span style={{ fontSize: '4.2cqw', fontWeight: 700, opacity: 0.7 }}>
        {OST.catalog} · 33⅓
      </span>
    </Face>
  )
}

export type { ReactNode }
