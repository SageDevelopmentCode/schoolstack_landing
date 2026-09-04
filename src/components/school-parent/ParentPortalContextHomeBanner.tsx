"use client";

import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentPortalContextSwitcherDropdown from "@/components/school-parent/ParentPortalContextSwitcherDropdown";
import { useParentPortalContext } from "@/components/school-parent/ParentPortalContextProvider";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";

export default function ParentPortalContextHomeBanner() {
  const { theme } = useParentTheme();
  const { showSwitcher, activeContext } = useParentPortalContext();

  if (!showSwitcher || !activeContext) {
    return null;
  }

  return (
    <ParentCard theme={theme}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <ParentSectionKicker theme={theme}>Your portal</ParentSectionKicker>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: theme.muted }}>
            You&apos;re signed in to{" "}
            <span className="font-semibold" style={{ color: theme.ink }}>
              {activeContext.label}
            </span>
            . Switch anytime if your family uses more than one school portal.
          </p>
        </div>
        <div className="shrink-0">
          <ParentPortalContextSwitcherDropdown variant="card" />
        </div>
      </div>
    </ParentCard>
  );
}
