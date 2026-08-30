import { formatShortDate } from "@/lib/admissions/application-submissions";
import { formatRelativeTime } from "@/lib/school-admin/activity-notifications";

type StudentEnrolledCellProps = {
  enrolledAt: string;
};

export default function StudentEnrolledCell({ enrolledAt }: StudentEnrolledCellProps) {
  if (!enrolledAt) {
    return <span style={{ color: "#849095" }}>—</span>;
  }

  return (
    <div className="min-w-0">
      <div className="text-xs font-semibold" style={{ color: "#2C3E43" }}>
        {formatRelativeTime(enrolledAt)}
      </div>
      <div className="mt-0.5 text-[11px]" style={{ color: "#849095" }}>
        {formatShortDate(enrolledAt)}
      </div>
    </div>
  );
}
