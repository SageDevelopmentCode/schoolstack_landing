"use client";

import { Paperclip, User } from "lucide-react";
import {
  getCommitteeTemplate,
} from "@/data/school-demos/rooted-meadows-committees";
import type { Committee, CommitteeTask, CommitteeTaskStatus } from "./types";

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

function TaskCard({ task, onClaim }: { task: CommitteeTask; onClaim?: () => void }) {
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
      {task.status === "open" && onClaim && (
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
  interactive = true,
}: {
  committee: Committee;
  interactive?: boolean;
}) {
  const template = getCommitteeTemplate(committee.templateId);
  const groups = template?.taskGroups ?? [{ id: "general" as const, label: "Tasks" }];

  return (
    <div className="space-y-8">
      {groups.map((group) => {
        const tasks = committee.tasks.filter((t) => t.group === group.id);
        if (tasks.length === 0) return null;
        return (
          <section key={group.id}>
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#827096] rounded-full" />
              {group.label}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClaim={interactive ? () => {} : undefined}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
