/**
 * Performance benchmark for the docs site and the library behind it.
 *
 * Measures the things that decide whether a mockup is a good citizen on a
 * page, the same way on every run:
 *
 *   home      cold load: FCP, LCP, CLS, time to the first 3D frame, long
 *             animation frames; then the autoplaying carousel: frame times
 *   idle      a docs page's mockup at rest: frames drawn once it has settled
 *   offscreen the carousel scrolled out of view: draw calls, and whether
 *             autoplay kept advancing
 *   hidden    the carousel with its tab hidden: whether autoplay advanced
 *   scroll    a docs page of examples scrolled end to end and back: WebGL
 *             contexts created and alive at once
 *
 *   npm run bench                          everything, Chromium, desktop
 *   npm run bench -- --only=idle,scroll    a subset
 *   npm run bench -- --mobile              375x812, touch, dpr 2
 *   npm run bench -- --cpu=4               4x CPU throttling (Chromium)
 *   npm run bench -- --gpu                 the machine's GPU instead of SwiftShader
 *   npm run bench -- --browser=webkit      WebKit (needs its Playwright build)
 *   npm run bench -- --json=out.json       also write the raw results
 *   npm run bench -- --markdown=out.md     also write a summary table (CI appends it
 *                                          to the job summary)
 *   npm run bench -- --executable=/path    a Chromium build other than Playwright's own
 *                                          (or set CHROMIUM_EXECUTABLE)
 *
 * Expects the docs site on PORT (default 3000: `npm run dev`, or `next start`
 * after a build for production numbers); pass --base to override.
 *
 * Two kinds of number come out, and only one kind is a budget. What a page
 * DOES - frames drawn while nothing moves, draw calls while off screen, layout
 * shift, contexts created, whether autoplay advanced - is the same on any
 * machine, so those are checked against BUDGETS and fail the run. How FAST it
 * does it is not: under SwiftShader (the default, so CI needs no GPU) every
 * frame is rendered on the CPU and timings are only comparable run to run on
 * one machine. Those are reported, never enforced; use --gpu on real hardware
 * for numbers worth quoting.
 *
 * The instrumentation is injected before any page script, so it sees the
 * whole session: every draw call and triangle (WebGL prototypes), every
 * context created and lost, layout shifts, paints and long animation frames.
 */
import { chromium, webkit } from 'playwright'
import { writeFileSync } from 'node:fs'
import { BASE_PATH } from '../lib/base-path.mjs'

const args = process.argv.slice(2)
const flag = (name) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3)
const BASE = flag('base') ?? `http://localhost:${process.env.PORT ?? 3000}${BASE_PATH}`
const ONLY = flag('only')?.split(',')
const MOBILE = args.includes('--mobile')
const GPU = args.includes('--gpu')
const CPU = Number(flag('cpu') ?? 1)
const BROWSER = flag('browser') ?? 'chromium'
const JSON_OUT = flag('json')
const MARKDOWN_OUT = flag('markdown')
const EXECUTABLE = flag('executable') ?? process.env.CHROMIUM_EXECUTABLE

/**
 * Pass/fail thresholds, all behavioural (see the header). From the audit's
 * targets: an idle or off-screen mockup draws nothing, the home page does not
 * jump, and scrolling a docs page end to end never holds more contexts than
 * `LazyScene` keeps alive.
 */
const BUDGETS = {
  homeCls: 0.05,
  idleFrames: 0,
  offscreenDrawCalls: 0,
  offscreenSlideChanges: 0,
  hiddenSlideChanges: 0,
  scrollMaxLiveContexts: 4,
}

/** Runs in the page before anything else. */
const INSTRUMENT = () => {
  const B = (window.__bench = {
    ticks: [],
    draws: 0,
    tris: 0,
    // Which canvases drew this frame, for a budget failure to point at.
    drawnBy: new Set(),
    firstDrawAt: null,
    contexts: { created: 0, alive: 0, maxAlive: 0 },
    shifts: [],
    paints: {},
    lcp: 0,
    loaf: [],
  })
  const TRIANGLES = 4
  // Only three.js canvases count - three tags its own with `data-engine`. The
  // demo artwork on some screens draws css-doodle shaders with a WebGL
  // context of its own, and that is the artwork's cost, not the mockup's.
  const isThree = (gl) => gl.canvas?.dataset?.engine?.startsWith('three.js') ?? false
  const wrap = (proto, name, countArg, instancesArg) => {
    const original = proto[name]
    if (!original) return
    proto[name] = function (...a) {
      if (!isThree(this)) return original.apply(this, a)
      B.draws++
      const box = this.canvas.getBoundingClientRect?.()
      B.drawnBy.add(`${this.canvas.width}x${this.canvas.height}${box ? ` at y=${Math.round(box.top)}` : ''}`)
      if (a[0] === TRIANGLES) B.tris += (a[countArg] / 3) * (instancesArg == null ? 1 : a[instancesArg])
      if (B.firstDrawAt === null) B.firstDrawAt = performance.now()
      return original.apply(this, a)
    }
  }
  for (const proto of [window.WebGL2RenderingContext?.prototype, window.WebGLRenderingContext?.prototype]) {
    if (!proto) continue
    wrap(proto, 'drawElements', 1)
    wrap(proto, 'drawArrays', 2)
    wrap(proto, 'drawElementsInstanced', 1, 4)
    wrap(proto, 'drawArraysInstanced', 2, 3)
  }

  // Every WebGL context the page creates (any engine: they all count against
  // the browser's cap), and how many are alive at once.
  // r3f releases a context on unmount with WEBGL_lose_context, which fires
  // `webglcontextlost`, so a lost context is a released one.
  const seen = new WeakSet()
  const getContext = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const ctx = getContext.call(this, type, ...rest)
    if (ctx && /webgl/.test(type) && !seen.has(ctx)) {
      seen.add(ctx)
      B.contexts.created++
      B.contexts.alive++
      B.contexts.maxAlive = Math.max(B.contexts.maxAlive, B.contexts.alive)
      this.addEventListener('webglcontextlost', () => B.contexts.alive--, { once: true })
    }
    return ctx
  }

  // One entry per animation frame: its interval and the draws issued since
  // the previous one. This callback lands before or after the renderer's in
  // the same frame, so counts are per frame, give or take one frame's shift.
  let last = performance.now()
  const tick = (now) => {
    B.ticks.push({ t: now, dt: now - last, draws: B.draws, tris: Math.round(B.tris), by: B.draws ? [...B.drawnBy] : undefined })
    B.draws = 0
    B.tris = 0
    B.drawnBy.clear()
    last = now
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)

  const observe = (type, onEntry) => {
    try {
      new PerformanceObserver((list) => list.getEntries().forEach(onEntry)).observe({ type, buffered: true })
    } catch {
      /* unsupported entry type in this browser */
    }
  }
  observe('layout-shift', (e) => {
    if (!e.hadRecentInput) B.shifts.push({ t: e.startTime, value: e.value })
  })
  observe('paint', (e) => (B.paints[e.name] = e.startTime))
  observe('largest-contentful-paint', (e) => (B.lcp = e.startTime))
  observe('long-animation-frame', (e) =>
    B.loaf.push({ t: e.startTime, duration: e.duration, blocking: e.blockingDuration })
  )
}

/** CLS as web-vitals defines it: the worst session window (1 s gaps, 5 s cap). */
function cumulativeLayoutShift(shifts) {
  let worst = 0
  let session = 0
  let start = -Infinity
  let previous = -Infinity
  for (const { t, value } of shifts) {
    if (t - previous > 1000 || t - start > 5000) {
      session = 0
      start = t
    }
    session += value
    previous = t
    worst = Math.max(worst, session)
  }
  return worst
}

function quantiles(values) {
  const s = [...values].sort((a, b) => a - b)
  const q = (p) => (s.length ? s[Math.floor(p * (s.length - 1))] : 0)
  return { p50: q(0.5), p95: q(0.95), p99: q(0.99), max: q(1) }
}

const round = (n, places = 1) => Math.round(n * 10 ** places) / 10 ** places
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Frames and draw calls over the next `ms`. */
async function sample(page, ms) {
  const from = await page.evaluate(() => window.__bench.ticks.length)
  await sleep(ms)
  const ticks = await page.evaluate((i) => window.__bench.ticks.slice(i), from)
  const drawn = ticks.filter((t) => t.draws > 0)
  return {
    frames: ticks.length,
    framesDrawn: drawn.length,
    drawCalls: drawn.reduce((sum, t) => sum + t.draws, 0),
    drawsPerFrame: drawn.length ? Math.round(drawn.reduce((s, t) => s + t.draws, 0) / drawn.length) : 0,
    trianglesPerFrame: drawn.length ? Math.round(drawn.reduce((s, t) => s + t.tris, 0) / drawn.length) : 0,
    frameMs: quantiles(ticks.map((t) => t.dt)),
    over50ms: ticks.filter((t) => t.dt > 50).length,
    drawnBy: [...new Set(drawn.flatMap((t) => t.by ?? []))].slice(0, 6),
  }
}

/**
 * Waits until the page has stopped drawing: `quietMs` of animation frames, at
 * least 30 of them, with no draw call in any (or `maxMs` passed).
 *
 * A mockup at rest is allowed to draw for a moment after load - mounting, its
 * screen landing, the environment map, a late resize - so "idle" is measured
 * from the point it stops, not from a fixed delay. And it counts frames, not
 * just time: under SwiftShader a single frame of a phone can take seconds, and
 * a long gap between ticks is a frame still being drawn, not a quiet page.
 */
async function settle(page, quietMs = 2000, maxMs = 60_000) {
  const start = Date.now()
  while (Date.now() - start < maxMs) {
    const quiet = await page.evaluate(() => {
      const ticks = window.__bench.ticks
      let i = ticks.length - 1
      while (i >= 0 && ticks[i].draws === 0) i--
      const undrawn = ticks.length - 1 - i
      const span = undrawn > 0 ? ticks[ticks.length - 1].t - ticks[i + 1].t : 0
      return { undrawn, span }
    })
    if (quiet.undrawn >= 30 && quiet.span >= quietMs) return true
    await sleep(500)
  }
  return false
}

/** Resolves once the page has drawn something with WebGL. */
async function firstFrame(page, timeout = 120_000) {
  await page.waitForFunction(() => window.__bench.firstDrawAt !== null, null, { timeout })
  return page.evaluate(() => window.__bench.firstDrawAt)
}

/** The carousel's "01 / 18" readout, or null off the home page. */
const slideIndex = (page) =>
  page.evaluate(() => document.querySelector('.carousel-readout .dim')?.textContent ?? null)

/** Pretend the tab went to the background: what the page's own handlers see. */
const setHidden = (page, hidden) =>
  page.evaluate((h) => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (h ? 'hidden' : 'visible') })
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => h })
    document.dispatchEvent(new Event('visibilitychange'))
  }, hidden)

const SCENARIOS = {
  async home(page) {
    await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 180_000 })
    const firstFrameMs = await firstFrame(page)
    // Let late shifts (fonts, the stage mounting) land before reading CLS.
    await sleep(3000)
    const loadMetrics = await page.evaluate(() => {
      const B = window.__bench
      return { paints: B.paints, lcp: B.lcp, shifts: B.shifts, loaf: B.loaf }
    })
    const autoplay = await sample(page, 15_000)
    return {
      fcpMs: round(loadMetrics.paints['first-contentful-paint'] ?? 0),
      lcpMs: round(loadMetrics.lcp),
      cls: round(cumulativeLayoutShift(loadMetrics.shifts), 3),
      firstFrameMs: round(firstFrameMs),
      longFramesBeforeFirst3d: loadMetrics.loaf.filter((l) => l.t <= firstFrameMs).length,
      worstBlockingMs: round(Math.max(0, ...loadMetrics.loaf.map((l) => l.blocking ?? 0))),
      autoplay,
    }
  },

  async idle(page) {
    await page.goto(`${BASE}/docs/api/galaxy-s26`, { waitUntil: 'load', timeout: 180_000 })
    await firstFrame(page)
    await settle(page)
    return sample(page, 5000)
  },

  async offscreen(page) {
    await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 180_000 })
    await firstFrame(page)
    await sleep(1500)
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    // Frames already in flight when the page scrolled still land; what counts
    // is that the loop stops after them. A loop that never stops times out
    // here and shows up in the sample below.
    const settled = await settle(page, 1000, 90_000)
    const before = await slideIndex(page)
    // Longer than two autoplay intervals, so an autoplay that kept running
    // while nobody could see it shows up as a slide change.
    const offscreen = await sample(page, 13_000)
    const after = await slideIndex(page)
    return { settled, ...offscreen, slideChanges: before === after ? 0 : 1, before, after }
  },

  async hidden(page) {
    await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 180_000 })
    await firstFrame(page)
    await sleep(1500)
    const before = await slideIndex(page)
    await setHidden(page, true)
    await sleep(13_000)
    const after = await slideIndex(page)
    await setHidden(page, false)
    return { slideChanges: before === after ? 0 : 1, before, after }
  },

  async scroll(page) {
    await page.goto(`${BASE}/docs/api/galaxy-s26`, { waitUntil: 'load', timeout: 180_000 })
    await firstFrame(page)
    await sleep(1500)
    const scrollBy = async (dir) => {
      for (let i = 0; i < 80; i++) {
        const done = await page.evaluate((d) => {
          const before = window.scrollY
          window.scrollBy(0, d * window.innerHeight * 0.6)
          return window.scrollY === before
        }, dir)
        // Long enough per step for a scene coming into view to mount, so a
        // pass over the page exercises every example on it.
        await sleep(900)
        if (done) break
      }
    }
    await scrollBy(1)
    await sleep(3000)
    await scrollBy(-1)
    await sleep(1000)
    const { contexts, canvases } = await page.evaluate(() => ({
      contexts: window.__bench.contexts,
      canvases: document.querySelectorAll('canvas').length,
    }))
    return { contextsCreated: contexts.created, maxLiveContexts: contexts.maxAlive, canvasesAtEnd: canvases }
  },
}

function checkBudgets(results) {
  const failures = []
  const over = (label, value, budget) => {
    if (value > budget) failures.push(`${label}: ${value} (budget ${budget})`)
  }
  if (results.home) over('home CLS', results.home.cls, BUDGETS.homeCls)
  if (results.idle) over('idle mockup frames drawn over 5 s', results.idle.framesDrawn, BUDGETS.idleFrames)
  if (results.offscreen) {
    over('off-screen carousel draw calls', results.offscreen.drawCalls, BUDGETS.offscreenDrawCalls)
    over('off-screen carousel slide changes', results.offscreen.slideChanges, BUDGETS.offscreenSlideChanges)
  }
  if (results.hidden) over('hidden-tab carousel slide changes', results.hidden.slideChanges, BUDGETS.hiddenSlideChanges)
  if (results.scroll) over('docs scroll: live WebGL contexts at once', results.scroll.maxLiveContexts, BUDGETS.scrollMaxLiveContexts)
  return failures
}

const engine = BROWSER === 'webkit' ? webkit : chromium
const browser = await engine.launch({
  ...(BROWSER === 'chromium' && !GPU
    ? // SwiftShader: no GPU needed, the same behaviour on CI as on a laptop.
      { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }
    : {}),
  ...(EXECUTABLE ? { executablePath: EXECUTABLE } : {}),
})
const contextOptions = MOBILE
  ? { viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: BROWSER === 'chromium', hasTouch: true }
  : { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 }

const results = {}
for (const [name, run] of Object.entries(SCENARIOS)) {
  if (ONLY && !ONLY.includes(name)) continue
  // A fresh context per scenario: no warm cache or leftover contexts from the
  // previous one colouring the numbers.
  const context = await browser.newContext(contextOptions)
  await context.addInitScript(INSTRUMENT)
  const page = await context.newPage()
  if (CPU > 1 && BROWSER === 'chromium') {
    const cdp = await context.newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU })
  }
  const warnings = []
  page.on('console', (msg) => {
    if (msg.type() === 'warning' || msg.type() === 'error') warnings.push(msg.text().slice(0, 160))
  })
  process.stdout.write(`  ${name.padEnd(10)}`)
  try {
    results[name] = { ...(await run(page)), consoleWarnings: [...new Set(warnings)] }
    console.log('done')
  } catch (err) {
    results[name] = { error: String(err).split('\n')[0] }
    console.log(`ERROR ${results[name].error}`)
  }
  await context.close()
}
await browser.close()

const env = `${BROWSER}${BROWSER === 'chromium' && !GPU ? ' (SwiftShader)' : ''}, ${MOBILE ? '375x812 touch' : '1280x800'}, cpu ${CPU}x`
console.log(`\nResults - ${env}\n`)
console.log(JSON.stringify(results, null, 2))
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify({ env, base: BASE, budgets: BUDGETS, results }, null, 2))

const failures = checkBudgets(results)
const errors = Object.entries(results).filter(([, r]) => r.error)

if (MARKDOWN_OUT) {
  const row = (scenario, metric, value, budget) => {
    const status = budget === undefined ? '' : value <= budget ? 'ok' : '**over**'
    return `| ${scenario} | ${metric} | ${value} | ${budget ?? '-'} | ${status} |`
  }
  const r = results
  const lines = [
    `### Benchmark - ${env}`,
    '',
    '| Scenario | Metric | Value | Budget | |',
    '| --- | --- | --- | --- | --- |',
    ...(r.home && !r.home.error
      ? [
          row('home', 'CLS', r.home.cls, BUDGETS.homeCls),
          row('home', 'first contentful paint (ms)', r.home.fcpMs),
          row('home', 'first 3D frame (ms)', r.home.firstFrameMs),
          row('home', 'draw calls per carousel frame', r.home.autoplay.drawsPerFrame),
        ]
      : []),
    ...(r.idle && !r.idle.error ? [row('idle', 'frames drawn in 5 s at rest', r.idle.framesDrawn, BUDGETS.idleFrames)] : []),
    ...(r.offscreen && !r.offscreen.error
      ? [
          row('offscreen', 'draw calls in 13 s', r.offscreen.drawCalls, BUDGETS.offscreenDrawCalls),
          row('offscreen', 'slide changes', r.offscreen.slideChanges, BUDGETS.offscreenSlideChanges),
        ]
      : []),
    ...(r.hidden && !r.hidden.error ? [row('hidden', 'slide changes', r.hidden.slideChanges, BUDGETS.hiddenSlideChanges)] : []),
    ...(r.scroll && !r.scroll.error
      ? [
          row('scroll', 'WebGL contexts created', r.scroll.contextsCreated),
          row('scroll', 'most alive at once', r.scroll.maxLiveContexts, BUDGETS.scrollMaxLiveContexts),
        ]
      : []),
    ...errors.map(([name, e]) => `| ${name} | failed to run | ${e.error} | | **error** |`),
    '',
    'Timings under SwiftShader are CPU-rendered: compare them run to run, not against real hardware.',
    '',
  ]
  writeFileSync(MARKDOWN_OUT, lines.join('\n'))
}
if (failures.length || errors.length) {
  console.error(`\n${failures.length + errors.length} problem(s):`)
  for (const f of failures) console.error(`  - over budget: ${f}`)
  for (const [name, r] of errors) console.error(`  - ${name} failed to run: ${r.error}`)
  process.exit(1)
}
console.log('\nAll budgets met.')
