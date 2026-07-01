"use client";

import { useState } from "react";
import RootedMeadowsDualBranding from "@/components/timeline/rooted-meadows/RootedMeadowsDualBranding";
import RootedMeadowsTimelineHero from "@/components/timeline/rooted-meadows/RootedMeadowsTimelineHero";
import RootedMeadowsTimelinePhases from "@/components/timeline/rooted-meadows/RootedMeadowsTimelinePhases";

export default function RootedMeadowsTimelinePage() {
  const [activePhase, setActivePhase] = useState(0);

  return (
    <>
      <RootedMeadowsDualBranding />
      <main>
        <RootedMeadowsTimelineHero />
        <RootedMeadowsTimelinePhases
          activePhase={activePhase}
          onPhaseSelect={setActivePhase}
        />
      </main>
    </>
  );
}
