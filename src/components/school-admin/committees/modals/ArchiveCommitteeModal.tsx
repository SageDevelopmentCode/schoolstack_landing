"use client";

import { useState } from "react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import type { Committee } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import CommitteeModalShell from "@/components/school-admin/committees/CommitteeModalShell";

export default function ArchiveCommitteeModal({
  theme,
  committee,
  onClose,
  onConfirm,
}: {
  theme: ParentThemeTokens;
  committee: Committee;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <CommitteeModalShell
      theme={theme}
      title={`Archive ${committee.name}?`}
      kicker="Committee settings"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <AdminButton theme={theme} variant="soft" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton
            theme={theme}
            variant="danger"
            onClick={() => void handleConfirm()}
            disabled={saving}
          >
            {saving ? "Archiving…" : "Archive committee"}
          </AdminButton>
        </div>
      }
    >
      <p className="text-sm" style={{ color: theme.muted }}>
        The workspace will be marked archived. Members can no longer make changes,
        but history is preserved.
      </p>
    </CommitteeModalShell>
  );
}
