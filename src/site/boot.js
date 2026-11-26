// Shared runtime for every page: smooth scroll, nav + mega menu, cursor, magnetic
// buttons, heading reveals, theme links, page transitions, CTA bands, forms.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initLinks, initNav, initCursor, initMagnetic, initReveals } from '../ui/interactions.js';
import { initThemeLinks } from '../ui/theme.js';
import { splitChars } from '../ui/split.js';
import { initFinale } from '../sections/finale.js';
import { initForms } from './form.js';

gsap.registerPlugin(ScrollTrigger);
export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isMobile = () => window.matchMedia('(max-width: 899px)').matches;
/** Wait (max 2 s) for the display fonts — the 3D labels are drawn with them. */
export const fontsReady = () => Promise.race([
  Promise.all(['900 100px Archivo', '800 100px Archivo', '500 20px "JetBrains Mono"'].map((f) => document.fonts.load(f))).catch(() => {}),
  new Promise((r) => setTimeout(r, 2000)),
]);

/* ---------- page transitions: a leaf curtain closes before leaving, opens on arrival ---------- */
export function initTransitions({ enter = true } = {}) {
  const curtain = document.querySelector('.curtain');
  if (!curtain) return;
  if (enter) {
    gsap.set(curtain, { clipPath: 'inset(0 0 0% 0)' });
    gsap.to(curtain, { clipPath: 'inset(0 0 100% 0)', duration: reduced ? 0 : 0.9, ease: 'expo.inOut', delay: 0.05 });
  }
  window.addEventListener('pageshow', (e) => { if (e.persisted) gsap.set(curtain, { clipPath: 'inset(0 0 100% 0)' }); });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || /^(mailto|tel):/.test(a.href)) return;
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return; // same-page anchor
    e.preventDefault();
    gsap.timeline()
      .set(curtain, { clipPath: 'inset(100% 0 0 0)' })
      .to(curtain, { clipPath: 'inset(0% 0 0 0)', duration: reduced ? 0 : 0.6, ease: 'expo.in' })
      .call(() => { location.href = url.href; });
  });
}

/* ---------- mega menu: hover/focus on desktop, Escape closes ---------- */
export function initMega() {
  const item = document.querySelector('.nav__item--mega');
  if (!item) return;
  let t;
  const set = (v) => { clearTimeout(t); item.classList.toggle('is-open', v); };
  item.addEventListener('pointerenter', () => set(true));
  item.addEventListener('pointerleave', () => { t = setTimeout(() => set(false), 160); });
  item.addEventListener('focusin', () => set(true));
  item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
}

/* ---------- CTA bands with the adhesive-strand canvas ---------- */
function initCtaBands() {
  document.querySelectorAll('.cta-band').forEach((band) => {
    initFinale(band, band.querySelector('.cta-band__strands'));
    const title = band.querySelector('[data-split]');
    if (title) {
      splitChars(title, { masked: true });
      gsap.fromTo(title.querySelectorAll('.char'), { yPercent: 110 }, { yPercent: 0, stagger: 0.02, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: band, start: 'top 60%' } });
    }
  });
}

/**
 * Boot a page. `setup(ctx)` builds the page's own sections and may return a promise
 * (e.g. while a WebGL stage compiles); the intro animation runs after it resolves.
 */
export async function bootPage(setup, { intro } = {}) {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);

  let lenis = null;
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, touchMultiplier: 1.2 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const ctx = { lenis, gsap, ScrollTrigger, reduced, isMobile };

  document.querySelectorAll('[data-year]').forEach((y) => { y.textContent = new Date().getFullYear(); });
  initThemeLinks();
  initLinks(lenis);
  initNav();
  initMega();
  initCursor();
  initMagnetic();
  initTransitions();
  initForms();

  try { await setup?.(ctx); } catch (err) { console.error('[page] section setup failed', err); }

  initReveals();
  initCtaBands();
  if (import.meta.env.DEV) Object.assign(window, { __ST: ScrollTrigger, __lenis: lenis });

  await document.fonts?.ready;
  ScrollTrigger.refresh();
  if (location.hash) { const el = document.querySelector(location.hash); if (el) lenis ? lenis.scrollTo(el, { immediate: true }) : el.scrollIntoView(); }
  gsap.from('.nav > *', { y: -30, opacity: 0, stagger: 0.05, duration: 0.9, ease: 'expo.out', delay: 0.35, clearProps: 'transform,opacity' });
  intro?.(ctx);
  return ctx;
}

/** Standard inner-page hero entrance: masked letters rise as the width axis releases. */
export function heroIntro(hero, { delay = 0.45 } = {}) {
  if (!hero) return;
  const title = hero.querySelector('[data-split]');
  if (title) splitChars(title, { masked: true });
  const tl = gsap.timeline({ delay });
  if (title) tl.fromTo(title.querySelectorAll('.char'), { yPercent: 120, fontVariationSettings: "'wdth' 125" }, { yPercent: 0, fontVariationSettings: "'wdth' 62", stagger: 0.018, duration: 1.3, ease: 'expo.out' });
  tl.from(hero.querySelectorAll('[data-hero-in]'), { y: 30, opacity: 0, stagger: 0.08, duration: 1, ease: 'power3.out' }, '-=0.9');
  // headline drifts up & fades as the page scrolls on
  if (!reduced && title) gsap.to(title, { yPercent: -18, opacity: 0.15, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.4 } });
  return tl;
}
