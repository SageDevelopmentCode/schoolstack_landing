import {
  formatSubmissionProgress,
  type AdminApplicationSubmission,
} from "@/lib/admissions/application-submissions";
import { formatRelativeTime } from "@/lib/school-admin/activity-notifications";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type SubmissionProgressCellProps = {
  submission: AdminApplicationSubmission;
  theme: ParentThemeTokens;
};

export default function SubmissionProgressCell({
  submission,
  theme,
}: SubmissionProgressCellProps) {
  const primary = formatSubmissionProgress(submission);
  const relativeUpdated = formatRelativeTime(submission.updatedAt);
  const progress = submission.applicationProgressSummary;
  const showBar =
    submission.status === "draft" &&
    progress != null &&
    progress.total > 0;
  const percent = showBar
    ? Math.min(100, Math.round((progress.completed / progress.total) * 100))
    : 0;

  return (
    <div className="min-w-[7rem]">
      {showBar ? (
        <span
          className="mb-1.5 inline-block h-1.5 w-[78px] overflow-hidden rounded-full align-middle"
          style={{ backgroundColor: "#EAF0EB" }}
        >
          <span
            className="block h-full rounded-full"
            style={{ width: `${percent}%`, backgroundColor: theme.primary }}
          />
        </span>
      ) : null}
      <div className="text-xs" style={{ color: "#607078" }}>
        {primary}
      </div>
      {relativeUpdated ? (
        <div className="mt-0.5 text-[10px]" style={{ color: theme.muted }}>
          {relativeUpdated}
        </div>
      ) : null}
    </div>
  );
}
