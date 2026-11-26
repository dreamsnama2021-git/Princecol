// Gallery — centred text hero, collage of every image,
// full-screen viewer with previous / next, keyboard and swipe.
import { bootPage, heroIntro } from '../site/boot.js';
import { lightbox } from '../site/components.js';
import { gallery, productById } from '../data/site.js';

bootPage(({ gsap, ScrollTrigger, lenis }) => {
  heroIntro(document.querySelector('.phero'));

  const grid = document.getElementById('galGrid');
  grid.innerHTML = gallery.map((g, i) => `
    <li class="gitem${g.cutout ? ' gitem--cut' : ''}${g.wide ? ' gitem--wide' : ''}" data-cat="${g.cat}" data-prod="${g.product || 'all'}" ${g.product ? `style="--c:${productById[g.product].accent}"` : ''}>
      <button type="button" data-i="${i}" aria-label="Open image: ${g.alt}">
        <img src="${g.src}" alt="${g.alt}" loading="lazy" decoding="async" onload="this.closest('.gitem').classList.add('is-loaded')" onerror="this.closest('.gitem').classList.add('is-error')" />
        <span class="gitem__cap mono">${g.alt}</span>
      </button>
    </li>`).join('');

  const visible = () => gallery.map((g, i) => ({ ...g, i }));

  /* full-screen viewer walks through every image */
  const open = lightbox(() => visible(), { lenis });
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (!b) return;
    const list = visible();
    open(Math.max(0, list.findIndex((g) => g.i === +b.dataset.i)));
  });

  gsap.from(grid.children, { y: 60, opacity: 0, stagger: 0.05, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: grid, start: 'top 85%' } });
});
