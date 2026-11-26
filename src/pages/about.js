// About Us — banner hero, who we are (split), horizontal journey,
// vision & mission statements.
import { bootPage, heroIntro, reduced } from '../site/boot.js';
import { parallax, revealImages, counters, staggers, drawIcons } from '../site/components.js';
import { journey } from '../data/site.js';

bootPage(({ gsap }) => {
  heroIntro(document.querySelector('.ghero'));

  parallax(); revealImages(); counters(); staggers();

  /* ---- journey: horizontal pinned track on desktop, vertical list on phones ---- */
  const track = document.getElementById('journeyTrack');
  track.innerHTML = journey.map((j) => `
    <li class="jstep">
      <span class="jstep__n">${j.n}</span>
      <span class="jstep__dot" aria-hidden="true"></span>
      <h3 class="jstep__title">${j.title}</h3>
      <p>${j.body}</p>
    </li>`).join('');

  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    const dist = () => track.scrollWidth - track.parentElement.clientWidth + parseFloat(getComputedStyle(track).paddingLeft);
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.journey', start: 'top top', end: () => `+=${dist()}`, pin: '.journey__pin', scrub: 0.4, invalidateOnRefresh: true },
    });
    gsap.to('.journey__progress i', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.journey', start: 'top top', end: () => `+=${dist()}`, scrub: 0.4 } });
    track.querySelectorAll('.jstep').forEach((s) => {
      gsap.from(s.children, { y: 40, opacity: 0, stagger: 0.06, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: s, containerAnimation: tween, start: 'left 85%' } });
    });
  });
  mm.add('(max-width: 899px)', () => {
    track.querySelectorAll('.jstep').forEach((s) => gsap.from(s, { y: 40, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 85%' } }));
  });

  /* ---- why choose us: each card eases back as the next one slides over it ---- */
  const cards = gsap.utils.toArray('.wstack__card');
  if (!reduced) cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;
    gsap.fromTo(card, { scale: 1 }, {
      scale: 0.94, ease: 'none', immediateRender: false,
      scrollTrigger: { trigger: next, start: 'top 85%', end: () => `top ${parseFloat(getComputedStyle(next).top) + 20}px`, scrub: 0.3, invalidateOnRefresh: true },
    });
  });
  gsap.from('.wstack__side > *', { y: 30, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.wstack', start: 'top 75%' } });

  /* ---- vision & mission statements ---- */
  gsap.utils.toArray('.vmx__item').forEach((el) => {
    gsap.from(el.children, { y: 30, opacity: 0, stagger: 0.1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 82%' } });
  });

  drawIcons(document, 'svg.icon-draw');
});
