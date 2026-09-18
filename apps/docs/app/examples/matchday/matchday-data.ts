/**
 * Alcântara FC: the club, the match, the pass. Plain data shared by the
 * page and the surfaces, so the score on the TV, the watch and the page
 * are one score.
 */

export const CLUB = {
  name: 'Alcântara FC',
  short: 'ALC',
  founded: 1921,
  ground: 'Estádio do Rio',
  motto: 'Everybody in.',
  green: '#14532d',
  deep: '#0b3320',
  gold: '#f2c14e',
  white: '#f5f7f2',
}

export const MATCH = {
  home: { name: 'Alcântara FC', short: 'ALC' },
  away: { name: 'Marítimo do Porto', short: 'MPO' },
  competition: 'Liga · Matchday 8',
  date: 'Saturday 3 October',
  kickoff: '15:00',
  /** Where the clock starts when the page opens; it runs from here. */
  startMinute: 67,
  startSecond: 12,
  score: { home: 2, away: 1 },
  events: [
    { minute: 18, what: 'Goal', who: 'Miren Solano', side: 'home' },
    { minute: 41, what: 'Goal', who: 'R. Diallo', side: 'away' },
    { minute: 63, what: 'Goal', who: 'Miren Solano', side: 'home' },
  ] as const,
  stats: [
    ['Possession', '58%', '42%'],
    ['Shots', '11', '6'],
    ['On target', '5', '2'],
    ['Corners', '7', '3'],
  ] as const,
}

export const PASS = {
  holder: 'Ana Ferreira',
  season: '2026 / 27',
  stand: 'North Stand',
  block: 'Block 12',
  row: 'Row F',
  seat: 'Seat 21',
  number: '0417 2231 0906',
}

export const FIXTURES = [
  { date: 'Sat 3 Oct', vs: 'Marítimo do Porto', where: 'Home', time: '15:00', live: true },
  { date: 'Sun 11 Oct', vs: 'Sporting de Faro', where: 'Away', time: '17:30' },
  { date: 'Sat 17 Oct', vs: 'Belém United', where: 'Home', time: '20:00' },
  { date: 'Wed 21 Oct', vs: 'Coimbra Académica', where: 'Away', time: '19:45' },
] as const

/** "67:12" from a running second count. */
export function clock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function lastGoal() {
  return [...MATCH.events].reverse().find((e) => e.what === 'Goal')!
}
