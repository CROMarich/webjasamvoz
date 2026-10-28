// Generira SVG ilustraciju za svaki članak (images/<slug>.svg).
// Motiv se bira prema ključnim riječima u slugu, a kompozicija i nijanse prema hashu sluga,
// pa dvije slike nisu iste ni kad dijele motiv.

const W = 800, H = 450;
const D = '#0f172a';   // tamni obrisi
const L = '#ffffff';
const A = '#fbbf24';   // naglasak
const R = '#ef4444';
const G = '#22c55e';

const hash = s => [...s].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) >>> 0, 7);
const rnd = seed => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt))));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}

// ---------- motivi (središte otprilike 400,250) ----------

const car = (x = 400, y = 300, s = 1, body = L, win = '#bfdbfe') => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-190 10 Q-190 -30 -150 -38 L-95 -48 L-50 -100 Q-35 -115 -10 -115 L80 -115 Q105 -115 120 -98 L165 -45 Q200 -40 205 -5 L205 20 Q205 32 192 32 L-178 32 Q-190 32 -190 20 Z" fill="${body}" stroke="${D}" stroke-width="6" stroke-linejoin="round"/>
  <path d="M-75 -48 L-38 -95 Q-30 -103 -18 -103 L30 -103 L30 -48 Z" fill="${win}" stroke="${D}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M45 -48 L45 -103 L78 -103 Q95 -103 105 -92 L145 -48 Z" fill="${win}" stroke="${D}" stroke-width="5" stroke-linejoin="round"/>
  <rect x="180" y="-22" width="22" height="12" rx="4" fill="${A}" stroke="${D}" stroke-width="3"/>
  <rect x="-188" y="-20" width="14" height="12" rx="3" fill="${R}" stroke="${D}" stroke-width="3"/>
  ${wheel(-110, 32)}${wheel(120, 32)}
</g>`;
const wheel = (x, y, r = 38) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${D}"/><circle cx="${x}" cy="${y}" r="${r * .5}" fill="#cbd5e1" stroke="${D}" stroke-width="4"/><circle cx="${x}" cy="${y}" r="${r * .14}" fill="${D}"/>`;

const charger = (x = 560, y = 250) => `<g transform="translate(${x} ${y})">
  <rect x="-55" y="-150" width="110" height="250" rx="18" fill="${L}" stroke="${D}" stroke-width="6"/>
  <rect x="-35" y="-125" width="70" height="55" rx="8" fill="#a7f3d0" stroke="${D}" stroke-width="4"/>
  <path d="M-4 -118 L-16 -96 L0 -96 L-8 -76 L14 -102 L0 -102 L8 -118 Z" fill="${D}"/>
  <circle cx="0" cy="-30" r="20" fill="${D}"/><circle cx="-7" cy="-34" r="4" fill="${L}"/><circle cx="7" cy="-34" r="4" fill="${L}"/><circle cx="0" cy="-22" r="4" fill="${L}"/>
  <rect x="-70" y="100" width="140" height="18" rx="6" fill="${D}"/>
  <path d="M-55 -20 C-130 -20 -150 60 -220 60" fill="none" stroke="${D}" stroke-width="12" stroke-linecap="round"/>
</g>`;

const plug = (x = 400, y = 230, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-150 120 C-150 40 -60 60 -60 0" fill="none" stroke="${D}" stroke-width="16" stroke-linecap="round"/>
  <rect x="-95" y="-110" width="70" height="110" rx="16" fill="${L}" stroke="${D}" stroke-width="6"/>
  <circle cx="-60" cy="-120" r="48" fill="${L}" stroke="${D}" stroke-width="6"/>
  <circle cx="-78" cy="-128" r="9" fill="${D}"/><circle cx="-42" cy="-128" r="9" fill="${D}"/><circle cx="-60" cy="-102" r="9" fill="${D}"/>
  <path d="M70 -150 L20 -40 L70 -40 L40 60 L130 -70 L80 -70 L110 -150 Z" fill="${A}" stroke="${D}" stroke-width="6" stroke-linejoin="round"/>
</g>`;

const battery = (x = 400, y = 240, lvl = .7) => `<g transform="translate(${x} ${y})">
  <rect x="-170" y="-90" width="320" height="180" rx="24" fill="${L}" stroke="${D}" stroke-width="8"/>
  <rect x="150" y="-35" width="30" height="70" rx="8" fill="${D}"/>
  <rect x="-148" y="-68" width="${276 * lvl}" height="136" rx="12" fill="${G}"/>
  <path d="M-10 -60 L-45 10 L-5 10 L-25 65 L40 -15 L0 -15 L20 -60 Z" fill="${L}" stroke="${D}" stroke-width="5" stroke-linejoin="round"/>
</g>`;

const tire = (x = 330, y = 250) => `<g transform="translate(${x} ${y})">
  <circle r="150" fill="${D}"/>
  ${Array.from({ length: 24 }, (_, i) => `<rect x="-8" y="-150" width="16" height="22" rx="3" fill="#334155" transform="rotate(${i * 15})"/>`).join('')}
  <circle r="88" fill="#cbd5e1" stroke="${D}" stroke-width="6"/>
  ${Array.from({ length: 5 }, (_, i) => `<rect x="-11" y="-80" width="22" height="58" rx="8" fill="#94a3b8" transform="rotate(${i * 72})"/>`).join('')}
  <circle r="24" fill="${D}"/>
</g>`;
const gauge = (x = 560, y = 210, ang = 40) => `<g transform="translate(${x} ${y})">
  <circle r="80" fill="${L}" stroke="${D}" stroke-width="7"/>
  ${Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="-66" x2="0" y2="-52" stroke="${D}" stroke-width="4" transform="rotate(${-120 + i * 30})"/>`).join('')}
  <path d="M30 -60 A66 66 0 0 1 66 0" fill="none" stroke="${R}" stroke-width="8"/>
  <line x1="0" y1="0" x2="0" y2="-55" stroke="${R}" stroke-width="6" stroke-linecap="round" transform="rotate(${ang})"/>
  <circle r="10" fill="${D}"/>
  <path d="M-15 80 L-15 120 Q-15 140 -40 145" fill="none" stroke="${D}" stroke-width="12" stroke-linecap="round"/>
</g>`;

const trafficLight = (x = 400, y = 220, on = 'g', arrow = false) => `<g transform="translate(${x} ${y})">
  <rect x="-10" y="150" width="20" height="120" fill="${D}"/>
  <rect x="-60" y="-170" width="120" height="330" rx="24" fill="${D}"/>
  ${[['r', -110, R], ['y', -5, A], ['g', 100, G]].map(([k, cy, c]) => `<circle cx="0" cy="${cy}" r="38" fill="${on === k ? c : '#334155'}"/>`).join('')}
  ${arrow ? `<g transform="translate(110 100)"><rect x="-45" y="-45" width="90" height="90" rx="16" fill="${D}"/><circle r="34" fill="#334155"/><path d="M-20 0 L14 0 M2 -14 L18 0 L2 14" fill="none" stroke="${G}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></g>` : ''}
</g>`;

const roundabout = (x = 400, y = 225) => `<g transform="translate(${x} ${y})">
  <rect x="-60" y="-260" width="120" height="520" fill="#475569"/><rect x="-420" y="-60" width="840" height="120" fill="#475569"/>
  <circle r="170" fill="#475569"/><circle r="75" fill="#86efac" stroke="${L}" stroke-width="8"/>
  <circle r="122" fill="none" stroke="${L}" stroke-width="5" stroke-dasharray="18 16"/>
  <path d="M-90 -95 A130 130 0 0 1 95 -90" fill="none" stroke="${A}" stroke-width="10" stroke-linecap="round" marker-end="url(#ar)"/>
  ${miniCar(110, 90, 40)}${miniCar(-150, 20, -80)}
</g>`;
const miniCar = (x, y, rot, c = L) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-22" y="-38" width="44" height="76" rx="12" fill="${c}" stroke="${D}" stroke-width="4"/><rect x="-16" y="-24" width="32" height="18" rx="4" fill="#bfdbfe"/></g>`;

const steering = (x = 400, y = 235, r = 150) => `<g transform="translate(${x} ${y})">
  <circle r="${r}" fill="none" stroke="${D}" stroke-width="34"/>
  <circle r="${r}" fill="none" stroke="#334155" stroke-width="10" stroke-dasharray="4 26"/>
  <circle r="48" fill="${D}"/><path d="M-${r} 0 L-48 10 M48 10 L${r} 0 M-14 48 L-24 ${r} M14 48 L24 ${r}" stroke="${D}" stroke-width="30" stroke-linecap="round"/>
  <circle r="18" fill="${A}"/>
  <path d="M-${r + 10} -40 q-10 -40 20 -60 M${r + 10} -40 q10 -40 -20 -60" fill="none" stroke="#fcd9b6" stroke-width="34" stroke-linecap="round"/>
</g>`;

const docs = (x = 400, y = 230, stamp = true) => `<g transform="translate(${x} ${y})">
  <rect x="-130" y="-150" width="230" height="300" rx="10" fill="#e2e8f0" stroke="${D}" stroke-width="6" transform="rotate(-8)"/>
  <rect x="-100" y="-160" width="230" height="300" rx="10" fill="${L}" stroke="${D}" stroke-width="6"/>
  <rect x="-70" y="-125" width="120" height="16" rx="6" fill="${D}"/>
  ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="-70" y="${-85 + i * 30}" width="${i % 2 ? 130 : 170}" height="10" rx="5" fill="#94a3b8"/>`).join('')}
  ${stamp ? `<g transform="translate(80 95) rotate(-18)"><circle r="52" fill="none" stroke="${R}" stroke-width="8"/><circle r="38" fill="none" stroke="${R}" stroke-width="3"/><path d="M-22 0 L-5 16 L24 -16" fill="none" stroke="${R}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></g>` : ''}
</g>`;
const pen = (x = 590, y = 260) => `<g transform="translate(${x} ${y}) rotate(35)"><rect x="-14" y="-140" width="28" height="200" rx="10" fill="${A}" stroke="${D}" stroke-width="5"/><path d="M-14 60 L0 100 L14 60 Z" fill="${L}" stroke="${D}" stroke-width="5" stroke-linejoin="round"/></g>`;
const euro = (x = 600, y = 300, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="0" cy="40" rx="80" ry="24" fill="#b45309" stroke="${D}" stroke-width="5"/><ellipse cx="0" cy="20" rx="80" ry="24" fill="${A}" stroke="${D}" stroke-width="5"/>
  <ellipse cx="0" cy="0" rx="80" ry="24" fill="#b45309" stroke="${D}" stroke-width="5"/><ellipse cx="0" cy="-20" rx="80" ry="24" fill="${A}" stroke="${D}" stroke-width="5"/>
  <circle cx="20" cy="-110" r="70" fill="${A}" stroke="${D}" stroke-width="6"/>
  <path d="M48 -140 A38 38 0 1 0 48 -80 M-12 -118 L36 -118 M-12 -102 L36 -102" fill="none" stroke="${D}" stroke-width="9" stroke-linecap="round"/>
</g>`;
const plate = (x = 400, y = 120, txt = 'ZG 1234-AB', c = L) => `<g transform="translate(${x} ${y})"><rect x="-170" y="-38" width="340" height="76" rx="10" fill="${c}" stroke="${D}" stroke-width="6"/><rect x="-170" y="-38" width="44" height="76" rx="8" fill="#1d4ed8"/><text x="22" y="16" font-family="Arial, sans-serif" font-weight="700" font-size="40" text-anchor="middle" fill="${D}">${txt}</text></g>`;

const lSign = (x = 600, y = 140) => `<g transform="translate(${x} ${y})"><rect x="-55" y="-55" width="110" height="110" rx="10" fill="${L}" stroke="${D}" stroke-width="6"/><text y="35" font-family="Arial, sans-serif" font-weight="900" font-size="96" text-anchor="middle" fill="#1d4ed8">L</text></g>`;
const checklist = (x = 400, y = 230) => `<g transform="translate(${x} ${y})">
  <rect x="-140" y="-170" width="280" height="340" rx="16" fill="${L}" stroke="${D}" stroke-width="6"/>
  <rect x="-50" y="-188" width="100" height="40" rx="10" fill="${D}"/>
  ${[0, 1, 2, 3].map(i => `<rect x="-105" y="${-115 + i * 68}" width="40" height="40" rx="8" fill="none" stroke="${D}" stroke-width="5"/>${i < 3 ? `<path d="M-98 ${-95 + i * 68} L-87 ${-83 + i * 68} L-68 ${-108 + i * 68}" fill="none" stroke="${G}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>` : ''}<rect x="-45" y="${-102 + i * 68}" width="${130 - i * 12}" height="14" rx="7" fill="#94a3b8"/>`).join('')}
</g>`;
const cones = (x, y, n = 4, gap = 90) => Array.from({ length: n }, (_, i) => `<g transform="translate(${x + i * gap} ${y})"><path d="M-22 0 L-8 -60 L8 -60 L22 0 Z" fill="#f97316" stroke="${D}" stroke-width="4" stroke-linejoin="round"/><rect x="-14" y="-38" width="28" height="9" fill="${L}"/><rect x="-30" y="0" width="60" height="10" rx="3" fill="${D}"/></g>`).join('');
const parkingSign = (x = 640, y = 150) => `<g transform="translate(${x} ${y})"><rect x="-8" y="50" width="16" height="200" fill="${D}"/><rect x="-60" y="-60" width="120" height="120" rx="14" fill="#1d4ed8" stroke="${L}" stroke-width="8"/><text y="38" font-family="Arial, sans-serif" font-weight="900" font-size="100" text-anchor="middle" fill="${L}">P</text></g>`;
const topCarPark = (x = 330, y = 240) => `<g transform="translate(${x} ${y})"><rect x="-260" y="-150" width="420" height="300" fill="#475569"/>
  ${[-180, -60, 60].map(px => `<line x1="${px}" y1="-150" x2="${px}" y2="20" stroke="${L}" stroke-width="7"/>`).join('')}<line x1="160" y1="-150" x2="160" y2="20" stroke="${L}" stroke-width="7"/>
  ${miniCar(-120, -65, 0, '#93c5fd')}${miniCar(100, -65, 0, '#fca5a5')}
  <g transform="translate(0 70) rotate(-35) scale(1.25)">${miniCar(0, 0, 0, A)}</g>
  <path d="M60 110 Q20 60 10 -10" fill="none" stroke="${L}" stroke-width="5" stroke-dasharray="12 10"/></g>`;
const uturn = (x = 400, y = 240) => `<g transform="translate(${x} ${y})"><rect x="-120" y="-200" width="240" height="420" fill="#475569"/><line x1="0" y1="-200" x2="0" y2="220" stroke="${L}" stroke-width="6" stroke-dasharray="26 22"/>
  <path d="M60 170 L60 -40 A60 60 0 0 0 -60 -40 L-60 120" fill="none" stroke="${A}" stroke-width="18" stroke-linecap="round"/><path d="M-90 100 L-60 150 L-30 100" fill="none" stroke="${A}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></g>`;
const intersection = (x = 400, y = 225, turn = 'left') => `<g transform="translate(${x} ${y})"><rect x="-90" y="-260" width="180" height="520" fill="#475569"/><rect x="-420" y="-80" width="840" height="160" fill="#475569"/>
  <line x1="0" y1="-260" x2="0" y2="-90" stroke="${L}" stroke-width="5" stroke-dasharray="22 18"/><line x1="0" y1="90" x2="0" y2="260" stroke="${L}" stroke-width="5" stroke-dasharray="22 18"/>
  <line x1="-420" y1="0" x2="-100" y2="0" stroke="${L}" stroke-width="5" stroke-dasharray="22 18"/><line x1="100" y1="0" x2="420" y2="0" stroke="${L}" stroke-width="5" stroke-dasharray="22 18"/>
  ${turn === 'left' ? `<path d="M45 200 L45 40 Q45 -40 -60 -40 L-200 -40" fill="none" stroke="${A}" stroke-width="16" stroke-linecap="round"/><path d="M-170 -70 L-215 -40 L-170 -10" fill="none" stroke="${A}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
  ${miniCar(45, 160, 0, A)}${miniCar(-45, -170, 180)}${miniCar(220, 40, -90, '#93c5fd')}</g>`;
const priorityRight = (x = 400, y = 225) => intersection(x, y, 'none') + `<g transform="translate(${x} ${y})"><path d="M40 160 L40 100" stroke="${R}" stroke-width="0"/><path d="M150 45 L95 45" stroke="${G}" stroke-width="16" stroke-linecap="round"/><path d="M115 20 L85 45 L115 70" fill="none" stroke="${G}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><circle cx="45" cy="80" r="26" fill="${R}" stroke="${L}" stroke-width="5"/><rect x="33" y="74" width="24" height="12" fill="${L}"/></g>`;

const engine = (x = 400, y = 240, light = true) => `<g transform="translate(${x} ${y})">
  <path d="M-170 -60 L-110 -60 L-110 -95 L-20 -95 L-20 -60 L70 -60 L110 -100 L160 -100 L160 80 L110 80 L80 110 L-110 110 L-110 60 L-170 60 Z" fill="${light ? A : L}" stroke="${D}" stroke-width="8" stroke-linejoin="round"/>
  <rect x="-215" y="-25" width="45" height="50" rx="6" fill="${light ? A : L}" stroke="${D}" stroke-width="8"/>
  <rect x="-90" y="-35" width="160" height="110" rx="10" fill="${D}" opacity=".85"/>
  ${light ? `<text x="-10" y="45" font-family="Arial, sans-serif" font-weight="900" font-size="80" text-anchor="middle" fill="${A}">!</text>` : ''}
</g>`;
const dash = (x = 400, y = 240, icons = true) => `<g transform="translate(${x} ${y})">
  <rect x="-330" y="-140" width="660" height="280" rx="60" fill="${D}"/>
  ${[-160, 160].map(cx => `<circle cx="${cx}" cy="0" r="110" fill="#1e293b" stroke="#475569" stroke-width="6"/>${Array.from({ length: 11 }, (_, i) => `<line x1="${cx}" y1="-92" x2="${cx}" y2="-76" stroke="${L}" stroke-width="4" transform="rotate(${-125 + i * 25} ${cx} 0)"/>`).join('')}<line x1="${cx}" y1="0" x2="${cx}" y2="-80" stroke="#f97316" stroke-width="6" stroke-linecap="round" transform="rotate(${cx < 0 ? -30 : 50} ${cx} 0)"/><circle cx="${cx}" cy="0" r="12" fill="${L}"/>`).join('')}
  ${icons ? `<circle cx="0" cy="-60" r="18" fill="${R}"/><rect x="-22" y="-10" width="44" height="26" rx="5" fill="${A}"/><circle cx="0" cy="60" r="18" fill="${G}"/>` : ''}
</g>`;
const speedo = (x = 400, y = 270) => `<g transform="translate(${x} ${y})"><path d="M-220 0 A220 220 0 0 1 220 0" fill="#1e293b" stroke="${D}" stroke-width="14"/>
  ${Array.from({ length: 13 }, (_, i) => `<line x1="0" y1="-200" x2="0" y2="${i % 2 ? -182 : -170}" stroke="${L}" stroke-width="${i % 2 ? 4 : 7}" transform="rotate(${-90 + i * 15})"/>`).join('')}
  <path d="M150 -150 A212 212 0 0 1 212 0" fill="none" stroke="${R}" stroke-width="12"/>
  <line x1="0" y1="0" x2="0" y2="-175" stroke="#f97316" stroke-width="10" stroke-linecap="round" transform="rotate(48)"/><circle r="26" fill="${L}" stroke="${D}" stroke-width="6"/>
  <rect x="-250" y="0" width="500" height="20" fill="${D}"/></g>`;

const oilCan = (x = 400, y = 260) => `<g transform="translate(${x} ${y})">
  <path d="M-150 -40 L60 -40 L170 -110 L190 -95 L100 20 L100 90 L-150 90 Z" fill="${A}" stroke="${D}" stroke-width="8" stroke-linejoin="round"/>
  <rect x="-110" y="-80" width="70" height="40" rx="6" fill="${D}"/><path d="M-150 -10 L-200 -40 L-200 40 L-150 30" fill="none" stroke="${D}" stroke-width="12" stroke-linejoin="round"/>
  <path d="M210 -60 Q225 -20 210 0 Q195 -20 210 -60 Z" fill="${D}"/><rect x="-110" y="10" width="160" height="50" rx="6" fill="${L}" opacity=".7"/></g>`;
const exhaust = (x = 300, y = 300, smoke = '#94a3b8') => `<g transform="translate(${x} ${y})">
  <rect x="-40" y="-26" width="220" height="52" rx="26" fill="#64748b" stroke="${D}" stroke-width="7"/><ellipse cx="-40" cy="0" rx="14" ry="26" fill="${D}"/>
  ${[[-110, -40, 55], [-190, -100, 70], [-250, -175, 80], [-170, -200, 50]].map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${smoke}" opacity=".85"/>`).join('')}</g>`;
const filter = (x = 400, y = 240) => `<g transform="translate(${x} ${y})">
  <rect x="-230" y="-30" width="70" height="60" fill="#64748b" stroke="${D}" stroke-width="6"/><rect x="160" y="-30" width="70" height="60" fill="#64748b" stroke="${D}" stroke-width="6"/>
  <rect x="-170" y="-100" width="340" height="200" rx="90" fill="#cbd5e1" stroke="${D}" stroke-width="8"/>
  <rect x="-110" y="-80" width="220" height="160" rx="10" fill="${L}" stroke="${D}" stroke-width="5"/>
  ${Array.from({ length: 7 }, (_, i) => Array.from({ length: 5 }, (_, j) => `<rect x="${-95 + i * 30}" y="${-65 + j * 28}" width="20" height="18" fill="${(i + j) % 2 ? D : '#475569'}"/>`).join('')).join('')}</g>`;
const sensor = (x = 400, y = 240) => `<g transform="translate(${x} ${y})">
  <rect x="-140" y="-80" width="200" height="160" rx="20" fill="${D}"/><rect x="60" y="-40" width="90" height="80" rx="8" fill="#475569" stroke="${D}" stroke-width="6"/>
  <rect x="-100" y="-45" width="120" height="90" rx="10" fill="#1e293b"/><path d="M-90 10 L-60 10 L-45 -25 L-25 35 L-5 0 L15 0" fill="none" stroke="${G}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M-140 0 C-220 0 -220 120 -300 120" fill="none" stroke="${A}" stroke-width="12" stroke-linecap="round"/><path d="M-140 30 C-200 30 -210 150 -290 150" fill="none" stroke="${R}" stroke-width="12" stroke-linecap="round"/></g>`;
const windshield = (x = 400, y = 235) => `<g transform="translate(${x} ${y})">
  <path d="M-300 120 Q-270 -140 0 -150 Q270 -140 300 120 Z" fill="#bfdbfe" stroke="${D}" stroke-width="12" stroke-linejoin="round"/>
  <path d="M60 -40 L20 -80 M60 -40 L110 -95 M60 -40 L130 -20 M60 -40 L80 40 M60 -40 L0 0 M20 -80 L-10 -95 M130 -20 L170 -40" stroke="${L}" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="-40" r="10" fill="${L}"/>
  <path d="M-200 110 L-40 -40 M200 110 L60 -30" stroke="${D}" stroke-width="9" stroke-linecap="round" opacity=".7"/></g>`;
const scratch = (x = 400, y = 230) => `<g transform="translate(${x} ${y})">
  <path d="M-330 -120 Q0 -170 330 -120 L330 160 L-330 160 Z" fill="${L}" stroke="${D}" stroke-width="8"/>
  <path d="M-330 -60 Q0 -100 330 -60" fill="none" stroke="#cbd5e1" stroke-width="6"/>
  <path d="M-180 40 L120 -10 M-150 70 L160 20 M-100 90 L60 65" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
  <g transform="translate(200 90) rotate(-20)"><rect x="-70" y="-40" width="140" height="80" rx="28" fill="${A}" stroke="${D}" stroke-width="6"/><path d="M-45 -10 Q0 -25 45 -10" stroke="${L}" stroke-width="6" fill="none"/></g></g>`;
const vin = (x = 400, y = 230) => `<g transform="translate(${x} ${y})"><rect x="-300" y="-80" width="600" height="160" rx="16" fill="#e2e8f0" stroke="${D}" stroke-width="8"/>
  <circle cx="-270" cy="-50" r="9" fill="${D}"/><circle cx="270" cy="-50" r="9" fill="${D}"/><circle cx="-270" cy="50" r="9" fill="${D}"/><circle cx="270" cy="50" r="9" fill="${D}"/>
  <text x="0" y="-15" font-family="Courier New, monospace" font-size="22" text-anchor="middle" fill="#475569" font-weight="700">VIN</text>
  <text x="0" y="35" font-family="Courier New, monospace" font-size="48" text-anchor="middle" fill="${D}" font-weight="700" letter-spacing="3">WVWZZZ1KZ8W</text></g>`;
const shield = (x = 400, y = 230, mark = 'check') => `<g transform="translate(${x} ${y})"><path d="M0 -170 L150 -110 L150 10 Q150 120 0 180 Q-150 120 -150 10 L-150 -110 Z" fill="${L}" stroke="${D}" stroke-width="9" stroke-linejoin="round"/>
  <path d="M0 -130 L115 -85 L115 10 Q115 95 0 140 Z" fill="#e2e8f0"/>
  ${mark === 'check' ? `<path d="M-60 0 L-15 45 L70 -50" fill="none" stroke="${G}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>` : `<rect x="-45" y="-15" width="90" height="75" rx="10" fill="${D}"/><path d="M-28 -15 L-28 -45 A28 28 0 0 1 28 -45 L28 -15" fill="none" stroke="${D}" stroke-width="14"/><circle cy="20" r="11" fill="${A}"/>`}</g>`;
const key = (x = 400, y = 240) => `<g transform="translate(${x} ${y}) rotate(-25)"><rect x="-150" y="-70" width="120" height="140" rx="40" fill="${D}"/><circle cx="-90" cy="-25" r="14" fill="${R}"/><circle cx="-90" cy="25" r="14" fill="${G}"/>
  <rect x="-30" y="-16" width="230" height="32" rx="6" fill="#cbd5e1" stroke="${D}" stroke-width="5"/><path d="M130 16 L130 40 L155 40 L155 16 M175 16 L175 32" stroke="${D}" stroke-width="10"/><circle cx="-170" cy="0" r="30" fill="none" stroke="#94a3b8" stroke-width="10"/></g>`;

const bike = (x = 400, y = 270, s = 1, e = false) => `<g transform="translate(${x} ${y}) scale(${s})">
  <circle cx="-150" cy="40" r="95" fill="none" stroke="${D}" stroke-width="14"/><circle cx="150" cy="40" r="95" fill="none" stroke="${D}" stroke-width="14"/>
  <circle cx="-150" cy="40" r="10" fill="${D}"/><circle cx="150" cy="40" r="10" fill="${D}"/>
  <path d="M-150 40 L-50 -70 L100 -70 L150 40 M-50 -70 L10 40 L100 -70 M10 40 L-150 40" fill="none" stroke="${L}" stroke-width="14" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M-50 -70 L-70 -110 M-100 -115 L-35 -115 M100 -70 L85 -130 L120 -140" fill="none" stroke="${D}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="10" cy="40" r="22" fill="${D}"/>
  ${e ? `<rect x="-35" y="-62" width="90" height="34" rx="10" fill="${G}" stroke="${D}" stroke-width="5" transform="rotate(-50 10 -45)"/>` : ''}</g>`;
const helmet = (x = 400, y = 260, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-190 40 Q-190 -170 10 -170 Q190 -170 200 20 L200 50 Q90 30 -40 60 L-190 60 Z" fill="${L}" stroke="${D}" stroke-width="9" stroke-linejoin="round"/>
  <path d="M-110 -120 Q-40 -150 40 -150 M-140 -60 Q-40 -110 80 -110 M-150 0 Q-40 -60 120 -60" fill="none" stroke="${D}" stroke-width="22" stroke-linecap="round"/>
  <path d="M-170 60 L-120 130 L60 120" fill="none" stroke="${D}" stroke-width="10"/><rect x="150" y="-10" width="40" height="22" rx="6" fill="${R}"/></g>`;
const bikeLight = (x = 400, y = 240) => `<g transform="translate(${x} ${y})"><path d="M40 -60 L330 -170 L330 170 L40 60 Z" fill="${A}" opacity=".35"/><rect x="-170" y="-70" width="220" height="140" rx="40" fill="${D}"/><circle cx="20" cy="0" r="55" fill="${A}" stroke="#fef3c7" stroke-width="10"/><rect x="-120" y="70" width="40" height="50" fill="${D}"/><rect x="-200" y="110" width="200" height="22" rx="11" fill="#475569"/></g>`;
const lock = (x = 400, y = 250) => `<g transform="translate(${x} ${y})"><path d="M-110 0 L-110 -100 A110 110 0 0 1 110 -100 L110 0" fill="none" stroke="#cbd5e1" stroke-width="40"/><path d="M-110 0 L-110 -100 A110 110 0 0 1 110 -100 L110 0" fill="none" stroke="${D}" stroke-width="6"/>
  <rect x="-170" y="-10" width="340" height="80" rx="18" fill="${A}" stroke="${D}" stroke-width="8"/><circle cx="0" cy="30" r="14" fill="${D}"/><rect x="-5" y="30" width="10" height="26" fill="${D}"/></g>`;
const basket = (x = 400, y = 250) => `<g transform="translate(${x} ${y})"><path d="M-180 -70 L180 -70 L140 120 L-140 120 Z" fill="#d97706" stroke="${D}" stroke-width="8" stroke-linejoin="round"/>
  ${[-120, -60, 0, 60, 120].map(px => `<line x1="${px}" y1="-70" x2="${px * .8}" y2="120" stroke="${D}" stroke-width="5"/>`).join('')}${[-20, 30, 80].map(py => `<line x1="-175" y1="${py}" x2="175" y2="${py}" stroke="${D}" stroke-width="4" transform="scale(${1 - (py + 70) / 900} 1)"/>`).join('')}
  <circle cx="-60" cy="-100" r="40" fill="${G}" stroke="${D}" stroke-width="5"/><rect x="0" y="-150" width="70" height="80" rx="8" fill="${L}" stroke="${D}" stroke-width="5"/><path d="M-180 -70 Q0 -240 180 -70" fill="none" stroke="${D}" stroke-width="12"/></g>`;
const scooter = (x = 400, y = 270, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-170 70 L150 70 L170 50" fill="none" stroke="${D}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M130 60 L60 -190" stroke="${L}" stroke-width="18" stroke-linecap="round"/><path d="M15 -195 L110 -195" stroke="${D}" stroke-width="18" stroke-linecap="round"/>
  <rect x="-120" y="45" width="210" height="30" rx="10" fill="${G}" stroke="${D}" stroke-width="5"/>
  <circle cx="-150" cy="95" r="45" fill="${D}"/><circle cx="-150" cy="95" r="18" fill="#cbd5e1"/><circle cx="160" cy="95" r="45" fill="${D}"/><circle cx="160" cy="95" r="18" fill="#cbd5e1"/>
  <circle cx="75" cy="-140" r="12" fill="${A}"/></g>`;
const phone = (x = 400, y = 230) => `<g transform="translate(${x} ${y})"><path d="M-30 150 L-30 230 M30 150 L30 230 M-80 230 L80 230" stroke="${D}" stroke-width="18" stroke-linecap="round"/>
  <rect x="-140" y="-90" width="280" height="40" rx="10" fill="${D}"/><rect x="-115" y="-190" width="230" height="350" rx="28" fill="${D}"/><rect x="-100" y="-170" width="200" height="300" rx="14" fill="#bfdbfe"/>
  <path d="M-70 90 Q-20 30 -10 -20 Q0 -80 60 -120" fill="none" stroke="#1d4ed8" stroke-width="12" stroke-linecap="round"/><circle cx="60" cy="-120" r="16" fill="${R}"/><circle cx="-70" cy="90" r="12" fill="${G}"/></g>`;
const dashcam = (x = 400, y = 230) => `<g transform="translate(${x} ${y})"><rect x="-30" y="-190" width="60" height="80" rx="10" fill="${D}"/><rect x="-200" y="-120" width="400" height="220" rx="30" fill="${D}"/>
  <circle cx="-60" cy="-10" r="80" fill="#1e293b" stroke="#475569" stroke-width="10"/><circle cx="-60" cy="-10" r="45" fill="#1d4ed8"/><circle cx="-75" cy="-25" r="14" fill="${L}" opacity=".8"/>
  <circle cx="120" cy="-60" r="14" fill="${R}"/><rect x="70" y="0" width="100" height="60" rx="8" fill="#334155"/></g>`;
const jumpStarter = (x = 400, y = 250) => `<g transform="translate(${x} ${y})"><rect x="-120" y="-120" width="240" height="220" rx="30" fill="${D}"/><rect x="-85" y="-85" width="170" height="70" rx="10" fill="${G}"/><text x="0" y="-35" font-family="Arial, sans-serif" font-weight="800" font-size="40" text-anchor="middle" fill="${D}">12V</text>
  <path d="M-80 100 C-120 180 -220 160 -260 100" fill="none" stroke="${R}" stroke-width="14"/><path d="M80 100 C120 180 220 160 260 100" fill="none" stroke="${D}" stroke-width="14"/>
  ${clamp(-270, 80, R)}${clamp(270, 80, '#334155')}</g>`;
const clamp = (x, y, c) => `<g transform="translate(${x} ${y})"><path d="M-30 30 L-10 -60 L10 -60 L30 30 Z" fill="${c}" stroke="${D}" stroke-width="5" stroke-linejoin="round"/><path d="M-18 -60 L-18 -90 M0 -60 L0 -95 M18 -60 L18 -90" stroke="#cbd5e1" stroke-width="7"/></g>`;
const carBattery = (x = 400, y = 250) => `<g transform="translate(${x} ${y})"><rect x="-200" y="-110" width="400" height="230" rx="16" fill="${D}"/><rect x="-200" y="-110" width="400" height="60" rx="16" fill="#334155"/>
  <rect x="-150" y="-150" width="60" height="40" rx="6" fill="${R}"/><rect x="90" y="-150" width="60" height="40" rx="6" fill="#64748b"/>
  <text x="-120" y="-60" font-family="Arial" font-weight="900" font-size="44" text-anchor="middle" fill="${L}">+</text><text x="120" y="-60" font-family="Arial" font-weight="900" font-size="44" text-anchor="middle" fill="${L}">−</text>
  <rect x="-140" y="0" width="280" height="70" rx="10" fill="${A}"/><path d="M-10 10 L-35 40 L-5 40 L-20 62 L25 30 L-5 30 L10 10 Z" fill="${D}"/></g>`;
const pump = (x = 400, y = 260) => `<g transform="translate(${x} ${y})"><rect x="-100" y="-120" width="200" height="220" rx="36" fill="${L}" stroke="${D}" stroke-width="8"/><rect x="-65" y="-85" width="130" height="70" rx="10" fill="#1e293b"/>
  <text x="0" y="-36" font-family="Arial" font-weight="800" font-size="38" text-anchor="middle" fill="${G}">2.3</text><circle cx="-35" cy="40" r="18" fill="${D}"/><circle cx="35" cy="40" r="18" fill="${A}"/>
  <path d="M100 30 C200 30 180 140 280 140" fill="none" stroke="${D}" stroke-width="14" stroke-linecap="round"/></g>`;
const vacuum = (x = 400, y = 250) => `<g transform="translate(${x} ${y}) rotate(-20)"><rect x="-200" y="-50" width="250" height="100" rx="40" fill="${L}" stroke="${D}" stroke-width="8"/><rect x="-130" y="-35" width="90" height="70" rx="14" fill="#bfdbfe" opacity=".8"/>
  <path d="M50 -30 L240 -16 L240 16 L50 30 Z" fill="#94a3b8" stroke="${D}" stroke-width="7" stroke-linejoin="round"/><path d="M-200 0 Q-280 0 -270 100 L-200 100" fill="none" stroke="${D}" stroke-width="22" stroke-linecap="round"/>
  <rect x="-20" y="-45" width="30" height="90" fill="${A}"/></g>`;
const obd = (x = 400, y = 240) => `<g transform="translate(${x} ${y})"><rect x="-120" y="-170" width="240" height="320" rx="30" fill="${D}"/><rect x="-95" y="-145" width="190" height="150" rx="10" fill="#1e293b"/>
  <text x="0" y="-80" font-family="Courier New, monospace" font-weight="700" font-size="40" text-anchor="middle" fill="${G}">P0420</text><rect x="-70" y="-50" width="140" height="12" rx="6" fill="#475569"/>
  ${[-50, 0, 50].map(px => `<circle cx="${px}" cy="60" r="18" fill="#475569"/>`).join('')}<path d="M0 150 C0 220 160 200 200 140" fill="none" stroke="${D}" stroke-width="16"/>
  <path d="M170 110 L260 110 L250 170 L180 170 Z" fill="#475569" stroke="${D}" stroke-width="6"/></g>`;
const firstAid = (x = 400, y = 250) => `<g transform="translate(${x} ${y})"><path d="M-70 -110 L-70 -150 L70 -150 L70 -110" fill="none" stroke="${D}" stroke-width="16"/><rect x="-210" y="-110" width="420" height="230" rx="24" fill="${L}" stroke="${D}" stroke-width="8"/>
  <rect x="-25" y="-75" width="50" height="160" fill="${R}"/><rect x="-80" y="-20" width="160" height="50" fill="${R}"/></g>`;
const clock = (x = 400, y = 230) => `<g transform="translate(${x} ${y})"><circle r="160" fill="${L}" stroke="${D}" stroke-width="12"/>${Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="-140" x2="0" y2="-120" stroke="${D}" stroke-width="8" transform="rotate(${i * 30})"/>`).join('')}
  <line x1="0" y1="0" x2="0" y2="-90" stroke="${D}" stroke-width="12" stroke-linecap="round" transform="rotate(60)"/><line x1="0" y1="0" x2="0" y2="-120" stroke="${R}" stroke-width="7" stroke-linecap="round" transform="rotate(-30)"/><circle r="14" fill="${D}"/></g>`;
const road = (x = 400, y = 225, fog = false) => `<g transform="translate(${x} ${y})"><path d="M-60 -200 L60 -200 L360 260 L-360 260 Z" fill="#475569"/>
  ${[0, 1, 2, 3].map(i => `<path d="M${-4 - i * 4} ${-170 + i * 110} L${4 + i * 4} ${-170 + i * 110} L${8 + i * 6} ${-110 + i * 120} L${-8 - i * 6} ${-110 + i * 120} Z" fill="${L}"/>`).join('')}
  ${fog ? `<rect x="-420" y="-260" width="840" height="300" fill="${L}" opacity=".55"/><rect x="-420" y="-120" width="840" height="140" fill="${L}" opacity=".35"/>` : ''}</g>`;
const headlights = (x = 400, y = 260) => `<g transform="translate(${x} ${y})"><path d="M-120 -10 L-380 -150 L-380 150 Z" fill="#e0f2fe" opacity=".55"/><path d="M120 -10 L380 -150 L380 150 Z" fill="#e0f2fe" opacity=".55"/>
  <rect x="-200" y="-70" width="400" height="140" rx="50" fill="${D}"/><circle cx="-120" cy="-10" r="40" fill="#e0f2fe" stroke="${L}" stroke-width="8"/><circle cx="120" cy="-10" r="40" fill="#e0f2fe" stroke="${L}" stroke-width="8"/><rect x="-60" y="10" width="120" height="40" rx="8" fill="#334155"/></g>`;
const motorbike = (x = 400, y = 280) => `<g transform="translate(${x} ${y})">${wheel(-150, 40, 70)}${wheel(150, 40, 70)}
  <path d="M-150 40 L-40 -40 L80 -40 L150 40 M-40 -40 L0 40 L80 -40" fill="none" stroke="${D}" stroke-width="14" stroke-linejoin="round"/><path d="M-60 -60 L60 -60 Q90 -60 90 -30 L-60 -30 Z" fill="${R}" stroke="${D}" stroke-width="6"/>
  <path d="M90 -40 L120 -110 L150 -110" fill="none" stroke="${D}" stroke-width="12" stroke-linecap="round"/><rect x="-20" y="-10" width="70" height="50" rx="8" fill="#64748b" stroke="${D}" stroke-width="5"/></g>`;
const f1 = (x = 400, y = 290) => `<g transform="translate(${x} ${y})"><path d="M-260 10 L-200 -30 L-40 -40 L0 -80 L60 -80 L80 -40 L260 -20 L280 20 L-260 20 Z" fill="${R}" stroke="${D}" stroke-width="7" stroke-linejoin="round"/>
  <rect x="-290" y="-70" width="60" height="70" fill="${D}"/><rect x="240" y="-10" width="70" height="30" fill="${D}"/><circle cx="20" cy="-55" r="20" fill="${A}" stroke="${D}" stroke-width="5"/>${wheel(-170, 20, 50)}${wheel(170, 20, 50)}</g>`;
const flagEU = (x = 600, y = 150) => `<g transform="translate(${x} ${y})"><rect x="-8" y="-10" width="14" height="300" fill="${D}"/><rect x="6" y="-10" width="180" height="120" fill="#1d4ed8" stroke="${D}" stroke-width="5"/>
  ${Array.from({ length: 12 }, (_, i) => `<circle cx="${96 + 40 * Math.cos(i * Math.PI / 6)}" cy="${50 + 40 * Math.sin(i * Math.PI / 6)}" r="6" fill="${A}"/>`).join('')}</g>`;
const truck = (x = 380, y = 290) => `<g transform="translate(${x} ${y})"><rect x="-260" y="-150" width="320" height="170" rx="8" fill="${L}" stroke="${D}" stroke-width="7"/><path d="M60 -110 L170 -110 L220 -40 L220 20 L60 20 Z" fill="${A}" stroke="${D}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M90 -95 L160 -95 L195 -45 L90 -45 Z" fill="#bfdbfe"/>${wheel(-180, 25, 40)}${wheel(-90, 25, 40)}${wheel(150, 25, 40)}</g>`;
const suitcase = (x = 560, y = 260) => `<g transform="translate(${x} ${y})"><rect x="-40" y="-130" width="80" height="40" rx="12" fill="none" stroke="${D}" stroke-width="12"/><rect x="-110" y="-100" width="220" height="190" rx="20" fill="${A}" stroke="${D}" stroke-width="7"/><line x1="-50" y1="-100" x2="-50" y2="90" stroke="${D}" stroke-width="6"/><line x1="50" y1="-100" x2="50" y2="90" stroke="${D}" stroke-width="6"/></g>`;
const people = (x = 400, y = 260, n = 3, k = 1) => Array.from({ length: n }, (_, i) => { const px = x + (i - (n - 1) / 2) * 110; const s = (i % 2 ? .8 : 1) * k; const px2 = x + (i - (n - 1) / 2) * 110 * k; return `<g transform="translate(${px2} ${y}) scale(${s})"><circle cx="0" cy="-120" r="40" fill="#fcd9b6" stroke="${D}" stroke-width="6"/><path d="M-70 60 Q-70 -60 0 -60 Q70 -60 70 60 Z" fill="${['#1d4ed8', '#be123c', '#047857', '#7c3aed'][i % 4]}" stroke="${D}" stroke-width="6"/></g>`; }).join('');
const brain = (x = 400, y = 230) => `<g transform="translate(${x} ${y})"><circle r="160" fill="${L}" opacity=".18"/><path d="M-60 120 L-60 60 Q-150 40 -140 -40 Q-130 -140 -20 -150 Q110 -155 130 -50 Q140 10 90 40 L90 120 Z" fill="${L}" stroke="${D}" stroke-width="8" stroke-linejoin="round"/>
  <path d="M-20 -60 Q0 -100 30 -60 Q60 -30 20 0 L20 30" fill="none" stroke="${D}" stroke-width="14" stroke-linecap="round"/><circle cx="20" cy="70" r="10" fill="${D}"/></g>`;
const taxi = (x = 400, y = 300) => car(x, y, 1.05, A) + `<g transform="translate(${x - 10} ${y - 150})"><rect x="-45" y="-22" width="90" height="34" rx="8" fill="${D}"/><text x="0" y="5" font-family="Arial" font-weight="800" font-size="22" text-anchor="middle" fill="${A}">TAXI</text></g>`;
const ballCar = (x = 400, y = 300) => car(x, y, .95, '#e2e8f0') + `<g transform="translate(${x + 230} ${y - 170})"><circle r="44" fill="${L}" stroke="${D}" stroke-width="6"/><path d="M0 -18 L17 -6 L11 14 L-11 14 L-17 -6 Z" fill="${D}"/><path d="M0 -18 L0 -44 M17 -6 L42 -14 M11 14 L26 36 M-11 14 L-26 36 M-17 -6 L-42 -14" stroke="${D}" stroke-width="4"/></g>`;
const water = (x = 400, y = 240) => headlights(x, y) + `<g transform="translate(${x - 120} ${y - 10})">${[[-14, -8], [10, 4], [-2, 18]].map(([dx, dy]) => `<path d="M${dx} ${dy - 12} Q${dx + 8} ${dy} ${dx} ${dy + 6} Q${dx - 8} ${dy} ${dx} ${dy - 12} Z" fill="#1d4ed8"/>`).join('')}</g>`;
const tireBulge = (x = 400, y = 240) => tire(x, y) + `<g transform="translate(${x + 128} ${y - 40})"><ellipse rx="40" ry="55" fill="#1e293b" stroke="${R}" stroke-width="7"/></g>`;
const tireLines = (x = 400, y = 240) => tire(x, y) + `<g transform="translate(${x} ${y})">${[R, '#1d4ed8', A].map((c, i) => `<path d="M${-130 + i * 10} ${-60 + i * 28} A145 145 0 0 1 ${-90 + i * 6} ${-112 + i * 24}" stroke="${c}" stroke-width="8" fill="none"/>`).join('')}</g>`;
const gearLever = (x = 400, y = 250) => `<g transform="translate(${x} ${y})"><rect x="-160" y="20" width="320" height="140" rx="30" fill="${D}"/>
  ${['P', 'R', 'N', 'D'].map((l, i) => `<text x="${-100 + i * 66}" y="120" font-family="Arial" font-weight="800" font-size="40" text-anchor="middle" fill="${l === 'D' ? A : '#94a3b8'}">${l}</text>`).join('')}
  <rect x="-14" y="-140" width="28" height="180" rx="10" fill="#475569"/><ellipse cx="0" cy="-150" rx="60" ry="50" fill="#334155" stroke="${D}" stroke-width="6"/></g>`;
const blindSpot = (x = 400, y = 225) => `<g transform="translate(${x} ${y})"><rect x="-420" y="-200" width="840" height="400" fill="#475569"/><line x1="-420" y1="0" x2="420" y2="0" stroke="${L}" stroke-width="7" stroke-dasharray="40 30"/>
  <path d="M-40 70 L-260 -30 L-260 -170 Z" fill="${R}" opacity=".35"/>${miniCarH(40, 90, A)}${miniCarH(-200, -90, '#93c5fd')}</g>`;
const miniCarH = (x, y, c) => `<g transform="translate(${x} ${y}) rotate(90) scale(1.4)">${miniCar(0, 0, 0, c)}</g>`;
const seat = (x = 400, y = 260) => `<g transform="translate(${x} ${y})"><path d="M-40 -200 Q-80 -200 -80 -150 L-60 40 L60 40 L80 -150 Q80 -200 40 -200 Z" fill="${D}"/><rect x="-60" y="-260" width="120" height="70" rx="26" fill="${D}"/>
  <path d="M-80 40 L120 40 Q160 40 160 80 L160 110 L-80 110 Z" fill="${D}"/><path d="M200 -180 L260 -180 L260 -90 L200 -90 Z" fill="#bfdbfe" stroke="${D}" stroke-width="6"/>
  <path d="M120 -60 L180 -60 M150 -90 L180 -60 L150 -30" fill="none" stroke="${A}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></g>`;
const report = (x = 400, y = 230) => phone(x - 80, y) + `<g transform="translate(${x + 170} ${y - 60})"><circle r="70" fill="${R}" stroke="${D}" stroke-width="6"/><text y="30" font-family="Arial" font-weight="900" font-size="90" text-anchor="middle" fill="${L}">!</text></g>`;
const defog = (x = 400, y = 235) => windshield(x, y).replace(/<path d="M60 -40[\s\S]*?<circle cx="60" cy="-40" r="10" fill="#ffffff"\/>/, `<rect x="-280" y="-130" width="560" height="160" fill="${L}" opacity=".6"/>`) + `<g transform="translate(${x} ${y + 150})"><rect x="-90" y="-40" width="180" height="80" rx="16" fill="${D}"/>${[-40, 0, 40].map(px => `<path d="M${px} 20 Q${px - 12} 0 ${px} -10 Q${px + 12} -20 ${px} -30" fill="none" stroke="#f97316" stroke-width="7" stroke-linecap="round"/>`).join('')}</g>`;

const turbo = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-40 -130 A140 140 0 1 1 -150 60 L-60 30 A60 60 0 1 0 -10 -60 Z" fill="#94a3b8" stroke="${D}" stroke-width="8" stroke-linejoin="round"/><circle r="80" fill="#cbd5e1" stroke="${D}" stroke-width="7"/>${Array.from({ length: 8 }, (_, i) => `<path d="M0 0 Q30 -40 10 -75" fill="none" stroke="${D}" stroke-width="7" transform="rotate(${i * 45})"/>`).join('')}<circle r="16" fill="${D}"/><rect x="120" y="-40" width="140" height="80" rx="10" fill="#64748b" stroke="${D}" stroke-width="7"/></g>`;
const injector = (x, y) => `<g transform="translate(${x} ${y}) rotate(20)"><rect x="-30" y="-150" width="60" height="90" rx="10" fill="${D}"/><rect x="-22" y="-60" width="44" height="150" rx="8" fill="#94a3b8" stroke="${D}" stroke-width="6"/><path d="M-12 90 L0 130 L12 90 Z" fill="${D}"/><path d="M0 135 L-40 210 M0 135 L0 220 M0 135 L40 210" stroke="#7dd3fc" stroke-width="8" stroke-linecap="round" opacity=".8"/></g>`;
const thermo = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-22" y="-130" width="44" height="190" rx="22" fill="${L}" stroke="${D}" stroke-width="7"/><circle cy="80" r="45" fill="${R}" stroke="${D}" stroke-width="7"/><rect x="-10" y="-60" width="20" height="130" fill="${R}"/>${[-100, -70, -40, -10].map(ty => `<line x1="22" y1="${ty}" x2="45" y2="${ty}" stroke="${D}" stroke-width="5"/>`).join('')}</g>`;
const gearC = (x, y, r, n) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#cbd5e1" stroke="${D}" stroke-width="6"/>${Array.from({ length: n }, (_, i) => `<rect x="-9" y="${-r - 14}" width="18" height="18" fill="#cbd5e1" stroke="${D}" stroke-width="4" transform="rotate(${i * 360 / n})"/>`).join('')}<circle r="${r * .25}" fill="${D}"/></g>`;
const timing = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-160 -60 L140 -110 A60 60 0 0 1 140 10 L-160 100 A80 80 0 0 1 -160 -60 Z" fill="none" stroke="${D}" stroke-width="18" stroke-linejoin="round"/>${gearC(-160, 20, 70, 18)}${gearC(150, -50, 50, 14)}<path d="M-160 -60 L140 -110" stroke="${A}" stroke-width="6" stroke-dasharray="10 8"/></g>`;
const flywheel = (x, y) => `<g transform="translate(${x} ${y})"><circle r="170" fill="#64748b" stroke="${D}" stroke-width="8"/>${Array.from({ length: 48 }, (_, i) => `<rect x="-4" y="-182" width="8" height="16" fill="${D}" transform="rotate(${i * 7.5})"/>`).join('')}<circle r="110" fill="#94a3b8" stroke="${D}" stroke-width="6"/><circle r="40" fill="${D}"/>${Array.from({ length: 6 }, (_, i) => `<circle cx="0" cy="-75" r="10" fill="${D}" transform="rotate(${i * 60})"/>`).join('')}</g>`;
const manualStick = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-110" y="20" width="220" height="130" rx="24" fill="${D}"/><path d="M-60 60 L-60 120 M0 60 L0 120 M60 60 L60 120 M-60 90 L60 90" stroke="#94a3b8" stroke-width="6"/><rect x="-10" y="-120" width="20" height="200" rx="8" fill="#475569"/><circle cy="-130" r="40" fill="#334155" stroke="${D}" stroke-width="6"/></g>`;
const snow = (x, y) => `<g transform="translate(${x} ${y})" stroke="${L}" stroke-width="10" stroke-linecap="round">${[0, 60, 120].map(a => `<line x1="0" y1="-80" x2="0" y2="80" transform="rotate(${a})"/>`).join('')}</g>`;
const flagUS = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-8" y="-10" width="14" height="260" fill="${D}"/><rect x="6" y="-10" width="170" height="110" fill="${L}" stroke="${D}" stroke-width="5"/>${[0, 2, 4, 6].map(i => `<rect x="6" y="${-10 + i * 15.7}" width="170" height="15.7" fill="${R}"/>`).join('')}<rect x="6" y="-10" width="70" height="60" fill="#1d4ed8"/></g>`;
const sportsCar = (x, y, c) => `<g transform="translate(${x} ${y})"><path d="M-220 20 Q-215 -20 -160 -30 L-60 -70 Q0 -95 80 -80 L180 -40 Q225 -30 225 10 L225 25 L-220 25 Z" fill="${c}" stroke="${D}" stroke-width="7" stroke-linejoin="round"/><path d="M-50 -62 Q0 -84 70 -72 L120 -42 L-80 -42 Z" fill="#bfdbfe" stroke="${D}" stroke-width="5"/>${wheel(-130, 28, 40)}${wheel(140, 28, 40)}</g>`;
const clapper = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-130" y="-40" width="260" height="170" rx="10" fill="${D}"/><g transform="rotate(-14 -130 -40)"><rect x="-130" y="-90" width="260" height="50" fill="${L}" stroke="${D}" stroke-width="6"/>${[-100, -40, 20, 80].map(px => `<path d="M${px} -90 l30 0 l-20 50 l-30 0 z" fill="${D}"/>`).join('')}</g><rect x="-100" y="10" width="200" height="14" rx="7" fill="#475569"/><rect x="-100" y="50" width="140" height="14" rx="7" fill="#475569"/></g>`;
const oldCar = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-160 20 L-120 -60 L60 -60 L80 20 Z" fill="#7c2d12" stroke="${D}" stroke-width="7" stroke-linejoin="round"/><path d="M-100 -60 L-110 -150 L50 -150 L60 -60" fill="none" stroke="${D}" stroke-width="8"/><path d="M-120 -150 L70 -150" stroke="${D}" stroke-width="14" stroke-linecap="round"/><circle cx="-150" cy="60" r="70" fill="none" stroke="${D}" stroke-width="10"/>${Array.from({ length: 8 }, (_, i) => `<line x1="-150" y1="60" x2="-150" y2="-5" stroke="${D}" stroke-width="4" transform="rotate(${i * 45} -150 60)"/>`).join('')}<circle cx="120" cy="80" r="50" fill="none" stroke="${D}" stroke-width="10"/>${Array.from({ length: 8 }, (_, i) => `<line x1="120" y1="80" x2="120" y2="35" stroke="${D}" stroke-width="4" transform="rotate(${i * 45} 120 80)"/>`).join('')}<path d="M60 -20 L140 -60" stroke="${D}" stroke-width="8" stroke-linecap="round"/></g>`;
const warnSign =(x, y) => `<g transform="translate(${x} ${y})"><path d="M0 -120 L120 90 L-120 90 Z" fill="${A}" stroke="${D}" stroke-width="10" stroke-linejoin="round"/><rect x="-10" y="-50" width="20" height="80" rx="8" fill="${D}"/><circle cy="60" r="12" fill="${D}"/></g>`;
const magnifier = (x, y) => `<g transform="translate(${x} ${y})"><circle r="70" fill="#bfdbfe" fill-opacity=".45" stroke="${D}" stroke-width="14"/><path d="M50 50 L120 120" stroke="${D}" stroke-width="26" stroke-linecap="round"/></g>`;
const skyline = () => `<g fill="${D}" opacity=".55">${[[60, 170, 90], [160, 110, 70], [240, 200, 80], [330, 140, 60], [400, 90, 90], [500, 180, 70], [580, 120, 90], [680, 160, 80]].map(([x, h, w]) => `<rect x="${x}" y="${390 - h - 80}" width="${w}" height="${h + 80}"/>`).join('')}</g>`;
const salon = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-260" y="-120" width="520" height="200" fill="${L}" stroke="${D}" stroke-width="8"/><rect x="-260" y="-160" width="520" height="50" fill="${D}"/><text y="-125" font-family="Arial" font-weight="800" font-size="32" text-anchor="middle" fill="${A}">AUTO</text><rect x="-230" y="-90" width="460" height="150" fill="#bfdbfe" opacity=".7"/></g>`;

// ---------- odabir motiva ----------
// Svako pravilo: [regex za slug, funkcija(r) koja vraća SVG]; r() daje broj 0–1 za varijacije.
const RULES = [
  // Serija: motori, dizel, mjenjači, povijest
  [/turbin/, r => turbo(400, 240)],
  [/dizni|brizgalj/, r => injector(330, 240) + engine(600, 250, false).replace('translate(600 250)', 'translate(610 250) scale(.5)')],
  [/termostat|pregrijava|rashladna/, r => engine(320, 240, false) + thermo(620, 230)],
  [/lanac|lanci|zupcast/, r => timing(400, 230)],
  [/spojk|zamasnjak/, r => flywheel(400, 235)],
  [/dsg|dct|cvt|automatskog-mjenjaca|automatski-mjenjac|rucni-ili-automatski/, r => gearLever(330, 250) + (/rucni/.test(r.slug) ? manualStick(600, 250) : '')],
  [/4x4|pogona/, r => car(400, 300, 1, '#4d7c0f') + `<g transform="translate(400 120)"><rect x="-70" y="-30" width="140" height="60" rx="12" fill="${D}"/><text y="14" font-family="Arial" font-weight="900" font-size="38" text-anchor="middle" fill="${A}">4x4</text></g>`],
  [/tesko-pali/, r => key(330, 240) + (/zimi/.test(r.slug) ? snow(620, 170) : carBattery(400, 250).replace('translate(400 250)', 'translate(620 280) scale(.45)'))],
  [/trese-u-leru|istrosen-motor|trosi-ulje|gubi-snagu|trosi-previse/, r => engine(400, 240, /gubi|trese/.test(r.slug)) + (/ulje/.test(r.slug) ? oilCan(400, 260).replace('translate(400 260)', 'translate(650 320) scale(.45)') : '')],
  [/boja-dima/, r => car(560, 300, .8) + exhaust(250, 335, '#94a3b8')],
  [/benzinac-ili-dizel|dizel-dobar|dizel-vise|dizelski-automobili-trose|dizelskih|dizelskog|dizelskih-motora|dizelski-motori/, r => car(300, 320, .8) + `<g transform="translate(620 240)"><rect x="-80" y="-120" width="160" height="240" rx="18" fill="${D}"/><circle cy="-40" r="40" fill="${A}"/><text y="70" font-family="Arial" font-weight="900" font-size="40" text-anchor="middle" fill="${A}">D</text></g>`],
  [/hibrid-ili|ili-hibrid/, r => car(250, 320, .6) + car(560, 320, .6, L, '#a7f3d0') + `<text x="405" y="230" font-family="Arial" font-weight="900" font-size="48" text-anchor="middle" fill="${L}">vs</text>`],
  [/baterija-hibrida/, r => battery(400, 240, .45)],
  [/trose-gume/, r => tire(330, 250) + plug(620, 250, .5)],
  [/plug-in-hibridi-trose/, r => plug(300, 250, .8) + `<g transform="translate(600 240)"><rect x="-80" y="-120" width="160" height="220" rx="16" fill="${L}" stroke="${D}" stroke-width="6"/><rect x="-55" y="-95" width="110" height="60" rx="8" fill="#1e293b"/><text y="-52" font-family="Arial" font-weight="800" font-size="34" text-anchor="middle" fill="${R}">6.0</text></g>`],
  [/yugo/, r => car(400, 300, 1, '#be123c') + flagUS(640, 110)],
  [/delorean/, r => car(400, 300, 1, '#cbd5e1', '#1e293b') + `<path d="M180 170 L210 120 M600 170 L640 120" stroke="${A}" stroke-width="8" stroke-linecap="round"/>`],
  [/porsche-911/, r => sportsCar(400, 300, '#e2e8f0')],
  [/iz-filmova/, r => clapper(300, 230) + car(600, 330, .5, '#cbd5e1')],
  [/najskuplji-automobili-ikada/, r => sportsCar(330, 310, '#be123c') + euro(640, 300, .7)],
  [/najbrzih-serijskih/, r => sportsCar(400, 300, A) + `<g stroke="${L}" stroke-width="8" stroke-linecap="round" opacity=".7"><path d="M60 230 L150 230 M40 280 L160 280 M70 330 L150 330"/></g>`],
  [/prvi-automobil/, r => oldCar(400, 280)],
  [/promasaji|unistili/, r => car(330, 310, .85, '#94a3b8') + warnSign(630, 210)],
  [/najcudniji/, r => `<g transform="translate(400 300) scale(1.3)"><path d="M-90 20 Q-90 -90 0 -90 Q90 -90 90 20 Z" fill="${R}" stroke="${D}" stroke-width="7"/><path d="M-50 -20 Q-50 -65 0 -65 Q50 -65 50 -20 Z" fill="#bfdbfe" stroke="${D}" stroke-width="5"/>${wheel(-50, 30, 26)}${wheel(50, 30, 26)}</g>`],
  [/ispred-svog-vremena|promijenili-svijet/, r => car(330, 310, .85, /svijet/.test(r.slug) ? '#1e293b' : '#e2e8f0') + clock(640, 200).replace('translate(640 200)', 'translate(640 190) scale(.5)')],
  [/bez-nasljednika|phaeton|saab/, r => car(400, 300, 1, /saab/.test(r.slug) ? '#1e3a8a' : /phaeton/.test(r.slug) ? '#334155' : '#be123c')],
  [/najpouzdaniji/, r => car(330, 310, .85) + shield(640, 200).replace('translate(640 200)', 'translate(640 200) scale(.65)')],
  [/kontrolna-lista/, r => checklist(300, 230) + car(600, 330, .5)],
  [/novi-ili-rabljeni/, r => car(220, 320, .55, L) + car(580, 320, .55, '#94a3b8') + `<g transform="translate(400 190)"><circle r="40" fill="${D}"/><text y="14" font-family="Arial" font-weight="900" font-size="40" text-anchor="middle" fill="${A}">?</text></g>` + `<path d="M150 150 l10 -24 l10 24 l24 10 l-24 10 l-10 24 l-10 -24 l-24 -10 z" fill="${A}"/>`],
  [/prevare/, r => docs(300, 230, false) + warnSign(600, 230)],
  [/za-obitelj/, r => car(300, 320, .8) + people(620, 270, 3, .55)],
  [/privatnog-prodavatelja/, r => people(250, 280, 2, .75) + key(600, 250).replace('translate(600 250)', 'translate(600 250) scale(.7)')],
  [/najskuplji-kvarovi/, r => engine(320, 240) + euro(640, 300, .7)],
  [/gradsku/, r => skyline() + car(400, 340, .7, A)],
  [/udaren/, r => scratch(380, 230) + magnifier(560, 200)],
  [/auto-kuce/, r => salon(400, 220) + car(400, 350, .6)],
  [/izgledaju-jeftino/, r => car(300, 320, .8, '#e2e8f0') + euro(560, 330, .6) + euro(680, 320, .6)],
  [/koliko-kilometara/, r => road(300, 225) + speedo(400, 470).replace('translate(400 470)', 'translate(620 260) scale(.55)')],
  [/velike-kilometraze/, r => road(400, 225) + car(400, 370, .5) + clock(400, 230).replace('translate(400 230)', 'translate(650 120) scale(.4)')],
  [/probnu-voznju/, r => steering(400, 235, 140)],
  [/servisna-knjizica/, r => docs(320, 230) + oilCan(400, 260).replace('translate(400 260)', 'translate(620 300) scale(.55)')],
  [/ostaviti-za-popravke/, r => oilCan(300, 260).replace('translate(300 260)', 'translate(300 260) scale(.8)') + euro(620, 300, .75)],
  [/toplinska-pumpa/, r => car(300, 320, .8) + `<g transform="translate(610 200)"><circle r="80" fill="none" stroke="${L}" stroke-width="10"/>${Array.from({ length: 6 }, (_, i) => `<line x1="0" y1="-60" x2="0" y2="60" stroke="#bfdbfe" stroke-width="10" stroke-linecap="round" transform="rotate(${i * 30})"/>`).join('')}<path d="M60 70 Q90 40 120 70 Q150 100 180 70" fill="none" stroke="#f97316" stroke-width="10" stroke-linecap="round"/></g>`],
  [/solarnim/, r => `<g transform="translate(260 260) skewX(-20)">${[0, 1, 2].map(i => [0, 1].map(j => `<rect x="${-120 + i * 85}" y="${-60 + j * 65}" width="80" height="60" fill="#1e3a8a" stroke="${L}" stroke-width="4"/>`).join('')).join('')}</g><circle cx="140" cy="100" r="44" fill="${A}"/>` + charger(560, 250)],
  [/sigurnost-elektricnih/, r => car(300, 320, .8, L, '#a7f3d0') + shield(630, 210).replace('translate(630 210)', 'translate(630 200) scale(.65)')],
  [/v2l/, r => car(280, 320, .75, L, '#a7f3d0') + `<g transform="translate(600 260)"><rect x="-70" y="-90" width="140" height="180" rx="16" fill="${L}" stroke="${D}" stroke-width="6"/><circle cy="0" r="50" fill="#e2e8f0" stroke="${D}" stroke-width="5"/><circle cx="-20" cy="0" r="9" fill="${D}"/><circle cx="20" cy="0" r="9" fill="${D}"/><rect x="-6" y="-50" width="12" height="16" fill="${D}"/><rect x="-6" y="34" width="12" height="16" fill="${D}"/></g><path d="M420 300 C470 300 480 260 530 260" fill="none" stroke="${A}" stroke-width="10" stroke-dasharray="14 10"/>`],
  [/kruzni-tok/, r => roundabout()],
  [/dopunska-strelica/, r => trafficLight(330, 200, 'r', true)],
  [/semafor/, r => trafficLight()],
  [/pravilo-desne/, r => priorityRight()],
  [/skretanje-u-lijevo/, r => intersection()],
  [/polukruzno/, r => uturn()],
  [/mrtvi-kut/, r => blindSpot()],
  [/parkiranje|parkir/, r => topCarPark() + parkingSign()],
  [/poligon/, r => cones(170, 360, 5, 115) + car(400, 250, .7, A)],
  [/drzanje.*upravljac|volan/, r => steering()],
  [/sjedala|ogledala/, r => seat()],
  [/pokretanje-vozila|automatski-mjenjac|r-u-d/, r => gearLever()],
  [/kocenje|sekunda-nepaznje/, r => road(400, 225) + `<g transform="translate(400 330)"><rect x="-120" y="-30" width="240" height="60" rx="10" fill="${R}"/><text y="16" font-family="Arial" font-weight="900" font-size="40" text-anchor="middle" fill="${L}">STOP</text></g>`],
  [/magl/, r => road(400, 225, true)],
  [/svjetl.*modern|blijestanje/, r => headlights()],
  [/voda-u-prednjem|fara/, r => water()],
  [/strah-od-voznje/, r => brain()],
  [/provjera-prometnih/, r => phone(300, 240) + road(620, 260)],
  [/prijaviti-prometni/, r => report()],
  [/odmagliti/, r => defog()],
  [/kleme|akumulator/, r => carBattery(330, 260) + (/kleme/.test(r.slug) ? clamp(620, 260, R) + clamp(700, 260, '#334155') : '')],
  [/lampica-akumulatora|alternator/, r => dash(400, 240, true)],
  [/simboli|instrument/, r => dash()],
  [/brzinomjer|najbrzi/, r => speedo()],
  [/lampica-motora|check-engine|mehanicar|moderni-motori/, r => engine()],
  [/motorno-ulje|ulje|remen/, r => oilCan()],
  [/dim|auspuh/, r => car(560, 300, .8) + exhaust(250, 335, '#93c5fd')],
  [/egr/, r => engine(330, 240, false) + sensor(600, 220).replace('translate(600 220)', 'translate(620 200) scale(.5)')],
  [/kvacilo/, r => gearLever(300, 250).replace(/fill="#94a3b8">D|fill="#fbbf24">D/, m => m) + speedo(600, 300).replace('translate(600 300)', 'translate(610 300) scale(.55)')],
  [/dpf|katalizator/, r => filter()],
  [/adblue/, r => `<g transform="translate(400 250)"><rect x="-110" y="-150" width="220" height="280" rx="24" fill="#1d4ed8" stroke="${D}" stroke-width="8"/><rect x="-40" y="-190" width="80" height="50" rx="8" fill="${L}" stroke="${D}" stroke-width="6"/><rect x="-80" y="-60" width="160" height="90" rx="10" fill="${L}"/><text y="0" font-family="Arial" font-weight="900" font-size="36" text-anchor="middle" fill="#1d4ed8">AdBlue</text></g>`],
  [/map-senzor|senzor/, r => sensor()],
  [/vjetrobran/, r => windshield()],
  [/ogrebotin/, r => scratch()],
  [/broj-sasije|vin/, r => vin()],
  [/oznake-na.*gumama|crte-na-novim-gumama/, r => tireLines(330, 235) + `<g transform="translate(600 230)"><rect x="-135" y="-60" width="270" height="120" rx="14" fill="${L}" stroke="${D}" stroke-width="6"/><text y="15" font-family="Arial" font-weight="800" font-size="40" text-anchor="middle" fill="${D}">205/55 R16</text></g>`],
  [/izbocina|guma/, r => tireBulge(380, 235)],
  [/napumpati|pumpe-za-gume/, r => tire(300, 250) + (/pumpe/.test(r.slug) ? pump(600, 260) : gauge(600, 200))],
  [/osnovni-dijelovi/, r => car(400, 280, 1.15) + `<g opacity=".9">${[[230, 230], [400, 180], [560, 300]].map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="20" fill="${A}" stroke="${D}" stroke-width="5"/>`).join('')}</g>`],
  [/obd2|obd/, r => obd()],
  [/starter/, r => jumpStarter()],
  [/usisavac/, r => vacuum()],
  [/drzaci.*mobitel|mobitel/, r => phone()],
  [/kamere/, r => dashcam()],
  [/dodaci-i-dodatna-oprema-za-automobil/, r => firstAid(300, 260) + `<g transform="translate(620 300)"><path d="M0 -110 L95 60 L-95 60 Z" fill="none" stroke="${R}" stroke-width="22" stroke-linejoin="round"/></g>`],
  [/kosare/, r => basket()],
  [/lokot/, r => lock()],
  [/kacige/, r => helmet()],
  [/svjetla-za-bicikl/, r => bikeLight()],
  [/elektricni-bicikl/, r => bike(400, 260, 1, true)],
  [/bicik/, r => bike()],
  [/romobil/, r => scooter() + (/kazne|pravila/.test(r.slug) ? `<g transform="translate(640 140)"><circle r="60" fill="${L}" stroke="${R}" stroke-width="14"/><text y="22" font-family="Arial" font-weight="900" font-size="56" text-anchor="middle" fill="${D}">25</text></g>` : '')],
  [/motociklist/, r => motorbike()],
  [/formul|antonelli/, r => f1()],
  [/tourbillon|bugatti|rimac/, r => car(400, 300, 1.1, '#1e3a8a', '#93c5fd') + speedo(400, 470).replace('translate(400 470)', 'translate(650 170) scale(.35)')],
  [/kane|zlatn/, r => ballCar()],
  [/land-rover|buba/, r => car(400, 300, 1, '#4d7c0f')],
  [/taksi/, r => taxi()],
  [/7-sjedala/, r => car(400, 320, 1.05) + people(400, 175, 4, .55)],
  [/prtljaznik/, r => car(300, 310, .85) + suitcase(620, 250)],
  [/najsigurniji/, r => car(330, 310, .85) + shield(640, 210).replace('translate(640 210)', 'translate(640 200) scale(.65)')],
  [/za-zene|pocetnike/, r => car(400, 300, 1, '#fda4af') + lSign(650, 110)],
  [/potrosnj|ustedjeti/, r => `<g transform="translate(320 250)"><rect x="-90" y="-150" width="180" height="260" rx="18" fill="${L}" stroke="${D}" stroke-width="8"/><rect x="-60" y="-120" width="120" height="70" rx="8" fill="#1e293b"/><text y="-70" font-family="Arial" font-weight="800" font-size="40" text-anchor="middle" fill="${G}">4.2</text><path d="M90 -60 L150 -60 L150 60" fill="none" stroke="${D}" stroke-width="14" stroke-linecap="round"/><rect x="-110" y="110" width="220" height="24" rx="8" fill="${D}"/></g>` + euro(600, 300, .8)],
  [/plin/, r => car(330, 310, .85) + `<g transform="translate(630 240)"><rect x="-70" y="-120" width="140" height="240" rx="60" fill="${G}" stroke="${D}" stroke-width="8"/><text y="15" font-family="Arial" font-weight="900" font-size="44" text-anchor="middle" fill="${L}">LPG</text></g>`],
  [/dizel/, r => car(330, 310, .85) + `<g transform="translate(630 240)"><rect x="-80" y="-120" width="160" height="240" rx="18" fill="${D}"/><circle cy="-40" r="40" fill="${A}"/><text y="70" font-family="Arial" font-weight="900" font-size="40" text-anchor="middle" fill="${A}">D</text></g>`],
  [/suv/, r => car(400, 300, 1.1, '#e2e8f0').replace('M-190 10 Q-190 -30', 'M-190 10 Q-190 -50')],
  [/odrzavanje-i-popravak/, r => car(330, 310, .85) + `<g transform="translate(630 230) rotate(40)"><rect x="-16" y="-120" width="32" height="200" rx="10" fill="#94a3b8" stroke="${D}" stroke-width="6"/><path d="M-50 -120 A50 50 0 1 1 50 -120 L20 -120 L20 -150 L-20 -150 L-20 -120 Z" fill="#94a3b8" stroke="${D}" stroke-width="6"/></g>`],
  [/najjeftiniji|cijena|cijene|leasing|naknada|pristojba|ppmv|trosk|osiguranje/, r => {
    if (/osiguranje|kasko/.test(r.slug)) return shield(330, 230) + euro(620, 310, .7);
    if (/punjenja/.test(r.slug)) return plug(300, 250, .85) + euro(620, 300, .75);
    if (/autoskol/.test(r.slug)) return car(320, 310, .8, L) + lSign(250, 170) + euro(640, 300, .7);
    if (/leasing/.test(r.slug)) return docs(300, 230, false) + pen(450, 260) + car(620, 330, .5);
    if (/elektricn|hibrid/.test(r.slug)) return car(330, 310, .85) + plug(650, 260, .55);
    if (/ppmv|pristojba|naknada/.test(r.slug)) return docs(320, 230) + euro(620, 310, .75);
    return car(330, 310, .85) + euro(640, 300, .7);
  }],
  [/kasko/, r => shield(330, 230) + euro(620, 310, .7)],
  [/krad|zastititi.*krade/, r => car(320, 310, .8) + shield(640, 210, 'lock').replace('translate(640 210)', 'translate(640 200) scale(.7)')],
  [/prijenos-vlasnistva|prodati/, r => key(300, 240) + docs(580, 230, false).replace('translate(580 230)', 'translate(580 230) scale(.7)')],
  [/slikanje/, r => car(330, 320, .85) + `<g transform="translate(630 170)"><rect x="-90" y="-60" width="180" height="120" rx="18" fill="${D}"/><circle r="40" fill="#1e293b" stroke="#475569" stroke-width="8"/><circle r="20" fill="#1d4ed8"/><rect x="-60" y="-80" width="50" height="24" rx="6" fill="${D}"/></g>`],
  [/kilometraz/, r => speedo(400, 290) + `<g transform="translate(400 360)"><rect x="-120" y="-30" width="240" height="56" rx="8" fill="${L}" stroke="${D}" stroke-width="5"/><text y="14" font-family="Courier New" font-weight="700" font-size="38" text-anchor="middle" fill="${D}">187 342</text></g>`],
  [/pregled-rabljenog|tehnicki-pregled|registracija/, r => car(330, 310, .85) + checklist(620, 230).replace('translate(620 230)', 'translate(630 220) scale(.6)')],
  [/zoll|izvozne/, r => car(330, 330, .8) + plate(400, 110, 'HH 04 123', L).replace(`fill="#1d4ed8"/>`, `fill="#1d4ed8"/><rect x="110" y="-38" width="60" height="76" fill="${R}"/>`)],
  [/uvoz/, r => car(320, 320, .8) + flagEU(600, 120)],
  [/coc|potvrda-proizvodaca/, r => docs(360, 230) + `<g transform="translate(590 160)"><circle r="56" fill="#1d4ed8"/>${Array.from({ length: 12 }, (_, i) => `<circle cx="${36 * Math.cos(i * Math.PI / 6)}" cy="${36 * Math.sin(i * Math.PI / 6)}" r="5" fill="${A}"/>`).join('')}</g>`],
  [/kategorije-vozila/, r => motorbike(200, 330).replace('translate(200 330)', 'translate(190 330) scale(.6)') + car(420, 340, .55) + truck(640, 330).replace('translate(640 330)', 'translate(650 340) scale(.5)')],
  [/prva-pomoc/, r => firstAid()],
  [/ispit-iz-prometnih|ispit|vozacki/, r => checklist(320, 230) + lSign(600, 160)],
  [/koliko-traje|vrijeme-punjenja/, r => /punjenja/.test(r.slug) ? battery(330, 240, .55) + clock(640, 210).replace('translate(640 210)', 'translate(640 200) scale(.55)') : clock(320, 230) + lSign(620, 170)],
  [/upis|vodic-za-upis|izabrati-autoskolu|prebacivanje/, r => car(360, 310, .9, L) + lSign(380, 160).replace('translate(380 160)', 'translate(370 165) scale(.7)') + (/prebacivanje/.test(r.slug) ? `<path d="M560 140 L700 140 M670 110 L700 140 L670 170" fill="none" stroke="${L}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>` : '')],
  [/diskreditirajuc|upravljanja-vozilom/, r => car(360, 310, .9) + `<g transform="translate(640 160)"><circle r="62" fill="${R}" stroke="${D}" stroke-width="6"/><path d="M-26 -26 L26 26 M26 -26 L-26 26" stroke="${L}" stroke-width="16" stroke-linecap="round"/></g>`],
  [/cestarin|crolibertas/, r => road(400, 225) + `<g transform="translate(400 70)"><rect x="-300" y="-30" width="600" height="60" fill="${D}"/>${[-200, 0, 200].map(px => `<rect x="${px - 50}" y="-12" width="100" height="24" rx="4" fill="${G}"/>`).join('')}</g>`],
  [/2035|benzinci|eu-zabrana/, r => car(330, 320, .8) + flagEU(600, 110)],
  [/punjac|punjenje|punjenja/, r => car(280, 320, .75) + charger(620, 240)],
  [/baterij/, r => battery()],
  [/domet/, r => road(400, 225) + battery(400, 90, .8).replace('translate(400 90)', 'translate(620 110) scale(.4)')],
  [/poticaj/, r => plug(300, 240, .8) + euro(620, 310, .75)],
  [/hibrid/, r => car(330, 310, .85) + `<g transform="translate(630 220)"><circle cx="-40" r="50" fill="${G}" stroke="${D}" stroke-width="6"/><circle cx="40" r="50" fill="${A}" stroke="${D}" stroke-width="6" opacity=".9"/><text x="-40" y="16" font-family="Arial" font-weight="900" font-size="44" text-anchor="middle" fill="${L}">E</text></g>`],
  [/elektricn/, r => car(330, 310, .85, L, '#a7f3d0') + plug(650, 260, .55)],
];

const CATEGORY_FALLBACK = {
  'Vijesti': r => car(400, 300), 'Električna vozila': r => car(280, 320, .75) + charger(620, 240),
  'Autoškola': r => car(360, 310, .9) + lSign(620, 150), 'Vožnja': r => road(),
  'Održavanje': r => engine(400, 240, false), 'Kupnja i prodaja': r => car(330, 310, .85) + euro(640, 300, .7),
  'Uvoz i dokumenti': r => docs(), 'Oprema': r => dashcam(), 'Bicikli': r => bike(),
  'Zanimljivosti': r => car(400, 300, 1, ['#be123c', '#1e3a8a', '#e2e8f0', A, '#4d7c0f'][Math.floor(r() * 5)]),
};

function background(color, rand, seed) {
  const a = 110 + Math.floor(rand() * 70);
  const dark = shade(color, -.35), light = shade(color, .25);
  const shapes = Array.from({ length: 5 }, () => {
    const t = rand();
    const x = Math.floor(rand() * W), y = Math.floor(rand() * H), s = 30 + Math.floor(rand() * 140);
    return t < .45 ? `<circle cx="${x}" cy="${y}" r="${s}" fill="${L}" opacity="${(.04 + rand() * .07).toFixed(2)}"/>`
      : t < .75 ? `<rect x="${x}" y="${y}" width="${s * 1.6}" height="${s}" rx="${s / 4}" fill="${L}" opacity="${(.04 + rand() * .06).toFixed(2)}" transform="rotate(${Math.floor(rand() * 60 - 30)} ${x} ${y})"/>`
      : `<circle cx="${x}" cy="${y}" r="${s}" fill="none" stroke="${L}" stroke-width="${6 + Math.floor(rand() * 10)}" opacity="${(.06 + rand() * .06).toFixed(2)}"/>`;
  }).join('');
  return `<defs><linearGradient id="bg${seed}" gradientTransform="rotate(${a - 90} .5 .5)"><stop offset="0" stop-color="${dark}"/><stop offset=".6" stop-color="${color}"/><stop offset="1" stop-color="${light}"/></linearGradient>
  <marker id="ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${A}"/></marker></defs>
  <rect width="${W}" height="${H}" fill="url(#bg${seed})"/>${shapes}
  <ellipse cx="${W / 2}" cy="${H - 40}" rx="${W * .42}" ry="26" fill="${D}" opacity=".18"/>`;
}

function illustrate(post, color) {
  const seed = hash(post.slug);
  const rand = rnd(seed);
  const r = Object.assign(rand, { slug: post.slug });
  const rule = RULES.find(([re]) => re.test(post.slug));
  const art = rule ? rule[1](r) : CATEGORY_FALLBACK[post.category](r);
  // Blago pomicanje i skaliranje da slike iste teme ne izgledaju identično.
  const dx = Math.floor(rand() * 40 - 20), dy = Math.floor(rand() * 16 - 8), sc = (.92 + rand() * .1).toFixed(3);
  const tf = `translate(${W / 2 + dx} ${H / 2 + dy}) scale(${sc}) translate(${-W / 2} ${-H / 2})`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}" role="img" aria-label="${post.title.replace(/[&"<]/g, '')}">
${background(color, rand, seed)}
<g transform="${tf}">${art}</g>
</svg>`;
}

module.exports = { illustrate };
