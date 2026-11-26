import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { readdirSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const root = process.cwd();

// Every page is a real HTML file in a folder, so URLs stay clean: /about/, /products/prince-grip/ …
const PAGES = ['index.html', 'about', 'products', 'gallery', 'contact'];
function inputs() {
  const out = {};
  for (const p of PAGES) {
    const file = p.endsWith('.html') ? p : `${p}/index.html`;
    out[p.replace(/\W+/g, '_')] = resolve(root, file);
  }
  const prodDir = resolve(root, 'products');
  if (existsSync(prodDir)) {
    for (const d of readdirSync(prodDir, { withFileTypes: true })) {
      if (d.isDirectory() && existsSync(resolve(prodDir, d.name, 'index.html'))) out[`product_${d.name}`] = resolve(prodDir, d.name, 'index.html');
    }
  }
  return out;
}

/*
  site-partials: expands <!-- @token --> comments into shared HTML (head, nav,
  footer, CTA bands, enquiry form, product template) from src/site/templates.js,
  so every page is complete, crawlable HTML with one source of truth.
*/
function sitePartials() {
  let server;
  const load = () => (server
    ? server.ssrLoadModule('/src/site/templates.js')
    : import(pathToFileURL(resolve(root, 'src/site/templates.js')).href));
  return {
    name: 'site-partials',
    configureServer(s) { server = s; },
    handleHotUpdate({ file, server: s }) {
      if (/[\\/]src[\\/](site|data)[\\/]/.test(file)) {
        s.moduleGraph.invalidateAll();
        s.ws.send({ type: 'full-reload' });
      }
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        const t = await load();
        const json = (s) => (s && s.trim() ? JSON.parse(s) : {});
        return html
          .replace(/<!--\s*@head(:home)?\s*-->/g, (_, home) => t.head({ inner: !home }))
          .replace(/<!--\s*@chrome\s*-->/g, () => t.chrome())
          .replace(/<!--\s*@nav:([\w-]+)\s*-->/g, (_, k) => t.nav(k))
          .replace(/<!--\s*@footer\s*-->/g, () => t.footer())
          .replace(/<!--\s*@productmeta:([\w-]+)\s*-->/g, (_, slug) => {
            const m = t.productMeta(slug);
            return `<title>${m.title}</title>\n  <meta name="description" content="${m.description.replace(/"/g, '&quot;')}" />\n  <meta property="og:title" content="${m.title}" />\n  <script type="application/ld+json">${m.jsonld}</script>`;
          })
          .replace(/<!--\s*@product:([\w-]+)\s*-->/g, (_, slug) => t.productPage(slug))
          .replace(/<!--\s*@collection\s*-->/g, () => t.collection())
          .replace(/<!--\s*@cta\s+([\s\S]*?)-->/g, (_, j) => t.ctaBand(json(j)))
          .replace(/<!--\s*@form\s*([\s\S]*?)-->/g, (_, j) => t.enquiryForm(json(j)));
      },
    },
  };
}

export default defineConfig({
  appType: 'mpa', // real multi-page site: unknown URLs 404 instead of falling back to the homepage
  plugins: [sitePartials()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: inputs(),
      output: {
        // long-cacheable vendor chunks, separate from site code
        manualChunks: { three: ['three'], motion: ['gsap', 'gsap/ScrollTrigger', 'lenis'] },
      },
    },
  },
});
