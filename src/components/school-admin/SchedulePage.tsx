"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { SchoolAdminDetailPanelSkeleton } from "@/components/school-admin/skeletons";
import AdmissionsAvailabilityEditor from "@/components/school-admin/admissions/AdmissionsAvailabilityEditor";
import AdmissionsObservationDayAvailabilityEditor from "@/components/school-admin/admissions/AdmissionsObservationDayAvailabilityEditor";
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
  const [monthObservationDayCount, setMonthObservationDayCount] = useState<number | null>(
    null,
  );
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
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <div className="space-y-6 px-4 py-5 sm:px-5">
            <section
              className="rounded-sm border p-4 sm:p-5"
              style={{ borderColor: C.border, backgroundColor: C.surface }}
            >
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  Tours & interviews
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
              <p className="mb-4 text-xs" style={{ color: C.textTertiary }}>
                Set 30-minute time slots for campus tours and family interviews.
              </p>
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
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  Shadow / observation days
                </h2>
                {monthObservationDayCount !== null && monthObservationDayCount > 0 ? (
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                    style={{ backgroundColor: C.accentLight, color: C.accent }}
                  >
                    {monthObservationDayCount} open day
                    {monthObservationDayCount === 1 ? "" : "s"} this month
                  </span>
                ) : null}
              </div>
              <p className="mb-4 text-xs" style={{ color: C.textTertiary }}>
                Open whole school days for multi-day student shadow visits.
              </p>
              <AdmissionsObservationDayAvailabilityEditor
                C={C}
                organizationId={organizationId}
                onMonthDayCountChange={setMonthObservationDayCount}
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
          <div
            className="absolute inset-y-0 right-0 z-10 flex w-full max-w-lg flex-col border-l shadow-lg sm:max-w-xl"
            style={{
              borderColor: C.border,
              backgroundColor: C.surface,
            }}
            aria-busy="true"
            aria-label="Loading application"
          >
            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
              <SchoolAdminDetailPanelSkeleton C={C} label="Loading application" />
            </div>
          </div>
        ) : null}
      </div>

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
  );
}
