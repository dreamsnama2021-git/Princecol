// Theme is chosen in <head> (?theme=light|dark, kept for the visit) before paint; JS modules read it here.
export const isLight = document.documentElement.dataset.theme === 'light';

/** Colours the canvas/WebGL layers need, per theme. */
export const palette = isLight
  ? { base: '#F1EEE8', baseRgb: '241,238,232', fg: '#121214', fgRgb: '18,18,20', dust: '#6f6c65', motif: 'rgba(18,18,20,0.10)', motifFill: 'rgba(18,18,20,0.025)' }
  : { base: '#0A0A0B', baseRgb: '10,10,11', fg: '#EDEAE3', fgRgb: '237,234,227', dust: '#edeae3', motif: 'rgba(237,234,227,0.09)', motifFill: 'rgba(237,234,227,0.025)' };

/** Point every theme link at the other option and label it. */
export function initThemeLinks() {
  document.querySelectorAll('[data-theme-link]').forEach((a) => {
    const other = isLight ? 'dark' : 'light';
    a.href = `${location.pathname}?theme=${other}${location.hash}`;
    a.setAttribute('aria-label', `Switch to ${other} theme`);
    const label = a.querySelector('span');
    if (label) label.textContent = a.classList.contains('nav__theme') ? other[0].toUpperCase() + other.slice(1) : other;
  });
}
