"use client";

import { useState } from "react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { Committee } from "@/lib/committees/types";
import CommitteeModalShell from "@/components/school-admin/committees/CommitteeModalShell";

export default function ArchiveCommitteeModal({
  C,
  committee,
  onClose,
  onConfirm,
}: {
  C: AdminThemeTokens;
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
      C={C}
      title={`Archive ${committee.name}?`}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white rounded-md cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: C.warning }}
          >
            {saving ? "Archiving…" : "Archive committee"}
          </button>
        </div>
      }
    >
      <p className="text-sm" style={{ color: C.textSecondary }}>
        The workspace will be marked archived. Members can no longer make changes,
        but history is preserved.
      </p>
    </CommitteeModalShell>
  );
}
