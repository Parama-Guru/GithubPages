import type { RouteId } from "@/routes/routes";

/* Line art of the power domain for the 2D home, the page heroes and the menu (styles in styles/flat.css, drawing in app/flat.ts). Classes:
   d = stroke drawn in on entry (pathLength 1), t = thin bracing, k = terracotta accent stroke, f = terracotta fill,
   n = marigold node that lights after the drawing, c = marigold current that flows along a conductor once drawn. */

const r = (value: number) => Math.round(value * 10) / 10;
const stroke = (d: string, extra = "") => `<path class="d${extra ? ` ${extra}` : ""}" d="${d}" pathLength="1"/>`;
const current = (d: string) => `<path class="c" d="${d}"/>`;
const node = (x: number, y: number, radius = 3.2) => `<circle class="n" cx="${x}" cy="${y}" r="${radius}"/>`;
const lamp = (x: number, y: number, width: number, height: number) => `<rect class="n" x="${x}" y="${y}" width="${width}" height="${height}"/>`;

/** Zigzag bracing up a lattice column between x1 and x2. */
function column(x1: number, x2: number, top: number, bottom: number, step: number): string {
  let d = `M${x1} ${bottom}`;
  let left = false;
  for (let y = bottom - step; y >= top - 0.01; y -= step) {
    d += ` L${left ? x1 : x2} ${r(y)}`;
    left = !left;
  }
  return d;
}

/** Zigzag web along a horizontal girder between y1 (top chord) and y2 (bottom chord). */
function girder(y1: number, y2: number, left: number, right: number, step: number): string {
  let d = `M${left} ${y2}`;
  let top = true;
  for (let x = left + step; x <= right + 0.01; x += step) {
    d += ` L${r(x)} ${top ? y1 : y2}`;
    top = !top;
  }
  return d;
}

/** Insulator discs: short horizontal ticks down a string. */
function discs(x: number, top: number, bottom: number, gap = 5, half = 3.5): string {
  const ticks: string[] = [];
  for (let y = top + gap / 2; y < bottom; y += gap) ticks.push(`M${r(x - half)} ${r(y)} H${r(x + half)}`);
  return ticks.join(" ");
}

const svg = (name: string, box: string, body: string, className = "flat-art") =>
  `<svg class="${className}" data-art="${name}" viewBox="${box}" aria-hidden="true" focusable="false">${body}</svg>`;

/** The home hero: power arrives over a lattice tower, passes the substation gantry and transformer, and lights a factory. */
export function heroArt(): string {
  const body = [
    stroke("M0 440 H640"),
    stroke("M30 440 L58 230 L64 120 L70 72 L76 120 L82 230 L110 440"),
    stroke("M22 120 H118 M34 170 H106 M22 120 L64 104 M118 120 L76 104 M34 170 L61 157 M106 170 L79 157 M70 72 V58"),
    stroke("M30 440 L103 388 L44 335 L89 283 L58 230 M110 440 L37 388 L96 335 L51 283 L82 230 M37 388 H103 M44 335 H96 M51 283 H89 M58 230 H82 M58 230 L80 193 L60 156 L77 120 M82 230 L60 193 L80 156 L63 120", "t"),
    stroke(`M26 120 V142 M114 120 V142 M38 170 V192 M102 170 V192 ${discs(26, 122, 142)} ${discs(114, 122, 142)} ${discs(38, 172, 192)} ${discs(102, 172, 192)}`, "t"),
    stroke("M114 142 Q210 200 290 206 M102 192 Q200 242 290 226 M26 142 Q12 150 0 156 M38 192 Q18 202 0 208"),
    stroke("M290 440 V200 M304 440 V200 M446 440 V200 M460 440 V200 M290 200 H460 M290 214 H460 M297 200 V184 M453 200 V184"),
    stroke(`${column(290, 304, 214, 440, 16)} ${column(446, 460, 214, 440, 16)} ${girder(200, 214, 290, 460, 14)}`, "t"),
    stroke(`M304 238 H446 M330 214 V238 M375 214 V238 M420 214 V238 ${discs(330, 216, 236)} ${discs(375, 216, 236)} ${discs(420, 216, 236)}`),
    stroke(`M350 238 V292 M375 238 V292 M400 238 V292 M350 318 V340 M375 318 V340 M400 318 V340 ${discs(350, 292, 318, 4.4, 4.5)} ${discs(375, 292, 318, 4.4, 4.5)} ${discs(400, 292, 318, 4.4, 4.5)}`),
    stroke("M344 340 h12 v16 h-12 Z M369 340 h12 v16 h-12 Z M394 340 h12 v16 h-12 Z"),
    stroke(`M350 356 V384 M375 356 V384 M400 356 V384 ${discs(350, 358, 384, 5.2, 4.5)} ${discs(375, 358, 384, 5.2, 4.5)} ${discs(400, 358, 384, 5.2, 4.5)}`, "t"),
    stroke("M330 384 H420 V440 H330 Z M330 398 H420 M312 362 h30 a5.5 5.5 0 0 1 0 11 h-30 a5.5 5.5 0 0 1 0 -11 Z M327 373 V384"),
    stroke("M420 394 H452 M420 430 H452 M426 394 V430 M431 394 V430 M436 394 V430 M441 394 V430 M446 394 V430 M451 394 V430", "t"),
    stroke("M420 434 H500", "k"),
    stroke("M500 440 V360 L526 336 V360 L552 336 V360 L578 336 V360 L604 336 V360 L630 336 V440 M612 341 V296 H622 V332"),
    stroke("M604 440 V408 H620 V440 M500 372 H630", "t"),
    `<rect class="f" x="362" y="408" width="26" height="14"/>`,
    current("M114 142 Q210 200 290 206 L304 238 H375 V384"),
    current("M420 434 H500"),
    node(290, 206),
    node(375, 238),
    lamp(512, 384, 14, 16),
    lamp(536, 384, 14, 16),
    lamp(560, 384, 14, 16),
    lamp(584, 384, 14, 16),
  ].join("");
  return svg("hero", "0 0 640 480", body, "flat-art flat-art-hero");
}

const ground = stroke("M6 112 H154", "t");

const motifs = {
  gantry: [
    ground,
    stroke("M30 112 V30 M40 112 V30 M120 112 V30 M130 112 V30 M30 30 H130 M30 40 H130"),
    stroke(`${column(30, 40, 40, 112, 9)} ${column(120, 130, 40, 112, 9)} ${girder(30, 40, 30, 130, 10)}`, "t"),
    stroke(`M60 40 V56 M80 40 V56 M100 40 V56 M40 56 H120 ${discs(60, 41, 56, 4.5, 3)} ${discs(80, 41, 56, 4.5, 3)} ${discs(100, 41, 56, 4.5, 3)}`),
    stroke("M80 56 V84 M70 84 h20 v28 h-20 Z"),
    current("M2 22 Q16 26 30 35 L40 56 H80 V84"),
    node(80, 56),
  ],
  transformer: [
    ground,
    stroke("M44 60 H116 V108 H44 Z M44 72 H116"),
    stroke("M50 38 h26 a5 5 0 0 1 0 10 h-26 a5 5 0 0 1 0 -10 Z M63 48 V60"),
    stroke(`M90 60 V28 M106 60 V28 ${discs(90, 30, 58, 5, 4)} ${discs(106, 30, 58, 5, 4)}`, "t"),
    stroke("M116 66 H142 M116 102 H142 M121 66 V102 M126 66 V102 M131 66 V102 M136 66 V102 M141 66 V102", "t"),
    `<rect class="f" x="66" y="82" width="22" height="12"/>`,
    current("M90 4 V28 M106 4 V28"),
    node(90, 28, 2.6),
    node(106, 28, 2.6),
  ],
  tower: [
    ground,
    stroke("M56 112 L72 60 L76 34 L80 14 L84 34 L88 60 L104 112 M58 34 H102 M64 52 H96 M80 14 V8"),
    stroke("M56 112 L100 100 L60 87 L96 73 L68 62 M104 112 L60 100 L100 87 L64 73 L92 62 M72 60 L86 47 L76 34 M88 60 L74 47 L84 34", "t"),
    stroke(`M60 34 V44 M100 34 V44 M66 52 V62 M94 52 V62 ${discs(60, 35, 44, 3, 2.5)} ${discs(100, 35, 44, 3, 2.5)}`, "t"),
    stroke("M100 44 Q130 60 160 58 M60 44 Q30 60 0 58 M94 62 Q128 78 160 76 M66 62 Q32 78 0 76"),
    current("M0 58 Q30 60 60 44 M100 44 Q130 60 160 58"),
  ],
  sld: [
    stroke("M14 30 H146", "k"),
    stroke("M80 6 V30 M40 30 V46 M34 46 h12 v12 h-12 Z M40 58 V72 L49 82 M40 86 V108 M35 102 L40 108 L45 102"),
    stroke("M120 30 V46 M114 46 h12 v12 h-12 Z M120 58 V72 L129 82 M120 86 V108 M115 102 L120 108 L125 102"),
    `<circle class="d" cx="80" cy="56" r="9" pathLength="1"/><circle class="d" cx="80" cy="70" r="9" pathLength="1"/>`,
    stroke("M80 30 V47 M80 79 V108 M75 102 L80 108 L85 102"),
    current("M80 4 V30 H40 V46 M80 30 V47 M80 79 V106"),
    node(40, 30),
    node(80, 30),
    node(120, 30),
  ],
  factory: [
    ground,
    stroke("M14 112 V66 L36 48 V66 L58 48 V66 L80 48 V66 L102 48 V66 L118 52 V112 M14 76 H118"),
    stroke("M124 112 V30 H134 V112 M100 112 V94 H112 V112", "t"),
    stroke("M152 112 V28 M144 32 H158", "t"),
    stroke("M148 32 Q134 40 118 56"),
    current("M160 32 H148 Q134 40 118 56"),
    lamp(22, 84, 10, 12),
    lamp(40, 84, 10, 12),
    lamp(58, 84, 10, 12),
    lamp(76, 84, 10, 12),
  ],
  shield: [
    stroke("M80 10 L124 24 V58 C124 86 104 102 80 112 C56 102 36 86 36 58 V24 Z"),
    stroke("M80 21 L114 32 V58 C114 80 98 94 80 102", "t"),
    stroke("M60 60 L74 74 L102 44", "k"),
    node(124, 24, 2.6),
    node(36, 24, 2.6),
  ],
  gauge: [
    stroke("M16 104 H144", "t"),
    stroke("M24 92 A56 56 0 0 1 136 92"),
    stroke(
      Array.from({ length: 11 }, (_, index) => {
        const angle = Math.PI + (index * Math.PI) / 10;
        return `M${r(80 + 48 * Math.cos(angle))} ${r(92 + 48 * Math.sin(angle))} L${r(80 + 56 * Math.cos(angle))} ${r(92 + 56 * Math.sin(angle))}`;
      }).join(" "),
      "t",
    ),
    `<g class="needle"><path class="d k" d="M80 92 L112 58" pathLength="1"/></g>`,
    `<circle class="d" cx="80" cy="92" r="5" pathLength="1"/>`,
    current("M36 92 A44 44 0 0 1 124 92"),
  ],
  org: [
    stroke("M60 8 h40 v18 h-40 Z"),
    stroke("M80 26 V38 M30 38 H130 M30 38 V50 M80 38 V50 M130 38 V50 M30 66 V78 M80 66 V78 M130 66 V78", "t"),
    stroke("M12 50 h36 v16 h-36 Z M62 50 h36 v16 h-36 Z M112 50 h36 v16 h-36 Z"),
    stroke("M16 78 h28 v14 h-28 Z M66 78 h28 v14 h-28 Z M116 78 h28 v14 h-28 Z", "t"),
    current("M80 26 V38 H30 V50 M80 38 V50 M80 38 H130 V50"),
    node(80, 38),
  ],
  doc: [
    stroke("M44 8 H96 L116 28 V112 H44 Z M96 8 V28 H116"),
    stroke("M56 44 H104 M56 56 H104 M56 68 H92", "t"),
    stroke("M80 78 V102 M70 92 L80 102 L90 92", "k"),
    current("M80 74 V100"),
  ],
  breaker: [
    stroke("M10 70 H54 M110 70 H150"),
    `<circle class="d" cx="58" cy="70" r="4" pathLength="1"/><circle class="d" cx="106" cy="70" r="4" pathLength="1"/>`,
    stroke("M61 67 L98 40", "k"),
    stroke("M18 70 V92 M10 92 H26 M13 97 H23 M16 102 H20", "t"),
    current("M10 70 H54"),
  ],
} satisfies Record<string, string[]>;

type Motif = keyof typeof motifs;

/** A small drawing for contexts other than page heroes (2D home chapters, the menu). */
export function motif(name: Motif, className = "flat-art"): string {
  return svg(name, "0 0 160 120", motifs[name].join(""), className);
}

const heroMotifs: Partial<Record<RouteId, Motif>> = {
  about: "gantry",
  features: "gauge",
  execution: "sld",
  projects: "transformer",
  clients: "factory",
  "quality-safety": "shield",
  leadership: "org",
  organisation: "org",
  downloads: "doc",
  contact: "tower",
  "not-found": "breaker",
};

/** The drawing beside a page's title (every page but home, in both modes). */
export function heroMotif(id: RouteId): string {
  const name = heroMotifs[id] ?? (id.startsWith("projects-") ? "transformer" : null);
  return name ? `<div class="flat-motif">${motif(name, "flat-art flat-art-motif")}</div>` : "";
}
