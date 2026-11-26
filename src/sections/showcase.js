// Hero → Showcase choreography. Everything here is scrubbed by scroll.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitChars } from '../ui/split.js';

const hexToRgb = (h) => { const n = parseInt(h.slice(1), 16); return { r: (n >> 16) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 }; };

function chapterMarkup(p, i) {
  const el = document.createElement('article');
  el.className = 'chapter';
  el.style.setProperty('--c', p.accent);
  el.setAttribute('aria-label', `${p.code} ${p.name}`);
  el.innerHTML = `
    <div class="chapter__left">
      <p class="mono chapter__chem">${String(i + 1).padStart(2, '0')} — ${p.chemistry}</p>
      <h3 class="chapter__code"><span class="mask">${p.code}</span></h3>
      <p class="chapter__name">${p.name}</p>
      <p class="chapter__tag">${p.tagline} ${p.description}</p>
    </div>
    <dl class="chapter__right">
      ${p.specs.map(([k, v]) => `<div class="spec"><dt class="mono">${k}</dt><dd>${v}</dd></div>`).join('')}
    </dl>`;
  return el;
}

export function initShowcase(stage, products) {
  const P = Object.fromEntries(products.map((p) => [p.id, stage.items[p.id].proxy]));
  const ids = products.map((p) => p.id);
  // A–E: the five packs in showcase order (flagship first)
  const [A, B, C, D, E] = ids.map((id) => P[id]);
  const wrap = document.getElementById('chapters');
  const chapters = products.map((p, i) => { const el = chapterMarkup(p, i); wrap.appendChild(el); return el; });
  chapters.forEach((ch) => splitChars(ch.querySelector('.chapter__code .mask')));

  // xlabels follow the flagship pack's opened parts (lid, drum, pouch)
  const cart = stage.items[ids[0]];
  const xl = [...document.querySelectorAll('.xlabel')];
  // on phones every callout sits to the right of the pack, so the drum uses its right-hand anchor
  stage.trackLabels(xl.map((el) => ({ el, anchor: cart.anchors[stage.mobile && el.dataset.anchor === 'body' ? 'bodyR' : el.dataset.anchor] })));

  const accent = hexToRgb(products[0].accent);
  const accentTo = (hex) => ({ ...hexToRgb(hex), duration: 0.6, ease: 'none', onUpdate: () => stage.global.accent.setRGB(accent.r, accent.g, accent.b) });
  const showcase = document.getElementById('showcase');
  const setUiAccent = (hex) => { showcase.style.setProperty('--accent', hex); document.documentElement.style.setProperty('--nav-accent', hex); };

  /* ---------------- HERO idle pose ---------------- */
  Object.assign(A, { x: 0, y: -0.05, z: 0, rx: 0.1, ry: -0.25, rz: 0.08, s: 0.9 });
  Object.assign(B, { x: -3.7, y: 0.95, z: -2.6, rx: 0.2, ry: 0.6, rz: -0.35, s: 0.7 });
  Object.assign(C, { x: 3.8, y: -0.65, z: -2.2, rx: -0.1, ry: -0.8, rz: 0.25, s: 0.7 });
  Object.assign(D, { x: -2.9, y: -1.9, z: -5, rx: 0.55, ry: 0.3, rz: 0.2, s: 0.7 });
  Object.assign(E, { x: 3.1, y: 2.05, z: -6, rx: 0.4, ry: -0.4, rz: -0.25, s: 0.7 });
  if (stage.mobile) {
    // narrow screens: one hero pack, two satellites pushed into depth, tins out of frame
    Object.assign(A, { y: 0.25, s: 1 });
    Object.assign(B, { x: -5, y: 1.9, z: -4.5, s: 0.6 });
    Object.assign(C, { x: 5, y: -1.2, z: -4, s: 0.6 });
    Object.assign(D, { x: -12, z: -9 });
    Object.assign(E, { x: 12, z: -9 });
  }

  if (stage.reduced) return reducedMode(stage, P, chapters, products);

  /* ---------------- HERO → SHOWCASE ---------------- */
  // NOTE: hero and showcase are ONE scroll timeline (see `master` below). Two separate scrubbed
  // timelines both moving the same packs let a lagging hero scrub overwrite the showcase on fast scrolls.
  const hero = gsap.timeline({ defaults: { ease: 'none', duration: 1 } });
  // The scattered hero packs gather into one family group beside the "Five adhesives" intro.
  // Back row: three packs; front row: flagship + one more. Desktop sits right of the text, phones below it.
  const m = stage.mobile;
  const group = m
    ? { A: [-1.5, -0.95, 0.4, 0.5], D: [1.5, -0.95, 0.4, 0.5], B: [-2.9, -0.05, -1.4, 0.44], C: [0, -0.05, -1.4, 0.44], E: [2.9, -0.05, -1.4, 0.44] }
    : { A: [0.65, -0.62, 0.4, 0.58], D: [2.2, -0.62, 0.4, 0.58], B: [-0.1, 0.74, -1.5, 0.5], C: [1.4, 0.74, -1.5, 0.5], E: [2.9, 0.74, -1.5, 0.5] };
  // Narrower desktops/tablets: the kx-squeezed group can slide under the "Five adhesives" heading and the
  // packs crowd each other. Only when that would happen, the stage lays the group out at its designed
  // spacing, scaled to fit the space right of the heading (global.gOn/gk/gQ, blended in by global.gf).
  // Recomputed on every refresh (resize), so it stays right after the window changes size.
  // Wide screens keep the original layout untouched.
  const introEl = document.querySelector('.showcase__intro');
  const fitGroup = () => {
    if (stage.mobile) { stage.global.gOn = 0; return; }
    const W = window.innerWidth;
    const u = window.innerHeight / (2 * 8 * Math.tan((35 / 2) * (Math.PI / 180)));
    const P = (z) => 8 / (8 - z);
    const kx = stage.kx, base = stage.base;
    const padL = introEl.offsetLeft;
    const L = padL + introEl.offsetWidth + 32;  // right edge of the heading + breathing room
    const R = W - padL;                        // same side space on the right
    const SP = 1.3; // extra air between packs in the fitted layout (rows and columns)
    const packs = Object.values(group).map(([x, , z, s]) => ({ x, z, hw: 1.25 * s * base * u * P(z) }));
    const defLeft = Math.min(...packs.map((p) => W / 2 + p.x * kx * u * P(p.z) - p.hw));
    if (defLeft >= L) { stage.global.gOn = 0; return; }
    const left = Math.min(...packs.map((p) => W / 2 + p.x * SP * u * P(p.z) - p.hw));
    const right = Math.max(...packs.map((p) => W / 2 + p.x * SP * u * P(p.z) + p.hw));
    const k = Math.min(1, (R - L) / (right - left));
    Object.assign(stage.global, { gOn: 1, gk: k, gSp: SP, gQ: L - left * k - (W / 2) * (1 - k) });
  };
  fitGroup();
  ScrollTrigger.addEventListener('refresh', fitGroup);
  const toGroup = (key) => { const [x, y, z, s] = group[key]; return { x, y, z, s, rx: 0.06, ry: -0.3, rz: 0 }; };

  hero
    .to(A, toGroup('A'), 0)
    .to(B, toGroup('B'), 0)
    .to(C, toGroup('C'), 0)
    .to(D, toGroup('D'), 0)
    .to(E, toGroup('E'), 0)
    .to(stage.global, { idle: 0.25, glow: 0.55 }, 0)
    .to(stage.global, { tex: 1, duration: 0.5 }, 0.5) // new backdrop texture only behind the "Five adhesives" intro
    .to(stage.global, { gf: 1 }, 0) // responsive group fit (only active when the group would reach the heading)
    .to('.hero__line--a', { yPercent: -60, opacity: 0 }, 0)
    .to('.hero__line--b', { yPercent: 60, opacity: 0 }, 0)
    .to('.hero__foot, .hero__meta, .hero__scroll', { y: -60, opacity: 0 }, 0);

  /* ---------------- SHOWCASE master timeline ---------------- */
  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut', duration: 1 } });

  const chIn = (ch, at) => {
    tl.set(ch, { autoAlpha: 1 }, at)
      .fromTo(ch.querySelectorAll('.chapter__code .char'), { yPercent: 115, rotate: 6 }, { yPercent: 0, rotate: 0, stagger: 0.04, duration: 0.5, ease: 'expo.out' }, at)
      .fromTo(ch.querySelectorAll('.chapter__chem, .chapter__name, .chapter__tag'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.45, ease: 'power3.out' }, at + 0.1)
      .fromTo(ch.querySelectorAll('.spec'), { x: 60, opacity: 0, clipPath: 'inset(0 0 0 100%)' }, { x: 0, opacity: 1, clipPath: 'inset(0 0 0 0%)', stagger: 0.08, duration: 0.5, ease: 'power3.out' }, at + 0.15);
  };
  const chOut = (ch, at) => {
    tl.to(ch.querySelectorAll('.chapter__left > *'), { y: -40, opacity: 0, stagger: 0.03, duration: 0.35, ease: 'power2.in' }, at)
      .to(ch.querySelectorAll('.spec'), { x: -40, opacity: 0, stagger: 0.04, duration: 0.35, ease: 'power2.in' }, at)
      .set(ch, { autoAlpha: 0 }, at + 0.45);
  };

  gsap.set(chapters, { autoAlpha: 0 });
  gsap.set('.xlabel', { opacity: 0 });

  // 0 → 1.2 intro
  tl.fromTo('.showcase__intro', { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }, 0)
    .fromTo('.showcase__rail', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.2)
    // hold the group while the intro reads, with a slow drift for depth
    .to([B, C, E], { ry: -0.1, duration: 0.8, ease: 'none' }, 0)
    .to([A, D], { ry: -0.45, duration: 0.8, ease: 'none' }, 0)
    .to('.showcase__intro', { opacity: 0, x: -60, duration: 0.4, ease: 'power2.in' }, 0.8)
    .to(stage.global, { tex: 0, duration: 0.4 }, 0.8) // back to the original oval for the chapters
    .to(stage.global, { gf: 0, duration: 0.5 }, 0.8)
    // group breaks: the flagship steps forward, the others clear the stage
    .to(A, { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1, duration: 0.55 }, 0.8)
    .to(B, { x: -3, ox: -1, y: 3, z: -1, ry: 1.5, rz: -0.8, duration: 0.5, ease: 'power3.in' }, 0.78)
    .to(C, { x: 2, y: 6, z: -3, ry: -1.2, rz: 0.6, duration: 0.5, ease: 'power3.in' }, 0.8)
    .to(D, { x: 3, ox: 1, y: -4, z: 1, ry: -1.4, rz: 0.7, duration: 0.5, ease: 'power3.in' }, 0.82)
    .to(E, { x: 3, ox: 1, y: 3, z: -4, ry: -1, rz: -0.5, duration: 0.5, ease: 'power3.in' }, 0.84)
    // chapters: shrink packs to fit between the text column and the specs
    .to(stage.global, { cf: 1, duration: 0.5 }, 0.8);

  // Chapter 1 — Princecol: full turn, then straight on to chapter 2 (exploded view removed)
  chIn(chapters[0], 1.0);
  tl.to(A, { ry: Math.PI * 2, s: 1.1, duration: 1.3, ease: 'power1.inOut' }, 1.2)
    .add(() => {}, 2.4);
  chOut(chapters[0], 2.4);

  // → Chapter 2 — EPX-2 tube
  tl.to(A, { x: -2, ox: -1, z: -2, ry: Math.PI * 3, rz: 0.9, duration: 0.8, ease: 'power3.in' }, 4.15)
    .fromTo(B, { x: 2, ox: 1, y: 0, z: -3, rx: 0, ry: -Math.PI, rz: -0.7, s: 1 }, { x: 0, ox: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1, duration: 0.9, ease: 'power3.out', immediateRender: false }, 4.35)
    .to(accent, accentTo(products[1].accent), 4.3)
    .call(setUiAccent, [products[1].accent], 4.5)
    .call(setUiAccent, [products[0].accent], 4.49);
  chIn(chapters[1], 4.75);
  tl.to(B, { ry: -0.9, rz: 0.12, z: 1.6, s: 1.08, duration: 0.8 }, 5.1)
    .to(B, { ry: 0.25, rz: -0.05, z: 0, s: 1, duration: 0.6 }, 5.9);
  chOut(chapters[1], 6.35);

  // → Chapter 3 — WD-3 bottle
  tl.to(B, { y: 7, rz: 1.1, ry: 1.5, duration: 0.7, ease: 'power3.in' }, 6.4)
    .fromTo(C, { x: 0, ox: 0, y: -7.5, z: 0, rx: 0.2, ry: -Math.PI * 2, rz: 0, s: 1 }, { x: 0, ox: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1, duration: 0.9, ease: 'power3.out', immediateRender: false }, 6.55)
    .to(accent, accentTo(products[2].accent), 6.5)
    .call(setUiAccent, [products[2].accent], 6.7)
    .call(setUiAccent, [products[1].accent], 6.69);
  chIn(chapters[2], 6.9);
  tl.to(C, { ry: 0.7, cap: 1, duration: 0.7 }, 7.3)
    .to(C, { ry: -0.35, cap: 0, duration: 0.6 }, 8.0);
  chOut(chapters[2], 8.4);

  // → Chapter 4 — CT-90 tin
  tl.to(C, { z: -14, s: 0.5, rx: -0.4, duration: 0.8, ease: 'power3.in' }, 8.45)
    .fromTo(D, { x: 0, ox: 0, y: 0.4, z: 7, rx: 1.3, ry: -1, rz: 0.2, s: 1 }, { x: 0, ox: 0, y: 0, z: 0, rx: 0.32, ry: 0, rz: 0, s: 1, duration: 1, ease: 'power3.out', immediateRender: false }, 8.6)
    .to(accent, accentTo(products[3].accent), 8.6)
    .call(setUiAccent, [products[3].accent], 8.8)
    .call(setUiAccent, [products[2].accent], 8.79);
  chIn(chapters[3], 9.0);
  tl.to(D, { lid: 1, ry: 0.5, duration: 0.8 }, 9.5)
    .to(D, { lid: 0, ry: 0.15, rx: 0.2, duration: 0.5 }, 10.35);
  chOut(chapters[3], 10.5);

  // → Chapter 5 — HM-7 pail
  tl.to(D, { x: -2, ox: -1, ry: -1.5, rz: 0.4, duration: 0.8, ease: 'power3.in' }, 10.55)
    .fromTo(E, { x: 2, ox: 1, y: 0, z: -2, rx: 0.25, ry: Math.PI, rz: -0.4, s: 1 }, { x: 0, ox: 0, y: 0, z: 0, rx: 0.25, ry: 0, rz: 0, s: 1, duration: 0.9, ease: 'power3.out', immediateRender: false }, 10.7)
    .to(accent, accentTo(products[4].accent), 10.7)
    .call(setUiAccent, [products[4].accent], 10.9)
    .call(setUiAccent, [products[3].accent], 10.89);
  chIn(chapters[4], 11.05);
  tl.to(E, { ry: -0.7, lid: 0.6, duration: 0.8 }, 11.5)
    .to(E, { ry: 0, lid: 0, duration: 0.5 }, 12.2);
  chOut(chapters[4], 12.4);

  // Finale — the full system lines up
  const order = ids;
  const gap = stage.mobile ? 1.5 : 1.72;
  order.forEach((id, i) => {
    tl.to(P[id], { x: (i - 2) * gap, ox: 0, y: -0.2, z: 0, rx: 0.06, ry: -0.25, rz: 0, s: 0.5, ls: 1, lid: 0, cap: 0, explode: 0, duration: 0.9, ease: 'power3.inOut' }, 12.5 + i * 0.06);
  });
  const codes = document.querySelector('.showcase__codes');
  codes.innerHTML = products.map((p) => `<li>${p.code}</li>`).join('');
  const sizeCodes = () => {
    const unitPx = window.innerHeight / (2 * 8 * Math.tan((35 / 2) * (Math.PI / 180)));
    codes.style.width = `${5 * gap * stage.kx * unitPx}px`;
  };
  sizeCodes();
  ScrollTrigger.addEventListener('refresh', sizeCodes);
  tl.fromTo('.showcase__outro > *', { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power3.out' }, 12.9)
    .set('.showcase__outro', { opacity: 1 }, 12.9)
    .fromTo(codes, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, 13.1)
    .fromTo(codes.children, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', stagger: 0.06, duration: 0.4 }, 13.1);
  tl.to(accent, accentTo('#E5322D'), 12.6)
    .call(setUiAccent, ['#E5322D'], 12.8)
    .call(setUiAccent, [products[4].accent], 12.79)
    .to(stage.global, { glow: 0.25, duration: 0.5 }, 12.6)
    .to(stage.global, { cf: 0, duration: 0.6 }, 12.5)
    .to({}, { duration: 0.6 }, 13.4);

  // chapter fit: the pack (with its zoom moments, ~1.15x) must fit the free space between
  // the text column and the specs (desktop/tablet) or between the heading and the spec row (phones)
  const fitChapters = () => {
    const unitPx = window.innerHeight / (2 * 8 * Math.tan((35 / 2) * (Math.PI / 180)));
    const packW = 2.4 * stage.base * unitPx * 1.45; // 1.45: the pouch swings and slides out while the pack turns
    const packH = 2.75 * stage.base * unitPx * 1.15;
    let gw = Infinity, gh = Infinity;
    chapters.forEach((ch) => {
      const l = ch.querySelector('.chapter__left').getBoundingClientRect();
      const r = ch.querySelector('.chapter__right').getBoundingClientRect();
      if (stage.mobile) { gh = Math.min(gh, r.top - l.bottom + 24); gw = Math.min(gw, window.innerWidth - 24); }
      else { gw = Math.min(gw, r.left - l.right + 24); gh = Math.min(gh, window.innerHeight * 0.8); }
    });
    stage.global.chFit = Math.max(0.5, Math.min(1, gw / packW, gh / packH));
  };
  fitChapters();
  ScrollTrigger.addEventListener('refresh', fitChapters);

  // close the scroll gap left by the removed exploded view
  const CUT = 1.6, CUT_AT = 4.0;
  const sh = (t) => (t >= CUT_AT ? t - CUT : t);
  tl.getChildren(false, true, true).forEach((c) => { if (c.startTime() >= CUT_AT) c.startTime(c.startTime() - CUT); });

  // rail
  const starts = [1.0, 4.75, 6.9, 9.0, 11.05].map(sh);
  const idx = document.getElementById('railIdx');
  const name = document.getElementById('railName');
  const bar = document.getElementById('railBar');
  let current = -1;
  tl.eventCallback('onUpdate', () => {
    const t = tl.time();
    let i = 0; starts.forEach((s, k) => { if (t >= s - 0.2) i = k; });
    if (t > sh(12.5)) i = 5;
    if (i !== current) {
      current = i;
      idx.textContent = String(Math.min(i + 1, 5)).padStart(2, '0');
      name.textContent = i === 5 ? 'Full system' : products[i].code;
    }
    bar.style.transform = `scaleX(${t / tl.duration()})`;
  });

  /* ---------------- one master timeline: hero (scaled to its scroll share) → showcase ---------------- */
  const heroEl = document.querySelector('.hero');
  const heroShare = tl.duration() * heroEl.offsetHeight / Math.max(1, showcase.offsetHeight - window.innerHeight);
  hero.timeScale(hero.duration() / heroShare);
  const master = gsap.timeline({
    scrollTrigger: { trigger: heroEl, start: 'top top', endTrigger: showcase, end: 'bottom bottom', scrub: 0.4 },
  });
  master.add(hero, 0).add(tl, heroShare);

  // pause GL when the stage is covered
  ScrollTrigger.create({
    trigger: '#products', start: 'top top', end: 'max',
    onToggle: (self) => { stage.active = !self.isActive; },
  });
}

function reducedMode(stage, P, chapters) {
  // Static, legible fallback: show chapters stacked as normal content, product in hero pose.
  stage.global.idle = 0;
  document.getElementById('showcase').classList.add('is-static');
  chapters.forEach((c) => c.classList.add('is-static'));
}
