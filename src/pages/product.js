// Product detail template — one script for every /products/<slug>/ page.
// The page HTML is rendered at build time from src/site/templates.js#productPage.
import { bootPage, heroIntro, reduced, fontsReady } from '../site/boot.js';
import { revealImages, drawIcons, staggers, tilt, paintMotifs, lightbox } from '../site/components.js';
import { productBySlug } from '../data/site.js';
import { Stage } from '../gl/stage.js';

const slug = document.body.dataset.product;
const p = productBySlug[slug];

async function hero3D(gsap, ScrollTrigger) {
  await fontsReady();
  const canvas = document.getElementById('pdgl');
  let stage;
  try { stage = new Stage(canvas, [p]); } catch (e) { document.documentElement.classList.add('no-gl'); return; }
  const pr = stage.items[p.id].proxy;
  const m = stage.mobile;
  Object.assign(pr, { x: m ? 0 : 1.75, y: m ? 1.15 : -0.05, z: 0, rx: 0.1, ry: -0.35, rz: 0, s: m ? 0.78 : 1 });
  stage.global.intro = 0; stage.global.idle = 1; stage.global.glow = 0.45;
  stage.setAccent(p.accent);
  stage.renderer.compile(stage.scene, stage.camera);
  stage.start();
  gsap.to(stage.global, { intro: 1, duration: 2.4, ease: 'expo.out', delay: 0.25 });

  if (!reduced) {
    // scroll: the pack turns, the lid lifts and the pouch slides out as you leave the hero
    gsap.timeline({ scrollTrigger: { trigger: '.pd-hero', start: 'top top', end: 'bottom top', scrub: 0.4 } })
      .to(pr, { ry: 1.1, y: pr.y + 0.9, s: pr.s * 0.9, explode: 0.8, ease: 'none' }, 0)
      .to(stage.global, { glow: 0.15, ease: 'none' }, 0);
  }
  ScrollTrigger.create({ trigger: '.pd-hero', start: 'top bottom', end: 'bottom top', onToggle: (s) => { stage.active = s.isActive; } });
}

bootPage(async ({ gsap, ScrollTrigger, lenis }) => {
  if (!p) return;
  heroIntro(document.querySelector('.pd-hero'), { delay: 0.4 });
  gsap.from('.pd-hero__text > *:not(h1)', { y: 26, opacity: 0, stagger: 0.07, duration: 1, ease: 'power3.out', delay: 0.7 });
  await hero3D(gsap, ScrollTrigger);

  revealImages();
  if (!reduced) gsap.fromTo('.pd-overview__pouch', { yPercent: 20, rotate: 6 }, { yPercent: -10, rotate: -3, ease: 'none', scrollTrigger: { trigger: '.pd-overview', start: 'top bottom', end: 'bottom top', scrub: 0.4 } });

  document.querySelector('.feat-grid')?.setAttribute('data-stagger', '');
  document.querySelector('.related')?.setAttribute('data-stagger', '');
  staggers();
  drawIcons();
  paintMotifs();
  document.querySelectorAll('.related__card').forEach((c) => tilt(c, { target: c.querySelector('.related__img img'), max: 8 }));
  gsap.from('.surfaces__list li', { y: 20, opacity: 0, stagger: 0.03, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: '.surfaces', start: 'top 85%' } });
  gsap.from('.spec-table tr', { x: -30, opacity: 0, stagger: 0.05, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: '.spec-table', start: 'top 85%' } });

  // gallery → full-screen viewer
  const tiles = [...document.querySelectorAll('.pd-gallery [data-full]')];
  const items = tiles.map((t) => ({ src: t.dataset.full, alt: t.querySelector('img').alt, cutout: t.classList.contains('gtile--cut') }));
  const open = lightbox(() => items, { lenis });
  tiles.forEach((t, i) => t.addEventListener('click', () => open(i)));
});
