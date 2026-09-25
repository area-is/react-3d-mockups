import { bokeh, dipole, flux, gyre, halftone, maelstrom, nutation, radius } from 'tabbied/patterns'
import type { PatternDefinition } from 'tabbied'

/**
 * Prism's catalogue. Every title's key art is a Tabbied pattern in its own
 * palette, seeded by the title, with the show's one object standing in
 * front of it - a diving helmet, a pocket watch, a lighthouse - as a
 * generated cut-out on a transparent ground (`/art/stream-*.webp`). So a
 * show looks the same on the TV, the Fold, the Flip and the iPad, and the
 * same tomorrow. The one thing the page changes is which title is featured,
 * and every screen follows.
 */

export interface Show {
  id: string
  title: string
  kind: 'Series' | 'Film'
  meta: string
  blurb: string
  pattern: PatternDefinition
  /** Ground first, then the inks. */
  palette: string[]
  grid: string
  /** The object in front of the pattern: a cut-out, and its width over height. */
  art: { src: string; aspect: number }
  /** Where the viewer is, for the continue-watching row. 0-1. */
  progress?: number
  episodes?: string[]
}

export const SHOWS: Show[] = [
  {
    id: 'undertow',
    art: { src: '/art/stream-undertow.webp', aspect: 501 / 640 },
    title: 'Undertow',
    kind: 'Series',
    meta: 'S2 · 8 episodes · Thriller',
    blurb: 'A salvage diver finds a ship that was never lost. The second season goes deeper, in every sense.',
    pattern: maelstrom,
    palette: ['#06121f', '#5ec8ff', '#e8eefc', '#1f6fd6'],
    grid: '6x9',
    progress: 0.62,
    episodes: ['The Manifest', 'Ballast', 'Forty Fathoms', 'Slack Water', 'The Bell', 'Ledger of the Deep', 'Neap', 'Surface'],
  },
  {
    id: 'the-long-now',
    art: { src: '/art/stream-long-now.webp', aspect: 581 / 640 },
    title: 'The Long Now',
    kind: 'Film',
    meta: '2h 04m · Drama',
    blurb: 'Three generations of clockmakers, one workshop, and a commission that will outlive all of them.',
    pattern: halftone,
    palette: ['#1a1412', '#f2b544', '#f6e7d8'],
    grid: '8x12',
    progress: 0.18,
  },
  {
    id: 'cassiopeia-falls',
    art: { src: '/art/stream-cassiopeia.webp', aspect: 521 / 640 },
    title: 'Cassiopeia Falls',
    kind: 'Series',
    meta: 'S1 · 6 episodes · Sci-fi',
    blurb: 'A relay station at the edge of the map receives a message it sent itself. Slow, strange and beautiful.',
    pattern: nutation,
    palette: ['#0b0a12', '#e8ff47', '#ff3d7f', '#47e0ff'],
    grid: '6x9',
    progress: 0.4,
    episodes: ['Relay', 'Parallax', 'The Signal', 'Occultation', 'Perigee', 'Return'],
  },
  {
    id: 'paper-tigers',
    art: { src: '/art/stream-paper-tigers.webp', aspect: 630 / 640 },
    title: 'Paper Tigers',
    kind: 'Series',
    meta: 'S3 · 10 episodes · Comedy',
    blurb: 'The worst law firm in Lisbon takes its biggest case yet, by accident.',
    pattern: radius,
    palette: ['#f1ede2', '#e0402c', '#1f43c9', '#f0b323'],
    grid: '4x6',
  },
  {
    id: 'salt-and-iron',
    art: { src: '/art/stream-salt-iron.webp', aspect: 640 / 585 },
    title: 'Salt & Iron',
    kind: 'Film',
    meta: '1h 52m · Western',
    blurb: 'A blacksmith and a salt trader cross a desert that does not want to be crossed.',
    pattern: dipole,
    palette: ['#f7ede2', '#c65d3b', '#4a2c1f'],
    grid: '8x12',
  },
  {
    id: 'the-quiet-floor',
    art: { src: '/art/stream-quiet-floor.webp', aspect: 640 / 571 },
    title: 'The Quiet Floor',
    kind: 'Series',
    meta: 'S1 · 8 episodes · Mystery',
    blurb: 'Nobody works on the fourteenth floor. The new night guard finds out why.',
    pattern: gyre,
    palette: ['#0f2e22', '#b8e04a', '#e6f2d9', '#2f8f5b'],
    grid: '6x9',
  },
  {
    id: 'halcyon',
    art: { src: '/art/stream-halcyon.webp', aspect: 640 / 615 },
    title: 'Halcyon',
    kind: 'Film',
    meta: '1h 38m · Romance',
    blurb: 'A summer, a lighthouse, and two people who were only meant to be passing through.',
    pattern: bokeh,
    palette: ['#2a1738', '#ff8fa3', '#f5e9f7', '#9b5de5'],
    grid: '6x9',
  },
  {
    id: 'orbital',
    art: { src: '/art/stream-orbital.webp', aspect: 573 / 640 },
    title: 'Orbital',
    kind: 'Series',
    meta: 'Docuseries · 5 episodes',
    blurb: 'A year aboard the station, filmed by the crew. No narration, no score, just the window.',
    pattern: flux,
    palette: ['#0b0f19', '#3d7bff', '#f0f4ff'],
    grid: '6x9',
  },
]

export const DEFAULT_FEATURED = 'undertow'

export const PLANS = [
  { name: 'Basic', price: '€5.99', note: 'One screen, HD' },
  { name: 'Standard', price: '€9.99', note: 'Two screens, 4K' },
  { name: 'Family', price: '€14.99', note: 'Five screens, 4K, kids profiles' },
] as const

export function findShow(id: string): Show {
  return SHOWS.find((s) => s.id === id) ?? SHOWS[0]!
}
