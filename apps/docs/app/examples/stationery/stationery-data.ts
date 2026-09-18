/**
 * Ampersand: a wedding suite as data.
 *
 * Everything the couple types on the page - two names, a date, a venue -
 * and everything they pick - a palette, a typeface - is one `Suite`, and
 * every printed piece renders from it. Type a name and it is on the
 * invitation, the reply card, the welcome sign and the table plan before
 * the keystroke is finished.
 */

export const PALETTES = [
  { id: 'sage', label: 'Sage', paper: '#f5f2ea', ink: '#2f4a3a', accent: '#b8a56a' },
  { id: 'ink', label: 'Ink & gold', paper: '#111827', ink: '#f2ead6', accent: '#d4a744' },
  { id: 'blush', label: 'Blush', paper: '#f7e9e4', ink: '#5a2a27', accent: '#c65d3b' },
] as const

export type PaletteId = (typeof PALETTES)[number]['id']

export const FACES = [
  { id: 'serif', label: 'Serif' },
  { id: 'sans', label: 'Sans' },
] as const

export type FaceId = (typeof FACES)[number]['id']

export interface Suite {
  first: string
  second: string
  date: string
  venue: string
  city: string
  reply: string
  palette: PaletteId
  face: FaceId
}

export const DEFAULT_SUITE: Suite = {
  first: 'June',
  second: 'Tomás',
  date: 'Saturday 6 June 2027',
  venue: 'Quinta da Regaleira',
  city: 'Sintra',
  reply: '6 April',
  palette: 'sage',
  face: 'serif',
}

export const TIMELINE = [
  ['15:00', 'Ceremony', 'in the gardens'],
  ['16:00', 'Drinks', 'on the terrace'],
  ['18:30', 'Dinner', 'in the orangery'],
  ['21:00', 'Dancing', 'until late'],
] as const

/** Eight tables, named for trees in the garden. */
export const TABLES = [
  ['Olive', ['Ana Ferreira', 'Marcus Ellery', 'Priya Desai', 'Leila Haddad']],
  ['Cork', ['Tomas Brandt', 'Ilse Marr', 'Reuben Diallo', 'Hana Okafor']],
  ['Lemon', ['Clifford Nance', 'Mira Kowalczyk', 'Sable Kite', 'Vesper Line']],
  ['Fig', ['Marcus Hale', 'Anton Ferrier', 'Ada Lund', 'Elin Wolfe']],
  ['Cypress', ['Nightbus', 'Oro Ash', 'Miren Solano', 'Kodama Ito']],
  ['Laurel', ['Deep Field', 'Palomar Ruiz', 'Lune Rouge', 'Cassiel Nour']],
  ['Almond', ['Halyard Quist', 'Tall Grass', 'Long Now', 'Aperture Vaz']],
  ['Pine', ['Raster Studio', 'Grid Editions', 'Ninefold Oat', 'Northline Freight']],
] as const

/** "J & T" - the couple's initials, for the monogram. */
export function monogram(suite: Suite): string {
  const initial = (s: string) => (s.trim()[0] ?? '·').toUpperCase()
  return `${initial(suite.first)} & ${initial(suite.second)}`
}

/** The names as the pieces set them, with a fallback while a field is empty. */
export function names(suite: Suite): { first: string; second: string } {
  return { first: suite.first.trim() || 'Someone', second: suite.second.trim() || 'Someone else' }
}
