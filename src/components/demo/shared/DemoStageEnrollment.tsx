"use client";

import DemoParentEnrollmentChecklist from "@/components/demo/shared/DemoParentEnrollmentChecklist";
import { luffLearningParentDemoConfig } from "@/data/school-demos/luff-learning-parent-demo";

/** DemoStage "enrollment": the real Garden enrollment checklist for the shared demo school. */
export default function DemoStageEnrollment() {
  return <DemoParentEnrollmentChecklist config={luffLearningParentDemoConfig} />;
}
