"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { CommitteeTemplate } from "@/lib/committees/types";
import { PLATFORM_COMMITTEE_TEMPLATES } from "@/lib/committees/templates";

type TemplateOption = {
  id: string | null;
  slug: string;
  name: string;
  description: string;
  defaultTermLabel: string;
};

function buildTemplateOptions(dbTemplates: CommitteeTemplate[]): TemplateOption[] {
  const dbSlugs = new Set(dbTemplates.map((t) => t.slug));
  const platformOptions: TemplateOption[] = PLATFORM_COMMITTEE_TEMPLATES.filter(
    (t) => !dbSlugs.has(t.slug),
  ).map((t) => ({
    id: null,
    slug: t.slug,
    name: t.name,
    description: t.description,
    defaultTermLabel: t.config.defaultTermLabel ?? "",
  }));

  const dbOptions: TemplateOption[] = dbTemplates.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    description: t.description,
    defaultTermLabel: t.config.defaultTermLabel ?? "",
  }));

  return [...dbOptions, ...platformOptions];
}

export default function CreateCommitteeModal({
  C,
  templates,
  onClose,
  onCreate,
}: {
  C: AdminThemeTokens;
  templates: CommitteeTemplate[];
  onClose: () => void;
  onCreate: (input: {
    templateId: string | null;
    platformSlug: string;
    name: string;
    termLabel: string;
  }) => Promise<void>;
}) {
  const options = buildTemplateOptions(templates);
  const [selectedSlug, setSelectedSlug] = useState(options[0]?.slug ?? "annual-volunteer");
  const [name, setName] = useState(options[0]?.name ?? "");
  const [termLabel, setTermLabel] = useState(options[0]?.defaultTermLabel ?? "");
  const [saving, setSaving] = useState(false);

  const selected = options.find((o) => o.slug === selectedSlug);

  const handleSelect = (option: TemplateOption) => {
    setSelectedSlug(option.slug);
    setName(option.name);
    setTermLabel(option.defaultTermLabel);
  };

  const handleCreate = async () => {
    if (!selected || !name.trim()) return;
    setSaving(true);
    try {
      await onCreate({
        templateId: selected.id,
        platformSlug: selected.slug,
        name: name.trim(),
        termLabel: termLabel.trim(),
      });
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
        exit={{ scale: 0.96, opacity: 0 }}
        className="rounded-2xl shadow-xl w-full max-w-lg"
        style={{ backgroundColor: C.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: C.border }}
        >
          <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
            Create committee
          </h2>
          <button type="button" onClick={onClose} className="p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" style={{ color: C.textTertiary }} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.textSecondary }}
            >
              Template
            </label>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.slug}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className="w-full text-left p-3 rounded-lg border transition-colors cursor-pointer"
                  style={{
                    borderColor: selectedSlug === option.slug ? C.accent : C.border,
                    backgroundColor:
                      selectedSlug === option.slug ? C.accentLight : C.surface,
                  }}
                >
                  <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                    {option.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.textSecondary }}
            >
              Committee name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full px-3 py-2 text-sm rounded-lg border"
              style={{ borderColor: C.border, color: C.textPrimary }}
            />
          </div>
          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.textSecondary }}
            >
              Term label
            </label>
            <input
              value={termLabel}
              onChange={(e) => setTermLabel(e.target.value)}
              className="mt-2 w-full px-3 py-2 text-sm rounded-lg border"
              style={{ borderColor: C.border, color: C.textPrimary }}
            />
          </div>
        </div>
        <div
          className="flex justify-end gap-2 px-6 py-4 border-t"
          style={{ borderColor: C.border }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md cursor-pointer"
            style={{ color: C.textSecondary }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            className="px-4 py-2 text-sm font-medium text-white rounded-md cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: C.accent }}
          >
            {saving ? "Creating…" : "Create workspace"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
