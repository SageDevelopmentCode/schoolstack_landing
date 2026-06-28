"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Paperclip, Plus, User } from "lucide-react";
import { getCommitteeTemplate } from "@/data/school-demos/rooted-meadows-committees";
import type { Committee, CommitteeMember, CommitteeTask, CommitteeTaskStatus } from "./types";
import AddTaskModal from "./AddTaskModal";

const STATUS_STYLES: Record<CommitteeTaskStatus, string> = {
  open: "bg-gray-100 text-gray-600",
  claimed: "bg-blue-100 text-blue-700",
  in_progress: "bg-[#827096]/15 text-[#827096]",
  done: "bg-emerald-100 text-emerald-700",
};

const STATUS_LABELS: Record<CommitteeTaskStatus, string> = {
  open: "Open",
  claimed: "Claimed",
  in_progress: "In progress",
  done: "Done",
};

function TaskCard({
  task,
  onClaim,
  isAdminView,
  assignableMembers,
  onAssign,
}: {
  task: CommitteeTask;
  onClaim?: () => void;
  isAdminView?: boolean;
  assignableMembers?: CommitteeMember[];
  onAssign?: (taskId: string, memberId: string) => void;
}) {
  return (
    <div className="p-4 bg-white border border-gray-100 rounded-xl hover:border-[#827096]/20 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-gray-800">{task.title}</p>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_STYLES[task.status]}`}>
          {STATUS_LABELS[task.status]}
        </span>
      </div>
      {task.description && (
        <p className="text-xs text-gray-500 mb-2">{task.description}</p>
      )}
      <div className="flex items-center gap-3 flex-wrap text-xs text-gray-400">
        {task.assigneeName && (
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {task.assigneeName}
          </span>
        )}
        {task.dueDate && (
          <span>
            Due{" "}
            {new Date(task.dueDate + "T00:00:00").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
        {task.attachmentLabel && (
          <span className="flex items-center gap-1 text-[#827096]">
            <Paperclip className="w-3 h-3" />
            {task.attachmentLabel}
          </span>
        )}
      </div>
      {isAdminView && assignableMembers && onAssign && (
        <div className="mt-3 flex items-center gap-2">
          <label className="text-xs text-gray-500">Assign:</label>
          <select
            value={task.assigneeId ?? ""}
            onChange={(e) => onAssign(task.id, e.target.value)}
            className="text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:border-[#827096]/50"
          >
            <option value="">Unassigned</option>
            {assignableMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      )}
      {!isAdminView && task.status === "open" && onClaim && (
        <button
          onClick={onClaim}
          className="mt-3 text-xs font-medium text-[#827096] hover:underline cursor-pointer"
        >
          Claim this task
        </button>
      )}
    </div>
  );
}

export default function CommitteeTasksSection({
  committee,
  isAdminView = false,
  onCommitteeUpdate,
}: {
  committee: Committee;
  isAdminView?: boolean;
  onCommitteeUpdate?: (updated: Committee) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const canManage = Boolean(isAdminView && committee.status === "active" && onCommitteeUpdate);
  const template = getCommitteeTemplate(committee.templateId);
  const groups = template?.taskGroups ?? [{ id: "general" as const, label: "Tasks" }];
  const assignableMembers = committee.members.filter(
    (m) => m.role === "member" || m.role === "lead",
  );

  const handleAdd = (task: CommitteeTask) => {
    onCommitteeUpdate?.({ ...committee, tasks: [...committee.tasks, task] });
  };

  const handleAssign = (taskId: string, memberId: string) => {
    if (!onCommitteeUpdate) return;
    const member = assignableMembers.find((m) => m.id === memberId);
    onCommitteeUpdate({
      ...committee,
      tasks: committee.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              assigneeId: member?.id,
              assigneeName: member?.name,
              status: member ? "in_progress" : "open",
            }
          : t,
      ),
    });
  };

  return (
    <div className="space-y-8">
      {canManage && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#827096] hover:bg-[#5A4D68] rounded-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add task
          </button>
        </div>
      )}
      {groups.map((group) => {
        const tasks = committee.tasks.filter((t) => t.group === group.id);
        if (tasks.length === 0 && !canManage) return null;
        return (
          <section key={group.id}>
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#827096] rounded-full" />
              {group.label}
            </h3>
            {tasks.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No tasks yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClaim={() => {}}
                    isAdminView={isAdminView}
                    assignableMembers={canManage ? assignableMembers : undefined}
                    onAssign={canManage ? handleAssign : undefined}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
      <AnimatePresence>
        {showAdd && (
          <AddTaskModal
            committee={committee}
            onClose={() => setShowAdd(false)}
            onSave={handleAdd}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
