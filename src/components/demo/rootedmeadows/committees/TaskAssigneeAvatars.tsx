"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import type { CommitteeMember, CommitteeTask } from "./types";
import { memberInitials, resolveTaskAssignee } from "./committeeTaskUtils";

const SIZE_CLASSES = {
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
};

function MemberPickerPopover({
  members,
  assigneeId,
  onSelect,
  onClose,
  size,
}: {
  members: CommitteeMember[];
  assigneeId?: string;
  onSelect: (memberId: string) => void;
  onClose: () => void;
  size: "sm" | "md";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const avatarSize = size === "sm" ? "w-7 h-7 text-[10px]" : "w-8 h-8 text-xs";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-1.5 z-20 p-2 bg-white border border-gray-100 rounded-lg shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1.5 flex-wrap max-w-[200px]">
        {assigneeId && (
          <button
            type="button"
            title="Unassign"
            onClick={() => {
              onSelect("");
              onClose();
            }}
            className={`${avatarSize} rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 cursor-pointer shrink-0`}
          >
            <X className="w-3 h-3" />
          </button>
        )}
        {members.map((member) => {
          const isAssigned = member.id === assigneeId;
          if (isAssigned) return null;
          return (
            <button
              key={member.id}
              type="button"
              title={member.name}
              onClick={() => {
                onSelect(member.id);
                onClose();
              }}
              className={`${avatarSize} rounded-full bg-[#827096]/15 text-[#827096] hover:bg-[#827096]/25 flex items-center justify-center font-semibold cursor-pointer shrink-0`}
            >
              {memberInitials(member.name)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AssigneePickerRow({
  task,
  members,
  allMembers,
  onAssign,
  size,
}: {
  task: CommitteeTask;
  members: CommitteeMember[];
  allMembers: CommitteeMember[];
  onAssign: (taskId: string, memberId: string) => void;
  size: "sm" | "md";
}) {
  const assignee = resolveTaskAssignee(task, allMembers);
  const sizeClass = SIZE_CLASSES[size];

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {members.map((member) => {
        const isAssigned = assignee?.id === member.id;
        return (
          <button
            key={member.id}
            type="button"
            title={member.name}
            onClick={(e) => {
              e.stopPropagation();
              onAssign(task.id, isAssigned ? "" : member.id);
            }}
            className={`${sizeClass} rounded-full flex items-center justify-center font-semibold shrink-0 transition-all cursor-pointer ${
              isAssigned
                ? "bg-[#827096] text-white ring-2 ring-[#827096] ring-offset-1"
                : "bg-[#827096]/15 text-[#827096] hover:bg-[#827096]/25"
            }`}
          >
            {memberInitials(member.name)}
          </button>
        );
      })}
    </div>
  );
}

export default function TaskAssigneeAvatars({
  task,
  members,
  allMembers,
  onAssign,
  size = "sm",
  readOnly = false,
  variant = "compact",
}: {
  task: CommitteeTask;
  members: CommitteeMember[];
  allMembers: CommitteeMember[];
  onAssign?: (taskId: string, memberId: string) => void;
  size?: "sm" | "md";
  readOnly?: boolean;
  variant?: "compact" | "picker";
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const assignee = resolveTaskAssignee(task, allMembers);
  const sizeClass = SIZE_CLASSES[size];

  if (variant === "picker" && onAssign) {
    return (
      <AssigneePickerRow
        task={task}
        members={members}
        allMembers={allMembers}
        onAssign={onAssign}
        size={size}
      />
    );
  }

  if (assignee) {
    const avatar = (
      <div
        className={`${sizeClass} rounded-full bg-[#827096] flex items-center justify-center text-white font-semibold shrink-0`}
        title={assignee.name}
      >
        {memberInitials(assignee.name)}
      </div>
    );

    if (readOnly || !onAssign) return avatar;

    return (
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPickerOpen((v) => !v);
          }}
          className="cursor-pointer rounded-full"
          title={assignee.name}
        >
          {avatar}
        </button>
        {pickerOpen && (
          <MemberPickerPopover
            members={members}
            assigneeId={assignee.id}
            onSelect={(id) => onAssign(task.id, id)}
            onClose={() => setPickerOpen(false)}
            size={size}
          />
        )}
      </div>
    );
  }

  if (readOnly || !onAssign) {
    return (
      <div
        className={`${sizeClass} rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-300 shrink-0`}
        title="Unassigned"
      >
        <Plus className="w-3 h-3" />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setPickerOpen((v) => !v);
        }}
        className={`${sizeClass} rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-[#827096]/50 hover:text-[#827096] hover:bg-[#827096]/5 transition-colors cursor-pointer shrink-0`}
        title="Assign member"
      >
        <Plus className="w-3 h-3" />
      </button>
      {pickerOpen && (
        <MemberPickerPopover
          members={members}
          onSelect={(id) => onAssign(task.id, id)}
          onClose={() => setPickerOpen(false)}
          size={size}
        />
      )}
    </div>
  );
}
