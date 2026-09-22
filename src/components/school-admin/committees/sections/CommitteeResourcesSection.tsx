"use client";

import { useMemo, useState, type MouseEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink, FileText, Plus } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import type { Committee, CommitteeResource } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { createResource, deleteResource } from "@/lib/committees/resources";
import { getCommittee } from "@/lib/committees/committees";
import { canMemberEditItem } from "@/lib/committees/attribution";
import { formatResourceAccessLabel } from "@/lib/committees/permissions";
import { uploadCommitteeResourceFile, openCommitteeResource } from "@/lib/committees/resource-file-storage";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import CommitteeSectionEmptyState from "@/components/school-admin/committees/CommitteeSectionEmptyState";
import CommitteeWorkspaceSectionFrame from "@/components/school-admin/committees/CommitteeWorkspaceSectionFrame";
import {
  CommitteeAttributionLabel,
  committeeOperationalSurface,
} from "@/components/school-admin/committees/CommitteeAttributionLabel";
import CommitteeResourceDetailPanel, {
  COMMITTEE_RESOURCE_TYPE_LABELS,
  CommitteeResourceTypeIcon,
  type CommitteeResourceFormData,
  type CommitteeResourcePanelState,
} from "@/components/school-admin/committees/sections/CommitteeResourceDetailPanel";
import { staggerContainer, staggerItem } from "@/components/school-admin/committees/committee-motion";

function panelStatesEqual(
  a: CommitteeResourcePanelState,
  b: CommitteeResourcePanelState,
): boolean {
  if (a.mode !== b.mode) return false;
  if (a.mode === "create" && b.mode === "create") return true;
  if (a.mode === "view" && b.mode === "view") return a.resourceId === b.resourceId;
  return false;
}

export default function CommitteeResourcesSection({
  committee,
  theme,
  supabase,
  organizationId,
  onCommitteeChange,
  readOnly = false,
  currentMemberId,
  isAdmin = true,
}: {
  committee: Committee;
  theme: ParentThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  onCommitteeChange: (committee: Committee) => void;
  readOnly?: boolean;
  currentMemberId?: string;
  isAdmin?: boolean;
}) {
  const [panelState, setPanelState] = useState<CommitteeResourcePanelState | null>(null);
  const [pendingPanelState, setPendingPanelState] =
    useState<CommitteeResourcePanelState | null>(null);
  const [panelDirty, setPanelDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;

  const selectedResource = useMemo(() => {
    if (panelState?.mode !== "view") return null;
    return committee.resources.find((resource) => resource.id === panelState.resourceId) ?? null;
  }, [committee.resources, panelState]);

  const refresh = async () => {
    const updated = await getCommittee(supabase, organizationId, committee.id);
    if (updated) onCommitteeChange(updated);
  };

  const tryOpenPanel = (next: CommitteeResourcePanelState) => {
    if (panelState && panelDirty && !panelStatesEqual(panelState, next)) {
      setPendingPanelState(next);
      return;
    }
    setPanelState(next);
  };

  const openCreatePanel = () => {
    if (readOnly) return;
    tryOpenPanel({ mode: "create" });
  };

  const openViewPanel = (resourceId: string) => {
    if (panelState?.mode === "view" && panelState.resourceId === resourceId) return;
    tryOpenPanel({ mode: "view", resourceId });
  };

  const closePanel = () => {
    setPanelState(null);
    setPendingPanelState(null);
    setPanelDirty(false);
  };

  const handleConfirmNavigation = (next: CommitteeResourcePanelState) => {
    setPanelState(next);
    setPendingPanelState(null);
    setPanelDirty(false);
  };

  const handleCancelNavigation = () => {
    setPendingPanelState(null);
  };

  const handleSave = async (data: CommitteeResourceFormData) => {
    if (readOnly) return;
    setSaving(true);
    try {
      const needsFile = data.type === "pdf" || data.type === "doc";
      let storagePath: string | undefined;
      let fileName: string | undefined;

      if (needsFile && data.file) {
        const uploaded = await uploadCommitteeResourceFile(
          supabase,
          { organizationId, committeeId: committee.id },
          data.file,
          data.type,
        );
        storagePath = uploaded.storagePath;
        fileName = uploaded.fileName;
      }

      await createResource(supabase, committee.id, {
        title: data.title.trim(),
        url: data.type === "link" ? data.url.trim() || undefined : undefined,
        storagePath,
        fileName,
        description: data.description.trim() || undefined,
        type: data.type,
        createdByMemberId: currentMemberId,
      });
      closePanel();
      await refresh();
      adminToast.success("Resource added");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to add resource."));
      void reportPortalOperationalError(committeeOperationalSurface(isAdmin), {
        organizationId,
        operation: "committees.resources.add",
        error: "",
      }, err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedResource || readOnly) return;
    setSaving(true);
    try {
      await deleteResource(supabase, selectedResource.id);
      closePanel();
      await refresh();
      adminToast.success("Resource deleted");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to delete resource."));
      void reportPortalOperationalError(committeeOperationalSurface(isAdmin), {
        organizationId,
        operation: "committees.resources.delete",
        error: "",
      }, err);
    } finally {
      setSaving(false);
    }
  };

  const canDeleteSelected =
    selectedResource != null &&
    !readOnly &&
    canMemberEditItem(
      selectedResource.createdByMemberId,
      currentMemberId,
      isAdmin,
    );

  return (
    <CommitteeWorkspaceSectionFrame width="narrow">
      <div className="space-y-4">
        <div className="flex justify-end">
          {!readOnly ? (
            <AdminButton
              theme={theme}
              variant="primary"
              size="compact"
              onClick={openCreatePanel}
            >
              <Plus className="h-3.5 w-3.5" />
              Add resource
            </AdminButton>
          ) : null}
        </div>

        {committee.resources.length === 0 ? (
          <CommitteeSectionEmptyState
            theme={theme}
            icon={FileText}
            title="No resources yet"
            description="Share helpful links, documents, and guides with your committee members."
            action={
              !readOnly ? (
                <AdminButton
                  theme={theme}
                  variant="primary"
                  size="compact"
                  onClick={openCreatePanel}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add resource
                </AdminButton>
              ) : undefined
            }
          />
        ) : (
          <motion.div
            key={committee.resources.map((resource) => resource.id).join("-")}
            className="space-y-2"
            variants={staggerContainer(reducedMotion)}
            initial="initial"
            animate="animate"
          >
            {committee.resources.map((resource) => (
              <motion.div key={resource.id} variants={staggerItem(reducedMotion)}>
                <ResourceListRow
                  resource={resource}
                  theme={theme}
                  supabase={supabase}
                  organizationId={organizationId}
                  isAdmin={isAdmin}
                  members={committee.members}
                  dutyRoles={committee.dutyRoles}
                  onOpen={() => openViewPanel(resource.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        <CommitteeResourceDetailPanel
          open={panelState != null}
          mode={panelState?.mode ?? "create"}
          resource={selectedResource}
          theme={theme}
          supabase={supabase}
          organizationId={organizationId}
          members={committee.members}
          readOnly={readOnly}
          canEdit={!readOnly}
          canDelete={canDeleteSelected}
          saving={saving}
          pendingNavigation={pendingPanelState}
          onClose={closePanel}
          onSave={handleSave}
          onDelete={canDeleteSelected ? handleDelete : undefined}
          onDirtyChange={setPanelDirty}
          onConfirmNavigation={handleConfirmNavigation}
          onCancelNavigation={handleCancelNavigation}
          isAdmin={isAdmin}
        />
      </div>
    </CommitteeWorkspaceSectionFrame>
  );
}

function ResourceListRow({
  resource,
  theme,
  supabase,
  organizationId,
  isAdmin,
  members,
  dutyRoles,
  onOpen,
}: {
  resource: CommitteeResource;
  theme: ParentThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  isAdmin: boolean;
  members: Committee["members"];
  dutyRoles: Committee["dutyRoles"];
  onOpen: () => void;
}) {
  const [opening, setOpening] = useState(false);
  const accessLabel = formatResourceAccessLabel(
    resource.allowedDutyRoleIds,
    dutyRoles,
  );
  const hasOpenTarget = Boolean(resource.url || resource.storagePath);

  const handleOpenResource = async (event: MouseEvent) => {
    event.stopPropagation();
    if (opening || !hasOpenTarget) return;
    setOpening(true);
    try {
      await openCommitteeResource(supabase, resource);
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to open resource."));
      void reportPortalOperationalError(committeeOperationalSurface(isAdmin), {
        organizationId,
        operation: "committees.resources.open",
        error: "",
      }, err);
    } finally {
      setOpening(false);
    }
  };

  const openLabel = resource.fileName
    ? `Open ${resource.fileName}`
    : resource.url
      ? "Open link"
      : "Open resource";

  return (
    <AdminCard theme={theme} padding="compact" className="!p-2.5 hover:shadow-md">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 flex-1 cursor-pointer text-left"
        >
          <div className="flex items-start gap-2.5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: theme.primarySoft }}
            >
              <CommitteeResourceTypeIcon
                type={resource.type}
                className="h-4 w-4"
                style={{ color: theme.primary }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-sm font-semibold leading-snug" style={{ color: theme.ink }}>
                  {resource.title}
                </p>
                <AdminChip theme={theme} tone="info" className="!text-[9px] !py-0.5">
                  {COMMITTEE_RESOURCE_TYPE_LABELS[resource.type]}
                </AdminChip>
                {accessLabel ? (
                  <AdminChip theme={theme} tone="purple" className="!text-[9px] !py-0.5">
                    {accessLabel}
                  </AdminChip>
                ) : null}
              </div>
              {resource.description ? (
                <p
                  className="mt-0.5 line-clamp-1 text-xs leading-relaxed"
                  style={{ color: theme.muted }}
                >
                  {resource.description}
                </p>
              ) : null}
              <CommitteeAttributionLabel
                theme={theme}
                createdByMemberId={resource.createdByMemberId}
                createdByName={resource.createdByName}
                createdByRole={resource.createdByRole}
                members={members}
                className="mt-1 text-[10px]"
              />
            </div>
          </div>
        </button>
        {hasOpenTarget ? (
          <button
            type="button"
            onClick={(event) => void handleOpenResource(event)}
            disabled={opening}
            className="shrink-0 rounded-md p-1.5 transition-colors hover:bg-black/5 disabled:opacity-50"
            style={{ color: theme.primary }}
            aria-label={openLabel}
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </AdminCard>
  );
}
