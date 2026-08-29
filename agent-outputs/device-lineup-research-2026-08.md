# Device lineup research: what shipped after our catalog

**Date:** 2026-08-28 · **Commit:** `a101fa0` (main) · **Researcher:** Claude Code

> **Bottom line:** Samsung shipped **five** devices newer than anything we model,
> all announced 22 July 2026 and on sale 7 August 2026. **Apple has shipped
> nothing newer** in phones, tablets or watches — its next launch is a
> confirmed 9 September 2026 event, twelve days out. One Apple phone we never
> covered (iPhone 17e, March 2026) and one Samsung phone (Galaxy S26+) are
> current-generation gaps rather than new releases.

## Scope and method

The question: are there phones, tablets or smartwatches from Samsung or Apple
newer than the ones this package models? I read the catalog first
(`packages/react/src/core/devices/*/dimensions.ts` and the specification table
in `apps/docs/content/docs/devices.mdx`), then researched each family against
vendor newsrooms, Wikipedia and GSMArena, cross-checking every dimension
against at least two sources before recording it.

Every measurement below is a published hardware figure. Where two sources
disagreed I say so. Logical resolutions are **not** researched facts — vendors
other than Apple don't publish them — so they are marked as proposals to be
derived under the basis already documented on the devices page.

### What we model today

| Family | Variants in the catalog |
| --- | --- |
| Galaxy phones | S26, S26 Ultra |
| Galaxy foldables | Z Fold 7, Z Flip 7 |
| iPhone | 17, 17 Air, 17 Pro, 17 Pro Max |
| iPad | Pro 13" (M5), Pro 11" (M5), Air 13" (M4), Air 11" (M4), iPad (A16) |
| Galaxy Tab | S11, S11 Ultra |
| Watches | Apple Watch Series 11 (46 mm), Galaxy Watch 8 (44 mm) |

---

## Samsung: five new devices, all shipping

Samsung's Galaxy Unpacked in London on **22 July 2026** replaced the entire
foldable and watch lineup. Everything below is on sale now (**7 August 2026**).

### Phones

| Device | Folded (mm) | Unfolded (mm) | Weight | Inner / main panel | Cover panel |
| --- | --- | --- | --- | --- | --- |
| **Galaxy Z Fold 8** | 123.9 × 81.9 × 9.7 | 123.9 × 161.4 × 4.5 | 201 g | 7.6" 2448 × 1848 (4:3, landscape) | 5.5" 1248 × 1972 (10:16) |
| **Galaxy Z Fold 8 Ultra** | 158.4 × 72.8 × 8.9 | 158.4 × 143.2 × 4.1 | 215 g | 8.0" 2504 × 2256 | 6.5" 2520 × 1080 (21:9) |
| **Galaxy Z Flip 8** | 85.7 × 75.4 × 13.1 | 166.9 × 75.4 × 6.1 | 180 g | 6.9" 2520 × 1080 (21:9) | 4.1" 948 × 1048 |

Three things matter more than the numbers:

**The Fold 8 is a new form factor, not a spec bump.** Samsung split the line.
The device that inherits the plain "Fold 8" name is a *wide* foldable — 81.9 mm
across folded (versus the Fold 7's 72.8 mm) and 34.5 mm shorter, opening into a
**4:3 landscape** 7.6" tablet rather than a near-square portrait one. The
hinge axis is unchanged (it still opens left-to-right), so `FoldSpec` should
carry it structurally, but every proportion and the inner display's native
orientation are new.

**The Fold 8 Ultra is the Fold 7's chassis.** Folded and unfolded footprints
are identical to the Fold 7 we already model; only thickness moves, 4.2 → 4.1 mm
unfolded. What changes is the inner panel (2184 × 1968 → 2504 × 2256 in the same
8.0" diagonal) and the rear camera, which goes to a 200 MP main alongside the
50 MP ultra-wide and 10 MP 3× telephoto. Wikipedia and GSMArena agree on the
identical footprint, so this is real carry-over rather than a stale copy.

**The Flip 8 is an incremental refresh.** 0.2 mm wider and taller, 0.4 mm
thinner unfolded, 0.6 mm thinner folded, and the main display grows 6.85" → 6.9"
on the *same* 2520 × 1080 panel. The 4.1" 948 × 1048 cover panel is unchanged
from the Flip 7 — our existing cover-screen geometry and its 316 × 349 grid
carry over exactly.

Both foldables run Snapdragon 8 Elite Gen 5 (the Flip 8 ships Exynos 2600
outside the US and China).

### Smartwatches

| Device | Case (mm) | Weight | Display | Case material |
| --- | --- | --- | --- | --- |
| **Galaxy Watch 9, 44 mm** | 46.0 × 43.7 × 8.6 | 34 g | 1.47" 480 × 480 round | Aluminum, sapphire |
| **Galaxy Watch 9, 40 mm** | 42.7 × 40.4 × 8.6 | 31.5 g | 1.34" 438 × 438 round | Aluminum, sapphire |
| **Galaxy Watch Ultra 2, 47 mm** | 47.4 × 47.1 × 10.7 | 61.5 g | 1.52" 498 × 498 round | Grade 4 titanium, sapphire |

**The Watch 9 44 mm case is dimensionally identical to the Watch 8 we already
model** — 46.0 × 43.7 × 8.6 mm and the same 1.47" 480 × 480 round dial, with
Samsung's own product page confirming the 8.6 mm thickness. The generation is
internal: Snapdragon SW6100 Wear Elite, Wear OS 7, ~20% more battery. Our
`watch8` spec is very close to a straight copy, but the case identity is worth
confirming against product photography before we assert it in a `watch9`
variant, since carried-over spec sheets are exactly how this kind of error
propagates.

**The Watch Ultra 2 is a family we have never modeled** (nor its 2024
predecessor): a squircle titanium case with a round display inset, a third
side key, and a 10.7 mm depth well outside the current Galaxy cushion profile.

Samsung **skipped the Classic** this generation — the lineup is Watch 9 and
Watch Ultra 2 only.

### Tablets: nothing new

The **Galaxy Tab S12+ and S12 Ultra** are Bluetooth-certified and confirmed for
H2 2026, widely reported for September. They are not out. Our Tab S11 and
S11 Ultra remain current.

---

## Apple: nothing newer has shipped

No Apple phone, tablet or watch released since our catalog's models. The next
launch is close but has not happened:

- **9 September 2026 event** (confirmed): iPhone 18 Pro, iPhone 18 Pro Max and
  the first **foldable iPhone**, plus **Apple Watch Series 12** and
  **Apple Watch Ultra 4**. Pre-orders 11 September, on sale 18 September.
- The **base iPhone 18 and 18e** slip to **spring 2027** — Apple has split the
  iPhone line into two annual waves, so our iPhone 17 stays the current
  non-Pro model for another six months.
- **iPad:** the M4 iPad Air (March 2026) is already in our catalog, and the base
  iPad stayed on A16 at that event. A full lineup refresh is reported for
  **spring 2027**; an OLED iPad mini is expected later in 2026.
- **Apple Watch Series 12 / Ultra 4:** no exterior redesign is expected, so
  our Series 11 case geometry should survive the generation.

### Two current models we never covered

Neither is *newer* than our catalog, but both are shipping hardware a user
might reasonably expect:

- **iPhone 17e** (11 March 2026) — 146.7 × 71.5 × 7.8 mm, 169 g, 6.1"
  2532 × 1170, single 48 MP camera. It has a **notch, not a Dynamic Island**,
  so it needs different front geometry from every iPhone variant we model.
- **Apple Watch Ultra 3** and **Apple Watch SE 3** (19 September 2025) — the
  Ultra 3's 1.98" 422 × 512 display is a case we don't have; the SE 3 is a
  40/44 mm entry model.
- **Galaxy S26+** — Samsung shipped S26, S26+ and S26 Ultra in February 2026.
  We model the first and third. (There is no S26 Edge; it was dropped.)

---

## What this would cost us

Ranked by value per unit of work.

| Device | Effort | Why |
| --- | --- | --- |
| Galaxy Watch 9 (44 mm) | **Trivial** | Same case as our `watch8`; a variant key and a resolution |
| Galaxy Z Flip 8 | **Low** | New `FLIP_VARIANTS` key; cover panel and its grid unchanged |
| Galaxy Z Fold 8 Ultra | **Low** | Fold 7 footprint; new inner-panel grid and a 200 MP camera cluster |
| Galaxy Z Fold 8 (wide) | **Medium** | Same hinge axis, all-new proportions, landscape-native inner display |
| Galaxy Watch Ultra 2 | **Medium** | New case archetype: titanium squircle, third key, 10.7 mm depth |
| iPhone 17e | **Medium** | First notch in the iPhone family; new front geometry |

`FOLD_VARIANTS`, `FLIP_VARIANTS` and `GALAXY_WATCH_VARIANTS` are each keyed to a
single variant today, so all three additions are `Record` extensions rather than
refactors — the specs are already shaped to hold more than one generation.

### The one open design question

**The Fold 8's inner display is natively landscape** (4:3, 2448 × 1848 wide).
Every foldable and phone in the catalog is portrait-first: `resolution` is
documented as "the CSS px width of the *portrait* display", and `orientation`
rotates from there. A device whose unfolded state is natively landscape either
needs its portrait grid defined as the rotated one (1848 × 2448, consistent with
the existing convention but backwards from how the hardware is used) or a
per-variant native orientation. That decision should be made before the spec is
written, not after.

### Resolutions still to derive

Samsung publishes no logical dp grids, so these follow the basis on the devices
page rather than a vendor figure, and each needs the `devices:sync` check to
confirm the modelled aspect agrees:

- Flip 8 main, Fold 8 Ultra cover: 2520 × 1080 FHD+ at one-third → **360 × 840**
- Flip 8 cover: unchanged from the Flip 7 → **316 × 349**
- Fold 8 Ultra inner (2504 × 2256) and Fold 8 inner (2448 × 1848) and cover
  (1248 × 1972): no clean precedent. The Fold 7's inner grid uses a ~2.4×
  divisor rather than the 3× the FHD+ panels use, so these want deciding
  deliberately.

## Sources

- [Galaxy Z Fold 8 — Wikipedia](https://en.wikipedia.org/wiki/Samsung_Galaxy_Z_Fold_8)
- [Galaxy Z Fold8 — GSMArena](https://www.gsmarena.com/samsung_galaxy_z_fold_wide_5g-14673.php)
- [Galaxy Z Fold8 Ultra — GSMArena](https://www.gsmarena.com/samsung_galaxy_z_fold8_ultra_5g-14802.php)
- [Galaxy Z Fold8 goes wide, Fold8 Ultra aims for the foldable crown — GSMArena](https://www.gsmarena.com/samsung_galaxy_z_fold8_goes_wide_fold8_ultra_aims_for_the_foldable_crown-news-73825.php)
- [Galaxy Z Flip 8 — Wikipedia](https://en.wikipedia.org/wiki/Samsung_Galaxy_Z_Flip_8)
- [Galaxy Z Flip8 — GSMArena](https://www.gsmarena.com/samsung_galaxy_z_flip8_5g-14803.php)
- [Galaxy Watch 9 — Wikipedia](https://en.wikipedia.org/wiki/Samsung_Galaxy_Watch_9)
- [Galaxy Watch9 — GSMArena](https://www.gsmarena.com/samsung_galaxy_watch9-14813.php)
- [Galaxy Watch9 — Samsung US](https://www.samsung.com/us/watches/galaxy-watch9/)
- [Galaxy Watch Ultra2 — GSMArena](https://www.gsmarena.com/samsung_galaxy_watch_ultra2-14805.php)
- [There is no Samsung Galaxy Watch 9 Classic — Tech Advisor](https://www.techadvisor.com/article/3195877/there-is-no-samsung-galaxy-watch-9-classic.html)
- [Samsung reveals the Galaxy Tab S12 series' launch timeframe — GSMArena](https://www.gsmarena.com/samsung_galaxy_tab_s12_series_launch_timeframe-news-73933.php)
- [Galaxy S26 series — Samsung US](https://www.samsung.com/us/smartphones/galaxy-s26/)
- [iPhone 18 Pro: Pre-Orders and Release Date — MacRumors](https://www.macrumors.com/2026/08/20/iphone-18-pro-preorders-release-date-when/)
- [Apple's iPhone 18 Release Schedule — MacRumors](https://www.macrumors.com/guide/iphone-18-release-schedule/)
- [What to Expect From Apple Watch Series 12 and Ultra 4 — MacRumors](https://www.macrumors.com/2026/07/26/apple-watch-series-12-ultra-4-features-rumors/)
- [Apple introduces iPhone 17e — Apple Newsroom](https://www.apple.com/newsroom/2026/03/apple-introduces-iphone-17e/)
- [iPhone 17e — Wikipedia](https://en.wikipedia.org/wiki/IPhone_17e)
- [Apple will release updates to the whole iPad lineup by spring 2027 — AppleInsider](https://appleinsider.com/articles/26/07/16/ipad-ipad-air-refreshes-are-coming-but-not-until-2027)
- [Apple Watch Ultra 3 — MacRumors](https://www.macrumors.com/roundup/apple-watch-ultra/)
