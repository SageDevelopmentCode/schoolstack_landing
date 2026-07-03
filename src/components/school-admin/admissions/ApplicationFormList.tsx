"use client";

import { Plus } from "lucide-react";
import {
  formatFormUpdatedAt,
  type ApplicationFormStatus,
  type ApplicationFormVersion,
} from "@/lib/admissions/application-form-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

const STATUS_STYLES: Record<
  ApplicationFormStatus,
  { bg: string; color: string; label: string }
> = {
  draft: { bg: "rgba(217, 119, 6, 0.1)", color: "#D97706", label: "Draft" },
  published: { bg: "rgba(22, 163, 74, 0.1)", color: "#16A34A", label: "Published" },
  archived: { bg: "rgba(113, 113, 122, 0.1)", color: "#71717A", label: "Archived" },
};

type ApplicationFormListProps = {
  C: AdminThemeTokens;
  forms: ApplicationFormVersion[];
  selectedId: string | null;
  creating: boolean;
  onSelect: (id: string) => void;
  onCreate: () => void;
};

export default function ApplicationFormList({
  C,
  forms,
  selectedId,
  creating,
  onSelect,
  onCreate,
}: ApplicationFormListProps) {
  return (
    <div
      className="flex flex-col flex-shrink-0 overflow-hidden h-full"
      style={{
        width: 240,
        borderRight: `1px solid ${C.border}`,
        backgroundColor: C.bg,
      }}
    >
      <div
        className="flex h-14 flex-shrink-0 items-center justify-between px-3"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>
          Application forms
        </span>
        <button
          type="button"
          onClick={onCreate}
          disabled={creating}
          className="flex items-center gap-1 rounded-sm px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
          style={{ backgroundColor: C.accentLight, color: C.accent }}
        >
          <Plus className="w-3.5 h-3.5" />
          New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {forms.length === 0 ? (
          <p className="px-3 py-4 text-xs" style={{ color: C.textTertiary }}>
            No application forms yet. Create one to get started.
          </p>
        ) : (
          forms.map((form) => {
            const isActive = form.id === selectedId;
            const statusStyle = STATUS_STYLES[form.status];
            return (
              <button
                key={form.id}
                type="button"
                onClick={() => onSelect(form.id)}
                className="w-full text-left px-3 py-3 transition-all"
                style={{
                  backgroundColor: isActive ? C.accentLight : "transparent",
                  borderBottom: `1px solid ${C.border}`,
                  borderLeft: isActive
                    ? `2px solid ${C.accent}`
                    : "2px solid transparent",
                }}
              >
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: isActive ? C.accent : C.textPrimary }}
                >
                  {form.title}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span
                    className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase"
                    style={{
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                    }}
                  >
                    {statusStyle.label}
                  </span>
                  <span className="text-[10px]" style={{ color: C.textTertiary }}>
                    v{form.version}
                  </span>
                </div>
                <p className="text-[10px] mt-0.5" style={{ color: C.textTertiary }}>
                  {form.schema.sections.length} step
                  {form.schema.sections.length === 1 ? "" : "s"} ·{" "}
                  {formatFormUpdatedAt(form.updated_at)}
                </p>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
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
      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {style.label}
    </span>
  );
}
