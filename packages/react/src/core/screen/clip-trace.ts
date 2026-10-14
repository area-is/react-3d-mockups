/**
 * EXPERIMENTAL: the tracing behind interactive screens (`experimentalScreenInput`).
 *
 * With input on, a screen's DOM stacks ABOVE the canvas, where pointers can
 * reach it, and is clipped every frame to the part of the screen the
 * hardware leaves visible. That part is read back from the canvas itself:
 * the screen's depth mask still renders, and clears the canvas to
 * transparent wherever the screen is the nearest surface - so inside the
 * screen's projected bounds, transparent means "visible screen" and opaque
 * means "hardware in front". This turns those pixels into a
 * `clip-path: path(evenodd, ...)`, and clip-path clips hit-testing as well
 * as painting.
 *
 * Pure: no DOM, no WebGL, so it is unit-tested on plain grids.
 */

/**
 * Trace the cells of a `w` x `h` grid for which `inside(x, y)` holds into
 * closed loops, as SVG path data. Grid units are pixels with corners on
 * integers and centres on halves; `toX` and `toY` map them to the path's
 * own units. Marching squares over the pixel centres, the grid padded with
 * outside cells so every loop closes. Rows are top-down.
 *
 * Every edge midpoint where the inside/outside sign changes is shared by
 * exactly two cells and gets one segment end from each, so every vertex has
 * degree two and loops can be walked without orientation; `evenodd` makes
 * holes come out right either way.
 */
export function traceTransparent(
  inside: (x: number, y: number) => boolean,
  w: number,
  h: number,
  toX: (x: number) => number,
  toY: (y: number) => number
): { path: string; vertices: number } {
  // Vertices are edge midpoints at doubled integer coordinates: a midpoint
  // between sample (x, y) and (x + 1, y) sits at (2x + 2, 2y + 1) halves.
  const stride = 2 * (w + 3)
  const key = (x2: number, y2: number) => (y2 + 2) * stride + (x2 + 2)
  const adjacency = new Map<number, number[]>()
  const link = (a: number, b: number) => {
    const la = adjacency.get(a)
    if (la) la.push(b)
    else adjacency.set(a, [b])
    const lb = adjacency.get(b)
    if (lb) lb.push(a)
    else adjacency.set(b, [a])
  }
  const at = (x: number, y: number) => (x >= 0 && y >= 0 && x < w && y < h ? inside(x, y) : false)
  for (let y = -1; y < h; y++) {
    let tl = at(-1, y)
    let bl = at(-1, y + 1)
    for (let x = -1; x < w; x++) {
      const tr = at(x + 1, y)
      const br = at(x + 1, y + 1)
      const code = (tl ? 8 : 0) | (tr ? 4 : 0) | (br ? 2 : 0) | (bl ? 1 : 0)
      if (code !== 0 && code !== 15) {
        // Sample (x, y) has its centre at (x + 0.5, y + 0.5): in halves, 2x + 1.
        const top = key(2 * x + 2, 2 * y + 1)
        const right = key(2 * x + 3, 2 * y + 2)
        const bottom = key(2 * x + 2, 2 * y + 3)
        const left = key(2 * x + 1, 2 * y + 2)
        switch (code) {
          case 1: case 14: link(left, bottom); break
          case 2: case 13: link(bottom, right); break
          case 3: case 12: link(left, right); break
          case 4: case 11: link(top, right); break
          case 6: case 9: link(top, bottom); break
          case 7: case 8: link(left, top); break
          // Saddles: keep the two inside corners apart.
          case 5: link(top, right); link(left, bottom); break
          case 10: link(left, top); link(bottom, right); break
        }
      }
      tl = tr
      bl = br
    }
  }
  const coord = (k: number): [number, number] => [(k % stride) - 2, Math.floor(k / stride) - 2]
  let path = ''
  let vertices = 0
  const seen = new Set<number>()
  for (const start of adjacency.keys()) {
    if (seen.has(start)) continue
    const loop: number[] = []
    let cursor = start
    for (;;) {
      seen.add(cursor)
      loop.push(cursor)
      const [a, b] = adjacency.get(cursor)!
      const next = !seen.has(a!) ? a! : !seen.has(b!) ? b! : -1
      if (next === -1) break
      cursor = next
    }
    if (loop.length < 3) continue
    // Drop vertices that sit on a straight run.
    const points = loop.map(coord)
    const kept: [number, number][] = []
    for (let i = 0; i < points.length; i++) {
      const p = points[(i - 1 + points.length) % points.length]!
      const c = points[i]!
      const n = points[(i + 1) % points.length]!
      const ax = c[0] - p[0], ay = c[1] - p[1], bx = n[0] - c[0], by = n[1] - c[1]
      if (ax * by - ay * bx !== 0) kept.push(c)
    }
    if (kept.length < 3) continue
    vertices += kept.length
    path += `M${toX(kept[0]![0] / 2)} ${toY(kept[0]![1] / 2)}`
    for (let i = 1; i < kept.length; i++) path += `L${toX(kept[i]![0] / 2)} ${toY(kept[i]![1] / 2)}`
    path += 'Z'
  }
  return { path, vertices }
}
