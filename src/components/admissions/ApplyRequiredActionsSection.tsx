"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import PostSubmitBookingModal from "@/components/admissions/PostSubmitBookingModal";
import { formatDateOnlyLabel } from "@/lib/admissions/admissions-availability";
import type {
  ApplicationPostSubmitTask,
  FamilyApplication,
} from "@/lib/admissions/parent-portal-access";
import { POST_SUBMIT_ACTION_TEMPLATES } from "@/lib/admissions/post-submit-templates";
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

function formatBookingLabel(task: ApplicationPostSubmitTask): string {
  if (!task.booking) return "";
  const dateLabel = formatDateOnlyLabel(task.booking.scheduledDate);
  return `${dateLabel} at ${task.booking.startTimeSlot}`;
}

function applicationGroupLabel(application: FamilyApplication): string {
  if (application.studentName) {
    return `${application.formTitle} · ${application.studentName}`;
  }
  return application.formTitle;
}

export default function ApplyRequiredActionsSection({
  C,
  timezone,
  applications,
  onBooked,
}: ApplyRequiredActionsSectionProps) {
  const [bookingTarget, setBookingTarget] = useState<BookingTarget | null>(null);

  const pendingRequiredCount = applications.reduce((count, application) => {
    return (
      count +
      application.postSubmitTasks.filter(
        (task) => task.required && task.status === "pending",
      ).length
    );
  }, 0);

  function renderTask(applicationId: string, task: ApplicationPostSubmitTask) {
    const Icon = POST_SUBMIT_ACTION_TEMPLATES[task.type]?.Icon ?? Circle;
    const isScheduled = task.status === "scheduled";

    return (
      <div
        key={task.actionId}
        className="rounded-md border px-4 py-3"
        style={{
          borderColor: isScheduled ? C.successBorder : C.border,
          backgroundColor: isScheduled ? C.successBg : "#FFFFFF",
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2.5">
              <Icon
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: isScheduled ? C.success : C.accent }}
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium" style={{ color: C.accentDark }}>
                    {task.title}
                  </p>
                  {!task.required ? (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: C.surface, color: C.textTertiary }}
                    >
                      Optional
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: C.textSecondary }}>
                  {task.instructions}
                </p>
                {isScheduled && task.booking ? (
                  <p
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium"
                    style={{ color: C.success }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Scheduled {formatBookingLabel(task)}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {!isScheduled ? (
            <button
              type="button"
              onClick={() => setBookingTarget({ applicationId, task })}
              className="inline-flex shrink-0 items-center justify-center rounded-md px-3 py-2 text-xs font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: C.accent }}
            >
              Schedule
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  function renderApplicationGroup(application: FamilyApplication) {
    const requiredTasks = application.postSubmitTasks.filter((task) => task.required);
    const optionalTasks = application.postSubmitTasks.filter((task) => !task.required);

    return (
      <div key={application.id} className="space-y-2">
        <p className="text-sm font-medium" style={{ color: C.textSecondary }}>
          {applicationGroupLabel(application)}
        </p>

        {requiredTasks.map((task) => renderTask(application.id, task))}

        {optionalTasks.length > 0 ? (
          <div className="space-y-2 pt-1">
            <p className="text-xs font-medium" style={{ color: C.textTertiary }}>
              Optional
            </p>
            {optionalTasks.map((task) => renderTask(application.id, task))}
          </div>
        ) : null}
      </div>
    );
  }

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

        <div className="mt-4 space-y-6">
          {applications.map(renderApplicationGroup)}
        </div>
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
