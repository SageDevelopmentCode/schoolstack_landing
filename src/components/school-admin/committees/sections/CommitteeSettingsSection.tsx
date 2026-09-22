"use client";

import { useMemo, useState } from "react";
import { Archive } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminTextLink from "@/components/school-admin/ui/story/AdminTextLink";
import type { Committee, CommitteeWorkspaceSection } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { updateCommittee } from "@/lib/committees/committees";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { committeeStoryInputStyle } from "@/components/school-admin/committees/committee-story-input-style";
import CommitteeWorkspaceSectionFrame from "@/components/school-admin/committees/CommitteeWorkspaceSectionFrame";

export default function CommitteeSettingsSection({
  committee,
  theme,
  supabase,
  organizationId,
  onCommitteeChange,
  onArchive,
  onNavigateToSection,
}: {
  committee: Committee;
  theme: ParentThemeTokens;
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
  const inputStyle = useMemo(() => committeeStoryInputStyle(theme), [theme]);

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
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.settings.save_details",
        error: "",
      }, err);
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
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.settings.save_term",
        error: "",
      }, err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <CommitteeWorkspaceSectionFrame width="wide">
    <div className="space-y-6">
      <AdminCard theme={theme} padding="default">
        <AdminDisplayHeading theme={theme} as="h3" size="section">
          Committee details
        </AdminDisplayHeading>
        <p className="text-xs mt-1" style={{ color: theme.muted }}>
          Short summary shown on the committees list and workspace header.
        </p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Committee name"
          className="w-full mt-3 px-3 py-2 text-sm rounded-lg border"
          style={inputStyle}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Brief description for families and volunteers…"
          className="w-full mt-3 px-3 py-2 text-sm rounded-lg border resize-y"
          style={{ ...inputStyle, minHeight: "88px" }}
        />
        <AdminButton
          theme={theme}
          variant="primary"
          className="mt-3"
          onClick={() => void handleSaveDetails()}
          disabled={savingDetails || !isDetailsDirty || !name.trim()}
        >
          {savingDetails ? "Saving…" : "Save details"}
        </AdminButton>
      </AdminCard>

      <AdminCard theme={theme} padding="default">
        <AdminDisplayHeading theme={theme} as="h3" size="section">
          Membership
        </AdminDisplayHeading>
        <p className="text-sm mt-1" style={{ color: theme.muted }}>
          {committee.members.length} members · Term {committee.termLabel}
        </p>
        {onNavigateToSection && (
          <AdminTextLink
            theme={theme}
            className="mt-3"
            onClick={() => onNavigateToSection("members")}
          >
            Manage members in the Members tab →
          </AdminTextLink>
        )}
      </AdminCard>

      <AdminCard theme={theme} padding="default">
        <AdminDisplayHeading theme={theme} as="h3" size="section">
          Term dates
        </AdminDisplayHeading>
        <input
          value={termLabel}
          onChange={(e) => setTermLabel(e.target.value)}
          placeholder="Term label"
          className="w-full mt-3 px-3 py-2 text-sm rounded-lg border"
          style={inputStyle}
        />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <input
            type="date"
            value={termStart}
            onChange={(e) => setTermStart(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border"
            style={inputStyle}
          />
          <input
            type="date"
            value={termEnd}
            onChange={(e) => setTermEnd(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border"
            style={inputStyle}
          />
        </div>
        <AdminButton
          theme={theme}
          variant="primary"
          className="mt-3"
          onClick={() => void handleSaveTerm()}
          disabled={saving || !isTermDirty}
        >
          {saving ? "Saving…" : "Save term"}
        </AdminButton>
      </AdminCard>

      {committee.status === "active" && onArchive && (
        <AdminCard
          theme={theme}
          padding="default"
          style={{ backgroundColor: "#FFF3DF", borderColor: "#F0D9A8" }}
        >
          <AdminDisplayHeading theme={theme} as="h3" size="section">
            <span className="inline-flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Archive committee
            </span>
          </AdminDisplayHeading>
          <p className="text-sm mt-2 mb-4" style={{ color: theme.muted }}>
            Mark this workspace as archived at the end of the school year. History is preserved.
          </p>
          <AdminButton theme={theme} variant="danger" onClick={onArchive}>
            Archive workspace
          </AdminButton>
        </AdminCard>
      )}
    </div>
    </CommitteeWorkspaceSectionFrame>
  );
}
