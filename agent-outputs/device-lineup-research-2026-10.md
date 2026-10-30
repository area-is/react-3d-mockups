# Device lineup research: what shipped after our catalog (October 2026)

**Date:** 2026-10-30 · **Commit:** `a82f1d2` (main) · **Researcher:** Claude Code

> **Bottom line:** October produced **six** Apple and Samsung screens newer
> than anything we model. Samsung's are already on sale: the **Galaxy Tab S12
> Ultra** (the Tab S11 Ultra's body, so close to a copy) and the **Galaxy Tab
> S12+** (a 12.6" size we have never had). Apple's go on sale in November: the
> **MacBook Pro with PROLED XDR display** in 14" and 16" (new bodies, touch,
> and a Dynamic Island in place of the notch) and the **OLED iPad mini** on
> 6 November, and the square-screened **HomeView** home hub on 13 November.
> The M6 iMac and the M6 14" MacBook Pro kept their old enclosures. The
> current-generation gaps from September (Galaxy S26+, S26 FE, Studio Display
> XDR, iPhone 17e) are all still open.

This continues [`device-lineup-research-2026-09.md`](device-lineup-research-2026-09.md).
Everything it recommended from Apple's September event was modelled in #50,
so those devices count as catalog here, not candidates.

## Scope and method

The question: which Apple and Samsung devices released recently are missing
from the catalog? I read the catalog first (`DEVICE_LINEUP` in
`packages/react/src/core/lifecycle.ts`, the variant tables in
`packages/react/src/core/devices/*/dimensions.ts` and the table in
`apps/docs/content/docs/devices.mdx`). Then I checked every launch since
25 September against the vendor's own pages first (apple.com tech specs and
newsroom, Samsung product pages), then launch coverage. Every dimension below
is a published hardware figure. Bezels and logical resolutions are derived
from those figures, and are marked as derived.

### What we model today (33 devices)

| Family | Variants in the catalog |
| --- | --- |
| Galaxy phones | S26, S26 Ultra |
| Galaxy foldables | Z Fold 7, Z Fold 8 (wide), Z Fold 8 Ultra, Z Flip 7, Z Flip 8 |
| iPhone | 17, Air, 17 Pro, 17 Pro Max, 18 Pro, 18 Pro Max, Duo |
| MacBook | Air 13", Air 15", Pro 14", Pro 16", Neo 13" |
| iPad | Pro 13", Pro 11", Air 13", Air 11", iPad 11" |
| Galaxy Tab | S11, S11 Ultra |
| Watches | Apple Watch Series 11, Series 12, Ultra 4 · Galaxy Watch 8, Watch 9, Watch Ultra 2 |
| Displays | Studio Display 27" (2026) |

---

## Samsung: two tablets, both on sale

Announced 30 September 2026. On sale 7 October in most markets, 8 October in
the US, at $1,199 (S12+) and $1,399 (S12 Ultra). This year has no base Tab S12,
so the Tab S11 is still Samsung's current 11".

| Device | Body (mm) | Weight | Display | Rear cameras | Colours |
| --- | --- | --- | --- | --- | --- |
| **Galaxy Tab S12 Ultra** | 326.3 × 208.5 × 5.1 | 692 g (Wi-Fi), 695 g (5G) | 14.6" 2960 × 1848, 120 Hz | 13 MP + 8 MP ultra-wide, two protruding rings + flash | Gray, Silver |
| **Galaxy Tab S12+** | 289.5 × 187.8 × 5.3 | 553 g (Wi-Fi), 555 g (5G) | 12.6" 2800 × 1752, 120 Hz | 13 MP, single ring | Gray, Silver |

**The Tab S12 Ultra is the Tab S11 Ultra.** Body, panel and resolution match
the `tabs11ultra` spec to the tenth of a millimetre. GSMArena's review
describes the same small, wide front-camera notch on the landscape-top edge,
the same two protruding rear rings with a flash, power and volume on the top
edge, and an Armor Aluminum unibody. The colour names are the S11 Ultra's too:
**Gray and Silver**, the `GALAXY_TAB_COLORS` pair. This matches the Watch 9
over the Watch 8: a `tabs12ultra` row is the S11 Ultra spec under a new name,
and it supersedes `tabs11ultra` through the shared `Galaxy Tab S Ultra` line.

**The Tab S12+ is a size we have never modelled.** There was no Tab S11+, so
it starts a line of its own (`Galaxy Tab S+`). Its proportions follow the
house style:

- Panel 271.3 × 169.8 mm (derived: 12.6" at 2800 : 1752) in a 289.5 × 187.8
  body, so a uniform **~9 mm bezel**. That is close to the Tab S11's 8.5 mm,
  which suggests a bezel-mounted front camera like the S11's, not the Ultra's
  notch. Confirm this from product photography before writing the spec.
- One rear ring and no second lens, as on the Tab S11.
- Logical grid at the Galaxy Tab xhdpi basis (half scale): **876 × 1400**
  portrait, 1400 × 876 landscape (derived).

### Not worth a model: Samsung W27

Samsung's China-only W-series luxury foldable launched in China on
29 October. Reports describe a **Galaxy Z Fold 8 Ultra** with a blue-and-gold
finish and different back branding. That is a colorway on an existing spec at
most, for one market.

---

## Apple: four screens, three of them new designs

### MacBook Pro with PROLED XDR display (14" and 16")

Announced 28 October. Pre-orders the same day, on sale 6 November, from
$2,899 (14") and $3,399 (16") with M5 Pro or M5 Max. **The mini-LED MacBook
Pros stay on sale alongside it.** Both sizes are touchscreen Macs, the first.

| Device | Body, closed (mm) | Weight | Display | Colours |
| --- | --- | --- | --- | --- |
| **MacBook Pro 14" PROLED XDR** | 310.8 × 216.3 × 15.0 | 1.38 kg (M5 Pro), 1.40 kg (M5 Max) | 14.2" 3024 × 1986, 254 ppi, tandem OLED, 10–120 Hz, touch | Space Black, Silver |
| **MacBook Pro 16" PROLED XDR** | 355.5 × 244.2 × 16.0 | 1.82 kg (M5 Pro), 1.84 kg (M5 Max) | 16.3" 3472 × 2266, 254 ppi, tandem OLED, 10–120 Hz, touch | Space Black, Silver |

Against our `pro14` (312.6 × 221.2 × 15.5) and `pro16` (355.7 × 248.1 × 16.8)
these are new bodies: a few millimetres smaller in every direction, and
200–700 g lighter. What a model would need, from most to least visible:

1. **A Dynamic Island instead of the notch.** Apple's spec page lists it, and
   coverage confirms the notch is gone. Apple publishes no size or position,
   and macOS draws the island over a camera cutout, so the cutout has to be
   measured from product photography, the same way the iPhone 18 Pro's
   narrower island was. `LaptopSpec.notch` is a cutout that reaches the top
   edge. An island floats below it, so this needs a new field (an `island`
   rect, or a notch with a top offset) rather than new numbers.
2. **Thinner bezels.** Derived from the published figures, the panels are
   302.4 × 198.6 mm (14") and 347.2 × 226.6 mm (16"). That leaves about
   **4.2 mm** side bezels on both, against 5.1 mm on the current 14". The
   gained 0.1" of diagonal on the 16" (16.2 → 16.3) comes from the same
   change. The panel is also 22 px taller (1986 vs 1964): pixels that used to
   be the menu bar beside the notch are now a full row.
3. **A glowing Apple logo on the lid**, the first since 2016. That is an
   emissive material on the existing lid logo, not geometry.
4. Unchanged: the same ports on each side (MagSafe 3, two Thunderbolt 5 and the
   headphone jack on the left; SDXC, Thunderbolt 5 and HDMI on the right),
   Touch ID in the keyboard, no Face ID. Apple mentions a stiffer hinge for
   touch, but nothing visible.

Logical grids at 2× (Apple's exact point grids, to be confirmed against
macOS's default "looks like" size): **1512 × 993** (14") and **1736 × 1133**
(16").

### iPad mini (A20 Pro, OLED)

Announced 26 October. Pre-orders 28 October, on sale 6 November, from $699.
The catalog has never had an iPad mini.

| Device | Body (mm) | Weight | Display | Colours |
| --- | --- | --- | --- | --- |
| **iPad mini (A20 Pro)** | 195.3 × 132.6 × 5.4 | 255 g (Wi-Fi), 263 g (cellular) | 8.5" 2316 × 1512, 326 ppi, OLED, 60 Hz | Midnight, Starlight |

Against the A17 Pro mini (195.4 × 134.8 × 6.3 mm, 297 g, 8.3") it is a new
body: 2.2 mm narrower, 0.9 mm thinner, with a larger panel. Derived, the panel
is 180.4 × 117.8 mm, which leaves a uniform **~7.4 mm bezel**. The old
mini's was ~9.4 mm, about the "24 percent thinner" Apple quotes. Details
that matter for a model:

- **Touch ID in the top button**, as on the iPad Air and iPad 11".
- **The front camera on the landscape edge** (12 MP Center Stage), where the
  A17 Pro mini had it on the short edge.
- **No speaker grilles.** Apple's "Acoustic Display" drives woofers through the
  glass and hides the tweeters between the glass and the enclosure.
  `TabletSpec.speakers` is already optional, so the spec just leaves it out.
- One 12 MP rear lens with an Adaptive True Tone flash, Apple Pencil Pro
  magnetic connector, USB-C, IP67.

Logical grid at 2×: **756 × 1158** portrait, 1158 × 756 landscape (derived
from Apple's 2× iPad scale; check Apple's published point size).

### HomeView (tabletop and wall)

Announced 13 October. Pre-orders the same day, on sale **13 November** (not
yet shipping), $299 for either model. Not sold in the EU.

| Device | Size (mm) | Weight | Display | Colours |
| --- | --- | --- | --- | --- |
| **HomeView (tabletop)** | 145.5 wide · 136.7–173.2 tall · 96.0–130.2 deep (both vary with tilt) | 952 g | 7" (6.98") **square** 1088 × 1088, 220 ppi | Silver, Starlight, Rose Pink, Space Gray |
| **HomeView (wall)** | 145.5 × 145.5 × 9.8 | 286 g | as above | Silver, Space Gray |

This is a new kind of device for the catalog: a square 145.5 mm display face
on a stainless-steel hinge over a round aluminium speaker base, or a flat
slab for the wall. It is a strong mockup target, because it is the screen
Apple's smart-home UI will be shown on. Derived, the panel is 125.6 mm square
in a 145.5 mm face, about a **10 mm bezel**. The logical grid at 2× would be
544 × 544, but Apple has not published one, so that is a guess until
developer documentation lands. The square panel is also a first for
`orientation`, where portrait and landscape are the same.

### Same-enclosure refreshes (nothing to change)

- **MacBook Pro 14" (M6)**, announced 27 October, on sale 6 November.
  Apple's spec page gives 312.6 × 221.2 × 15.5 mm and 3024 × 1964, our
  `pro14` exactly. The mini-LED 16" stays on M5 Pro / M5 Max.
- **iMac (M6)**, announced 27 October. A spec bump in the 2021 enclosure and
  colours. We model no iMac. It has been a current Apple screen since 2021,
  so it is a gap rather than a new device (see below).

---

## Still missing from earlier reports

All of these are still current models with no row in `DEVICE_LINEUP`:

| Device | Since | Why it is still worth it |
| --- | --- | --- |
| **Galaxy S26+** | Feb 2026 | The S26 design at 158.4 × 75.8 × 7.3; the only missing size of Samsung's flagship |
| **Galaxy S26 FE** | Sep 2026 | Own body (161.6 × 76.9 × 7.4) and camera island |
| **Studio Display XDR** | Mar 2026 | Same 27" 5K face; +2 mm housing and a height-adjustable stand |
| **iPhone 17e** | Mar 2026 | The only notched iPhone on sale; single camera |
| **Galaxy Watch 8 Classic** | Jul 2025 | Rotating bezel; still the current Classic |
| **Apple Watch SE 3** | Sep 2025 | Older rounded-square case |
| **iMac 24"** | 2021 (M6, Oct 2026) | New family; a stand-mounted 4.5K screen |
| **Galaxy Book6 family** | Jan 2026 | New family; four bodies |
| **Galaxy Z TriFold** | Dec 2025 | Two hinges; discontinued |

## Not out yet (as of 30 October 2026)

| Product | Expected | Notes |
| --- | --- | --- |
| iPhone 18, iPhone 18e, iPhone Air 2 | spring 2027 | Unchanged from September |
| iPad 12 (A19) | 2027 | Same body expected |
| Galaxy S27 series | early 2027 | Unpacked usually in February |
| Larger HomeView (J595, ~9", motorised arm) | 2027–28 | Gurman, rumour only |
| Galaxy Z TriFold 2 | 2027 | Reportedly delayed |

---

## Recommendation

Ranked by value per unit of work. The first four are the ones I would add.

| Device | Effort | Why |
| --- | --- | --- |
| **Galaxy Tab S12 Ultra** | **Trivial** | The S11 Ultra spec and colorways under a new id; supersedes `tabs11ultra` |
| **MacBook Pro PROLED XDR 14" / 16"** | **Medium** | The season's most visible Apple redesign: new bodies, ~4.2 mm bezels, a Dynamic Island cutout (new `LaptopSpec` field), lit logo |
| **iPad mini (A20 Pro)** | **Low** | New line in the `ipad` kind; no speaker runs, landscape front camera, Touch ID top button like the Air |
| **Galaxy Tab S12+** | **Low–Medium** | New 12.6" line; S11-style single ring, likely a bezel camera (confirm) |
| **HomeView** | **Medium–High** | New kind (square panel, tilting base, wall slab). Wait until it ships on 13 November and photography is out |
| *(from September)* Galaxy S26+, Studio Display XDR | Low | Still the cheapest gaps in the catalog |

### Proposed `DEVICE_LINEUP` rows

```ts
galaxyTab: {
  // …
  tabs12plus: { name: 'Galaxy Tab S12+', line: 'Galaxy Tab S+', announced: '2026-09' },
  tabs12ultra: { name: 'Galaxy Tab S12 Ultra', line: 'Galaxy Tab S Ultra', announced: '2026-09' },
},
ipad: {
  // …
  ipadmini: { name: 'iPad mini', line: 'iPad mini', announced: '2026-10' },
},
laptop: {
  // …
  // Not the 'MacBook Pro 14″' line: Apple still sells the mini-LED models, so
  // the PROLED models must not supersede pro14 / pro16.
  proled14: { name: 'MacBook Pro 14″ PROLED XDR', line: 'MacBook Pro 14″ PROLED', announced: '2026-10' },
  proled16: { name: 'MacBook Pro 16″ PROLED XDR', line: 'MacBook Pro 16″ PROLED', announced: '2026-10' },
},
```

The variant ids are suggestions. Note that `tabs12ultra` makes `tabs11ultra`
*superseded* in the docs sidebar automatically, which is correct, because
Samsung has replaced it.

### Open design questions

1. **Is the PROLED MacBook Pro its own line?** Putting it in the
   `MacBook Pro 14″` line would mark the mini-LED `pro14` superseded and fold
   it under "older models" while Apple still sells it as the cheaper Pro. I
   would keep separate lines, as the iPhone Pro and Pro Max are, because the
   two ranges are refreshed separately (the M6 went into the mini-LED 14" a day
   before the PROLED models were announced on M5 Pro / M5 Max).
2. **Where does the island go in `LaptopSpec`?** Either `notch` grows a
   `top` offset (an island is a notch that does not touch the edge) or a
   separate `island?` field sits beside `notch?`, mutually exclusive. The
   second reads better and can take `IPhoneSpec.island`'s shape as it is
   (`{ width, height, offsetY }`, offset from the top display edge).
3. **HomeView's kind.** It is neither a tablet (it never leaves its base) nor
   a `StudioDisplay` (a 27" landscape panel with no variants). A small
   `homeView` kind with `tabletop` and `wall` variants is the cleanest fit.
   Its tilt is a prop like the laptop's `openAngle`.

## Sources

### Samsung

- [Galaxy Tab S12 Ultra — Samsung UK](https://www.samsung.com/uk/tablets/galaxy-tab-s/galaxy-tab-s12-ultra-grey-256gb-sm-x940nzareub/)
- [Galaxy Tab S12+ — Samsung India](https://www.samsung.com/in/tablets/galaxy-tab-s/galaxy-tab-s12-plus-gray-256gb-sm-x840nzaainu/)
- [Galaxy Tab S12 Ultra & S12+: release date, price, specs — Samsung Malaysia](https://www.samsung.com/my/mobile/mobile-phone-buying-guide/galaxy-tab-s12-ultra-s12-plus-price-specs/)
- [Galaxy Tab S12 series announced, starts at $1,199 — Droid Life](https://www.droid-life.com/2026/09/30/galaxy-tab-s12-series-announced-starts-at-1199/)
- [Samsung introduces Galaxy Tab S12+ and Tab S12 Ultra — MobiDevices](https://mobidevices.com/en/galaxy-tab-s12)
- [Galaxy Tab S12 Ultra review: design and build — GSMArena](https://www.gsmarena.com/samsung_galaxy_tab_s12_ultra-review-3005p2.php)
- [Samsung Galaxy Tab S12 Ultra — GSMArena](https://www.gsmarena.com/samsung_galaxy_tab_s12_ultra_5g-14811.php)
- [Samsung Galaxy Tab S12 Plus — PhoneArena](https://www.phonearena.com/phones/Samsung-Galaxy-Tab-S12-Plus_id12973)
- [Galaxy Tab S12 Ultra leaked and not much changed — Android Central](https://www.androidcentral.com/tablets/samsung-galaxy-tab/looks-like-the-galaxy-tab-s12-ultra-leaked-and-yeah-not-much-changed)
- [Samsung is releasing a new foldable next week (W27) — 9to5Google](https://9to5google.com/2026/10/23/samsung-galaxy-w27-foldable-leak/)
- [This is Samsung's next foldable — GSMArena](https://www.gsmarena.com/this_is_samsungs_next_foldable_and_its_launching_in_just_a_few_days-news-75178.php)

### Apple

- [MacBook Pro with PROLED XDR Display — Technical Specifications — Apple](https://www.apple.com/macbook-pro/proled-xdr-display/specs/)
- [MacBook Pro — Technical Specifications (mini-LED, M6) — Apple](https://www.apple.com/macbook-pro/specs/)
- [Apple Announces OLED MacBook Pro With Touch Display — MacRumors](https://www.macrumors.com/2026/10/28/apple-new-macbook-pro/)
- [Apple announces all-new MacBook Pro with PROLED XDR display — 9to5Mac](https://9to5mac.com/2026/10/28/apple-announces-redesigned-macbook-pro-its-first-touchscreen-mac/)
- [Apple announces new MacBook Pro models with OLED and touchscreen — GSMArena](https://www.gsmarena.com/apple_announces_new_macbook_pro_models_with_oled_and_touchscreen-news-75254.php)
- [MacBook Pro with PROLED XDR Display — 512 Pixels](https://512pixels.net/2026/10/macbook-pro-with-proled-xdr-display/)
- [Apple introduces the new 14-inch MacBook Pro with M6 — Apple Newsroom](https://www.apple.com/newsroom/2026/10/apple-introduces-the-new-14-inch-macbook-pro-with-m6/)
- [Here's Everything Apple Announced This Week — MacRumors](https://www.macrumors.com/2026/10/28/apple-announcements-october-2026/)
- [Apple gives iPad mini its biggest update ever — Apple Newsroom](https://www.apple.com/in/newsroom/2026/10/apple-gives-ipad-mini-its-biggest-update-ever/)
- [iPad mini — Technical Specifications — Apple](https://www.apple.com/ipad-mini/specs/)
- [Apple unveils all-new iPad mini — 9to5Mac](https://9to5mac.com/2026/10/26/new-ipad-mini-features-release-date-price/)
- [Apple HomeView — Technical Specifications — Apple](https://www.apple.com/apple-homeview/specs/)
- [Welcome Home: Everything Apple Announced on October 13 — MacRumors](https://www.macrumors.com/2026/10/13/apple-october-13-recap/)
- [Apple HomeView guide — Macworld](https://www.macworld.com/article/676817/new-homepod-mini-screen-rumours-release-date.html)
- [Apple releases HomeView smart home hub — CNBC](https://www.cnbc.com/2026/10/13/apple-homeview-smart-home-siri-ai.html)
