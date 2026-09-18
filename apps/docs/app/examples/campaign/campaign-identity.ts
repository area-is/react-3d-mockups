/**
 * The Aperture identity as data: inks, copy, the running order.
 *
 * Kept in a plain module with no `'use client'` so both halves of the page
 * can read it - the server-rendered case study that quotes the inks and the
 * dates, and the client artwork that prints them. Everything on every
 * surface comes from here, which is what makes "one identity" a true
 * statement rather than a headline: change a date and the billboard, the
 * pass and the app all change together.
 */

/** The night the festival happens in: the ground every surface starts from. */
export const NIGHT = '#0b0a12'
export const ACID = '#e8ff47'
export const ROSE = '#ff3d7f'
export const SKY = '#47e0ff'
export const BONE = '#f4f1ff'

/** Handed to the pattern: ground first, then the inks in the order they are used. */
export const PALETTE = [NIGHT, ACID, ROSE, SKY, BONE]

export const INKS = [
  { name: 'Night', hex: NIGHT, role: 'the ground' },
  { name: 'Acid', hex: ACID, role: 'the one loud colour' },
  { name: 'Rose', hex: ROSE, role: 'second mark' },
  { name: 'Sky', hex: SKY, role: 'third mark' },
  { name: 'Bone', hex: BONE, role: 'the type' },
] as const

/** The black tote the merch prints on - its stock, not an ink. */
export const BAG = '#141218'

export const FESTIVAL = {
  name: 'Aperture',
  tagline: 'Three nights of sound & light',
  dates: '24 – 26 July 2026',
  place: 'Alcântara Docks · Lisbon',
  tickets: 'Tickets from €95 · aperture.fest',
  headliners: ['Nightbus', 'Oro & Ash', 'Miren Solano'],
  lineup: ['Halyard', 'Kodama', 'Deep Field', 'Palomar', 'Lune Rouge', 'Sable Kite', 'Tall Grass Ensemble', 'Vesper Line', 'Cassiel', 'The Long Now'],
} as const

/** Friday's running order, as the totem and the app show it. */
export const RUNNING_ORDER = [
  { time: '18:00', act: 'Gates open', stage: '' },
  { time: '19:10', act: 'Sable Kite', stage: 'Dock stage' },
  { time: '20:20', act: 'Kodama', stage: 'Warehouse' },
  { time: '21:30', act: 'Oro & Ash', stage: 'Dock stage' },
  { time: '23:00', act: 'Nightbus', stage: 'Dock stage' },
  { time: '00:30', act: 'Deep Field', stage: 'Warehouse' },
] as const
