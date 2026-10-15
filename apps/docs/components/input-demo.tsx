'use client'

import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { IPadMockup, IPhoneMockup, LaptopMockup } from 'react-3d-mockups'
import { LazyScene } from './lazy-scene'
import { asset } from '@/lib/base-path.mjs'

/*
 * The live examples on the Screen content page for `experimentalScreenInput`:
 * each one is a mockup whose screen takes input, carrying content that needs
 * it - a form, a scrolling feed, a sketch pad, a page in an iframe. The code
 * blocks beside them in the page are the same components, trimmed.
 *
 * Each example is its own canvas, mounted only while it is near the viewport
 * (`LazyScene`), like the Images guide's: browsers cap live WebGL contexts.
 *
 * Plain elements and inline styles, no headings: with input on, a screen joins
 * the page's accessibility tree, and a demo's title set as an <h2> would land
 * in the docs page's outline.
 */

const FONT = 'var(--font-inter), Inter, system-ui, sans-serif'
const INK = '#0f172a'
const ACCENT = '#2563eb'

const field: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  height: 64,
  padding: '0 20px',
  border: '2px solid #cbd5e1',
  borderRadius: 14,
  background: '#fff',
  color: INK,
  font: `500 26px ${FONT}`,
}

const label: CSSProperties = { display: 'grid', gap: 10, font: `600 22px ${FONT}`, color: '#334155' }

/** A sign-up form: a text field, a select, a checkbox and a submit button. */
function SignUpForm() {
  const [name, setName] = useState('')
  const [plan, setPlan] = useState('Team')
  const [updates, setUpdates] = useState(true)
  const [sent, setSent] = useState<string | null>(null)
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setSent(`${name.trim() || 'Someone'} signed up for ${plan}${updates ? ', with product updates' : ''}.`)
      }}
      style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: '#f1f5f9', fontFamily: FONT }}
    >
      <div style={{ width: '52%', display: 'grid', gap: 26, padding: 48, borderRadius: 28, background: '#fff', boxShadow: '0 20px 60px rgba(15,23,42,.12)' }}>
        <div style={{ font: `700 44px ${FONT}`, color: INK, letterSpacing: '-0.02em' }}>Create an account</div>
        <label style={label}>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" style={field} />
        </label>
        <label style={label}>
          Plan
          <select value={plan} onChange={(e) => setPlan(e.target.value)} style={field}>
            <option>Starter</option>
            <option>Team</option>
            <option>Enterprise</option>
          </select>
        </label>
        <label style={{ ...label, display: 'flex', alignItems: 'center', gap: 14, fontWeight: 500 }}>
          <input type="checkbox" checked={updates} onChange={(e) => setUpdates(e.target.checked)} style={{ width: 28, height: 28 }} />
          Send me product updates
        </label>
        <button type="submit" style={{ height: 68, border: 0, borderRadius: 14, background: ACCENT, color: '#fff', font: `700 26px ${FONT}`, cursor: 'pointer' }}>
          Sign up
        </button>
        <div aria-live="polite" style={{ minHeight: 32, font: `500 22px ${FONT}`, color: '#047857' }}>
          {sent}
        </div>
      </div>
    </form>
  )
}

const POSTS = [
  'Morning light over the harbour',
  'New trail, same old boots',
  'Finally fixed the bike',
  'Market day haul',
  'Rain on the studio skylight',
  'First tomatoes of the year',
  'Late train, good book',
  'Garden table, finished',
  'Fog on the ridge',
  'Bread, attempt four',
  'The good coffee place reopened',
  'Kite weather',
]

/** A feed that scrolls, with a like button on every post. */
function Feed() {
  const [liked, setLiked] = useState<Record<number, boolean>>({})
  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: '#fafafa', fontFamily: FONT, padding: '62px 14px 24px' }}>
      {POSTS.map((title, i) => (
        <div key={i} style={{ marginBottom: 14, borderRadius: 18, background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,.06)', overflow: 'hidden' }}>
          <div style={{ height: 150, background: `linear-gradient(135deg, hsl(${(i * 47) % 360} 70% 62%), hsl(${(i * 47 + 60) % 360} 70% 48%))` }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
            <span style={{ font: `600 16px ${FONT}`, color: INK }}>{title}</span>
            <button
              type="button"
              aria-pressed={!!liked[i]}
              aria-label={liked[i] ? `Unlike “${title}”` : `Like “${title}”`}
              onClick={() => setLiked((l) => ({ ...l, [i]: !l[i] }))}
              style={{ border: 0, background: 'none', font: `400 26px ${FONT}`, color: liked[i] ? '#e11d48' : '#94a3b8', cursor: 'pointer', padding: 4 }}
            >
              {liked[i] ? '♥' : '♡'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * A sketch pad: every drag on it draws. It captures the pointer, which on
 * its own would keep the drag from turning the model; the example also sets
 * `screenDrag={false}`, so no drag anywhere on the screen turns it.
 */
function SketchPad() {
  const [strokes, setStrokes] = useState<string[]>([])
  const drawing = useRef(false)
  const pad = useRef<SVGSVGElement>(null)
  // In the pad's own units, whatever angle it is seen at: `offsetX`/`offsetY`
  // are mapped back through the screen's 3D transform into the pad's own box,
  // where the bounding rect would be the projected one.
  const at = (e: PointerEvent) => {
    const svg = pad.current!
    const x = (e.nativeEvent.offsetX / svg.clientWidth) * 1000
    const y = (e.nativeEvent.offsetY / svg.clientHeight) * 750
    return `${x.toFixed(1)} ${y.toFixed(1)}`
  }
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateRows: 'auto 1fr', background: '#fffdf7', fontFamily: FONT }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '64px 36px 16px' }}>
        <span style={{ font: `700 34px ${FONT}`, color: INK }}>Sketch</span>
        <button type="button" onClick={() => setStrokes([])} style={{ height: 52, padding: '0 22px', border: '2px solid #cbd5e1', borderRadius: 12, background: '#fff', font: `600 22px ${FONT}`, color: INK, cursor: 'pointer' }}>
          Clear
        </button>
      </div>
      <svg
        ref={pad}
        viewBox="0 0 1000 750"
        preserveAspectRatio="none"
        style={{ width: 'calc(100% - 72px)', height: 'calc(100% - 36px)', margin: '0 36px 36px', borderRadius: 18, background: '#fff', boxShadow: 'inset 0 0 0 2px #e2e8f0', touchAction: 'none', cursor: 'crosshair' }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          drawing.current = true
          setStrokes((s) => [...s, `M${at(e)}`])
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return
          setStrokes((s) => [...s.slice(0, -1), `${s[s.length - 1]} L${at(e)}`])
        }}
        onPointerUp={() => (drawing.current = false)}
        onPointerCancel={() => (drawing.current = false)}
      >
        {strokes.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={ACCENT} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" pointerEvents="none" />
        ))}
      </svg>
    </div>
  )
}

const EXAMPLES = {
  form: () => (
    <LaptopMockup variant="air13" experimentalScreenInput rotation={[0.08, -0.25, 0]}>
      <SignUpForm />
    </LaptopMockup>
  ),
  feed: () => (
    <IPhoneMockup variant="pro" color="silver" statusBar={{ color: '#0f172a' }} experimentalScreenInput rotation={[0.05, -0.3, 0]}>
      <Feed />
    </IPhoneMockup>
  ),
  sketch: () => (
    <IPadMockup experimentalScreenInput screenDrag={false} rotation={[0.06, -0.3, 0]}>
      <SketchPad />
    </IPadMockup>
  ),
  iframe: () => (
    <LaptopMockup variant="air13" experimentalScreenInput rotation={[0.08, 0.25, 0]}>
      <iframe src={asset('/embedded')} title="An embedded page" style={{ width: '100%', height: '100%', border: 0, display: 'block' }} />
    </LaptopMockup>
  ),
} as const

export type InputExample = keyof typeof EXAMPLES

export function InputDemo({ example, height = 460 }: { example: InputExample; height?: number }) {
  const Scene = EXAMPLES[example]
  return (
    <div className="img-demo" style={{ height }}>
      <LazyScene>
        <Scene />
      </LazyScene>
    </div>
  )
}
