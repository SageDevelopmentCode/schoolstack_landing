"use client";

import { useState } from "react";
import { createCommitteeEntityId } from "@/data/school-demos/rooted-meadows-committees";
import type { Committee, CommitteeDutyRole } from "./types";
import CommitteeModalShell, { inputClass } from "./CommitteeModalShell";

export default function EditDutyRoleModal({
  committee,
  dutyRole,
  onClose,
  onSave,
}: {
  committee: Committee;
  dutyRole: CommitteeDutyRole | null;
  onClose: () => void;
  onSave: (dutyRole: CommitteeDutyRole) => void;
}) {
  const [title, setTitle] = useState(dutyRole?.title ?? "");
  const [description, setDescription] = useState(dutyRole?.description ?? "");
  const [assigneeId, setAssigneeId] = useState(dutyRole?.assigneeId ?? "");

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: dutyRole?.id ?? createCommitteeEntityId("dr"),
      title: title.trim(),
      description: description.trim(),
      assigneeId: assigneeId || undefined,
    });
    onClose();
  };

  return (
    <CommitteeModalShell
      title={dutyRole ? "Edit role" : "Add role"}
      onClose={onClose}
      onSave={handleSave}
      saveLabel={dutyRole ? "Save changes" : "Add role"}
    >
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Role title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="e.g. Fall Service Project Lead"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} min-h-[88px] resize-y`}
          placeholder="What does this role involve?"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Assign to</label>
        <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className={inputClass}>
          <option value="">Unassigned</option>
          {committee.members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
    </CommitteeModalShell>
  );
}
