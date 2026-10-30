# react-3d-mockups

<p align="center">
  <img src="https://raw.githubusercontent.com/area-is/react-3d-mockups/main/assets/hero.png" alt="A laptop, a phone and a watch mockup, each screen showing the same budgeting app" width="720" />
</p>

[Docs, live demos and a gallery of all 63 models →](https://area.is/react-3d-mockups/docs/gallery)

**3D device mockups for React**, generated from code, with no 3D files to host. What you
put on a device's screen is regular DOM, positioned on the glass with CSS 3D
transforms, so it keeps running: React state and effects, video, iframes. The browser draws the text, so it
stays sharp at any angle. By default the screens are display-only: you rotate and zoom
the model, and hardware in front of a screen hides it pixel for pixel. An experimental
prop, `experimentalScreenInput`, lets the screens take clicks, scrolling and typing
([Screens and input](#screens-and-input)).

> **In active development.** The API may change over the next few weeks. Breaking changes
> are listed in the [changelog](https://github.com/area-is/react-3d-mockups/blob/main/CHANGELOG.md) with what to change;
> pin an exact version (`npm install --save-exact react-3d-mockups`) if you need it to
> stay put.

- **Thirty-eight devices** - the Galaxy S26 line (S26, S26 Ultra), two foldable
  generations (Z Fold 7, the wide Z Fold 8, Z Fold 8 Ultra, Z Flip 7, Z Flip 8) and
  Apple's foldable iPhone Duo, the full iPhone 17 family (17, 17 Air, 17 Pro, 17 Pro
  Max) and the iPhone 18 Pro / Pro Max, MacBook Air 13"/15", MacBook Pro 14"/16" (M5),
  the MacBook Pro 14"/16" with PROLED XDR display and the MacBook Neo 13", iPad Pro
  13"/11" (M5), iPad Air 13"/11" (M4), iPad (A16), iPad mini (A20 Pro),
  Galaxy Tab S11 / S12+ / S11 Ultra and the Tab S12 Ultra, the Apple Watch
  Series 11, Series 12 and Ultra 4 and the Galaxy Watch 8, Watch 9 and Watch
  Ultra 2 on
  full wristbands, and a Studio Display-style 27" monitor, all procedurally generated
  at runtime. No GLB files and nothing to host. The phones, foldables, tablets,
  watches and laptops use a small CSG engine (`three-bvh-csg`, a regular dependency)
  to machine their ports and speaker/mic holes into the chassis as real cavities.
- **Twenty-five objects** on the same live-surface API - books, magazines, brochures,
  business cards, ID badges and payment cards with embossed numbers, packaging (product box, mailer box, gable-top milk
  carton, shopping bag), custom-size panels and boxes at any millimeter dimensions,
  posters, vinyl records, a greeting card, out-of-home formats (billboard, bus
  shelter, double-sided DOOH totem, A-frame, roll-up banner, storefront), a TV, and
  wrap-ready vehicles (transit bus, cargo van, 53 ft semi trailer). Each prints on
  every face it has: a box on all six panels, a bus on both flanks, its tail and its
  LED destination sign.
- **Small imports** - each mockup is its own module, so an app ships only what it
  imports: about 15–23 KB gzipped for an object, about 60 KB for a device (two thirds
  of it the CSG engine, shared by every device), 146 KB for the whole library, peers
  excluded. The experimental screen input adds about 2 KB, loaded only when a screen
  takes input.
- **True-to-device screens** - each virtual display matches the real device's logical
  resolution in portrait *and* landscape (table below), so your breakpoints match the
  device's.
- **Draws only when needed** - three.js + react-three-fiber,
  physically-based materials, studio lighting, soft shadows, clamped DPR. A mockup draws
  a frame only when something moves (a drag, `autoRotate`, `float`, a prop change), and
  not at all while it is scrolled off screen or its tab is hidden.
- **Any content on screen** - pass React components, an `<iframe>` or a `<video>` as
  children. State, effects and media playback keep running, and every surface is masked
  per-pixel by the hardware in front of it.
- **Composable** - every model comes two ways: a one-liner `*Mockup` that brings its own
  canvas, camera and lighting (`<GalaxyMockup>`, `<FoldMockup>`, `<LaptopMockup>`,
  `<BookMockup>`, `<VanMockup>`…), and a bare model (`<Galaxy>`, `<Fold>`, `<Laptop>`,
  `<Book>`, `<Van>`…) to drop into `<MockupCanvas>` beside others, or into your own
  react-three-fiber scene.

## Install

```bash
npm install react-3d-mockups three @react-three/fiber @react-three/drei
```

React 19 (react-three-fiber 9 and drei 10 both require it), `three` 0.179 to 0.186,
`@react-three/fiber` 9 and `@react-three/drei` 10. Those are
**peer** dependencies rather than bundled ones, because each has to exist exactly once in
an app - two copies of `three` mean two different `THREE.Mesh` classes, so `instanceof`
checks and r3f's element catalogue stop matching.

npm 7+ and pnpm 8+ install peers automatically, so `npm install react-3d-mockups` alone
already pulls all three in. Listing them explicitly still records them in your
`package.json`, which is what you want if you import from `three` yourself. Yarn does not
auto-install peers, so there the full command is required.

## Quick start

```tsx
'use client'

import { GalaxyMockup } from 'react-3d-mockups'

export function Hero() {
  return (
    <div style={{ height: 560 }}>
      <GalaxyMockup autoRotate float>
        <div
          style={{
            height: '100%',
            display: 'grid',
            placeItems: 'center',
            background: '#111',
            color: '#fff',
            fontSize: 32,
          }}
        >
          Hello
        </div>
      </GalaxyMockup>
    </div>
  )
}
```

The mockup fills its parent, so give the wrapper a height (or an `aspect-ratio`); with
none, it is 0 px tall and a development warning says so. The `<div>` stands in for
anything: your own components, an `<iframe>`, a `<video>`.

Drag anywhere - body, background, or the screen itself - to orbit; with the canvas
focused, the arrow keys turn it and Home resets it.

**Server rendering.** Importing a mockup into a `'use client'` component works in
Next.js and server-renders the sized wrapper; the 3D picture is drawn after hydration,
because WebGL needs a browser. `dynamic(() => import('./hero'), { ssr: false })` is
optional: use it to keep three.js out of the server bundle and the page's initial
JavaScript. See [Next.js and SSR](https://area.is/react-3d-mockups/docs/nextjs).

## Regions & slots

Bare children always fill a mockup's **primary region** (a phone's screen, a book's
cover). Objects with more printable surfaces expose each one as a **compound slot** -
type `AFrameSignMockup.` and your editor lists exactly the regions the object has:

```tsx
<AFrameSignMockup autoRotate>
  <AFrameSignMockup.Front>
    <MenuBoard />
  </AFrameSignMockup.Front>
  <AFrameSignMockup.Back surfaceBackground="#20241f" resolution={640}>
    <HoursBoard />
  </AFrameSignMockup.Back>
</AFrameSignMockup>
```

A slot takes the same three surface settings a mockup does - `surfaceBackground`,
`resolution`, `surfaceStyle` - and overrides the mockup's for that one region. One
vocabulary, whichever element you hang it off. (A slot also takes `screenDrag`, for
[screens that take input](#screens-and-input).) Every surface has a name, so content
lands where the name says no matter what order you write the slots in:

```tsx
<BrochureMockup>
  <BrochureMockup.FrontLeft><Cover /></BrochureMockup.FrontLeft>
  <BrochureMockup.FrontCenter><Middle /></BrochureMockup.FrontCenter>
  <BrochureMockup.BackLeft><RouteMap /></BrochureMockup.BackLeft>
</BrochureMockup>
```

The same slots exist on the raw scene components (`<AFrameSign.Front>` inside your own
r3f scene). Slots must be direct children of their mockup (fragments are fine); region
names come from each object's spec in the core.

## Components

### Every `*Mockup` (e.g. `<GalaxyMockup>`, `<FoldMockup>`, `<BookMockup>`) - all-in-one

Every appearance prop of its model, plus `float` (idle floating animation) and the
staging props from `<MockupCanvas>`: `controls`, `autoRotate`, `zoom`, `fullscreen`,
`shadows`, `background`, `camera`, `frameloop`, `dpr`, `gl`, `onCreated`,
`pauseWhenOffscreen`, `time`, `delayCapture`, `label`, `screenAccessibility`,
`className`, `style`. The two canvas props marked *canvas only* below stay on
`<MockupCanvas>`. Transforms are first-class: `position`, `rotation` and `scale` flow
straight through to the model's group (`<IPhoneMockup rotation={[0, 0.25, 0]}>`).

### `<MockupCanvas>` - the stage

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `controls` | `boolean` | `true` | Drag-to-orbit controls |
| `freeRotation` | `boolean` | `false` | Allow full 360° vertical rotation (straight over the top); off = classic clamped orbit. Canvas only |
| `autoRotate` | `boolean \| number` | `false` | Slowly orbit the camera. `true` is one revolution a minute; a number multiplies that (`autoRotate={2}` twice as fast) |
| `zoom` | `boolean` | `false` | Scroll/pinch zoom (off so pages don't lose scroll) |
| `fullscreen` | `boolean` | `false` | Show a button that takes the mockup fullscreen |
| `shadows` | `boolean` | `true` | Soft contact shadow |
| `shadowY` | `number` | `-2.05` | Y of the shadow plane (grounds the device). Canvas only - a mockup derives it from the object's framing |
| `background` | `string` | - | CSS background of the canvas |
| `camera` | r3f camera | `[0, 0.5, 7.4]`, fov 40 | Camera override. Live: a new `position`/`fov` moves the camera there |
| `dpr` | `number \| [min, max]` | `[1, 2]` | Device-pixel-ratio clamp |
| `frameloop` | `'demand' \| 'always' \| 'never'` | `'demand'` | When to draw. `'demand'` draws only when something changes; use `'always'` for your own `useFrame` animation in a composed scene |
| `pauseWhenOffscreen` | `boolean` | `true` | Stop drawing while the canvas is off screen or its tab is hidden |
| `time` | `number` | - | Seconds on your own clock (a video's `frame / fps`): `autoRotate` and `float` follow it, so the same `time` draws the same picture |
| `delayCapture` | `(reason) => () => void` | - | Hold a video render or screenshot until the frame is complete (renderer started, redraw done, screens placed). Wire it to Remotion's `delayRender`/`continueRender`; while set, the canvas never pauses |
| `gl` | r3f `gl` | `{ antialias: true, alpha: true, powerPreference: 'default' }` | Renderer settings, merged over the defaults. Keep `alpha` on - screens show through transparent pixels |
| `onCreated` | `(state) => void` | - | r3f's `onCreated`, e.g. to read `gl.info` |
| `label` | `string` | per model | Accessible name; the canvas is exposed as `role="img"` ("3D mockup of an iPhone") |
| `screenAccessibility` | `'hidden' \| 'visible'` | `'hidden'` | Screens are decorative, so by default they are `aria-hidden` and `inert`; `'visible'` exposes their content |
| `experimentalScreenInput` | `boolean` | `false` | Experimental: the screens take pointer and keyboard input. See [Screens and input](#screens-and-input) |
| `screenDrag` | `boolean` | `true` | With `experimentalScreenInput`: whether a drag that starts on a screen rotates the model. A slot's own `screenDrag` overrides it for that screen |
| `className` | `string` | - | Class on the wrapper element |
| `style` | `CSSProperties` | - | Style on the wrapper element, which fills its parent by default |

### `<Galaxy>` - the device

Render inside any r3f `<Canvas>`. Accepts all group props (`position`, `rotation`, `scale`…).

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | - | Screen content |
| `color` | `string` | `'#101216'` | Back panel, and the whole finish - the frame, buttons and (on the Ultra) the camera rings follow from it; the S26's rings are dark chrome on every finish, as on the hardware. A retail colorway id from `GALAXY_COLORWAYS` (`'icyblue'`…) brings that model's measured metal; any other CSS color gets metal derived from it |
| `surfaceBackground` | `string` | `'#000000'` | CSS background behind your content |
| `variant` | `'s26' \| 's26ultra'` | `'s26'` | Which Galaxy S26-family device (true relative sizes + per-model cameras) |
| `orientation` | `'portrait' \| 'landscape'` | `'portrait'` | Landscape lays the device sideways and swaps the virtual display |
| `resolution` | `number` | per variant | Virtual display width in CSS px (see resolution table) |
| `surfaceStyle` | `CSSProperties` | - | Extra styles for the screen wrapper |
| `statusBar` | `boolean \| StatusBarOption` | `false` | Draw One UI's status bar across the top of the screen: `true` for the defaults, or an object to set the clock, meters and ink. Lay your content out under it with `var(--mockup-safe-area-top)` |

### `<IPhone>` - iPhone 17 family and iPhone 18 Pro

Same API as `<Galaxy>`, except: `variant` is `'17' | 'air' | 'pro' | 'promax' | '18pro' |
'18promax'`, and `resolution` defaults to the variant's logical point grid (see resolution
table). Camera architecture follows the real devices: two-lens pill (17), ultra-thin
single-lens bar (Air), full-width triple-lens plateau with flash + LiDAR (the Pros). The
18 Pros are the 17 Pros' chassis under the generation's narrower Dynamic Island and
colour-matched back.

### `<IPhoneDuo>` - iPhone Duo

Apple's foldable, on the same spec shape and pose vocabulary as `<Fold>`: `openAngle`
(`true` open onto the landscape 7.6" inner display, `false` shut onto the 5.4" cover,
or degrees for any Flex angle between), `orientation`, `statusBar` (iOS's), `color` (an
`IPHONE_DUO_COLORWAYS` id - `'nightsky'`, `'starwhite'` - or any CSS color). The inner
display has no camera hole - the FaceTime camera sits under the glass - so nothing
interrupts your layout there.

### `<Laptop>` - MacBook Air, MacBook Pro and MacBook Neo

Same screen API (`surfaceBackground`, `resolution`, `surfaceStyle`), plus
`openAngle` (lid angle, default `110`), and `resolution`
defaulting to the variant's scaled desktop (Air 1280×832, Pro 14 1512×982, Neo 1204×753 -
desktop breakpoints apply). `color` sets the aluminum finish - a `LAPTOP_COLORWAYS` id
(`'skyblue'`, `'starlight'`, `'midnight'`, the Neo's `'citrus'` and `'indigo'`) or any CSS
color. The Neo (`'neo13'`) is the notchless one: its camera sits in the bezel above a
square-cornered panel. The MacBook Pro with PROLED XDR display (`'proled14'`,
`'proled16'`, 1512×993 and 1736×1133) has a Dynamic Island floating below the top edge in
place of the notch, thinner bezels and a lid logo that glows.

### `<IPad>` - the iPad lineup · `<GalaxyTab>` - the Galaxy Tab family

Same screen API as the phones, plus `orientation`. `<IPad>` takes `variant`
`'ipadpro13' | 'ipadpro11' | 'ipadair13' | 'ipadair11' | 'ipad11' | 'ipadmini'`, and `<GalaxyTab>`
takes `'tabs11' | 'tabs12plus' | 'tabs11ultra' | 'tabs12ultra'`; each accepts only its own. Fully procedural and
per-variant accurate: the Pro's camera pod (wide lens, LiDAR, flash) and Pencil
charging window, the Air's and standard iPad's bare single lens with the Touch ID top
button, back or edge Smart Connector dots and speaker drill rows, the mini's lens and
flash, top-edge volume keys and hole-free edges (it plays through its display); protruding camera
rings, quad speaker slots, gold pogo contacts and (on the Ultra) the U-shaped display
notch on the Galaxy Tabs; brand marks as real vector geometry (Apple glyph,
edge-aligned SAMSUNG wordmark) and model wordmarks on the backs; landscape-edge front
cameras, USB-C and machined edge buttons on all.

### `<AppleWatch>` / `<GalaxyWatch>` - smartwatches · `<StudioDisplay>` - Studio Display-style

Both watches add `bandColor` and skip orientation. Every device draws its front camera unconditionally - a punch hole, Dynamic Island or notch is hardware, and it obstructs your layout here exactly as it would on the real panel. `<AppleWatch>` is the Apple Watch family (`'series11' | 'series12' | 'ultra4'`):
the Series' squircle case with the knurled Digital Crown, flush side button and sensor
back, worn on the seamless Solo Loop - which has no closure, so it takes no `bandOpen` -
and the Ultra 4's 49 mm titanium case with its raised lip, crown guard and orange Action
button, on its ridged, buckled Ocean Band.
`<GalaxyWatch>` is the Galaxy Watch family (`'watch8' | 'watch9' | 'watchultra2'`):
cushion case, round display on its dial puck, flat keys (the 47 mm titanium
Ultra 2 adds its orange Quick Button), BioActive puck, worn on a buckled
two-strap band that `bandOpen` lays out flat. The monitor puts the
2026 Studio Display's 27" 5K panel on its tilt stand - uniform bezel, centered
camera, the tight rear 2× Thunderbolt 5 + 2× USB-C slot cluster, the captive power
cord's circular recess framed by the stand's cable hole and, faithfully, no power
button.

## Screens and input

By default, content on the glass renders live but takes no input: clicks,
scrolling and typing go to the orbit controls, and a drag anywhere - body,
background, or screen - rotates the model. A screen's DOM is stacked *under* the
canvas and masked by the depth buffer, so anything in front of the screen covers
it exactly: a laptop's keyboard hides the screen's reflection, a camera ring
stands over a wrap, a bus's mirrors draw over the livery. A pointer over the
screen lands on the canvas, not on the content.

### Experimental: `experimentalScreenInput`

```tsx
<LaptopMockup experimentalScreenInput>
  <YourApp />
</LaptopMockup>
```

With it on, each screen's DOM is stacked above the canvas and clipped every frame
to the part of it that no hardware covers, read from the canvas's own pixels.
Clicks, hover, scrolling, focus and typing reach the content, iframes included,
and hardware in front of a screen still covers it.

A tap or click on a screen goes to the content. A drag that starts on a screen
rotates the model once it has moved 10 px, unless:

- `screenDrag={false}` is set on the mockup, or on that screen's slot
  (`<LaptopMockup.Screen screenDrag={false}>`);
- it starts on a form control (text field, slider, select, editable text) or
  inside an element marked `data-mockup-no-rotate`;
- the content captures the pointer with `setPointerCapture`.

On touch, a mostly vertical swipe scrolls instead. Drags on the hardware and the
background always rotate the model.

What it costs: after every frame the canvas draws, each screen reads its pixels
back from the canvas; the clipping and drag code (about 2 KB gzip) loads the first
time a screen takes input; and the screens join the accessibility tree while it is
on. The prop's name and behavior may change in a later release. The docs cover it
in more detail: [Screen content](https://area.is/react-3d-mockups/docs/screen-content#experimental-screens-that-take-input).

The screen renders in its own React root, and React context from above the mockup -
a theme, i18n, your router, a query client - is bridged into it, so screen content
reads the same providers the rest of your page does. It is kept out of the
accessibility tree and the tab order by default (`screenAccessibility`).

## Exporting images and video

The screen is DOM composited by the browser, not pixels in the WebGL canvas, so
`canvas.toDataURL()` gives you devices with empty screens. Screenshot the element in a
real browser instead (Playwright's `locator.screenshot()` captures both layers), or use
Remotion for video. Recipes: [Exporting images and video](https://area.is/react-3d-mockups/docs/exporting).

## Virtual screen resolutions

Every variant's screen defaults to the real device's logical resolution (CSS px):

| Device | `variant` | Portrait | Landscape | Basis |
| --- | --- | --- | --- | --- |
| Galaxy S26 | `s26` | 360×780 | 780×360 | 2340×1080 panel at ⅓ (3x) |
| Galaxy S26 Ultra | `s26ultra` | 384×833 | 833×384 | One UI default FHD+ render @ 450 dpi |
| Galaxy Z Fold 7 (open / folded) | `fold7` | 820×910 / 360×835 | swapped | inner 2184×1968, cover 2520×1080 |
| Galaxy Z Fold 8 (open / folded) | `fold8` | 1020×770 / 480×758 | swapped | inner 2448×1848 (natively landscape), cover 1248×1972 |
| Galaxy Z Fold 8 Ultra (open / folded) | `fold8ultra` | 820×910 / 360×835 | swapped | inner 2504×2256 on the Fold 7 grid, cover 2520×1080 |
| Galaxy Z Flip 7 (open / folded) | `flip7` | 360×838 / 316×349 | swapped | main 2520×1080, cover 948×1048 |
| Galaxy Z Flip 8 (open / folded) | `flip8` | 360×840 / 316×349 | swapped | main 2520×1080 at 6.9", cover 948×1048 |
| iPhone 17 | `17` | 402×874 | 874×402 | 2622×1206 @ 3x point grid |
| iPhone 17 Air | `air` | 420×912 | 912×420 | 2736×1260 @ 3x point grid |
| iPhone 17 Pro | `pro` | 402×874 | 874×402 | 2622×1206 @ 3x point grid |
| iPhone 17 Pro Max | `promax` | 440×956 | 956×440 | 2868×1320 @ 3x point grid |
| iPhone 18 Pro | `18pro` | 402×874 | 874×402 | 2622×1206 @ 3x point grid |
| iPhone 18 Pro Max | `18promax` | 440×956 | 956×440 | 2868×1320 @ 3x point grid |
| iPhone Duo (open / folded) | `duo` | 890×626 / 466×678 | swapped | inner 2670×1878 (natively landscape) and cover 1398×2034 @ 3x point grid |
| MacBook Air 13" (M5) | `air13` | - | 1280×832 | 2560×1664 @ 2x default scaled |
| MacBook Air 15" (M5) | `air15` | - | 1440×932 | 2880×1864 @ 2x default scaled |
| MacBook Pro 14" (M5) | `pro14` | - | 1512×982 | 3024×1964 @ 2x default scaled |
| MacBook Pro 16" (M5) | `pro16` | - | 1728×1117 | 3456×2234 @ 2x default scaled |
| MacBook Pro 14" PROLED XDR | `proled14` | - | 1512×993 | 3024×1986 @ 2x default scaled |
| MacBook Pro 16" PROLED XDR | `proled16` | - | 1736×1133 | 3472×2266 @ 2x default scaled |
| MacBook Neo 13" | `neo13` | - | 1204×753 | 2408×1506 @ 2x default scaled |
| iPad Pro 13" (M5) | `ipadpro13` | 1032×1376 | 1376×1032 | 2752×2064 @ 2x point grid |
| iPad Pro 11" (M5) | `ipadpro11` | 834×1210 | 1210×834 | 2420×1668 @ 2x point grid |
| iPad Air 13" (M4) | `ipadair13` | 1024×1366 | 1366×1024 | 2732×2048 @ 2x point grid |
| iPad Air 11" (M4) | `ipadair11` | 820×1180 | 1180×820 | 2360×1640 @ 2x point grid |
| iPad (A16) | `ipad11` | 820×1180 | 1180×820 | 2360×1640 @ 2x point grid |
| iPad mini (A20 Pro) | `ipadmini` | 756×1158 | 1158×756 | 2316×1512 @ 2x (derived; Apple has not listed its point size yet) |
| Galaxy Tab S11 | `tabs11` | 800×1280 | 1280×800 | 2560×1600 panel at ½ (xhdpi) |
| Galaxy Tab S12+ | `tabs12plus` | 876×1400 | 1400×876 | 2800×1752 panel at ½ (xhdpi) |
| Galaxy Tab S11 Ultra | `tabs11ultra` | 924×1480 | 1480×924 | 2960×1848 panel at ½ (xhdpi) |
| Galaxy Tab S12 Ultra | `tabs12ultra` | 924×1480 | 1480×924 | 2960×1848 panel at ½ (xhdpi) |
| Apple Watch Series 11 46mm | `series11` | 208×248 | - | 416×496 @ 2x point grid |
| Apple Watch Series 12 46mm | `series12` | 208×248 | - | 416×496 @ 2x point grid |
| Apple Watch Ultra 4 49mm | `ultra4` | 211×257 | - | 422×514 @ 2x point grid |
| Galaxy Watch 8 44mm | `watch8` | 240×240 | - | 480×480 round panel at ½ |
| Galaxy Watch 9 44mm | `watch9` | 240×240 | - | 480×480 round panel at ½ |
| Galaxy Watch Ultra 2 47mm | `watchultra2` | 249×249 | - | 498×498 round panel at ½ |
| Studio Display 27" | - | - | 2560×1440 | 5120×2880 @ 2x point grid |

## Specs and measurements

The numbers behind every model are plain data in the `react-3d-mockups/core` subpath:
the device specs (`GALAXY_VARIANTS`, `IPHONE_VARIANTS`, `IPHONE_DUO_VARIANTS`,
`FOLD_VARIANTS`, `FLIP_VARIANTS`, `LAPTOP_VARIANTS`, `IPAD_VARIANTS`,
`GALAXY_TAB_VARIANTS`, `APPLE_WATCH_VARIANTS`, `GALAXY_WATCH_VARIANTS`,
`STUDIO_DISPLAY`), the object specs (`BOOK`, `VAN`, `POSTER_FRAME`…), each model's
region list and stage framing, and `mockupInfo`, which reports every live surface's
size in CSS px and millimetres:

```ts
import { mockupInfo } from 'react-3d-mockups/core'

const { primary } = mockupInfo('iphone', { variant: 'promax' })
primary.px // { width: 440, height: 956 }
```

None of it needs a browser, so it works in a Server Component, a build script or
Node. See [Measuring a mockup](https://area.is/react-3d-mockups/docs/api/mockup-info).

Every device variant belongs to a product line in `DEVICE_LINEUP`, and
`deviceLifecycle(kind, variant)` says where it stands: `current` (the newest in its
line), `superseded` (a newer model is in the catalog; still fully supported) or
`deprecated` (scheduled for removal, with the release that removes it):

```ts
import { deviceLifecycle } from 'react-3d-mockups/core'

deviceLifecycle('iphone', 'pro')
// { name: 'iPhone 17 Pro', line: 'iPhone Pro', status: 'superseded',
//   successors: [{ variant: '18pro', name: 'iPhone 18 Pro' }], … }
```

See [Older devices](https://area.is/react-3d-mockups/docs/roadmap#older-devices) for how models are
retired.

## Architecture

`react-3d-mockups` is one package in two layers. All device/object specs, region
registries, stage framing, geometry math and shared screen/stage behaviors live in a
renderer-agnostic core that depends on `three` and never on React; the components are
the layer that renders it through react-three-fiber.

The main entry re-exports a curated slice of the core (variants, colorways, size
types, `mockupInfo`); the full core surface is available from `react-3d-mockups/core`.
Only the component modules carry `'use client'`, so both entries import cleanly into
a Server Component. See
[ARCHITECTURE.md](https://github.com/area-is/react-3d-mockups/blob/main/ARCHITECTURE.md)
for the layering rule.

The package is ESM-first. A CommonJS build is included for tools that still
`require()` it, but three.js itself now warns when loaded through CommonJS
(`THREE_CJS_DEPRECATED`), and the CommonJS build will go when three's does.

## Docs & demos

Full documentation and live demos: [area.is/react-3d-mockups](https://area.is/react-3d-mockups). Source: [github.com/area-is/react-3d-mockups](https://github.com/area-is/react-3d-mockups)

## License

MIT © [Ye Joo Park](https://github.com/subwaymatch)
