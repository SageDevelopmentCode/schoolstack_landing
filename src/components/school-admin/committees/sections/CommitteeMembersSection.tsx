"use client";

import { useMemo, useState } from "react";
import { Mail, Phone, UserPlus, UserRound, Users } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import type { SupabaseClient } from "@supabase/supabase-js";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import type { Committee, CommitteeDutyRole, CommitteeRole } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { inviteCommitteeMember, removeCommitteeMember } from "@/lib/committees/members";
import { getCommittee } from "@/lib/committees/committees";
import { memberInitials } from "@/lib/committees/task-utils";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import CommitteeModalShell from "@/components/school-admin/committees/CommitteeModalShell";
import CommitteeSectionEmptyState from "@/components/school-admin/committees/CommitteeSectionEmptyState";
import CommitteeWorkspaceSectionFrame from "@/components/school-admin/committees/CommitteeWorkspaceSectionFrame";
import { committeeStoryInputStyle } from "@/components/school-admin/committees/committee-story-input-style";

const ROLE_LABELS: Record<CommitteeRole, string> = {
  member: "Member",
  lead: "Lead",
  faculty_liaison: "Faculty liaison",
  admin: "Admin",
};

function DutyRoleReadOnlyCard({
  role,
  assigneeName,
  theme,
}: {
  role: CommitteeDutyRole;
  assigneeName?: string;
  theme: ParentThemeTokens;
}) {
  return (
    <AdminCard theme={theme} padding="default">
      <p className="text-sm font-semibold" style={{ color: theme.ink }}>
        {role.title}
      </p>
      <p className="mt-1 line-clamp-3 text-xs leading-relaxed" style={{ color: theme.muted }}>
        {role.description || "No description yet."}
      </p>
      <div
        className="mt-3 flex items-center gap-2 border-t pt-3"
        style={{ borderColor: theme.line }}
      >
        {assigneeName ? (
          <>
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
              style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
            >
              {memberInitials(assigneeName)}
            </span>
            <span className="truncate text-xs font-medium" style={{ color: theme.muted }}>
              {assigneeName}
            </span>
          </>
        ) : (
          <>
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.primarySoft }}
            >
              <UserRound className="h-3.5 w-3.5" style={{ color: theme.muted }} />
            </span>
            <span className="text-xs italic" style={{ color: theme.muted }}>
              Unassigned
            </span>
          </>
        )}
      </div>
    </AdminCard>
  );
}

export default function CommitteeMembersSection({
  committee,
  theme,
  supabase,
  organizationId,
  onCommitteeChange,
  readOnly = false,
  skipFrame = false,
}: {
  committee: Committee;
  theme: ParentThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  onCommitteeChange: (committee: Committee) => void;
  readOnly?: boolean;
  skipFrame?: boolean;
}) {
  const [showInvite, setShowInvite] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CommitteeRole>("member");
  const [saving, setSaving] = useState(false);
  const inputStyle = useMemo(() => committeeStoryInputStyle(theme), [theme]);

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
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.members.invite",
        error: "",
      }, err);
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
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.members.remove",
        error: "",
      }, err);
    }
  };

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: theme.muted }}>
          {committee.members.length} members
        </p>
        {!readOnly && (
          <AdminButton theme={theme} variant="primary" size="compact" onClick={() => setShowInvite(true)}>
            <UserPlus className="w-3.5 h-3.5" />
            Invite member
          </AdminButton>
        )}
      </div>

      {committee.members.length === 0 ? (
        <CommitteeSectionEmptyState
          theme={theme}
          icon={Users}
          title="No members listed yet"
          description="Committee members will appear here once they are added or invited."
          action={
            !readOnly ? (
              <AdminButton
                theme={theme}
                variant="primary"
                size="compact"
                onClick={() => setShowInvite(true)}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Invite member
              </AdminButton>
            ) : undefined
          }
        />
      ) : (
      <div className="space-y-2">
        {committee.members.map((member) => (
          <AdminCard key={member.id} theme={theme} padding="default">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                style={{ backgroundColor: "#EAF4EB", color: theme.primary }}
              >
                {memberInitials(member.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold" style={{ color: theme.ink }}>
                    {member.name}
                  </p>
                  <AdminChip theme={theme} tone="purple">
                    {ROLE_LABELS[member.role]}
                  </AdminChip>
                  {showGrade && member.grade && (
                    <span className="text-[10px]" style={{ color: theme.muted }}>
                      {member.grade}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 mt-1 text-xs" style={{ color: theme.muted }}>
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
                <AdminButton
                  theme={theme}
                  variant="danger"
                  size="compact"
                  onClick={() => void handleRemove(member.id)}
                >
                  Remove
                </AdminButton>
              )}
            </div>
          </AdminCard>
        ))}
      </div>
      )}

      {readOnly && committee.dutyRoles.length > 0 ? (
        <div className="space-y-3 border-t pt-6" style={{ borderColor: theme.line }}>
          <AdminDisplayHeading theme={theme} as="h3" size="section">
            Duty roles
          </AdminDisplayHeading>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {committee.dutyRoles.map((dutyRole) => {
              const assignee = committee.members.find(
                (member) => member.id === dutyRole.assigneeId,
              );
              return (
                <DutyRoleReadOnlyCard
                  key={dutyRole.id}
                  role={dutyRole}
                  assigneeName={assignee?.name}
                  theme={theme}
                />
              );
            })}
          </div>
        </div>
      ) : null}

      <AnimatePresence>
        {showInvite && (
          <CommitteeModalShell
            theme={theme}
            title="Invite member"
            onClose={() => setShowInvite(false)}
            footer={
              <div className="flex justify-end gap-2">
                <AdminButton theme={theme} variant="soft" onClick={() => setShowInvite(false)}>
                  Cancel
                </AdminButton>
                <AdminButton
                  theme={theme}
                  variant="primary"
                  onClick={() => void handleInvite()}
                  disabled={saving || !name.trim()}
                >
                  {saving ? "Inviting…" : "Send invite"}
                </AdminButton>
              </div>
            }
          >
            <div className="space-y-3">
              <input
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border"
                style={inputStyle}
              />
              <input
                placeholder="Email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border"
                style={inputStyle}
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as CommitteeRole)}
                className="w-full px-3 py-2 text-sm rounded-lg border"
                style={inputStyle}
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

  if (skipFrame) return content;

  return (
    <CommitteeWorkspaceSectionFrame width="narrow">
      {content}
    </CommitteeWorkspaceSectionFrame>
  );
}
