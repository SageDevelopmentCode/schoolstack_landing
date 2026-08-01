"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { Committee, CommitteeTaskStatus } from "@/lib/committees/types";
import { createTask, updateTask } from "@/lib/committees/tasks";
import { getCommittee } from "@/lib/committees/committees";
import { TASK_STATUS_LABELS } from "@/lib/committees/task-utils";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import CommitteeModalShell from "@/components/school-admin/committees/CommitteeModalShell";
import { staggerContainer, staggerItem } from "@/components/school-admin/committees/committee-motion";

const COLUMNS: CommitteeTaskStatus[] = ["open", "claimed", "in_progress", "done"];

export default function CommitteeTasksSection({
  committee,
  C,
  supabase,
  organizationId,
  onCommitteeChange,
  readOnly = false,
}: {
  committee: Committee;
  C: AdminThemeTokens;
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
    }
  };

  const groupLabel = (key: string) =>
    taskGroups.find((g) => g.id === key)?.label ?? key;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {!readOnly && (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg cursor-pointer"
          style={{ backgroundColor: C.accent }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add task
        </button>
        )}
      </div>

      <motion.div
        key={committee.tasks.map((t) => t.id).join("-")}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
        variants={staggerContainer(reducedMotion)}
        initial="initial"
        animate="animate"
      >
        {COLUMNS.map((status) => (
          <motion.div key={status} variants={staggerItem(reducedMotion)}>
            <h4 className="text-xs font-semibold uppercase mb-2" style={{ color: C.textSecondary }}>
              {TASK_STATUS_LABELS[status]}
            </h4>
            <div className="space-y-2">
              {committee.tasks
                .filter((t) => t.status === status)
                .map((task) => (
                  <motion.div
                    key={task.id}
                    variants={staggerItem(reducedMotion)}
                    className="p-3 rounded-lg border"
                    style={{ backgroundColor: C.surface, borderColor: C.border }}
                  >
                    <p className="text-sm font-medium mb-1" style={{ color: C.textPrimary }}>
                      {task.title}
                    </p>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: C.accentLight, color: C.accent }}
                    >
                      {groupLabel(task.group)}
                    </span>
                    {task.assigneeName && (
                      <p className="text-xs mt-2" style={{ color: C.textTertiary }}>
                        {task.assigneeName}
                      </p>
                    )}
                    {!readOnly ? (
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task.id, e.target.value as CommitteeTaskStatus)
                      }
                      className="mt-2 w-full text-xs rounded border px-1 py-1"
                      style={{ borderColor: C.border }}
                    >
                      {COLUMNS.map((s) => (
                        <option key={s} value={s}>
                          {TASK_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                    ) : (
                      <p className="text-xs mt-2" style={{ color: C.textTertiary }}>
                        {TASK_STATUS_LABELS[task.status]}
                      </p>
                    )}
                  </motion.div>
                ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
      {showAdd && (
        <CommitteeModalShell
          C={C}
          title="Add task"
          onClose={() => setShowAdd(false)}
          footer={
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm cursor-pointer">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={saving || !title.trim()}
                className="px-4 py-2 text-sm font-medium text-white rounded-md cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: C.accent }}
              >
                {saving ? "Adding…" : "Add task"}
              </button>
            </div>
          }
        >
            <input
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border mb-3"
              style={{ borderColor: C.border }}
            />
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border"
              style={{ borderColor: C.border }}
            >
              {taskGroups.map((g) => (
                <option key={g.id} value={g.id}>{g.label}</option>
              ))}
            </select>
        </CommitteeModalShell>
      )}
      </AnimatePresence>
    </div>
  );
}
