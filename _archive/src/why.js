// Why Choose Us — streaming typographic hero, staircase advantages with drawn icons,
// expanding approach panels, differentiation marquee + cards.
import { bootPage, heroIntro, reduced } from '../site/boot.js';
import { drawIcons, staggers } from '../site/components.js';
import { advantages } from '../data/site.js';
import { icon } from '../site/icons.js';

// approach panels (Section 3) — the four areas the brief asks for, in the company's own terms
const APPROACH = [
  { k: 'Product development', t: 'Driven by three decades of research, innovation and market orientation — across synthetic rubber, PU, PVA and PVC chemistries.' },
  { k: 'Manufacturing', t: 'Made at our technology-driven manufacturing unit at Shakti Industrial Estate, Vasai East.' },
  { k: 'Quality', t: 'Each product is built around the properties it promises: water and heat resistance, anti-termite protection, coverage and everlasting bonding.' },
  { k: 'Customer requirements', t: 'We partner with clients to understand newer bonding requirements and challenges, and respond with improved, customised products.' },
];

bootPage(({ gsap, isMobile }) => {
  heroIntro(document.querySelector('.phero'));
  if (!reduced) {
    document.querySelectorAll('.stream').forEach((s, i) => {
      const span = s.querySelector('span');
      s.appendChild(span.cloneNode(true));
      const rev = s.classList.contains('stream--rev');
      gsap.fromTo(s, { xPercent: rev ? -50 : 0 }, { xPercent: rev ? 0 : -50, duration: 40 + i * 8, ease: 'none', repeat: -1 });
    });
    // streams speed up with scroll velocity
    gsap.to('.why-hero__streams', { yPercent: -30, ease: 'none', scrollTrigger: { trigger: '.phero--why', start: 'top top', end: 'bottom top', scrub: 0.4 } });
  }

  document.getElementById('advList').innerHTML = advantages.map((a, i) => `
    <li class="adv__item">
      <span class="adv__n">${String(i + 1).padStart(2, '0')}</span>
      ${icon(a.icon, 'adv__icon')}
      <div><h3>${a.title}</h3><p>${a.body}</p></div>
    </li>`).join('');
  document.querySelectorAll('.adv__item').forEach((el, i) => {
    gsap.from(el, { x: i % 2 ? 80 : -80, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  drawIcons();

  // expanding panels: hover/focus on desktop, tap on touch
  const panels = document.getElementById('panels');
  panels.innerHTML = APPROACH.map((a, i) => `
    <button class="panel${i === 0 ? ' is-open' : ''}" aria-expanded="${i === 0}" type="button">
      <span class="panel__n">${String(i + 1).padStart(2, '0')}</span>
      <span class="panel__k">${a.k}</span>
      <span class="panel__t">${a.t}</span>
    </button>`).join('');
  const open = (b) => panels.querySelectorAll('.panel').forEach((p) => { const on = p === b; p.classList.toggle('is-open', on); p.setAttribute('aria-expanded', String(on)); });
  panels.addEventListener('click', (e) => { const b = e.target.closest('.panel'); if (b) open(b); });
  if (!isMobile()) panels.addEventListener('pointerover', (e) => { const b = e.target.closest('.panel'); if (b) open(b); });
  panels.addEventListener('focusin', (e) => { const b = e.target.closest('.panel'); if (b) open(b); });
  gsap.from(panels.children, { y: 60, opacity: 0, stagger: 0.1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: panels, start: 'top 85%' } });

  staggers();
});
