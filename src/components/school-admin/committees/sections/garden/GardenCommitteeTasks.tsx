"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, Calendar, Plus, UserRound } from "lucide-react";
import { CommitteeAttributionLabel } from "@/components/school-admin/committees/CommitteeAttributionLabel";
import { gFade } from "@/components/school-parent/garden/motion";
import { GChip, GProgress, G_FOCUS, SPRINGY, gBtnPopSm } from "@/components/school-parent/garden/ui";
import { dateKey } from "@/lib/committees/calendar-utils";
import { TASK_STATUS_LABELS } from "@/lib/committees/task-utils";
import type { Committee, CommitteeTask, CommitteeTaskStatus } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { GardenSectionHeader, formatShortDate, plural } from "./committee-garden-section";

const LANE_DOT: Record<CommitteeTaskStatus, string> = {
  open: "bg-[var(--sf-butter)]",
  claimed: "bg-[var(--sf-sky)]",
  in_progress: "bg-[var(--sf-lav)]",
  done: "bg-[var(--sf-mint)]",
};

const LANE_HINT: Record<CommitteeTaskStatus, string> = {
  open: "Ready for someone to pick up",
  claimed: "Someone has it",
  in_progress: "Being worked on",
  done: "Finished",
};

function TaskTile({
  task,
  theme,
  groupLabel,
  members,
  currentMemberId,
  todayKey,
  onOpen,
}: {
  task: CommitteeTask;
  theme: ParentThemeTokens;
  groupLabel: string;
  members: Committee["members"];
  currentMemberId?: string;
  todayKey: string;
  onOpen: () => void;
}) {
  const mine = currentMemberId != null && task.assigneeId === currentMemberId;
  const overdue = task.status !== "done" && task.dueDate != null && task.dueDate < todayKey;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${task.title}${mine ? ", assigned to you" : ""}${overdue ? ", overdue" : ""}`}
      className={`group block w-full rounded-[16px] border-[1.5px] bg-white p-3 text-left shadow-[0_2px_0_0_rgba(43,36,29,0.06)] hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/30 ${SPRINGY} ${G_FOCUS} ${
        mine ? "border-[var(--sf-clay)]/45" : "border-[var(--sf-ink)]/10"
      } ${task.status === "done" ? "opacity-75" : ""}`}
    >
      <span
        className={`block text-[14.5px] font-extrabold leading-snug text-[var(--sf-ink)] ${
          task.status === "done" ? "line-through decoration-[var(--sf-ink)]/30" : ""
        }`}
      >
        {task.title}
      </span>
      <span className="mt-2 flex flex-wrap items-center gap-1.5">
        <GChip tone="neutral" className="!text-[11px]">{groupLabel}</GChip>
        {overdue ? (
          <GChip tone="alert" className="!text-[11px]">
            <AlertCircle className="h-3 w-3" aria-hidden="true" /> Overdue
          </GChip>
        ) : null}
        {mine ? <GChip tone="success" className="!text-[11px]">You</GChip> : null}
      </span>
      <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] font-semibold text-[var(--sf-soft)]">
        <span className="inline-flex items-center gap-1">
          <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
          {task.assigneeName ?? "Unassigned"}
        </span>
        {task.dueDate ? (
          <span className={`inline-flex items-center gap-1 ${overdue ? "text-[var(--sf-clay-deep)]" : ""}`}>
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            Due {formatShortDate(task.dueDate)}
          </span>
        ) : null}
      </span>
      <CommitteeAttributionLabel
        theme={theme}
        createdByMemberId={task.createdByMemberId}
        createdByName={task.createdByName}
        createdByRole={task.createdByRole}
        members={members}
        className="mt-1.5 text-[11.5px]"
      />
    </button>
  );
}

/**
 * Committee Tasks (Garden): a progress summary, then four lanes (Open →
 * Claimed → In progress → Done) with counts, Garden task tiles that flag
 * yours and overdue ones, and "Add task" in each lane.
 */
export default function GardenCommitteeTasks({
  committee,
  theme,
  readOnly,
  currentMemberId,
  columns,
  groupLabel,
  onOpenTask,
  onCreateTask,
}: {
  committee: Committee;
  theme: ParentThemeTokens;
  readOnly: boolean;
  currentMemberId?: string;
  columns: CommitteeTaskStatus[];
  groupLabel: (key: string) => string;
  onOpenTask: (taskId: string) => void;
  onCreateTask: (status: CommitteeTaskStatus) => void;
}) {
  const reduce = useReducedMotion() === true;
  const todayKey = dateKey(new Date());
  const tasks = committee.tasks;
  const done = tasks.filter((task) => task.status === "done").length;
  const mine = currentMemberId ? tasks.filter((task) => task.assigneeId === currentMemberId && task.status !== "done").length : 0;
  const needsSomeone = tasks.filter((task) => task.status === "open" && !task.assigneeId && !task.assigneeName).length;

  return (
    <div data-testid="committee-tasks-garden">
      <GardenSectionHeader
        kicker="Tasks"
        title="Who's doing what"
        description={
          readOnly
            ? "See what the committee is working on and who has each task."
            : "Open a task to claim it, update its status, or add details. Add a task in any lane."
        }
        actions={
          !readOnly ? (
            <button type="button" className={gBtnPopSm} onClick={() => onCreateTask("open")}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add task
            </button>
          ) : null
        }
      />

      {tasks.length > 0 ? (
        <div className="mb-5 flex flex-col gap-3 rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white p-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[14px] font-extrabold text-[var(--sf-ink)]">
              {done} of {plural(tasks.length, "task")} done
            </p>
            <GProgress
              value={done}
              total={tasks.length}
              done={done === tasks.length}
              label={`${done} of ${tasks.length} tasks done`}
              className="mt-2"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {mine > 0 ? <GChip tone="success">{plural(mine, "task")} on you</GChip> : null}
            {needsSomeone > 0 ? <GChip tone="warning">{needsSomeone} need someone</GChip> : null}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((status, laneIndex) => {
          const laneTasks = tasks.filter((task) => task.status === status);
          return (
            <motion.section
              key={status}
              {...gFade(laneIndex + 1, reduce)}
              aria-label={`${TASK_STATUS_LABELS[status]}: ${plural(laneTasks.length, "task")}`}
              className="flex min-h-[260px] flex-col rounded-[22px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-3"
            >
              <div className="mb-1 flex items-center gap-2 px-1">
                <span aria-hidden="true" className={`h-3 w-3 rounded-full ring-2 ring-[var(--sf-ink)] ${LANE_DOT[status]}`} />
                <h3 className="m-0 flex-1 text-[13px] font-extrabold uppercase tracking-[0.12em] text-[var(--sf-ink)]">
                  {TASK_STATUS_LABELS[status]}
                </h3>
                <GChip tone="neutral">{laneTasks.length}</GChip>
              </div>
              <p className="m-0 mb-2.5 px-1 text-[12px] font-semibold text-[var(--sf-soft)]">{LANE_HINT[status]}</p>
              {laneTasks.length === 0 ? (
                <p className="m-0 flex-1 rounded-[14px] border-[1.5px] border-dashed border-[var(--sf-ink)]/15 px-3 py-6 text-center text-[13px] font-semibold text-[var(--sf-soft)]">
                  No tasks here
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {laneTasks.map((task) => (
                    <TaskTile
                      key={task.id}
                      task={task}
                      theme={theme}
                      groupLabel={groupLabel(task.group)}
                      members={committee.members}
                      currentMemberId={currentMemberId}
                      todayKey={todayKey}
                      onOpen={() => onOpenTask(task.id)}
                    />
                  ))}
                </div>
              )}
              {!readOnly ? (
                <button
                  type="button"
                  onClick={() => onCreateTask(status)}
                  className={`mt-2.5 flex items-center justify-center gap-1.5 rounded-full border-[1.5px] border-dashed border-[var(--sf-ink)]/20 px-3 py-2 text-[13px] font-extrabold text-[var(--sf-ink)]/70 hover:border-[var(--sf-clay)]/50 hover:bg-white hover:text-[var(--sf-clay-deep)] ${G_FOCUS}`}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Add task
                </button>
              ) : null}
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}
