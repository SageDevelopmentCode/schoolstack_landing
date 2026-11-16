"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Check, Loader2, RotateCw } from "lucide-react";
import { GChip } from "@/components/school-parent/garden/ui";
import CreateCommitteeProjectModal, {
  type CreateCommitteeProjectFormInput,
} from "@/components/school-admin/committees/modals/CreateCommitteeProjectModal";
import { CommitteeCard, CommitteeConfirmDialog } from "@/components/school-admin/committees/committee-ui";
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
import { formatActionError } from "@/lib/school-admin/admin-toast";
import { useCommitteeNotify } from "@/components/school-admin/committees/committee-surface";
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
  const notify = useCommitteeNotify();
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
      notify.error(formatActionError(err, "Failed to load projects."));
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.projects.load",
        error: "",
      }, err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [committee.id, notify, organizationId, supabase]);

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
        notify.error(formatActionError(err, "Failed to load supply list."));
        void reportPortalOperationalError("school_admin", {
          organizationId,
          operation: "committees.projects.supply_load",
          error: "",
        }, err);
      } finally {
        setSupplyLoading(false);
      }
    },
    [notify, organizationId, supabase],
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
      notify.success(`${created.name || "Project"} created.`, {
        id: "committee-project-create",
        description: "It's open now — add supplies or fill in the details. Changes save as you type.",
      });
    } catch (err) {
      notify.error(formatActionError(err, "Failed to create project."), {
        title: "Couldn't create the project",
        id: "committee-project-create",
        retry: () => void handleCreateProjectSubmit(input),
      });
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.projects.create",
        error: "",
      }, err);
    } finally {
      setCreateSaving(false);
    }
  };

  /** Autosave state for the open project (shown as a chip in Garden). */
  const [projectSave, setProjectSave] = useState<
    | { state: "idle" | "saving" | "saved" }
    | { state: "error"; retry: () => void }
  >({ state: "idle" });
  const projectSaveSeq = useRef(0);
  /** Latest saver, so "Retry" re-sends the same patch without a self-reference. */
  const persistRef = useRef<((projectId: string, patch: Parameters<typeof updateCommitteeProject>[2]) => void) | null>(null);

  const persistProjectPatch = useCallback(
    (projectId: string, patch: Parameters<typeof updateCommitteeProject>[2]) => {
      if (readOnly) return;
      const seq = ++projectSaveSeq.current;
      setProjectSave({ state: "saving" });
      const retry = () => persistRef.current?.(projectId, patch);
      void updateCommitteeProject(supabase, projectId, patch)
        .then(() => {
          if (seq !== projectSaveSeq.current) return;
          notify.clearError("committee-project-save");
          setProjectSave({ state: "saved" });
        })
        .catch((err) => {
          if (seq === projectSaveSeq.current) setProjectSave({ state: "error", retry });
          notify.error(formatActionError(err, "Failed to save project."), {
            title: "Couldn't save the project",
            id: "committee-project-save",
            retry,
          });
          void reportPortalOperationalError("school_admin", {
            organizationId,
            operation: "committees.projects.update",
            error: "",
          }, err);
        });
    },
    [notify, organizationId, readOnly, supabase],
  );

  useEffect(() => {
    persistRef.current = persistProjectPatch;
  }, [persistProjectPatch]);

  useEffect(() => {
    if (projectSave.state !== "saved") return undefined;
    const timer = window.setTimeout(() => setProjectSave({ state: "idle" }), 2500);
    return () => window.clearTimeout(timer);
  }, [projectSave]);

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
      notify.error(formatActionError(err, "Failed to add supply item."));
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
    try {
      await deleteCommitteeProjectSupplyItem(supabase, ctx, item.id, item.name);
    } catch (err) {
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.projects.supply_remove",
        error: "",
      }, err);
      throw err;
    }
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
    let persisted: CoopSupplyColorLegendEntry[];
    try {
      persisted = await replaceCommitteeProjectSupplyColorLegend(supabase, ctx, legend);
    } catch (err) {
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.projects.supply_legend",
        error: "",
      }, err);
      throw err;
    }
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
      notify.success("Project deleted.");
    } catch (err) {
      notify.error(formatActionError(err, "Failed to delete project."));
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
    <CommitteeConfirmDialog
      theme={theme}
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
      <CommitteeCard theme={theme} className="flex items-center justify-center gap-2 py-16">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm" style={{ color: C.textSecondary }}>
          Loading projects…
        </span>
      </CommitteeCard>
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
          saveStatus={
            projectSave.state === "saving" ? (
              <GChip tone="info" className="inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                Saving…
              </GChip>
            ) : projectSave.state === "saved" ? (
              <GChip tone="success">
                <Check className="h-3 w-3" aria-hidden />
                Saved
              </GChip>
            ) : projectSave.state === "error" ? (
              <button type="button" onClick={projectSave.retry} className="rounded-full">
                <GChip tone="alert">
                  <RotateCw className="h-3 w-3" aria-hidden />
                  Couldn&apos;t save · Retry
                </GChip>
              </button>
            ) : null
          }
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
