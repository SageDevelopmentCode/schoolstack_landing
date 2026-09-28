"use client";

import { useMemo, useState } from "react";
import { SchoolAdminTableSkeleton } from "@/components/school-admin/skeletons";
import { useScheduleVisitsContext } from "@/components/school-admin/schedule/schedule-visits-context";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import PublicTourSubmissionDetailPanel, {
  registrantFromVisit,
} from "@/components/school-admin/admissions/PublicTourSubmissionDetailPanel";
import {
  labelFromPublicRegistrant,
  type AdminScheduledVisit,
} from "@/lib/admissions/admin-scheduled-visits";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type PublicTourSubmissionsPanelProps = {
  C: AdminThemeTokens;
  visitsDeferred?: boolean;
};

export default function PublicTourSubmissionsPanel({
  C,
  visitsDeferred = false,
}: PublicTourSubmissionsPanelProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const { visits, visitsReady } = useScheduleVisitsContext();
  const loading = visitsDeferred || !visitsReady;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const publicVisits = useMemo(
    () =>
      visits
        .filter((visit) => visit.bookingSource === "public")
        .sort((a, b) => comparePublicVisits(a, b)),
    [visits],
  );

  const selectedVisit = publicVisits.find((visit) => visit.id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      <div>
        <h2
          className="font-heading text-lg font-semibold"
          style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
        >
          Tour submissions
        </h2>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: theme.muted }}>
          Families who booked a campus tour from your public tour page, without an application.
        </p>
      </div>

      {loading ? (
        <SchoolAdminTableSkeleton
          C={C}
          rows={4}
          columns={4}
          showFilters={false}
          compact
          label="Loading tour submissions"
        />
      ) : publicVisits.length === 0 ? (
        <AdminCard theme={theme} padding="canvas">
          <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
            No public tour bookings yet.
          </p>
        </AdminCard>
      ) : (
        <AdminCard theme={theme} padding="none">
          <div className="overflow-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead
                style={{ backgroundColor: "#FBFCFB", borderBottom: "1px solid #EDF1ED" }}
              >
                <tr>
                  {["When", "Contact", "Email", "Status"].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.08em] first:pl-5 last:pr-5"
                      style={{ color: "#8B9699" }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {publicVisits.map((visit) => {
                  const registrant = registrantFromVisit(visit);
                  const isSelected = visit.id === selectedId;
                  return (
                    <tr
                      key={visit.id}
                      onClick={() => setSelectedId(visit.id)}
                      className="cursor-pointer transition-colors hover:bg-[#FAFCFA]"
                      style={{
                        backgroundColor: isSelected ? "#E9F2EA" : "transparent",
                        borderBottom: "1px solid #EDF1ED",
                        boxShadow: isSelected
                          ? `inset 3px 0 0 ${theme.primary}`
                          : undefined,
                      }}
                    >
                      <td
                        className="px-4 py-3 text-xs font-medium first:pl-5"
                        style={{ color: theme.ink }}
                      >
                        {visit.whenLabel}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: theme.ink }}>
                        {labelFromPublicRegistrant(visit.registrant) ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: theme.muted }}>
                        {registrant?.contactEmail ?? "—"}
                      </td>
                      <td className="px-4 py-3 last:pr-5">
                        <AdminChip
                          theme={theme}
                          tone={
                            visit.timing === "past"
                              ? "purple"
                              : visit.timing === "happening"
                                ? "success"
                                : "info"
                          }
                        >
                          {visit.timing === "upcoming"
                            ? "Upcoming"
                            : visit.timing === "happening"
                              ? "Happening"
                              : "Past"}
                        </AdminChip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      <PublicTourSubmissionDetailPanel
        visit={selectedVisit}
        C={C}
        theme={theme}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

function comparePublicVisits(a: AdminScheduledVisit, b: AdminScheduledVisit): number {
  const dateCompare = b.scheduledDate.localeCompare(a.scheduledDate);
  if (dateCompare !== 0) return dateCompare;
  return b.startTimeSlot.localeCompare(a.startTimeSlot);
}
