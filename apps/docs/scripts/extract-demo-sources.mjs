// Generates lib/demo-sources.generated.ts: the complete source behind every
// surface the prop explorer can stage, so a surface tab shows the whole thing
// rather than a one-liner that defers to a component the reader cannot see.
//
// "Complete" is the point. The carousel's pieces are each one call to a shared
// layout - `SwissDialA` is a single `<SwissDial …/>` - so printing the piece
// alone told a reader the watch face exists and nothing about how it is built.
// So this walks the import graph from each piece and collects every local
// declaration it reaches: the layout, the helpers it calls, the palette it
// indexes, the types they are written against. What is left over is the
// imports from outside the docs app, which are emitted as import lines.
//
// The declarations are stored once each in `SOURCE_PARTS` and referenced by
// key, because the eighteen carousel pieces share most of their source and a
// composed string per piece would ship the same layout eighteen times.
//
// Run automatically before `next dev` / `next build`; the output is committed
// so typecheck works without running it.
import ts from 'typescript'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Where the explorer's surfaces come from.
 *
 * Every screen component these files import out of `components/screens` is an
 * entry: `carousel-art.tsx` brings the artwork the home page stages on each
 * object, and the explorer itself brings the three generic demos it falls back
 * to (`ChromaSurface`, `SurfaceArt`, `LiveCounter`). Reading the entry set off
 * the imports rather than restating it here is what keeps this from being a
 * second list to maintain: a piece added to the carousel is a piece this
 * script already knows about.
 */
const ROOTS = ['components/mockup-explorer/carousel-art.tsx', 'components/mockup-explorer/index.tsx']

/** Imports landing here are screen source to inline; everything else is an import line. */
const SCREENS = resolve(root, 'components/screens')

/* ------------------------------------------------------------------ */
/*  Reading a file                                                     */
/* ------------------------------------------------------------------ */

/** Parsed files, by absolute path - the graph is walked once per entry. */
const files = new Map()

/** Which node kinds own their `name` rather than referring to something. */
const namesItself = (node) =>
  ts.isFunctionDeclaration(node) ||
  ts.isFunctionExpression(node) ||
  ts.isClassDeclaration(node) ||
  ts.isInterfaceDeclaration(node) ||
  ts.isTypeAliasDeclaration(node) ||
  ts.isEnumDeclaration(node) ||
  ts.isMethodDeclaration(node)

/**
 * Every name a declaration refers to, so the closure can follow them.
 *
 * Only the positions that really are references count: `t.accent` refers to
 * `t`, `{ ground: … }` to nothing, `style={…}` to what is inside the braces.
 * The names a declaration introduces - its own, its parameters, its locals -
 * are skipped, so a component with a `tone` parameter does not drag in a
 * module-level `tone` it never mentions.
 */
function references(node) {
  const names = new Set()
  const visit = (n) => {
    if (ts.isPropertyAccessExpression(n)) return visit(n.expression)
    if (ts.isQualifiedName(n)) return visit(n.left)
    if (ts.isPropertyAssignment(n)) {
      if (ts.isComputedPropertyName(n.name)) visit(n.name)
      return visit(n.initializer)
    }
    if (ts.isPropertySignature(n) || ts.isMethodSignature(n)) return n.type && visit(n.type)
    if (ts.isJsxAttribute(n)) return n.initializer && visit(n.initializer)
    if (ts.isParameter(n) || ts.isVariableDeclaration(n) || ts.isBindingElement(n)) {
      if (!ts.isIdentifier(n.name)) visit(n.name)
      if (n.type) visit(n.type)
      if (n.initializer) visit(n.initializer)
      return
    }
    if (ts.isIdentifier(n)) return void names.add(n.text)
    ts.forEachChild(n, (child) => {
      if (namesItself(n) && child === n.name) return
      visit(child)
    })
  }
  visit(node)
  return names
}

/**
 * The names a top-level component's own parameters bind.
 *
 * A parameter shadows a module-level name for the whole body, so a reference
 * to it inside is never a reference to the module's - which is what stops a
 * `Sheet({ tone })` from dragging in the unrelated `tone` helper beside it.
 */
function shadowed(statement) {
  const fn = ts.isFunctionDeclaration(statement)
    ? statement
    : ts.isVariableStatement(statement) && statement.declarationList.declarations.length === 1
      ? statement.declarationList.declarations[0].initializer
      : null
  if (!fn || !(ts.isFunctionDeclaration(fn) || ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)))
    return []
  const names = []
  const bound = (name) => {
    if (ts.isIdentifier(name)) names.push(name.text)
    else if (!ts.isComputedPropertyName(name))
      for (const element of name.elements) if (ts.isBindingElement(element)) bound(element.name)
  }
  for (const parameter of fn.parameters ?? []) bound(parameter.name)
  return names
}

/** Every name a top-level statement declares. */
function declaredBy(statement) {
  if (ts.isVariableStatement(statement))
    return statement.declarationList.declarations
      .map((d) => (ts.isIdentifier(d.name) ? d.name.text : null))
      .filter(Boolean)
  return statement.name && ts.isIdentifier(statement.name) ? [statement.name.text] : []
}

/**
 * A declaration's text, headed by the doc comment written against it.
 *
 * A comment counts as the declaration's own only when nothing but a line
 * break separates them, which is what tells a jsdoc block from the section
 * banners these files divide themselves with.
 */
function textOf(text, statement, source) {
  let from = statement.getStart(source)
  const comments = ts.getLeadingCommentRanges(text, statement.getFullStart()) ?? []
  for (let i = comments.length - 1; i >= 0; i--) {
    const gap = text.slice(comments[i].end, from)
    if (gap.trim() !== '' || gap.split('\n').length > 2) break
    from = comments[i].pos
  }
  return text.slice(from, statement.getEnd())
}

/** A relative import as a file on disk, or null for a package or an alias. */
function moduleFile(from, specifier) {
  if (!specifier.startsWith('.')) return null
  const base = resolve(dirname(from), specifier)
  const candidate = [`${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, `${base}/index.ts`].find(existsSync)
  return candidate ?? null
}

/** One file's top-level declarations, its imports, and whether it is a client module. */
function parse(path) {
  const cached = files.get(path)
  if (cached) return cached

  const text = readFileSync(path, 'utf8')
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const id = basename(path).replace(/\.tsx?$/, '')
  // Parts are keyed `<module>:<name>`, so two of them may not share a module.
  const clash = [...files.values()].find((other) => other.id === id)
  if (clash) throw new Error(`${relative(root, path)} and ${clash.rel} would share the key "${id}"`)
  const file = {
    path,
    rel: relative(root, path),
    id,
    useClient: false,
    decls: new Map(),
    imports: new Map(),
  }
  files.set(path, file)

  for (const statement of source.statements) {
    if (ts.isExpressionStatement(statement) && ts.isStringLiteral(statement.expression)) {
      file.useClient ||= statement.expression.text === 'use client'
      continue
    }
    if (ts.isImportDeclaration(statement)) {
      const clause = statement.importClause
      if (!clause || !ts.isStringLiteral(statement.moduleSpecifier)) continue
      const module = statement.moduleSpecifier.text
      const target = moduleFile(path, module)
      // Where the line stands in the file, so the head keeps the file's order.
      const at = file.imports.size
      const add = (local, binding) => file.imports.set(local, { module, target, local, at, ...binding })
      const typeOnly = clause.isTypeOnly
      if (clause.name) add(clause.name.text, { kind: 'default', imported: 'default', typeOnly })
      const bindings = clause.namedBindings
      if (bindings && ts.isNamespaceImport(bindings))
        add(bindings.name.text, { kind: 'namespace', imported: '*', typeOnly })
      else if (bindings)
        for (const element of bindings.elements)
          add(element.name.text, {
            kind: 'named',
            imported: (element.propertyName ?? element.name).text,
            typeOnly,
            inlineType: element.isTypeOnly,
          })
      continue
    }
    const names = declaredBy(statement)
    if (!names.length) continue
    const code = textOf(text, statement, source)
    const deps = references(statement)
    for (const name of [...names, ...shadowed(statement)]) deps.delete(name)
    for (const name of names)
      file.decls.set(name, { code, at: statement.getStart(source), deps: [...deps] })
  }
  return file
}

/* ------------------------------------------------------------------ */
/*  One screen's closure                                               */
/* ------------------------------------------------------------------ */

const partKey = (file, name) => `${file.id}:${name}`

/**
 * Everything one screen component is made of: the declarations it reaches
 * through the docs app's own modules, grouped by the file they live in, and
 * the imports each of those groups needs from outside it.
 */
function closure(rootFile, entry) {
  /** Part key -> where it came from, so the group can be sorted by source order. */
  const parts = new Map()
  /** File -> the bindings it uses from packages and aliases. */
  const outside = new Map()
  /** File -> the files its declarations pull from, for ordering the groups. */
  const edges = new Map()

  const external = (file, binding) => {
    if (!outside.has(file.path)) outside.set(file.path, new Map())
    outside.get(file.path).set(binding.local, binding)
  }

  /** Pull in `name` as `file` sees it, on behalf of `user`'s declarations. */
  const take = (file, name, user) => {
    const decl = file.decls.get(name)
    if (!decl) {
      const imported = file.imports.get(name)
      if (!imported) return null // a global: Math, JSON, the JSX runtime
      // A screen module: its source is inlined as a group of its own, and the
      // import line stays, so each group still reads as the file it came from.
      if (user === file) external(file, imported)
      if (imported.target) return take(parse(imported.target), imported.imported, user)
      return null
    }
    if (user && user !== file) edges.set(user.path, (edges.get(user.path) ?? new Set()).add(file.path))
    const key = partKey(file, name)
    if (parts.has(key)) return file
    parts.set(key, { file, name, at: decl.at })
    for (const dep of decl.deps) take(file, dep, file)
    return file
  }

  const home = take(rootFile, entry, null)
  if (!home) throw new Error(`${rootFile.rel}: cannot resolve the screen component ${entry}`)

  // Post-order from the file the screen itself lives in: what it is built out
  // of reads first, and the screen is the last thing in the panel.
  const order = []
  const walked = new Set()
  const walk = (path) => {
    if (walked.has(path)) return
    walked.add(path)
    for (const next of edges.get(path) ?? []) walk(next)
    order.push(path)
  }
  walk(home.path)
  for (const part of parts.values()) walk(part.file.path)

  return order.map((path) => {
    const file = files.get(path)
    const own = [...parts.values()].filter((part) => part.file.path === path).sort((a, b) => a.at - b.at)
    return {
      file: file.rel,
      head: head(file, outside.get(path)),
      parts: own.map((part) => partKey(file, part.name)),
    }
  })
}

/** The lines a file's group opens with: its directive, then the imports in play. */
function head(file, used) {
  const lines = []
  if (file.useClient) lines.push("'use client'", '')

  const byModule = new Map()
  for (const binding of used?.values() ?? []) {
    if (!byModule.has(binding.module)) byModule.set(binding.module, [])
    byModule.get(binding.module).push(binding)
  }
  const spec = (b) =>
    `${b.inlineType ? 'type ' : ''}${b.imported === b.local ? b.local : `${b.imported} as ${b.local}`}`
  const first = (bindings) => Math.min(...bindings.map((b) => b.at))
  for (const [module, bindings] of [...byModule].sort((a, b) => first(a[1]) - first(b[1]))) {
    const of = (kind, typeOnly) => bindings.filter((b) => b.kind === kind && !!b.typeOnly === typeOnly)
    for (const b of of('default', false)) lines.push(`import ${b.local} from '${module}'`)
    for (const b of of('namespace', false)) lines.push(`import * as ${b.local} from '${module}'`)
    for (const [keyword, named] of [['type ', of('named', true)], ['', of('named', false)]])
      if (named.length) {
        const list = named.sort((a, b) => a.local.localeCompare(b.local)).map(spec)
        lines.push(`import ${keyword}{ ${list.join(', ')} } from '${module}'`)
      }
  }
  if (lines.at(-1) === '') lines.pop()
  return lines
}

/* ------------------------------------------------------------------ */
/*  Output                                                             */
/* ------------------------------------------------------------------ */

/** Every screen component the explorer can stage, by the file it is imported into. */
const entries = new Map()
for (const rel of ROOTS) {
  const file = parse(resolve(root, rel))
  for (const [local, binding] of file.imports)
    if (binding.target?.startsWith(`${SCREENS}/`)) entries.set(local, file)
}

const screens = new Map()
for (const [name, file] of [...entries].sort(([a], [b]) => a.localeCompare(b)))
  screens.set(name, closure(file, name))

// Every part any screen pulled in, stored once: the pieces share most of them.
const used = new Set([...screens.values()].flatMap((groups) => groups.flatMap((g) => g.parts)))
const parts = new Map()
for (const file of files.values())
  for (const [name, decl] of file.decls)
    if (used.has(partKey(file, name))) parts.set(partKey(file, name), decl.code)

const json = (value) => JSON.stringify(value)
const output = `/* eslint-disable */
// AUTO-GENERATED by scripts/extract-demo-sources.mjs - do not edit by hand.
// The complete source behind every surface the prop explorer stages.

/** One file's contribution to a screen: what it imports, then what it declares. */
export interface SourceGroup {
  /** The file the declarations come from, relative to the docs app. */
  file: string
  /** The lines the group opens with - the client directive and the imports used. */
  head: string[]
  /** Keys into \`SOURCE_PARTS\`, in the order they are written in the file. */
  parts: string[]
}

/**
 * Every declaration the screens are built from, by \`<module>:<name>\`. Stored
 * once and referenced, because the carousel's pieces share their layouts.
 */
export const SOURCE_PARTS: Record<string, string> = {
${[...parts]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, code]) => `  ${json(key)}: ${json(code)}`)
  .join(',\n')},
}

/** Screen component -> the source of the whole thing, in reading order. */
export const SCREEN_SOURCES: Record<string, SourceGroup[]> = {
${[...screens]
  .map(([name, groups]) => `  ${json(name)}: ${json(groups)}`)
  .join(',\n')},
}
`
writeFileSync(resolve(root, 'lib/demo-sources.generated.ts'), output)
console.log(`extracted ${screens.size} screens from ${parts.size} declarations`)
