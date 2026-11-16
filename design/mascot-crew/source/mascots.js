// MudKitchen mascot renderer: four characters, one shared face kit.
// Every view of a character is drawn from the same body geometry; only the
// face, limbs, accessories and props change.

const P = {
  ink: '#2B241D', clay: '#A05C45', clayDeep: '#7E4533', forest: '#2E4A3C',
  moss: '#A6B89A', butter: '#FFE58A', peach: '#F8DDCF', cream: '#F7F1E7',
  mint: '#DDEBD5', sky: '#E3EDFB', lav: '#ECE2F3',
  blush: '#EE8A72', mouth: '#5A2219', tongue: '#EC8F84',
};

let UID = 0;
const nid = (p) => `${p}${++UID}`;
const r1 = (n) => Math.round(n * 10) / 10;

// ---------- defs helpers ----------
function stops(list) {
  return list.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('');
}
function radial(id, list, cx = 0.38, cy = 0.3, r = 0.8) {
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops(list)}</radialGradient>`;
}
function linear(id, list, x1 = 0, y1 = 0, x2 = 0, y2 = 1) {
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(list)}</linearGradient>`;
}
// Fine paper/clay grain multiplied into a shape. Kept light so small sizes stay clean.
function grain(id, freq = 0.9, lo = 0.84) {
  const s = (1 - lo).toFixed(2);
  return `<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">`
    + `<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="7" result="n"/>`
    + `<feColorMatrix in="n" type="saturate" values="0" result="g"/>`
    + `<feComponentTransfer in="g" result="t"><feFuncR type="linear" slope="${s}" intercept="${lo}"/><feFuncG type="linear" slope="${s}" intercept="${lo}"/><feFuncB type="linear" slope="${s}" intercept="${lo}"/><feFuncA type="table" tableValues="1 1"/></feComponentTransfer>`
    + `<feComposite in="t" in2="SourceGraphic" operator="in" result="m"/>`
    + `<feBlend in="m" in2="SourceGraphic" mode="multiply"/></filter>`;
}

// ---------- shapes ----------
function limb(pts, w, col, edge, ew = 4) {
  const [a, b, c] = pts;
  const d = `M${a[0]},${a[1]} Q${b[0]},${b[1]} ${c[0]},${c[1]}`;
  return `<path d="${d}" fill="none" stroke="${edge}" stroke-width="${w + ew}" stroke-linecap="round"/>`
    + `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
}
function dirOf(pts) {
  const [b, c] = [pts[1], pts[2]];
  const dx = c[0] - b[0], dy = c[1] - b[1];
  const L = Math.hypot(dx, dy) || 1;
  return [dx / L, dy / L];
}
function leaf(x, y, len, ang, wid, fill, rib = '#E4EED8') {
  return `<g transform="translate(${x},${y}) rotate(${ang})">`
    + `<path d="M0,0 C${wid},${-len * 0.25} ${wid * 0.8},${-len * 0.85} 0,${-len} C${-wid * 0.8},${-len * 0.85} ${-wid},${-len * 0.25} 0,0Z" fill="${fill}"/>`
    + `<path d="M0,-2 Q${wid * 0.15},${-len * 0.5} 0,${-len * 0.84}" stroke="${rib}" stroke-width="1.6" fill="none" opacity=".75" stroke-linecap="round"/></g>`;
}
function heart(x, y, s, id) {
  const d = `M0,${s * 0.9} C${-s * 1.45},${-s * 0.05} ${-s * 0.75},${-s * 1.15} 0,${-s * 0.42} C${s * 0.75},${-s * 1.15} ${s * 1.45},${-s * 0.05} 0,${s * 0.9}Z`;
  return radial(id, [[0, '#FF9F86'], [0.7, '#E5664E'], [1, '#C9503B']], 0.35, 0.3, 0.9)
    + `<g transform="translate(${x},${y}) rotate(-6)"><path d="${d}" fill="url(#${id})" stroke="#A8402E" stroke-width="1.6"/>`
    + `<ellipse cx="${-s * 0.45}" cy="${-s * 0.42}" rx="${s * 0.22}" ry="${s * 0.13}" transform="rotate(-35 ${-s * 0.45} ${-s * 0.42})" fill="#fff" opacity=".7"/></g>`;
}
function sparkle(x, y, r, col = '#F4C430') {
  return `<path d="M${x},${y - r} Q${x},${y} ${x + r},${y} Q${x},${y} ${x},${y + r} Q${x},${y} ${x - r},${y} Q${x},${y} ${x},${y - r}Z" fill="${col}"/>`;
}
function question(x, y, s, col = P.forest) {
  return `<g transform="rotate(12 ${x} ${y})"><path d="M${x - s * 0.5},${y - s * 0.55} C${x - s * 0.5},${y - s * 1.25} ${x + s * 0.62},${y - s * 1.25} ${x + s * 0.62},${y - s * 0.55} C${x + s * 0.62},${y - s * 0.05} ${x},${y - s * 0.02} ${x},${y + s * 0.38}" fill="none" stroke="${col}" stroke-width="${s * 0.26}" stroke-linecap="round"/>`
    + `<circle cx="${x}" cy="${y + s * 0.82}" r="${s * 0.16}" fill="${col}"/></g>`;
}
const CONFETTI = [
  [30, 40, 20, '#F4C430', 'r'], [62, 16, -30, '#7FA06C', 'c'], [96, 28, 45, '#E8826B', 'r'],
  [152, 14, 10, '#7FA8DC', 'r'], [190, 32, -40, '#F4C430', 'c'], [214, 62, 30, '#B08AD0', 'r'],
  [20, 94, -15, '#7FA8DC', 'c'], [222, 112, 60, '#E8826B', 'r'], [38, 140, 10, '#B08AD0', 'r'],
  [176, 6, 0, '#E8826B', 'c'], [124, 6, 70, '#7FA06C', 'r'], [206, 160, -20, '#F4C430', 'r'],
];
function confetti() {
  return CONFETTI.map(([x, y, a, c, k]) => k === 'c'
    ? `<circle cx="${x}" cy="${y}" r="3.6" fill="${c}"/>`
    : `<rect x="${x - 5}" y="${y - 2.2}" width="10" height="4.4" rx="1.4" fill="${c}" transform="rotate(${a} ${x} ${y})"/>`).join('')
    + `<path d="M70,62 q6,-8 12,0 t12,0" fill="none" stroke="#E8826B" stroke-width="2.6" stroke-linecap="round"/>`
    + `<path d="M166,66 q6,-8 12,0 t12,0" fill="none" stroke="#7FA06C" stroke-width="2.6" stroke-linecap="round"/>`;
}
function waveLines(h) {
  const [x, y] = h;
  return `<g fill="none" stroke="${P.ink}" stroke-opacity=".45" stroke-width="3" stroke-linecap="round">`
    + `<path d="M${x + 14},${y - 16} Q${x + 22},${y - 4} ${x + 14},${y + 8}"/>`
    + `<path d="M${x - 14},${y - 16} Q${x - 22},${y - 4} ${x - 14},${y + 8}"/></g>`;
}

// ---------- face kit ----------
const EXPR = {
  neutral: { eyes: ['open', 'open'], look: [0, 0.1], mouth: 'smile' },
  happy: { eyes: ['happy', 'happy'], mouth: 'grin', cheek: 1.3, props: ['sparkles'], lift: -6 },
  curious: { eyes: ['open', 'open'], look: [0.6, -0.65], mouth: 'o', mouthDx: 0.35, brows: 'raise', props: ['question'], tilt: 6 },
  silly: { eyes: ['wink', 'open'], look: [-0.35, 0], mouth: 'tongue', brows: 'mischief', tilt: -7 },
  supportive: { eyes: ['soft', 'soft'], look: [0, 0.2], mouth: 'soft', brows: 'kind', cheek: 1.15 },
  celebrate: { eyes: ['big', 'big'], look: [0, -0.2], mouth: 'grin', mouthScale: 1.2, props: ['confetti'], lift: -14 },
  wave: { eyes: ['open', 'open'], look: [0.15, 0], mouth: 'grin', mouthScale: 0.82, props: ['wavelines'] },
};
const POSE = { neutral: 'rest', happy: 'cheer', curious: 'think', silly: 'rest', supportive: 'heart', celebrate: 'up', wave: 'wave' };
// [dy, angle] for left and right brow
const BROWS = {
  raise: [[0, -4], [-8, -12]],
  mischief: [[3, 16], [-6, -8]],
  kind: [[-2, -14], [-2, 14]],
};

function eye(x, y, r, k, look, ink) {
  if (k === 'happy' || k === 'wink') {
    return `<path d="M${r1(x - r * 0.85)},${r1(y + r * 0.3)} Q${x},${r1(y - r * 1.1)} ${r1(x + r * 0.85)},${r1(y + r * 0.3)}" fill="none" stroke="${ink}" stroke-width="${r1(r * 0.42)}" stroke-linecap="round"/>`;
  }
  const lx = r1(x + look[0] * r * 0.3), ly = r1(y + look[1] * r * 0.28);
  const R = k === 'big' ? r * 1.15 : k === 'soft' ? r * 0.95 : r;
  const ry = k === 'soft' ? R * 0.86 : R;
  let s = `<ellipse cx="${lx}" cy="${ly}" rx="${r1(R * 0.84)}" ry="${r1(ry)}" fill="${ink}"/>`;
  s += `<circle cx="${r1(lx + R * 0.3)}" cy="${r1(ly - ry * 0.38)}" r="${r1(R * (k === 'big' ? 0.4 : 0.33))}" fill="#fff"/>`;
  s += `<circle cx="${r1(lx - R * 0.3)}" cy="${r1(ly + ry * 0.38)}" r="${r1(R * (k === 'big' ? 0.2 : 0.14))}" fill="#fff" opacity=".9"/>`;
  return s;
}
function brow(x, y, w, ang, col) {
  return `<path d="M${-w / 2},0 Q0,${r1(-w * 0.3)} ${w / 2},0" transform="translate(${x},${y}) rotate(${ang})" fill="none" stroke="${col}" stroke-width="${r1(w * 0.24)}" stroke-linecap="round"/>`;
}
function mouth(x, y, s, k, id, ink) {
  const sw = r1(Math.max(2.4, s * 0.26));
  switch (k) {
    case 'smile':
      return `<path d="M${x - s},${y} Q${x},${r1(y + s * 0.85)} ${x + s},${y}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>`;
    case 'soft': {
      const t = s * 0.72;
      return `<path d="M${r1(x - t)},${y} Q${x},${r1(y + t * 0.75)} ${r1(x + t)},${y}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>`;
    }
    case 'grin': {
      const d = `M${r1(x - s)},${r1(y - s * 0.1)} Q${x},${r1(y + s * 1.75)} ${r1(x + s)},${r1(y - s * 0.1)} Q${x},${r1(y + s * 0.22)} ${r1(x - s)},${r1(y - s * 0.1)}Z`;
      return `<clipPath id="${id}m"><path d="${d}"/></clipPath><path d="${d}" fill="${P.mouth}" stroke="${ink}" stroke-width="${r1(sw * 0.55)}" stroke-linejoin="round"/>`
        + `<ellipse cx="${x}" cy="${r1(y + s * 1.12)}" rx="${r1(s * 0.58)}" ry="${r1(s * 0.45)}" fill="${P.tongue}" clip-path="url(#${id}m)"/>`;
    }
    case 'o':
      return `<ellipse cx="${x}" cy="${r1(y + s * 0.3)}" rx="${r1(s * 0.34)}" ry="${r1(s * 0.42)}" fill="${P.mouth}" stroke="${ink}" stroke-width="${r1(sw * 0.5)}"/>`;
    case 'tongue':
      return `<path d="M${r1(x + s * 0.02)},${r1(y + s * 0.28)} C${r1(x)},${r1(y + s * 1.18)} ${r1(x + s * 0.74)},${r1(y + s * 1.14)} ${r1(x + s * 0.68)},${r1(y + s * 0.12)}Z" fill="${P.tongue}" stroke="${ink}" stroke-width="${r1(sw * 0.5)}" stroke-linejoin="round"/>`
        + `<path d="M${r1(x + s * 0.36)},${r1(y + s * 0.36)} L${r1(x + s * 0.37)},${r1(y + s * 0.72)}" stroke="#C9675C" stroke-width="${r1(sw * 0.45)}" stroke-linecap="round"/>`
        + `<path d="M${x - s},${r1(y - s * 0.05)} Q${r1(x - s * 0.1)},${r1(y + s * 0.7)} ${r1(x + s * 0.95)},${r1(y - s * 0.3)}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>`;
    default: return '';
  }
}
// F = face anchors for a character
function face(F, E, id) {
  const look = E.look || [0, 0];
  const ck = E.cheek || 1;
  let s = radial(id + 'k', [[0, P.blush, 0.8], [1, P.blush, 0]], 0.5, 0.5, 0.5);
  F.cheekX.forEach((cx) => {
    s += `<ellipse cx="${cx}" cy="${F.cheekY}" rx="${r1(F.cheekR[0] * ck)}" ry="${r1(F.cheekR[1] * ck)}" fill="url(#${id}k)" opacity="${F.blushOp || 0.75}"/>`;
  });
  if (F.ex) E.eyes.forEach((k, i) => { s += eye(F.ex[i], F.ey, F.er, k, look, F.ink); });
  const B = BROWS[E.brows];
  if (B && F.browY != null) {
    B.forEach(([dy, a], i) => { s += brow(F.ex[i], F.browY + dy, F.browW, a, F.browCol); });
  }
  s += mouth(r1(F.mx + (E.mouthDx || 0) * F.ms), F.my, r1(F.ms * (E.mouthScale || 1)), E.mouth, id, F.ink);
  return s;
}

const mirror = (spec) => ({ p: spec.p.map(([x, y]) => [240 - x, y]), front: spec.front });

// Generic arm pass. hand(pts, side) draws a hand at the end of a limb.
function arms(spec, layer, style, hand) {
  let s = '';
  ['L', 'R'].forEach((side) => {
    const a = spec[side];
    if (!a || !!a.front !== (layer === 'front')) return;
    s += limb(a.p, style.w, style.col, style.edge, style.ew);
    if (hand) s += hand(a.p, side);
  });
  return s;
}

function frame({ id, defs, shadow, lift = 0, tilt = 0, pivot, inner, props = '' }) {
  const [px, py] = pivot;
  const sh = shadow ? `<ellipse cx="${shadow[0]}" cy="${shadow[1]}" rx="${r1(shadow[2] * (1 + lift / 60))}" ry="${r1(shadow[3] * (1 + lift / 80))}" fill="${P.ink}" opacity="${lift ? 0.1 : 0.14}"/>` : '';
  return { defs, body: `${sh}<g transform="translate(0,${lift}) rotate(${tilt} ${px} ${py})">${inner}</g>${props}` };
}

function globalProps(E, C, pose, armSpec, expr) {
  let s = '';
  const props = E.props || [];
  if (props.includes('sparkles')) C.sparkles.forEach(([x, y, r]) => { s += sparkle(x, y, r); });
  if (props.includes('question')) s += question(C.q[0], C.q[1], 15);
  if (props.includes('confetti')) s += confetti();
  if (props.includes('wavelines') && armSpec.R) s += waveLines(armSpec.R.p[2]);
  return s;
}

// =====================================================================
// 1. PIP: the mud-pie sprout
// =====================================================================
const PIP = {
  body: 'M120,78 C170,78 194,128 195,170 C196,214 162,237 120,237 C78,237 44,214 45,170 C46,128 70,78 120,78Z',
  face: { ex: [90, 150], ey: 150, er: 14.5, browY: 125, browW: 16, browCol: '#5B2E20', mx: 120, my: 176, ms: 12.5, cheekX: [68, 172], cheekY: 172, cheekR: [15, 9.5], ink: P.ink },
  q: [200, 92], sparkles: [[34, 96, 7], [206, 82, 9], [216, 150, 6]], heart: [120, 208, 20],
  leaves: { neutral: [-52, 48], happy: [-34, 32], curious: [-74, 14], silly: [-106, 38], supportive: [-64, 64], celebrate: [-20, 22], wave: [-44, 72] },
  bend: { curious: -7, silly: 7 },
};
(() => {
  const rest = { p: [[62, 176], [42, 186], [38, 206]] };
  const heartL = { p: [[64, 190], [80, 216], [98, 210]], front: true };
  PIP.arms = {
    rest: { L: rest, R: mirror(rest) },
    cheer: { L: { p: [[60, 168], [36, 160], [24, 138]] }, R: mirror({ p: [[60, 168], [36, 160], [24, 138]] }) },
    up: { L: { p: [[64, 158], [44, 128], [38, 98]] }, R: mirror({ p: [[64, 158], [44, 128], [38, 98]] }) },
    wave: { L: rest, R: { p: [[178, 166], [206, 148], [210, 112]] } },
    think: { L: rest, R: { p: [[174, 190], [172, 216], [146, 200]], front: true } },
    heart: { L: heartL, R: mirror(heartL) },
  };
})();
function pip(o) {
  const E = EXPR[o.expr], pose = o.pose || POSE[o.expr], id = nid('pip');
  const A = PIP.arms[pose];
  const style = { w: 15, col: '#A65E43', edge: '#7A3F2B', ew: 4 };
  const defs = radial(id + 'b', [[0, '#EDA984'], [0.5, '#C97A58'], [1, '#93492F']], 0.36, 0.28, 0.85)
    + linear(id + 'l', [[0, '#A8CB8E'], [1, '#4E7B45']])
    + (o.simple ? '' : grain(id + 'g', 0.9, 0.82));
  const [la, ra] = PIP.leaves[o.expr];
  const big = o.expr === 'celebrate' ? 4 : 0;
  const tip = [121 + (PIP.bend[o.expr] || 0), 54];
  let s = '';
  s += arms(A, 'back', style);
  s += `<ellipse cx="96" cy="234" rx="18" ry="9" fill="#7A3F2B"/><ellipse cx="144" cy="234" rx="18" ry="9" fill="#7A3F2B"/>`;
  s += `<path d="M120,90 Q${118 + (PIP.bend[o.expr] || 0) * 0.3},68 ${tip[0]},${tip[1]}" fill="none" stroke="#557F47" stroke-width="5.5" stroke-linecap="round"/>`;
  s += leaf(tip[0], tip[1] + 2, 36 + big, la, 13, `url(#${id}l)`) + leaf(tip[0], tip[1] + 2, 40 + big, ra, 14, `url(#${id}l)`);
  s += `<g${o.simple ? '' : ` filter="url(#${id}g)"`}><path d="${PIP.body}" fill="url(#${id}b)"/></g>`;
  s += `<path d="${PIP.body}" fill="none" stroke="#6E3826" stroke-width="2.2" stroke-opacity=".55"/>`;
  s += `<ellipse cx="88" cy="110" rx="22" ry="10" transform="rotate(-34 88 110)" fill="#fff" opacity=".28"/><ellipse cx="111" cy="94" rx="6" ry="3.4" transform="rotate(-10 111 94)" fill="#fff" opacity=".35"/>`;
  if (!o.simple) {
    s += [[152, 208, 2.4], [162, 197, 1.6], [84, 214, 2], [172, 184, 1.4], [72, 198, 1.5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#6E3826" opacity=".35"/>`).join('');
    s += [[98, 100, 1.8], [140, 96, 1.3], [158, 112, 1.1]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#F3C3A4" opacity=".6"/>`).join('');
  }
  s += face(PIP.face, E, id);
  if (pose === 'heart') s += heart(...PIP.heart, id + 'h');
  s += arms(A, 'front', style);
  return frame({ id, defs, shadow: [120, 241, 64, 7], lift: E.lift || 0, tilt: E.tilt || 0, pivot: [120, 238], inner: s, props: globalProps(E, PIP, pose, A, o.expr) });
}

// =====================================================================
// 2. NUTMEG: the acorn kid
// =====================================================================
const NUT = {
  body: 'M120,92 C170,92 192,132 190,170 C188,208 158,236 124,238 Q120,243 116,238 C82,236 52,208 50,170 C48,132 70,92 120,92Z',
  cap: 'M38,110 C36,72 74,50 120,50 C166,50 204,72 202,110 C204,124 180,129 120,129 C60,129 36,124 38,110Z',
  face: { ex: [91, 149], ey: 164, er: 14, browY: 142, browW: 15, browCol: '#7A4A28', mx: 120, my: 192, ms: 12, cheekX: [68, 172], cheekY: 184, cheekR: [14, 9], ink: P.ink },
  q: [214, 70], sparkles: [[26, 104, 7], [216, 146, 8], [28, 176, 5]], heart: [120, 216, 18],
  capT: { neutral: [-6, 0, 0], happy: [-10, 0, -5], curious: [14, 0, 2], silly: [-20, -4, 6], supportive: [-3, 0, 0], celebrate: [-16, 0, -22], wave: [-8, 0, 0] },
};
(() => {
  const rest = { p: [[60, 182], [42, 198], [38, 218]] };
  const cheer = { p: [[58, 174], [36, 162], [26, 140]] };
  const up = { p: [[60, 162], [42, 130], [38, 100]] };
  const heartL = { p: [[62, 198], [80, 220], [100, 214]], front: true };
  NUT.arms = {
    rest: { L: rest, R: mirror(rest) }, cheer: { L: cheer, R: mirror(cheer) }, up: { L: up, R: mirror(up) },
    wave: { L: rest, R: { p: [[180, 170], [206, 150], [212, 114]] } },
    think: { L: rest, R: { p: [[180, 190], [174, 216], [148, 206]], front: true } },
    heart: { L: heartL, R: mirror(heartL) },
  };
})();
function twigHand(pts) {
  const [dx, dy] = dirOf(pts);
  const [x, y] = pts[2];
  const rot = (a) => [dx * Math.cos(a) - dy * Math.sin(a), dx * Math.sin(a) + dy * Math.cos(a)];
  return [-0.75, 0, 0.75].map((a) => {
    const [ux, uy] = rot(a);
    const L = a === 0 ? 7 : 9;
    return `<path d="M${x},${y} L${r1(x + ux * L)},${r1(y + uy * L)}" stroke="#5A3A26" stroke-width="4" stroke-linecap="round"/>`;
  }).join('');
}
function nutmeg(o) {
  const E = EXPR[o.expr], pose = o.pose || POSE[o.expr], id = nid('nut');
  const A = NUT.arms[pose];
  const style = { w: 5, col: '#7A5236', edge: '#4E321F', ew: 2.5 };
  const defs = radial(id + 'b', [[0, '#F3C68D'], [0.5, '#D49354'], [1, '#A2652F']], 0.36, 0.3, 0.85)
    + linear(id + 'c', [[0, '#A87650'], [1, '#6B452B']])
    + linear(id + 'l', [[0, '#A8CB8E'], [1, '#4E7B45']])
    + `<pattern id="${id}s" width="12" height="9" patternUnits="userSpaceOnUse"><path d="M0,9 Q6,1 12,9" stroke="#4E321F" stroke-width="1.6" fill="none"/></pattern>`
    + (o.simple ? '' : grain(id + 'g', 0.9, 0.84));
  const [rot, cdx, cdy] = NUT.capT[o.expr];
  let s = '';
  s += arms(A, 'back', style, twigHand);
  s += `<ellipse cx="100" cy="238" rx="15" ry="8" fill="#6B4630"/><ellipse cx="140" cy="238" rx="15" ry="8" fill="#6B4630"/>`;
  s += `<g${o.simple ? '' : ` filter="url(#${id}g)"`}><path d="${NUT.body}" fill="url(#${id}b)"/></g>`;
  s += `<path d="${NUT.body}" fill="none" stroke="#7E4A22" stroke-width="2.2" stroke-opacity=".55"/>`;
  s += `<path d="M66,150 Q60,192 88,226" fill="none" stroke="#B5763A" stroke-width="2" opacity=".4" stroke-linecap="round"/><path d="M174,150 Q180,192 152,226" fill="none" stroke="#B5763A" stroke-width="2" opacity=".4" stroke-linecap="round"/>`;
  s += `<ellipse cx="80" cy="140" rx="12" ry="7" transform="rotate(-40 80 140)" fill="#fff" opacity=".25"/>`;
  s += face(NUT.face, E, id);
  // cap
  s += `<g transform="translate(${cdx},${cdy}) rotate(${rot} 120 106)">`
    + `<path d="M120,54 C118,42 122,34 130,30" fill="none" stroke="#5A3A26" stroke-width="7" stroke-linecap="round"/>`
    + leaf(130, 32, 26, 58, 9, `url(#${id}l)`)
    + `<path d="${NUT.cap}" fill="url(#${id}c)"/><path d="${NUT.cap}" fill="url(#${id}s)" opacity=".5"/>`
    + `<path d="${NUT.cap}" fill="none" stroke="#4E321F" stroke-width="2" stroke-opacity=".6"/>`
    + `<path d="M44,115 C70,127 170,127 196,115" fill="none" stroke="#C99A6C" stroke-width="3" stroke-linecap="round" opacity=".8"/>`
    + `<ellipse cx="88" cy="70" rx="22" ry="7" transform="rotate(-18 88 70)" fill="#fff" opacity=".18"/></g>`;
  if (pose === 'heart') s += heart(...NUT.heart, id + 'h');
  s += arms(A, 'front', style, twigHand);
  return frame({ id, defs, shadow: [120, 243, 60, 7], lift: E.lift || 0, tilt: E.tilt || 0, pivot: [120, 240], inner: s, props: globalProps(E, NUT, pose, A, o.expr) });
}

// =====================================================================
// 3. DIG: the little mole chef
// =====================================================================
const DIG = {
  body: 'M120,66 C170,66 194,110 194,160 C194,212 164,238 120,238 C76,238 46,212 46,160 C46,110 70,66 120,66Z',
  face: { ex: [90, 150], ey: 122, er: 10, browY: 92, browW: 16, browCol: '#4A352C', mx: 120, my: 175, ms: 11, cheekX: [62, 178], cheekY: 160, cheekR: [11, 7], ink: P.ink },
  q: [204, 70], sparkles: [[28, 88, 7], [212, 92, 9], [218, 160, 6]], heart: [120, 222, 18],
  spoon: { neutral: ['R', 10], happy: ['R', 20], celebrate: ['R', 8], wave: ['L', -12], curious: ['L', -12], silly: ['L', -30] },
};
(() => {
  const rest = { p: [[60, 184], [44, 198], [40, 216]] };
  const cheer = { p: [[58, 176], [36, 164], [28, 142]] };
  const up = { p: [[60, 166], [42, 134], [36, 104]] };
  const heartL = { p: [[64, 198], [84, 224], [100, 220]], front: true };
  DIG.arms = {
    rest: { L: rest, R: mirror(rest) }, cheer: { L: cheer, R: mirror(cheer) }, up: { L: up, R: mirror(up) },
    wave: { L: rest, R: { p: [[180, 172], [206, 152], [210, 116]] } },
    think: { L: rest, R: { p: [[180, 194], [172, 220], [150, 210]], front: true } },
    heart: { L: heartL, R: mirror(heartL) },
  };
})();
function paw(pts, id) {
  const [dx, dy] = dirOf(pts);
  const [x, y] = pts[2];
  const ang = Math.atan2(dy, dx) * 180 / Math.PI;
  let s = `<ellipse cx="${x}" cy="${y}" rx="13" ry="11.5" transform="rotate(${r1(ang)} ${x} ${y})" fill="url(#${id}p)" stroke="#B66A5A" stroke-width="1.6"/>`;
  [-6, 0, 6].forEach((o) => {
    const cx = r1(x + dx * 11 - dy * o), cy = r1(y + dy * 11 + dx * o);
    s += `<ellipse cx="${cx}" cy="${cy}" rx="4.4" ry="2.6" transform="rotate(${r1(ang)} ${cx} ${cy})" fill="#FFF4E6" stroke="#D9BFA5" stroke-width="1"/>`;
  });
  return s;
}
function spoon(p, a, id) {
  const t = a * Math.PI / 180, ux = Math.sin(t), uy = -Math.cos(t);
  const [x, y] = p;
  const h1 = [r1(x - ux * 12), r1(y - uy * 12)], h2 = [r1(x + ux * 50), r1(y + uy * 50)], b = [r1(x + ux * 63), r1(y + uy * 63)];
  return `<path d="M${h1[0]},${h1[1]} L${h2[0]},${h2[1]}" stroke="#7E5530" stroke-width="9" stroke-linecap="round"/><path d="M${h1[0]},${h1[1]} L${h2[0]},${h2[1]}" stroke="#C48E57" stroke-width="5.5" stroke-linecap="round"/>`
    + `<g transform="rotate(${a} ${b[0]} ${b[1]})"><ellipse cx="${b[0]}" cy="${b[1]}" rx="10" ry="14" fill="url(#${id}w)" stroke="#7E5530" stroke-width="2"/>`
    + `<ellipse cx="${b[0]}" cy="${r1(b[1] + 1)}" rx="6.5" ry="9.5" fill="#6B4A35" opacity=".8"/><ellipse cx="${r1(b[0] - 2)}" cy="${r1(b[1] - 3)}" rx="2" ry="3" fill="#fff" opacity=".35"/></g>`;
}
function dig(o) {
  const E = EXPR[o.expr], pose = o.pose || POSE[o.expr], id = nid('dig');
  const A = DIG.arms[pose];
  const style = { w: 17, col: '#7C5E52', edge: '#4A352C', ew: 4 };
  const F = DIG.face;
  const defs = radial(id + 'b', [[0, '#AC8E7A'], [0.55, '#84665A'], [1, '#5C443A']], 0.36, 0.28, 0.85)
    + radial(id + 'z', [[0, '#F5E3D2'], [1, '#D6B49C']], 0.45, 0.35, 0.75)
    + radial(id + 'n', [[0, '#FFC6B8'], [0.6, '#EE8F7F'], [1, '#C9685A']], 0.4, 0.3, 0.8)
    + radial(id + 'p', [[0, '#F9C3B4'], [1, '#DB8C7B']], 0.4, 0.35, 0.8)
    + radial(id + 'w', [[0, '#E2B07A'], [1, '#A87040']], 0.4, 0.3, 0.8)
    + linear(id + 'a', [[0, '#FFEFB0'], [1, '#F2CF5E']])
    + `<clipPath id="${id}c"><path d="${DIG.body}"/></clipPath>`
    + (o.simple ? '' : grain(id + 'g', 1.1, 0.84));
  let s = '';
  s += arms(A, 'back', style);
  s += `<ellipse cx="98" cy="236" rx="17" ry="8" fill="#4A352C"/><ellipse cx="142" cy="236" rx="17" ry="8" fill="#4A352C"/>`;
  s += `<path d="M104,74 C100,58 110,52 115,64 C114,46 128,44 128,60 C134,50 144,56 138,74Z" fill="#8E7062"/>`;
  s += `<g${o.simple ? '' : ` filter="url(#${id}g)"`}><path d="${DIG.body}" fill="url(#${id}b)"/></g>`;
  s += `<path d="${DIG.body}" fill="none" stroke="#3E2C24" stroke-width="2.2" stroke-opacity=".5"/>`;
  s += `<ellipse cx="82" cy="94" rx="18" ry="8" transform="rotate(-34 82 94)" fill="#fff" opacity=".18"/>`;
  // apron
  s += `<g clip-path="url(#${id}c)"><path d="M78,206 C78,199 162,199 162,206 L168,242 L72,242Z" fill="url(#${id}a)"/>`
    + `<path d="M78,206 C100,200 140,200 162,206" fill="none" stroke="#DDB847" stroke-width="3"/>`
    + `<path d="M104,214 h32 v9 q0,8 -8,8 h-16 q-8,0 -8,-8Z" fill="#FFF6D0" stroke="#DDB847" stroke-width="2"/>`
    + `<ellipse cx="150" cy="226" rx="6" ry="4" fill="#8A5A40" opacity=".5"/><circle cx="158" cy="220" r="1.8" fill="#8A5A40" opacity=".5"/></g>`;
  // muzzle + nose
  s += `<ellipse cx="120" cy="170" rx="44" ry="31" fill="url(#${id}z)"/>`;
  s += `<path d="M120,162 L120,171" stroke="${P.ink}" stroke-width="2.6" stroke-linecap="round"/>`;
  s += face(F, E, id);
  s += `<ellipse cx="120" cy="151" rx="17" ry="12.5" fill="url(#${id}n)"/><ellipse cx="114" cy="146" rx="5" ry="3" fill="#fff" opacity=".7"/>`;
  // glasses
  s += F.ex.map((x) => `<circle cx="${x}" cy="${F.ey}" r="21" fill="#fff" fill-opacity=".14" stroke="#3A2A22" stroke-width="4.5"/>`
    + `<path d="M${x - 13},${F.ey - 6} L${x - 6},${F.ey - 13}" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>`).join('');
  s += `<path d="M111,120 Q120,113 129,120" fill="none" stroke="#3A2A22" stroke-width="4" stroke-linecap="round"/>`;
  s += `<path d="M69,118 L52,113 M171,118 L188,113" stroke="#3A2A22" stroke-width="4" stroke-linecap="round"/>`;
  // spoon + paws
  const sp = DIG.spoon[o.expr];
  if (sp && A[sp[0]] && !A[sp[0]].front) s += spoon(A[sp[0]].p[2], sp[1], id);
  ['L', 'R'].forEach((side) => { if (A[side] && !A[side].front) s += paw(A[side].p, id); });
  if (pose === 'heart') s += heart(...DIG.heart, id + 'h');
  ['L', 'R'].forEach((side) => {
    if (A[side] && A[side].front) s += limb(A[side].p, style.w, style.col, style.edge, style.ew) + paw(A[side].p, id);
  });
  return frame({ id, defs, shadow: [120, 241, 64, 7], lift: E.lift || 0, tilt: E.tilt || 0, pivot: [120, 238], inner: s, props: globalProps(E, DIG, pose, A, o.expr) });
}

// =====================================================================
// 4. TERRA: the pot snail
// =====================================================================
const TER = {
  body: 'M58,240 C50,214 50,160 62,134 C74,108 102,98 122,104 C146,112 152,144 150,180 L150,196 C176,196 204,206 216,224 C222,234 216,240 204,240Z',
  face: { mx: 106, my: 160, ms: 12, cheekX: [80, 134], cheekY: 152, cheekR: [12, 7.5], ink: P.ink },
  q: [34, 70], sparkles: [[26, 100, 7], [156, 26, 7], [228, 128, 6]], heart: [106, 206, 17],
  stalks: {
    neutral: [[80, 62], [132, 58]], happy: [[68, 64], [144, 58]], curious: [[88, 56], [142, 50]],
    silly: [[72, 70], [140, 50]], supportive: [[90, 64], [124, 62]], celebrate: [[62, 54], [150, 48]], wave: [[78, 60], [136, 56]],
  },
  bases: [[90, 112], [118, 109]],
};
TER.arms = {
  rest: { L: { p: [[66, 182], [52, 194], [48, 210]] }, R: { p: [[146, 184], [160, 192], [164, 208]] } },
  cheer: { L: { p: [[64, 172], [44, 160], [36, 140]] }, R: { p: [[146, 172], [166, 160], [174, 140]] } },
  up: { L: { p: [[66, 162], [48, 134], [44, 106]] }, R: { p: [[146, 160], [164, 132], [170, 104]] } },
  wave: { L: { p: [[66, 182], [52, 194], [48, 210]] }, R: { p: [[146, 168], [170, 148], [176, 116]] } },
  think: { L: { p: [[66, 182], [52, 194], [48, 210]] }, R: { p: [[144, 184], [142, 206], [124, 186]], front: true } },
  heart: { L: { p: [[70, 192], [76, 212], [88, 208]], front: true }, R: { p: [[144, 192], [138, 212], [124, 208]], front: true } },
};
function stalkEye(base, tip, k, look, id) {
  const mx = (base[0] + tip[0]) / 2, my = (base[1] + tip[1]) / 2;
  const dx = tip[0] - base[0], dy = tip[1] - base[1], L = Math.hypot(dx, dy);
  const cx = r1(mx - dy / L * 7), cy = r1(my + dx / L * 7);
  const d = `M${base[0]},${base[1]} Q${cx},${cy} ${tip[0]},${tip[1]}`;
  let s = `<path d="${d}" fill="none" stroke="#B57656" stroke-width="12" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#EBC3A4" stroke-width="8.5" stroke-linecap="round"/>`;
  const [x, y] = tip, r = 15;
  if (k === 'happy' || k === 'wink') {
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}b)" stroke="#B57656" stroke-width="2"/>`;
    s += `<path d="M${x - 9},${y + 3} Q${x},${y - 8} ${x + 9},${y + 3}" fill="none" stroke="${P.ink}" stroke-width="4.4" stroke-linecap="round"/>`;
    return s;
  }
  const pr = k === 'big' ? 9.5 : 8;
  const px = r1(x + look[0] * 5), py = r1(y + look[1] * 5);
  s += `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFDF8" stroke="#B57656" stroke-width="2"/>`;
  s += `<circle cx="${px}" cy="${py}" r="${pr}" fill="${P.ink}"/><circle cx="${r1(px + 3)}" cy="${r1(py - 3.4)}" r="${k === 'big' ? 3.6 : 3}" fill="#fff"/><circle cx="${r1(px - 2.6)}" cy="${r1(py + 3)}" r="1.4" fill="#fff"/>`;
  if (k === 'soft') s += `<path d="M${x - r},${y - 4} A${r} ${r} 0 0 1 ${x + r},${y - 4}Z" fill="#E7B595" stroke="#B57656" stroke-width="2" stroke-linejoin="round"/>`;
  return s;
}
function terra(o) {
  const E = EXPR[o.expr], pose = o.pose || POSE[o.expr], id = nid('ter');
  const A = TER.arms[pose];
  const style = { w: 12, col: '#E2AE8C', edge: '#B57656', ew: 3.5 };
  const defs = radial(id + 'b', [[0, '#F7DDC6'], [0.55, '#E9B798'], [1, '#C98A68']], 0.32, 0.25, 0.9)
    + linear(id + 'p', [[0, '#E08C5F'], [0.55, '#BF6441'], [1, '#8E432C']], 0, 0, 1, 0)
    + linear(id + 'r', [[0, '#EA9A6E'], [1, '#A9573A']], 0, 0, 1, 0)
    + linear(id + 'l', [[0, '#A8CB8E'], [1, '#4E7B45']])
    + (o.simple ? '' : grain(id + 'g', 0.8, 0.86));
  const bloom = o.expr === 'celebrate' || o.expr === 'happy';
  const leafR = o.expr === 'wave' ? 88 : o.expr === 'celebrate' ? 40 : 56;
  const leafL = o.expr === 'supportive' ? -78 : o.expr === 'celebrate' ? -40 : -58;
  const pr = bloom ? 9 : 7, pd = bloom ? 10 : 8;
  let pot = `<g transform="translate(180,152) rotate(8)">`
    + `<path d="M0,-42 Q-6,-64 2,-86" fill="none" stroke="#557F47" stroke-width="4.5" stroke-linecap="round"/>`
    + leaf(-1, -56, 26, leafL, 9, `url(#${id}l)`) + leaf(0, -64, 28, leafR, 10, `url(#${id}l)`)
    + [0, 72, 144, 216, 288].map((a) => { const t = (a - 90) * Math.PI / 180; return `<circle cx="${r1(2 + Math.cos(t) * pd)}" cy="${r1(-88 + Math.sin(t) * pd)}" r="${pr}" fill="#FFE07A" stroke="#E2B940" stroke-width="1.5"/>`; }).join('')
    + `<circle cx="2" cy="-88" r="${bloom ? 6 : 5}" fill="#C77B3B"/>`
    + `<ellipse cx="0" cy="-44" rx="40" ry="6" fill="#4A2E22"/>`
    + `<path d="M-40,-26 L40,-26 L31,40 Q30,48 22,48 L-22,48 Q-30,48 -31,40Z" fill="url(#${id}p)" stroke="#7A3A26" stroke-width="2" stroke-opacity=".6"/>`
    + `<path d="M-36,-6 Q-27,-12 -18,-6 T0,-6 T18,-6 T36,-6" fill="none" stroke="#F6DFC8" stroke-width="3" stroke-linecap="round" opacity=".85"/>`
    + `<circle cx="-16" cy="16" r="2.6" fill="#F6DFC8" opacity=".8"/><circle cx="0" cy="16" r="2.6" fill="#F6DFC8" opacity=".8"/><circle cx="16" cy="16" r="2.6" fill="#F6DFC8" opacity=".8"/>`
    + `<rect x="-46" y="-44" width="92" height="18" rx="6" fill="url(#${id}r)" stroke="#7A3A26" stroke-width="2" stroke-opacity=".6"/>`
    + `<rect x="-38" y="-41" width="40" height="4" rx="2" fill="#fff" opacity=".25"/></g>`;
  let s = pot;
  s += arms(A, 'back', style);
  s += `<g${o.simple ? '' : ` filter="url(#${id}g)"`}><path d="${TER.body}" fill="url(#${id}b)"/></g>`;
  s += `<path d="${TER.body}" fill="none" stroke="#B57656" stroke-width="2.2" stroke-opacity=".7"/>`;
  s += `<path d="M156,206 C178,208 198,214 208,226" fill="none" stroke="#fff" stroke-width="3" opacity=".35" stroke-linecap="round"/>`;
  s += `<ellipse cx="82" cy="128" rx="12" ry="6" transform="rotate(-40 82 128)" fill="#fff" opacity=".35"/>`;
  const tips = TER.stalks[o.expr];
  const look = E.look || [0, 0];
  s += stalkEye(TER.bases[0], tips[0], E.eyes[0], look, id) + stalkEye(TER.bases[1], tips[1], E.eyes[1], look, id);
  s += face(TER.face, E, id);
  if (pose === 'heart') s += heart(...TER.heart, id + 'h');
  s += arms(A, 'front', style);
  return frame({ id, defs, shadow: [136, 243, 88, 7], lift: E.lift || 0, tilt: E.tilt || 0, pivot: [130, 240], inner: s, props: globalProps(E, TER, pose, A, o.expr) });
}

// =====================================================================
const CHARS = {
  pip: { fn: pip, icon: { cx: 120, cy: 150, s: 1.08, ty: 146, bgs: ['#2E4A3C', '#FFE58A'] } },
  nutmeg: { fn: nutmeg, icon: { cx: 120, cy: 150, s: 1.06, ty: 144, bgs: ['#2E4A3C', '#DDEBD5'] } },
  dig: { fn: dig, icon: { cx: 120, cy: 140, s: 1.22, ty: 138, bgs: ['#FFE58A', '#2E4A3C'] } },
  terra: { fn: terra, icon: { cx: 132, cy: 140, s: 0.98, ty: 128, bgs: ['#2E4A3C', '#DDEBD5'] } },
};
const EXPRS = ['neutral', 'happy', 'curious', 'silly', 'supportive', 'celebrate', 'wave'];

function render(name, expr = 'neutral', opts = {}) {
  const { defs, body } = CHARS[name].fn({ expr, ...opts });
  const label = opts.label || `${name} ${expr}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 260" role="img" aria-label="${label}"${opts.cls ? ` class="${opts.cls}"` : ''}><defs>${defs}</defs>${body}</svg>`;
}
function icon(name, bgIndex = 0, opts = {}) {
  const c = CHARS[name].icon;
  const { defs, body } = CHARS[name].fn({ expr: opts.expr || 'neutral', simple: true });
  const id = nid('ic');
  const bg = c.bgs[bgIndex];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-label="${opts.label || name + ' app icon'}"${opts.cls ? ` class="${opts.cls}"` : ''}><defs>${defs}`
    + radial(id + 'g', [[0, '#fff', 0.22], [1, '#fff', 0]], 0.3, 0.2, 0.8)
    + `<clipPath id="${id}c"><rect width="240" height="240" rx="54"/></clipPath></defs>`
    + `<g clip-path="url(#${id}c)"><rect width="240" height="240" fill="${bg}"/><rect width="240" height="240" fill="url(#${id}g)"/>`
    + `<g transform="translate(120,${c.ty}) scale(${c.s}) translate(${-c.cx},${-c.cy})">${body}</g></g></svg>`;
}

const api = { render, icon, CHARS, EXPRS, P };
if (typeof module !== 'undefined') module.exports = api;
if (typeof window !== 'undefined') window.MK = api;
