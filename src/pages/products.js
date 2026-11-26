// Products — banner hero, cinematic per-product stages with a shifting
// background, and a "find your bond" filter driven only by stated product data.
import { bootPage, heroIntro, reduced } from '../site/boot.js';
import { tilt } from '../site/components.js';
import { products, applications, properties, productFeaturesFull } from '../data/site.js';
import { splitChars } from '../ui/split.js';

function collection(gsap, ScrollTrigger) {
  const coll = document.querySelector('.pcoll');
  const idx = document.getElementById('collIdx');
  // two stacked glow layers: set the new colour on the hidden one, then cross-fade (opacity only — no repaint)
  const tints = [...coll.querySelectorAll('.pcoll__tint i')];
  let front = 0, currentTint = '';
  const swapTint = (hex) => {
    if (hex === currentTint) return;
    currentTint = hex;
    const next = tints[1 - front];
    next.style.setProperty('--tint', `${hex}55`);
    gsap.to(next, { opacity: 1, duration: 0.9, ease: 'power2.out' });
    gsap.to(tints[front], { opacity: 0, duration: 0.9, ease: 'power2.out' });
    front = 1 - front;
  };
  document.querySelectorAll('.pslide').forEach((slide, i) => {
    const name = slide.querySelector('.pslide__name a');
    splitChars(name, { masked: true });
    const media = slide.querySelector('.pslide__media');
    tilt(media, { target: media.querySelector('img'), max: 9 });

    gsap.timeline({ scrollTrigger: { trigger: slide, start: 'top 70%' } })
      .fromTo(name.querySelectorAll('.char'), { yPercent: 115, fontVariationSettings: "'wdth' 125" }, { yPercent: 0, fontVariationSettings: "'wdth' 62", stagger: 0.03, duration: 1.2, ease: 'expo.out' })
      .from(slide.querySelectorAll('.pslide__n, .pslide__sub, .pslide__desc, .pslide__facts, .pslide__btn'), { y: 30, opacity: 0, stagger: 0.07, duration: 0.9, ease: 'power3.out' }, 0.15)
      .from(media, { xPercent: i % 2 ? -12 : 12, scale: 0.86, opacity: 0, duration: 1.4, ease: 'expo.out' }, 0);

    if (!reduced) {
      gsap.fromTo(slide.querySelector('.pslide__ghost'), { xPercent: i % 2 ? -10 : 10 }, { xPercent: i % 2 ? 10 : -10, ease: 'none', scrollTrigger: { trigger: slide, start: 'top bottom', end: 'bottom top', scrub: 0.4 } });
      gsap.fromTo(media.querySelector('img'), { yPercent: 6 }, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: slide, start: 'top bottom', end: 'bottom top', scrub: 0.4 } });
    }
    // dynamic background: the whole collection takes on the product's colour
    ScrollTrigger.create({
      trigger: slide, start: 'top 55%', end: 'bottom 55%',
      onToggle: (s) => {
        if (!s.isActive) return;
        swapTint(slide.dataset.accent);
        idx.textContent = String(i + 1).padStart(2, '0');
      },
    });
  });
}

function finder(gsap) {
  const chips = [
    ...applications.filter((a) => a.products.length).map((a) => ({ key: `app:${a.id}`, label: a.name, test: (p) => a.products.includes(p.id) })),
    ...properties.map((pr) => ({ key: `prop:${pr.key}`, label: pr.label, test: (p) => productFeaturesFull[p.id].some(pr.match) })),
  ].filter((c) => products.some(c.test)); // never offer a filter nothing matches
  const host = document.getElementById('finderChips');
  const grid = document.getElementById('finderGrid');
  host.innerHTML = chips.map((c) => `<button class="fchip mono" type="button" aria-pressed="false" data-key="${c.key}">${c.label}</button>`).join('')
    + '<button class="fchip fchip--clear mono" type="button" data-clear>Clear</button>';
  grid.innerHTML = products.map((p) => `
    <li class="fcard" data-id="${p.id}" style="--c:${p.accent}">
      <a href="${p.url}">
        <span class="fcard__img"><img src="${p.image}" alt="" loading="lazy" decoding="async" /></span>
        <span class="fcard__code">${p.code}</span>
        <span class="mono fcard__cat">${p.category}</span>
        <span class="fcard__why mono"></span>
      </a>
    </li>`).join('');
  const active = new Set();
  const update = () => {
    const tests = chips.filter((c) => active.has(c.key));
    let shown = 0;
    grid.querySelectorAll('.fcard').forEach((card) => {
      const p = products.find((x) => x.id === card.dataset.id);
      const ok = tests.every((c) => c.test(p));
      if (ok) shown++;
      card.querySelector('.fcard__why').textContent = tests.length && ok ? `✓ ${tests.map((c) => c.label).join(' · ')}` : '';
      gsap.to(card, { opacity: ok ? 1 : 0.14, scale: ok ? 1 : 0.94, filter: ok ? 'grayscale(0)' : 'grayscale(1)', duration: 0.6, ease: 'expo.out' });
      card.toggleAttribute('aria-hidden', !ok);
    });
    grid.dataset.empty = shown ? '' : 'No single product matches every filter — clear one, or ask our team.';
  };
  host.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-clear')) { active.clear(); host.querySelectorAll('[aria-pressed]').forEach((x) => x.setAttribute('aria-pressed', 'false')); }
    else { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); on ? active.add(b.dataset.key) : active.delete(b.dataset.key); }
    update();
  });
  gsap.from(grid.children, { y: 50, opacity: 0, stagger: 0.07, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: grid, start: 'top 85%' } });
}

bootPage(({ gsap, ScrollTrigger }) => {
  heroIntro(document.querySelector('.phero'));
  collection(gsap, ScrollTrigger);
  finder(gsap);
});
