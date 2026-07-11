"use client";

import type { FamilyApplication } from "@/lib/admissions/parent-portal-access";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ApplyChildTabSelectorProps = {
  C: AdminThemeTokens;
  applications: FamilyApplication[];
  activeApplicationId: string;
  onChange: (applicationId: string) => void;
};

function tabLabel(application: FamilyApplication): string {
  return application.studentName ?? application.formTitle;
}

function hasPendingRequired(application: FamilyApplication): boolean {
  return application.postSubmitTasks.some(
    (task) => task.required && task.status === "pending",
  );
}

export default function ApplyChildTabSelector({
  C,
  applications,
  activeApplicationId,
  onChange,
}: ApplyChildTabSelectorProps) {
  if (applications.length <= 1) return null;

  return (
    <div
      className="mt-4 flex flex-wrap gap-2"
      role="tablist"
      aria-label="Select child"
    >
      {applications.map((application) => {
        const isActive = application.id === activeApplicationId;
        const pending = hasPendingRequired(application);

        return (
          <button
            key={application.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(application.id)}
            className="relative inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition"
            style={
              isActive
                ? {
                    backgroundColor: C.accent,
                    color: "#FFFFFF",
                  }
                : {
                    backgroundColor: C.surface,
                    color: C.textSecondary,
                    border: `1px solid ${C.border}`,
                  }
            }
          >
            {tabLabel(application)}
            {pending ? (
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: isActive ? "#FFFFFF" : C.warning,
                }}
                aria-label="Has pending required steps"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
