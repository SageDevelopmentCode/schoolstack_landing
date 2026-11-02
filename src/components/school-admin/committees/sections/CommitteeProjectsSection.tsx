"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import CreateCommitteeProjectModal, {
  type CreateCommitteeProjectFormInput,
} from "@/components/school-admin/committees/modals/CreateCommitteeProjectModal";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import type { CommitteesApiNamespace } from "@/components/portal-committees/PortalCommitteesPage";
import { committeesApiBaseForPortal } from "@/lib/committees/committees-api-base";
import {
  createCommitteeProject,
  deleteCommitteeProject,
  listCommitteeProjects,
  updateCommitteeProject,
  type CommitteeProject,
  type UpdateCommitteeProjectInput,
} from "@/lib/committees/committee-projects";
import {
  insertCommitteeProjectSupplyItem,
  listCommitteeProjectSupplyList,
  replaceCommitteeProjectSupplyColorLegend,
  saveCommitteeProjectSupplyItem,
  deleteCommitteeProjectSupplyItem,
  type CommitteeProjectSupplyListContext,
} from "@/lib/committees/committee-project-supply-list-storage";
import {
  committeeMembersToCoopFamilies,
  committeeProjectDisplayName,
} from "@/lib/committees/committee-projects-mock";
import type { Committee } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";
import type { CoopSupplyColorLegendEntry, CoopSupplyListItem } from "@/lib/admissions/program-coop-supply-list-mock";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import CommitteeProjectDetailView, {
  type CommitteeProjectDetailTab,
} from "./CommitteeProjectDetailView";
import CommitteeProjectsOverview from "./CommitteeProjectsOverview";

type ProjectsView = "overview" | "detail";

type PendingProjectSave = {
  projectId: string;
  patch: UpdateCommitteeProjectInput;
};

function mergeProjectUpdatePatch(
  base: UpdateCommitteeProjectInput,
  patch: Partial<CommitteeProject>,
): UpdateCommitteeProjectInput {
  const next: UpdateCommitteeProjectInput = { ...base };
  if (patch.name !== undefined) next.name = patch.name;
  if (patch.description !== undefined) next.description = patch.description;
  if (patch.status !== undefined) next.status = patch.status;
  return next;
}

function hasProjectUpdateFields(patch: UpdateCommitteeProjectInput): boolean {
  return (
    patch.name !== undefined ||
    patch.description !== undefined ||
    patch.status !== undefined
  );
}

type CommitteeProjectsSectionProps = {
  committee: Committee;
  theme: ParentThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  readOnly?: boolean;
  currentMemberId?: string;
  portalApiNamespace?: CommitteesApiNamespace | "school-admin";
  initialProjectId?: string | null;
};

export default function CommitteeProjectsSection({
  committee,
  theme,
  supabase,
  organizationId,
  readOnly = false,
  currentMemberId,
  portalApiNamespace = "school-admin",
  initialProjectId = null,
}: CommitteeProjectsSectionProps) {
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const [projects, setProjects] = useState<CommitteeProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ProjectsView>("overview");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<CommitteeProjectDetailTab>("supply_list");
  const [supplyLoading, setSupplyLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createFormKey, setCreateFormKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<CommitteeProject | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const saveProjectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingProjectSaveRef = useRef<PendingProjectSave | null>(null);
  const deepLinkHandledRef = useRef(false);

  const committeesApiBase =
    portalApiNamespace === "school-admin"
      ? "/api/school-admin/committees"
      : committeesApiBaseForPortal(portalApiNamespace);

  const memberFamilies = useMemo(
    () => committeeMembersToCoopFamilies(committee.members),
    [committee.members],
  );

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedId) ?? null,
    [projects, selectedId],
  );

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listCommitteeProjects(supabase, committee.id);
      setProjects(rows);
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to load projects."));
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.projects.load",
        error: "",
      }, err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [committee.id, organizationId, supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadProjects();
    });
  }, [loadProjects]);

  const loadProjectSupply = useCallback(
    async (projectId: string) => {
      setSupplyLoading(true);
      try {
        const { items, colorLegend } = await listCommitteeProjectSupplyList(supabase, projectId);
        setProjects((current) =>
          current.map((project) =>
            project.id === projectId
              ? { ...project, supplyItems: items, colorLegend, supplyItemCount: items.length }
              : project,
          ),
        );
      } catch (err) {
        adminToast.error(formatActionError(err, "Failed to load supply list."));
        void reportPortalOperationalError("school_admin", {
          organizationId,
          operation: "committees.projects.supply_load",
          error: "",
        }, err);
      } finally {
        setSupplyLoading(false);
      }
    },
    [organizationId, supabase],
  );

  const handleOpenProject = useCallback(
    (id: string, tab: CommitteeProjectDetailTab = "supply_list") => {
      setSelectedId(id);
      setDetailTab(tab);
      setView("detail");
      void loadProjectSupply(id);
    },
    [loadProjectSupply],
  );

  useEffect(() => {
    if (!initialProjectId || loading || deepLinkHandledRef.current) return;
    const match = projects.find((project) => project.id === initialProjectId);
    if (!match) return;
    deepLinkHandledRef.current = true;
    queueMicrotask(() => {
      handleOpenProject(match.id);
    });
  }, [handleOpenProject, initialProjectId, loading, projects]);

  const supplyContext = (projectId: string): CommitteeProjectSupplyListContext => ({
    organizationId,
    committeeId: committee.id,
    projectId,
    committeesApiBase: readOnly ? undefined : committeesApiBase,
    createdByMemberId: currentMemberId ?? null,
  });

  const handleCreateProjectSubmit = async (input: CreateCommitteeProjectFormInput) => {
    if (readOnly) return;
    setCreateSaving(true);
    try {
      const created = await createCommitteeProject(supabase, committee.id, {
        organizationId,
        name: input.name,
        description: input.description,
        status: input.status,
        createdByMemberId: currentMemberId ?? null,
        committeesApiBase,
      });
      setProjects((current) => [...current, created]);
      setCreateModalOpen(false);
      handleOpenProject(created.id);
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to create project."));
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.projects.create",
        error: "",
      }, err);
    } finally {
      setCreateSaving(false);
    }
  };

  const persistProjectPatch = useCallback(
    (projectId: string, patch: Parameters<typeof updateCommitteeProject>[2]) => {
      if (readOnly) return;
      void updateCommitteeProject(supabase, projectId, patch).catch((err) => {
        adminToast.error(formatActionError(err, "Failed to save project."));
        void reportPortalOperationalError("school_admin", {
          organizationId,
          operation: "committees.projects.update",
          error: "",
        }, err);
      });
    },
    [organizationId, readOnly, supabase],
  );

  const flushPendingProjectSave = useCallback(() => {
    if (saveProjectTimeoutRef.current) {
      clearTimeout(saveProjectTimeoutRef.current);
      saveProjectTimeoutRef.current = null;
    }
    const pending = pendingProjectSaveRef.current;
    if (!pending) return;
    pendingProjectSaveRef.current = null;
    if (!hasProjectUpdateFields(pending.patch)) return;
    persistProjectPatch(pending.projectId, pending.patch);
  }, [persistProjectPatch]);

  useEffect(() => {
    return () => {
      flushPendingProjectSave();
    };
  }, [flushPendingProjectSave]);

  const handleBackToOverview = () => {
    flushPendingProjectSave();
    setView("overview");
    setSelectedId(null);
    setDetailTab("supply_list");
  };

  const handleUpdateProject = (projectId: string, patch: Partial<CommitteeProject>) => {
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId ? { ...project, ...patch } : project,
      ),
    );

    const pending = pendingProjectSaveRef.current;
    if (pending && pending.projectId !== projectId) {
      flushPendingProjectSave();
    }

    const basePatch =
      pendingProjectSaveRef.current?.projectId === projectId
        ? pendingProjectSaveRef.current.patch
        : {};
    pendingProjectSaveRef.current = {
      projectId,
      patch: mergeProjectUpdatePatch(basePatch, patch),
    };

    if (saveProjectTimeoutRef.current) {
      clearTimeout(saveProjectTimeoutRef.current);
    }
    saveProjectTimeoutRef.current = setTimeout(() => {
      flushPendingProjectSave();
    }, 450);
  };

  const handleItemsChange = async (projectId: string, items: CoopSupplyListItem[]) => {
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? { ...project, supplyItems: items, supplyItemCount: items.length }
          : project,
      ),
    );
  };

  const handleSaveSupplyItem = async (
    projectId: string,
    item: CoopSupplyListItem,
  ): Promise<CoopSupplyListItem> => {
    const ctx = supplyContext(projectId);
    const persisted = await saveCommitteeProjectSupplyItem(supabase, ctx, item);
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? {
              ...project,
              supplyItems: project.supplyItems.map((row) =>
                row.id === persisted.id ? persisted : row,
              ),
            }
          : project,
      ),
    );
    return persisted;
  };

  const handleCreateSupplyItem = async (
    projectId: string,
    item: CoopSupplyListItem,
  ): Promise<CoopSupplyListItem> => {
    if (readOnly) throw new Error("Read-only");
    try {
      const ctx = supplyContext(projectId);
      const persisted = await insertCommitteeProjectSupplyItem(supabase, ctx, item);
      setProjects((current) =>
        current.map((project) =>
          project.id === projectId
            ? {
                ...project,
                supplyItems: [...project.supplyItems, persisted],
                supplyItemCount: project.supplyItems.length + 1,
              }
            : project,
        ),
      );
      return persisted;
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to add supply item."));
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.projects.supply_add",
        error: "",
      }, err);
      throw err;
    }
  };

  const handleRemoveSupplyItem = async (projectId: string, item: CoopSupplyListItem) => {
    if (readOnly) return;
    const ctx = supplyContext(projectId);
    await deleteCommitteeProjectSupplyItem(supabase, ctx, item.id, item.name);
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? {
              ...project,
              supplyItems: project.supplyItems.filter((row) => row.id !== item.id),
              supplyItemCount: Math.max(0, (project.supplyItemCount ?? 0) - 1),
            }
          : project,
      ),
    );
  };

  const handleLegendChange = async (
    projectId: string,
    legend: CoopSupplyColorLegendEntry[],
  ) => {
    if (readOnly) return;
    const ctx = supplyContext(projectId);
    const persisted = await replaceCommitteeProjectSupplyColorLegend(supabase, ctx, legend);
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId ? { ...project, colorLegend: persisted } : project,
      ),
    );
  };

  const requestDeleteProject = useCallback((project: CommitteeProject) => {
    if (readOnly) return;
    setDeleteTarget(project);
  }, [readOnly]);

  const handleConfirmDeleteProject = async () => {
    if (!deleteTarget || readOnly) return;
    setDeleteSaving(true);
    const deletedId = deleteTarget.id;
    try {
      await deleteCommitteeProject(supabase, deletedId, {
        organizationId,
        committeesApiBase: readOnly ? undefined : committeesApiBase,
        createdByMemberId: currentMemberId ?? null,
      });
      setProjects((current) => current.filter((project) => project.id !== deletedId));
      if (selectedId === deletedId) {
        handleBackToOverview();
      }
      setDeleteTarget(null);
      adminToast.success("Project deleted.");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to delete project."));
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.projects.delete",
        error: "",
      }, err);
    } finally {
      setDeleteSaving(false);
    }
  };

  const deleteConfirmDialog = (
    <ConfirmDialog
      C={C}
      open={deleteTarget != null}
      title="Delete project?"
      description={
        deleteTarget
          ? `"${committeeProjectDisplayName(deleteTarget)}" and its supply list will be permanently removed. This cannot be undone.`
          : ""
      }
      confirmLabel="Delete project"
      cancelLabel="Cancel"
      variant="destructive"
      loading={deleteSaving}
      confirmTestId="committee-project-delete-confirm"
      onConfirm={() => void handleConfirmDeleteProject()}
      onClose={() => {
        if (!deleteSaving) setDeleteTarget(null);
      }}
    />
  );

  if (loading) {
    return (
      <AdminCard theme={theme} className="flex items-center justify-center gap-2 py-16">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm" style={{ color: C.textSecondary }}>
          Loading projects…
        </span>
      </AdminCard>
    );
  }

  if (view === "detail" && selectedProject) {
    return (
      <>
        <CommitteeProjectDetailView
          theme={theme}
          C={C}
          project={selectedProject}
          memberFamilies={memberFamilies}
          activeTab={detailTab}
          onTabChange={setDetailTab}
          onBack={handleBackToOverview}
          readOnly={readOnly}
          supplyLoading={supplyLoading}
          onUpdateProject={(patch) => handleUpdateProject(selectedProject.id, patch)}
          onSaveSupplyItem={(item) => handleSaveSupplyItem(selectedProject.id, item)}
          onCreateSupplyItem={(item) => handleCreateSupplyItem(selectedProject.id, item)}
          onRemoveSupplyItem={(item) => handleRemoveSupplyItem(selectedProject.id, item)}
          onLegendChange={(legend) => handleLegendChange(selectedProject.id, legend)}
          onItemsChange={(items) => void handleItemsChange(selectedProject.id, items)}
          onDeleteProject={
            readOnly ? undefined : () => requestDeleteProject(selectedProject)
          }
        />
        {deleteConfirmDialog}
      </>
    );
  }

  return (
    <>
      <CommitteeProjectsOverview
        theme={theme}
        C={C}
        projects={projects}
        readOnly={readOnly}
        onOpenProject={(id) => handleOpenProject(id)}
        onEditProjectDetails={(id) => handleOpenProject(id, "details")}
        onDeleteProject={requestDeleteProject}
        onCreateProject={() => {
          setCreateFormKey((key) => key + 1);
          setCreateModalOpen(true);
        }}
      />
      <CreateCommitteeProjectModal
        key={createFormKey}
        theme={theme}
        C={C}
        open={createModalOpen}
        saving={createSaving}
        onClose={() => {
          if (!createSaving) setCreateModalOpen(false);
        }}
        onSubmit={(input) => void handleCreateProjectSubmit(input)}
      />
      {deleteConfirmDialog}
    </>
  );
}
