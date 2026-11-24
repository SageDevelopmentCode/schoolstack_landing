// Every piece of footage the "Dream" ad needs. One entry per clip file:
// public/footage/dream/<id>.mp4 (made by `npm run conform:dream` from footage-source/dream/).
// A missing clip renders as a labelled slate, so the edit plays as an animatic until
// footage arrives. DREAM_SHOTLIST.md is generated from this file (`npm run shotlist:dream`).

export type ShotSource = "stock" | "ai" | "stock-or-ai";

export type ShotSpec = {
  id: string;
  act: "hook" | "dream" | "breath" | "proof";
  // What the frame must show, in one line.
  what: string;
  // Where to look first, and the search terms to try.
  source: ShotSource;
  search: string[];
  // Prompt for Veo / Kling / Runway when stock has nothing usable.
  ai?: string;
  // Point of interest (0-1 of the source frame) kept in the 9:16 crop.
  focus?: { x: number; y: number };
  // Slow push: zoom over "cover" at the first and last frame of the shot.
  zoom?: [number, number];
  // Playback speed (0.5 = half speed; needs a 50/60fps source to stay smooth).
  rate?: number;
  // Light leak burned in from one edge.
  leak?: boolean;
};

// Shared look for the AI prompts so every generated clip matches the stock.
const LOOK =
  "Shot on 35mm film, natural window light, warm muted colors, shallow depth of field, gentle handheld movement, observational documentary feel, no text, no logos.";

export const SHOTS: ShotSpec[] = [
  // ── Hook: the pain (no music) ────────────────────────────────────────────
  {
    id: "h-clock",
    act: "hook",
    what: "Kitchen at night: phone buzzing face-up on a table next to a cold mug; oven or microwave clock reads 11:47 in the background.",
    source: "ai",
    search: ["phone vibrating table night", "kitchen night microwave clock", "late night phone notification table"],
    ai: `Close-up of a smartphone face up on a wooden kitchen table at night, vibrating with incoming messages, screen glow lighting a cold half-finished mug of tea, a blurred microwave clock glowing green in the background. ${LOOK}`,
    focus: { x: 0.5, y: 0.55 },
    zoom: [1.04, 1.1],
  },
  {
    id: "h-laptop",
    act: "hook",
    what: "Tired founder at the kitchen table, lit only by a laptop, papers and forms spread around. Side-lit or from behind, face soft.",
    source: "stock-or-ai",
    search: ["woman working laptop late night tired", "laptop glow face dark kitchen", "stressed paperwork night table"],
    ai: `A tired woman in her late 30s sits at a kitchen table late at night, lit only by the cool glow of a laptop, stacks of paper forms and an open binder around her, she rubs her eyes, seen from the side, face partly in shadow. ${LOOK}`,
    focus: { x: 0.42, y: 0.45 },
    zoom: [1.0, 1.08],
  },

  // ── Act 1: the dream, as questions ───────────────────────────────────────
  {
    id: "d-pickup-phone",
    act: "dream",
    what: "A parent at school pickup glances at their phone and smiles.",
    source: "stock",
    search: ["parent school pickup phone smiling", "mother phone school gate smile"],
    ai: `A mother waiting at an elementary school gate in afternoon sun glances at her phone and smiles, children blurred in the background. ${LOOK}`,
    focus: { x: 0.5, y: 0.4 },
    zoom: [1.0, 1.05],
  },
  {
    id: "d-family-arrive",
    act: "dream",
    what: "A family walks hand in hand toward a small school building in the morning.",
    source: "stock",
    search: ["family walking child school morning holding hands", "parent child walking to school from behind"],
    focus: { x: 0.5, y: 0.5 },
    zoom: [1.02, 1.08],
  },
  {
    id: "d-pay-tap",
    act: "dream",
    what: "Macro of a thumb tapping a phone screen once (screen out of focus, no readable UI).",
    source: "stock-or-ai",
    search: ["thumb tapping phone screen close up", "finger tap smartphone macro shallow depth"],
    ai: `Extreme close-up of a thumb tapping a glowing smartphone screen once, screen content out of focus, warm morning light. ${LOOK}`,
    focus: { x: 0.5, y: 0.5 },
    zoom: [1.1, 1.18],
  },
  {
    id: "d-coffee-desk",
    act: "dream",
    what: "A tidy desk in morning sun, steam rising from a coffee cup, a closed laptop. Calm.",
    source: "stock",
    search: ["coffee steam morning sunlight desk", "calm tidy desk morning light coffee"],
    focus: { x: 0.5, y: 0.5 },
    zoom: [1.0, 1.06],
  },
  {
    id: "d-empty-chairs",
    act: "dream",
    what: "Empty small classroom in early morning light: little chairs, wooden tables. Locked-off.",
    source: "stock-or-ai",
    search: ["empty classroom morning light", "empty kindergarten classroom sunlight chairs"],
    ai: `Locked-off wide shot of an empty small independent school classroom in early morning light, child-sized wooden chairs and tables, plants and children's art on the walls, dust in the sunbeams. ${LOOK}`,
    focus: { x: 0.5, y: 0.55 },
    zoom: [1.0, 1.04],
  },
  {
    id: "d-full-room",
    act: "dream",
    what: "The same kind of room, now full of kids working and talking. Match the framing of d-empty-chairs.",
    source: "stock-or-ai",
    search: ["busy classroom children working tables", "montessori classroom kids busy natural light"],
    ai: `Locked-off wide shot of a small independent school classroom full of children aged 6 to 10 working at wooden tables, talking and laughing, a teacher crouched beside one table, morning light. ${LOOK}`,
    focus: { x: 0.55, y: 0.5 },
    zoom: [1.0, 1.04],
  },
  {
    id: "d-carline",
    act: "dream",
    what: "A parent in the car line reads a message on their phone and relaxes.",
    source: "stock",
    search: ["mom in car reading phone smiling", "parent car school pickup line phone"],
    focus: { x: 0.5, y: 0.45 },
    zoom: [1.0, 1.06],
  },
  {
    id: "d-pickup-hug",
    act: "dream",
    what: "A child runs into a parent's arms at pickup.",
    source: "stock",
    search: ["child running hug parent school pickup", "kid hugs mom after school slow motion"],
    focus: { x: 0.5, y: 0.5 },
    rate: 0.6,
  },
  {
    id: "d-parent-smile",
    act: "dream",
    what: "Close on a parent's relieved, easy smile.",
    source: "stock",
    search: ["mother relieved smile close up natural light", "parent smiling candid close up"],
    focus: { x: 0.5, y: 0.4 },
    zoom: [1.06, 1.12],
  },
  {
    id: "d-kneel",
    act: "dream",
    what: "A teacher kneels at eye level with a child, both looking at a drawing.",
    source: "stock",
    search: ["teacher kneeling child eye level classroom", "teacher helping kid drawing table"],
    focus: { x: 0.6, y: 0.45 },
    zoom: [1.0, 1.05],
  },
  {
    id: "d-kid-laugh",
    act: "dream",
    what: "A child laughing, soft focus, backlit.",
    source: "stock",
    search: ["child laughing backlit golden hour", "kid laughing candid soft focus"],
    focus: { x: 0.5, y: 0.4 },
    zoom: [1.05, 1.1],
  },
  {
    id: "d-cubbies",
    act: "dream",
    what: "Row of cubbies or coat hooks with children's handwritten name labels.",
    source: "stock-or-ai",
    search: ["classroom cubbies name labels", "coat hooks children names classroom"],
    ai: `Slow dolly along a row of wooden classroom cubbies with small coats and backpacks, each with a hand-lettered name card, morning light. ${LOOK}`,
    focus: { x: 0.5, y: 0.5 },
    zoom: [1.0, 1.08],
  },
  {
    id: "d-paper-fly",
    act: "dream",
    what: "A stack of paper forms blows off a table / scatters through the air.",
    source: "stock",
    search: ["papers flying in the air slow motion", "stack of paper blown off desk"],
    focus: { x: 0.5, y: 0.5 },
    rate: 0.7,
  },
  {
    id: "d-run-field",
    act: "dream",
    what: "Kids running out into a field or garden, from behind, golden light.",
    source: "stock",
    search: ["children running outside field from behind", "kids run into garden golden hour"],
    focus: { x: 0.5, y: 0.5 },
    leak: true,
  },
  {
    id: "d-mud-kitchen",
    act: "dream",
    what: "Hero shot: kids' hands in a mud kitchen (pots, spoons, mud splashing), slow motion. The brand payoff.",
    source: "stock-or-ai",
    search: ["mud kitchen children play", "kids playing with mud slow motion hands", "children mud pie outdoor play"],
    ai: `Slow-motion close-up of children's hands stirring mud in an old pot in an outdoor wooden mud kitchen, mud splashing, spoons and tin cups, dappled afternoon sun through leaves. ${LOOK}`,
    focus: { x: 0.5, y: 0.55 },
    zoom: [1.0, 1.12],
    rate: 0.5,
    leak: true,
  },

  // ── Breath ───────────────────────────────────────────────────────────────
  {
    id: "b-schoolhouse",
    act: "breath",
    what: "Slow drone push over a small schoolhouse and field at golden hour.",
    source: "stock-or-ai",
    search: ["drone small school building countryside golden hour", "aerial small schoolhouse field sunset"],
    ai: `Slow aerial drone push toward a small single-story wooden schoolhouse beside a meadow and vegetable garden at golden hour, long shadows, a few children playing outside. ${LOOK}`,
    focus: { x: 0.5, y: 0.5 },
    zoom: [1.0, 1.1],
  },

  // ── Act 2: proof textures (abstract, labelled with mono tags) ─────────────
  {
    id: "p-chalk",
    act: "proof",
    what: "Macro: chalk dust bursting, slow motion.",
    source: "stock",
    search: ["chalk dust explosion slow motion macro", "chalk powder burst black background"],
    focus: { x: 0.5, y: 0.5 },
  },
  {
    id: "p-watercolor",
    act: "proof",
    what: "Macro: watercolor blooming into wet paper.",
    source: "stock-or-ai",
    search: ["watercolor bleeding wet paper macro", "ink drop paper spreading macro"],
    ai: `Extreme macro of a drop of green and ochre watercolor blooming into wet textured paper, slow organic spread. ${LOOK}`,
    focus: { x: 0.5, y: 0.5 },
  },
  {
    id: "p-sprout",
    act: "proof",
    what: "Time-lapse: a seed sprouting from soil.",
    source: "stock",
    search: ["seed sprouting time lapse soil", "plant growing timelapse macro"],
    focus: { x: 0.5, y: 0.6 },
  },
  {
    id: "p-shavings",
    act: "proof",
    what: "Macro: pencil shavings curling off a sharpener.",
    source: "stock-or-ai",
    search: ["pencil sharpening macro shavings", "colored pencil shavings close up"],
    ai: `Extreme macro of a colored pencil being sharpened, a thin wooden shaving curling away in slow motion. ${LOOK}`,
    focus: { x: 0.5, y: 0.5 },
  },
  {
    id: "p-clay",
    act: "proof",
    what: "Wet clay spinning on a potter's wheel under hands.",
    source: "stock",
    search: ["clay pottery wheel hands close up", "potter wheel wet clay macro"],
    focus: { x: 0.5, y: 0.5 },
  },
  {
    id: "p-paper",
    act: "proof",
    what: "Macro: paper fibers / pages of a book flipping in light.",
    source: "stock",
    search: ["book pages flipping macro light", "paper texture fibers macro"],
    focus: { x: 0.5, y: 0.5 },
  },
  {
    id: "p-leaf",
    act: "proof",
    what: "Backlit leaf veins, sun flickering through.",
    source: "stock",
    search: ["backlit leaf veins macro sunlight", "sun through leaves macro"],
    focus: { x: 0.5, y: 0.5 },
    leak: true,
  },
  {
    id: "p-crayons",
    act: "proof",
    what: "Macro: crayons tumbling or melting into color.",
    source: "stock-or-ai",
    search: ["crayons falling slow motion", "melting crayon colors macro"],
    ai: `Extreme macro of wax crayons tumbling onto a wooden table in slow motion, saturated warm colors. ${LOOK}`,
    focus: { x: 0.5, y: 0.5 },
  },
];

export const SHOT = Object.fromEntries(SHOTS.map((s) => [s.id, s])) as Record<string, ShotSpec>;
