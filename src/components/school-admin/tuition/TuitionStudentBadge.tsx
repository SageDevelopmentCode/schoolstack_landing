import type { StudentBadgeColors } from "@/lib/tuition/student-badge-colors";

type TuitionStudentBadgeProps = {
  firstName: string;
  badgeColors: StudentBadgeColors;
};

export default function TuitionStudentBadge({
  firstName,
  badgeColors,
}: TuitionStudentBadgeProps) {
  return (
    <span
      className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{
        backgroundColor: badgeColors.backgroundColor,
        color: badgeColors.color,
      }}
    >
      For {firstName}
    </span>
  );
}
