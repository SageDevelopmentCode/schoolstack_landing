"use client";

import type { EnrollmentChecklistTemplate } from "@/lib/admissions/enrollment-checklist-templates";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type EnrollmentChecklistStubEditorProps = {
  branding: OrganizationBranding;
  template: EnrollmentChecklistTemplate;
};

export default function EnrollmentChecklistStubEditor({
  branding,
  template,
}: EnrollmentChecklistStubEditorProps) {
  const C = buildAdminThemeTokens(branding);

  const statusStyle =
    template.status === "published"
      ? { backgroundColor: C.successBg, color: C.success, label: "Published" }
      : template.status === "archived"
        ? { backgroundColor: C.elevated, color: C.textTertiary, label: "Archived" }
        : { backgroundColor: C.warningBg, color: C.warning, label: "Draft" };

  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ backgroundColor: C.surface }}>
      <div
        className="flex flex-shrink-0 flex-wrap items-center gap-3 border-b px-5 py-3"
        style={{ borderColor: C.border }}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold" style={{ color: C.textPrimary }}>
            {template.name}
          </p>
          <div
            className="mt-1 flex flex-wrap items-center gap-2 text-[11px]"
            style={{ color: C.textTertiary }}
          >
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ backgroundColor: statusStyle.backgroundColor, color: statusStyle.color }}
            >
              {statusStyle.label}
            </span>
            <span>Checklist</span>
            <span>/enrollment/{template.enrollmentPath}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="max-w-md text-center">
          <h2 className="text-lg font-semibold" style={{ color: C.accentDark }}>
            Checklist builder coming soon
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
            This enrollment checklist will guide families through post-acceptance steps like
            documents, payments, and acknowledgments. Item configuration will be added in a
            future update.
          </p>
        </div>
      </div>
    </div>
  );
}
