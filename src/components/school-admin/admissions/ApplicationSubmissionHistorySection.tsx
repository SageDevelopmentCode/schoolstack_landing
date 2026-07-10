"use client";

import { Loader2 } from "lucide-react";
import AdmissionHistoryTimeline from "@/components/school-admin/admissions/AdmissionHistoryTimeline";
import type { FamilyAdmissionTimelineEvent } from "@/lib/admissions/application-submissions";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ApplicationSubmissionHistorySectionProps = {
  C: AdminThemeTokens;
  currentApplicationId: string;
  currentApplicationStatus: string;
  events: FamilyAdmissionTimelineEvent[];
  loading: boolean;
  unlinked: boolean;
  onSelect: (applicationId: string) => void;
};

export function buildAdmissionHistoryContextDescription(
  events: FamilyAdmissionTimelineEvent[],
): string | undefined {
  if (events.length === 0) return undefined;

  const studentLabels = new Set(
    events.map((event) => event.studentLabel).filter((label): label is string => Boolean(label)),
  );
  const programNames = new Set(
    events.map((event) => event.programName).filter((name): name is string => Boolean(name)),
  );

  const parts: string[] = [];
  if (studentLabels.size === 1) {
    parts.push([...studentLabels][0]);
  }
  if (programNames.size === 1) {
    parts.push([...programNames][0]);
  }

  return parts.length > 0 ? parts.join(" · ") : undefined;
}

export default function ApplicationSubmissionHistorySection({
  C,
  currentApplicationId,
  currentApplicationStatus,
  events,
  loading,
  unlinked,
  onSelect,
}: ApplicationSubmissionHistorySectionProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: C.textTertiary }} />
      </div>
    );
  }

  if (unlinked) {
    return (
      <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
        This application isn&apos;t linked to a family yet, so related submissions
        can&apos;t be shown.
      </p>
    );
  }

  if (events.length === 0) {
    return (
      <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
        No applications for this family.
      </p>
    );
  }

  return (
    <AdmissionHistoryTimeline
      C={C}
      events={events}
      currentApplicationId={currentApplicationId}
      currentApplicationStatus={currentApplicationStatus}
      onSelect={onSelect}
    />
  );
}
