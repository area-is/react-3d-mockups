/**
 * Northline Freight: the liveries, the fleet's numbers, a parcel in transit.
 * Plain data so the page and the wraps read the same copy.
 */

export const COMPANY = {
  name: 'Northline',
  tag: 'Overnight to 40 cities',
  url: 'northline.eu',
  phone: '0800 40 40 40',
  plate: 'NL 2041',
}

/** A livery: the body paint and the two inks the wrap prints in. */
export interface Livery {
  id: string
  label: string
  body: string
  ink: string
  accent: string
}

export const LIVERIES: readonly Livery[] = [
  { id: 'signal', label: 'Signal', body: '#eef0f2', ink: '#14213d', accent: '#ff6a1a' },
  { id: 'night', label: 'Night', body: '#14213d', ink: '#f3f4f6', accent: '#ff6a1a' },
  { id: 'forest', label: 'Forest', body: '#e6ede4', ink: '#163a2e', accent: '#b8e04a' },
] as const

export type LiveryId = (typeof LIVERIES)[number]['id']

export const COVERAGES = [
  { id: 'panel', label: 'Panel', note: 'clear of arches, lights and glass' },
  { id: 'full', label: 'Full wrap', note: 'corner post to corner post' },
  { id: 'perforated', label: 'Perforated', note: 'over the cab glass too' },
] as const

export type CoverageId = (typeof COVERAGES)[number]['id']

/** The parcel the app is tracking. */
export const PARCEL = {
  id: 'NL 4471 0092 8',
  from: 'Rotterdam',
  to: 'Lisbon',
  eta: 'Tomorrow, 08:40',
  steps: [
    { at: 'Tue 17:52', what: 'Collected', where: 'Rotterdam dock 4', done: true },
    { at: 'Tue 23:10', what: 'Departed hub', where: 'Antwerp', done: true },
    { at: 'Wed 05:30', what: 'In transit', where: 'A1 south of Bordeaux', done: true },
    { at: 'Thu 06:15', what: 'Out for delivery', where: 'Lisbon van 2041', done: false },
    { at: 'Thu 08:40', what: 'Delivered', where: 'Rua da Boavista 14', done: false },
  ],
}

export const STATS = [
  ['40', 'cities, overnight'],
  ['312', 'vans and trailers'],
  ['99.2%', 'on time, last quarter'],
] as const
