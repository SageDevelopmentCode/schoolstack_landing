import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { ACTS } from "./timeline";
import { C } from "./theme";
import { HubActs } from "./scenes/HubActs";
import { AdminAct } from "./scenes/AdminAct";
import { ParentAct } from "./scenes/ParentAct";
import { TeacherAct } from "./scenes/TeacherAct";
import { FinaleAct } from "./scenes/FinaleAct";
import { CaptionTrack } from "./components/CaptionTrack";
import { FilmGrain } from "./components/FilmGrain";
import { Soundtrack } from "./components/Soundtrack";

export type FilmProps = {
  captions: boolean;
  grain: boolean;
  // Per-act preview compositions start partway into the master timeline.
  startAt?: number;
  audio?: string[];
};

const act = (k: keyof typeof ACTS) => ({ from: ACTS[k].from, durationInFrames: ACTS[k].to - ACTS[k].from });

export const Film: React.FC<FilmProps> = ({ captions, grain, startAt = 0, audio = [] }) => (
  <AbsoluteFill style={{ backgroundColor: C.forest }}>
    <Sequence from={-startAt} layout="none">
      <Sequence from={0} durationInFrames={ACTS.II.to} name="Acts I-II Hub">
        <HubActs />
      </Sequence>
      <Sequence {...act("III")} name="Act III Admin">
        <AdminAct />
      </Sequence>
      <Sequence {...act("IV")} name="Act IV Parent">
        <ParentAct />
      </Sequence>
      <Sequence {...act("V")} name="Act V Teacher">
        <TeacherAct />
      </Sequence>
      <Sequence {...act("VI")} name="Act VI Finale">
        <FinaleAct />
      </Sequence>
      {grain ? <FilmGrain /> : null}
      {captions ? <CaptionTrack /> : null}
      <Soundtrack available={audio} />
    </Sequence>
  </AbsoluteFill>
);
