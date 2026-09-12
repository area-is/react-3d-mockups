'use client'

import type { CSSProperties, ReactNode } from 'react'
import { FONT, INK, Micro, PAPER, Sheet, materialTone } from './swiss-art'
import { JetPrint, NutritionFacts, Photo, Pill, RecycleMark, RoundSeal, SERIF, UpcA } from './label-art'
import { asset } from '@/lib/base-path.mjs'

/**
 * The milk carton's print, modelled on the half-gallon of whole milk in a US
 * grocery case: the red band a shelf reads as "whole" (blue is 2 %, green 1 %,
 * purple fat-free), the dairy's badge on it, "Vitamin D" in a pill, the farm
 * painting every carton has had since the fifties (a generated gouache, see
 * `/art/milk-farm.webp`), "HALF GALLON (1.89 L)" set large across the foot. The sides carry what the FDA and the co-op put
 * there: the Nutrition Facts panel rule for rule, the ingredient line, the
 * rBST pledge and its mandatory disclaimer, a scannable UPC-A, and on the
 * other side the story of the farms. The back sells the rest of the range
 * and the roof carries the sell-by date the filling line jets on next to the
 * cap. Nothing here is a poster stuck to a carton; it is what the carton is.
 *
 * Every panel prints straight onto the board (`materialTone`), so the
 * carousel's finish swatches change the carton the print sits on, the way a
 * brand's white and kraft variants do. The brand colours are solid inks and
 * stay put; the small print flips to white ink on a dark board.
 *
 * Measurements are in `cqw` against the panel's own width: 3cqw on a 95 mm
 * face is 2.9 mm of type, which is what a carton's small print is set at.
 */

/** The dairy's inks. Red is the US whole-milk band; navy is the house colour. */
const RED = '#c2182f'
const NAVY = '#1d3557'
const CREAM = '#fff8ea'

/** Ink for the small print: the house navy on a light board, white ink on a dark one. */
function dairyInk(material: string): { ink: string; onInk: string; dark: boolean } {
  const dark = materialTone(material).text !== INK
  return { ink: dark ? PAPER : NAVY, onInk: dark ? INK : CREAM, dark }
}

/** A wall of the carton: the board as the container, the print laid out inside it. */
function Face({ material, style, children }: { material: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <Sheet
      tone={materialTone(material)}
      style={{ flexDirection: 'column', padding: '5cqw', gap: '2.4cqw', color: dairyInk(material).ink, ...style }}
    >
      {children}
    </Sheet>
  )
}

const body = (size = '3.3cqw', extra?: CSSProperties): CSSProperties => ({
  margin: 0,
  fontSize: size,
  lineHeight: 1.36,
  ...extra,
})

/* ------------------------------------------------------------------ */
/*  Pieces                                                             */
/* ------------------------------------------------------------------ */

/**
 * The dairy's badge: an oval, the name in serifs and "DAIRY" spaced out under
 * it - the shape a co-op has had on its trucks since before it had a website.
 * `size` is the width in cqw; everything inside is a fraction of it.
 */
function Badge({ size, onBand }: { size: number; onBand?: boolean }) {
  return (
    <div
      style={{
        width: `${size}cqw`,
        height: `${size * 0.52}cqw`,
        borderRadius: '50%',
        background: CREAM,
        border: `${size * 0.016}cqw solid ${onBand ? CREAM : RED}`,
        boxShadow: onBand ? `0 0 0 ${size * 0.02}cqw ${RED}` : `inset 0 0 0 ${size * 0.012}cqw ${CREAM}, inset 0 0 0 ${size * 0.024}cqw ${RED}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: NAVY,
        flex: 'none',
        lineHeight: 1,
      }}
    >
      <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: `${size * 0.19}cqw`, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
        Harlow Valley
      </span>
      <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: `${size * 0.075}cqw`, letterSpacing: '0.34em', marginTop: `${size * 0.05}cqw`, color: RED }}>
        DAIRY
      </span>
      <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: `${size * 0.055}cqw`, letterSpacing: '0.18em', marginTop: `${size * 0.035}cqw`, opacity: 0.75 }}>
        EST. 1948 · VERMONT
      </span>
    </div>
  )
}

/** One of the range on the back: a gable-top with the band colour a shelf sorts by. */
function MiniCarton({ color, pct, label, ink }: { color: string; pct: string; label: string; ink: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.6cqw', minWidth: 0 }}>
      <svg viewBox="0 0 60 104" style={{ width: '70%', display: 'block' }} aria-hidden>
        <path d="M8 30L30 12l22 18v72H8z" fill="#fbfaf5" stroke={ink} strokeWidth={1.4} strokeLinejoin="round" />
        <path d="M8 30h44" stroke={ink} strokeWidth={1} />
        <rect x={26} y={7} width={8} height={6} rx={1} fill="#fbfaf5" stroke={ink} strokeWidth={1.2} />
        <rect x={8.7} y={30.7} width={42.6} height={17} fill={color} />
        <text x={30} y={72} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={20} fill={color} letterSpacing={-1}>
          {pct}
        </text>
        <text x={30} y={86} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={7} fill={ink} letterSpacing={1.4}>
          MILK
        </text>
      </svg>
      <Micro style={{ fontSize: '2.5cqw', textAlign: 'center', lineHeight: 1.2 }}>{label}</Micro>
    </div>
  )
}

/** A mug of cocoa, steaming - the back's serving suggestion. */
function Mug({ ink }: { ink: string }) {
  return (
    <svg viewBox="0 0 80 90" style={{ display: 'block', width: '100%', height: '100%' }} aria-hidden>
      <g fill="none" stroke={ink} strokeWidth={2.2} strokeLinecap="round">
        <path d="M30 6c-4 6 4 10 0 16" opacity={0.55} />
        <path d="M42 4c-4 6 4 10 0 16" opacity={0.55} />
        <path d="M54 8c-4 6 4 10 0 16" opacity={0.55} />
      </g>
      <path d="M14 30h52v34a14 14 0 0 1-14 14H28a14 14 0 0 1-14-14z" fill="#fbfaf5" stroke={ink} strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M66 38h6a8 8 0 0 1 0 16h-6" fill="none" stroke={ink} strokeWidth={2.4} />
      <path d="M17 33h46v6H17z" fill="#6b3a1e" />
      <g fill="#fffdf6" stroke="#d8d2c4" strokeWidth={0.8}>
        <circle cx={30} cy={36} r={4.2} />
        <circle cx={40} cy={35} r={4.6} />
        <circle cx={50} cy={36.5} r={4} />
      </g>
      <rect x={20} y={48} width={40} height={18} rx={2} fill={RED} opacity={0.9} />
      <text x={40} y={60} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={8} fill={CREAM} letterSpacing={1}>
        HARLOW
      </text>
    </svg>
  )
}

/** A tick-list line: the pledges a carton makes on its side. */
function Tick({ children, color }: { children: ReactNode; color: string }) {
  return (
    <li style={{ display: 'flex', gap: '2.2cqw', alignItems: 'baseline' }}>
      <svg viewBox="0 0 20 20" style={{ width: '3.6cqw', height: '3.6cqw', flex: 'none', transform: 'translateY(0.3cqw)' }} aria-hidden>
        <circle cx={10} cy={10} r={9} fill={color} />
        <path d="M5.5 10.5l3 3 6-7" fill="none" stroke={CREAM} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{children}</span>
    </li>
  )
}

/* ------------------------------------------------------------------ */
/*  Faces                                                              */
/* ------------------------------------------------------------------ */

/** The front: the red band and badge, "Whole Milk", the farm, the size. */
export function CartonFront({ material }: { material: string }) {
  const { ink, onInk } = dairyInk(material)
  return (
    <Face material={material} style={{ padding: 0, gap: 0 }}>
      <div
        style={{
          background: RED,
          color: CREAM,
          padding: '3.6cqw 6cqw 4.4cqw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2.6cqw',
          flex: 'none',
        }}
      >
        <Micro style={{ fontSize: '2.6cqw', letterSpacing: '0.26em' }}>Grade A · Pasteurized · Homogenized</Micro>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3.5cqw' }}>
          <RoundSeal
            size="13cqw"
            legend="GRADE A · PASTEURIZED · "
            color={CREAM}
            ring={false}
            center={<span style={{ fontFamily: SERIF, fontSize: '6cqw', lineHeight: 1 }}>A</span>}
          />
          <Badge size={52} onBand />
          <RoundSeal
            size="13cqw"
            legend="FARMER OWNED · VERMONT · "
            color={CREAM}
            ring={false}
            center={<span style={{ fontSize: '2.2cqw', fontWeight: 800, letterSpacing: '0.08em' }}>CO-OP</span>}
          />
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '4cqw 6cqw 4.5cqw', gap: '2.4cqw' }}>
        <div style={{ textAlign: 'center' }}>
          <Pill color={ink} ink={onInk} size="2.9cqw">
            Vitamin D
          </Pill>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: '19.5cqw',
              lineHeight: 0.9,
              letterSpacing: '-0.045em',
              color: RED,
              marginTop: '2.2cqw',
            }}
          >
            Whole
            <br />
            Milk
          </div>
          <Micro style={{ fontSize: '2.7cqw', display: 'block', marginTop: '1.8cqw', letterSpacing: '0.24em' }}>3.25 % Milkfat · Ultra-pasteurized</Micro>
        </div>
        <div style={{ flex: 1, minHeight: 0, borderRadius: '3cqw', overflow: 'hidden', margin: '0.6cqw 0' }}>
          <Photo src={asset('/art/milk-farm.webp')} position="50% 58%" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '3cqw' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '8.6cqw', letterSpacing: '-0.035em', lineHeight: 1 }}>HALF GALLON</div>
            <div style={{ fontSize: '3.6cqw', fontWeight: 600, marginTop: '1.2cqw', letterSpacing: '0.02em' }}>(1.89 L) · 64 FL OZ</div>
          </div>
          <RoundSeal
            size="17cqw"
            legend="FARMER OWNED · SINCE 1948 · "
            color={ink}
            center={
              <span style={{ fontSize: '3cqw', fontWeight: 800, letterSpacing: '0.02em' }}>
                rBST
                <br />
                FREE*
              </span>
            }
          />
        </div>
        <Micro style={{ fontSize: '2.4cqw', opacity: 0.72, textAlign: 'center' }}>Keep refrigerated · Sell by date on top</Micro>
      </div>
    </Face>
  )
}

/** The right side: Nutrition Facts, ingredients, storage, the pledge, the UPC. */
export function CartonFacts({ material }: { material: string }) {
  const { ink } = dairyInk(material)
  return (
    <Face material={material} style={{ gap: '2cqw' }}>
      <NutritionFacts
        fontSize="2.6cqw"
        servings="8"
        servingSize="1 cup (240mL)"
        calories="150"
        rows={[
          { label: 'Total Fat', amount: '8g', dv: '10%', bold: true },
          { label: 'Saturated Fat', amount: '5g', dv: '25%', indent: 1 },
          { label: 'Trans Fat', amount: '0g', indent: 1 },
          { label: 'Cholesterol', amount: '35mg', dv: '12%', bold: true },
          { label: 'Sodium', amount: '125mg', dv: '5%', bold: true },
          { label: 'Total Carbohydrate', amount: '12g', dv: '4%', bold: true },
          { label: 'Dietary Fiber', amount: '0g', dv: '0%', indent: 1 },
          { label: 'Total Sugars', amount: '12g', indent: 1 },
          { label: 'Includes 0g Added Sugars', amount: '', dv: '0%', indent: 2 },
          { label: 'Protein', amount: '8g', dv: '16%', bold: true },
        ]}
        micros={[
          { label: 'Vitamin D', amount: '2.5mcg', dv: '15%' },
          { label: 'Calcium', amount: '300mg', dv: '25%' },
          { label: 'Iron', amount: '0mg', dv: '0%' },
          { label: 'Potassium', amount: '380mg', dv: '8%' },
          { label: 'Vitamin A', amount: '90mcg', dv: '10%' },
        ]}
      />
      <p style={body('3cqw')}>
        <strong>INGREDIENTS:</strong> GRADE A MILK, VITAMIN D3.
      </p>
      <p style={body('3cqw')}>
        <strong>KEEP REFRIGERATED.</strong> Sell by date on top. For best taste use within 7 days of opening.
      </p>
      <p style={body('2.5cqw', { opacity: 0.8 })}>
        *Our farmers pledge not to use artificial growth hormones. No significant difference has been shown
        between milk derived from rBST-treated and non-rBST-treated cows.
      </p>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '3cqw' }}>
        {/* A scanner wants dark bars on a light ground whatever the board, so the
            code prints on its own white patch - as it does on a kraft carton. */}
        <div style={{ background: '#ffffff', padding: '1.6cqw 1.2cqw 0.4cqw', width: '36cqw', boxSizing: 'border-box', flex: 'none' }}>
          <UpcA digits="07123456789" color="#111111" />
        </div>
        <RecycleMark
          color={ink}
          size="7.5cqw"
          label={
            <Micro style={{ fontSize: '2.3cqw', lineHeight: 1.25 }}>
              Please
              <br />
              recycle
            </Micro>
          }
        />
      </div>
      <Micro style={{ fontSize: '2.35cqw', opacity: 0.78 }}>Distributed by Harlow Valley Dairy Co-op · Harlow, VT 05468 · Plant 50-2117</Micro>
    </Face>
  )
}

/** The left side: where the milk is from, and what the farmers promise. */
export function CartonStory({ material }: { material: string }) {
  const { ink } = dairyInk(material)
  return (
    <Face material={material} style={{ gap: '2.6cqw' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Micro style={{ color: RED, fontSize: '2.8cqw' }}>Our farmers&apos; pledge</Micro>
        <Micro style={{ fontSize: '2.8cqw', opacity: 0.72 }}>Harlow, Vermont</Micro>
      </div>
      <div style={{ fontFamily: SERIF, fontSize: '9cqw', lineHeight: 1.05, letterSpacing: '-0.015em' }}>
        From 60 family farms, all within 100 miles of our creamery.
      </div>
      <p style={body('3.4cqw')}>
        Every drop in this carton comes from cows raised on pasture by families we know by name. Our trucks
        make the rounds each morning and the milk is bottled the same day, so it reaches your table the way
        it left the farm.
      </p>
      <div style={{ flex: 1, minHeight: 0, borderRadius: '3cqw', overflow: 'hidden' }}>
        {/* The herd, zoomed out of the same painting the front shows the glass in. */}
        <Photo src={asset('/art/milk-farm.webp')} position="50% 50%" style={{ transform: 'scale(1.75)', transformOrigin: '76% 47%' }} />
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '1.6cqw', ...body('3.3cqw', { fontWeight: 600 }) }}>
        <Tick color={RED}>No artificial growth hormones*</Tick>
        <Tick color={RED}>Pasture-raised, Grade A</Tick>
        <Tick color={RED}>Farmer owned since 1948</Tick>
      </ul>
      <p style={body('2.5cqw', { opacity: 0.8 })}>
        *No significant difference has been shown between milk derived from rBST-treated and non-rBST-treated
        cows.
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '2cqw' }}>
        <Micro style={{ fontSize: '2.5cqw' }}>harlowvalleydairy.com</Micro>
        <Micro style={{ fontSize: '2.5cqw', opacity: 0.72 }}>Questions? 1-800-555-0148</Micro>
      </div>
    </Face>
  )
}

/** The back: the rest of the range, and the fun facts for whoever is reading at breakfast. */
export function CartonBack({ material }: { material: string }) {
  const { ink } = dairyInk(material)
  const facts = [
    'A dairy cow drinks up to 50 gallons of water a day - a bathtub’s worth.',
    'One glass of milk has as much calcium as ten cups of raw spinach.',
    'Milk is about 87 % water. The other 13 % is the fat, protein, sugar and minerals you drink it for.',
  ]
  return (
    <Face material={material} style={{ gap: '2.6cqw' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Micro style={{ color: RED, fontSize: '2.8cqw' }}>Also from Harlow Valley</Micro>
        <Micro style={{ fontSize: '2.8cqw', opacity: 0.72 }}>Look for the colour</Micro>
      </div>
      <div style={{ fontFamily: SERIF, fontSize: '9cqw', lineHeight: 1.05, letterSpacing: '-0.015em' }}>
        Something for everyone at the table.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3cqw', alignItems: 'end', padding: '1cqw 2cqw 0' }}>
        <MiniCarton color="#1a5fb4" pct="2%" label="Reduced fat" ink={ink} />
        <MiniCarton color="#2e8b57" pct="1%" label="Lowfat" ink={ink} />
        <MiniCarton color="#6b3fa0" pct="0%" label="Fat free" ink={ink} />
      </div>
      <div
        style={{
          border: `0.5cqw solid ${ink}`,
          borderRadius: '3cqw',
          padding: '3.4cqw 4cqw 3.8cqw',
          display: 'grid',
          gap: '2cqw',
        }}
      >
        <Micro style={{ color: RED, fontSize: '2.8cqw' }}>Did you know?</Micro>
        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '1.8cqw' }}>
          {facts.map((fact, i) => (
            <li key={fact} style={{ display: 'flex', gap: '2.4cqw', ...body('3.2cqw') }}>
              <span style={{ color: RED, fontWeight: 800, fontVariantNumeric: 'tabular-nums', flex: 'none' }}>{i + 1}</span>
              <span>{fact}</span>
            </li>
          ))}
        </ol>
      </div>
      <div style={{ display: 'flex', gap: '3.5cqw', alignItems: 'stretch', padding: '0.6cqw 0.5cqw 0' }}>
        <div style={{ flex: 1, display: 'grid', gap: '1.8cqw', alignContent: 'start' }}>
          <Micro style={{ color: RED, fontSize: '2.8cqw' }}>Serving suggestion</Micro>
          <div style={{ fontFamily: SERIF, fontSize: '6.6cqw', lineHeight: 1, letterSpacing: '-0.01em' }}>Hot cocoa for two</div>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '1.4cqw' }}>
            {[
              'Warm 2 cups of whole milk over low heat. Never let it boil.',
              'Whisk in 3 tbsp cocoa and 2 tbsp sugar until smooth.',
              'Pour, top with marshmallows, and hand one over.',
            ].map((step, i) => (
              <li key={step} style={{ display: 'flex', gap: '2.2cqw', ...body('3.1cqw') }}>
                <span style={{ color: RED, fontWeight: 800, fontVariantNumeric: 'tabular-nums', flex: 'none' }}>{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div style={{ width: '24cqw', flex: 'none' }}>
          <Mug ink={ink} />
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '3cqw' }}>
        <Badge size={34} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1.4cqw', textAlign: 'right' }}>
          <RecycleMark color={ink} size="6cqw" />
          <Micro style={{ fontSize: '2.3cqw', opacity: 0.78, lineHeight: 1.3 }}>
            Paperboard carton · Cap 2 HDPE
            <br />
            Recycle where facilities exist
          </Micro>
        </div>
      </div>
    </Face>
  )
}

/**
 * The front roof panel, the cap sitting in the middle of it: the sell-by
 * date and the plant code, jetted on above the cap in the dot-matrix the
 * filling line prints with, and the carton's name along the eave below it.
 */
export function CartonRoof({ material }: { material: string }) {
  const { ink } = dairyInk(material)
  return (
    <Sheet tone={materialTone(material)} style={{ color: ink, flexDirection: 'column', justifyContent: 'space-between', padding: '3cqw 5cqw 3.2cqw' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Micro style={{ fontSize: '2.4cqw', opacity: 0.72 }}>Sell by</Micro>
          <JetPrint color={ink} size="4.8cqw" style={{ marginTop: '0.6cqw' }}>
            OCT 03 26
          </JetPrint>
        </div>
        <JetPrint color={ink} size="3.4cqw" style={{ textAlign: 'right' }}>
          {'PLT 50-2117\n04:12 A'}
        </JetPrint>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Micro style={{ fontSize: '2.4cqw' }}>Harlow Valley · Vitamin D Whole Milk</Micro>
        <Micro style={{ fontSize: '2.4cqw', opacity: 0.72 }}>Twist cap to open</Micro>
      </div>
    </Sheet>
  )
}
