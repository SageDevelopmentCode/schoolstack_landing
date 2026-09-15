"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import type { Committee, CommitteeTaskStatus } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { createTask, updateTask } from "@/lib/committees/tasks";
import { getCommittee } from "@/lib/committees/committees";
import { TASK_STATUS_LABELS } from "@/lib/committees/task-utils";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import CommitteeModalShell from "@/components/school-admin/committees/CommitteeModalShell";
import { committeeStoryInputStyle } from "@/components/school-admin/committees/committee-story-input-style";
import { staggerContainer, staggerItem } from "@/components/school-admin/committees/committee-motion";

const COLUMNS: CommitteeTaskStatus[] = ["open", "claimed", "in_progress", "done"];

export default function CommitteeTasksSection({
  committee,
  theme,
  supabase,
  organizationId,
  onCommitteeChange,
  readOnly = false,
}: {
  committee: Committee;
  theme: ParentThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  onCommitteeChange: (committee: Committee) => void;
  readOnly?: boolean;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [group, setGroup] = useState("general");
  const [saving, setSaving] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;
  const inputStyle = useMemo(() => committeeStoryInputStyle(theme), [theme]);

  const taskGroups = committee.config.taskGroups ?? [{ id: "general", label: "General" }];

  const refresh = async () => {
    const updated = await getCommittee(supabase, organizationId, committee.id);
    if (updated) onCommitteeChange(updated);
  };

  const handleAdd = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await createTask(supabase, committee.id, { title: title.trim(), group });
      setTitle("");
      setShowAdd(false);
      await refresh();
      adminToast.success("Task added");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to add task."));
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.tasks.add",
        error: "",
      }, err);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: CommitteeTaskStatus) => {
    try {
      await updateTask(supabase, taskId, { status });
      await refresh();
      adminToast.success("Task updated");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to update task."));
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.tasks.update",
        error: "",
      }, err);
    }
  };

  const groupLabel = (key: string) =>
    taskGroups.find((groupItem) => groupItem.id === key)?.label ?? key;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {!readOnly && (
          <AdminButton theme={theme} variant="primary" size="compact" onClick={() => setShowAdd(true)}>
            <Plus className="w-3.5 h-3.5" />
            Add task
          </AdminButton>
        )}
      </div>

      <motion.div
        key={committee.tasks.map((task) => task.id).join("-")}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
        variants={staggerContainer(reducedMotion)}
        initial="initial"
        animate="animate"
      >
        {COLUMNS.map((status) => (
          <motion.div key={status} variants={staggerItem(reducedMotion)}>
            <h4 className="text-xs font-semibold uppercase mb-2" style={{ color: theme.muted }}>
              {TASK_STATUS_LABELS[status]}
            </h4>
            <div className="space-y-2">
              {committee.tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <AdminCard key={task.id} theme={theme} padding="compact">
                    <p className="text-sm font-medium mb-1" style={{ color: theme.ink }}>
                      {task.title}
                    </p>
                    <AdminChip theme={theme} tone="info">
                      {groupLabel(task.group)}
                    </AdminChip>
                    {task.assigneeName && (
                      <p className="text-xs mt-2" style={{ color: theme.muted }}>
                        {task.assigneeName}
                      </p>
                    )}
                    {!readOnly ? (
                      <select
                        value={task.status}
                        onChange={(e) =>
                          void handleStatusChange(task.id, e.target.value as CommitteeTaskStatus)
                        }
                        className="mt-2 w-full text-xs rounded border px-1 py-1"
                        style={inputStyle}
                      >
                        {COLUMNS.map((columnStatus) => (
                          <option key={columnStatus} value={columnStatus}>
                            {TASK_STATUS_LABELS[columnStatus]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs mt-2" style={{ color: theme.muted }}>
                        {TASK_STATUS_LABELS[task.status]}
                      </p>
                    )}
                  </AdminCard>
                ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {showAdd && (
          <CommitteeModalShell
            theme={theme}
            title="Add task"
            onClose={() => setShowAdd(false)}
            footer={
              <div className="flex justify-end gap-2">
                <AdminButton theme={theme} variant="soft" onClick={() => setShowAdd(false)}>
                  Cancel
                </AdminButton>
                <AdminButton
                  theme={theme}
                  variant="primary"
                  onClick={() => void handleAdd()}
                  disabled={saving || !title.trim()}
                >
                  {saving ? "Adding…" : "Add task"}
                </AdminButton>
              </div>
            }
          >
            <input
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border mb-3"
              style={inputStyle}
            />
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border"
              style={inputStyle}
            >
              {taskGroups.map((groupItem) => (
                <option key={groupItem.id} value={groupItem.id}>{groupItem.label}</option>
              ))}
            </select>
          </CommitteeModalShell>
        )}
      </AnimatePresence>
    </div>
  );
}
