import { initialsFromName } from "@/lib/messages/format";
import type { ParentPortalLoginStatus } from "@/lib/admissions/parent-portal-login-status";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import ParentPortalLoginIcon, {
  guardianLoginStatusFromMap,
  submissionContactAvatarStyle,
} from "@/components/admissions/ParentPortalLoginIcon";

type SubmissionContactCellProps = {
  guardianName: string | null;
  contactEmail: string | null;
  primaryGuardianId: string | null;
  loginStatusByGuardianId: Record<string, ParentPortalLoginStatus>;
  loginStatusLoading?: boolean;
  C?: AdminThemeTokens;
  theme?: ParentThemeTokens;
};

export default function SubmissionContactCell({
  guardianName,
  contactEmail,
  primaryGuardianId,
  loginStatusByGuardianId,
  loginStatusLoading = false,
  C,
  theme,
}: SubmissionContactCellProps) {
  const displayName = guardianName?.trim() || "—";
  const loginStatus = guardianLoginStatusFromMap(
    primaryGuardianId,
    loginStatusByGuardianId,
  );
  const avatarStyle = submissionContactAvatarStyle(guardianName);

  return (
    <div className="flex items-center gap-2">
      <span
        className="grid h-[31px] w-[31px] shrink-0 place-items-center rounded-full text-[10px] font-extrabold"
        style={avatarStyle}
        aria-hidden="true"
      >
        {guardianName ? initialsFromName(guardianName).slice(0, 2) : "?"}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-xs font-semibold" style={{ color: "#2C3E43" }}>
            {displayName}
          </span>
          <ParentPortalLoginIcon
            status={loginStatus}
            loading={loginStatusLoading && primaryGuardianId != null}
            C={C}
            theme={theme}
          />
        </div>
        {contactEmail ? (
          <div
            className="mt-0.5 max-w-[14rem] truncate text-[11px]"
            style={{ color: C?.textTertiary ?? "#849095" }}
          >
            {contactEmail}
          </div>
        ) : null}
      </div>
    </div>
  );
}
