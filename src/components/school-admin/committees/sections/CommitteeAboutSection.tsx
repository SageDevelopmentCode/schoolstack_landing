"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Plus, UserRound } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import type { Committee, CommitteeDutyRole } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { memberInitials } from "@/lib/committees/task-utils";
import {
  createDutyRole,
  deleteDutyRole,
  updateDutyRole,
} from "@/lib/committees/duty-roles";
import { getCommittee, updateCommittee } from "@/lib/committees/committees";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import EditDutyRolePanel, {
  dutyRolePanelStatesEqual,
  type DutyRoleFormValue,
  type DutyRolePanelState,
} from "@/components/school-admin/committees/sections/EditDutyRolePanel";
import CommitteeWorkspaceSectionFrame from "@/components/school-admin/committees/CommitteeWorkspaceSectionFrame";
import { committeeStoryInputStyle } from "@/components/school-admin/committees/committee-story-input-style";
import { staggerContainer, staggerItem } from "@/components/school-admin/committees/committee-motion";

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
    <div className="flex items-start gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold" style={{ color: theme.ink }}>
          {role.title}
        </p>
        {!readOnly && onSelect ? (
          <p className="mt-0.5 text-[10px]" style={{ color: theme.muted }}>
            Click to edit
          </p>
        ) : null}
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
      </div>
      {!readOnly && onSelect ? (
        <ChevronRight
          className="mt-0.5 h-4 w-4 shrink-0 transition-colors group-hover:text-[var(--duty-role-accent)]"
          style={{ color: theme.muted, ["--duty-role-accent" as string]: theme.primary }}
        />
      ) : null}
    </div>
  );

  if (!readOnly && onSelect) {
    return (
      <motion.button
        type="button"
        variants={staggerItem(reducedMotion)}
        onClick={onSelect}
        className="group w-full cursor-pointer rounded-xl text-left transition-all hover:-translate-y-px hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          outlineColor: theme.primary,
          ["--duty-role-accent" as string]: theme.primary,
        }}
      >
        <AdminCard
          theme={theme}
          padding="default"
          className="border transition-colors group-hover:border-[var(--duty-role-accent)]"
        >
          {content}
        </AdminCard>
      </motion.button>
    );
  }

  return (
    <motion.div variants={staggerItem(reducedMotion)}>
      <AdminCard theme={theme} padding="default">
        {content}
      </AdminCard>
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
  const inputStyle = useMemo(() => committeeStoryInputStyle(theme), [theme]);
  const [aboutHtml, setAboutHtml] = useState(committee.aboutHtml);
  const [saving, setSaving] = useState(false);
  const [roleSaving, setRoleSaving] = useState(false);
  const [panelState, setPanelState] = useState<DutyRolePanelState | null>(null);
  const [pendingPanelState, setPendingPanelState] = useState<DutyRolePanelState | null>(null);
  const [panelDirty, setPanelDirty] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;

  const selectedRole = useMemo(() => {
    if (panelState?.mode !== "edit") return null;
    return committee.dutyRoles.find((role) => role.id === panelState.roleId) ?? null;
  }, [committee.dutyRoles, panelState]);

  const isAboutDirty = aboutHtml !== committee.aboutHtml;

  const refresh = async () => {
    const updated = await getCommittee(supabase, organizationId, committee.id);
    if (updated) onCommitteeChange(updated);
  };

  const closePanel = () => {
    setPanelState(null);
    setPendingPanelState(null);
    setPanelDirty(false);
  };

  const tryOpenPanel = (next: DutyRolePanelState) => {
    if (panelState && panelDirty && !dutyRolePanelStatesEqual(panelState, next)) {
      setPendingPanelState(next);
      return;
    }
    setPanelState(next);
  };

  const openCreatePanel = () => {
    if (readOnly) return;
    tryOpenPanel({ mode: "create" });
  };

  const openEditPanel = (roleId: string) => {
    if (readOnly) return;
    if (panelState?.mode === "edit" && panelState.roleId === roleId) return;
    tryOpenPanel({ mode: "edit", roleId });
  };

  const handleConfirmNavigation = (next: DutyRolePanelState) => {
    setPanelState(next);
    setPendingPanelState(null);
    setPanelDirty(false);
  };

  const handleCancelNavigation = () => {
    setPendingPanelState(null);
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
      if (panelState?.mode === "edit" && selectedRole) {
        await updateDutyRole(supabase, selectedRole.id, {
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
      closePanel();
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
    if (!selectedRole) return;
    setDeleting(true);
    try {
      await deleteDutyRole(supabase, selectedRole.id, committee.id);
      closePanel();
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
    <CommitteeWorkspaceSectionFrame width="wide">
      <div className="space-y-6">
        <AdminCard theme={theme} padding="default">
          <AdminDisplayHeading theme={theme} as="h3" size="section">
            Overview
          </AdminDisplayHeading>
          {readOnly ? (
            <div className="mt-3 whitespace-pre-wrap text-sm" style={{ color: theme.muted }}>
              {committee.aboutHtml || "No overview provided yet."}
            </div>
          ) : (
            <>
              <textarea
                value={aboutHtml}
                onChange={(e) => setAboutHtml(e.target.value)}
                rows={6}
                className="mt-3 w-full rounded-lg border p-3 text-sm"
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
          <div className="mb-3 flex items-center justify-between gap-3">
            <AdminDisplayHeading theme={theme} as="h3" size="section">
              Duty roles
            </AdminDisplayHeading>
            {!readOnly && (
              <AdminButton theme={theme} variant="primary" size="compact" onClick={openCreatePanel}>
                <Plus className="h-3.5 w-3.5" />
                Add role
              </AdminButton>
            )}
          </div>
          <motion.div
            key={committee.dutyRoles.map((role) => role.id).join("-")}
            className="grid grid-cols-1 gap-3 md:grid-cols-2"
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
                  onSelect={readOnly ? undefined : () => openEditPanel(role.id)}
                />
              );
            })}
          </motion.div>
        </div>

        <EditDutyRolePanel
          open={panelState != null}
          mode={panelState?.mode ?? "create"}
          dutyRole={selectedRole}
          committee={committee}
          theme={theme}
          saving={roleSaving || deleting}
          pendingNavigation={pendingPanelState}
          onClose={closePanel}
          onSave={handleSaveRole}
          onDelete={
            panelState?.mode === "edit" && selectedRole
              ? () => void handleDeleteRole()
              : undefined
          }
          onDirtyChange={setPanelDirty}
          onConfirmNavigation={handleConfirmNavigation}
          onCancelNavigation={handleCancelNavigation}
        />
      </div>
    </CommitteeWorkspaceSectionFrame>
  );
}
