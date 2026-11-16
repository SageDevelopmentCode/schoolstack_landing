"use client";

import { ArrowRight } from "lucide-react";
import { GChip, PANEL_TINTS, type GChipTone } from "@/components/school-parent/garden/ui";
import ParentPortalLoginIcon, {
  guardianLoginStatusFromMap,
} from "@/components/admissions/ParentPortalLoginIcon";
import { deriveSubmissionNextStep } from "@/lib/admissions/admin-submission-next-step";
import {
  buildSubmissionFeeBadges,
  formatSubmissionFeeBadgeLabel,
  type SubmissionFeeBadgeStatus,
} from "@/lib/admissions/admin-submission-fee-badges";
import {
  formatSubmissionProgress,
  type AdminApplicationSubmission,
} from "@/lib/admissions/application-submissions";
import type { ParentPortalLoginStatus } from "@/lib/admissions/parent-portal-login-status";
import { initialsFromName } from "@/lib/messages/format";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { formatRelativeTime } from "@/lib/school-admin/activity-notifications";

/*
 * Garden table cells for Admissions → Submissions. Same data helpers as the
 * story cells (SubmissionContactCell, …), which the marketing demos keep.
 */

function nameTint(name: string | null): string {
  if (!name) return PANEL_TINTS[0];
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return PANEL_TINTS[hash % PANEL_TINTS.length];
}

export function toGChipTone(tone: string): GChipTone {
  switch (tone) {
    case "success":
    case "complete":
      return "success";
    case "warning":
    case "not_started":
    case "pending":
      return "warning";
    case "alert":
      return "alert";
    case "info":
    case "in_progress":
    case "scheduled":
    case "purple":
      return "info";
    default:
      return "neutral";
  }
}

const FEE_TONES: Record<SubmissionFeeBadgeStatus, GChipTone> = {
  paid: "success",
  pending: "warning",
  waived: "neutral",
};

export function GardenContactCell({
  submission,
  loginStatusByGuardianId,
  loginStatusLoading,
  theme,
}: {
  submission: AdminApplicationSubmission;
  loginStatusByGuardianId: Record<string, ParentPortalLoginStatus>;
  loginStatusLoading: boolean;
  theme: ParentThemeTokens;
}) {
  const name = submission.guardianName?.trim() || "—";
  const loginStatus = guardianLoginStatusFromMap(submission.primaryGuardianId, loginStatusByGuardianId);
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] text-[12px] font-extrabold text-[var(--sf-ink)]/70 ${nameTint(submission.guardianName)}`}
      >
        {submission.guardianName ? initialsFromName(submission.guardianName).slice(0, 2) : "?"}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[14px] font-extrabold text-[var(--sf-ink)]">{name}</span>
          {/* Above the card's stretched open-button on phones (see SubmissionsTable). */}
          <span className="pointer-events-auto relative z-10 inline-flex">
            <ParentPortalLoginIcon
              status={loginStatus}
              loading={loginStatusLoading && submission.primaryGuardianId != null}
              theme={theme}
            />
          </span>
        </div>
        {submission.contactEmail ? (
          <div className="max-w-[14rem] truncate text-[12px] font-semibold text-[var(--sf-soft)]">
            {submission.contactEmail}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function GardenProgressCell({ submission }: { submission: AdminApplicationSubmission }) {
  const primary = formatSubmissionProgress(submission);
  const relativeUpdated = formatRelativeTime(submission.updatedAt);
  const progress = submission.applicationProgressSummary;
  const showBar = submission.status === "draft" && progress != null && progress.total > 0;
  const percent = showBar ? Math.min(100, Math.round((progress.completed / progress.total) * 100)) : 0;
  return (
    <div className="min-w-[7rem]">
      {showBar ? (
        <span
          className="mb-1.5 block h-2 w-[84px] overflow-hidden rounded-full border-[1.5px] border-[var(--sf-ink)]/70 bg-white"
          role="img"
          aria-label={`${percent}% complete`}
        >
          <span className="block h-full bg-[var(--sf-clay)]" style={{ width: `${percent}%` }} />
        </span>
      ) : null}
      <div className="text-[13px] font-bold text-[var(--sf-ink)]/80">{primary}</div>
      {relativeUpdated ? (
        <div className="mt-0.5 text-[11.5px] font-semibold text-[var(--sf-soft)]">{relativeUpdated}</div>
      ) : null}
    </div>
  );
}

export function GardenNextStepCell({ submission }: { submission: AdminApplicationSubmission }) {
  const next = deriveSubmissionNextStep(submission);
  return (
    <div className="min-w-[8rem]">
      {next.presentation === "cta" ? (
        <span className="inline-flex items-center gap-1 rounded-full border-[1.5px] border-[var(--sf-clay)]/40 bg-[var(--sf-accent-wash)] px-2.5 py-1 text-[12.5px] font-extrabold text-[var(--sf-clay-deep)]">
          {next.primary}
          <ArrowRight className="h-3 w-3" aria-hidden />
        </span>
      ) : (
        <GChip tone={toGChipTone(next.tone)}>{next.primary}</GChip>
      )}
      {next.secondary ? (
        <div className="mt-1 text-[11.5px] font-semibold text-[var(--sf-soft)]">{next.secondary}</div>
      ) : null}
    </div>
  );
}

export function GardenFeeBadges({ submission }: { submission: AdminApplicationSubmission }) {
  const badges = buildSubmissionFeeBadges(submission);
  if (badges.length === 0) return <span className="text-[var(--sf-soft)]">—</span>;
  return (
    <div className="flex flex-col items-start gap-1">
      {badges.map((badge) => (
        <GChip key={badge.key} tone={FEE_TONES[badge.status]}>
          {formatSubmissionFeeBadgeLabel(badge)}
        </GChip>
      ))}
    </div>
  );
}
