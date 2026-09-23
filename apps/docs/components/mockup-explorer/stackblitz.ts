/**
 * "Open in StackBlitz": the explorer's `demo.tsx`, as a Vite + React +
 * TypeScript project that installs and runs.
 *
 * Sent through StackBlitz's POST API - a form of `project[...]` fields - so it
 * costs no SDK dependency. `template: 'node'` is the WebContainers runtime:
 * the project is a real npm package, and StackBlitz installs it and runs its
 * `dev` script, which is what makes `package.json` the one file that decides
 * whether it boots.
 *
 * The file builder is pure and the form is built apart from it, so what goes
 * into the project can be checked without a browser.
 */

const RUN = 'https://stackblitz.com/run?file=src/App.tsx'

const PACKAGE = {
  name: 'react-3d-mockups-demo',
  private: true,
  version: '0.0.0',
  type: 'module',
  scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
  // Inside the library's peer ranges, held to the minors this site runs.
  // Left at `^`, a fresh install takes React 19.3, which only fiber 9.8
  // accepts - and under fiber 9.8.0 the mockup draws but its screen never
  // mounts, so the project would open on a blank device. `react-3d-mockups`
  // itself installs from the npm registry, not from this repo, so the project
  // runs whatever was last published under `latest` - not necessarily the
  // build these docs describe.
  dependencies: {
    '@react-three/drei': '^10.7.0',
    '@react-three/fiber': '~9.7.0',
    react: '~19.2.0',
    'react-3d-mockups': 'latest',
    'react-dom': '~19.2.0',
    three: '~0.185.0',
  },
  // What `npm create vite` puts in its react-ts template today. The types and
  // the tsconfig are for the editor alone - Vite strips types without checking
  // them - but without them every line of the demo opens underlined in red.
  devDependencies: {
    '@types/react': '^19.2.18',
    '@types/react-dom': '^19.2.7',
    '@vitejs/plugin-react': '^6.1.1',
    typescript: '~6.0.2',
    vite: '^8.3.0',
  },
}

const TSCONFIG = {
  compilerOptions: {
    target: 'ES2022',
    lib: ['ES2022', 'DOM', 'DOM.Iterable'],
    module: 'ESNext',
    moduleResolution: 'bundler',
    jsx: 'react-jsx',
    strict: true,
    skipLibCheck: true,
    noEmit: true,
  },
  include: ['src'],
}

const VITE_CONFIG = `import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
})
`

const MAIN = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
`

const html = (component: string) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${component} - react-3d-mockups</title>
    <style>
      body {
        margin: 0;
        background: #eef0f4;
        font-family: system-ui, sans-serif;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`

/**
 * The screen the project mounts where the docs mount their own.
 *
 * The docs' screens - the carousel artwork, the chroma fill, the counter -
 * live in this site and import its styles, so none of them can travel. This
 * one is self-contained, and it ticks: the thing worth seeing in a first run
 * is that the surface is live React, not a picture.
 */
const yourApp = (replaced: string[]) => `
/**
 * Stands in for ${replaced.map((name) => `<${name} />`).join(', ')}, which the docs page
 * stages here from its own source. Anything React renders can go in its place.
 */
function YourApp() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      style={{
        height: '100%',
        display: 'grid',
        placeContent: 'center',
        gap: 8,
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: '#fff',
        background: 'linear-gradient(160deg, #4f46e5, #0ea5e9)',
      }}
    >
      <strong style={{ fontSize: 22 }}>Your app here</strong>
      <span style={{ fontSize: 56, fontWeight: 700 }}>{seconds}</span>
      <span style={{ fontSize: 13, opacity: 0.8 }}>seconds of live React state</span>
    </div>
  )
}
`

const APP = `
/** The demo sizes its own wrapper; the page only centres it in the viewport. */
export default function App() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', alignContent: 'center' }}>
      <Demo />
    </main>
  )
}
`

/** `import { SwissRotation } from './swiss-art'` - a screen from this site. */
const LOCAL_IMPORT = /^import \{ ([^}]+) \} from '\.[^']*'\n/gm

/**
 * `demo.tsx` made to run outside this site.
 *
 * Two edits, and nothing else is touched, so the file opens reading as the
 * snippet on the page. The `'use client'` directive goes: it is a
 * server-components marker, and a Vite app has none. And every import from
 * this site - the screen the snippet mounts - becomes `YourApp`, defined in
 * the file.
 */
function appSource(code: string): string {
  const replaced: string[] = []
  let source = code.replace(/^'use client'\n\n?/, '').replace(LOCAL_IMPORT, (_, names: string) => {
    replaced.push(...names.split(',').map((name) => name.trim()))
    return ''
  })
  for (const name of replaced) source = source.replace(new RegExp(`<(/?)${name}\\b`, 'g'), '<$1YourApp')
  const hooks = replaced.length ? `import { useEffect, useState } from 'react'\n` : ''
  return `${hooks}${source.trimEnd()}\n${replaced.length ? yourApp(replaced) : ''}${APP}`
}

/** The project's files, by path: `demo.tsx` in `src/App.tsx`, and a Vite app around it. */
export function stackblitzFiles(code: string, component: string): Record<string, string> {
  return {
    'package.json': `${JSON.stringify(PACKAGE, null, 2)}\n`,
    'tsconfig.json': `${JSON.stringify(TSCONFIG, null, 2)}\n`,
    'vite.config.ts': VITE_CONFIG,
    'index.html': html(component),
    'src/main.tsx': MAIN,
    'src/App.tsx': appSource(code),
  }
}

/**
 * Opens the project in a new tab.
 *
 * A form rather than a link because the files do not fit in a URL. It is
 * submitted from inside the click that asked for it, which is what lets a
 * `_blank` target past popup blockers, and removed straight after - the
 * submission has already been handed to the new tab by then.
 */
export function openInStackBlitz(code: string, component: string): void {
  const fields: Record<string, string> = {
    'project[title]': `${component} - react-3d-mockups`,
    'project[description]': `<${component}> with the props set in the react-3d-mockups docs explorer.`,
    'project[template]': 'node',
  }
  for (const [path, contents] of Object.entries(stackblitzFiles(code, component))) {
    fields[`project[files][${path}]`] = contents
  }

  const form = document.createElement('form')
  form.method = 'post'
  form.action = RUN
  form.target = '_blank'
  form.rel = 'noopener'
  form.style.display = 'none'
  for (const [name, value] of Object.entries(fields)) {
    // Hidden inputs keep newlines verbatim, where a text input would strip
    // them and send every file as one line.
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.append(input)
  }
  document.body.append(form)
  form.submit()
  form.remove()
}
