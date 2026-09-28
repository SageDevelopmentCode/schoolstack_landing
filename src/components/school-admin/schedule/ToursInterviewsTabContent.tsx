"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, ClipboardList, Globe } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AdmissionsAvailabilityEditor from "@/components/school-admin/admissions/AdmissionsAvailabilityEditor";
import PublicTourSchoolSettingsPanel from "@/components/school-admin/admissions/PublicTourSchoolSettingsPanel";
import PublicTourSubmissionsPanel from "@/components/school-admin/admissions/PublicTourSubmissionsPanel";
import TuitionSubTabBar from "@/components/school-admin/tuition/TuitionSubTabBar";
import { parseToursSubtab, type ToursSubtabId } from "@/components/school-admin/schedule/schedule-tabs";
import PublicTourVisibilityBadge from "@/components/school-admin/admissions/PublicTourVisibilityBadge";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ToursInterviewsTabContentProps = {
  C: AdminThemeTokens;
  organizationId: string;
  schoolSlug: string;
  onMonthSlotCountChange?: (count: number) => void;
  onLoadingChange?: (loading: boolean) => void;
  visitsDeferred?: boolean;
};

const TOURS_SUBTABS: ReadonlyArray<{
  id: ToursSubtabId;
  label: string;
  icon: typeof CalendarDays;
}> = [
  { id: "availability", label: "Availability", icon: CalendarDays },
  { id: "submissions", label: "Tour submissions", icon: ClipboardList },
  { id: "public-tour", label: "Public tour page", icon: Globe },
];

export default function ToursInterviewsTabContent({
  C,
  organizationId,
  schoolSlug,
  onMonthSlotCountChange,
  onLoadingChange,
  visitsDeferred = false,
}: ToursInterviewsTabContentProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSubtab = parseToursSubtab(searchParams.get("toursSubtab"));
  const [visitedSubtabs, setVisitedSubtabs] = useState<Set<ToursSubtabId>>(
    () => new Set([activeSubtab]),
  );
  const [platformTourPublic, setPlatformTourPublic] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadStatus() {
      try {
        const response = await fetch(
          `/api/school-admin/admissions/public-tour-settings?organizationId=${encodeURIComponent(organizationId)}`,
        );
        if (!response.ok) return;
        const payload = (await response.json()) as { platformEnabled?: boolean };
        if (!cancelled) {
          setPlatformTourPublic(Boolean(payload.platformEnabled));
        }
      } catch {
        // Non-fatal
      }
    }
    void loadStatus();
    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  const setActiveSubtab = useCallback(
    (subtab: ToursSubtabId) => {
      setVisitedSubtabs((current) => {
        if (current.has(subtab)) return current;
        const next = new Set(current);
        next.add(subtab);
        return next;
      });

      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "tours");
      if (subtab === "availability") {
        params.delete("toursSubtab");
      } else {
        params.set("toursSubtab", subtab);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const subtabLabels = TOURS_SUBTABS.map((tab) => ({
    ...tab,
    badge:
      tab.id === "public-tour" ? (
        <PublicTourVisibilityBadge theme={theme} platformEnabled={platformTourPublic} />
      ) : undefined,
  }));

  return (
    <div className="space-y-4">
      <TuitionSubTabBar
        theme={theme}
        tabs={subtabLabels}
        activeTab={activeSubtab}
        onTabChange={setActiveSubtab}
        ariaLabel="Tours and interviews sections"
        testIdPrefix="schedule-tours"
      />

      {visitedSubtabs.has("availability") ? (
        <div hidden={activeSubtab !== "availability"}>
          <AdmissionsAvailabilityEditor
            C={C}
            organizationId={organizationId}
            onMonthSlotCountChange={onMonthSlotCountChange}
            compactLayout
            storySurface
            onLoadingChange={onLoadingChange}
          />
        </div>
      ) : null}

      {visitedSubtabs.has("submissions") ? (
        <div hidden={activeSubtab !== "submissions"}>
          <PublicTourSubmissionsPanel C={C} visitsDeferred={visitsDeferred} />
        </div>
      ) : null}

      {visitedSubtabs.has("public-tour") ? (
        <div hidden={activeSubtab !== "public-tour"}>
          <PublicTourSchoolSettingsPanel
            C={C}
            organizationId={organizationId}
            schoolSlug={schoolSlug}
            onPlatformEnabledChange={setPlatformTourPublic}
          />
        </div>
      ) : null}
    </div>
  );
}
