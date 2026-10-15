// Single source of truth for the 27s ad: scene ranges, footage trims, crop focus,
// and the clock remap that drives the reused admin demo. Re-timing to the final
// VO read only touches this file and captions.ts.

export const AD_FPS = 30;
export const AD_DURATION = 810; // 27.0s

export type SceneId = "hook" | "burden" | "reveal" | "enroll" | "billing" | "comms" | "payoff" | "brand";

export const SCENES: Record<SceneId, { from: number; to: number; title: string; light: boolean }> = {
  hook: { from: 0, to: 120, title: "Classroom hook", light: false },
  burden: { from: 120, to: 210, title: "Administrative burden", light: false },
  reveal: { from: 210, to: 300, title: "MudKitchen reveal", light: true },
  enroll: { from: 300, to: 390, title: "Enrollment and student information", light: true },
  billing: { from: 390, to: 462, title: "Billing", light: true },
  comms: { from: 462, to: 546, title: "Family communication", light: true },
  payoff: { from: 546, to: 662, title: "Human payoff", light: false },
  brand: { from: 662, to: 810, title: "Brand and call to action", light: true },
};

export const sceneAt = (f: number) =>
  (Object.keys(SCENES) as SceneId[]).find((k) => f >= SCENES[k].from && f < SCENES[k].to) ?? "brand";

// ─── Footage ───────────────────────────────────────────────────────────────

// Focus: the source point (0-1 of frame width/height) held at the canvas center,
// and a zoom over "cover" scale. Keys are local frames within the shot.
// `ease: "in"` accelerates into the key (push-through); the default eases both ends.
export type FocusKey = { at: number; x: number; y: number; zoom: number; ease?: "in" };

export type FootageShotSpec = {
  id: string;
  src: "classroom-help" | "founder-desk" | "student-share";
  from: number;
  to: number;
  // Seconds into the source clip at the shot's first frame (sources are 5.875s).
  srcIn: number;
  vertical: FocusKey[];
  horizontal: FocusKey[];
};

export const FOOTAGE: FootageShotSpec[] = [
  {
    // Teacher (face ~0.42) leans in beside the student (~0.68); camera drifts left.
    id: "hook",
    src: "classroom-help",
    from: 0,
    to: 120,
    srcIn: 0.1,
    vertical: [
      { at: 0, x: 0.545, y: 0.45, zoom: 1 },
      { at: 120, x: 0.525, y: 0.45, zoom: 1.015 },
    ],
    horizontal: [
      { at: 0, x: 0.5, y: 0.45, zoom: 1.02 },
      { at: 120, x: 0.5, y: 0.42, zoom: 1.08 },
    ],
  },
  {
    // Founder typing, laptop and face both in frame.
    id: "burden-a",
    src: "founder-desk",
    from: 120,
    to: 168,
    srcIn: 1.0,
    vertical: [
      { at: 0, x: 0.42, y: 0.5, zoom: 1 },
      { at: 48, x: 0.41, y: 0.5, zoom: 1.03 },
    ],
    horizontal: [
      { at: 0, x: 0.5, y: 0.5, zoom: 1.04 },
      { at: 48, x: 0.49, y: 0.5, zoom: 1.08 },
    ],
  },
  {
    // Secondary cut: later in the clip, she checks her notes; the crop eases
    // onto the laptop, then pushes into it for the reveal (runs into the reveal scene).
    id: "burden-b",
    src: "founder-desk",
    from: 168,
    to: 232,
    srcIn: 3.7,
    vertical: [
      { at: 0, x: 0.47, y: 0.55, zoom: 1.08 },
      { at: 36, x: 0.36, y: 0.7, zoom: 1.2 },
      { at: 64, x: 0.27, y: 0.82, zoom: 3.2, ease: "in" },
    ],
    horizontal: [
      { at: 0, x: 0.5, y: 0.55, zoom: 1.12 },
      { at: 36, x: 0.4, y: 0.66, zoom: 1.3 },
      { at: 64, x: 0.27, y: 0.82, zoom: 3.4, ease: "in" },
    ],
  },
  {
    // Student (~0.33) shows her project; teacher (~0.70) smiles. 9:16 pans between them.
    id: "payoff",
    src: "student-share",
    from: 546,
    to: 662,
    srcIn: 1.8,
    vertical: [
      { at: 0, x: 0.34, y: 0.45, zoom: 1 },
      { at: 30, x: 0.35, y: 0.45, zoom: 1 },
      { at: 88, x: 0.64, y: 0.45, zoom: 1.02 },
      { at: 116, x: 0.65, y: 0.45, zoom: 1.03 },
    ],
    horizontal: [
      { at: 0, x: 0.5, y: 0.45, zoom: 1.02 },
      { at: 116, x: 0.52, y: 0.45, zoom: 1.08 },
    ],
  },
];

// ─── Product beats ──────────────────────────────────────────────────────────

export const HIT = {
  // Laptop push peaks; the dashboard scales out of the laptop.
  revealStart: 214,
  revealLand: 244,
  // Admin act frames 72 (admissions) and 144 (my students) land on these ad frames.
  admissions: 296,
  students: 346,
  adminOut: 384,
  phoneIn: 388,
  billPress: 428,
  commsIn: 460,
  cardsIn: 472,
  cardsAlign: 488,
  dockUpdate: 506,
  dockPhoto: 516,
  commsOut: 542,
  // The wipe (brandIn - 8) waits for "your students" to land on the payoff shot.
  brandIn: 662,
  logoSting: 661,
} as const;

// Ad frame -> admin act frame (AdminWindow clock): dashboard, admissions, my students.
export const ADMIN_CLOCK: { ad: number[]; act: number[] } = {
  // Starts before the reveal so the dashboard is already populated as it scales out.
  ad: [202, HIT.admissions, HIT.students, 392],
  act: [0, 72, 140, 200],
};
