"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { Committee, CommitteeDutyRole } from "@/lib/committees/types";
import CommitteeModalShell from "@/components/school-admin/committees/CommitteeModalShell";

export type DutyRoleFormValue = {
  title: string;
  description: string;
  assigneeMemberId: string | null;
};

type EditDutyRoleModalProps = {
  committee: Committee;
  dutyRole: CommitteeDutyRole | null;
  C: AdminThemeTokens;
  saving?: boolean;
  onClose: () => void;
  onSave: (value: DutyRoleFormValue) => void | Promise<void>;
  onDelete?: () => void;
};

export default function EditDutyRoleModal({
  committee,
  dutyRole,
  C,
  saving = false,
  onClose,
  onSave,
  onDelete,
}: EditDutyRoleModalProps) {
  const [title, setTitle] = useState(dutyRole?.title ?? "");
  const [description, setDescription] = useState(dutyRole?.description ?? "");
  const [assigneeMemberId, setAssigneeMemberId] = useState(dutyRole?.assigneeId ?? "");

  const isEdit = dutyRole !== null;
  const canSave = title.trim().length > 0 && !saving;

  const handleSave = () => {
    if (!canSave) return;
    void onSave({
      title: title.trim(),
      description: description.trim(),
      assigneeMemberId: assigneeMemberId || null,
    });
  };

  return (
    <CommitteeModalShell
      C={C}
      title={isEdit ? "Edit role" : "Add role"}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-2">
          <div>
            {isEdit && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md cursor-pointer disabled:opacity-50"
                style={{ color: C.error }}
              >
                <Trash2 className="w-4 h-4" />
                Delete role
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="px-4 py-2 text-sm font-medium text-white rounded-md cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: C.accent }}
            >
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add role"}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
            style={{ color: C.textTertiary }}
          >
            Role title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Fall Service Project Lead"
            className="w-full px-3 py-2 text-sm rounded-lg border"
            style={{ borderColor: C.border, color: C.textPrimary }}
          />
        </div>

        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
            style={{ color: C.textTertiary }}
          >
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this role involve?"
            rows={4}
            className="w-full px-3 py-2 text-sm rounded-lg border resize-y"
            style={{ borderColor: C.border, color: C.textPrimary }}
          />
        </div>

        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
            style={{ color: C.textTertiary }}
          >
            Assign to
          </label>
          <select
            value={assigneeMemberId}
            onChange={(e) => setAssigneeMemberId(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border"
            style={{ borderColor: C.border, color: C.textPrimary }}
          >
            <option value="">Unassigned</option>
            {committee.members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </CommitteeModalShell>
  );
}
