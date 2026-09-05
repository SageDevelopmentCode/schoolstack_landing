"use client";

import { useState } from "react";
import { Archive } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { Committee, CommitteeWorkspaceSection } from "@/lib/committees/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { updateCommittee } from "@/lib/committees/committees";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";

export default function CommitteeSettingsSection({
  committee,
  C,
  supabase,
  organizationId,
  onCommitteeChange,
  onArchive,
  onNavigateToSection,
}: {
  committee: Committee;
  C: AdminThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  onCommitteeChange: (committee: Committee) => void;
  onArchive?: () => void;
  onNavigateToSection?: (section: CommitteeWorkspaceSection) => void;
}) {
  const [name, setName] = useState(committee.name);
  const [description, setDescription] = useState(committee.description);
  const [termLabel, setTermLabel] = useState(committee.termLabel);
  const [termStart, setTermStart] = useState(committee.termStart);
  const [termEnd, setTermEnd] = useState(committee.termEnd);
  const [saving, setSaving] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);

  const isDetailsDirty =
    name !== committee.name || description !== committee.description;

  const isTermDirty =
    termLabel !== committee.termLabel ||
    termStart !== committee.termStart ||
    termEnd !== committee.termEnd;

  const handleSaveDetails = async () => {
    if (!isDetailsDirty) return;
    setSavingDetails(true);
    try {
      const updated = await updateCommittee(supabase, organizationId, committee.id, {
        name: name.trim(),
        description: description.trim(),
      });
      onCommitteeChange(updated);
      adminToast.success("Committee details saved");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to save committee details."));
    } finally {
      setSavingDetails(false);
    }
  };

  const handleSaveTerm = async () => {
    if (!isTermDirty) return;
    setSaving(true);
    try {
      const updated = await updateCommittee(supabase, organizationId, committee.id, {
        termLabel,
        termStart: termStart || null,
        termEnd: termEnd || null,
      });
      onCommitteeChange(updated);
      adminToast.success("Term saved");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to save term."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <section className="rounded-2xl border p-5 space-y-3" style={{ backgroundColor: C.surface, borderColor: C.border }}>
        <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>Committee details</h3>
        <p className="text-xs" style={{ color: C.textSecondary }}>
          Short summary shown on the committees list and workspace header.
        </p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Committee name"
          className="w-full px-3 py-2 text-sm rounded-lg border"
          style={{ borderColor: C.border, color: C.textPrimary }}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Brief description for families and volunteers…"
          className="w-full px-3 py-2 text-sm rounded-lg border resize-y"
          style={{ borderColor: C.border, color: C.textPrimary, minHeight: "88px" }}
        />
        <button
          type="button"
          onClick={handleSaveDetails}
          disabled={savingDetails || !isDetailsDirty || !name.trim()}
          className="px-4 py-2 text-sm font-medium text-white rounded-md cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: C.accent }}
        >
          {savingDetails ? "Saving…" : "Save details"}
        </button>
      </section>

      <section className="rounded-2xl border p-5" style={{ backgroundColor: C.surface, borderColor: C.border }}>
        <h3 className="text-sm font-semibold mb-2" style={{ color: C.textPrimary }}>Membership</h3>
        <p className="text-sm" style={{ color: C.textSecondary }}>
          {committee.members.length} members · Term {committee.termLabel}
        </p>
        {onNavigateToSection && (
          <button
            type="button"
            onClick={() => onNavigateToSection("members")}
            className="mt-3 text-sm font-medium cursor-pointer"
            style={{ color: C.accent }}
          >
            Manage members in the Members tab
          </button>
        )}
      </section>

      <section className="rounded-2xl border p-5 space-y-3" style={{ backgroundColor: C.surface, borderColor: C.border }}>
        <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>Term dates</h3>
        <input
          value={termLabel}
          onChange={(e) => setTermLabel(e.target.value)}
          placeholder="Term label"
          className="w-full px-3 py-2 text-sm rounded-lg border"
          style={{ borderColor: C.border }}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            value={termStart}
            onChange={(e) => setTermStart(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border"
            style={{ borderColor: C.border }}
          />
          <input
            type="date"
            value={termEnd}
            onChange={(e) => setTermEnd(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border"
            style={{ borderColor: C.border }}
          />
        </div>
        <button
          type="button"
          onClick={handleSaveTerm}
          disabled={saving || !isTermDirty}
          className="px-4 py-2 text-sm font-medium text-white rounded-md cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: C.accent }}
        >
          {saving ? "Saving…" : "Save term"}
        </button>
      </section>

      {committee.status === "active" && onArchive && (
        <section
          className="rounded-2xl border p-5"
          style={{ backgroundColor: C.warningBg, borderColor: C.warningBorder }}
        >
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: C.textPrimary }}>
            <Archive className="w-4 h-4" />
            Archive committee
          </h3>
          <p className="text-sm mb-4" style={{ color: C.textSecondary }}>
            Mark this workspace as archived at the end of the school year. History is preserved.
          </p>
          <button
            type="button"
            onClick={onArchive}
            className="px-4 py-2 text-sm font-medium rounded-md cursor-pointer"
            style={{ backgroundColor: C.warning, color: "#fff" }}
          >
            Archive workspace
          </button>
        </section>
      )}
    </div>
  );
}
