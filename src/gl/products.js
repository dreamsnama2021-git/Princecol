// Procedural Prince-range packaging: HDPE drum (blue lid, side handles) or bucket, plus refill pouch.
// Each builder returns { model, parts, anchors }.
import * as THREE from 'three';
import { makeLabel, makePouch, DRUM_WHITE } from './labels.js';

const SEG = 96;
const LID_BLUE = '#1F63D6';

const mats = {
  hdpe: () => new THREE.MeshPhysicalMaterial({ color: DRUM_WHITE, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.4 }),
  lid: () => new THREE.MeshPhysicalMaterial({ color: LID_BLUE, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.15 }),
  metal: (color = '#c8cad0') => new THREE.MeshStandardMaterial({ color, metalness: 1, roughness: 0.28 }),
  label: (map) => new THREE.MeshPhysicalMaterial({ map, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.4 }),
  foil: (map) => new THREE.MeshPhysicalMaterial({ map, roughness: 0.28, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.08 }),
};

const mesh = (geo, mat, y = 0) => { const m = new THREE.Mesh(geo, mat); m.position.y = y; return m; };
const lathe = (pts, mat) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), SEG), mat);
const ring = (r, tube, y, mat) => { const t = mesh(new THREE.TorusGeometry(r, tube, 10, SEG), mat, y); t.rotation.x = Math.PI / 2; return t; };
const sleeve = (rt, rb, h, y, map) => { const m = mesh(new THREE.CylinderGeometry(rt, rb, h, SEG, 1, true), mats.label(map), y); m.rotation.y = Math.PI; return m; };
const anchor = (parent, x, y, z, name) => { const o = new THREE.Object3D(); o.position.set(x, y, z); o.name = name; parent.add(o); return o; };

/* ---------- refill pouch (pillow-shaped, printed front) ---------- */
function pouch(p, r) {
  const w = 1.02, h = 1.36, d = 0.16;
  const geo = new THREE.BoxGeometry(w, h, d, 28, 28, 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) / (w / 2), y = pos.getY(i) / (h / 2);
    const puff = Math.max(0, 1 - Math.pow(Math.abs(x), 4)) * Math.max(0, 1 - Math.pow(Math.abs(y) * 1.06, 6));
    pos.setZ(i, pos.getZ(i) * (0.12 + puff * 1.7));
  }
  geo.computeVertexNormals();
  const front = mats.foil(makePouch(p, r));
  const plain = new THREE.MeshPhysicalMaterial({ color: p.pouch.bg[1], roughness: 0.3, clearcoat: 1 });
  const m = new THREE.Mesh(geo, [plain, plain, plain, plain, front, plain]);
  const g = new THREE.Group();
  g.add(m);
  // crimped seals
  [h / 2 - 0.03, -h / 2 + 0.03].forEach((y) => { const s = mesh(new THREE.BoxGeometry(w, 0.05, 0.02), plain, y); g.add(s); });
  return g;
}

/* ---------- open-head drum with blue lid & side handles ---------- */
function drum(p, r) {
  const model = new THREE.Group();
  const R = 0.78, H = 1.86;
  const body = new THREE.Group();
  body.add(lathe([[0, 0], [0.66, 0], [0.74, 0.03], [R, 0.12], [R, 0.2], [R + 0.025, 0.24], [R, 0.28], [R, 1.56], [R + 0.025, 1.6], [R, 1.64], [R, 1.76], [0.75, H], [0.7, H], [0.7, H - 0.02], [0, H - 0.02]], mats.hdpe()));
  const tex = makeLabel(p, 2 * Math.PI * R, 1.18, r);
  body.add(sleeve(R + 0.004, R + 0.004, 1.18, 0.92, tex));
  // side handles
  [-1, 1].forEach((sx) => {
    const hd = new THREE.Group();
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.035, 10, 32, Math.PI), mats.lid());
    loop.rotation.z = sx > 0 ? -Math.PI / 2 : Math.PI / 2;
    hd.add(loop);
    hd.add(mesh(new THREE.BoxGeometry(0.06, 0.34, 0.12), mats.lid()));
    hd.position.set(sx * (R + 0.02), 1.62, 0);
    body.add(hd);
  });

  const lid = new THREE.Group();
  lid.position.y = H;
  lid.add(lathe([[0, 0.13], [0.6, 0.13], [0.7, 0.11], [0.8, 0.1], [0.83, 0.06], [0.83, -0.1], [0.79, -0.1], [0.79, 0.02], [0, 0.02]], mats.lid()));
  [0.5, 0.36].forEach((rr) => lid.add(ring(rr, 0.012, 0.135, mats.lid())));
  lid.add(ring(0.835, 0.03, -0.03, p.label.clamp ? mats.metal(p.label.clamp) : mats.lid()));
  // lid lugs
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const lug = mesh(new THREE.BoxGeometry(0.1, 0.12, 0.08), mats.lid(), -0.02);
    lug.position.x = Math.cos(a) * 0.86; lug.position.z = Math.sin(a) * 0.86; lug.rotation.y = -a;
    lid.add(lug);
  }
  model.add(body, lid);

  const pk = pouch(p, r);
  pk.position.set(0.98, 0.68, 0.6);
  pk.rotation.set(-0.05, -0.32, 0.02);
  pk.userData.base = pk.position.clone();
  model.add(pk);

  const anchors = {
    lid: anchor(lid, 0.55, 0.12, 0, 'lid'),
    body: anchor(body, -R, 1.15, 0, 'body'),
    bodyR: anchor(body, R, 1.15, 0, 'bodyR'),
    pouch: anchor(pk, 0.5, 0.25, 0, 'pouch'),
  };
  return { model, parts: { body, lid, pouch: pk, lidBase: H }, anchors };
}

/* ---------- tapered bucket (Prince Grip) ---------- */
function pail(p, r) {
  const model = new THREE.Group();
  const Rt = 0.86, Rb = 0.72, H = 1.62;
  const shell = mats.hdpe();
  model.add(mesh(new THREE.CylinderGeometry(Rt, Rb, H, SEG, 1, true), shell, H / 2));
  model.add(mesh(new THREE.CylinderGeometry(Rb, Rb, 0.02, SEG), shell, 0.01));
  const ry = (y) => Rb + (Rt - Rb) * (y / H);
  const ly0 = 0.18, ly1 = 1.28;
  const tex = makeLabel(p, 2 * Math.PI * ry((ly0 + ly1) / 2), ly1 - ly0, r);
  model.add(sleeve(ry(ly1) + 0.006, ry(ly0) + 0.006, ly1 - ly0, (ly0 + ly1) / 2, tex));
  [1.38, 1.48].forEach((y) => model.add(ring(ry(y) + 0.01, 0.02, y, shell)));
  const lid = new THREE.Group();
  lid.position.y = H;
  lid.add(lathe([[0, 0.08], [0.78, 0.08], [0.82, 0.1], [0.91, 0.1], [0.92, 0.0], [0.91, -0.09], [0.87, -0.09], [0.87, 0.0], [0, 0.0]], mats.lid()));
  model.add(lid);
  const handle = new THREE.Group();
  handle.add(new THREE.Mesh(new THREE.TorusGeometry(ry(1.4) + 0.05, 0.02, 10, 64, Math.PI), mats.metal()));
  const grip = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 24), mats.lid());
  grip.rotation.z = Math.PI / 2; grip.position.set(0, ry(1.4) + 0.05, 0);
  handle.add(grip);
  handle.position.y = 1.4; handle.rotation.x = -1.35;
  model.add(handle);

  const pk = pouch(p, r);
  pk.position.set(0.98, 0.68, 0.6);
  pk.rotation.set(-0.05, -0.32, 0.02);
  pk.userData.base = pk.position.clone();
  model.add(pk);
  return { model, parts: { lid, pouch: pk, lidBase: H }, anchors: {} };
}

const BUILDERS = { drum, pail };

export function buildProduct(p, renderer) {
  const built = BUILDERS[p.shape](p, renderer);
  // centre & normalise so every pack reads at a comparable size on stage
  const box = new THREE.Box3().setFromObject(built.model);
  const size = box.getSize(new THREE.Vector3());
  const centre = box.getCenter(new THREE.Vector3());
  built.model.position.sub(centre);
  const holder = new THREE.Group();
  holder.add(built.model);
  const s = 2.75 / Math.max(size.y, size.x * 1.15);
  holder.scale.setScalar(s);
  holder.userData.halfHeight = (size.y * s) / 2;
  holder.userData.halfWidth = (size.x * s) / 2;
  built.holder = holder;
  built.data = p;
  return built;
}
