"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EnrollmentChecklistExperience from "@/components/admissions/EnrollmentChecklistExperience";
import ApplicationFormPageShell from "@/components/admissions/ApplicationFormPageShell";
import type { LoadedEnrollmentChecklist } from "@/lib/admissions/enrollment-checklist-materialization";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type PublicEnrollmentChecklistClientProps = {
  branding: OrganizationBranding;
  schoolName: string;
  organizationId: string;
  checklist: LoadedEnrollmentChecklist;
};

export default function PublicEnrollmentChecklistClient({
  branding,
  schoolName,
  organizationId,
  checklist,
}: PublicEnrollmentChecklistClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [instances, setInstances] = useState(checklist.instances);

  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      router.refresh();
    }
  }, [router, searchParams]);

  useEffect(() => {
    setInstances(checklist.instances);
  }, [checklist.instances]);

  const liveChecklist = useMemo(
    () => ({
      ...checklist,
      instances,
    }),
    [checklist, instances],
  );

  return (
    <ApplicationFormPageShell branding={branding}>
      <EnrollmentChecklistExperience
        branding={branding}
        schoolName={schoolName}
        title={liveChecklist.title}
        items={liveChecklist.items}
        instances={liveChecklist.instances}
        organizationId={organizationId}
        checklistId={liveChecklist.checklistId}
        onInstancesChange={setInstances}
        mode="live"
      />
    </ApplicationFormPageShell>
  );
}
