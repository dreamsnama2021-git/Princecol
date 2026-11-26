// Technology & Quality — molecular network hero, chemistry tiles, pinned process,
// a product × property matrix built from the product pages, counters.
import { bootPage, heroIntro, reduced } from '../site/boot.js';
import { counters, staggers } from '../site/components.js';
import { chemistries, approach, products, properties, productFeaturesFull } from '../data/site.js';
import { palette } from '../ui/theme.js';
import { splitWords } from '../ui/split.js';

/* ---------- interactive molecule network ---------- */
function molecules(ScrollTrigger) {
  const c = document.getElementById('molecules');
  const ctx = c.getContext('2d');
  const hero = c.parentElement;
  const mobile = window.matchMedia('(max-width: 899px)').matches;
  let W, H, dpr, nodes = [], visible = true;
  const mouse = { x: -9999, y: -9999 };
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--molten').trim() || '#e5322d';
  const build = () => {
    dpr = Math.min(devicePixelRatio, 1.5); W = hero.clientWidth; H = hero.clientHeight;
    c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = mobile ? 46 : 110;
    nodes = [...Array(n)].map(() => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: 1.4 + Math.random() * 2.2, hot: Math.random() < 0.12 }));
  };
  build();
  addEventListener('resize', build);
  hero.addEventListener('pointermove', (e) => { const r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  hero.addEventListener('pointerleave', () => { mouse.x = -9999; });
  ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: (s) => { visible = s.isActive; } });
  const R = mobile ? 90 : 130;
  const frame = () => {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    ctx.clearRect(0, 0, W, H);
    for (const p of nodes) {
      if (!reduced) { p.x += p.vx; p.y += p.vy; }
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (dm < 180) { p.x += (mouse.x - p.x) * 0.004; p.y += (mouse.y - p.y) * 0.004; }
    }
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < R) {
          const nearMouse = Math.hypot((a.x + b.x) / 2 - mouse.x, (a.y + b.y) / 2 - mouse.y) < 160;
          ctx.strokeStyle = nearMouse ? accent : `rgba(${palette.fgRgb},${0.16 * (1 - d / R)})`;
          ctx.globalAlpha = nearMouse ? 0.9 * (1 - d / R) : 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
    for (const p of nodes) {
      ctx.fillStyle = p.hot ? accent : `rgba(${palette.fgRgb},0.55)`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
  };
  frame();
}

const glyph = (code) => {
  // tiny repeating-unit glyphs, one per chemistry
  const shapes = {
    SR: '<path d="M6 40 L20 24 L34 40 L48 24 L62 40" /><circle cx="20" cy="24" r="3"/><circle cx="48" cy="24" r="3"/>',
    PU: '<path d="M8 32 h14 M42 32 h14" /><rect x="22" y="22" width="20" height="20" /><path d="M32 22 v-12 M32 42 v12" />',
    PVA: '<path d="M6 40 L20 28 L34 40 L48 28 L62 40" /><path d="M20 28 v-14 M48 28 v-14" /><circle cx="20" cy="12" r="3"/><circle cx="48" cy="12" r="3"/>',
    PVC: '<path d="M6 36 L20 24 L34 36 L48 24 L62 36" /><path d="M34 36 v14 M6 36 v14" /><text x="30" y="60" font-size="9">Cl</text>',
  };
  return `<svg class="chem__glyph icon-draw" viewBox="0 0 68 64" aria-hidden="true">${shapes[code]}</svg>`;
};

bootPage(({ gsap, ScrollTrigger, isMobile }) => {
  heroIntro(document.querySelector('.phero'));
  molecules(ScrollTrigger);

  /* chemistries */
  document.getElementById('chemGrid').innerHTML = chemistries.map((c) => `
    <li class="chem"><span class="chem__code">${c.code}</span>${glyph(c.code)}<h3>${c.name}</h3><p class="mono">${c.note}</p></li>`).join('');
  document.querySelectorAll('.chem__glyph *').forEach((s) => { const L = s.getTotalLength?.() || 120; s.style.strokeDasharray = L; s.style.strokeDashoffset = L; });
  gsap.to('.chem__glyph *', { strokeDashoffset: 0, duration: 1.6, stagger: 0.05, ease: 'power2.inOut', scrollTrigger: { trigger: '#chemGrid', start: 'top 80%' } });

  /* process steps — pinned on desktop, the active step lights up with a progress ring */
  const steps = document.getElementById('procSteps');
  steps.innerHTML = approach.map((s) => `<li class="pstep"><span class="pstep__n">${s.n}</span><div><h3>${s.title}</h3><p>${s.body}</p></div></li>`).join('');
  const items = [...steps.children];
  const ring = document.getElementById('procRing');
  const num = document.getElementById('procNum');
  const C = 2 * Math.PI * 52;
  ring.style.strokeDasharray = C; ring.style.strokeDashoffset = C;
  const setActive = (p) => {
    const i = Math.min(items.length - 1, Math.floor(p * items.length));
    items.forEach((el, k) => el.classList.toggle('is-active', k === i));
    items.forEach((el, k) => el.classList.toggle('is-done', k < i));
    num.textContent = String(i + 1).padStart(2, '0');
    ring.style.strokeDashoffset = C * (1 - p);
  };
  setActive(0);
  ScrollTrigger.create({
    trigger: '.process', start: 'top top', end: isMobile() ? '+=120%' : '+=220%', pin: '.process__pin', scrub: 0.4,
    onUpdate: (s) => setActive(s.progress),
  });

  /* quality matrix */
  const m = document.getElementById('matrix');
  const has = (p, prop) => productFeaturesFull[p.id].some(prop.match);
  const rows = properties.filter((pr) => products.some((p) => has(p, pr)));
  m.style.setProperty('--cols', products.length);
  m.innerHTML = `
    <div class="matrix__row matrix__row--head" role="row"><span role="columnheader" class="mono">Property</span>${products.map((p, j) => `<a role="columnheader" href="${p.url}" class="matrix__prod" data-col="${j}" style="--c:${p.accent}"><img src="${p.image}" alt="" loading="lazy" /><span>${p.code}</span></a>`).join('')}</div>
    ${rows.map((pr) => `<div class="matrix__row" role="row"><span role="rowheader" class="matrix__prop">${pr.label}</span>${products.map((p, j) => `<span role="cell" class="matrix__cell" data-col="${j}" style="--c:${p.accent}">${has(p, pr) ? '<i class="dot" aria-label="Yes"></i>' : '<i class="dash" aria-label="Not stated"></i>'}</span>`).join('')}</div>`).join('')}`;
  gsap.from(m.querySelectorAll('.dot'), { scale: 0, duration: 0.6, stagger: { each: 0.025, from: 'start' }, ease: 'back.out(3)', scrollTrigger: { trigger: m, start: 'top 75%' } });
  gsap.from(m.querySelectorAll('.matrix__row'), { opacity: 0, x: -30, stagger: 0.05, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: m, start: 'top 80%' } });
  m.addEventListener('pointerover', (e) => {
    const cell = e.target.closest('[data-col]');
    m.querySelectorAll('.is-col').forEach((x) => x.classList.remove('is-col'));
    if (cell) m.querySelectorAll(`[data-col="${cell.dataset.col}"]`).forEach((x) => x.classList.add('is-col'));
  });
  m.addEventListener('pointerleave', () => m.querySelectorAll('.is-col').forEach((x) => x.classList.remove('is-col')));

  counters(); staggers();
  document.querySelectorAll('[data-split-words]').forEach((el) => {
    const w = splitWords(el);
    gsap.fromTo(w, { opacity: 0.12 }, { opacity: 1, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 55%', scrub: 0.3 } });
  });
});
