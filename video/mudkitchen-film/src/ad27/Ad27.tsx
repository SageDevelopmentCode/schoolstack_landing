import React from "react";
import { AbsoluteFill, Sequence, interpolate } from "remotion";
import { CLAMP } from "../theme";
import { CaptionTrack, type CaptionSpec } from "../components/CaptionTrack";
import { FilmGrain } from "../components/FilmGrain";
import { Soundtrack } from "../components/Soundtrack";
import { SITE } from "../demo/tokens";
import { AD_SOUNDTRACK } from "./audio";
import { AD_CUES } from "./captions";
import { FOOTAGE, HIT, SCENES, sceneAt } from "./timeline";
import { FootageShot } from "./scenes/FootageShot";
import { RevealIris } from "./scenes/ProductReveal";
import { AdminStage } from "./scenes/AdminStage";
import { Billing } from "./scenes/Billing";
import { Communication } from "./scenes/Communication";
import { EndCard } from "./scenes/EndCard";

export type AdProps = { captions: boolean; grain: boolean; audio?: string[] };

const CAPTIONS: CaptionSpec = {
  cues: AD_CUES,
  suppress: [],
  onLight: (f) => SCENES[sceneAt(f)].light,
  bottom: { vertical: 360, horizontal: 54 },
  shadowOnLight: true,
};

const range = (from: number, to: number) => ({ from, durationInFrames: to - from });

export const Ad27: React.FC<AdProps> = ({ captions, grain, audio = [] }) => (
  <AbsoluteFill style={{ backgroundColor: SITE.bg }}>
    {FOOTAGE.map((s) => (
      <Sequence key={s.id} {...range(s.from, s.to)} name={`Footage ${s.id}`}>
        <FootageShot
          spec={s}
          blur={s.id === "burden-b" ? (lf) => interpolate(lf + s.from, [HIT.revealStart - 6, HIT.revealStart + 14], [0, 8], CLAMP) : undefined}
        />
      </Sequence>
    ))}

    <Sequence {...range(SCENES.reveal.from, SCENES.comms.to)} name="Cream stage (iris)">
      <RevealIris from={SCENES.reveal.from} />
    </Sequence>
    <Sequence {...range(SCENES.reveal.from, HIT.adminOut + 16)} name="Admin: dashboard, admissions, students">
      <AdminStage from={SCENES.reveal.from} />
    </Sequence>
    <Sequence {...range(HIT.adminOut, HIT.commsIn + 10)} name="Parent billing">
      <Billing from={HIT.adminOut} />
    </Sequence>
    <Sequence {...range(HIT.commsIn - 4, SCENES.comms.to)} name="Newsletter">
      <Communication from={HIT.commsIn - 4} />
    </Sequence>

    <Sequence {...range(HIT.brandIn - 10, SCENES.brand.to)} name="End card">
      <EndCard from={HIT.brandIn - 10} />
    </Sequence>

    {grain ? <FilmGrain opacity={0.07} /> : null}
    {captions ? <CaptionTrack spec={CAPTIONS} /> : null}
    <Soundtrack available={audio} spec={AD_SOUNDTRACK} />
  </AbsoluteFill>
);
