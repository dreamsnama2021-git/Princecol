// Hero → Showcase choreography. Everything here is scrubbed by scroll.
import * as THREE from 'three';
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
    Object.assign(D, { x: -20, z: -9 });
    Object.assign(E, { x: 20, z: -9 });
  }

  /* The heading sits behind the packs (CSS). Packs keep their size; a pack that would cover heading
     letters moves the shortest distance to a spot where it covers none — below the nav, on screen, clear
     of the description/buttons and of the other packs where possible. Packs already clear don't move. */
  const nudgeHero = () => {
    const W = window.innerWidth, H = window.innerHeight;
    const u = H / (2 * 8 * Math.tan((35 / 2) * (Math.PI / 180)));   // px per world unit at z = 0
    const kx = stage.kx, mob = stage.mobile;
    const ink = (el) => { const r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect(); };
    const grow = (r, m) => ({ l: r.left - m, r: r.right + m, t: r.top - m, b: r.bottom + m });
    // The heading letters are mid-intro here (shifted and wider), so measure where the words END UP:
    // an invisible, un-animated copy of the heading laid over the same box.
    const h1 = document.querySelector('.hero__title');
    const ghost = h1.cloneNode(false);
    ghost.removeAttribute('id');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.innerHTML = '<span class="hero__line hero__line--a">Engineered to bond.</span><span class="hero__line hero__line--b">Built to last.</span>';
    Object.assign(ghost.style, { position: 'absolute', left: h1.offsetLeft + 'px', top: h1.offsetTop + 'px', width: h1.offsetWidth + 'px', height: h1.offsetHeight + 'px', margin: '0', visibility: 'hidden' });
    h1.parentElement.appendChild(ghost);
    const lines = [...ghost.querySelectorAll('.hero__line')].map((el) => grow(ink(el), 12));
    ghost.remove();
    // everything readable is off-limits: both heading lines, the meta line, the description and the buttons
    const texts = lines.concat(['.hero__meta', '.hero__lede', '.hero__ctas', '.hero__scroll']
      .map((sel) => document.querySelector(sel))
      .filter((el) => el && getComputedStyle(el).display !== 'none')
      .map((el) => { const g = grow(el.getBoundingClientRect(), 10); g.t -= 30; return g; }));   // these rise 30px in their intro
    const navB = (document.getElementById('nav')?.getBoundingClientRect().bottom || 70) + 4;
    const hit = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
    const area = (a, b) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));
    const inside = (bx) => bx.t >= navB && bx.b <= H - 8 && bx.l >= 6 && bx.r <= W - 6;
    const gap = (r, m) => ({ l: r.l - m, r: r.r + m, t: r.t - m, b: r.b + m });

    // real on-screen box of a pack in its final hero pose (projected 3D bounds, plus room for its gentle sway)
    const intro0 = stage.global.intro;
    stage.global.intro = 1;
    stage.camera.updateMatrixWorld();   // before the first render the camera matrices are still the defaults
    const itemOf = (pr) => Object.values(stage.items).find((it) => it.proxy === pr);
    const bb3 = new THREE.Box3(), v = new THREE.Vector3();
    const measure = (pr) => {
      const it = itemOf(pr);
      stage.apply(0);
      it.root.updateWorldMatrix(true, true);
      bb3.setFromObject(it.root);
      let l = Infinity, r = -Infinity, t = Infinity, b = -Infinity;
      for (const x of [bb3.min.x, bb3.max.x]) for (const y of [bb3.min.y, bb3.max.y]) for (const z of [bb3.min.z, bb3.max.z]) {
        v.set(x, y, z).project(stage.camera);
        const sx = (v.x + 1) / 2 * W, sy = (1 - v.y) / 2 * H;
        l = Math.min(l, sx); r = Math.max(r, sx); t = Math.min(t, sy); b = Math.max(b, sy);
      }
      return { cx: (l + r) / 2, cy: (t + b) / 2, w: (r - l) * 1.32, h: (b - t) * 1.12 };   // room for the idle sway
    };

    const placed = [];
    [A, B, C, E, D].forEach((pr) => {
      if (Math.abs(pr.x) > 9) return; // waiting off-stage (phones)
      const m = measure(pr);
      const P = 8 / (8 - pr.z);
      const boxK = (cx, cy, k) => ({ l: cx - (m.w * k) / 2, r: cx + (m.w * k) / 2, t: cy - (m.h * k) / 2, b: cy + (m.h * k) / 2 });
      // keeps its original place and size when clear of all text, of the other packs and of the screen edges
      const clear = (bx) => !texts.some((t) => hit(bx, t)) && !placed.some((pb) => hit(gap(bx, 14), pb)) && inside(bx);
      if (clear(boxK(m.cx, m.cy, 1))) { placed.push(boxK(m.cx, m.cy, 1)); return; }
      // otherwise the nearest clear spot (move first; shrink at most 38% only if no full-size spot exists);
      // (if no spot is clear of text and of the other packs, the pack waits off-stage — see below)
      let best = null;
      for (const k of [1, 0.93, 0.86, 0.8, 0.74, 0.68, 0.62]) {
        const w = m.w * k, h = m.h * k;
        for (let cy = navB + h / 2; cy <= H - 8 - h / 2; cy += 8) {
          for (let cx = 6 + w / 2; cx <= W - 6 - w / 2; cx += 10) {
            const bx = boxK(cx, cy, k);
            const dx = cx - m.cx, dy = cy - m.cy;
            const textHit = texts.reduce((sum, t) => sum + area(bx, t), 0);
            const packHit = placed.reduce((sum, pb) => sum + area(gap(bx, 14), pb), 0);
            const cost = textHit * 1e6 + packHit * 1e3 + dx * dx + dy * dy + (1 - k) * (1 - k) * W * W * 0.6;
            if (!best || cost < best.cost) best = { cost, cx, cy, k, ok: textHit === 0 && packHit === 0 };
          }
        }
        if (best && best.ok && best.k === 1) break;   // a full-size clear spot exists: never shrink
      }
      // no spot clear of text AND of the other packs even at 62%: wait off-stage rather than overlap
      if (!best || !best.ok) { Object.assign(pr, { x: (m.cx < W / 2 ? -1 : 1) * 20, z: -9 }); return; }
      // move the pack by the screen offset (converted to world units at its depth) and apply the size
      pr.x += (best.cx - m.cx) / (u * P) / kx;
      const dyW = -(best.cy - m.cy) / (u * P);
      pr.y += mob ? dyW / 0.9 : dyW;
      pr.s *= best.k;
      placed.push(boxK(best.cx, best.cy, best.k));
    });
    stage.global.intro = intro0;
    stage.apply(0);
  };
  nudgeHero();

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
  // portrait tablets (600–899px wide) use the phone layout, but there the packs looked tiny: scale the group up
  if (m && window.innerWidth >= 600) Object.values(group).forEach((g) => { g[1] = (g[1] + 0.5) * 1.35 - 0.5; g[3] *= 1.35; });
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
    let gw = Infinity, gh = Infinity, columns = false;
    chapters.forEach((ch) => {
      const l = ch.querySelector('.chapter__left').getBoundingClientRect();
      const r = ch.querySelector('.chapter__right').getBoundingClientRect();
      // the CSS decides the layout: specs beside the text (columns) or below it (stacked)
      const side = r.left >= l.right - 1;
      columns = columns || side;
      if (!side) { gh = Math.min(gh, r.top - l.bottom + 24); gw = Math.min(gw, window.innerWidth - 24); }
      else { gw = Math.min(gw, r.left - l.right + 24); gh = Math.min(gh, window.innerHeight * 0.8); }
    });
    // landscape phones use the column layout with the small phone pack size — let the pack grow into the middle
    const cap = stage.mobile && columns ? 1.6 : 1;
    stage.global.chFit = Math.max(0.5, Math.min(cap, gw / packW, gh / packH));
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
    trigger: '#technology', start: 'top top', end: 'max',
    onToggle: (self) => { stage.active = !self.isActive; },
  });
}

function reducedMode(stage, P, chapters) {
  // Static, legible fallback: show chapters stacked as normal content, product in hero pose.
  stage.global.idle = 0;
  document.getElementById('showcase').classList.add('is-static');
  chapters.forEach((c) => c.classList.add('is-static'));
}
