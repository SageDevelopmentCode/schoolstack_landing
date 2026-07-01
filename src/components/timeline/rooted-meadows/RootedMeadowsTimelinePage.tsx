"use client";

import { useState } from "react";
import RootedMeadowsDualBranding from "@/components/timeline/rooted-meadows/RootedMeadowsDualBranding";
import RootedMeadowsScopeSummary from "@/components/timeline/rooted-meadows/RootedMeadowsScopeSummary";
import RootedMeadowsTimelineCta from "@/components/timeline/rooted-meadows/RootedMeadowsTimelineCta";
import RootedMeadowsTimelineHero from "@/components/timeline/rooted-meadows/RootedMeadowsTimelineHero";
import RootedMeadowsTimelinePhases from "@/components/timeline/rooted-meadows/RootedMeadowsTimelinePhases";
import RootedMeadowsTimelineProgress from "@/components/timeline/rooted-meadows/RootedMeadowsTimelineProgress";

export default function RootedMeadowsTimelinePage() {
  const [activePhase, setActivePhase] = useState(0);

  return (
    <>
      <RootedMeadowsDualBranding />
      <main>
        <RootedMeadowsTimelineHero />
        <RootedMeadowsTimelineProgress />
        <RootedMeadowsTimelinePhases
          activePhase={activePhase}
          onPhaseSelect={setActivePhase}
        />
        <RootedMeadowsScopeSummary />
        <RootedMeadowsTimelineCta />
      </main>
    </>
  );
}
