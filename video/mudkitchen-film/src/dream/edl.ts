// Edit decision list for the "Dream" ad: the single source of truth for timing.
// Everything is measured in beats of the music (BPM below), so re-timing to the
// final track means changing BPM / MUSIC_OFFSET_SEC and nothing else.
//
// Shape of the 40s cut (borrowed from the Anthropic "questions" spot):
//   hook (pain, no music) → dream (questions, one word per shot) → breath
//   → proof (macro textures + mono tags + product flashes) → end card (silence)

export const DREAM_FPS = 30;
export const BPM = 100;
export const BEAT = (60 / BPM) * DREAM_FPS; // frames per beat (18 at 100 BPM)
// Seconds into public/audio/dream/music.mp3 that should land on the first dream
// shot (the track's first strong downbeat).
export const MUSIC_OFFSET_SEC = 0;

export type WordStyle =
  | "plain" // centered serif word, quick blur-in
  | "line" // a short phrase, smaller, for the hook
  | "scale" // grows toward full frame over its life ("this.")
  | "scatter" // letters fly in from scattered positions and settle
  | "glitch"; // RGB split + jitter on entry

export type Word = { text: string; at: number; style?: WordStyle; pos?: "c" | "high" | "low" };

export type Item =
  | { kind: "shot"; shot: string; beats: number; words?: Word[]; tag?: string; srcIn?: number }
  | { kind: "flash"; image: string; frames: number }
  | { kind: "black"; beats: number }
  | { kind: "end"; variant: "full" | "short"; frames: number };

export type Marker = "musicIn" | "breathIn" | "proofIn" | "endIn";
export type Section = { marker?: Marker; items: Item[] };

const w = (text: string, at: number, style?: WordStyle, pos?: Word["pos"]): Word => ({ text, at, style, pos });

// ── 40s master ─────────────────────────────────────────────────────────────

const HOOK_40: Section = {
  items: [
    { kind: "shot", shot: "h-clock", beats: 2.5, words: [w("You didn't start a school", 0, "line")] },
    { kind: "shot", shot: "h-laptop", beats: 2.5, words: [w("to chase invoices.", 0, "line")] },
    { kind: "black", beats: 0.5 },
  ],
};

const DREAM_40: Section = {
  marker: "musicIn",
  items: [
    // "What if every family paid on time?"
    { kind: "shot", shot: "d-pickup-phone", beats: 1, words: [w("What", 0), w("if", 0.5)] },
    { kind: "shot", shot: "d-family-arrive", beats: 1.5, words: [w("every", 0), w("family", 0.75)] },
    { kind: "shot", shot: "d-pay-tap", beats: 1, words: [w("paid", 0)] },
    { kind: "shot", shot: "d-coffee-desk", beats: 2.5, words: [w("on", 0), w("time?", 0.5)] },
    // "What if enrollment filled itself?" (empty room → full room match cut)
    { kind: "shot", shot: "d-empty-chairs", beats: 2, words: [w("What", 0), w("if", 0.5), w("enrollment", 1)] },
    { kind: "shot", shot: "d-full-room", beats: 2.5, words: [w("filled", 0), w("itself?", 1, "scale")] },
    // "What if parents never had to ask?"
    { kind: "shot", shot: "d-carline", beats: 2, words: [w("What", 0), w("if", 0.5), w("parents", 1)] },
    { kind: "shot", shot: "d-pickup-hug", beats: 2, words: [w("never", 0), w("had", 1), w("to", 1.5)] },
    { kind: "shot", shot: "d-parent-smile", beats: 2, words: [w("ask?", 0, "scatter")] },
    // "Know every kid by name?"
    { kind: "shot", shot: "d-kneel", beats: 1, words: [w("Know", 0), w("every", 0.5)] },
    { kind: "shot", shot: "d-kid-laugh", beats: 1, words: [w("kid", 0)] },
    { kind: "shot", shot: "d-cubbies", beats: 2, words: [w("by", 0), w("name?", 0.5)] },
    // "Less paperwork. More this."
    { kind: "shot", shot: "d-paper-fly", beats: 2, words: [w("Less", 0), w("paperwork.", 0.5, "glitch")] },
    { kind: "shot", shot: "d-run-field", beats: 1, words: [w("More", 0)] },
    { kind: "shot", shot: "d-mud-kitchen", beats: 3, words: [w("this.", 0, "scale")] },
  ],
};

const BREATH_40: Section = {
  marker: "breathIn",
  items: [{ kind: "shot", shot: "b-schoolhouse", beats: 5 }],
};

// Every tag names something MudKitchen really does. Swap in real numbers
// (families, schools, hours saved) only when they are true.
const PROOF_40: Section = {
  marker: "proofIn",
  items: [
    { kind: "shot", shot: "p-chalk", beats: 1, tag: "morning-attendance" },
    { kind: "shot", shot: "p-watercolor", beats: 1, tag: "tuition-autopay" },
    { kind: "flash", image: "brand/marketing/app-screens/parent-billing.png", frames: 6 },
    { kind: "shot", shot: "p-sprout", beats: 1, tag: "enrollment-pipeline" },
    { kind: "shot", shot: "p-shavings", beats: 1, tag: "forms-signed-on-phone" },
    { kind: "flash", image: "brand/marketing/app-screens/teacher-roll-call.png", frames: 6 },
    { kind: "shot", shot: "p-clay", beats: 1, tag: "parent-app" },
    { kind: "shot", shot: "p-paper", beats: 1, tag: "staff-payroll" },
    { kind: "flash", image: "brand/marketing/app-screens/parent-forms.png", frames: 6 },
    { kind: "shot", shot: "p-crayons", beats: 1, tag: "weekly-newsletter" },
    { kind: "shot", shot: "p-leaf", beats: 1.5, tag: "Sage-Field-runs-on-MudKitchen" },
  ],
};

const END_40: Section = { marker: "endIn", items: [{ kind: "end", variant: "full", frames: 240 }] };

// ── 15s cutdown ────────────────────────────────────────────────────────────

const HOOK_15: Section = {
  items: [
    { kind: "shot", shot: "h-clock", beats: 2, words: [w("You didn't start a school", 0, "line")] },
    { kind: "shot", shot: "h-laptop", beats: 2, words: [w("to chase invoices.", 0, "line")] },
    { kind: "black", beats: 0.5 },
  ],
};

const DREAM_15: Section = {
  marker: "musicIn",
  items: [
    ...DREAM_40.items.slice(0, 4), // "What if every family paid on time?"
    ...DREAM_40.items.slice(-3), // "Less paperwork. More this."
  ],
};

const PROOF_15: Section = {
  marker: "proofIn",
  items: [
    { kind: "shot", shot: "p-chalk", beats: 1, tag: "morning-attendance" },
    { kind: "shot", shot: "p-watercolor", beats: 1, tag: "tuition-autopay" },
    { kind: "shot", shot: "p-sprout", beats: 1, tag: "enrollment-pipeline" },
  ],
};

const END_15: Section = { marker: "endIn", items: [{ kind: "end", variant: "short", frames: 99 }] };

export const CUTS = {
  "40": [HOOK_40, DREAM_40, BREATH_40, PROOF_40, END_40],
  "15": [HOOK_15, DREAM_15, PROOF_15, END_15],
} as const;
export type CutId = keyof typeof CUTS;

// ── Layout: items → absolute frames ───────────────────────────────────────

export type Timed<T extends Item = Item> = T & { from: number; to: number; index: number };
export type TimedWord = Word & { from: number; to: number; shotIndex: number };

export type Timeline = {
  items: Timed[];
  words: TimedWord[];
  markers: Record<Marker, number>;
  duration: number;
};

const lengthOf = (it: Item) => {
  if (it.kind === "flash" || it.kind === "end") return it.frames;
  return it.beats * BEAT;
};

export const layout = (cut: CutId): Timeline => {
  const items: Timed[] = [];
  const words: TimedWord[] = [];
  const markers = { musicIn: 0, breathIn: 0, proofIn: 0, endIn: 0 } as Record<Marker, number>;
  let t = 0; // exact (fractional) frames; rounded per item so beats never drift
  for (const section of CUTS[cut]) {
    if (section.marker) markers[section.marker] = Math.round(t);
    for (const it of section.items) {
      const from = Math.round(t);
      t += lengthOf(it);
      const to = Math.round(t);
      const index = items.length;
      items.push({ ...it, from, to, index } as Timed);
      if (it.kind === "shot" && it.words) {
        it.words.forEach((word, i) => {
          const next = it.words![i + 1];
          words.push({
            ...word,
            from: from + Math.round(word.at * BEAT),
            to: next ? from + Math.round(next.at * BEAT) : to,
            shotIndex: index,
          });
        });
      }
    }
  }
  return { items, words, markers, duration: Math.round(t) };
};

export const shotItems = (tl: Timeline) => tl.items.filter((i): i is Timed<Extract<Item, { kind: "shot" }>> => i.kind === "shot");
