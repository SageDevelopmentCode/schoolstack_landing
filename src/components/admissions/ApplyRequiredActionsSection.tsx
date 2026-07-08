"use client";

import { useMemo, useState } from "react";
import ApplyChildTabSelector from "@/components/admissions/ApplyChildTabSelector";
import PostSubmitBookingModal from "@/components/admissions/PostSubmitBookingModal";
import PostSubmitStepCard from "@/components/admissions/PostSubmitStepCard";
import type {
  ApplicationPostSubmitTask,
  FamilyApplication,
} from "@/lib/admissions/parent-portal-access";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ApplyRequiredActionsSectionProps = {
  C: AdminThemeTokens;
  timezone: string;
  applications: FamilyApplication[];
  onBooked: () => void;
};

type BookingTarget = {
  applicationId: string;
  task: ApplicationPostSubmitTask;
};

export default function ApplyRequiredActionsSection({
  C,
  timezone,
  applications,
  onBooked,
}: ApplyRequiredActionsSectionProps) {
  const [bookingTarget, setBookingTarget] = useState<BookingTarget | null>(null);
  const [activeApplicationId, setActiveApplicationId] = useState(
    () => applications[0]?.id ?? "",
  );

  const activeApplication = useMemo(
    () =>
      applications.find((application) => application.id === activeApplicationId) ??
      applications[0],
    [applications, activeApplicationId],
  );

  const activePendingRequiredCount =
    activeApplication?.postSubmitTasks.filter(
      (task) => task.required && task.status === "pending",
    ).length ?? 0;

  const tasks = activeApplication?.postSubmitTasks ?? [];

  function handleSchedule(applicationId: string, task: ApplicationPostSubmitTask) {
    setBookingTarget({ applicationId, task });
  }

  if (!activeApplication) return null;

  return (
    <>
      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: C.accentDark }}>
              Required actions
            </h2>
            <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
              Complete these steps after submitting your application.
            </p>
          </div>
          {activePendingRequiredCount > 0 ? (
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
              style={{ backgroundColor: C.warningBg, color: C.warning }}
            >
              {activePendingRequiredCount} pending
            </span>
          ) : (
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
              style={{ backgroundColor: C.successBg, color: C.success }}
            >
              All set
            </span>
          )}
        </div>

        <ApplyChildTabSelector
          C={C}
          applications={applications}
          activeApplicationId={activeApplication.id}
          onChange={setActiveApplicationId}
        />

        <ol className="mt-6 list-none space-y-0 p-0">
          {tasks.map((task, index) => (
            <PostSubmitStepCard
              key={task.actionId}
              C={C}
              task={task}
              stepNumber={task.sortIndex + 1}
              totalSteps={tasks.length}
              isLast={index === tasks.length - 1}
              applicationId={activeApplication.id}
              onSchedule={handleSchedule}
            />
          ))}
        </ol>
      </section>

      {bookingTarget ? (
        <PostSubmitBookingModal
          C={C}
          applicationId={bookingTarget.applicationId}
          task={bookingTarget.task}
          timezone={timezone}
          open={Boolean(bookingTarget)}
          onClose={() => setBookingTarget(null)}
          onBooked={onBooked}
        />
      ) : null}
    </>
  );
}
