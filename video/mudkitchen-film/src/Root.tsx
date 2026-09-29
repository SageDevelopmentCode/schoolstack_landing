import React from "react";
import { Composition, Folder, staticFile, type CalculateMetadataFunction } from "remotion";
import { Film, type FilmProps } from "./Film";
import { ACTS, DURATION, FPS } from "./timeline";

const defaults: FilmProps = { captions: true, grain: true, startAt: 0, audio: [] };

// public/audio/manifest.json is written by scripts/sync-assets.mjs and lists the
// audio files that actually exist, so missing music/SFX/VO render as silence.
const withAudio: CalculateMetadataFunction<FilmProps> = async ({ props }) => {
  try {
    const res = await fetch(staticFile("audio/manifest.json"));
    const audio = res.ok ? ((await res.json()) as string[]) : [];
    return { props: { ...props, audio } };
  } catch {
    return { props: { ...props, audio: [] } };
  }
};

export const Root: React.FC = () => (
  <>
    <Composition
      id="MudKitchenFilm16x9"
      component={Film}
      durationInFrames={DURATION}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={defaults}
      calculateMetadata={withAudio}
    />
    <Composition
      id="MudKitchenFilm9x16"
      component={Film}
      durationInFrames={DURATION}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={defaults}
      calculateMetadata={withAudio}
    />
    <Composition
      id="MudKitchenFilm16x9NoCaptions"
      component={Film}
      durationInFrames={DURATION}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{ ...defaults, captions: false }}
      calculateMetadata={withAudio}
    />
    <Folder name="Acts">
      {(Object.keys(ACTS) as (keyof typeof ACTS)[]).map((k) => (
        <React.Fragment key={k}>
          <Composition
            id={`Act${k}-16x9`}
            component={Film}
            durationInFrames={ACTS[k].to - ACTS[k].from}
            fps={FPS}
            width={1920}
            height={1080}
            defaultProps={{ ...defaults, startAt: ACTS[k].from }}
          />
          <Composition
            id={`Act${k}-9x16`}
            component={Film}
            durationInFrames={ACTS[k].to - ACTS[k].from}
            fps={FPS}
            width={1080}
            height={1920}
            defaultProps={{ ...defaults, startAt: ACTS[k].from }}
          />
        </React.Fragment>
      ))}
    </Folder>
  </>
);
