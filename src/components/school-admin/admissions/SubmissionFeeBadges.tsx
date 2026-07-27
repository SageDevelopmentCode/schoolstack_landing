"use client";

import {
  buildSubmissionFeeBadges,
  formatSubmissionFeeBadgeLabel,
  submissionFeeBadgeStyle,
} from "@/lib/admissions/admin-submission-fee-badges";
import type { AdminApplicationSubmission } from "@/lib/admissions/application-submissions";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type SubmissionFeeBadgesProps = {
  submission: AdminApplicationSubmission;
  C: AdminThemeTokens;
};

export default function SubmissionFeeBadges({
  submission,
  C,
}: SubmissionFeeBadgesProps) {
  const badges = buildSubmissionFeeBadges(submission);

  if (badges.length === 0) {
    return <span style={{ color: C.textTertiary }}>—</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      {badges.map((badge) => (
        <span
          key={badge.key}
          className="inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium"
          style={submissionFeeBadgeStyle(badge.status, C)}
        >
          {formatSubmissionFeeBadgeLabel(badge)}
        </span>
      ))}
    </div>
  );
}
