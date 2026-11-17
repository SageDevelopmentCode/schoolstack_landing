"use client";

import DemoAdminGardenDashboard from "@/components/demo/shared/DemoAdminGardenDashboard";
import { luffLearningAdminDemoConfig } from "@/data/school-demos/luff-learning-admin-demo";

/** DemoStage "admin": the real Garden admin Dashboard on demo fixtures (no registry import). */
export default function DemoStageAdminDashboard() {
  return <DemoAdminGardenDashboard config={luffLearningAdminDemoConfig} />;
}
