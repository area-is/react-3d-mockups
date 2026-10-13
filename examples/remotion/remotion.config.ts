import path from 'node:path'
import { Config } from '@remotion/cli/config'

/*
 * One copy of each renderer package. `react-3d-mockups` is installed from the
 * monorepo (`file:../../packages/react`), and webpack follows that symlink to
 * the package's real path, where `react`, `three` and friends resolve to the
 * monorepo's own node_modules - a second React (hooks throw "Invalid hook
 * call") and a second three.js (materials silently fail `instanceof`). An app
 * that installs the package from npm has a single copy and needs none of this.
 */
const single = (name: string) => path.resolve(process.cwd(), 'node_modules', name)

/*
 * The promo film (`src/promo`) shows the docs site's own artwork - the home
 * carousel's screens and prints, the sample sites' apps - imported from
 * `apps/docs` rather than copied. Those files import each other through the
 * site's `@/` alias, and their pictures through `@/lib/base-path.mjs`, which
 * here is a shim that hands back webpack's URL for the file (see
 * `src/promo/docs-asset.ts`). Their `tabbied` is pinned to this project's
 * copy: two copies would each register `<css-doodle>`.
 */
const docs = path.resolve(process.cwd(), '../../apps/docs')
const tabbied = (file: string) => path.resolve(process.cwd(), 'node_modules/tabbied/dist', file)

Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...(config.resolve?.alias as Record<string, string> | undefined),
      '@/lib/base-path.mjs$': path.resolve(process.cwd(), 'src/promo/docs-asset.ts'),
      '@': docs,
      tabbied$: tabbied('core/index.js'),
      'tabbied/react$': tabbied('react/index.js'),
      'tabbied/patterns$': tabbied('patterns.generated.js'),
      react: single('react'),
      'react-dom': single('react-dom'),
      three: single('three'),
      '@react-three/fiber': single('@react-three/fiber'),
      '@react-three/drei': single('@react-three/drei'),
    },
  },
}))

// WebGL in headless Chrome with no GPU: ANGLE over SwiftShader. On a machine
// with a GPU, `--gl=angle` is much faster.
Config.setChromiumOpenGlRenderer('swangle')
Config.setVideoImageFormat('jpeg')
Config.setJpegQuality(92)
// Cold mounts compile shaders and build CSG geometry on the CPU.
Config.setDelayRenderTimeoutInMilliseconds(120_000)

// Capture frames without Chrome's `fromSurface` path. Under CPU pressure it
// occasionally photographed a frame before the WebGL canvas had reached the
// compositor - a whole mockup, or one of its screens, missing for one frame.
// Remotion's renderer reads this variable at capture time.
process.env.DISABLE_FROM_SURFACE ??= '1'

// Use a local Chrome Headless Shell when one is provided (CI images, sandboxes
// without access to Remotion's download host).
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE)
}
