import type { ApplicationFormStatus } from "@/lib/admissions/application-form-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

const STATUS_STYLES: Record<
  ApplicationFormStatus,
  { bg: string; color: string; label: string }
> = {
  draft: { bg: "rgba(217, 119, 6, 0.1)", color: "#D97706", label: "Draft" },
  published: { bg: "rgba(22, 163, 74, 0.1)", color: "#16A34A", label: "Published" },
  archived: { bg: "rgba(113, 113, 122, 0.1)", color: "#71717A", label: "Archived" },
};

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
      className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {style.label}
    </span>
  );
}
