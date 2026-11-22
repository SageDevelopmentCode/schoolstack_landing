import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile } from "remotion";
import { FilmGrain } from "../components/FilmGrain";
import { layout, shotItems, type CutId } from "./edl";
import { SHOT } from "./shots";
import { DreamShot, clipPath } from "./DreamShot";
import { MonoTag, ProductFlash, WordCut } from "./WordCut";
import { DreamEndCard } from "./EndCard";
import { DreamSoundtrack } from "./audio";

export type DreamProps = {
  cut: CutId;
  grain: boolean;
  // Filled by calculateMetadata from public/footage/manifest.json and public/audio/manifest.json.
  footage?: string[];
  audio?: string[];
};

const END_BRAND_AT = { full: 124, short: 0 } as const;

export const Dream: React.FC<DreamProps> = ({ cut, grain, footage = [], audio = [] }) => {
  const tl = layout(cut);
  const have = new Set(footage);
  const shots = shotItems(tl);
  const end = tl.items.find((i) => i.kind === "end");
  const endBrandAt = end && end.kind === "end" ? END_BRAND_AT[end.variant] : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Picture: footage (or slates), product flashes, end card. Black items are just gaps. */}
      {tl.items.map((it) => {
        const len = it.to - it.from;
        if (it.kind === "shot") {
          const spec = SHOT[it.shot];
          const n = shots.findIndex((s) => s.index === it.index) + 1;
          return (
            <Sequence key={it.index} from={it.from} durationInFrames={len} name={`${n}. ${it.shot}`}>
              <DreamShot spec={spec} n={n} frames={len} available={have.has(clipPath(spec.id))} srcIn={it.srcIn} />
            </Sequence>
          );
        }
        if (it.kind === "flash") {
          return (
            <Sequence key={it.index} from={it.from} durationInFrames={len} name={`flash ${it.image}`}>
              <ProductFlash>
                <Img src={staticFile(it.image)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </ProductFlash>
            </Sequence>
          );
        }
        if (it.kind === "end") {
          return (
            <Sequence key={it.index} from={it.from} durationInFrames={len} name="End card">
              <DreamEndCard variant={it.variant} />
            </Sequence>
          );
        }
        return null;
      })}

      {/* Film texture over the footage only (the end card has its own paper grain). */}
      {grain ? (
        <Sequence from={0} durationInFrames={tl.markers.endIn} name="Film grain + vignette">
          <FilmGrain opacity={0.1} />
          <AbsoluteFill style={{ background: "radial-gradient(120% 85% at 50% 45%, transparent 50%, rgba(0,0,0,0.5) 100%)" }} />
        </Sequence>
      ) : null}

      {/* Type: one word at a time, then the proof tags. */}
      {tl.words.map((w, i) => (
        <Sequence key={`w${i}`} from={w.from} durationInFrames={w.to - w.from} name={`word: ${w.text}`}>
          <WordCut text={w.text} frames={w.to - w.from} style={w.style} pos={w.pos} />
        </Sequence>
      ))}
      {tl.items.map((it) =>
        it.kind === "shot" && it.tag ? (
          <Sequence key={`t${it.index}`} from={it.from} durationInFrames={it.to - it.from} name={`tag: ${it.tag}`}>
            <MonoTag tag={it.tag} frames={it.to - it.from} />
          </Sequence>
        ) : null,
      )}

      <DreamSoundtrack tl={tl} available={audio} endBrandAt={endBrandAt} />
    </AbsoluteFill>
  );
};

export const dreamDuration = (cut: CutId) => layout(cut).duration;
