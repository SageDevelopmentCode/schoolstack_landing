"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import SubmissionContactCell from "@/components/school-admin/admissions/SubmissionContactCell";
import ProgramCoopFamilyDetailPanel from "@/components/school-admin/admissions/ProgramCoopFamilyDetailPanel";
import { BuilderQuestionCard, BuilderSectionIntro } from "./builder-question-card";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import StudentEnrolledCell from "@/components/school-admin/students/StudentEnrolledCell";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  filterProgramCoopFamiliesAdminRows,
  formatCoopFamilyLearnersSummary,
  loadProgramCoopFamiliesAdminData,
  searchProgramCoopFamiliesAdminRows,
  type ProgramCoopFamiliesFilter,
  type ProgramCoopFamilyAdminRow,
} from "@/lib/admissions/program-coop-families-admin";
import { adminStudentRowStyle } from "@/lib/school-admin/admin-student-row-style";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

type CoopProgramEditorTab = "supply_list" | "teaching_schedule";

type ProgramCoopFamiliesCardProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  schoolSlug: string;
  supabase: SupabaseClient;
  organizationId: string;
  programId: string;
  coopModeEnabled: boolean;
  onNavigateTab?: (tab: CoopProgramEditorTab) => void;
};

const TABLE_HEADINGS = [
  "Family",
  "Learners",
  "Contact",
  "Supply",
  "Teaching",
  "Enrolled",
] as const;

const EMPTY_COOP_FAMILIES_SUMMARY = {
  familyCount: 0,
  learnerCount: 0,
  unassignedSupplyItemCount: 0,
  unfilledTeachingWeekCount: 0,
};

function StoryFilterPill({
  active,
  label,
  count,
  onClick,
  theme,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
  theme: ParentThemeTokens;
}) {
  const displayLabel = count != null ? `${label} · ${count}` : label;

  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-[9px] border px-2.5 py-2 text-[11px] font-medium transition-colors"
      style={
        active
          ? {
              backgroundColor: "#E9F2EA",
              color: theme.primary,
              borderColor: "#BCD4C1",
              fontWeight: 700,
            }
          : {
              backgroundColor: theme.white,
              color: "#5D6D73",
              borderColor: "#DCE4DC",
            }
      }
    >
      {displayLabel}
    </button>
  );
}

export default function ProgramCoopFamiliesCard({
  C,
  theme,
  schoolSlug,
  supabase,
  organizationId,
  programId,
  coopModeEnabled,
  onNavigateTab,
}: ProgramCoopFamiliesCardProps) {
  const [families, setFamilies] = useState<ProgramCoopFamilyAdminRow[]>([]);
  const [summary, setSummary] = useState(EMPTY_COOP_FAMILIES_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<ProgramCoopFamiliesFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [prevProgramId, setPrevProgramId] = useState(programId);
  const loadGenerationRef = useRef(0);

  if (programId !== prevProgramId) {
    setPrevProgramId(programId);
    setSelectedId(null);
    setFamilies([]);
    setSummary(EMPTY_COOP_FAMILIES_SUMMARY);
  }

  const loadFamilies = useCallback(async () => {
    const generation = ++loadGenerationRef.current;
    const requestedProgramId = programId;
    setLoading(true);
    try {
      const result = await loadProgramCoopFamiliesAdminData(supabase, {
        organizationId,
        programId: requestedProgramId,
      });
      if (generation !== loadGenerationRef.current) return;
      setFamilies(result.families);
      setSummary(result.summary);
    } catch (err) {
      if (generation !== loadGenerationRef.current) return;
      setFamilies([]);
      setSummary(EMPTY_COOP_FAMILIES_SUMMARY);
      adminToast.error(formatActionError(err, "Failed to load co-op families."));
      void reportPortalOperationalError(
        "school_admin",
        {
          organizationId,
          operation: "programs.coop_families.load",
          error: "",
        },
        err,
      );
    } finally {
      if (generation === loadGenerationRef.current) {
        setLoading(false);
      }
    }
  }, [organizationId, programId, supabase]);

  useEffect(() => {
    if (!coopModeEnabled) {
      queueMicrotask(() => setLoading(false));
      return;
    }
    queueMicrotask(() => {
      void loadFamilies();
    });
  }, [coopModeEnabled, loadFamilies]);

  const filteredFamilies = useMemo(() => {
    const searched = searchProgramCoopFamiliesAdminRows(families, searchQuery);
    return filterProgramCoopFamiliesAdminRows(searched, filter);
  }, [families, filter, searchQuery]);

  const selectedFamily = useMemo(
    () => families.find((family) => family.familyId === selectedId) ?? null,
    [families, selectedId],
  );

  const needsSupplyCount = useMemo(
    () => families.filter((family) => family.hasSupplyGap).length,
    [families],
  );
  const needsTeachingCount = useMemo(
    () => families.filter((family) => family.hasTeachingGap).length,
    [families],
  );

  const sectionHeader = (
    <BuilderSectionIntro
      C={C}
      theme={theme}
      eyebrow="Co-op families"
      title="Families"
      subtitle="Manage enrolled families in this co-op program."
    />
  );

  if (!coopModeEnabled) {
    return (
      <div className="space-y-4">
        {sectionHeader}
        <BuilderQuestionCard
          C={C}
          tone="accent"
          question="Co-op families"
          helper="Enable co-op mode in portal settings (configured by MudKitchen) to view enrolled families."
        >
          <p className="text-sm" style={{ color: C.textSecondary }}>
            Co-op mode is not enabled for this program.
          </p>
        </BuilderQuestionCard>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {sectionHeader}
        <div
          className="flex items-center justify-center rounded-xl border py-16"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
        >
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: C.accent }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sectionHeader}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AdminMetricCard
          theme={theme}
          label="Families in program"
          value={String(summary.familyCount)}
        />
        <AdminMetricCard
          theme={theme}
          label="Learners across families"
          value={String(summary.learnerCount)}
        />
        <AdminMetricCard
          theme={theme}
          label="Unassigned supply items"
          value={String(summary.unassignedSupplyItemCount)}
        />
        <AdminMetricCard
          theme={theme}
          label="Unfilled teaching weeks"
          value={String(summary.unfilledTeachingWeekCount)}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <StoryFilterPill
            active={filter === "all"}
            label="All"
            count={families.length}
            onClick={() => setFilter("all")}
            theme={theme}
          />
          <StoryFilterPill
            active={filter === "needs_supply"}
            label="Needs supply"
            count={needsSupplyCount}
            onClick={() => setFilter("needs_supply")}
            theme={theme}
          />
          <StoryFilterPill
            active={filter === "needs_teaching"}
            label="Needs teaching week"
            count={needsTeachingCount}
            onClick={() => setFilter("needs_teaching")}
            theme={theme}
          />
        </div>

        <label className="relative block w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: C.textTertiary }}
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search families, learners, or email"
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm"
            style={{
              borderColor: C.border,
              backgroundColor: C.surface,
              color: C.textPrimary,
            }}
          />
        </label>
      </div>

      <AdminCard theme={theme} padding="none">
        {filteredFamilies.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
              {families.length === 0
                ? "No enrolled families yet."
                : "No families match your search or filters."}
            </p>
            <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
              {families.length === 0
                ? "Families appear here after admissions and enrollment are complete."
                : "Try adjusting your search or filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {TABLE_HEADINGS.map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.06em]"
                      style={{ color: C.textTertiary }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredFamilies.map((family) => {
                  const isSelected = selectedId === family.familyId;
                  const isHovered = hoveredId === family.familyId;

                  return (
                    <tr
                      key={family.familyId}
                      onClick={() =>
                        setSelectedId((current) =>
                          current === family.familyId ? null : family.familyId,
                        )
                      }
                      onMouseEnter={() => setHoveredId(family.familyId)}
                      onMouseLeave={() => setHoveredId(null)}
                      className="cursor-pointer transition-colors"
                      style={adminStudentRowStyle(C, { isSelected, isHovered })}
                    >
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold" style={{ color: "#2C3E43" }}>
                          {family.familyName}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: "#5D6D73" }}>
                          {formatCoopFamilyLearnersSummary(family.learners)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <SubmissionContactCell
                          guardianName={family.primaryGuardian?.name ?? null}
                          contactEmail={family.primaryGuardian?.email ?? null}
                          primaryGuardianId={family.primaryGuardian?.guardianId ?? null}
                          loginStatusByGuardianId={{}}
                          C={C}
                          theme={theme}
                        />
                      </td>
                      <td className="px-4 py-3">
                        {family.supplyItemCount > 0 ? (
                          <AdminChip theme={theme} tone="info">
                            {family.supplyItemCount} item
                            {family.supplyItemCount === 1 ? "" : "s"}
                          </AdminChip>
                        ) : (
                          <span style={{ color: "#849095" }}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {family.upcomingTeachingWeekCount > 0 ? (
                          <AdminChip theme={theme} tone="success">
                            {family.upcomingTeachingWeekCount} week
                            {family.upcomingTeachingWeekCount === 1 ? "" : "s"}
                          </AdminChip>
                        ) : family.teachingWeekCount > 0 ? (
                          <span className="text-xs" style={{ color: "#849095" }}>
                            Past only
                          </span>
                        ) : (
                          <AdminChip theme={theme} tone="warning">
                            None
                          </AdminChip>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {family.enrolledAt ? (
                          <StudentEnrolledCell enrolledAt={family.enrolledAt} />
                        ) : (
                          <span style={{ color: "#849095" }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <AnimatePresence>
        {selectedFamily ? (
          <ProgramCoopFamilyDetailPanel
            family={selectedFamily}
            organizationId={organizationId}
            schoolSlug={schoolSlug}
            onClose={() => setSelectedId(null)}
            onNavigateTab={onNavigateTab}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
