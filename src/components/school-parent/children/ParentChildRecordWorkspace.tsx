"use client";

import { createElement, useId, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Car, ChevronDown, ClipboardCheck, FileText, HeartPulse, Users } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import ApplicationReadOnlyView from "@/components/admissions/ApplicationReadOnlyView";
import EnrollmentChecklistItemReadOnlyPanel from "@/components/admissions/EnrollmentChecklistItemReadOnlyPanel";
import {
  checklistItemStatusLabel,
  getChecklistItemTypeIcon,
} from "@/lib/admissions/enrollment-checklist-item-status-ui";
import { computeChecklistProgress } from "@/lib/admissions/enrollment-checklist-materialization";
import type { LoadedEnrollmentChecklist } from "@/lib/admissions/enrollment-checklist-materialization";
import {
  CHECKLIST_ITEM_TYPE_LABELS,
  type ChecklistItemInstanceStatus,
  type EnrollmentChecklistItem,
  type EnrollmentChecklistItemInstance,
} from "@/lib/admissions/enrollment-checklist-schema";
import type {
  ApplicationDetail,
  FamilyChildEnrolledProgram,
  ParentAssignedTeacher,
} from "@/lib/admissions/parent-portal-access";
import ParentChildTeachersTab from "@/components/school-parent/ParentChildTeachersTab";
import ParentChildHealthTab from "@/components/school-parent/health/ParentChildHealthTab";
import ParentChildPickupTab from "@/components/school-parent/pickup/ParentChildPickupTab";
import type { StudentHealthProfile } from "@/components/school-parent/health/parent-health-types";
import { PortalIsland } from "@/components/school-parent/garden/ParentGardenFrame";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import {
  GCard,
  GChip,
  GProgress,
  GTabBar,
  G_FOCUS,
  type GChipTone,
  type GTabBarItem,
} from "@/components/school-parent/garden/ui";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import {
  childFirstName,
  type ParentChildRecordSection,
} from "@/components/school-parent/children/parent-children-utils";
import { applicationStudentFacts } from "@/components/school-parent/children/garden/child-record-format";

const RECORD_TAB_ICON_CLASS = "h-3.5 w-3.5 shrink-0";

type ParentChildRecordWorkspaceProps = {
  theme: ParentThemeTokens;
  adminCompat: AdminThemeTokens;
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  organizationId: string;
  application: ApplicationDetail;
  checklist: LoadedEnrollmentChecklist | null;
  assignedTeachers: ParentAssignedTeacher[];
  enrolledPrograms?: FamilyChildEnrolledProgram[];
  readOnly?: boolean;
  activeSection: ParentChildRecordSection;
  onSectionChange: (section: ParentChildRecordSection) => void;
  /** Photo upload now lives in the "at a glance" card; kept for API stability. */
  onPhotoUpdated?: (applicationId: string, profilePhotoUrl: string) => void;
  initialHealthProfile?: StudentHealthProfile | null;
  onHealthProfileChange?: (profile: StudentHealthProfile) => void;
  workspaceRef?: React.RefObject<HTMLElement | null>;
  /** The child's name from the family overview (fallback when the application has none). */
  studentName?: string;
  /** Required checklist items still to do (tab badge). */
  checklistLeft?: number;
  /** Health profile has items teachers should know about (tab badge). */
  healthNeedsAttention?: boolean;
};

const STATUS_TONE: Record<ChecklistItemInstanceStatus, GChipTone> = {
  completed: "success",
  in_progress: "info",
  waived: "neutral",
  not_started: "warning",
};

function ChecklistItemRow({
  C,
  organizationId,
  item,
  instance,
  step,
}: {
  C: AdminThemeTokens;
  organizationId: string;
  item: EnrollmentChecklistItem;
  instance?: EnrollmentChecklistItemInstance;
  /** Position among required steps (null for optional items). */
  step: number | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const reduce = useReducedMotion() === true;
  const panelId = useId();
  const status = instance?.status ?? "not_started";
  const done = status === "completed" || status === "waived";
  const icon = getChecklistItemTypeIcon(item.type);

  return (
    <li className="border-b-[1.5px] border-dashed border-[var(--sf-ink)]/10 last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className={`group flex min-h-[60px] w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-white/70 ${G_FOCUS} focus-visible:ring-inset`}
        aria-expanded={expanded}
        aria-controls={panelId}
      >
        {done ? (
          <Tick className="h-7 w-7" color="var(--sf-forest)" fill="var(--sf-mint)" />
        ) : (
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[var(--sf-ink)]/60 bg-white text-xs font-extrabold text-[var(--sf-ink)]"
            aria-hidden="true"
          >
            {step ?? "·"}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-extrabold text-[var(--sf-ink)]">{item.label}</span>
          <span className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-[var(--sf-soft)]">
            {createElement(icon, { className: "h-3.5 w-3.5 shrink-0", "aria-hidden": true })}
            {CHECKLIST_ITEM_TYPE_LABELS[item.type]}
            {!item.required ? (
              <>
                <span className="opacity-50" aria-hidden="true">·</span>
                Optional
              </>
            ) : null}
          </span>
        </span>
        <GChip tone={STATUS_TONE[status]}>{checklistItemStatusLabel(status)}</GChip>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--sf-ink)]/45 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            id={panelId}
            key="panel"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: PORTAL_EASE }}
            className="overflow-hidden"
          >
            <div className="mx-2 mb-3 rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white px-4 py-4">
              <PortalIsland>
                <EnrollmentChecklistItemReadOnlyPanel
                  C={C}
                  organizationId={organizationId}
                  item={item}
                  instance={instance}
                />
              </PortalIsland>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

function NotLinkedNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 rounded-[16px] border-[1.5px] border-dashed border-[var(--sf-ink)]/15 px-5 py-8 text-center text-[14px] font-semibold text-[var(--sf-soft)]">
      {children}
    </p>
  );
}

export default function ParentChildRecordWorkspace({
  theme,
  adminCompat: C,
  branding,
  schoolName,
  schoolSlug,
  organizationId,
  application,
  checklist,
  assignedTeachers,
  readOnly = false,
  activeSection,
  onSectionChange,
  initialHealthProfile,
  onHealthProfileChange,
  workspaceRef,
  studentName,
  checklistLeft = 0,
  healthNeedsAttention = false,
}: ParentChildRecordWorkspaceProps) {
  const reduce = useReducedMotion() === true;
  const hasChecklist = Boolean(checklist && checklist.items.length > 0);
  const hasTeachersTab = Boolean(application.studentId);
  const hasHealthTab = Boolean(application.studentId);
  const hasPickupTab = Boolean(application.studentId);

  const facts = applicationStudentFacts(application);
  const firstName = childFirstName(facts.student ? facts.fullName : (studentName ?? facts.fullName));

  const progress = checklist
    ? computeChecklistProgress(checklist.items, checklist.instances)
    : null;

  const instanceByTemplateItemId = useMemo(() => {
    const map = new Map<string, EnrollmentChecklistItemInstance>();
    for (const instance of checklist?.instances ?? []) {
      map.set(instance.templateItemId, instance);
    }
    return map;
  }, [checklist]);

  const stepByItemId = useMemo(() => {
    const map = new Map<string, number>();
    let step = 0;
    for (const item of checklist?.items ?? []) {
      if (item.required) {
        step += 1;
        map.set(item.id, step);
      }
    }
    return map;
  }, [checklist]);

  const statusCounts = useMemo(() => {
    const counts = { done: 0, todo: 0 };
    // Required steps only, so the chips agree with the tab badge and "x/y required steps".
    for (const item of checklist?.items ?? []) {
      if (!item.required) continue;
      const status = instanceByTemplateItemId.get(item.id)?.status ?? "not_started";
      if (status === "completed" || status === "waived") counts.done += 1;
      else counts.todo += 1;
    }
    return counts;
  }, [checklist, instanceByTemplateItemId]);

  const badge = (text: string, tone: "accent" | "soft" = "soft") => (
    <span
      className={`ml-0.5 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-extrabold leading-5 ${
        tone === "accent" ? "bg-[var(--sf-butter)] text-[var(--sf-ink)]" : "bg-[var(--sf-ink)]/10 text-current"
      }`}
    >
      {text}
    </span>
  );

  const tabs: GTabBarItem[] = [
    {
      key: "application",
      label: "Application",
      icon: <FileText className={RECORD_TAB_ICON_CLASS} aria-hidden />,
    },
  ];
  if (hasChecklist) {
    tabs.push({
      key: "checklist",
      label: "Enrollment checklist",
      icon: <ClipboardCheck className={RECORD_TAB_ICON_CLASS} aria-hidden />,
      suffix:
        checklistLeft > 0 ? (
          <>
            {badge(String(checklistLeft), "accent")}
            <span className="sr-only"> to do</span>
          </>
        ) : null,
    });
  }
  if (hasTeachersTab) {
    tabs.push({
      key: "teachers",
      label: "Teachers",
      icon: <Users className={RECORD_TAB_ICON_CLASS} aria-hidden />,
      suffix: assignedTeachers.length > 0 ? badge(String(assignedTeachers.length)) : null,
    });
  }
  if (hasHealthTab) {
    tabs.push({
      key: "health",
      label: "Health",
      icon: <HeartPulse className={RECORD_TAB_ICON_CLASS} aria-hidden />,
      suffix: healthNeedsAttention ? (
        <>
          <span className="ml-0.5 h-2 w-2 rounded-full bg-[var(--sf-butter)] ring-[1.5px] ring-[var(--sf-ink)]" aria-hidden="true" />
          <span className="sr-only"> (needs attention)</span>
        </>
      ) : null,
    });
  }
  if (hasPickupTab) {
    tabs.push({
      key: "pickup",
      label: "Authorized pickup",
      icon: <Car className={RECORD_TAB_ICON_CLASS} aria-hidden />,
    });
  }

  const activeLabel = tabs.find((tab) => tab.key === activeSection)?.label ?? "School record";

  return (
    <section ref={workspaceRef} data-testid="parent-children-record-workspace" className="scroll-mt-6">
      <GCard index={4} kicker="School record" title={`${firstName}'s school record`}>
        <GTabBar
          items={tabs}
          activeKey={activeSection}
          onChange={(key) => onSectionChange(key as ParentChildRecordSection)}
          ariaLabel={`${firstName} school record sections`}
          data-testid="parent-children-record-nav"
        />

        <div className="mt-5" role="tabpanel" aria-label={activeLabel}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${application.id}-${activeSection}`}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: PORTAL_EASE }}
            >
              {activeSection === "application" ? (
                <div className="rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white px-5 py-6 sm:px-6">
                  <PortalIsland>
                    <ApplicationReadOnlyView
                      branding={branding}
                      schoolName={schoolName}
                      schoolSlug={schoolSlug}
                      application={application}
                      embedded
                    />
                  </PortalIsland>
                </div>
              ) : null}

              {activeSection === "checklist" && checklist && progress ? (
                <div className="flex flex-col gap-4" data-testid="parent-children-checklist">
                  <div className="rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="m-0 text-[17px] font-extrabold text-[var(--sf-ink)]">{checklist.title}</h3>
                        <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-soft)]">
                          {progress.completed}/{progress.total} required steps complete
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {statusCounts.todo > 0 ? <GChip tone="warning">To do · {statusCounts.todo}</GChip> : null}
                        {statusCounts.done > 0 ? <GChip tone="success">Done · {statusCounts.done}</GChip> : null}
                      </div>
                    </div>
                    <GProgress
                      className="mt-3"
                      value={progress.completed}
                      total={progress.total}
                      done={progress.total > 0 && progress.completed >= progress.total}
                      label={`${checklist.title} progress`}
                    />
                    <p className="m-0 mt-3 text-xs font-semibold text-[var(--sf-soft)]">
                      Tap a step to see its details.
                    </p>
                  </div>

                  <ul className="sf-paper m-0 flex list-none flex-col rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 p-1.5">
                    {checklist.items.map((item) => (
                      <ChecklistItemRow
                        key={item.id}
                        C={C}
                        organizationId={organizationId}
                        item={item}
                        instance={instanceByTemplateItemId.get(item.id)}
                        step={stepByItemId.get(item.id) ?? null}
                      />
                    ))}
                  </ul>
                </div>
              ) : null}

              {activeSection === "teachers" && hasTeachersTab ? (
                <ParentChildTeachersTab teachers={assignedTeachers} C={C} />
              ) : null}

              {activeSection === "health" && hasHealthTab && application.studentId ? (
                <ParentChildHealthTab
                  theme={theme}
                  adminCompat={C}
                  organizationId={organizationId}
                  studentId={application.studentId}
                  studentFirstName={firstName}
                  readOnly={readOnly}
                  initialProfile={initialHealthProfile}
                  onProfileChange={onHealthProfileChange}
                />
              ) : null}

              {activeSection === "health" && !hasHealthTab ? (
                <NotLinkedNote>
                  Health information will be available once your child&apos;s student record is linked.
                </NotLinkedNote>
              ) : null}

              {activeSection === "pickup" && hasPickupTab && application.studentId ? (
                <ParentChildPickupTab
                  theme={theme}
                  organizationId={organizationId}
                  studentId={application.studentId}
                  studentFirstName={firstName}
                  readOnly={readOnly}
                />
              ) : null}

              {activeSection === "pickup" && !hasPickupTab ? (
                <NotLinkedNote>
                  Authorized pickup will be available once your child&apos;s student record is linked.
                </NotLinkedNote>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </GCard>
    </section>
  );
}
