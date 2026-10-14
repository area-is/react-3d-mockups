'use client'

import * as React from 'react'
import { FoldMockup, IPhone, IPhoneMockup, LaptopMockup, MockupCanvas, experimental_screenInputStats } from 'react-3d-mockups'
import { asset } from '@/lib/base-path.mjs'

/*
 * EXPERIMENT: interactive screens by clip-path (`experimentalScreenInput`).
 *
 * A test bench, not a page: each scene puts the same clickable grid on a
 * screen, and the switch at the top flips between the experiment ("clip":
 * the DOM above the canvas, clipped to what the hardware leaves visible) and
 * what ships today ("blend": the DOM under the canvas, masked by the depth
 * buffer, no input). The laptop scenes are the ones that went wrong when
 * screens last took input, by raycasting: from below and through the wedge
 * of a nearly shut lid, the base stands in front of part of the display.
 *
 * Things to try: click a cell (it counts), hover (it turns white), scroll
 * the grid with the wheel or a finger, type in the field, drag on the
 * hardware or the background (the model turns), and click where the base
 * covers the display (nothing should happen).
 */

type Scene = 'phone' | 'laptop-under' | 'laptop-wedge' | 'laptop-front' | 'laptop-iframe' | 'overlap' | 'fold'

const SCENES: { id: Scene; label: string }[] = [
  { id: 'laptop-under', label: 'Laptop from below' },
  { id: 'laptop-wedge', label: 'Laptop nearly shut' },
  { id: 'laptop-front', label: 'Laptop, front' },
  { id: 'laptop-iframe', label: 'Laptop, an iframe' },
  { id: 'phone', label: 'Phone' },
  { id: 'overlap', label: 'Two phones overlapping' },
  { id: 'fold', label: 'Fold in Flex Mode' },
]

const ClickLog = React.createContext<(entry: string) => void>(() => {})

/**
 * A grid of numbered buttons filling the glass, so a click says where it
 * landed. Hover turns a cell white, the grid scrolls, and the last row is a
 * text field.
 */
function TestScreen({ name, rows = 8, cols = 4 }: { name: string; rows?: number; cols?: number }) {
  const log = React.useContext(ClickLog)
  const [hits, setHits] = React.useState<Record<number, number>>({})
  const [hover, setHover] = React.useState(-1)
  const [text, setText] = React.useState('')
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#10131a', color: '#fff', font: '600 22px system-ui, sans-serif' }}>
      <div style={{ flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoRows: `calc((100% - 4px) / ${rows})`, gap: 4, padding: 4 }}>
        {Array.from({ length: rows * cols }, (_, i) => (
          <button
            key={i}
            type="button"
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover((h) => (h === i ? -1 : h))}
            onClick={() => {
              log(`${name} · cell ${i}`)
              setHits((h) => ({ ...h, [i]: (h[i] ?? 0) + 1 }))
            }}
            style={{
              border: 0,
              borderRadius: 10,
              font: 'inherit',
              cursor: 'pointer',
              color: hover === i ? '#10131a' : '#fff',
              background: hover === i ? '#fff' : `hsl(${(i * 37) % 360} 55% ${hits[i] ? 30 : 45}%)`,
            }}
          >
            {i}
            {hits[i] ? ` ×${hits[i]}` : ''}
          </button>
        ))}
        {Array.from({ length: cols * 3 }, (_, i) => (
          <div key={`more-${i}`} style={{ borderRadius: 10, background: '#222838', display: 'grid', placeItems: 'center', font: '500 16px system-ui, sans-serif' }}>
            scrolled {i}
          </div>
        ))}
      </div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && log(`${name} · typed “${text}”`)}
        placeholder="Type here, then Enter"
        style={{ margin: 4, height: 48, borderRadius: 10, border: 0, padding: '0 14px', font: 'inherit' }}
      />
    </div>
  )
}

function SceneView({ scene, input }: { scene: Scene; input: boolean }) {
  const stage = { controls: true, float: false, experimentalScreenInput: input } as const
  switch (scene) {
    case 'laptop-under':
      return (
        <LaptopMockup {...stage} variant="pro14" openAngle={105} rotation={[-0.42, -0.4, 0]} camera={{ position: [0, 0, 7.5], fov: 36 }}>
          <TestScreen name="laptop" rows={6} cols={8} />
        </LaptopMockup>
      )
    case 'laptop-wedge':
      return (
        <LaptopMockup {...stage} variant="pro14" openAngle={38} rotation={[-0.3, -0.25, 0]} camera={{ position: [0, 0, 7.5], fov: 36 }}>
          <TestScreen name="laptop" rows={6} cols={8} />
        </LaptopMockup>
      )
    case 'laptop-front':
      return (
        <LaptopMockup {...stage} variant="pro14" openAngle={110} rotation={[0.2, -0.35, 0]}>
          <TestScreen name="laptop" rows={6} cols={8} />
        </LaptopMockup>
      )
    case 'laptop-iframe':
      return (
        <LaptopMockup {...stage} variant="pro14" openAngle={110} rotation={[0.15, -0.3, 0]}>
          <iframe src={asset('/embedded')} title="An embedded page" style={{ width: '100%', height: '100%', border: 0 }} />
        </LaptopMockup>
      )
    case 'phone':
      return (
        <IPhoneMockup {...stage} variant="pro" color="silver" rotation={[0.08, -0.35, 0]}>
          <TestScreen name="phone" />
        </IPhoneMockup>
      )
    case 'overlap':
      return (
        <MockupCanvas controls={false} experimentalScreenInput={input} camera={{ position: [0, 0, 9], fov: 30 }}>
          <IPhone variant="pro" color="silver" position={[-0.55, 0, 0]} rotation={[0, 0.25, 0]}>
            <TestScreen name="back phone" />
          </IPhone>
          <IPhone variant="pro" color="deepblue" position={[0.55, 0, 1.2]} rotation={[0, -0.3, 0]}>
            <TestScreen name="front phone" />
          </IPhone>
        </MockupCanvas>
      )
    case 'fold':
      return (
        <FoldMockup {...stage} variant="fold7" openAngle={115} rotation={[0.12, -0.95, 0]}>
          <TestScreen name="fold" rows={8} cols={6} />
        </FoldMockup>
      )
  }
}

/** Average readback and tracing cost per traced frame, refreshed twice a second. */
function useCost() {
  const [cost, setCost] = React.useState('')
  React.useEffect(() => {
    const stats = experimental_screenInputStats
    const timer = setInterval(() => {
      if (!stats.frames) return setCost('no frames traced yet - turn the model')
      setCost(
        `${stats.frames} frames traced · readback ${(stats.readMs / stats.frames).toFixed(2)} ms · trace ${(stats.traceMs / stats.frames).toFixed(2)} ms · ` +
          `${Math.round(stats.pixels / stats.frames).toLocaleString('en-US')} px · ${Math.round(stats.vertices / stats.frames)} vertices`
      )
    }, 500)
    return () => clearInterval(timer)
  }, [])
  return cost
}

const button = (on: boolean): React.CSSProperties => ({
  padding: '6px 12px',
  borderRadius: 8,
  border: '1px solid #c9ccd4',
  background: on ? '#10131a' : '#fff',
  color: on ? '#fff' : '#10131a',
  font: '500 14px system-ui, sans-serif',
  cursor: 'pointer',
})

export default function ScreenInputBench() {
  const [scene, setScene] = React.useState<Scene>('laptop-under')
  const [input, setInput] = React.useState(true)
  const [log, setLog] = React.useState<string[]>([])
  const cost = useCost()
  const push = React.useCallback((entry: string) => setLog((l) => [`${new Date().toLocaleTimeString()}  ${entry}`, ...l].slice(0, 8)), [])

  // Start from the URL (`?scene=laptop-wedge&mode=blend`) so a view can be linked.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const s = params.get('scene')
    if (SCENES.some((x) => x.id === s)) setScene(s as Scene)
    if (params.get('mode') === 'blend') setInput(false)
  }, [])
  React.useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('scene', scene)
    url.searchParams.set('mode', input ? 'clip' : 'blend')
    window.history.replaceState(null, '', url)
    Object.assign(experimental_screenInputStats, { frames: 0, readMs: 0, traceMs: 0, pixels: 0, vertices: 0 })
  }, [scene, input])

  return (
    <ClickLog.Provider value={push}>
      <div style={{ minHeight: '100vh', background: '#e9eaee', color: '#10131a', font: '15px system-ui, sans-serif' }}>
        <div style={{ padding: '14px 16px', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', borderBottom: '1px solid #d4d6dd', background: '#f5f6f8' }}>
          <strong style={{ marginRight: 8 }}>Screen input (experiment)</strong>
          <button type="button" style={button(input)} onClick={() => setInput(true)}>
            clip: takes input
          </button>
          <button type="button" style={button(!input)} onClick={() => setInput(false)}>
            blend: today
          </button>
          <span style={{ width: 12 }} />
          {SCENES.map((s) => (
            <button key={s.id} type="button" style={button(scene === s.id)} onClick={() => setScene(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
        <div style={{ height: '68vh', minHeight: 420 }}>
          <SceneView key={`${scene}-${input}`} scene={scene} input={input} />
        </div>
        <div style={{ padding: '10px 16px', display: 'grid', gap: 6, font: '13px ui-monospace, monospace' }}>
          <div>{input ? cost : 'blend mode: nothing is traced, and the screen takes no input'}</div>
          {log.length ? log.map((entry, i) => <div key={i}>{entry}</div>) : <div style={{ opacity: 0.6 }}>Clicks and typing on the screen land here.</div>}
        </div>
      </div>
    </ClickLog.Provider>
  )
}
