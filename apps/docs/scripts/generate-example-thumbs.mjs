/**
 * Thumbnails for the header's Examples menu: the first screen of each example
 * page, shrunk to a card.
 *
 * Twelve names in a menu - Ledger, Atlas, Fleet - say little about what each
 * one shows; a glimpse of the page says it at once. The shot is the example
 * as a visitor lands on it at 1280x800, minus the site's own bar across the
 * top (which is the same on every example and would be the most legible thing
 * in all twelve), written as WebP to public/examples/.
 *
 *   npm run example-thumbs                  regenerate all twelve
 *   npm run example-thumbs -- --only=cafe   substring filter on the slug
 *
 * Expects the docs dev server on PORT (default 3000); pass --base to override.
 */
import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { BASE_PATH } from '../lib/base-path.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const OUT = join(here, '..', 'public', 'examples')

/** Kept in step with components/site-examples.ts, which a node script cannot import. */
const SLUGS = [
  'ledger',
  'stream',
  'arcade',
  'ambient',
  'print-shop',
  'packaging',
  'stationery',
  'atlas',
  'campaign',
  'cafe',
  'fleet',
  'matchday',
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
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })
const page = await context.newPage()

const failures = []
for (const slug of SLUGS.filter((s) => !ONLY || s.includes(ONLY))) {
  try {
    await page.goto(`${BASE}/examples/${slug}`, { waitUntil: 'networkidle', timeout: 180_000 })
    // `nextjs-portal` is the dev server's badge, which would otherwise sit in
    // the corner of every thumbnail generated against `npm run dev`.
    await page.addStyleTag({ content: '.ex-bar, nextjs-portal { display: none !important; }' })
    // Long enough for the scenes to build and their screens to land under
    // SwiftShader; the pages hold still once they have.
    await page.waitForTimeout(9000)
    const png = await page.screenshot({ timeout: 60_000 })
    const file = join(OUT, `${slug}.webp`)
    // Three times the size the menu shows them at (see `.nav-menu-thumb`), so
    // they stay sharp on a high-density screen.
    const info = await sharp(png).resize(192, 120).webp({ quality: 72, effort: 6 }).toFile(file)
    console.log(`  write  ${slug}.webp  ${(info.size / 1024).toFixed(1)} KB`)
  } catch (err) {
    failures.push(`${slug}: ${String(err).split('\n')[0]}`)
    console.log(`  ERROR  ${slug} - ${String(err).split('\n')[0]}`)
  }
}

await browser.close()
if (failures.length) {
  console.error(`\n${failures.length} failed:\n  ${failures.join('\n  ')}`)
  process.exit(1)
}
