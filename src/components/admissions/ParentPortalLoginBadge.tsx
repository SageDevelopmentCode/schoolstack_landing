import type { CSSProperties } from "react";
import { LogIn, UserCheck, UserX } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentPortalLoginStatus } from "@/lib/admissions/parent-portal-login-status";

export type ParentPortalLoginDisplayStatus = Pick<
  ParentPortalLoginStatus,
  "accountLinked" | "hasEverSignedIn" | "lastSignInAt"
>;

type ParentPortalLoginBadgeProps = {
  status: ParentPortalLoginDisplayStatus | null | undefined;
  C?: AdminThemeTokens;
  compact?: boolean;
  className?: string;
};

type AdminBadgeStyle = {
  backgroundColor: string;
  color: string;
};

function formatLastSignIn(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function resolveBadgeStyle(
  status: ParentPortalLoginDisplayStatus,
  C?: AdminThemeTokens,
): AdminBadgeStyle {
  if (!status.accountLinked) {
    return C
      ? { backgroundColor: C.warningBg, color: C.warning }
      : { backgroundColor: "var(--admin-warning-bg, #fef3c7)", color: "var(--admin-warning, #b45309)" };
  }

  if (!status.hasEverSignedIn) {
    return C
      ? { backgroundColor: C.infoBg, color: C.info }
      : { backgroundColor: "var(--admin-info-bg, #e0f2fe)", color: "var(--admin-info, #0369a1)" };
  }

  return C
    ? { backgroundColor: C.successBg, color: C.success }
    : { backgroundColor: "var(--admin-success-bg, #dcfce7)", color: "var(--admin-success, #15803d)" };
}

function resolveLabel(status: ParentPortalLoginDisplayStatus): string {
  if (!status.accountLinked) {
    return "No account";
  }

  if (!status.hasEverSignedIn) {
    return "Never signed in";
  }

  return "Signed in";
}

export function getParentPortalLoginStatusLabel(
  status: ParentPortalLoginDisplayStatus | null | undefined,
): string {
  if (!status) {
    return "—";
  }

  if (!status.accountLinked) {
    return "No account";
  }

  if (!status.hasEverSignedIn) {
    return "Never signed in";
  }

  if (status.lastSignInAt) {
    return `Last signed in ${formatLastSignIn(status.lastSignInAt)}`;
  }

  return "Signed in";
}

export type ParentPortalLoginTooltip = {
  title: string;
  body: string;
};

export function getParentPortalLoginTooltip(
  status: ParentPortalLoginDisplayStatus | null | undefined,
): ParentPortalLoginTooltip | null {
  if (!status) {
    return null;
  }

  if (!status.accountLinked) {
    return {
      title: "No parent account",
      body: "No portal account is linked to this contact.",
    };
  }

  if (!status.hasEverSignedIn) {
    return {
      title: "Account linked",
      body: "Parent account exists but they haven't signed in yet.",
    };
  }

  if (status.lastSignInAt) {
    return {
      title: "Signed in",
      body: `Last signed in ${formatLastSignIn(status.lastSignInAt)}.`,
    };
  }

  return {
    title: "Signed in",
    body: "This contact has signed in to the parent portal.",
  };
}

export default function ParentPortalLoginBadge({
  status,
  C,
  compact = false,
  className = "",
}: ParentPortalLoginBadgeProps) {
  if (!status) {
    return (
      <span
        className={`text-xs ${className}`}
        style={{ color: C?.textTertiary ?? "var(--admin-muted, #6b7280)" }}
      >
        —
      </span>
    );
  }

  const badgeStyle = resolveBadgeStyle(status, C);
  const label = resolveLabel(status);
  const subtitle =
    status.hasEverSignedIn && status.lastSignInAt
      ? formatLastSignIn(status.lastSignInAt)
      : null;

  const badgeClassName = compact
    ? "inline-flex max-w-[12rem] items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
    : "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium";

  const badgeStyleProps: CSSProperties = badgeStyle;

  return (
    <div className={className}>
      <span className={badgeClassName} style={badgeStyleProps} title={getParentPortalLoginStatusLabel(status)}>
        {!status.accountLinked ? (
          <UserX className="h-3 w-3 shrink-0" />
        ) : !status.hasEverSignedIn ? (
          <LogIn className="h-3 w-3 shrink-0" />
        ) : (
          <UserCheck className="h-3 w-3 shrink-0" />
        )}
        <span className="truncate">{label}</span>
      </span>
      {!compact && subtitle ? (
        <p
          className="mt-1 text-[11px]"
          style={{ color: C?.textTertiary ?? "var(--admin-muted, #6b7280)" }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
