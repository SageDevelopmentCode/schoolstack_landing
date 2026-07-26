"use client";

import type { ParentBillingChildView } from "@/lib/tuition/parent-billing-summary";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import ParentNeedsScheduleBadge from "@/components/school-parent/billing/ParentNeedsScheduleBadge";

type ParentBillingChildTabsProps = {
  C: AdminThemeTokens;
  childViews: ParentBillingChildView[];
  activeChildKey: string;
  onChange: (childKey: string) => void;
};

function childFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export default function ParentBillingChildTabs({
  C,
  childViews,
  activeChildKey,
  onChange,
}: ParentBillingChildTabsProps) {
  return (
    <div className="flex flex-col gap-4" data-testid="parent-billing-child-tabs">
      <div className="-mb-px flex gap-6 border-b" style={{ borderColor: C.border }}>
        {childViews.map((child) => {
          const active = child.childKey === activeChildKey;
          return (
            <button
              key={child.childKey}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(child.childKey)}
              className="inline-flex items-center gap-2 px-1 py-2 text-sm font-medium -mb-px"
              style={{
                color: active ? C.accent : C.textSecondary,
                borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent",
              }}
            >
              {childFirstName(child.studentName)}
              {child.status === "needs_schedule" ? (
                <ParentNeedsScheduleBadge C={C} label="Setup" size="sm" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
