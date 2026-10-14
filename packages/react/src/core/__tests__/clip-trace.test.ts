import { describe, expect, it } from 'vitest'
import { traceTransparent } from '../screen/clip-trace'

/**
 * The tracer behind `experimentalScreenInput`: what it draws is the only
 * part of the screen that shows and takes pointers, so a pixel it gets wrong
 * is content painted over hardware, or a dead spot on the glass.
 */

const trace = (rows: string[]) =>
  traceTransparent(
    (x, y) => rows[y]![x] === '#',
    rows[0]!.length,
    rows.length,
    (x) => x,
    (y) => y
  )

/** The path's loops as point lists. */
function loops(path: string): [number, number][][] {
  return path
    .split('Z')
    .filter(Boolean)
    .map((loop) =>
      loop
        .split(/[ML]/)
        .filter(Boolean)
        .map((pair) => pair.trim().split(' ').map(Number) as [number, number])
    )
}

/** Even-odd containment, the fill rule the clip-path uses. */
function contains(path: string, x: number, y: number): boolean {
  let inside = false
  for (const loop of loops(path)) {
    for (let i = 0, j = loop.length - 1; i < loop.length; j = i++) {
      const [xi, yi] = loop[i]!
      const [xj, yj] = loop[j]!
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
    }
  }
  return inside
}

/** Every pixel centre is inside the path exactly when its cell is. */
function expectExact(rows: string[]) {
  const { path } = trace(rows)
  rows.forEach((row, y) =>
    [...row].forEach((cell, x) => expect(contains(path, x + 0.5, y + 0.5), `cell ${x},${y}`).toBe(cell === '#'))
  )
}

describe('traceTransparent', () => {
  it('draws nothing for a grid with nothing inside', () => {
    expect(trace(['....', '....'])).toEqual({ path: '', vertices: 0 })
  })

  it('traces a full grid as one loop along its edges, corners cut', () => {
    const { path, vertices } = trace(['####', '####', '####'])
    expect(loops(path)).toHaveLength(1)
    expect(vertices).toBe(8)
    for (const [x, y] of loops(path)[0]!) {
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThanOrEqual(4)
      expect(y).toBeGreaterThanOrEqual(0)
      expect(y).toBeLessThanOrEqual(3)
    }
    expectExact(['####', '####', '####'])
  })

  it('cuts holes: hardware standing in front of the middle of a screen', () => {
    const rows = ['#####', '#####', '##.##', '#####', '#####']
    expect(loops(trace(rows).path)).toHaveLength(2)
    expectExact(rows)
  })

  it('keeps diagonal neighbours apart at saddles', () => {
    expectExact(['#..#', '.##.', '.##.', '#..#'])
    expectExact(['#.', '.#'])
  })

  it('follows an irregular edge, as a laptop base cutting across a display', () => {
    const rows = Array.from({ length: 24 }, (_, y) =>
      Array.from({ length: 40 }, (_, x) => (y < 14 + Math.round(4 * Math.sin(x / 5)) && (x - 30) ** 2 + (y - 6) ** 2 > 9 ? '#' : '.')).join('')
    )
    expectExact(rows)
  })

  it('maps grid units through toX and toY', () => {
    const { path } = traceTransparent(() => true, 2, 2, (x) => 10 + x / 2, (y) => 20 + y / 2)
    for (const [x, y] of loops(path)[0]!) {
      expect(x).toBeGreaterThanOrEqual(10)
      expect(x).toBeLessThanOrEqual(11)
      expect(y).toBeGreaterThanOrEqual(20)
      expect(y).toBeLessThanOrEqual(21)
    }
  })
})
