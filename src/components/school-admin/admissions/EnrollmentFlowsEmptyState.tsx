"use client";

import { ClipboardList, FileText, Loader2 } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";

type EnrollmentFlowsEmptyStateProps = {
  C: AdminThemeTokens;
  creating: boolean;
  onCreateApply: () => void;
  onCreateChecklist: () => void;
};

export default function EnrollmentFlowsEmptyState({
  C,
  creating,
  onCreateApply,
  onCreateChecklist,
}: EnrollmentFlowsEmptyStateProps) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: C.bg }}
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: C.accentGlow, color: C.accent }}
      >
        <FileText className="h-6 w-6" aria-hidden />
      </div>
      <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
        Set up your enrollment flows
      </h2>
      <p className="mt-2 max-w-md text-sm" style={{ color: C.textSecondary }}>
        Create an apply form for families to submit applications, and an
        enrollment checklist for accepted families to complete enrollment steps.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onCreateApply}
          disabled={creating}
          className="flex items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          style={getAdminButtonStyle(C, "primary")}
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          Create apply form
        </button>
        <button
          type="button"
          onClick={onCreateChecklist}
          disabled={creating}
          className="flex items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          style={getAdminButtonStyle(C, "secondary")}
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ClipboardList className="h-4 w-4" />
          )}
          Create enrollment checklist
        </button>
      </div>
    </div>
  );
}
