"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import type { Committee, CommitteeDutyRole } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import CommitteeModalShell from "@/components/school-admin/committees/CommitteeModalShell";
import { committeeStoryInputStyle } from "@/components/school-admin/committees/committee-story-input-style";

export type DutyRoleFormValue = {
  title: string;
  description: string;
  assigneeMemberId: string | null;
};

type EditDutyRoleModalProps = {
  committee: Committee;
  dutyRole: CommitteeDutyRole | null;
  theme: ParentThemeTokens;
  saving?: boolean;
  onClose: () => void;
  onSave: (value: DutyRoleFormValue) => void | Promise<void>;
  onDelete?: () => void;
};

export default function EditDutyRoleModal({
  committee,
  dutyRole,
  theme,
  saving = false,
  onClose,
  onSave,
  onDelete,
}: EditDutyRoleModalProps) {
  const inputStyle = useMemo(() => committeeStoryInputStyle(theme), [theme]);
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
      theme={theme}
      title={isEdit ? "Edit role" : "Add role"}
      kicker="Duty roles"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-2">
          <div>
            {isEdit && onDelete && (
              <AdminButton theme={theme} variant="danger" size="compact" onClick={onDelete} disabled={saving}>
                <Trash2 className="w-4 h-4" />
                Delete role
              </AdminButton>
            )}
          </div>
          <div className="flex gap-2">
            <AdminButton theme={theme} variant="soft" onClick={onClose} disabled={saving}>
              Cancel
            </AdminButton>
            <AdminButton
              theme={theme}
              variant="primary"
              onClick={handleSave}
              disabled={!canSave}
            >
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add role"}
            </AdminButton>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
            style={{ color: theme.muted }}
          >
            Role title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Fall Service Project Lead"
            className="w-full px-3 py-2 text-sm rounded-lg border"
            style={inputStyle}
          />
        </div>

        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
            style={{ color: theme.muted }}
          >
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this role involve?"
            rows={4}
            className="w-full px-3 py-2 text-sm rounded-lg border resize-y"
            style={inputStyle}
          />
        </div>

        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
            style={{ color: theme.muted }}
          >
            Assign to
          </label>
          <select
            value={assigneeMemberId}
            onChange={(e) => setAssigneeMemberId(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border"
            style={inputStyle}
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
