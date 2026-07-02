"use client";

import { useState } from "react";
import RootedMeadowsDualBranding from "@/components/timeline/rooted-meadows/RootedMeadowsDualBranding";
import RootedMeadowsTimelineHero from "@/components/timeline/rooted-meadows/RootedMeadowsTimelineHero";
import RootedMeadowsTimelinePhases from "@/components/timeline/rooted-meadows/RootedMeadowsTimelinePhases";
import RootedMeadowsTimelineProgressLog from "@/components/timeline/rooted-meadows/RootedMeadowsTimelineProgressLog";
import type { OrganizationProgressEntry } from "@/lib/organization-progress";

interface Props {
  progressEntries: OrganizationProgressEntry[];
}

export default function RootedMeadowsTimelinePage({ progressEntries }: Props) {
  const [activePhase, setActivePhase] = useState(0);

  return (
    <>
      <RootedMeadowsDualBranding />
      <main>
        <RootedMeadowsTimelineHero />
        <RootedMeadowsTimelineProgressLog entries={progressEntries} />
        <RootedMeadowsTimelinePhases
          activePhase={activePhase}
          onPhaseSelect={setActivePhase}
        />
      </main>
    </>
  );
}
