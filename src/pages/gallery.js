// Gallery — drifting hero collage, filterable masonry (by type and by product),
// full-screen viewer with previous / next, keyboard and swipe.
import { bootPage, heroIntro, reduced } from '../site/boot.js';
import { lightbox } from '../site/components.js';
import { gallery, galleryCats, products, productById } from '../data/site.js';

bootPage(({ gsap, ScrollTrigger, lenis }) => {
  heroIntro(document.querySelector('.phero'));

  /* hero: product cut-outs drifting at different depths */
  const float = document.getElementById('galFloat');
  float.innerHTML = products.map((p, i) => `<img src="${p.image}" alt="" class="gfloat gfloat--${i}" loading="eager" />`).join('');
  if (!reduced) {
    float.querySelectorAll('.gfloat').forEach((img, i) => {
      gsap.to(img, { y: i % 2 ? -24 : 24, rotate: i % 2 ? 3 : -3, duration: 4 + i, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      gsap.to(img, { yPercent: -40 - i * 18, ease: 'none', scrollTrigger: { trigger: '.phero', start: 'top top', end: 'bottom top', scrub: 0.4 } });
    });
  }
  document.getElementById('galCount').textContent = gallery.length;

  /* filters */
  const cats = document.getElementById('galFilters');
  const prods = document.getElementById('galProducts');
  cats.innerHTML = galleryCats.map((c, i) => `<button type="button" class="fchip mono" aria-pressed="${i === 0}" data-cat="${c.key}">${c.label} <small>${c.key === 'all' ? gallery.length : gallery.filter((g) => g.cat === c.key).length}</small></button>`).join('');
  prods.innerHTML = `<button type="button" class="fchip mono" aria-pressed="true" data-prod="all">All products</button>` + products.map((p) => `<button type="button" class="fchip mono" aria-pressed="false" data-prod="${p.id}" style="--c:${p.accent}">${p.code}</button>`).join('');

  const grid = document.getElementById('galGrid');
  grid.innerHTML = gallery.map((g, i) => `
    <li class="gitem${g.cutout ? ' gitem--cut' : ''}${g.wide ? ' gitem--wide' : ''}" data-cat="${g.cat}" data-prod="${g.product || 'all'}" ${g.product ? `style="--c:${productById[g.product].accent}"` : ''}>
      <button type="button" data-i="${i}" aria-label="Open image: ${g.alt}">
        <img src="${g.src}" alt="${g.alt}" loading="lazy" decoding="async" onload="this.closest('.gitem').classList.add('is-loaded')" onerror="this.closest('.gitem').classList.add('is-error')" />
        <span class="gitem__cap mono">${g.alt}</span>
      </button>
    </li>`).join('');

  let cat = 'all', prod = 'all';
  const visible = () => gallery.map((g, i) => ({ ...g, i })).filter((g) => (cat === 'all' || g.cat === cat) && (prod === 'all' || g.product === prod));
  const apply = () => {
    const keep = new Set(visible().map((g) => g.i));
    const items = [...grid.children];
    gsap.to(items.filter((el, i) => !keep.has(i)), { opacity: 0, scale: 0.94, duration: 0.3, onComplete() { this.targets().forEach((el) => { el.hidden = true; }); ScrollTrigger.refresh(); } });
    const show = items.filter((el, i) => keep.has(i));
    show.forEach((el) => { el.hidden = false; });
    gsap.fromTo(show, { opacity: 0, y: 30 }, { opacity: 1, y: 0, scale: 1, stagger: 0.04, duration: 0.7, ease: 'expo.out', delay: 0.25 });
    grid.dataset.empty = show.length ? '' : 'No images in this combination yet.';
  };
  const press = (wrap, btn) => wrap.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
  cats.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; cat = b.dataset.cat; press(cats, b); apply(); });
  prods.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; prod = b.dataset.prod; press(prods, b); apply(); });

  /* viewer walks only the images currently visible */
  const open = lightbox(() => visible(), { lenis });
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (!b) return;
    const list = visible();
    open(Math.max(0, list.findIndex((g) => g.i === +b.dataset.i)));
  });

  gsap.from(grid.children, { y: 60, opacity: 0, stagger: 0.05, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: grid, start: 'top 85%' } });
});
