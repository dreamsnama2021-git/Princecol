// Global UI: smooth scroll links, nav behaviour, menu, cursor, magnetic buttons, heading reveals.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitWords } from './split.js';

export function initLinks(lenis) {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id === '#top' ? 0 : document.querySelector(id);
    if (target === null) return;
    e.preventDefault();
    closeMenu();
    if (lenis) lenis.scrollTo(target, { duration: 1.6, force: true });
    else if (target === 0) window.scrollTo({ top: 0 });
    else target.scrollIntoView();
    if (target !== 0) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
  });
}

const menu = () => document.getElementById('menu');
const burger = () => document.querySelector('.nav__burger');
function closeMenu() {
  if (!menu()) return;
  menu().classList.remove('is-open'); menu().setAttribute('aria-hidden', 'true');
  burger().setAttribute('aria-expanded', 'false');
}

export function initNav() {
  const nav = document.getElementById('nav');
  burger().addEventListener('click', () => {
    const open = !menu().classList.contains('is-open');
    menu().classList.toggle('is-open', open);
    menu().setAttribute('aria-hidden', String(!open));
    burger().setAttribute('aria-expanded', String(open));
    if (open) gsap.fromTo('.menu .menu__row, .menu__theme', { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.9, delay: 0.2, ease: 'expo.out' });
  });
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle('is-solid', y > 60);
      nav.classList.toggle('is-hidden', self.direction === 1 && y > 400 && !menu().classList.contains('is-open'));
    },
  });
}

export function initCursor() {
  if (!window.matchMedia('(hover: hover) and (min-width: 900px)').matches) return;
  const c = document.querySelector('.cursor');
  const dot = c.querySelector('.cursor__dot');
  const ring = c.querySelector('.cursor__ring');
  const label = c.querySelector('.cursor__label');
  const dx = gsap.quickTo(dot, 'x', { duration: 0.1 }), dy = gsap.quickTo(dot, 'y', { duration: 0.1 });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' }), ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' });
  window.addEventListener('pointermove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('a, button, [data-cursor], label.chip');
    c.classList.toggle('is-hover', !!t);
    const text = t?.closest('[data-cursor]')?.dataset.cursor;
    c.classList.toggle('is-label', !!text);
    label.textContent = text || '';
  });
}

export function initMagnetic() {
  if (!window.matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.3); y((e.clientY - r.top - r.height / 2) * 0.4);
    });
    el.addEventListener('pointerleave', () => { x(0); y(0); });
  });
}

/** Display headings: words rise out of masks while the width axis expands (the "tension" release). */
export function initReveals() {
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    const words = splitWords(el);
    gsap.fromTo(words, { yPercent: 110, fontVariationSettings: "'wdth' 125" }, {
      yPercent: 0, fontVariationSettings: "'wdth' 72", stagger: 0.06, duration: 1.4, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });
  document.querySelectorAll('.section__aside, .story__lede, .contact__intro p:last-child, [data-fade]').forEach((el) =>
    gsap.from(el, { y: 30, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
  gsap.utils.toArray('.eyebrow:not(.showcase .eyebrow):not(.drawer .eyebrow):not(.mega .eyebrow):not([data-no-reveal])').forEach((el) =>
    gsap.from(el, { clipPath: 'inset(0 100% 0 0)', duration: 1.2, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 90%' } }));
}
