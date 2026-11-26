import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { brand, products, industries, stats, capabilities, features } from './data/content.js';
import { Stage } from './gl/stage.js';
import { initShowcase } from './sections/showcase.js';
import { initRange } from './sections/range.js';
import { initStory } from './sections/story.js';
import { initIndustries } from './sections/industries.js';
import { initWhy } from './sections/why.js';
import { initFinale } from './sections/finale.js';
import { initContact } from './sections/contact.js';
import { initLinks, initNav, initCursor, initMagnetic, initReveals } from './ui/interactions.js';
import { splitChars } from './ui/split.js';
import { initThemeLinks } from './ui/theme.js';
import './data/site.js'; // adds product page URLs etc. to the shared product data
import { initTransitions, initMega } from './site/boot.js';

gsap.registerPlugin(ScrollTrigger);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// yield to the browser so the loader can paint (setTimeout, not rAF: rAF stalls in background tabs)
const frame = () => new Promise((r) => setTimeout(r, 16));

/* ---------- loader ---------- */
const pctEl = document.getElementById('loaderPct');
const strand = document.getElementById('loaderStrand');
const load = { v: 0 };
const progress = (to) => gsap.to(load, { v: to, duration: 0.6, ease: 'power2.out', onUpdate: () => {
  pctEl.textContent = Math.round(load.v);
  const neck = 300 + (load.v / 100) * 0; const pinch = 40 * (1 - load.v / 100);
  strand.setAttribute('d', `M300 6 C ${neck - pinch} 40, ${neck - pinch} 80, 300 114`);
  strand.style.strokeWidth = 3 + (1 - load.v / 100) * 10;
} });

async function boot() {
  progress(12);
  try {
    await Promise.race([
      Promise.all(['900 100px Archivo', '800 100px Archivo', '500 20px "JetBrains Mono"'].map((f) => document.fonts.load(f))),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
  } catch { /* fonts are progressive */ }
  progress(35); await frame();

  // 3D stage
  let stage = null;
  // real product photography from princecol.com (transparent cut-outs)
  const renders = Object.fromEntries(products.map((p) => [p.id, p.image]));
  try {
    stage = new Stage(document.getElementById('gl'), products);
    stage.global.intro = 0;
    progress(65); await frame();
    stage.renderer.compile(stage.scene, stage.camera); // warm shaders so the first scroll never stutters
    progress(88);
  } catch (err) {
    console.warn('WebGL unavailable — falling back to static layout', err);
    document.documentElement.classList.add('no-gl');
  }

  // smooth scroll
  let lenis = null;
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, touchMultiplier: 1.2, syncTouch: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  // sections
  document.querySelectorAll('.hero [data-split]').forEach((el) => splitChars(el, { masked: true }));
  splitChars(document.querySelector('.finale__title'), { masked: true });
  if (stage) initShowcase(stage, products);
  initRange(products, renders, lenis);
  initStory(stats, capabilities);
  initIndustries(industries, products, renders);
  initWhy(features);
  initFinale();
  initContact(brand, products, industries);
  initThemeLinks();
  initLinks(lenis);
  initNav();
  initMega();
  initTransitions({ enter: false }); // homepage has its own loader; curtain only plays when leaving
  initCursor();
  initMagnetic();
  initReveals();

  // finale headline
  gsap.fromTo('.finale__title .char', { yPercent: 110 }, { yPercent: 0, stagger: 0.025, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.finale', start: 'top 55%' } });

  progress(100);
  await new Promise((r) => setTimeout(r, 650));
  if (stage) stage.start();
  if (import.meta.env.DEV) Object.assign(window, { __stage: stage, __ST: ScrollTrigger });
  ScrollTrigger.refresh();
  intro(stage, lenis);
}

function intro(stage, lenis) {
  const tl = gsap.timeline({ onComplete: () => { document.body.classList.remove('is-loading'); lenis?.start(); } });
  tl.to('#loaderStrand', { attr: { d: 'M300 6 C 300 30, 300 40, 300 52 M300 114 C 300 100, 300 90, 300 70' }, duration: 0.35, ease: 'power2.in' })
    .to('.loader__inner', { opacity: 0, y: -20, duration: 0.4 }, '+=0.05')
    .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=0.1')
    .set('.loader', { display: 'none' });
  if (stage) tl.to(stage.global, { intro: 1, duration: 2.2, ease: 'expo.out' }, '-=0.8');
  tl.fromTo('.hero__line .char', { yPercent: 120, fontVariationSettings: "'wdth' 125" }, { yPercent: 0, fontVariationSettings: "'wdth' 62", stagger: 0.022, duration: 1.4, ease: 'expo.out' }, '-=1.9')
    .from('.hero__foot > *, .hero__meta, .hero__scroll', { y: 30, opacity: 0, stagger: 0.1, duration: 1, ease: 'power3.out' }, '-=1.0')
    .from('.nav > *', { y: -40, opacity: 0, stagger: 0.06, duration: 1, ease: 'expo.out', clearProps: 'transform,opacity' }, '-=1.1');
  // Let users scroll as soon as the curtain is up, not when every flourish ends
  tl.call(() => { document.body.classList.remove('is-loading'); lenis?.start(); }, null, 1.4);
}

boot();
