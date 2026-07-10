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

function StatusIcon({
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

export function StatusBadge({
  C,
  status,
}: {
  C: AdminThemeTokens;
  status: ApplicationFormStatus;
}) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex shrink-0 rounded p-0.5"
      style={{ backgroundColor: style.bg, color: style.color }}
      aria-label={style.label}
      title={style.label}
    >
      <StatusIcon status={status} className="h-3.5 w-3.5" />
    </span>
  );
}
