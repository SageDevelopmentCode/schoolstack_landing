"use client";

import { CircleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { Tick } from "@/components/garden/ui";
import PostSubmitStepCard from "@/components/admissions/PostSubmitStepCard";
import { GCard, GChip, GProgress, GTabBar } from "@/components/school-parent/garden/ui";
import { countPendingRequired } from "@/components/admissions/apply-dashboard/useApplyDashboardModel";
import type {
  ApplicationPostSubmitTask,
  FamilyApplication,
} from "@/lib/admissions/parent-portal-access";

/*
 * "After you apply" — the post-submit steps for each child, as numbered
 * Garden steps. Booking state lives on the page (ApplyDashboard) so the
 * Start-here strip and these steps open the same dialog.
 */

export const APPLY_REQUIRED_ACTIONS_ID = "apply-required-actions";

type ApplyRequiredActionsSectionProps = {
  index?: number;
  applications: FamilyApplication[];
  onSchedule: (applicationId: string, task: ApplicationPostSubmitTask) => void;
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
  index = 3,
  applications,
  onSchedule,
}: ApplyRequiredActionsSectionProps) {
  const [activeApplicationId, setActiveApplicationId] = useState(
    () => applications[0]?.id ?? "",
  );

  const pendingRequiredCount = useMemo(
    () => countPendingRequired(applications),
    [applications],
  );

  const activeApplication = useMemo(
    () =>
      applications.find((application) => application.id === activeApplicationId) ??
      applications[0],
    [applications, activeApplicationId],
  );

  const tasks = activeApplication?.postSubmitTasks ?? [];
  const doneCount = tasks.filter((task) => task.status === "scheduled").length;
  const firstPendingIndex = tasks.findIndex((task) => task.status === "pending");
  const allDone = tasks.length > 0 && doneCount === tasks.length;

  const navItems = useMemo(
    () =>
      applications.map((application) => ({
        key: application.id,
        label: tabLabel(application),
        suffix: hasPendingRequired(application) ? (
          <span
            className="h-2 w-2 rounded-full bg-[#d9a300] ring-[1.5px] ring-white"
            aria-label="Has pending required steps"
          />
        ) : undefined,
      })),
    [applications],
  );

  if (!activeApplication) return null;

  return (
    <GCard
      index={index}
      id={APPLY_REQUIRED_ACTIONS_ID}
      kicker="After you apply"
      title={
        <span className="inline-flex items-center gap-2">
          {pendingRequiredCount > 0 ? (
            <CircleAlert className="h-5 w-5 shrink-0 text-[#b07f00]" aria-hidden />
          ) : null}
          Required actions
        </span>
      }
      action={
        pendingRequiredCount > 0 ? (
          <GChip tone="warning">{pendingRequiredCount} pending</GChip>
        ) : (
          <GChip tone="success">✓ All set</GChip>
        )
      }
      data-testid="apply-required-actions"
    >
      <p className="m-0 -mt-2 text-[14px] font-semibold text-[var(--sf-soft)]">
        Complete these steps after submitting your application.
      </p>

      {applications.length > 1 ? (
        <div className="mt-4">
          <GTabBar
            items={navItems}
            activeKey={activeApplication.id}
            onChange={setActiveApplicationId}
            ariaLabel="Select child"
          />
        </div>
      ) : null}

      {tasks.length > 0 ? (
        <div className="mt-4 flex items-center gap-3">
          <GProgress
            value={doneCount}
            total={tasks.length}
            done={allDone}
            label="Steps completed"
          />
          <span className="shrink-0 text-[13px] font-extrabold text-[var(--sf-ink)]/70">
            {doneCount} of {tasks.length} done
          </span>
        </div>
      ) : null}

      <ol className="m-0 mt-4 flex list-none flex-col gap-2.5 p-0" aria-label="Steps">
        {tasks.map((task, i) => (
          <PostSubmitStepCard
            key={task.actionId}
            task={task}
            stepNumber={i + 1}
            isCurrent={i === firstPendingIndex}
            applicationId={activeApplication.id}
            onSchedule={onSchedule}
          />
        ))}
      </ol>

      {allDone ? (
        <div className="mt-4 flex items-center gap-3 rounded-[16px] bg-[var(--sf-mint)] px-4 py-3">
          <Tick className="h-8 w-8" color="var(--sf-forest)" />
          <p className="m-0 text-[14px] font-semibold text-[var(--sf-ink)]/80">
            Every step is booked — you&apos;re all set for now.
          </p>
        </div>
      ) : null}
    </GCard>
  );
}
