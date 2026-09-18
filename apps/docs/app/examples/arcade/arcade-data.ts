/**
 * Moth: a small game about light. The levels are palettes and lamp
 * counts; everything else the game needs it draws for itself.
 */

export interface Level {
  id: string
  name: string
  blurb: string
  sky: string
  haze: string
  lamp: string
  moth: string
  lamps: number
}

export const LEVELS: Level[] = [
  { id: 'garden', name: 'The garden', blurb: 'Five lamps along a wall, a warm night, an easy start.', sky: '#0a0f1f', haze: '#16204a', lamp: '#ffd27a', moth: '#f4efe0', lamps: 5 },
  { id: 'harbour', name: 'The harbour', blurb: 'Six lamps on the quay and a wind off the water.', sky: '#06171f', haze: '#0c3441', lamp: '#9fe7ff', moth: '#e6f4f7', lamps: 6 },
  { id: 'attic', name: 'The attic', blurb: 'Four bulbs, low beams, and something in the rafters.', sky: '#160d08', haze: '#3a1e12', lamp: '#ffb37a', moth: '#f2e4d2', lamps: 4 },
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
