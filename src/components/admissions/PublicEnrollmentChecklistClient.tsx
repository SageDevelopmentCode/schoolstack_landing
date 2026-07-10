"use client";

import { useMemo, useState } from "react";
import EnrollmentChecklistExperience from "@/components/admissions/EnrollmentChecklistExperience";
import ApplicationFormPageShell from "@/components/admissions/ApplicationFormPageShell";
import type { LoadedEnrollmentChecklist } from "@/lib/admissions/enrollment-checklist-materialization";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type PublicEnrollmentChecklistClientProps = {
  branding: OrganizationBranding;
  schoolName: string;
  checklist: LoadedEnrollmentChecklist;
};

export default function PublicEnrollmentChecklistClient({
  branding,
  schoolName,
  checklist,
}: PublicEnrollmentChecklistClientProps) {
  const [instances, setInstances] = useState(checklist.instances);

  const liveChecklist = useMemo(
    () => ({
      ...checklist,
      instances,
    }),
    [checklist, instances],
  );

  return (
    <ApplicationFormPageShell branding={branding} fillParent>
      <EnrollmentChecklistExperience
        branding={branding}
        schoolName={schoolName}
        title={liveChecklist.title}
        items={liveChecklist.items}
        instances={liveChecklist.instances}
        onInstancesChange={setInstances}
        mode="live"
      />
    </ApplicationFormPageShell>
  );
}
