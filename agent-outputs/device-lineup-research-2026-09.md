# Device lineup research: what shipped after our catalog (September 2026)

**Date:** 2026-09-25 · **Commit:** `3a6139b` (main) · **Researcher:** Claude Code

> **Bottom line:** Apple's 9 September event has now happened, and it produced
> the first devices from either brand that are newer than anything we model:
> the **iPhone Duo** (Apple's foldable, on sale 23 October), the **iPhone 18
> Pro / Pro Max**, **Apple Watch Series 12** and **Apple Watch Ultra 4** (all on
> sale since 18 September). Samsung added one phone, the **Galaxy S26 FE**
> (4 September). Two Apple screens from March that the August report did not
> cover — the **MacBook Neo** and the **Studio Display XDR** — are also
> shipping. Everything Samsung launched in July is already in the catalog.
> The next wave (Galaxy Tab S12, OLED iPad mini, Apple's home display) is
> October or later and not out.

This continues [`device-lineup-research-2026-08.md`](device-lineup-research-2026-08.md).
The five Samsung devices it recommended were modelled in #39, so they are
treated here as catalog, not candidates.

## Scope and method

The question: which Apple and Samsung products released recently are missing
from the 3D model list? I read the catalog first (the variant tables in
`packages/react/src/core/devices/*/dimensions.ts`), then researched every
2026 launch from both brands against the vendor's own spec pages first
(apple.com tech specs, Samsung newsroom and product pages), then Wikipedia,
GSMArena and launch coverage. Every dimension below is a published hardware
figure unless it is marked as leaked. Logical resolutions are proposals
derived under the basis on the devices page, not researched facts.

### What we model today (27 devices)

| Family | Variants in the catalog |
| --- | --- |
| Galaxy phones | S26, S26 Ultra |
| Galaxy foldables | Z Fold 7, Z Fold 8 (wide), Z Fold 8 Ultra, Z Flip 7, Z Flip 8 |
| iPhone | 17, Air, 17 Pro, 17 Pro Max |
| MacBook | Air 13", Air 15", Pro 14", Pro 16" |
| iPad | Pro 13", Pro 11", Air 13", Air 11", iPad 11" |
| Galaxy Tab | S11, S11 Ultra |
| Watches | Apple Watch Series 11 (46 mm), Galaxy Watch 8, Watch 9, Watch Ultra 2 |
| Displays | Studio Display 27" (2026) |

---

## Apple: four new devices from the September event

Announced 9 September 2026 ("Surprise and shine"). The phones and watches went
on sale 18 September; the Duo pre-orders 16 October and ships 23 October.

### Phones

| Device | Folded / body (mm) | Unfolded (mm) | Weight | Display(s) | Colours |
| --- | --- | --- | --- | --- | --- |
| **iPhone Duo** | 84.1 × 117.8 × 11.3 | 164.6 × 117.8 × 5.2 | 254 g | Inner 7.6" 2670 × 1878 (430 ppi, landscape ≈10:7); outer 5.4" 1398 × 2034 (460 ppi) | Night Sky, Star White |
| **iPhone 18 Pro** | 150.0 × 71.9 × 8.75 | — | 211 g | 6.3" 2622 × 1206 | Black, Silver, Glacier, Burgundy |
| **iPhone 18 Pro Max** | 163.4 × 78.0 × 8.75 | — | 249 g | 6.9" 2868 × 1320 | Black, Silver, Glacier, Burgundy |

**The iPhone Duo is the Fold 8's shape, not the Fold 7's.** Closed it is
84.1 mm across and 117.8 mm tall — a passport, wider than any slab iPhone
(the 18 Pro Max is 78.0 mm) and 32 mm shorter than the 18 Pro. Open, it is
164.6 mm wide by 117.8 mm tall, so the inner panel is **natively landscape**,
exactly the case the Fold 8 forced us to decide in #39 (the "unrotated pose"
convention). Structurally it is a book fold on a vertical hinge, which
`FoldSpec` already carries. What it does *not* share with any Galaxy fold:

- **No inner punch hole.** The inner FaceTime camera is under the display, so
  the open pose has an uninterrupted panel. (Status-bar placement keys off the
  cutout; with none, the landscape plain-strip fallback is the right answer.)
- **Touch ID in the side button**, no Face ID — no TrueDepth array behind the
  outer panel either, just a 12 MP hole-punch camera.
- **Two rear cameras** (48 MP main + 48 MP ultra-wide), not three.
- **Grade 5 titanium** with a mirror-polished frame and a 3D-printed hinge
  cover in a contrasting micro-blasted finish. `FoldSpec.hinge.emboss` is a
  SAMSUNG wordmark today; the Duo's spine carries none.
- The inner panel has a nano-texture (matte) finish, which affects how the
  glass should reflect the stage.

Apple publishes point grids, so the logical resolutions are exact: inner
**890 × 626** (2670 × 1878 at 3×), outer **678 × 466** (2034 × 1398 at 3×).

**The iPhone 18 Pro and Pro Max are the 17 Pro chassis.** Height, width and
depth are identical to the millimetre; only weight moves (206 → 211 g,
233 → 249 g). Three exterior changes are visible on a model:

1. **A smaller Dynamic Island.** Apple moved the infrared camera under the
   display. The pre-launch leak put the cutout at 13.49 mm wide against the
   17 Pro's 20.76 mm (~35% narrower); Apple has not published a figure, so the
   width should be taken from product photography before it goes in the spec.
2. **No two-tone back.** The MagSafe window is now Ceramic Shield colour-matched
   to the aluminium unibody, so the back reads as one colour.
3. **Four new finishes:** Black, Silver, Glacier (light blue), Burgundy.

Camera plateau, lens layout, Camera Control and the Action button are
unchanged. The point grids are unchanged too (402 × 874, 440 × 956).

### Watches

| Device | Case (mm) | Weight | Display | Finishes |
| --- | --- | --- | --- | --- |
| **Apple Watch Series 12, 46 mm** | 46 × 40 × 9.7 (ceramic 47 × 41 × 9.85) | 39.5 g (Al) | 416 × 496, 1196 mm² | Al: Dark Bronze, Light Gold, Black, Space Gray · Ti: Radiant Gold, Natural · Ceramic: Pearl White, Night Blue |
| **Apple Watch Series 12, 42 mm** | 42 × 37 × 9.7 (ceramic 43 × 37 × 9.85) | 32.2 g (Al) | 374 × 446, 970 mm² | as above |
| **Apple Watch Ultra 4, 49 mm** | 49 × 44 × 12 | 63 g | 422 × 514, 1245 mm² | Natural, Black titanium |

**The Series 12 is the Series 11 case.** Identical 46 × 40 × 9.7 mm and the
same 416 × 496 panel — the same situation as Watch 9 over Watch 8, so a
`series12` variant is the Series 11 spec with new colorways. The one novelty
is a **ceramic** case option, which is 1 mm taller and wider and 0.15 mm
deeper; whether that earns its own geometry or just a finish is a judgement
call.

**The Ultra is a family we have never modelled.** The Ultra 4 case is
dimensionally identical to the Ultra 3 (September 2025): 49 × 44 × 12 mm, a
flat-sided titanium case with a crown guard, the orange Action button on the
left flank, and a flat 422 × 514 sapphire display at the largest area of any
Apple Watch. One `ultra` variant covers both generations.

### March 2026 Apple screens the August report did not cover

| Device | Dimensions (mm) | Weight | Display | Colours |
| --- | --- | --- | --- | --- |
| **MacBook Neo 13"** | 297.5 × 206.4 × 12.7 | 1.23 kg | 13.0" 2408 × 1506, 219 ppi, **no notch** | Silver, Blush, Citrus, Indigo |
| **Studio Display XDR 27"** | 623 × 478–583 × 214 on the height-adjustable stand; 33 mm deep at the VESA mount | 8.5 kg | 27" 5120 × 2880, mini-LED, 120 Hz | Silver |

The **MacBook Neo** ($599, on sale 11 March) is Apple's first notch-free
MacBook since 2022: a 1080p camera in a visibly thicker black bezel, a
smaller footprint than the Air 13 (304.1 × 215.0), one USB 3 and one USB 2
port plus a headphone jack, and four colours. `LaptopSpec.notch` would need to
be optional, which is the only structural change.

The **Studio Display XDR** ($1,599 and up, on sale 11 March) replaces the
Pro Display XDR. Its face is the catalog's Studio Display (same 623 mm width,
same 27" 5K panel), but the housing is 2 mm deeper (33 vs 31 mm at the VESA
mount), it sits on a **height-adjustable** stand that is 214 mm deep against
the tilt stand's 168, and it weighs 8.5 kg to the standard's 6.3. As a model
it is the existing display with a new stand and a slightly thicker back.

### Same-chassis refreshes already covered

The MacBook Air (M5), MacBook Pro 14"/16" (M5 Pro / M5 Max), iPad Air (M4)
and the 2026 Studio Display all shipped in March in unchanged enclosures. The
coverage is explicit that the MacBook Pro's chassis, ports and display
hardware did not change. Our specs remain current for all of them.

### Current-generation gaps (not new, still missing)

- **iPhone 17e** (11 March 2026) — 146.7 × 71.5 × 7.8 mm, 169 g, 6.1"
  2532 × 1170, **notch** rather than Dynamic Island, a single 48 MP rear
  camera (Apple lists its "2× Telephoto" as a sensor crop of the one lens),
  Action button, no Camera Control. Black, White, Soft Pink.
- **Apple Watch Ultra 3** — covered by the Ultra 4 case above.
- **Apple Watch SE 3** (September 2025) — 44 × 38 × 10.7 mm (368 × 448) and
  40 × 34 × 10.7 mm (324 × 394). The rounded-square SE case is the Series 4–6
  shape, not the Series 7+ one we model.

---

## Samsung: one new phone, two 2026 devices we never covered

### Shipped since the August report

| Device | Body (mm) | Weight | Display | Colours | On sale |
| --- | --- | --- | --- | --- | --- |
| **Galaxy S26 FE** | 161.6 × 76.9 × 7.4 | 193 g | 6.7" 1080 × 2340, 385 ppi | Pistachio, Graphite, Blueberry | 4 Sep 2026 |

The S26 FE (announced 27 August) is its own body — taller and wider than the
S26+ at a lower resolution — with a triple camera in a **new camera island**
per the launch renders, so it is not an S26 scaled up. Gorilla Glass Victus+
front and back, aluminium frame.

### Shipped earlier in 2026, never modelled

| Device | Folded / body (mm) | Unfolded (mm) | Weight | Display(s) | Colours |
| --- | --- | --- | --- | --- | --- |
| **Galaxy S26+** | 158.4 × 75.8 × 7.3 | — | 190 g | 6.7" 3120 × 1440 | Cobalt Violet, White, Black, Sky Blue (+ Pink Gold, Silver Shadow on samsung.com) |
| **Galaxy Z TriFold** | 159.2 × 75 × 12.9 | 159.2 × 214.1 × 3.9–4.2 | 309 g | Inner 10.0" 2160 × 1584; cover 6.5" 2520 × 1080 | Crafted Black |

**The S26+** is the obvious gap: the S26 design at a middle size, same
vertical camera stack, same rails. The S26 Edge was cancelled in October 2025
and never shipped.

**The Z TriFold is a curiosity, not a target.** It reached the US on
30 January 2026 as a "limited run", Samsung stopped sales in Korea and the US
in March, and it has been "completely sold out" since a final restock on
10 April. A successor is rumoured for 2027 and reportedly delayed. Modelling
it would also mean a second hinge: it is a G-fold with two differently sized
hinges, both wings folding inward over the 10" panel, the cover screen on one
wing and the camera housing on the other, with a mandatory fold order (camera
side last). `FoldSpec` is a two-slab, one-hinge model. Low value, high cost.

### Still missing from 2025

- **Galaxy Watch 8 Classic** (July 2025) — 46.4 × 46 × 10.6 mm, 63.5 g,
  1.34" 438 × 438, the rotating bezel, in Black and White. There is no Watch 9
  Classic, so this is the current Classic.

### A new family, if wanted: Galaxy Book6 (CES, January 2026)

We model no Windows laptops, and Samsung's 2026 line is complete:

| Device | Dimensions (mm) | Weight | Display |
| --- | --- | --- | --- |
| Galaxy Book6 Pro 14" | 314.2 × 220.6 × 11.6 | 1.24 kg | 14" 2880 × 1800 OLED, 120 Hz |
| Galaxy Book6 Pro 16" | 356.9 × 248.0 × 11.9 | 1.59 kg | 16" 2880 × 1800 OLED, 120 Hz |
| Galaxy Book6 Ultra 16" | 356.9 × 248.0 × 15.4 | — | 16" 2880 × 1800 OLED, 120 Hz |
| Galaxy Book6 Edge 16" | 12.3 mm thick (width/depth not yet confirmed) | 1.55 kg | 16" 2880 × 1800 OLED (one source says 2880 × 1200; verify) |

The Book6 base model and Edge shipped later (the Edge launched quietly in
April on Snapdragon X2 Elite). This is a brand-new family for the catalog, so
it is listed for completeness rather than recommended.

### Tablets: nothing new, but October is close

The **Galaxy Tab S12+ and S12 Ultra** are widely reported for a **7 October
2026** launch (there is no base S12 this year). The leaks put the S12+ at
12.6" 2800 × 1752, 5.3 mm and 555 g, and the Ultra on the S11 Ultra's 14.6"
2960 × 1848 panel at 5.1 mm. None of that is official yet; our Tab S11 and
S11 Ultra remain current.

---

## Not out yet (as of 25 September 2026)

| Product | Expected | Notes |
| --- | --- | --- |
| Galaxy Tab S12+ / S12 Ultra | 7 Oct 2026 | Leaked specs above |
| iPad mini (OLED, 8.4–8.5") | by end of October 2026 | Gurman; 60 Hz panel |
| Apple smart home display (~7" square, tvOS-based) | as soon as October 2026 | Tabletop on a speaker base, or wall mount |
| iPhone 18, iPhone 18e, iPhone Air 2 | spring 2027 | Apple split the iPhone year; Air 2 slipped from this September |
| iPad 12 (A19) | Q1 2027 at the earliest | LCD, same body expected |
| OLED / touchscreen MacBook Pro (M6) | late 2026 or 2027 | Rumoured redesign |
| Galaxy Z TriFold 2 | 2027 | Reportedly delayed |

Things that do not exist: Galaxy S26 Edge (cancelled), Galaxy Watch 9
Classic (skipped), Galaxy Z Flip 8 FE (none announced).

---

## What this would cost us

Ranked by value per unit of work.

| Device | Effort | Why |
| --- | --- | --- |
| **iPhone 18 Pro / Pro Max** | **Trivial–Low** | 17 Pro chassis; narrower island (measure it), colour-matched MagSafe window, four colorways |
| **Apple Watch Series 12** | **Trivial** | Series 11 case; eight colorways; ceramic is +1 mm if modelled |
| **Galaxy S26+** | **Low** | S26 design at 158.4 × 75.8 × 7.3; six colorways |
| **Studio Display XDR** | **Low** | Same face; +2 mm housing, height-adjustable stand |
| **Galaxy S26 FE** | **Low–Medium** | Own body and camera island; three colorways |
| **MacBook Neo** | **Low–Medium** | Notchless `LaptopSpec` (make `notch` optional), thicker bezel, two-port left rail, four colours |
| **iPhone Duo** | **Medium** | Fold 8 form on the existing `FoldSpec`; needs no inner hole, no spine wordmark, Touch ID side key, dual camera, mirror titanium |
| **Apple Watch Ultra (3/4)** | **Medium** | New case archetype: flat-sided 49 mm titanium, crown guard, orange Action button, flat display |
| **iPhone 17e** | **Medium** | First notch in the iPhone family (unchanged from August) |
| **Galaxy Watch 8 Classic** | **Medium** | Rotating bezel on the cushion case |
| **Galaxy Book6 family** | **High** | New brand family; four bodies |
| **Galaxy Z TriFold** | **High** | Two hinges and three panels; discontinued hardware |

The top four are all `Record` extensions of specs that already hold more than
one generation. The iPhone Duo is the one worth planning: it is the highest
profile device of the year, and the August report's landscape-inner-panel
decision means the geometry question is already settled.

### Open design questions

1. **Which component owns the iPhone Duo?** `FoldMockup` renders a Galaxy —
   the spine wordmark, the punch holes and the Galaxy colorway table are baked
   into `FoldSpec`. Either the spec grows brand-conditional fields (optional
   inner hole, optional emboss, a Touch ID side key) and the Duo becomes a
   `FoldMockup` variant, or it gets its own `IPhoneDuoMockup` that reuses the
   fold geometry under an iPhone skin. The second keeps the public API honest
   (`IPhoneMockup variant="duo"` is what users will reach for) at the cost of
   a new binding.
2. **The Ultra watch case.** `WatchSpec` knows two constructions, Apple
   squircle-plus-crown and Galaxy cushion-plus-dial. The Ultra is a third:
   flat sides, a raised crown guard, a flat (not domed) crystal, and an extra
   key that is orange on every finish, the same rule the Galaxy Watch Ultra 2's
   Quick Button already follows.
3. **The Neo's bezel.** Every laptop in the catalog has a notch and a near-zero
   bezel; the Neo has a bezel wide enough to read as a design feature. A
   `bezel` figure on `LaptopSpec.display` is probably needed, not just
   `notch?: undefined`.

### Resolutions still to derive

Apple's are exact point grids; Samsung's follow the devices-page basis and
need the `devices:sync` check:

- iPhone Duo: inner **890 × 626**, outer **678 × 466** (3×, exact)
- iPhone 18 Pro / Pro Max: **402 × 874** / **440 × 956** (unchanged)
- Apple Watch Series 12 46 mm: **416 × 496**; Ultra: **422 × 514** (exact)
- MacBook Neo: 2408 × 1506 at 2× is **1204 × 753**; check what macOS
  reports as the default "looks like" size
- Studio Display XDR: **2560 × 1440** (as the Studio Display)
- Galaxy S26+ (QHD+): One UI's default FHD+ at one-third → **360 × 780**, as
  the S26 Ultra
- Galaxy S26 FE (FHD+): **360 × 780** at one-third
- Galaxy Watch 8 Classic: **438 × 438** at 1×, as the 40 mm Watch 9

## Sources

### Apple

- [Apple unveils iPhone Duo — Apple Newsroom](https://www.apple.com/newsroom/2026/09/apple-unveils-iphone-duo/)
- [iPhone Duo — Technical Specifications — Apple](https://www.apple.com/iphone-duo/specs/)
- [iPhone Duo: Everything We Know — MacRumors](https://www.macrumors.com/roundup/iphone-duo/)
- [iPhone 18 Pro and 18 Pro Max — Technical Specifications — Apple](https://www.apple.com/iphone-18-pro/specs/)
- [iPhone 18 Pro: Everything We Know — MacRumors](https://www.macrumors.com/roundup/iphone-18-pro/)
- [iPhone 18 Pro Dynamic Island to Shrink, Add Third Live Activity — MacRumors](https://www.macrumors.com/2026/09/09/iphone-18-pro-dynamic-island-to-shrink/)
- [iPhone 18 Pro: Leaker Reveals Alleged Size of Smaller Dynamic Island — MacRumors](https://www.macrumors.com/2026/01/23/iphone-18-pro-alleged-dynamic-island-size/)
- [Apple Watch Series 12 — Technical Specifications — Apple](https://www.apple.com/apple-watch-series-12/specs/)
- [Apple Watch Ultra 4 — Technical Specifications — Apple](https://www.apple.com/apple-watch-ultra-4/specs/)
- [Apple Watch Series 12 and Ultra 4 unveiled — 9to5Mac](https://9to5mac.com/2026/09/09/apple-watch-series-12-and-ultra-4-unveiled-with-upgraded-health-tracking-system/)
- [Apple Watch Ultra 3 — Tech Specs — Apple Support](https://support.apple.com/en-us/125095)
- [Apple Watch SE 3 — Tech Specs — Apple Support](https://support.apple.com/en-us/125094)
- [iPhone 17e — Technical Specifications — Apple](https://www.apple.com/iphone-17e/specs/)
- [MacBook Neo — Tech Specs — Apple Support](https://support.apple.com/en-us/126322)
- [Daring Fireball: The MacBook Neo](https://daringfireball.net/2026/03/the_macbook_neo)
- [Apple unveils new Studio Display and all-new Studio Display XDR — Apple Newsroom](https://www.apple.com/newsroom/2026/03/apple-unveils-new-studio-display-and-all-new-studio-display-xdr/)
- [Studio Display XDR — Technical Specifications — Apple](https://www.apple.com/studio-display-xdr/specs/)
- [Studio Display (2026) — Tech Specs — Apple Support](https://support.apple.com/en-us/126324)
- [Apple's Biggest Week of 2026: Every New Product Announced — MacRumors](https://www.macrumors.com/2026/03/04/apple-march-2026-product-releases/)
- [Apple introduces MacBook Pro with all-new M5 Pro and M5 Max — Apple Newsroom](https://www.apple.com/newsroom/2026/03/apple-introduces-macbook-pro-with-all-new-m5-pro-and-m5-max/)
- [Apple introduces new Mac Studio with M5 Max and M5 Ultra — Apple Newsroom](https://www.apple.com/newsroom/2026/08/apple-introduces-new-mac-studio-with-m5-max-and-m5-ultra/)
- [iPhone Air 2 is coming, here's everything we know — 9to5Mac](https://9to5mac.com/2026/07/21/iphone-air-2-is-coming-heres-everything-we-know-so-far/)
- [New OLED iPad mini expected by the end of October — 9to5Mac](https://9to5mac.com/2026/08/30/apples-next-ipad-mini-is-almost-here-heres-what-to-expect/)
- [Here's When to Expect the iPad 12 to Launch — MacRumors](https://www.macrumors.com/2026/07/16/ipad-12-release-date/)
- [Apple Smart Home Display Coming as Soon as Next Month — MacRumors](https://www.macrumors.com/2026/09/21/apple-smart-home-display-coming-next-month/)
- [Apple's 2026 and 2027 Mac Roadmap — MacRumors](https://www.macrumors.com/2026/07/27/mac-roadmap-2026/)

### Samsung

- [Galaxy Unpacked July 2026 — Samsung UK](https://www.samsung.com/uk/support/mobile-devices/galaxy-unpacked/)
- [Galaxy Unpacked February 2026 replay — Samsung Newsroom US](https://news.samsung.com/us/samsung-galaxy-unpacked-february-2026-next-ai-phone-makes-life-easier/)
- [Samsung Galaxy S26 — Wikipedia](https://en.wikipedia.org/wiki/Samsung_Galaxy_S26)
- [Samsung Galaxy S26+ — GSMArena](https://www.gsmarena.com/samsung_galaxy_s26+_5g-14457.php)
- [Galaxy S26 series colours — Beebom](https://gadgets.beebom.com/guides/samsung-galaxy-s26-series-colours)
- [Samsung Galaxy S26 FE — Samsung Mobile Press](https://www.samsungmobilepress.com/articles/galaxy-s26-fe-latest-flagship-experience-what-matters-most)
- [Samsung Galaxy S26 FE — GSMArena](https://www.gsmarena.com/samsung_galaxy_s26_fe_5g-14870.php)
- [Galaxy S26 FE — Samsung US](https://www.samsung.com/us/smartphones/galaxy-s26-fe/)
- [Introducing Galaxy Z TriFold — Samsung Global Newsroom](https://news.samsung.com/global/introducing-galaxy-z-trifold-the-shape-of-whats-next-in-mobile-innovation)
- [Samsung Galaxy Z TriFold — Wikipedia](https://en.wikipedia.org/wiki/Samsung_Galaxy_Z_TriFold)
- [How to fold the Samsung Galaxy Z TriFold properly — Samsung](https://www.samsung.com/us/support/answer/ANS10010261/)
- [Samsung says Galaxy Z TriFold's 'limited run' is now 'completely sold out' — 9to5Google](https://9to5google.com/2026/04/17/samsung-says-galaxy-z-trifolds-limited-run-is-now-completely-sold-out/)
- [Galaxy Z TriFold officially being discontinued — 9to5Google](https://9to5google.com/2026/03/17/galaxy-z-trifold-officially-being-discontinued-likely-wont-be-restocked-online/)
- [Samsung Galaxy Watch8 Classic — GSMArena](https://www.gsmarena.com/samsung_galaxy_watch8_classic-13998.php)
- [Galaxy Watch Ultra2 and Watch9 sizes — GSMArena](https://www.gsmarena.com/the_galaxy_watch_ultra2_is_slimmer_and_has_a_huge_battery_watch9_arrives_in_40mm_and_44mm_sizes-news-73831.php)
- [Galaxy Tab S12+ and S12 Ultra specs leak — GSMArena](https://www.gsmarena.com/galaxy_tab_s12_and_s12_ultra_specs_leak__heres_what_will_be_upgraded-news-74731.php)
- [Samsung Galaxy Tab S12 Ultra (rumoured) — GSMArena](https://www.gsmarena.com/samsung_galaxy_tab_s12_ultra_5g-14811.php)
- [Galaxy Book6 Pro — Samsung US](https://www.samsung.com/us/computers/galaxy-book/galaxy-book6-pro/)
- [Galaxy Book6 Ultra — Samsung India specs](https://www.samsung.com/in/computers/galaxy-book/galaxy-book6-ultra-ultra-7-32gb-1tb-np960ujg-kg2in/)
- [Samsung Galaxy Book6 Pro (14") — LaptopMedia](https://laptopmedia.com/series/samsung-galaxy-book6-pro-14/)
- [Samsung Galaxy Book6 Edge launched — 91mobiles](https://www.91mobiles.com/hub/samsung-galaxy-book6-edge-launched-price-specifications/)
- [Samsung Galaxy Book6 Edge — Liliputing](https://liliputing.com/samsung-galaxy-book6-edge-is-a-thin-light-and-expensive-laptop-with-snapdragon-x2-elite/)
