"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import CommitteeModalShell from "@/components/school-admin/committees/CommitteeModalShell";
import {
  committeeStoryInputClassName,
  committeeStoryInputStyle,
} from "@/components/school-admin/committees/committee-story-input-style";
import { SettingToggleRow } from "@/components/school-admin/notifications/NotificationChannelCard";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import type { CommitteeProjectStatus } from "@/lib/committees/committee-project-mappers";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

export type CreateCommitteeProjectFormInput = {
  name: string;
  description: string;
  status: CommitteeProjectStatus;
};

type CreateCommitteeProjectModalProps = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: CreateCommitteeProjectFormInput) => void;
};

export default function CreateCommitteeProjectModal({
  theme,
  C,
  open,
  saving,
  onClose,
  onSubmit,
}: CreateCommitteeProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(false);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName || saving) return;
    onSubmit({
      name: trimmedName,
      description: description.trim(),
      status: isActive ? "active" : "draft",
    });
  };

  return (
    <AnimatePresence>
      {open ? (
        <div data-testid="committee-project-create-modal">
          <CommitteeModalShell
            theme={theme}
            kicker="Projects"
            title="New project"
            onClose={onClose}
            footer={
              <div className="flex justify-end gap-2">
                <AdminButton theme={theme} variant="soft" onClick={onClose} disabled={saving}>
                  Cancel
                </AdminButton>
                <AdminButton
                  theme={theme}
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={saving || !name.trim()}
                  data-testid="committee-project-create-submit"
                >
                  {saving ? "Creating…" : "Create project"}
                </AdminButton>
              </div>
            }
          >
            <div className="space-y-4">
              <label className="block">
                <span
                  className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.08em]"
                  style={{ color: "#8B9699" }}
                >
                  Project name
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={committeeStoryInputClassName}
                  style={committeeStoryInputStyle(theme)}
                  placeholder="e.g. Fall festival booths"
                  autoFocus
                  data-testid="committee-project-create-name"
                />
              </label>
              <label className="block">
                <span
                  className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.08em]"
                  style={{ color: "#8B9699" }}
                >
                  Description
                </span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className={`${committeeStoryInputClassName} resize-y`}
                  style={committeeStoryInputStyle(theme)}
                  placeholder="What is this project for?"
                  data-testid="committee-project-create-description"
                />
              </label>
              <div
                className="rounded-lg border"
                style={{ borderColor: C.border, backgroundColor: C.surface }}
                data-testid="committee-project-create-active"
              >
                <SettingToggleRow
                  C={C}
                  label="Active project"
                  description="When off, the project stays in draft on the projects list."
                  checked={isActive}
                  disabled={saving}
                  onChange={setIsActive}
                />
              </div>
            </div>
          </CommitteeModalShell>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
