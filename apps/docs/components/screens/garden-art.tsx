'use client'

import type { CSSProperties, ReactNode } from 'react'
import { SERIF, UpcA } from './label-art'
import { CUT, Cut, Face, Headline, Small, isDark, mix, stockInk } from './sample-kit'

/**
 * Northshore Botanical Garden: one client, dressed across every object an
 * institution like it actually buys print for - the autumn-walks leaflet,
 * the staff badge, the grounds team's van and a late-opening ad on the
 * street screens.
 *
 * The identity is small on purpose, because it has to survive being printed
 * on anything: a leaf in a green disc, the name set in two lines, and one
 * warm marigold for the thing a reader should act on. On the leaflet, the
 * badge and the van - the objects whose `color` is the stock or the paint -
 * there is no ground: the green and the marigold are solid inks that stay
 * put, and everything typographic flips with the stock (`stockInk`).
 */

const GREEN = '#2f7a4a'
const DEEP = '#123d27'
const MARIGOLD = '#ec8a34'
/** The green a line of type is set in: the brand green, lifted on a dark stock so it still reads. */
const greenOn = (material: string) => (isDark(material) ? '#8fd3a4' : GREEN)

const SITE = 'northshoregarden.org'
const PHONE = '01632 960 142'

/** The mark: a leaf, knocked out of a green disc. */
export function LeafMark({ size, color = GREEN, leaf = '#ffffff' }: { size: string; color?: string; leaf?: string }) {
  return (
    <svg viewBox="0 0 40 40" style={{ width: size, height: size, display: 'block', flex: 'none' }} aria-hidden>
      <circle cx={20} cy={20} r={20} fill={color} />
      <path d="M20 7c8 5 10 14 0 26C10 21 12 12 20 7z" fill={leaf} />
      <path d="M20 12v22M20 19l-4-3M20 19l4-3M20 25l-5-3.5M20 25l5-3.5" stroke={color} strokeWidth={1.4} strokeLinecap="round" fill="none" />
    </svg>
  )
}

/** The name, set in two lines beside the mark. `size` is the type's cqw. */
function Lockup({ size, ink, markColor = GREEN, style }: { size: number; ink: string; markColor?: string; style?: CSSProperties }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: `${size * 0.55}cqw`, ...style }}>
      <LeafMark size={`${size * 2.3}cqw`} color={markColor} />
      <div style={{ fontSize: `${size}cqw`, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1, color: ink, whiteSpace: 'nowrap' }}>
        Northshore
        <br />
        <span style={{ fontWeight: 500 }}>Botanical Garden</span>
      </div>
    </div>
  )
}

/** A small label above a block: the brand green, regular casing. */
function Kicker({ children, color, size = '4.4cqw' }: { children: ReactNode; color: string; size?: string }) {
  return <div style={{ fontSize: size, fontWeight: 700, letterSpacing: '-0.01em', color, lineHeight: 1 }}>{children}</div>
}

/* ------------------------------------------------------------------ */
/*  The autumn-walks leaflet (brochure, six panels)                    */
/* ------------------------------------------------------------------ */

/** A panel of the leaflet: 93 × 216 mm, printed straight onto the sheet. */
function Panel({ material, style, children }: { material: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <Face ink={stockInk(material)} style={{ padding: '9cqw 8cqw 8cqw', ...style }}>
      {children}
    </Face>
  )
}

/** The cover, which is the panel the sheet folds to face you. */
export function GardenLeafletCover({ material }: { material: string }) {
  const ink = stockInk(material)
  return (
    <Panel material={material}>
      <Cut of={CUT.monstera} style={{ left: '-4cqw', top: '13cqh', width: '112cqw', transform: 'scaleX(-1) rotate(-12deg)' }} />
      <Lockup size={5.4} ink={ink} style={{ position: 'relative' }} />
      <div style={{ marginTop: 'auto', position: 'relative' }}>
        <Headline size="22cqw">{'Autumn\nwalks'}</Headline>
        <Small size="4.6cqw" style={{ marginTop: '4cqw', maxWidth: '78cqw' }}>
          Six routes through the glasshouses, the arboretum and the lake path, with a guide or on your own.
        </Small>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3cqw', marginTop: '6cqw' }}>
          <span style={{ background: MARIGOLD, color: '#1d1206', fontSize: '4.2cqw', fontWeight: 700, padding: '1.8cqw 3.2cqw', borderRadius: '10cqw', whiteSpace: 'nowrap' }}>
            Free with admission
          </span>
          <Small size="4.2cqw" style={{ fontWeight: 600 }}>
            Sept – Nov 2026
          </Small>
        </div>
      </div>
    </Panel>
  )
}

/** The first panel inside: why come, in one sentence and three numbers. */
export function GardenLeafletWelcome({ material }: { material: string }) {
  const green = greenOn(material)
  const stats: [string, string][] = [
    ['2,400', 'species and cultivars, from alpines to a 30 m kauri'],
    ['4', 'glasshouses, one of them cast iron and listed'],
    ['1891', 'the year the first beds were dug'],
  ]
  return (
    <Panel material={material}>
      <Kicker color={green}>Welcome</Kicker>
      <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '10.4cqw', lineHeight: 1.02, letterSpacing: '-0.025em', marginTop: '5cqw' }}>
        Eleven acres, four glasshouses and one very old fig.
      </div>
      <Small size="4.3cqw" style={{ marginTop: '6cqw', opacity: 0.85 }}>
        Autumn is the garden’s second spring. The asters and the late salvias peak, the maples turn by the lake, and the Palm House is warm on the coldest afternoon.
      </Small>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column' }}>
        {stats.map(([n, label]) => (
          <div key={n} style={{ borderTop: `0.5cqw solid ${green}`, padding: '3.4cqw 0 4cqw' }}>
            <div style={{ fontSize: '12cqw', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.9 }}>{n}</div>
            <Small size="4cqw" style={{ marginTop: '1.4cqw', opacity: 0.8 }}>
              {label}
            </Small>
          </div>
        ))}
      </div>
    </Panel>
  )
}

const WALKS: [string, string, string][] = [
  ['The Palm House loop', '25 min · 0.8 km · step-free', 'Bananas, cycads and the 1891 fig, under glass all the way.'],
  ['Arboretum at dusk', '45 min · 2.1 km · Fridays', 'The maples at their reddest, lit from below after six.'],
  ['Lake and meadow', '60 min · 3.4 km · boots advised', 'Out past the boathouse to the wildflower bank and back.'],
  ['Behind the glass', '40 min · guided · book ahead', 'Into the propagation houses the public never sees.'],
]

/** The walks, numbered to match the map on the back. */
export function GardenLeafletWalks({ material }: { material: string }) {
  const green = greenOn(material)
  return (
    <Panel material={material}>
      <Kicker color={green}>The walks</Kicker>
      <Headline size="11cqw" style={{ marginTop: '4cqw' }}>
        {'Pick a route,\nfollow the\nleaf posts.'}
      </Headline>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6.5cqw' }}>
        {WALKS.map(([name, meta, note], i) => (
          <div key={name} style={{ display: 'flex', gap: '3.6cqw' }}>
            <span
              style={{
                flex: 'none',
                width: '8.4cqw',
                height: '8.4cqw',
                borderRadius: '50%',
                background: GREEN,
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                fontSize: '4.4cqw',
                fontWeight: 800,
              }}
            >
              {i + 1}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '5.2cqw', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05 }}>{name}</div>
              <Small size="3.7cqw" style={{ color: green, fontWeight: 600, marginTop: '1cqw' }}>
                {meta}
              </Small>
              <Small size="3.8cqw" style={{ marginTop: '0.8cqw', opacity: 0.82 }}>
                {note}
              </Small>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

const EVENTS: [string, string, string, string][] = [
  ['12', 'Sep', 'Seed swap', 'In the Orangery, 10 am – 1 pm. Bring what you saved.'],
  ['26', 'Sep', 'Fungi foray', 'With the county recorder. Ages 12 and up.'],
  ['10', 'Oct', 'Apple day', 'Sixty varieties to taste, and a press to use.'],
  ['24', 'Oct', 'Glasshouse after dark', 'Lanterns and the night orchids, 6 – 10 pm.'],
  ['07', 'Nov', 'Winter pruning', 'A hands-on morning with the arboretum team.'],
]

/** What's on: five dates, set as a column of big numerals. */
export function GardenLeafletEvents({ material }: { material: string }) {
  const green = greenOn(material)
  const ink = stockInk(material)
  return (
    <Panel material={material}>
      <Kicker color={green}>What’s on</Kicker>
      <Headline size="11cqw" style={{ marginTop: '4cqw' }}>
        {'Five dates\nfor the diary'}
      </Headline>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column' }}>
        {EVENTS.map(([day, month, name, note], i) => (
          <div key={name} style={{ display: 'flex', gap: '4cqw', padding: '3.6cqw 0', borderTop: `0.35cqw solid ${mix(ink, material, 0.6)}` }}>
            <div style={{ flex: 'none', width: '15cqw' }}>
              <div style={{ fontSize: '10cqw', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.85, color: i === 3 ? MARIGOLD : undefined }}>{day}</div>
              <Small size="3.6cqw" style={{ fontWeight: 600, marginTop: '0.6cqw' }}>
                {month}
              </Small>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '5cqw', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05 }}>{name}</div>
              <Small size="3.7cqw" style={{ marginTop: '1cqw', opacity: 0.82 }}>
                {note}
              </Small>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

/**
 * The map: the lake, the four glasshouses and the paths drawn in the ink,
 * the walks as the numbered green discs the other side lists.
 */
export function GardenLeafletMap({ material }: { material: string }) {
  const ink = stockInk(material)
  const green = greenOn(material)
  const faint = mix(ink, material, 0.55)
  const water = isDark(material) ? '#2c5566' : '#bfdbe4'
  const lawn = isDark(material) ? '#23402e' : '#dcebd6'
  const pins: [number, number][] = [
    [62, 92],
    [28, 172],
    [70, 236],
    [34, 60],
  ]
  return (
    <Panel material={material}>
      <Kicker color={green}>Garden map</Kicker>
      <Headline size="11cqw" style={{ marginTop: '4cqw' }}>
        {'Lighthouse\nRoad gate'}
      </Headline>
      <svg viewBox="0 0 100 270" style={{ width: '100%', flex: 1, minHeight: 0, marginTop: '7cqw' }} aria-hidden preserveAspectRatio="xMidYMid meet">
        <rect x={2} y={2} width={96} height={266} rx={6} fill={lawn} />
        <path d="M40 150c18-10 50-6 54 16s-10 42-34 40-40-12-38-30 6-18 18-26z" fill={water} />
        <g fill="none" stroke={faint} strokeWidth={1.4} strokeDasharray="3 2.4" strokeLinecap="round">
          <path d="M50 266V224c0-18-30-20-30-44s10-40 30-52 28-30 22-50-26-26-40-30" />
          <path d="M50 224c18-4 36-18 40-40" />
          <path d="M72 78c10 10 18 24 10 40" />
        </g>
        <g fill="none" stroke={ink} strokeWidth={1.3}>
          <rect x={46} y={24} width={34} height={16} rx={1.5} />
          <rect x={14} y={40} width={22} height={12} rx={1.5} />
          <path d="M52 110h28v12H52z" />
          <path d="M18 98h16v10H18z" />
        </g>
        {pins.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={6.2} fill={GREEN} />
            <text x={x} y={y + 2.4} fontSize={7} fontWeight={800} textAnchor="middle" fill="#ffffff" fontFamily="inherit">
              {i + 1}
            </text>
          </g>
        ))}
        <path d="M44 260h12l-6 -8z" fill={MARIGOLD} />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4cqw' }}>
        <Small size="3.6cqw">
          <span style={{ color: MARIGOLD }}>▲</span> You are here
        </Small>
        <Small size="3.6cqw" style={{ opacity: 0.8 }}>
          Palm House · Orangery · Café
        </Small>
      </div>
    </Panel>
  )
}

/** The back panel: how to get in, and when. */
export function GardenLeafletVisit({ material }: { material: string }) {
  const ink = stockInk(material)
  const green = greenOn(material)
  const rows: [string, string][] = [
    ['Open', 'Daily 9 am – 5 pm\nFridays in October until 10 pm'],
    ['Tickets', 'Adults £9 · Concessions £7\nUnder-16s and members free'],
    ['Find us', 'Lighthouse Road, Northshore\nBus 42 to the Garden Gate stop'],
  ]
  return (
    <Panel material={material}>
      <Kicker color={green}>Plan your visit</Kicker>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5.4cqw', marginTop: '6cqw' }}>
        {rows.map(([label, value]) => (
          <div key={label}>
            <div style={{ fontSize: '5cqw', fontWeight: 800, letterSpacing: '-0.03em' }}>{label}</div>
            <Small size="4.3cqw" style={{ whiteSpace: 'pre-line', marginTop: '1.2cqw', opacity: 0.85 }}>
              {value}
            </Small>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6cqw' }}>
        <Lockup size={6.2} ink={ink} />
        <Small size="4cqw" style={{ fontWeight: 600 }}>
          {SITE}
          <br />
          <span style={{ fontWeight: 500, opacity: 0.75 }}>Registered charity no. 1162247</span>
        </Small>
      </div>
    </Panel>
  )
}

/* ------------------------------------------------------------------ */
/*  The staff badge (ID card)                                          */
/* ------------------------------------------------------------------ */

/**
 * The badge front: a green head the slot is punched through, the photo, the
 * name at the size a door can read it, and the marigold foot that says
 * "staff" to anyone across a glasshouse.
 */
export function GardenBadge({ material }: { material: string }) {
  return (
    <Face ink={stockInk(material)} style={{ alignItems: 'center', textAlign: 'center' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '35cqh', background: GREEN }} />
      <div style={{ position: 'relative', marginTop: '13cqh', display: 'flex', alignItems: 'center', gap: '2.6cqw' }}>
        <LeafMark size="9cqw" color="#ffffff" leaf={GREEN} />
        <div style={{ color: '#ffffff', textAlign: 'left', fontSize: '4.6cqw', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
          Northshore
          <br />
          <span style={{ fontWeight: 500 }}>Botanical Garden</span>
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          marginTop: '4.5cqh',
          width: '50cqw',
          height: '50cqw',
          borderRadius: '4cqw',
          overflow: 'hidden',
          background: '#e2ecdf',
          border: '1.4cqw solid #ffffff',
          flex: 'none',
        }}
      >
        <Cut of={CUT.portrait} style={{ left: 0, bottom: 0, width: '100%' }} />
      </div>
      <div style={{ marginTop: '5cqh', fontSize: '9cqw', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1 }}>Maya Okafor</div>
      <Small size="4.6cqw" style={{ marginTop: '1.6cqw', opacity: 0.8 }}>
        Horticulturist · Glasshouses
      </Small>
      <div style={{ display: 'flex', gap: '8cqw', marginTop: '3.4cqh' }}>
        <Small size="3.6cqw" style={{ textAlign: 'left' }}>
          <span style={{ opacity: 0.65 }}>Staff no.</span>
          <br />
          <b>0417</b>
        </Small>
        <Small size="3.6cqw" style={{ textAlign: 'left' }}>
          <span style={{ opacity: 0.65 }}>Valid to</span>
          <br />
          <b>12 / 2027</b>
        </Small>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '9cqh',
          background: MARIGOLD,
          color: '#1d1206',
          display: 'grid',
          placeItems: 'center',
          fontSize: '6cqw',
          fontWeight: 800,
          letterSpacing: '-0.02em',
        }}
      >
        Staff
      </div>
    </Face>
  )
}

/** The badge back: where it goes if it is lost, what it opens, and the code the doors read. */
export function GardenBadgeBack({ material }: { material: string }) {
  const ink = stockInk(material)
  const green = greenOn(material)
  const zones = ['Glasshouses', 'Nursery', 'Stores', 'Offices']
  return (
    <Face ink={ink} style={{ padding: '17cqh 9cqw 7cqh' }}>
      <Kicker color={green} size="4.6cqw">
        If found
      </Kicker>
      <Small size="4.1cqw" style={{ marginTop: '2.4cqw' }}>
        Please hand this card in at the Visitor Centre, or post it to Northshore Botanical Garden, Lighthouse Road, Northshore.
      </Small>
      <Kicker color={green} size="4.6cqw">
        <span style={{ display: 'block', marginTop: '7cqw' }}>Access</span>
      </Kicker>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2cqw', marginTop: '2.6cqw' }}>
        {zones.map((z) => (
          <span key={z} style={{ border: `0.45cqw solid ${ink}`, borderRadius: '6cqw', padding: '1.2cqw 2.8cqw', fontSize: '3.8cqw', fontWeight: 600 }}>
            {z}
          </span>
        ))}
      </div>
      <Small size="3.8cqw" style={{ marginTop: '7cqw', opacity: 0.8 }}>
        Site security, day and night: {PHONE.replace('142', '911')}
      </Small>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4cqw' }}>
        <div style={{ background: '#ffffff', padding: '2.4cqw 4cqw 1.4cqw', borderRadius: '1.4cqw' }}>
          <UpcA digits="04170266001" color="#141414" style={{ width: '46cqw' }} />
        </div>
        <Small size="3.2cqw" style={{ opacity: 0.7, textAlign: 'center' }}>
          This card is the property of Northshore Botanical Garden and must be returned on request.
        </Small>
      </div>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  The grounds team's van                                             */
/* ------------------------------------------------------------------ */

/**
 * The van's own type block: the mark beside the name, and under them the
 * number to ring. `size` is the name's cqw; the block is about 6.8 names
 * wide and 2.2 tall, which is what the two layouts below are sized from.
 */
function VanName({ ink, size }: { ink: string; size: number }) {
  return (
    <div style={{ color: ink }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: `${size * 0.3}cqw` }}>
        <LeafMark size={`${size * 1.25}cqw`} />
        <div style={{ whiteSpace: 'nowrap' }}>
          <div style={{ fontSize: `${size}cqw`, fontWeight: 800, letterSpacing: '-0.055em', lineHeight: 0.86 }}>Northshore</div>
          <div style={{ fontSize: `${size * 0.5}cqw`, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.1 }}>Garden Services</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: `${size * 0.3}cqw`, marginTop: `${size * 0.34}cqw`, whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: `${size * 0.42}cqw`, fontWeight: 800, letterSpacing: '-0.025em' }}>{PHONE}</span>
        <span style={{ fontSize: `${size * 0.26}cqw`, fontWeight: 600, opacity: 0.8 }}>{SITE}</span>
      </div>
    </div>
  )
}

/**
 * One flank of the van. On the panel (`full` off) it is the cargo box's
 * side, one rectangle clear of the arches; on the full wrap it is the whole
 * elevation, cab and all, so the leaf and the name keep to the box (the
 * first 68 % of the length from the tail), the services line keeps to the
 * sill between the wheel arches (30-76 %), and the cab door carries only
 * the number, under its window (69-86 %).
 *
 * The curb side's wrap runs tail to nose and the street side's nose to
 * tail (the library's convention for both vehicles), so `street` mirrors
 * the layout: the name always sits toward the cab and the leaf toward the
 * back doors, which is how a signwriter sets a van.
 */
export function GardenVanSide({ material, full, street }: { material: string; full?: boolean; street?: boolean }) {
  const ink = stockInk(material)
  /** Horizontal placement, in cqw measured from the tail. */
  const x = (fromTail: number): CSSProperties => (street ? { right: `${fromTail}cqw` } : { left: `${fromTail}cqw` })
  const layout = full
    ? { sweep: 34, leaf: { at: -3, top: -6, height: 80 }, name: { at: 30, top: 15, size: 5.2 }, services: { at: 33, bottom: 11, size: 1.7 } }
    : { sweep: 27, leaf: { at: -6, top: -10, height: 104 }, name: { at: 38, top: 12, size: 8 }, services: { at: 38, bottom: 8, size: 2.3 } }
  return (
    <Face ink={ink}>
      {/* the green sweep along the sill; the full wrap's arches cut into it */}
      <svg
        viewBox="0 0 100 30"
        preserveAspectRatio="none"
        aria-hidden
        style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: `${layout.sweep}cqh`, transform: street ? 'scaleX(-1)' : undefined }}
      >
        <path d="M0 14C30 4 62 2 100 12V30H0z" fill={GREEN} />
        <path d="M0 14C30 4 62 2 100 12" stroke={MARIGOLD} strokeWidth={1.1} fill="none" vectorEffect="non-scaling-stroke" />
      </svg>
      <Cut
        of={CUT.monstera}
        style={{ ...x(layout.leaf.at), top: `${layout.leaf.top}cqh`, height: `${layout.leaf.height}cqh`, transform: `${street ? 'scaleX(-1) ' : ''}rotate(-18deg)` }}
      />
      <div style={{ position: 'absolute', ...x(layout.name.at), top: `${layout.name.top}cqh` }}>
        <VanName ink={ink} size={layout.name.size} />
      </div>
      <div
        style={{
          position: 'absolute',
          ...x(layout.services.at),
          bottom: `${layout.services.bottom}cqh`,
          color: '#ffffff',
          fontSize: `${layout.services.size}cqw`,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap',
        }}
      >
        Landscapes · Glasshouses · Planting · Tree care
      </div>
      {full && (
        <div style={{ position: 'absolute', ...x(70), width: '16cqw', top: '50cqh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8cqw' }}>
          <LeafMark size="4.2cqw" />
          <div style={{ fontSize: '1.8cqw', fontWeight: 800, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{PHONE}</div>
        </div>
      )}
    </Face>
  )
}

/** The roll-up door: the one line a van's back gets, and how to find them. */
export function GardenVanRear({ material }: { material: string }) {
  const ink = stockInk(material)
  return (
    <Face ink={ink} style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '8cqh 9cqw' }}>
      <LeafMark size="15cqw" />
      <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: '13cqw', lineHeight: 0.95, letterSpacing: '-0.03em', marginTop: '6cqh' }}>
        We brake
        <br />
        for bees.
      </div>
      <div style={{ width: '14cqw', height: '0.8cqw', background: MARIGOLD, margin: '6cqh 0 5cqh', flex: 'none' }} />
      <div style={{ fontSize: '6cqw', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1 }}>Northshore Garden Services</div>
      <Small size="4.6cqw" style={{ marginTop: '2cqw', fontWeight: 600 }}>
        {PHONE}
        <br />
        <span style={{ fontWeight: 500, opacity: 0.8 }}>{SITE}</span>
      </Small>
    </Face>
  )
}

/**
 * The plates. A registration, not a livery - so it is the one face here with
 * a ground of its own, reflective white with the state line across the top.
 */
export function GardenPlate() {
  return (
    <Face ground="#f4f6f8" ink="#1b2a4a" style={{ alignItems: 'center', justifyContent: 'space-between', padding: '5cqh 6cqw 6cqh', border: '2.4cqw solid #1b2a4a', borderRadius: '5cqw' }}>
      <div style={{ fontSize: '9cqw', fontWeight: 700, letterSpacing: '0.02em', color: GREEN, lineHeight: 1 }}>Northshore</div>
      <div style={{ fontSize: '22cqw', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 0.85, whiteSpace: 'nowrap' }}>GRDN 26</div>
      <div style={{ fontSize: '7cqw', fontWeight: 600, lineHeight: 1, opacity: 0.8 }}>Commercial</div>
    </Face>
  )
}

/* ------------------------------------------------------------------ */
/*  The late opening, on the street screens (DOOH totem, back)         */
/* ------------------------------------------------------------------ */

/** Lanterns strung across the glasshouse: warm dots on a sagging line. */
function Lanterns({ top, sag, count }: { top: number; sag: number; count: number }) {
  return (
    <>
      <svg viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden style={{ position: 'absolute', left: 0, top: `${top}cqh`, width: '100%', height: `${sag}cqh` }}>
        <path d="M-2 0Q50 34 102 0" stroke="rgba(255,226,170,0.35)" strokeWidth={0.4} fill="none" vectorEffect="non-scaling-stroke" />
      </svg>
      {Array.from({ length: count }, (_, i) => {
        const t = (i + 0.5) / count
        const y = top + sag * 0.85 * 4 * t * (1 - t)
        return (
          <span
            key={i}
            aria-hidden
            style={{
              position: 'absolute',
              left: `${t * 100}cqw`,
              top: `${y}cqh`,
              width: '2.2cqw',
              height: '2.2cqw',
              borderRadius: '50%',
              background: '#ffd98a',
              boxShadow: '0 0 2.4cqw 0.8cqw rgba(255,196,92,0.55)',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )
      })}
    </>
  )
}

/** The totem's back: Glasshouse after dark, the Friday late openings. */
export function GardenAfterDark() {
  return (
    <Face ground={DEEP} ink="#f4efe2" style={{ padding: '8cqw 8cqw 9cqw', background: `radial-gradient(120% 70% at 50% 42%, #1f5a39 0%, ${DEEP} 60%, #07170f 100%)` }}>
      <Lanterns top={7} sag={10} count={9} />
      <Lanterns top={20} sag={7} count={7} />
      <Cut of={CUT.monstera} style={{ left: '-6cqw', top: '26cqh', width: '112cqw', transform: 'rotate(8deg)', filter: 'brightness(0.78) saturate(1.1)' }} />
      <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '58cqh', background: 'linear-gradient(to bottom, rgba(7,23,15,0) 0%, rgba(7,23,15,0.72) 45%, rgba(7,23,15,0.9) 100%)' }} />
      <div style={{ marginTop: 'auto', position: 'relative' }}>
        <div style={{ color: '#ffd98a', fontSize: '4.6cqw', fontWeight: 700, letterSpacing: '-0.01em' }}>Fridays in October · 6 – 10 pm</div>
        <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '17cqw', lineHeight: 0.9, letterSpacing: '-0.035em', marginTop: '3cqw' }}>
          Glasshouse
          <br />
          <span style={{ fontStyle: 'italic' }}>after dark</span>
        </div>
        <Small size="4.4cqw" style={{ marginTop: '4cqw', opacity: 0.88, maxWidth: '80cqw' }}>
          Lanterns through the Palm House, music in the Orangery, and the orchids that only open at night.
        </Small>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '7cqw' }}>
          <Lockup size={4.2} ink="#f4efe2" />
          <span style={{ background: MARIGOLD, color: '#1d1206', fontSize: '4.2cqw', fontWeight: 800, padding: '2cqw 3.6cqw', borderRadius: '10cqw', whiteSpace: 'nowrap' }}>
            Tickets £14
          </span>
        </div>
      </div>
    </Face>
  )
}
