# TENSYL — Design Direction & Homepage Blueprint

> Working brand: **TENSYL Adhesive Systems** (placeholder name — every brand string,
> product and stat lives in `src/data/content.js`, so a real brand drops in without touching layout code).

---

## 1. Creative direction — "Pressure & Pull"

Adhesive is invisible once it works. The site makes the invisible dramatic: the moment two
surfaces meet, the tension of a strand being pulled, the chemistry of a cure.

- **Mood:** a dark product studio at night. Graphite void, one hot key light, packaging lit like
  a car launch. Calm, engineered, expensive.
- **Metaphor carried through every section:** *tension* (strands stretching, lines under load,
  type that is condensed then expands, elements that pull apart and snap together).
- **The product is the hero.** Packaging is real-time 3D (procedurally modelled, no stock photos),
  and the same 3D models are rendered to images for the catalogue and industry panels — so the
  "photography" is consistent everywhere.

## 2. Visual design system

| Token | Value | Use |
|---|---|---|
| `--ink` | `#0A0A0B` | page base (graphite void) |
| `--ink-2` | `#121214` | raised planes |
| `--line` | `rgba(237,234,227,.12)` | hairlines, grids |
| `--bone` | `#EDEAE3` | primary text / light sections |
| `--steel` | `#8B8D92` | secondary text |
| `--molten` | `#FF5A1F` | brand accent ("Molten" — cure-reaction orange) |
| Variant accents | PU-40 `#FF5A1F` · EPX-2 `#3D7BFF` · WD-3 `#C8F031` · CT-90 `#FF2E4D` · HM-7 `#FFC21A` | one colour per chemistry, used on label + UI when that product is on stage |

**Type**
- Display: **Archivo** variable (width 62–125, weight 100–900). Headlines set *condensed & heavy*,
  uppercase, tight leading (0.86). Width axis animates (condensed → expanded) on reveals = "tension".
- Technical: **JetBrains Mono** — spec labels, indices, counters, coordinates.
- Scale: fluid `clamp()`; display up to 15vw, body 16–18px, mono labels 11–12px tracked +0.12em.

**Layout rules**
- 12-col grid, 1px hairline structure instead of boxes. Square corners (radius 0–2px). No rounded "cards".
- Every section has a different composition (centred stage / sticky split / asymmetric mosaic /
  horizontal track / ledger grid / full-bleed).
- Light section (bone) for Brand Story to break the dark rhythm.

**Motion principles**
- Easing: `expo.out` for reveals, `power3.inOut` for stage moves. Durations 0.8–1.4s.
- Reveals are masks, width-axis morphs, and lines drawing — never plain fades.
- Everything scroll-bound is `scrub`bed (user owns time). Idle motion is slow (float 4–6s).
- `prefers-reduced-motion`: no smooth scroll, no scrub, static product poses.

## 3. Homepage structure & per-section experience

| # | Section | Composition | Motion / interaction | Assets |
|---|---|---|---|---|
| 0 | **Loader** | Full-screen, mono % counter, a strand stretching across | Counts while WebGL + label textures build; strand snaps, curtain lifts | none |
| 1 | **Hero** "ENGINEERED TO BOND. BUILT TO LAST." | 3D stage centred; headline split around the product | Cartridge hero centre, tube/bottle/tin orbit in depth; slow float + rotation, mouse parallax on camera; headline letters rise with width-axis expand; scroll pulls the satellites out & pushes the cartridge into section 2 | **3D**: cartridge, tube, bottle, tin |
| 2 | **Signature Showcase** (pinned, ~6 screens) | Product dead centre, spec callouts left/right, chapter rail | Scrubbed master timeline: cartridge 360° turn → **exploded view** (nozzle / body / piston separate with leader lines) → spins out, EPX-2 tube spins in & zooms → WD-3 bottle → CT-90 tin, lid lifts. Accent colour, background glow and chapter index change per product. | **3D** (same models), animated HTML callouts |
| 3 | **Product Range** | Asymmetric mosaic (1 tall feature + 4 offset tiles) | Renders lift on hover with 3D tilt + accent glow; image mask reveal on enter; "Explore" opens a product detail drawer | **3D renders → images** |
| 4 | **Brand Story** (light) "THE SCIENCE BEHIND STRONGER CONNECTIONS." | Sticky left headline, right scrolling capability ledger | Polymer-chain SVG cross-links as you scroll; animated counters; capability rows expand | **Motion graphic** (SVG) |
| 5 | **Industries** | Horizontal pinned track, 6 full panels | Each industry has its own generative visual (concrete joints, wind-tunnel lines, wood grain, corrugated flute, dovetail joint, hex lattice) + the matching product render; parallax inside panels | **SVG motion graphics**, renders |
| 6 | **Why TENSYL** | 3×2 hairline ledger | Icons draw themselves (stroke), numbers tick, hover floods cell with accent | SVG icons |
| 7 | **Final CTA** "LET'S BUILD STRONGER CONNECTIONS." | Full-bleed | Canvas of adhesive strands stretching between two plates — they react to the cursor and to scroll; magnetic CTAs | Canvas 2D |
| 8 | **Contact + Footer** | Form + editorial footer, giant wordmark | Validated enquiry form with success state | none |

## 4. Performance & responsive strategy

- One WebGL renderer for the whole page; it renders only while sections 1–2 are visible.
- DPR capped (desktop 1.75, mobile 1.25); shadows via cheap contact-shadow plane, not shadow maps.
- Catalogue/industry images are rendered once from the live models (`toBlob`) — zero image downloads.
- **Mobile/tablet (<900px):** satellites removed, exploded view kept, callouts become a bottom sheet,
  horizontal industries become a vertical stack, strands count halved, custom cursor off.
- Vite build: tree-shaken three / gsap, hashed assets, fonts preconnected.
- Semantic landmarks, one `h1`, descriptive `aria-label`s on canvases, keyboard-focusable controls,
  JSON-LD Organization + Product data.
