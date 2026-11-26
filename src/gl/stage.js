// One WebGL stage for hero + showcase. Timelines tween plain "proxy" objects;
// the render loop maps them onto the scene (with responsive compression).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildProduct } from './products.js';
import { isLight, palette } from '../ui/theme.js';

const BG_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const BG_FRAG = `
  uniform vec3 uColor; uniform float uStrength; uniform float uTime; uniform float uLight; uniform float uTex; varying vec2 vUv;
  // Backdrop texture: a slow, domain-warped "resin flow" haze in the accent colour + a fine dot grid.
  // No rings or ovals — the visible area (~18 x 10 units of this 36 x 22 plane) reads as an even surface.
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + 1.0), u.x), u.y);
  }
  float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ v += a * noise(p); p *= 2.02; a *= 0.5; } return v; }
  void main(){
    vec2 w = vUv * vec2(36.0, 22.0);              // plane units
    vec2 s = (vUv - 0.5) * vec2(36.0, 22.0) / vec2(9.0, 5.0); // ~ -1..1 across the screen
    float t = uTime * 0.035;
    vec2 q = w / 4.0;
    float n = fbm(q + vec2(t, -t * 0.6) + fbm(q * 0.7 - vec2(t * 0.8, t)) * 1.1);
    float flow = smoothstep(0.48, 0.86, n);
    vec2 g = fract(w * 3.0) - 0.5;                 // dot every ~1/3 unit (~35px on desktop)
    float dots = smoothstep(0.075, 0.035, length(g));
    float fade = 1.0 - smoothstep(0.6, 1.5, length(s));
    bool light = uLight > 0.5;
    float fa = flow * uStrength * (light ? 0.3 : 0.6);
    float da = dots * fade * (light ? 0.09 : 0.06);
    vec3 ink = light ? vec3(0.12, 0.13, 0.15) : vec3(1.0);
    float a = fa + da;
    vec3 col = (uColor * fa + ink * da) / max(a, 1e-4);
    vec4 tex = light ? vec4(col, a) : vec4(col * a, a);

    // original oval glow + ring (hero and product chapters)
    vec2 p = vUv - vec2(0.5, 0.52);
    float d = length(p * vec2(1.0, 1.25));
    float glow = smoothstep(0.42, 0.0, d) * uStrength;
    float ring = smoothstep(0.004, 0.0, abs(d - 0.21 - sin(uTime*0.3)*0.004)) * 0.10 * uStrength;
    float oa = glow * 0.55 + ring;
    vec4 oval = light ? vec4(uColor, oa * 0.42) : vec4(uColor * oa, oa);

    // uTex: 0 = oval (default), 1 = flow + dot texture (only the "Five adhesives" intro)
    gl_FragColor = mix(oval, tex, uTex);
  }`;

function radialTexture(inner = 'rgba(0,0,0,0.75)') {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, inner); grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

export class Stage {
  constructor(canvas, products) {
    this.canvas = canvas;
    this.mobile = window.matchMedia('(max-width: 899px)').matches;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.active = true;
    this.mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    this.global = { idle: 1, glow: 0.35, tex: 0, accent: new THREE.Color('#E5322D') };

    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }));
    r.setPixelRatio(Math.min(window.devicePixelRatio, this.mobile ? 1.25 : 1.5));
    r.setSize(window.innerWidth, window.innerHeight, false);
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = isLight ? 1.0 : 1.05;
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(r);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = isLight ? 0.95 : 0.75;

    this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 8);

    const key = new THREE.DirectionalLight('#fff4e8', 2.4); key.position.set(4, 5, 6);
    this.rim = new THREE.DirectionalLight('#E5322D', 4); this.rim.position.set(-5, 2.5, -4);
    this.rim2 = new THREE.DirectionalLight('#E5322D', 2); this.rim2.position.set(5, -1, -3);
    const fill = new THREE.DirectionalLight('#9fb0ff', 0.35); fill.position.set(-6, -2, 4);
    this.scene.add(key, this.rim, this.rim2, fill);

    // accent backdrop glow
    this.bg = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 22),
      new THREE.ShaderMaterial({ vertexShader: BG_VERT, fragmentShader: BG_FRAG, transparent: true, depthWrite: false,
        uniforms: { uColor: { value: this.global.accent }, uStrength: { value: 0.35 }, uTime: { value: 0 }, uLight: { value: isLight ? 1 : 0 }, uTex: { value: 0 } } })
    );
    this.bg.position.z = -8;
    this.scene.add(this.bg);

    // dust in the light
    const N = this.mobile ? 120 : 280;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 16; pos[i * 3 + 1] = (Math.random() - 0.5) * 10; pos[i * 3 + 2] = -6 + Math.random() * 9; }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.dust = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.035, map: radialTexture('rgba(255,255,255,1)'), color: palette.dust, transparent: true, opacity: isLight ? 0.3 : 0.45, depthWrite: false, sizeAttenuation: true }));
    this.scene.add(this.dust);

    // products
    const shadowTex = radialTexture();
    this.items = {};
    products.forEach((p, i) => {
      const built = buildProduct(p, r);
      const root = new THREE.Group();
      const float = new THREE.Group();
      float.add(built.holder);
      root.add(float);
      this.scene.add(root);
      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.6 }));
      shadow.rotation.x = -Math.PI / 2;
      this.scene.add(shadow);
      this.items[p.id] = {
        ...built, root, float, shadow, phase: i * 1.7,
        proxy: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1, ls: 0, explode: 0, lid: 0, cap: 0, ox: 0 },
      };
    });

    this.v = new THREE.Vector3();
    this.labels = [];
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);
    window.addEventListener('pointermove', (e) => {
      this.mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    }, { passive: true });
    this.onResize();
  }

  get kx() { return THREE.MathUtils.clamp(this.camera.aspect / 1.78, 0.26, 1.15); }
  get base() { return this.mobile ? 0.62 : THREE.MathUtils.clamp(0.82 + this.camera.aspect * 0.1, 0.9, 1.05); }

  onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.mobile = window.matchMedia('(max-width: 899px)').matches;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  setAccent(hex) { this.global.accent.set(hex); }

  /** connect HTML elements that should track 3D anchors: [{ el, item, anchor }] */
  trackLabels(list) { this.labels = list; }

  apply(t) {
    const kx = this.kx, base = this.base;
    const squeeze = Math.min(1, Math.max(0.55, kx * 1.6));
    const idle = this.reduced ? 0 : this.global.idle;
    const intro = this.global.intro ?? 1;
    for (const id in this.items) {
      const it = this.items[id];
      const p = it.proxy;
      // chapters: packs shrink (global.chFit, blended in by global.cf) to fit between the text and the specs
      const fit = THREE.MathUtils.lerp(1, this.global.chFit ?? 1, this.global.cf || 0);
      // intro group fit (narrow desktops): designed spacing scaled by gk, placed right of the heading (gQ px)
      const gf = (this.global.gf || 0) * (this.global.gOn || 0);
      const gk = THREE.MathUtils.lerp(1, this.global.gk ?? 1, gf);
      const gy = THREE.MathUtils.lerp(1, (this.global.gk ?? 1) * (this.global.gSp || 1), gf);
      let px = p.x * kx;
      if (gf > 0) {
        const u = window.innerHeight / (2 * this.camera.position.z * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)));
        const P = this.camera.position.z / (this.camera.position.z - p.z);
        px = THREE.MathUtils.lerp(px, p.x * (this.global.gSp || 1) * this.global.gk + this.global.gQ / (u * P), gf);
      }
      const s = p.s * base * fit * gk * THREE.MathUtils.lerp(1, squeeze, p.ls) * (0.35 + 0.65 * intro);
      const z = p.z - (1 - intro) * 3;
      // p.ox: off-stage offset in screen widths (±1 = fully outside the frame at any aspect ratio).
      // Unlike p.x it is not squeezed by kx, so packs leaving/entering never linger at the screen edge.
      const halfW = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * (this.camera.position.z - z) * this.camera.aspect;
      const offX = (p.ox || 0) * (halfW + 1.7 * s);
      // global.shift (0..1) blends in global.shiftX — used to centre the product group between equal margins
      it.root.position.set(px + offX + (this.global.shift || 0) * (this.global.shiftX || 0), p.y * gy * (this.mobile ? 0.9 : 1) - (this.mobile ? 0.1 : 0) - (1 - intro) * 1.2, z);
      it.root.rotation.set(p.rx, p.ry - (1 - intro) * 2.4, p.rz);
      it.root.scale.setScalar(Math.max(s, 0.0001));

      const fy = Math.sin(t * 0.9 + it.phase) * 0.08;
      it.float.position.y = fy * (0.35 + idle * 0.65);
      it.float.rotation.y = Math.sin(t * 0.35 + it.phase) * 0.4 * idle;
      it.float.rotation.z = Math.sin(t * 0.6 + it.phase) * 0.04 * idle;

      const { parts } = it;
      // lid: lifts on 'lid' (with tilt) and on 'explode'; pouch slides out on 'explode' or 'cap'
      if (parts.lid) {
        const up = Math.max(p.lid, p.explode);
        parts.lid.position.y = parts.lidBase + up * 0.75;
        parts.lid.rotation.x = -p.lid * 0.38;
        parts.lid.position.z = p.lid * 0.15;
        parts.lid.rotation.y = p.explode * 0.5;
      }
      if (parts.pouch) {
        const out = Math.max(p.explode, p.cap);
        const b = parts.pouch.userData.base;
        parts.pouch.position.set(b.x + out * 0.75, b.y + out * 0.15, b.z + out * 0.35);
        parts.pouch.rotation.y = -0.32 - out * 0.35;
      }

      const hh = it.holder.userData.halfHeight * s;
      it.shadow.position.set(it.root.position.x, it.root.position.y - hh - 0.25, it.root.position.z);
      const sw = 2.5 * s;
      it.shadow.scale.set(sw, sw * 0.5, 1);
      const off = Math.min(1, Math.abs(it.root.position.x) / 5 + Math.max(0, -it.root.position.z - 3) / 6);
      it.shadow.material.opacity = 0.55 * (1 - off) * (1 - fy * 2);
    }
  }

  render(t) {
    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.05;
    if (!this.reduced) {
      this.camera.position.x = this.mouse.x * 0.35;
      this.camera.position.y = this.mouse.y * 0.22;
    }
    this.camera.lookAt(0, 0, 0);
    this.rim.color.copy(this.global.accent);
    this.rim2.color.copy(this.global.accent);
    this.bg.material.uniforms.uStrength.value = this.global.glow;
    this.bg.material.uniforms.uTex.value = this.global.tex;
    this.bg.material.uniforms.uTime.value = t;
    this.dust.rotation.y = t * 0.01;
    this.dust.position.y = Math.sin(t * 0.1) * 0.3;
    this.apply(t);
    this.renderer.render(this.scene, this.camera);

    // project HTML callouts onto 3D anchor points
    if (this.labels.length) {
      const w = window.innerWidth, h = window.innerHeight;
      for (const l of this.labels) {
        // skip hidden callouts: writing CSS vars every frame forces a style recalc
        if (!l.anchor || !(parseFloat(l.el.style.opacity) > 0)) continue;
        l.anchor.getWorldPosition(this.v).project(this.camera);
        const x = (this.v.x * 0.5 + 0.5) * w, y = (-this.v.y * 0.5 + 0.5) * h;
        l.el.style.setProperty('--x', `${x}px`);
        l.el.style.setProperty('--y', `${y}px`);
      }
    }
  }

  start() {
    const clock = new THREE.Clock();
    const loop = () => {
      requestAnimationFrame(loop);
      if (!this.active || document.hidden) return;
      this.render(clock.getElapsedTime());
    };
    loop();
  }

  /** Render a single product to a transparent image — used as "photography" across the site. */
  snapshot(id, w = 900, h = 1100) {
    const r = this.renderer;
    const prevPR = r.getPixelRatio();
    const prevAspect = this.camera.aspect;
    const it = this.items[id];
    const saved = {};
    for (const k in this.items) {
      saved[k] = { ...this.items[k].proxy, vis: this.items[k].root.visible };
      this.items[k].root.visible = k === id;
      this.items[k].shadow.visible = k === id;
    }
    this.bg.visible = false; this.dust.visible = false;
    Object.assign(it.proxy, { x: 0, y: 0.05, z: 0, rx: 0.1, ry: -0.22, rz: 0, s: 1, ls: 0, explode: 0, lid: 0, cap: 0, ox: 0 });
    r.setPixelRatio(1);
    r.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.position.set(0, 0.3, 8);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
    const wasMobile = this.mobile; this.mobile = false;
    const g = this.global.idle; this.global.idle = 0;
    const gi = this.global.intro; this.global.intro = 1;
    this.rim.color.set(it.data.accent); this.rim2.color.set(it.data.accent);
    this.apply(0);
    it.root.scale.setScalar(1);
    r.render(this.scene, this.camera);
    const url = r.domElement.toDataURL('image/webp', 0.9);

    // restore
    this.global.idle = g; this.global.intro = gi; this.mobile = wasMobile;
    for (const k in this.items) { Object.assign(this.items[k].proxy, saved[k]); this.items[k].root.visible = saved[k].vis; this.items[k].shadow.visible = true; }
    this.bg.visible = true; this.dust.visible = true;
    r.setPixelRatio(prevPR);
    this.camera.aspect = prevAspect;
    this.onResize();
    return url;
  }
}
