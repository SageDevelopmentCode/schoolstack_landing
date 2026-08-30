"use client";

import { useMemo, useState } from "react";
import PostSubmitBookingModal from "@/components/admissions/PostSubmitBookingModal";
import PostSubmitStepCard from "@/components/admissions/PostSubmitStepCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentStoryPillNav from "@/components/school-parent/ui/ParentStoryPillNav";
import type { ShadowDaySchedulingMode } from "@/lib/admissions/admissions-org-settings";
import type {
  ApplicationPostSubmitTask,
  FamilyApplication,
} from "@/lib/admissions/parent-portal-access";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ApplyRequiredActionsSectionProps = {
  theme: ParentThemeTokens;
  adminCompat: AdminThemeTokens;
  timezone: string;
  applications: FamilyApplication[];
  onBooked: () => void;
  previewMode?: boolean;
  shadowDaySchedulingMode?: ShadowDaySchedulingMode;
};

type BookingTarget = {
  applicationId: string;
  task: ApplicationPostSubmitTask;
};

function tabLabel(application: FamilyApplication): string {
  return application.studentName ?? application.formTitle;
}

function hasPendingRequired(application: FamilyApplication): boolean {
  return application.postSubmitTasks.some(
    (task) => task.required && task.status === "pending",
  );
}

export default function ApplyRequiredActionsSection({
  theme,
  adminCompat,
  timezone,
  applications,
  onBooked,
  previewMode = false,
  shadowDaySchedulingMode,
}: ApplyRequiredActionsSectionProps) {
  const [bookingTarget, setBookingTarget] = useState<BookingTarget | null>(null);
  const [activeApplicationId, setActiveApplicationId] = useState(
    () => applications[0]?.id ?? "",
  );

  const pendingRequiredCount = useMemo(
    () =>
      applications.reduce(
        (count, application) =>
          count +
          application.postSubmitTasks.filter(
            (task) => task.required && task.status === "pending",
          ).length,
        0,
      ),
    [applications],
  );

  const activeApplication = useMemo(
    () =>
      applications.find((application) => application.id === activeApplicationId) ??
      applications[0],
    [applications, activeApplicationId],
  );

  const tasks = activeApplication?.postSubmitTasks ?? [];

  const navItems = useMemo(
    () =>
      applications.map((application) => ({
        key: application.id,
        label: tabLabel(application),
        suffix: hasPendingRequired(application) ? (
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: theme.warning }}
            aria-label="Has pending required steps"
          />
        ) : undefined,
      })),
    [applications, theme.warning],
  );

  function handleSchedule(applicationId: string, task: ApplicationPostSubmitTask) {
    setBookingTarget({ applicationId, task });
  }

  if (!activeApplication) return null;

  return (
    <>
      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <ParentSectionKicker theme={theme}>After you apply</ParentSectionKicker>
            <ParentDisplayHeading theme={theme} as="h2" size="section" className="!text-xl">
              Required actions
            </ParentDisplayHeading>
            <p className="mt-1 text-[13px]" style={{ color: theme.muted }}>
              Complete these steps after submitting your application.
            </p>
          </div>
          <div className="shrink-0">
            {pendingRequiredCount > 0 ? (
              <ParentChip theme={theme} tone="warning">
                {pendingRequiredCount} pending
              </ParentChip>
            ) : (
              <ParentChip theme={theme} tone="success">
                All set
              </ParentChip>
            )}
          </div>
        </div>

        {applications.length > 1 ? (
          <div className="mt-4">
            <ParentStoryPillNav
              theme={theme}
              items={navItems}
              activeKey={activeApplication.id}
              onChange={setActiveApplicationId}
              ariaLabel="Select child"
            />
          </div>
        ) : null}

        <ol className="mt-4 list-none space-y-3 p-0">
          {tasks.map((task) => (
            <PostSubmitStepCard
              key={task.actionId}
              C={adminCompat}
              task={task}
              applicationId={activeApplication.id}
              onSchedule={handleSchedule}
            />
          ))}
        </ol>
      </section>

      {bookingTarget ? (
        <PostSubmitBookingModal
          C={adminCompat}
          applicationId={bookingTarget.applicationId}
          task={bookingTarget.task}
          timezone={timezone}
          open={Boolean(bookingTarget)}
          onClose={() => setBookingTarget(null)}
          onBooked={onBooked}
          previewMode={previewMode}
          shadowDaySchedulingMode={shadowDaySchedulingMode}
        />
      ) : null}
    </>
  );
}
