// Line icons (64×64, stroked). Drawn on scroll by `drawIcons()` in components.js.
export const ICONS = {
  drop: '<path d="M32 6C24 18 14 28 14 40a18 18 0 0 0 36 0C50 28 40 18 32 6z"/><path d="M24 42a8 8 0 0 0 8 8"/>',
  flame: '<path d="M32 58c-11 0-18-8-18-18 0-12 10-16 10-28 6 4 10 10 10 16 3-2 5-6 5-10 7 6 11 14 11 22 0 10-7 18-18 18z"/><path d="M32 58c-5 0-8-4-8-8 0-6 8-10 8-16 4 4 8 9 8 16 0 4-3 8-8 8z"/>',
  clock: '<circle cx="32" cy="34" r="22"/><path d="M32 20v14l9 6M26 6h12M32 6v6"/>',
  layers: '<path d="M32 8L6 22l26 14 26-14z"/><path d="M6 32l26 14 26-14"/><path d="M6 42l26 14 26-14"/>',
  shield: '<path d="M32 6l22 8v16c0 14-10 24-22 28C20 54 10 44 10 30V14z"/><path d="M22 32l7 7 13-14"/>',
  bond: '<rect x="6" y="10" width="52" height="14"/><rect x="6" y="40" width="52" height="14"/><path d="M16 24v16M26 24c0 6 4 10 0 16M38 24c0 6-4 10 0 16M48 24v16"/>',
  flask: '<path d="M24 6h16M28 6v16L12 52a4 4 0 0 0 3.5 6h33a4 4 0 0 0 3.5-6L36 22V6"/><path d="M18 42h28"/><circle cx="28" cy="48" r="2"/><circle cx="37" cy="45" r="1.5"/>',
  spark: '<path d="M32 6v14M32 44v14M6 32h14M44 32h14M14 14l9 9M41 41l9 9M50 14l-9 9M23 41l-9 9"/><circle cx="32" cy="32" r="6"/>',
  factory: '<path d="M6 56V30l14 8V30l14 8V30l14 8V12h10v44z"/><path d="M14 48h6M28 48h6M42 48h6"/>',
  chat: '<path d="M8 12h48v30H26l-12 10V42H8z"/><path d="M18 24h28M18 32h18"/>',
  cube: '<path d="M32 6l24 13v26L32 58 8 45V19z"/><path d="M8 19l24 13 24-13M32 32v26"/>',
  bubble: '<circle cx="24" cy="38" r="14"/><circle cx="44" cy="20" r="9"/><circle cx="48" cy="46" r="5"/><path d="M18 34a7 7 0 0 1 6-6"/>',
  box: '<path d="M8 20l24-12 24 12v26L32 58 8 46z"/><path d="M8 20l24 12 24-12M32 32v26M20 14l24 12"/>',
  sun: '<circle cx="32" cy="32" r="11"/><path d="M32 6v8M32 50v8M6 32h8M50 32h8M13 13l6 6M45 45l6 6M51 13l-6 6M19 45l-6 6"/>',
  chair: '<path d="M18 6v26h28V6"/><path d="M14 32h36v8H14zM18 40v18M46 40v18M18 50h28"/>',
  pin: '<path d="M32 58S12 38 12 24a20 20 0 0 1 40 0c0 14-20 34-20 34z"/><circle cx="32" cy="24" r="7"/>',
  phone: '<path d="M14 8h12l4 14-7 5a30 30 0 0 0 14 14l5-7 14 4v12a4 4 0 0 1-4 4C28 54 10 36 10 12a4 4 0 0 1 4-4z"/>',
  mail: '<rect x="6" y="14" width="52" height="36"/><path d="M6 14l26 20 26-20"/>',
  whatsapp: '<path d="M10 54l4-12a22 22 0 1 1 8 8z"/><path d="M24 22c0 10 8 18 18 18l3-5-6-3-3 3c-3-1-6-4-7-7l3-3-3-6z"/>',
};

export const icon = (name, cls = 'icon') => `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true">${ICONS[name] || ICONS.bond}</svg>`;
