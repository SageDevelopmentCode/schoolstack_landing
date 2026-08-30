import { submissionContactAvatarStyle } from "@/components/admissions/ParentPortalLoginIcon";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { staffDisplayName } from "@/lib/staff/staff-display";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import { initialsFromName } from "@/lib/messages/format";

type StaffIdentityCellProps = {
  member: StaffMemberRecord;
  C: AdminThemeTokens;
};

export default function StaffIdentityCell({ member, C }: StaffIdentityCellProps) {
  const name = staffDisplayName(member);
  const avatarStyle = submissionContactAvatarStyle(name);

  return (
    <div className="flex items-center gap-2.5">
      <span
        className="grid h-[31px] w-[31px] shrink-0 place-items-center rounded-full text-[10px] font-extrabold"
        style={avatarStyle}
        aria-hidden="true"
      >
        {initialsFromName(name).slice(0, 2)}
      </span>
      <div className="min-w-0">
        <div className="truncate text-xs font-semibold" style={{ color: "#2C3E43" }}>
          {name}
        </div>
        {member.email ? (
          <div
            className="mt-0.5 max-w-[14rem] truncate text-[11px]"
            style={{ color: C.textTertiary }}
          >
            {member.email}
          </div>
        ) : null}
      </div>
    </div>
  );
}
