import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type StaffLearnersCellProps = {
  assignedStudentCount: number;
  theme: ParentThemeTokens;
};

export default function StaffLearnersCell({
  assignedStudentCount,
  theme,
}: StaffLearnersCellProps) {
  if (assignedStudentCount <= 0) {
    return (
      <span className="text-xs" style={{ color: theme.muted }}>
        No learners assigned
      </span>
    );
  }

  const label =
    assignedStudentCount === 1
      ? "1 learner"
      : `${assignedStudentCount} learners`;

  return (
    <span className="text-xs font-semibold" style={{ color: theme.ink }}>
      {label}
    </span>
  );
}
