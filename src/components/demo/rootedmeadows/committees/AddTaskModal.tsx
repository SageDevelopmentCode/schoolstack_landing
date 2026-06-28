"use client";

import { useState } from "react";
import {
  createCommitteeEntityId,
  getCommitteeTemplate,
} from "@/data/school-demos/rooted-meadows-committees";
import type { Committee, CommitteeTask, CommitteeTaskGroup } from "./types";
import CommitteeModalShell, { inputClass } from "./CommitteeModalShell";

export default function AddTaskModal({
  committee,
  onClose,
  onSave,
}: {
  committee: Committee;
  onClose: () => void;
  onSave: (task: CommitteeTask) => void;
}) {
  const template = getCommitteeTemplate(committee.templateId);
  const groups = template?.taskGroups ?? [{ id: "general" as const, label: "Tasks" }];
  const assignableMembers = committee.members.filter(
    (m) => m.role === "member" || m.role === "lead",
  );

  const [title, setTitle] = useState("");
  const [group, setGroup] = useState<CommitteeTaskGroup>(groups[0]?.id ?? "general");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [attachmentLabel, setAttachmentLabel] = useState("");

  const handleSave = () => {
    if (!title.trim()) return;
    const assignee = assignableMembers.find((m) => m.id === assigneeId);
    onSave({
      id: createCommitteeEntityId("t"),
      title: title.trim(),
      group,
      dueDate: dueDate || undefined,
      assigneeId: assignee?.id,
      assigneeName: assignee?.name,
      attachmentLabel: attachmentLabel.trim() || undefined,
      status: assignee ? "in_progress" : "open",
    });
    onClose();
  };

  return (
    <CommitteeModalShell title="Add task" onClose={onClose} onSave={handleSave} saveLabel="Add task">
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Task title" />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Project group</label>
        <select value={group} onChange={(e) => setGroup(e.target.value as CommitteeTaskGroup)} className={inputClass}>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Due date</label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Assign to</label>
        <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className={inputClass}>
          <option value="">Unassigned</option>
          {assignableMembers.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Attachment label</label>
        <input value={attachmentLabel} onChange={(e) => setAttachmentLabel(e.target.value)} className={inputClass} placeholder="Optional instructions or file name" />
      </div>
    </CommitteeModalShell>
  );
}
