"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, GraduationCap, Loader2, UsersRound } from "lucide-react";
import { GCard, GChip, GSkeleton, gBtnOutlineSm, gLinkSm } from "@/components/school-parent/garden/ui";
import {
  AdminGardenPage,
  AdminGardenPageHeader,
  BusyLabel,
  GardenEmptyState,
  GardenFilterChips,
  GardenLoadError,
  GardenStatTiles,
} from "@/components/school-admin/garden/kit";
import {
  G_TABLE,
  G_TD,
  G_TH,
  GardenLeadStrip,
  GardenRefetchVeil,
  GardenSearchInput,
  gRowClass,
} from "@/components/school-admin/garden/blocks";
import { buildParentThemeTokens, parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { formatEnrolledStudentName, formatStudentGrade, type AdminEnrolledStudentSummary } from "@/lib/school-admin/enrolled-students";
import type { StudentsTableData } from "@/lib/school-admin/load-students-table-data";
import type { StudentsPageMeta } from "@/lib/school-admin/students-page-meta";
import StudentDetailPanel from "./StudentDetailPanel";
import StudentClassroomPicker from "./StudentClassroomPicker";
import {
  GardenClassroomButton,
  GardenStudentContact,
  GardenStudentEnrolled,
  GardenStudentIdentity,
  GardenStudentTeachers,
} from "./GardenStudentCells";
import { useStudentsModel, type StudentsModel } from "./useStudentsModel";

type StudentsPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  initialMeta: StudentsPageMeta;
  initialTableData?: StudentsTableData;
  tableDeferred?: boolean;
  previewMode?: boolean;
};

const HEADINGS = ["Student", "Grade", "Program", "Classroom", "Teacher", "Family", "Enrolled"];

function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

export default function StudentsPage({
  organizationId,
  branding,
  slug,
  initialMeta,
  initialTableData,
  tableDeferred = false,
  previewMode = false,
}: StudentsPageProps) {
  const theme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const model = useStudentsModel({ organizationId, slug, initialMeta, initialTableData, tableDeferred, previewMode });
  const { metrics } = model;
  const tableRef = useRef<HTMLDivElement>(null);
  const [pickerFor, setPickerFor] = useState<AdminEnrolledStudentSummary | null>(null);
  const classroomsPath = schoolAdminPath(slug, "my_school", "classrooms");
  const submissionsPath = schoolAdminPath(slug, "admissions", "submissions");

  const openPicker = (student: AdminEnrolledStudentSummary) => {
    if (previewMode) return;
    model.ensureClassroomsLoaded();
    setPickerFor(student);
  };

  const showUnassigned = () => {
    model.changeRosterFilter("unassigned");
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const subtitle =
    metrics.totalCount === 0
      ? "Students appear here once their applications are marked enrolled."
      : [
          plural(metrics.totalCount, "enrolled student"),
          metrics.unassignedCount > 0 ? `${metrics.unassignedCount} need a classroom or lead teacher` : "everyone is placed",
          metrics.newEnrollmentCount > 0 ? `${metrics.newEnrollmentCount} new this month` : null,
        ]
          .filter(Boolean)
          .join(" · ");

  const pickerStudent = pickerFor ? model.students.find((s) => s.id === pickerFor.id) ?? pickerFor : null;

  return (
    <AdminGardenPage
      theme={theme}
      skinOverlays
      data-testid="admin-students-page"
      overlays={
        <>
          <StudentDetailPanel
            open={Boolean(model.selectedId)}
            studentId={model.selectedId}
            student={model.selectedStudent}
            organizationId={organizationId}
            schoolSlug={slug}
            theme={theme}
            C={C}
            classroomsPath={classroomsPath}
            assigningClassroom={model.assigningStudentId === model.selectedId}
            onOpenClassrooms={() => (model.selectedStudent ? openPicker(model.selectedStudent) : undefined)}
            onStudentHealthChange={model.setStudentHealth}
            onClose={model.closeStudent}
          />
          <StudentClassroomPicker
            open={Boolean(pickerStudent)}
            onClose={() => setPickerFor(null)}
            studentName={pickerStudent ? formatEnrolledStudentName(pickerStudent) : ""}
            studentProgramNames={pickerStudent?.programNames ?? []}
            classroomIds={pickerStudent?.classroomIds ?? []}
            classrooms={model.classrooms}
            classroomsPath={classroomsPath}
            loading={model.classroomsLoading}
            loadError={model.classroomsError}
            onRetryLoad={() => void model.retryClassrooms()}
            onSave={(ids) => (pickerStudent ? model.setStudentClassrooms(pickerStudent.id, ids) : Promise.resolve(false))}
          />
        </>
      }
    >
      <AdminGardenPageHeader
        kicker="My school"
        title={
          <>
            My <span className="text-[var(--sf-clay)]">students</span>
          </>
        }
        subtitle={subtitle}
        refresh={
          previewMode || !model.tableReady
            ? undefined
            : {
                onRefresh: () => void model.loadStudents({ offset: 0, announce: true }),
                refreshing: model.isRefetching,
                lastUpdatedAt: model.lastUpdatedAt,
                label: "Refresh students",
              }
        }
      />

      {metrics.totalCount > 0 ? (
        <>
          {metrics.unassignedCount > 0 ? (
            <GardenLeadStrip
              icon={UsersRound}
              kicker={`Needs attention · ${plural(metrics.unassignedCount, "student")}`}
              title={`${plural(metrics.unassignedCount, "enrolled student")} ${
                metrics.unassignedCount === 1 ? "isn't" : "aren't"
              } in a classroom or ${metrics.unassignedCount === 1 ? "is" : "are"} missing a lead teacher`}
              cta="View unassigned"
              onClick={showUnassigned}
              data-testid="students-view-unassigned"
            />
          ) : null}
          <GardenStatTiles
            ariaLabel="Students at a glance"
            stats={[
              {
                id: "all",
                label: "All enrolled",
                value: metrics.totalCount,
                accent: "forest",
                onClick: () => model.changeRosterFilter("all"),
                active: model.rosterFilter === "all",
              },
              {
                id: "unassigned",
                label: "Needs attention",
                value: metrics.unassignedCount,
                accent: "gold",
                onClick: showUnassigned,
                active: model.rosterFilter === "unassigned",
              },
              ...(metrics.programCount > 1
                ? [{ id: "programs", label: "Programs", value: metrics.programCount, accent: "sky" as const }]
                : []),
              {
                id: "new",
                label: "New enrollments",
                value: metrics.newEnrollmentCount,
                accent: "berry",
                href: submissionsPath,
                hint: "Last 30 days",
              },
            ]}
          />
        </>
      ) : null}

      <div ref={tableRef} className="scroll-mt-4">
        <StudentsTableCard model={model} classroomsPath={classroomsPath} submissionsPath={submissionsPath} onOpenPicker={openPicker} />
      </div>
    </AdminGardenPage>
  );
}

function StudentsTableCard({
  model,
  classroomsPath,
  submissionsPath,
  onOpenPicker,
}: {
  model: StudentsModel;
  classroomsPath: string;
  submissionsPath: string;
  onOpenPicker: (student: AdminEnrolledStudentSummary) => void;
}) {
  const reduce = useReducedMotion() === true;
  const { metrics } = model;

  if (model.initialLoading || (!model.tableReady && model.tableDeferred)) {
    return (
      <GCard index={2}>
        <div className="flex flex-col gap-2" role="status" aria-live="polite">
          <span className="sr-only">Loading students</span>
          <GSkeleton className="h-11 w-full max-w-sm !rounded-[14px]" />
          {Array.from({ length: 8 }).map((_, i) => (
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
        onRetry={() => void model.loadStudents({ offset: 0 })}
        retrying={model.initialLoading}
      />
    );
  }
  if (metrics.totalCount === 0) {
    return (
      <GCard index={2} kicker="Roster" title="No enrolled students yet">
        <GardenEmptyState
          icon={GraduationCap}
          title="Your roster is empty"
          description="Mark applications as enrolled in Admissions to add students to your roster."
          action={
            <Link href={submissionsPath} className={gLinkSm}>
              Go to Admissions Submissions
            </Link>
          }
        />
      </GCard>
    );
  }

  const filterOptions = [
    { key: "all", label: "All", count: metrics.totalCount },
    ...(metrics.unassignedCount > 0 ? [{ key: "unassigned", label: "Unassigned", count: metrics.unassignedCount }] : []),
    ...(metrics.programOptions.length > 1 ? metrics.programOptions.map(([programName]) => ({ key: programName, label: programName })) : []),
  ];
  const shown = model.filteredStudents;

  return (
    <GCard
      index={2}
      kicker="Roster"
      title="Enrolled students"
      action={
        <span className="text-[12.5px] font-bold tabular-nums text-[var(--sf-soft)]" aria-live="polite">
          {model.searching || model.isRefetching ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--sf-clay)]" aria-hidden />
              Updating…
            </span>
          ) : (
            `${shown.length} shown${model.hasMore ? ` of ${model.totalCount}` : ""}`
          )}
        </span>
      }
      data-testid="students-roster"
    >
      <div className="mb-4 flex flex-col gap-3 border-b-[1.5px] border-dashed border-[var(--sf-ink)]/12 pb-4 lg:flex-row lg:items-center lg:justify-between">
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
          data-testid="students-search"
        />
      </div>

      {model.refetchError ? (
        <div className="mb-4">
          <GardenLoadError
            title="Couldn't update the list"
            description={`${model.refetchError} You're seeing the last students that loaded.`}
            onRetry={() => void model.loadStudents({ offset: 0 })}
            retrying={model.isRefetching}
          />
        </div>
      ) : null}

      {shown.length === 0 ? (
        <div className="rounded-[16px] bg-[var(--sf-paper)] p-4 text-[13.5px] font-semibold text-[var(--sf-soft)]">
          No students match {model.searchQuery.trim() ? <>&ldquo;{model.searchQuery.trim()}&rdquo;</> : "the current filters"}.{" "}
          <button
            type="button"
            className={gLinkSm}
            onClick={() => {
              model.setSearchQuery("");
              model.changeRosterFilter("all");
            }}
          >
            Show everyone
          </button>
        </div>
      ) : (
        <GardenRefetchVeil active={model.isRefetching}>
          {/* Phones: one tappable card per student */}
          <ul className="m-0 flex list-none flex-col gap-2 p-0 md:hidden">
            {shown.map((student) => {
              const name = formatEnrolledStudentName(student);
              const flashed = model.flashId === student.id;
              return (
                <li key={student.id}>
                  <div
                    className={`relative flex flex-col gap-2.5 rounded-[16px] border-[1.5px] px-3.5 py-3 transition-colors duration-500 ${
                      flashed
                        ? "border-[var(--sf-forest)]/40 bg-[var(--sf-mint)]"
                        : model.selectedId === student.id
                          ? "border-[var(--sf-clay)]/40 bg-[var(--sf-accent-wash)]"
                          : "border-[var(--sf-ink)]/10 bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => model.openStudent(student.id)}
                      aria-label={`Open ${name}`}
                      className="absolute inset-0 rounded-[16px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/35"
                    />
                    <div className="pointer-events-none flex items-start justify-between gap-2">
                      <GardenStudentIdentity
                        name={name}
                        familyName={student.familyName}
                        photoUrl={student.profilePhotoUrl}
                        hasStandingHealthItems={student.hasStandingHealthItems}
                      />
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[var(--sf-ink)]/40" aria-hidden />
                    </div>
                    <div className="pointer-events-none text-[12.5px] font-semibold text-[var(--sf-soft)]">
                      {[formatStudentGrade(student.grade), student.programNames.join(", ") || null].filter(Boolean).join(" · ") || "—"}
                    </div>
                    <div className="relative z-[1] flex flex-wrap items-center gap-2">
                      <GardenClassroomButton
                        classroomNames={student.classroomNames}
                        busy={model.assigningStudentId === student.id}
                        disabled={model.previewMode}
                        onOpen={() => onOpenPicker(student)}
                      />
                      {student.assignedTeachers.length ? (
                        <GChip tone="neutral">{student.assignedTeachers.map((t) => t.name).join(", ")}</GChip>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Tablet and up: the full table */}
          <div className="-mx-1 hidden overflow-x-auto md:block">
            <table className={`${G_TABLE} min-w-[1040px]`}>
              <thead>
                <tr>
                  {HEADINGS.map((heading) => (
                    <th key={heading} scope="col" className={G_TH}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <motion.tbody initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                {shown.map((student) => {
                  const name = formatEnrolledStudentName(student);
                  const open = () => model.openStudent(student.id);
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
                      aria-label={`Open ${name}`}
                      aria-selected={model.selectedId === student.id}
                      className={gRowClass({
                        interactive: true,
                        selected: model.selectedId === student.id,
                        flashed: model.flashId === student.id,
                      })}
                    >
                      <td className={G_TD}>
                        <GardenStudentIdentity
                          name={name}
                          familyName={student.familyName}
                          photoUrl={student.profilePhotoUrl}
                          hasStandingHealthItems={student.hasStandingHealthItems}
                        />
                      </td>
                      <td className={`${G_TD} text-[13px] font-bold text-[var(--sf-ink)]/75`}>{formatStudentGrade(student.grade) ?? "—"}</td>
                      <td className={G_TD}>
                        <span className="block max-w-[14rem] truncate text-[13px] font-extrabold text-[var(--sf-ink)]">
                          {student.programNames.length ? student.programNames.join(", ") : "—"}
                        </span>
                      </td>
                      <td className={G_TD}>
                        <GardenClassroomButton
                          classroomNames={student.classroomNames}
                          busy={model.assigningStudentId === student.id}
                          disabled={model.previewMode}
                          onOpen={() => onOpenPicker(student)}
                        />
                      </td>
                      <td className={G_TD}>
                        <GardenStudentTeachers student={student} classroomsPath={classroomsPath} />
                      </td>
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
        </GardenRefetchVeil>
      )}

      {model.hasMore ? (
        <div className="mt-4 flex flex-col items-center gap-1.5 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-4">
          <button
            type="button"
            className={gBtnOutlineSm}
            disabled={model.loadingMore}
            aria-busy={model.loadingMore || undefined}
            onClick={() => void model.loadStudents({ append: true })}
            data-testid="students-load-more"
          >
            <BusyLabel busy={model.loadingMore} busyLabel="Loading more…">
              Show more
            </BusyLabel>
          </button>
          <span className="text-[12px] font-semibold tabular-nums text-[var(--sf-soft)]">
            {model.students.length} of {model.totalCount} loaded · {model.remaining} remaining
          </span>
        </div>
      ) : null}
    </GCard>
  );
}
