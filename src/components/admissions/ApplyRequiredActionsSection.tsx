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
  previewMode?: boolean;
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
  previewMode = false,
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

  function handleSchedule(applicationId: string, task: ApplicationPostSubmitTask) {
    setBookingTarget({ applicationId, task });
  }

  if (!activeApplication) return null;

  return (
    <>
      <section className="mt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold sm:text-xl" style={{ color: C.accentDark }}>
              Required actions
            </h2>
            <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
              Complete these steps after submitting your application.
            </p>
          </div>
          <div className="shrink-0 sm:pt-0">
            {pendingRequiredCount > 0 ? (
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                style={{ backgroundColor: C.warningBg, color: C.warning }}
              >
                {pendingRequiredCount} pending
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
        </div>

        <ApplyChildTabSelector
          C={C}
          applications={applications}
          activeApplicationId={activeApplication.id}
          onChange={setActiveApplicationId}
        />

        <ol className="mt-4 list-none space-y-3 p-0">
          {tasks.map((task) => (
            <PostSubmitStepCard
              key={task.actionId}
              C={C}
              task={task}
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
          previewMode={previewMode}
        />
      ) : null}
    </>
  );
}
