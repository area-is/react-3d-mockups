import { describe, expect, it } from 'vitest'
import { ExtrudeGeometry, LinearMipmapLinearFilter, RepeatWrapping } from 'three'
import {
  CORD,
  FIBRE,
  GRAIN_SIZE,
  SHEETS,
  WEAVE,
  WOOD,
  grainHeights,
  grainMap,
  grainNormal,
  grainTint,
  sheetBlockGeometry,
  type Grain,
} from '../geometry/grain'
import { createSurfaceSheenMaterial, smoothShaded } from '../geometry/mesh'
import { roundedRectShape } from '../geometry/rounded-rect'
import { POSTER_FRAME } from '../objects/poster-frame/dimensions'

/**
 * The grains are drawn in code, so nothing but these checks stands between a
 * careless edit and a seam down every tiled surface - a visual baseline only
 * shows one tile's worth of most of them.
 */
const GRAINS: [string, Grain][] = [
  ['FIBRE', FIBRE],
  ['SHEETS', SHEETS],
  ['WEAVE', WEAVE],
  ['WOOD', WOOD],
  ['CORD', CORD],
]

describe.each(GRAINS)('%s', (_name, grain) => {
  const heights = grainHeights(grain)

  it('stays within 0..1', () => {
    for (const h of heights) {
      expect(h).toBeGreaterThanOrEqual(0)
      expect(h).toBeLessThanOrEqual(1)
    }
  })

  it('has relief to show', () => {
    let min = 1
    let max = 0
    for (const h of heights) {
      min = Math.min(min, h)
      max = Math.max(max, h)
    }
    expect(max - min).toBeGreaterThan(0.3)
  })

  it('tiles: the field is periodic on both axes', () => {
    for (const t of [0.013, 0.37, 0.71, 0.998]) {
      expect(grain.height(0, t)).toBeCloseTo(grain.height(1, t), 6)
      expect(grain.height(t, 0)).toBeCloseTo(grain.height(t, 1), 6)
    }
  })

  it('is the same field every time it is drawn', () => {
    expect(Array.from(grainHeights(grain, 16))).toEqual(Array.from(grainHeights(grain, 16)))
  })
})

describe('grain textures', () => {
  it('repeat, mipmap and are shared by repeat', () => {
    const map = grainMap(FIBRE, 2, 3)
    expect(map.wrapS).toBe(RepeatWrapping)
    expect(map.wrapT).toBe(RepeatWrapping)
    // nearest filtering with no mipmaps is a DataTexture's default, and moiré
    expect(map.minFilter).toBe(LinearMipmapLinearFilter)
    expect(map.generateMipmaps).toBe(true)
    expect(grainNormal(FIBRE).minFilter).toBe(LinearMipmapLinearFilter)
    expect([map.repeat.x, map.repeat.y]).toEqual([2, 3])
    expect(grainMap(FIBRE, 2, 3)).toBe(map)
    expect(grainMap(FIBRE, 2, 4)).not.toBe(map)
    // a new repeat is a new transform over the same pixels, not a second upload
    expect(grainMap(FIBRE, 2, 4).source).toBe(map.source)
  })

  it('keeps the tint white-based, so the material colour sets the hue', () => {
    const { data } = grainMap(SHEETS).image as { data: Uint8Array }
    let brightest = 0
    for (let i = 0; i < data.length; i += 4) {
      expect(data[i]).toBe(data[i + 1])
      expect(data[i]).toBe(data[i + 2])
      expect(data[i] as number).toBeGreaterThanOrEqual(Math.floor(255 * (1 - SHEETS.tint)))
      brightest = Math.max(brightest, data[i] as number)
    }
    expect(brightest).toBeGreaterThan(235)
  })

  it('encodes unit normals that lean with the slope and face out of the surface', () => {
    const { data } = grainNormal(WEAVE).image as { data: Uint8Array }
    expect(data.length).toBe(GRAIN_SIZE * GRAIN_SIZE * 4)
    let leaning = 0
    for (let i = 0; i < data.length; i += 4) {
      const x = ((data[i] as number) / 255) * 2 - 1
      const y = ((data[i + 1] as number) / 255) * 2 - 1
      const z = ((data[i + 2] as number) / 255) * 2 - 1
      expect(Math.hypot(x, y, z)).toBeCloseTo(1, 1)
      expect(z).toBeGreaterThan(0.5)
      if (Math.abs(x) > 0.05 || Math.abs(y) > 0.05) leaning++
    }
    expect(leaning).toBeGreaterThan(data.length / 16)
  })

  it('flattens the relief below its first mip, where a weave would moiré', () => {
    const normal = grainNormal(WEAVE, 3)
    expect(normal.generateMipmaps).toBe(false)
    // a full chain, or WebGL calls the texture incomplete and samples black
    const mipmaps = normal.mipmaps as { data: Uint8Array; width: number }[]
    expect(mipmaps.map((level) => level.width)).toEqual([128, 64, 32, 16, 8, 4, 2, 1])
    for (const level of mipmaps.slice(1)) {
      expect(Array.from(level.data.slice(0, 4))).toEqual([128, 128, 255, 255])
      expect(Array.from(level.data.slice(-4))).toEqual([128, 128, 255, 255])
    }
  })

  it('leaves pale stock its relief and takes away the tint', () => {
    expect(grainTint(FIBRE, '#c19a6b', 2)).toBe(grainMap(FIBRE, 2)) // kraft
    expect(grainTint(WOOD, '#4a3826', 1, 2, true)).toBe(grainMap(WOOD, 1, 2, true)) // dark stain
    expect(grainTint(FIBRE, '#ffffff', 2)).toBeNull() // bleached board
    expect(grainTint(WOOD, '#e8e2d6')).toBeNull() // cream paint
  })

  it('turns a quarter for a surface mapped across its grain', () => {
    expect(grainMap(WOOD, 1, 1, true).rotation).toBeCloseTo(Math.PI / 2)
    expect(grainMap(WOOD, 1, 1).rotation).toBe(0)
    expect(grainNormal(WOOD, 1, 1, true)).not.toBe(grainNormal(WOOD, 1, 1))
  })
})

describe('sheetBlockGeometry', () => {
  it('runs the leaves across the thickness on every rim face', () => {
    const block = sheetBlockGeometry(3, 4, 0.5, 2)
    const position = block.getAttribute('position')
    const uv = block.getAttribute('uv')
    for (let i = 0; i < position.count; i++) {
      // u follows z alone: -1..1 over the half-unit thickness at two tiles
      expect(uv.getX(i)).toBeCloseTo((position.getZ(i) / 0.5) * 2, 6)
    }
  })
})

describe('the poster frame hardware', () => {
  it('fits the sawtooth hanger and the bumpers on the molding', () => {
    const { frame, hanger, bumper } = POSTER_FRAME
    expect(hanger.height).toBeLessThan(frame.width)
    expect(bumper.radius * 2).toBeLessThan(frame.width)
  })
})

describe('mesh & sheen helpers', () => {
  it('smoothShaded welds coincident vertices and computes vertex normals', () => {
    const raw = new ExtrudeGeometry(roundedRectShape(1, 1, 0.1), {
      depth: 0.2,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2,
      curveSegments: 8,
    })
    const rawCount = raw.getAttribute('position').count
    const smooth = smoothShaded(raw)
    expect(smooth.index).not.toBeNull()
    expect(smooth.getAttribute('position').count).toBeLessThan(rawCount)
    expect(smooth.getAttribute('normal')).toBeDefined()
    smooth.dispose()
  })

  it('createSurfaceSheenMaterial configures premultiplied light-only reflection', () => {
    const mat = createSurfaceSheenMaterial({ roughness: 0.08, envMapIntensity: 0.9 })
    expect(mat.transparent).toBe(true)
    expect(mat.depthWrite).toBe(false)
    expect(mat.premultipliedAlpha).toBe(true)
    expect(mat.roughness).toBeCloseTo(0.08)
    expect(mat.envMapIntensity).toBeCloseTo(0.9)
    expect(mat.customProgramCacheKey()).toBe('react-3d-mockups-surface-sheen')
    mat.dispose()
  })
})
