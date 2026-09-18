/**
 * Ledger's books: the categories, the week's transactions, the arithmetic.
 *
 * Pure data with no React in it, so the server page can quote the numbers
 * and every screen on every device derives from the same `summarize()`.
 * That is the claim the example exists to make: the dashboard on the
 * laptop, the app on the phone and the complication on the watch are not
 * three pictures of an app, they are one state rendered three times.
 */

export type Category = 'coffee' | 'groceries' | 'transport' | 'home' | 'fun'

export const CATEGORIES: Record<Category, { label: string; color: string }> = {
  coffee: { label: 'Coffee', color: '#f59e0b' },
  groceries: { label: 'Groceries', color: '#34d399' },
  transport: { label: 'Transport', color: '#60a5fa' },
  home: { label: 'Home', color: '#a78bfa' },
  fun: { label: 'Going out', color: '#f472b6' },
}

export interface Tx {
  id: number
  label: string
  category: Category
  amount: number
  /** 0 = Monday … 6 = Sunday, which is today. */
  day: number
  time: string
}

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
export const TODAY = 6
export const TODAY_LABEL = 'Sunday 20 September'
export const WEEK_LABEL = 'Week of 14 September 2026'
export const DAILY_BUDGET = 60
export const WEEKLY_BUDGET = DAILY_BUDGET * 7

/** The savings goal on the dashboard: a fixed figure, not touched by spending. */
export const GOAL = { name: 'Lisbon in October', saved: 1240, target: 2000 }

export const SEED_TRANSACTIONS: Tx[] = [
  { id: 1, label: 'Flat white', category: 'coffee', amount: 4.2, day: 0, time: '08:12' },
  { id: 2, label: 'Monthly pass', category: 'transport', amount: 39, day: 0, time: '08:40' },
  { id: 3, label: 'Lunch bowl', category: 'groceries', amount: 11.5, day: 1, time: '12:35' },
  { id: 4, label: 'Electricity', category: 'home', amount: 48.2, day: 1, time: '18:02' },
  { id: 5, label: 'Flat white', category: 'coffee', amount: 4.2, day: 2, time: '08:15' },
  { id: 6, label: 'Weekly shop', category: 'groceries', amount: 62.8, day: 2, time: '19:20' },
  { id: 7, label: 'Bike repair', category: 'transport', amount: 22, day: 3, time: '17:45' },
  { id: 8, label: 'Ramen with Ana', category: 'fun', amount: 27.5, day: 3, time: '20:30' },
  { id: 9, label: 'Oat milk', category: 'groceries', amount: 3.1, day: 4, time: '09:05' },
  { id: 10, label: 'Concert tickets', category: 'fun', amount: 54, day: 4, time: '13:10' },
  { id: 11, label: 'Farmers market', category: 'groceries', amount: 24.6, day: 5, time: '10:50' },
  { id: 12, label: 'Plants', category: 'home', amount: 18, day: 5, time: '11:30' },
  { id: 13, label: 'Cortado', category: 'coffee', amount: 3.4, day: 6, time: '09:10' },
  { id: 14, label: 'Sunday papers', category: 'fun', amount: 6.5, day: 6, time: '09:25' },
]

/** What the page's buttons add. Small, ordinary, the things a Sunday costs. */
export const QUICK_ADDS: { label: string; category: Category; amount: number }[] = [
  { label: 'Flat white', category: 'coffee', amount: 4.2 },
  { label: 'Groceries', category: 'groceries', amount: 38.1 },
  { label: 'Train home', category: 'transport', amount: 12 },
  { label: 'Cinema', category: 'fun', amount: 14.5 },
]

/** Clock times for added transactions, advancing through the afternoon. */
const LATER = ['11:40', '12:55', '14:20', '15:45', '17:10', '18:35', '19:50', '21:05', '22:15', '23:30']

export function addTransaction(list: Tx[], quick: (typeof QUICK_ADDS)[number]): Tx[] {
  const added = list.length - SEED_TRANSACTIONS.length
  const time = LATER[Math.min(added, LATER.length - 1)]!
  const id = (list[list.length - 1]?.id ?? 0) + 1
  return [...list, { id, label: quick.label, category: quick.category, amount: quick.amount, day: TODAY, time }]
}

export interface Summary {
  byDay: number[]
  byCategory: Record<Category, number>
  today: number
  week: number
  /** Today's budget minus today's spend; negative when over. */
  leftToday: number
  leftWeek: number
  /** Newest first. */
  recent: Tx[]
  todays: Tx[]
}

export function summarize(list: Tx[]): Summary {
  const byDay = DAYS.map(() => 0)
  const byCategory = Object.fromEntries(Object.keys(CATEGORIES).map((c) => [c, 0])) as Record<Category, number>
  for (const tx of list) {
    byDay[tx.day]! += tx.amount
    byCategory[tx.category] += tx.amount
  }
  const week = byDay.reduce((a, b) => a + b, 0)
  const today = byDay[TODAY]!
  const recent = [...list].reverse()
  return {
    byDay,
    byCategory,
    today,
    week,
    leftToday: DAILY_BUDGET - today,
    leftWeek: WEEKLY_BUDGET - week,
    recent,
    todays: recent.filter((tx) => tx.day === TODAY),
  }
}

/** "€38.10" - always two decimals, a thin space would be more Portuguese but less legible at watch size. */
export const eur = (n: number): string => `€${Math.abs(n).toFixed(2)}`
/** "€1,240" - the big round figures. */
export const eur0 = (n: number): string => `€${Math.round(Math.abs(n)).toLocaleString('en-US')}`
