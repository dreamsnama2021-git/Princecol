// Product range mosaic + product detail drawer.
import { gsap } from 'gsap';

export function initRange(products, renders, lenis) {
  const grid = document.getElementById('rangeGrid');
  products.forEach((p, i) => {
    const a = document.createElement('article');
    a.className = 'pcard';
    a.style.setProperty('--c', p.accent);
    a.dataset.cursor = 'Explore';
    a.innerHTML = `
      <span class="pcard__idx mono">${String(i + 1).padStart(2, '0')}</span>
      <span class="pcard__chem mono">${p.chemistry}</span>
      <div class="pcard__media">${renders[p.id] ? `<img src="${renders[p.id]}" alt="${p.code} ${p.name} packaging" loading="lazy" decoding="async" />` : `<span class="pcard__fallback">${p.code}</span>`}</div>
      <div class="pcard__text">
        <h3 class="pcard__code">${p.code}</h3>
        <p class="pcard__name">${p.name}</p>
        <p class="pcard__desc">${p.description}</p>
        <div class="pcard__foot mono">
          <span>${p.application}</span>
          <button class="pcard__go" aria-label="Explore ${p.code} ${p.name}">Explore <i aria-hidden="true">→</i></button>
        </div>
      </div>
      <span class="pcard__shimmer" aria-hidden="true"></span>`;
    grid.appendChild(a);

    a.addEventListener('click', () => openDrawer(p, renders[p.id]));

    // reveal
    gsap.timeline({ scrollTrigger: { trigger: a, start: 'top 85%' } })
      .to(a.querySelector('.pcard__shimmer'), { scaleY: 0, duration: 1.1, ease: 'expo.inOut' })
      .from(a.querySelector('.pcard__media'), { yPercent: 18, scale: 0.86, duration: 1.4, ease: 'expo.out' }, 0.3)
      .from(a.querySelectorAll('.pcard__text > *'), { y: 30, opacity: 0, stagger: 0.07, duration: 0.9, ease: 'power3.out' }, 0.45);

    // 3D tilt on hover (desktop pointers only)
    if (window.matchMedia('(hover: hover)').matches) {
      const img = a.querySelector('.pcard__media');
      const qx = gsap.quickTo(img, 'rotationY', { duration: 0.8, ease: 'power3.out' });
      const qy = gsap.quickTo(img, 'rotationX', { duration: 0.8, ease: 'power3.out' });
      a.addEventListener('pointermove', (e) => {
        const r = a.getBoundingClientRect();
        qx(((e.clientX - r.left) / r.width - 0.5) * 18);
        qy(-((e.clientY - r.top) / r.height - 0.5) * 12);
      });
      a.addEventListener('pointerleave', () => { qx(0); qy(0); });
    }
  });

  // parallax drift between columns
  // only in the full mosaic (>1100px), where cards 3 & 5 share their own column — elsewhere the drift would push a card into its neighbour
  gsap.matchMedia().add('(min-width: 1101px)', () => {
    gsap.utils.toArray('.pcard:nth-child(3), .pcard:nth-child(5)').forEach((c) =>
      gsap.to(c, { y: -70, ease: 'none', scrollTrigger: { trigger: grid, start: 'top bottom', end: 'bottom top', scrub: true } }));
  });

  /* drawer */
  const drawer = document.getElementById('drawer');
  const scrim = document.getElementById('scrim');
  let lastFocus = null;
  function openDrawer(p, src) {
    lastFocus = document.activeElement;
    drawer.style.setProperty('--c', p.accent);
    document.getElementById('drawerImg').src = src || '';
    document.getElementById('drawerImg').alt = `${p.code} drum and pouch`;
    document.getElementById('drawerChem').textContent = `${p.code} — ${p.chemistry}`;
    document.getElementById('drawerTitle').textContent = p.name;
    document.getElementById('drawerDesc').textContent = `${p.tagline} ${p.description}`;
    document.getElementById('drawerSpecs').innerHTML = p.specs.map(([k, v]) => `<div class="spec"><dt class="mono">${k}</dt><dd>${v}</dd></div>`).join('');
    document.getElementById('drawerApp').textContent = p.application;
    const page = document.getElementById('drawerPage');
    if (page && p.url) page.href = p.url;
    drawer.classList.add('is-open'); scrim.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    lenis?.stop();
    drawer.querySelector('.drawer__close').focus();
    gsap.fromTo('#drawerImg', { y: 60, rotate: -6, opacity: 0 }, { y: 0, rotate: 0, opacity: 1, duration: 1.2, delay: 0.2, ease: 'expo.out' });
    gsap.fromTo('.drawer__body > *', { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.8, delay: 0.3, ease: 'power3.out' });
  }
  function close() {
    drawer.classList.remove('is-open'); scrim.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    lenis?.start();
    lastFocus?.focus?.();
  }
  drawer.querySelector('.drawer__close').addEventListener('click', close);
  scrim.addEventListener('click', close);
  drawer.querySelectorAll('.btn').forEach((b) => b.addEventListener('click', () => close()));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) close(); });
}

/* =========================================================
   OPTION 2 — masonry "service card" layout.
   One column per product: a photo tile + a solid text tile (title, description,
   icon, arrow). Columns alternate photo-first / text-first so the edges stagger.
   Every tile links to the product page.
   ========================================================= */
const R2_ICON = { princecol: 'drop', princebond: 'flame', princelite: 'layers', princeglu: 'chair', princegrip: 'bond' };
const titleCase = (s) => s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

export function initRange2(products, icon) {
  const section = document.getElementById('products');
  const grid = document.getElementById('rangeGrid');
  section.classList.add('range--v2');
  const head = section.querySelector('.section__head');
  head.className = 'r2__head';
  head.innerHTML = `
    <h2 class="r2__pill" id="rangeTitle">Product range</h2>
    <p class="r2__lede">Five Prince adhesives — synthetic resin and P.V.A. — formulated for furniture, packaging, interiors and flooring, each with the extra bonding strength our name stands for.</p>`;
  grid.className = 'r2__grid';
  grid.innerHTML = products.map((p, i) => {
    const name = titleCase(p.code);
    const media = `
      <a class="r2__tile r2__media" href="${p.url}" style="--c:${p.accent}" aria-label="${name} — view product">
        <img src="${p.drumImg}" alt="${name} ${p.shape === 'pail' ? 'bucket' : 'drum'}" loading="lazy" decoding="async" width="470" height="590" />
        <span class="r2__go r2__go--ghost" aria-hidden="true">${ARROW}</span>
      </a>`;
    const text = `
      <a class="r2__tile r2__card" href="${p.url}" style="--c:${p.accent}">
        <span class="r2__kicker mono">${String(i + 1).padStart(2, '0')} — ${p.category || p.chemistry}</span>
        <h3 class="r2__title">${name}</h3>
        <p class="r2__text">${p.description}</p>
        <span class="r2__foot">
          <span class="r2__icon" aria-hidden="true">${icon(R2_ICON[p.id] || 'bond', 'r2__svg')}</span>
          <span class="r2__go" aria-hidden="true">${ARROW}</span>
        </span>
      </a>`;
    return `<div class="r2__col${i % 2 ? ' r2__col--flip' : ''}">${i % 2 ? text + media : media + text}</div>`;
  }).join('');

  // reveal: tiles rise in column by column
  gsap.utils.toArray('.r2__col').forEach((col, i) => {
    gsap.from(col.children, {
      y: 60, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.12, delay: (i % 5) * 0.06,
      scrollTrigger: { trigger: col, start: 'top 88%' },
    });
  });
  gsap.from('.r2__head > *', { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '.r2__head', start: 'top 85%' } });
}
const ARROW = '<svg viewBox="0 0 24 24"><path d="M8 16L16 8M9 8h7v7"/></svg>';
