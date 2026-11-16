// Shared character helpers + Pip
(function (SB) {
  const r1 = SB.r1;
  SB.leaf = (x, y, len, ang, wid, fill, line, rib = '#E9F6D8') => `<g transform="translate(${x},${y}) rotate(${ang})">`
    + `<path d="M0,0 C${wid},${r1(-len * 0.25)} ${r1(wid * 0.8)},${r1(-len * 0.85)} 0,${-len} C${r1(-wid * 0.8)},${r1(-len * 0.85)} ${-wid},${r1(-len * 0.25)} 0,0Z" fill="${fill}" stroke="${line}" stroke-width="2.4" stroke-linejoin="round"/>`
    + `<path d="M0,-2 Q${r1(wid * 0.15)},${r1(-len * 0.5)} 0,${r1(-len * 0.84)}" stroke="${rib}" stroke-width="1.8" fill="none" opacity=".85" stroke-linecap="round"/>`
    + `<path d="M0,${r1(-len * 0.35)} l${r1(wid * 0.45)},${r1(-len * 0.12)} M0,${r1(-len * 0.55)} l${r1(-wid * 0.45)},${r1(-len * 0.12)}" stroke="${rib}" stroke-width="1.2" opacity=".7" stroke-linecap="round"/></g>`;
  // standard feet: two ellipses; handles run + sit
  SB.stdFeet = (pts, rx, ry, fill, line) => (ctx) => {
    const V = ctx.V;
    if (V.sit) return pts.map(([x, y], i) => { const X = x + (i ? 8 : -8); return `<ellipse cx="${X}" cy="${y + 2}" rx="${rx + 3}" ry="${ry + 5}" fill="${fill}" stroke="${line}" stroke-width="3"/><ellipse cx="${X}" cy="${y + 4}" rx="${r1(rx * 0.55)}" ry="${r1(ry * 0.6)}" fill="#fff" opacity=".22"/>`; }).join('');
    if (V.run) return `<ellipse cx="${pts[0][0] - 14}" cy="${pts[0][1] - 12}" rx="${rx}" ry="${ry}" transform="rotate(-28 ${pts[0][0] - 14} ${pts[0][1] - 12})" fill="${fill}" stroke="${line}" stroke-width="3"/><ellipse cx="${pts[1][0] + 10}" cy="${pts[1][1]}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${line}" stroke-width="3"/>`;
    return pts.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${line}" stroke-width="3"/>`).join('');
  };
  SB.blushDef = (key, col = '#FF7A6B') => SB.radial(`sb-${key}-k`, [[0, col, 0.75], [1, col, 0]], 0.5, 0.5, 0.5);
  SB.scaleAt = (x, y, s, inner) => s === 1 ? inner : `<g transform="translate(${x},${y}) scale(${s}) translate(${-x},${-y})">${inner}</g>`;

  // ===================== PIP · Enrollment =====================
  const B = 'M120,78 C170,78 194,128 195,170 C196,214 162,237 120,237 C78,237 44,214 45,170 C46,128 70,78 120,78Z';
  const LEAVES = { neutral: [-52, 48], happy: [-34, 32], laughing: [-30, 40], excited: [-16, 18], curious: [-74, 14], thinking: [-62, 30], surprised: [-12, 12],
    silly: [-106, 38], wink: [-44, 62], love: [-40, 40], shy: [-84, 74], sleepy: [-112, 102], oops: [-92, 20], determined: [-28, 28], confused: [-82, 10],
    cheeky: [-50, 72], tears: [-46, 46], wave: [-44, 72], celebrate: [-20, 22], thumbs: [-40, 52], point: [-50, 50], hold: [-52, 48], highfive: [-30, 40],
    run: [-96, -24], sit: [-52, 48], peek: [-56, 44] };
  const C = { key: 'pip', name: 'Pip', line: '#6B2A16' };
  C.defs = () => SB.radial('sb-pip-b', [[0, '#F7B48C'], [0.5, '#DE7C52'], [1, '#A84E2E']], 0.36, 0.28, 0.85)
    + SB.linear('sb-pip-l', [[0, '#BDE694'], [1, '#4F9D3F']]) + SB.blushDef('pip');
  C.arm = { w: 15, col: '#D4734B', line: '#6B2A16' };
  C.face = { ex: [90, 150], ey: 150, er: 14.5, browY: 125, browW: 17, browCol: '#5B2414', skin: '#DE7C52', mx: 120, my: 177, ms: 12.5, cheekX: [68, 172], cheekY: 172, cheekR: [15, 9.5] };
  C.heart = [120, 212, 18]; C.holdAt = [120, 192];
  C.arms = SB.armSet({ sx: 62, sy: 176, chin: [146, 200], heart: C.heart, headSide: [190, 122] });
  C.fx = { q: [202, 90], thought: [174, 80], zzz: [170, 92], sweat: [52, 120], wink: [198, 112], spark: [[34, 96, 8], [208, 80, 10], [216, 150, 7]] };
  C.ground = [120, 76]; C.shadow = 64;
  C.icon = { cx: 120, cy: 150, s: 1.08, ty: 146, bgs: ['#2E4A3C', '#FFE58A'] };
  C.propHand = { neutral: 'R', wave: 'L', curious: 'L', point: 'L', silly: 'R' };
  C.prop = (x, y, ctx, s = 1, side) => SB.scaleAt(x, y, s, `<g transform="rotate(${side === 'C' ? 0 : 8} ${x} ${y})">`
    + `<rect x="${x - 15}" y="${y - 4}" width="30" height="38" rx="4" fill="#FFF4DE" stroke="#6B4A2A" stroke-width="2.6"/>`
    + `<rect x="${x - 15}" y="${y - 4}" width="30" height="10" rx="4" fill="#E0663F" stroke="#6B4A2A" stroke-width="2.6"/>`
    + `<path d="M${x - 11},${y + 30} h22" stroke="#E0663F" stroke-width="1.6" stroke-dasharray="3 2.4"/>`
    + `<path d="M${x},${y + 25} L${x},${y + 15}" stroke="#3F7E33" stroke-width="2" stroke-linecap="round"/><path d="M${x},${y + 16} c-7,-1 -9,-7 -8,-9 c5,0 8,3 8,9z M${x},${y + 16} c7,-1 9,-7 8,-9 c-5,0 -8,3 -8,9z" fill="#7BC45A" stroke="#3F7E33" stroke-width="1.2"/></g>`);
  C.back = (ctx) => {
    const [la, ra] = LEAVES[ctx.V.key] || LEAVES.neutral;
    const bend = ctx.V.key === 'curious' ? -7 : ctx.V.key === 'silly' ? 7 : ctx.V.key === 'run' ? -10 : 0;
    const big = ctx.V.key === 'celebrate' || ctx.V.key === 'excited' ? 5 : 0;
    const tip = [121 + bend, 54];
    return `<path d="M120,92 Q${118 + bend * 0.3},68 ${tip[0]},${tip[1]}" fill="none" stroke="#2F5E28" stroke-width="9" stroke-linecap="round"/><path d="M120,92 Q${118 + bend * 0.3},68 ${tip[0]},${tip[1]}" fill="none" stroke="#5EA347" stroke-width="5" stroke-linecap="round"/>`
      + SB.leaf(tip[0], tip[1] + 2, 38 + big, la, 14, 'url(#sb-pip-l)', '#2F5E28') + SB.leaf(tip[0], tip[1] + 2, 42 + big, ra, 15, 'url(#sb-pip-l)', '#2F5E28');
  };
  C.feet = SB.stdFeet([[96, 234], [144, 234]], 18, 9, '#93422A', '#6B2A16');
  C.body = (ctx) => SB.shade(B, {
    fill: 'url(#sb-pip-b)', shadow: '#7A2E14', rim: '#FFD2A8', line: C.line,
    inner: `<path d="M138,222 c6,-4 14,-2 16,-8 c2,6 10,4 8,10 c-4,6 -18,6 -24,-2z M70,208 c4,-3 9,-1 10,-6 c3,5 -1,10 -6,10 c-3,0 -5,-2 -4,-4z" fill="#8C3F24" opacity=".5"/>`
      + [[150, 200, 2.2], [160, 190, 1.5], [82, 220, 1.8], [174, 180, 1.4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#7A2E14" opacity=".4"/>`).join('')
      + [[98, 100, 1.8], [140, 96, 1.4], [158, 110, 1.2], [128, 88, 1]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFE2C6" opacity=".8"/>`).join(''),
    hl: SB.gloss(88, 110, 22, 10, -34, 0.42) + SB.gloss(111, 94, 6, 3.4, -10, 0.5),
  });
  C.face.extra = [[58, 160], [64, 166], [70, 159], [182, 160], [176, 166], [170, 159]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#9C4528" opacity=".7"/>`).join('');
  SB.C.pip = C;
})(SB);
