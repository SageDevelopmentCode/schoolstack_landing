"use client";

import ParentPortalContextSwitcherDropdown from "@/components/school-parent/ParentPortalContextSwitcherDropdown";
import { useParentPortalContext } from "@/components/school-parent/ParentPortalContextProvider";
import { MUDKITCHEN_LOGO_BRAND } from "@/lib/mudkitchen-portal/theme";

const WARM_TOP_BAR_TEXT = "#5C4A3A";
const WARM_TOP_BAR_BORDER = "rgba(194, 105, 79, 0.25)";

export default function ParentPortalContextTopBar() {
  const { showSwitcher, activeContext } = useParentPortalContext();

  if (!showSwitcher || !activeContext) {
    return null;
  }

  return (
    <div
      className="px-4 py-2.5 sm:px-7 sm:py-3"
      style={{
        backgroundColor: MUDKITCHEN_LOGO_BRAND.cream,
        borderBottom: `1px solid ${WARM_TOP_BAR_BORDER}`,
      }}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3">
        <p
          className="min-w-0 truncate text-xs font-medium sm:text-[13px]"
          style={{ color: WARM_TOP_BAR_TEXT }}
        >
          You&apos;re viewing:{" "}
          <span
            className="font-semibold"
            style={{ color: MUDKITCHEN_LOGO_BRAND.terracotta }}
          >
            {activeContext.label}
          </span>
        </p>
        <ParentPortalContextSwitcherDropdown variant="compact" triggerTone="warm" />
      </div>
    </div>
  );
}
