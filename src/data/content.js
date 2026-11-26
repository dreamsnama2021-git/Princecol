// All brand copy & product data lives here. Source: princecol.com (Principle Adhesives Pvt Ltd).
// Product photos: /public/images/princecol/ (taken from the existing site).

export const brand = {
  name: 'PRINCIPLE',
  full: 'Principle Adhesives Pvt Ltd',
  tagline: 'The Adhesive Experts',
  email: 'princecoladhesives@gmail.com',
  phone: '+91 8010835355',
  office: 'Office No. 911, 9th Floor, Topiwala Center, Off SV Road, Jawahar Nagar, Goregaon West, Mumbai 400062',
  factory: '1 Shakti Ind. Estate, Anand Compound, Fanas Pada, Waliv, Vasai East, Dist. Palghar 401208',
};

const IMG = '/images/princecol/';

/*
  label: how the 3D pack is printed
    top  — serif wordmark line, pill — word in the red pill (null = none)
  pouch: printed refill pouch that sits beside the drum
*/
export const products = [
  {
    id: 'princecol',
    code: 'PRINCECOL',
    name: 'All-in-One Synthetic Resin Adhesive',
    chemistry: 'Synthetic Resin',
    shape: 'drum',
    accent: '#2F86E8',
    image: `${IMG}col1.png`,
    label: { top: 'PRINCECOL', pill: 'ALL IN ONE', clamp: '#B08A3E' },
    pouch: { bg: ['#9FD6F2', '#FFFFFF'], band: '#1D2F7A', bandText: 'Synthetic Resin Adhesive', motif: 'wood', note: 'WATER PROOF + ANTI TERMITE' },
    tagline: 'All in one.',
    description: 'Extra-strength synthetic resin adhesive — water proof and anti-termite, for every furniture and woodwork job.',
    application: 'Furniture · Woodwork · Packaging',
    specs: [
      ['Net weight', '800 g'],
      ['Protection', 'Water + Termite'],
      ['Setting', 'Quick'],
    ],
    features: ['Water resistant', 'Heat resistant', 'Quick setting', 'Anti-termite', 'Maximum coverage', 'All weather conditions'],
  },
  {
    id: 'princebond',
    code: 'PRINCE BOND',
    name: 'Extra Bonding Strength Adhesive',
    chemistry: 'Synthetic Resin',
    shape: 'drum',
    accent: '#F5901E',
    image: `${IMG}bond1.png`,
    label: { top: 'PRINCE', pill: 'BOND', band: '#F2C200' },
    pouch: { bg: ['#F7A21B', '#E8661A'], band: '#E8661A', bandText: 'Synthetic Resin Adhesive', motif: 'badge' },
    tagline: 'Holds in every weather.',
    description: 'Quick-setting synthetic resin adhesive with heat and water resistance, for furniture and the packaging industry.',
    application: 'Furniture · Packaging · All weather',
    specs: [
      ['Net weight', '1 kg'],
      ['Resistance', 'Heat + Water'],
      ['Conditions', 'All weather'],
    ],
    features: ['Water resistant', 'Heat resistant', 'Quick setting', 'Anti-termite', 'Maximum solid', 'Everlasting bonding'],
  },
  {
    id: 'princelite',
    code: 'PRINCE LITE',
    name: 'High-Coverage Synthetic Resin Adhesive',
    chemistry: 'Synthetic Resin',
    shape: 'drum',
    accent: '#E5322D',
    image: `${IMG}lite1.png`,
    label: { top: 'PRINCE', pill: 'LITE', band: '#E5322D' },
    pouch: { bg: ['#FFFFFF', '#F4F4F4'], band: '#E5322D', bandText: 'Synthetic Resin Adhesive', motif: 'triangles' },
    tagline: 'Maximum coverage, every spread.',
    description: 'High-solid adhesive for furniture and packaging, with anti-termite protection and everlasting bonding.',
    application: 'Furniture · Packaging · Footwear',
    specs: [
      ['Net weight', '1 kg'],
      ['Coverage', 'Maximum'],
      ['Protection', 'Anti-termite'],
    ],
    features: ['For furniture', 'Maximum solid', 'For packaging industry', 'Maximum coverage', 'Everlasting bonding', 'Anti-termite'],
  },
  {
    id: 'princeglu',
    code: 'PRINCE GLU',
    name: 'P.V.A. Emulsion Adhesive',
    chemistry: 'PVA Emulsion',
    shape: 'drum',
    accent: '#4B63E0',
    image: `${IMG}glu1.png`,
    label: { top: 'PRINCE', pill: 'GLU', swoosh: true },
    pouch: { bg: ['#FFFFFF', '#F2F2F2'], band: '#1D2F7A', bandText: 'P.V.A. EMULSION', motif: 'swoosh', bandTop: true },
    tagline: 'The everyday PVA.',
    description: 'P.V.A. emulsion with extra bonding strength for furniture, paper and packaging work.',
    application: 'Furniture · Paper · Packaging',
    specs: [
      ['Net weight', '1 kg'],
      ['Type', 'PVA emulsion'],
      ['Coverage', 'Maximum'],
    ],
    features: ['For furniture', 'Maximum solid', 'For packaging industry', 'Maximum coverage', 'Everlasting bonding'],
  },
  {
    id: 'princegrip',
    code: 'PRINCE GRIP',
    name: 'Ultimate Bonding Strength Adhesive',
    chemistry: 'Synthetic Resin',
    shape: 'pail',
    accent: '#E2AE2C',
    image: `${IMG}grip1.png`,
    label: { top: 'PRINCE', pill: 'GRIP', band: '#F2C200' },
    pouch: { bg: ['#F6EBC8', '#C99A3C'], band: '#7A5418', bandText: 'Synthetic Resin Adhesive', motif: 'premium', note: 'ULTIMATE BONDING STRENGTH' },
    tagline: 'Ultimate bonding strength.',
    description: 'Fast-setting, bubble-free adhesive that bonds ply to laminate, veneer, PVC, ACP, glass, stone, tiles and steel.',
    application: 'Laminates · Interiors · Flooring',
    specs: [
      ['Setting', 'Fast'],
      ['Finish', 'Bubble free'],
      ['Bonds ply to', '18+ surfaces'],
    ],
    features: ['Heat & water resistant', 'Anti-termite', 'Fast setting', 'Bubble free', 'Long storage life', 'Everlasting bonding'],
    surfaces: ['Laminate', 'Wood', 'Veneer', 'Ply', 'Vinyl', 'Wallpaper', 'PVC sheet', 'Acrylic sheet', 'Charcoal sheet', 'ACP sheet', 'Bakelite', 'Carpet', 'Glass', 'Marble', 'Granite', 'Sunpack', 'Ceramic tiles', 'Steel'],
  },
];

// Industries named on princecol.com/about
export const industries = [
  { id: 'furniture', name: 'Furniture', product: 'princecol', motif: 'dovetail',
    line: 'Joinery, laminates and veneers held for the life of the piece — water proof and termite proof.' },
  { id: 'mattresses', name: 'Mattresses', product: 'princebond', motif: 'lattice',
    line: 'Foam-to-foam and foam-to-fabric bonding for some of India’s biggest mattress makers.' },
  { id: 'footwear', name: 'Footwear', product: 'princelite', motif: 'stitch',
    line: 'Flexible, high-coverage bonds for uppers, soles and linings on fast production lines.' },
  { id: 'automobiles', name: 'Automobiles', product: 'princebond', motif: 'flow',
    line: 'Interior trims and panels bonded to stay put through heat, vibration and monsoon humidity.' },
  { id: 'packaging', name: 'Paper & Packaging', product: 'princeglu', motif: 'flute',
    line: 'PVA bonding for cartons, corrugation and paper products at production speed.' },
  { id: 'flooring', name: 'Flooring & Carpet', product: 'princegrip', motif: 'joints',
    line: 'Ply to carpet, vinyl, ceramic tiles, marble and granite — one grip for every floor.' },
];

export const stats = [
  { value: 30, suffix: '+', label: 'Years of research & innovation' },
  { value: 5, suffix: '', label: 'Prince product ranges' },
  { value: 4, suffix: '', label: 'Adhesive chemistries' },
  { value: 7, suffix: '+', label: 'Industries served' },
];

export const capabilities = [
  { n: '01', title: 'Manufacturing', body: 'A technology-driven manufacturing unit at Vasai, supplying clients across India and reaching global markets.' },
  { n: '02', title: 'Research & Innovation', body: 'Three decades of relentless research, innovation and market orientation behind every formulation.' },
  { n: '03', title: 'Product Range', body: 'Synthetic rubber, polyurethane, PVA and PVC based adhesives — in water- and solvent-based formulations.' },
  { n: '04', title: 'Customised Solutions', body: 'We partner with clients to understand their bonding challenges and climatic conditions, then customise the product.' },
  { n: '05', title: 'Industry Expertise', body: 'Trusted by some of the biggest manufacturers of automobiles, mattresses, furniture and paper products in India.' },
];

export const features = [
  { title: 'Water Resistant', stat: 'All weather conditions', icon: 'drop' },
  { title: 'Heat Resistant', stat: 'Holds under heat', icon: 'flame' },
  { title: 'Anti-Termite', stat: 'Protects every joint', icon: 'shield' },
  { title: 'Quick Setting', stat: 'Faster job turnaround', icon: 'clock' },
  { title: 'Maximum Coverage', stat: 'More area per kg', icon: 'layers' },
  { title: 'Everlasting Bonding', stat: 'Extra bonding strength', icon: 'bond' },
];

