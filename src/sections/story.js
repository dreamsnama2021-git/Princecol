// Brand story: polymer cross-linking motion graphic, counters, capability ledger.
import { gsap } from 'gsap';

const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

function buildPolymer(svg) {
  const chains = [60, 150, 240].map((cy, ci) => {
    const nodes = [];
    for (let x = 20, i = 0; x <= 500; x += 40, i++) nodes.push([x + (ci % 2) * 20, cy + (i % 2 ? 14 : -14)]);
    return nodes;
  });
  const gChains = svgEl('g', {});
  const gLinks = svgEl('g', {});
  const gNodes = svgEl('g', {});
  svg.append(gLinks, gChains, gNodes);

  chains.forEach((nodes, ci) => {
    const d = nodes.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
    const path = svgEl('path', { d, class: 'bond', 'data-chain': ci });
    gChains.appendChild(path);
  });
  const links = [];
  const pairs = [[0, 2], [0, 5], [0, 9], [1, 3], [1, 7], [1, 10]];
  pairs.forEach(([upper, i], k) => {
    const a = chains[upper][i];
    const b = chains[upper + 1][Math.min(i, chains[upper + 1].length - 1)];
    const l = svgEl('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'xlink' });
    gLinks.appendChild(l);
    links.push({ l, a: `${upper}-${i}`, b: `${upper + 1}-${Math.min(i, chains[upper + 1].length - 1)}`, k });
  });
  const nodeEls = {};
  chains.forEach((nodes, ci) => nodes.forEach(([x, y], i) => {
    const c = svgEl('circle', { cx: x, cy: y, r: 5, class: 'node' });
    nodeEls[`${ci}-${i}`] = c;
    gNodes.appendChild(c);
  }));
  return { gChains, links, nodeEls, chainPaths: [...gChains.children] };
}

export function initStory(stats, capabilities) {
  // stats
  const statsEl = document.getElementById('stats');
  statsEl.innerHTML = stats.map((s) => `<div class="stat"><div class="stat__n"><span data-count="${s.value}">0</span>${s.suffix ? `<sup>${s.suffix}</sup>` : ''}</div><p class="stat__l mono">${s.label}</p></div>`).join('');
  statsEl.querySelectorAll('[data-count]').forEach((el) => {
    const o = { v: 0 };
    gsap.to(o, { v: +el.dataset.count, duration: 2.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' }, onUpdate: () => { el.textContent = Math.round(o.v); } });
  });

  // ledger
  const ledger = document.getElementById('ledger');
  ledger.innerHTML = capabilities.map((c) => `<li><span class="mono">${c.n}</span><div><h3>${c.title}</h3><p>${c.body}</p></div></li>`).join('');
  ledger.querySelectorAll('li').forEach((li) => {
    gsap.from(li.querySelectorAll('h3, p, .mono'), { y: 40, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: li, start: 'top 82%' } });
  });

  // polymer motion graphic — scrubbed across the whole section
  const svg = document.getElementById('polymer');
  const { links, nodeEls, chainPaths } = buildPolymer(svg);
  chainPaths.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  links.forEach(({ l }) => { const L = Math.hypot(l.x2.baseVal.value - l.x1.baseVal.value, l.y2.baseVal.value - l.y1.baseVal.value); l.style.strokeDasharray = `${L}`; l.style.strokeDashoffset = L; });

  const tl = gsap.timeline({ scrollTrigger: { trigger: '#technology', start: 'top 70%', end: 'bottom bottom', scrub: 0.4 } });
  tl.to(chainPaths, { strokeDashoffset: 0, stagger: 0.15, duration: 1, ease: 'none' }, 0)
    .from(Object.values(nodeEls), { scale: 0, transformOrigin: 'center', stagger: { each: 0.01, from: 'random' }, duration: 0.3 }, 0.1);
  links.forEach(({ l, a, b }, i) => {
    tl.to(l, { strokeDashoffset: 0, duration: 0.3, ease: 'none' }, 1.1 + i * 0.25)
      .call(() => { nodeEls[a].classList.add('node--x'); nodeEls[b].classList.add('node--x'); }, null, 1.4 + i * 0.25)
      .call(() => { nodeEls[a].classList.remove('node--x'); nodeEls[b].classList.remove('node--x'); }, null, 1.39 + i * 0.25);
  });
  tl.to({}, { duration: 0.6 });
}
