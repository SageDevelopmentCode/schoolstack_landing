"use client";

import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentPortalContextSwitcherDropdown from "@/components/school-parent/ParentPortalContextSwitcherDropdown";
import { useParentPortalContext } from "@/components/school-parent/ParentPortalContextProvider";

export default function ParentPortalContextTopBar() {
  const { theme } = useParentTheme();
  const { showSwitcher, activeContext } = useParentPortalContext();

  if (!showSwitcher || !activeContext) {
    return null;
  }

  return (
    <div
      className="border-b px-4 py-2 sm:px-7"
      style={{
        backgroundColor: theme.primarySoft,
        borderColor: theme.line,
      }}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3">
        <p
          className="min-w-0 truncate text-xs font-medium sm:text-[13px]"
          style={{ color: theme.ink }}
        >
          You&apos;re viewing:{" "}
          <span className="font-semibold" style={{ color: theme.primary }}>
            {activeContext.label}
          </span>
        </p>
        <ParentPortalContextSwitcherDropdown variant="compact" />
      </div>
    </div>
  );
}
