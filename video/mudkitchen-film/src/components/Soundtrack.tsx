import React from "react";
import { Html5Audio, Sequence, staticFile } from "remotion";
import { AUDIO_CUES, MUSIC_FILE, musicGain, resolveVoCues, type AudioCue } from "../audioCues";

export const Soundtrack: React.FC<{ available: string[] }> = ({ available }) => {
  const set = new Set(available);
  const vo = resolveVoCues(set);
  const cues: AudioCue[] = [...vo, ...AUDIO_CUES.filter((c) => set.has(c.file))];
  return (
    <>
      {cues.map((c, i) => (
        <Sequence key={`${c.file}-${i}`} from={c.from} layout="none" name={`audio: ${c.label}`}>
          <Html5Audio
            src={staticFile(`audio/${c.file}`)}
            volume={c.file === MUSIC_FILE ? (f) => musicGain(c.from + f, vo.length > 0) : c.volume ?? 1}
          />
        </Sequence>
      ))}
    </>
  );
};
