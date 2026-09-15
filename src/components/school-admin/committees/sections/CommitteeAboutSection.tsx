"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus, UserRound } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import type { Committee, CommitteeDutyRole } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";
import { memberInitials } from "@/lib/committees/task-utils";
import {
  createDutyRole,
  deleteDutyRole,
  updateDutyRole,
} from "@/lib/committees/duty-roles";
import { getCommittee, updateCommittee } from "@/lib/committees/committees";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import EditDutyRoleModal, {
  type DutyRoleFormValue,
} from "@/components/school-admin/committees/modals/EditDutyRoleModal";
import { committeeStoryInputStyle } from "@/components/school-admin/committees/committee-story-input-style";
import { staggerContainer, staggerItem } from "@/components/school-admin/committees/committee-motion";

type EditingDutyRoleState = CommitteeDutyRole | null | undefined;

function DutyRoleCard({
  role,
  assigneeName,
  theme,
  readOnly,
  onSelect,
  reducedMotion = false,
}: {
  role: CommitteeDutyRole;
  assigneeName?: string;
  theme: ParentThemeTokens;
  readOnly: boolean;
  onSelect?: () => void;
  reducedMotion?: boolean;
}) {
  const content = (
    <>
      <p className="text-sm font-semibold" style={{ color: theme.ink }}>
        {role.title}
      </p>
      <p className="text-xs mt-1 line-clamp-3 leading-relaxed" style={{ color: theme.muted }}>
        {role.description || "No description yet."}
      </p>
      <div
        className="flex items-center gap-2 mt-3 pt-3 border-t"
        style={{ borderColor: "#E0E7E0" }}
      >
        {assigneeName ? (
          <>
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{ backgroundColor: "#EAF4EB", color: theme.primary }}
            >
              {memberInitials(assigneeName)}
            </span>
            <span className="text-xs font-medium truncate" style={{ color: theme.muted }}>
              {assigneeName}
            </span>
          </>
        ) : (
          <>
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#EAF4EB" }}
            >
              <UserRound className="w-3.5 h-3.5" style={{ color: theme.muted }} />
            </span>
            <span className="text-xs italic" style={{ color: theme.muted }}>
              Unassigned
            </span>
          </>
        )}
      </div>
    </>
  );

  if (!readOnly && onSelect) {
    return (
      <motion.button
        type="button"
        variants={staggerItem(reducedMotion)}
        onClick={onSelect}
        className="w-full cursor-pointer text-left transition-transform hover:-translate-y-px"
      >
        <AdminCard theme={theme} padding="default">{content}</AdminCard>
      </motion.button>
    );
  }

  return (
    <motion.div variants={staggerItem(reducedMotion)}>
      <AdminCard theme={theme} padding="default">{content}</AdminCard>
    </motion.div>
  );
}

export default function CommitteeAboutSection({
  committee,
  theme,
  supabase,
  organizationId,
  onCommitteeChange,
  readOnly = false,
}: {
  committee: Committee;
  theme: ParentThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  onCommitteeChange: (committee: Committee) => void;
  readOnly?: boolean;
}) {
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const inputStyle = useMemo(() => committeeStoryInputStyle(theme), [theme]);
  const [aboutHtml, setAboutHtml] = useState(committee.aboutHtml);
  const [saving, setSaving] = useState(false);
  const [roleSaving, setRoleSaving] = useState(false);
  const [editingRole, setEditingRole] = useState<EditingDutyRoleState>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<CommitteeDutyRole | null>(null);
  const [deleting, setDeleting] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;

  const isAboutDirty = aboutHtml !== committee.aboutHtml;

  const refresh = async () => {
    const updated = await getCommittee(supabase, organizationId, committee.id);
    if (updated) onCommitteeChange(updated);
  };

  const handleSaveAbout = async () => {
    if (!isAboutDirty) return;
    setSaving(true);
    try {
      const updated = await updateCommittee(supabase, organizationId, committee.id, {
        aboutHtml,
      });
      onCommitteeChange(updated);
      adminToast.success("Overview saved");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to save overview."));
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.about.save",
        error: "",
      }, err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRole = async (value: DutyRoleFormValue) => {
    setRoleSaving(true);
    try {
      if (editingRole) {
        await updateDutyRole(supabase, editingRole.id, {
          title: value.title,
          description: value.description,
          assigneeMemberId: value.assigneeMemberId,
        });
        adminToast.success("Duty role updated");
      } else {
        await createDutyRole(supabase, committee.id, {
          title: value.title,
          description: value.description,
          assigneeMemberId: value.assigneeMemberId ?? undefined,
          sortOrder: committee.dutyRoles.length,
        });
        adminToast.success("Duty role added");
      }
      setEditingRole(undefined);
      await refresh();
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to save duty role."));
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.about.save_role",
        error: "",
      }, err);
    } finally {
      setRoleSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDutyRole(supabase, deleteTarget.id, committee.id);
      setDeleteTarget(null);
      setEditingRole(undefined);
      await refresh();
      adminToast.success("Duty role deleted");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to delete duty role."));
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.about.delete_role",
        error: "",
      }, err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <AdminCard theme={theme} padding="default">
        <AdminDisplayHeading theme={theme} as="h3" size="section">
          Overview
        </AdminDisplayHeading>
        {readOnly ? (
          <div className="text-sm whitespace-pre-wrap mt-3" style={{ color: theme.muted }}>
            {committee.aboutHtml || "No overview provided yet."}
          </div>
        ) : (
          <>
            <textarea
              value={aboutHtml}
              onChange={(e) => setAboutHtml(e.target.value)}
              rows={6}
              className="w-full text-sm rounded-lg border p-3 mt-3"
              style={inputStyle}
              placeholder="Describe the committee's role and responsibilities…"
            />
            <AdminButton
              theme={theme}
              variant="primary"
              className="mt-3"
              onClick={() => void handleSaveAbout()}
              disabled={saving || !isAboutDirty}
            >
              {saving ? "Saving…" : "Save overview"}
            </AdminButton>
          </>
        )}
      </AdminCard>

      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <AdminDisplayHeading theme={theme} as="h3" size="section">
            Duty roles
          </AdminDisplayHeading>
          {!readOnly && (
            <AdminButton theme={theme} variant="primary" size="compact" onClick={() => setEditingRole(null)}>
              <Plus className="w-3.5 h-3.5" />
              Add role
            </AdminButton>
          )}
        </div>
        <motion.div
          key={committee.dutyRoles.map((role) => role.id).join("-")}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
          variants={staggerContainer(reducedMotion)}
          initial="initial"
          animate="animate"
        >
          {committee.dutyRoles.map((role) => {
            const assignee = committee.members.find((member) => member.id === role.assigneeId);
            return (
              <DutyRoleCard
                key={role.id}
                role={role}
                assigneeName={assignee?.name}
                theme={theme}
                readOnly={readOnly}
                reducedMotion={reducedMotion}
                onSelect={readOnly ? undefined : () => setEditingRole(role)}
              />
            );
          })}
        </motion.div>
      </div>

      <AnimatePresence>
        {editingRole !== undefined && (
          <EditDutyRoleModal
            committee={committee}
            dutyRole={editingRole}
            theme={theme}
            saving={roleSaving}
            onClose={() => setEditingRole(undefined)}
            onSave={handleSaveRole}
            onDelete={
              editingRole
                ? () => setDeleteTarget(editingRole)
                : undefined
            }
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        C={C}
        open={deleteTarget !== null}
        title="Delete duty role?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be removed. Members assigned to this role will be unassigned.`
            : ""
        }
        confirmLabel="Delete role"
        variant="destructive"
        loading={deleting}
        onConfirm={() => void handleDeleteRole()}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
