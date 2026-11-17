"use client";

import DemoAdminGardenMarketing from "@/components/demo/shared/marketing-garden/DemoAdminGardenMarketing";
import { luffLearningAdminDemoConfig } from "@/data/school-demos/luff-learning-admin-demo";

/** DemoStage "marketing": the Garden automations demo (no registry import). */
export default function DemoStageAdminMarketing() {
  return <DemoAdminGardenMarketing config={luffLearningAdminDemoConfig} />;
}
