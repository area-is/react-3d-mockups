# Model review: realism per kilobyte

**Date:** 2026-11-19 · **Reviewing:** `79d232f` (main) · **Reviewer:** Claude Code

> **Bottom line:** the devices are already detailed and were left alone. The print and
> packaging objects were the weak spot: their geometry is sound, but every body was lit as
> one flat colour wherever a design does not print, which is what reads as a render. Nine
> objects now carry procedural surface grain, and the poster frame gains its hanging
> hardware. Eight imports grow by 0.9 to 1.1 KB gzip each (5 to 7%), the record by 0.1 KB,
> and nothing else changes size.

## Method

Every mockup was rendered through the docs harness (`/harness`, `shadows=1`, the default
gradient screen) from the front and the back, then the objects again close up: about 90 frames
in all. Each model was judged on one question: what is the first thing that gives it away
as CG?

For the phones, foldables, tablets, laptops, watches, the Studio Display, the TV and the
vehicles the answer was nothing cheap to fix. They carry machined ports, lens stacks,
keycaps with legends, crown knurling and band hardware, and two earlier reviews in this
folder checked the 2026 additions among them against the makers' drawings.

For the objects the answer was nearly always the same: the surface, not the shape. A page
block with no pages in it, kraft with no fibre, book cloth with no weave, a record with no
groove sheen.

## What changed

One new core module, `src/core/geometry/grain.ts`, draws four tileable height fields in
code (paper fibre, stacked sheets, cloth weave, timber) and renders each once into two
128 px textures: a white-based tint for a material's `map` and a tangent-space normal map.
Nothing is downloaded. The scene components ask for them inline.

Two rules in that module came out of testing rather than design, and both are about not
making things worse:

- **Pale stock gets the relief and not the tint.** A tint multiplies, so it prints hardest
  on the lightest colours, which is backwards: unbleached kraft and stained timber show
  their grain, bleached board and painted timber do not. With the full tint a white bag
  came out grimy and the cream A-frame in the stationery example came out zebra-striped.
  `grainTint` returns no map above a relative luminance of 0.45.
- **Relief is close-up detail.** Every mip of a normal map below the first is flat, and
  the textures take no anisotropic filtering. A regular pattern near two pixels wide
  beats against the pixel grid, and `MockupCanvas` draws at 1.5x on a 1x screen and lets
  the browser scale it down, which turned the first book cloth into moiré swimming across
  the board. The weave is now relief only, eight texels to the thread, and fades in once
  a thread covers about four pixels.

| Model | Change | Added geometry |
| --- | --- | --- |
| `Book` | Buckram weave on the boards, backbone and joint grooves, visible as you move in. Page block shows its leaves on all three open edges. | none (the page block swaps a rounded box for a plain one) |
| `Magazine` | Trimmed block shows its leaves on the three open edges. | none |
| `MailerBox` | Mottled kraft fibre on the shipper and its flaps. | none |
| `ShoppingBag` | Kraft fibre on walls and gussets. | none (the gussets gain a UV attribute) |
| `PosterFrame` | Fibrous kraft dust cover. New sawtooth hanger and two felt bumpers on the back. | 1 box, 2 cylinders |
| `AFrameSign` | Timber grain on the frame and leg tips. | none |
| `BusShelter` | Hardwood bench with grain along its length. | none |
| `IDCard` | Ribbed polyester lanyard strap. | none |
| `VinylRecord` | Groove band shaded anisotropically from per-vertex radial tangents, so it throws the radial wedges of light a pressed record does. | 1 ring per face |

Live regions did not move or resize on any of them.

## Before and after

Each board is the original code on the left and the change on the right, at the same camera,
with the outlined area enlarged underneath.

![Book: page block and cloth, before and after](model-realism-2026-11/book-top.jpg)

![Book: cloth, close up, before and after](model-realism-2026-11/book-cloth.jpg)

![Magazine: trimmed edges, before and after](model-realism-2026-11/magazine.jpg)

![Shopping bag: kraft, before and after](model-realism-2026-11/bag-top.jpg)

![Shopping bag: side gusset, before and after](model-realism-2026-11/bag.jpg)

![Mailer box: kraft liner, before and after](model-realism-2026-11/mailer.jpg)

![Poster frame: the back, before and after](model-realism-2026-11/poster-back.jpg)

![A-frame sign: timber, before and after](model-realism-2026-11/aframe.jpg)

![Bus shelter: bench, before and after](model-realism-2026-11/shelter.jpg)

![ID card: lanyard, before and after](model-realism-2026-11/idcard.jpg)

![Vinyl record: groove sheen, before and after](model-realism-2026-11/vinyl.jpg)

![Vinyl record: another angle, before and after](model-realism-2026-11/vinyl-2.jpg)

## Round two: the parts that were asked about

A second pass, on request, over the watch straps, the credit card, the milk carton, the
phone cameras, the laptop keyboards and the shopping bag again. These models already had
a great deal of work in them, so the question was narrower: what still reads as drawn
rather than made?

| Model | What was wrong | Change |
| --- | --- | --- |
| MacBooks | Touch ID was a flat disc in a ring of one even grey: an icon printed on the key. | A dished sensor inside a tactile ring, both flat meshes carrying the normals of the shapes they stand for. |
| Phones, foldables, tablets | Each lens barrel was a smooth dark funnel, so the lens read as a black disc with a bead in it. | The barrel steps down to the glass in three chamfered rings (`baffleProfile`), in both the Apple and the Galaxy lens. |
| Buckled watch bands | Both strap ends were capped flat, and the one standing past the buckle looked cut off. | `sweptStrapGeometry` takes a `tip`, rounding an end off on a quarter ellipse. The Solo Loop has no ends. |
| Credit card | With no back design, the embossing's reverse was a pile of coplanar capsules: every joint showed the end of each stroke. | The impressions keep 3% of their depth, so the depth buffer takes the union. |
| Milk carton | The fin was a plain slab with a block at each end. | Six crimp grooves in the fin's swept profile, one thickness end to end. `MILK_CARTON.fin.knuckle` is removed. |
| Shopping bag | The handle cords came through the board, and stood in front of their patches. | The cords sit inside the wall by their own radius, under the patches. |

![MacBook: Touch ID key, before and after](model-realism-2026-11/r2-touchid.jpg)

![iPhone: camera lenses, before and after](model-realism-2026-11/r2-lens-iphone.jpg)

![Galaxy: camera lenses, before and after](model-realism-2026-11/r2-lens-galaxy.jpg)

![Apple Watch Ultra: strap end, before and after](model-realism-2026-11/r2-strap-ultra.jpg)

![Galaxy Watch: strap end, before and after](model-realism-2026-11/r2-strap-galaxy.jpg)

![Credit card: debossed back, before and after](model-realism-2026-11/r2-card-back.jpg)

![Milk carton: the sealed fin, before and after](model-realism-2026-11/r2-carton.jpg)

![Shopping bag: outside of the back, before and after](model-realism-2026-11/r2-bag-back.jpg)

![Shopping bag: handles inside, before and after](model-realism-2026-11/r2-bag-handles.jpg)

**Reviewed and left alone.** The strap material, the buckle and keeper hardware, the
laptop keycaps and legends, the card's front embossing and chip, and the carton's ear
folds, cap and board. Each was looked at close up and none had a defect cheap to fix.

**Cost.** Every device import grows by 0.1 to 0.2 KB gzip (0.3%), for the shared lens
and the strap; the carton, card and bag are unchanged to the nearest 0.1 KB. The whole
library is 150.0 KB.

**Checked** the same way as the first round: against the previous commit rendered on
this machine, `book`, `tv`, `watch` (the Solo Loop), `creditcard`, `creditcard-emboss`,
`galaxy`, `iphone-promax` and `fold-closed` are identical; `laptop`, `laptop-proled14`,
`ipad-mini-back` and `creditcard-back` move by under 0.01%; and `milkcarton`, `bag`,
`watch-ultra4` and `watch-ultra2` differ only at the fin, the handles and the strap
ends. No region changed size.

**Known limits.** The buckle-side strap still runs a little past its buckle, which a
real one does not: it now ends in a tongue rather than a stub, but it should end at the
bar. The printed-back path of the card's impressions still shades each stroke on its
own; it was not reported and was not changed.

## What it costs

Measured with `scripts/measure-size.mjs` on this machine, original code against the
change, gzip:

| Import | Before | After | Change |
| --- | --- | --- | --- |
| `BookMockup` | 16.2 KB | 17.3 KB | +1.1 KB (7%) |
| `MagazineMockup` | 15.9 KB | 16.9 KB | +1.0 KB (6%) |
| `MailerBoxMockup` | 16.4 KB | 17.3 KB | +0.9 KB (5%) |
| `ShoppingBagMockup` | 16.4 KB | 17.4 KB | +1.0 KB (6%) |
| `PosterFrameMockup` | 16.2 KB | 17.2 KB | +1.0 KB (6%) |
| `AFrameSignMockup` | 15.8 KB | 16.8 KB | +1.0 KB (6%) |
| `BusShelterMockup` | 17.6 KB | 18.5 KB | +0.9 KB (5%) |
| `IDCardMockup` | 16.8 KB | 17.7 KB | +0.9 KB (5%) |
| `VinylRecordMockup` | 16.5 KB | 16.6 KB | +0.1 KB (1%) |
| Every device, and every object not listed | | | unchanged |
| Whole library | 147.8 KB | 149.6 KB | +1.8 KB (1.2%) |

On the GPU, each grain in use is two 128 × 128 RGBA textures with mipmaps, about 170 KB
of texture memory per grain, shared by every mockup on the page.

Two things about the import-cost table in `docs/devices.mdx`:

- It was already stale. Unchanged `main` measures about 0.7 KB above every row (the
  hardcover is documented at 15.6 KB and measures 16.2 KB), which is inside the check's
  10% tolerance.
- The grain on top of that drift takes five imports past the tolerance, so this change
  rewrites the table with `npm run size:write`. Every row moves, most of them only by the
  old drift.

## What was tried and dropped

- **Paper tooth on the brochure and greeting card.** A normal map on white stock was
  barely visible and cost each import the same 0.8 KB. Reverted.
- **A `bumpMap` instead of a normal map.** three derives bump from screen-space height
  differences, so its strength changes with zoom and pixel density. A normal map shades
  the same at every size.
- **A turn-top inside the shopping bag.** The mouth's stock folded down inside both
  walls is real, and was modelled as two thin boxes. Its edge did not show from any angle
  a mockup is viewed at, so it was removed rather than shipped as invisible geometry.
- **Heavier relief.** The first pass gave kraft a normal scale of 0.6 and the book a
  thread every 1.3 mm. Enlarged, the kraft read as stucco and the cloth as basket-work.
  Kraft is now mostly tint (normal scale 0.22) and the weave is a thread every 0.9 mm.
- **A tinted weave visible at arm's length.** It moiréd, on every cloth colour, for the
  reason above. The cloth is plain at the default distance again, exactly as before, and
  the weave is there when you move in.
- **Deriving the record's groove tangent from UVs.** UV-derived tangents are constant over
  a triangle, which showed the ring's 96 segments as spokes. A per-vertex tangent
  attribute interpolates and is smooth.

## Verification

| Check | Result |
| --- | --- |
| `npm run typecheck` | passes, both workspaces |
| `npm run test` | 593 pass, 24 of them new (`grain.test.ts`: each field stays in range, tiles on both axes and is deterministic; the textures repeat, mipmap and share pixels; the normals are unit length and flat below the first mip; pale stock gets no tint) |
| `npm run devices:check` | passes |
| `npm run size:check` | passes against the rewritten table |
| `npm run docs:examples` | passes, 163 examples |
| `npm run build:docs` | passes |
| `npm run bench` | all budgets met, against the production build as CI runs it |

The new tests caught one real defect before any render did: the sheet grain picked a
different shade for the leaf at `u = 1` than at `u = 0`, a seam on every tile.

**`npm run visual` could not be judged against the committed baselines.** Unchanged
`main` rendered here differs from every one of the ten baselines compared by 0.3 to 1%
(the bus by 0.85%), all of it along antialiased edges: this machine's Chromium is not the
build that drew them. So the same script was pointed at baselines rendered from unchanged
`main` on this machine instead:

| Case | Against `main`, same machine |
| --- | --- |
| `bus-panel`, `tv`, `poster` (front) | identical |
| `book`, `magazine`, `mailer`, `bag`, `vinyl`, `aframe`, `shelter` | differ on the bodies only, 0.07% to 6.4% of pixels |

No region reported a size other than `mockupInfo`'s, and no case logged a console error.

The committed baselines are **not** rewritten here, since they would be drawn by a
different renderer from the other 57. Those seven cases will fail `npm run visual` until
someone runs `npm run visual -- --update` on a machine that reproduces the rest.

## Known limits

- **The A-frame's rails are cross-grain.** The frame is one extrusion, so the grain runs
  one way across all of it. Up the stiles is right for the long members and wrong for the
  two short rails. It shows only in a close-up.
- **The magazine's leaves are fine.** A 6 mm block is about 12 px tall in a hero shot, so
  the striation mostly averages to a slightly warmer edge until you zoom in.
- **The book's weave shows only close up.** At the default distance the cloth is as plain
  as it was. That is the price of it never shimmering.
- **Light and mid-tone stock were checked by eye, not by a baseline.** A white bag and
  mailer, a cream A-frame, and cream, red and green cloth were rendered and inspected.
  None of them is a `npm run visual` case.

## Not done, and why

- **Devices.** Nothing found that is both visible in a hero shot and cheap. Anodised
  aluminium and glass are smooth at this scale, and the detail work is already there.
- **Product box, custom box, custom panel, business card, credit card, milk carton.**
  Coated stock and PVC are smooth in reality. A grain would be wrong, not merely costly.
- **Vehicles, storefront, billboard, totem, TV.** Painted metal and glass. The same.
- **The live faces.** They are DOM, so a kraft face with a transparent design shows flat
  kraft colour beside fibrous kraft sides. A CSS texture on the surface could match them;
  that is a separate change to the surface defaults, not to the models.
- **The committed visual baselines**, for the reason under Verification.
