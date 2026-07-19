"use client";

import { useState } from "react";
import RootedMeadowsTimelinePhases from "@/components/timeline/rooted-meadows/RootedMeadowsTimelinePhases";

export default function RootedMeadowsTimelinePhasesSection() {
  const [activePhase, setActivePhase] = useState(0);

  return (
    <RootedMeadowsTimelinePhases
      activePhase={activePhase}
      onPhaseSelect={setActivePhase}
    />
  );
}
