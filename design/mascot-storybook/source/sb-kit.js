// MudKitchen Crew · Storybook kit. viewBox 0 0 240 260, ground ~238.
var SB = {};
(function (SB) {
  let UID = 0;
  const uid = (p) => `sb${p}${++UID}`;
  const r1 = (n) => Math.round(n * 10) / 10;
  SB.uid = uid; SB.r1 = r1;

  const INK = '#2E1B12';
  SB.INK = INK;

  // ---------- defs ----------
  const stops = (l) => l.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('');
  SB.radial = (id, l, cx = 0.36, cy = 0.28, r = 0.85) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops(l)}</radialGradient>`;
  SB.linear = (id, l, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(l)}</linearGradient>`;
  SB.baseDefs = () => `<filter id="sb-grain" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">`
    + `<feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed="11" result="n"/><feColorMatrix in="n" type="saturate" values="0" result="g"/>`
    + `<feComponentTransfer in="g" result="t"><feFuncR type="linear" slope=".13" intercept=".88"/><feFuncG type="linear" slope=".13" intercept=".88"/><feFuncB type="linear" slope=".13" intercept=".88"/><feFuncA type="table" tableValues="1 1"/></feComponentTransfer>`
    + `<feComposite in="t" in2="SourceGraphic" operator="in" result="m"/><feBlend in="m" in2="SourceGraphic" mode="multiply"/></filter>`
    + `<filter id="sb-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>`
    + SB.radial('sb-heart', [[0, '#FF8A8A'], [0.6, '#E5484D'], [1, '#B42F3A']], 0.35, 0.3, 0.9)
    + SB.radial('sb-star', [[0, '#FFF3B0'], [0.6, '#FFCF3F'], [1, '#E9A21B']], 0.4, 0.35, 0.8)
    + SB.radial('sb-drop', [[0, '#E6F6FF'], [1, '#7CC4F0']], 0.35, 0.3, 0.9);

  // ---------- storybook shape: fill + grain + shadow crescent + rim light + outline ----------
  SB.shade = function (d, o) {
    const id = uid('s');
    const dx = o.dx != null ? o.dx : 12, dy = o.dy != null ? o.dy : 13;
    let s = `<clipPath id="${id}c"><path d="${d}"/></clipPath>`;
    s += `<mask id="${id}m" maskUnits="userSpaceOnUse" x="-60" y="-60" width="360" height="380"><rect x="-60" y="-60" width="360" height="380" fill="#fff"/><path d="${d}" fill="#000" transform="translate(${-dx},${-dy})"/></mask>`;
    s += `<g${o.grain === false ? '' : ' filter="url(#sb-grain)"'}><path d="${d}" fill="${o.fill}"/></g>`;
    s += `<g clip-path="url(#${id}c)"><path d="${d}" fill="${o.shadow}" opacity="${o.so || 0.42}" mask="url(#${id}m)" filter="url(#sb-soft)"/>`;
    if (o.rim) s += `<path d="${d}" fill="none" stroke="${o.rim}" stroke-width="4" opacity="${o.ro || 0.55}" transform="translate(-4,-4)"/>`;
    if (o.inner) s += o.inner;
    s += `</g>`;
    if (o.hl) s += o.hl;
    s += `<path d="${d}" fill="none" stroke="${o.line}" stroke-width="${o.lw || 3.2}" stroke-linejoin="round"/>`;
    return s;
  };
  SB.ell = (cx, cy, rx, ry) => `M${r1(cx - rx)},${cy} A${rx} ${ry} 0 1 0 ${r1(cx + rx)},${cy} A${rx} ${ry} 0 1 0 ${r1(cx - rx)},${cy}Z`;
  SB.gloss = (x, y, rx, ry, a, op = 0.55) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${a} ${x} ${y})" fill="#fff" opacity="${op}"/>`;

  // ---------- limbs ----------
  SB.limb = function (pts, w, col, line, lw = 3) {
    const [a, b, c] = pts;
    const d = `M${r1(a[0])},${r1(a[1])} Q${r1(b[0])},${r1(b[1])} ${r1(c[0])},${r1(c[1])}`;
    return `<path d="${d}" fill="none" stroke="${line}" stroke-width="${w + lw * 2}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`
      + `<path d="${d}" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="${r1(w * 0.3)}" stroke-linecap="round" transform="translate(-1.5,-1.5)"/>`;
  };
  const dirOf = (pts) => { const [b, c] = [pts[1], pts[2]]; const dx = c[0] - b[0], dy = c[1] - b[1], L = Math.hypot(dx, dy) || 1; return [dx / L, dy / L]; };
  // special hands: fist+thumb, pointing, open palm, fist
  SB.hand = function (kind, pts, side, A) {
    const [x, y] = pts[2];
    const [dx, dy] = dirOf(pts);
    const r = A.w * 0.62, col = A.hand || A.col, line = A.line;
    const ang = r1(Math.atan2(dy, dx) * 180 / Math.PI);
    const cap = (x1, y1, x2, y2, w) => `<path d="M${r1(x1)},${r1(y1)} L${r1(x2)},${r1(y2)}" stroke="${line}" stroke-width="${w + 5}" stroke-linecap="round"/><path d="M${r1(x1)},${r1(y1)} L${r1(x2)},${r1(y2)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
    const ball = (cx, cy, rr) => `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(rr)}" fill="${col}" stroke="${line}" stroke-width="2.8"/>`;
    if (kind === 'thumb') return ball(x, y, r * 1.2) + cap(x, y - r * 0.6, x + (side === 'L' ? -1 : 1) * 1, y - r * 2.1, r * 0.75);
    if (kind === 'point') return ball(x, y, r * 1.15) + cap(x, y, x + dx * r * 2.6, y + dy * r * 2.6, r * 0.7);
    if (kind === 'palm') {
      let s = '';
      [-50, -18, 14, 46].forEach((a) => { const t = (a - 90) * Math.PI / 180; s += cap(x, y, x + Math.cos(t) * r * 1.9, y + Math.sin(t) * r * 1.9, r * 0.62); });
      const ts = side === 'L' ? 1 : -1;
      return s + cap(x, y, x + ts * r * 1.8, y + r * 0.4, r * 0.62) + ball(x, y, r * 1.2);
    }
    if (kind === 'fist') return ball(x, y, r * 1.25) + `<path d="M${r1(x - r * 0.5)},${r1(y - r * 0.2)} q${r1(r * 0.5)},${r1(-r * 0.3)} ${r1(r)},0" fill="none" stroke="${line}" stroke-width="1.6" opacity=".6"/>`;
    return '';
  };

  // ---------- arm sets (round-1 nub arms) ----------
  SB.armSet = function ({ cx = 120, sx, sy, k = 1, chin, heart, headSide }) {
    const M = (x) => 2 * cx - x;
    const mir = (a) => a && ({ p: a.p.map(([x, y]) => [M(x), y]), front: a.front, hand: a.hand });
    const Rx = M(sx);
    const rest = { p: [[sx, sy], [sx - 20 * k, sy + 10 * k], [sx - 24 * k, sy + 30 * k]] };
    const cheer = { p: [[sx - 2, sy - 8], [sx - 26 * k, sy - 16 * k], [sx - 38 * k, sy - 38 * k]] };
    const up = { p: [[sx + 2, sy - 18], [sx - 18 * k, sy - 48 * k], [sx - 24 * k, sy - 78 * k]] };
    const shrugL = { p: [[sx, sy], [sx - 24 * k, sy + 4 * k], [sx - 38 * k, sy - 8 * k]], hand: 'palmup' };
    const [hx, hy, hs] = heart;
    const heartL = { p: [[sx + 2, sy + 14], [sx + 18 * k, sy + 40 * k], [hx - hs * 1.1, hy + 2]], front: true };
    const bellyL = { p: [[sx + 2, sy + 10], [sx + 10 * k, sy + 36 * k], [cx - 30 * k, sy + 40 * k]], front: true };
    const shyL = { p: [[sx + 2, sy + 10], [sx + 16 * k, sy + 40 * k], [cx - 9, sy + 44 * k]], front: true };
    const fistL = { p: [[sx, sy], [sx - 22 * k, sy + 14 * k], [sx + 2 * k, sy + 26 * k]], front: true, hand: 'fist' };
    const holdL = { p: [[sx + 2, sy + 8], [sx + 8 * k, sy + 30 * k], [cx - 22 * k, sy + 30 * k]], front: true };
    const sitL = { p: [[sx, sy], [sx - 16 * k, sy + 22 * k], [sx - 14 * k, sy + 46 * k]] };
    const runL = { p: [[sx, sy], [sx - 22 * k, sy + 14 * k], [sx - 34 * k, sy + 30 * k]] };
    return {
      rest: { L: rest, R: mir(rest) },
      cheer: { L: cheer, R: mir(cheer) },
      up: { L: up, R: mir(up) },
      wave: { L: rest, R: { p: [[Rx, sy - 10], [Rx + 28 * k, sy - 28 * k], [Rx + 32 * k, sy - 64 * k]] } },
      think: { L: rest, R: { p: [[Rx - 4, sy + 14], [Rx - 6 * k, sy + 40 * k], chin], front: true } },
      heart: { L: heartL, R: mir(heartL) },
      belly: { L: bellyL, R: mir(bellyL) },
      shy: { L: shyL, R: mir(shyL) },
      scratch: { L: rest, R: { p: [[Rx, sy - 6], [Rx + 24 * k, sy - 30 * k], headSide], front: true } },
      fists: { L: fistL, R: mir(fistL) },
      shrug: { L: shrugL, R: mir(shrugL) },
      thumbs: { L: rest, R: { p: [[Rx, sy], [Rx + 22 * k, sy + 6 * k], [Rx + 22 * k, sy - 16 * k]], front: true, hand: 'thumb' } },
      point: { L: rest, R: { p: [[Rx, sy - 4], [Rx + 22 * k, sy - 6 * k], [Rx + 36 * k, sy - 12 * k]], hand: 'point' } },
      hold: { L: holdL, R: mir(holdL) },
      highfive: { L: rest, R: { p: [[Rx, sy - 10], [Rx + 22 * k, sy - 34 * k], [Rx + 24 * k, sy - 62 * k]], hand: 'palm' } },
      run: { L: runL, R: { p: [[Rx, sy - 4], [Rx + 22 * k, sy - 8 * k], [Rx + 30 * k, sy - 30 * k]] } },
      sit: { L: sitL, R: mir(sitL) },
      peek: { R: rest && mir(rest) },
    };
  };

  // ---------- eyes ----------
  function star5(x, y, R, r) {
    let d = '';
    for (let i = 0; i < 10; i++) { const a = (i * 36 - 90) * Math.PI / 180, rr = i % 2 ? r : R; d += `${i ? 'L' : 'M'}${r1(x + Math.cos(a) * rr)},${r1(y + Math.sin(a) * rr)} `; }
    return d + 'Z';
  }
  SB.star5 = star5;
  function heartPath(x, y, s) {
    return `M${x},${r1(y + s * 0.9)} C${r1(x - s * 1.45)},${r1(y - s * 0.05)} ${r1(x - s * 0.75)},${r1(y - s * 1.15)} ${x},${r1(y - s * 0.42)} C${r1(x + s * 0.75)},${r1(y - s * 1.15)} ${r1(x + s * 1.45)},${r1(y - s * 0.05)} ${x},${r1(y + s * 0.9)}Z`;
  }
  SB.heartPath = heartPath;

  // side: 0 left, 1 right. F.style 'bead' (default) or 'ball' (white sclera)
  SB.eye = function (x, y, r, k, look, F, side) {
    const ink = F.ink || INK, arc = F.arcInk || ink;
    const lx = r1(x + look[0] * r * 0.32), ly = r1(y + look[1] * r * 0.3);
    const m = side ? -1 : 1;
    const arcStroke = (d, w = 0.42) => `<path d="${d}" fill="none" stroke="${arc}" stroke-width="${r1(r * w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const ballBase = (fill) => F.style === 'ball' ? `<circle cx="${x}" cy="${y}" r="${r1(r * 1.08)}" fill="${fill}" stroke="${F.ballLine || ink}" stroke-width="2.6"/>` : '';
    switch (k) {
      case 'happy': return ballBase(F.lidFill || F.skin) + arcStroke(`M${r1(x - r * 0.85)},${r1(y + r * 0.3)} Q${x},${r1(y - r * 1.1)} ${r1(x + r * 0.85)},${r1(y + r * 0.3)}`);
      case 'closed': return ballBase(F.lidFill || F.skin) + arcStroke(`M${r1(x - r * 0.8)},${r1(y)} Q${x},${r1(y + r * 0.55)} ${r1(x + r * 0.8)},${r1(y)}`, 0.34)
        + `<path d="M${r1(x - r * 0.55)},${r1(y + r * 0.35)} l${r1(-r * 0.2)},${r1(r * 0.3)} M${r1(x + r * 0.55)},${r1(y + r * 0.35)} l${r1(r * 0.2)},${r1(r * 0.3)}" stroke="${arc}" stroke-width="${r1(r * 0.16)}" stroke-linecap="round"/>`;
      case 'laugh': return ballBase(F.lidFill || F.skin) + arcStroke(`M${r1(x - m * r * 0.7)},${r1(y - r * 0.6)} L${r1(x + m * r * 0.55)},${y} L${r1(x - m * r * 0.7)},${r1(y + r * 0.6)}`, 0.36);
      case 'star': return `<path d="${star5(x, y, r * 1.25, r * 0.55)}" fill="url(#sb-star)" stroke="#B9770F" stroke-width="2.2" stroke-linejoin="round"/>` + `<circle cx="${r1(x - r * 0.3)}" cy="${r1(y - r * 0.3)}" r="${r1(r * 0.18)}" fill="#fff"/>`;
      case 'heart': return `<path d="${heartPath(x, y, r * 0.95)}" fill="url(#sb-heart)" stroke="#9E2A2E" stroke-width="2.2"/>` + `<ellipse cx="${r1(x - r * 0.4)}" cy="${r1(y - r * 0.3)}" rx="${r1(r * 0.22)}" ry="${r1(r * 0.14)}" transform="rotate(-35 ${r1(x - r * 0.4)} ${r1(y - r * 0.3)})" fill="#fff" opacity=".8"/>`;
      case 'surprised': return `<circle cx="${x}" cy="${y}" r="${r1(r * 1.08)}" fill="#FFFDF8" stroke="${ink}" stroke-width="2.8"/><circle cx="${lx}" cy="${ly}" r="${r1(r * 0.36)}" fill="${ink}"/><circle cx="${r1(lx + r * 0.12)}" cy="${r1(ly - r * 0.14)}" r="${r1(r * 0.12)}" fill="#fff"/>`;
    }
    // open-type eyes (open, big, lid, squint, small)
    const R = k === 'big' ? r * 1.15 : k === 'small' ? r * 0.72 : r;
    let s = '';
    if (F.style === 'ball') {
      s += `<circle cx="${x}" cy="${y}" r="${r1(r * 1.08)}" fill="#FFFDF8" stroke="${F.ballLine || ink}" stroke-width="2.6"/>`;
      const pr = k === 'big' ? r * 0.62 : k === 'small' ? r * 0.4 : r * 0.54;
      const px = r1(x + look[0] * r * 0.4), py = r1(y + look[1] * r * 0.4);
      s += `<circle cx="${px}" cy="${py}" r="${r1(pr)}" fill="${ink}"/><circle cx="${r1(px + pr * 0.38)}" cy="${r1(py - pr * 0.42)}" r="${r1(pr * 0.38)}" fill="#fff"/><circle cx="${r1(px - pr * 0.4)}" cy="${r1(py + pr * 0.4)}" r="${r1(pr * 0.16)}" fill="#fff"/>`;
    } else {
      s += `<ellipse cx="${lx}" cy="${ly}" rx="${r1(R * 0.84)}" ry="${r1(R)}" fill="${ink}"/>`;
      s += `<circle cx="${r1(lx + R * 0.3)}" cy="${r1(ly - R * 0.38)}" r="${r1(R * (k === 'big' ? 0.4 : 0.34))}" fill="#fff"/><circle cx="${r1(lx - R * 0.3)}" cy="${r1(ly + R * 0.38)}" r="${r1(R * 0.15)}" fill="#fff" opacity=".9"/>`;
      if (k === 'big') s += `<path d="${star5(r1(lx - R * 0.15), r1(ly + R * 0.05), R * 0.22, R * 0.09)}" fill="#fff" opacity=".85"/>`;
    }
    const lidFill = F.style === 'ball' ? (F.lidFill || F.skin) : F.skin;
    const er = F.style === 'ball' ? r * 1.12 : R * 1.05;
    if (k === 'lid') {
      // determined: inner ends of lids lowered
      const yi = y - er * 0.05, yo = y - er * 0.6;
      const xi = x + m * er, xo = x - m * er;
      s += `<path d="M${r1(xo - m * 2)},${r1(y - er - 3)} L${r1(xi + m * 2)},${r1(y - er - 3)} L${r1(xi + m * 2)},${r1(yi)} L${r1(xo - m * 2)},${r1(yo)}Z" fill="${lidFill}"/>`;
      s += `<path d="M${r1(xo)},${r1(yo)} L${r1(xi)},${r1(yi)}" stroke="${arc}" stroke-width="${r1(r * 0.3)}" stroke-linecap="round"/>`;
    }
    if (k === 'squint') {
      s += `<path d="M${r1(x - er - 2)},${r1(y + er + 3)} L${r1(x + er + 2)},${r1(y + er + 3)} L${r1(x + er + 2)},${r1(y + er * 0.25)} Q${x},${r1(y - er * 0.25)} ${r1(x - er - 2)},${r1(y + er * 0.25)}Z" fill="${lidFill}"/>`;
      s += `<path d="M${r1(x - er)},${r1(y + er * 0.25)} Q${x},${r1(y - er * 0.25)} ${r1(x + er)},${r1(y + er * 0.25)}" fill="none" stroke="${arc}" stroke-width="${r1(r * 0.24)}" stroke-linecap="round"/>`;
    }
    return s;
  };

  SB.brow = (x, y, w, ang, col) => `<path d="M${-w / 2},0 Q0,${r1(-w * 0.3)} ${w / 2},0" transform="translate(${x},${y}) rotate(${ang})" fill="none" stroke="${col}" stroke-width="${r1(w * 0.26)}" stroke-linecap="round"/>`;

  // ---------- mouths ----------
  SB.mouth = function (x, y, s, k, F) {
    const ink = F.mouthInk || INK, mo = '#5A1E15', tg = '#F08A7E';
    const sw = r1(Math.max(2.6, s * 0.26));
    const id = uid('m');
    const line = (d, w = sw) => `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const open = (d, tongueY, tongueR, teeth) => `<clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="${mo}"/>`
      + `<g clip-path="url(#${id})">${teeth ? `<rect x="${r1(x - s * 1.5)}" y="${r1(y - s)}" width="${r1(s * 3)}" height="${r1(s * 1.32)}" fill="#FFFDF6"/>` : ''}<ellipse cx="${x}" cy="${r1(tongueY)}" rx="${r1(tongueR)}" ry="${r1(tongueR * 0.75)}" fill="${tg}"/></g>`
      + `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${r1(sw * 0.7)}" stroke-linejoin="round"/>`;
    switch (k) {
      case 'smile': return line(`M${r1(x - s)},${y} Q${x},${r1(y + s * 0.85)} ${r1(x + s)},${y}`);
      case 'soft': return line(`M${r1(x - s * 0.7)},${y} Q${x},${r1(y + s * 0.5)} ${r1(x + s * 0.7)},${y}`);
      case 'grin': return open(`M${r1(x - s)},${r1(y - s * 0.1)} Q${x},${r1(y + s * 1.75)} ${r1(x + s)},${r1(y - s * 0.1)} Q${x},${r1(y + s * 0.22)} ${r1(x - s)},${r1(y - s * 0.1)}Z`, y + s * 1.15, s * 0.58);
      case 'laugh': return open(`M${r1(x - s * 1.2)},${r1(y - s * 0.2)} Q${x},${r1(y + s * 2.3)} ${r1(x + s * 1.2)},${r1(y - s * 0.2)} Q${x},${r1(y + s * 0.05)} ${r1(x - s * 1.2)},${r1(y - s * 0.2)}Z`, y + s * 1.55, s * 0.7, true);
      case 'o': return `<ellipse cx="${x}" cy="${r1(y + s * 0.45)}" rx="${r1(s * 0.5)}" ry="${r1(s * 0.66)}" fill="${mo}" stroke="${ink}" stroke-width="${r1(sw * 0.7)}"/><ellipse cx="${x}" cy="${r1(y + s * 0.78)}" rx="${r1(s * 0.28)}" ry="${r1(s * 0.2)}" fill="${tg}"/>`;
      case 'smallo': return `<ellipse cx="${x}" cy="${r1(y + s * 0.3)}" rx="${r1(s * 0.3)}" ry="${r1(s * 0.38)}" fill="${mo}" stroke="${ink}" stroke-width="${r1(sw * 0.6)}"/>`;
      case 'tongue': return `<path d="M${r1(x + s * 0.02)},${r1(y + s * 0.28)} C${x},${r1(y + s * 1.25)} ${r1(x + s * 0.78)},${r1(y + s * 1.2)} ${r1(x + s * 0.7)},${r1(y + s * 0.1)}Z" fill="${tg}" stroke="${ink}" stroke-width="${r1(sw * 0.6)}" stroke-linejoin="round"/>`
        + `<path d="M${r1(x + s * 0.37)},${r1(y + s * 0.36)} L${r1(x + s * 0.38)},${r1(y + s * 0.74)}" stroke="#C9675C" stroke-width="${r1(sw * 0.45)}" stroke-linecap="round"/>`
        + line(`M${r1(x - s)},${r1(y - s * 0.05)} Q${r1(x - s * 0.1)},${r1(y + s * 0.7)} ${r1(x + s * 0.95)},${r1(y - s * 0.3)}`);
      case 'wobble': return line(`M${r1(x - s * 0.9)},${r1(y + s * 0.3)} q${r1(s * 0.3)},${r1(-s * 0.35)} ${r1(s * 0.6)},0 t${r1(s * 0.6)},0 t${r1(s * 0.6)},0`);
      case 'flat': return line(`M${r1(x - s * 0.75)},${r1(y + s * 0.3)} Q${x},${r1(y + s * 0.05)} ${r1(x + s * 0.75)},${r1(y + s * 0.3)}`, sw * 1.1);
      case 'squiggle': return line(`M${r1(x - s * 0.85)},${r1(y + s * 0.2)} q${r1(s * 0.28)},${r1(-s * 0.3)} ${r1(s * 0.56)},0 t${r1(s * 0.56)},0 t${r1(s * 0.56)},${r1(-s * 0.1)}`);
      case 'cheeky': return open(`M${r1(x - s * 0.6)},${r1(y + s * 0.1)} Q${r1(x + s * 0.4)},${r1(y + s * 1.2)} ${r1(x + s * 1.1)},${r1(y - s * 0.35)} Q${r1(x + s * 0.3)},${r1(y + s * 0.3)} ${r1(x - s * 0.6)},${r1(y + s * 0.1)}Z`, y + s * 0.75, s * 0.38, true);
      case 'cat': return line(`M${r1(x - s * 0.8)},${y} q${r1(s * 0.4)},${r1(s * 0.55)} ${r1(s * 0.8)},0 q${r1(s * 0.4)},${r1(s * 0.55)} ${r1(s * 0.8)},0`);
      case 'sleepy': return `<ellipse cx="${x}" cy="${r1(y + s * 0.35)}" rx="${r1(s * 0.34)}" ry="${r1(s * 0.26)}" fill="${mo}" stroke="${ink}" stroke-width="${r1(sw * 0.6)}"/>`;
      default: return '';
    }
  };

  // ---------- effects (global coords) ----------
  SB.sparkle = (x, y, r, col = '#FFD34D') => `<path d="M${x},${y - r} Q${x + r * 0.15},${y - r * 0.15} ${x + r},${y} Q${x + r * 0.15},${y + r * 0.15} ${x},${y + r} Q${x - r * 0.15},${y + r * 0.15} ${x - r},${y} Q${x - r * 0.15},${y - r * 0.15} ${x},${y - r}Z" fill="${col}" stroke="#C98A12" stroke-width="1.4" stroke-linejoin="round"/>`;
  const CONF = [[30, 40, 20, '#FFCF3F'], [62, 16, -30, '#7BC47F'], [96, 28, 45, '#FF7A6B'], [152, 14, 10, '#6FB7F2'], [190, 32, -40, '#FFCF3F'], [214, 62, 30, '#B98BEA'], [20, 94, -15, '#6FB7F2'], [222, 112, 60, '#FF7A6B'], [38, 140, 10, '#B98BEA'], [176, 6, 0, '#FF7A6B'], [124, 6, 70, '#7BC47F'], [206, 160, -20, '#FFCF3F']];
  SB.confetti = () => CONF.map(([x, y, a, c], i) => i % 3 === 1
    ? `<circle cx="${x}" cy="${y}" r="4" fill="${c}" stroke="#00000026" stroke-width="1"/>`
    : `<rect x="${x - 6}" y="${y - 2.6}" width="12" height="5.2" rx="1.4" fill="${c}" stroke="#00000026" stroke-width="1" transform="rotate(${a} ${x} ${y})"/>`).join('')
    + `<path d="M70,62 q6,-9 12,0 t12,0" fill="none" stroke="#FF7A6B" stroke-width="3" stroke-linecap="round"/><path d="M166,66 q6,-9 12,0 t12,0" fill="none" stroke="#7BC47F" stroke-width="3" stroke-linecap="round"/>`;
  SB.hearts = (pts) => pts.map(([x, y, s, a]) => `<path d="${heartPath(0, 0, s)}" transform="translate(${x},${y}) rotate(${a})" fill="url(#sb-heart)" stroke="#9E2A2E" stroke-width="1.6"/>`).join('');
  SB.zzz = (x, y) => [[0, 0, 9], [14, -16, 12], [32, -36, 15]].map(([dx, dy, s]) => {
    const X = x + dx, Y = y + dy;
    return `<path d="M${X},${Y} h${s} l${-s},${s} h${s}" fill="none" stroke="#5B7FB8" stroke-width="${r1(s * 0.28)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join('');
  SB.drop = (x, y, s, a = 0) => `<path d="M0,${-s} C${s * 0.55},${-s * 0.2} ${s * 0.75},${s * 0.25} 0,${s * 0.75} C${-s * 0.75},${s * 0.25} ${-s * 0.55},${-s * 0.2} 0,${-s}Z" transform="translate(${x},${y}) rotate(${a})" fill="url(#sb-drop)" stroke="#3E8CC4" stroke-width="1.8"/><ellipse cx="${x - s * 0.18}" cy="${y + s * 0.1}" rx="${s * 0.14}" ry="${s * 0.22}" fill="#fff" opacity=".8"/>`;
  SB.question = (x, y, s = 15, col = '#3F6E4F') => `<g transform="rotate(12 ${x} ${y})"><path d="M${x - s * 0.5},${y - s * 0.55} C${x - s * 0.5},${y - s * 1.25} ${x + s * 0.62},${y - s * 1.25} ${x + s * 0.62},${y - s * 0.55} C${x + s * 0.62},${y - s * 0.05} ${x},${y - s * 0.02} ${x},${y + s * 0.38}" fill="none" stroke="${col}" stroke-width="${s * 0.28}" stroke-linecap="round"/><circle cx="${x}" cy="${y + s * 0.82}" r="${s * 0.17}" fill="${col}"/></g>`;
  SB.exclaim = (x, y, s = 16, col = '#E0562F') => `<g transform="rotate(-10 ${x} ${y})"><path d="M${x},${y - s} L${x},${y + s * 0.3}" stroke="${col}" stroke-width="${s * 0.32}" stroke-linecap="round"/><circle cx="${x}" cy="${y + s * 0.8}" r="${s * 0.18}" fill="${col}"/></g>`;
  SB.thought = (x, y) => `<g fill="#fff" stroke="#8A7A6A" stroke-width="2"><circle cx="${x}" cy="${y}" r="3.5"/><circle cx="${x + 9}" cy="${y - 12}" r="5"/><ellipse cx="${x + 26}" cy="${y - 32}" rx="17" ry="12"/></g><g fill="#8A7A6A"><circle cx="${x + 19}" cy="${y - 32}" r="2"/><circle cx="${x + 26}" cy="${y - 32}" r="2"/><circle cx="${x + 33}" cy="${y - 32}" r="2"/></g>`;
  SB.speed = (x, y) => `<g stroke="#8A7A6A" stroke-width="3" stroke-linecap="round" opacity=".6"><path d="M${x},${y} h-26"/><path d="M${x + 6},${y + 18} h-34"/><path d="M${x},${y + 36} h-22"/></g>`
    + `<g fill="#EADFCB" stroke="#B9A68A" stroke-width="1.6"><circle cx="${x + 6}" cy="236" r="7"/><circle cx="${x - 6}" cy="232" r="5"/><circle cx="${x - 16}" cy="237" r="4"/></g>`;
  SB.waveLines = ([x, y]) => `<g fill="none" stroke="${INK}" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"><path d="M${x + 15},${y - 16} Q${x + 23},${y - 4} ${x + 15},${y + 8}"/><path d="M${x - 15},${y - 16} Q${x - 23},${y - 4} ${x - 15},${y + 8}"/></g>`;
  SB.blushLines = (cx, cy) => [-6, 0, 6].map((d) => `<path d="M${cx + d - 3},${cy + 4} l5,-8" stroke="#D9534F" stroke-width="2" stroke-linecap="round" opacity=".8"/>`).join('');
  SB.tears = (x, y, m) => `<path d="M${x},${y} q${m * 6},10 ${m * 3},26 q${m * -2},8 ${m * 2},12" fill="none" stroke="#7CC4F0" stroke-width="3.6" stroke-linecap="round" opacity=".9"/>` + SB.drop(x + m * 5, y + 44, 5);

  // ---------- ground vignette ----------
  SB.ground = (cx, gy, w) => {
    const tuft = (x, y, s, f) => `<path d="M${x - 6 * s},${y} Q${x - 5 * s},${y - 9 * s} ${x - 8 * s},${y - 15 * s} Q${x - 1 * s},${y - 8 * s} ${x},${y} Q${x + 1 * s},${y - 13 * s} ${x + 4 * s},${y - 19 * s} Q${x + 5 * s},${y - 9 * s} ${x + 4 * s},${y} Q${x + 7 * s},${y - 7 * s} ${x + 12 * s},${y - 11 * s} Q${x + 9 * s},${y - 4 * s} ${x + 8 * s},${y}Z" fill="${f}" stroke="#3F6B32" stroke-width="1.5" stroke-linejoin="round"/>`;
    return `<ellipse cx="${cx}" cy="${gy + 3}" rx="${w}" ry="9" fill="#B9A27A" opacity=".22"/>`
      + tuft(cx - w + 6, gy + 4, 1, '#7DB05A') + tuft(cx + w - 18, gy + 5, 0.85, '#8FC06A')
      + `<ellipse cx="${cx - w + 28}" cy="${gy + 7}" rx="6" ry="3.6" fill="#C9BBA6" stroke="#8C7B66" stroke-width="1.4"/>`
      + `<g transform="translate(${cx + w - 34},${gy + 2})"><path d="M0,4 L0,-8" stroke="#3F6B32" stroke-width="1.6"/>${[0, 72, 144, 216, 288].map((a) => { const t = a * Math.PI / 180; return `<circle cx="${r1(Math.cos(t) * 3.4)}" cy="${r1(-10 + Math.sin(t) * 3.4)}" r="2.6" fill="#FFF3F6" stroke="#D98AA0" stroke-width="1"/>`; }).join('')}<circle cx="0" cy="-10" r="1.8" fill="#FFCF3F"/></g>`;
  };

  // ---------- views ----------
  // face: eyes [L,R], look, brows ('raise','worried','angry','mischief','up','uneven'), mouth, mouthScale, mouthDx, cheek
  SB.VIEWS = [
    { key: 'neutral', label: 'Neutral', group: 'face', eyes: ['open', 'open'], look: [0, 0.1], mouth: 'smile', pose: 'rest' },
    { key: 'happy', label: 'Happy', group: 'face', eyes: ['happy', 'happy'], mouth: 'grin', cheek: 1.3, pose: 'cheer', fx: ['sparkles'], lift: -6 },
    { key: 'laughing', label: 'Laughing', group: 'face', eyes: ['laugh', 'laugh'], mouth: 'laugh', cheek: 1.4, pose: 'belly', tilt: -4, fx: ['haha'] },
    { key: 'excited', label: 'Excited', group: 'face', eyes: ['star', 'star'], mouth: 'grin', mouthScale: 1.15, cheek: 1.3, brows: 'up', pose: 'cheer', fx: ['sparkles'], lift: -10 },
    { key: 'curious', label: 'Curious', group: 'face', eyes: ['open', 'open'], look: [0.6, -0.65], mouth: 'smallo', mouthDx: 0.35, brows: 'raise', pose: 'rest', fx: ['question'], tilt: 7 },
    { key: 'thinking', label: 'Thinking', group: 'face', eyes: ['open', 'open'], look: [-0.5, -0.7], mouth: 'flat', mouthScale: 0.8, mouthDx: -0.2, brows: 'uneven', pose: 'think', fx: ['thought'] },
    { key: 'surprised', label: 'Surprised', group: 'face', eyes: ['surprised', 'surprised'], mouth: 'o', brows: 'up', pose: 'cheer', fx: ['exclaim'], lift: -4 },
    { key: 'silly', label: 'Silly', group: 'face', eyes: ['happy', 'open'], look: [-0.35, 0], mouth: 'tongue', brows: 'mischief', pose: 'rest', tilt: -7 },
    { key: 'wink', label: 'Wink', group: 'face', eyes: ['happy', 'big'], mouth: 'grin', mouthScale: 0.85, pose: 'rest', fx: ['winkspark'], tilt: -3 },
    { key: 'love', label: 'In love', group: 'face', eyes: ['heart', 'heart'], mouth: 'grin', mouthScale: 0.8, cheek: 1.45, pose: 'heart', fx: ['hearts'] },
    { key: 'shy', label: 'Shy', group: 'face', eyes: ['open', 'open'], look: [-0.5, 0.55], mouth: 'cat', mouthScale: 0.7, cheek: 1.5, brows: 'worried', pose: 'shy', fx: ['blushlines'], tilt: 4 },
    { key: 'sleepy', label: 'Sleepy', group: 'face', eyes: ['closed', 'closed'], mouth: 'sleepy', cheek: 1.1, pose: 'rest', fx: ['zzz'], tilt: 6, droop: true },
    { key: 'oops', label: 'Oops', group: 'face', eyes: ['open', 'open'], look: [-0.3, 0.2], mouth: 'wobble', brows: 'worried', pose: 'scratch', fx: ['sweat'] },
    { key: 'determined', label: 'Determined', group: 'face', eyes: ['lid', 'lid'], look: [0, 0.1], mouth: 'flat', brows: 'angry', pose: 'fists', fx: ['power'] },
    { key: 'confused', label: 'Confused', group: 'face', eyes: ['squint', 'open'], look: [0.2, -0.2], mouth: 'squiggle', brows: 'uneven', pose: 'shrug', fx: ['question2'], tilt: -5 },
    { key: 'cheeky', label: 'Cheeky', group: 'face', eyes: ['squint', 'squint'], look: [0.45, 0], mouth: 'cheeky', brows: 'mischief', pose: 'rest', fx: ['winkspark'], tilt: -5 },
    { key: 'tears', label: 'Happy tears', group: 'face', eyes: ['happy', 'happy'], mouth: 'grin', cheek: 1.35, brows: 'worried', pose: 'heart', heartless: true, fx: ['tears', 'sparkles'] },
    { key: 'wave', label: 'Waving', group: 'pose', eyes: ['open', 'open'], look: [0.15, 0], mouth: 'grin', mouthScale: 0.85, pose: 'wave', fx: ['wavelines'] },
    { key: 'celebrate', label: 'Celebrating', group: 'pose', eyes: ['happy', 'happy'], mouth: 'laugh', mouthScale: 0.85, cheek: 1.3, pose: 'up', fx: ['confetti'], lift: -10 },
    { key: 'thumbs', label: 'Thumbs up', group: 'pose', eyes: ['happy', 'big'], mouth: 'grin', mouthScale: 0.9, pose: 'thumbs', fx: ['thumbspark'], tilt: -3 },
    { key: 'point', label: 'Pointing', group: 'pose', eyes: ['open', 'open'], look: [0.8, 0], mouth: 'grin', mouthScale: 0.8, brows: 'raise', pose: 'point', tilt: 3 },
    { key: 'hold', label: 'Holding prop', group: 'pose', eyes: ['open', 'open'], look: [0, 0.4], mouth: 'grin', mouthScale: 0.8, pose: 'hold' },
    { key: 'highfive', label: 'High five', group: 'pose', eyes: ['big', 'big'], mouth: 'grin', cheek: 1.2, brows: 'up', pose: 'highfive', fx: ['fivespark'], lift: -4 },
    { key: 'run', label: 'Running', group: 'pose', eyes: ['open', 'open'], look: [0.7, 0], mouth: 'grin', mouthScale: 0.85, brows: 'angry', pose: 'run', fx: ['speed'], tilt: 9, run: true },
    { key: 'sit', label: 'Sitting', group: 'pose', eyes: ['open', 'open'], look: [0, 0.1], mouth: 'smile', pose: 'sit', sit: true },
    { key: 'peek', label: 'Peeking', group: 'pose', eyes: ['open', 'open'], look: [-0.7, 0], mouth: 'smallo', mouthScale: 0.8, brows: 'raise', pose: 'peek', peek: true },
  ];
  SB.BROWS = {
    raise: [[0, -4], [-9, -14]], up: [[-7, 0], [-7, 0]], worried: [[-2, -14], [-2, 14]], angry: [[3, 16], [3, -16]],
    mischief: [[3, 16], [-6, -8]], uneven: [[-8, -10], [2, 8]],
  };

  // ---------- assembly ----------
  SB.render = function (C, view, o = {}) {
    const V = typeof view === 'string' ? SB.VIEWS.find((v) => v.key === view) : view;
    const A = C.arms[V.pose] || C.arms.rest;
    const ctx = { V, C, A, o };
    const F = C.face;
    let s = '';
    const gx = C.ground ? C.ground[0] : 120, gw = C.ground ? C.ground[1] : 70;
    if (o.ground !== false && !o.simple) s += SB.ground(gx, 238, V.sit ? gw + 14 : gw);
    // character group
    let inner = '';
    if (C.back) inner += C.back(ctx);
    ['L', 'R'].forEach((side) => { const a = A[side]; if (a && !a.front) inner += SB.limb(a.p, C.arm.w, C.arm.col, C.arm.line, C.arm.lw); });
    if (C.feet && !V.sit) inner += C.feet(ctx);
    inner += C.body(ctx);
    // face
    let f = '';
    const look = V.look || [0, 0];
    const ck = V.cheek || 1;
    if (F.cheekX) F.cheekX.forEach((cx) => { f += `<ellipse cx="${cx}" cy="${F.cheekY}" rx="${r1(F.cheekR[0] * ck)}" ry="${r1(F.cheekR[1] * ck)}" fill="url(#sb-${C.key}-k)"/>`; });
    if (C.eyes) f += C.eyes(ctx); else V.eyes.forEach((k, i) => { f += SB.eye(F.ex[i], F.ey, F.er, k, look, F, i); });
    const B = SB.BROWS[V.brows];
    if (B && F.browY != null) B.forEach(([dy, a], i) => { f += SB.brow(F.bx ? F.bx[i] : F.ex[i], F.browY + dy, F.browW, a, F.browCol); });
    if (F.extra) f += typeof F.extra === 'function' ? F.extra(ctx) : F.extra;
    f += SB.mouth(r1(F.mx + (V.mouthDx || 0) * F.ms), F.my, r1(F.ms * (V.mouthScale || 1)), V.mouth, F);
    if ((V.fx || []).includes('tears') && F.ex) [0, 1].forEach((i) => { f += SB.tears(F.ex[i] + (i ? 1 : -1) * F.er * 0.8, F.ey + F.er * 0.4, i ? 1 : -1); });
    if ((V.fx || []).includes('blushlines') && F.cheekX) F.cheekX.forEach((cx) => { f += SB.blushLines(cx, F.cheekY); });
    inner += f;
    if (C.front) inner += C.front(ctx);
    if (V.sit && C.feet) inner += C.feet(ctx);
    if (V.pose === 'hold' && C.prop) inner += C.prop(C.holdAt[0], C.holdAt[1], ctx, 1.25, 'C');
    else if (!o.simple && C.prop && C.propHand && C.propHand[V.key] && A[C.propHand[V.key]]) { const a = A[C.propHand[V.key]]; inner += C.prop(a.p[2][0], a.p[2][1], ctx, 1, C.propHand[V.key]); }
    // back-arm hands
    ['L', 'R'].forEach((side) => { const a = A[side]; if (a && !a.front) inner += (a.hand && a.hand !== 'palmup') ? SB.hand(a.hand, a.p, side, C.arm) : (C.arm.tip ? C.arm.tip(a.p, side) : ''); });
    if (V.pose === 'heart' && !V.heartless) inner += `<path d="${heartPath(C.heart[0], C.heart[1], C.heart[2])}" fill="url(#sb-heart)" stroke="#9E2A2E" stroke-width="2.2"/>` + SB.gloss(C.heart[0] - C.heart[2] * 0.45, C.heart[1] - C.heart[2] * 0.4, C.heart[2] * 0.22, C.heart[2] * 0.13, -35, 0.7);
    ['L', 'R'].forEach((side) => { const a = A[side]; if (a && a.front) inner += SB.limb(a.p, C.arm.w, C.arm.col, C.arm.line, C.arm.lw) + ((a.hand && a.hand !== 'palmup') ? SB.hand(a.hand, a.p, side, C.arm) : (C.arm.tip ? C.arm.tip(a.p, side) : '')); });
    if (C.over) inner += C.over(ctx);
    // transforms
    const lift = V.lift || 0, tilt = V.tilt || 0, cxp = C.cx || 120;
    let tf = `translate(0,${lift + (V.sit ? 12 : 0)}) rotate(${tilt} ${cxp} 238)`;
    if (V.droop) tf += ` translate(0,3) scale(1,0.985)`;
    if (V.peek) tf = `translate(${C.peekDx || 34},4) rotate(-10 ${cxp} 238)`;
    const shRx = (C.shadow || 64) * (1 + lift / 60) * (V.sit ? 1.15 : 1);
    s += `<ellipse cx="${gx}" cy="241" rx="${r1(shRx)}" ry="${r1(7 * (1 + lift / 80))}" fill="#2E1B12" opacity="${lift ? 0.12 : 0.18}"/>`;
    s += `<g transform="${tf}">${inner}</g>`;
    if (V.peek) s += SB.fence();
    // global effects
    const X = C.fx || {};
    (V.fx || []).forEach((e) => {
      if (e === 'sparkles') (X.spark || [[34, 96, 8], [206, 82, 10], [216, 150, 7]]).forEach(([x, y, r]) => { s += SB.sparkle(x, y, r); });
      if (e === 'winkspark') s += SB.sparkle(X.wink ? X.wink[0] : 196, X.wink ? X.wink[1] : 110, 9);
      if (e === 'thumbspark') { const p = A.R.p[2]; s += SB.sparkle(p[0] + 18, p[1] - 22, 9) + SB.sparkle(p[0] - 10, p[1] - 34, 6); }
      if (e === 'fivespark') { const p = A.R.p[2]; s += SB.sparkle(p[0] + 20, p[1] - 4, 8) + SB.sparkle(p[0] - 16, p[1] - 14, 6); }
      if (e === 'question') s += SB.question(X.q ? X.q[0] : 200, X.q ? X.q[1] : 92);
      if (e === 'question2') s += SB.question(X.q ? X.q[0] : 200, X.q ? X.q[1] : 92, 14, '#7A5BB0') + SB.question((X.q ? X.q[0] : 200) - 22, (X.q ? X.q[1] : 92) + 14, 10, '#7A5BB0');
      if (e === 'exclaim') s += SB.exclaim(X.q ? X.q[0] : 200, X.q ? X.q[1] : 92);
      if (e === 'thought') s += SB.thought(Math.min(X.thought ? X.thought[0] : 170, 190), Math.max(X.thought ? X.thought[1] : 82, 62));
      if (e === 'confetti') s += SB.confetti();
      if (e === 'hearts') s += SB.hearts([[36, 92, 9, -14], [204, 78, 11, 12], [214, 132, 7, 20]]);
      if (e === 'zzz') s += SB.zzz(X.zzz ? X.zzz[0] : 172, X.zzz ? X.zzz[1] : 96);
      if (e === 'sweat') s += SB.drop(X.sweat ? X.sweat[0] : 64, X.sweat ? X.sweat[1] : 112, 9, -20);
      if (e === 'wavelines' && A.R) s += SB.waveLines(A.R.p[2]);
      if (e === 'speed') s += SB.speed(gx - 52, 150);
      if (e === 'haha') s += `<g fill="none" stroke="${INK}" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"><path d="M28,110 l12,4 M24,130 l14,0 M28,150 l12,-4 M212,110 l-12,4 M216,130 l-14,0 M212,150 l-12,-4"/></g>`;
      if (e === 'power') s += `<g stroke="#E0562F" stroke-width="3" stroke-linecap="round" opacity=".75"><path d="M40,70 l10,10 M30,96 l13,3 M200,70 l-10,10 M210,96 l-13,3"/></g>`;
    });
    return s;
  };
  SB.fence = () => {
    const d = 'M30,40 L62,26 L96,40 L96,250 L30,250Z';
    return `<path d="${d}" fill="#C79A63" stroke="#6E4A2A" stroke-width="3.2" stroke-linejoin="round"/>`
      + `<path d="M44,60 Q50,120 42,180 M74,52 Q80,130 72,230 M58,90 q4,10 0,20" fill="none" stroke="#9C7243" stroke-width="2" stroke-linecap="round" opacity=".8"/>`
      + `<path d="M30,40 L62,26 L96,40" fill="none" stroke="#E2BE8A" stroke-width="2.5" opacity=".8" transform="translate(0,4)"/>`
      + `<circle cx="63" cy="70" r="3" fill="#6E5A4A"/><circle cx="63" cy="200" r="3" fill="#6E5A4A"/>`
      + `<path d="M24,252 Q34,232 40,250 Q46,228 54,250 Q62,236 70,250 Q80,226 88,250 Q96,234 104,252Z" fill="#7DB05A" stroke="#3F6B32" stroke-width="1.5" stroke-linejoin="round"/>`;
  };

  SB.svg = function (C, view, o = {}) {
    const body = SB.render(C, view, o);
    const label = o.label != null ? o.label : `${C.name}, ${typeof view === 'string' ? view : view.key}`;
    const defs = o.standalone ? `<defs>${SB.baseDefs()}${C.defs()}</defs>` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 260"${label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"'}${o.cls ? ` class="${o.cls}"` : ''}>${defs}${body}</svg>`;
  };
  SB.icon = function (C, bg = 0, o = {}) {
    const c = C.icon, id = uid('i');
    const body = SB.render(C, 'neutral', { ground: false, simple: true });
    const defs = o.standalone ? `${SB.baseDefs()}${C.defs()}` : '';
    const label = o.label != null ? o.label : `${C.name} app icon`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"${label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"'}><defs>${defs}`
      + SB.radial(id + 'g', [[0, '#fff', 0.28], [1, '#fff', 0]], 0.3, 0.2, 0.8) + `<clipPath id="${id}c"><rect width="240" height="240" rx="54"/></clipPath></defs>`
      + `<g clip-path="url(#${id}c)"><rect width="240" height="240" fill="${c.bgs[bg]}"/><rect width="240" height="240" fill="url(#${id}g)"/>`
      + `<circle cx="196" cy="40" r="5" fill="#fff" opacity=".35"/><circle cx="36" cy="200" r="4" fill="#fff" opacity=".25"/>`
      + `<g transform="translate(120,${c.ty}) scale(${c.s}) translate(${-c.cx},${-c.cy})">${body}</g></g></svg>`;
  };
  SB.C = {};
})(SB);
