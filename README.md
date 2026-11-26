# Principle Adhesives — Prince Range Website

The design direction, homepage blueprint and motion spec are in [DESIGN.md](DESIGN.md).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
```

## Two theme options
- **Dark (default):** `http://localhost:5173/`
- **Light, "Studio White":** `http://localhost:5173/?theme=light`

Both share the same code. The nav (and the mobile menu) has a switch, and the `?theme=light` link works on any host.
The light palette is the `[data-theme='light']` block in `src/styles/main.css`; canvas and WebGL colours are in `src/ui/theme.js`.

## Stack
Vite · Three.js (procedural 3D packaging, no model downloads) · GSAP + ScrollTrigger · Lenis smooth scroll.

## Structure
```
src/
  data/content.js        ← ALL brand copy, products, industries, stats (swap to re-brand)
  gl/labels.js           ← packaging labels drawn to canvas from product data
  gl/products.js         ← cartridge / tube / bottle / tin / pail models
  gl/stage.js            ← renderer, lighting, proxy→scene mapping, product "photography" snapshots
  sections/showcase.js   ← hero → signature scroll choreography (scrubbed master timeline)
  sections/range.js      ← product mosaic + detail drawer
  sections/story.js      ← polymer cross-link motion graphic, counters, capability ledger
  sections/industries.js ← pinned horizontal track, generative per-industry visuals
  sections/why.js        ← feature ledger with self-drawing icons
  sections/finale.js     ← adhesive-strand canvas CTA
  sections/contact.js    ← enquiry form + footer
  ui/                    ← split text, nav, cursor, magnetic buttons, reveals
```

## Swapping in real assets
- **Product photos:** set `image` per product in `src/data/content.js` (currently the cut-outs from princecol.com in `public/images/princecol/`).
- **Real 3D models (GLB):** replace a builder in `gl/products.js` with a `GLTFLoader` load that returns
  `{ model, parts, anchors }`. The choreography only talks to the proxy objects, so it doesn't need to change.
- **Form backend:** hook your endpoint in `sections/contact.js` (marked in the code).

## Multi-page site (sitemap)

Five pages: Home, About, Products (+ 5 product detail pages), Gallery, Contact.
Applications, Technology & Quality and Why Choose Us were removed from the site and kept in `_archive/` (see `_archive/README.md`).

| URL | Page | Signature interaction |
|---|---|---|
| `/` | Home (unchanged design) | 3D scroll showcase |
| `/about/` | About Us | editorial split, horizontal journey, pinned "Made in Vasai" |
| `/products/` | Products | live 3D line-up, per-product stages with shifting colour, "find your bond" filter |
| `/products/princecol/` `/prince-bond/` `/prince-lite/` `/prince-glu/` `/prince-grip/` | Product detail (one template) | 3D pack opens on scroll, feature icons, specs, gallery viewer, enquiry pre-tagged with the product |
| `/gallery/` | Gallery | filter by type and product, full-screen viewer (keys + swipe) |
| `/contact/` | Contact | enquiry form, office/factory maps |

**How pages are built:** each page is a real HTML file. `<!-- @nav:key -->`, `<!-- @footer -->`, `<!-- @product:slug -->`,
`<!-- @cta {...} -->`, `<!-- @form {...} -->` are expanded at dev/build time by the `site-partials` plugin in `vite.config.js`
from `src/site/templates.js`, so navigation, footer and product pages are complete, crawlable HTML.
Inner-page data (verified from princecol.com only) is in `src/data/site.js`. Shared runtime: `src/site/boot.js`.

**Add a product:** add it to `products` in `src/data/content.js`, its photos/slug in `src/data/site.js`, and copy any
`products/<slug>/index.html` folder with the new slug.

## Needs client input before launch
- **Enquiry form endpoint** — set `formEndpoint` in `src/data/site.js` (Formspree/Web3Forms/own mailer). Until then the
  form opens a pre-filled email to princecoladhesives@gmail.com rather than pretending to send.
- **Factory, lab and team photography** — none exists on princecol.com; About/Technology use packaging photos and motion graphics.
- **Milestone years** for the journey timeline, **technical data** (solids, viscosity, setting time, coverage, shelf life),
  **certifications**, **working hours**, **social media links**, **Privacy / Terms pages**.
- Product ↔ industry pairings for mattresses, footwear, automobiles and PVC pipes (shown as requirement-led formulations for now).
