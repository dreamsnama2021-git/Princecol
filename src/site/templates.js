// HTML partials shared by every page. Rendered at build/dev time by the
// `site-partials` Vite plugin (see vite.config.js), so pages ship as real,
// crawlable HTML. Pure string functions — safe to import in Node.
import { brand, products, pages, applications, productFeaturesFull, featureIcon, productById } from '../data/site.js';
import { icon } from './icons.js';

const LEAF = 'M12 1 L13.6 5.2 L15.8 4.2 L15 9 L18.4 6.6 L19.2 8.6 L22.5 8 L21 11.4 L23 12.4 L17.6 16.4 L18.4 18.4 L13 17.6 L12.6 23 L11.4 23 L11 17.6 L5.6 18.4 L6.4 16.4 L1 12.4 L3 11.4 L1.5 8 L4.8 8.6 L5.6 6.6 L9 9 L8.2 4.2 L10.4 5.2 Z';
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const tel = (n) => n.replace(/[^+\d]/g, '');

/* ---------------- <head> ---------------- */
export function head({ inner = true } = {}) {
  return `
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#F1EEE8" />
  <meta name="keywords" content="Acrylic Adhesive Manufacturers in Mumbai, Adhesive and Super Glue Manufacturers in Mumbai, Adhesive for Furniture Manufacturers in Mumbai, Eurocol Adhesive Manufacturers in Mumbai, Heat and Water Resistant Adhesive Manufacturers in Mumbai, Marine Grade Adhesive Manufacturers in Mumbai, Multigrip Adhesive Manufacturers in Mumbai, Plywood Adhesive Manufacturers in Mumbai, PVC Adhesive Manufacturers in Mumbai, Synthetic Resin Adhesive Exporter in Mumbai, Top Adhesive Manufacturers in Mumbai, Top Adhesive Suppliers Manufacturers in Mumbai, Wood Adhesive Manufacturers in Mumbai" />
  <meta property="og:site_name" content="Principle Adhesives" />
  <meta property="og:type" content="website" />
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='${LEAF}' fill='%23E5322D'/%3E%3C/svg%3E" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <script>
    // The site has one theme (light). Set before paint; the old ?theme / saved choice no longer applies.
    document.documentElement.dataset.theme = 'light';
    try { sessionStorage.removeItem('pa-theme'); } catch (e) {}
  </script>
  <link rel="stylesheet" href="/src/styles/main.css" />
  ${inner ? '<link rel="stylesheet" href="/src/styles/pages.css" />' : ''}`;
}

/* ---------------- grain, cursor, page curtain ---------------- */
export function chrome() {
  return `
  <a class="skip" href="#main">Skip to content</a>
  <div class="grain" aria-hidden="true"></div>
  <div class="cursor" aria-hidden="true"><span class="cursor__dot"></span><span class="cursor__ring"><em class="cursor__label"></em></span></div>
  <div class="curtain" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${LEAF}"/></svg></div>`;
}

/* ---------------- navigation + products mega menu ---------------- */
export function nav(active = 'home') {
  const links = pages.filter((p) => p.key !== 'contact').map((p) => {
    const cur = p.key === active ? ' aria-current="page"' : '';
    if (!p.mega) return `<a href="${p.href}" class="nav__link"${cur}>${p.label}</a>`;
    return `
      <div class="nav__item nav__item--mega">
        <a href="${p.href}" class="nav__link"${cur} aria-haspopup="true">${p.label}<i aria-hidden="true">+</i></a>
        <div class="mega" role="region" aria-label="Products">
          <div class="mega__inner">
            <div class="mega__intro">
              <p class="mono eyebrow">The Prince range</p>
              <p class="mega__lede">Five adhesives for furniture, packaging, interiors and flooring.</p>
              <a href="/products/" class="mega__all mono">All products →</a>
            </div>
            <ul class="mega__list">
              ${products.map((pr) => `
              <li><a href="${pr.url}" class="mega__card" style="--c:${pr.accent}">
                <span class="mega__img"><img src="${pr.image}" alt="" loading="lazy" decoding="async" width="638" height="526" /></span>
                <span class="mega__code">${pr.code}</span>
                <span class="mega__cat mono">${pr.category}</span>
              </a></li>`).join('')}
            </ul>
          </div>
        </div>
      </div>`;
  }).join('');

  const mobile = pages.map((p, i) => {
    const cur = p.key === active ? ' aria-current="page"' : '';
    const sub = p.mega ? `<ul class="menu__sub">${products.map((pr) => `<li><a href="${pr.url}">${pr.code}</a></li>`).join('')}</ul>` : '';
    return `<div class="menu__row"><a href="${p.href}"${cur}><i class="mono">${String(i + 1).padStart(2, '0')}</i>${p.label}</a>${sub}</div>`;
  }).join('');

  return `
  <header class="nav" id="nav">
    <a href="/" class="nav__logo" aria-label="Principle Adhesives — home">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${LEAF}"/></svg>
      <span>PRINCIPLE<small>Adhesives</small></span>
    </a>
    <nav class="nav__links" aria-label="Primary">${links}</nav>
    <div class="nav__right">
      <a href="/contact/" class="btn btn--sm btn--line nav__cta" data-magnetic${active === 'contact' ? ' aria-current="page"' : ''}><span>Contact Us</span></a>
    </div>
    <button class="nav__burger" aria-label="Open menu" aria-expanded="false" aria-controls="menu"><span></span><span></span></button>
  </header>
  <div class="menu" id="menu" aria-hidden="true">
    <nav aria-label="Mobile">${mobile}</nav>
  </div>`;
}

/* ---------------- footer ---------------- */
export function footer() {
  const quick = pages.filter((p) => !['home'].includes(p.key));
  return `
  <footer class="footer">
    <div class="footer__top">
      <div class="footer__brand">
        <a href="/" class="nav__logo" aria-label="Principle Adhesives — home"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${LEAF}"/></svg><span>PRINCIPLE<small>Adhesives</small></span></a>
        <p>${esc(brand.intro)}</p>
        <div class="footer__social">
          <a href="${brand.whatsapp}" target="_blank" rel="noopener" class="footer__pill mono">${icon('whatsapp', 'footer__ico')}WhatsApp</a>
          <a href="${brand.loyalty}" target="_blank" rel="noopener" class="footer__pill mono">Loyalty programme ↗</a>
        </div>
      </div>
      <div class="footer__cols">
        <div><p class="mono eyebrow">Company</p><ul>${quick.map((p) => `<li><a href="${p.href}">${p.label}</a></li>`).join('')}</ul></div>
        <div><p class="mono eyebrow">Products</p><ul>${products.map((p) => `<li><a href="${p.url}">${p.code}</a></li>`).join('')}</ul></div>
        <div><p class="mono eyebrow">Contact</p><ul>
          <li><a href="mailto:${brand.email}">${brand.email}</a></li>
          ${brand.phones.map((n) => `<li><a href="tel:${tel(n)}">${n}</a></li>`).join('')}
        </ul></div>
        <div><p class="mono eyebrow">Regd. office</p><ul><li>${esc(brand.office)}</li></ul>
          <p class="mono eyebrow footer__gap">Factory</p><ul><li>${esc(brand.factory)}</li></ul></div>
      </div>
    </div>
    <div class="footer__mark" aria-hidden="true">PRINCIPLE</div>
    <div class="footer__base mono">
      <span>© <span data-year>2026</span> Principle Adhesives Pvt Ltd</span>
      <span>The Adhesive Experts</span>
      <a href="#top" data-link>Back to top ↑</a>
    </div>
  </footer>`;
}

/* ---------------- shared enquiry form ---------------- */
export function enquiryForm({ id = 'enquiry', product = '', compact = false } = {}) {
  const opts = products.map((p) => `<option value="${p.code}"${p.id === product ? ' selected' : ''}>${p.code}</option>`).join('');
  const inds = applications.map((a) => `<option>${a.name}</option>`).join('');
  return `
  <form class="eform${compact ? ' eform--compact' : ''}" id="${id}" novalidate data-enquiry>
    <div class="field"><input id="${id}-name" name="name" required autocomplete="name" placeholder=" " /><label for="${id}-name">Full name *</label><small class="field__err" aria-live="polite"></small></div>
    <div class="field"><input id="${id}-company" name="company" autocomplete="organization" placeholder=" " /><label for="${id}-company">Company name</label><small class="field__err"></small></div>
    <div class="field"><input id="${id}-email" name="email" type="email" required autocomplete="email" placeholder=" " /><label for="${id}-email">Email address *</label><small class="field__err" aria-live="polite"></small></div>
    <div class="field"><input id="${id}-phone" name="phone" type="tel" required autocomplete="tel" inputmode="tel" placeholder=" " /><label for="${id}-phone">Phone number *</label><small class="field__err" aria-live="polite"></small></div>
    <div class="field field--select"><select id="${id}-product" name="product"><option value="">Not sure yet</option>${opts}</select><label for="${id}-product">Product interested in</label></div>
    <div class="field field--select"><select id="${id}-industry" name="industry"><option value="">Select industry</option>${inds}<option>Other</option></select><label for="${id}-industry">Industry</label></div>
    <div class="field field--full"><textarea id="${id}-msg" name="message" rows="4" required placeholder=" "></textarea><label for="${id}-msg">Message — quantity, surfaces, application *</label><small class="field__err" aria-live="polite"></small></div>
    <div class="hp" aria-hidden="true"><label>Leave this empty<input name="website" tabindex="-1" autocomplete="off" /></label></div>
    <div class="eform__foot">
      <button class="btn btn--solid eform__submit" type="submit" data-magnetic><span>Submit Enquiry</span><i class="btn__arrow" aria-hidden="true">→</i></button>
      <p class="eform__status mono" role="status" aria-live="polite"></p>
    </div>
  </form>`;
}

/* ---------------- closing CTA band (strand canvas) ---------------- */
export function ctaBand({ eyebrow = 'Start a project', title, lede = '', primary, secondary } = {}) {
  return `
  <section class="cta-band" aria-label="${esc(title)}">
    <canvas class="cta-band__strands" aria-hidden="true"></canvas>
    <div class="cta-band__content">
      <p class="mono eyebrow">${eyebrow}</p>
      <h2 class="cta-band__title" data-split>${title}</h2>
      ${lede ? `<p class="cta-band__lede">${lede}</p>` : ''}
      <div class="hero__ctas">
        ${primary ? `<a href="${primary.href}" class="btn btn--solid" data-magnetic><span>${primary.label}</span><i class="btn__arrow" aria-hidden="true">→</i></a>` : ''}
        ${secondary ? `<a href="${secondary.href}" class="btn btn--line" data-magnetic><span>${secondary.label}</span></a>` : ''}
      </div>
    </div>
  </section>`;
}

/* ---------------- product detail page body ---------------- */
export function productPage(slug) {
  const p = products.find((x) => x.slug === slug);
  if (!p) throw new Error(`Unknown product slug: ${slug}`);
  const feats = productFeaturesFull[p.id];
  const apps = applications.filter((a) => a.products.includes(p.id));
  const related = products.filter((x) => x.id !== p.id);
  const surfaces = p.surfaces || [];
  const specs = [
    ['Brand', p.code],
    ['Product type', p.category],
    ['Net weight', p.netWeight || 'Available on request'],
    ['Pack formats', p.packs.join(' · ')],
    ['Key properties', feats.filter((f) => !/^for /i.test(f)).join(' · ')],
    ['Recommended for', apps.map((a) => a.name).join(' · ')],
  ];
  const pending = ['Solid content', 'Viscosity', 'Open / setting time', 'Coverage per kg', 'Shelf life'];

  return `
  <main id="main" class="pd" style="--c:${p.accent}" data-product-id="${p.id}">
    <section class="pd-hero" id="top" aria-labelledby="pdTitle">
      <canvas class="pd-hero__gl" id="pdgl" aria-label="3D view of ${esc(p.code)} packaging" role="img"></canvas>
      <img class="pd-hero__fallback" src="${p.image}" alt="${esc(p.code)} drum and pouch" width="638" height="526" />
      <div class="pd-hero__text">
        <nav class="crumbs mono" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/products/">Products</a><span>/</span><span aria-current="page">${p.code}</span></nav>
        <p class="mono eyebrow pd-cat">${p.category}</p>
        <h1 class="pd-hero__title" data-split>${p.code}</h1>
        <p class="pd-hero__name">${p.name}</p>
        <p class="pd-hero__lede">${p.description}</p>
        <dl class="pd-hero__facts">
          <div><dt class="mono">Application</dt><dd>${p.application}</dd></div>
          ${p.netWeight ? `<div><dt class="mono">Net weight</dt><dd>${p.netWeight}</dd></div>` : ''}
        </dl>
        <div class="hero__ctas">
          <a href="#enquire" class="btn btn--solid" data-link data-magnetic><span>Enquire Now</span><i class="btn__arrow" aria-hidden="true">→</i></a>
          <a href="#specs" class="btn btn--line" data-link><span>Specifications</span></a>
        </div>
      </div>
      <div class="hero__scroll mono" aria-hidden="true"><span>Scroll</span><i></i></div>
    </section>

    <section class="pd-overview section" aria-labelledby="ovTitle">
      <figure class="pd-overview__media" data-reveal-img>
        <img src="${p.drumImg}" alt="${esc(p.code)} ${p.packs[0].toLowerCase()}" loading="lazy" decoding="async" width="470" height="590" />
        <img class="pd-overview__pouch" src="${p.pouchImg}" alt="${esc(p.code)} pouch" loading="lazy" decoding="async" width="470" height="590" />
      </figure>
      <div class="pd-overview__text">
        <p class="mono eyebrow">01 — Overview</p>
        <h2 class="display" id="ovTitle" data-reveal>${p.tagline}</h2>
        <p class="pd-lead">${p.overview}</p>
        <ul class="pd-tags mono">${p.application.split(' · ').map((a) => `<li>${a}</li>`).join('')}</ul>
      </div>
    </section>

    <section class="pd-features section" aria-labelledby="ftTitle">
      <header class="section__head">
        <p class="mono eyebrow">02 — Key features</p>
        <h2 class="display" id="ftTitle" data-reveal>What it<br/>promises.</h2>
        <p class="section__aside">As listed for ${p.code} by Principle Adhesives.</p>
      </header>
      <ul class="feat-grid">
        ${feats.map((f, i) => `<li class="feat-tile"><span class="mono feat-tile__n">${String(i + 1).padStart(2, '0')}</span>${icon(featureIcon(f), 'feat-tile__icon')}<h3>${f}</h3></li>`).join('')}
      </ul>
    </section>

    <section class="pd-apps section" aria-labelledby="apTitle">
      <header class="section__head">
        <p class="mono eyebrow">03 — Applications</p>
        <h2 class="display" id="apTitle" data-reveal>Where it<br/>works.</h2>
      </header>
      <div class="pd-apps__grid">
        ${apps.map((a) => `
        <div class="app-tile" data-motif="${a.motif}" style="--c:${p.accent}">
          <span class="app-tile__art" aria-hidden="true"></span>
          <span class="mono app-tile__k">Application</span>
          <h3>${a.name}</h3>
          <p>${a.line}</p>
        </div>`).join('')}
      </div>
      ${surfaces.length ? `
      <div class="surfaces">
        <p class="mono eyebrow">Bonds ply to</p>
        <ul class="surfaces__list">${surfaces.map((s) => `<li>${s}</li>`).join('')}</ul>
      </div>` : ''}
    </section>

    <section class="pd-specs section" id="specs" aria-labelledby="spTitle">
      <header class="section__head">
        <p class="mono eyebrow">04 — Technical specifications</p>
        <h2 class="display" id="spTitle" data-reveal>The data.</h2>
      </header>
      <table class="spec-table">
        <caption class="visually-hidden">${p.code} specifications</caption>
        <tbody>
          ${specs.map(([k, v]) => `<tr><th scope="row" class="mono">${k}</th><td>${v}</td></tr>`).join('')}
          ${pending.map((k) => `<tr class="is-pending"><th scope="row" class="mono">${k}</th><td><a href="#enquire" data-link>Technical data sheet on request →</a></td></tr>`).join('')}
        </tbody>
      </table>
    </section>

    <section class="pd-gallery section" aria-labelledby="glTitle">
      <header class="section__head">
        <p class="mono eyebrow">05 — Gallery</p>
        <h2 class="display" id="glTitle" data-reveal>Up close.</h2>
      </header>
      <div class="pd-gallery__rail" data-gallery>
        <button class="gtile gtile--cut" data-full="${p.image}" style="--c:${p.accent}"><img src="${p.image}" alt="${esc(p.code)} drum and pouch" loading="lazy" decoding="async" /></button>
        <button class="gtile" data-full="${p.drumImg}"><img src="${p.drumImg}" alt="${esc(p.code)} ${p.packs[0].toLowerCase()}" loading="lazy" decoding="async" /></button>
        <button class="gtile" data-full="${p.pouchImg}"><img src="${p.pouchImg}" alt="${esc(p.code)} pouch" loading="lazy" decoding="async" /></button>
        <button class="gtile gtile--wide" data-full="/images/princecol/market-prod.jpg"><img src="/images/princecol/market-prod.jpg" alt="The Prince range" loading="lazy" decoding="async" /></button>
      </div>
    </section>

    <section class="pd-related section" aria-labelledby="rlTitle">
      <header class="section__head">
        <p class="mono eyebrow">06 — Related products</p>
        <h2 class="display" id="rlTitle" data-reveal>The rest of<br/>the range.</h2>
      </header>
      <div class="related">
        ${related.map((r) => `
        <a href="${r.url}" class="related__card" style="--c:${r.accent}" data-cursor="View">
          <span class="related__img"><img src="${r.image}" alt="${esc(r.code)}" loading="lazy" decoding="async" /></span>
          <span class="mono related__cat">${r.category}</span>
          <span class="related__code">${r.code}</span>
          <span class="related__tag">${r.tagline}</span>
        </a>`).join('')}
      </div>
    </section>

    <section class="pd-enquire section" id="enquire" aria-labelledby="enqTitle">
      <div class="pd-enquire__intro">
        <p class="mono eyebrow">07 — Enquire</p>
        <h2 class="display" id="enqTitle" data-reveal>Need the right<br/><em>solution?</em></h2>
        <p>Tell us your quantities and surfaces. Your enquiry is tagged <b>${p.code}</b> automatically.</p>
        <div class="pd-enquire__direct mono">
          <a href="tel:${tel(brand.phones[0])}">${icon('phone', 'mini-ico')}${brand.phones[0]}</a>
          <a href="${brand.whatsapp}?text=${encodeURIComponent(`Hello, I'd like to enquire about ${p.code}.`)}" target="_blank" rel="noopener">${icon('whatsapp', 'mini-ico')}WhatsApp</a>
        </div>
      </div>
      ${enquiryForm({ id: 'pd-form', product: p.id })}
    </section>
  </main>`;
}

/* ---------------- products listing: one cinematic stage per product ---------------- */
export function collection() {
  return products.map((p, i) => `
    <article class="pslide${i % 2 ? ' pslide--flip' : ''}" style="--c:${p.accent}" data-accent="${p.accent}" aria-labelledby="ps-${p.id}">
      <div class="pslide__ghost" aria-hidden="true">${p.code}</div>
      <a class="pslide__media" href="${p.url}" data-cursor="View" aria-label="View ${esc(p.code)} details">
        <span class="pslide__halo" aria-hidden="true"></span>
        <img src="${p.image}" alt="${esc(p.code)} — drum and pouch" loading="${i ? 'lazy' : 'eager'}" decoding="async" width="638" height="526" />
      </a>
      <div class="pslide__info">
        <span class="mono pslide__n">${String(i + 1).padStart(2, '0')} — ${p.category}</span>
        <h2 class="pslide__name" id="ps-${p.id}"><a href="${p.url}">${p.code}</a></h2>
        <p class="pslide__sub">${p.name}</p>
        <p class="pslide__desc">${p.description}</p>
        <dl class="pslide__facts">
          <div><dt class="mono">Category</dt><dd>${p.category}</dd></div>
          <div><dt class="mono">Main application</dt><dd>${p.application}</dd></div>
        </dl>
        <a href="${p.url}" class="btn btn--solid pslide__btn" data-magnetic><span>View Details</span><i class="btn__arrow" aria-hidden="true">→</i></a>
      </div>
    </article>`).join('');
}

const titleCase = (s) => s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
export const productMeta = (slug) => {
  const p = products.find((x) => x.slug === slug);
  return {
    title: `${titleCase(p.code)} — ${p.name} | Principle Adhesives`,
    description: `${titleCase(p.code)} by Principle Adhesives: ${p.description} ${p.netWeight ? `Net weight ${p.netWeight}.` : ''}`.trim(),
    jsonld: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Product', name: titleCase(p.code), description: p.overview, category: p.category,
      brand: { '@type': 'Brand', name: 'Prince' }, manufacturer: { '@type': 'Organization', name: brand.full },
      image: p.image,
    }),
  };
};

export { productById };
