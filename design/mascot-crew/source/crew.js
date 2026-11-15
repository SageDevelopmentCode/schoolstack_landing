// MudKitchen Crew: 12 refined feature mascots, one shared style kit.
// viewBox 0 0 240 280, ground at y=262.

const P = {
  ink: '#2B241D', clay: '#A05C45', forest: '#2E4A3C', oat: '#E8DCC8', moss: '#8A9A7B', ochre: '#C99A4E',
  butter: '#F2D98A', mint: '#DDEBD5', sky: '#E3EDFB', peach: '#F8DDCF', mouth: '#5A2219', tongue: '#D9877C',
};
let UID = 0;
const nid = (p) => `k${p}${++UID}`;
const r1 = (n) => Math.round(n * 10) / 10;

// ---------- defs ----------
const stops = (l) => l.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('');
const radial = (id, l, cx = 0.36, cy = 0.28, r = 0.85) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops(l)}</radialGradient>`;
const linear = (id, l, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(l)}</linearGradient>`;
function grain(id, freq = 0.9, lo = 0.88) {
  const s = (1 - lo).toFixed(2);
  return `<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">`
    + `<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="7" result="n"/>`
    + `<feColorMatrix in="n" type="saturate" values="0" result="g"/>`
    + `<feComponentTransfer in="g" result="t"><feFuncR type="linear" slope="${s}" intercept="${lo}"/><feFuncG type="linear" slope="${s}" intercept="${lo}"/><feFuncB type="linear" slope="${s}" intercept="${lo}"/><feFuncA type="table" tableValues="1 1"/></feComponentTransfer>`
    + `<feComposite in="t" in2="SourceGraphic" operator="in" result="m"/><feBlend in="m" in2="SourceGraphic" mode="multiply"/></filter>`;
}
// shaded shape: gradient fill + grain + soft same-hue edge
const shape = (d, fill, edge, ctx, ew = 2) => `<g${ctx.G}><path d="${d}" fill="${fill}"/></g><path d="${d}" fill="none" stroke="${edge}" stroke-width="${ew}" stroke-opacity=".55"/>`;
const ell = (cx, cy, rx, ry) => `M${cx - rx},${cy} A${rx} ${ry} 0 1 0 ${cx + rx},${cy} A${rx} ${ry} 0 1 0 ${cx - rx},${cy}Z`;

// ---------- limbs ----------
function limb(pts, w, col, edge, ew = 2.5) {
  const [a, b, c] = pts;
  const d = `M${r1(a[0])},${r1(a[1])} Q${r1(b[0])},${r1(b[1])} ${r1(c[0])},${r1(c[1])}`;
  return `<path d="${d}" fill="none" stroke="${edge}" stroke-width="${w + ew}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
}
function dirOf(pts) {
  const [b, c] = [pts[1], pts[2]];
  const dx = c[0] - b[0], dy = c[1] - b[1], L = Math.hypot(dx, dy) || 1;
  return [dx / L, dy / L];
}
function hand(pts, side, A) {
  const [dx, dy] = dirOf(pts);
  const [x, y] = pts[2];
  const ang = r1(Math.atan2(dy, dx) * 180 / Math.PI);
  const sz = A.hs || 6.5;
  const sg = side === 'L' ? -1 : 1;
  const tx = r1(x + dx * sz * 0.2 - dy * sg * sz * 0.85), ty = r1(y + dy * sz * 0.2 + dx * sg * sz * 0.85);
  const hx = r1(x + dx * 2), hy = r1(y + dy * 2);
  const col = A.hand || A.col, edge = A.handEdge || A.edge;
  return `<ellipse cx="${tx}" cy="${ty}" rx="${r1(sz * 0.42)}" ry="${r1(sz * 0.32)}" transform="rotate(${ang} ${tx} ${ty})" fill="${col}" stroke="${edge}" stroke-width="1.5"/>`
    + `<ellipse cx="${hx}" cy="${hy}" rx="${r1(sz * 1.05)}" ry="${r1(sz * 0.86)}" transform="rotate(${ang} ${hx} ${hy})" fill="${col}" stroke="${edge}" stroke-width="1.5"/>`;
}
function armSet({ cx = 120, sx, sy, k = 1, chin, heart }) {
  const M = (x) => 2 * cx - x;
  const mir = (a) => ({ p: a.p.map(([x, y]) => [M(x), y]), front: a.front });
  const rest = { p: [[sx, sy], [sx - 12 * k, sy + 20 * k], [sx - 10 * k, sy + 42 * k]] };
  const cheer = { p: [[sx, sy - 2], [sx - 24 * k, sy - 6 * k], [sx - 32 * k, sy - 30 * k]] };
  const up = { p: [[sx, sy - 4], [sx - 16 * k, sy - 34 * k], [sx - 12 * k, sy - 62 * k]] };
  const waveR = { p: [[M(sx), sy - 2], [M(sx) + 24 * k, sy - 14 * k], [M(sx) + 24 * k, sy - 50 * k]] };
  const thinkR = { p: [[M(sx) - 2, sy + 6], [M(sx) - 2 * k, sy + 34 * k], chin], front: true };
  const [hx, hy, hs] = heart;
  const heartL = { p: [[sx + 2, sy + 4], [sx + 6 * k, sy + 28 * k], [hx - hs * 1.15, hy + 2]], front: true };
  return { rest: { L: rest, R: mir(rest) }, cheer: { L: cheer, R: mir(cheer) }, up: { L: up, R: mir(up) }, wave: { L: rest, R: waveR }, think: { L: rest, R: thinkR }, heart: { L: heartL, R: mir(heartL) } };
}
function legs(L) {
  let s = '';
  L.hips.forEach(([hx, hy], i) => {
    const [fx, fy] = L.feet[i];
    const o = i ? 1 : -1;
    s += limb([[hx, hy], [(hx + fx) / 2 + o * 2, (hy + fy) / 2], [fx, fy - 2]], L.w || 9, L.col, L.edge, 2.5);
    s += `<ellipse cx="${fx + o * 4}" cy="${fy + 2}" rx="${L.rx || 12}" ry="${L.ry || 6}" fill="${L.shoe}"/>`
      + `<ellipse cx="${fx + o * 2}" cy="${fy - 0.5}" rx="${(L.rx || 12) * 0.5}" ry="1.6" fill="#fff" opacity=".18"/>`;
  });
  return s;
}

// ---------- props & effects ----------
function heart(x, y, s, id) {
  const d = `M0,${s * 0.9} C${-s * 1.45},${-s * 0.05} ${-s * 0.75},${-s * 1.15} 0,${-s * 0.42} C${s * 0.75},${-s * 1.15} ${s * 1.45},${-s * 0.05} 0,${s * 0.9}Z`;
  return radial(id, [[0, '#DE8B72'], [1, '#B4553F']], 0.35, 0.3, 0.9)
    + `<g transform="translate(${x},${y}) rotate(-6)"><path d="${d}" fill="url(#${id})" stroke="#93412F" stroke-width="1.4"/><ellipse cx="${-s * 0.45}" cy="${-s * 0.4}" rx="${s * 0.2}" ry="${s * 0.12}" transform="rotate(-35 ${-s * 0.45} ${-s * 0.4})" fill="#fff" opacity=".55"/></g>`;
}
function question(x, y, s = 13) {
  return `<g transform="rotate(10 ${x} ${y})"><path d="M${x - s * 0.5},${y - s * 0.55} C${x - s * 0.5},${y - s * 1.25} ${x + s * 0.62},${y - s * 1.25} ${x + s * 0.62},${y - s * 0.55} C${x + s * 0.62},${y - s * 0.05} ${x},${y - s * 0.02} ${x},${y + s * 0.38}" fill="none" stroke="#6F8463" stroke-width="${s * 0.2}" stroke-linecap="round"/><circle cx="${x}" cy="${y + s * 0.8}" r="${s * 0.13}" fill="#6F8463"/></g>`;
}
const STREAM = [[34, 46, 24, '#C99A4E'], [70, 20, -30, '#8A9A7B'], [170, 18, 16, '#C46A52'], [206, 50, -36, '#9FB3C8'], [24, 104, -10, '#D9C6A5'], [218, 104, 40, '#C99A4E']];
function streamers() {
  return STREAM.map(([x, y, a, c]) => `<rect x="${x - 6}" y="${y - 2}" width="12" height="4" rx="1" fill="${c}" transform="rotate(${a} ${x} ${y})"/>`).join('')
    + `<path d="M46,74 c6,-10 14,-2 10,6 s4,16 12,8" fill="none" stroke="#C46A52" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>`
    + `<path d="M184,74 c-6,-10 -14,-2 -10,6 s-4,16 -12,8" fill="none" stroke="#8A9A7B" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>`;
}
function waveLines([x, y]) {
  return `<g fill="none" stroke="${P.ink}" stroke-opacity=".35" stroke-width="2.4" stroke-linecap="round"><path d="M${x + 15},${y - 14} Q${x + 21},${y - 4} ${x + 15},${y + 6}"/><path d="M${x + 22},${y - 18} Q${x + 30},${y - 4} ${x + 22},${y + 10}"/></g>`;
}

// ---------- refined face kit ----------
const EXPR = {
  neutral: { eyes: ['open', 'open'], look: [0, 0.05], brows: [[0, -2], [0, -2]], mouth: 'smile' },
  happy: { eyes: ['happy', 'happy'], brows: [[-3, 5], [-3, 5]], mouth: 'grin', mouthScale: 0.8, lift: -4 },
  curious: { eyes: ['open', 'open'], look: [0.55, -0.5], brows: [[0, -2], [-7, 9]], mouth: 'o', mouthDx: 0.3, props: ['question'], tilt: 4 },
  silly: { eyes: ['wry', 'open'], look: [0.45, 0], brows: [[2, -10], [-6, 7]], mouth: 'smirk', tilt: -4 },
  supportive: { eyes: ['soft', 'soft'], look: [0, 0.2], brows: [[-1, 12], [-1, 12]], mouth: 'soft' },
  celebrate: { eyes: ['happy', 'happy'], brows: [[-5, 4], [-5, 4]], mouth: 'grin', props: ['streamers'], lift: -10 },
  wave: { eyes: ['open', 'open'], look: [0.1, 0], brows: [[-2, 2], [-2, 2]], mouth: 'grin', mouthScale: 0.7, props: ['wavelines'] },
};
const POSE = { neutral: 'rest', happy: 'cheer', curious: 'think', silly: 'rest', supportive: 'heart', celebrate: 'up', wave: 'wave' };

function eye(x, y, r, k, look, F, cid) {
  const lid = F.lid || P.ink;
  if (k === 'happy') {
    return `<path d="M${r1(x - r)},${r1(y + r * 0.15)} Q${x},${r1(y - r * 0.75)} ${r1(x + r)},${r1(y + r * 0.15)}" fill="none" stroke="${lid}" stroke-width="${r1(r * 0.24)}" stroke-linecap="round"/>`;
  }
  const rx = r, ry = r * 0.8;
  const ix = r1(x + look[0] * r * 0.38), iy = r1(y + look[1] * r * 0.3 + r * 0.05);
  let s = `<clipPath id="${cid}"><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${r1(ry)}"/></clipPath>`;
  s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${r1(ry)}" fill="#FBF6EE"/>`;
  s += `<g clip-path="url(#${cid})"><circle cx="${ix}" cy="${iy}" r="${r1(r * 0.56)}" fill="${F.iris || '#5A3E2B'}"/><circle cx="${ix}" cy="${iy}" r="${r1(r * 0.3)}" fill="#1E1712"/><circle cx="${r1(ix + r * 0.2)}" cy="${r1(iy - r * 0.2)}" r="${r1(r * 0.15)}" fill="#fff"/>`;
  if (k === 'soft') s += `<path d="M${x - rx - 1},${r1(y - ry - 2)} L${x + rx + 1},${r1(y - ry - 2)} L${x + rx + 1},${r1(y - r * 0.08)} Q${x},${r1(y + r * 0.2)} ${x - rx - 1},${r1(y - r * 0.08)}Z" fill="${F.skin}"/>`;
  if (k === 'wry') s += `<path d="M${x - rx - 1},${r1(y + ry + 2)} L${x + rx + 1},${r1(y + ry + 2)} L${x + rx + 1},${r1(y + r * 0.38)} Q${x},${r1(y + r * 0.02)} ${x - rx - 1},${r1(y + r * 0.38)}Z" fill="${F.skin}"/>`;
  s += `</g>`;
  if (k === 'soft') {
    s += `<path d="M${r1(x - rx * 1.05)},${r1(y - r * 0.08)} Q${x},${r1(y + r * 0.2)} ${r1(x + rx * 1.05)},${r1(y - r * 0.08)}" fill="none" stroke="${lid}" stroke-width="${r1(r * 0.22)}" stroke-linecap="round"/>`;
  } else {
    s += `<path d="M${r1(x - rx * 1.08)},${r1(y + ry * 0.12)} Q${r1(x - rx * 0.15)},${r1(y - ry * 1.38)} ${r1(x + rx * 1.08)},${r1(y - ry * 0.05)}" fill="none" stroke="${lid}" stroke-width="${r1(r * 0.2)}" stroke-linecap="round"/>`;
  }
  if (k === 'wry') s += `<path d="M${r1(x - rx)},${r1(y + r * 0.38)} Q${x},${r1(y + r * 0.02)} ${r1(x + rx)},${r1(y + r * 0.38)}" fill="none" stroke="${lid}" stroke-width="${r1(r * 0.14)}" stroke-linecap="round"/>`;
  return s;
}
function brow(x, y, w, ang, col) {
  return `<path d="M${-w / 2},${r1(w * 0.06)} Q0,${r1(-w * 0.22)} ${w / 2},${r1(w * 0.06)}" transform="translate(${x},${y}) rotate(${ang})" fill="none" stroke="${col}" stroke-width="${r1(w * 0.17)}" stroke-linecap="round"/>`;
}
function mouth(x, y, s, k, id, F) {
  const ink = F.mouthInk || P.ink;
  const sw = r1(Math.max(2.2, s * 0.24));
  switch (k) {
    case 'smile': return `<path d="M${r1(x - s)},${y} Q${x},${r1(y + s * 0.55)} ${r1(x + s)},${y}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>`;
    case 'soft': { const t = s * 0.7; return `<path d="M${r1(x - t)},${y} Q${x},${r1(y + t * 0.45)} ${r1(x + t)},${y}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>`; }
    case 'grin': {
      const d = `M${r1(x - s)},${y} Q${x},${r1(y + s * 1.25)} ${r1(x + s)},${y} Q${x},${r1(y + s * 0.16)} ${r1(x - s)},${y}Z`;
      return `<clipPath id="${id}m"><path d="${d}"/></clipPath><path d="${d}" fill="${P.mouth}"/>`
        + `<g clip-path="url(#${id}m)"><rect x="${r1(x - s)}" y="${r1(y - 1)}" width="${r1(s * 2)}" height="${r1(s * 0.42)}" fill="#FBF6EE"/><ellipse cx="${x}" cy="${r1(y + s * 0.95)}" rx="${r1(s * 0.5)}" ry="${r1(s * 0.3)}" fill="${P.tongue}"/></g>`
        + `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${r1(sw * 0.6)}" stroke-linejoin="round"/>`;
    }
    case 'o': return `<ellipse cx="${x}" cy="${r1(y + s * 0.25)}" rx="${r1(s * 0.24)}" ry="${r1(s * 0.3)}" fill="${P.mouth}" stroke="${ink}" stroke-width="${r1(sw * 0.5)}"/>`;
    case 'smirk': return `<path d="M${r1(x - s * 0.75)},${r1(y + s * 0.12)} Q${r1(x + s * 0.05)},${r1(y + s * 0.42)} ${r1(x + s * 0.85)},${r1(y - s * 0.2)}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>`
      + `<path d="M${r1(x + s * 0.8)},${r1(y - s * 0.34)} q${r1(s * 0.14)},${r1(s * 0.1)} ${r1(s * 0.08)},${r1(s * 0.28)}" fill="none" stroke="${ink}" stroke-width="${r1(sw * 0.6)}" stroke-linecap="round"/>`;
    default: return '';
  }
}
function face(F, E, id) {
  let s = '';
  const look = E.look || [0, 0];
  if (F.ex) {
    E.eyes.forEach((k, i) => { s += eye(F.ex[i], F.ey, F.er, k, look, F, `${id}e${i}`); });
    E.brows.forEach(([dy, a], i) => { s += brow(F.ex[i], F.browY + dy, F.browW, i ? a : -a, F.browCol); });
  }
  if (F.extra) s += F.extra;
  s += mouth(r1(F.mx + (E.mouthDx || 0) * F.ms), F.my, r1(F.ms * (E.mouthScale || 1)), E.mouth, id, F);
  return s;
}

// ---------- assembly ----------
function build(C, o) {
  const E = EXPR[o.expr], pose = POSE[o.expr], id = nid(C.key), A = C.arms[pose];
  const ctx = { o, E, pose, id, A, expr: o.expr, simple: o.simple, G: o.simple ? '' : ` filter="url(#${id}g)"` };
  const defs = (C.defs ? C.defs(id) : '') + (o.simple ? '' : grain(id + 'g', 0.9, 0.88));
  let s = '';
  if (C.back) s += C.back(ctx);
  ['L', 'R'].forEach((side) => { const a = A[side]; if (a && !a.front) s += limb(a.p, C.arm.w, C.arm.col, C.arm.edge, C.arm.ew); });
  if (C.legs) s += legs(C.legs);
  s += C.body(ctx);
  if (C.face) s += face(C.face, E, id);
  if (C.front) s += C.front(ctx);
  const ph = C.propHand && C.propHand[o.expr];
  if (ph && !o.simple && A[ph] && !A[ph].front && C.prop) s += C.prop(A[ph].p[2][0], A[ph].p[2][1], ctx, ph);
  ['L', 'R'].forEach((side) => { const a = A[side]; if (a && !a.front) s += hand(a.p, side, C.arm); });
  if (pose === 'heart') s += heart(...C.heart, id + 'h');
  ['L', 'R'].forEach((side) => { const a = A[side]; if (a && a.front) s += limb(a.p, C.arm.w, C.arm.col, C.arm.edge, C.arm.ew) + hand(a.p, side, C.arm); });
  const lift = E.lift || 0, tilt = E.tilt || 0;
  const [scx, scy, srx, sry] = C.shadow || [120, 262, 56, 6];
  const sh = `<ellipse cx="${scx}" cy="${scy}" rx="${r1(srx * (1 + lift / 60))}" ry="${r1(sry * (1 + lift / 80))}" fill="${P.ink}" opacity="${lift ? 0.09 : 0.13}"/>`;
  let props = '';
  const pr = E.props || [];
  if (pr.includes('question')) props += question(...C.q);
  if (pr.includes('streamers')) props += streamers();
  if (pr.includes('wavelines') && A.R) props += waveLines(A.R.p[2]);
  return { defs, body: `${sh}<g transform="translate(0,${lift}) rotate(${tilt} ${C.cx || 120} 262)">${s}</g>${props}` };
}

// ---------- prop drawings (grip point = x,y) ----------
const PROPS = {
  seedPacket: (x, y) => `<g transform="rotate(8 ${x} ${y})"><rect x="${x - 12}" y="${y - 3}" width="24" height="32" rx="3" fill="#F1E7D6" stroke="#B9A68A" stroke-width="1.5"/><rect x="${x - 12}" y="${y - 3}" width="24" height="8" rx="2" fill="#A05C45"/>`
    + `<path d="M${x},${y + 24} L${x},${y + 15}" stroke="#557F47" stroke-width="1.8" stroke-linecap="round"/><path d="M${x},${y + 16} c-6,-1 -8,-6 -7,-8 c4,0 7,3 7,8z M${x},${y + 16} c6,-1 8,-6 7,-8 c-4,0 -7,3 -7,8z" fill="#7FA06C"/></g>`,
  ledger: (x, y) => `<g transform="rotate(6 ${x} ${y})"><rect x="${x - 13}" y="${y - 4}" width="26" height="33" rx="3" fill="#3C5A49" stroke="#22382D" stroke-width="1.5"/><rect x="${x - 13}" y="${y - 4}" width="5" height="33" rx="2" fill="#2A4236"/><rect x="${x - 4}" y="${y + 4}" width="13" height="7" rx="1.5" fill="#E8DCC8"/></g>`
    + `<circle cx="${x + 13}" cy="${y + 28}" r="7.5" fill="#D9AE4E" stroke="#9E7A2C" stroke-width="1.5"/><circle cx="${x + 13}" cy="${y + 28}" r="4.5" fill="none" stroke="#9E7A2C" stroke-width="1.2"/>`,
  clipboard: (x, y) => `<g transform="rotate(-6 ${x} ${y})"><rect x="${x - 14}" y="${y - 4}" width="28" height="36" rx="3" fill="#B98A5E" stroke="#8A6340" stroke-width="1.5"/><rect x="${x - 11}" y="${y + 1}" width="22" height="28" rx="1.5" fill="#FBF7EF"/><rect x="${x - 6}" y="${y - 7}" width="12" height="6" rx="2" fill="#8E949A"/>`
    + [0, 1, 2].map((i) => `<path d="M${x - 8},${y + 8 + i * 8} l2.4,2.4 l4,-4.8" fill="none" stroke="#6F8F5E" stroke-width="1.8" stroke-linecap="round"/><path d="M${x},${y + 8.5 + i * 8} h8" stroke="#C9BBA6" stroke-width="1.8" stroke-linecap="round"/>`).join('') + `</g>`,
  watch: (x, y) => `<path d="M${x},${y} Q${x + 4},${y + 8} ${x + 2},${y + 12}" fill="none" stroke="#B89048" stroke-width="1.6" stroke-dasharray="2 1.6"/><rect x="${x - 1}" y="${y + 9}" width="6" height="5" rx="1.5" fill="#B89048"/>`
    + `<circle cx="${x + 2}" cy="${y + 26}" r="13" fill="#D9AE4E" stroke="#9E7A2C" stroke-width="1.6"/><circle cx="${x + 2}" cy="${y + 26}" r="9.8" fill="#FBF6EE"/><path d="M${x + 2},${y + 26} L${x + 2},${y + 19.5} M${x + 2},${y + 26} L${x + 7},${y + 28}" stroke="${P.ink}" stroke-width="1.6" stroke-linecap="round"/><circle cx="${x + 2}" cy="${y + 26}" r="1.3" fill="${P.ink}"/>`,
  megaphone: (x, y, c, side) => {
    const m = side === 'L' ? -1 : 1;
    return `<g transform="translate(${x},${y}) scale(${m},1) rotate(-28)"><path d="M-2,-5 L30,-15 L30,15 L-2,5Z" fill="#D9874A" stroke="#A55E2C" stroke-width="1.5" stroke-linejoin="round"/><ellipse cx="30" cy="0" rx="5" ry="15" fill="#F2B95E" stroke="#A55E2C" stroke-width="1.5"/><ellipse cx="31" cy="0" rx="2.4" ry="10" fill="#A55E2C" opacity=".5"/><rect x="2" y="4" width="5" height="11" rx="2" fill="#7A4A26"/></g>`;
  },
  envelope: (x, y) => `<g transform="rotate(-8 ${x} ${y})"><rect x="${x - 15}" y="${y - 2}" width="30" height="21" rx="2.5" fill="#FBF7EF" stroke="#BBA88E" stroke-width="1.5"/><path d="M${x - 14},${y - 1} L${x},${y + 10} L${x + 14},${y - 1}" fill="none" stroke="#BBA88E" stroke-width="1.5" stroke-linejoin="round"/><circle cx="${x}" cy="${y + 10}" r="3.4" fill="#B4553F"/></g>`,
  calendar: (x, y) => {
    let s = `<g transform="rotate(5 ${x} ${y})"><rect x="${x - 14}" y="${y - 3}" width="28" height="32" rx="3" fill="#FBF7EF" stroke="#BBA88E" stroke-width="1.5"/><rect x="${x - 14}" y="${y - 3}" width="28" height="9" rx="3" fill="#B24A38"/><rect x="${x - 14}" y="${y + 2}" width="28" height="4" fill="#B24A38"/>`;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) s += `<rect x="${x - 11 + c * 6}" y="${y + 9 + r * 6}" width="4" height="4" rx="1" fill="${r === 1 && c === 2 ? '#E2AE45' : '#D8CCB8'}"/>`;
    return s + `</g>`;
  },
  camera: (x, y) => `<g transform="rotate(-6 ${x} ${y})"><rect x="${x - 16}" y="${y - 2}" width="32" height="22" rx="5" fill="#3A332E" stroke="#1E1814" stroke-width="1.5"/><rect x="${x - 8}" y="${y - 7}" width="12" height="6" rx="2" fill="#3A332E"/><circle cx="${x + 1}" cy="${y + 9}" r="8" fill="#5E6E78" stroke="#C9C2B6" stroke-width="2"/><circle cx="${x + 1}" cy="${y + 9}" r="3.8" fill="#26303A"/><circle cx="${x + 3}" cy="${y + 7}" r="1.4" fill="#fff" opacity=".8"/><rect x="${x + 9}" y="${y + 1}" width="5" height="3" rx="1" fill="#F2D98A"/></g>`,
  form: (x, y) => `<g transform="rotate(-5 ${x} ${y})"><rect x="${x - 13}" y="${y - 3}" width="26" height="34" rx="2" fill="#FBF7EF" stroke="#BBA88E" stroke-width="1.5"/><path d="M${x - 8},${y + 5} h16 M${x - 8},${y + 10} h16 M${x - 8},${y + 15} h10" stroke="#CDBFA8" stroke-width="1.8" stroke-linecap="round"/><path d="M${x - 8},${y + 24} c3,-6 5,4 8,-1 s4,3 8,-2" fill="none" stroke="#A05C45" stroke-width="1.6" stroke-linecap="round"/></g>`,
};
function pencil(x, y, a) {
  return `<g transform="translate(${x},${y}) rotate(${a})"><rect x="-3.5" y="-22" width="7" height="34" fill="#E3B04B" stroke="#A97D24" stroke-width="1"/><rect x="-1" y="-22" width="2" height="34" fill="#F0C66A"/><rect x="-3.5" y="12" width="7" height="4" fill="#B8B1A6"/><rect x="-3.5" y="16" width="7" height="5" rx="2" fill="#D9897C"/><path d="M-3.5,-22 L0,-31 L3.5,-22Z" fill="#E9CFA4"/><path d="M-1.2,-28 L0,-31 L1.2,-28Z" fill="${P.ink}"/></g>`;
}
function leafSVG(x, y, len, ang, wid, fill, rib = '#E4EED8') {
  return `<g transform="translate(${x},${y}) rotate(${ang})"><path d="M0,0 C${wid},${-len * 0.25} ${wid * 0.8},${-len * 0.85} 0,${-len} C${-wid * 0.8},${-len * 0.85} ${-wid},${-len * 0.25} 0,0Z" fill="${fill}"/><path d="M0,-2 Q${wid * 0.15},${-len * 0.5} 0,${-len * 0.84}" stroke="${rib}" stroke-width="1.5" fill="none" opacity=".7" stroke-linecap="round"/></g>`;
}
const LEAF = [[0, '#A5BF8C'], [1, '#56794A']];

// =====================================================================
// CHARACTERS
// =====================================================================
const C = {};
const STD_PROP = { neutral: 'R', wave: 'L', curious: 'L', silly: 'R' };

// ---- Pip · Enrollment ----
C.pip = {
  key: 'pip', name: 'Pip',
  defs: (id) => radial(id + 'b', [[0, '#DCA084'], [0.5, '#B8775C'], [1, '#7E4A38']]) + linear(id + 'l', LEAF),
  arm: { w: 8, col: '#A5664E', edge: '#76412F', hand: '#B3735A' },
  legs: { hips: [[106, 222], [134, 222]], feet: [[102, 254], [138, 254]], col: '#93583F', edge: '#6A3A29', shoe: '#4A2E22' },
  face: { ex: [99, 141], ey: 132, er: 10, browY: 115, browW: 15, browCol: '#5B2E20', skin: '#C3836A', mx: 120, my: 156, ms: 9 },
  q: [192, 82], heart: [120, 190, 12], propHand: STD_PROP, prop: PROPS.seedPacket,
  leaves: { neutral: [-50, 46], happy: [-38, 36], curious: [-66, 22], silly: [-78, 40], supportive: [-58, 58], celebrate: [-28, 28], wave: [-44, 62] },
  back(c) {
    const [la, ra] = this.leaves[c.expr];
    return `<path d="M120,76 Q119,62 121,48" fill="none" stroke="#557F47" stroke-width="4.5" stroke-linecap="round"/>`
      + leafSVG(121, 50, 30, la, 11, `url(#${c.id}l)`) + leafSVG(121, 50, 33, ra, 12, `url(#${c.id}l)`);
  },
  body(c) {
    const d = 'M120,70 C166,70 184,122 184,160 C184,204 158,230 120,230 C82,230 56,204 56,160 C56,122 74,70 120,70Z';
    return shape(d, `url(#${c.id}b)`, '#6E3826', c) + `<ellipse cx="92" cy="100" rx="16" ry="7" transform="rotate(-38 92 100)" fill="#fff" opacity=".2"/>`;
  },
};
C.pip.arms = armSet({ sx: 64, sy: 162, chin: [136, 166], heart: C.pip.heart });

// ---- Nutmeg · Tuition & Billing ----
C.nutmeg = {
  key: 'nutmeg', name: 'Nutmeg',
  defs: (id) => radial(id + 'b', [[0, '#E8BD8A'], [0.5, '#C78E57'], [1, '#916032']]) + linear(id + 'c', [[0, '#97704F'], [1, '#634330']]) + linear(id + 'l', LEAF)
    + `<pattern id="${id}s" width="11" height="8" patternUnits="userSpaceOnUse"><path d="M0,8 Q5.5,1 11,8" stroke="#4E321F" stroke-width="1.3" fill="none"/></pattern>`,
  arm: { w: 7.5, col: '#80583A', edge: '#553822', hand: '#8E6646' },
  legs: { hips: [[107, 224], [133, 224]], feet: [[103, 255], [137, 255]], col: '#80583A', edge: '#553822', shoe: '#3E2A1C' },
  face: { ex: [100, 140], ey: 160, er: 9.5, browY: 144, browW: 14, browCol: '#6E4424', skin: '#D2955C', mx: 120, my: 182, ms: 8.5 },
  q: [200, 80], heart: [120, 200, 12], propHand: STD_PROP, prop: PROPS.ledger,
  capT: { neutral: [-5, 0], happy: [-8, -3], curious: [9, 0], silly: [-12, 3], supportive: [-2, 0], celebrate: [-12, -16], wave: [-6, 0] },
  body(c) {
    const d = 'M120,100 C166,100 182,140 180,172 C178,206 152,230 124,232 Q120,236 116,232 C88,230 62,206 60,172 C58,140 74,100 120,100Z';
    return shape(d, `url(#${c.id}b)`, '#7E4A22', c)
      + `<path d="M74,156 Q70,192 94,222 M166,156 Q170,192 146,222" fill="none" stroke="#A8703A" stroke-width="1.8" opacity=".35" stroke-linecap="round"/>`;
  },
  front(c) {
    const [rot, dy] = this.capT[c.expr];
    const cap = 'M48,118 C46,82 78,62 120,62 C162,62 194,82 192,118 C194,130 172,134 120,134 C68,134 46,130 48,118Z';
    return `<g transform="translate(0,${dy}) rotate(${rot} 120 114)"><path d="M120,66 C118,54 122,46 129,42" fill="none" stroke="#4E321F" stroke-width="6" stroke-linecap="round"/>`
      + leafSVG(129, 44, 22, 58, 8, `url(#${c.id}l)`)
      + `<path d="${cap}" fill="url(#${c.id}c)"/><path d="${cap}" fill="url(#${c.id}s)" opacity=".45"/><path d="${cap}" fill="none" stroke="#3E2A1C" stroke-width="1.8" stroke-opacity=".6"/>`
      + `<path d="M54,123 C78,133 162,133 186,123" fill="none" stroke="#B88A5E" stroke-width="2.6" stroke-linecap="round" opacity=".8"/></g>`;
  },
};
C.nutmeg.arms = armSet({ sx: 66, sy: 172, chin: [134, 186], heart: C.nutmeg.heart });

// ---- Dig · Admin Portal ----
C.dig = {
  key: 'dig', name: 'Dig',
  defs: (id) => radial(id + 'b', [[0, '#A68A78'], [0.55, '#7F6457'], [1, '#574137']]) + radial(id + 'z', [[0, '#F1DFCD'], [1, '#D1B39B']], 0.45, 0.35, 0.75)
    + radial(id + 'n', [[0, '#F0B0A2'], [1, '#BF6F60']], 0.4, 0.3, 0.8) + linear(id + 'a', [[0, '#F4DE98'], [1, '#D9B85A']]) + radial(id + 'w', [[0, '#DDAA74'], [1, '#A06C3E']])
    + `<clipPath id="${id}c"><path d="M120,62 C166,62 186,106 186,152 C186,204 160,232 120,232 C80,232 54,204 54,152 C54,106 74,62 120,62Z"/></clipPath>`,
  arm: { w: 9, col: '#76594C', edge: '#4A352C', hand: '#E2A595', handEdge: '#B37565' },
  legs: { hips: [[106, 226], [134, 226]], feet: [[102, 256], [138, 256]], col: '#5C443A', edge: '#3E2C24', shoe: '#33241D' },
  face: { ex: [99, 141], ey: 110, er: 8, browY: 87, browW: 14, browCol: '#4A352C', skin: '#7F6457', mx: 120, my: 157, ms: 8 },
  q: [196, 70], heart: [120, 196, 12], propHand: { neutral: 'R', wave: 'L', curious: 'L', silly: 'R', celebrate: 'R' },
  spoonA: { neutral: 14, wave: -14, curious: -14, silly: 30, celebrate: 4 },
  prop(x, y, c) {
    const a = this.spoonA[c.expr] || 10, t = a * Math.PI / 180, ux = Math.sin(t), uy = -Math.cos(t);
    const h1 = [r1(x - ux * 10), r1(y - uy * 10)], h2 = [r1(x + ux * 44), r1(y + uy * 44)], b = [r1(x + ux * 55), r1(y + uy * 55)];
    return `<path d="M${h1[0]},${h1[1]} L${h2[0]},${h2[1]}" stroke="#7E5530" stroke-width="7" stroke-linecap="round"/><path d="M${h1[0]},${h1[1]} L${h2[0]},${h2[1]}" stroke="#C48E57" stroke-width="4" stroke-linecap="round"/>`
      + `<g transform="rotate(${a} ${b[0]} ${b[1]})"><ellipse cx="${b[0]}" cy="${b[1]}" rx="8" ry="11" fill="url(#${c.id}w)" stroke="#7E5530" stroke-width="1.6"/><ellipse cx="${b[0]}" cy="${b[1] + 1}" rx="5" ry="7.5" fill="#6B4A35" opacity=".75"/></g>`;
  },
  body(c) {
    const d = 'M120,62 C166,62 186,106 186,152 C186,204 160,232 120,232 C80,232 54,204 54,152 C54,106 74,62 120,62Z';
    return `<path d="M110,66 Q112,52 118,60 Q122,48 128,60 Q134,54 132,68Z" fill="#7E6253"/>` + shape(d, `url(#${c.id}b)`, '#3E2C24', c)
      + `<g clip-path="url(#${c.id}c)"><path d="M72,188 C72,182 168,182 168,188 L174,240 L66,240Z" fill="url(#${c.id}a)"/><path d="M72,188 C96,183 144,183 168,188" fill="none" stroke="#C9A445" stroke-width="2.5"/>`
      + `<path d="M104,198 h32 v9 q0,7 -7,7 h-18 q-7,0 -7,-7Z" fill="#FAEBB8" stroke="#C9A445" stroke-width="1.8"/><path d="M128,200 L134,180" stroke="#5A4636" stroke-width="2.4" stroke-linecap="round"/></g>`
      + `<ellipse cx="120" cy="150" rx="31" ry="22" fill="url(#${c.id}z)"/><path d="M120,143 L120,151" stroke="${P.ink}" stroke-width="2.2" stroke-linecap="round"/>`;
  },
  front(c) {
    const F = this.face;
    return `<ellipse cx="120" cy="137" rx="11" ry="8" fill="url(#${c.id}n)"/><ellipse cx="116" cy="134" rx="3.5" ry="2" fill="#fff" opacity=".65"/>`
      + F.ex.map((x) => `<circle cx="${x}" cy="${F.ey}" r="15" fill="#fff" fill-opacity=".12" stroke="#3A2A22" stroke-width="3"/><path d="M${x - 9},${F.ey - 5} L${x - 4},${F.ey - 10}" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".5"/>`).join('')
      + `<path d="M114,108 Q120,103 126,108 M84,107 L66,102 M156,107 L174,102" fill="none" stroke="#3A2A22" stroke-width="3" stroke-linecap="round"/>`;
  },
};
C.dig.arms = armSet({ sx: 62, sy: 166, chin: [134, 168], heart: C.dig.heart });

// ---- Terra · School Website ----
C.terra = {
  key: 'terra', name: 'Terra', cx: 106,
  defs: (id) => radial(id + 'b', [[0, '#F2D8C2'], [0.55, '#DDB091'], [1, '#B98468']], 0.32, 0.25, 0.9)
    + linear(id + 'p', [[0, '#D18A62'], [0.55, '#B06647'], [1, '#844430']], 0, 0, 1, 0) + linear(id + 'r', [[0, '#DB9870'], [1, '#9E583D']], 0, 0, 1, 0) + linear(id + 'l', LEAF),
  arm: { w: 8, col: '#DAAA8B', edge: '#A9735A', hand: '#E3B699' },
  face: { mx: 106, my: 158, ms: 8.5, skin: '#E3B699' },
  q: [36, 64], heart: [106, 200, 12], shadow: [136, 262, 84, 6],
  stalks: { neutral: [[82, 62], [130, 58]], happy: [[72, 64], [140, 58]], curious: [[90, 56], [140, 52]], silly: [[76, 68], [138, 52]], supportive: [[90, 66], [122, 64]], celebrate: [[66, 56], [146, 50]], wave: [[80, 60], [134, 56]] },
  back(c) {
    const e = c.expr, bloom = e === 'celebrate' || e === 'happy';
    const lr = e === 'wave' ? 84 : e === 'celebrate' ? 40 : 56, ll = e === 'supportive' ? -76 : e === 'celebrate' ? -40 : -58;
    const pr = bloom ? 8 : 6.5, pd = bloom ? 9 : 7.5;
    return `<g transform="translate(180,154) rotate(8)"><path d="M0,-42 Q-6,-64 2,-84" fill="none" stroke="#557F47" stroke-width="4" stroke-linecap="round"/>`
      + leafSVG(-1, -56, 24, ll, 8, `url(#${c.id}l)`) + leafSVG(0, -64, 26, lr, 9, `url(#${c.id}l)`)
      + [0, 72, 144, 216, 288].map((a) => { const t = (a - 90) * Math.PI / 180; return `<circle cx="${r1(2 + Math.cos(t) * pd)}" cy="${r1(-86 + Math.sin(t) * pd)}" r="${pr}" fill="#F0CF6E" stroke="#C9A445" stroke-width="1.3"/>`; }).join('')
      + `<circle cx="2" cy="-86" r="${bloom ? 5 : 4.2}" fill="#B26B34"/><ellipse cx="0" cy="-44" rx="38" ry="5.5" fill="#4A2E22"/>`
      + `<path d="M-38,-26 L38,-26 L30,38 Q29,46 21,46 L-21,46 Q-29,46 -30,38Z" fill="url(#${c.id}p)" stroke="#6E3424" stroke-width="1.8" stroke-opacity=".6"/>`
      + `<path d="M-34,-6 Q-25.5,-11 -17,-6 T0,-6 T17,-6 T34,-6" fill="none" stroke="#EED8C2" stroke-width="2.6" stroke-linecap="round" opacity=".8"/>`
      + `<rect x="-44" y="-44" width="88" height="17" rx="5" fill="url(#${c.id}r)" stroke="#6E3424" stroke-width="1.8" stroke-opacity=".6"/></g>`;
  },
  body(c) {
    const d = 'M60,240 C52,214 52,162 64,136 C76,110 102,100 122,106 C146,114 150,146 148,180 L148,196 C174,196 202,206 214,224 C220,234 214,240 202,240Z';
    let s = shape(d, `url(#${c.id}b)`, '#A9735A', c) + `<ellipse cx="84" cy="128" rx="11" ry="5.5" transform="rotate(-40 84 128)" fill="#fff" opacity=".3"/>`;
    const E = c.E, tips = this.stalks[c.expr], bases = [[92, 114], [118, 111]];
    tips.forEach((tip, i) => {
      const base = bases[i], mx = (base[0] + tip[0]) / 2, my = (base[1] + tip[1]) / 2;
      const dx = tip[0] - base[0], dy = tip[1] - base[1], L = Math.hypot(dx, dy);
      const d2 = `M${base[0]},${base[1]} Q${r1(mx - dy / L * 6)},${r1(my + dx / L * 6)} ${tip[0]},${tip[1]}`;
      s += `<path d="${d2}" fill="none" stroke="#A9735A" stroke-width="9.5" stroke-linecap="round"/><path d="${d2}" fill="none" stroke="#E3B699" stroke-width="7" stroke-linecap="round"/>`;
      const [x, y] = tip, k = E.eyes[i];
      s += `<circle cx="${x}" cy="${y}" r="13.5" fill="url(#${c.id}b)" stroke="#A9735A" stroke-width="1.6"/>`;
      s += eye(x, y + 1, 10, k, E.look || [0, 0], { skin: '#E8BEA2', iris: '#5A3E2B' }, `${c.id}se${i}`);
      const [bdy, ba] = E.brows[i];
      s += brow(x, y - 19 + bdy, 13, i ? ba : -ba, '#7A4A36');
    });
    return s;
  },
};
C.terra.arms = armSet({ cx: 106, sx: 70, sy: 174, k: 0.9, chin: [118, 172], heart: C.terra.heart });

// ---- Fennel · Attendance (frog) ----
C.fennel = {
  key: 'fennel', name: 'Fennel',
  defs: (id) => radial(id + 'b', [[0, '#B3C99A'], [0.55, '#86A16E'], [1, '#56704A']]) + radial(id + 'y', [[0, '#F4EEDA'], [1, '#DCD2B4']], 0.45, 0.35, 0.8),
  arm: { w: 8.5, col: '#7F9A68', edge: '#4E6A44', hand: '#8FAA77' },
  legs: { hips: [[104, 224], [136, 224]], feet: [[98, 254], [142, 254]], col: '#7F9A68', edge: '#4E6A44', shoe: '#5C7A4E', rx: 14, ry: 6 },
  face: { ex: [94, 146], ey: 84, er: 10.5, browY: 64, browW: 15, browCol: '#4E6A44', skin: '#A3BC8A', mx: 120, my: 124, ms: 15,
    extra: '<circle cx="113" cy="108" r="1.8" fill="#3E5436"/><circle cx="127" cy="108" r="1.8" fill="#3E5436"/>' },
  q: [200, 62], heart: [120, 186, 12], propHand: STD_PROP, prop: PROPS.clipboard,
  body(c) {
    return shape(ell(120, 190, 46, 44), `url(#${c.id}b)`, '#3E5436', c)
      + `<ellipse cx="120" cy="198" rx="30" ry="30" fill="url(#${c.id}y)"/>`
      + shape(ell(94, 86, 21, 21), `url(#${c.id}b)`, '#3E5436', c) + shape(ell(146, 86, 21, 21), `url(#${c.id}b)`, '#3E5436', c)
      + shape(ell(120, 118, 62, 36), `url(#${c.id}b)`, '#3E5436', c)
      + `<ellipse cx="94" cy="86" rx="15" ry="13" fill="#A9C190"/><ellipse cx="146" cy="86" rx="15" ry="13" fill="#A9C190"/>`
      + `<ellipse cx="88" cy="106" rx="16" ry="6" transform="rotate(-20 88 106)" fill="#fff" opacity=".18"/>`;
  },
  front() {
    return `<path d="M120,154 L104,146 Q100,154 104,162Z M120,154 L136,146 Q140,154 136,162Z" fill="#A05C45" stroke="#7E4533" stroke-width="1.4" stroke-linejoin="round"/><circle cx="120" cy="154" r="4.2" fill="#8E4F3A"/>`;
  },
};
C.fennel.arms = armSet({ sx: 80, sy: 170, chin: [136, 140], heart: C.fennel.heart });

// ---- Clover · Timeclock (bumblebee) ----
C.clover = {
  key: 'clover', name: 'Clover',
  defs: (id) => radial(id + 'b', [[0, '#F1D38A'], [0.55, '#D9AC4E'], [1, '#A47A2E']]) + `<clipPath id="${id}k"><path d="${ell(120, 192, 48, 42)}"/></clipPath>`,
  arm: { w: 7.5, col: '#4A3A2E', edge: '#2B2119', hand: '#5A4838' },
  legs: { hips: [[106, 228], [134, 228]], feet: [[102, 256], [138, 256]], col: '#4A3A2E', edge: '#2B2119', shoe: '#2B2119' },
  face: { ex: [101, 139], ey: 106, er: 10, browY: 89, browW: 14, browCol: '#6B4F2A', skin: '#DFB55C', mx: 120, my: 128, ms: 8.5 },
  q: [196, 70], heart: [120, 194, 12], propHand: STD_PROP, prop: PROPS.watch,
  back(c) {
    const flap = c.expr === 'celebrate' || c.expr === 'happy' ? 10 : 0;
    return `<g fill="#FFFFFF" fill-opacity=".6" stroke="#B9CCD6" stroke-width="1.6"><ellipse cx="80" cy="150" rx="30" ry="17" transform="rotate(${-28 - flap} 96 160)"/><ellipse cx="160" cy="150" rx="30" ry="17" transform="rotate(${28 + flap} 144 160)"/><ellipse cx="86" cy="170" rx="20" ry="11" transform="rotate(-8 96 170)"/><ellipse cx="154" cy="170" rx="20" ry="11" transform="rotate(8 144 170)"/></g>`
      + `<path d="M108,70 Q100,46 88,38 M132,70 Q140,46 152,38" fill="none" stroke="#4A3A2E" stroke-width="3" stroke-linecap="round"/><circle cx="88" cy="38" r="4.5" fill="#4A3A2E"/><circle cx="152" cy="38" r="4.5" fill="#4A3A2E"/>`;
  },
  body(c) {
    return shape(ell(120, 192, 48, 42), `url(#${c.id}b)`, '#7A5A22', c)
      + `<g clip-path="url(#${c.id}k)" fill="#4A3A2E"><path d="M60,176 Q120,168 180,176 L180,190 Q120,182 60,190Z"/><path d="M60,204 Q120,196 180,204 L180,218 Q120,210 60,218Z"/></g>`
      + shape(ell(120, 108, 44, 42), `url(#${c.id}b)`, '#7A5A22', c)
      + `<ellipse cx="96" cy="84" rx="14" ry="6" transform="rotate(-36 96 84)" fill="#fff" opacity=".25"/>`;
  },
};
C.clover.arms = armSet({ sx: 76, sy: 174, chin: [134, 134], heart: C.clover.heart });

// ---- Marigold · Marketing (flower) ----
C.marigold = {
  key: 'marigold', name: 'Marigold',
  defs: (id) => linear(id + 'p', [[0, '#EFAE55'], [1, '#C8742C']]) + linear(id + 'q', [[0, '#F5C878'], [1, '#DE9440']]) + radial(id + 'f', [[0, '#F5E2C8'], [1, '#DDBB94']], 0.4, 0.35, 0.8)
    + linear(id + 'g', [[0, '#8AA672'], [1, '#56704A']]) + linear(id + 'l', LEAF),
  arm: { w: 7.5, col: '#6F8C5C', edge: '#46603C', hand: '#7E9B66' },
  legs: { hips: [[110, 226], [130, 226]], feet: [[106, 256], [134, 256]], col: '#5E7A4E', edge: '#46603C', shoe: '#3C4E32' },
  face: { ex: [105, 135], ey: 104, er: 9, browY: 89, browW: 13, browCol: '#8A5A2A', skin: '#E9CBA6', mx: 120, my: 124, ms: 8 },
  q: [206, 70], heart: [120, 190, 11], propHand: { neutral: 'R', wave: 'L', curious: 'L', silly: 'R', celebrate: 'R', happy: 'R' }, prop: PROPS.megaphone,
  back(c) {
    let s = '';
    const n = 14, rot = c.expr === 'silly' ? 6 : 0;
    for (let i = 0; i < n; i++) { const a = i * 360 / n + rot; s += `<ellipse cx="120" cy="${108 - 48}" rx="12" ry="21" fill="url(#${c.id}p)" stroke="#A55E2C" stroke-width="1.2" transform="rotate(${a} 120 108)"/>`; }
    for (let i = 0; i < n; i++) { const a = i * 360 / n + 360 / n / 2 + rot; s += `<ellipse cx="120" cy="${108 - 38}" rx="10" ry="15" fill="url(#${c.id}q)" transform="rotate(${a} 120 108)"/>`; }
    return s;
  },
  body(c) {
    const d = 'M98,146 C88,170 84,214 90,234 L150,234 C156,214 152,170 142,146 Q120,138 98,146Z';
    return shape(d, `url(#${c.id}g)`, '#46603C', c)
      + leafSVG(108, 148, 22, -70, 8, `url(#${c.id}l)`) + leafSVG(132, 148, 22, 70, 8, `url(#${c.id}l)`)
      + shape(ell(120, 108, 34, 34), `url(#${c.id}f)`, '#B88E62', c);
  },
};
C.marigold.arms = armSet({ sx: 96, sy: 164, k: 0.95, chin: [132, 132], heart: C.marigold.heart });

// ---- Loam · Messages (earthworm courier) ----
const LOAM_D = 'M56,234 L124,234 C164,234 178,200 158,172 C142,150 120,140 121,98';
C.loam = {
  key: 'loam', name: 'Loam', cx: 133,
  defs: (id) => linear(id + 'b', [[0, '#E6B3A3'], [1, '#C7897A']], 0, 0, 1, 0),
  arm: { w: 7.5, col: '#D49A8A', edge: '#A4685A', hand: '#DDA696' },
  face: { ex: [110, 133], ey: 104, er: 8.5, browY: 90, browW: 12, browCol: '#8A4E40', skin: '#DCA494', mx: 121, my: 120, ms: 8 },
  q: [176, 62], heart: [134, 176, 11], shadow: [118, 262, 76, 6], propHand: STD_PROP, prop: PROPS.envelope,
  body(c) {
    let rings = '';
    for (let i = 4; i < 82; i += 5) rings += `0.35 4.65 `;
    return `<path d="${LOAM_D}" fill="none" stroke="#A4685A" stroke-width="58" stroke-linecap="round"/>`
      + `<g${c.G}><path d="${LOAM_D}" fill="none" stroke="url(#${c.id}b)" stroke-width="54" stroke-linecap="round"/></g>`
      + `<path d="${LOAM_D}" pathLength="100" fill="none" stroke="#9A5E50" stroke-opacity=".2" stroke-width="54" stroke-dasharray="${rings}0 100" stroke-dashoffset="-4"/>`
      + `<path d="${LOAM_D}" pathLength="100" fill="none" stroke="#EEC6B8" stroke-opacity=".75" stroke-width="54" stroke-dasharray="0 52 7 100"/>`
      + `<ellipse cx="108" cy="88" rx="10" ry="5" transform="rotate(-40 108 88)" fill="#fff" opacity=".3"/>`;
  },
  front(c) {
    return `<path d="M96,84 C94,60 148,58 146,84Z" fill="#2E4A3C"/><path d="M96,84 C110,80 132,80 146,84" fill="none" stroke="#22382D" stroke-width="2"/><ellipse cx="134" cy="85" rx="20" ry="4.5" fill="#22382D"/><circle cx="121" cy="71" r="4" fill="#F2D98A"/>`
      + `<path d="M106,140 Q140,160 160,196" fill="none" stroke="#5A4636" stroke-width="4" stroke-linecap="round"/>`
      + `<g transform="rotate(-6 166 204)"><rect x="148" y="190" width="38" height="28" rx="6" fill="#3C5A49" stroke="#22382D" stroke-width="1.6"/><rect x="152" y="185" width="22" height="12" rx="1.5" fill="#FBF7EF" stroke="#BBA88E" stroke-width="1"/><path d="M148,196 Q167,206 186,196 L186,194 Q186,190 182,190 L152,190 Q148,190 148,194Z" fill="#2E4A3C"/><circle cx="167" cy="201" r="2.6" fill="#D9AE4E"/></g>`;
  },
};
C.loam.arms = armSet({ cx: 133, sx: 108, sy: 154, k: 0.9, chin: [136, 124], heart: C.loam.heart });

// ---- Dot · Calendar & Events (ladybug) ----
C.dot = {
  key: 'dot', name: 'Dot',
  defs: (id) => radial(id + 'b', [[0, '#D27461'], [0.55, '#B04C3A'], [1, '#7A2E24']]) + radial(id + 'h', [[0, '#6A5F57'], [0.6, '#463D36'], [1, '#2A231E']]),
  arm: { w: 7, col: '#3A322C', edge: '#1E1814', hand: '#4A413A' },
  legs: { hips: [[106, 230], [134, 230]], feet: [[102, 257], [138, 257]], col: '#3A322C', edge: '#1E1814', shoe: '#1E1814' },
  face: { ex: [104, 136], ey: 100, er: 10, browY: 84, browW: 13, browCol: '#D8C6B2', skin: '#3F3630', lid: '#15110E', mouthInk: '#F1E4D4', mx: 120, my: 120, ms: 8 },
  q: [194, 66], heart: [120, 194, 12], propHand: STD_PROP, prop: PROPS.calendar,
  back() {
    return `<path d="M108,66 Q98,46 92,36 M132,66 Q142,46 148,36" fill="none" stroke="#2B241D" stroke-width="2.8" stroke-linecap="round"/><circle cx="92" cy="36" r="4" fill="#2B241D"/><circle cx="148" cy="36" r="4" fill="#2B241D"/>`;
  },
  body(c) {
    const spots = [[98, 168], [92, 196], [104, 222], [142, 168], [148, 196], [136, 222]];
    return shape(ell(120, 190, 56, 48), `url(#${c.id}b)`, '#5A1F18', c)
      + `<path d="M120,146 L120,236" stroke="#5A1F18" stroke-width="2.4"/>`
      + spots.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="7.5" fill="${i === 4 ? '#E2AE45' : '#2B241D'}"/>`).join('')
      + `<ellipse cx="94" cy="160" rx="13" ry="6" transform="rotate(-30 94 160)" fill="#fff" opacity=".18"/>`
      + `<ellipse cx="120" cy="142" rx="34" ry="10" fill="#2B241D"/><circle cx="106" cy="142" r="3.6" fill="#EFE3D3"/><circle cx="134" cy="142" r="3.6" fill="#EFE3D3"/>`
      + shape(ell(120, 102, 38, 36), `url(#${c.id}h)`, '#15110E', c);
  },
};
C.dot.arms = armSet({ sx: 70, sy: 172, chin: [134, 126], heart: C.dot.heart });

// ---- Flicker · Photos (firefly) ----
C.flicker = {
  key: 'flicker', name: 'Flicker',
  defs: (id) => radial(id + 'g', [[0, '#FFE58A', 0.6], [1, '#FFE58A', 0]], 0.5, 0.5, 0.5) + radial(id + 'a', [[0, '#FFF6CC'], [0.6, '#FBDD78'], [1, '#E2AE3E']], 0.45, 0.35, 0.8)
    + radial(id + 'h', [[0, '#D88E68'], [0.6, '#B8673F'], [1, '#86452A']]) + radial(id + 't', [[0, '#76604F'], [1, '#4A3A30']]) + radial(id + 'f', [[0, '#F3E3CF'], [1, '#DCC3A6']], 0.45, 0.35, 0.8),
  arm: { w: 7, col: '#4E3E33', edge: '#2E241D', hand: '#5E4C40' },
  legs: { hips: [[108, 232], [132, 232]], feet: [[104, 257], [136, 257]], col: '#4E3E33', edge: '#2E241D', shoe: '#2E241D' },
  face: { ex: [106, 134], ey: 108, er: 8.5, browY: 94, browW: 12, browCol: '#7A3E28', skin: '#E7D2B8', mx: 120, my: 124, ms: 7.5 },
  q: [194, 64], heart: [120, 178, 11], propHand: STD_PROP, prop: PROPS.camera,
  back(c) {
    return `<circle cx="120" cy="214" r="${c.expr === 'celebrate' ? 74 : 62}" fill="url(#${c.id}g)"/>`
      + `<path d="M110,70 Q98,34 76,26 M130,70 Q142,34 164,26" fill="none" stroke="#4A3A30" stroke-width="2.6" stroke-linecap="round"/><circle cx="76" cy="26" r="3.8" fill="#4A3A30"/><circle cx="164" cy="26" r="3.8" fill="#4A3A30"/>`
      + `<g fill="#A38C78" fill-opacity=".8" stroke="#6E5A4A" stroke-width="1.4"><ellipse cx="88" cy="176" rx="16" ry="34" transform="rotate(24 88 176)"/><ellipse cx="152" cy="176" rx="16" ry="34" transform="rotate(-24 152 176)"/></g>`;
  },
  body(c) {
    return shape(ell(120, 214, 36, 28), `url(#${c.id}a)`, '#C9952E', c)
      + shape(ell(120, 166, 30, 26), `url(#${c.id}t)`, '#2E241D', c)
      + shape(ell(120, 104, 40, 38), `url(#${c.id}h)`, '#6E3420', c)
      + `<ellipse cx="120" cy="112" rx="29" ry="24" fill="url(#${c.id}f)"/><ellipse cx="98" cy="82" rx="12" ry="5" transform="rotate(-34 98 82)" fill="#fff" opacity=".25"/>`;
  },
};
C.flicker.arms = armSet({ sx: 94, sy: 162, k: 0.95, chin: [132, 130], heart: C.flicker.heart });

// ---- Bramble · Forms (hedgehog) ----
function quills(cx, cy, R, r, a0, a1, n) {
  let d = '';
  for (let i = 0; i <= n * 2; i++) {
    const a = (a0 + (a1 - a0) * i / (n * 2)) * Math.PI / 180, rr = i % 2 ? R : r;
    d += `${i ? 'L' : 'M'}${r1(cx + Math.cos(a) * rr)},${r1(cy + Math.sin(a) * rr)} `;
  }
  return d + `L${cx + 50},${cy + 70} L${cx - 50},${cy + 70}Z`;
}
C.bramble = {
  key: 'bramble', name: 'Bramble',
  defs: (id) => radial(id + 'q', [[0, '#8E6E54'], [0.7, '#6B5040'], [1, '#4A372C']], 0.5, 0.55, 0.6) + radial(id + 'b', [[0, '#F2E6D4'], [0.6, '#E2CDB0'], [1, '#C4A888']]),
  arm: { w: 8, col: '#7C5E48', edge: '#4E3A2C', hand: '#8A6A52' },
  legs: { hips: [[106, 226], [134, 226]], feet: [[102, 256], [138, 256]], col: '#7C5E48', edge: '#4E3A2C', shoe: '#3E2E24' },
  face: { ex: [102, 138], ey: 124, er: 9, browY: 109, browW: 13, browCol: '#6B5444', skin: '#E6D5BE', mx: 120, my: 159, ms: 10,
    extra: '<ellipse cx="120" cy="145" rx="7.5" ry="5.5" fill="#2B241D"/><ellipse cx="118" cy="143" rx="2.4" ry="1.4" fill="#fff" opacity=".6"/>' },
  q: [200, 70], heart: [120, 194, 12], propHand: STD_PROP, prop: PROPS.form,
  back(c) {
    const ruffle = c.expr === 'celebrate' || c.expr === 'silly' ? 6 : 0;
    return shape(quills(120, 146, 92 + ruffle, 70, -200, 20, 11), `url(#${c.id}q)`, '#3E2E24', c, 1.6)
      + pencil(172, 76, 34) + pencil(70, 70, -28)
      + `<circle cx="90" cy="82" r="9" fill="#C9A882" stroke="#8E6E54" stroke-width="1.5"/><circle cx="150" cy="82" r="9" fill="#C9A882" stroke="#8E6E54" stroke-width="1.5"/>`;
  },
  body(c) {
    return shape('M120,78 C158,78 176,120 176,160 C176,206 152,232 120,232 C88,232 64,206 64,160 C64,120 82,78 120,78Z', `url(#${c.id}b)`, '#A68A6A', c);
  },
};
C.bramble.arms = armSet({ sx: 70, sy: 170, chin: [134, 164], heart: C.bramble.heart });

// ---- Tansy · Committees (ant) ----
C.tansy = {
  key: 'tansy', name: 'Tansy',
  defs: (id) => radial(id + 'b', [[0, '#C4806A'], [0.55, '#9C5A44'], [1, '#6A3626']]) + linear(id + 'l', LEAF),
  arm: { w: 6.5, col: '#80442F', edge: '#55291C', hand: '#94543D' },
  legs: { hips: [[108, 232], [132, 232]], feet: [[100, 257], [140, 257]], col: '#80442F', edge: '#55291C', shoe: '#45201A', w: 7 },
  face: { ex: [104, 136], ey: 100, er: 9.5, browY: 84, browW: 13, browCol: '#4E2418', skin: '#A86450', mx: 120, my: 120, ms: 8 },
  q: [36, 70], heart: [120, 168, 10], propHand: { neutral: 'R', wave: 'L', curious: 'L', silly: 'R', celebrate: 'R', happy: 'R' },
  prop(x, y, c, side) {
    const m = side === 'L' ? -1 : 1, up = c.pose === 'up' || c.pose === 'cheer';
    const tx = r1(x + m * (up ? 14 : 18)), ty = r1(y - (up ? 34 : 82));
    return `<path d="M${x},${y + 8} L${tx},${ty}" stroke="#7E5530" stroke-width="3.6" stroke-linecap="round"/>` + leafSVG(tx, ty + 6, up ? 46 : 54, m * (up ? 64 : 38), 18, `url(#${c.id}l)`);
  },
  back(c) {
    return `<path d="M106,68 L98,48 L80,42 M134,68 L142,48 L160,42" fill="none" stroke="#55291C" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="80" cy="42" r="3.8" fill="#55291C"/><circle cx="160" cy="42" r="3.8" fill="#55291C"/>`
      + limb([[104, 166], [80, 172], [70, 196]], 5.5, '#80442F', '#55291C', 2) + limb([[136, 166], [160, 172], [170, 196]], 5.5, '#80442F', '#55291C', 2);
  },
  body(c) {
    return shape(ell(120, 208, 38, 32), `url(#${c.id}b)`, '#45201A', c)
      + `<path d="M88,206 Q120,214 152,206 M92,220 Q120,228 148,220" fill="none" stroke="#6A3626" stroke-width="1.6" opacity=".5"/>`
      + `<path d="M120,132 L120,148" stroke="#6A3626" stroke-width="10" stroke-linecap="round"/>`
      + shape(ell(120, 162, 22, 18), `url(#${c.id}b)`, '#45201A', c)
      + shape(ell(120, 102, 37, 35), `url(#${c.id}b)`, '#45201A', c)
      + `<ellipse cx="100" cy="80" rx="11" ry="5" transform="rotate(-34 100 80)" fill="#fff" opacity=".22"/>`;
  },
};
C.tansy.arms = armSet({ sx: 100, sy: 158, k: 0.9, chin: [132, 126], heart: C.tansy.heart });

// =====================================================================
const ICON = {
  pip: { cx: 120, cy: 140, s: 1.12, ty: 128, bgs: ['#2E4A3C', '#E8DCC8'] },
  nutmeg: { cx: 120, cy: 140, s: 1.1, ty: 130, bgs: ['#2E4A3C', '#DDEBD5'] },
  dig: { cx: 120, cy: 128, s: 1.3, ty: 126, bgs: ['#F2D98A', '#2E4A3C'] },
  terra: { cx: 132, cy: 140, s: 0.98, ty: 128, bgs: ['#2E4A3C', '#DDEBD5'] },
  fennel: { cx: 120, cy: 118, s: 1.2, ty: 124, bgs: ['#E8DCC8', '#F2D98A'] },
  clover: { cx: 120, cy: 118, s: 1.15, ty: 124, bgs: ['#2E4A3C', '#E3EDFB'] },
  marigold: { cx: 120, cy: 112, s: 1.25, ty: 118, bgs: ['#2E4A3C', '#E3EDFB'] },
  loam: { cx: 124, cy: 120, s: 1.15, ty: 124, bgs: ['#2E4A3C', '#E8DCC8'] },
  dot: { cx: 120, cy: 120, s: 1.18, ty: 124, bgs: ['#E8DCC8', '#DDEBD5'] },
  flicker: { cx: 120, cy: 126, s: 1.12, ty: 124, bgs: ['#2B241D', '#2E4A3C'] },
  bramble: { cx: 120, cy: 130, s: 1.12, ty: 126, bgs: ['#2E4A3C', '#F8DDCF'] },
  tansy: { cx: 120, cy: 118, s: 1.15, ty: 124, bgs: ['#DDEBD5', '#E8DCC8'] },
};
const EXPRS = ['neutral', 'happy', 'curious', 'silly', 'supportive', 'celebrate', 'wave'];

function render(name, expr = 'neutral', opts = {}) {
  const { defs, body } = build(C[name], { expr, ...opts });
  const label = opts.label != null ? opts.label : `${C[name].name}, ${expr}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280"${label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"'}${opts.cls ? ` class="${opts.cls}"` : ''}><defs>${defs}</defs>${body}</svg>`;
}
function icon(name, bgIndex = 0, opts = {}) {
  const c = ICON[name];
  const { defs, body } = build(C[name], { expr: opts.expr || 'neutral', simple: true });
  const id = nid('ic');
  const label = opts.label != null ? opts.label : `${C[name].name} app icon`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"${label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"'}><defs>${defs}`
    + radial(id + 'g', [[0, '#fff', 0.2], [1, '#fff', 0]], 0.3, 0.2, 0.8) + `<clipPath id="${id}c"><rect width="240" height="240" rx="54"/></clipPath></defs>`
    + `<g clip-path="url(#${id}c)"><rect width="240" height="240" fill="${c.bgs[bgIndex]}"/><rect width="240" height="240" fill="url(#${id}g)"/>`
    + `<g transform="translate(120,${c.ty}) scale(${c.s}) translate(${-c.cx},${-c.cy})">${body}</g></g></svg>`;
}

const api = { render, icon, C, ICON, EXPRS };
if (typeof module !== 'undefined') module.exports = api;
if (typeof window !== 'undefined') window.MKCrew = api;
