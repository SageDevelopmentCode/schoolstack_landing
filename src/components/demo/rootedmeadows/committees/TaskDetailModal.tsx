"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Paperclip, Phone, X } from "lucide-react";
import type { CommitteeMember, CommitteeRole, CommitteeTask } from "./types";
import {
  memberInitials,
  TASK_STATUS_LABELS,
  TASK_STATUS_STYLES,
} from "./committeeTaskUtils";
import TaskAssigneeAvatars from "./TaskAssigneeAvatars";

const ROLE_LABELS: Record<CommitteeRole, string> = {
  member: "Member",
  lead: "Lead",
  faculty_liaison: "Faculty liaison",
  admin: "Admin",
};

const ROLE_STYLES: Record<CommitteeRole, string> = {
  member: "bg-gray-100 text-gray-600",
  lead: "bg-[#827096]/15 text-[#827096]",
  faculty_liaison: "bg-[#b3b462]/20 text-[#5C5A30]",
  admin: "bg-amber-100 text-amber-700",
};

function formatDueDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function TaskDetailModal({
  task,
  groupLabel,
  assignee,
  assignableMembers,
  canManage,
  canClaim,
  onAssign,
  onClaim,
  onClose,
}: {
  task: CommitteeTask | null;
  groupLabel: string;
  assignee?: CommitteeMember;
  assignableMembers?: CommitteeMember[];
  canManage?: boolean;
  canClaim?: boolean;
  onAssign?: (taskId: string, memberId: string) => void;
  onClaim?: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && task) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [task, onClose]);

  return (
    <AnimatePresence>
      {task && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 leading-snug">{task.title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TASK_STATUS_STYLES[task.status]}`}
                >
                  {TASK_STATUS_LABELS[task.status]}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#827096]/10 text-[#827096]">
                  {groupLabel}
                </span>
              </div>

              {task.description && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Description
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{task.description}</p>
                </div>
              )}

              {task.dueDate && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Due date
                  </p>
                  <p className="text-sm text-gray-800">{formatDueDate(task.dueDate)}</p>
                </div>
              )}

              {task.attachmentLabel && (
                <div className="flex items-center gap-2 text-sm text-[#827096]">
                  <Paperclip className="w-4 h-4 shrink-0" />
                  <span>{task.attachmentLabel}</span>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Assignee
                </p>
                {assignee ? (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-[#827096] flex items-center justify-center text-white font-semibold text-sm shrink-0">
                      {memberInitials(assignee.name)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-800">{assignee.name}</p>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ROLE_STYLES[assignee.role]}`}
                        >
                          {ROLE_LABELS[assignee.role]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        {assignee.email}
                      </p>
                      {assignee.phone && (
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          {assignee.phone}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No one assigned yet</p>
                )}

                {canManage && assignableMembers && onAssign && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Assign to:</p>
                    <TaskAssigneeAvatars
                      task={task}
                      members={assignableMembers}
                      allMembers={assignableMembers}
                      onAssign={onAssign}
                      size="md"
                      variant="picker"
                    />
                  </div>
                )}

                {canManage && (
                  <p className="text-xs text-gray-400 mt-3">
                    Drag the card on the board to change status.
                  </p>
                )}
              </div>

              {canClaim && !assignee && task.status === "open" && onClaim && (
                <button
                  type="button"
                  onClick={onClaim}
                  className="text-sm font-medium text-[#827096] hover:underline cursor-pointer"
                >
                  Claim this task
                </button>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
