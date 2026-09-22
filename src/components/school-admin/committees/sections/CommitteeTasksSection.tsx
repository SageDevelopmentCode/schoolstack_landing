"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Calendar, Plus, UserRound } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import type { Committee, CommitteeTask, CommitteeTaskStatus } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { createTask, deleteTask, updateTask } from "@/lib/committees/tasks";
import { getCommittee } from "@/lib/committees/committees";
import { canMemberEditItem } from "@/lib/committees/attribution";
import { TASK_STATUS_LABELS } from "@/lib/committees/task-utils";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import CommitteeWorkspaceSectionFrame from "@/components/school-admin/committees/CommitteeWorkspaceSectionFrame";
import {
  CommitteeAttributionLabel,
  committeeOperationalSurface,
} from "@/components/school-admin/committees/CommitteeAttributionLabel";
import CommitteeTaskDetailPanel, {
  type CommitteeTaskFormData,
  type CommitteeTaskPanelState,
} from "@/components/school-admin/committees/sections/CommitteeTaskDetailPanel";
import type { CommitteesApiNamespace } from "@/components/portal-committees/PortalCommitteesPage";
import { staggerContainer, staggerItem } from "@/components/school-admin/committees/committee-motion";

const COLUMNS: CommitteeTaskStatus[] = ["open", "claimed", "in_progress", "done"];

function formatDueDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function panelStatesEqual(
  a: CommitteeTaskPanelState,
  b: CommitteeTaskPanelState,
): boolean {
  if (a.mode !== b.mode) return false;
  if (a.mode === "create" && b.mode === "create") return a.status === b.status;
  if (a.mode === "edit" && b.mode === "edit") return a.taskId === b.taskId;
  return false;
}

async function notifyTaskAssignment(input: {
  taskId: string;
  organizationId: string;
  previousAssigneeMemberId?: string | null;
  portalApiNamespace: CommitteesApiNamespace | "school-admin";
}) {
  const route =
    input.portalApiNamespace === "school-admin"
      ? `/api/school-admin/committees/tasks/${input.taskId}/notify-assignment`
      : `/api/${input.portalApiNamespace}/committees/tasks/${input.taskId}/notify-assignment`;

  const response = await fetch(route, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      organizationId: input.organizationId,
      previousAssigneeMemberId: input.previousAssigneeMemberId ?? null,
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(payload?.error ?? "Failed to notify task assignee.");
  }
}

export default function CommitteeTasksSection({
  committee,
  theme,
  supabase,
  organizationId,
  onCommitteeChange,
  readOnly = false,
  currentMemberId,
  isAdmin = true,
  portalApiNamespace = "parent-portal",
}: {
  committee: Committee;
  theme: ParentThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  onCommitteeChange: (committee: Committee) => void;
  readOnly?: boolean;
  currentMemberId?: string;
  isAdmin?: boolean;
  portalApiNamespace?: CommitteesApiNamespace | "school-admin";
}) {
  const [panelState, setPanelState] = useState<CommitteeTaskPanelState | null>(null);
  const [pendingPanelState, setPendingPanelState] =
    useState<CommitteeTaskPanelState | null>(null);
  const [panelDirty, setPanelDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;

  const taskGroups = committee.config.taskGroups ?? [{ id: "general", label: "General" }];

  const selectedTask = useMemo(() => {
    if (panelState?.mode !== "edit") return null;
    return committee.tasks.find((task) => task.id === panelState.taskId) ?? null;
  }, [committee.tasks, panelState]);

  const refresh = async () => {
    const updated = await getCommittee(supabase, organizationId, committee.id);
    if (updated) onCommitteeChange(updated);
  };

  const tryOpenPanel = (next: CommitteeTaskPanelState) => {
    if (
      panelState &&
      panelDirty &&
      !panelStatesEqual(panelState, next)
    ) {
      setPendingPanelState(next);
      return;
    }
    setPanelState(next);
  };

  const openCreatePanel = (status: CommitteeTaskStatus = "open") => {
    if (readOnly) return;
    tryOpenPanel({ mode: "create", status });
  };

  const openEditPanel = (taskId: string) => {
    if (panelState?.mode === "edit" && panelState.taskId === taskId) return;
    tryOpenPanel({ mode: "edit", taskId });
  };

  const closePanel = () => {
    setPanelState(null);
    setPendingPanelState(null);
    setPanelDirty(false);
  };

  const handleConfirmNavigation = (next: CommitteeTaskPanelState) => {
    setPanelState(next);
    setPendingPanelState(null);
    setPanelDirty(false);
  };

  const handleCancelNavigation = () => {
    setPendingPanelState(null);
  };

  const handleSave = async (data: CommitteeTaskFormData) => {
    if (readOnly) return;
    setSaving(true);
    const previousAssigneeMemberId = selectedTask?.assigneeId ?? null;
    let savedTaskId: string | null = null;
    try {
      if (panelState?.mode === "create") {
        const created = await createTask(supabase, committee.id, {
          title: data.title.trim(),
          description: data.description.trim() || undefined,
          group: data.group,
          status: data.status,
          assigneeMemberId: data.assigneeMemberId ?? undefined,
          dueDate: data.dueDate || undefined,
          createdByMemberId: currentMemberId,
        });
        savedTaskId = created.id;
        adminToast.success("Task added");
      } else if (panelState?.mode === "edit" && selectedTask) {
        await updateTask(supabase, selectedTask.id, {
          title: data.title.trim(),
          description: data.description.trim(),
          group: data.group,
          status: data.status,
          assigneeMemberId: data.assigneeMemberId,
          dueDate: data.dueDate || null,
        });
        savedTaskId = selectedTask.id;
        adminToast.success("Task updated");
      }
      closePanel();
      await refresh();
      if (savedTaskId) {
        void notifyTaskAssignment({
          taskId: savedTaskId,
          organizationId,
          previousAssigneeMemberId:
            panelState?.mode === "edit" ? previousAssigneeMemberId : null,
          portalApiNamespace: isAdmin ? "school-admin" : portalApiNamespace,
        }).catch((err) => {
          void reportPortalOperationalError(
            committeeOperationalSurface(isAdmin),
            {
              organizationId,
              operation: "committees.tasks.notify_assignment",
              error: "",
            },
            err,
          );
        });
      }
    } catch (err) {
      adminToast.error(
        formatActionError(
          err,
          panelState?.mode === "create"
            ? "Failed to add task."
            : "Failed to update task.",
        ),
      );
      void reportPortalOperationalError(
        committeeOperationalSurface(isAdmin),
        {
          organizationId,
          operation:
            panelState?.mode === "create"
              ? "committees.tasks.add"
              : "committees.tasks.update",
          error: "",
        },
        err,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTask || readOnly) return;
    setSaving(true);
    try {
      await deleteTask(supabase, selectedTask.id);
      closePanel();
      await refresh();
      adminToast.success("Task deleted");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to delete task."));
      void reportPortalOperationalError(
        committeeOperationalSurface(isAdmin),
        {
          organizationId,
          operation: "committees.tasks.delete",
          error: "",
        },
        err,
      );
    } finally {
      setSaving(false);
    }
  };

  const groupLabel = (key: string) =>
    taskGroups.find((groupItem) => groupItem.id === key)?.label ?? key;

  const panelCanEdit =
    !readOnly &&
    (panelState?.mode === "create"
      ? true
      : selectedTask != null &&
        canMemberEditItem(
          selectedTask.createdByMemberId,
          currentMemberId,
          isAdmin,
        ));

  return (
    <CommitteeWorkspaceSectionFrame width="full">
      <div className="space-y-4">
        <div className="flex justify-end">
          {!readOnly ? (
            <AdminButton
              theme={theme}
              variant="primary"
              size="compact"
              onClick={() => openCreatePanel("open")}
            >
              <Plus className="h-3.5 w-3.5" />
              Add task
            </AdminButton>
          ) : null}
        </div>

        <motion.div
          key={committee.tasks.map((task) => task.id).join("-")}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
          variants={staggerContainer(reducedMotion)}
          initial="initial"
          animate="animate"
        >
          {COLUMNS.map((status) => {
            const columnTasks = committee.tasks.filter((task) => task.status === status);
            return (
              <motion.div key={status} variants={staggerItem(reducedMotion)}>
                <div
                  className="flex min-h-[280px] flex-col space-y-2 rounded-2xl border p-3"
                  style={{ backgroundColor: theme.white, borderColor: theme.line }}
                >
                  <h4
                    className="text-xs font-semibold uppercase"
                    style={{ color: theme.muted }}
                  >
                    {TASK_STATUS_LABELS[status]}
                  </h4>
                  {columnTasks.length === 0 ? (
                    <p
                      className="py-6 text-center text-xs"
                      style={{ color: theme.muted }}
                    >
                      No tasks here
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          theme={theme}
                          groupLabel={groupLabel(task.group)}
                          members={committee.members}
                          onOpen={() => openEditPanel(task.id)}
                        />
                      ))}
                    </div>
                  )}
                  {!readOnly ? (
                    <button
                      type="button"
                      onClick={() => openCreatePanel(status)}
                      className="mt-auto flex items-center gap-1 rounded-md px-1 py-2 text-left text-xs font-medium transition-colors"
                      style={{ color: theme.muted }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add task
                    </button>
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <CommitteeTaskDetailPanel
          open={panelState != null}
          mode={panelState?.mode ?? "create"}
          task={selectedTask}
          defaultStatus={
            panelState?.mode === "create" ? panelState.status : "open"
          }
          taskGroups={taskGroups}
          members={committee.members}
          theme={theme}
          readOnly={readOnly}
          canEdit={panelCanEdit}
          saving={saving}
          pendingNavigation={pendingPanelState}
          onClose={closePanel}
          onSave={handleSave}
          onDelete={
            panelState?.mode === "edit" && panelCanEdit
              ? handleDelete
              : undefined
          }
          onDirtyChange={setPanelDirty}
          onConfirmNavigation={handleConfirmNavigation}
          onCancelNavigation={handleCancelNavigation}
        />
      </div>
    </CommitteeWorkspaceSectionFrame>
  );
}

function TaskCard({
  task,
  theme,
  groupLabel,
  members,
  onOpen,
}: {
  task: CommitteeTask;
  theme: ParentThemeTokens;
  groupLabel: string;
  members: Committee["members"];
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="block w-full cursor-pointer text-left"
    >
      <AdminCard theme={theme} padding="compact" className="!p-2 hover:shadow-md">
        <p
          className="mb-1 text-xs font-semibold leading-snug"
          style={{ color: theme.ink }}
        >
          {task.title}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <AdminChip theme={theme} tone="info" className="!py-0.5 !text-[9px]">
            {groupLabel}
          </AdminChip>
          {task.dueDate ? (
            <span
              className="inline-flex items-center gap-0.5 text-[10px]"
              style={{ color: theme.muted }}
            >
              <Calendar className="h-2.5 w-2.5" />
              {formatDueDate(task.dueDate)}
            </span>
          ) : null}
          <span
            className="inline-flex items-center gap-0.5 text-[10px]"
            style={{ color: theme.muted }}
          >
            <UserRound className="h-2.5 w-2.5" />
            {task.assigneeName ?? "Unassigned"}
          </span>
        </div>
        <CommitteeAttributionLabel
          theme={theme}
          createdByMemberId={task.createdByMemberId}
          createdByName={task.createdByName}
          createdByRole={task.createdByRole}
          members={members}
          className="mt-1 text-[10px]"
        />
      </AdminCard>
    </button>
  );
}
