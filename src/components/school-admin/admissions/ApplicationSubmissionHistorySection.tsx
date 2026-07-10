"use client";

import { Loader2 } from "lucide-react";
import { enrollmentProgressBadgeStyle } from "@/lib/admissions/admin-enrollment-progress";
import {
  applicationStatusBadgeStyle,
} from "@/lib/admissions/application-status-ui";
import type { FamilyAdmissionHistoryEntry } from "@/lib/admissions/application-submissions";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ApplicationSubmissionHistorySectionProps = {
  C: AdminThemeTokens;
  currentApplicationId: string;
  currentApplicationStatus: string;
  entries: FamilyAdmissionHistoryEntry[];
  loading: boolean;
  unlinked: boolean;
  onSelect: (applicationId: string) => void;
};

function isViewingEntry(
  entry: FamilyAdmissionHistoryEntry,
  currentApplicationId: string,
  currentApplicationStatus: string,
): boolean {
  if (entry.applicationId !== currentApplicationId) {
    return false;
  }

  if (entry.kind === "enrollment") {
    return currentApplicationStatus === "enrolling";
  }

  return currentApplicationStatus !== "enrolling";
}

export default function ApplicationSubmissionHistorySection({
  C,
  currentApplicationId,
  currentApplicationStatus,
  entries,
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

  if (entries.length === 0) {
    return (
      <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
        No applications for this family.
      </p>
    );
  }

  return (
    <ul
      className="overflow-hidden rounded-lg border"
      style={{ borderColor: C.border, backgroundColor: C.bg }}
    >
      {entries.map((entry) => {
        const isViewing = isViewingEntry(
          entry,
          currentApplicationId,
          currentApplicationStatus,
        );
        const badgeStyle =
          entry.kind === "enrollment" && entry.enrollmentTone
            ? enrollmentProgressBadgeStyle(entry.enrollmentTone, C)
            : applicationStatusBadgeStyle(entry.applicationBadgeStatus ?? "draft", C);

        return (
          <li
            key={`${entry.kind}-${entry.id}`}
            className="border-b last:border-b-0"
            style={{ borderColor: C.border }}
          >
            <button
              type="button"
              onClick={() => onSelect(entry.applicationId)}
              className="w-full px-4 py-3 text-left transition-colors hover:opacity-90"
              style={{
                backgroundColor: isViewing ? C.accentLight : "transparent",
                borderLeft: isViewing ? `3px solid ${C.accent}` : "3px solid transparent",
              }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: C.textQuaternary }}
              >
                {entry.kind === "enrollment" ? "Enrollment" : "Application"}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  {entry.title}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={badgeStyle}
                >
                  {entry.statusLabel}
                </span>
                {isViewing ? (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ backgroundColor: C.surface, color: C.accent }}
                  >
                    Viewing
                  </span>
                ) : null}
              </div>

              {entry.studentLabel ? (
                <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
                  {entry.studentLabel}
                </p>
              ) : null}

              {entry.programName ? (
                <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
                  {entry.programName}
                </p>
              ) : null}

              <p className="mt-2 text-xs" style={{ color: C.textTertiary }}>
                {entry.progressLabel}
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
