'use client'

import type { CSSProperties, ReactNode } from 'react'
import { FONT, INK, Micro, PAPER, Sheet, materialTone } from './swiss-art'
import { JetPrint, NutritionFacts, Photo, Pill, RecycleMark, RoundSeal, SERIF, UpcA } from './label-art'

/**
 * The packaging on the carousel, each modelled on the real thing it stands
 * in for rather than on a poster:
 *
 * - the product box is a cereal box - the 190 × 265 × 55 mm blank IS the
 *   cereal-box proportion - with the brand tab, the bowl, the seals, the net
 *   weight across the foot and the Nutrition Facts down the side;
 * - the mailer box is a direct-to-consumer shipper, one colour of ink on
 *   corrugate: the brand across the lid, the handling pictograms along the
 *   foot and down the ends, the tape crossing the middle the way tape does;
 * - the shopping bag is a bookshop's kraft carrier: a seal, the name in
 *   serifs, the address along the bottom.
 *
 * All of them print straight onto the material (`materialTone`), so the
 * carousel's finish swatches change the board under the print: white board,
 * kraft, a black box with white ink. The brand colours are solid inks and
 * stay put; the type flips to white ink on a dark board.
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
        <Photo src="/art/cereal-bowl.webp" fit="contain" style={{ position: 'absolute', inset: '1% 3%', width: '94%', height: '98%' }} />
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
        <Photo src="/art/cereal-clusters.webp" fit="contain" />
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

/** One of the range on the back, as a small front. */
function MiniBox({ color, name, sub, ink }: { color: string; name: string; sub: string; ink: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.4cqw', minWidth: 0 }}>
      <svg viewBox="0 0 60 84" style={{ width: '56%', display: 'block' }} aria-hidden>
        <rect x={2} y={2} width={56} height={80} rx={2} fill="#fbfaf5" stroke={ink} strokeWidth={1.3} />
        <rect x={2.7} y={2.7} width={54.6} height={20} fill={color} />
        <circle cx={30} cy={52} r={16} fill={color} opacity={0.18} />
        <ellipse cx={30} cy={52} rx={14} ry={5} fill="#f1ede3" stroke="#d8d2c4" strokeWidth={0.8} />
        <ellipse cx={30} cy={52} rx={11} ry={3.2} fill="#fffdf6" />
        {[22, 28, 34, 38].map((x, i) => (
          <ellipse key={x} cx={x} cy={51 + (i % 2)} rx={2.6} ry={2} fill={i % 2 ? '#e8a63b' : '#d68a2c'} />
        ))}
        <path d="M30 52q0 16 0 20" stroke="none" />
        <rect x={6} y={72} width={48} height={4} rx={1} fill={ink} opacity={0.35} />
      </svg>
      <Micro style={{ fontSize: '2.4cqw', textAlign: 'center', lineHeight: 1.25 }}>
        {name}
        <br />
        <span style={{ opacity: 0.7 }}>{sub}</span>
      </Micro>
    </div>
  )
}

/** A parfait glass, layered - the back's recipe picture. */
function Parfait({ p }: { p: Mill }) {
  return (
    <svg viewBox="0 0 80 120" style={{ display: 'block', width: '100%', height: '100%' }} aria-hidden>
      <path d="M16 6h48l-6 100H22z" fill="#eaf3fa" stroke="#b9d5e8" strokeWidth={1.5} />
      <path d="M19 34h42l-1.3 22H20.3z" fill="#fffdf6" />
      <path d="M20.3 56h39.4l-1.3 20H21.6z" fill="#d68a2c" />
      <path d="M21.6 76h36.8l-1.2 18H22.8z" fill="#fffdf6" />
      <path d="M22.8 94h34.4l-.8 12H23.6z" fill="#b83a63" />
      <g fill="#b83a63">
        <circle cx={30} cy={26} r={4.5} />
        <circle cx={41} cy={22} r={5} />
        <circle cx={52} cy={27} r={4.2} />
      </g>
      <g fill="#e8a63b">
        <ellipse cx={28} cy={64} rx={3.4} ry={2.6} />
        <ellipse cx={40} cy={68} rx={3.6} ry={2.8} />
        <ellipse cx={52} cy={63} rx={3.2} ry={2.5} />
      </g>
      <path d="M40 8v8" stroke={p.honey} strokeWidth={3} strokeLinecap="round" />
      <path d="M22 12v86" stroke="#ffffff" strokeWidth={3} opacity={0.65} strokeLinecap="round" />
    </svg>
  )
}

/** The back: a recipe, the rest of the range, the small print. */
export function CerealBack({ material }: { material: string }) {
  const p = mill(material)
  return (
    <BoxFace material={material} style={{ gap: '2.6cqw' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2cqw' }}>
        <BrandTab p={p} size={2.7} />
        <Micro style={{ fontSize: '2.6cqw', opacity: 0.75 }}>Good mornings start here</Micro>
      </div>
      <div style={{ fontFamily: SERIF, fontSize: '8cqw', lineHeight: 1.04, letterSpacing: '-0.015em' }}>
        Breakfast, sorted. Try it layered.
      </div>
      <div
        style={{
          border: `0.45cqw solid ${p.ink}`,
          borderRadius: '2.5cqw',
          padding: '3.4cqw 3.8cqw',
          display: 'grid',
          gridTemplateColumns: '1fr 24cqw',
          gap: '3cqw',
          alignItems: 'stretch',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2cqw' }}>
          <Micro style={{ fontSize: '2.6cqw', color: p.red }}>Recipe · 5 minutes · serves 1</Micro>
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '6.4cqw', lineHeight: 1, color: p.amber }}>Honey Oat Parfait</div>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '1.4cqw' }}>
            {[
              'Spoon ½ cup of yogurt into a tall glass.',
              'Add a handful of clusters and a few berries.',
              'Repeat, then finish with a drizzle of honey.',
              'Eat it before the clusters go soft. They won’t take long.',
            ].map((step, i) => (
              <li key={step} style={{ display: 'flex', gap: '2.2cqw', ...copy('3cqw', { lineHeight: 1.32 }) }}>
                <span style={{ color: p.red, fontWeight: 900, fontVariantNumeric: 'tabular-nums', flex: 'none' }}>{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div style={{ minHeight: 0 }}>
          <Parfait p={p} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '1cqw' }}>
        <Micro style={{ fontSize: '2.6cqw', color: p.red }}>Also from Ridgeway Mills</Micro>
        <Micro style={{ fontSize: '2.4cqw', opacity: 0.72 }}>Look for the green tab</Micro>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3cqw', padding: '0 3cqw' }}>
        <MiniBox color="#c8322b" name="Cinnamon Crunch" sub="Toasted oats · cinnamon" ink={p.ink} />
        <MiniBox color="#6b3fa0" name="Berry Clusters" sub="Blueberry · cranberry" ink={p.ink} />
        <MiniBox color="#7a4a1e" name="Maple Pecan" sub="Real maple · pecans" ink={p.ink} />
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '3cqw' }}>
        <Micro style={{ fontSize: '2.3cqw', opacity: 0.75, lineHeight: 1.35 }}>
          Ridgeway Mills · Lewiston, ID 83501 · ridgewaymills.com
          <br />
          Made in the USA with domestic and imported ingredients
        </Micro>
        <RecycleMark
          color={p.ink}
          size="6cqw"
          label={
            <Micro style={{ fontSize: '2.2cqw', lineHeight: 1.3 }}>
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

/** A frond - the candle company's mark, cut in one colour. */
function Fern({ color, style }: { color: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 40 60" style={{ display: 'block', ...style }} aria-hidden>
      <path d="M20 58C18 40 18 22 24 4" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i} fill={color}>
          <path d={`M${19.6 - i * 0.3} ${48 - i * 7.5}c-7-1-11-5-13-11 6 1 11 5 13 11z`} opacity={0.95 - i * 0.05} />
          <path d={`M${20.4 - i * 0.2} ${45 - i * 7.5}c7-2 11-6 12-12-6 2-10 6-12 12z`} opacity={0.95 - i * 0.05} />
        </g>
      ))}
    </svg>
  )
}

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
 * The brand sits above the tape, the handling marks below it, and the
 * header and the small print keep to the edges - the way a real shipper is
 * laid out around the tape it knows is coming.
 */
export function MailerLid({ material }: { material: string }) {
  const ink = materialTone(material).text
  const marks = [
    ['fragile', 'Fragile'],
    ['up', 'This way up'],
    ['dry', 'Keep dry'],
  ] as const
  return (
    <ShipperFace material={material} style={{ display: 'grid', gridTemplateRows: '1fr 24% 1fr', padding: '4.6cqw 6cqw 4.4cqw' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '3cqw' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.3cqw' }}>
            <Fern color={ink} style={{ height: '4.4cqw', width: 'auto' }} />
            <Micro style={{ fontSize: '1.85cqw', whiteSpace: 'nowrap' }}>Fernhaven Candle Co.</Micro>
          </div>
          <Micro style={{ fontSize: '1.85cqw', whiteSpace: 'nowrap', opacity: 0.7 }}>Burlington, Vermont</Micro>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: SERIF, fontSize: '13cqw', lineHeight: 0.9, letterSpacing: '-0.02em' }}>Fernhaven</div>
          <Micro style={{ fontSize: '1.9cqw', display: 'block', marginTop: '2.2cqw', whiteSpace: 'nowrap', letterSpacing: '0.32em' }}>
            Hand-poured candles · Small batch · Since 2019
          </Micro>
        </div>
      </div>
      {/* the tape's lane, left clear */}
      <div />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10cqw' }}>
          {marks.map(([kind, label]) => (
            <div key={kind} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5cqw' }}>
              <Pictogram kind={kind} color={ink} size="7.4cqw" />
              <Micro style={{ fontSize: '1.8cqw', whiteSpace: 'nowrap' }}>{label}</Micro>
            </div>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5cqw' }}>
            <RecycleMark color={ink} size="7cqw" />
            <Micro style={{ fontSize: '1.8cqw', whiteSpace: 'nowrap' }}>Recycle</Micro>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '3cqw' }}>
          <Micro style={{ fontSize: '1.7cqw', whiteSpace: 'nowrap', opacity: 0.7 }}>100% recycled corrugate · Soy ink · Reuse, then recycle</Micro>
          <Micro style={{ fontSize: '1.7cqw', whiteSpace: 'nowrap', opacity: 0.7 }}>fernhaven.co</Micro>
        </div>
      </div>
    </ShipperFace>
  )
}

/** The long front: the name and the mark, at shelf height. */
export function MailerFront({ material }: { material: string }) {
  const ink = materialTone(material).text
  return (
    <ShipperFace material={material} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '3cqw 4.5cqw', gap: '3cqw' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.2cqw', flex: 'none' }}>
        <Fern color={ink} style={{ height: '12cqw', width: 'auto' }} />
        <div style={{ fontFamily: SERIF, fontSize: '8cqw', lineHeight: 0.9, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>Fernhaven</div>
      </div>
      <div style={{ textAlign: 'right', display: 'grid', gap: '1.2cqw', minWidth: 0 }}>
        <Micro style={{ fontSize: '1.6cqw', whiteSpace: 'nowrap' }}>Hand-poured candles &amp; home goods</Micro>
        <Micro style={{ fontSize: '1.6cqw', opacity: 0.72, whiteSpace: 'nowrap' }}>fernhaven.co · Burlington, Vermont</Micro>
      </div>
    </ShipperFace>
  )
}

/** An end panel: the pictograms either side of where the tape wraps down. */
export function MailerEnd({ material }: { material: string }) {
  const ink = materialTone(material).text
  return (
    <ShipperFace material={material} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '4cqw 6cqw' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.8cqw' }}>
        <Pictogram kind="fragile" color={ink} size="15cqw" />
        <Micro style={{ fontSize: '2.8cqw' }}>Fragile</Micro>
      </div>
      <Fern color={ink} style={{ height: '18cqw', width: 'auto', opacity: 0.9 }} />
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

/**
 * The florist's mark: a loose bunch drawn in one line - a poppy, a stem of
 * eucalyptus, an allium head and a few grasses - the botanical line drawing
 * a flower shop prints on everything it hands over the counter.
 */
function Bunch({ color, style }: { color: string; style?: CSSProperties }) {
  const line = { fill: 'none', stroke: color, strokeWidth: 2.1, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const leaf = (x: number, y: number, rot: number, len = 26) => (
    <path key={`${x}-${y}-${rot}`} d={`M0 0c${len * 0.3} -${len * 0.5} ${len * 0.75} -${len * 0.5} ${len} 0c-${len * 0.25} ${len * 0.5} -${len * 0.7} ${len * 0.5} -${len} 0z`} transform={`translate(${x} ${y}) rotate(${rot})`} {...line} />
  )
  return (
    <svg viewBox="0 0 220 250" style={{ display: 'block', ...style }} aria-hidden>
      {/* stems, gathered at the foot */}
      <path d="M110 248C104 200 106 150 104 96" {...line} />
      <path d="M112 248C90 210 74 170 70 118" {...line} />
      <path d="M108 248C136 206 150 170 148 112" {...line} />
      <path d="M114 248C126 214 142 190 172 172" {...line} strokeWidth={1.6} />
      <path d="M106 248C84 226 62 212 40 208" {...line} strokeWidth={1.6} />
      {/* eucalyptus down the left stem */}
      {[
        [76, 200, -20],
        [64, 178, -40],
        [80, 160, 10],
        [66, 138, -30],
        [80, 122, 20],
      ].map(([x, y, r]) => (
        <circle key={`e${x}${y}`} cx={x} cy={y} r={8} transform={`rotate(${r} ${x} ${y})`} {...line} strokeWidth={1.8} />
      ))}
      {/* the poppy on the centre stem */}
      <g transform="translate(104 78)">
        <path d="M0-30c14-6 26 4 24 16-2 14-14 20-24 14-10 6-22 0-24-14-2-12 10-22 24-16z" {...line} />
        <path d="M-10-8c6-8 14-8 20 0M-8 4c4 6 12 6 16 0" {...line} strokeWidth={1.6} />
        <circle cx={0} cy={-1} r={4} fill={color} />
        {[-24, -10, 6, 20].map((a) => (
          <path key={a} d={`M0 -1 l ${Math.cos((a * Math.PI) / 180) * 9} ${Math.sin((a * Math.PI) / 180) * 9 - 9}`} {...line} strokeWidth={1.3} />
        ))}
      </g>
      {/* leaves on the centre stem */}
      {leaf(96, 150, -150, 24)}
      {leaf(108, 176, 20, 26)}
      {/* the allium on the right stem */}
      <g transform="translate(148 96)">
        <circle cx={0} cy={0} r={22} {...line} strokeWidth={1.4} strokeDasharray="2 5" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180
          return <circle key={i} cx={Math.cos(a) * 15} cy={Math.sin(a) * 15} r={2.2} fill={color} />
        })}
        <circle cx={0} cy={0} r={2.4} fill={color} />
      </g>
      {/* grasses */}
      <path d="M172 172c8-14 10-28 6-44" {...line} strokeWidth={1.4} />
      <path d="M178 128l-3 5M181 137l-4 5M176 118l-3 5" {...line} strokeWidth={1.3} />
      <path d="M40 208c-6-12-4-24 4-34" {...line} strokeWidth={1.4} />
      <circle cx={44} cy={174} r={3} fill={color} />
      <circle cx={38} cy={186} r={2.4} fill={color} />
      {/* the tie */}
      <path d="M100 236c6-4 14-4 20 0M100 240c6 4 14 4 20 0" {...line} strokeWidth={1.6} />
    </svg>
  )
}

/** The front: the bunch, the name in serifs, the shop's address along the foot. */
export function BagFront({ material }: { material: string }) {
  const { ink, accent } = shop(material)
  const t = materialTone(material)
  return (
    <Sheet tone={t} style={{ flexDirection: 'column', alignItems: 'center', padding: '12cqw 9cqw 6.5cqw', color: ink, textAlign: 'center' }}>
      <Bunch color={ink} style={{ width: '46cqw', height: 'auto', flex: 'none' }} />
      <div style={{ fontFamily: SERIF, fontSize: '13.5cqw', lineHeight: 0.98, letterSpacing: '-0.02em', marginTop: '3cqw' }}>
        Marigold
        <br />
        <span style={{ fontStyle: 'italic', color: accent }}>&amp;</span> Moss
      </div>
      <Micro style={{ fontSize: '2.8cqw', marginTop: '3.6cqw', letterSpacing: '0.3em' }}>Flowers · Plants · Workshops</Micro>
      <div style={{ flex: 1, minHeight: '5cqw' }} />
      <div style={{ display: 'grid', gap: '2cqw' }}>
        <Micro style={{ fontSize: '2.7cqw' }}>34 Elm Street · Northampton, Mass.</Micro>
        <Micro style={{ fontSize: '2.7cqw', opacity: 0.72 }}>marigoldandmoss.com · Tue–Sun 9–6</Micro>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.8cqw', marginTop: '1.2cqw' }}>
          <RecycleMark color={ink} size="4.4cqw" />
          <Micro style={{ fontSize: '2.3cqw', opacity: 0.72 }}>Unbleached kraft · Please reuse me</Micro>
        </div>
      </div>
    </Sheet>
  )
}

/** The back: what the shop prints on the other side of the bag. */
export function BagBack({ material }: { material: string }) {
  const { ink, accent } = shop(material)
  const t = materialTone(material)
  return (
    <Sheet tone={t} style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16cqw 11cqw 9cqw', color: ink, textAlign: 'center', gap: '5cqw' }}>
      <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '8.4cqw', lineHeight: 1.2 }}>
        Grown slow.
        <br />
        Cut this morning.
        <br />
        Wrapped with care.
      </div>
      <Micro style={{ fontSize: '2.9cqw', color: accent, letterSpacing: '0.3em' }}>Est. 2016</Micro>
      <div style={{ flex: 1 }} />
      <Bunch color={ink} style={{ width: '30cqw', height: 'auto', opacity: 0.9 }} />
    </Sheet>
  )
}
