import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import SchoolAdminCalendarSkeleton from "@/components/school-admin/skeletons/SchoolAdminCalendarSkeleton";

type AdmissionsDateTimePickerSkeletonProps = {
  C: AdminThemeTokens;
  variant?: "calendar" | "times" | "full";
};

export default function AdmissionsDateTimePickerSkeleton({
  C,
  variant = "full",
}: AdmissionsDateTimePickerSkeletonProps) {
  return <SchoolAdminCalendarSkeleton C={C} variant={variant} label="Loading available dates" />;
}
