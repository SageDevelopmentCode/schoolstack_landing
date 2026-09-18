"use client";

import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";

export default function ParentFridayBranchStoryHeader() {
  const { theme } = useParentTheme();

  return (
    <header className="mb-6">
      <ParentSectionKicker
        theme={theme}
        className="normal-case tracking-normal font-semibold"
      >
        Friday enrichment
      </ParentSectionKicker>
      <ParentDisplayHeading theme={theme}>Friday Branch</ParentDisplayHeading>
      <p className="mt-1 text-sm" style={{ color: theme.muted }}>
        Friday enrichment and community programming.
      </p>
    </header>
  );
}
