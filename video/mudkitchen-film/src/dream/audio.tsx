import React from "react";
import { Html5Audio, Sequence, interpolate, staticFile } from "remotion";
import { CLAMP } from "../theme";
import { SFX_GAIN } from "../audioCues";
import { DREAM_FPS, MUSIC_OFFSET_SEC, type Timeline } from "./edl";

// public/audio/dream/: music.mp3 (licensed track, you supply), click.wav (temp
// metronome for the animatic, made by `npm run audio:dream`), buzz.wav, room-tone.wav (optional).
// SFX reuse the film's synthesized set in public/audio/sfx/.
export const DREAM_AUDIO_DIR = "dream/";
const MUSIC = `${DREAM_AUDIO_DIR}music.mp3`;
const CLICK = `${DREAM_AUDIO_DIR}click.wav`;
const MUSIC_GAIN = 0.55;

type Cue = { file: string; from: number; volume: number; label: string; trimBeforeSec?: number; until?: number };

export const dreamCues = (tl: Timeline, endBrandAt: number): Cue[] => {
  const { musicIn, breathIn, proofIn, endIn } = tl.markers;
  const sfx = (file: string, from: number, volume: number, label: string): Cue => ({
    file: `sfx/${file}`,
    from: Math.max(0, from),
    volume: volume * SFX_GAIN,
    label,
  });
  const hero = tl.words.find((w) => w.text === "this.");
  const tags = tl.items.filter((i) => i.kind === "shot" && i.tag);
  const flashes = tl.items.filter((i) => i.kind === "flash");
  return [
    // Hook: the phone buzzes in a silent kitchen.
    { file: `${DREAM_AUDIO_DIR}buzz.wav`, from: 3, volume: 0.8, label: "Phone buzz" },
    sfx("tick.wav", 0, 0.35, "Clock tick"),
    // Music hits on the first question and cuts dead on the end card.
    { file: MUSIC, from: musicIn, volume: MUSIC_GAIN, label: "Music", trimBeforeSec: MUSIC_OFFSET_SEC, until: endIn },
    sfx("whoosh-in.wav", musicIn - 8, 0.5, "Whoosh into the dream"),
    sfx("downbeat.wav", musicIn, 0.7, "Downbeat on 'What'"),
    ...(hero ? [sfx("thud.wav", hero.from, 0.8, "Thud on 'this.'")] : []),
    ...(breathIn ? [sfx("shimmer.wav", breathIn, 0.4, "Breath: shimmer")] : []),
    ...(proofIn ? [sfx("whoosh-layered.wav", proofIn - 6, 0.35, "Into the proof")] : []),
    ...tags.map((t) => sfx("tick.wav", t.from, 0.45, `Tag tick: ${"tag" in t ? t.tag : ""}`)),
    ...flashes.map((t) => sfx("crackle.wav", t.from, 0.5, "Flash crackle")),
    { file: `${DREAM_AUDIO_DIR}room-tone.wav`, from: endIn, volume: 0.3, label: "Kids laughing, far off (optional)" },
    sfx("sting.wav", endIn + endBrandAt, 0.7, "Logo sting"),
  ];
};

// Mounts only files that exist (audio/manifest.json). Without music.mp3 the
// click track plays from the music's entry point so the animatic has a pulse.
export const DreamSoundtrack: React.FC<{ tl: Timeline; available: string[]; endBrandAt: number }> = ({ tl, available, endBrandAt }) => {
  const set = new Set(available);
  const cues = dreamCues(tl, endBrandAt).flatMap((c) => {
    if (c.file === MUSIC && !set.has(MUSIC) && set.has(CLICK)) return [{ ...c, file: CLICK, volume: 0.35, label: "Click (no music yet)", trimBeforeSec: 0 }];
    return set.has(c.file) ? [c] : [];
  });
  return (
    <>
      {cues.map((c, i) => {
        const len = c.until !== undefined ? c.until - c.from : undefined;
        return (
          <Sequence key={`${c.file}-${i}`} from={c.from} durationInFrames={len} layout="none" name={`audio: ${c.label}`}>
            <Html5Audio
              src={staticFile(`audio/${c.file}`)}
              trimBefore={c.trimBeforeSec ? Math.round(c.trimBeforeSec * DREAM_FPS) : undefined}
              volume={
                len !== undefined
                  ? (f) => c.volume * interpolate(f, [0, 2, len - 3, len], [0, 1, 1, 0], CLAMP)
                  : c.volume
              }
            />
          </Sequence>
        );
      })}
    </>
  );
};
