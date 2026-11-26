// Applications — cycling industry art hero, editorial index with cursor preview,
// and a tabbed navigator whose background, copy and products transition together.
import { bootPage, heroIntro, reduced } from '../site/boot.js';
import { motifSVG } from '../site/components.js';
import { applications, productById } from '../data/site.js';
import { splitChars } from '../ui/split.js';

const BRAND = '#E5322D';
const accentOf = (a) => (a.products[0] ? productById[a.products[0]].accent : BRAND);

bootPage(({ gsap, lenis, isMobile }) => {
  heroIntro(document.querySelector('.phero'));

  /* ---- hero: industry visuals crossfade ---- */
  const art = document.getElementById('heroArt');
  art.innerHTML = applications.map((a, i) => `<div class="apps-hero__layer${i ? '' : ' is-on'}">${motifSVG(a.motif, accentOf(a))}</div>`).join('');
  const layers = [...art.children];
  const now = document.getElementById('heroNow');
  let h = 0;
  if (!reduced) setInterval(() => {
    if (document.hidden) return;
    layers[h].classList.remove('is-on');
    h = (h + 1) % layers.length;
    layers[h].classList.add('is-on');
    now.textContent = applications[h].name;
  }, 3200);

  /* ---- index rows ---- */
  const list = document.getElementById('indIndex');
  list.innerHTML = applications.map((a, i) => `
    <li class="irow" id="${a.id}" style="--c:${accentOf(a)}">
      <a href="#explore" data-select="${a.id}" class="irow__link">
        <span class="mono irow__n">${String(i + 1).padStart(2, '0')}</span>
        <span class="irow__name">${a.name}</span>
        <span class="irow__line">${a.line}</span>
        <span class="mono irow__tag">${a.products.length ? `${a.products.length} Prince product${a.products.length > 1 ? 's' : ''}` : 'Requirement-led formulation'}</span>
        <span class="irow__go" aria-hidden="true">→</span>
      </a>
    </li>`).join('');
  gsap.from(list.children, { y: 40, opacity: 0, stagger: 0.06, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: list, start: 'top 85%' } });

  // cursor-following preview of the industry visual + its products (desktop pointers)
  const prev = document.getElementById('indPreview');
  if (window.matchMedia('(hover: hover) and (min-width: 900px)').matches) {
    const qx = gsap.quickTo(prev, 'x', { duration: 0.6, ease: 'power3.out' });
    const qy = gsap.quickTo(prev, 'y', { duration: 0.6, ease: 'power3.out' });
    list.addEventListener('pointermove', (e) => { qx(e.clientX + 30); qy(e.clientY - 120); });
    list.querySelectorAll('.irow').forEach((row) => {
      row.addEventListener('pointerenter', () => {
        const a = applications.find((x) => x.id === row.id);
        prev.style.setProperty('--c', accentOf(a));
        prev.innerHTML = motifSVG(a.motif, accentOf(a)) + (a.products.length ? `<div class="ind-index__prods">${a.products.slice(0, 3).map((id) => `<img src="${productById[id].image}" alt="" />`).join('')}</div>` : '');
        gsap.to(prev, { opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' });
      });
      row.addEventListener('pointerleave', () => gsap.to(prev, { opacity: 0, scale: 0.9, duration: 0.3 }));
    });
  }

  /* ---- navigator ---- */
  const tabs = document.getElementById('navTabs');
  const panel = document.getElementById('navPanel');
  const navArt = document.getElementById('navArt');
  tabs.innerHTML = applications.map((a, i) => `<button role="tab" id="tab-${a.id}" aria-controls="navPanel" aria-selected="false" tabindex="-1" data-id="${a.id}" style="--c:${accentOf(a)}"><span class="mono">${String(i + 1).padStart(2, '0')}</span>${a.name}</button>`).join('');
  navArt.innerHTML = applications.map((a) => `<div class="navigator__layer" data-id="${a.id}">${motifSVG(a.motif, accentOf(a))}</div>`).join('');
  let current = null;

  function select(id, { focus = false } = {}) {
    const a = applications.find((x) => x.id === id) || applications[0];
    if (current === a.id) return;
    current = a.id;
    tabs.querySelectorAll('[role=tab]').forEach((t) => {
      const on = t.dataset.id === a.id;
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    panel.setAttribute('aria-labelledby', `tab-${a.id}`);
    document.querySelector('.navigator').style.setProperty('--c', accentOf(a));
    navArt.querySelectorAll('.navigator__layer').forEach((l) => l.classList.toggle('is-on', l.dataset.id === a.id));

    const prods = a.products.map((pid) => productById[pid]);
    panel.innerHTML = `
      <p class="mono navigator__k">${String(applications.indexOf(a) + 1).padStart(2, '0')} / ${String(applications.length).padStart(2, '0')}</p>
      <h3 class="navigator__name">${a.name}</h3>
      <p class="navigator__line">${a.line}</p>
      ${a.uses.length ? `<div class="navigator__uses"><p class="mono eyebrow" data-no-reveal>Applications</p><ul>${a.uses.map((u) => `<li>${u}</li>`).join('')}</ul></div>` : ''}
      ${prods.length ? `
        <div class="navigator__prods"><p class="mono eyebrow" data-no-reveal>Related products</p>
          <ul>${prods.map((p) => `<li><a href="${p.url}" style="--c:${p.accent}"><img src="${p.image}" alt="" loading="lazy" /><span>${p.code}</span><small class="mono">${p.category}</small></a></li>`).join('')}</ul>
        </div>` : `
        <div class="navigator__custom">
          <p>Principle Adhesives formulates synthetic rubber, PU, PVA and PVC based adhesives — water- and solvent-based — to each manufacturer’s requirement.</p>
          <a href="/contact/" class="btn btn--solid" data-magnetic><span>Explore Solutions</span><i class="btn__arrow" aria-hidden="true">→</i></a>
        </div>`}`;
    const name = panel.querySelector('.navigator__name');
    splitChars(name, { masked: true });
    gsap.timeline()
      .fromTo(name.querySelectorAll('.char'), { yPercent: 110 }, { yPercent: 0, stagger: 0.02, duration: 0.9, ease: 'expo.out' })
      .from(panel.querySelectorAll('.navigator__line, .navigator__uses li, .navigator__prods li, .navigator__custom > *'), { y: 24, opacity: 0, stagger: 0.04, duration: 0.7, ease: 'power3.out' }, 0.1);
  }

  tabs.addEventListener('click', (e) => { const b = e.target.closest('[role=tab]'); if (b) select(b.dataset.id); });
  tabs.addEventListener('keydown', (e) => {
    const all = [...tabs.querySelectorAll('[role=tab]')];
    const i = all.findIndex((t) => t.dataset.id === current);
    const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (k) { e.preventDefault(); select(all[(i + k + all.length) % all.length].dataset.id, { focus: true }); }
  });
  list.addEventListener('click', (e) => {
    const a = e.target.closest('[data-select]');
    if (!a) return;
    e.preventDefault(); e.stopPropagation();
    select(a.dataset.select);
    const target = document.getElementById('explore');
    lenis ? lenis.scrollTo(target, { duration: 1.4 }) : target.scrollIntoView({ behavior: 'smooth' });
  }, true);

  const fromHash = applications.find((a) => `#${a.id}` === location.hash);
  select(fromHash ? fromHash.id : applications[0].id);
  if (fromHash) requestAnimationFrame(() => { const t = document.getElementById('explore'); lenis ? lenis.scrollTo(t, { immediate: true }) : t.scrollIntoView(); });
});
