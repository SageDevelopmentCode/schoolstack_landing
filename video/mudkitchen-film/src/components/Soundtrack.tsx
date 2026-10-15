import React from "react";
import { Html5Audio, Sequence, staticFile } from "remotion";
import { AUDIO_CUES, MUSIC_FILE, musicGain, resolveVoCues, type AudioCue, type MusicGain } from "../audioCues";

export type SoundtrackSpec = {
  resolveVo: (available: Set<string>) => AudioCue[];
  cues: AudioCue[];
  music: { file: string; gain: MusicGain };
};

const FILM_SPEC: SoundtrackSpec = {
  resolveVo: resolveVoCues,
  cues: AUDIO_CUES,
  music: { file: MUSIC_FILE, gain: musicGain },
};

export const Soundtrack: React.FC<{ available: string[]; spec?: SoundtrackSpec }> = ({ available, spec = FILM_SPEC }) => {
  const set = new Set(available);
  const vo = spec.resolveVo(set);
  const cues: AudioCue[] = [...vo, ...spec.cues.filter((c) => set.has(c.file))];
  return (
    <>
      {cues.map((c, i) => (
        <Sequence key={`${c.file}-${i}`} from={c.from} layout="none" name={`audio: ${c.label}`}>
          <Html5Audio
            src={staticFile(`audio/${c.file}`)}
            volume={c.file === spec.music.file ? (f) => spec.music.gain(c.from + f, vo.length > 0) : c.volume ?? 1}
          />
        </Sequence>
      ))}
    </>
  );
};
