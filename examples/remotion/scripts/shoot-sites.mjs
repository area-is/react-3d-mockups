#!/usr/bin/env node
/*
 * The sample-site screenshots the promo film scrolls through
 * (`public/promo/sites/<slug>.webp`): each site's first two screens, taken
 * from the docs site, with its 3D scenes drawn.
 *
 * Run the docs site first (`npm run dev -w docs`, or `next dev -p <port>` in
 * apps/docs), then from the repo root:
 *
 *     node examples/remotion/scripts/shoot-sites.mjs                 # every site, docs on :3000
 *     node examples/remotion/scripts/shoot-sites.mjs --port 3100 ledger cafe
 *
 * Uses the monorepo's Playwright and ffmpeg. Set PLAYWRIGHT_CHROMIUM to a
 * Chromium binary if Playwright's own is not installed. WebGL runs on
 * SwiftShader, so it is slow but needs no GPU.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const SITES = ['ledger', 'stream', 'arcade', 'ambient', 'print-shop', 'packaging', 'stationery', 'atlas', 'campaign', 'cafe', 'fleet', 'matchday']

const args = process.argv.slice(2)
const portAt = args.indexOf('--port')
const port = portAt === -1 ? 3000 : Number(args[portAt + 1])
const named = args.filter((arg, i) => !arg.startsWith('--') && i !== portAt + 1)
const sites = named.length ? named : SITES
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'promo', 'sites')
mkdirSync(out, { recursive: true })

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
// Two screens tall in one viewport, so the scenes further down are drawn too
// (an off-screen canvas pauses, and a full-page capture would find it blank).
const page = await browser.newPage({ viewport: { width: 1440, height: 1800 } })
for (const site of sites) {
  const png = join(out, `${site}.png`)
  await page.goto(`http://localhost:${port}/react-3d-mockups/examples/${site}`, { waitUntil: 'networkidle', timeout: 300_000 })
  // Next's dev-mode badge.
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' })
  await page.waitForTimeout(9000)
  await page.screenshot({ path: png, timeout: 120_000, animations: 'disabled' })
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-vf', 'scale=1280:1600:flags=lanczos', '-c:v', 'libwebp', '-quality', '78', join(out, `${site}.webp`)])
  rmSync(png)
  console.log(`public/promo/sites/${site}.webp`)
}
await browser.close()
