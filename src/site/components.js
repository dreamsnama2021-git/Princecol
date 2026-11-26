// Reusable inner-page behaviours. Each takes a scope (default: document).
import { gsap } from 'gsap';
import { reduced } from './boot.js';
import { motifs } from '../sections/industries.js';

const $$ = (sel, scope = document) => [...scope.querySelectorAll(sel)];
const hover = () => window.matchMedia('(hover: hover)').matches;

/** Elements with data-parallax="0.15" drift by that fraction while crossing the viewport. */
export function parallax(scope) {
  if (reduced) return;
  $$('[data-parallax]', scope).forEach((el) => {
    const k = parseFloat(el.dataset.parallax) || 0.15;
    gsap.fromTo(el, { yPercent: -k * 100 }, { yPercent: k * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.3 } });
  });
}

/** Images/figures with data-reveal-img open from a clipped mask and settle from a zoom. */
export function revealImages(scope) {
  $$('[data-reveal-img]', scope).forEach((el) => {
    gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%' } })
      .fromTo(el, { clipPath: 'inset(18% 12% 18% 12%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' })
      .fromTo(el.querySelectorAll('img'), { scale: 1.25 }, { scale: 1, duration: 1.6, ease: 'expo.out' }, 0);
  });
}

/** Line icons draw themselves when they enter. */
export function drawIcons(scope, sel = 'svg.feat-tile__icon, svg.adv__icon, svg.icon-draw') {
  $$(sel, scope).forEach((svg) => {
    const shapes = svg.querySelectorAll('*');
    shapes.forEach((s) => { const L = s.getTotalLength?.() || 200; s.style.strokeDasharray = L; s.style.strokeDashoffset = L; });
    gsap.to(shapes, { strokeDashoffset: 0, duration: 1.4, stagger: 0.1, ease: 'power2.inOut', scrollTrigger: { trigger: svg, start: 'top 88%' } });
  });
}

/** Count up numbers: <span data-count="30">0</span> */
export function counters(scope) {
  $$('[data-count]', scope).forEach((el) => {
    const o = { v: 0 };
    gsap.to(o, { v: +el.dataset.count, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' }, onUpdate: () => { el.textContent = Math.round(o.v); } });
  });
}

/** Staggered rise for groups: data-stagger on a parent, children rise in. */
export function staggers(scope) {
  $$('[data-stagger]', scope).forEach((el) => {
    gsap.from(el.children, { y: 50, opacity: 0, stagger: 0.08, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
}

/** Subtle 3D tilt toward the pointer (desktop pointers only). */
export function tilt(el, { target = el, max = 10 } = {}) {
  if (!hover() || reduced) return;
  target.style.transformStyle = 'preserve-3d';
  const rx = gsap.quickTo(target, 'rotationX', { duration: 0.8, ease: 'power3.out' });
  const ry = gsap.quickTo(target, 'rotationY', { duration: 0.8, ease: 'power3.out' });
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    ry(((e.clientX - r.left) / r.width - 0.5) * max * 2);
    rx(-((e.clientY - r.top) / r.height - 0.5) * max * 1.4);
  });
  el.addEventListener('pointerleave', () => { rx(0); ry(0); });
}

/** Generative industry art (shared with the homepage industries section). */
export function motifSVG(name, color) {
  const fn = motifs[name] || motifs.lattice;
  return `<svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${fn(color)}</svg>`;
}
export function paintMotifs(scope) {
  $$('[data-motif]', scope).forEach((el) => {
    const host = el.querySelector('.app-tile__art, [data-motif-host]') || el;
    const c = getComputedStyle(el).getPropertyValue('--c').trim() || '#E5322D';
    host.insertAdjacentHTML('afterbegin', motifSVG(el.dataset.motif, c));
    host.querySelectorAll('.m-draw').forEach((p) => { const L = p.getTotalLength?.() || 1000; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    gsap.to(host.querySelectorAll('.m-draw'), { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', scrollTrigger: { trigger: el, start: 'top 80%' } });
  });
}

/* ---------------- full-screen image viewer ---------------- */
let viewer;
function buildViewer() {
  viewer = document.createElement('div');
  viewer.className = 'viewer';
  viewer.setAttribute('role', 'dialog');
  viewer.setAttribute('aria-modal', 'true');
  viewer.setAttribute('aria-label', 'Image viewer');
  viewer.innerHTML = `
    <button class="viewer__close" aria-label="Close viewer">×</button>
    <button class="viewer__nav viewer__nav--prev" aria-label="Previous image">←</button>
    <figure class="viewer__fig"><span class="viewer__spin" aria-hidden="true"></span><img alt="" /><figcaption class="mono"></figcaption></figure>
    <button class="viewer__nav viewer__nav--next" aria-label="Next image">→</button>
    <p class="viewer__count mono"></p>`;
  document.body.appendChild(viewer);
  return viewer;
}

/**
 * Lightbox for any set of items: [{ src, alt }]. Keyboard (←/→/Esc), swipe, preloading,
 * loading + error states. Returns open(index).
 */
export function lightbox(getItems, { lenis } = {}) {
  const v = viewer || buildViewer();
  const img = v.querySelector('img');
  const cap = v.querySelector('figcaption');
  const count = v.querySelector('.viewer__count');
  let i = 0, items = [], last = null;

  const show = (n, dir = 1) => {
    items = getItems();
    i = (n + items.length) % items.length;
    const it = items[i];
    v.classList.add('is-loading'); v.classList.remove('is-error');
    const pre = new Image();
    pre.onload = () => {
      img.src = it.src; img.alt = it.alt || '';
      v.classList.toggle('is-cutout', !!it.cutout);
      v.classList.remove('is-loading');
      gsap.fromTo(img, { opacity: 0, x: 60 * dir, scale: 0.96 }, { opacity: 1, x: 0, scale: 1, duration: 0.7, ease: 'expo.out' });
    };
    pre.onerror = () => { v.classList.remove('is-loading'); v.classList.add('is-error'); cap.textContent = 'This image could not be loaded.'; };
    pre.src = it.src;
    cap.textContent = it.alt || '';
    count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    // warm the neighbours
    [i + 1, i - 1].forEach((k) => { const x = items[(k + items.length) % items.length]; if (x) new Image().src = x.src; });
  };
  const close = () => {
    gsap.to(v, { opacity: 0, duration: 0.35, onComplete: () => { v.classList.remove('is-open'); v.style.opacity = ''; } });
    lenis?.start();
    document.removeEventListener('keydown', onKey);
    last?.focus?.();
  };
  const onKey = (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(i + 1, 1);
    if (e.key === 'ArrowLeft') show(i - 1, -1);
  };
  if (!v.dataset.wired) {
    v.dataset.wired = '1';
    let sx = 0;
    v.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    v.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) v.dispatchEvent(new CustomEvent('swipe', { detail: dx })); });
  }
  v.onclick = (e) => {
    if (e.target.closest('.viewer__close') || e.target === v) close();
    if (e.target.closest('.viewer__nav--next')) show(i + 1, 1);
    if (e.target.closest('.viewer__nav--prev')) show(i - 1, -1);
  };
  v.addEventListener('swipe', (e) => show(i + (e.detail < 0 ? 1 : -1), e.detail < 0 ? 1 : -1));

  return (n) => {
    last = document.activeElement;
    v.classList.add('is-open');
    gsap.fromTo(v, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    lenis?.stop();
    document.addEventListener('keydown', onKey);
    show(n, 1);
    v.querySelector('.viewer__close').focus();
  };
}
