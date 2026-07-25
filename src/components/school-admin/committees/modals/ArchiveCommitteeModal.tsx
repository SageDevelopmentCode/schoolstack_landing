"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { Committee } from "@/lib/committees/types";

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-2xl shadow-xl w-full max-w-md p-6"
        style={{ backgroundColor: C.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-2" style={{ color: C.textPrimary }}>
          Archive {committee.name}?
        </h2>
        <p className="text-sm mb-6" style={{ color: C.textSecondary }}>
          The workspace will be marked archived. Members can no longer make changes,
          but history is preserved.
        </p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white rounded-md cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: C.warning }}
          >
            {saving ? "Archiving…" : "Archive committee"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
