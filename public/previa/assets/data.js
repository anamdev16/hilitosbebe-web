// Catálogo de EJEMPLO para la propuesta B.
// Precios, fotos y stock son ilustrativos: la marca debe completarlos (brief, sección 21).

window.HB = window.HB || {};

HB.config = {
  whatsapp: "584129869030",
  instagram: "https://www.instagram.com/hilitosbebe/",
  tiktok: "https://www.tiktok.com/@hilitosbebe",
  // Tasa de referencia del brief (15/10/2026: Bs 878–887). La versión final la toma del BCV cada día.
  tasa: 882.5,
  tasaFecha: "15/10/2026",
  direccion: "C.C. Galerías Los Naranjos, PB, Local 22 · Av. Principal de Los Naranjos, Caracas",
};

HB.icons = {
  vestido:
    '<path d="M24 10h16l2 8c6 6 10 22 12 36-14 4-30 4-44 0 2-14 6-30 12-36z"/><path d="M24 10c2 4 14 4 16 0"/><path d="M14 50c4 2 8 2 12 0 4 2 8 2 12 0 4 2 8 2 12 0"/>',
  manta:
    '<rect x="10" y="16" width="44" height="34" rx="4"/><path d="M10 26h44M10 40h44" stroke-dasharray="3 3"/><path d="M42 16v34"/>',
  cuna:
    '<path d="M10 14v40M54 14v40M10 24h44M10 46h44M18 24v22M26 24v22M34 24v22M42 24v22"/><path d="M14 24c0-6 8-8 18-8s18 2 18 8"/>',
  cojin:
    '<path d="M12 20c6-6 34-6 40 0 4 8 4 16 0 24-6 6-34 6-40 0-4-8-4-16 0-24z"/><path d="M26 30c2-3 6-3 6 1 0-4 4-4 6-1 1 3-6 7-6 7s-7-4-6-7z"/>',
  babero:
    '<path d="M22 12c0 6 4 9 10 9s10-3 10-9"/><path d="M22 12c-8 4-12 14-10 24 2 10 10 16 20 16s18-6 20-16c2-10-2-20-10-24"/><path d="M26 38c4 3 8 3 12 0" stroke-dasharray="2 3"/>',
  gorro:
    '<path d="M14 42c0-16 8-26 18-26s18 10 18 26z"/><path d="M12 42h40v8H12z"/><circle cx="32" cy="13" r="3"/>',
  estuche:
    '<rect x="12" y="20" width="40" height="30" rx="6"/><path d="M12 30h40"/><path d="M26 20v-4h12v4"/><circle cx="32" cy="38" r="3"/>',
  body:
    '<path d="M22 10h20l10 8-6 6-4-4v20l-6 10h-8l-6-10V20l-4 4-6-6z"/><path d="M26 10c2 4 10 4 12 0"/><path d="M28 50h8" stroke-dasharray="2 2"/>',
  zapatos:
    '<path d="M10 40c0-8 4-14 10-14h8c2 6 8 8 16 9 6 1 10 3 10 8v3H10z"/><path d="M18 26v-6"/>',
  regalo:
    '<rect x="12" y="26" width="40" height="26" rx="2"/><path d="M10 20h44v6H10zM32 20v32"/><path d="M32 20c-4-8-14-8-12-2s12 2 12 2c4-8 14-8 12-2s-12 2-12 2"/>',
  colgante:
    '<path d="M32 8v8M14 16h36"/><path d="M18 16v12M32 16v18M46 16v10"/><circle cx="18" cy="32" r="4"/><path d="M28 38l4-4 4 4-4 6z"/><circle cx="46" cy="30" r="4"/>',
  aro:
    '<circle cx="32" cy="32" r="20"/><circle cx="32" cy="32" r="16"/><path d="M50 22l6-4"/><path d="M25 32c2-4 5-4 7 0 2-4 5-4 7 0-2 5-7 8-7 8s-5-3-7-8z"/>',
  tienda:
    '<path d="M10 26h44v26H10z"/><path d="M8 26l6-14h36l6 14"/><path d="M26 52V38h12v14"/>',
  pijama:
    '<path d="M18 12h28l8 10-6 4-4-4v32H20V22l-4 4-6-4z"/><path d="M32 14v40" stroke-dasharray="2 3"/>',
};

HB.tones = {
  rosa: "#f2e5e5",
  arena: "#ece4da",
  salvia: "#e3ebe4",
  lino: "#f3eee8",
  cielo: "#e6ecf1",
  ocre: "#f2e9d8",
};

HB.categories = [
  { slug: "ajuar-de-nacimiento", name: "Ajuar de nacimiento", short: "Ajuar", icon: "body", tone: "rosa",
    line: "El conjunto de piezas que necesitas para su llegada y para la clínica.",
    guide: "Puedes armarlo por piezas o pedir el ajuar completo ya pensado para ti. Si es tu primer bebé, empieza por el armador: te sugerimos una base según tu fecha de parto." },
  { slug: "kit-de-clinica", name: "Kit de clínica", short: "Kit clínica", icon: "estuche", tone: "arena",
    line: "Todo empacado y listo para llevar a la clínica.",
    guide: "Un kit incluye estuches, manta, babero, gorro y manoplas. Elige el tono y el bordado; nosotras lo armamos y te lo entregamos listo." },
  { slug: "lenceria-de-cuna", name: "Lencería de cuna", short: "Cuna", icon: "cuna", tone: "salvia",
    line: "Protectores, sábanas, cojines y nidos que hacen que su cuna se sienta como un abrazo.",
    guide: "Si es tu primer bebé: elige el color base de la cuna y nosotras te proponemos la combinación. Indícanos la medida de la cuna (estándar, pequeña o moisés)." },
  { slug: "bautizo-y-primeras-puestas", name: "Bautizo y primeras puestas", short: "Bautizo", icon: "vestido", tone: "lino",
    line: "Faldones, faldellines y conjuntos de ceremonia en tela española." },
  { slug: "moda-infantil", name: "Moda infantil", short: "Moda", icon: "pijama", tone: "cielo",
    line: "Conjuntos, enterizos y piezas en hilo peruano y algodón pima." },
  { slug: "decoracion-y-regalos", name: "Decoración y regalos", short: "Regalos", icon: "regalo", tone: "ocre",
    line: "Cojines personalizados, colgantes de cuna y combos listos para regalar." },
  { slug: "personalizados", name: "Personalizados", short: "Personalizados", icon: "aro", tone: "rosa",
    line: "Bordado por pieza y diseños a medida, solo por cotización." },
];

HB.sizes = ["RN", "0 m", "3 m", "6 m", "9 m", "12 m", "18 m", "24 m"];

HB.colors = {
  neutro: { name: "Neutro", hex: "#efe7dc" },
  blanco: { name: "Blanco", hex: "#ffffff" },
  rosa: { name: "Rosa pastel", hex: "#f1d3d3" },
  azul: { name: "Azul bebé", hex: "#d4e2ee" },
  arena: { name: "Arena", hex: "#e2d3bf" },
  floral: { name: "Floral", hex: "linear-gradient(135deg,#f1d3d3 0 50%,#e3ebe4 50%)" },
};

HB.fabrics = {
  pima: { name: "Algodón pima", days: "5 a 7 días hábiles" },
  peruano: { name: "Hilo peruano", days: "7 a 10 días hábiles" },
  espanola: { name: "Tela española", days: "5 a 10 días hábiles" },
  doble: { name: "Doble algodón", days: "5 a 7 días hábiles" },
};

// Recargo por estilo de bordado (USD, ejemplo)
HB.embroidery = [
  { id: "ninguno", name: "Sin bordado", extra: 0 },
  { id: "iniciales", name: "Iniciales", extra: 5 },
  { id: "nombre", name: "Nombre completo", extra: 8 },
  { id: "floral", name: "Floral", extra: 12 },
  { id: "tematico", name: "Temático", extra: 15 },
];

const P = (o) => ({ sizes: [], colors: ["neutro"], personalizable: false, quote: false, stock: "stock", tags: [], ...o });

HB.products = [
  P({ slug: "faldon-amanda-de-bautizo", name: "Faldón Amanda de bautizo", cat: "bautizo-y-primeras-puestas", icon: "vestido", tone: "lino",
    short: "Conjunto de ceremonia en tela española, bordado con su nombre.", price: 85, from: true, fabric: "espanola",
    sizes: ["0 m", "3 m", "6 m", "9 m", "12 m"], colors: ["neutro", "rosa", "blanco", "floral"], personalizable: true, tags: ["mas-vendido"], sold: 98 }),
  P({ slug: "faldellin-clara", name: "Faldellín Clara", cat: "bautizo-y-primeras-puestas", icon: "vestido", tone: "rosa",
    short: "Faldellín corto con encaje y lazo de raso.", price: 64, from: true, fabric: "espanola",
    sizes: ["3 m", "6 m", "9 m", "12 m"], colors: ["blanco", "neutro"], personalizable: true, sold: 40, date: 9 }),
  P({ slug: "zapatitos-de-bautizo", name: "Zapatitos de bautizo", cat: "bautizo-y-primeras-puestas", icon: "zapatos", tone: "arena",
    short: "Zapatitos de tela con suela suave.", price: 22, fabric: "espanola", sizes: ["0 m", "3 m", "6 m"], colors: ["blanco", "neutro"], sold: 33 }),
  P({ slug: "kit-de-clinica-completo", name: "Kit de clínica completo", cat: "kit-de-clinica", icon: "estuche", tone: "arena",
    short: "Paños, manta, estuches, gorro y manoplas en un solo set.", price: 120, from: true, fabric: "pima",
    colors: ["neutro", "arena", "rosa"], personalizable: true, tags: ["mas-vendido", "regalo"], sold: 120,
    includes: ["Set de 3 estuches", "Manta de arrullo", "Babero y buchero", "Gorro y manoplas", "2 paños de algodón"] }),
  P({ slug: "set-de-estuches", name: "Set de estuches (3 tamaños)", cat: "kit-de-clinica", icon: "estuche", tone: "salvia",
    short: "Para organizar la maleta de la clínica.", price: 38, fabric: "doble", colors: ["neutro", "rosa", "azul"], personalizable: true, sold: 51 }),
  P({ slug: "manta-tejida-personalizada", name: "Manta tejida personalizada", cat: "kit-de-clinica", icon: "manta", tone: "rosa",
    short: "Manta tejida a mano con su nombre bordado.", price: 45, from: true, fabric: "peruano",
    colors: ["neutro", "rosa", "azul", "blanco"], personalizable: true, tags: ["mas-vendido"], sold: 87 }),
  P({ slug: "ajuar-de-nacimiento-7-piezas", name: "Ajuar de nacimiento 7 piezas", cat: "ajuar-de-nacimiento", icon: "body", tone: "rosa",
    short: "Todo lo esencial para sus primeras semanas.", price: 180, from: true, fabric: "pima",
    sizes: ["RN", "0 m", "3 m"], colors: ["neutro", "rosa", "azul"], personalizable: true, quote: true, stock: "encargo", tags: ["mas-vendido"], sold: 64,
    includes: ["3 bodies manga larga", "2 monitos", "Gorro y manoplas", "Cobija de arrullo"] }),
  P({ slug: "conjunto-primera-puesta", name: "Conjunto primera puesta", cat: "ajuar-de-nacimiento", icon: "body", tone: "cielo",
    short: "La pieza con la que sale de la clínica.", price: 55, from: true, fabric: "pima", sizes: ["RN", "0 m"],
    colors: ["blanco", "neutro", "azul", "rosa"], personalizable: true, tags: ["nuevo"], sold: 30, date: 2 }),
  P({ slug: "protector-de-cuna-bordado", name: "Protector de cuna bordado", cat: "lenceria-de-cuna", icon: "cuna", tone: "salvia",
    short: "Bumper acolchado con bordado a juego.", price: 95, from: true, fabric: "doble",
    colors: ["neutro", "rosa", "azul", "blanco"], personalizable: true, stock: "encargo", tags: ["mas-vendido"], sold: 77 }),
  P({ slug: "juego-de-sabanas", name: "Juego de sábanas de cuna", cat: "lenceria-de-cuna", icon: "manta", tone: "lino",
    short: "Sábana ajustable, sábana superior y funda.", price: 48, fabric: "pima", colors: ["neutro", "blanco", "rosa", "azul"], sold: 58 }),
  P({ slug: "cojin-de-lactancia", name: "Cojín de lactancia", cat: "lenceria-de-cuna", icon: "cojin", tone: "rosa",
    short: "Firme y lavable, con funda removible.", price: 42, fabric: "doble", colors: ["neutro", "rosa", "arena"], personalizable: true, tags: ["nuevo"], sold: 25, date: 4 }),
  P({ slug: "nido-para-bebe", name: "Nido para bebé", cat: "lenceria-de-cuna", icon: "cojin", tone: "arena",
    short: "Nido acolchado para sus primeras siestas.", price: 70, fabric: "doble", colors: ["neutro", "arena"], stock: "encargo", sold: 20 }),
  P({ slug: "conjunto-hilo-peruano", name: "Conjunto hilo peruano", cat: "moda-infantil", icon: "pijama", tone: "cielo",
    short: "Suéter y pantalón tejidos, suaves y frescos.", price: 39, fabric: "peruano",
    sizes: ["3 m", "6 m", "9 m", "12 m", "18 m", "24 m"], colors: ["neutro", "azul", "rosa"], tags: ["nuevo"], sold: 44, date: 1 }),
  P({ slug: "pijama-algodon-pima", name: "Pijama de algodón pima", cat: "moda-infantil", icon: "pijama", tone: "lino",
    short: "Enterizo con botones de presión.", price: 26, fabric: "pima", sizes: ["0 m", "3 m", "6 m", "9 m", "12 m"], colors: ["blanco", "azul", "rosa"], sold: 61 }),
  P({ slug: "cojin-personalizado-con-nombre", name: "Cojín personalizado con nombre", cat: "decoracion-y-regalos", icon: "cojin", tone: "ocre",
    short: "Cojín decorativo bordado para su habitación.", price: 30, from: true, fabric: "doble",
    colors: ["neutro", "rosa", "azul"], personalizable: true, tags: ["regalo"], sold: 49 }),
  P({ slug: "colgante-de-cuna", name: "Colgante de cuna", cat: "decoracion-y-regalos", icon: "colgante", tone: "salvia",
    short: "Móvil de tela hecho a mano.", price: 34, fabric: "doble", colors: ["neutro", "rosa", "azul"], tags: ["regalo"], sold: 18 }),
  P({ slug: "combo-regalo-bienvenida", name: "Combo regalo de bienvenida", cat: "decoracion-y-regalos", icon: "regalo", tone: "rosa",
    short: "Manta, babero y gorro en caja de regalo con dedicatoria.", price: 75, fabric: "pima",
    colors: ["neutro", "rosa", "azul"], personalizable: true, tags: ["regalo", "combo"], sold: 36,
    includes: ["Manta de arrullo", "Babero", "Gorro", "Caja de regalo y tarjeta"] }),
  P({ slug: "diseno-a-medida", name: "Diseño a medida", cat: "personalizados", icon: "aro", tone: "rosa",
    short: "Cuéntanos tu idea y la bordamos para tu bebé.", price: 0, fabric: "espanola", quote: true, stock: "encargo", sold: 5 }),
];

// Piezas del armador por tipo (brief 5.6)
HB.builder = {
  ajuar: {
    name: "Ajuar de nacimiento", desc: "Las piezas para su llegada y sus primeras semanas.",
    pieces: [
      { id: "bodies", name: "Bodies manga larga", note: "algodón pima", price: 12, icon: "body", req: true, qty: 3 },
      { id: "monitos", name: "Monitos", note: "con pie", price: 10, icon: "pijama", qty: 2 },
      { id: "primera", name: "Conjunto primera puesta", note: "para salir de la clínica", price: 55, icon: "body", req: true },
      { id: "gorro", name: "Gorro y manoplas", note: "tono a juego", price: 14, icon: "gorro" },
      { id: "arrullo", name: "Cobija de arrullo", note: "doble algodón", price: 28, icon: "manta" },
      { id: "manta", name: "Manta tejida personalizada", note: "con nombre bordado", price: 45, icon: "manta" },
      { id: "babero", name: "Babero y buchero", note: "algodón pima", price: 16, icon: "babero" },
    ],
  },
  clinica: {
    name: "Kit de clínica", desc: "Todo empacado para llevar a la clínica.",
    pieces: [
      { id: "estuches", name: "Set de estuches", note: "3 tamaños", price: 38, icon: "estuche", req: true },
      { id: "manta", name: "Manta tejida personalizada", note: "con nombre bordado", price: 45, icon: "manta" },
      { id: "babero", name: "Babero y buchero", note: "algodón pima", price: 16, icon: "babero" },
      { id: "gorro", name: "Gorro y manoplas", note: "tono neutro", price: 14, icon: "gorro" },
      { id: "arrullo", name: "Cobija de arrullo", note: "doble algodón", price: 28, icon: "manta" },
      { id: "primera", name: "Conjunto primera puesta", note: "para salir de la clínica", price: 55, icon: "body", req: true },
    ],
  },
  cuna: {
    name: "Juego de cuna", desc: "La lencería completa de su cuna.",
    pieces: [
      { id: "protector", name: "Protector de cuna", note: "acolchado", price: 95, icon: "cuna", req: true },
      { id: "sabanas", name: "Juego de sábanas", note: "3 piezas", price: 48, icon: "manta", req: true },
      { id: "almohada", name: "Almohada bordada", note: "con su nombre", price: 24, icon: "cojin" },
      { id: "cojin", name: "Cojín decorativo", note: "a juego", price: 30, icon: "cojin" },
      { id: "nido", name: "Nido", note: "para siestas", price: 70, icon: "cojin" },
      { id: "colgante", name: "Colgante de cuna", note: "móvil de tela", price: 34, icon: "colgante" },
    ],
  },
};

HB.byCat = (slug) => HB.categories.find((c) => c.slug === slug);
HB.bySlug = (slug) => HB.products.find((p) => p.slug === slug);
