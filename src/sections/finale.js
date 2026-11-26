// Final CTA: viscous adhesive strands between two plates, stretched by scroll,
// pulled by the cursor, snapping and retracting when over-extended.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { palette } from '../ui/theme.js';

// Reusable: homepage finale by default, or any section + canvas pair (inner-page CTA bands).
export function initFinale(section = document.getElementById('finale'), canvas = document.getElementById('strands')) {
  if (!section || !canvas) return;
  const ctx = canvas.getContext('2d');
  const mobile = window.matchMedia('(max-width: 899px)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, dpr = 1;
  let strands = [];
  const state = { stretch: 0.15, mx: -9999, my: -9999, visible: false };

  function build() {
    dpr = Math.min(window.devicePixelRatio, 1.5);
    W = section.clientWidth; H = section.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = mobile ? 10 : 22;
    strands = [...Array(n)].map((_, i) => {
      const cx = ((i + 0.5) / n) * W + (Math.random() - 0.5) * (W / n) * 0.6;
      return {
        cx, w: 5 + Math.random() * 17, neckY: 0.42 + Math.random() * 0.2,
        breakAt: 0.55 + Math.random() * 0.4, broken: 0, sway: Math.random() * 6.28, dx: 0,
      };
    });
  }

  function strandPath(s, t) {
    const st = state.stretch;
    const neckW = Math.max(1.2, s.w * Math.pow(1 - Math.min(st, 0.98), 2.2));
    const ny = H * s.neckY;
    // cursor pull
    const dMouse = Math.abs(state.my - ny) < H * 0.6 ? Math.exp(-((state.mx - s.cx) ** 2) / 26000) : 0;
    const target = dMouse * (state.mx - s.cx) * 0.45 + Math.sin(t * 0.6 + s.sway) * 8;
    s.dx += (target - s.dx) * 0.08;
    const nx = s.cx + s.dx;
    const w = s.w;
    const p = new Path2D();
    p.moveTo(s.cx - w, 0);
    p.bezierCurveTo(s.cx - w * 0.45, H * 0.12, nx - neckW / 2, ny - H * 0.22, nx - neckW / 2, ny);
    p.bezierCurveTo(nx - neckW / 2, ny + H * 0.22, s.cx - w * 0.45, H * 0.88, s.cx - w, H);
    p.lineTo(s.cx + w, H);
    p.bezierCurveTo(s.cx + w * 0.45, H * 0.88, nx + neckW / 2, ny + H * 0.22, nx + neckW / 2, ny);
    p.bezierCurveTo(nx + neckW / 2, ny - H * 0.22, s.cx + w * 0.45, H * 0.12, s.cx + w, 0);
    p.closePath();
    return p;
  }

  function dripPath(s, top) {
    // retracted half-strands after a snap; length eases toward a short drip
    const len = H * (0.12 + (1 - s.broken) * 0.3);
    const w = s.w;
    const p = new Path2D();
    if (top) {
      p.moveTo(s.cx - w, 0);
      p.bezierCurveTo(s.cx - w * 0.3, len * 0.4, s.cx - 6, len * 0.8, s.cx, len);
      p.bezierCurveTo(s.cx + 6, len * 0.8, s.cx + w * 0.3, len * 0.4, s.cx + w, 0);
    } else {
      p.moveTo(s.cx - w, H);
      p.bezierCurveTo(s.cx - w * 0.3, H - len * 0.4, s.cx - 6, H - len * 0.8, s.cx, H - len);
      p.bezierCurveTo(s.cx + 6, H - len * 0.8, s.cx + w * 0.3, H - len * 0.4, s.cx + w, H);
    }
    p.closePath();
    return p;
  }

  let grad, vignette;
  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    if (!grad) {
      grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, 'rgba(229,50,45,0.9)');
      grad.addColorStop(0.35, 'rgba(229,50,45,0.35)');
      grad.addColorStop(0.5, 'rgba(229,50,45,0.18)');
      grad.addColorStop(0.65, 'rgba(229,50,45,0.35)');
      grad.addColorStop(1, 'rgba(229,50,45,0.9)');
    }
    ctx.fillStyle = grad;
    for (const s of strands) {
      const shouldBreak = state.stretch > s.breakAt;
      s.broken += ((shouldBreak ? 1 : 0) - s.broken) * (shouldBreak ? 0.12 : 0.05);
      if (s.broken > 0.5) { ctx.fill(dripPath(s, true)); ctx.fill(dripPath(s, false)); }
      else ctx.fill(strandPath(s, t));
    }
    // plates
    ctx.fillStyle = `rgba(${palette.fgRgb},0.9)`;
    ctx.fillRect(0, 0, W, 3); ctx.fillRect(0, H - 3, W, 3);
    // centre vignette keeps type legible
    if (!vignette) {
      vignette = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.5);
      vignette.addColorStop(0, `rgba(${palette.baseRgb},0.84)`); vignette.addColorStop(1, `rgba(${palette.baseRgb},0)`);
    }
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, W, H);
  }

  build();
  window.addEventListener('resize', () => { grad = null; vignette = null; build(); });
  section.addEventListener('pointermove', (e) => { const r = section.getBoundingClientRect(); state.mx = e.clientX - r.left; state.my = e.clientY - r.top; });
  section.addEventListener('pointerleave', () => { state.mx = -9999; });

  ScrollTrigger.create({
    trigger: section, start: 'top bottom', end: 'bottom top',
    onToggle: (self) => { state.visible = self.isActive; },
    onUpdate: (self) => { state.stretch = reduced ? 0.3 : gsap.utils.clamp(0.1, 1, gsap.utils.mapRange(0.15, 0.85, 0.1, 1, self.progress)); },
  });

  gsap.ticker.add((time) => { if (state.visible) frame(time); });
  frame(0);
}
