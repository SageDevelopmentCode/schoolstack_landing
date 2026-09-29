import { HIT, beat } from "./timeline.ts";
import { VO_LINES } from "./captions.ts";

// Drop files into public/audio/ with these names; anything missing is skipped.
export type AudioCue = { file: string; from: number; volume?: number; label: string };

// VO: one file per clip (public/audio/vo/<id>.wav|mp3|m4a) mounted at the clip's
// start frame. A single full-length vo.wav at frame 0 is used only when no clip
// files exist.
export const VO_EXTENSIONS = ["wav", "mp3", "m4a"] as const;
export const VO_FALLBACK: AudioCue = { file: "vo.wav", from: 0, volume: 1, label: "VO (single full read, fallback)" };

export function resolveVoCues(available: Set<string>): AudioCue[] {
  const clips = VO_LINES.flatMap((v) => {
    const ext = VO_EXTENSIONS.find((e) => available.has(`vo/${v.id}.${e}`));
    return ext ? [{ file: `vo/${v.id}.${ext}`, from: v.from, volume: 1, label: `VO ${v.id}` }] : [];
  });
  if (clips.length > 0) return clips;
  return available.has(VO_FALLBACK.file) ? [VO_FALLBACK] : [];
}

export const MUSIC_FILE = "music.mp3";
const MUSIC_GAIN = 0.45;
const MUSIC_DUCKED = 0.22;
const DUCK_RAMP = 6;

// Master level for every sfx/ cue; the per-cue volumes set the balance between them.
export const SFX_GAIN = 0.5;

// Music gain at an absolute film frame: ducked under every VO clip window.
export function musicGain(frame: number, voActive: boolean) {
  if (!voActive) return MUSIC_GAIN;
  let duck = 0;
  for (const v of VO_LINES) {
    if (frame < v.from - DUCK_RAMP || frame > v.to + DUCK_RAMP) continue;
    const inRamp = Math.min(1, (frame - (v.from - DUCK_RAMP)) / DUCK_RAMP);
    const outRamp = Math.min(1, (v.to + DUCK_RAMP - frame) / DUCK_RAMP);
    duck = Math.max(duck, Math.max(0, Math.min(inRamp, outRamp)));
  }
  return MUSIC_GAIN - (MUSIC_GAIN - MUSIC_DUCKED) * duck;
}

export const AUDIO_CUES: AudioCue[] = [
  { file: MUSIC_FILE, from: 0, volume: MUSIC_GAIN, label: "Music bed, 92 BPM, organic drums + muted synth pad (ducks to 0.22 under VO)" },
  { file: "sfx/hum.wav", from: 0, volume: 0.4, label: "Low room hum" },
  { file: "sfx/crackle.wav", from: 0, volume: 0.7, label: "Single vinyl crackle hit" },
  { file: "sfx/tick.wav", from: 4, volume: 0.5, label: "Kicker assembles" },
  ...HIT.evidence.map((f, i) => ({ file: "sfx/tick.wav", from: f, volume: 0.5, label: `Evidence beat ${i + 1}: tool group lights` })),
  { file: "sfx/whoosh-in.wav", from: HIT.pushIn - 4, volume: 0.7, label: "Push-in to the hook" },
  { file: "sfx/kick.wav", from: HIT.hookLine2, volume: 0.9, label: "Kick on 'everything feels harder.'" },
  { file: "sfx/shimmer.wav", from: HIT.trailsStart, volume: 0.5, label: "Light trails wave" },
  { file: "sfx/bloom.wav", from: HIT.logoBloom, volume: 0.4, label: "Logo bloom swell" },
  { file: "sfx/whoosh-layered.wav", from: HIT.collapse - 4, volume: 0.7, label: "Spiral collapse" },
  { file: "sfx/magnet-snap.wav", from: HIT.lockIn - 5, volume: 0.8, label: "Magnetic snap" },
  { file: "sfx/glass-chime.wav", from: HIT.lockIn, volume: 0.7, label: "Lock-in chime" },
  ...HIT.listWords.map((f, i) => ({ file: "sfx/tick.wav", from: f, volume: 0.45, label: `Feature docks into the workspace ${i + 1}` })),
  { file: "sfx/whoosh-in.wav", from: HIT.listMore - 2, volume: 0.5, label: "'and more': remaining features rush in" },
  { file: "sfx/ping.wav", from: 816, volume: 0.45, label: "Alert ping 1" },
  { file: "sfx/ping.wav", from: 836, volume: 0.45, label: "Alert ping 2" },
  { file: "sfx/tape-stop.wav", from: HIT.finFlash, volume: 0.5, label: "Finances stutter" },
  { file: "sfx/sent-pop.wav", from: HIT.bubbleMorph + 10, volume: 0.6, label: "Notification becomes message" },
  { file: "sfx/pen.wav", from: 1150, volume: 0.5, label: "Signature" },
  { file: "sfx/thock.wav", from: 1236, volume: 0.6, label: "Pay button press" },
  { file: "sfx/success.wav", from: 1242, volume: 0.5, label: "Payment success" },
  { file: "sfx/boop.wav", from: HIT.gmailPeek + 4, volume: 0.5, label: "Gmail peek" },
  { file: "sfx/thud.wav", from: HIT.gmailThud, volume: 0.7, label: "Panel slides shut" },
  { file: "sfx/plinks.wav", from: 1452, volume: 0.5, label: "Attendance check ripple" },
  { file: "sfx/sent-pop.wav", from: 1538, volume: 0.5, label: "Teacher reply sent" },
  { file: "sfx/downbeat.wav", from: beat(80), volume: 0.6, label: "Teach more. Chase less." },
  { file: "sfx/sting.wav", from: HIT.logoSting, volume: 0.8, label: "Logo sting + final chord" },
].map((c) => (c.file.startsWith("sfx/") ? { ...c, volume: (c.volume ?? 1) * SFX_GAIN } : c));
