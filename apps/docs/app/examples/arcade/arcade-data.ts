/**
 * Moth: a small game about light. A level is a place, a palette and a lamp
 * count; the game draws the place from its silhouettes (`/art/arcade-*`)
 * and lights it itself.
 */

/** Where the night is set: which silhouettes stand in it, and what the lamps are. */
export type Scene = 'garden' | 'harbour' | 'attic'

export interface Level {
  id: string
  name: string
  blurb: string
  scene: Scene
  /** The top of the sky, and the ground every surface prints the game on. */
  sky: string
  /** The sky where it meets the far silhouettes. */
  horizon: string
  /** The mist the lamps' light sits in, over the lower half. */
  haze: string
  lamp: string
  /** The type over the game, and the moth's pale. */
  moth: string
  /** The far silhouettes, a step out of the sky so the distance reads. */
  far: string
  /** The near ones, nearly black: they are between you and the light. */
  near: string
  lamps: number
}

export const LEVELS: Level[] = [
  {
    id: 'garden',
    name: 'The garden',
    blurb: 'Five lamps along a wall, a warm night, an easy start.',
    scene: 'garden',
    sky: '#0a0f1f',
    horizon: '#23306a',
    haze: '#1a2455',
    lamp: '#ffd27a',
    moth: '#f4efe0',
    far: '#141d42',
    near: '#04060d',
    lamps: 5,
  },
  {
    id: 'harbour',
    name: 'The harbour',
    blurb: 'Six lamps on the quay and a wind off the water.',
    scene: 'harbour',
    sky: '#06171f',
    horizon: '#15505e',
    haze: '#0c3441',
    lamp: '#9fe7ff',
    moth: '#e6f4f7',
    far: '#0b2d38',
    near: '#02080b',
    lamps: 6,
  },
  {
    id: 'attic',
    name: 'The attic',
    blurb: 'Four bulbs, low beams, and something in the rafters.',
    scene: 'attic',
    sky: '#160d08',
    horizon: '#3d2415',
    haze: '#3a1e12',
    lamp: '#ffb37a',
    moth: '#f2e4d2',
    far: '#23140c',
    near: '#070403',
    lamps: 4,
  },
]

export const GAME = {
  title: 'Moth',
  tag: 'A small game about light',
  studio: 'Halyard Games',
  release: '12 November 2026',
  platforms: 'Switch · PC · iOS · Android',
  price: '€14.99',
  rating: '3+',
}

export const OST = {
  title: 'Moth (Original Soundtrack)',
  artist: 'Lune Rouge',
  label: 'Obsidian Records',
  catalog: 'OBS-4031',
  colour: 'Translucent amber',
  sideA: [
    ['Porch light', '3:12'],
    ['The garden wall', '4:40'],
    ['Six lamps', '3:58'],
    ['Wind off the water', '5:05'],
  ],
  sideB: [
    ['Low beams', '4:21'],
    ['Something in the rafters', '3:47'],
    ['Every window', '6:10'],
    ['Morning', '2:36'],
  ],
}

export function findLevel(id: string): Level {
  return LEVELS.find((l) => l.id === id) ?? LEVELS[0]!
}
