// Vector redraw of the MudKitchen bowl (public/images/Logo.png), for print-size stickers.
// The viewBox is the same 308×312 box BowlLogo crops Logo.png to, so mark-kit's BOWL anchor points
// (spoon tip, rims, face) and BowlFace overlays line up on it unchanged.

export const BOWL_VB = { w: 308, h: 312 } as const;

const C = {
  bodyDark: "#A24C2A",
  body: "#BF6238",
  bodyLight: "#CB6E42",
  rim: "#C96F42",
  rimLight: "#D9844F",
  innerWall: "#A8512D",
  foot: "#A64D2A",
  footDark: "#8C3F22",
  cream: "#F1E8D3",
  creamShade: "#E3D6BA",
  creamDeep: "#D6C6A6",
  spoon: "#C2683D",
  spoonLight: "#D27C4C",
  spoonDark: "#9E4E2A",
  stem: "#8F9A56",
  stemDark: "#6F7C40",
  leaf: "#4E6236",
  leafLight: "#6A8148",
  vein: "#8FA56C",
} as const;

// ------------------------------------------------------------ shapes (shared by colour and mono versions)

/** Outer rim ellipse (top of the bowl). */
const RIM = { cx: 154, cy: 137, rx: 151, ry: 36 };
/** The opening, inside the rim band. */
const OPENING = { cx: 154, cy: 139, rx: 138, ry: 28 };
/** Cream surface, a little below the opening. */
const CREAM = { cx: 154, cy: 142, rx: 134, ry: 24 };

const BODY = "M3,137 C4,238 72,287 154,288 C236,287 304,238 305,137 C305,158 238,173 154,173 C70,173 3,158 3,137 Z";
const FOOT = "M80,262 L80,290 C82,301 112,310 154,310 C196,310 226,301 228,290 L228,262 Z";

/** Spoon: a rounded stick from the cream (bottom) to the tip (top right). */
const SPOON = { x: 177, y: 156, angle: 36, len: 170, w: 23 };

type Leaf = { x: number; y: number; len: number; w: number; angle: number };
/** Leaves start at (x, y) on the stem and point `angle` degrees clockwise from straight up. */
const LEAVES: Leaf[] = [
  { x: 108, y: 44, len: 58, w: 26, angle: -56 },
  { x: 110, y: 44, len: 46, w: 18, angle: 4 },
  { x: 113, y: 64, len: 52, w: 23, angle: -76 },
  { x: 129, y: 82, len: 52, w: 27, angle: 14 },
  { x: 124, y: 82, len: 34, w: 16, angle: -96 },
  { x: 148, y: 130, len: 28, w: 13, angle: 58 },
];
const STEM = "M152,148 C150,128 140,104 128,84 C120,70 112,56 109,40";

const ellipse = (e: { cx: number; cy: number; rx: number; ry: number }, attrs: string) =>
  `<ellipse cx="${e.cx}" cy="${e.cy}" rx="${e.rx}" ry="${e.ry}" ${attrs}/>`;

function leafPath({ x, y, len, w, angle }: Leaf) {
  const h = w / 2;
  return `<path transform="translate(${x} ${y}) rotate(${angle})" d="M0,0 C${-h * 1.3},${-len * 0.3} ${-h},${-len * 0.8} 0,${-len} C${h},${-len * 0.8} ${h * 1.3},${-len * 0.3} 0,0 Z"`;
}

function spoonGroup(body: string) {
  return `<g transform="translate(${SPOON.x} ${SPOON.y}) rotate(${SPOON.angle})">${body}</g>`;
}

const spoonRect = (fill: string) => {
  const { len, w } = SPOON;
  const r = w / 2;
  return `<path d="M${-r},0 L${-r},${-len + r} A${r},${r} 0 0 1 ${r},${-len + r} L${r},0 Z" fill="${fill}"/>`;
};

// ------------------------------------------------------------ full colour

function colourSvg() {
  const { len, w } = SPOON;
  const r = w / 2;
  const defs = `<defs>
<linearGradient id="bv-body" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.bodyDark}"/><stop offset=".22" stop-color="${C.body}"/><stop offset=".55" stop-color="${C.bodyLight}"/><stop offset=".85" stop-color="${C.body}"/><stop offset="1" stop-color="${C.bodyDark}"/></linearGradient>
<linearGradient id="bv-body-v" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#4A1E0C" stop-opacity=".22"/></linearGradient>
<linearGradient id="bv-cream" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.creamShade}"/><stop offset=".45" stop-color="${C.cream}"/><stop offset="1" stop-color="${C.cream}"/></linearGradient>
<linearGradient id="bv-leaf" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.leaf}"/><stop offset=".5" stop-color="${C.leafLight}"/><stop offset="1" stop-color="${C.leaf}"/></linearGradient>
<clipPath id="bv-open">${ellipse(OPENING, "")}</clipPath>
<clipPath id="bv-body-clip"><path d="${BODY}"/></clipPath>
</defs>`;

  const sprout =
    `<path d="${STEM}" fill="none" stroke="${C.stemDark}" stroke-width="10" stroke-linecap="round"/>`
    + `<path d="${STEM}" fill="none" stroke="${C.stem}" stroke-width="7" stroke-linecap="round"/>`
    + LEAVES.map((leaf) => `${leafPath(leaf)} fill="url(#bv-leaf)" stroke="${C.leaf}" stroke-width="1.5"/>`
      + `<path transform="translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle})" d="M0,${-2} L0,${-Math.round(leaf.len * 0.82)}" stroke="${C.vein}" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`).join("");

  const spoon = spoonGroup(
    spoonRect(C.spoon)
      + `<path d="M${-r},0 L${-r},${-len + r} A${r},${r} 0 0 1 ${-r + 4},${-len + 3} L${-r + 6},${-len + r + 4} L${-r + 6},0 Z" fill="${C.spoonLight}"/>`
      + `<path d="M${r - 5},0 L${r - 5},${-len + r} A${r},${r} 0 0 0 ${r - 1},${-len + r + 2} L${r},${-len + r} L${r},0 Z" fill="${C.spoonDark}" opacity=".8"/>`
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOWL_VB.w} ${BOWL_VB.h}">${defs}`
    // foot under the body
    + `<path d="${FOOT}" fill="${C.foot}"/>`
    + ``
    // rim back band + inner wall
    + ellipse(RIM, `fill="${C.rim}"`)
    + ellipse(OPENING, `fill="${C.innerWall}"`)
    // cream inside the opening
    + `<g clip-path="url(#bv-open)">`
    + ellipse(CREAM, `fill="url(#bv-cream)"`)
    + `<path d="M58,146 C86,136 120,150 150,144 C178,138 214,150 246,144" fill="none" stroke="${C.creamShade}" stroke-width="5" stroke-linecap="round" opacity=".8"/>`
    + `<path d="M90,156 C116,150 136,160 160,156" fill="none" stroke="${C.creamShade}" stroke-width="4" stroke-linecap="round" opacity=".7"/>`
    + `<ellipse cx="166" cy="157" rx="20" ry="5" fill="${C.creamDeep}" opacity=".8"/>`
    + `<ellipse cx="150" cy="149" rx="11" ry="4" fill="${C.creamDeep}" opacity=".8"/>`
    + `</g>`
    // sprout and spoon stand in the cream, in front of the back rim
    + sprout
    + spoon
    + `<ellipse cx="${SPOON.x - 2}" cy="${SPOON.y - 1}" rx="15" ry="4" fill="${C.creamShade}"/><path d="M${SPOON.x - 18},${SPOON.y - 1} C${SPOON.x - 8},${SPOON.y + 4} ${SPOON.x + 6},${SPOON.y + 4} ${SPOON.x + 15},${SPOON.y - 1}" fill="none" stroke="${C.creamDeep}" stroke-width="2" opacity=".8"/>`
    // body (front of the bowl) with a lighter front lip
    + `<path d="${BODY}" fill="url(#bv-body)"/>`
    + `<path d="${BODY}" fill="url(#bv-body-v)"/>`
    + `<g clip-path="url(#bv-body-clip)"><path d="M3,137 C3,158 70,173 154,173 C238,173 305,158 305,137 C305,166 238,183 154,183 C70,183 3,166 3,137 Z" fill="${C.rimLight}" opacity=".85"/></g>`
    + `<path d="M3,137 C3,158 70,173 154,173 C238,173 305,158 305,137" fill="none" stroke="${C.rimLight}" stroke-width="2"/>`
    + `<path d="M28,190 C40,226 66,254 98,268" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".08"/>`
    + `</svg>`;
}

export const BOWL_VECTOR = colourSvg();

// ------------------------------------------------------------ one colour (vinyl / one-ink stickers)

/** Flat one-colour bowl. Details (opening, spoon edge, leaf veins) are cut out so it still reads. */
export function bowlVectorMono(color: string) {
  const mask = `<mask id="bv-mono"><rect width="${BOWL_VB.w}" height="${BOWL_VB.h}" fill="#fff"/>`
    + ellipse({ ...OPENING, rx: OPENING.rx - 4, ry: OPENING.ry - 4 }, `fill="#000"`)
    + `<path d="M3,137 C3,158 70,173 154,173 C238,173 305,158 305,137" fill="none" stroke="#000" stroke-width="5"/>`
    + `<path d="M80,286 C110,294 198,294 228,286" fill="none" stroke="#000" stroke-width="4"/>`
    + `</mask>`;
  const keep = `<g fill="${color}">`
    + `<path d="${STEM}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round"/>`
    + LEAVES.map((leaf) => `${leafPath(leaf)}/>`).join("")
    + spoonGroup(spoonRect(color))
    + `</g>`;
  const veins = LEAVES.map((leaf) => `<path transform="translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle})" d="M0,${-6} L0,${-Math.round(leaf.len * 0.72)}" stroke="#000" stroke-width="2.6" stroke-linecap="round"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOWL_VB.w} ${BOWL_VB.h}"><defs>${mask}<mask id="bv-veins"><rect width="${BOWL_VB.w}" height="${BOWL_VB.h}" fill="#fff"/>${veins}</mask></defs>`
    + `<g mask="url(#bv-mono)" fill="${color}"><path d="${FOOT}"/>${ellipse(RIM, "")}<path d="${BODY}"/></g>`
    + `<g mask="url(#bv-veins)">${keep}</g>`
    // the spoon and sprout stand inside the (cut-out) opening
    + `</svg>`;
}
