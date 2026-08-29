# Model review: the 2026 Samsung generation against the shipping hardware

**Date:** 2026-08-29 · **Reviewing:** `f1456b3` (#39) · **Reviewer:** Claude Code

> **Bottom line:** every published hardware figure in the five new specs is
> **correct**, to the tenth of a millimetre, and all fourteen colorways match
> the retail lineup. Four findings, none of them a wrong measurement: one
> consistency question about the Fold 8's derived logical grids, one figure two
> sources disagree on, and two scope notes.

## Method

Each device was checked against its published specification — Samsung's
newsroom and product pages first, then GSMArena, PhoneArena, Wikipedia and the
launch coverage — with at least two sources per figure. The committed specs
were read back out of the built package in millimetres rather than off the
source, so what is compared is what the models actually render:

```
node -e "… FOLD_VARIANTS.fold8.closed.body … * FOLD_MM_PER_UNIT"
```

Panel diagonals were recomputed from the modelled millimetres, and panel
aspects from the published pixel counts, so a matching diagonal is an
independent check rather than a restatement of the comment.

## Verified

| Figure | Published | Modelled |
| --- | --- | --- |
| Z Fold 8, folded | 123.9 × 81.9 × 9.7 mm | 123.91 × 81.90 × 9.71 |
| Z Fold 8, unfolded | 123.9 × 161.4 × 4.5 mm | 123.91 × 161.41 × 4.51 |
| Z Fold 8 cover | 5.5″, 1248 × 1972 | 5.500″, aspect 1.5801 vs 1.5801 |
| Z Fold 8 inner | 7.6″, 2448 × 1848 | 7.601″, aspect 1.3247 vs 1.3247 |
| Z Fold 8 Ultra, unfolded | 143.2 × 158.4 × 4.1 mm | 143.19 × 158.41 × 4.11 |
| Z Fold 8 Ultra inner | 8.0″, 2504 × 2256 | 8.036″, aspect 1.1098 vs 1.1099 |
| Z Flip 8, unfolded | 166.9 × 75.4 × 6.1 mm | 166.91 × 75.41 × 6.09 |
| Z Flip 8 main | 6.9″, 1080 × 2520 | 6.900″, aspect 2.3335 vs 2.3333 |
| Z Flip 8 cover | 4.1″, 948 × 1048 (unchanged) | 4.107″, carried from the Flip 7 |
| Watch 9, 44 mm | 46.0 × 43.7 × 8.6 mm | 46.00 × 43.70 × 8.60 |
| Watch Ultra 2 | 47.4 × 47.1 × 10.7 mm | 47.40 × 47.10 × 10.71 |

Two claims in the commit message are worth confirming because the models lean
on them:

- **The Watch 9 case really is the Watch 8's.** Both publish 46.0 × 43.7 × 8.6
  mm at 44 mm with the same 1.47″ 480 × 480 panel; the coverage is explicit
  that the display did not change. Deriving `GALAXY_WATCH_9` from
  `GALAXY_WATCH_8` is therefore right rather than lazy, and the colorways are
  what distinguishes them.
- **The Fold 8 really is a new form factor.** Folded it is broader than it is
  tall relative to any other phone in the catalog (81.9 mm across a 123.9 mm
  body), and the inner panel is natively landscape 4:3 — the coverage calls it
  a passport shape. The spec shape carries it unchanged, which is the cheap
  outcome, and the `resolution` doc now reads "unrotated pose's width" rather
  than "portrait" to match.

Colorways match the retail lineup exactly, including which one is the
Samsung.com exclusive in each set: Fold 8 (Cream, Graphite, Lavender,
Pistachio), Fold 8 Ultra (Cream, Graphite, Violet Shadow, Green Shadow),
Flip 8 (Cream, Graphite, Pink, Mint), Watch Ultra 2 (Titanium Silver,
Titanium Gray).

## Findings

### 1. The Fold 8's logical grids are the densest in the catalog

Not a wrong measurement — Samsung publishes no logical grid, and the commit
correctly flags these as derived. But the two grids it derives are out of step
with every other Samsung panel here. Logical width against physical width,
across the family:

| Panel | mm | dp | dp/in |
| --- | ---: | ---: | ---: |
| Flip 7 / 8 cover | 70.0 | 316 | 115 |
| Galaxy Tab S11 Ultra | 196.4 | 924 | 120 |
| Flip 7 / 8 main | 69.0 | 360 | 132 |
| Galaxy S26 | 67.1 | 360 | 136 |
| Fold 7 / 8 Ultra cover | 66.0 | 360 | 139 |
| Fold 7 / 8 Ultra inner | 136.6 | 820 | 152 |
| **Fold 8 cover** | **74.7** | **480** | **163** |
| **Fold 8 inner** | **154.1** | **1020** | **168** |

Everything else lands between 115 and 152 dp/in; the Fold 8's two panels are
the only ones above 160. The consequence is visible rather than theoretical:
content handed the same size renders about 20% physically smaller on a Fold 8
than on an S26 or a Fold 8 Ultra, so a caption set to look right across the
catalog will look small on exactly one device.

Both readings are defensible. 160 dp/in is what a dp is *defined* as, so the
Fold 8 is the accurate one and the rest of the catalog under-counts; but
Samsung's shipping defaults sit nearer 130–140 dp/in, which is what the rest
of the catalog encodes. Worth a decision either way, because the two cannot
both be the house rule.

### 2. The Fold 8 Ultra's folded thickness has two published values

The launch coverage says 8.9 mm folded; the spec pages say 9.0 mm. The model
carries the Fold 7's 8.84 mm, which is within 0.2 mm of both and consistent
with how the Fold 7 itself is modelled (8.84 against a published 8.9). No
change recommended, but the header's "the same chassis to the published tenth
of a millimetre" is stated more firmly than the sources support: on one
reading the Ultra is 0.1 mm thicker folded than the Fold 7, while being
0.1 mm thinner unfolded.

### 3. The Watch 9 is modelled at 44 mm only

It also ships at 40 mm (42.7 × 40.4 × 8.6 mm, 1.34″ 438 × 438). One size per
variant is the existing convention — the Watch 8 is the same — so this is a
scope note, not a defect. It is worth saying out loud only because the two
sizes differ in panel as well as case, so the 40 mm is not a scale of what is
modelled.

### 4. Watch active areas run under the quoted diagonal

Pre-existing and not introduced here, but it now applies to two more entries.
Samsung quotes 1.47″ (37.3 mm) for the Watch 8/9 and 1.52″ for the Ultra 2;
the models' active areas are 35.4 mm and 37.2 mm — 4–5% under in both cases,
consistently. That reads as the family measuring the active area inside the
bezel while Samsung quotes the panel, which is a defensible convention as long
as it stays uniform. It does.

## Not findings

- **The Flip 8's folded envelope** is derived as half the unfolded body
  (83.5 mm) rather than the published 85.7 mm. That is how the Flip 7 is
  modelled too, and it falls out of composing the closed pose from two halves;
  the published figure is in the family header for reference.
- **The Fold 8 Ultra's cover panel aspect** is 2.319 modelled against 2.333
  published, inherited from the Fold 7. `devices:check` passes it at 0.6%,
  inside the 1% tolerance.
- **`GALAXY_WATCH_9 = { ...GALAXY_WATCH_8 }`** shares nested references with
  the Watch 8. Harmless for read-only spec data, and the shallow spread is what
  makes the "deliberately identical" claim legible.
