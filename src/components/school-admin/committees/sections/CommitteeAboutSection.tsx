"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus, UserRound } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { Committee, CommitteeDutyRole } from "@/lib/committees/types";
import { memberInitials } from "@/lib/committees/task-utils";
import {
  createDutyRole,
  deleteDutyRole,
  updateDutyRole,
} from "@/lib/committees/duty-roles";
import { getCommittee, updateCommittee } from "@/lib/committees/committees";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import EditDutyRoleModal, {
  type DutyRoleFormValue,
} from "@/components/school-admin/committees/modals/EditDutyRoleModal";
import { staggerContainer, staggerItem } from "@/components/school-admin/committees/committee-motion";

type EditingDutyRoleState = CommitteeDutyRole | null | undefined;

function DutyRoleCard({
  role,
  assigneeName,
  C,
  readOnly,
  onSelect,
  reducedMotion = false,
}: {
  role: CommitteeDutyRole;
  assigneeName?: string;
  C: AdminThemeTokens;
  readOnly: boolean;
  onSelect?: () => void;
  reducedMotion?: boolean;
}) {
  const content = (
    <>
      <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
        {role.title}
      </p>
      <p className="text-xs mt-1 line-clamp-3 leading-relaxed" style={{ color: C.textSecondary }}>
        {role.description || "No description yet."}
      </p>
      <div
        className="flex items-center gap-2 mt-3 pt-3 border-t"
        style={{ borderColor: C.border }}
      >
        {assigneeName ? (
          <>
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{ backgroundColor: C.accentLight, color: C.accent }}
            >
              {memberInitials(assigneeName)}
            </span>
            <span className="text-xs font-medium truncate" style={{ color: C.textSecondary }}>
              {assigneeName}
            </span>
          </>
        ) : (
          <>
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: C.accentLight }}
            >
              <UserRound className="w-3.5 h-3.5" style={{ color: C.textTertiary }} />
            </span>
            <span className="text-xs italic" style={{ color: C.textTertiary }}>
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
        className="p-4 rounded-xl border text-left w-full cursor-pointer transition-all hover:shadow-sm"
        style={{
          backgroundColor: C.surface,
          borderColor: C.border,
        }}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <motion.div
      variants={staggerItem(reducedMotion)}
      className="p-4 rounded-xl border"
      style={{ backgroundColor: C.surface, borderColor: C.border }}
    >
      {content}
    </motion.div>
  );
}

export default function CommitteeAboutSection({
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
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="rounded-2xl border p-6" style={{ backgroundColor: C.surface, borderColor: C.border }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>
          Overview
        </h3>
        {readOnly ? (
          <div
            className="text-sm whitespace-pre-wrap"
            style={{ color: C.textSecondary }}
          >
            {committee.aboutHtml || "No overview provided yet."}
          </div>
        ) : (
          <>
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
              disabled={saving || !isAboutDirty}
              className="mt-3 px-4 py-2 text-sm font-medium text-white rounded-md cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: C.accent }}
            >
              {saving ? "Saving…" : "Save overview"}
            </button>
          </>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
            Duty roles
          </h3>
          {!readOnly && (
            <button
              type="button"
              onClick={() => setEditingRole(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg cursor-pointer"
              style={{ backgroundColor: C.accent }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add role
            </button>
          )}
        </div>
        <motion.div
          key={committee.dutyRoles.map((r) => r.id).join("-")}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
          variants={staggerContainer(reducedMotion)}
          initial="initial"
          animate="animate"
        >
          {committee.dutyRoles.map((role) => {
            const assignee = committee.members.find((m) => m.id === role.assigneeId);
            return (
              <DutyRoleCard
                key={role.id}
                role={role}
                assigneeName={assignee?.name}
                C={C}
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
          C={C}
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
