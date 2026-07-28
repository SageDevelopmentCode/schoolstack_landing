import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type AdminPageSkeletonProps = {
  branding?: OrganizationBranding;
  label?: string;
};

export default function AdminPageSkeleton({
  branding,
  label = "Loading page",
}: AdminPageSkeletonProps) {
  const C = branding ? buildAdminThemeTokens(branding) : null;

  return (
    <div
      className="flex min-h-[12rem] flex-col gap-4 p-6"
      style={{ backgroundColor: C?.surface ?? "#fff" }}
      aria-busy="true"
      aria-label={label}
    >
      <div
        className="h-6 w-40 animate-pulse rounded"
        style={{ backgroundColor: C?.bg ?? "#f3f4f6" }}
      />
      <div
        className="h-32 animate-pulse rounded-xl"
        style={{ backgroundColor: C?.bg ?? "#f3f4f6" }}
      />
      <div
        className="h-32 animate-pulse rounded-xl"
        style={{ backgroundColor: C?.bg ?? "#f3f4f6" }}
      />
    </div>
  );
}
