// MudKitchen social post templates. Each template takes slots and returns a standalone SVG string.
// Requires SB (storybook renderer) and an ASSETS object: { fontsCss, logo } (data URIs).
module.exports = function makePosts(SB, ASSETS) {
  const T = {
    ink: '#2B241D', soft: '#6D6257', cream: '#F7F1E7', paper: '#FFFAF4', clay: '#A05C45', clayDeep: '#7E4533',
    forest: '#2E4A3C', forestDeep: '#1F3329', butter: '#FFE58A', mint: '#DDEBD5', sky: '#E3EDFB', lav: '#ECE2F3', peach: '#F8DDCF', moss: '#A6B89A',
  };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // ---------- primitives ----------
  const style = `<style>${ASSETS.fontsCss}
    .d{font-family:'Bricolage Grotesque','Avenir Next',sans-serif;font-weight:800;letter-spacing:-0.02em}
    .b{font-family:'Nunito','Avenir',sans-serif;font-weight:600}
    .bb{font-family:'Nunito','Avenir',sans-serif;font-weight:800}
    .h{font-family:'Gochi Hand','Comic Sans MS',cursive}
    .u{font-family:'Nunito','Avenir',sans-serif;font-weight:800;letter-spacing:0.08em;text-transform:uppercase}
  </style>`;
  const paperDefs = `<filter id="pp-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="4"/><feColorMatrix type="matrix" values="0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .15  0 0 0 .09 0"/></filter>`
    + `<filter id="pp-shadow" x="-10%" y="-10%" width="130%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#2B241D" flood-opacity=".16"/></filter>`;
  const text = (x, y, lines, cls, size, fill, o = {}) => {
    const lh = o.lh || size * 1.12, anchor = o.anchor || 'start';
    return `<text x="${x}" y="${y}" class="${cls}" font-size="${size}" fill="${fill}" text-anchor="${anchor}"${o.rot ? ` transform="rotate(${o.rot} ${x} ${y})"` : ''}>`
      + lines.map((l, i) => `<tspan x="${x}" dy="${i ? lh : 0}">${Array.isArray(l) ? l.map(([t, c]) => `<tspan fill="${c}">${esc(t)}</tspan>`).join('') : esc(l)}</tspan>`).join('') + `</text>`;
  };
  const pill = (x, y, label, bg, fg, size = 22) => {
    const w = label.length * size * 0.72 + 44;
    return `<g><rect x="${x}" y="${y}" width="${w}" height="${size * 2.1}" rx="${size * 1.05}" fill="${bg}"/>${text(x + 22, y + size * 1.42, [label], 'u', size, fg)}</g>`;
  };
  const button = (x, y, label, bg, fg, shadow) => {
    const w = label.length * 17 + 76;
    return `<g><rect x="${x}" y="${y + 7}" width="${w}" height="72" rx="36" fill="${shadow}"/><rect x="${x}" y="${y}" width="${w}" height="72" rx="36" fill="${bg}" stroke="${shadow}" stroke-width="3"/>${text(x + w / 2, y + 47, [label], 'bb', 30, fg, { anchor: 'middle' })}</g>`;
  };
  const tape = (x, y, w, rot, col = '#F2D98A') => `<g transform="rotate(${rot} ${x} ${y})"><rect x="${x - w / 2}" y="${y - 17}" width="${w}" height="34" fill="${col}" opacity=".82"/><path d="M${x - w / 2},${y - 17} l-5,8 l5,9 l-5,8 l5,9 M${x + w / 2},${y - 17} l5,8 l-5,9 l5,8 l-5,9" fill="none" stroke="${col}" stroke-width="2" opacity=".82"/><path d="M${x - w / 2 + 8},${y - 8} h${w - 16}" stroke="#fff" stroke-width="3" opacity=".35"/></g>`;
  const sticky = (x, y, w, h, rot, col, lines, size = 26) => `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})" filter="url(#pp-shadow)"><path d="M${x},${y} h${w} v${h - 26} l-26,26 h${-(w - 26)}Z" fill="${col}"/><path d="M${x + w},${y + h - 26} l-26,26 v-22 q0,-4 4,-4Z" fill="#000" opacity=".1"/>${text(x + 20, y + 40, lines, 'b', size, T.ink, { lh: size * 1.22 })}</g>`;
  const sprig = (x, y, s, rot, col = '#7DB05A') => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><path d="M0,0 Q4,-30 2,-60" fill="none" stroke="#3F6B32" stroke-width="3" stroke-linecap="round"/>${[[-14, 0], [-30, 1], [-46, 0]].map(([yy, side], i) => `<path d="M2,${yy} c-14,-4 -20,-14 -18,-20 c10,0 18,8 18,20z" fill="${col}" stroke="#3F6B32" stroke-width="1.6" transform="${i % 2 ? 'scale(-1,1)' : ''}"/>`).join('')}</g>`;
  const squiggle = (x, y, w, col) => `<path d="M${x},${y} q${w / 8},-12 ${w / 4},0 t${w / 4},0 t${w / 4},0 t${w / 4},0" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round"/>`;
  const dotsDeco = (pts, col) => pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`).join('');
  const footer = (x, y, dark) => `<g><image href="${ASSETS.logo}" x="${x}" y="${y - 44}" width="58" height="58"/>${text(x + 66, y, ['MudKitchen'], 'd', 34, dark ? T.cream : T.ink)}</g>`;
  const character = (key, view, x, y, w, o = {}) => {
    const C = SB.C[key];
    return `<svg x="${x}" y="${y}" width="${w}" height="${w * 260 / 240}" viewBox="0 0 240 260" overflow="visible">${SB.render(C, view, { ground: o.ground !== false })}</svg>`;
  };
  const doc = (w, h, chars, body, title) => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(title)}">`
    + `<defs>${style}${paperDefs}${SB.baseDefs()}${[...new Set(chars)].map((k) => SB.C[k].defs()).join('')}</defs>${body}</svg>`;
  const bg = (w, h, fill) => `<rect width="${w}" height="${h}" fill="${fill}"/><rect width="${w}" height="${h}" filter="url(#pp-grain)"/>`;

  // ---------- browser window illustration (School Website) ----------
  const browser = (x, y, w, h, rot) => {
    const s = (yy) => y + yy;
    return `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})" filter="url(#pp-shadow)">`
      + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="${T.paper}" stroke="${T.ink}" stroke-width="4"/>`
      + `<path d="M${x},${s(58)} h${w}" stroke="${T.ink}" stroke-width="4"/>`
      + [0, 1, 2].map((i) => `<circle cx="${x + 34 + i * 26}" cy="${s(29)}" r="8.5" fill="${['#E0663F', '#F5B83A', '#7DB05A'][i]}" stroke="${T.ink}" stroke-width="2.5"/>`).join('')
      + `<rect x="${x + 120}" y="${s(14)}" width="${w - 150}" height="30" rx="15" fill="${T.cream}" stroke="${T.ink}" stroke-width="2.5"/><circle cx="${x + 140}" cy="${s(29)}" r="6" fill="none" stroke="${T.soft}" stroke-width="2.5"/>`
      + `<rect x="${x + 22}" y="${s(78)}" width="${w - 44}" height="150" rx="16" fill="${T.forest}"/>`
      + `<rect x="${x + 46}" y="${s(108)}" width="${w * 0.42}" height="20" rx="10" fill="${T.cream}"/><rect x="${x + 46}" y="${s(140)}" width="${w * 0.3}" height="14" rx="7" fill="${T.moss}"/>`
      + `<rect x="${x + 46}" y="${s(174)}" width="118" height="36" rx="18" fill="${T.butter}"/>${text(x + 105, s(198), ['Enroll'], 'bb', 18, T.ink, { anchor: 'middle' })}`
      + `<circle cx="${x + w - 92}" cy="${s(152)}" r="48" fill="#3E6A50"/>` + sprig(x + w - 92, s(186), 1.1, 0, '#9FD06A')
      + [0, 1, 2].map((i) => { const cw = (w - 44 - 28) / 3, cx = x + 22 + i * (cw + 14); return `<rect x="${cx}" y="${s(246)}" width="${cw}" height="118" rx="14" fill="${['#F8DDCF', '#DDEBD5', '#E3EDFB'][i]}" stroke="${T.ink}" stroke-width="2.5"/><circle cx="${cx + 26}" cy="${s(276)}" r="12" fill="${['#E0663F', '#7DB05A', '#6FA3D8'][i]}"/><rect x="${cx + 16}" y="${s(302)}" width="${cw - 32}" height="12" rx="6" fill="${T.ink}" opacity=".7"/><rect x="${cx + 16}" y="${s(324)}" width="${cw - 52}" height="10" rx="5" fill="${T.soft}" opacity=".45"/>`; }).join('')
      + text(x + 24, s(406), ['Programs · FAQs · Team'], 'bb', 20, T.soft)
      + [0, 1].map((i) => `<rect x="${x + 22}" y="${s(424 + i * 46)}" width="${w - 44}" height="36" rx="12" fill="${T.cream}" stroke="#D8CBB8" stroke-width="2"/><path d="M${x + w - 52},${s(437 + i * 46)} l8,8 l8,-8" fill="none" stroke="${T.soft}" stroke-width="3" stroke-linecap="round"/><rect x="${x + 40}" y="${s(437 + i * 46)}" width="${w * 0.45}" height="10" rx="5" fill="${T.soft}" opacity=".5"/>`).join('')
      + `</g>`;
  };

  // =================== TEMPLATE 1: Feature spotlight (1080×1080) ===================
  function spotlight(o) {
    const W = 1080, H = 1080;
    let s = bg(W, H, T.cream);
    s += dotsDeco([[980, 90, 10], [1010, 140, 6], [60, 1000, 8]], T.moss);
    s += pill(80, 84, o.feature, T.peach, T.clayDeep);
    s += text(80, 228, o.headline, 'd', o.headSize || 78, T.ink, { lh: 86 });
    s += squiggle(84, 330, 300, T.butter);
    s += text(84, 400, o.body, 'b', 32, T.soft, { lh: 44 });
    s += (o.card ? featureCard(o.card, 500, 470, 500, 500, 2.5) : browser(500, 470, 500, 500, 2.5)) + tape(560, 470, 120, -14) + tape(980, 500, 110, 18, '#C7DCEB');
    s += character(o.char, o.view, 50, 498, 448);
    if (o.note !== false) s += text(250, 572, ['say hi to ' + o.name.toLowerCase() + '!'], 'h', 36, T.forest, { rot: -6 }) + `<path d="M258,586 q-30,10 -40,40" fill="none" stroke="${T.forest}" stroke-width="3.5" stroke-linecap="round"/><path d="M210,614 l8,14 l12,-12" fill="none" stroke="${T.forest}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += button(80, 990 - 24, o.cta, T.clay, '#fff', T.clayDeep);
    s += footer(778, 1030, false);
    return doc(W, H, [o.char], s, `${o.name}: ${o.feature} spotlight`);
  }

  // =================== TEMPLATE 2: Customer proof (1080×1350) ===================
  function proof(o) {
    const W = 1080, H = 1350;
    let s = bg(W, H, T.forest);
    s += dotsDeco([[960, 110, 12], [1000, 170, 7], [80, 1180, 9], [1010, 760, 6]], '#3E6A50');
    s += pill(80, 80, o.badge, T.butter, T.forestDeep);
    s += text(80, 186, [o.location], 'bb', 28, T.moss);
    s += text(80, 290, [o.headLead], 'd', 72, T.cream);
    s += text(80, 372, [o.headAccent], 'd', 72, T.butter);
    // polaroid
    const px = 210, py = 450, pw = 660, ph = 560;
    s += `<g transform="rotate(-3 ${px + pw / 2} ${py + ph / 2})" filter="url(#pp-shadow)"><rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="8" fill="${T.paper}"/>`
      + `<rect x="${px + 30}" y="${py + 30}" width="${pw - 60}" height="${ph - 130}" rx="4" fill="#E9F2DD"/><rect x="${px + 30}" y="${py + 30 + ph - 220}" width="${pw - 60}" height="90" fill="#CFE2B8"/>`
      + character(o.char, o.view, px + 150, py + 20, 360, { ground: false })
      + text(px + pw / 2, py + ph - 42, [o.polaroidNote], 'h', 44, T.forest, { anchor: 'middle' }) + `</g>`;
    s += tape(px + pw / 2, py - 4, 170, -4) + sprig(130, 1010, 1.6, -18) + sprig(960, 990, 1.4, 22, '#9FD06A');
    // stats
    o.stats.forEach((st, i) => {
      const cw = 290, cx = 80 + i * (cw + 25), cy = 1060, rot = [-2, 1.5, -1][i];
      s += `<g transform="rotate(${rot} ${cx + cw / 2} ${cy + 70})"><rect x="${cx}" y="${cy}" width="${cw}" height="140" rx="18" fill="${[T.butter, T.peach, T.mint][i]}"/>`
        + text(cx + 28, cy + 78, [st[0]], 'd', 64, T.ink) + text(cx + 30, cy + 116, [st[1]], 'bb', 24, T.soft) + `</g>`;
    });
    s += button(80, 1240, o.cta, T.butter, T.forestDeep, '#1A2C22');
    s += footer(778, 1292, true);
    return doc(W, H, [o.char], s, `${o.name}: ${o.badge}`);
  }

  // =================== TEMPLATE 3: Before → after (1080×1080) ===================
  function beforeAfter(o) {
    const W = 1080, H = 1080;
    let s = bg(W, H, T.cream);
    s += text(70, 120, o.headLead, 'd', 52, T.ink, { lh: 60 });
    s += text(70, 240, [o.headAccent], 'd', 52, T.clay);
    s += squiggle(74, 268, 250, T.butter);
    // panels
    const P1 = [50, 316, 470, 650], P2 = [560, 316, 470, 650];
    s += `<rect x="${P1[0]}" y="${P1[1]}" width="${P1[2]}" height="${P1[3]}" rx="36" fill="${T.lav}"/><rect x="${P2[0]}" y="${P2[1]}" width="${P2[2]}" height="${P2[3]}" rx="36" fill="${T.mint}"/>`;
    s += pill(P1[0] + 28, P1[1] + 26, o.beforeLabel, T.paper, '#5E3A78', 20) + pill(P2[0] + 28, P2[1] + 26, o.afterLabel, T.paper, T.forest, 20);
    // scattered notes
    const notes = [[P1[0] + 20, P1[1] + 90, 244, 96, -5, T.butter], [P1[0] + 210, P1[1] + 156, 240, 124, 6, T.peach], [P1[0] + 30, P1[1] + 246, 246, 96, 3, T.sky]];
    o.scattered.forEach((lines, i) => { const [x, y, w, h, r, c] = notes[i]; s += sticky(x, y, w, h, r, c, lines, 22); });
    s += character(o.char, o.beforeView, P1[0] + 190, P1[1] + 392, 252, { ground: false });
    // tidy card
    const cx = P2[0] + 40, cy = P2[1] + 104;
    s += `<g filter="url(#pp-shadow)"><rect x="${cx}" y="${cy}" width="390" height="250" rx="22" fill="${T.paper}" stroke="${T.ink}" stroke-width="3"/>`
      + o.tidy.map((t, i) => `<rect x="${cx + 20}" y="${cy + 22 + i * 74}" width="350" height="58" rx="14" fill="${[T.butter, T.peach, T.sky][i]}"/><circle cx="${cx + 50}" cy="${cy + 51 + i * 74}" r="15" fill="${T.forest}"/><path d="M${cx + 43},${cy + 51 + i * 74} l5,5 l9,-10" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>${text(cx + 78, cy + 60 + i * 74, [t], 'bb', 26, T.ink)}`).join('') + `</g>`;
    s += character(o.char, o.afterView, P2[0] + 110, P2[1] + 392, 252, { ground: false });
    // arrow
    s += `<path d="M512,640 q24,-30 52,-6" fill="none" stroke="${T.ink}" stroke-width="5" stroke-linecap="round"/><path d="M552,620 l14,16 l-20,6" fill="none" stroke="${T.ink}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += button(70, 992, o.cta, T.clay, '#fff', T.clayDeep);
    s += footer(778, 1042, false);
    return doc(W, H, [o.char], s, `${o.name}: before and after`);
  }

  // =================== TEMPLATE 4: Quote story (1080×1920) ===================
  function quote(o) {
    const W = 1080, H = 1920;
    let s = `<defs><linearGradient id="q-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF3CF"/><stop offset=".55" stop-color="${T.cream}"/><stop offset="1" stop-color="${T.peach}"/></linearGradient></defs>`;
    s += `<rect width="${W}" height="${H}" fill="url(#q-bg)"/><rect width="${W}" height="${H}" filter="url(#pp-grain)"/>`;
    s += dotsDeco([[960, 260, 12], [1000, 320, 7], [70, 1460, 9]], T.moss) + sprig(980, 1580, 1.8, 14) + sprig(1000, 980, 1.4, 16, '#9FD06A');
    s += pill(80, 250, o.badge, T.clay, '#fff');
    s += text(80, 360, [o.location], 'bb', 30, T.clayDeep);
    s += text(56, 560, ['“'], 'd', 260, T.clay, { lh: 1 });
    s += text(80, 560, o.quoteLines, 'd', 64, T.ink, { lh: 76 });
    const ay = 560 + o.quoteLines.length * 76 + 30;
    s += `<rect x="80" y="${ay - 6}" width="70" height="6" rx="3" fill="${T.clay}"/>` + text(170, ay + 4, [o.author], 'bb', 34, T.ink) + text(170, ay + 48, [o.role], 'b', 28, T.soft);
    // stat card + character
    s += `<g transform="rotate(-5 840 1300)" filter="url(#pp-shadow)"><rect x="700" y="1210" width="300" height="190" rx="18" fill="${T.butter}"/>` + text(730, 1310, [o.stat[0]], 'd', 96, T.ink) + text(732, 1362, [o.stat[1]], 'bb', 28, T.soft) + `</g>` + tape(850, 1210, 110, 6, '#C7DCEB');
    s += character(o.char, o.view, 90, 1196, 510);
    s += button(80, 1760, o.cta, T.clay, '#fff', T.clayDeep);
    s += footer(778, 1810, false);
    return doc(W, H, [o.char], s, `${o.name}: customer quote`);
  }

  // =================== feature illustrations ===================
  const bar = (x, y, w, h = 12, c = T.ink, op = 0.7) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${c}" opacity="${op}"/>`;
  const box = (x, y, w, h, fill, r = 14, stroke = '#D8CBB8') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2.2"/>`;
  const tick = (x, y, s = 1, c = '#fff') => `<path d="M${x - 6 * s},${y} l${4 * s},${5 * s} l${9 * s},${-10 * s}" fill="none" stroke="${c}" stroke-width="${3.4 * s}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const GLYPH = {
    check: (x, y) => tick(x, y + 1),
    mail: (x, y) => `<rect x="${x - 11}" y="${y - 8}" width="22" height="16" rx="3" fill="none" stroke="#fff" stroke-width="2.8"/><path d="M${x - 10},${y - 6} l10,8 l10,-8" fill="none" stroke="#fff" stroke-width="2.6"/>`,
    card: (x, y) => `<rect x="${x - 12}" y="${y - 8}" width="24" height="16" rx="3" fill="none" stroke="#fff" stroke-width="2.8"/><path d="M${x - 12},${y - 2} h24" stroke="#fff" stroke-width="3"/>`,
    user: (x, y) => `<circle cx="${x}" cy="${y - 5}" r="5.5" fill="#fff"/><path d="M${x - 10},${y + 10} q10,-14 20,0" fill="#fff"/>`,
    cal: (x, y) => `<rect x="${x - 11}" y="${y - 9}" width="22" height="19" rx="3" fill="none" stroke="#fff" stroke-width="2.8"/><path d="M${x - 11},${y - 3} h22 M${x - 5},${y - 13} v6 M${x + 5},${y - 13} v6" stroke="#fff" stroke-width="2.6"/>`,
    msg: (x, y) => `<path d="M${x - 12},${y - 9} h24 q3,0 3,3 v11 q0,3 -3,3 h-14 l-7,6 v-6 h-3 q-3,0 -3,-3 v-11 q0,-3 3,-3Z" fill="#fff"/>`,
    clock: (x, y) => `<circle cx="${x}" cy="${y}" r="11" fill="none" stroke="#fff" stroke-width="2.8"/><path d="M${x},${y - 6} v6 l5,3" stroke="#fff" stroke-width="2.6" stroke-linecap="round" fill="none"/>`,
  };
  const notif = (x, y, w, n, rot = 0) => `<g transform="rotate(${rot} ${x + w / 2} ${y + 46})" filter="url(#pp-shadow)"><rect x="${x}" y="${y}" width="${w}" height="92" rx="24" fill="#FFFFFF" stroke="#E6DACB" stroke-width="2"/>`
    + `<circle cx="${x + 48}" cy="${y + 46}" r="26" fill="${n.color}"/>${(GLYPH[n.icon] || GLYPH.check)(x + 48, y + 46)}`
    + text(x + 92, y + 42, [n.title], 'bb', 27, T.ink) + text(x + 92, y + 72, [n.sub], 'b', 22, T.soft) + `</g>`;

  function featureContent(kind, x, y, w, h) {
    let s = '';
    const av = (cx, cy, r, c) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" stroke="#fff" stroke-width="3"/><circle cx="${cx}" cy="${cy - r * 0.2}" r="${r * 0.32}" fill="#fff" opacity=".85"/><path d="M${cx - r * 0.55},${cy + r * 0.6} q${r * 0.55},${-r * 0.7} ${r * 1.1},0" fill="#fff" opacity=".85"/>`;
    const AV = ['#E0663F', '#6FA3D8', '#7DB05A', '#C98AD6', '#F5B83A'];
    if (kind === 'billing') {
      ['Paid', 'Paid', 'Due'].forEach((st, i) => { const yy = y + i * 78; s += box(x, yy, w, 64, i === 2 ? '#FFF7DA' : T.paper) + `<circle cx="${x + 34}" cy="${yy + 32}" r="18" fill="${i === 2 ? '#F5B83A' : '#3E7A5A'}"/>${GLYPH.card(x + 34, yy + 32)}` + bar(x + 66, yy + 20, w * 0.36) + bar(x + 66, yy + 40, w * 0.22, 9, T.soft, 0.45)
        + `<rect x="${x + w - 96}" y="${yy + 17}" width="80" height="30" rx="15" fill="${i === 2 ? T.butter : '#DDEBD5'}"/>` + text(x + w - 56, yy + 39, [st], 'bb', 18, i === 2 ? '#7A5410' : T.forest, { anchor: 'middle' }); });
      const by = y + 250; s += box(x, by, w, h - 250, T.cream);
      [0.45, 0.7, 0.55, 0.9, 0.75].forEach((v, i) => { const bw = (w - 60) / 5 - 12, bx = x + 30 + i * ((w - 60) / 5); s += `<rect x="${bx}" y="${by + (h - 250) - 20 - v * (h - 290)}" width="${bw}" height="${v * (h - 290)}" rx="8" fill="${i === 3 ? T.clay : T.moss}"/>`; });
    } else if (kind === 'attendance') {
      s += `<path d="M${x + 14},${y + 18} l-10,10 l10,10 M${x + w - 14},${y + 18} l10,10 l-10,10" fill="none" stroke="${T.soft}" stroke-width="3.5" stroke-linecap="round"/>` + bar(x + w / 2 - 60, y + 22, 120, 14);
      for (let r = 0; r < 4; r++) { const yy = y + 60 + r * 72; s += box(x, yy, w, 60, r % 2 ? T.cream : T.paper) + av(x + 32, yy + 30, 20, AV[r]) + bar(x + 62, yy + 24, 90);
        for (let d = 0; d < 5; d++) { const cx = x + 190 + d * ((w - 210) / 5) + 16, abs = r === 2 && d === 3; s += `<circle cx="${cx}" cy="${yy + 30}" r="15" fill="${abs ? '#F2C4B6' : '#7DB05A'}"/>` + (abs ? `<path d="M${cx - 5},${yy + 25} l10,10 M${cx + 5},${yy + 25} l-10,10" stroke="#B4553F" stroke-width="3" stroke-linecap="round"/>` : tick(cx, yy + 31, 0.8)); } }
    } else if (kind === 'timeclock') {
      const cx = x + 110, cy = y + 110;
      s += `<circle cx="${cx}" cy="${cy}" r="96" fill="${T.paper}" stroke="${T.ink}" stroke-width="5"/>` + [...Array(12)].map((_, i) => { const a = i * 30 * Math.PI / 180; return `<path d="M${cx + Math.sin(a) * 80},${cy - Math.cos(a) * 80} L${cx + Math.sin(a) * 88},${cy - Math.cos(a) * 88}" stroke="${T.ink}" stroke-width="${i % 3 ? 2.5 : 5}" stroke-linecap="round"/>`; }).join('')
        + `<path d="M${cx},${cy} L${cx},${cy - 60} M${cx},${cy} L${cx + 44},${cy + 14}" stroke="${T.ink}" stroke-width="7" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="9" fill="${T.clay}"/>`;
      s += `<rect x="${x + 250}" y="${y + 40}" width="${w - 250}" height="64" rx="32" fill="${T.forest}"/>` + text(x + 250 + (w - 250) / 2, y + 82, ['Clock in'], 'bb', 24, T.cream, { anchor: 'middle' })
        + bar(x + 252, y + 136, w - 270, 12) + bar(x + 252, y + 162, (w - 270) * 0.6, 10, T.soft, 0.45);
      const by = y + 236; s += box(x, by, w, h - 236, T.cream);
      [0.6, 0.8, 0.7, 0.85, 0.5, 0.15, 0.1].forEach((v, i) => { const bw = (w - 40) / 7 - 12, bx = x + 20 + i * ((w - 40) / 7) + 6; s += `<rect x="${bx}" y="${by + (h - 236) - 18 - v * (h - 276)}" width="${bw}" height="${v * (h - 276)}" rx="7" fill="${i < 5 ? '#F5B83A' : T.moss}"/>`; });
    } else if (kind === 'marketing') {
      const cw = (w - 40) / 3;
      ['#F8DDCF', '#E3EDFB', '#DDEBD5'].forEach((c, i) => { const cx = x + i * (cw + 20); s += box(cx, y, cw, h, c, 16) + bar(cx + 16, y + 20, cw * 0.55, 12);
        for (let k = 0; k < 3 - i % 2; k++) { const yy = y + 54 + k * 92; s += box(cx + 12, yy, cw - 24, 78, T.paper, 12) + `<circle cx="${cx + 38}" cy="${yy + 39}" r="17" fill="${['#E0663F', '#6FA3D8', '#3E7A5A'][i]}"/>${GLYPH.mail(cx + 38, yy + 39)}` + bar(cx + 64, yy + 26, cw - 100, 10) + bar(cx + 64, yy + 46, cw - 120, 8, T.soft, 0.4); }
        if (i < 2) s += `<path d="M${cx + cw + 3},${y + h / 2} h14 m-6,-6 l6,6 l-6,6" fill="none" stroke="${T.ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`; });
    } else if (kind === 'admin') {
      [T.butter, T.peach, T.mint, T.sky].forEach((c, i) => { const tw = (w - 30) / 4, tx = x + i * (tw + 10); s += `<rect x="${tx}" y="${y}" width="${tw}" height="96" rx="16" fill="${c}"/>` + bar(tx + 14, y + 22, tw * 0.5, 10, T.soft, 0.5) + `<rect x="${tx + 14}" y="${y + 46}" width="${tw * 0.45}" height="28" rx="8" fill="${T.ink}" opacity=".8"/>`; });
      const py = y + 120; s += box(x, py, w, 150, T.paper);
      [0, 1, 2, 3].forEach((i) => { const cw = (w - 50) / 4, cx = x + 14 + i * (cw + 7); s += `<rect x="${cx}" y="${py + 14}" width="${cw}" height="122" rx="10" fill="${T.cream}"/>` + bar(cx + 10, py + 26, cw * 0.6, 9, T.soft, 0.5) + [0, 1].slice(0, i === 3 ? 1 : 2).map((k) => `<rect x="${cx + 8}" y="${py + 46 + k * 42}" width="${cw - 16}" height="34" rx="8" fill="#fff" stroke="#E2D6C2" stroke-width="1.6"/>` + `<circle cx="${cx + 24}" cy="${py + 63 + k * 42}" r="8" fill="${AV[i + k]}"/>`).join(''); });
      for (let r = 0; r < 2; r++) { const yy = py + 170 + r * 52; s += box(x, yy, w, 42, T.paper, 12) + `<circle cx="${x + 26}" cy="${yy + 21}" r="12" fill="#7DB05A"/>${tick(x + 26, yy + 22, 0.6)}` + bar(x + 50, yy + 15, w * 0.5, 11); }
    } else if (kind === 'messages') {
      const bub = (bx, by, bw, mine, c) => `<rect x="${bx}" y="${by}" width="${bw}" height="62" rx="24" fill="${c}" stroke="#D8CBB8" stroke-width="2"/>` + bar(bx + 22, by + 18, bw * 0.62, 10) + bar(bx + 22, by + 36, bw * 0.4, 9, T.soft, 0.45) + (mine ? '' : `<circle cx="${bx - 26}" cy="${by + 40}" r="18" fill="#6FA3D8"/>`);
      s += bub(x + 44, y, w * 0.68, false, T.paper) + bub(x + w * 0.3, y + 82, w * 0.7, true, '#DDEBD5') + bub(x + 44, y + 164, w * 0.6, false, T.paper) + bub(x + w * 0.38, y + 246, w * 0.62, true, '#DDEBD5');
      s += `<rect x="${x}" y="${y + h - 52}" width="${w}" height="52" rx="26" fill="${T.cream}" stroke="#D8CBB8" stroke-width="2"/>` + bar(x + 22, y + h - 32, w * 0.4, 10, T.soft, 0.4) + `<circle cx="${x + w - 28}" cy="${y + h - 26}" r="20" fill="${T.clay}"/><path d="M${x + w - 36},${y + h - 26} h14 m-6,-6 l6,6 l-6,6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    } else if (kind === 'calendar') {
      s += `<path d="M${x + 14},${y + 12} l-10,10 l10,10 M${x + w - 14},${y + 12} l10,10 l-10,10" fill="none" stroke="${T.soft}" stroke-width="3.5" stroke-linecap="round"/>` + bar(x + w / 2 - 70, y + 16, 140, 14);
      const cw = w / 7, chh = (h - 60) / 5;
      for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) { const cx = x + c * cw, cy = y + 50 + r * chh, today = r === 2 && c === 3; s += `<rect x="${cx + 4}" y="${cy + 4}" width="${cw - 8}" height="${chh - 8}" rx="10" fill="${today ? '#FFE58A' : (c > 4 ? T.cream : T.paper)}" stroke="${today ? '#C9952E' : '#E2D6C2'}" stroke-width="${today ? 3 : 1.6}"/>`;
        const ev = { '0,1': '#E0663F', '1,4': '#6FA3D8', '2,3': '#E0412F', '3,0': '#7DB05A', '3,2': '#C98AD6', '4,4': '#F5B83A' }[`${r},${c}`]; if (ev) s += `<circle cx="${cx + cw / 2}" cy="${cy + chh / 2 + 6}" r="8" fill="${ev}"/>`; }
    } else if (kind === 'photos') {
      const pw = (w - 20) / 3, ph = (h - 10) / 2;
      ['#BFDDF5', '#FFD9B8', '#CDEBC0', '#E8D6F5', '#BFE6E0', '#FFE7A3'].forEach((c, i) => { const px = x + (i % 3) * (pw + 10), py = y + Math.floor(i / 3) * (ph + 10);
        s += `<clipPath id="ph${i}${x | 0}"><rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="14"/></clipPath><g clip-path="url(#ph${i}${x | 0})"><rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="${c}"/><circle cx="${px + pw * 0.72}" cy="${py + ph * 0.3}" r="${pw * 0.12}" fill="#FFF3B0"/><path d="M${px - 10},${py + ph} L${px + pw * 0.35},${py + ph * 0.5} L${px + pw * 0.6},${py + ph * 0.75} L${px + pw * 0.8},${py + ph * 0.58} L${px + pw + 10},${py + ph}Z" fill="${['#7DB05A', '#C98A5A', '#5E9A4E', '#9A7AC0', '#4E9A8A', '#C9952E'][i]}"/></g><rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="14" fill="none" stroke="${T.ink}" stroke-width="2.5"/>`; });
      s += `<path d="${SB.heartPath(x + pw * 2 + 20 + pw - 26, y + 26, 11)}" fill="url(#sb-heart)" stroke="#9E2A2E" stroke-width="1.6"/>`;
    } else if (kind === 'forms') {
      [0, 1].forEach((i) => { const yy = y + i * 84; s += bar(x, yy + 4, 120, 11, T.soft, 0.55) + box(x, yy + 24, w, 46, T.paper, 12); });
      [0, 1].forEach((i) => { const yy = y + 182 + i * 44; s += `<rect x="${x}" y="${yy}" width="30" height="30" rx="8" fill="#3E7A5A"/>${tick(x + 15, yy + 16, 0.75)}` + bar(x + 46, yy + 10, w * 0.6, 11); });
      const sy = y + h - 74; s += box(x, sy, w, 74, '#FFF7DA', 14) + `<path d="M${x + 20},${sy + 52} h${w - 40}" stroke="${T.soft}" stroke-width="2" stroke-dasharray="6 5"/><path d="M${x + 34},${sy + 44} c12,-26 22,8 34,-6 s18,10 30,-8 s16,12 30,0" fill="none" stroke="#2F6FD0" stroke-width="3.5" stroke-linecap="round"/>`;
    } else if (kind === 'committees') {
      AV.forEach((c, i) => { s += av(x + 30 + i * 46, y + 30, 26, c); });
      s += `<rect x="${x + 270}" y="${y + 12}" width="${w - 270}" height="40" rx="20" fill="${T.forest}"/>` + text(x + 270 + (w - 270) / 2, y + 39, ['Join'], 'bb', 20, T.cream, { anchor: 'middle' });
      [true, true, false].forEach((done, i) => { const yy = y + 86 + i * 62; s += box(x, yy, w, 50, T.paper, 12) + `<rect x="${x + 14}" y="${yy + 12}" width="26" height="26" rx="7" fill="${done ? '#3E7A5A' : '#fff'}" stroke="#3E7A5A" stroke-width="2.4"/>` + (done ? tick(x + 27, yy + 26, 0.7) : '') + bar(x + 54, yy + 19, w * (0.5 - i * 0.08), 11) + av(x + w - 32, yy + 25, 15, AV[i + 1]); });
      const py = y + h - 50; s += bar(x, py, 120, 11, T.soft, 0.5) + `<rect x="${x}" y="${py + 24}" width="${w}" height="20" rx="10" fill="${T.cream}" stroke="#D8CBB8" stroke-width="2"/><rect x="${x}" y="${py + 24}" width="${w * 0.66}" height="20" rx="10" fill="${T.moss}"/>`;
    }
    return s;
  }
  const CARD_HEAD = { billing: ['Tuition', '#3E7A5A'], attendance: ['Attendance', '#7DB05A'], timeclock: ['Timeclock', '#C9952E'], marketing: ['Campaigns', '#E0663F'], admin: ['Dashboard', T.forest],
    messages: ['Messages', '#3E7A9A'], calendar: ['Calendar', '#B04C3A'], photos: ['Photos', '#C9673C'], forms: ['Forms', '#7A5A3A'], committees: ['Committees', '#94503A'] };
  function featureCard(kind, x, y, w, h, rot) {
    const [label, col] = CARD_HEAD[kind];
    return `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})" filter="url(#pp-shadow)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="${T.paper}" stroke="${T.ink}" stroke-width="4"/>`
      + `<path d="M${x + 2},${y + 64} V${y + 26} q0,-24 24,-24 h${w - 52} q24,0 24,24 V${y + 64}Z" fill="${col}"/><path d="M${x},${y + 64} h${w}" stroke="${T.ink}" stroke-width="4"/>`
      + `<circle cx="${x + 36}" cy="${y + 34}" r="14" fill="#fff" opacity=".9"/><image href="${ASSETS.logo}" x="${x + 24}" y="${y + 22}" width="24" height="24"/>` + text(x + 62, y + 44, [label], 'bb', 26, '#fff')
      + featureContent(kind, x + 24, y + 86, w - 48, h - 108) + `</g>`;
  }

  // =================== TEMPLATE 5: Question (1080×1350) ===================
  function question(o) {
    const W = 1080, H = 1350, th = o.theme || {};
    let s = bg(W, H, th.bg || '#F3EEF8');
    s += dotsDeco([[980, 90, 10], [1012, 136, 6], [60, 1180, 8]], T.moss);
    s += pill(80, 72, o.feature, T.paper, th.pill || T.clayDeep);
    const qh = 90 + o.question.length * (o.qSize || 64) * 1.1;
    s += `<g transform="rotate(-1.5 540 ${160 + qh / 2})" filter="url(#pp-shadow)"><path d="M70,160 h940 v${qh - 34} l-34,34 h-906Z" fill="${th.note || T.butter}"/><path d="M1010,${160 + qh - 34} l-34,34 v-28 q0,-6 6,-6Z" fill="#000" opacity=".1"/>`
      + text(118, 160 + 52 + (o.qSize || 64) * 0.62, o.question, 'd', o.qSize || 64, T.ink, { lh: (o.qSize || 64) * 1.1 }) + `</g>` + tape(540, 160, 160, -2);
    const ay = 200 + qh;
    const ch = 104 + o.answer.length * 44;
    s += `<g filter="url(#pp-shadow)"><rect x="520" y="${ay}" width="490" height="${ch}" rx="28" fill="${T.paper}" stroke="${T.ink}" stroke-width="3"/></g>`
      + `<circle cx="566" cy="${ay + 48}" r="22" fill="${T.forest}"/>${tick(566, ay + 49, 1)}` + text(604, ay + 58, [o.answerLabel || "here's how"], 'h', 34, T.forest)
      + text(552, ay + 112, o.answer, 'b', 32, T.ink, { lh: 44 });
    (o.notifs || []).forEach((n, i) => { s += notif(540 + (i ? 20 : 0), ay + ch + 34 + i * 116, 450, n, i ? 1.5 : -1.5); });
    s += character(o.char, o.view, 14, Math.max(ay + 20, 560), 520);
    s += button(80, 1230, o.cta, T.clay, '#fff', T.clayDeep);
    s += footer(778, 1282, false);
    return doc(W, H, [o.char], s, `${o.name}: ${o.question.join(' ')}`);
  }

  // =================== TEMPLATE 6: App moment story (1080×1920) ===================
  function appMoment(o) {
    const W = 1080, H = 1920, th = o.theme || {};
    let s = `<defs><linearGradient id="am-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${th.top || '#E3EDFB'}"/><stop offset=".6" stop-color="${T.cream}"/><stop offset="1" stop-color="${th.bottom || T.mint}"/></linearGradient></defs>`;
    s += `<rect width="${W}" height="${H}" fill="url(#am-bg)"/><rect width="${W}" height="${H}" filter="url(#pp-grain)"/>`;
    s += dotsDeco([[960, 270, 12], [1000, 330, 7], [70, 1500, 9]], T.moss) + sprig(1000, 1700, 1.6, 16);
    s += pill(80, 250, o.feature, th.pillBg || T.forest, th.pillFg || T.cream);
    const hs = o.headSize || 70;
    s += text(80, 380, o.headline, 'd', hs, T.ink, { lh: hs * 1.12 });
    const cy = 380 + o.headline.length * hs * 1.12 + 30;
    s += text(82, cy, o.caption, 'b', 34, T.soft, { lh: 46 });
    // phone
    const px = 500, py = Math.max(cy + o.caption.length * 46 + 40, 820), pw = 470, ph = 1640 - py;
    s += `<g filter="url(#pp-shadow)"><rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="66" fill="${T.ink}"/></g><rect x="${px + 16}" y="${py + 16}" width="${pw - 32}" height="${ph - 32}" rx="52" fill="${T.cream}"/>`
      + `<rect x="${px + pw / 2 - 60}" y="${py + 30}" width="120" height="30" rx="15" fill="${T.ink}"/>`
      + `<image href="${ASSETS.logo}" x="${px + 42}" y="${py + 78}" width="40" height="40"/>` + text(px + 92, py + 108, ['MudKitchen'], 'd', 28, T.ink);
    let ny = py + 146;
    (o.notifs || []).forEach((n) => { s += notif(px + 30, ny, pw - 60, n); ny += 108; });
    const fh = py + ph - 40 - (ny + 10);
    if (o.card && fh > 160) s += `<g>${featureContent(o.card, px + 40, ny + 10, pw - 80, fh)}</g>`;
    s += character(o.char, o.view, 20, 1120, 500);
    s += button(80, 1760, o.cta, T.clay, '#fff', T.clayDeep);
    s += footer(778, 1810, false);
    return doc(W, H, [o.char], s, `${o.name}: ${o.feature}`);
  }

  return { spotlight, proof, beforeAfter, quote, question, appMoment, T };
};
