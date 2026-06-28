"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Paperclip, Plus } from "lucide-react";
import { getCommitteeTemplate } from "@/data/school-demos/rooted-meadows-committees";
import type {
  Committee,
  CommitteeMember,
  CommitteeTask,
  CommitteeTaskGroup,
  CommitteeTaskStatus,
} from "./types";
import AddTaskModal from "./AddTaskModal";
import TaskAssigneeAvatars from "./TaskAssigneeAvatars";
import TaskDetailModal from "./TaskDetailModal";
import { resolveTaskAssignee } from "./committeeTaskUtils";

const KANBAN_COLUMNS: {
  status: CommitteeTaskStatus;
  label: string;
  headerClass: string;
}[] = [
  { status: "open", label: "Open", headerClass: "text-gray-600" },
  { status: "claimed", label: "Claimed", headerClass: "text-blue-700" },
  { status: "in_progress", label: "In Progress", headerClass: "text-[#827096]" },
  { status: "done", label: "Done", headerClass: "text-emerald-700" },
];

function TaskCard({
  task,
  groupLabel,
  allMembers,
  onClaim,
  canManage,
  assignableMembers,
  onAssign,
  draggable,
  onDragStart,
  onDragEnd,
  onOpenDetail,
}: {
  task: CommitteeTask;
  groupLabel: string;
  allMembers: CommitteeMember[];
  onClaim?: () => void;
  canManage?: boolean;
  assignableMembers?: CommitteeMember[];
  onAssign?: (taskId: string, memberId: string) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onOpenDetail?: () => void;
}) {
  const handleClick = () => {
    onOpenDetail?.();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md hover:border-[#827096]/20 transition-all text-left w-full ${
        draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
      }`}
    >
      <p className="text-sm font-medium text-gray-800 leading-snug mb-2">{task.title}</p>
      <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#827096]/10 text-[#827096] mb-2">
        {groupLabel}
      </span>
      {task.description && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400 mb-2">
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
            <Paperclip className="w-3 h-3 shrink-0" />
            <span className="truncate max-w-[120px]">{task.attachmentLabel}</span>
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        {canManage && assignableMembers && onAssign ? (
          <TaskAssigneeAvatars
            task={task}
            members={assignableMembers}
            allMembers={allMembers}
            onAssign={onAssign}
          />
        ) : (
          <TaskAssigneeAvatars
            task={task}
            members={[]}
            allMembers={allMembers}
            readOnly
          />
        )}
        {!canManage && task.status === "open" && onClaim && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClaim();
            }}
            className="text-xs font-medium text-[#827096] hover:underline cursor-pointer shrink-0"
          >
            Claim
          </button>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({
  label,
  headerClass,
  count,
  isDropTarget,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
}: {
  label: string;
  headerClass: string;
  count: number;
  isDropTarget: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col min-w-[280px] w-[280px] flex-shrink-0 bg-gray-100/80 rounded-xl p-3 transition-shadow ${
        isDropTarget ? "ring-2 ring-[#827096]/40 ring-offset-1" : ""
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className={`text-xs font-semibold uppercase tracking-wide ${headerClass}`}>
          {label}
        </h3>
        <span className="text-xs font-medium text-gray-400 bg-white/80 px-2 py-0.5 rounded-full">
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-2 min-h-[80px]">{children}</div>
    </div>
  );
}

export default function CommitteeTasksSection({
  committee,
  isAdminView = false,
  onCommitteeUpdate,
  currentUserId,
}: {
  committee: Committee;
  isAdminView?: boolean;
  onCommitteeUpdate?: (updated: Committee) => void;
  currentUserId?: string;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [filterGroup, setFilterGroup] = useState<CommitteeTaskGroup | "all">("all");
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dropTargetStatus, setDropTargetStatus] = useState<CommitteeTaskStatus | null>(null);
  const [localTasks, setLocalTasks] = useState(committee.tasks);
  const didDragRef = useRef(false);

  useEffect(() => {
    setLocalTasks(committee.tasks);
  }, [committee.id, committee.tasks]);

  const tasks = onCommitteeUpdate ? committee.tasks : localTasks;

  const updateTasks = (nextTasks: CommitteeTask[]) => {
    if (onCommitteeUpdate) {
      onCommitteeUpdate({ ...committee, tasks: nextTasks });
    } else {
      setLocalTasks(nextTasks);
    }
  };

  const canManage = Boolean(isAdminView && committee.status === "active" && onCommitteeUpdate);
  const canClaim = Boolean(
    !isAdminView && committee.status === "active" && currentUserId,
  );

  const template = getCommitteeTemplate(committee.templateId);
  const groups = template?.taskGroups ?? [{ id: "general" as const, label: "Tasks" }];
  const showFilter = groups.length > 1;

  const groupLabelMap = useMemo(() => {
    const map = new Map<CommitteeTaskGroup, string>();
    for (const g of groups) map.set(g.id, g.label);
    return map;
  }, [groups]);

  const assignableMembers = committee.members.filter(
    (m) => m.role === "member" || m.role === "lead",
  );

  const filteredTasks = useMemo(
    () =>
      filterGroup === "all"
        ? tasks
        : tasks.filter((t) => t.group === filterGroup),
    [tasks, filterGroup],
  );

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  const getGroupLabel = (groupId: CommitteeTaskGroup) =>
    groupLabelMap.get(groupId) ?? "Tasks";

  const handleAdd = (task: CommitteeTask) => {
    updateTasks([...tasks, task]);
  };

  const handleAssign = (taskId: string, memberId: string) => {
    const member = assignableMembers.find((m) => m.id === memberId);
    updateTasks(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              assigneeId: member?.id,
              assigneeName: member?.name,
              status: member ? "in_progress" : "open",
            }
          : t,
      ),
    );
  };

  const handleStatusChange = (taskId: string, newStatus: CommitteeTaskStatus) => {
    updateTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );
  };

  const handleClaim = (taskId: string) => {
    if (!currentUserId) return;
    const member = committee.members.find((m) => m.id === currentUserId);
    if (!member) return;
    updateTasks(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "claimed",
              assigneeId: member.id,
              assigneeName: member.name,
            }
          : t,
      ),
    );
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    didDragRef.current = true;
    e.dataTransfer.setData("text/task-id", taskId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDropTargetStatus(null);
    window.setTimeout(() => {
      didDragRef.current = false;
    }, 100);
  };

  const handleOpenDetail = (taskId: string) => {
    if (didDragRef.current) return;
    setSelectedTaskId(taskId);
  };

  const handleColumnDragOver = (e: React.DragEvent, status: CommitteeTaskStatus) => {
    if (!canManage || !draggingTaskId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetStatus(status);
  };

  const handleColumnDrop = (e: React.DragEvent, status: CommitteeTaskStatus) => {
    e.preventDefault();
    if (!canManage) return;
    const taskId = e.dataTransfer.getData("text/task-id");
    if (taskId) handleStatusChange(taskId, status);
    setDraggingTaskId(null);
    setDropTargetStatus(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {showFilter ? (
          <div className="flex items-center gap-2">
            <label htmlFor="task-project-filter" className="text-xs text-gray-500">
              Project:
            </label>
            <select
              id="task-project-filter"
              value={filterGroup}
              onChange={(e) =>
                setFilterGroup(e.target.value as CommitteeTaskGroup | "all")
              }
              className="text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-[#827096]/50 bg-white"
            >
              <option value="all">All projects</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div />
        )}
        {canManage && (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#827096] hover:bg-[#5A4D68] rounded-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add task
          </button>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
        {KANBAN_COLUMNS.map(({ status, label, headerClass }) => {
          const columnTasks = filteredTasks.filter((t) => t.status === status);
          return (
            <KanbanColumn
              key={status}
              label={label}
              headerClass={headerClass}
              count={columnTasks.length}
              isDropTarget={dropTargetStatus === status}
              onDragOver={(e) => handleColumnDragOver(e, status)}
              onDragLeave={() => setDropTargetStatus(null)}
              onDrop={(e) => handleColumnDrop(e, status)}
            >
              {columnTasks.length === 0 ? (
                <p className="text-xs text-gray-400 italic px-1 py-2">No tasks</p>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    groupLabel={getGroupLabel(task.group)}
                    allMembers={committee.members}
                    onClaim={canClaim ? () => handleClaim(task.id) : undefined}
                    canManage={canManage}
                    assignableMembers={canManage ? assignableMembers : undefined}
                    onAssign={canManage ? handleAssign : undefined}
                    draggable={canManage}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    onOpenDetail={() => handleOpenDetail(task.id)}
                  />
                ))
              )}
            </KanbanColumn>
          );
        })}
      </div>

      <TaskDetailModal
        task={selectedTask}
        groupLabel={selectedTask ? getGroupLabel(selectedTask.group) : ""}
        assignee={
          selectedTask ? resolveTaskAssignee(selectedTask, committee.members) : undefined
        }
        assignableMembers={canManage ? assignableMembers : undefined}
        canManage={canManage}
        canClaim={canClaim}
        onAssign={canManage ? handleAssign : undefined}
        onClaim={
          selectedTask && canClaim
            ? () => {
                handleClaim(selectedTask.id);
              }
            : undefined
        }
        onClose={() => setSelectedTaskId(null)}
      />

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
