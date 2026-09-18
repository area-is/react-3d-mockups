import { bokeh, dipole, gyre, halftone, maelstrom, tulle } from 'tabbied/patterns'
import type { PatternDefinition } from 'tabbied'

/**
 * Ambient: living art for the screens you already own. A channel is a
 * pattern, a palette and a grid; the screens redraw it every few seconds
 * from the site's shared clock, so every screen in a room turns to the
 * next composition together.
 */

export interface Channel {
  id: string
  name: string
  mood: string
  pattern: PatternDefinition
  palette: string[]
  grid: string
}

export const CHANNELS: Channel[] = [
  { id: 'tide', name: 'Tide', mood: 'Slow rings on a deep blue. For evenings.', pattern: gyre, palette: ['#0f1b33', '#5ec8ff', '#e8eefc', '#3560d6'], grid: '6x9' },
  { id: 'meadow', name: 'Meadow', mood: 'Soft light through leaves. For mornings.', pattern: bokeh, palette: ['#f1efe6', '#b8e04a', '#2f8f5b', '#f0b323'], grid: '6x9' },
  { id: 'ember', name: 'Ember', mood: 'A halftone glow on near-black. For late.', pattern: halftone, palette: ['#1a1412', '#ff7a45', '#f2b544'], grid: '8x12' },
  { id: 'current', name: 'Current', mood: 'Dashes caught in a slow spiral. For focus.', pattern: maelstrom, palette: ['#0b0f19', '#f0f4ff', '#3d7bff', '#9fb3ff'], grid: '8x12' },
  { id: 'veil', name: 'Veil', mood: 'A sparse field of dots on bone. Barely there.', pattern: tulle, palette: ['#f4efe6', '#26221f', '#c65d3b'], grid: '6x9' },
  { id: 'field', name: 'Field', mood: 'Lines of force between two poles.', pattern: dipole, palette: ['#f7ede2', '#c65d3b', '#4a2c1f'], grid: '8x12' },
]

/** The Frame's bezel finishes, as Samsung ships them. */
export const FINISHES = [
  { id: 'black', label: 'Black', color: '#1b1c1e' },
  { id: 'white', label: 'White', color: '#e8e4dd' },
  { id: 'teak', label: 'Teak', color: '#a9825a' },
  { id: 'brown', label: 'Brown', color: '#6d5341' },
] as const

export type FinishId = (typeof FINISHES)[number]['id']

export const MATTES = [
  { id: 'none', label: 'None', color: null },
  { id: 'white', label: 'White', color: '#f2efe8' },
  { id: 'black', label: 'Black', color: '#111111' },
] as const

export type MatteId = (typeof MATTES)[number]['id']

export interface Settings {
  channel: string
  finish: FinishId
  matte: MatteId
}

export const DEFAULT_SETTINGS: Settings = { channel: 'tide', finish: 'teak', matte: 'white' }

export const PLANS = [
  { name: 'One screen', price: '€3', note: 'a month, any one device' },
  { name: 'The house', price: '€6', note: 'a month, every screen you own' },
  { name: 'Forever', price: '€90', note: 'once, for the six channels there are' },
] as const

export function findChannel(id: string): Channel {
  return CHANNELS.find((c) => c.id === id) ?? CHANNELS[0]!
}
