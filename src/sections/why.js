// Why Prince — hairline ledger with self-drawing icons.
import { gsap } from 'gsap';

const ICONS = {
  drop: '<path d="M32 6C24 18 14 28 14 40a18 18 0 0 0 36 0C50 28 40 18 32 6z"/><path d="M24 42a8 8 0 0 0 8 8"/>',
  flame: '<path d="M32 58c-11 0-18-8-18-18 0-12 10-16 10-28 6 4 10 10 10 16 3-2 5-6 5-10 7 6 11 14 11 22 0 10-7 18-18 18z"/><path d="M32 58c-5 0-8-4-8-8 0-6 8-10 8-16 4 4 8 9 8 16 0 4-3 8-8 8z"/>',
  clock: '<circle cx="32" cy="34" r="22"/><path d="M32 20v14l9 6M26 6h12M32 6v6"/>',
  layers: '<path d="M32 8L6 22l26 14 26-14z"/><path d="M6 32l26 14 26-14"/><path d="M6 42l26 14 26-14"/>',
  flask: '<path d="M24 6h16M28 6v16L12 52a4 4 0 0 0 3.5 6h33a4 4 0 0 0 3.5-6L36 22V6"/><path d="M18 42h28"/><circle cx="28" cy="48" r="2"/><circle cx="37" cy="45" r="1.5"/>',
  bond: '<rect x="6" y="10" width="52" height="14"/><rect x="6" y="40" width="52" height="14"/><path d="M16 24v16M26 24c0 6 4 10 0 16M38 24c0 6-4 10 0 16M48 24v16"/>',
  shield: '<path d="M32 6l22 8v16c0 14-10 24-22 28C20 54 10 44 10 30V14z"/><path d="M22 32l7 7 13-14"/>',
  gauge: '<path d="M8 44a24 24 0 1 1 48 0"/><path d="M32 44l12-16"/><circle cx="32" cy="44" r="3"/><path d="M14 44h4M46 44h4M32 20v4"/>',
  spark: '<path d="M32 6v14M32 44v14M6 32h14M44 32h14M14 14l9 9M41 41l9 9M50 14l-9 9M23 41l-9 9"/><circle cx="32" cy="32" r="6"/>',
  globe: '<circle cx="32" cy="32" r="24"/><path d="M8 32h48M32 8c8 8 8 40 0 48M32 8c-8 8-8 40 0 48"/>',
};

export function initWhy(features) {
  const grid = document.getElementById('whyGrid');
  grid.innerHTML = features.map((f, i) => `
    <li class="feat">
      <span class="feat__n mono">${String(i + 1).padStart(2, '0')}</span>
      <svg class="feat__icon" viewBox="0 0 64 64" aria-hidden="true">${ICONS[f.icon]}</svg>
      <h3 class="feat__title">${f.title}</h3>
      <p class="feat__stat mono">${f.stat}</p>
    </li>`).join('');

  grid.querySelectorAll('.feat').forEach((li, i) => {
    const shapes = li.querySelectorAll('.feat__icon *');
    shapes.forEach((s) => { const L = s.getTotalLength(); s.style.strokeDasharray = L; s.style.strokeDashoffset = L; });
    const tl = gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 85%' }, delay: (i % 3) * 0.12 });
    tl.from(li, { clipPath: 'inset(100% 0 0 0)', duration: 1.1, ease: 'expo.inOut' })
      .to(shapes, { strokeDashoffset: 0, duration: 1.4, stagger: 0.12, ease: 'power2.inOut' }, 0.4)
      .from(li.querySelectorAll('.feat__title, .feat__stat'), { y: 30, opacity: 0, stagger: 0.08, duration: 0.9, ease: 'expo.out' }, 0.5);

    li.addEventListener('pointerenter', () => gsap.fromTo(shapes, { strokeDashoffset: (k, el) => el.getTotalLength() }, { strokeDashoffset: 0, duration: 0.9, stagger: 0.06, ease: 'power2.out', overwrite: true }));
  });
}
