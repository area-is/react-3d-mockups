'use client'

import type { CSSProperties, ReactNode } from 'react'
import { FONT, INK, Micro, PAPER, Sheet, materialTone } from './swiss-art'
import { JetPrint, NutritionFacts, Photo, Pill, Plate, RecycleMark, RoundSeal, SERIF, UpcA } from './label-art'
import { asset } from '@/lib/base-path.mjs'

/**
 * The packaging on the carousel, each modelled on the real thing it stands
 * in for rather than on a poster:
 *
 * - the product box is a cereal box - the 190 × 265 × 55 mm blank IS the
 *   cereal-box proportion - with the brand tab, the bowl, the seals, the net
 *   weight across the foot and the Nutrition Facts down the side;
 * - the mailer box is a direct-to-consumer shipper, one colour of ink on
 *   corrugate: a fern engraving stamped across the lid's corner, the brand
 *   under it, the handling pictograms along the foot and down the ends, the
 *   tape crossing the middle the way tape does;
 * - the shopping bag is a florist's carrier done the way an expensive shop
 *   does one: a botanical plate, the name in letterspaced serif capitals,
 *   the address in a line of small capitals, and nothing else.
 *
 * All of them print straight onto the material (`materialTone`), so the
 * carousel's finish swatches change the board under the print: white board,
 * kraft, a black box with white ink. The brand colours are solid inks and
 * stay put; the type flips to white ink on a dark board. The two engravings
 * (`/art/marigold.webp`, `/art/fern.webp`) are alpha-only plates printed
 * through `Plate`, so they flip with the type.
 *
 * Measurements are in `cqw` against each face's own width, so a side panel
 * a third as wide as the front sets its type a third the size - which is
 * exactly what a real side panel does.
 */

/* ------------------------------------------------------------------ */
/*  The cereal box                                                     */
/* ------------------------------------------------------------------ */

/** The mill's inks, with a dark-board variant so a black box stays legible. */
interface Mill {
  dark: boolean
  ink: string
  onInk: string
  green: string
  honey: string
  amber: string
  title: string
  red: string
  cream: string
}

function mill(material: string): Mill {
  const dark = materialTone(material).text !== INK
  return dark
    ? { dark, ink: PAPER, onInk: INK, green: '#2f8a5b', honey: '#f2b544', amber: '#e08a2e', title: '#f8efe0', red: '#e5574a', cream: '#fff4dc' }
    : { dark, ink: '#3a2412', onInk: '#fff4dc', green: '#1f5c3d', honey: '#f0b233', amber: '#c9741a', title: '#3a2412', red: '#c8322b', cream: '#fff4dc' }
}

/** A panel of the box: the board as the container, the print laid out inside it. */
function BoxFace({ material, style, children }: { material: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <Sheet
      tone={materialTone(material)}
      style={{ flexDirection: 'column', padding: '4.5cqw', gap: '2cqw', color: mill(material).ink, ...style }}
    >
      {children}
    </Sheet>
  )
}

const copy = (size: string, extra?: CSSProperties): CSSProperties => ({
  margin: 0,
  fontSize: size,
  lineHeight: 1.36,
  ...extra,
})

/** An ear of wheat - the mill's mark. */
function Wheat({ color, style }: { color: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 44" style={{ display: 'block', ...style }} aria-hidden>
      <path d="M12 44V14" stroke={color} strokeWidth={2} strokeLinecap="round" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} fill={color}>
          <ellipse cx={8} cy={12 + i * 6} rx={3.2} ry={4.6} transform={`rotate(24 8 ${12 + i * 6})`} />
          <ellipse cx={16} cy={9 + i * 6} rx={3.2} ry={4.6} transform={`rotate(-24 16 ${9 + i * 6})`} />
        </g>
      ))}
      <ellipse cx={12} cy={6} rx={3} ry={5} fill={color} />
    </svg>
  )
}

/** The brand tab: the mill's name on a green lozenge, the ear beside it. `size` is the type size in cqw. */
function BrandTab({ p, size }: { p: Mill; size: number }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${size * 0.6}cqw`,
        background: p.green,
        color: '#fff4dc',
        borderRadius: `${size * 0.6}cqw`,
        padding: `${size * 0.5}cqw ${size * 0.95}cqw ${size * 0.5}cqw ${size * 0.75}cqw`,
        flex: 'none',
        alignSelf: 'flex-start',
      }}
    >
      <Wheat color={p.honey} style={{ height: `${size * 1.55}cqw`, width: 'auto' }} />
      <span style={{ fontFamily: FONT, fontWeight: 800, letterSpacing: '0.16em', fontSize: `${size}cqw`, lineHeight: 1, whiteSpace: 'nowrap' }}>
        RIDGEWAY MILLS
      </span>
    </div>
  )
}

/** The printed sunburst the bowl sits on - the one flat colour a cereal front is never without. */
function Burst({ p }: { p: Mill }) {
  const rays = Array.from({ length: 18 }, (_, i) => {
    const a0 = (i * 20 * Math.PI) / 180
    const a1 = ((i * 20 + 9) * Math.PI) / 180
    const r = 150
    return `M100 100 L${100 + r * Math.cos(a0)} ${100 + r * Math.sin(a0)} L${100 + r * Math.cos(a1)} ${100 + r * Math.sin(a1)} Z`
  }).join(' ')
  return (
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden>
      <defs>
        <radialGradient id="cereal-burst" cx="50%" cy="55%" r="55%">
          <stop offset="0" stopColor={p.honey} />
          <stop offset="1" stopColor={p.amber} />
        </radialGradient>
        <clipPath id="cereal-round">
          <circle cx={100} cy={100} r={98} />
        </clipPath>
      </defs>
      <circle cx={100} cy={100} r={98} fill="url(#cereal-burst)" />
      <path d={rays} fill="#ffffff" opacity={0.2} clipPath="url(#cereal-round)" />
    </svg>
  )
}

/**
 * The "Facts Up Front" strip: calories, saturated fat, sodium and sugars per
 * serving in four small tiles at the foot of the front. The US industry
 * scheme every major cereal has carried since 2011 - and the single detail
 * that most says "real box" rather than "designed box".
 */
function FactsUpFront({ p }: { p: Mill }) {
  const items: [string, string, string][] = [
    ['210', 'Calories', ''],
    ['0g', 'Sat fat', '0% DV'],
    ['190mg', 'Sodium', '8% DV'],
    ['12g', 'Sugars', ''],
  ]
  return (
    <div>
      <Micro style={{ fontSize: '1.9cqw', display: 'block', marginBottom: '0.9cqw', opacity: 0.8 }}>Per 1 cup serving</Micro>
      <div style={{ display: 'flex', gap: '1.1cqw' }}>
        {items.map(([value, label, dv]) => (
          <div
            key={label}
            style={{
              border: `0.28cqw solid ${p.ink}`,
              borderRadius: '1.6cqw',
              padding: '1cqw 1.3cqw 0.9cqw',
              textAlign: 'center',
              minWidth: '9.6cqw',
              lineHeight: 1,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '3cqw', letterSpacing: '-0.02em' }}>{value}</div>
            <div style={{ fontSize: '1.65cqw', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '0.7cqw' }}>{label}</div>
            <div style={{ fontSize: '1.55cqw', opacity: dv ? 0.75 : 0, marginTop: '0.4cqw' }}>{dv || '\u00a0'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** The front: the tab, "Honey Oat Clusters", the bowl, the facts and seals, the weight. */
export function CerealFront({ material }: { material: string }) {
  const p = mill(material)
  return (
    <BoxFace material={material} style={{ gap: '1.4cqw' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2cqw' }}>
        <BrandTab p={p} size={2.7} />
        <Pill color={p.red} ink="#fff4dc" size="2.6cqw" style={{ transform: 'rotate(4deg)', marginTop: '0.4cqw' }}>
          Family size
        </Pill>
      </div>
      <div style={{ textAlign: 'center', marginTop: '0.4cqw' }}>
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '12cqw', lineHeight: 0.95, color: p.amber, letterSpacing: '-0.015em' }}>
          Honey Oat
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: '16cqw', lineHeight: 0.92, letterSpacing: '-0.045em', color: p.title, marginTop: '-0.6cqw' }}>
          CLUSTERS
        </div>
        <div style={{ fontSize: '3cqw', fontWeight: 600, marginTop: '1.4cqw', letterSpacing: '0.01em' }}>
          Toasted whole grain oat clusters with a touch of real honey
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, position: 'relative', margin: '0.4cqw 0' }}>
        <Burst p={p} />
        {/* The hero: a photograph, as on every cereal box in the aisle. It is a
            cut-out, so the burst prints behind it and the board shows round it. */}
        <Photo src={asset('/art/cereal-bowl.webp')} fit="contain" style={{ position: 'absolute', inset: '1% 3%', width: '94%', height: '98%' }} />
        <div
          style={{
            position: 'absolute',
            top: '4%',
            right: '1%',
            background: p.red,
            color: '#fff4dc',
            fontWeight: 800,
            fontSize: '2.4cqw',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '1.2cqw 2cqw',
            borderRadius: '0.6cqw',
            transform: 'rotate(-6deg)',
            lineHeight: 1.15,
            textAlign: 'center',
          }}
        >
          New!
          <br />
          <span style={{ fontWeight: 600, letterSpacing: '0.02em', textTransform: 'none', fontSize: '2.2cqw' }}>Bigger clusters</span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '2cqw' }}>
        <FactsUpFront p={p} />
        <div style={{ display: 'flex', gap: '1.6cqw' }}>
          <RoundSeal
            size="13.5cqw"
            legend="WHOLE GRAIN · 32g PER SERVING · "
            color={p.ink}
            center={
              <span style={{ fontSize: '3.6cqw', fontWeight: 900, letterSpacing: '-0.03em' }}>
                32<span style={{ fontSize: '2.1cqw', fontWeight: 800 }}>g</span>
              </span>
            }
          />
          <RoundSeal
            size="13.5cqw"
            legend="GOOD SOURCE OF FIBER · "
            color={p.ink}
            center={
              <span style={{ fontSize: '2.3cqw', fontWeight: 800, letterSpacing: '0.02em' }}>
                4g
                <br />
                FIBER
              </span>
            }
          />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.4cqw' }}>
        <div style={{ fontSize: '3cqw', fontWeight: 800, letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>NET WT 18 OZ (1 LB 2 OZ) 510g</div>
        <Micro style={{ fontSize: '2.1cqw', opacity: 0.72, whiteSpace: 'nowrap' }}>No artificial flavors</Micro>
      </div>
    </BoxFace>
  )
}

/** The right side: the Nutrition Facts panel, the ingredients, the UPC. */
export function CerealFacts({ material }: { material: string }) {
  const p = mill(material)
  return (
    <BoxFace material={material} style={{ padding: '5cqw', gap: '3.4cqw' }}>
      <NutritionFacts
        compact
        fontSize="6.4cqw"
        servings="About 12"
        servingSize="1 cup (55g)"
        calories="210"
        rows={[
          { label: 'Total Fat', amount: '2.5g', dv: '3%', bold: true },
          { label: 'Saturated Fat', amount: '0g', dv: '0%', indent: 1 },
          { label: 'Trans Fat', amount: '0g', indent: 1 },
          { label: 'Cholesterol', amount: '0mg', dv: '0%', bold: true },
          { label: 'Sodium', amount: '190mg', dv: '8%', bold: true },
          { label: 'Total Carbohydrate', amount: '44g', dv: '16%', bold: true },
          { label: 'Dietary Fiber', amount: '4g', dv: '14%', indent: 1 },
          { label: 'Total Sugars', amount: '12g', indent: 1 },
          { label: 'Incl. 11g Added Sugars', amount: '', dv: '22%', indent: 2 },
          { label: 'Protein', amount: '5g', bold: true },
        ]}
        micros={[
          { label: 'Vitamin D', amount: '2mcg', dv: '10%' },
          { label: 'Calcium', amount: '20mg', dv: '2%' },
          { label: 'Iron', amount: '8.1mg', dv: '45%' },
          { label: 'Potassium', amount: '180mg', dv: '4%' },
        ]}
      />
      <p style={copy('5.5cqw', { lineHeight: 1.3 })}>
        <strong>INGREDIENTS:</strong> WHOLE GRAIN OATS, SUGAR, RICE FLOUR, HONEY, CANOLA OIL, MOLASSES, SALT,
        NATURAL FLAVOR, BAKING SODA, MIXED TOCOPHEROLS (FOR FRESHNESS). VITAMINS AND MINERALS: REDUCED IRON,
        VITAMIN D3.
      </p>
      <p style={copy('5.5cqw', { lineHeight: 1.3 })}>
        <strong>CONTAINS:</strong> OATS. MAY CONTAIN WHEAT AND ALMONDS.
      </p>
      <div style={{ flex: 1 }} />
      <div style={{ background: '#ffffff', padding: '3cqw 2.5cqw 1cqw', alignSelf: 'center', width: '88%', boxSizing: 'border-box' }}>
        <UpcA digits="03881205512" color="#111111" />
      </div>
      <Micro style={{ fontSize: '4.2cqw', opacity: 0.75, textAlign: 'center', color: p.ink }}>Best if used by: see top</Micro>
    </BoxFace>
  )
}

/** The left side: the mill's story, how it is made, who to call. */
export function CerealStory({ material }: { material: string }) {
  const p = mill(material)
  const steps = [
    ['Roll', 'Whole oats, rolled thick and kept whole grain.'],
    ['Toast', 'Baked slowly with honey until the clusters hold.'],
    ['Pour', 'Into the box within a day. Nothing sits.'],
  ]
  return (
    <BoxFace material={material} style={{ padding: '5.5cqw', gap: '4cqw' }}>
      <BrandTab p={p} size={4.4} />
      <div style={{ fontFamily: SERIF, fontSize: '10.5cqw', lineHeight: 1.06, letterSpacing: '-0.01em' }}>
        Real oats, toasted in small batches since 1962.
      </div>
      <p style={copy('5.9cqw', { lineHeight: 1.38 })}>
        We started as a grain mill on the Ridgeway river, and we still buy our oats from the farms up the valley.
        Every batch is toasted in ovens you could stand in, then poured straight into the box.
      </p>
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <Photo src={asset('/art/cereal-clusters.webp')} fit="contain" />
      </div>
      <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '2.6cqw' }}>
        {steps.map(([name, how], i) => (
          <li key={name} style={{ display: 'flex', gap: '3cqw', ...copy('5.6cqw', { lineHeight: 1.3 }) }}>
            <span style={{ color: p.red, fontWeight: 900, fontVariantNumeric: 'tabular-nums', flex: 'none' }}>{i + 1}</span>
            <span>
              <strong>{name}.</strong> {how}
            </span>
          </li>
        ))}
      </ol>
      <p style={copy('5cqw', { lineHeight: 1.32, opacity: 0.85 })}>
        Questions or comments? Call 1-800-555-0142 weekdays, or write to hello@ridgewaymills.com. Please have the box
        handy.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3cqw' }}>
        <RecycleMark color={p.ink} size="12cqw" />
        <Micro style={{ fontSize: '4cqw', lineHeight: 1.3, opacity: 0.8 }}>
          Carton: recycle
          <br />
          Liner: discard
        </Micro>
      </div>
      <Micro style={{ fontSize: '3.8cqw', opacity: 0.7, lineHeight: 1.3 }}>Made in the USA with domestic and imported ingredients · Ridgeway Mills, Lewiston, ID 83501</Micro>
    </BoxFace>
  )
}

/** The top: the name along the flap, the best-by jetted on, "open here" at the front edge. */
export function CerealTop({ material }: { material: string }) {
  const p = mill(material)
  return (
    <BoxFace material={material} style={{ flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-between', padding: '3.2cqw 4.5cqw', gap: '3cqw' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1cqw', minWidth: 0 }}>
        <BrandTab p={p} size={2.4} />
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '6.4cqw', lineHeight: 1, color: p.amber, whiteSpace: 'nowrap' }}>
          Honey Oat <span style={{ fontFamily: FONT, fontStyle: 'normal', fontWeight: 900, color: p.title, letterSpacing: '-0.04em' }}>CLUSTERS</span>
        </div>
        <Micro style={{ fontSize: '2.3cqw', opacity: 0.75 }}>▲ Lift tab to open · press to reclose</Micro>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'right', flex: 'none' }}>
        <Micro style={{ fontSize: '2.3cqw', opacity: 0.75 }}>Best if used by</Micro>
        <JetPrint color={p.ink} size="4.6cqw">
          {'14 MAR 2027\nLOT 3A7 K2 06:31'}
        </JetPrint>
        <Micro style={{ fontSize: '2.3cqw', opacity: 0.75 }}>Net wt 18 oz (510g)</Micro>
      </div>
    </BoxFace>
  )
}

/**
 * One of the range on the back: a small front, built from the same parts as
 * the big one - the tab, the flavour in the two faces, the bowl - so the
 * three read as this box's siblings rather than as three icons. It brings
 * its own cream board, because on the ink colourway the range is still a
 * row of cream boxes; that is what a photograph of them would show.
 */
function MiniBox({ p, name, sub, band }: { p: Mill; name: [string, string]; sub: string; band: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.4cqw', minWidth: 0 }}>
      <div
        style={{
          width: '19cqw',
          aspectRatio: '190 / 265',
          background: '#fff8ea',
          border: `0.25cqw solid ${p.dark ? '#fff8ea' : '#3a2412'}`,
          borderRadius: '0.7cqw',
          boxSizing: 'border-box',
          padding: '1.3cqw 1.2cqw 0.9cqw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.6cqw',
          color: '#3a2412',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            alignSelf: 'flex-start',
            background: p.green,
            color: '#fff4dc',
            fontFamily: FONT,
            fontSize: '1cqw',
            fontWeight: 800,
            letterSpacing: '0.12em',
            padding: '0.45cqw 0.7cqw',
            borderRadius: '1cqw',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          RIDGEWAY MILLS
        </span>
        <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '2.2cqw', lineHeight: 1, color: band, marginTop: '0.4cqw', whiteSpace: 'nowrap' }}>
          {name[0]}
        </span>
        <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: '2.6cqw', lineHeight: 0.95, letterSpacing: '-0.04em', whiteSpace: 'nowrap' }}>
          {name[1]}
        </span>
        <div style={{ flex: 1, minHeight: 0, width: '100%', position: 'relative', marginTop: '0.3cqw' }}>
          <div style={{ position: 'absolute', inset: '6% 10% 2%', borderRadius: '50%', background: band, opacity: 0.18 }} />
          <Photo src={asset('/art/cereal-bowl.webp')} fit="contain" style={{ position: 'absolute', inset: 0 }} />
        </div>
      </div>
      <Micro style={{ fontSize: '1.9cqw', textAlign: 'center', lineHeight: 1.4, whiteSpace: 'nowrap' }}>
        {name.join(' ')}
        <br />
        <span style={{ opacity: 0.7, fontWeight: 500, letterSpacing: '0.08em', fontSize: '0.85em' }}>{sub}</span>
      </Micro>
    </div>
  )
}

/**
 * The back: a recipe with its photograph, the rest of the range, the small
 * print. Laid out to the panel, which is the whole discipline of a box back:
 * the recipe card is a fixed height so the photograph cannot stretch it, the
 * range row is sized by its boxes, and the small print sits on the foot with
 * the slack above it - so the address is on the board whatever font the
 * viewer's machine sets the copy in.
 */
export function CerealBack({ material }: { material: string }) {
  const p = mill(material)
  const steps = [
    'Spoon ½ cup of yogurt into a tall glass.',
    'Add a handful of clusters and a few berries.',
    'Repeat, then finish with a drizzle of honey.',
    'Eat it before the clusters go soft. They won’t take long.',
  ]
  return (
    <BoxFace material={material} style={{ gap: '2.2cqw' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2cqw' }}>
        <BrandTab p={p} size={2.7} />
        <Micro style={{ fontSize: '2.1cqw', opacity: 0.75, whiteSpace: 'nowrap' }}>Est. 1962 · Lewiston, Idaho</Micro>
      </div>

      <div style={{ fontFamily: SERIF, fontSize: '7.4cqw', lineHeight: 1.02, letterSpacing: '-0.015em' }}>
        Breakfast, sorted.
        <br />
        <span style={{ fontStyle: 'italic', color: p.amber }}>Try it layered.</span>
      </div>

      {/* the recipe card: the photograph on the left, the method on the right, at a height that is the card's and not the picture's */}
      <div
        style={{
          border: `0.4cqw solid ${p.ink}`,
          borderRadius: '2.2cqw',
          padding: '2.6cqw 3.2cqw 2.6cqw 2.6cqw',
          display: 'grid',
          gridTemplateColumns: '25cqw 1fr',
          gap: '3cqw',
          height: '43cqw',
          boxSizing: 'border-box',
          flex: 'none',
        }}
      >
        <div style={{ position: 'relative', minHeight: 0 }}>
          <Photo src={asset('/art/parfait.webp')} fit="contain" position="50% 100%" style={{ position: 'absolute', inset: 0 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5cqw', minWidth: 0 }}>
          <Micro style={{ fontSize: '2.2cqw', color: p.red }}>Recipe · 5 minutes · serves 1</Micro>
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '5.6cqw', lineHeight: 1, color: p.amber }}>Honey Oat Parfait</div>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '1.1cqw' }}>
            {steps.map((step, i) => (
              <li key={step} style={{ display: 'flex', gap: '1.8cqw', ...copy('2.55cqw', { lineHeight: 1.3 }) }}>
                <span style={{ color: p.red, fontWeight: 900, fontVariantNumeric: 'tabular-nums', flex: 'none' }}>{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <Micro style={{ fontSize: '1.8cqw', opacity: 0.7, marginTop: 'auto' }}>More at ridgewaymills.com/recipes</Micro>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.6cqw' }}>
        <Micro style={{ fontSize: '2.4cqw', color: p.red }}>Also from Ridgeway Mills</Micro>
        <Micro style={{ fontSize: '2cqw', opacity: 0.72 }}>Look for the green tab</Micro>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.4cqw', padding: '0 2cqw', flex: 'none' }}>
        <MiniBox p={p} name={['Cinnamon', 'CRUNCH']} sub="Oats · cinnamon" band="#c8322b" />
        <MiniBox p={p} name={['Berry', 'CLUSTERS']} sub="Blueberry · cranberry" band="#6b3fa0" />
        <MiniBox p={p} name={['Maple', 'PECAN']} sub="Real maple · pecans" band="#7a4a1e" />
      </div>

      <div style={{ flex: 1, minHeight: 0 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '3cqw', flex: 'none' }}>
        <Micro style={{ fontSize: '1.8cqw', opacity: 0.75, lineHeight: 1.5, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
          Questions? Call 1-800-555-0142 weekdays
          <br />
          hello@ridgewaymills.com · ridgewaymills.com
          <br />
          Ridgeway Mills · Lewiston, ID 83501 · Made in the USA
          <br />
          with domestic and imported ingredients
        </Micro>
        <RecycleMark
          color={p.ink}
          size="6cqw"
          label={
            <Micro style={{ fontSize: '1.9cqw', lineHeight: 1.35, whiteSpace: 'nowrap' }}>
              Recycle carton
              <br />
              discard liner
            </Micro>
          }
        />
      </div>
    </BoxFace>
  )
}

/* ------------------------------------------------------------------ */
/*  The mailer box                                                     */
/* ------------------------------------------------------------------ */

/** A panel of the shipper: one ink on corrugate. */
function ShipperFace({ material, style, children }: { material: string; style?: CSSProperties; children: ReactNode }) {
  const t = materialTone(material)
  return (
    <Sheet tone={t} style={{ flexDirection: 'column', padding: '4.5cqw', color: t.text, ...style }}>
      {children}
    </Sheet>
  )
}

/** The candle company's mark: a fern frond, an engraving printed in the one ink (see `Plate`). */
const FERN = asset('/art/fern.webp')

/** ISO handling pictograms, drawn in the ink: the glass, the arrows, the umbrella. */
function Pictogram({ kind, color, size }: { kind: 'fragile' | 'up' | 'dry'; color: string; size: string }) {
  const stroke = { fill: 'none', stroke: color, strokeWidth: 3.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 48 48" style={{ width: size, height: size, display: 'block', flex: 'none' }} aria-hidden>
      {kind === 'fragile' && (
        <g {...stroke}>
          <path d="M14 6h20l-2 12a8 8 0 0 1-16 0z" fill={color} />
          <path d="M24 26v12M16 40h16" />
          <path d="M22 6l4 6-3 4 4 3" stroke={materialToneInverse(color)} strokeWidth={1.6} />
        </g>
      )}
      {kind === 'up' && (
        <g {...stroke}>
          <path d="M15 40V12M9 19l6-7 6 7" />
          <path d="M33 40V12M27 19l6-7 6 7" />
          <path d="M6 44h36" />
        </g>
      )}
      {kind === 'dry' && (
        <g {...stroke}>
          <path d="M6 24a18 18 0 0 1 36 0z" fill={color} />
          <path d="M24 24v14a3 3 0 0 0 6 0" />
          <path d="M10 34l-2 4M38 34l2 4M24 4v2" />
        </g>
      )}
    </svg>
  )
}

/** The mark inside a filled pictogram, which is the board showing through. */
function materialToneInverse(ink: string): string {
  return ink === PAPER ? INK : PAPER
}

/**
 * The lid: three zones with air between them, and nothing drawn as a line.
 * The frond is stamped across the top-left corner and bleeds off both edges,
 * the way a one-colour plate lands on a shipper that was printed before it
 * was cut; the brand sits beside it above the tape, the care line and the
 * handling marks below it, and the small print keeps to the foot - the way a
 * real shipper is laid out around the tape it knows is coming.
 */
export function MailerLid({ material }: { material: string }) {
  const ink = materialTone(material).text
  const marks = [
    ['fragile', 'Fragile'],
    ['up', 'This way up'],
    ['dry', 'Keep dry'],
  ] as const
  return (
    <ShipperFace material={material} style={{ display: 'grid', gridTemplateRows: '1fr 30% 1fr', padding: '4.4cqw 6cqw 4.2cqw', position: 'relative' }}>
      <Plate
        src={FERN}
        ink={ink}
        style={{
          position: 'absolute',
          left: '-3cqw',
          top: '-7cqw',
          width: '24cqw',
          height: '40cqw',
          transform: 'rotate(-30deg)',
          transformOrigin: '50% 50%',
          opacity: 0.94,
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 0, minWidth: 0, paddingLeft: '19cqw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '3cqw' }}>
          <Micro style={{ fontSize: '1.7cqw', whiteSpace: 'nowrap', letterSpacing: '0.24em' }}>Fernhaven Candle Co.</Micro>
          <Micro style={{ fontSize: '1.7cqw', whiteSpace: 'nowrap', letterSpacing: '0.24em', opacity: 0.7 }}>Burlington, Vermont</Micro>
        </div>
        <div>
          <div style={{ fontFamily: SERIF, fontSize: '12.5cqw', lineHeight: 0.88, letterSpacing: '-0.02em' }}>Fernhaven</div>
          <Micro style={{ fontSize: '1.7cqw', display: 'block', marginTop: '2cqw', whiteSpace: 'nowrap', letterSpacing: '0.3em' }}>
            Hand-poured soy candles · Since 2019
          </Micro>
        </div>
      </div>
      {/* the tape's lane, left clear: the band is 48 mm of the 250, and the
          lane is wider than that so the type on either side clears the tape's
          shadowed edges by a few millimetres */}
      <div />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', gap: '4cqw', minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, minWidth: 0, gap: '1.5cqw' }}>
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '4.8cqw', lineHeight: 1.02, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
            Light one. Slow down.
          </div>
          <Micro style={{ fontSize: '1.45cqw', lineHeight: 1.65, opacity: 0.78, letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>
            Inside: one hand-poured soy candle.
            <br />
            Trim the wick to ¼ in. before each burn.
            <br />
            100% recycled corrugate · Soy ink · Reuse me
          </Micro>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', flex: 'none', gap: '1.5cqw' }}>
          <div style={{ display: 'flex', gap: '3.6cqw' }}>
            {marks.map(([kind, label]) => (
              <div key={kind} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.1cqw' }}>
                <Pictogram kind={kind} color={ink} size="5.4cqw" />
                <Micro style={{ fontSize: '1.3cqw', whiteSpace: 'nowrap' }}>{label}</Micro>
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.1cqw' }}>
              <RecycleMark color={ink} size="5.2cqw" />
              <Micro style={{ fontSize: '1.3cqw', whiteSpace: 'nowrap' }}>Recycle</Micro>
            </div>
          </div>
          <Micro style={{ fontSize: '1.5cqw', whiteSpace: 'nowrap', opacity: 0.7, letterSpacing: '0.3em' }}>fernhaven.co</Micro>
        </div>
      </div>
    </ShipperFace>
  )
}

/** The long front: the frond, the name and the mark, at shelf height. */
export function MailerFront({ material }: { material: string }) {
  const ink = materialTone(material).text
  return (
    <ShipperFace material={material} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '3cqw 5cqw', gap: '3cqw' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.2cqw', flex: 'none' }}>
        <Plate src={FERN} ink={ink} style={{ width: '9cqw', height: '26cqw', transform: 'rotate(-16deg)' }} />
        <div style={{ fontFamily: SERIF, fontSize: '8cqw', lineHeight: 0.9, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>Fernhaven</div>
      </div>
      <div style={{ textAlign: 'right', display: 'grid', gap: '1.3cqw', minWidth: 0, flex: 1 }}>
        <Micro style={{ fontSize: '1.5cqw', letterSpacing: '0.16em' }}>Hand-poured soy candles &amp; home goods</Micro>
        <Micro style={{ fontSize: '1.5cqw', letterSpacing: '0.16em', opacity: 0.72 }}>fernhaven.co · Burlington, Vermont</Micro>
        <Micro style={{ fontSize: '1.4cqw', opacity: 0.72, letterSpacing: '0.26em' }}>Fragile · Glass inside · This way up</Micro>
      </div>
    </ShipperFace>
  )
}

/** An end panel: the pictograms either side of where the tape wraps down, the frond between them. */
export function MailerEnd({ material }: { material: string }) {
  const ink = materialTone(material).text
  return (
    <ShipperFace material={material} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '4cqw 6cqw' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.8cqw' }}>
        <Pictogram kind="fragile" color={ink} size="15cqw" />
        <Micro style={{ fontSize: '2.8cqw' }}>Fragile</Micro>
      </div>
      <Plate src={FERN} ink={ink} style={{ width: '16cqw', height: '34cqw', transform: 'rotate(-12deg)', opacity: 0.94 }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.8cqw' }}>
        <Pictogram kind="up" color={ink} size="15cqw" />
        <Micro style={{ fontSize: '2.8cqw' }}>This way up</Micro>
      </div>
    </ShipperFace>
  )
}

/* ------------------------------------------------------------------ */
/*  The shopping bag                                                   */
/* ------------------------------------------------------------------ */

/** The florist's two inks: the board's ink, and a terracotta or a gold to go with it. */
function shop(material: string): { ink: string; accent: string } {
  const t = materialTone(material)
  return { ink: t.text, accent: t.text === INK ? '#b8532e' : '#e2b96a' }
}

/** The florist's mark: a marigold, an engraving printed in the one ink (see `Plate`). */
const MARIGOLD = asset('/art/marigold.webp')

/**
 * The name, the way an expensive shop sets it: serif capitals, letterspaced
 * a third of an em, one line. The tracking is compensated on the left so the
 * line sits on the centre rather than a third of an em to the right of it,
 * which is the tell of letterspacing done in a hurry.
 */
function Wordmark({ accent, size }: { accent: string; size: string }) {
  return (
    <div
      style={{
        fontFamily: SERIF,
        fontSize: size,
        letterSpacing: '0.32em',
        paddingLeft: '0.32em',
        textTransform: 'uppercase',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      Marigold <span style={{ color: accent, fontStyle: 'italic', textTransform: 'none' }}>&amp;</span> Moss
    </div>
  )
}

/**
 * The front, and the discipline of a luxury carrier: the plate at the top,
 * the name under it, one line of small capitals, and the address at the
 * foot - and between them the board, which is most of the bag. Everything
 * is centred and there are no rules, because what makes a bag look
 * expensive is the restraint, not the ornament: two inks, four things, air.
 */
export function BagFront({ material }: { material: string }) {
  const { ink, accent } = shop(material)
  const t = materialTone(material)
  return (
    <Sheet tone={t} style={{ flexDirection: 'column', alignItems: 'center', padding: '13cqw 10cqw 7cqw', color: ink, textAlign: 'center' }}>
      {/* 800 x 1302 in the file */}
      <Plate src={MARIGOLD} ink={ink} style={{ width: '36cqw', height: '58.6cqw' }} />
      <div style={{ marginTop: '7cqw' }}>
        <Wordmark accent={accent} size="5cqw" />
      </div>
      <div style={{ width: '6cqw', height: '0.28cqw', background: accent, marginTop: '4cqw', flex: 'none' }} />
      <Micro style={{ fontSize: '2cqw', letterSpacing: '0.44em', paddingLeft: '0.44em', marginTop: '3.6cqw', fontWeight: 500, whiteSpace: 'nowrap' }}>
        Fleuriste · Est. 2016
      </Micro>
      <div style={{ flex: 1, minHeight: '6cqw' }} />
      <Micro style={{ fontSize: '1.8cqw', letterSpacing: '0.36em', paddingLeft: '0.36em', opacity: 0.72, fontWeight: 500, whiteSpace: 'nowrap' }}>
        34 Elm Street · Northampton · Massachusetts
      </Micro>
    </Sheet>
  )
}

/**
 * The back: the shop's seal - the plate inside a ring of small capitals -
 * with the name under it and the one line the shop allows itself, in
 * italics. A seal is what the expensive bags carry on the reverse when they
 * carry anything at all.
 */
export function BagBack({ material }: { material: string }) {
  const { ink, accent } = shop(material)
  const t = materialTone(material)
  return (
    <Sheet tone={t} style={{ flexDirection: 'column', alignItems: 'center', padding: '17cqw 10cqw 7cqw', color: ink, textAlign: 'center' }}>
      <RoundSeal
        size="34cqw"
        legend="MARIGOLD & MOSS · FLEURISTE · EST. 2016 · "
        color={ink}
        ring={false}
        center={<Plate src={MARIGOLD} ink={ink} style={{ width: '100%', height: '100%' }} />}
      />
      <div style={{ marginTop: '7cqw' }}>
        <Wordmark accent={accent} size="3.6cqw" />
      </div>
      <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '3.8cqw', lineHeight: 1.3, marginTop: '5cqw', opacity: 0.85 }}>
        Grown slow. Cut this morning.
        <br />
        Wrapped by hand.
      </div>
      <div style={{ flex: 1, minHeight: '6cqw' }} />
      <Micro style={{ fontSize: '1.8cqw', letterSpacing: '0.36em', paddingLeft: '0.36em', opacity: 0.72, fontWeight: 500, whiteSpace: 'nowrap' }}>
        Flowers · Plants · Workshops · marigoldandmoss.com
      </Micro>
    </Sheet>
  )
}
