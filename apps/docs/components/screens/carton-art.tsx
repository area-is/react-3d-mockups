'use client'

import type { CSSProperties, ReactNode } from 'react'
import { FONT, INK, Micro, PAPER, Sheet, materialTone } from './swiss-art'
import { JetPrint, NutritionFacts, Photo, RecycleMark, RoundSeal, UpcA } from './label-art'
import { asset } from '@/lib/base-path.mjs'

/**
 * The milk carton's print, modelled on the organic half-gallon the Nordic
 * dairies put on a shelf: white board, no photograph and no badge on the
 * front, one word set in a chartreuse green, and under it the only graphic
 * the pack has - a column of flat green steps running from that chartreuse
 * down to a bottle green at the foot. The fat content is jetted large and
 * pale on the roof panel beside the fill code, which is where a Tetra Rex
 * carton carries it, and everything else a carton has to say is said on the
 * three faces nobody photographs.
 *
 * The front is nearly empty on purpose. A pack this quiet is a real style -
 * the argument is that the milk is the product and the ink is not - and it is
 * the harder thing for a mockup to carry off, because with the farm painting
 * and the seals gone there is nothing to hide a mis-set line behind. What is
 * left on it is the word, the ramp and the net quantity the FDA requires on
 * the principal display panel; the brand itself only appears on the sides.
 *
 * The ramp is the pack's whole identity, so the back prints the rest of the
 * range as the same block in another hue rather than as three little
 * cartons: green for the 3.5 %, blue for the 1.5 %, teal for the 0.5 %. And
 * the Nutrition Facts panel down the right side is the FDA's *classic*
 * format - serving size first, "Calories from Fat" beside the calories,
 * vitamins as bare percentages two to a line - which is the label most
 * people picture, and the one a dairy this size still prints.
 *
 * Every panel prints straight onto the board (`materialTone`), so a
 * different `material` changes the carton the print sits on, the way a
 * brand's white and kraft variants do - though the home carousel only offers
 * the coated white. The greens are solid inks and stay
 * put; the type flips to white ink on a dark board and the pale grey follows
 * the board it is mixed with.
 *
 * Measurements are in `cqw` against the panel's own width: 3cqw on a 95 mm
 * face is 2.9 mm of type, which is what a carton's small print is set at.
 */

/* ------------------------------------------------------------------ */
/*  Ink                                                                */
/* ------------------------------------------------------------------ */

/** The ramp's ends: the chartreuse ORGANIC is set in, down to a bottle green. */
const RAMP: readonly [string, string] = ['#8cc21c', '#2e8b10']
/** The rest of the range - the same block, another hue. */
const RAMP_BLUE: readonly [string, string] = ['#7fc5e8', '#16528f']
const RAMP_TEAL: readonly [string, string] = ['#a5dbcf', '#0f6b63']
/** The green everything typographic is set in: the ramp's own first step. */
const GREEN = RAMP[0]

/** A hex colour's three channels, `#abc` or `#aabbcc`. */
function channels(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const n =
    h.length === 3
      ? [...h].map((c) => Number.parseInt(c + c, 16))
      : [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16))
  return [n[0] ?? 0, n[1] ?? 0, n[2] ?? 0]
}

/** `t` of the way from one ink to another, in sRGB - these are flat bands, not a blend. */
function mix(from: string, to: string, t: number): string {
  const [a, b] = [channels(from), channels(to)]
  const v = a.map((c, i) => Math.round(c + (b[i]! - c) * t))
  return `#${v.map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

/** The ramp as `n` flat steps, light at the top - the pack's one graphic device. */
function steps(from: string, to: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => mix(from, to, n === 1 ? 0 : i / (n - 1)))
}

/**
 * Ink for the print: the type colour on this board, and the two greys under
 * it - `quiet` for the small print, `pale` for the fat content, which on a
 * carton like this is set almost to the edge of legibility on purpose.
 *
 * Both greys are mixed with the board rather than faded with opacity, because
 * the same value has to work as a `color` on a face that prints on kraft as
 * readily as on white - and on a dark board "pale grey" means mixing the
 * white ink *down*, which an alpha would get backwards.
 */
function press(material: string): { ink: string; quiet: string; pale: string } {
  const ink = materialTone(material).text === INK ? INK : PAPER
  return { ink, quiet: mix(ink, material, 0.52), pale: mix(ink, material, 0.74) }
}

/* ------------------------------------------------------------------ */
/*  Pieces                                                             */
/* ------------------------------------------------------------------ */

/** A wall of the carton: the board as the container, the print laid out inside it. */
function Face({ material, style, children }: { material: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <Sheet
      tone={materialTone(material)}
      style={{ flexDirection: 'column', padding: '5cqw', gap: '2.4cqw', color: press(material).ink, ...style }}
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

/**
 * The block: flat steps from one green to another, top to bottom. `bands` is
 * a count rather than a gradient because the steps are the point - a real
 * one is printed as solid areas, and a CSS gradient across the same span
 * bands itself in the render anyway, at whatever pitch the texture happens
 * to have.
 */
function Ramp({
  from = RAMP[0],
  to = RAMP[1],
  bands = 8,
  style,
}: {
  from?: string
  to?: string
  bands?: number
  style?: CSSProperties
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 'none', ...style }} aria-hidden>
      {steps(from, to, bands).map((color, i) => (
        <div key={i} style={{ flex: 1, background: color }} />
      ))}
    </div>
  )
}

/** The one line of display type a face gets: light, tight, and never bold. */
function Display({ children, size = '8.2cqw', style }: { children: ReactNode; size?: string; style?: CSSProperties }) {
  return (
    <div style={{ fontFamily: FONT, fontWeight: 300, fontSize: size, lineHeight: 1.1, letterSpacing: '-0.02em', ...style }}>
      {children}
    </div>
  )
}

/**
 * The dairy's name, which on this pack is a line of type and nothing else -
 * no oval, no serifs, no est. 1948. A brand that prints a bare ramp on the
 * front does not put a crest on the side.
 */
function Wordmark({ size = '3.2cqw', style }: { size?: string; style?: CSSProperties }) {
  return (
    <span style={{ fontSize: size, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1, ...style }}>
      Harlow Valley
    </span>
  )
}

/** A pledge: a step of the ramp for a bullet, the line set beside it. */
function Pledge({ children }: { children: ReactNode }) {
  return (
    <li style={{ display: 'flex', gap: '2.4cqw', alignItems: 'baseline' }}>
      <span style={{ width: '2.4cqw', height: '2.4cqw', background: GREEN, flex: 'none', transform: 'translateY(0.2cqw)' }} />
      <span>{children}</span>
    </li>
  )
}

/** One of the range on the back: the same block, its own hue, the fat under it. */
function Variant({ ramp, pct, label, quiet }: { ramp: readonly [string, string]; pct: string; label: string; quiet: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2cqw', minWidth: 0 }}>
      <Ramp from={ramp[0]} to={ramp[1]} bands={6} style={{ height: '52cqw' }} />
      <div style={{ fontSize: '5cqw', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1 }}>{pct}</div>
      <Micro style={{ fontSize: '2.4cqw', color: quiet, lineHeight: 1.2 }}>{label}</Micro>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Faces                                                              */
/* ------------------------------------------------------------------ */

/**
 * The front: white board, the word, the ramp, and the net quantity. The
 * ramp is held off the foot by the same margin it keeps at the sides, so the
 * block sits in the panel rather than bleeding off a fold that, on a real
 * carton, is glued.
 */
export function CartonFront({ material }: { material: string }) {
  const { quiet } = press(material)
  return (
    <Face material={material} style={{ padding: '6cqw 4cqw 4cqw', gap: 0 }}>
      <div style={{ flex: 1, minHeight: 0 }} />
      <div
        style={{
          fontFamily: FONT,
          fontSize: '9.4cqw',
          fontWeight: 400,
          letterSpacing: '0.06em',
          lineHeight: 1,
          color: GREEN,
          paddingBottom: '3cqw',
        }}
      >
        ORGANIC
      </div>
      <Ramp style={{ height: '59%' }} />
      <Micro style={{ fontSize: '2.4cqw', color: quiet, paddingTop: '2.6cqw' }}>Half gallon · 1.89 L · 64 fl oz</Micro>
    </Face>
  )
}

/**
 * The right side: the Nutrition Facts panel in the FDA's classic format, the
 * ingredient line, the storage line, the certifier - organic milk names the
 * body that certified it, which is the pledge that replaced the rBST
 * disclaimer this pack used to carry - and a scannable UPC-A.
 */
export function CartonFacts({ material }: { material: string }) {
  const { ink, quiet } = press(material)
  return (
    <Face material={material} style={{ gap: '2.2cqw' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '2cqw' }}>
        <Wordmark size="2.9cqw" />
        <Micro style={{ fontSize: '2.6cqw', color: quiet }}>3.5 % milkfat</Micro>
      </div>
      <NutritionFacts
        format="classic"
        fontSize="3cqw"
        servings="8"
        servingSize="1 cup (240mL)"
        calories="150"
        caloriesFromFat="70"
        rows={[
          { label: 'Total Fat', amount: '8g', dv: '12%', bold: true },
          { label: 'Saturated Fat', amount: '5g', dv: '25%', indent: 1 },
          { label: 'Trans Fat', amount: '0g', indent: 1 },
          { label: 'Cholesterol', amount: '35mg', dv: '12%', bold: true },
          { label: 'Sodium', amount: '125mg', dv: '5%', bold: true },
          { label: 'Total Carbohydrate', amount: '12g', dv: '4%', bold: true },
          { label: 'Dietary Fiber', amount: '0g', dv: '0%', indent: 1 },
          { label: 'Sugars', amount: '12g', indent: 1 },
          { label: 'Protein', amount: '8g', dv: '16%', bold: true },
        ]}
        micros={[
          { label: 'Vitamin A', dv: '10%' },
          { label: 'Vitamin C', dv: '4%' },
          { label: 'Calcium', dv: '25%' },
          { label: 'Iron', dv: '0%' },
          { label: 'Vitamin D', dv: '15%' },
        ]}
      />
      <p style={body('3.2cqw')}>
        <strong>INGREDIENTS:</strong> ORGANIC GRADE A MILK, VITAMIN D3.
      </p>
      <p style={body('3.2cqw')}>
        <strong>KEEP REFRIGERATED.</strong> Sell by date on top. For best taste use within 7 days of opening.
      </p>
      <div style={{ display: 'flex', gap: '3cqw', alignItems: 'center' }}>
        <RoundSeal
          size="15cqw"
          legend="VERMONT ORGANIC FARMERS · CERTIFIED · "
          color={GREEN}
          center={<span style={{ fontSize: '2.2cqw', fontWeight: 700 }}>100%</span>}
        />
        <p style={body('2.9cqw', { color: quiet })}>
          Certified organic by Vermont Organic Farmers, LLC · VOF-0148. Produced without antibiotics, added
          hormones or synthetic pesticides.
        </p>
      </div>
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
            <Micro style={{ fontSize: '2.3cqw', lineHeight: 1.25, color: quiet }}>
              Please
              <br />
              recycle
            </Micro>
          }
        />
      </div>
      <Micro style={{ fontSize: '2.3cqw', color: quiet, lineHeight: 1.35 }}>
        Harlow Valley Dairy Co-op · Harlow, VT 05468
        <br />
        Plant 50-2117 · harlowvalleydairy.com
      </Micro>
    </Face>
  )
}

/**
 * The left side: where the milk is from. The photograph sits in the block the
 * ramp occupies on the front, at the same width and the same margin, because
 * on a pack this bare the one place a picture can go is the place the graphic
 * already goes.
 */
export function CartonStory({ material }: { material: string }) {
  const { quiet } = press(material)
  return (
    <Face material={material} style={{ padding: '6cqw 4cqw 4cqw', gap: '3cqw' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '2cqw' }}>
        <Micro style={{ color: GREEN, fontSize: '2.6cqw' }}>Certified organic</Micro>
        <Micro style={{ fontSize: '2.6cqw', color: quiet }}>Harlow, Vermont</Micro>
      </div>
      <Display>Sixty family farms, none more than a hundred miles from the creamery.</Display>
      <p style={body('3.3cqw')}>
        Every drop in this carton comes from cows out on organic pasture from April to October, on farms we
        buy from by the year rather than by the tanker. The milk is collected each morning and filled the
        same day, so what you pour is a day off the farm.
      </p>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* The herd and the fence line. The painting has a glass of milk standing
            in the left third, and a tall block crops it to a sliver of glass, so
            the crop is pulled off it rather than centred. */}
        <Photo src={asset('/art/milk-farm.webp')} position="74% 50%" />
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '1.8cqw', ...body('3.2cqw') }}>
        <Pledge>Organic pasture, at least 120 days a year</Pledge>
        <Pledge>No antibiotics, no added hormones</Pledge>
        <Pledge>Farmer owned since 1948</Pledge>
      </ul>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '2cqw' }}>
        <Wordmark size="2.8cqw" />
        <Micro style={{ fontSize: '2.4cqw', color: quiet }}>harlowvalleydairy.com</Micro>
      </div>
    </Face>
  )
}

/** The back: the rest of the range as the same block in another hue, and the reading at breakfast. */
export function CartonBack({ material }: { material: string }) {
  const { ink, quiet } = press(material)
  const facts = [
    'Organic pasture holds more carbon than the same field cropped - the herd is part of how the farm keeps it.',
    'Milk is about 87 % water. The other 13 % is the fat, protein, sugar and minerals you drink it for.',
    'One glass has as much calcium as ten cups of raw spinach, and your body keeps far more of it.',
  ]
  return (
    <Face material={material} style={{ padding: '6cqw 4cqw 4cqw', gap: '3cqw' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '2cqw' }}>
        <Micro style={{ color: GREEN, fontSize: '2.6cqw' }}>Also from Harlow Valley</Micro>
        <Micro style={{ fontSize: '2.6cqw', color: quiet }}>Look for the block</Micro>
      </div>
      <Display>Three strengths, and every one of them organic.</Display>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3.5cqw' }}>
        <Variant ramp={RAMP} pct="3.5%" label="Whole" quiet={quiet} />
        <Variant ramp={RAMP_BLUE} pct="1.5%" label="Reduced fat" quiet={quiet} />
        <Variant ramp={RAMP_TEAL} pct="0.5%" label="Lowfat" quiet={quiet} />
      </div>
      <p style={body('3.1cqw', { color: quiet })}>
        The block is the pack: one colour per strength, printed the same way on every carton in the range.
      </p>
      <div style={{ flex: 1, minHeight: '2cqw' }} />
      <div style={{ borderTop: `0.4cqw solid ${GREEN}`, paddingTop: '3cqw', display: 'grid', gap: '2.4cqw' }}>
        <Micro style={{ color: GREEN, fontSize: '2.6cqw' }}>Did you know?</Micro>
        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '2cqw' }}>
          {facts.map((fact, i) => (
            <li key={fact} style={{ display: 'flex', gap: '2.4cqw', ...body('3.1cqw') }}>
              <span style={{ color: GREEN, fontWeight: 600, fontVariantNumeric: 'tabular-nums', flex: 'none' }}>{i + 1}</span>
              <span>{fact}</span>
            </li>
          ))}
        </ol>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '3cqw' }}>
        <div style={{ display: 'grid', gap: '1.8cqw' }}>
          <Wordmark size="2.8cqw" />
          <Micro style={{ fontSize: '2.2cqw', color: quiet }}>Questions? 1-800-555-0148</Micro>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1.6cqw', textAlign: 'right' }}>
          <RecycleMark color={ink} size="6cqw" />
          <Micro style={{ fontSize: '2.2cqw', color: quiet, lineHeight: 1.35 }}>
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
 * The front roof panel: the fill code jetted along the top, up under the fin
 * where the filling line sprays it, and the fat content large and pale at the
 * eave. Both sit clear of the middle of the panel, because that is where the
 * screw cap is moulded on and a cap masks whatever is printed under it.
 */
export function CartonRoof({ material }: { material: string }) {
  const { ink, pale } = press(material)
  return (
    <Sheet
      tone={materialTone(material)}
      style={{ color: ink, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', padding: '3cqw 4cqw 3.4cqw' }}
    >
      <JetPrint color={ink} size="2.8cqw">
        08 JUL 11:30 O100
      </JetPrint>
      <div style={{ fontFamily: FONT, fontSize: '9cqw', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1, color: pale }}>
        3.5%
      </div>
    </Sheet>
  )
}

/**
 * The back roof panel: no cap here, so it carries what the front roof has
 * no room for - the opening instruction, the recycling line and the dairy's
 * name, small and in the green, the way the side panels set it.
 */
export function CartonRoofBack({ material }: { material: string }) {
  const { ink, quiet } = press(material)
  return (
    <Sheet
      tone={materialTone(material)}
      style={{ color: ink, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', padding: '4cqw 5cqw 4.4cqw', gap: '4cqw' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6cqw' }}>
        <Wordmark size="4.4cqw" style={{ color: GREEN }} />
        <p style={body('3cqw', { color: quiet })}>
          Twist the cap to open.
          <br />
          Keep refrigerated below 5 °C.
        </p>
      </div>
      <RecycleMark color={ink} size="9cqw" label={<span style={body('2.6cqw', { color: quiet })}>Rinse, cap on,<br />recycle</span>} />
    </Sheet>
  )
}
