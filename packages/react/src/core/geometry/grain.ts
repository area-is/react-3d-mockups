import * as THREE from 'three'

/**
 * Procedural surface grain: the small relief and mottling that tells paper
 * from plastic. A body lit as one flat colour is what gives a CG object away -
 * a page block with no pages in it, kraft with no fibre, cloth with no weave.
 *
 * Each grain is a tileable height field on the unit square, rendered once into
 * two small textures and shared by every mockup that asks: a white-based tint
 * (`grainMap`, for a material's `map`, so the material's `color` still sets
 * the hue) and a tangent-space normal map (`grainNormal`). Nothing is
 * downloaded and nothing touches the DOM, so the fields are unit-testable.
 *
 * A normal map rather than a `bumpMap` on purpose: three derives bump from
 * screen-space height differences, so its strength changes with zoom and
 * pixel density. A normal map shades the same at every size.
 */
export interface Grain {
  /** Height in 0..1 at `(u, v)` on the unit square; must tile on both axes. */
  readonly height: (u: number, v: number) => number
  /** How far the troughs darken the tint map, 0..1. */
  readonly tint: number
  /** Slope scale baked into the normal map. */
  readonly relief: number
}

/** Texels along one side of a grain tile. */
export const GRAIN_SIZE = 128

const hash = (x: number, y: number): number => {
  let n = Math.imul(x, 374761393) + Math.imul(y, 668265263)
  n = Math.imul(n ^ (n >>> 13), 1274126177)
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296
}

/** Value noise on a `px` x `py` lattice that wraps, so the tile repeats seamlessly. */
const noise = (u: number, v: number, px: number, py: number): number => {
  const x = u * px
  const y = v * py
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const fx = (x - xi) * (x - xi) * (3 - 2 * (x - xi))
  const fy = (y - yi) * (y - yi) * (3 - 2 * (y - yi))
  // the lattice size seeds the hash, so octaves do not line up
  const at = (i: number, j: number) => hash(((xi + i) % px) + px * 131, ((yi + j) % py) + py * 137)
  const top = at(0, 0) + (at(1, 0) - at(0, 0)) * fx
  const bottom = at(0, 1) + (at(1, 1) - at(0, 1)) * fx
  return top + (bottom - top) * fy
}

/** Paper and board: long fibres lying along `u`, over a finer tooth. */
export const FIBRE: Grain = {
  height: (u, v) => 0.4 * noise(u, v, 10, 40) + 0.35 * noise(u, v, 40, 40) + 0.25 * noise(u, v, 128, 128),
  tint: 0.15,
  relief: 1.2,
}

/**
 * The trimmed edge of a stack of sheets: 32 leaves across `u`, each a shade
 * of its own with a dark gap beside it, wandering a little along `v` the way
 * a guillotined block is never quite flat.
 */
export const SHEETS: Grain = {
  height: (u, v) => {
    const x = u * 32
    const leaf = Math.floor(x)
    const gap = x - leaf < 0.25 ? 0.25 : 1
    // `% 32`: the leaf at u = 1 is the leaf at u = 0, or the tile shows a seam
    return gap * (0.55 + 0.3 * hash(leaf % 32, 7) + 0.15 * noise(u, v, 32, 5))
  },
  tint: 0.34,
  relief: 0.8,
}

/**
 * Book cloth: a plain weave, 16 threads a side, each thread crowned where it
 * rides over. Relief only, and eight texels to the thread on purpose: the
 * normal map is flat below its first mip (see `source`), so the weave fades
 * in only once a thread covers four pixels or more. Anything finer is a
 * regular pattern near the pixel grid, and a canvas drawn at 1.5x and scaled
 * down by the browser (`DEFAULT_DPR` on a 1x screen) turns that into moiré
 * swimming across the cloth. A tint would do the same through its own mips,
 * so the weave has none.
 */
export const WEAVE: Grain = {
  height: (u, v) => {
    const a = u * 16
    const b = v * 16
    const along = Math.sin(Math.PI * (a - Math.floor(a)))
    const across = Math.sin(Math.PI * (b - Math.floor(b)))
    const over = (Math.floor(a) + Math.floor(b)) % 2 === 0
    return (over ? across * (0.6 + 0.4 * along) : along * (0.6 + 0.4 * across)) * (0.85 + 0.15 * noise(u, v, 16, 16))
  },
  tint: 0,
  relief: 2.4,
}

/** Sawn timber: growth rings wandering along `v`, under fine pore streaks. */
export const WOOD: Grain = {
  height: (u, v) =>
    0.6 * (0.5 + 0.5 * Math.sin(2 * Math.PI * (u * 5 + 1.4 * noise(u, v, 4, 2)))) + 0.4 * noise(u, v, 64, 3),
  tint: 0.34,
  relief: 0.9,
}

/**
 * Twisted three-ply cord: diagonal strands spiralling around `v` as `u` runs
 * along a swept tube, over a light paper-fibre tooth for kraft handles.
 */
export const CORD: Grain = {
  height: (u, v) => {
    const strand = Math.abs(Math.sin(Math.PI * (3 * v - 2 * u)))
    return 0.82 * Math.pow(strand, 0.72) + 0.18 * noise(u, v, 24, 12)
  },
  tint: 0.28,
  relief: 1.9,
}

/** The grain's height field sampled at texel centres, row-major. */
export function grainHeights(grain: Grain, size = GRAIN_SIZE): Float32Array {
  const heights = new Float32Array(size * size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) heights[y * size + x] = grain.height((x + 0.5) / size, (y + 0.5) / size)
  }
  return heights
}

const sources = new WeakMap<Grain, [tint: THREE.DataTexture, normal: THREE.DataTexture]>()
const tiled = new WeakMap<THREE.Texture, Map<string, THREE.Texture>>()

function source(grain: Grain): [THREE.DataTexture, THREE.DataTexture] {
  let pair = sources.get(grain)
  if (!pair) {
    const size = GRAIN_SIZE
    const heights = grainHeights(grain)
    const tint = new Uint8Array(size * size * 4)
    const normal = new Uint8Array(size * size * 4)
    const at = (x: number, y: number) => heights[((y + size) % size) * size + ((x + size) % size)] as number
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4
        const shade = Math.round(255 * (1 - grain.tint * (1 - at(x, y))))
        tint[i] = tint[i + 1] = tint[i + 2] = shade
        tint[i + 3] = 255
        // central differences across the wrap, so the normals tile with the heights
        const dx = (at(x - 1, y) - at(x + 1, y)) * grain.relief
        const dy = (at(x, y - 1) - at(x, y + 1)) * grain.relief
        const length = Math.hypot(dx, dy, 1)
        normal[i] = Math.round(255 * (0.5 + (0.5 * dx) / length))
        normal[i + 1] = Math.round(255 * (0.5 + (0.5 * dy) / length))
        normal[i + 2] = Math.round(255 * (0.5 + 0.5 / length))
        normal[i + 3] = 255
      }
    }
    pair = [tint, normal].map((data, isNormal) => {
      const texture = new THREE.DataTexture(data, size, size)
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      // a DataTexture defaults to nearest filtering with no mipmaps, which
      // would shimmer into moiré the moment a tile is smaller than the screen
      texture.magFilter = THREE.LinearFilter
      texture.minFilter = THREE.LinearMipmapLinearFilter
      // No anisotropy, on purpose. Anisotropic filtering picks its mip from
      // the footprint's SHORT axis, and by the GL rule takes two taps for any
      // footprint that is even slightly oblong - a whole mip level sharper
      // than trilinear for a surface turned a few degrees, which would bring
      // the relief back in just where the flat mips below are keeping it out.
      if (isNormal) {
        // The relief is close-up detail, so every mip below the first is
        // flat: it fades out as a texel shrinks under a pixel, before a
        // regular grain can beat against the pixel grid. Generated mips keep
        // the pattern alive for two more levels. The tint keeps its
        // generated mips and carries the grain at a distance.
        texture.mipmaps = [{ data, width: size, height: size }]
        for (let side = size >> 1; side; side >>= 1) {
          const flat = new Uint8Array(side * side * 4).fill(255)
          for (let i = 0; i < flat.length; i += 4) flat[i] = flat[i + 1] = 128
          texture.mipmaps.push({ data: flat, width: side, height: side })
        }
      } else {
        texture.generateMipmaps = true
      }
      texture.needsUpdate = true
      return texture
    }) as [THREE.DataTexture, THREE.DataTexture]
    sources.set(grain, pair)
  }
  return pair
}

/**
 * One texture per (grain, repeat), kept for the life of the page. The clones
 * share their source's image, so a new repeat costs no pixels - and holding
 * them here means a scene component can ask inline, with no memo and nothing
 * to dispose.
 */
function tile(base: THREE.Texture, repeatX: number, repeatY: number, turned: boolean): THREE.Texture {
  let byRepeat = tiled.get(base)
  if (!byRepeat) tiled.set(base, (byRepeat = new Map()))
  const key = `${repeatX},${repeatY},${turned}`
  let texture = byRepeat.get(key)
  if (!texture) {
    texture = base.clone()
    texture.repeat.set(repeatX, repeatY)
    if (turned) texture.rotation = Math.PI / 2
    byRepeat.set(key, texture)
  }
  return texture
}

/**
 * The grain as a white-based tint for a material's `map`, tiled `repeatX` x
 * `repeatY` across the UVs. `turned` lays it a quarter turn round, for a
 * surface whose UVs run the other way to its grain (a plank mapped across
 * its width).
 */
export function grainMap(grain: Grain, repeatX = 1, repeatY = repeatX, turned = false): THREE.Texture {
  return tile(source(grain)[0], repeatX, repeatY, turned)
}

/**
 * `grainMap` for stock of a given colour, or `null` when the stock is pale.
 *
 * A tint multiplies, so it prints hardest on the lightest colours - and that
 * is backwards. Unbleached kraft and stained timber show their grain; bleached
 * board and painted timber do not, and with the full tint a white bag came out
 * grimy and a cream A-frame zebra-striped. Pale stock keeps the relief
 * (`grainNormal`) and loses the tint. The line is a relative luminance of
 * `0.45`: kraft (`#c19a6b`, 0.36) is under it, a cream paint (`#e8e2d6`, 0.76)
 * well over.
 */
export function grainTint(
  grain: Grain,
  color: THREE.ColorRepresentation,
  repeatX = 1,
  repeatY = repeatX,
  turned = false
): THREE.Texture | null {
  const { r, g, b } = new THREE.Color(color)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45 ? null : grainMap(grain, repeatX, repeatY, turned)
}

/** The grain as a tangent-space `normalMap`; same tiling as `grainMap`, so the two register. */
export function grainNormal(grain: Grain, repeatX = 1, repeatY = repeatX, turned = false): THREE.Texture {
  return tile(source(grain)[1], repeatX, repeatY, turned)
}

/**
 * A box whose four rim faces carry UVs that run across its `thickness` (`u`,
 * one tile per `leaves` of `SHEETS`) and along its perimeter (`v`), so a
 * single material draws stacked sheets on the head, tail and fore edge alike.
 * A stock `BoxGeometry` maps every face 0..1, which would lay the leaves
 * across the thickness on two edges and along it on the other two.
 */
export function sheetBlockGeometry(width: number, height: number, thickness: number, tiles = 1): THREE.BoxGeometry {
  const geometry = new THREE.BoxGeometry(width, height, thickness)
  const position = geometry.getAttribute('position')
  const uv = geometry.getAttribute('uv')
  for (let i = 0; i < position.count; i++) {
    uv.setXY(i, (position.getZ(i) / thickness) * tiles, (position.getX(i) + position.getY(i)) * 0.5)
  }
  return geometry
}
