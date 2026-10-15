import type { Cue, VoClip } from "../captions.ts";
import { AD_DURATION } from "./timeline.ts";

// The approved script, word for word. One VO file per clip:
// public/audio/ad27/vo/<id>.wav|mp3|m4a, mounted at `from`. `to` is 2 frames
// before the next clip. Clips 04-06 split the list sentence so each feature
// lands on its own screen.
export const SCRIPT = [
  "You started a microschool for a reason.",
  "Not to spend your days chasing payments and paperwork.",
  "Meet MudKitchen.",
  "Enrollment and student information, billing, and communication, all in one place.",
  "So you can focus on what matters most: your students.",
  "MudKitchen. Built for schools like ours. Get started at trymudkitchen.com.",
];

const CLIPS: Omit<VoClip, "to">[] = [
  { id: "01", from: 8, text: "You started a microschool for a reason." },
  { id: "02", from: 124, text: "Not to spend your days chasing payments and paperwork." },
  { id: "03", from: 226, text: "Meet MudKitchen." },
  { id: "04", from: 304, text: "Enrollment and student information," },
  { id: "05", from: 400, text: "billing," },
  { id: "06", from: 470, text: "and communication, all in one place." },
  { id: "07", from: 556, text: "So you can focus on what matters most: your students." },
  {
    id: "08",
    from: 664,
    text: "MudKitchen. Built for schools like ours. Get started at trymudkitchen.com.",
    read: "MudKitchen. Built for schools like ours. Get started at try mud kitchen dot com.",
  },
];

export const AD_VO_LINES: VoClip[] = CLIPS.map((c, i) => ({
  ...c,
  to: (i + 1 < CLIPS.length ? CLIPS[i + 1].from : AD_DURATION) - 2,
}));

// Burned-in captions, timed to the split Hope take (audio-source/ad27-vo.mp3).
// Cues end before scene cuts so the pill style doesn't flip mid-line; 08 breaks
// on its measured sentence pauses (after the x1.08 speed-up).
export const AD_CUES: Cue[] = [
  { from: 8, to: 116, text: "You started a microschool for a reason." },
  { from: 124, to: 214, text: "Not to spend your days chasing payments and paperwork." },
  { from: 226, to: 298, text: "Meet MudKitchen." },
  { from: 304, to: 392, text: "Enrollment and student information," },
  { from: 400, to: 458, text: "billing," },
  { from: 470, to: 544, text: "and communication, all in one place." },
  { from: 556, to: 659, text: "So you can focus on what matters most: your students." },
  { from: 664, to: 687, text: "MudKitchen." },
  { from: 689, to: 732, text: "Built for schools like ours." },
  { from: 734, to: 806, text: "Get started at trymudkitchen.com." },
];
