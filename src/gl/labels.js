// Procedural Prince-range packaging artwork, drawn to canvas and wrapped onto the 3D packs.
// Mirrors the real drum labels & pouches (navy serif wordmark, red maple leaf, red pill, ribbons).
import * as THREE from 'three';

export const NAVY = '#1D2F7A';
export const RED = '#E5322D';
export const DRUM_WHITE = '#F3F3EF';
const SERIF = 'Georgia, "Times New Roman", serif';
const SANS = 'Archivo, Arial, sans-serif';

// stylised maple leaf, 24×24 box
const LEAF = new Path2D('M12 1 L13.6 5.2 L15.8 4.2 L15 9 L18.4 6.6 L19.2 8.6 L22.5 8 L21 11.4 L23 12.4 L17.6 16.4 L18.4 18.4 L13 17.6 L12.6 23 L11.4 23 L11 17.6 L5.6 18.4 L6.4 16.4 L1 12.4 L3 11.4 L1.5 8 L4.8 8.6 L5.6 6.6 L9 9 L8.2 4.2 L10.4 5.2 Z');

function leaf(ctx, cx, cy, size) {
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(size / 24, size / 24);
  ctx.fillStyle = RED;
  ctx.fill(LEAF);
  ctx.restore();
}

function fitFont(ctx, text, maxW, size, weight, family) {
  ctx.font = `${weight} ${size}px ${family}`;
  const w = ctx.measureText(text).width;
  if (w > maxW) size = Math.floor((size * maxW) / w);
  ctx.font = `${weight} ${size}px ${family}`;
  return size;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

/** Brand lock-up: serif wordmark with leaf, red pill, ribbon, strap line. Centred on cx within width w. */
function lockup(ctx, p, cx, top, w, h, { onDark = false } = {}) {
  const word = p.label.top;
  const navy = onDark ? '#FFFFFF' : NAVY;
  // wordmark
  const ws = fitFont(ctx, word, w * 0.92, h * 0.3, "bold", SERIF);
  ctx.fillStyle = navy; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const wy = top + ws * 1.05;
  ctx.fillText(word, cx, wy);
  // leaf over the "I"
  const tw = ctx.measureText(word).width;
  const iIndex = word.indexOf('I');
  if (iIndex >= 0) {
    const before = ctx.measureText(word.slice(0, iIndex)).width;
    const iw = ctx.measureText('I').width;
    leaf(ctx, cx - tw / 2 + before + iw / 2, wy - ws * 0.92, ws * 0.42);
  }
  let y = wy + h * 0.04;
  // red pill
  if (p.label.pill) {
    const ps = fitFont(ctx, p.label.pill, w * 0.55, h * 0.2, "900", SANS);
    const pw = ctx.measureText(p.label.pill).width + ps * 0.9;
    const ph = ps * 1.05;
    ctx.fillStyle = RED;
    roundRect(ctx, cx - pw / 2, y, pw, ph, ph / 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(p.label.pill, cx, y + ph * 0.8);
    y += ph + h * 0.03;
  }
  // ribbon
  const rs = h * 0.065;
  ctx.font = `700 ${rs}px ${SANS}`;
  const rw = Math.min(w * 0.95, ctx.measureText('THE ADHESIVE EXPERTS').width + rs * 2);
  ctx.fillStyle = RED;
  ctx.fillRect(cx - rw / 2, y, rw, rs * 1.5);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('THE ADHESIVE EXPERTS', cx, y + rs * 1.15);
  y += rs * 1.5 + h * 0.035;
  ctx.fillStyle = navy;
  ctx.font = `800 ${rs * 0.95}px ${SANS}`;
  ctx.fillText('EXTRA', cx, y + rs); y += rs * 1.2;
  ctx.fillText('BONDING STRENGTH', cx, y + rs);
  return y + rs * 1.4;
}

function texture(canvas, renderer) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

const small = () => window.matchMedia('(max-width: 899px)').matches;

/** Wrap-around drum / pail label (front centred at u = 0.5). */
export function makeLabel(p, circumference, height, renderer) {
  const W = small() ? 1536 : 2560;
  const H = Math.round((W * height) / circumference);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  ctx.fillStyle = DRUM_WHITE; ctx.fillRect(0, 0, W, H);

  const fw = Math.min(W * 0.27, H * 1.45);
  const x0 = W / 2 - fw / 2;
  // label panel with navy keyline
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, x0, H * 0.04, fw, H * 0.92, H * 0.05); ctx.fill();
  ctx.lineWidth = H * 0.012; ctx.strokeStyle = NAVY; ctx.stroke();

  // top band
  ctx.save();
  roundRect(ctx, x0, H * 0.04, fw, H * 0.92, H * 0.05); ctx.clip();
  ctx.fillStyle = NAVY; ctx.fillRect(x0, H * 0.04, fw, H * 0.11);
  ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center';
  ctx.font = `italic 600 ${H * 0.06}px ${SANS}`;
  ctx.fillText('Synthetic Resin Adhesive', W / 2, H * 0.122);

  // bottom treatment
  if (p.label.swoosh) {
    ctx.fillStyle = RED;
    ctx.beginPath(); ctx.moveTo(x0, H * 0.8); ctx.quadraticCurveTo(W / 2, H * 0.98, x0 + fw, H * 0.72); ctx.lineTo(x0 + fw, H * 0.78); ctx.quadraticCurveTo(W / 2, H * 1.02, x0, H * 0.86); ctx.fill();
    ctx.fillStyle = NAVY; ctx.fillRect(x0, H * 0.9, fw, H * 0.1);
  } else {
    ctx.fillStyle = p.label.band || NAVY;
    ctx.fillRect(x0, H * 0.84, fw, H * 0.12);
    ctx.fillStyle = NAVY; ctx.font = `italic 600 ${H * 0.05}px ${SANS}`;
    ctx.fillText('Synthetic Resin Adhesive', W / 2, H * 0.915);
  }
  ctx.restore();

  lockup(ctx, p, W / 2, H * 0.17, fw * 0.8, H * 0.66);

  // back panel: directions
  ctx.fillStyle = NAVY; ctx.textAlign = 'left';
  ctx.font = `600 ${H * 0.04}px ${SANS}`;
  ['DIRECTIONS FOR USE', 'Apply evenly on clean, dry surfaces.', 'Press firmly and allow to set.', 'Keep container closed after use.', 'Principle Adhesives Pvt Ltd · Mumbai'].forEach((t, i) => ctx.fillText(t, W * 0.05, H * (0.3 + i * 0.09)));
  return texture(c, renderer);
}

/** Front artwork for the refill pouch. */
export function makePouch(p, renderer) {
  const W = small() ? 640 : 1024, H = Math.round(W * 1.32);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const s = p.pouch;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, s.bg[0]); g.addColorStop(1, s.bg[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // subtle cross pattern (as on the real pouches)
  ctx.fillStyle = 'rgba(29,47,122,0.06)';
  for (let y = 30; y < H; y += 60) for (let x = (y / 60) % 2 ? 30 : 60; x < W; x += 60) { ctx.fillRect(x - 6, y - 1.5, 12, 3); ctx.fillRect(x - 1.5, y - 6, 3, 12); }

  if (s.motif === 'wood') {
    for (let i = 0; i < 9; i++) {
      const y = H * 0.74 + i * H * 0.03;
      const wg = ctx.createLinearGradient(0, y, W, y + 40);
      wg.addColorStop(0, ['#8A5A36', '#B07A4F', '#6E4428'][i % 3]); wg.addColorStop(1, ['#C79A6B', '#7C4E2E', '#A8754C'][i % 3]);
      ctx.fillStyle = wg; ctx.fillRect(0, y, W, H * 0.03 + 2);
    }
  } else if (s.motif === 'triangles') {
    for (let i = 0; i < 70; i++) {
      const x = (i * 97) % W, y = H * 0.7 + ((i * 53) % (H * 0.3));
      const sz = 30 + (i % 5) * 18;
      ctx.fillStyle = ['#E5322D', '#F07A72', '#C4221E', '#F4B3AE'][i % 4];
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sz, y + sz * 0.6); ctx.lineTo(x, y + sz); ctx.fill();
    }
  } else if (s.motif === 'swoosh') {
    ctx.fillStyle = NAVY; ctx.fillRect(0, H * 0.82, W, H * 0.18);
    ctx.fillStyle = RED; ctx.beginPath(); ctx.moveTo(0, H * 0.78); ctx.quadraticCurveTo(W * 0.5, H * 0.92, W, H * 0.7); ctx.lineTo(W, H * 0.76); ctx.quadraticCurveTo(W * 0.5, H * 0.98, 0, H * 0.84); ctx.fill();
  } else if (s.motif === 'premium') {
    const rg = ctx.createRadialGradient(W / 2, H * 0.35, 10, W / 2, H * 0.35, W * 0.7);
    rg.addColorStop(0, 'rgba(255,255,255,0.6)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  }

  // band
  const by = s.bandTop ? H * 0.06 : H * 0.6;
  ctx.fillStyle = s.band; ctx.fillRect(s.bandTop ? W * 0.2 : 0, by, s.bandTop ? W * 0.6 : W, H * 0.07);
  ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center';
  ctx.font = `${s.bandTop ? 800 : 'italic 700'} ${H * 0.036}px ${SANS}`;
  ctx.fillText(s.bandText, W / 2, by + H * 0.048);

  // lock-up panel (badge on orange pouches)
  if (s.motif === 'badge') {
    ctx.fillStyle = '#FFE36A';
    ctx.beginPath(); ctx.ellipse(W / 2, H * 0.3, W * 0.4, H * 0.17, 0, 0, Math.PI * 2); ctx.fill();
  }
  const end = lockup(ctx, p, W / 2, H * (s.bandTop ? 0.15 : 0.12), W * 0.78, H * 0.46);
  if (s.note) {
    ctx.fillStyle = NAVY; ctx.font = `800 ${H * 0.028}px ${SANS}`;
    ctx.fillText(s.note, W / 2, end + H * 0.02);
  }
  return texture(c, renderer);
}
