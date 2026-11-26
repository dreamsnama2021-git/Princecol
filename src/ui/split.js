// Accessible text splitting: screen readers get the original string via aria-label.
export function splitChars(el, { masked = false } = {}) {
  if (!el || el.dataset.splitDone) return [];
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text);
  el.textContent = '';
  const chars = [];
  text.split(' ').forEach((word, wi, arr) => {
    const w = document.createElement('span');
    w.className = 'word';
    w.setAttribute('aria-hidden', 'true');
    [...word].forEach((ch) => {
      const c = document.createElement('span');
      c.className = 'char';
      c.textContent = ch;
      if (masked) {
        const m = document.createElement('span');
        m.className = 'mask';
        m.appendChild(c);
        w.appendChild(m);
      } else w.appendChild(c);
      chars.push(c);
    });
    el.appendChild(w);
    if (wi < arr.length - 1) el.appendChild(document.createTextNode(' '));
  });
  el.dataset.splitDone = '1';
  return chars;
}

/** Split into masked lines of words (for multi-line display headings). */
export function splitWords(el) {
  if (!el || el.dataset.splitDone) return [];
  const label = el.textContent.replace(/\s+/g, ' ').trim();
  el.setAttribute('aria-label', label);
  const words = [];
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const m = document.createElement('span'); m.className = 'mask'; m.setAttribute('aria-hidden', 'true');
          const w = document.createElement('span'); w.className = 'char'; w.textContent = part;
          m.appendChild(w); frag.appendChild(m); words.push(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  };
  walk(el);
  el.dataset.splitDone = '1';
  return words;
}
