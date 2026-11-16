"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, GraduationCap, HeartPulse, Loader2, School, UserRoundX, UsersRound, X } from "lucide-react";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import {
  GCard,
  GChip,
  GSkeleton,
  GTabBar,
  G_FOCUS,
  NOTE_TINTS,
  gBtnOutlineSm,
  gLinkSm,
} from "@/components/school-parent/garden/ui";
import {
  GardenEmptyState,
  GardenFilterChips,
  GardenLoadError,
  GardenNotice,
  GardenStatTiles,
  type GardenStat,
} from "@/components/school-admin/garden/kit";
import {
  G_TABLE,
  G_TD,
  G_TH,
  GardenLeadStrip,
  GardenSearchInput,
  gRowClass,
} from "@/components/school-admin/garden/blocks";
import {
  GardenStudentContact,
  GardenStudentEnrolled,
  GardenStudentIdentity,
} from "@/components/school-admin/students/GardenStudentCells";
import { StudentFace, plural } from "@/components/school-teacher/home/garden/parts";
import TeacherStudentDetailPanel from "./TeacherStudentDetailPanel";
import {
  useTeacherMyStudentsModel,
  type TeacherMyStudentsModel,
  type TeacherMyStudentsPageProps,
} from "./my-students/useTeacherMyStudentsModel";
import { formatStudentClassroomLabel } from "@/lib/school-admin/format-student-classroom-label";
import { formatEnrolledStudentName, formatStudentGrade } from "@/lib/school-admin/enrolled-students";
import { studentMatchesClassroomFilter } from "@/lib/school-teacher/filter-students-by-classroom";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";

const SEARCH_TEST_ID = "teacher-my-students-search";

/**
 * Staff "My Students" (Garden): who's in your care, grouped by classroom,
 * with linked figures, filters + search and a student profile drawer.
 * State: `useTeacherMyStudentsModel`. Rules:
 * `.agents/skills/teacher-portal-garden-design/SKILL.md`.
 */
export default function TeacherMyStudentsPage(props: TeacherMyStudentsPageProps) {
  const model = useTeacherMyStudentsModel(props);
  const { theme, staffMemberId } = model;
  const rosterRef = useRef<HTMLDivElement>(null);

  // "/" jumps to search (not while typing somewhere else).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
      if (document.querySelector("[data-garden-dialog]")) return;
      const input = document.querySelector<HTMLInputElement>(`[data-testid="${SEARCH_TEST_ID}"]`);
      if (!input) return;
      event.preventDefault();
      input.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const scrollToRoster = () => rosterRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  if (staffMemberId == null) {
    return (
      <div data-testid="teacher-my-students-page" className="relative flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--sf-cream,#FBF7EF)]">
          <ParentGardenFrame theme={theme} className="bg-[var(--sf-cream)]">
            <div className={PORTAL_HOME_CONTAINER_CLASS}>
              <ParentGardenPageHeader title="My Students" />
              <GardenNotice tone="warning" title="Your login isn't linked to a staff record yet" role="status">
                Your account isn&apos;t linked to a staff record. Contact your school administrator so they can connect
                your portal login to the staff directory.
              </GardenNotice>
            </div>
          </ParentGardenFrame>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="teacher-my-students-page" className="relative flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--sf-cream,#FBF7EF)]">
        <ParentGardenFrame theme={theme} className="bg-[var(--sf-cream)]">
          <div className={PORTAL_HOME_CONTAINER_CLASS}>
            <ParentGardenPageHeader
              title={
                <>
                  My <span className="text-[var(--sf-clay)]">Students</span>
                </>
              }
              subtitle={
                <span className="text-[13.5px] font-extrabold tabular-nums text-[var(--sf-ink)]/70" data-testid="teacher-my-students-status-line">
                  {model.statusLine}
                </span>
              }
              actions={<ScopeTabs model={model} />}
            />

            {model.isSchoolScope && !model.loading && model.metrics.unassignedCount > 0 ? (
              <GardenLeadStrip
                icon={UsersRound}
                kicker={`Needs attention · ${plural(model.metrics.unassignedCount, "student")}`}
                title={`${plural(model.metrics.unassignedCount, "enrolled student")} ${
                  model.metrics.unassignedCount === 1 ? "doesn't" : "don't"
                } have a teacher assigned`}
                cta="View unassigned"
                onClick={() => {
                  model.changeRosterFilter("unassigned");
                  scrollToRoster();
                }}
              />
            ) : null}

            {!model.isSchoolScope && model.staffClassrooms.length > 0 ? (
              <ClassroomGroups model={model} onPick={scrollToRoster} />
            ) : null}

            {!model.loading && !model.error && model.students.length > 0 ? (
              <FigureTiles model={model} onFilter={scrollToRoster} />
            ) : null}

            <div ref={rosterRef} className="scroll-mt-4">
              <RosterCard model={model} />
            </div>

            {model.students.length > 0 ? (
            <p className="m-0 hidden text-[13px] font-semibold text-[var(--sf-soft)] md:block">
              Tip: press <kbd className="rounded-[6px] border border-[var(--sf-ink)]/20 bg-white px-1.5 font-mono text-[12px]">/</kbd>{" "}
              to search, then <kbd className="rounded-[6px] border border-[var(--sf-ink)]/20 bg-white px-1.5 font-mono text-[12px]">Enter</kbd>{" "}
              on a row to open a student.
            </p>
            ) : null}
          </div>
        </ParentGardenFrame>
      </div>

      {/* The drawer stays outside the Garden frame. */}
      {model.panelStudent ? (
        <TeacherStudentDetailPanel
          open={model.selectedId !== null}
          student={model.panelStudent}
          organizationId={props.organizationId}
          staffMemberId={staffMemberId}
          branding={props.branding}
          schoolSlug={props.slug}
          detailAccess={model.isSchoolScope ? "school" : "assigned"}
          readOnly={model.previewMode}
          onStudentHealthChange={model.handleStudentHealthChange}
          onClose={model.closeStudent}
        />
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ScopeTabs({ model }: { model: TeacherMyStudentsModel }) {
  const schoolCount = model.schoolStudents?.length;
  return (
    <GTabBar
      ariaLabel="Whose students"
      activeKey={model.rosterScope}
      onChange={(key) => model.changeRosterScope(key as "assigned" | "school")}
      data-testid="teacher-my-students-scope"
      items={[
        {
          key: "assigned",
          label: "My students",
          suffix: <TabCount value={model.assignedMetrics.totalCount} />,
          testId: "teacher-my-students-scope-assigned",
        },
        {
          key: "school",
          label: "All students",
          ariaBusy: model.loadingSchool,
          suffix: model.loadingSchool ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-label="Loading" />
          ) : schoolCount != null ? (
            <TabCount value={schoolCount} />
          ) : null,
          testId: "teacher-my-students-scope-school",
        },
      ]}
    />
  );
}

function TabCount({ value }: { value: number }) {
  return <span className="rounded-full bg-[var(--sf-ink)]/[0.08] px-1.5 text-[11.5px] tabular-nums">{value}</span>;
}

/* ------------------------------------------------------------------ */

function ClassroomGroups({ model, onPick }: { model: TeacherMyStudentsModel; onPick: () => void }) {
  const groups = [
    {
      key: "all",
      name: "All groups",
      count: model.assignedStudents.length,
      faces: model.assignedStudents,
      icon: UsersRound,
    },
    ...model.staffClassrooms.map((classroom) => ({
      key: classroom.id,
      name: classroom.name,
      count: classroom.studentCount,
      faces: model.assignedStudents.filter((s) => studentMatchesClassroomFilter(s, classroom.id, model.staffClassrooms)),
      icon: School,
    })),
    ...(model.unassignedClassroomCount > 0
      ? [
          {
            key: "unassigned",
            name: "Unassigned",
            count: model.unassignedClassroomCount,
            faces: model.assignedStudents.filter((s) => s.classroomNames.length === 0),
            icon: UserRoundX,
          },
        ]
      : []),
  ];

  return (
    <section aria-label="Classroom groups" className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="m-0 text-[12px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">Your groups</h2>
        <span className="hidden text-[12.5px] font-semibold text-[var(--sf-soft)] sm:inline">Pick a group to filter the roster</span>
      </div>
      <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:gap-2.5 lg:grid-cols-4">
        {groups.map((group, index) => {
          const active = model.classroomFilter === group.key;
          const shown = group.faces.slice(0, 4);
          const extra = group.faces.length - shown.length;
          const Icon = group.icon;
          return (
            <li key={group.key}>
              <button
                type="button"
                aria-pressed={active}
                aria-label={`${group.name} · ${group.count}`}
                onClick={() => {
                  model.changeClassroomFilter(group.key);
                  if (!active) onPick();
                }}
                className={`flex h-full w-full items-center gap-3 rounded-[18px] border-[1.5px] p-2.5 text-left sm:p-3 transition-all duration-200 hover:-translate-y-0.5 ${
                  active
                    ? "border-[var(--sf-ink)] bg-[var(--sf-accent-wash)] shadow-[0_3px_0_0_var(--sf-ink)]"
                    : "border-[var(--sf-ink)]/12 bg-white hover:border-[var(--sf-ink)]/35"
                } ${G_FOCUS}`}
              >
                <span
                  aria-hidden="true"
                  className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-[14px] sm:flex ${NOTE_TINTS[index % NOTE_TINTS.length]}`}
                >
                  <Icon className="h-5 w-5 text-[var(--sf-ink)]/80" strokeWidth={2.3} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="sf-display block truncate text-[1.05rem] leading-tight text-[var(--sf-ink)]">{group.name}</span>
                  <span className="mt-0.5 block text-[12.5px] font-semibold tabular-nums text-[var(--sf-soft)]">
                    {plural(group.count, "student")}
                  </span>
                </span>
                {shown.length > 0 ? (
                  <span className="hidden shrink-0 items-center xl:flex" aria-hidden="true">
                    {shown.map((student, i) => (
                      <StudentFace key={student.id} student={student} index={i} size="xs" className={i > 0 ? "-ml-2" : ""} />
                    ))}
                    {extra > 0 ? (
                      <span className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--sf-paper)] text-[11px] font-extrabold text-[var(--sf-ink)]/65 ring-2 ring-white">
                        +{extra}
                      </span>
                    ) : null}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function FigureTiles({ model, onFilter }: { model: TeacherMyStudentsModel; onFilter: () => void }) {
  const { metrics } = model;
  const stats: GardenStat[] = [
    {
      id: "total",
      label: model.isSchoolScope ? "All enrolled" : "Assigned students",
      value: metrics.totalCount,
      accent: "forest",
      active: !model.filtersActive,
      onClick: () => {
        model.clearFilters();
        onFilter();
      },
      hint: model.filtersActive ? "Show everyone" : undefined,
    },
  ];
  if (model.isSchoolScope && metrics.unassignedCount > 0) {
    stats.push({
      id: "unassigned",
      label: "Unassigned teacher",
      value: metrics.unassignedCount,
      accent: "gold",
      active: model.rosterFilter === "unassigned",
      onClick: () => {
        model.changeRosterFilter(model.rosterFilter === "unassigned" ? "all" : "unassigned");
        onFilter();
      },
    });
  }
  if (model.healthFlagCount > 0) {
    stats.push({
      id: "health",
      label: "Health flags",
      value: model.healthFlagCount,
      accent: "berry",
      active: model.healthOnly,
      onClick: () => {
        model.toggleHealthOnly();
        onFilter();
      },
      hint: model.healthOnly ? "Showing only these" : "Show these students",
    });
  }
  if (metrics.programCount > 1) {
    stats.push({ id: "programs", label: "Programs", value: metrics.programCount, accent: "sky" });
  }
  return <GardenStatTiles ariaLabel="Your students at a glance" stats={stats} layout="strip" />;
}

/* ------------------------------------------------------------------ */

function RosterCard({ model }: { model: TeacherMyStudentsModel }) {
  const reduce = useReducedMotion() === true;
  const { metrics } = model;
  const title = model.isSchoolScope ? "Everyone at your school" : "Your students";

  if (model.loading) {
    return (
      <GCard index={2} kicker="Roster" title={title}>
        <div className="flex flex-col gap-2" role="status" aria-live="polite">
          <span className="sr-only">Loading students</span>
          <GSkeleton className="h-11 w-full max-w-sm !rounded-[14px]" />
          {Array.from({ length: 6 }).map((_, i) => (
            <GSkeleton key={i} className="h-[58px] !rounded-[14px]" />
          ))}
        </div>
      </GCard>
    );
  }

  if (model.error) {
    return (
      <GardenLoadError
        title="Students didn't load"
        description={model.error}
        onRetry={model.retry}
        retrying={model.loading}
      />
    );
  }

  if (model.students.length === 0) {
    return (
      <GCard index={2} kicker="Roster" title={title}>
        <GardenEmptyState
          icon={GraduationCap}
          title={model.isSchoolScope ? "No enrolled students yet" : "No students assigned to you yet"}
          description={
            model.isSchoolScope
              ? "No enrolled students found at your school yet."
              : "Your school admin can assign students from My School → My Students."
          }
          action={
            !model.isSchoolScope ? (
              <button type="button" className={gBtnOutlineSm} onClick={() => model.changeRosterScope("school")}>
                See all students at your school
              </button>
            ) : undefined
          }
        />
      </GCard>
    );
  }

  const filterOptions = [
    { key: "all", label: "All", count: metrics.totalCount },
    ...(model.isSchoolScope && metrics.unassignedCount > 0
      ? [{ key: "unassigned", label: "Unassigned", count: metrics.unassignedCount }]
      : []),
    ...(metrics.programOptions.length > 1
      ? metrics.programOptions.map(([programName]) => ({
          key: programName,
          label: programName,
          count: model.programCounts.get(programName) ?? 0,
        }))
      : []),
  ];

  const classroomName =
    !model.isSchoolScope && model.classroomFilter !== "all"
      ? model.classroomFilter === "unassigned"
        ? "No classroom"
        : (model.staffClassrooms.find((c) => c.id === model.classroomFilter)?.name ?? null)
      : null;

  const shown = model.visibleStudents;
  const headings = model.isSchoolScope
    ? ["Student", "Grade", "Program", "Classroom", "Teacher", "Parent", "Enrolled"]
    : ["Student", "Grade", "Program", "Classroom", "Parent", "Enrolled"];

  return (
    <GCard
      index={2}
      kicker="Roster"
      title={title}
      action={
        <span className="text-[12.5px] font-bold tabular-nums text-[var(--sf-soft)]" aria-live="polite">
          Showing {shown.length} of {model.filteredStudents.length}
          {model.filteredStudents.length !== metrics.totalCount ? ` (${metrics.totalCount} total)` : ""}
        </span>
      }
      data-testid="teacher-my-students-roster"
    >
      <div className="mb-4 flex flex-col gap-3 border-b-[1.5px] border-dashed border-[var(--sf-ink)]/12 pb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <GardenFilterChips
            options={filterOptions}
            value={model.rosterFilter}
            onChange={model.changeRosterFilter}
            ariaLabel="Filter students"
          />
          <GardenSearchInput
            value={model.searchQuery}
            onChange={model.setSearchQuery}
            placeholder="Search students, families, or email"
            label="Search students"
            className="w-full lg:max-w-sm"
            data-testid={SEARCH_TEST_ID}
          />
        </div>
        {classroomName || model.healthOnly ? (
          <div className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-[var(--sf-soft)]">
            <span>Also filtered by:</span>
            {classroomName ? (
              <ActiveFilter label={`Group: ${classroomName}`} onClear={() => model.changeClassroomFilter("all")} />
            ) : null}
            {model.healthOnly ? <ActiveFilter label="Health flags" onClear={model.toggleHealthOnly} /> : null}
          </div>
        ) : null}
      </div>

      {shown.length === 0 ? (
        <div className="rounded-[16px] bg-[var(--sf-paper)] p-4 text-[13.5px] font-semibold text-[var(--sf-soft)]" role="status">
          No students match{" "}
          {model.searchQuery.trim() ? <>&ldquo;{model.searchQuery.trim()}&rdquo;</> : "the current filters"}.{" "}
          <button type="button" className={gLinkSm} onClick={model.clearFilters}>
            Show everyone
          </button>
        </div>
      ) : (
        <>
          {/* Phones: one tappable card per student */}
          <ul className="m-0 flex list-none flex-col gap-2 p-0 md:hidden">
            {shown.map((student) => {
              const name = formatEnrolledStudentName(student);
              const selected = model.selectedId === student.id;
              return (
                <li key={student.id}>
                  <button
                    type="button"
                    onClick={() => model.openStudent(student.id)}
                    aria-label={`Open ${name}'s profile`}
                    className={`flex w-full flex-col gap-2 rounded-[16px] border-[1.5px] px-3.5 py-3 text-left transition-colors ${
                      selected
                        ? "border-[var(--sf-clay)]/40 bg-[var(--sf-accent-wash)]"
                        : "border-[var(--sf-ink)]/10 bg-white hover:bg-[var(--sf-accent-wash)]"
                    } ${G_FOCUS}`}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <GardenStudentIdentity
                        name={name}
                        familyName={student.familyName}
                        photoUrl={student.profilePhotoUrl}
                        hasStandingHealthItems={student.hasStandingHealthItems}
                      />
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[var(--sf-ink)]/40" aria-hidden />
                    </span>
                    <span className="text-[12.5px] font-semibold text-[var(--sf-soft)]">
                      {[formatStudentGrade(student.grade), student.programNames.join(", ") || null].filter(Boolean).join(" · ") ||
                        "—"}
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5">
                      <GChip tone={student.classroomNames.length ? "neutral" : "warning"}>
                        {formatStudentClassroomLabel(student.classroomNames)}
                      </GChip>
                      {model.isSchoolScope ? (
                        <GChip tone="neutral">{student.assignedTeacherNames.trim() || "Unassigned"}</GChip>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Tablet and up: the full table */}
          <div className="-mx-1 hidden overflow-x-auto md:block">
            <table className={`${G_TABLE} ${model.isSchoolScope ? "min-w-[1040px]" : "min-w-[900px]"}`}>
              <thead>
                <tr>
                  {headings.map((heading) => (
                    <th key={heading} scope="col" className={G_TH}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <motion.tbody
                key={`${model.rosterScope}-${model.classroomFilter}-${model.rosterFilter}-${model.healthOnly}`}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {shown.map((student) => {
                  const name = formatEnrolledStudentName(student);
                  const open = () => model.openStudent(student.id);
                  const selected = model.selectedId === student.id;
                  return (
                    <tr
                      key={student.id}
                      tabIndex={0}
                      onClick={open}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          open();
                        }
                      }}
                      aria-label={`Open ${name}'s profile`}
                      aria-selected={selected}
                      className={gRowClass({ interactive: true, selected })}
                    >
                      <td className={G_TD}>
                        <GardenStudentIdentity
                          name={name}
                          familyName={student.familyName}
                          photoUrl={student.profilePhotoUrl}
                          hasStandingHealthItems={student.hasStandingHealthItems}
                        />
                      </td>
                      <td className={`${G_TD} text-[13px] font-bold text-[var(--sf-ink)]/75`}>
                        {formatStudentGrade(student.grade) ?? "—"}
                      </td>
                      <td className={G_TD}>
                        <span className="block max-w-[14rem] truncate text-[13px] font-extrabold text-[var(--sf-ink)]">
                          {student.programNames.length ? student.programNames.join(", ") : "—"}
                        </span>
                      </td>
                      <td className={G_TD}>
                        {student.classroomNames.length ? (
                          <span className="block max-w-[13rem] truncate text-[13px] font-bold text-[var(--sf-ink)]/85">
                            {formatStudentClassroomLabel(student.classroomNames)}
                          </span>
                        ) : (
                          <GChip tone="warning">Unassigned</GChip>
                        )}
                      </td>
                      {model.isSchoolScope ? (
                        <td className={G_TD}>
                          <span className="block max-w-[12rem] truncate text-[13px] font-bold text-[var(--sf-ink)]/85">
                            {student.assignedTeacherNames.trim() || "Unassigned"}
                          </span>
                        </td>
                      ) : null}
                      <td className={G_TD}>
                        <GardenStudentContact name={student.primaryContactName} email={student.primaryContactEmail} />
                      </td>
                      <td className={G_TD}>
                        <GardenStudentEnrolled enrolledAt={student.enrolledAt} />
                      </td>
                    </tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
        </>
      )}

      {model.hasMoreStudents ? (
        <div className="mt-4 flex flex-col items-center gap-1.5 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-4">
          <button type="button" className={gBtnOutlineSm} onClick={model.showMore}>
            Show more students
          </button>
          <span className="text-[12px] font-semibold tabular-nums text-[var(--sf-soft)]">
            {model.remainingCount} more to show
          </span>
        </div>
      ) : null}

      {model.healthFlagCount > 0 && !model.healthOnly ? (
        <p className="m-0 mt-4 flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--sf-soft)]">
          <HeartPulse className="h-3.5 w-3.5 text-[#b4412f]" aria-hidden />
          A red dot on a photo means the student has standing health notes. Open them from the Health tab.
        </p>
      ) : null}
    </GCard>
  );
}

function ActiveFilter({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      aria-label={`Remove filter: ${label}`}
      className={`inline-flex items-center gap-1 rounded-full border-[1.5px] border-[var(--sf-ink)]/15 bg-[var(--sf-accent-wash)] px-2.5 py-0.5 text-[12.5px] font-extrabold text-[var(--sf-ink)] hover:border-[var(--sf-ink)]/40 ${G_FOCUS}`}
    >
      {label}
      <X className="h-3 w-3" aria-hidden />
    </button>
  );
}
