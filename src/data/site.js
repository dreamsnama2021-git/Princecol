/* =========================================================================
   MULTI-PAGE SITE DATA (inner pages). Grounded in princecol.com
   (home, about, product, gallery and contact pages). Extends content.js.
   ========================================================================= */
import { brand, products } from './content.js';

export { brand, products };

brand.phones = ['+91 8010835355', '+91 9833653585'];
brand.whatsapp = 'https://wa.me/918010835355';
brand.loyalty = 'https://princecol.com/loyaltyprinciple.php';
brand.maps = {
  office: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.7924653875293!2d72.84336337433606!3d19.16055964931412!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b7cc096dfd09%3A0x1722082d3f1eb516!2sPrinciple%20Adhesives%20(%20Princecol%20)!5e0!3m2!1sen!2sin!4v1693289091777!5m2!1sen!2sin',
  factory: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30103.295772828766!2d72.82885099234475!3d19.41620905681338!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7a8da4c8e9e2f%3A0x272166c716caf4fd!2sFanaspada!5e0!3m2!1sen!2sin!4v1693289913837!5m2!1sen!2sin',
};
brand.intro = 'Amongst the leading manufacturers of adhesives and sealants in India — based in Mumbai, with clientele across India and products reaching global markets.';

/*
  Enquiry form integration. Paste the client's approved endpoint here
  (a Formspree / Web3Forms / own PHP mailer URL that accepts a JSON POST).
  While it is empty the form does NOT fake success: it opens a pre-filled
  email to brand.email instead, and says so.
*/
export const formEndpoint = '';

const SITE = '/images/princecol/site/';
const extra = {
  princecol: { slug: 'princecol', drumImg: `${SITE}princecol-drum.jpg`, pouchImg: `${SITE}princecol-pouch.jpg`, packs: ['Drum', 'Pouch'], netWeight: '800 g', category: 'Synthetic Resin Adhesive' },
  princebond: { slug: 'prince-bond', drumImg: `${SITE}prince-bond-drum.jpg`, pouchImg: `${SITE}prince-bond-pouch.jpg`, packs: ['Drum', 'Pouch'], netWeight: '1 kg', category: 'Synthetic Resin Adhesive' },
  princelite: { slug: 'prince-lite', drumImg: `${SITE}prince-lite-drum.jpg`, pouchImg: `${SITE}prince-lite-pouch.jpg`, packs: ['Drum', 'Pouch'], netWeight: '1 kg', category: 'Synthetic Resin Adhesive' },
  princeglu: { slug: 'prince-glu', drumImg: `${SITE}prince-glu-drum.jpg`, pouchImg: `${SITE}prince-glu-pouch.jpg`, packs: ['Drum', 'Pouch'], netWeight: '1 kg', category: 'P.V.A. Emulsion' },
  princegrip: { slug: 'prince-grip', drumImg: `${SITE}prince-grip-bucket.jpg`, pouchImg: `${SITE}prince-grip-pouch.jpg`, packs: ['Bucket', 'Pouch'], netWeight: null, category: 'Synthetic Resin Adhesive' },
};
const overview = {
  princecol: 'Princecol is the flagship of the range — an all-in-one synthetic resin adhesive with extra bonding strength. It is water proof and anti-termite, quick setting, and made for furniture work, the packaging industry and all weather conditions.',
  princebond: 'Prince Bond is a synthetic resin adhesive with extra bonding strength. It is water and heat resistant, quick setting and anti-termite, with maximum solids and coverage for furniture and packaging work in all weather conditions.',
  princelite: 'Prince Lite is a synthetic resin adhesive with extra bonding strength, made for furniture and the packaging industry — maximum solids, maximum coverage, everlasting bonding and anti-termite resistance.',
  princeglu: 'Prince Glu is a P.V.A. emulsion with extra bonding strength for furniture and the packaging industry — maximum solids, maximum coverage and everlasting bonding.',
  princegrip: 'Prince Grip delivers ultimate bonding strength. Heat and water resistant, anti-termite, fast setting and bubble free with a long storage life, it bonds ply to a wide range of surfaces — from laminates and veneers to glass, stone, tiles and steel.',
};
products.forEach((p) => Object.assign(p, extra[p.id], { url: `/products/${extra[p.id].slug}/`, overview: overview[p.id] }));
export const productBySlug = Object.fromEntries(products.map((p) => [p.slug, p]));
export const productById = Object.fromEntries(products.map((p) => [p.id, p]));

/*
  Applications. `products` lists only pairings stated on princecol.com
  (feature lists "For Furniture", "For Packaging Industry", Prince Grip's
  "Ply to …" list). Industries named on the About page without a specific
  product are presented as requirement-led formulations.
*/
export const applications = [
  { id: 'furniture', name: 'Furniture & Woodwork', motif: 'dovetail',
    line: 'The core of the Prince range — joinery, panels, laminates and veneers bonded for the life of the piece.',
    uses: ['Wood-to-wood joinery', 'Ply to laminate', 'Ply to veneer', 'Ply to ply'],
    products: ['princecol', 'princebond', 'princelite', 'princeglu', 'princegrip'] },
  { id: 'interiors', name: 'Interiors & Panelling', motif: 'panels',
    line: 'Fit-out surfaces bonded to ply with a single, bubble-free grip.',
    uses: ['Ply to PVC sheet', 'Ply to acrylic sheet', 'Ply to ACP sheet', 'Ply to wallpaper', 'Ply to glass', 'Ply to bakelite', 'Ply to charcoal sheet', 'Ply to sunpack', 'Ply to steel'],
    products: ['princegrip'] },
  { id: 'flooring', name: 'Flooring & Carpet', motif: 'joints',
    line: 'Floors that stay down — carpet, vinyl, tiles and natural stone bonded to ply.',
    uses: ['Ply to carpet', 'Ply to vinyl', 'Ply to ceramic tiles', 'Ply to marble', 'Ply to granite'],
    products: ['princegrip'] },
  { id: 'packaging', name: 'Paper & Packaging', motif: 'flute',
    line: 'Adhesives made for the packaging industry — including Prince Glu P.V.A. emulsion.',
    uses: ['Packaging industry bonding', 'Paper products'],
    products: ['princeglu', 'princecol', 'princebond', 'princelite'] },
  { id: 'mattresses', name: 'Mattresses', motif: 'lattice',
    line: 'Principle Adhesives has solved bonding challenges for some of India’s biggest mattress manufacturers.',
    uses: [], products: [] },
  { id: 'automobiles', name: 'Automobiles', motif: 'flow',
    line: 'Bonding solutions delivered to some of the biggest automobile manufacturers in India.',
    uses: [], products: [] },
  { id: 'footwear', name: 'Footwear', motif: 'stitch',
    line: 'Footwear is among the industries served by our synthetic rubber, PU and PVC based adhesives.',
    uses: [], products: [] },
  { id: 'pvc', name: 'PVC Pipes & Fittings', motif: 'pipes',
    line: 'PVC based adhesive formulations for pipes and fittings.',
    uses: [], products: [] },
];

export const chemistries = [
  { code: 'SR', name: 'Synthetic Rubber', note: 'Water- and solvent-based formulations' },
  { code: 'PU', name: 'Polyurethane', note: 'Water- and solvent-based formulations' },
  { code: 'PVA', name: 'Polyvinyl Acetate', note: 'Including Prince Glu P.V.A. emulsion' },
  { code: 'PVC', name: 'Polyvinyl Chloride', note: 'For PVC pipes & fittings' },
];

// Narrative chapters — verified facts only. princecol.com publishes no dates, so none are shown.
export const journey = [
  { n: '01', title: 'Rooted in Mumbai', body: 'Principle Adhesives Pvt Ltd is based out of Mumbai, with its registered office in Goregaon West.' },
  { n: '02', title: 'Three decades of research', body: 'Every product is driven by three decades of relentless research, innovation and market orientation.' },
  { n: '03', title: 'Four chemistries', body: 'A formulated range of synthetic rubber, polyurethane, PVA and PVC based adhesives — water- and solvent-based.' },
  { n: '04', title: 'Partner to big manufacturers', body: 'Pivotal in solving challenges for some of the biggest automobile, mattress, furniture and paper product makers in India.' },
  { n: '05', title: 'Made in Vasai', body: 'A technology-driven manufacturing unit at Shakti Industrial Estate, Vasai East.' },
  { n: '06', title: 'Pan-India, going global', body: 'Clientele all over India, with products significantly reaching global markets — led today by the Prince range.' },
];

export const vision = 'To be a technology-driven powerhouse for next-generation bonding products.';
export const mission = 'To provide bonding solutions for diverse industries facing varied performance requirements and dynamic climatic conditions — by partnering with clients to understand their needs and responding with customised products.';

export const approach = [
  { n: '01', title: 'Understand the requirement', body: 'We partner with clients to understand newer bonding requirements and challenges before we formulate.' },
  { n: '02', title: 'Develop the product', body: 'Three decades of research across synthetic rubber, PU, PVA and PVC chemistries go into every formulation.' },
  { n: '03', title: 'Manufacture', body: 'Products are made at our technology-driven manufacturing unit in Vasai.' },
  { n: '04', title: 'Assure performance', body: 'Each product is built around the properties it promises — water and heat resistance, anti-termite protection, coverage and everlasting bonding.' },
  { n: '05', title: 'Customise & support', body: 'We respond with improved, customised products for each application and climate.' },
];

export const advantages = [
  { title: 'Manufacturing Experience', body: 'Three decades of making adhesives, at our own unit in Vasai.', icon: 'factory' },
  { title: 'Product Innovation', body: 'Next-generation products driven by relentless research.', icon: 'spark' },
  { title: 'Quality Commitment', body: 'Water resistance, heat resistance and anti-termite protection built into the range.', icon: 'shield' },
  { title: 'Technical Expertise', body: 'Synthetic rubber, PU, PVA and PVC — in water- and solvent-based formulations.', icon: 'flask' },
  { title: 'Reliable Solutions', body: 'Trusted by major automobile, mattress, furniture and paper manufacturers.', icon: 'bond' },
  { title: 'Customer Support', body: 'We partner with you and customise products for your application.', icon: 'chat' },
];

// Every property claimed on princecol.com product pages (for the quality matrix)
export const properties = [
  { key: 'water', label: 'Water resistant', match: (f) => /water/i.test(f) },
  { key: 'heat', label: 'Heat resistant', match: (f) => /heat/i.test(f) },
  { key: 'termite', label: 'Anti-termite', match: (f) => /termite/i.test(f) },
  { key: 'setting', label: 'Quick / fast setting', match: (f) => /setting/i.test(f) },
  { key: 'coverage', label: 'Maximum coverage', match: (f) => /coverage/i.test(f) },
  { key: 'solid', label: 'Maximum solids', match: (f) => /solid/i.test(f) },
  { key: 'bond', label: 'Everlasting bonding', match: (f) => /everlasting/i.test(f) },
  { key: 'bubble', label: 'Bubble free', match: (f) => /bubble/i.test(f) },
  { key: 'storage', label: 'Long storage life', match: (f) => /storage/i.test(f) },
];
// princecol.com lists "Everlasting Bonding" for Princecol and Prince Bond too (features trimmed on the homepage)
export const productFeaturesFull = {
  princecol: ['Water resistant', 'Heat resistant', 'Quick setting', 'For furniture', 'Maximum solid', 'Anti-termite resistant', 'Maximum coverage', 'Everlasting bonding', 'For packaging industry', 'For all weather conditions'],
  princebond: ['Water resistant', 'Heat resistant', 'Quick setting', 'For furniture', 'Maximum solid', 'Anti-termite resistant', 'Maximum coverage', 'Everlasting bonding', 'For packaging industry', 'For all weather conditions'],
  princelite: ['For furniture', 'Maximum solid', 'For packaging industry', 'Maximum coverage', 'Everlasting bonding', 'Anti-termite resistant'],
  princeglu: ['For furniture', 'Maximum solid', 'For packaging industry', 'Maximum coverage', 'Everlasting bonding'],
  princegrip: ['Heat & water resistant', 'Anti-termite', 'Fast setting', 'Bubble free', 'Long storage life', 'Everlasting bonding'],
};

export const featureIcon = (f) => {
  const t = f.toLowerCase();
  if (t.includes('heat')) return 'flame';
  if (t.includes('water')) return 'drop';
  if (t.includes('termite')) return 'shield';
  if (t.includes('setting')) return 'clock';
  if (t.includes('coverage')) return 'layers';
  if (t.includes('solid')) return 'cube';
  if (t.includes('bubble')) return 'bubble';
  if (t.includes('storage')) return 'box';
  if (t.includes('weather')) return 'sun';
  if (t.includes('furniture')) return 'chair';
  if (t.includes('packaging')) return 'box';
  return 'bond';
};

export const gallery = [
  ...products.flatMap((p) => [
    { src: p.image, alt: `${p.code} — drum and pouch`, cat: 'range', product: p.id, cutout: true },
    { src: p.drumImg, alt: `${p.code} — ${p.packs[0].toLowerCase()}`, cat: 'packs', product: p.id },
    { src: p.pouchImg, alt: `${p.code} — pouch`, cat: 'pouches', product: p.id },
  ]),
  { src: '/images/princecol/market-prod.jpg', alt: 'The Prince range — drums and pouches', cat: 'range', wide: true },
];
export const galleryCats = [
  { key: 'all', label: 'All' },
  { key: 'range', label: 'Product range' },
  { key: 'packs', label: 'Drums & buckets' },
  { key: 'pouches', label: 'Pouches' },
];

export const pages = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'about', label: 'About Us', href: '/about/' },
  { key: 'products', label: 'Products', href: '/products/', mega: true },
  { key: 'gallery', label: 'Gallery', href: '/gallery/' },
  { key: 'contact', label: 'Contact Us', href: '/contact/' },
];
