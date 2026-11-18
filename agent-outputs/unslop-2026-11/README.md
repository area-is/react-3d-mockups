# Unslop pass on the example sites, November 2026

The twelve isolated example sites under `apps/docs/app/examples/`, run through
the [unslop](https://github.com/heydamir/unslop) skill by Damir Sokolovsky
([@heydamir](https://x.com/heydamir)), CC BY 4.0.

Every site has a number, and every change on it has a number too:

- `NN-site-compare.jpg`: before on the left, after on the right, each change
  boxed in red with its number on both sides, and the numbered list under
  them, numbered from the top of the page down. Refer to a change as
  `NN #k`, like `12 #3` for stream's headline.
- `00-overview-before.jpg` and `00-overview-after.jpg`: the first screen of
  all twelve.

These are downscaled for the repository. They were cut from full-page
captures at 1440 wide and 2x with every 3D scene mounted, which are not
committed (about 25 MB).

## The result

Two rounds. The first was the unslop skill as written, in polish mode for
01–11 and a full direction for 12. The second came from review: **no card
designs unless the page needs one, and sections laid out with spacing and
alignment rather than boxes.** So, on every site:

- A card (a bordered, filled box holding a stage and a caption strip) became
  the stage on its own, as the picture, with its caption under it on the page,
  aligned to the stage's left edge. Rows of them are spaced 40px apart and 24px
  across.
- A panel of controls under a stage lost its box; the controls sit on the page
  under the stage, aligned to it, 24px below.
- Boxed plans (01, 12) became three aligned columns, the featured plan marked
  by its name in the accent. Matchday's boxed stats (08) became one row, each
  stat named above its home and away figures.
- Kept as boxes, because the page needs them: the 3D stages themselves (each
  is the picture, and objects that run off its edge need the edge to be
  visible) and campaign's specimen tiles for the mark, the inks and the
  wordmark (05).

A third round, also from review:

- **Choices have no box and no border.** Every picker, segmented control and
  option group (channels, levels, covers, liveries, box styles, boards,
  quantities, designs, ink sets, sizes, frames, mats, palettes, typefaces,
  posters) is plain: the choice that is on is at full strength, the rest
  recede (muted text, swatches and thumbnails at half opacity), and hover
  brings one forward. No outline, ring, underline or fill marks the selection.
  The 1px edge on round colour swatches stays, since a white swatch on a white
  page needs it.
- **Smaller corners.** Stages 18–24px → 10px, controls 10–12px → 6–8px,
  chips and thumbnails → 4px, pills → 6px. Circles stay circles.
- **White pages for the cream sites.** 01 ambient, 03 atlas, 04 cafe,
  09 packaging, 10 print-shop and 11 stationery had cream, kraft or plaster
  pages; each page is now white and its stages a light step of the site's own
  warm tone. Accent and muted text still pass 4.5:1 on white (5.3:1 or
  better). 06 fleet's cool grey was not cream and stays.
- **09 packaging's sliders.** The native track with an orange fill became a
  2px hairline inked up to the value with a plain 14px dot to drag; the dot
  grows a little on hover and while dragging, and keyboard focus is a soft
  halo round it.

| # | Site | Brand | Verdict |
| --- | --- | --- | --- |
| 01 | ambient | Ambient, living art for screens | Light slop, polish |
| 02 | arcade | Moth, a small game about light | Light slop, polish |
| 03 | atlas | Atlas, an islands magazine | No slop, two refinements |
| 04 | cafe | Ninefold, a coffee shop | Light slop, polish |
| 05 | campaign | Raster Studio, Aperture festival identity | Light slop, polish |
| 06 | fleet | Northline, overnight road freight | Light slop, polish |
| 07 | ledger | Ledger, personal finance | Light slop, polish |
| 08 | matchday | Alcântara FC, match day | Light slop, polish |
| 09 | packaging | Carton & Co, custom boxes | Light slop, polish |
| 10 | print-shop | Grid Editions, prints to order | Light slop, polish |
| 11 | stationery | Wedding stationery | Light slop, polish |
| 12 | stream | Prism, a streaming service | Heavy in color, full direction |

## What the audit found everywhere

These sites were written with care: the copy is specific, there are no hype
words, exclamation marks or emoji in the interface, every page has one real
product object as its moment, and motion is already named transitions on one
curve. So eleven of twelve run in polish mode: the skill fixes only what the
audit found, keeps each brand, and does not invent new layouts or visuals.

The signs that repeat across the set:

1. **Heavy, crushed headings.** `h1`/`h2` at 700 or 800 with -0.04 to -0.05em
   tracking on ten sites, so display lines touch (`fleet.css:34`,
   `matchday.css:28`, `arcade.css:34`, `ledger.css:47`, `stream.css:33`, …).
   Brand wordmarks in the top bars are 800 too.
2. **Off-grid spacing.** 30 to 45% of paddings, margins and gaps are off the
   4px grid on every site (18, 22, 26, 9px …).
3. **Too many type sizes.** 9 to 13 sizes per page, half of them half-pixel
   steps (12.5, 13.5, 14.5, 16.5).
4. **Glass control panels.** Translucent white with `backdrop-filter: blur`
   on six sites (ambient, arcade, ledger, packaging, print-shop, stream).
5. **Colored washes behind the stage.** Lime (`ledger.css:17`,
   `campaign.css:120`), green (`matchday.css:19`), violet (`stream.css:17`),
   lamp amber (`arcade.css:17`). The white light on the plaster stages of the
   light sites is a tone inside one neutral and stays.
6. **Trailing periods on headlines**, like `Never the same picture twice.`

Out of scope: the shared dark "React 3D Mockups / Example" bar on top of every
page is the docs site's chrome, not the example's.

## Per site

Each direction is taken from the existing brand, as polish mode asks.

### 01 ambient

- Signs: h1/h2 700 at -0.04em (`ambient.css:35`), brand 700; glass controls
  panel pulled up -6px over the stage (`ambient.css:146`); 21 of 62 spacing
  values off grid; 10 type sizes; headline period
- Direction: generative art for screens people already own · *slow, gallery
  quiet, a little warm* · a plaster gallery wall · the Frame on the wall ·
  the brand dot that takes the current channel's ground and ink (already there)
- Suggestion only: the three equal plan cards could become one row of
  figures, since the middle one is the only one that needs a surface

### 02 arcade

- Signs: 800 headings at -0.05em, letters touch; level chips carry glowing
  lamp orbs (`arcade.css:191`, `:227`); amber radial wash behind the hero
  (`arcade.css:17`); glass picker panel; 17 of 49 spacing values off grid
- Direction: a small night game where you light lamps for a moth · *patient,
  nocturnal, tender* · a garden at night under lamps · the TV running the
  game · the lamp count, `1 of 5 lit`
- Fix: lamp swatches become flat discs of their color, the count dot loses its
  glow, the wash goes and the TV carries the light

### 03 atlas

- No slop. Editorial serif, split hero, a real magazine as the moment, a
  contents list that reads like one
- Two refinements: drop the headline period, and put the 16 off-grid spacing
  values on the grid

### 04 cafe

- Signs: headline period; 22 of 59 spacing values off grid; 11 type sizes
- Direction: a neighbourhood coffee shop and bakery in Lisbon · *warm, plain
  spoken, unhurried* · painted wood, chalk and paper bags · the shopfront ·
  the dotted leader between a menu item and its price (already there)

### 05 campaign

- Signs: 800 headings at -0.045em; lime wash behind the billboard
  (`campaign.css:120`); headline period
- Keep: the four inks (night, acid, rose, sky, bone) are the festival's real
  palette and each one means something, so they stay in the moments
- Direction: a studio case study for a festival identity · *loud, exact,
  nocturnal* · Lisbon docks at night, bill posters · the billboard · the
  generated mark

### 06 fleet

- Signs: 800 headings at -0.045em (`fleet.css:34`), periods on headlines;
  20 of 58 spacing values off grid
- Direction: overnight road freight to forty cities · *reliable, plain,
  punctual* · depots, trailers, tail lights at 4am · the trailer · the orange
  arrow from the livery

### 07 ledger

- Signs: 800 headings at -0.045em, centered three-line lede; lime radial wash
  behind the devices (`ledger.css:17`); glass "add an expense" panel
- Keep: category colors in the chips and charts each mean a category
- Direction: one set of personal books on every device · *exact, calm, a
  little dry* · a desk at night, a receipt in a pocket · the three devices ·
  the daily budget ring

### 08 matchday

- Signs: 800 headings at -0.05em; green wash (`matchday.css:19`); emoji ⚽ on
  the watch face art (`matchday-art.tsx:183`); headline periods
- Keep: the pulsing live dot, because the clock is live
- Direction: a football club's match day page · *loud, local, proud* · a
  stadium at 3pm, a coach in club colors · the coach · the live clock

### 09 packaging

- Signs: 800 headline at -0.05em (`Size it. See it.`); glass dimension badge
  (`packaging.css:136`); 22 of 58 spacing values off grid; 13 type sizes
- Direction: boxes made to the millimetre · *practical, exact, crafted* ·
  kraft board, a cutting table · the box built from your numbers · the
  dimension readout
- Contrast: the orange eyebrow is 3.75:1 and white on the orange `Request a
  sample` button is 4.30:1, both under 4.5:1

### 10 print-shop

- Signs: pill buttons (`Bag · 0`, `Add to bag`, `Download proof`) next to
  square-ish option cards, so the control radius is not one radius; a glass
  pill caption on the stage (`print-shop.css:146`); the Mat row overflows its
  column by about 44px at 1440 wide; the red eyebrow is 3.92:1; 36 of 76
  spacing values off grid, the most of any site
- Direction: generative prints made to order, plotted and framed by hand ·
  *precise, playful, made* · a white wall, a plotter, a frame shop · the
  framed print with a hardback for scale · the edition number as the seed

### 11 stationery

- Signs: the gold eyebrow is 2.28:1 on the paper; the hero leaves the right
  half of the first screen empty beside the headline; headline period; 24 of
  48 spacing values off grid
- Direction: wedding stationery that sets itself from one set of names ·
  *gentle, formal, personal* · letterpress paper, olive sprigs, Sintra · the
  four pieces · the ampersand between the two names

### 12 stream

- Signs: violet to cyan gradient as the brand (`stream.css:10`); gradient text
  on the eyebrow (`stream.css:107`); a gradient tile as the logo mark; a
  gradient border on the featured plan (`stream.css:316`); a violet wash
  behind the TV (`stream.css:17`); the same gradient on the progress bars and
  the logo inside the app screens (`stream-art.tsx:27`); 800 headings at
  -0.045em; headline period
- Direction, new for this one:
  - Product: a streaming service whose home and tonight's feature follow you
    from the TV to the tablet to the phone
  - Character: *after hours, cinematic, unhurried*
  - World: a dark living room lit by the screen
  - Moments: the TV showing the feature; the posters, where each title keeps
    its own palette
  - Signature: the thin progress line under what is playing, at the same
    point on every screen, in one cool accent from the screen light
- Fix: one ink ramp for the page, the gradient becomes one solid cool accent
  (the cyan end of the old gradient, toned down), the logo becomes a flat
  prism glyph in one color, gradient text and border go, the wash goes

## The passes, as they apply here

1. Spacing: off-grid paddings, margins and gaps onto the 4px grid, ties to
   the multiple of 8; 1 and 2px nudges inside small controls stay
2. Color: colored washes go; accent text darkened where it misses 4.5:1;
   stream's gradient becomes one accent
3. Icons: the ⚽ on the matchday watch face goes
4. Copy: no trailing period on headlines; the words otherwise stay
5. Type: headings and wordmarks from 700 and 800 to 600 on the loud brands
   (arcade, campaign, fleet, ledger, matchday, packaging) and 500 on the quiet
   ones (ambient, print-shop, stream); tracking eased to -0.03em on display
   sizes and -0.02em on section heads; half-pixel sizes onto whole pixels
6. Layout: kept. Print-shop's overflowing Mat row is fixed; stationery's hero
   gets its first piece beside the headline only if you want it (suggestion)
7. Details: glass panels become a plain raised surface with a hairline;
   arcade's glowing lamp orbs become flat discs; print-shop's buttons share
   one radius
8. Visuals: kept. Every page already has one real product object as its moment
9. Motion: already clean, kept

Inside the mockups, the screen art (posters, liveries, app screens) is each
brand's own artwork and stays, except where it carries the slop itself: the ⚽
on the watch and stream's gradient.
