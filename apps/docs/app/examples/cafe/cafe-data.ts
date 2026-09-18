/**
 * Ninefold: what the shop sells and when it is open.
 *
 * Plain data, shared by the page and the surfaces: the menu list beside the
 * A-frame and the chalkboard ON the A-frame read the same array, so a price
 * change is one edit and the sign cannot disagree with the website.
 */

export const SHOP = {
  name: 'Ninefold',
  kind: 'Coffee & bakery',
  address: 'Rua da Boavista 14',
  city: 'Lisbon',
  hours: 'Mon – Fri 7 – 18 · Sat 8 – 17 · Sun closed',
  phone: '+351 21 000 0900',
}

export interface MenuItem {
  name: string
  price: number
  note?: string
}

export const DRINKS: MenuItem[] = [
  { name: 'Espresso', price: 1.6 },
  { name: 'Cortado', price: 2.4 },
  { name: 'Flat white', price: 3.6, note: 'oat +0.4' },
  { name: 'Filter, today Huila', price: 3.2 },
  { name: 'Cold brew', price: 4.0 },
  { name: 'Ninefold oat latte', price: 4.2 },
]

export const BAKES: MenuItem[] = [
  { name: 'Cinnamon bun', price: 3.2, note: 'out at 8, 11 and 3' },
  { name: 'Sourdough, whole', price: 6.5 },
  { name: 'Cardamom knot', price: 3.4 },
  { name: 'Pastel de nata', price: 1.8 },
]

/** The shop's paint, as the page's swatches offer it. */
export const PAINTS = [
  { id: 'green', label: 'Bottle green', color: '#2e4638' },
  { id: 'oxblood', label: 'Oxblood', color: '#5a2a27' },
  { id: 'navy', label: 'Navy', color: '#23314d' },
] as const

export type PaintId = (typeof PAINTS)[number]['id']

export const price = (n: number): string => `€${n.toFixed(2).replace('.', ',')}`
