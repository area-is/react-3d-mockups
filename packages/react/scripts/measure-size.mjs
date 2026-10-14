/**
 * Measures what importing each mockup really costs an app: esbuild bundles a
 * one-line entry per component FROM THE BUILT PACKAGE (`dist/index.js`, what
 * npm ships), peers external, minified, and reports raw and gzip sizes.
 *
 *   node scripts/measure-size.mjs           print the table
 *   node scripts/measure-size.mjs --write   rewrite the docs' import-cost table
 *   node scripts/measure-size.mjs --check   fail if an import has grown >10%
 *                                           past its documented gzip size
 *
 * It used to bundle `src/`, where every module is its own file and tree-shaking
 * works by construction - and so it never saw that the published single-file
 * `dist/index.js` kept the whole library behind any one import. Measuring the
 * artifact is the point; run `npm run build` first.
 *
 * Peers are what the app already installs once (react, three, fiber, drei).
 * The runtime dependencies (the CSG engine, its-fine) are counted, because an
 * app bundles them on our behalf.
 *
 * Bundled with code splitting, as an app's bundler does, and counting only
 * what the import loads up front: the entry and every chunk it imports
 * statically. A dynamic `import()` the library makes for an opt-in feature
 * (today the experimental screen input) becomes a chunk the app fetches only
 * when the feature is used, so it is reported beside the total rather than in
 * it. Without splitting, esbuild inlines dynamic imports, and the table would
 * charge every app for code most never load.
 */
import { build } from 'esbuild'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const DOC = join(root, '..', '..', 'apps', 'docs', 'content', 'docs', 'devices.mdx')
const PEERS = ['react', 'react-dom', 'react/*', 'three', 'three/*', '@react-three/fiber', '@react-three/drei']
/** How far past its documented gzip size an import may grow before `--check` fails. */
const TOLERANCE = 0.1

/** `[component, label]` in the docs table's order; the label is the table's first column. */
const ENTRIES = [
  ['GalaxyMockup', 'Galaxy family'],
  ['IPhoneMockup', 'iPhone family'],
  ['IPhoneDuoMockup', 'iPhone Duo'],
  ['FoldMockup', 'Galaxy Z Fold family'],
  ['FlipMockup', 'Galaxy Z Flip family'],
  ['LaptopMockup', 'MacBook Air, Pro + Neo'],
  ['IPadMockup', 'iPad family'],
  ['GalaxyTabMockup', 'Galaxy Tab family'],
  ['AppleWatchMockup', 'Apple Watch'],
  ['GalaxyWatchMockup', 'Galaxy Watch'],
  ['StudioDisplayMockup', 'Studio Display'],
  ['BookMockup', 'hardcover'],
  ['MagazineMockup', 'glossy monthly'],
  ['BrochureMockup', 'tri-fold'],
  ['BusinessCardMockup', '32 pt card'],
  ['IDCardMockup', 'badge + lanyard'],
  ['CreditCardMockup', 'embossed payment card'],
  ['PosterFrameMockup', '18×24 frame'],
  ['ProductBoxMockup', 'retail carton'],
  ['RollupBannerMockup', '850×2000 stand'],
  ['BillboardMockup', '14×48 bulletin'],
  ['BusMockup', 'transit bus'],
  ['VanMockup', 'cargo van'],
  ['BusShelterMockup', '6-sheet shelter'],
  ['GreetingCardMockup', 'A7 card'],
  ['VinylRecordMockup', '12" LP'],
  ['TVSetMockup', '65" TV'],
  ['AFrameSignMockup', 'sandwich board'],
  ['DOOHTotemMockup', 'digital totem'],
  ['StorefrontMockup', 'shop façade'],
  ['SemiTrailerMockup', '53 ft dry van'],
  ['MailerBoxMockup', 'shipper box'],
  ['MilkCartonMockup', 'gable-top carton'],
  ['ShoppingBagMockup', 'kraft carrier'],
  ['CustomPanelMockup', 'any-size sheet'],
  ['CustomBoxMockup', 'any-size box'],
]

// Splitting needs a real entry file (esbuild will not split stdin) and an
// output directory, though nothing is written to it.
const scratch = mkdtempSync(join(tmpdir(), 'measure-size-'))
process.on('exit', () => rmSync(scratch, { recursive: true, force: true }))

/** Sizes of what `contents` loads up front, and of the chunks it only loads on demand. */
async function measure(contents) {
  const entry = join(scratch, 'entry.js')
  writeFileSync(entry, contents.replaceAll("'./dist/", `'${join(root, 'dist')}/`))
  const result = await build({
    entryPoints: [entry],
    absWorkingDir: scratch,
    outdir: join(scratch, 'out'),
    bundle: true,
    splitting: true,
    minify: true,
    write: false,
    metafile: true,
    format: 'esm',
    target: 'es2022',
    platform: 'browser',
    external: PEERS,
    // The banner every component module carries; esbuild warns that it
    // ignores it in a bundle, which is exactly what an app bundler does too.
    logLevel: 'error',
  })
  const files = new Map(result.outputFiles.map((file) => [relative(scratch, file.path), file.contents]))
  const outputs = result.metafile.outputs
  const start = Object.keys(outputs).find((path) => outputs[path].entryPoint)
  // Walk the static imports from the entry: that is what loads with it.
  const upfront = new Set()
  const walk = (path) => {
    if (upfront.has(path)) return
    upfront.add(path)
    for (const imported of outputs[path].imports) if (!imported.external && imported.kind === 'import-statement') walk(imported.path)
  }
  walk(start)
  const bytes = Buffer.concat([...upfront].map((path) => files.get(path)))
  const lazy = Object.keys(outputs)
    .filter((path) => !upfront.has(path) && path.endsWith('.js'))
    .reduce((sum, path) => sum + gzipSync(files.get(path)).length / 1024, 0)
  return { min: bytes.length / 1024, gzip: gzipSync(bytes).length / 1024, lazy }
}

const kb = (n) => `${n.toFixed(1)} KB`
const rows = []
for (const [component, label] of ENTRIES) {
  rows.push({ component, label, ...(await measure(`export { ${component} } from './dist/index.js'`)) })
}
const whole = await measure(`export * from './dist/index.js'`)

const mode = process.argv[2]
if (!mode) {
  const lazy = (r) => (r.lazy > 0 ? ` (+ ${kb(r.lazy)} gzip on demand)` : '')
  for (const r of rows) console.log(`${r.component}: ${kb(r.min)} min / ${kb(r.gzip)} gzip${lazy(r)}`)
  console.log(`everything: ${kb(whole.min)} min / ${kb(whole.gzip)} gzip${lazy(whole)}`)
  process.exit(0)
}

const doc = readFileSync(DOC, 'utf8')
const TABLE = /(\| Import \| Minified \| Gzip \|\n\| --- \| --- \| --- \|\n)((?:\|[^\n]*\n)+)/

if (mode === '--write') {
  const body =
    rows.map((r) => `| \`${r.component}\` (${r.label}) | ${kb(r.min)} | ${kb(r.gzip)} |`).join('\n') +
    `\n| Whole library (every export) | ${kb(whole.min)} | ${kb(whole.gzip)} |\n`
  if (!TABLE.test(doc)) throw new Error(`No import-cost table found in ${DOC}`)
  writeFileSync(DOC, doc.replace(TABLE, (_m, head) => head + body))
  console.log(`Rewrote the import-cost table in ${DOC}.`)
} else if (mode === '--check') {
  const documented = new Map(
    [...(doc.match(TABLE)?.[2] ?? '').matchAll(/\| `(\w+)`[^|]*\| [\d.]+ KB \| ([\d.]+) KB \|/g)].map((m) => [
      m[1],
      Number(m[2]),
    ])
  )
  const failures = rows.filter((r) => {
    const limit = documented.get(r.component)
    return limit === undefined || r.gzip > limit * (1 + TOLERANCE)
  })
  for (const r of failures) {
    const limit = documented.get(r.component)
    console.error(
      limit === undefined
        ? `${r.component}: not in the import-cost table of ${DOC}`
        : `${r.component}: ${kb(r.gzip)} gzip, documented ${kb(limit)} (+${Math.round((r.gzip / limit - 1) * 100)}%)`
    )
  }
  if (failures.length > 0) {
    console.error('\nAn import grew past its documented size. If that is intended, run `npm run size:write` and commit.')
    process.exit(1)
  }
  console.log(`All ${rows.length} imports within ${TOLERANCE * 100}% of their documented size.`)
} else {
  throw new Error(`Unknown option ${mode}. Use --write or --check.`)
}
