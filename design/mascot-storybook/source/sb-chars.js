// The other 11 storybook characters
(function (SB) {
  const { r1, ell, gloss, shade } = SB;
  const dots = (list, fill, op = 0.5) => list.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity="${op}"/>`).join('');
  const STD = { neutral: 'R', wave: 'L', curious: 'L', point: 'L', silly: 'R' };
  const pick = (tbl, key) => tbl[key] || tbl.neutral;

  // ---------- shared props ----------
  const P = {
    ledger: (x, y, s, rot = 6) => SB.scaleAt(x, y, s, `<g transform="rotate(${rot} ${x} ${y})"><rect x="${x - 15}" y="${y - 4}" width="30" height="38" rx="4" fill="#3E7A5A" stroke="#1F3A2A" stroke-width="2.6"/><rect x="${x - 15}" y="${y - 4}" width="7" height="38" rx="3" fill="#2C5A42" stroke="#1F3A2A" stroke-width="2.6"/><rect x="${x - 4}" y="${y + 5}" width="15" height="9" rx="2" fill="#FFF4DE" stroke="#1F3A2A" stroke-width="1.6"/><path d="M${x - 2},${y + 22} h12 M${x - 2},${y + 27} h9" stroke="#9FD0B4" stroke-width="1.6" stroke-linecap="round"/></g>`
      + `<circle cx="${x + 15}" cy="${y + 32}" r="9" fill="url(#sb-star)" stroke="#9E6A0C" stroke-width="2.2"/><circle cx="${x + 15}" cy="${y + 32}" r="5.4" fill="none" stroke="#9E6A0C" stroke-width="1.4"/>`),
    clipboard: (x, y, s, rot = -6) => SB.scaleAt(x, y, s, `<g transform="rotate(${rot} ${x} ${y})"><rect x="${x - 16}" y="${y - 5}" width="32" height="42" rx="4" fill="#D9A066" stroke="#6B4424" stroke-width="2.6"/><rect x="${x - 12}" y="${y + 1}" width="24" height="32" rx="2" fill="#FFFDF6" stroke="#B49A7A" stroke-width="1.2"/><rect x="${x - 7}" y="${y - 9}" width="14" height="8" rx="2.5" fill="#A7B1BA" stroke="#55606A" stroke-width="1.8"/>`
      + [0, 1, 2].map((i) => `<path d="M${x - 9},${y + 9 + i * 9} l2.6,2.6 l4.4,-5.2" fill="none" stroke="#3F9E4A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M${x},${y + 9.5 + i * 9} h8" stroke="#D2C2A8" stroke-width="2" stroke-linecap="round"/>`).join('') + `</g>`),
    watch: (x, y, s) => SB.scaleAt(x, y, s, `<path d="M${x},${y} Q${x + 5},${y + 8} ${x + 2},${y + 12}" fill="none" stroke="#B88A2E" stroke-width="2" stroke-dasharray="2.4 1.8"/><rect x="${x - 2}" y="${y + 9}" width="8" height="6" rx="2" fill="#E9B43A" stroke="#7A5410" stroke-width="1.6"/>`
      + `<circle cx="${x + 2}" cy="${y + 28}" r="15" fill="url(#sb-star)" stroke="#7A5410" stroke-width="2.6"/><circle cx="${x + 2}" cy="${y + 28}" r="11" fill="#FFFDF6" stroke="#C9952E" stroke-width="1.4"/>`
      + [0, 90, 180, 270].map((a) => { const t = a * Math.PI / 180; return `<circle cx="${r1(x + 2 + Math.cos(t) * 8)}" cy="${r1(y + 28 + Math.sin(t) * 8)}" r="1.2" fill="#7A5410"/>`; }).join('')
      + `<path d="M${x + 2},${y + 28} L${x + 2},${y + 21} M${x + 2},${y + 28} L${x + 7.5},${y + 30}" stroke="#2E1B12" stroke-width="2" stroke-linecap="round"/><circle cx="${x + 2}" cy="${y + 28}" r="1.6" fill="#E0562F"/>`),
    megaphone: (x, y, s, side) => {
      const m = side === 'L' ? -1 : 1, rot = side === 'C' ? -90 : -28;
      return SB.scaleAt(x, y, s, `<g transform="translate(${x},${y}) scale(${side === 'C' ? 1 : m},1) rotate(${rot})"><path d="M-3,-6 L34,-18 L34,18 L-3,6Z" fill="#FF9A3D" stroke="#9A4A12" stroke-width="2.6" stroke-linejoin="round"/><path d="M4,-7 L28,-15" stroke="#FFD08A" stroke-width="2.4" stroke-linecap="round"/>`
        + `<ellipse cx="34" cy="0" rx="6.5" ry="18" fill="#FFC861" stroke="#9A4A12" stroke-width="2.6"/><ellipse cx="35" cy="0" rx="3" ry="11" fill="#C9661E"/>`
        + [-14, -7, 0, 7, 14].map((yy) => `<circle cx="40" cy="${yy}" r="2.4" fill="#FFC861" stroke="#9A4A12" stroke-width="1"/>`).join('') + `<rect x="2" y="5" width="6" height="13" rx="2.5" fill="#8A4A1E" stroke="#4E2A10" stroke-width="1.6"/></g>`);
    },
    envelope: (x, y, s, rot = -8) => SB.scaleAt(x, y, s, `<g transform="rotate(${rot} ${x} ${y})"><rect x="${x - 18}" y="${y - 2}" width="36" height="25" rx="3" fill="#FFFDF6" stroke="#7A5A3A" stroke-width="2.6"/><path d="M${x - 17},${y - 1} L${x},${y + 12} L${x + 17},${y - 1}" fill="none" stroke="#7A5A3A" stroke-width="2.2" stroke-linejoin="round"/><path d="${SB.heartPath(x, y + 12, 4.4)}" fill="url(#sb-heart)" stroke="#9E2A2E" stroke-width="1.2"/></g>`),
    calendar: (x, y, s, rot = 5) => {
      let g = `<g transform="rotate(${rot} ${x} ${y})"><rect x="${x - 16}" y="${y - 4}" width="32" height="38" rx="4" fill="#FFFDF6" stroke="#6B3A2A" stroke-width="2.6"/><path d="M${x - 16},${y + 7} V${y} q0,-4 4,-4 h24 q4,0 4,4 V${y + 7}Z" fill="#E0412F" stroke="#6B3A2A" stroke-width="2.6"/><circle cx="${x - 8}" cy="${y - 6}" r="2.4" fill="#A7B1BA" stroke="#55606A" stroke-width="1.2"/><circle cx="${x + 8}" cy="${y - 6}" r="2.4" fill="#A7B1BA" stroke="#55606A" stroke-width="1.2"/>`;
      for (let rr = 0; rr < 3; rr++) for (let c = 0; c < 4; c++) g += `<rect x="${x - 12 + c * 6.4}" y="${y + 11 + rr * 7}" width="4.6" height="4.6" rx="1.2" fill="${rr === 1 && c === 2 ? '#F5B83A' : '#E2D6C2'}"/>`;
      return SB.scaleAt(x, y, s, g + `<circle cx="${x + 4.6}" cy="${y + 20.3}" r="5.2" fill="none" stroke="#E0412F" stroke-width="1.6"/></g>`);
    },
    camera: (x, y, s, rot = -6) => SB.scaleAt(x, y, s, `<g transform="rotate(${rot} ${x} ${y})"><rect x="${x - 9}" y="${y - 9}" width="14" height="8" rx="2.5" fill="#4A403A" stroke="#1E1814" stroke-width="2"/><rect x="${x - 19}" y="${y - 3}" width="38" height="26" rx="6" fill="#5A4E46" stroke="#1E1814" stroke-width="2.6"/><rect x="${x - 19}" y="${y + 4}" width="38" height="9" fill="#C9673C" stroke="#1E1814" stroke-width="1.4"/>`
      + `<circle cx="${x + 1}" cy="${y + 10}" r="9.5" fill="#7FA6C4" stroke="#1E1814" stroke-width="2.4"/><circle cx="${x + 1}" cy="${y + 10}" r="5" fill="#26303A"/><circle cx="${x + 3.4}" cy="${y + 7.6}" r="1.8" fill="#fff"/><rect x="${x + 10}" y="${y}" width="6" height="3.6" rx="1" fill="#FFE58A" stroke="#1E1814" stroke-width="1"/></g>`),
    form: (x, y, s, rot = -5) => SB.scaleAt(x, y, s, `<g transform="rotate(${rot} ${x} ${y})"><path d="M${x - 15},${y - 4} h22 l8,8 v32 h-30Z" fill="#FFFDF6" stroke="#6B4A2A" stroke-width="2.6" stroke-linejoin="round"/><path d="M${x + 7},${y - 4} v8 h8" fill="#EADFCB" stroke="#6B4A2A" stroke-width="2" stroke-linejoin="round"/><path d="M${x - 10},${y + 8} h16 M${x - 10},${y + 14} h18 M${x - 10},${y + 20} h12" stroke="#CDBFA8" stroke-width="2" stroke-linecap="round"/><path d="M${x - 10},${y + 30} c3,-7 6,4 9,-1 s5,3 9,-2" fill="none" stroke="#2F6FD0" stroke-width="2" stroke-linecap="round"/></g>`),
    spoon: (x, y, s, a) => {
      const t = a * Math.PI / 180, ux = Math.sin(t), uy = -Math.cos(t);
      const h1 = [r1(x - ux * 12), r1(y - uy * 12)], h2 = [r1(x + ux * 50), r1(y + uy * 50)], b = [r1(x + ux * 63), r1(y + uy * 63)];
      return SB.scaleAt(x, y, s, `<path d="M${h1[0]},${h1[1]} L${h2[0]},${h2[1]}" stroke="#5A3418" stroke-width="11" stroke-linecap="round"/><path d="M${h1[0]},${h1[1]} L${h2[0]},${h2[1]}" stroke="#D99A5C" stroke-width="6" stroke-linecap="round"/>`
        + `<g transform="rotate(${a} ${b[0]} ${b[1]})"><ellipse cx="${b[0]}" cy="${b[1]}" rx="11" ry="15" fill="#E2A86A" stroke="#5A3418" stroke-width="2.8"/><ellipse cx="${b[0]}" cy="${b[1] + 1}" rx="7" ry="10" fill="#6B4228"/><circle cx="${b[0] - 2}" cy="${b[1] - 2}" r="2.4" fill="#8E5A36"/><ellipse cx="${b[0] - 3}" cy="${b[1] - 5}" rx="2" ry="3" fill="#fff" opacity=".4"/></g>`);
    },
    sign: (x, y, s) => SB.scaleAt(x, y, s, `<path d="M${x},${y + 6} L${x},${y - 40}" stroke="#5A3418" stroke-width="8" stroke-linecap="round"/><path d="M${x},${y + 6} L${x},${y - 40}" stroke="#C48A52" stroke-width="4" stroke-linecap="round"/>`
      + `<rect x="${x - 22}" y="${y - 70}" width="44" height="32" rx="5" fill="#E9C089" stroke="#5A3418" stroke-width="2.6"/><path d="M${x - 10},${y - 50} l10,-9 l10,9 v8 h-20Z" fill="#E0663F" stroke="#5A3418" stroke-width="1.8" stroke-linejoin="round"/><rect x="${x - 3}" y="${y - 47}" width="6" height="7" fill="#FFF4DE"/>`),
  };
  SB.P = P;

  // =================== NUTMEG · Tuition & Billing ===================
  (() => {
    const B = 'M120,92 C170,92 192,132 190,170 C188,208 158,236 124,238 Q120,243 116,238 C82,236 52,208 50,170 C48,132 70,92 120,92Z';
    const CAP = 'M38,110 C36,72 74,50 120,50 C166,50 204,72 202,110 C204,124 180,129 120,129 C60,129 36,124 38,110Z';
    const T = { neutral: [-6, 0, 0], happy: [-10, 0, -5], laughing: [-14, 0, -4], excited: [-12, 0, -12], curious: [14, 0, 2], thinking: [10, 0, 0], surprised: [0, 0, -20],
      silly: [-20, -4, 6], wink: [-14, 0, 0], love: [-8, 0, -3], shy: [8, 0, 7], sleepy: [16, 0, 12], oops: [18, 4, 4], determined: [-4, 0, 5], confused: [16, 0, 2],
      cheeky: [-16, 0, 0], tears: [-6, 0, 0], celebrate: [-16, 0, -22], thumbs: [-12, 0, 0], highfive: [-10, 0, -4], run: [-24, -6, -2] };
    const C = { key: 'nutmeg', name: 'Nutmeg', line: '#5A3418' };
    C.defs = () => SB.radial('sb-nutmeg-b', [[0, '#FFD9A0'], [0.5, '#EBA562'], [1, '#B06A2C']]) + SB.linear('sb-nutmeg-c', [[0, '#BE8656'], [1, '#7A4E30']])
      + SB.linear('sb-nutmeg-l', [[0, '#BDE694'], [1, '#4F9D3F']]) + SB.blushDef('nutmeg')
      + `<pattern id="sb-nutmeg-s" width="12" height="9" patternUnits="userSpaceOnUse"><path d="M0,9 Q6,1 12,9" stroke="#4A2C16" stroke-width="1.8" fill="none"/></pattern>`;
    C.arm = { w: 6, col: '#8A5E3C', line: '#3E2414', lw: 2, hand: '#9A6A44',
      tip: (pts) => { const [x, y] = pts[2]; const b = pts[1]; const dx = x - b[0], dy = y - b[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
        return [-0.7, 0, 0.7].map((a) => { const cx = Math.cos(a), sn = Math.sin(a), vx = ux * cx - uy * sn, vy = ux * sn + uy * cx; return `<path d="M${x},${y} l${r1(vx * 9)},${r1(vy * 9)}" stroke="#3E2414" stroke-width="5.5" stroke-linecap="round"/><path d="M${x},${y} l${r1(vx * 9)},${r1(vy * 9)}" stroke="#8A5E3C" stroke-width="2.6" stroke-linecap="round"/>`; }).join(''); } };
    C.face = { ex: [91, 149], ey: 164, er: 14, browY: 142, browW: 16, browCol: '#6E3E1C', skin: '#EBA562', mx: 120, my: 192, ms: 12, cheekX: [68, 172], cheekY: 184, cheekR: [14, 9] };
    C.heart = [120, 216, 16]; C.holdAt = [120, 198];
    C.arms = SB.armSet({ sx: 60, sy: 182, chin: [148, 206], heart: C.heart, headSide: [190, 142] });
    C.fx = { q: [214, 70], thought: [176, 70], zzz: [180, 96], sweat: [44, 140], wink: [204, 124], spark: [[30, 104, 8], [212, 92, 9], [28, 176, 6]] };
    C.ground = [120, 74]; C.shadow = 60;
    C.icon = { cx: 120, cy: 150, s: 1.06, ty: 144, bgs: ['#2E4A3C', '#DDEBD5'] };
    C.propHand = STD;
    C.prop = (x, y, ctx, s, side) => P.ledger(x, y, s, side === 'C' ? 0 : 6);
    C.feet = SB.stdFeet([[100, 238], [140, 238]], 15, 8, '#7A4A2A', C.line);
    C.body = () => shade(B, { fill: 'url(#sb-nutmeg-b)', shadow: '#7A3E14', rim: '#FFE7C2', line: C.line,
      inner: `<path d="M66,150 Q60,192 88,226 M174,150 Q180,192 152,226 M92,120 Q86,170 100,232" fill="none" stroke="#B5763A" stroke-width="2.2" opacity=".45" stroke-linecap="round"/>` + dots([[150, 214, 2], [86, 212, 1.6], [160, 200, 1.4]], '#7A3E14', 0.4),
      hl: gloss(80, 140, 12, 7, -40, 0.4) });
    C.front = (ctx) => {
      const [rot, dx, dy] = pick(T, ctx.V.key);
      return `<g transform="translate(${dx},${dy}) rotate(${rot} 120 106)"><path d="M120,54 C118,42 122,34 130,30" fill="none" stroke="#3E2414" stroke-width="10" stroke-linecap="round"/><path d="M120,54 C118,42 122,34 130,30" fill="none" stroke="#8A5E3C" stroke-width="5.5" stroke-linecap="round"/>`
        + SB.leaf(130, 32, 28, 58, 10, 'url(#sb-nutmeg-l)', '#2F5E28')
        + shade(CAP, { fill: 'url(#sb-nutmeg-c)', shadow: '#3E2414', rim: '#E2B07C', line: C.line, inner: `<path d="${CAP}" fill="url(#sb-nutmeg-s)" opacity=".5"/>`, hl: gloss(86, 70, 24, 8, -18, 0.3) })
        + `<path d="M44,116 C70,128 170,128 196,116" fill="none" stroke="#E2B07C" stroke-width="3" stroke-linecap="round" opacity=".9"/></g>`;
    };
    SB.C.nutmeg = C;
  })();

  // =================== DIG · Admin Portal ===================
  (() => {
    const B = 'M120,66 C170,66 194,110 194,160 C194,212 164,238 120,238 C76,238 46,212 46,160 C46,110 70,66 120,66Z';
    const C = { key: 'dig', name: 'Dig', line: '#3A2620' };
    C.defs = () => SB.radial('sb-dig-b', [[0, '#C29C86'], [0.55, '#94705E'], [1, '#5E4238']]) + SB.radial('sb-dig-z', [[0, '#FFF0E0'], [1, '#E2C2A6']], 0.45, 0.35, 0.75)
      + SB.radial('sb-dig-n', [[0, '#FFC2B4'], [0.6, '#FF8E7E'], [1, '#D9685A']], 0.4, 0.3, 0.8) + SB.linear('sb-dig-a', [[0, '#FFEFA8'], [1, '#F5C94C']]) + SB.blushDef('dig');
    C.arm = { w: 17, col: '#94705E', line: '#3A2620', hand: '#FFB5A5',
      tip: (pts) => { const [x, y] = pts[2]; const b = pts[1]; const dx = x - b[0], dy = y - b[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L; const ang = r1(Math.atan2(uy, ux) * 180 / Math.PI);
        let s = `<ellipse cx="${x}" cy="${y}" rx="13" ry="11.5" transform="rotate(${ang} ${x} ${y})" fill="#FFB5A5" stroke="#3A2620" stroke-width="2.8"/>`;
        [-6, 0, 6].forEach((o) => { const cx = r1(x + ux * 11 - uy * o), cy = r1(y + uy * 11 + ux * o); s += `<ellipse cx="${cx}" cy="${cy}" rx="4.4" ry="2.8" transform="rotate(${ang} ${cx} ${cy})" fill="#FFF6EA" stroke="#3A2620" stroke-width="1.4"/>`; });
        return s; } };
    C.face = { ex: [90, 150], ey: 122, er: 10.5, browY: 92, browW: 17, browCol: '#3A2620', skin: '#94705E', mx: 120, my: 176, ms: 11, cheekX: [60, 180], cheekY: 160, cheekR: [12, 7.5] };
    C.heart = [120, 220, 16]; C.holdAt = [120, 196];
    C.arms = SB.armSet({ sx: 60, sy: 184, chin: [146, 206], heart: C.heart, headSide: [186, 108] });
    C.fx = { q: [206, 70], thought: [176, 62], zzz: [176, 80], sweat: [42, 100], wink: [206, 98], spark: [[28, 88, 8], [212, 92, 10], [218, 160, 7]] };
    C.ground = [120, 76]; C.shadow = 64;
    C.icon = { cx: 120, cy: 140, s: 1.2, ty: 134, bgs: ['#FFE58A', '#2E4A3C'] };
    C.propHand = { neutral: 'R', wave: 'L', curious: 'L', silly: 'L', point: 'L', thinking: 'L', celebrate: 'R', happy: 'R' };
    const SPOON = { neutral: 10, wave: -12, curious: -12, silly: -30, point: -12, thinking: -12, celebrate: 6, happy: 24 };
    C.prop = (x, y, ctx, s, side) => P.spoon(x, y, s, side === 'C' ? 0 : (SPOON[ctx.V.key] != null ? SPOON[ctx.V.key] : 10));
    C.feet = SB.stdFeet([[98, 236], [142, 236]], 17, 8.5, '#4A332A', C.line);
    C.body = () => `<path d="M104,74 C100,56 110,50 115,62 C114,44 128,42 128,58 C134,48 144,54 138,74Z" fill="#94705E" stroke="#3A2620" stroke-width="2.6" stroke-linejoin="round"/>`
      + shade(B, { fill: 'url(#sb-dig-b)', shadow: '#2E1C16', rim: '#E9C9B4', line: C.line,
        inner: `<path d="M78,206 C78,199 162,199 162,206 L168,242 L72,242Z" fill="url(#sb-dig-a)" stroke="#8A6A1E" stroke-width="2.6"/>`
          + `<path d="M84,212 C104,207 136,207 156,212" fill="none" stroke="#C9952E" stroke-width="1.8" stroke-dasharray="4 3"/>`
          + `<path d="M104,214 h32 v10 q0,8 -8,8 h-16 q-8,0 -8,-8Z" fill="#FFF6CF" stroke="#8A6A1E" stroke-width="2.2"/><path d="M108,218 h24" stroke="#C9952E" stroke-width="1.4" stroke-dasharray="3 2.4"/>`
          + `<rect x="140" y="214" width="16" height="14" rx="2" fill="#F08A6A" stroke="#8A3E28" stroke-width="1.8" transform="rotate(8 148 221)"/><path d="M142,217 l12,8 M154,217 l-12,8" stroke="#FFE3D6" stroke-width="1.4" transform="rotate(8 148 221)"/>`
          + `<ellipse cx="94" cy="228" rx="6" ry="4" fill="#7A4A2A" opacity=".55"/><circle cx="86" cy="222" r="1.8" fill="#7A4A2A" opacity=".55"/>`,
        hl: gloss(82, 94, 18, 8, -34, 0.3) })
      + `<ellipse cx="120" cy="170" rx="44" ry="31" fill="url(#sb-dig-z)" stroke="#B48C6E" stroke-width="2"/><path d="M120,162 L120,171" stroke="#2E1B12" stroke-width="2.8" stroke-linecap="round"/>`;
    C.front = () => `<ellipse cx="120" cy="151" rx="17" ry="12.5" fill="url(#sb-dig-n)" stroke="#8A3E30" stroke-width="2.4"/><ellipse cx="114" cy="146" rx="5" ry="3" fill="#fff" opacity=".75"/>`
      + C.face.ex.map((x) => `<circle cx="${x}" cy="${C.face.ey}" r="21" fill="#E8F4FF" fill-opacity=".18" stroke="#2A1C16" stroke-width="4.5"/><path d="M${x - 13},${C.face.ey - 6} L${x - 6},${C.face.ey - 13}" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>`).join('')
      + `<path d="M111,120 Q120,113 129,120 M69,118 L52,113 M171,118 L188,113" fill="none" stroke="#2A1C16" stroke-width="4" stroke-linecap="round"/>`;
    SB.C.dig = C;
  })();

  // =================== TERRA · School Website ===================
  (() => {
    const B = 'M58,240 C50,214 50,160 62,134 C74,108 102,98 122,104 C146,112 152,144 150,180 L150,196 C176,196 204,206 216,224 C222,234 216,240 204,240Z';
    const TIPS = { neutral: [[80, 62], [132, 58]], happy: [[68, 64], [144, 58]], laughing: [[66, 70], [146, 66]], excited: [[64, 54], [148, 48]], curious: [[88, 56], [142, 50]],
      thinking: [[76, 56], [124, 52]], surprised: [[76, 44], [136, 40]], silly: [[118, 60], [96, 62]], wink: [[80, 62], [136, 56]], love: [[74, 58], [138, 54]],
      shy: [[92, 72], [118, 70]], sleepy: [[68, 84], [142, 82]], oops: [[78, 66], [134, 60]], determined: [[86, 60], [128, 58]], confused: [[72, 56], [140, 66]],
      cheeky: [[84, 62], [138, 56]], tears: [[72, 62], [140, 58]], wave: [[78, 60], [136, 56]], celebrate: [[62, 54], [150, 48]], thumbs: [[80, 60], [134, 56]],
      point: [[90, 58], [144, 56]], highfive: [[72, 58], [140, 54]], run: [[62, 72], [110, 64]] };
    const C = { key: 'terra', name: 'Terra', line: '#8A4A30', cx: 106, peekDx: 8 };
    C.defs = () => SB.radial('sb-terra-b', [[0, '#FFE6CE'], [0.55, '#F5B892'], [1, '#D08560']], 0.32, 0.25, 0.9)
      + SB.linear('sb-terra-p', [[0, '#FF9A62'], [0.55, '#E06A3E'], [1, '#A2432A']], 0, 0, 1, 0) + SB.linear('sb-terra-r', [[0, '#FFAA78'], [1, '#C2563A']], 0, 0, 1, 0)
      + SB.linear('sb-terra-l', [[0, '#BDE694'], [1, '#4F9D3F']]) + SB.blushDef('terra');
    C.arm = { w: 13, col: '#F2AE88', line: '#8A4A30' };
    C.face = { mx: 106, my: 160, ms: 12, cheekX: [80, 134], cheekY: 152, cheekR: [12, 7.5], skin: '#F5B892', style: 'ball', ballLine: '#8A4A30', lidFill: '#F5B892', browCol: '#8A4A30' };
    C.heart = [106, 206, 15]; C.holdAt = [106, 196];
    C.arms = SB.armSet({ cx: 106, sx: 66, sy: 180, k: 0.9, chin: [124, 186], heart: C.heart, headSide: [146, 118] });
    C.fx = { q: [36, 64], thought: [16, 74], zzz: [154, 40], sweat: [150, 100], wink: [36, 100], spark: [[26, 100, 8], [160, 26, 8], [228, 128, 7]] };
    C.ground = [136, 90]; C.shadow = 90;
    C.icon = { cx: 132, cy: 140, s: 0.98, ty: 128, bgs: ['#2E4A3C', '#DDEBD5'] };
    C.propHand = { wave: 'L', point: 'L' };
    C.prop = (x, y, ctx, s) => P.sign(x, y, s * 0.8);
    C.back = (ctx) => {
      const k = ctx.V.key, bloom = ['celebrate', 'happy', 'excited', 'love'].includes(k), droop = ['sleepy', 'oops', 'shy'].includes(k);
      const lr = k === 'wave' ? 88 : bloom ? 40 : 56, ll = droop ? -84 : bloom ? -40 : -58;
      const pr = bloom ? 9 : 7, pd = bloom ? 10 : 8, fy = droop ? -78 : -88, fx = droop ? 14 : 2;
      return `<g transform="translate(180,152) rotate(8)"><path d="M0,-42 Q-6,-64 ${fx},${fy + 2}" fill="none" stroke="#2F5E28" stroke-width="8" stroke-linecap="round"/><path d="M0,-42 Q-6,-64 ${fx},${fy + 2}" fill="none" stroke="#5EA347" stroke-width="4.5" stroke-linecap="round"/>`
        + SB.leaf(-1, -56, 26, ll, 9, 'url(#sb-terra-l)', '#2F5E28') + SB.leaf(0, -64, 28, lr, 10, 'url(#sb-terra-l)', '#2F5E28')
        + [0, 72, 144, 216, 288].map((a) => { const t = (a - 90) * Math.PI / 180; return `<circle cx="${r1(fx + Math.cos(t) * pd)}" cy="${r1(fy + Math.sin(t) * pd)}" r="${pr}" fill="#FFE07A" stroke="#C98A12" stroke-width="2"/>`; }).join('')
        + `<circle cx="${fx}" cy="${fy}" r="${bloom ? 6.5 : 5.5}" fill="#E0663F" stroke="#8A3E20" stroke-width="1.6"/>`
        + `<ellipse cx="0" cy="-44" rx="40" ry="6" fill="#5A3624" stroke="#3A2016" stroke-width="2"/>`
        + shade('M-40,-26 L40,-26 L31,40 Q30,48 22,48 L-22,48 Q-30,48 -31,40Z', { fill: 'url(#sb-terra-p)', shadow: '#6E2A16', rim: '#FFC9A0', line: '#6E2A16', dx: 10, dy: 0,
          inner: `<path d="M-36,-6 Q-27,-12 -18,-6 T0,-6 T18,-6 T36,-6" fill="none" stroke="#FFF1DE" stroke-width="3" stroke-linecap="round"/>` + [-18, 0, 18].map((x) => `<circle cx="${x}" cy="14" r="3" fill="#FFF1DE"/>`).join('') + `<path d="M-6,30 c4,-6 8,-6 12,0 c-4,4 -8,4 -12,0z" fill="#9FD06A" stroke="#FFF1DE" stroke-width="1.2"/>` })
        + shade('M-46,-44 h92 a6,6 0 0 1 6,6 v6 a6,6 0 0 1 -6,6 h-92 a6,6 0 0 1 -6,-6 v-6 a6,6 0 0 1 6,-6Z', { fill: 'url(#sb-terra-r)', shadow: '#6E2A16', rim: '#FFC9A0', line: '#6E2A16', dx: 0, dy: 6, hl: `<rect x="-40" y="-41" width="42" height="4" rx="2" fill="#fff" opacity=".35"/>` })
        + `</g>`;
    };
    C.body = () => shade(B, { fill: 'url(#sb-terra-b)', shadow: '#A0573A', rim: '#FFF0E0', line: C.line,
      inner: `<path d="M160,206 C182,208 200,214 210,226" fill="none" stroke="#fff" stroke-width="3.5" opacity=".45" stroke-linecap="round"/>` + dots([[78, 200, 2], [90, 214, 1.6], [70, 186, 1.4]], '#C9755A', 0.5),
      hl: gloss(82, 128, 12, 6, -40, 0.4) });
    C.eyes = (ctx) => {
      const V = ctx.V, tips = pick(TIPS, V.key), bases = [[92, 112], [120, 110]], F = C.face;
      const B2 = SB.BROWS[V.brows];
      let s = '';
      tips.forEach((tip, i) => {
        const base = bases[i], mx = (base[0] + tip[0]) / 2, my = (base[1] + tip[1]) / 2, dx = tip[0] - base[0], dy = tip[1] - base[1], L = Math.hypot(dx, dy);
        const d = `M${base[0]},${base[1]} Q${r1(mx - dy / L * 7)},${r1(my + dx / L * 7)} ${tip[0]},${tip[1]}`;
        s += `<path d="${d}" fill="none" stroke="#8A4A30" stroke-width="14" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#F5B892" stroke-width="8.5" stroke-linecap="round"/>`;
      });
      tips.forEach((tip, i) => {
        s += SB.eye(tip[0], tip[1], 13.5, V.eyes[i], V.look || [0, 0], F, i);
        if (B2) s += SB.brow(tip[0], tip[1] - 22 + B2[i][0], 15, B2[i][1], F.browCol);
        if ((V.fx || []).includes('tears')) s += SB.tears(tip[0] + (i ? 10 : -10), tip[1] + 8, i ? 1 : -1);
      });
      return s;
    };
    SB.C.terra = C;
  })();

  // =================== FENNEL · Attendance ===================
  (() => {
    const C = { key: 'fennel', name: 'Fennel', line: '#2F5A22' };
    C.defs = () => SB.radial('sb-fennel-b', [[0, '#CFF09A'], [0.5, '#8CCB5A'], [1, '#4E8A34']]) + SB.radial('sb-fennel-y', [[0, '#FFFBE8'], [1, '#F2E2B4']], 0.45, 0.35, 0.8) + SB.blushDef('fennel');
    C.arm = { w: 14, col: '#86C255', line: '#2F5A22' };
    C.face = { ex: [88, 152], ey: 94, er: 15, browY: 62, browW: 18, browCol: '#2F5A22', skin: '#A6D873', mx: 120, my: 150, ms: 20, cheekX: [62, 178], cheekY: 146, cheekR: [13, 8],
      extra: '<circle cx="112" cy="128" r="2.4" fill="#2F5A22"/><circle cx="128" cy="128" r="2.4" fill="#2F5A22"/>' };
    C.heart = [120, 214, 15]; C.holdAt = [120, 206];
    C.arms = SB.armSet({ sx: 72, sy: 196, k: 0.9, chin: [152, 166], heart: C.heart, headSide: [190, 118] });
    C.fx = { q: [212, 60], thought: [182, 48], zzz: [182, 62], sweat: [34, 108], wink: [214, 100], spark: [[24, 96, 8], [216, 80, 10], [222, 160, 7]] };
    C.ground = [120, 78]; C.shadow = 66;
    C.icon = { cx: 120, cy: 132, s: 1.05, ty: 126, bgs: ['#FFE58A', '#E3EDFB'] };
    C.propHand = STD; C.prop = (x, y, ctx, s, side) => P.clipboard(x, y, s, side === 'C' ? 0 : -6);
    C.feet = (ctx) => {
      const V = ctx.V, pts = V.sit ? [[84, 238], [156, 238]] : [[92, 236], [148, 236]];
      return pts.map(([x, y], i) => { const X = V.run ? x + (i ? 10 : -16) : x, Y = V.run && !i ? y - 10 : y;
        return `<path d="M${X - 20},${Y + 2} q2,-12 20,-12 q18,0 20,12 q-5,4 -10,0 q-5,4 -10,0 q-5,4 -10,0 q-5,4 -10,0Z" fill="#7DB84E" stroke="#2F5A22" stroke-width="3" stroke-linejoin="round"/>`; }).join('');
    };
    C.body = () => shade(ell(120, 198, 56, 40), { fill: 'url(#sb-fennel-b)', shadow: '#2F5A22', rim: '#E8FFC8', line: C.line })
      + `<ellipse cx="120" cy="206" rx="36" ry="28" fill="url(#sb-fennel-y)" stroke="#B9A66A" stroke-width="2"/>`
      + shade(ell(88, 94, 28, 28), { fill: 'url(#sb-fennel-b)', shadow: '#2F5A22', rim: '#E8FFC8', line: C.line, dx: 6, dy: 8 })
      + shade(ell(152, 94, 28, 28), { fill: 'url(#sb-fennel-b)', shadow: '#2F5A22', rim: '#E8FFC8', line: C.line, dx: 6, dy: 8 })
      + shade(ell(120, 134, 76, 48), { fill: 'url(#sb-fennel-b)', shadow: '#2F5A22', rim: '#E8FFC8', line: C.line, dx: 12, dy: 12,
        inner: dots([[150, 108, 5], [164, 118, 3.4], [76, 112, 4], [96, 104, 2.6]], '#4E8A34', 0.35), hl: gloss(78, 118, 18, 7, -24, 0.35) })
      + `<ellipse cx="88" cy="94" rx="21" ry="20" fill="#E6F7C8" stroke="#2F5A22" stroke-width="2"/><ellipse cx="152" cy="94" rx="21" ry="20" fill="#E6F7C8" stroke="#2F5A22" stroke-width="2"/>`;
    C.face.skin = '#E6F7C8';
    C.front = () => `<path d="M120,180 L100,170 Q94,180 100,192Z M120,180 L140,170 Q146,180 140,192Z" fill="#E0412F" stroke="#7A1E14" stroke-width="2.6" stroke-linejoin="round"/>`
      + `<circle cx="104" cy="176" r="1.8" fill="#FFF1DE"/><circle cx="102" cy="186" r="1.8" fill="#FFF1DE"/><circle cx="136" cy="176" r="1.8" fill="#FFF1DE"/><circle cx="138" cy="186" r="1.8" fill="#FFF1DE"/><circle cx="120" cy="181" r="5.4" fill="#C9302A" stroke="#7A1E14" stroke-width="2.2"/>`;
    SB.C.fennel = C;
  })();

  // =================== CLOVER · Timeclock ===================
  (() => {
    const C = { key: 'clover', name: 'Clover', line: '#6B4410' };
    C.defs = () => SB.radial('sb-clover-b', [[0, '#FFEFA0'], [0.5, '#FFC23D'], [1, '#D08A12']]) + SB.blushDef('clover', '#FF8A5B');
    C.arm = { w: 12, col: '#4A3020', line: '#1E120A', hand: '#5E3E2A' };
    C.face = { ex: [96, 144], ey: 116, er: 14.5, browY: 92, browW: 17, browCol: '#6B4410', skin: '#FFC23D', mx: 120, my: 144, ms: 12, cheekX: [72, 168], cheekY: 138, cheekR: [13, 8.5] };
    C.heart = [120, 214, 14]; C.holdAt = [120, 204];
    C.arms = SB.armSet({ sx: 76, sy: 198, k: 0.85, chin: [150, 160], heart: C.heart, headSide: [182, 104] });
    C.fx = { q: [208, 62], thought: [180, 46], zzz: [180, 56], sweat: [46, 96], wink: [210, 100], spark: [[22, 100, 8], [216, 90, 10], [220, 168, 7]] };
    C.ground = [120, 70]; C.shadow = 58;
    C.icon = { cx: 120, cy: 128, s: 1.1, ty: 124, bgs: ['#2E4A3C', '#E3EDFB'] };
    C.propHand = STD; C.prop = (x, y, ctx, s) => P.watch(x, y, s);
    C.feet = SB.stdFeet([[104, 236], [136, 236]], 13, 7, '#4A3020', '#1E120A');
    C.back = (ctx) => {
      const flap = ['celebrate', 'happy', 'excited', 'run', 'highfive'].includes(ctx.V.key) ? 14 : 0;
      return `<g fill="#EAF6FF" fill-opacity=".85" stroke="#5E8FB8" stroke-width="2.6"><ellipse cx="56" cy="150" rx="36" ry="22" transform="rotate(${-30 - flap} 84 166)"/><ellipse cx="184" cy="150" rx="36" ry="22" transform="rotate(${30 + flap} 156 166)"/>`
        + `<ellipse cx="66" cy="182" rx="24" ry="14" transform="rotate(${-6 - flap / 2} 84 178)"/><ellipse cx="174" cy="182" rx="24" ry="14" transform="rotate(${6 + flap / 2} 156 178)"/></g>`
        + `<path d="M40,150 q20,-4 40,8 M200,150 q-20,-4 -40,8" fill="none" stroke="#9CC4E2" stroke-width="1.6" transform="rotate(${-flap / 2} 120 160)"/>`
        + `<path d="M104,68 Q96,40 82,32 M136,68 Q144,40 158,32" fill="none" stroke="#1E120A" stroke-width="7" stroke-linecap="round"/><path d="M104,68 Q96,40 82,32 M136,68 Q144,40 158,32" fill="none" stroke="#4A3020" stroke-width="3.4" stroke-linecap="round"/>`
        + `<circle cx="82" cy="32" r="7" fill="#4A3020" stroke="#1E120A" stroke-width="2.4"/><circle cx="158" cy="32" r="7" fill="#4A3020" stroke="#1E120A" stroke-width="2.4"/><circle cx="80" cy="30" r="2" fill="#fff" opacity=".6"/><circle cx="156" cy="30" r="2" fill="#fff" opacity=".6"/>`;
    };
    const BODY = ell(120, 206, 50, 32);
    C.body = () => shade(BODY, { fill: 'url(#sb-clover-b)', shadow: '#8A5A0C', rim: '#FFF6C8', line: C.line, dx: 10, dy: 10,
      inner: `<path d="M64,196 Q120,186 176,196 L176,210 Q120,200 64,210Z M68,222 Q120,212 172,222 L172,236 Q120,226 68,236Z" fill="#4A3020"/>` })
      + shade(ell(120, 120, 60, 58), { fill: 'url(#sb-clover-b)', shadow: '#8A5A0C', rim: '#FFF6C8', line: C.line,
        inner: `<path d="M108,64 l4,-10 l4,8 l4,-10 l4,10 l4,-8 l4,10" fill="none" stroke="#C98A12" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>` + dots([[154, 92, 1.8], [160, 102, 1.4], [86, 88, 1.6]], '#A86A0C', 0.5),
        hl: gloss(92, 86, 18, 8, -36, 0.45) });
    SB.C.clover = C;
  })();

  // =================== MARIGOLD · Marketing ===================
  (() => {
    const C = { key: 'marigold', name: 'Marigold', line: '#A8501A' };
    C.defs = () => SB.linear('sb-marigold-p', [[0, '#FFC25A'], [1, '#F0761E']]) + SB.linear('sb-marigold-q', [[0, '#FFE08A'], [1, '#FFAE3A']])
      + SB.radial('sb-marigold-f', [[0, '#FFF6E4'], [0.6, '#FFE2BC'], [1, '#F2BE88']], 0.4, 0.35, 0.8) + SB.radial('sb-marigold-g', [[0, '#B6EC8A'], [0.6, '#6CC04A'], [1, '#3E8A2E']]) + SB.blushDef('marigold');
    C.arm = { w: 12, col: '#6CC04A', line: '#2F5E28' };
    C.face = { ex: [100, 140], ey: 114, er: 13.5, browY: 92, browW: 15, browCol: '#A8501A', skin: '#FFE2BC', mx: 120, my: 138, ms: 11, cheekX: [80, 160], cheekY: 132, cheekR: [11, 7] };
    C.heart = [120, 214, 13]; C.holdAt = [120, 204];
    C.arms = SB.armSet({ sx: 88, sy: 204, k: 0.8, chin: [146, 152], heart: C.heart, headSide: [168, 100] });
    C.fx = { q: [216, 58], thought: [188, 40], zzz: [184, 50], sweat: [44, 96], wink: [214, 100], spark: [[22, 100, 8], [222, 92, 9], [24, 176, 6]] };
    C.ground = [120, 66]; C.shadow = 52;
    C.icon = { cx: 120, cy: 122, s: 1.08, ty: 122, bgs: ['#2E4A3C', '#E3EDFB'] };
    C.propHand = { neutral: 'R', wave: 'L', curious: 'L', point: 'L', silly: 'R', happy: 'R', excited: 'R' };
    C.prop = (x, y, ctx, s, side) => P.megaphone(x, y, s, side);
    C.feet = SB.stdFeet([[106, 238], [134, 238]], 12, 6.5, '#4E9A3E', '#2F5E28');
    C.back = (ctx) => {
      const k = ctx.V.key, rot = k === 'silly' ? 9 : k === 'run' ? -12 : 0, droop = ['sleepy', 'oops', 'shy'].includes(k) ? 0.9 : 1;
      let s = '';
      for (let i = 0; i < 14; i++) { const a = i * 360 / 14 + rot; s += `<ellipse cx="120" cy="${r1(118 - 60 * droop)}" rx="15" ry="${r1(26 * droop)}" fill="url(#sb-marigold-p)" stroke="${C.line}" stroke-width="2.6" transform="rotate(${a} 120 118)"/>`; }
      for (let i = 0; i < 14; i++) { const a = i * 360 / 14 + 360 / 28 + rot; s += `<ellipse cx="120" cy="${118 - 48}" rx="12" ry="18" fill="url(#sb-marigold-q)" stroke="#C9661E" stroke-width="1.6" transform="rotate(${a} 120 118)"/>`; }
      return s;
    };
    C.body = () => shade(ell(120, 210, 38, 28), { fill: 'url(#sb-marigold-g)', shadow: '#1F4A1C', rim: '#E2FFC8', line: '#2F5E28', dx: 8, dy: 8,
      inner: `<path d="M120,186 L120,236" stroke="#3E8A2E" stroke-width="2" opacity=".6"/>` })
      + SB.leaf(104, 186, 24, -72, 9, 'url(#sb-marigold-g)', '#2F5E28') + SB.leaf(136, 186, 24, 72, 9, 'url(#sb-marigold-g)', '#2F5E28')
      + shade(ell(120, 118, 46, 46), { fill: 'url(#sb-marigold-f)', shadow: '#C9661E', rim: '#FFFFFF', line: C.line, so: 0.3, hl: gloss(98, 92, 12, 6, -36, 0.5) })
      + dots([[106, 76, 1.6], [134, 78, 1.4], [150, 90, 1.2]], '#E0A060', 0.6);
    SB.C.marigold = C;
  })();

  // =================== LOAM · Messages ===================
  (() => {
    const TUBE = 'M44,206 L114,206 C158,206 172,176 156,150 C146,134 128,128 126,106';
    const C = { key: 'loam', name: 'Loam', line: '#8A3E30', cx: 120, peekDx: 30 };
    C.defs = () => SB.linear('sb-loam-t', [[0, '#FFD0C0'], [1, '#E8907C']], 0, 0, 1, 0) + SB.radial('sb-loam-b', [[0, '#FFE0D4'], [0.55, '#F5A894'], [1, '#D07462']]) + SB.blushDef('loam', '#FF5E6E');
    C.arm = { w: 12, col: '#F5A894', line: '#8A3E30' };
    C.face = { ex: [108, 144], ey: 98, er: 13, browY: 76, browW: 15, browCol: '#8A3E30', skin: '#F5A894', mx: 126, my: 120, ms: 11, cheekX: [92, 160], cheekY: 114, cheekR: [11, 7] };
    C.heart = [156, 172, 13]; C.holdAt = [150, 168];
    C.arms = SB.armSet({ cx: 156, sx: 126, sy: 160, k: 0.8, chin: [150, 132], heart: C.heart, headSide: [172, 84] });
    C.fx = { q: [206, 52], thought: [178, 34], zzz: [180, 46], sweat: [72, 78], wink: [192, 92], spark: [[30, 100, 8], [210, 90, 10], [218, 150, 7]] };
    C.ground = [118, 92]; C.shadow = 86;
    C.icon = { cx: 128, cy: 110, s: 1.1, ty: 118, bgs: ['#2E4A3C', '#FFE58A'] };
    C.propHand = STD; C.prop = (x, y, ctx, s, side) => P.envelope(x, y, s, side === 'C' ? 0 : -8);
    C.body = (ctx) => {
      let rings = ''; for (let i = 0; i < 18; i++) rings += '0.5 4.5 ';
      return `<path d="${TUBE}" fill="none" stroke="#8A3E30" stroke-width="70" stroke-linecap="round"/>`
        + shade(ell(126, 98, 44, 42), { fill: 'url(#sb-loam-b)', shadow: '#A0463A', rim: '#FFF0E8', line: C.line })
        + `<g filter="url(#sb-grain)"><path d="${TUBE}" fill="none" stroke="url(#sb-loam-t)" stroke-width="64" stroke-linecap="round"/></g>`
        + `<path d="${TUBE}" pathLength="100" fill="none" stroke="#B85E4E" stroke-opacity=".3" stroke-width="64" stroke-dasharray="${rings}0 100"/>`
        + `<path d="${TUBE}" pathLength="100" fill="none" stroke="#FFC0B0" stroke-width="64" stroke-dasharray="0 56 8 100"/>`
        + `<path d="M50,186 L112,186 C142,186 158,170 150,152" fill="none" stroke="#fff" stroke-width="5" opacity=".4" stroke-linecap="round"/>`
        + `<circle cx="126" cy="98" r="40" fill="url(#sb-loam-b)"/>` + gloss(104, 76, 13, 6, -40, 0.45);
    };
    C.front = () => `<path d="M88,66 C86,34 166,34 164,66Z" fill="#2E6A4C" stroke="#123222" stroke-width="2.8" stroke-linejoin="round"/><path d="M90,64 C110,58 142,58 162,64" fill="none" stroke="#123222" stroke-width="2"/><ellipse cx="146" cy="66" rx="28" ry="6" fill="#1F4A34" stroke="#123222" stroke-width="2.6"/><circle cx="126" cy="50" r="6" fill="#FFCF3F" stroke="#9E6A0C" stroke-width="2"/><path d="M123,50 l3,-3 l3,3 v3 h-6Z" fill="#9E6A0C"/>`
      + `<path d="M98,110 Q150,140 172,186" fill="none" stroke="#3A2A20" stroke-width="7" stroke-linecap="round"/><path d="M98,110 Q150,140 172,186" fill="none" stroke="#8A5A3A" stroke-width="3.5" stroke-linecap="round"/>`
      + `<g transform="rotate(-6 176 196)"><rect x="152" y="180" width="46" height="34" rx="7" fill="#3E7A5A" stroke="#1F3A2A" stroke-width="2.8"/><rect x="158" y="173" width="26" height="15" rx="2" fill="#FFFDF6" stroke="#7A5A3A" stroke-width="1.8"/><path d="M158,174 l13,8 l13,-8" fill="none" stroke="#7A5A3A" stroke-width="1.4"/>`
      + `<path d="M152,188 Q175,202 198,188 L198,186 Q198,180 192,180 L158,180 Q152,180 152,186Z" fill="#2C5A42" stroke="#1F3A2A" stroke-width="2.4"/><circle cx="175" cy="196" r="3.4" fill="#FFCF3F" stroke="#9E6A0C" stroke-width="1.4"/><path d="M158,206 h34" stroke="#9FD0B4" stroke-width="1.4" stroke-dasharray="3 2.6"/></g>`;
    SB.C.loam = C;
  })();

  // =================== DOT · Calendar & Events ===================
  (() => {
    const C = { key: 'dot', name: 'Dot', line: '#1A1310' };
    C.defs = () => SB.radial('sb-dot-b', [[0, '#FF8E7A'], [0.5, '#EE4A36'], [1, '#A0261B']]) + SB.radial('sb-dot-h', [[0, '#6E625A'], [0.55, '#463C36'], [1, '#2A221E']]) + SB.blushDef('dot', '#FF6F8A');
    C.arm = { w: 11, col: '#3A302A', line: '#120C0A', hand: '#4A3E36' };
    C.face = { ex: [97, 143], ey: 112, er: 14, browY: 84, browW: 16, browCol: '#F2E2D0', skin: '#463C36', style: 'ball', ballLine: '#120C0A', lidFill: '#463C36', arcInk: '#FFF1E2', mouthInk: '#FFE9DA', ink: '#1A1310', mx: 120, my: 140, ms: 11, cheekX: [72, 168], cheekY: 136, cheekR: [12, 7.5] };
    C.heart = [120, 216, 13]; C.holdAt = [120, 208];
    C.arms = SB.armSet({ sx: 66, sy: 202, k: 0.82, chin: [150, 152], heart: C.heart, headSide: [178, 96] });
    C.fx = { q: [206, 62], thought: [182, 44], zzz: [180, 54], sweat: [46, 96], wink: [208, 96], spark: [[24, 96, 8], [214, 86, 10], [222, 160, 7]] };
    C.ground = [120, 78]; C.shadow = 66;
    C.icon = { cx: 120, cy: 128, s: 1.1, ty: 122, bgs: ['#FFE58A', '#DDEBD5'] };
    C.propHand = STD; C.prop = (x, y, ctx, s, side) => P.calendar(x, y, s, side === 'C' ? 0 : 5);
    C.feet = SB.stdFeet([[102, 238], [138, 238]], 13, 7, '#2A221E', '#120C0A');
    C.back = () => `<path d="M104,66 Q94,40 84,30 M136,66 Q146,40 156,30" fill="none" stroke="#120C0A" stroke-width="6" stroke-linecap="round"/><path d="M104,66 Q94,40 84,30 M136,66 Q146,40 156,30" fill="none" stroke="#3A302A" stroke-width="3" stroke-linecap="round"/><circle cx="84" cy="30" r="6.5" fill="#3A302A" stroke="#120C0A" stroke-width="2.4"/><circle cx="156" cy="30" r="6.5" fill="#3A302A" stroke="#120C0A" stroke-width="2.4"/>`;
    const SPOTS = [[94, 196, 9], [86, 220, 7.5], [108, 230, 6], [146, 196, 9], [154, 220, 7.5], [132, 230, 6]];
    C.body = () => shade(ell(120, 208, 62, 34), { fill: 'url(#sb-dot-b)', shadow: '#5A1410', rim: '#FFD0C4', line: '#5A1410', dx: 10, dy: 10,
      inner: `<path d="M120,176 L120,242" stroke="#5A1410" stroke-width="3"/>` + SPOTS.map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${i === 4 ? '#FFCF3F' : '#2A1E1A'}"${i === 4 ? ' stroke="#9E6A0C" stroke-width="1.8"' : ''}/>`).join(''),
      hl: gloss(90, 190, 16, 6, -14, 0.5) + gloss(150, 186, 8, 3.5, 14, 0.4) })
      + `<ellipse cx="120" cy="172" rx="42" ry="12" fill="#2A221E" stroke="#120C0A" stroke-width="2.6"/><circle cx="102" cy="172" r="4.6" fill="#FFF1E2"/><circle cx="138" cy="172" r="4.6" fill="#FFF1E2"/>`
      + shade(ell(120, 114, 56, 54), { fill: 'url(#sb-dot-h)', shadow: '#0E0A08', rim: '#9A8A80', line: C.line, hl: gloss(92, 82, 16, 7, -36, 0.3) });
    SB.C.dot = C;
  })();

  // =================== FLICKER · Photos ===================
  (() => {
    const C = { key: 'flicker', name: 'Flicker', line: '#6B2410' };
    C.defs = () => SB.radial('sb-flicker-g', [[0, '#FFE58A', 0.75], [1, '#FFE58A', 0]], 0.5, 0.5, 0.5) + SB.radial('sb-flicker-a', [[0, '#FFFDE8'], [0.55, '#FFE266'], [1, '#F2AE1E']], 0.45, 0.35, 0.8)
      + SB.radial('sb-flicker-h', [[0, '#FFB27E'], [0.55, '#F26E3A'], [1, '#B4441E']]) + SB.radial('sb-flicker-t', [[0, '#8A6A56'], [1, '#4A3428']]) + SB.radial('sb-flicker-f', [[0, '#FFF8EC'], [1, '#F8D8B6']], 0.45, 0.35, 0.8) + SB.blushDef('flicker');
    C.arm = { w: 11, col: '#5E4436', line: '#24160E', hand: '#6E5444' };
    C.face = { ex: [100, 140], ey: 120, er: 13.5, browY: 94, browW: 15, browCol: '#8A3E20', skin: '#FBE0C4', mx: 120, my: 144, ms: 11, cheekX: [80, 160], cheekY: 140, cheekR: [11, 7] };
    C.heart = [120, 192, 12]; C.holdAt = [120, 190];
    C.arms = SB.armSet({ sx: 92, sy: 184, k: 0.8, chin: [146, 156], heart: C.heart, headSide: [176, 98] });
    C.fx = { q: [212, 60], thought: [184, 40], zzz: [182, 52], sweat: [44, 92], wink: [210, 100], spark: [[24, 92, 8], [216, 84, 10], [30, 170, 7]] };
    C.ground = [120, 70]; C.shadow = 60;
    C.icon = { cx: 120, cy: 130, s: 1.06, ty: 124, bgs: ['#2B241D', '#2E4A3C'] };
    C.propHand = STD; C.prop = (x, y, ctx, s, side) => P.camera(x, y, s, side === 'C' ? 0 : -6);
    C.feet = SB.stdFeet([[106, 240], [134, 240]], 12, 6.5, '#3A2820', '#24160E');
    C.back = (ctx) => `<circle cx="120" cy="212" r="${['celebrate', 'excited', 'love', 'happy'].includes(ctx.V.key) ? 86 : 72}" fill="url(#sb-flicker-g)"/>`
      + `<path d="M108,62 Q94,26 70,20 M132,62 Q146,26 170,20" fill="none" stroke="#24160E" stroke-width="6" stroke-linecap="round"/><path d="M108,62 Q94,26 70,20 M132,62 Q146,26 170,20" fill="none" stroke="#5E4436" stroke-width="3" stroke-linecap="round"/>`
      + `<circle cx="70" cy="20" r="6.5" fill="#FFE266" stroke="#B9770F" stroke-width="2"/><circle cx="170" cy="20" r="6.5" fill="#FFE266" stroke="#B9770F" stroke-width="2"/>`
      + `<g fill="#D9B896" fill-opacity=".85" stroke="#6E4A30" stroke-width="2.6"><ellipse cx="80" cy="186" rx="20" ry="40" transform="rotate(28 80 186)"/><ellipse cx="160" cy="186" rx="20" ry="40" transform="rotate(-28 160 186)"/></g>`
      + `<path d="M74,168 q6,20 0,40 M166,168 q-6,20 0,40" fill="none" stroke="#B48A62" stroke-width="1.6"/>`;
    C.body = () => shade(ell(120, 214, 44, 26), { fill: 'url(#sb-flicker-a)', shadow: '#C98A12', rim: '#FFFFFF', line: '#B9770F', dx: 8, dy: 8, so: 0.3,
      inner: `<path d="M84,210 Q120,220 156,210 M90,224 Q120,232 150,224" fill="none" stroke="#F2AE1E" stroke-width="2" opacity=".6"/>` })
      + shade(ell(120, 182, 30, 16), { fill: 'url(#sb-flicker-t)', shadow: '#1E120A', rim: '#B48A70', line: '#24160E', dx: 6, dy: 6 })
      + shade(ell(120, 112, 58, 56), { fill: 'url(#sb-flicker-h)', shadow: '#7A2410', rim: '#FFD8BC', line: C.line, hl: gloss(90, 74, 16, 7, -36, 0.4) })
      + `<ellipse cx="120" cy="126" rx="44" ry="37" fill="url(#sb-flicker-f)" stroke="#D08A5A" stroke-width="2.2"/>`;
    SB.C.flicker = C;
  })();

  // =================== BRAMBLE · Forms ===================
  (() => {
    const pencil = (x, y, a) => `<g transform="translate(${x},${y}) rotate(${a})"><rect x="-4.5" y="-26" width="9" height="40" fill="#FFC23D" stroke="#7A5410" stroke-width="2"/><rect x="-1.4" y="-26" width="2.8" height="40" fill="#FFE08A"/><rect x="-4.5" y="14" width="9" height="5" fill="#C9C2B6" stroke="#55606A" stroke-width="1.6"/><rect x="-4.5" y="19" width="9" height="7" rx="2.6" fill="#FF8E8E" stroke="#9E2A2E" stroke-width="1.6"/><path d="M-4.5,-26 L0,-37 L4.5,-26Z" fill="#F2D2A4" stroke="#7A5410" stroke-width="1.6" stroke-linejoin="round"/><path d="M-1.5,-33 L0,-37 L1.5,-33Z" fill="#2E1B12"/></g>`;
    const quills = (cx, cy, R, r, a0, a1, n) => { let d = ''; for (let i = 0; i <= n * 2; i++) { const a = (a0 + (a1 - a0) * i / (n * 2)) * Math.PI / 180, rr = i % 2 ? R : r; d += `${i ? 'L' : 'M'}${r1(cx + Math.cos(a) * rr)},${r1(cy + Math.sin(a) * rr)} `; } return d + `L${cx + 60},${cy + 80} L${cx - 60},${cy + 80}Z`; };
    const B = 'M120,76 C166,76 186,122 186,164 C186,212 158,238 120,238 C82,238 54,212 54,164 C54,122 74,76 120,76Z';
    const C = { key: 'bramble', name: 'Bramble', line: '#5A3A22' };
    C.defs = () => SB.radial('sb-bramble-q', [[0, '#B68862'], [0.7, '#7E5636'], [1, '#4E321E']], 0.5, 0.55, 0.6) + SB.radial('sb-bramble-b', [[0, '#FFF8EA'], [0.6, '#F6DDBA'], [1, '#D8B48A']]) + SB.blushDef('bramble');
    C.arm = { w: 13, col: '#9A6E4C', line: '#3A2416' };
    C.face = { ex: [94, 146], ey: 136, er: 14, browY: 112, browW: 16, browCol: '#6E4A30', skin: '#F6DDBA', mx: 120, my: 178, ms: 11, cheekX: [70, 170], cheekY: 166, cheekR: [13, 8],
      extra: `<ellipse cx="120" cy="160" rx="10" ry="7.5" fill="#2E1B12"/><ellipse cx="117" cy="157" rx="3.4" ry="2" fill="#fff" opacity=".7"/>` };
    C.heart = [120, 214, 15]; C.holdAt = [120, 206];
    C.arms = SB.armSet({ sx: 62, sy: 190, k: 0.9, chin: [148, 196], heart: C.heart, headSide: [184, 116] });
    C.fx = { q: [218, 72], thought: [184, 50], zzz: [186, 70], sweat: [36, 110], wink: [216, 108], spark: [[20, 100, 8], [222, 104, 9], [24, 182, 6]] };
    C.ground = [120, 78]; C.shadow = 66;
    C.icon = { cx: 120, cy: 140, s: 1.0, ty: 128, bgs: ['#2E4A3C', '#F8DDCF'] };
    C.propHand = STD; C.prop = (x, y, ctx, s, side) => P.form(x, y, s, side === 'C' ? 0 : -5);
    C.feet = SB.stdFeet([[100, 238], [140, 238]], 16, 8, '#7E5636', '#3A2416');
    C.back = (ctx) => {
      const ruff = ['celebrate', 'surprised', 'excited', 'silly'].includes(ctx.V.key) ? 8 : 0;
      return shade(quills(120, 150, 104 + ruff, 80, -200, 20, 12), { fill: 'url(#sb-bramble-q)', shadow: '#2A180C', rim: '#D9B48E', line: '#3A2416', lw: 2.6,
        inner: [-170, -140, -110, -80, -50, -20, 10].map((a) => { const t = a * Math.PI / 180; return `<path d="M${r1(120 + Math.cos(t) * 70)},${r1(150 + Math.sin(t) * 70)} L${r1(120 + Math.cos(t) * 92)},${r1(150 + Math.sin(t) * 92)}" stroke="#D9B48E" stroke-width="2" opacity=".6" stroke-linecap="round"/>`; }).join('') })
        + pencil(176, 62, 34) + pencil(64, 56, -28)
        + `<circle cx="86" cy="86" r="12" fill="#F2C8A0" stroke="#5A3A22" stroke-width="2.6"/><circle cx="154" cy="86" r="12" fill="#F2C8A0" stroke="#5A3A22" stroke-width="2.6"/><circle cx="86" cy="88" r="5.5" fill="#E89A8A"/><circle cx="154" cy="88" r="5.5" fill="#E89A8A"/>`;
    };
    C.body = () => shade(B, { fill: 'url(#sb-bramble-b)', shadow: '#A07448', rim: '#FFFFFF', line: '#8A6A4C', so: 0.32,
      inner: dots([[150, 212, 1.8], [86, 214, 1.6], [160, 198, 1.2]], '#A07448', 0.5), hl: gloss(86, 110, 16, 7, -36, 0.5) });
    SB.C.bramble = C;
  })();

  // =================== TANSY · Committees ===================
  (() => {
    const C = { key: 'tansy', name: 'Tansy', line: '#4E1A0E' };
    C.defs = () => SB.radial('sb-tansy-b', [[0, '#FFAE88'], [0.5, '#D9623E'], [1, '#8A3420']]) + SB.linear('sb-tansy-l', [[0, '#BDE694'], [1, '#4F9D3F']]) + SB.blushDef('tansy');
    C.arm = { w: 10, col: '#C45A3A', line: '#4E1A0E' };
    C.face = { ex: [97, 143], ey: 112, er: 14.5, browY: 86, browW: 16, browCol: '#4E1A0E', skin: '#D9623E', mx: 120, my: 140, ms: 12, cheekX: [74, 166], cheekY: 134, cheekR: [12, 8] };
    C.heart = [120, 198, 12]; C.holdAt = [120, 196];
    C.arms = SB.armSet({ sx: 98, sy: 184, k: 0.8, chin: [146, 154], heart: C.heart, headSide: [176, 102] });
    C.fx = { q: [36, 64], thought: [180, 40], zzz: [180, 56], sweat: [44, 96], wink: [208, 100], spark: [[24, 100, 8], [216, 88, 10], [220, 164, 7]] };
    C.ground = [120, 70]; C.shadow = 58;
    C.icon = { cx: 120, cy: 126, s: 1.08, ty: 122, bgs: ['#DDEBD5', '#FFE58A'] };
    C.propHand = { neutral: 'R', wave: 'L', curious: 'L', point: 'L', silly: 'R', happy: 'R', celebrate: 'R', thumbs: 'L', highfive: 'L', run: 'R' };
    C.prop = (x, y, ctx, s, side) => {
      if (side === 'C') return `<path d="M${x},${y + 12} L${x},${y - 56}" stroke="#4E2A10" stroke-width="7" stroke-linecap="round"/><path d="M${x},${y + 12} L${x},${y - 56}" stroke="#B9824A" stroke-width="3.4" stroke-linecap="round"/>` + SB.leaf(x, y - 50, 52, 30, 20, 'url(#sb-tansy-l)', '#2F5E28');
      const m = side === 'L' ? -1 : 1, up = ['up', 'cheer', 'highfive', 'thumbs'].includes(ctx.V.pose);
      const tx = r1(x + m * (up ? 12 : 18)), ty = r1(y - (up ? 36 : 82));
      return `<path d="M${x},${y + 8} L${tx},${ty}" stroke="#4E2A10" stroke-width="7" stroke-linecap="round"/><path d="M${x},${y + 8} L${tx},${ty}" stroke="#B9824A" stroke-width="3.4" stroke-linecap="round"/>` + SB.leaf(tx, ty + 6, up ? 44 : 54, m * (up ? 62 : 36), 19, 'url(#sb-tansy-l)', '#2F5E28');
    };
    C.feet = SB.stdFeet([[104, 238], [136, 238]], 13, 7, '#6A2A18', '#4E1A0E');
    C.back = () => `<path d="M100,66 L90,44 L70,36 M140,66 L150,44 L170,36" fill="none" stroke="#4E1A0E" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M100,66 L90,44 L70,36 M140,66 L150,44 L170,36" fill="none" stroke="#C45A3A" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`
      + `<circle cx="70" cy="36" r="6.5" fill="#C45A3A" stroke="#4E1A0E" stroke-width="2.4"/><circle cx="170" cy="36" r="6.5" fill="#C45A3A" stroke="#4E1A0E" stroke-width="2.4"/>`
      + SB.limb([[104, 184], [80, 196], [66, 214]], 8, '#C45A3A', '#4E1A0E', 2.6) + SB.limb([[136, 184], [160, 196], [174, 214]], 8, '#C45A3A', '#4E1A0E', 2.6);
    C.body = () => shade(ell(120, 214, 42, 24), { fill: 'url(#sb-tansy-b)', shadow: '#4E1A0E', rim: '#FFD2BC', line: C.line, dx: 8, dy: 8,
      inner: `<path d="M84,210 Q120,220 156,210 M88,224 Q120,232 152,224" fill="none" stroke="#8A3420" stroke-width="2" opacity=".55"/>` })
      + shade(ell(120, 180, 24, 14), { fill: 'url(#sb-tansy-b)', shadow: '#4E1A0E', rim: '#FFD2BC', line: C.line, dx: 6, dy: 6 })
      + shade(ell(120, 110, 56, 54), { fill: 'url(#sb-tansy-b)', shadow: '#4E1A0E', rim: '#FFD2BC', line: C.line, hl: gloss(92, 80, 16, 7, -36, 0.4),
        inner: dots([[150, 80, 1.8], [158, 92, 1.4], [86, 86, 1.6]], '#8A3420', 0.5) });
    SB.C.tansy = C;
  })();
})(SB);
