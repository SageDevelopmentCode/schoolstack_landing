"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  Globe,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  createProgram,
  deleteProgram,
  listProgramsDetailed,
  updateProgram,
  type Program,
  type ProgramStatus,
  type ProgramType,
} from "@/lib/admissions/programs";
import {
  emptyProgramPortalEditorState,
  expandProgramPortalSettingsForEditor,
  isProgramParentPortalCoopMode,
  type ProgramParentPortalEditorState,
} from "@/lib/admissions/program-parent-portal";
import {
  isProgramIsolationAllowed,
  type ProgramParentPortalOrgConfig,
} from "@/lib/admissions/program-parent-portal-governance";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { createClient } from "@/utils/supabase/client";

/** Selection id for an unsaved new program. */
export const NEW_PROGRAM_ID = "__new__";

/*
 * Programs view-model: list, select, edit, dirty check, create/save/delete and
 * preview mode. Shared by the live admin page and the marketing demos.
 */

export type ProgramEditorTab =
  | "details"
  | "portal"
  | "curriculum"
  | "supply_list"
  | "teaching_schedule"
  | "families";

type CoopProgramEditorTab = Exclude<ProgramEditorTab, "details" | "portal">;

export type ProgramEditorTabConfig = {
  id: ProgramEditorTab;
  label: string;
  icon: LucideIcon;
};

export type EditableProgramState = {
  name: string;
  description: string;
  type: ProgramType;
  status: ProgramStatus;
  startDate: string;
  endDate: string;
  capacity: string;
  parentPortalEditor: ProgramParentPortalEditorState;
};

const BASE_PROGRAM_EDITOR_TABS: ReadonlyArray<ProgramEditorTabConfig> = [
  { id: "details", label: "Program details", icon: ClipboardList },
  { id: "portal", label: "Portal configuration", icon: Globe },
];

const COOP_MODE_EDITOR_TABS: ReadonlyArray<ProgramEditorTabConfig & { id: CoopProgramEditorTab }> = [
  { id: "curriculum", label: "Co-op curriculum", icon: BookOpen },
  { id: "supply_list", label: "Supply list", icon: ClipboardList },
  { id: "teaching_schedule", label: "Teaching schedule", icon: CalendarDays },
  { id: "families", label: "Families", icon: Users },
];

const COOP_ONLY_TAB_IDS = new Set<CoopProgramEditorTab>(
  COOP_MODE_EDITOR_TABS.map((tab) => tab.id),
);

function isCoopOnlyTab(tab: ProgramEditorTab): tab is CoopProgramEditorTab {
  return COOP_ONLY_TAB_IDS.has(tab as CoopProgramEditorTab);
}

function toEditableState(
  program: Program,
  orgFeatures: OrganizationFeatures,
): EditableProgramState {
  return {
    name: program.name,
    description: program.description ?? "",
    type: program.type,
    status: program.status,
    startDate: program.start_date ?? "",
    endDate: program.end_date ?? "",
    capacity: program.capacity != null ? String(program.capacity) : "",
    parentPortalEditor: expandProgramPortalSettingsForEditor(
      program.parent_portal_settings,
      orgFeatures.parent,
    ),
  };
}

function emptyEditableState(orgFeatures: OrganizationFeatures): EditableProgramState {
  return {
    name: "",
    description: "",
    type: "school_year",
    status: "open",
    startDate: "",
    endDate: "",
    capacity: "",
    parentPortalEditor: emptyProgramPortalEditorState(orgFeatures.parent),
  };
}


/** Wall-clock time for the "Saved just now" label (called from event handlers only). */
function nowMs(): number {
  return Date.now();
}

export function useProgramsModel({
  organizationId,
  orgFeatures,
  slug,
  programParentPortalConfig,
  initialPrograms,
  initialSelectedProgramId,
  previewMode = false,
}: {
  organizationId: string;
  orgFeatures: OrganizationFeatures;
  slug: string;
  programParentPortalConfig: ProgramParentPortalOrgConfig;
  initialPrograms?: Program[];
  initialSelectedProgramId?: string | null;
  previewMode?: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const hasInitialPrograms = initialPrograms !== undefined;

  const [programs, setPrograms] = useState<Program[]>(initialPrograms ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedProgramId ?? initialPrograms?.[0]?.id ?? null,
  );
  const [editable, setEditable] = useState<EditableProgramState | null>(null);
  const [activeEditorTab, setActiveEditorTab] = useState<ProgramEditorTab>("details");
  const [loading, setLoading] = useState(!hasInitialPrograms);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNew = selectedId === NEW_PROGRAM_ID;
  const selectedProgram = programs.find((program) => program.id === selectedId) ?? null;
  const coopModeEnabled = selectedProgram
    ? isProgramParentPortalCoopMode(selectedProgram.parent_portal_settings)
    : false;
  const visibleEditorTab =
    isCoopOnlyTab(activeEditorTab) && !coopModeEnabled ? "portal" : activeEditorTab;
  const programEditorTabs = useMemo(() => {
    if (!selectedProgram || isNew) return BASE_PROGRAM_EDITOR_TABS;
    return coopModeEnabled
      ? [...BASE_PROGRAM_EDITOR_TABS, ...COOP_MODE_EDITOR_TABS]
      : BASE_PROGRAM_EDITOR_TABS;
  }, [selectedProgram, isNew, coopModeEnabled]);
  const portalGovernance = useMemo(
    () => ({
      isolationAllowed: selectedProgram
        ? isProgramIsolationAllowed(
            selectedProgram.id,
            programParentPortalConfig,
          )
        : false,
    }),
    [programParentPortalConfig, selectedProgram?.id],
  );
  const flowsPath = schoolAdminPath(slug, "admissions", "flows");
  const canvasKey = selectedId ?? "none";

  const loadPrograms = useCallback(async () => {
    if (previewMode) return;

    setLoading(true);
    setError(null);
    try {
      const rows = await listProgramsDetailed(supabase, organizationId);
      setPrograms(rows);
      setSelectedId((prev) => {
        if (prev === NEW_PROGRAM_ID) return prev;
        if (prev && rows.some((row) => row.id === prev)) return prev;
        return rows[0]?.id ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load programs.");
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "admissions.programs.load",
        error: "",
      }, err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, previewMode, supabase]);

  useEffect(() => {
    if (previewMode || hasInitialPrograms) return;
    queueMicrotask(() => {
      void loadPrograms();
    });
  }, [hasInitialPrograms, loadPrograms, previewMode]);

  useEffect(() => {
    if (!initialPrograms) return;
    queueMicrotask(() => {
      setPrograms(initialPrograms);
      setLoading(false);
      setSelectedId((current) => {
        if (initialSelectedProgramId) return initialSelectedProgramId;
        if (current && initialPrograms.some((program) => program.id === current)) {
          return current;
        }
        return initialPrograms[0]?.id ?? null;
      });
    });
  }, [initialPrograms, initialSelectedProgramId]);

  useEffect(() => {
    if (isNew) {
      queueMicrotask(() => {
        setEditable(emptyEditableState(orgFeatures));
        setActiveEditorTab("details");
      });
      return;
    }
    if (!selectedProgram) {
      queueMicrotask(() => setEditable(null));
      return;
    }
    queueMicrotask(() => {
      setEditable(toEditableState(selectedProgram, orgFeatures));
      setActiveEditorTab("details");
    });
  }, [isNew, orgFeatures, selectedProgram?.id, selectedProgram?.updated_at]);

  const isProgramDirty = useMemo(() => {
    if (!editable) return false;
    if (isNew) return editable.name.trim().length > 0;
    if (!selectedProgram) return false;
    const saved = toEditableState(selectedProgram, orgFeatures);
    return (
      editable.name !== saved.name ||
      editable.description !== saved.description ||
      editable.type !== saved.type ||
      editable.status !== saved.status ||
      editable.startDate !== saved.startDate ||
      editable.endDate !== saved.endDate ||
      editable.capacity !== saved.capacity
    );
  }, [editable, isNew, selectedProgram]);

  const handleCreate = () => {
    if (previewMode) return;
    setSelectedId(NEW_PROGRAM_ID);
    setEditable(emptyEditableState(orgFeatures));
    setActiveEditorTab("details");
    setError(null);
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setActiveEditorTab("details");
    setError(null);
  };

  const handleSave = async () => {
    if (previewMode || !editable || !isProgramDirty) return;

    setSaving(true);
    setError(null);

    const capacityValue = editable.capacity.trim();
    const parsedCapacity =
      capacityValue === "" ? null : Number.parseInt(capacityValue, 10);

    if (capacityValue && Number.isNaN(parsedCapacity)) {
      setError("Capacity must be a whole number.");
      setFieldErrors({ capacity: "Capacity must be a whole number." });
      setSaving(false);
      return;
    }
    if (!editable.name.trim()) {
      setFieldErrors({ name: "Give your program a name." });
      setSaving(false);
      return;
    }
    setFieldErrors({});

    const payload = {
      name: editable.name,
      description: editable.description.trim() || null,
      type: editable.type,
      status: editable.status,
      start_date: editable.startDate.trim() || null,
      end_date: editable.endDate.trim() || null,
      capacity: parsedCapacity,
    };

    try {
      if (isNew) {
        const created = await createProgram(supabase, organizationId, payload);
        setPrograms((prev) =>
          [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
        );
        setSelectedId(created.id);
      } else if (selectedProgram) {
        const updated = await updateProgram(
          supabase,
          selectedProgram.id,
          organizationId,
          payload,
        );
        setPrograms((prev) =>
          prev
            .map((row) => (row.id === updated.id ? updated : row))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
        setEditable(toEditableState(updated, orgFeatures));
      }
      adminToast.dismiss("program-save-error");
      adminToast.success(isNew ? "Program created" : "Program saved", {
        id: "program-save",
        description: isNew
          ? `${payload.name} is ready. Next, link it to an application form on Enrollment Flows.`
          : `${payload.name} is up to date.`,
      });
      setSavedAt(nowMs());
    } catch (err) {
      const message = formatActionError(err, "Failed to save program.");
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "admissions.programs.save",
        error: "",
      }, err);
      setError(message);
      adminToast.error(isNew ? "Couldn't create the program" : "Couldn't save the program", {
        id: "program-save-error",
        description: `${message} Your edits are still here.`,
        action: { label: "Retry", onClick: () => void handleSaveRef.current() },
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (previewMode || !selectedProgram) return;

    setDeleting(true);
    setError(null);

    try {
      await deleteProgram(supabase, selectedProgram.id, organizationId);
      setPrograms((prev) => prev.filter((row) => row.id !== selectedProgram.id));
      setSelectedId((prev) => {
        if (prev !== selectedProgram.id) return prev;
        const remaining = programs.filter((row) => row.id !== selectedProgram.id);
        return remaining[0]?.id ?? null;
      });
      setDeleteOpen(false);
      adminToast.dismiss("program-delete-error");
      adminToast.success("Program deleted", {
        id: "program-delete",
        description: `${selectedProgram.name} was removed from your programs.`,
      });
    } catch (err) {
      const message = formatActionError(err, "Failed to delete program.");
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "admissions.programs.delete",
        error: "",
      }, err);
      setError(message);
      adminToast.error("Couldn't delete the program", {
        id: "program-delete-error",
        description: `${message} The program is still there.`,
      });
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };


  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; capacity?: string }>({});
  const handleSaveRef = useRef(handleSave);
  useEffect(() => {
    handleSaveRef.current = handleSave;
  });

  const discardChanges = useCallback(() => {
    setFieldErrors({});
    setError(null);
    if (isNew) {
      setSelectedId(programs[0]?.id ?? null);
      setEditable(programs[0] ? toEditableState(programs[0], orgFeatures) : null);
      return;
    }
    if (selectedProgram) setEditable(toEditableState(selectedProgram, orgFeatures));
  }, [isNew, orgFeatures, programs, selectedProgram]);

  const updateField = useCallback(
    <K extends keyof EditableProgramState>(key: K, value: EditableProgramState[K]) => {
      setEditable((prev) => (prev ? { ...prev, [key]: value } : prev));
      if (key === "name" || key === "capacity") {
        setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
      }
    },
    [],
  );

  const openCount = programs.filter((program) => program.status === "open").length;

  return {
    supabase,
    programs,
    selectedId,
    selectedProgram,
    editable,
    setEditable,
    updateField,
    isNew,
    loading,
    saving,
    deleting,
    deleteOpen,
    setDeleteOpen,
    error,
    setError,
    fieldErrors,
    savedAt,
    coopModeEnabled,
    visibleEditorTab,
    setActiveEditorTab,
    programEditorTabs,
    portalGovernance,
    flowsPath,
    canvasKey,
    isProgramDirty,
    openCount,
    reload: loadPrograms,
    handleCreate,
    handleSelect,
    handleSave,
    handleDelete,
    discardChanges,
  };
}

export type ProgramsModel = ReturnType<typeof useProgramsModel>;
