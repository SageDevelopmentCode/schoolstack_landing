"use client";

import { useState } from "react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { Committee } from "@/lib/committees/types";
import { memberInitials } from "@/lib/committees/task-utils";
import { updateDutyRole } from "@/lib/committees/duty-roles";
import { updateCommittee } from "@/lib/committees/committees";
import type { SupabaseClient } from "@supabase/supabase-js";

export default function CommitteeAboutSection({
  committee,
  C,
  supabase,
  organizationId,
  onCommitteeChange,
}: {
  committee: Committee;
  C: AdminThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  onCommitteeChange: (committee: Committee) => void;
}) {
  const [aboutHtml, setAboutHtml] = useState(committee.aboutHtml);
  const [saving, setSaving] = useState(false);

  const handleSaveAbout = async () => {
    setSaving(true);
    try {
      const updated = await updateCommittee(supabase, organizationId, committee.id, {
        aboutHtml,
      });
      onCommitteeChange(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleAssignRole = async (dutyRoleId: string, memberId: string | null) => {
    await updateDutyRole(supabase, dutyRoleId, { assigneeMemberId: memberId });
    const { getCommittee } = await import("@/lib/committees/committees");
    const updated = await getCommittee(supabase, organizationId, committee.id);
    if (updated) onCommitteeChange(updated);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="rounded-2xl border p-6" style={{ backgroundColor: C.surface, borderColor: C.border }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>
          Overview
        </h3>
        <textarea
          value={aboutHtml}
          onChange={(e) => setAboutHtml(e.target.value)}
          rows={6}
          className="w-full text-sm rounded-lg border p-3"
          style={{ borderColor: C.border, color: C.textPrimary }}
          placeholder="Describe the committee's role and responsibilities…"
        />
        <button
          type="button"
          onClick={handleSaveAbout}
          disabled={saving}
          className="mt-3 px-4 py-2 text-sm font-medium text-white rounded-md cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: C.accent }}
        >
          {saving ? "Saving…" : "Save overview"}
        </button>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>
          Duty roles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {committee.dutyRoles.map((role) => {
            const assignee = committee.members.find((m) => m.id === role.assigneeId);
            return (
              <div
                key={role.id}
                className="p-4 rounded-xl border"
                style={{ backgroundColor: C.surface, borderColor: C.border }}
              >
                <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  {role.title}
                </p>
                <p className="text-xs mt-1 mb-3" style={{ color: C.textSecondary }}>
                  {role.description}
                </p>
                <select
                  value={role.assigneeId ?? ""}
                  onChange={(e) =>
                    handleAssignRole(role.id, e.target.value || null)
                  }
                  className="w-full text-xs rounded-lg border px-2 py-1.5"
                  style={{ borderColor: C.border, color: C.textPrimary }}
                >
                  <option value="">Unassigned</option>
                  {committee.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                {assignee && (
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: C.accentLight, color: C.accent }}
                    >
                      {memberInitials(assignee.name)}
                    </span>
                    <span className="text-xs" style={{ color: C.textSecondary }}>
                      {assignee.name}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
