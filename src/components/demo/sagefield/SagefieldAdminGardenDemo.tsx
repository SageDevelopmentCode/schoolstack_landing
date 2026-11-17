"use client";

import DemoAdminGardenAdmissions from "@/components/demo/shared/DemoAdminGardenAdmissions";
import { sagefieldAdminDemoConfig } from "@/data/school-demos/sagefield-admin-demo";

/** Case study Admin tab: the real Garden admin portal (Admissions → Submissions) in Sage Field branding. */
export default function SagefieldAdminGardenDemo() {
  return <DemoAdminGardenAdmissions config={sagefieldAdminDemoConfig} />;
}
