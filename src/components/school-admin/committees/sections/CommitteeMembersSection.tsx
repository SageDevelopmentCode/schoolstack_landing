"use client";

import { useState } from "react";
import { Mail, Phone, UserPlus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { Committee, CommitteeRole } from "@/lib/committees/types";
import { inviteCommitteeMember, removeCommitteeMember } from "@/lib/committees/members";
import { getCommittee } from "@/lib/committees/committees";
import { memberInitials } from "@/lib/committees/task-utils";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import CommitteeModalShell from "@/components/school-admin/committees/CommitteeModalShell";

const ROLE_LABELS: Record<CommitteeRole, string> = {
  member: "Member",
  lead: "Lead",
  faculty_liaison: "Faculty liaison",
  admin: "Admin",
};

export default function CommitteeMembersSection({
  committee,
  C,
  supabase,
  organizationId,
  onCommitteeChange,
  readOnly = false,
}: {
  committee: Committee;
  C: AdminThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  onCommitteeChange: (committee: Committee) => void;
  readOnly?: boolean;
}) {
  const [showInvite, setShowInvite] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CommitteeRole>("member");
  const [saving, setSaving] = useState(false);

  const showGrade = committee.config.showGradeColumn;

  const refresh = async () => {
    const updated = await getCommittee(supabase, organizationId, committee.id);
    if (updated) onCommitteeChange(updated);
  };

  const handleInvite = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await inviteCommitteeMember(supabase, organizationId, committee.id, {
        displayName: name.trim(),
        email: email.trim() || undefined,
        role,
      });
      setName("");
      setEmail("");
      setShowInvite(false);
      await refresh();
      adminToast.success("Member invited");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to invite member."));
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      await removeCommitteeMember(supabase, memberId);
      await refresh();
      adminToast.success("Member removed");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to remove member."));
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: C.textSecondary }}>
          {committee.members.length} members
        </p>
        {!readOnly && (
        <button
          type="button"
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg cursor-pointer"
          style={{ backgroundColor: C.accent }}
        >
          <UserPlus className="w-3.5 h-3.5" />
          Invite member
        </button>
        )}
      </div>

      <div className="space-y-2">
        {committee.members.map((member) => (
          <div
            key={member.id}
            className="flex items-start gap-3 p-4 rounded-xl border"
            style={{ backgroundColor: C.surface, borderColor: C.border }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
              style={{ backgroundColor: C.accentLight, color: C.accent }}
            >
              {memberInitials(member.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  {member.name}
                </p>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: C.accentLight, color: C.accent }}
                >
                  {ROLE_LABELS[member.role]}
                </span>
                {showGrade && member.grade && (
                  <span className="text-[10px]" style={{ color: C.textTertiary }}>
                    {member.grade}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 mt-1 text-xs" style={{ color: C.textTertiary }}>
                {member.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {member.email}
                  </span>
                )}
                {member.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {member.phone}
                  </span>
                )}
              </div>
            </div>
            {!readOnly && (
            <button
              type="button"
              onClick={() => handleRemove(member.id)}
              className="text-xs cursor-pointer"
              style={{ color: C.error }}
            >
              Remove
            </button>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showInvite && (
          <CommitteeModalShell
            C={C}
            title="Invite member"
            onClose={() => setShowInvite(false)}
            footer={
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowInvite(false)} className="px-4 py-2 text-sm cursor-pointer">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInvite}
                  disabled={saving || !name.trim()}
                  className="px-4 py-2 text-sm font-medium text-white rounded-md cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: C.accent }}
                >
                  {saving ? "Inviting…" : "Send invite"}
                </button>
              </div>
            }
          >
              <div className="space-y-3">
                <input
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border"
                  style={{ borderColor: C.border }}
                />
                <input
                  placeholder="Email (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border"
                  style={{ borderColor: C.border }}
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as CommitteeRole)}
                  className="w-full px-3 py-2 text-sm rounded-lg border"
                  style={{ borderColor: C.border }}
                >
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
          </CommitteeModalShell>
        )}
      </AnimatePresence>
    </div>
  );
}
