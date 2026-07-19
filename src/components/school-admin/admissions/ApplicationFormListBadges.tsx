import { Archive, CheckCircle2, CircleDashed } from "lucide-react";
import type { ApplicationFormStatus } from "@/lib/admissions/application-form-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

export const FLOW_TYPE_LABELS = {
  apply: "Apply form",
  checklist: "Enrollment checklist",
} as const;

const STATUS_STYLES: Record<
  ApplicationFormStatus,
  { bg: string; color: string; label: string }
> = {
  draft: { bg: "rgba(217, 119, 6, 0.1)", color: "#D97706", label: "Draft" },
  published: { bg: "rgba(22, 163, 74, 0.1)", color: "#16A34A", label: "Published" },
  archived: { bg: "rgba(113, 113, 122, 0.1)", color: "#71717A", label: "Archived" },
};

const STATUS_ICON_SIZES = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
} as const;

export function getStatusLabel(status: ApplicationFormStatus): string {
  return STATUS_STYLES[status].label;
}

function StatusGlyph({
  status,
  className,
}: {
  status: ApplicationFormStatus;
  className?: string;
}) {
  switch (status) {
    case "published":
      return <CheckCircle2 className={className} aria-hidden />;
    case "archived":
      return <Archive className={className} aria-hidden />;
    default:
      return <CircleDashed className={className} aria-hidden />;
  }
}

export function StatusIcon({
  status,
  size = "sm",
  variant = "badge",
}: {
  status: ApplicationFormStatus;
  size?: keyof typeof STATUS_ICON_SIZES;
  variant?: "badge" | "plain";
}) {
  const style = STATUS_STYLES[status];
  const iconClassName = STATUS_ICON_SIZES[size];

  if (variant === "plain") {
    return (
      <span
        className="inline-flex shrink-0"
        style={{ color: style.color }}
        aria-label={style.label}
        title={style.label}
      >
        <StatusGlyph status={status} className={iconClassName} />
      </span>
    );
  }

  return (
    <span
      className="inline-flex shrink-0 rounded p-0.5"
      style={{ backgroundColor: style.bg, color: style.color }}
      aria-label={style.label}
      title={style.label}
    >
      <StatusGlyph status={status} className={iconClassName} />
    </span>
  );
}

export function StatusBadge({
  C: _C,
  status,
}: {
  C: AdminThemeTokens;
  status: ApplicationFormStatus;
}) {
  return <StatusIcon status={status} size="sm" variant="badge" />;
}
