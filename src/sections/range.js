// Product range mosaic + product detail drawer.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
  const wrap = document.createElement('div');
  wrap.className = 'r2 range--v2';
  wrap.id = 'range2';
  wrap.innerHTML = `
    <header class="r2__head">
      <h2 class="r2__pill" id="range2Title">Product range</h2>
      <p class="r2__lede">Five Prince adhesives — synthetic resin and P.V.A. — formulated for furniture, packaging, interiors and flooring, each with the extra bonding strength our name stands for.</p>
    </header>
    <div class="r2__grid">${products.map((p, i) => {
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
    }).join('')}</div>`;
  section.appendChild(wrap);

  // scroll reveals are created the first time this layout is shown (hidden elements have no position)
  let revealed = false;
  return function revealV2() {
    if (revealed) return;
    revealed = true;
    wrap.querySelectorAll('.r2__col').forEach((col, i) => {
      gsap.from(col.children, {
        y: 60, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.12, delay: (i % 5) * 0.06,
        scrollTrigger: { trigger: col, start: 'top 88%' },
      });
    });
    gsap.from(wrap.querySelectorAll('.r2__head > *'), { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: wrap, start: 'top 85%' } });
  };
}

/* On-page switch between the two Product Range layouts (no reload; remembered for the visit). */
const ICON_SHOWCASE = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="7"/><rect x="1.5" y="10.5" width="6" height="4"/><rect x="9.5" y="10.5" width="5" height="4"/></svg>';
const ICON_CARDS = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="1.5" width="5.5" height="7"/><rect x="1.5" y="10.5" width="5.5" height="4"/><rect x="9" y="1.5" width="5.5" height="4"/><rect x="9" y="7.5" width="5.5" height="7"/></svg>';
export function initRangeSwitch(initial, revealV2) {
  const section = document.getElementById('products');
  const bar = document.createElement('div');
  bar.className = 'rswitch';
  bar.innerHTML = `
    <span class="mono rswitch__label" id="rswitchLabel">View</span>
    <div class="rswitch__group" role="group" aria-labelledby="rswitchLabel">
      <button type="button" class="mono" data-v="1">${ICON_SHOWCASE}<span>Showcase</span></button>
      <button type="button" class="mono" data-v="2">${ICON_CARDS}<span>Cards</span></button>
    </div>`;
  section.prepend(bar);

  const set = (v, animate) => {
    section.classList.toggle('is-v2', v === '2');
    section.setAttribute('aria-labelledby', v === '2' ? 'range2Title' : 'rangeTitle');
    bar.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
    try { sessionStorage.setItem('pa-range', v); } catch (e) { /* storage blocked: still switches */ }
    if (v === '2') revealV2();
    ScrollTrigger.refresh(); // the section height changes, so everything below re-measures
    if (animate) {
      const shown = v === '2' ? section.querySelector('#range2') : [section.querySelector('.section__head'), section.querySelector('#rangeGrid')];
      gsap.fromTo(shown, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', clearProps: 'opacity,transform' });
    }
  };
  bar.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-v]');
    if (b && b.getAttribute('aria-pressed') !== 'true') set(b.dataset.v, true);
  });
  set(initial, false);
}
const ARROW = '<svg viewBox="0 0 24 24"><path d="M8 16L16 8M9 8h7v7"/></svg>';
