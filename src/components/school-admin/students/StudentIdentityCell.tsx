"use client";

import StudentPhoto from "@/components/students/StudentPhoto";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type StudentIdentityCellProps = {
  name: string;
  familyName: string | null;
  photoUrl: string | null;
  hasStandingHealthItems?: boolean;
  C: AdminThemeTokens;
};

export default function StudentIdentityCell({
  name,
  familyName,
  photoUrl,
  hasStandingHealthItems = false,
  C,
}: StudentIdentityCellProps) {
  return (
    <div className="flex items-center gap-2.5">
      <StudentPhoto
        name={name}
        photoUrl={photoUrl}
        size="sm"
        shape="circle"
        accentColor={C.accent}
        accentGlowColor={C.accentLight}
        healthIndicator={hasStandingHealthItems}
        healthIndicatorColor={C.error}
      />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <div className="truncate text-xs font-semibold" style={{ color: "#2C3E43" }}>
            {name}
          </div>
        </div>
        {familyName ? (
          <div
            className="mt-0.5 max-w-[14rem] truncate text-[11px]"
            style={{ color: C.textTertiary }}
          >
            {familyName}
          </div>
        ) : null}
      </div>
    </div>
  );
}
