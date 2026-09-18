/**
 * Carton & Co: what can be ordered, and what it costs.
 *
 * A box is specified in millimetres, which is the thing this example is
 * about: the mockups take real sizes, so a customer's numbers ARE the
 * model. The price is a plain function of the box's surface area, so the
 * estimate moves as the sliders do.
 */

export const STYLES = [
  { id: 'mailer', label: 'Mailer box', note: 'corrugated, self-locking, taped', perM2: 9.5, min: { width: 150, height: 60, depth: 100 }, max: { width: 500, height: 300, depth: 400 } },
  { id: 'product', label: 'Folding carton', note: 'card, tuck-end, printed all round', perM2: 6.5, min: { width: 60, height: 80, depth: 30 }, max: { width: 300, height: 400, depth: 200 } },
  { id: 'custom', label: 'Rigid box', note: 'set-up box, wrapped board', perM2: 22, min: { width: 60, height: 40, depth: 60 }, max: { width: 400, height: 300, depth: 400 } },
] as const

export type StyleId = (typeof STYLES)[number]['id']

export const STOCKS = [
  { id: 'kraft', label: 'Natural kraft', color: '#b5915f' },
  { id: 'white', label: 'White board', color: '#f2efe8' },
  { id: 'black', label: 'Black board', color: '#1c1b1b' },
] as const

export type StockId = (typeof STOCKS)[number]['id']

export const PRINTS = [
  { id: 'none', label: 'Unprinted', note: 'the board as it comes', factor: 1 },
  { id: 'mark', label: 'One-colour mark', note: 'your logo, one ink', factor: 1.15 },
  { id: 'pattern', label: 'All-over print', note: 'a pattern on every face', factor: 1.45 },
] as const

export type PrintId = (typeof PRINTS)[number]['id']

export const QUANTITIES = [50, 250, 1000] as const

export interface Size {
  width: number
  height: number
  depth: number
}

export interface Spec {
  style: StyleId
  size: Size
  stock: StockId
  print: PrintId
  quantity: (typeof QUANTITIES)[number]
}

export const DEFAULT_SPEC: Spec = {
  style: 'mailer',
  size: { width: 300, height: 110, depth: 220 },
  stock: 'kraft',
  print: 'pattern',
  quantity: 250,
}

export function find<T extends { id: string }>(list: readonly T[], id: string): T {
  return list.find((item) => item.id === id) ?? list[0]!
}

/** Keep a size inside the style's range when the style changes under it. */
export function clampSize(size: Size, style: StyleId): Size {
  const s = find(STYLES, style)
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
  return {
    width: clamp(size.width, s.min.width, s.max.width),
    height: clamp(size.height, s.min.height, s.max.height),
    depth: clamp(size.depth, s.min.depth, s.max.depth),
  }
}

/** Outer surface in square metres: a box is six rectangles. */
export function areaM2({ width, height, depth }: Size): number {
  return (2 * (width * height + width * depth + height * depth)) / 1_000_000
}

/** Price per box and for the run, in euros. */
export function priceOf(spec: Spec): { each: number; total: number } {
  const style = find(STYLES, spec.style)
  const print = find(PRINTS, spec.print)
  const setup = spec.print === 'none' ? 0 : 60
  const discount = spec.quantity >= 1000 ? 0.72 : spec.quantity >= 250 ? 0.86 : 1
  const material = Math.max(0.4, areaM2(spec.size) * style.perM2) * print.factor * discount
  const each = material + setup / spec.quantity
  return { each, total: each * spec.quantity }
}

export const eur = (n: number, digits = 2): string => `€${n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`

/** The customer whose artwork is on the proof. */
export const CUSTOMER = { name: 'Ochre', line: 'Ceramics · Porto', url: 'ochre.pt' }
