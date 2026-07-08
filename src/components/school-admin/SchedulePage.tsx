"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import AdmissionsAvailabilityEditor from "@/components/school-admin/admissions/AdmissionsAvailabilityEditor";
import ApplicationSubmissionDetailPanel from "@/components/school-admin/admissions/ApplicationSubmissionDetailPanel";
import ScheduledVisitsSection from "@/components/school-admin/ScheduledVisitsSection";
import type { AdminScheduledVisit } from "@/lib/admissions/admin-scheduled-visits";
import {
  getOrgApplicationSubmissionById,
  type AdminApplicationSubmission,
} from "@/lib/admissions/application-submissions";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

type SchedulePageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  schoolName: string;
  slug: string;
};

export default function SchedulePage({
  organizationId,
  branding,
  schoolName,
  slug,
}: SchedulePageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);
  const [monthSlotCount, setMonthSlotCount] = useState<number | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(
    null,
  );
  const [selectedSubmission, setSelectedSubmission] =
    useState<AdminApplicationSubmission | null>(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);

  const handleVisitClick = useCallback(
    async (visit: AdminScheduledVisit) => {
      if (selectedApplicationId === visit.applicationId) {
        setSelectedApplicationId(null);
        setSelectedSubmission(null);
        return;
      }

      setSelectedApplicationId(visit.applicationId);
      setLoadingSubmission(true);
      setSelectedSubmission(null);

      try {
        const submission = await getOrgApplicationSubmissionById(
          supabase,
          organizationId,
          visit.applicationId,
        );
        setSelectedSubmission(submission);
      } catch {
        setSelectedApplicationId(null);
      } finally {
        setLoadingSubmission(false);
      }
    },
    [organizationId, selectedApplicationId, supabase],
  );

  const handleClosePanel = useCallback(() => {
    setSelectedApplicationId(null);
    setSelectedSubmission(null);
  }, []);

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div
        className="flex h-14 flex-shrink-0 items-center justify-between px-4 sm:px-5"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div>
          <h1 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
            Schedule
          </h1>
          <p className="text-xs" style={{ color: C.textTertiary }}>
            Manage visit availability and see family bookings
          </p>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <div className="space-y-6 px-4 py-5 sm:px-5">
            <section
              className="rounded-sm border p-4 sm:p-5"
              style={{ borderColor: C.border, backgroundColor: C.surface }}
            >
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  Availability
                </h2>
                {monthSlotCount !== null && monthSlotCount > 0 ? (
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                    style={{ backgroundColor: C.accentLight, color: C.accent }}
                  >
                    {monthSlotCount} open slot{monthSlotCount === 1 ? "" : "s"} this month
                  </span>
                ) : null}
              </div>
              <AdmissionsAvailabilityEditor
                C={C}
                organizationId={organizationId}
                onMonthSlotCountChange={setMonthSlotCount}
                compactLayout
              />
            </section>

            <section
              className="rounded-sm border p-4 sm:p-5"
              style={{ borderColor: C.border, backgroundColor: C.surface }}
            >
              <ScheduledVisitsSection
                C={C}
                organizationId={organizationId}
                selectedApplicationId={selectedApplicationId}
                loadingSubmission={loadingSubmission}
                onVisitClick={handleVisitClick}
              />
            </section>
          </div>
        </div>

        {loadingSubmission ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: C.textTertiary }} />
          </div>
        ) : null}

        <AnimatePresence>
          {selectedSubmission ? (
            <ApplicationSubmissionDetailPanel
              key={selectedSubmission.id}
              submission={selectedSubmission}
              organizationId={organizationId}
              branding={branding}
              schoolName={schoolName}
              schoolSlug={slug}
              onClose={handleClosePanel}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
