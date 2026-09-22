"use client";

import { Fragment, useState, type KeyboardEvent } from "react";
import { FileText } from "lucide-react";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentFridayBranchFlyerViewer, {
  type ParentFridayBranchFlyerViewerTarget,
} from "@/components/school-parent/friday-branch/ParentFridayBranchFlyerViewer";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type {
  ParentFridayBranchClassSummary,
  ParentFridayBranchStudentOption,
} from "@/lib/parent-portal/friday-branch/types";
import {
  getFridayBranchRowCta,
  getFridayBranchSpotsBadge,
  studentNameById,
} from "./friday-branch-parent-utils";

type ParentFridayBranchScheduleProps = {
  theme: ParentThemeTokens;
  organizationId: string;
  classes: ParentFridayBranchClassSummary[];
  studentOptions: ParentFridayBranchStudentOption[];
  blockLabel: string;
  blockDateRange: string;
  readOnly?: boolean;
  previewFamilyId?: string;
  onOpenClass: (classId: string) => void;
};

type SlotGroup = {
  slotId: string;
  slotTime: string;
  classes: ParentFridayBranchClassSummary[];
};

function groupClassesBySlot(classes: ParentFridayBranchClassSummary[]): SlotGroup[] {
  const groups = new Map<string, SlotGroup>();
  for (const classSummary of classes) {
    const key = classSummary.slotId;
    const existing = groups.get(key);
    if (existing) {
      existing.classes.push(classSummary);
      continue;
    }
    groups.set(key, {
      slotId: classSummary.slotId,
      slotTime: classSummary.slotTime,
      classes: [classSummary],
    });
  }
  return Array.from(groups.values());
}

function enrollmentChipTone(
  status: "confirmed" | "waitlisted",
): "success" | "warning" {
  return status === "waitlisted" ? "warning" : "success";
}

function TimePill({ theme, time }: { theme: ParentThemeTokens; time: string }) {
  return (
    <span
      className="inline-block rounded-[9px] px-2 py-1.5 text-[11px] font-extrabold whitespace-nowrap"
      style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
    >
      {time || "—"}
    </span>
  );
}

function EnrollmentChips({
  theme,
  classSummary,
  studentOptions,
}: {
  theme: ParentThemeTokens;
  classSummary: ParentFridayBranchClassSummary;
  studentOptions: ParentFridayBranchStudentOption[];
}) {
  if (classSummary.familyEnrollments.length === 0) {
    return <span style={{ color: theme.muted }}>—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {classSummary.familyEnrollments.map((enrollment) => (
        <ParentChip
          key={enrollment.enrollmentId}
          theme={theme}
          tone={enrollmentChipTone(
            enrollment.status === "waitlisted" ? "waitlisted" : "confirmed",
          )}
        >
          {studentNameById(studentOptions, enrollment.studentId)}
          {enrollment.status === "waitlisted" ? " · Waitlist" : ""}
        </ParentChip>
      ))}
    </div>
  );
}

function handleRowKeyDown(
  event: KeyboardEvent<HTMLElement>,
  classId: string,
  onOpenClass: (classId: string) => void,
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onOpenClass(classId);
  }
}

function RowCtaButton({
  theme,
  classSummary,
  readOnly,
  onOpenClass,
  className = "",
}: {
  theme: ParentThemeTokens;
  classSummary: ParentFridayBranchClassSummary;
  readOnly?: boolean;
  onOpenClass: (classId: string) => void;
  className?: string;
}) {
  const cta = getFridayBranchRowCta(classSummary);

  return (
    <ParentButton
      theme={theme}
      variant={cta.variant}
      disabled={readOnly}
      className={`whitespace-nowrap px-3 py-1.5 text-xs ${className}`}
      onClick={(event) => {
        event.stopPropagation();
        onOpenClass(classSummary.classId);
      }}
    >
      {cta.label}
    </ParentButton>
  );
}

function FlyerLink({
  theme,
  classSummary,
  onViewFlyer,
}: {
  theme: ParentThemeTokens;
  classSummary: ParentFridayBranchClassSummary;
  onViewFlyer: (target: ParentFridayBranchFlyerViewerTarget) => void;
}) {
  if (!classSummary.hasFlyer) return null;

  return (
    <button
      type="button"
      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold"
      style={{ color: theme.primary }}
      onClick={(event) => {
        event.stopPropagation();
        onViewFlyer({
          classId: classSummary.classId,
          fileName: classSummary.flyerFileName?.trim() || `${classSummary.name} flyer`,
        });
      }}
    >
      <FileText className="h-3.5 w-3.5" />
      View flyer
    </button>
  );
}

function DesktopScheduleTable({
  theme,
  slotGroups,
  studentOptions,
  readOnly,
  onOpenClass,
  onViewFlyer,
}: {
  theme: ParentThemeTokens;
  slotGroups: SlotGroup[];
  studentOptions: ParentFridayBranchStudentOption[];
  readOnly?: boolean;
  onOpenClass: (classId: string) => void;
  onViewFlyer: (target: ParentFridayBranchFlyerViewerTarget) => void;
}) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr style={{ backgroundColor: theme.paper }}>
            {["Time", "Class", "Location", "Ages", "Price", "Spots", "Your sign-ups", "Action"].map(
              (label) => (
                <th
                  key={label}
                  className="px-4 py-2.5 text-left text-[10px] font-extrabold uppercase tracking-[0.08em]"
                  style={{ color: theme.muted }}
                >
                  {label}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {slotGroups.map((group) => (
            <Fragment key={group.slotId}>
              {group.classes.map((classSummary, classIndex) => {
                const spotsBadge = getFridayBranchSpotsBadge(classSummary);

                return (
                  <tr
                    key={classSummary.classId}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open ${classSummary.name} details`}
                    className="cursor-pointer transition-colors hover:bg-[#F8FCF8]"
                    data-testid={`parent-friday-branch-class-${classSummary.classId}`}
                    onClick={() => onOpenClass(classSummary.classId)}
                    onKeyDown={(event) =>
                      handleRowKeyDown(event, classSummary.classId, onOpenClass)
                    }
                  >
                    {classIndex === 0 ? (
                      <td
                        rowSpan={group.classes.length}
                        className="border-t px-4 py-3 align-top"
                        style={{ borderColor: theme.line }}
                      >
                        <TimePill theme={theme} time={group.slotTime} />
                      </td>
                    ) : null}
                    <td
                      className="border-t px-4 py-3 align-top"
                      style={{ borderColor: theme.line }}
                    >
                      <b
                        className="block text-sm font-semibold"
                        style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                      >
                        {classSummary.name}
                      </b>
                      {classSummary.teacher ? (
                        <span className="text-xs" style={{ color: theme.muted }}>
                          with {classSummary.teacher}
                        </span>
                      ) : null}
                      <FlyerLink
                        theme={theme}
                        classSummary={classSummary}
                        onViewFlyer={onViewFlyer}
                      />
                    </td>
                    <td
                      className="border-t px-4 py-3 align-top text-sm"
                      style={{ borderColor: theme.line, color: theme.muted }}
                    >
                      {classSummary.location || "—"}
                    </td>
                    <td
                      className="border-t px-4 py-3 align-top"
                      style={{ borderColor: theme.line }}
                    >
                      {classSummary.ageGroup ? (
                        <ParentChip theme={theme} tone="info">
                          {classSummary.ageGroup}
                        </ParentChip>
                      ) : (
                        <span style={{ color: theme.muted }}>—</span>
                      )}
                    </td>
                    <td
                      className="border-t px-4 py-3 align-top text-sm"
                      style={{ borderColor: theme.line, color: theme.muted }}
                    >
                      {classSummary.priceCents != null
                        ? formatFeeAmount(classSummary.priceCents)
                        : "—"}
                    </td>
                    <td
                      className="border-t px-4 py-3 align-top"
                      style={{ borderColor: theme.line }}
                    >
                      <ParentChip theme={theme} tone={spotsBadge.tone}>
                        {spotsBadge.label}
                      </ParentChip>
                    </td>
                    <td
                      className="border-t px-4 py-3 align-top"
                      style={{ borderColor: theme.line }}
                    >
                      <EnrollmentChips
                        theme={theme}
                        classSummary={classSummary}
                        studentOptions={studentOptions}
                      />
                    </td>
                    <td
                      className="border-t px-4 py-3 align-top"
                      style={{ borderColor: theme.line }}
                    >
                      <RowCtaButton
                        theme={theme}
                        classSummary={classSummary}
                        readOnly={readOnly}
                        onOpenClass={onOpenClass}
                      />
                    </td>
                  </tr>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MobileScheduleCards({
  theme,
  slotGroups,
  studentOptions,
  readOnly,
  onOpenClass,
  onViewFlyer,
}: {
  theme: ParentThemeTokens;
  slotGroups: SlotGroup[];
  studentOptions: ParentFridayBranchStudentOption[];
  readOnly?: boolean;
  onOpenClass: (classId: string) => void;
  onViewFlyer: (target: ParentFridayBranchFlyerViewerTarget) => void;
}) {
  return (
    <div className="space-y-3 md:hidden">
      {slotGroups.flatMap((group) =>
        group.classes.map((classSummary) => {
          const spotsBadge = getFridayBranchSpotsBadge(classSummary);

          return (
            <div
              key={classSummary.classId}
              role="button"
              tabIndex={0}
              aria-label={`Open ${classSummary.name} details`}
              className="cursor-pointer rounded-[15px] border p-4 transition-colors hover:bg-[#F8FCF8]"
              style={{
                borderColor: theme.line,
                backgroundColor: theme.white,
              }}
              data-testid={`parent-friday-branch-class-${classSummary.classId}`}
              onClick={() => onOpenClass(classSummary.classId)}
              onKeyDown={(event) =>
                handleRowKeyDown(event, classSummary.classId, onOpenClass)
              }
            >
              <div className="flex items-start gap-3">
                <TimePill theme={theme} time={group.slotTime} />
                <div className="min-w-0 flex-1">
                  <p
                    className="text-base font-semibold"
                    style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                  >
                    {classSummary.name}
                  </p>
                  {classSummary.teacher ? (
                    <p className="mt-0.5 text-xs" style={{ color: theme.muted }}>
                      with {classSummary.teacher}
                    </p>
                  ) : null}
                  <FlyerLink
                    theme={theme}
                    classSummary={classSummary}
                    onViewFlyer={onViewFlyer}
                  />
                  <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                    {[
                      classSummary.location,
                      classSummary.ageGroup,
                      classSummary.priceCents != null
                        ? formatFeeAmount(classSummary.priceCents)
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <ParentChip theme={theme} tone={spotsBadge.tone}>
                      {spotsBadge.label}
                    </ParentChip>
                    <EnrollmentChips
                      theme={theme}
                      classSummary={classSummary}
                      studentOptions={studentOptions}
                    />
                  </div>
                </div>
              </div>
              <RowCtaButton
                theme={theme}
                classSummary={classSummary}
                readOnly={readOnly}
                onOpenClass={onOpenClass}
                className="mt-3 w-full"
              />
            </div>
          );
        }),
      )}
    </div>
  );
}

export default function ParentFridayBranchSchedule({
  theme,
  organizationId,
  classes,
  studentOptions,
  blockLabel,
  blockDateRange,
  readOnly = false,
  previewFamilyId,
  onOpenClass,
}: ParentFridayBranchScheduleProps) {
  const slotGroups = groupClassesBySlot(classes);
  const [flyerTarget, setFlyerTarget] = useState<ParentFridayBranchFlyerViewerTarget | null>(
    null,
  );

  return (
    <ParentCard theme={theme} className="!p-0 overflow-hidden">
      <header
        className="border-b px-4 py-4 sm:px-5"
        style={{ borderColor: theme.line, backgroundColor: theme.paper }}
      >
        <h2
          className="text-lg font-semibold"
          style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
        >
          Schedule
        </h2>
        <p className="mt-0.5 text-sm" style={{ color: theme.muted }}>
          {blockLabel} · {blockDateRange}
        </p>
      </header>

      <DesktopScheduleTable
        theme={theme}
        slotGroups={slotGroups}
        studentOptions={studentOptions}
        readOnly={readOnly}
        onOpenClass={onOpenClass}
        onViewFlyer={setFlyerTarget}
      />
      <div className="p-4 md:hidden">
        <MobileScheduleCards
          theme={theme}
          slotGroups={slotGroups}
          studentOptions={studentOptions}
          readOnly={readOnly}
          onOpenClass={onOpenClass}
          onViewFlyer={setFlyerTarget}
        />
      </div>

      <ParentFridayBranchFlyerViewer
        theme={theme}
        organizationId={organizationId}
        target={flyerTarget}
        open={flyerTarget !== null}
        onClose={() => setFlyerTarget(null)}
        previewFamilyId={previewFamilyId}
      />
    </ParentCard>
  );
}
