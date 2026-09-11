'use client'

import type { CSSProperties, ReactNode } from 'react'
import { TabbiedPattern } from 'tabbied/react'
import { bauhaus, chase, damier, dipole, epicentre, gyre, halftone, ortho } from 'tabbied/patterns'
import type { PatternDefinition } from 'tabbied'

/**
 * The artwork the hero carousel puts on its objects.
 *
 * Two constraints shaped this. The carousel is not touchable - it owns every
 * gesture over the stage so the models can be spun and browsed - so a surface
 * with buttons on it is a surface offering something it cannot deliver. And a
 * carousel is seen in passing at a quarter of a screen's size, so whatever is
 * on the glass has to read as a composition at a glance rather than as an
 * interface to be examined.
 *
 * So: Swiss. A strict field, one flush-left type block, Inter throughout, and
 * a generative pattern from `tabbied` doing the work that a photograph would
 * do on a real poster. The patterns are picked for the vocabulary the style
 * actually uses - concentric rings, halftone rasters, radial line fields,
 * square grids - and each piece has a palette of its own (`TONES`): a ground,
 * an ink for the type and two or three marks for the pattern, from Bauhaus
 * primaries on cream to lime on a bottle-green ground. Eighteen slots in one
 * red-black-white would have been a screensaver; the carousel is a spread.
 *
 * What says the surfaces are live is the redraw rather than a control: the
 * device screens reseed themselves every couple of seconds (see `Pattern`),
 * so the picture on a phone being dragged through 3D visibly recomposes. That
 * is something a texture cannot do, and it is the claim the carousel is here
 * to make. The printed objects hold still, because paper does.
 *
 * Every measurement is in `cq` units against a `container-type: size` root, so
 * one layout holds from a 396px watch face to a 2000px billboard panel: the
 * margin, the type and the rules all stay in proportion to the sheet.
 */

/* ------------------------------------------------------------------ */
/*  Ink                                                                */
/* ------------------------------------------------------------------ */

export const PAPER = '#efede6'
export const INK = '#141414'
export const SIGNAL = '#e1341e'

export const FONT = 'var(--font-inter), Inter, system-ui, -apple-system, "Segoe UI", sans-serif'

export interface Tone {
  ground: string
  text: string
  /** The one loud colour on the sheet: the index, the kicker, the last mark in the pattern. */
  accent: string
  /** Palette handed to the pattern: background first, then its marks. */
  palette: string[]
}

const tone = (ground: string, text: string, accent: string, ...marks: string[]): Tone => ({
  ground,
  text,
  accent,
  palette: [ground, ...marks],
})

/**
 * The carousel's palettes, one per piece. Each is a ground, an ink that
 * reads on it, an accent, and the marks the pattern draws in - two or three,
 * because a poster is a few flat colours, not a gradient. Light grounds
 * alternate with dark ones down the strip so neighbouring screens never read
 * as the same sheet.
 */
export const TONES = {
  paper: tone(PAPER, INK, SIGNAL, INK, SIGNAL),
  ink: tone(INK, PAPER, SIGNAL, PAPER, SIGNAL),
  /** Cyan and white on navy. */
  midnight: tone('#0f1b33', '#e8eefc', '#5ec8ff', '#5ec8ff', '#e8eefc', '#3560d6'),
  /** Orange and amber on near-black. */
  ember: tone('#1a1412', '#f6e7d8', '#ff7a45', '#ff7a45', '#f2b544', '#f6e7d8'),
  /** The Bauhaus primaries on cream. */
  cobalt: tone('#f1ede2', '#1f2a5a', '#e0402c', '#1f43c9', '#f0b323', '#e0402c'),
  /** Lime on bottle green. */
  moss: tone('#0f2e22', '#e6f2d9', '#b8e04a', '#b8e04a', '#e6f2d9', '#2f8f5b'),
  /** Orange, ink and a blue on warm white. */
  tangerine: tone('#f4efe6', '#26221f', '#ff6a1a', '#ff6a1a', '#26221f', '#2b6fd6'),
  /** Coral and lilac on aubergine. */
  plum: tone('#2a1738', '#f5e9f7', '#ff8fa3', '#ff8fa3', '#f5e9f7', '#9b5de5'),
  /** Teal and apricot on sea glass. */
  sea: tone('#e6f0ee', '#0f3d3e', '#f4a259', '#0f8b8d', '#0f3d3e', '#f4a259'),
  /** One electric blue on black - the dial. */
  electric: tone('#0b0f19', '#f0f4ff', '#3d7bff', '#3d7bff', '#f0f4ff'),
  /** Terracotta on plaster - the other dial. */
  terracotta: tone('#f7ede2', '#4a2c1f', '#c65d3b', '#c65d3b', '#4a2c1f'),
  /** Yellow and white on graphite. */
  graphite: tone('#232629', '#f5f5f0', '#ffd23f', '#ffd23f', '#f5f5f0', '#8a8f98'),
  /** Gold on black - the record sleeve. */
  gold: tone('#111111', '#f3e9c9', '#d4a744', '#d4a744', '#f3e9c9'),
  /** Ultramarine and red on off-white - the concert bill. */
  ultramarine: tone('#f3f1ea', '#11205e', '#e63b2e', '#1b3fbf', '#e63b2e'),
} satisfies Record<string, Tone>

export type ToneName = keyof typeof TONES

/** sRGB relative luminance, 0 (black) to 1 (white). */
function luminance(hex: string): number {
  const h = hex.replace('#', '')
  const n =
    h.length === 3
      ? [...h].map((c) => Number.parseInt(c + c, 16))
      : [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16))
  const [r, g, b] = n.map((v) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Ink on the object's own material, rather than a sheet laid over it.
 *
 * A solid ground works on a screen, which is its own surface, but on a bag or
 * a shipping box it paints out the thing it is printed on: the carousel's
 * finish swatches move kraft to charcoal to olive and the printed panel stays
 * the same rectangle of ink, which is exactly backwards - the finish is the
 * material the artwork sits on. Leaving the ground transparent lets the board
 * through, and the ink flips with the material's luminance the way a real job
 * does: dark ink on kraft, white ink on charcoal.
 *
 * The threshold is 0.35 rather than 0.5 because the marks are large flat
 * shapes: mid-tone boards (olive, slate) carry white better than the contrast
 * ratio alone suggests.
 */
export function materialTone(material: string, accent: string = SIGNAL): Tone {
  const ink = luminance(material) < 0.35 ? PAPER : INK
  return { ground: 'transparent', text: ink, accent, palette: ['transparent', ink, accent] }
}

/**
 * What to set on a bar painted in the tone's own ink - the jacket's and the
 * sleeve's type band.
 *
 * The tone's own ground, for a sheet - a band painted in the ink takes the
 * ground back as its type. Not for a material tone, whose ground is
 * `transparent`: there the band came out as a cream bar with invisible type
 * on it, so what reads on it is simply the other ink.
 */
const onInk = (tone: Tone): string =>
  tone.ground === 'transparent' ? (tone.text === INK ? PAPER : INK) : tone.ground

/* ------------------------------------------------------------------ */
/*  Pieces                                                             */
/* ------------------------------------------------------------------ */

/**
 * How often a screen redraws itself.
 *
 * Short enough to be caught rather than waited for - the carousel gives each
 * object about six seconds before it advances, so a screen repaints twice
 * while it is on stage - and long enough that each composition is a picture
 * you looked at rather than a flicker.
 */
const RESEED_MS = 2600

/**
 * The pattern block.
 *
 * `fit="cover"` rather than the default grid fit: the authored `grid` option
 * is the composition here - a poster wants a countable number of large marks,
 * not a texture that gets denser as the surface gets bigger - and `cover`
 * keeps that grid whatever shape the face turns out to be.
 *
 * `live` is the difference between a screen and a printed thing. A screen
 * takes a new seed every `RESEED_MS`, which is the whole point of the surface
 * being real DOM rather than a texture: nothing about a picture that redraws
 * itself on a phone you are dragging around in 3D is bakeable. Print does not
 * get it - a milk carton that reprinted itself every two seconds would be
 * saying something false about what the library does to a milk carton.
 *
 * The two are mutually exclusive by construction, because `redrawInterval`
 * only drives the seed while the seed is uncontrolled: a live surface passes
 * no `seed` and takes a fresh one per mount, a printed one pins it so a slot
 * scrolling out of the render window and back comes back as the same picture.
 *
 * Tabbied drops ticks under `prefers-reduced-motion`, on a hidden tab, and for
 * anything scrolled out of view, so none of this runs when it should not.
 */
export function Pattern({
  pattern,
  seed,
  palette,
  grid,
  live,
}: {
  pattern: PatternDefinition
  seed?: string
  palette: string[]
  grid: string
  live?: boolean
}) {
  return (
    <TabbiedPattern
      pattern={pattern}
      {...(live ? { redrawInterval: RESEED_MS } : { seed })}
      palette={palette}
      options={{ grid }}
      fit="cover"
      style={{ width: '100%', height: '100%' }}
    />
  )
}

/** Uppercase micro-type: the index, the section, the colophon. */
export function Micro({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span
      style={{
        fontSize: '3.1cqmin',
        fontWeight: 600,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        lineHeight: 1,
        ...style,
      }}
    >
      {children}
    </span>
  )
}

/** The one big thing on the sheet. Flush left, tight, never centred. */
function Title({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <h2
      style={{
        margin: 0,
        fontSize: '13cqmin',
        fontWeight: 700,
        letterSpacing: '-0.04em',
        lineHeight: 0.92,
        color: 'inherit',
        whiteSpace: 'pre-line',
        ...style,
      }}
    >
      {children}
    </h2>
  )
}

export const rule = (color: string): CSSProperties => ({
  height: '0.5cqmin',
  minHeight: 1,
  background: color,
  flex: 'none',
})

export const sheet = (tone: Tone): CSSProperties => ({
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
  containerType: 'size',
  background: tone.ground,
  color: tone.text,
  fontFamily: FONT,
  display: 'flex',
  overflow: 'hidden',
  userSelect: 'none',
})

/**
 * The sheet as an element, with the layout INSIDE it.
 *
 * Container-relative units on an element resolve against its nearest
 * ancestor container, never against the element itself, so a `padding: 5cqw`
 * set on the container root falls back to the viewport and comes out as 5 %
 * of the browser window - which is how a 55 mm side panel got 140 px of
 * padding and set its type at zero. Two elements, then: the outer is the
 * query container, the inner lays out in the units the outer defines.
 */
export function Sheet({ tone, style, children }: { tone: Tone; style?: CSSProperties; children: ReactNode }) {
  return (
    <div style={sheet(tone)}>
      <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', display: 'flex', minWidth: 0, minHeight: 0, ...style }}>
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Layouts                                                            */
/* ------------------------------------------------------------------ */

export interface SwissProps {
  pattern: PatternDefinition
  /** Pinned for a printed face; omitted on a live one, which reseeds itself. */
  seed?: string
  /** A screen: repaints on a timer instead of holding one composition. */
  live?: boolean
  tone?: ToneName
  /**
   * Print straight onto the object instead of onto a sheet: the ground goes
   * transparent so this colour - the object's own finish - shows through, and
   * the ink is chosen to sit on it. Wins over `tone`.
   */
  material?: string
  /** The second mark on a material print, where there is no tone to bring one. */
  accent?: string
  /** Coarse on a small face, finer on a large one - see each caller. */
  grid?: string
  index: string
  kicker: string
  /** Newlines are kept: the line breaks are part of the setting. */
  title: string
  meta: string
}

/**
 * Portrait sheet: colophon at the top, the picture in the middle, the type
 * block on the baseline. The classic Zurich concert bill.
 */
export function SwissStack({
  pattern,
  seed,
  live,
  tone = 'paper',
  material,
  accent,
  grid = '4x6',
  index,
  kicker,
  title,
  meta,
}: SwissProps) {
  const t = material ? materialTone(material, accent) : TONES[tone]
  return (
    <Sheet tone={t} style={{ flexDirection: 'column', padding: '7cqmin', gap: '4cqmin' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Micro style={{ color: t.accent }}>{index}</Micro>
        <Micro>{kicker}</Micro>
      </div>
      <div style={rule(t.text)} />
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <Pattern pattern={pattern} seed={seed} live={live} palette={t.palette} grid={grid} />
      </div>
      <Title>{title}</Title>
      <Micro style={{ opacity: 0.72 }}>{meta}</Micro>
    </Sheet>
  )
}

/**
 * Landscape sheet: the type takes the left third and the picture the rest, so
 * a wide face reads as two columns rather than as a stretched portrait.
 */
export function SwissSplit({
  pattern,
  seed,
  live,
  tone = 'paper',
  material,
  accent,
  grid = '4x6',
  index,
  kicker,
  title,
  meta,
}: SwissProps) {
  const t = material ? materialTone(material, accent) : TONES[tone]
  return (
    <div style={{ ...sheet(t), flexDirection: 'row' }}>
      <div
        style={{
          width: '34%',
          padding: '6cqmin',
          display: 'flex',
          flexDirection: 'column',
          gap: '3cqmin',
        }}
      >
        <Micro style={{ color: t.accent }}>{index}</Micro>
        <div style={rule(t.text)} />
        <Micro>{kicker}</Micro>
        <Title style={{ fontSize: '9cqmin', marginTop: 'auto' }}>{title}</Title>
        <Micro style={{ opacity: 0.72 }}>{meta}</Micro>
      </div>
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <Pattern pattern={pattern} seed={seed} live={live} palette={t.palette} grid={grid} />
      </div>
    </div>
  )
}

/**
 * Full-bleed picture with the type on a solid band across the foot - the album
 * sleeve and the book jacket, where the artwork runs to the trim.
 */
export function SwissFrame({
  pattern,
  seed,
  live,
  tone = 'paper',
  material,
  accent,
  grid = '4x6',
  index,
  kicker,
  title,
  meta,
}: SwissProps) {
  const t = material ? materialTone(material, accent) : TONES[tone]
  return (
    <div style={{ ...sheet(t), flexDirection: 'column' }}>
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <Pattern pattern={pattern} seed={seed} live={live} palette={t.palette} grid={grid} />
      </div>
      <div
        style={{
          flex: 'none',
          background: t.text,
          color: onInk(t),
          padding: '6cqmin',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5cqmin',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Micro style={{ color: t.accent }}>{index}</Micro>
          <Micro>{kicker}</Micro>
        </div>
        <Title style={{ fontSize: '10cqmin' }}>{title}</Title>
        <Micro style={{ opacity: 0.72 }}>{meta}</Micro>
      </div>
    </div>
  )
}

/**
 * The watch face. A dial is barely a hundred pixels across on the carousel, so
 * it gets one coarse pattern and one number - anything with a hierarchy in it
 * would be mush at that size.
 */
export function SwissDial({
  pattern,
  seed,
  live,
  tone = 'ink',
  material,
  accent,
  grid = '2x3',
  kicker,
  title,
}: Omit<SwissProps, 'index' | 'meta'> & { index?: string; meta?: string }) {
  const t = material ? materialTone(material, accent) : TONES[tone]
  return (
    <div style={{ ...sheet(t), position: 'relative', alignItems: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Pattern pattern={pattern} seed={seed} live={live} palette={t.palette} grid={grid} />
      </div>
      <div
        style={{
          position: 'relative',
          width: '100%',
          padding: '9cqmin',
          /* Solid under the type, fading only where it meets the pattern: at
             this size a wash the marks show through is a wash the time is
             unreadable on. */
          background: `linear-gradient(to top, ${t.ground} 72%, transparent)`,
        }}
      >
        {/* A dial is ~200px across, so the micro-type has to be set larger
            here in proportion than it is on a sheet ten times the size. */}
        <Micro style={{ color: t.accent, fontSize: '5cqmin' }}>{kicker}</Micro>
        <Title style={{ fontSize: '22cqmin', marginTop: '2cqmin' }}>{title}</Title>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  The carousel's set                                                 */
/* ------------------------------------------------------------------ */

/*
 * One piece per object, each with its own pattern, palette and setting: the
 * carousel is eighteen slots long, and eighteen prints of the same poster is a
 * screensaver rather than a showcase. Grids are coarser on the small faces and
 * finer on the large ones, so every object shows a comparable number of marks.
 *
 * The ten device screens are `live` and the printed faces are seeded. That
 * split is the whole point of the set: put them side by side in the strip and
 * the ones that are displays are the ones that keep changing. The packaging -
 * the carton, the cereal box, the shipper, the bag - is not in this set at
 * all: those are modelled on real products (see `carton-art`, `package-art`)
 * and carry no pattern.
 */

export const SwissRotation = () => (
  <SwissStack
    pattern={gyre}
    live
    tone="midnight"
    grid="6x9"
    index="01"
    kicker="Rotation"
    title={'Slow\nturns'}
    meta="Neue Grafik · Zürich"
  />
)

export const SwissRaster = () => (
  <SwissStack
    pattern={halftone}
    live
    tone="ember"
    grid="6x9"
    index="02"
    kicker="Raster"
    title={'Half\ntone'}
    meta="Plate 02 · 175 lpi"
  />
)

export const SwissConstruction = () => (
  <SwissStack
    pattern={bauhaus}
    live
    tone="cobalt"
    grid="6x9"
    index="03"
    kicker="Konstruktion"
    title={'Circle\nsquare'}
    meta="Werkbund · 1926"
  />
)

export const SwissField = () => (
  <SwissStack
    pattern={dipole}
    live
    tone="moss"
    grid="8x12"
    index="04"
    kicker="Feld"
    title={'Line\nfield'}
    meta="Studies in radiance"
  />
)

export const SwissModule = () => (
  <SwissSplit
    pattern={ortho}
    live
    tone="tangerine"
    grid="6x9"
    index="05"
    kicker="Modul"
    title={'The\ngrid'}
    meta="Twelve columns"
  />
)

export const SwissEpicentre = () => (
  <SwissStack
    pattern={epicentre}
    live
    tone="plum"
    grid="6x9"
    index="06"
    kicker="Zentrum"
    title={'Point\nsource'}
    meta="Kunsthalle · Saal 4"
  />
)

export const SwissChecker = () => (
  <SwissStack
    pattern={damier}
    live
    tone="sea"
    grid="6x9"
    index="07"
    kicker="Damier"
    title={'Black\nwhite'}
    meta="Positive & negative"
  />
)

export const SwissDialA = () => (
  <SwissDial pattern={gyre} live tone="electric" grid="4x6" kicker="Zürich" title="9:41" />
)

export const SwissDialB = () => (
  <SwissDial pattern={damier} live tone="terracotta" grid="2x3" kicker="Basel" title="9:41" />
)

export const SwissRhythm = () => (
  <SwissSplit
    pattern={chase}
    live
    tone="graphite"
    grid="6x9"
    index="08"
    kicker="Rhythmus"
    title={'Bar\nafter bar'}
    meta="Typografische Monatsblätter"
  />
)

export const SwissJacket = ({ material }: { material: string }) => (
  <SwissFrame
    pattern={bauhaus}
    seed="book-jacket"
    material={material}
    accent="#d9a441"
    grid="4x6"
    index="09"
    kicker="Edition"
    title={'Grid\nsystems'}
    meta="Josef · Verlag Niggli"
  />
)

export const SwissSleeve = () => (
  <SwissFrame
    pattern={gyre}
    seed="vinyl-sleeve"
    tone="gold"
    grid="6x9"
    index="10"
    kicker="Long play"
    title={'Concentric'}
    meta="Side A · 33⅓"
  />
)

export const SwissBill = () => (
  <SwissStack
    pattern={dipole}
    seed="poster-bill"
    tone="ultramarine"
    grid="6x9"
    index="15"
    kicker="Konzert"
    title={'Signal\n/ Noise'}
    meta="Sa 22.08 · 21 Uhr"
  />
)
