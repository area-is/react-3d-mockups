/**
 * The pictures beside the home page's four feature claims.
 *
 * Renders each one through the /harness route - the real WebGL mockup, not a
 * drawing of one - screenshots it on a transparent background, trims it to
 * the object and writes a WebP to public/features/. The home page shows these
 * as plain images: a live canvas per claim would put four more WebGL contexts
 * on a page that already has the carousel's, to illustrate sentences.
 *
 *   npm run features              regenerate all four
 *   npm run features -- --only=bus substring filter on the shot name
 *
 * Expects the docs dev server on PORT (default 3000, which is what `npm run
 * dev` serves); pass --base to override. SwiftShader, like the thumbnails, so
 * no GPU is needed and the frames match from one machine to the next.
 */
import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { BASE_PATH } from '../lib/base-path.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const OUT = join(here, '..', 'public', 'features')

/** Harness query per picture; the file names are what the home page references. */
const SHOTS = [
  // Real GPU rendering: the back, where the materials and the machined
  // camera island are - the side no flat mockup ever shows.
  { name: 'rendering', query: 'device=iphone&pvariant=pro&color=cosmicorange&ry=208&rx=10&screen=dark&shadows=1&dist=6.4' },
  // Any content on the surface: a whole site, live on the glass.
  { name: 'surface', query: 'device=laptop&lvariant=air13&color=silver&ry=-26&rx=12&screen=art&art=SwissSite&shadows=1&dist=6.9' },
  // Procedural objects: a city bus, built from geometry, with its LED sign.
  // Street side, where the panel is clear of the doors.
  { name: 'procedural', query: 'device=bus&ry=208&rx=8&screen=art&art=BusAdArt&sign=42%20DOWNTOWN&shadows=1&dist=10.2' },
  // Composable by design: two bare devices in one canvas.
  { name: 'composable', query: 'device=composed&rx=6&ry=-10&shadows=1' },
]

const args = process.argv.slice(2)
const ONLY = args.find((a) => a.startsWith('--only='))?.slice(7)
const BASE =
  args.find((a) => a.startsWith('--base='))?.slice(7) ?? `http://localhost:${process.env.PORT ?? 3000}${BASE_PATH}`

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
// 2x, so the pictures stay sharp on a high-density screen at the size the
// page shows them (see `.feature-figure`).
const context = await browser.newContext({ viewport: { width: 720, height: 540 }, deviceScaleFactor: 2 })
const page = await context.newPage()

const failures = []
for (const shot of SHOTS.filter((s) => !ONLY || s.name.includes(ONLY))) {
  try {
    await page.goto(`${BASE}/harness?${shot.query}&bg=transparent`, { waitUntil: 'networkidle', timeout: 180_000 })
    await page.waitForSelector('canvas', { timeout: 60_000 })
    // The dev server's badge would be kept by the trim below.
    await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' })
    // The screens arrive through drei's <Html> a few frames after the canvas
    // (see device-screen.tsx), and SwiftShader frames are slow.
    await page.waitForTimeout(6000)
    const png = await page.screenshot({ omitBackground: true, timeout: 60_000 })
    const file = join(OUT, `${shot.name}.webp`)
    const info = await sharp(png)
      .trim({ threshold: 1 })
      .resize({ width: 1040, height: 720, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, alphaQuality: 90, effort: 6 })
      .toFile(file)
    console.log(`  write  ${shot.name}.webp  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(1)} KB`)
  } catch (err) {
    failures.push(`${shot.name}: ${String(err).split('\n')[0]}`)
    console.log(`  ERROR  ${shot.name} - ${String(err).split('\n')[0]}`)
  }
}

await browser.close()
if (failures.length) {
  console.error(`\n${failures.length} failed:\n  ${failures.join('\n  ')}`)
  process.exit(1)
}
