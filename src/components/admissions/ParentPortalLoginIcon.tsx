import type { CSSProperties } from "react";
import { LogIn, UserCheck, UserX } from "lucide-react";
import AdminHoverTip from "@/components/school-admin/ui/story/AdminHoverTip";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { ParentPortalLoginStatus } from "@/lib/admissions/parent-portal-login-status";
import {
  getParentPortalLoginTooltip,
  type ParentPortalLoginDisplayStatus,
} from "@/components/admissions/ParentPortalLoginBadge";

type ParentPortalLoginIconProps = {
  status: ParentPortalLoginDisplayStatus | null | undefined;
  loading?: boolean;
  C?: AdminThemeTokens;
  theme?: ParentThemeTokens;
  className?: string;
};

function resolveIconColor(
  status: ParentPortalLoginDisplayStatus,
  C?: AdminThemeTokens,
): string {
  if (!status.accountLinked) {
    return C?.warning ?? "#B45309";
  }
  if (!status.hasEverSignedIn) {
    return C?.info ?? "#0369A1";
  }
  return C?.success ?? "#15803D";
}

function LoginStatusIcon({
  status,
  color,
}: {
  status: ParentPortalLoginDisplayStatus;
  color: string;
}) {
  const className = "h-3.5 w-3.5 shrink-0";

  if (!status.accountLinked) {
    return <UserX className={className} style={{ color }} aria-hidden="true" />;
  }
  if (!status.hasEverSignedIn) {
    return <LogIn className={className} style={{ color }} aria-hidden="true" />;
  }
  return <UserCheck className={className} style={{ color }} aria-hidden="true" />;
}

export default function ParentPortalLoginIcon({
  status,
  loading = false,
  C,
  theme,
  className = "",
}: ParentPortalLoginIconProps) {
  if (loading) {
    return (
      <span
        className={`inline-flex h-3.5 w-3.5 shrink-0 rounded-full ${className}`}
        style={{ backgroundColor: C?.bg ?? "#E8EDEE" }}
        aria-hidden="true"
      />
    );
  }

  if (!status) {
    return (
      <span
        className={`inline-flex h-3.5 w-3.5 shrink-0 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const tooltip = getParentPortalLoginTooltip(status);
  const color = resolveIconColor(status, C);
  const ariaLabel = tooltip ? `${tooltip.title}. ${tooltip.body}` : undefined;

  return (
    <span
      className={`inline-flex items-center ${className}`}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <AdminHoverTip
        theme={theme}
        title={tooltip?.title ?? "Parent portal"}
        body={tooltip?.body}
      >
        <button
          type="button"
          tabIndex={0}
          className="inline-flex cursor-default items-center rounded-sm border-0 bg-transparent p-0"
          aria-label={ariaLabel}
        >
          <LoginStatusIcon status={status} color={color} />
        </button>
      </AdminHoverTip>
    </span>
  );
}

export function guardianLoginStatusFromMap(
  guardianId: string | null | undefined,
  loginStatusByGuardianId: Record<string, ParentPortalLoginStatus>,
): ParentPortalLoginDisplayStatus | null {
  if (!guardianId) return null;
  return loginStatusByGuardianId[guardianId] ?? null;
}

export function submissionContactAvatarStyle(name: string | null): CSSProperties {
  const palette = [
    { bg: "#E2EEE3", color: "#35624D" },
    { bg: "#E3EDF2", color: "#456D7A" },
    { bg: "#F3E2E8", color: "#9C5B73" },
    { bg: "#F3EAD7", color: "#896D30" },
    { bg: "#D7C4E2", color: "#604A72" },
  ];
  const source = (name ?? "?").trim() || "?";
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash + source.charCodeAt(index) * (index + 1)) % palette.length;
  }
  return {
    backgroundColor: palette[hash].bg,
    color: palette[hash].color,
  };
}
