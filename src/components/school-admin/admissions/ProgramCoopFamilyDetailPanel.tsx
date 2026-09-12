"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";
import StudentPhoto from "@/components/students/StudentPhoto";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import DetailPanelSection from "@/components/school-admin/admissions/DetailPanelSection";
import DetailPanelSectionGroup from "@/components/school-admin/admissions/DetailPanelSectionGroup";
import FamilyGuardiansSection from "@/components/school-admin/admissions/FamilyGuardiansSection";
import { SubmissionDetailStoryProvider } from "@/components/school-admin/admissions/SubmissionDetailStoryContext";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import { familyPreviewBasePath } from "@/lib/admissions/family-preview-access";
import { formatShortDate } from "@/lib/admissions/application-submissions";
import {
  formatCoopFamilyLearnersSummary,
  formatCoopFamilySupplyItemSummary,
  type ProgramCoopFamilyAdminRow,
} from "@/lib/admissions/program-coop-families-admin";
import { formatProgramCoopLearnerLine } from "@/lib/admissions/program-coop-directory";
import { formatStudentGrade } from "@/lib/school-admin/enrolled-students";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import {
  tabPanelTransition,
  tabPanelVariants,
} from "@/lib/school-admin/admin-modal-motion";
import { formatEnrolledDate } from "@/lib/school-admin/enrolled-students";
type CoopProgramEditorTab = "supply_list" | "teaching_schedule";

type ProgramCoopFamilyDetailPanelProps = {
  family: ProgramCoopFamilyAdminRow;
  organizationId: string;
  schoolSlug: string;
  onClose: () => void;
  onNavigateTab?: (tab: CoopProgramEditorTab) => void;
};

type DetailTab = {
  id: string;
  label: string;
  icon: LucideIcon;
};

function teachingRoleLabel(role: "instructor" | "assistant"): string {
  return role === "instructor" ? "Parent instructor" : "Parent assistant";
}

export default function ProgramCoopFamilyDetailPanel({
  family,
  organizationId,
  schoolSlug,
  onClose,
  onNavigateTab,
}: ProgramCoopFamilyDetailPanelProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const reducedMotion = useReducedMotion();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(() => new Set(["overview"]));

  const navigateToTab = useCallback((tabId: string) => {
    setVisitedTabs((previous) => {
      if (previous.has(tabId)) return previous;
      const next = new Set(previous);
      next.add(tabId);
      return next;
    });
    setActiveTab(tabId);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const tabs: DetailTab[] = useMemo(
    () => [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "supply_list", label: "Supply list", icon: ClipboardList },
      { id: "teaching_schedule", label: "Teaching schedule", icon: CalendarDays },
    ],
    [],
  );

  const studentsPath = schoolAdminPath(schoolSlug, "my_school", "students");
  const previewPath = familyPreviewBasePath(schoolSlug, family.familyId);
  const contactLabel = family.primaryGuardian?.email ?? "No contact email";
  const learnerSummary = formatCoopFamilyLearnersSummary(family.learners);

  function renderOverviewTab() {
    return (
      <DetailPanelSectionGroup C={C}>
        <DetailPanelSection
          C={C}
          title="Learners in this program"
          description="Students enrolled from this family."
        >
          {family.learners.length === 0 ? (
            <p className="text-sm" style={{ color: C.textSecondary }}>
              No learners found for this family.
            </p>
          ) : (
            <ul className="space-y-3">
              {family.learners.map((learner) => (
                <li key={learner.studentId} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <StudentPhoto
                      name={learner.firstName}
                      photoUrl={learner.profilePhotoUrl}
                      size="md"
                      shape="square"
                      accentColor={C.accent}
                      accentGlowColor={C.accentLight}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                        {formatProgramCoopLearnerLine(learner)}
                      </p>
                      {learner.grade ? (
                        <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
                          {formatStudentGrade(learner.grade)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <Link
                    href={`${studentsPath}?student=${learner.studentId}`}
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold"
                    style={{ color: C.accent }}
                  >
                    View student
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DetailPanelSection>

        <DetailPanelSection
          C={C}
          title="Enrollment"
          description="When this family joined the co-op program."
        >
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium" style={{ color: C.textTertiary }}>
                Enrolled
              </dt>
              <dd className="mt-0.5" style={{ color: C.textPrimary }}>
                {family.enrolledAt ? formatEnrolledDate(family.enrolledAt) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium" style={{ color: C.textTertiary }}>
                Learners
              </dt>
              <dd className="mt-0.5" style={{ color: C.textPrimary }}>
                {learnerSummary}
              </dd>
            </div>
          </dl>
        </DetailPanelSection>

        <FamilyGuardiansSection
          C={C}
          organizationId={organizationId}
          familyId={family.familyId}
          schoolSlug={schoolSlug}
          detail={null}
          primaryGuardianId={family.primaryGuardian?.guardianId ?? null}
        />

        <DetailPanelSection
          C={C}
          title="Family preview"
          description="See this family's parent portal as they experience it."
        >
          <Link
            href={previewPath}
            className="inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: C.accent }}
          >
            Preview family portal
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </DetailPanelSection>
      </DetailPanelSectionGroup>
    );
  }

  function renderSupplyListTab() {
    return (
      <DetailPanelSectionGroup C={C}>
        <DetailPanelSection
          C={C}
          title="Supply list"
          description="Items assigned to this family."
        >
          {family.supplyItems.length === 0 ? (
            <div className="space-y-2">
              <p className="text-sm" style={{ color: C.textSecondary }}>
                No supply items are assigned to this family yet.
              </p>
              {onNavigateTab ? (
                <button
                  type="button"
                  onClick={() => onNavigateTab("supply_list")}
                  className="text-sm font-semibold"
                  style={{ color: C.accent }}
                >
                  Manage supply list
                </button>
              ) : null}
            </div>
          ) : (
            <ul className="space-y-3">
              {family.supplyItems.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border px-3 py-2.5"
                  style={{ borderColor: C.border, backgroundColor: C.surface }}
                >
                  <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
                    {formatCoopFamilySupplyItemSummary(item)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </DetailPanelSection>
      </DetailPanelSectionGroup>
    );
  }

  function renderTeachingScheduleTab() {
    return (
      <DetailPanelSectionGroup C={C}>
        <DetailPanelSection
          C={C}
          title="Teaching schedule"
          description="Weeks where this family is scheduled to teach or assist."
        >
          {family.teachingWeeks.length === 0 ? (
            <div className="space-y-2">
              <p className="text-sm" style={{ color: C.textSecondary }}>
                This family is not scheduled for any teaching weeks yet.
              </p>
              {onNavigateTab ? (
                <button
                  type="button"
                  onClick={() => onNavigateTab("teaching_schedule")}
                  className="text-sm font-semibold"
                  style={{ color: C.accent }}
                >
                  Manage teaching schedule
                </button>
              ) : null}
            </div>
          ) : (
            <ul className="space-y-3">
              {family.teachingWeeks.map((week) => (
                <li
                  key={`${week.weekId}-${week.role}`}
                  className="rounded-lg border px-3 py-2.5"
                  style={{ borderColor: C.border, backgroundColor: C.surface }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                      {week.weekName}
                    </p>
                    <AdminChip theme={theme} tone={week.isPast ? "purple" : "info"}>
                      {teachingRoleLabel(week.role)}
                    </AdminChip>
                  </div>
                  <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
                    {week.dateRange}
                    {week.seasonalTheme ? ` · ${week.seasonalTheme}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </DetailPanelSection>
      </DetailPanelSectionGroup>
    );
  }

  function renderTabPanel(tabId: string) {
    switch (tabId) {
      case "overview":
        return renderOverviewTab();
      case "supply_list":
        return renderSupplyListTab();
      case "teaching_schedule":
        return renderTeachingScheduleTab();
      default:
        return null;
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(34,48,44,0.47)" }}
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,44rem)] max-w-full flex-col overflow-hidden"
        style={{
          backgroundColor: "#F8FAF8",
          borderLeft: "1px solid #E0E8E0",
          boxShadow: "0 -18px 45px rgba(26,47,37,0.2)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="flex flex-shrink-0 items-start justify-between gap-3 bg-white px-[21px] py-[17px]"
          style={{ borderBottom: "1px solid #E0E8E0" }}
        >
          <div className="min-w-0 flex-1">
            <AdminSectionKicker theme={theme}>Co-op family</AdminSectionKicker>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <AdminDisplayHeading theme={theme} as="h2" size="section" className="truncate">
                {family.familyName}
              </AdminDisplayHeading>
              <AdminChip theme={theme} tone="success">
                Enrolled
              </AdminChip>
            </div>
            {family.enrolledAt ? (
              <p className="mt-1 truncate text-[11px]" style={{ color: theme.muted }}>
                Enrolled {formatShortDate(family.enrolledAt)}
                <span className="mx-1.5 opacity-50">·</span>
                {learnerSummary}
              </p>
            ) : null}
            <p className="mt-0.5 truncate text-[11px]" style={{ color: theme.muted }}>
              {family.primaryGuardian?.name ?? "Family"}
              <span className="mx-1.5 opacity-50">·</span>
              {contactLabel}
            </p>
          </div>
          <AdminButton
            theme={theme}
            variant="soft"
            size="compact"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0"
          >
            Close ×
          </AdminButton>
        </div>

        <div
          className="flex flex-shrink-0 overflow-x-auto bg-white px-[21px]"
          style={{ borderBottom: "1px solid #E1E8E1" }}
        >
          <div className="-mb-px flex gap-[3px]" role="tablist" aria-label="Family sections">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const tabId = `coop-family-tab-${tab.id}`;
              const panelId = `coop-family-panel-${tab.id}`;

              return (
                <button
                  key={tab.id}
                  id={tabId}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={panelId}
                  onClick={() => navigateToTab(tab.id)}
                  className="flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-[9px] py-[11px] text-[11px] font-bold transition-colors"
                  style={{
                    borderBottomColor: isActive ? theme.primary : "transparent",
                    color: isActive ? theme.primary : "#77858A",
                  }}
                >
                  <tab.icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <SubmissionDetailStoryProvider variant="story" theme={theme}>
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-5 pb-6 pt-5 sm:px-5 sm:pb-8"
          >
            {tabs.map((tab) =>
              visitedTabs.has(tab.id) ? (
                <div
                  key={tab.id}
                  id={`coop-family-panel-${tab.id}`}
                  role="tabpanel"
                  aria-labelledby={`coop-family-tab-${tab.id}`}
                  hidden={activeTab !== tab.id}
                >
                  <motion.div
                    variants={tabPanelVariants(reducedMotion ?? false)}
                    initial={false}
                    animate={activeTab === tab.id ? "animate" : "initial"}
                    transition={tabPanelTransition(reducedMotion ?? false)}
                  >
                    {renderTabPanel(tab.id)}
                  </motion.div>
                </div>
              ) : null,
            )}
          </div>
        </SubmissionDetailStoryProvider>
      </motion.div>
    </motion.div>
  );
}
