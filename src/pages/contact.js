// Contact — banner hero, verified contact cards, enquiry form (src/site/form.js),
// lazily loaded Google Maps embeds for the office and factory (from princecol.com).
import { bootPage, heroIntro } from '../site/boot.js';
import { staggers } from '../site/components.js';
import { brand, productBySlug } from '../data/site.js';

bootPage(({ gsap, ScrollTrigger, lenis }) => {
  const hero = document.querySelector('.phero');
  heroIntro(hero);
  staggers();

  // ?product=prince-grip pre-selects the product (links from product pages / mega menu)
  const q = new URLSearchParams(location.search).get('product');
  const sel = document.getElementById('contact-form-product');
  if (q && productBySlug[q] && sel) sel.value = productBySlug[q].code;

  /* maps — only loaded when the section approaches (saves ~1 MB on first paint) */
  const host = document.getElementById('mapHost');
  const ph = document.getElementById('mapPh');
  let loaded = false;
  const show = (key) => {
    document.querySelectorAll('.location__tabs [role=tab]').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.map === key)));
    let frame = host.querySelector('iframe');
    if (!frame) {
      frame = document.createElement('iframe');
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      frame.allowFullscreen = true;
      frame.addEventListener('load', () => { ph.hidden = true; });
      host.appendChild(frame);
    }
    ph.hidden = false; ph.textContent = 'Loading map…';
    frame.title = key === 'office' ? 'Map — Principle Adhesives registered office, Goregaon West, Mumbai' : 'Map — Principle Adhesives factory, Vasai East';
    frame.src = brand.maps[key];
    loaded = true;
  };
  const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500));
  window.addEventListener('load', () => idle(() => { if (!loaded) show('office'); }, { timeout: 4000 }), { once: true });
  if (document.readyState === 'complete') idle(() => { if (!loaded) show('office'); }, { timeout: 4000 });
  document.querySelector('.location__tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-map]'); if (b) show(b.dataset.map); });
  document.querySelectorAll('.cinfo__map[data-map]').forEach((b) => b.addEventListener('click', () => {
    show(b.dataset.map);
    const t = document.querySelector('.location');
    lenis ? lenis.scrollTo(t, { duration: 1.4 }) : t.scrollIntoView({ behavior: 'smooth' });
  }));
});
