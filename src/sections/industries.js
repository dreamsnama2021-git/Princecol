// Industries: pinned horizontal track, each panel with its own generative visual.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { palette } from '../ui/theme.js';

const L = palette.motif;

export const motifs = {
  // concrete panels with sealant-filled expansion joints
  joints: (c) => {
    let s = '';
    const cols = [0, 260, 540, 760, 1000], rows = [0, 320, 610, 1000];
    for (let i = 0; i < cols.length - 1; i++) for (let j = 0; j < rows.length - 1; j++) {
      s += `<rect x="${cols[i] + 9}" y="${rows[j] + 9}" width="${cols[i + 1] - cols[i] - 18}" height="${rows[j + 1] - rows[j] - 18}" fill="${palette.motifFill}" stroke="${L}"/>`;
    }
    cols.slice(1, -1).forEach((x) => { s += `<line class="m-draw" x1="${x}" y1="0" x2="${x}" y2="1000" stroke="${c}" stroke-width="5" opacity=".55"/>`; });
    rows.slice(1, -1).forEach((y) => { s += `<line class="m-draw" x1="0" y1="${y}" x2="1000" y2="${y}" stroke="${c}" stroke-width="5" opacity=".55"/>`; });
    return s;
  },
  // wind-tunnel streamlines around a body
  flow: (c) => {
    let s = '';
    for (let i = 0; i < 26; i++) {
      const y = 80 + i * 34;
      const d = y - 520;
      const bend = Math.exp(-(d * d) / 40000) * (d >= 0 ? 120 : -120);
      s += `<path class="m-flow" d="M-50 ${y} C 300 ${y}, 380 ${y + bend}, 520 ${y + bend} S 760 ${y}, 1050 ${y}" fill="none" stroke="${i % 6 === 0 ? c : L}" stroke-width="${i % 6 === 0 ? 2 : 1.2}" style="animation-delay:${-i * 0.37}s"/>`;
    }
    s += `<ellipse cx="520" cy="520" rx="150" ry="70" fill="none" stroke="${L}"/>`;
    return s;
  },
  // end-grain / long grain via turbulence
  grain: (c) => `
    <defs><filter id="woodf" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.065" numOctaves="3" seed="7"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.24  0 0 0 0 0.14  0 0 0 2.2 -0.85"/>
    </filter></defs>
    <rect width="1000" height="1000" filter="url(#woodf)" opacity=".55"/>
    <rect x="0" y="492" width="1000" height="16" fill="${c}" opacity=".7" class="m-scale"/>`,
  // corrugated board flutes
  flute: (c) => {
    let s = '';
    for (let k = 0; k < 4; k++) {
      const y0 = 160 + k * 220;
      let wave = `M0 ${y0 + 40}`;
      for (let x = 0; x <= 1000; x += 60) wave += ` C ${x + 15} ${y0 - 30}, ${x + 45} ${y0 - 30}, ${x + 60} ${y0 + 40}`;
      s += `<line x1="0" y1="${y0 - 40}" x2="1000" y2="${y0 - 40}" stroke="${L}" stroke-width="3"/><line x1="0" y1="${y0 + 44}" x2="1000" y2="${y0 + 44}" stroke="${L}" stroke-width="3"/>`;
      s += `<path d="${wave}" fill="none" stroke="${k === 1 ? c : L}" stroke-width="${k === 1 ? 2.5 : 1.5}" class="${k === 1 ? 'm-draw' : ''}"/>`;
    }
    return s;
  },
  // dovetail joint
  dovetail: (c) => {
    let s = '';
    const tails = [[120, 260], [380, 520], [640, 780]];
    let d = 'M0 300';
    tails.forEach(([a, b]) => { d += ` L${a} 300 L${a - 40} 640 L${b + 40} 640 L${b} 300`; });
    d += ' L1000 300';
    s += `<path d="${d}" fill="none" stroke="${c}" stroke-width="3" class="m-draw"/>`;
    s += `<path d="${d.replace(/ 300/g, ' 305').replace(/640/g, '645')}" fill="none" stroke="${L}"/>`;
    for (let y = 680; y < 1000; y += 26) s += `<line x1="0" y1="${y}" x2="1000" y2="${y + 6}" stroke="${L}"/>`;
    for (let y = 20; y < 290; y += 26) s += `<line x1="0" y1="${y}" x2="1000" y2="${y - 4}" stroke="${L}"/>`;
    return s;
  },
  // footwear: sole outline with running stitches
  stitch: (c) => {
    let s = '';
    const sole = 'M180 620 C 180 470, 330 420, 470 430 C 640 440, 760 400, 840 470 C 900 525, 880 640, 780 660 C 600 700, 320 720, 230 690 C 195 678, 180 650, 180 620 Z';
    s += `<path d="${sole}" fill="none" stroke="${L}" stroke-width="2"/>`;
    s += `<path d="${sole}" transform="translate(500 560) scale(.9) translate(-500 -560)" fill="none" stroke="${c}" stroke-width="3" stroke-dasharray="14 12" class="m-stitch"/>`;
    for (let y = 120; y < 380; y += 34) s += `<path d="M120 ${y} Q 500 ${y - 40} 880 ${y}" fill="none" stroke="${L}" stroke-dasharray="10 10"/>`;
    return s;
  },
  // interior panelling: tall boards with grooves and fixings
  panels: (c) => {
    let s = '';
    for (let x = 40; x < 1000; x += 120) {
      s += `<rect x="${x}" y="60" width="104" height="880" fill="${palette.motifFill}" stroke="${L}"/>`;
      s += `<line x1="${x + 52}" y1="60" x2="${x + 52}" y2="940" stroke="${L}" stroke-dasharray="2 10"/>`;
    }
    s += `<line class="m-draw" x1="0" y1="500" x2="1000" y2="500" stroke="${c}" stroke-width="4" opacity=".6"/>`;
    return s;
  },
  // PVC pipe runs with joints
  pipes: (c) => {
    let s = '';
    [[0, 300, 1000, 300], [0, 640, 1000, 640], [300, 0, 300, 1000], [700, 0, 700, 1000]].forEach(([x1, y1, x2, y2], i) => {
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${L}" stroke-width="56" stroke-linecap="round" opacity=".6"/>`;
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${i === 0 ? c : L}" stroke-width="2" class="${i === 0 ? 'm-draw' : ''}"/>`;
    });
    [[300, 300], [700, 300], [300, 640], [700, 640]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="44" fill="none" stroke="${c}" stroke-width="3"/>`; });
    return s;
  },
  // hex lattice
  lattice: (c) => {
    let s = '';
    const r = 56, h = Math.sqrt(3) * r;
    for (let row = -1; row < 12; row++) for (let col = -1; col < 11; col++) {
      const cx = col * r * 1.5, cy = row * h + (col % 2 ? h / 2 : 0);
      const pts = [...Array(6)].map((_, i) => `${cx + r * Math.cos((Math.PI / 3) * i)},${cy + r * Math.sin((Math.PI / 3) * i)}`).join(' ');
      const hot = (row * 7 + col * 3) % 11 === 0;
      s += `<polygon points="${pts}" fill="${hot ? c : 'none'}" fill-opacity="${hot ? 0.12 : 0}" stroke="${hot ? c : L}" stroke-width="${hot ? 1.6 : 1}"/>`;
    }
    return s;
  },
};

export function initIndustries(industries, products, renders) {
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const track = document.getElementById('indTrack');
  industries.forEach((ind, i) => {
    const p = byId[ind.product];
    const el = document.createElement('article');
    el.className = `ind ind--${ind.motif}`;
    el.style.setProperty('--c', p.accent);
    el.innerHTML = `
      <div class="ind__art" aria-hidden="true"><svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">${motifs[ind.motif](p.accent)}</svg></div>
      <div class="ind__body">
        <span class="ind__n mono">${String(i + 1).padStart(2, '0')} / ${ind.motif}</span>
        <h3 class="ind__name">${ind.name}</h3>
        <p class="ind__line">${ind.line}</p>
        <div class="ind__pair mono"><span>Recommended</span><b>${p.code}</b><span>${p.name}</span></div>
      </div>
      <div class="ind__media">${renders[p.id] ? `<img src="${renders[p.id]}" alt="" loading="lazy" decoding="async" />` : ''}</div>`;
    track.appendChild(el);
  });

  // prepare draw-on lines
  track.querySelectorAll('.m-draw').forEach((p) => {
    const len = p.getTotalLength ? p.getTotalLength() : 1000;
    p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
  });

  const idx = document.getElementById('indIdx');
  const mm = gsap.matchMedia();
  // desktop: pinned horizontal scroll driven by the page scroll
  mm.add('(min-width: 1100px)', () => {
    const panels = gsap.utils.toArray('.ind');
    // clientWidth excludes the scrollbar, so the last panel lands fully in view
    // measure the last panel's real right edge (independent of current offset), minus the visible width without scrollbar
    const lastPanel = panels[panels.length - 1];
    // travel until the last panel's right edge sits a small gutter inside the window (gutter also covers the scrollbar)
    const dist = () => lastPanel.getBoundingClientRect().right - gsap.getProperty(track, 'x') - window.innerWidth + 32;
    // pin lasts longer than the horizontal travel: the last panel holds still to be read before the page moves on
    const hold = () => window.innerHeight * 0.7;
    ScrollTrigger.create({ trigger: '#industries', start: 'top top', end: () => `+=${dist() + hold()}`, pin: '.industries__pin', invalidateOnRefresh: true });
    const scroll = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '#industries', start: 'top top', end: () => `+=${dist()}`, scrub: 0.4, invalidateOnRefresh: true,
        onUpdate: (self) => { idx.textContent = String(Math.min(panels.length, Math.round(self.progress * (panels.length - 1)) + 1)).padStart(2, '0'); },
      },
    });
    panels.forEach((panel) => {
      const st = { trigger: panel, containerAnimation: scroll, start: 'left right', end: 'right left', scrub: true };
      gsap.fromTo(panel.querySelector('.ind__media img'), { xPercent: 12, rotate: 5 }, { xPercent: -12, rotate: -4, ease: 'none', scrollTrigger: st });
      gsap.fromTo(panel.querySelector('.ind__art svg'), { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { ...st } });
      gsap.to(panel.querySelectorAll('.m-draw'), { strokeDashoffset: 0, duration: 1.6, stagger: 0.12, ease: 'power2.inOut', scrollTrigger: { trigger: panel, containerAnimation: scroll, start: 'left 70%' } });
      gsap.from(panel.querySelectorAll('.ind__body > *'), { y: 40, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: panel, containerAnimation: scroll, start: 'left 65%' } });
    });
  });
  // tablets & phones: a swipeable carousel (native horizontal scroll with snap) + prev / next arrows
  mm.add('(max-width: 1099px)', () => {
    const panels = gsap.utils.toArray('.ind');
    gsap.utils.toArray('.ind').forEach((panel) => {
      gsap.to(panel.querySelectorAll('.m-draw'), { strokeDashoffset: 0, duration: 1.6, stagger: 0.12, ease: 'power2.inOut', scrollTrigger: { trigger: '#industries', start: 'top 60%' } });
    });
    const nav = document.createElement('div');
    nav.className = 'ind-nav';
    nav.innerHTML = `
      <button type="button" class="ind-nav__btn" data-dir="-1" aria-label="Previous application"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
      <button type="button" class="ind-nav__btn" data-dir="1" aria-label="Next application"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>`;
    const head = document.querySelector('.industries__head');
    head.appendChild(nav);
    const current = () => {
      const left = track.scrollLeft;
      let best = 0, bestD = Infinity;
      panels.forEach((pn, k) => { const d = Math.abs(pn.offsetLeft - track.offsetLeft - left); if (d < bestD) { bestD = d; best = k; } });
      return best;
    };
    const update = () => {
      const i = current();
      idx.textContent = String(i + 1).padStart(2, '0');
      const [prev, next] = nav.querySelectorAll('button');
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    const go = (dir) => {
      const i = Math.max(0, Math.min(panels.length - 1, current() + dir));
      track.scrollTo({ left: panels[i].offsetLeft - track.offsetLeft, behavior: 'smooth' });
    };
    const onClick = (e) => { const b = e.target.closest('button[data-dir]'); if (b) go(Number(b.dataset.dir)); };
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    nav.addEventListener('click', onClick);
    track.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => { nav.remove(); track.removeEventListener('scroll', onScroll); };
  });
}
