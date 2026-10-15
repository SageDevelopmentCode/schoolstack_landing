import { SFX_GAIN, duckedMusicGain, resolveVoCuesFor, type AudioCue } from "../audioCues.ts";
import type { SoundtrackSpec } from "../components/Soundtrack.tsx";
import { AD_VO_LINES } from "./captions.ts";
import { HIT } from "./timeline.ts";

// public/audio/ad27/: vo/<id>.wav (or a single vo.wav), music.mp3.
// SFX reuse the film's synthesized set in public/audio/sfx/.
export const AD_AUDIO_DIR = "ad27/";
export const AD_MUSIC_FILE = `${AD_AUDIO_DIR}music.mp3`;

const sfx = (file: string, from: number, volume: number, label: string): AudioCue => ({
  file: `sfx/${file}`,
  from,
  volume: volume * SFX_GAIN,
  label,
});

export const AD_AUDIO_CUES: AudioCue[] = [
  { file: AD_MUSIC_FILE, from: 0, volume: 0.45, label: "Music bed (ducks under VO)" },
  { file: `${AD_AUDIO_DIR}room-tone.wav`, from: 0, volume: 0.25, label: "Classroom ambience (optional)" },
  sfx("whoosh-in.wav", HIT.revealStart - 10, 0.55, "Push into the laptop"),
  sfx("bloom.wav", HIT.revealStart + 4, 0.35, "Dashboard scales out"),
  sfx("tick.wav", HIT.admissions, 0.4, "Admissions opens"),
  sfx("tick.wav", HIT.students, 0.4, "My Students opens"),
  sfx("whoosh-in.wav", HIT.adminOut - 2, 0.3, "Slide to billing"),
  sfx("thock.wav", HIT.billPress, 0.55, "Pay press"),
  sfx("success.wav", HIT.billPress + 4, 0.4, "Paid"),
  sfx("whoosh-in.wav", HIT.commsIn - 4, 0.3, "Slide to newsletter"),
  sfx("sent-pop.wav", HIT.dockUpdate, 0.45, "Update lands in the newsletter"),
  sfx("tick.wav", HIT.dockPhoto, 0.35, "Photo lands in the cover"),
  sfx("sting.wav", HIT.logoSting, 0.7, "Logo sting"),
];

export const AD_SOUNDTRACK: SoundtrackSpec = {
  resolveVo: (available) => resolveVoCuesFor(AD_VO_LINES, available, AD_AUDIO_DIR),
  cues: AD_AUDIO_CUES,
  music: { file: AD_MUSIC_FILE, gain: duckedMusicGain(AD_VO_LINES) },
};
