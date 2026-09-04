"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Save, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import SchoolAdminDatePicker, {
  schoolAdminDateRangeBounds,
} from "@/components/school-admin/ui/SchoolAdminDatePicker";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSaveStateBar from "@/components/school-admin/ui/story/AdminSaveStateBar";
import TuitionSubTabBar from "@/components/school-admin/tuition/TuitionSubTabBar";
import { SchoolAdminSplitPaneSkeleton } from "@/components/school-admin/skeletons";
import {
  createProgram,
  deleteProgram,
  listProgramsDetailed,
  PROGRAM_STATUS_OPTIONS,
  PROGRAM_TYPE_OPTIONS,
  programTypeLabel,
  updateProgram,
  type Program,
  type ProgramStatus,
  type ProgramType,
} from "@/lib/admissions/programs";
import {
  deriveProgramPortalSettingsFromEditor,
  emptyProgramPortalEditorState,
  expandProgramPortalSettingsForEditor,
  programPortalEditorStatesEqual,
  type ProgramParentPortalEditorState,
} from "@/lib/admissions/program-parent-portal";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import {
  buildParentThemeTokens,
  parentThemeToAdminCompat,
} from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import type { OrganizationBranding, OrganizationFeatures } from "@/lib/organization-settings/types";
import ProgramParentPortalSettingsCard from "./ProgramParentPortalSettingsCard";
import { createClient } from "@/utils/supabase/client";
import EnrollmentFlowsStoryShell from "./EnrollmentFlowsStoryShell";
import EnrollmentFlowsStoryHeader from "./EnrollmentFlowsStoryHeader";
import ProgramsEmptyState from "./ProgramsEmptyState";
import ProgramsOutline, { NEW_PROGRAM_ID } from "./ProgramsOutline";
import {
  BuilderQuestionCard,
  BuilderSectionIntro,
} from "./builder-question-card";
import { builderCanvasTransition } from "./builder-canvas-motion";
import { BUILDER_CANVAS_BG } from "./outline-item-styles";

type ProgramsPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  orgFeatures: OrganizationFeatures;
  slug: string;
};

type ProgramEditorTab = "details" | "portal";

type EditableProgramState = {
  name: string;
  description: string;
  type: ProgramType;
  status: ProgramStatus;
  startDate: string;
  endDate: string;
  capacity: string;
  parentPortalEditor: ProgramParentPortalEditorState;
};

const PROGRAM_EDITOR_TABS = [
  { id: "details" as const, label: "Program details" },
  { id: "portal" as const, label: "Portal configuration" },
];

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

function inputStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    backgroundColor: "#FCFDFC",
    border: "1px solid #D9E0DA",
    color: C.textPrimary,
    borderRadius: "7px",
    fontSize: "14px",
    padding: "10px 12px",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };
}

export default function ProgramsPage({
  organizationId,
  branding,
  orgFeatures,
  slug,
}: ProgramsPageProps) {
  const theme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const supabase = useMemo(() => createClient(), []);

  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editable, setEditable] = useState<EditableProgramState | null>(null);
  const [activeEditorTab, setActiveEditorTab] = useState<ProgramEditorTab>("details");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNew = selectedId === NEW_PROGRAM_ID;
  const selectedProgram = programs.find((program) => program.id === selectedId) ?? null;
  const flowsPath = schoolAdminPath(slug, "admissions", "flows");
  const canvasKey = selectedId ?? "none";

  const loadPrograms = useCallback(async () => {
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
    } finally {
      setLoading(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadPrograms();
    });
  }, [loadPrograms]);

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
      editable.capacity !== saved.capacity ||
      !programPortalEditorStatesEqual(
        editable.parentPortalEditor,
        saved.parentPortalEditor,
        orgFeatures,
      )
    );
  }, [editable, isNew, orgFeatures, selectedProgram]);

  const handleCreate = () => {
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
    if (!editable || !isProgramDirty) return;

    setSaving(true);
    setError(null);

    const capacityValue = editable.capacity.trim();
    const parsedCapacity =
      capacityValue === "" ? null : Number.parseInt(capacityValue, 10);

    if (capacityValue && Number.isNaN(parsedCapacity)) {
      setError("Capacity must be a whole number.");
      setSaving(false);
      return;
    }

    const payload = {
      name: editable.name,
      description: editable.description.trim() || null,
      type: editable.type,
      status: editable.status,
      start_date: editable.startDate.trim() || null,
      end_date: editable.endDate.trim() || null,
      capacity: parsedCapacity,
      parent_portal_settings: isNew
        ? undefined
        : deriveProgramPortalSettingsFromEditor(
            editable.parentPortalEditor,
            orgFeatures,
          ),
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
      adminToast.success(isNew ? "Program created" : "Program saved");
    } catch (err) {
      const message = formatActionError(err, "Failed to save program.");
      setError(message);
      adminToast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProgram) return;

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
      adminToast.success("Program deleted");
    } catch (err) {
      const message = formatActionError(err, "Failed to delete program.");
      setError(message);
      adminToast.error(message);
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <EnrollmentFlowsStoryShell branding={branding}>
        <SchoolAdminSplitPaneSkeleton C={C} label="Loading programs" />
      </EnrollmentFlowsStoryShell>
    );
  }

  const showEmptyState = programs.length === 0 && !isNew && !editable;

  if (showEmptyState) {
    return (
      <EnrollmentFlowsStoryShell branding={branding}>
        <ProgramsEmptyState theme={theme} onCreate={handleCreate} />
      </EnrollmentFlowsStoryShell>
    );
  }

  return (
    <EnrollmentFlowsStoryShell branding={branding}>
      <div className="flex h-full min-h-0 overflow-hidden">
        <ProgramsOutline
          C={C}
          theme={theme}
          programs={programs}
          selectedId={selectedId}
          isNew={isNew}
          onSelect={handleSelect}
          onCreate={handleCreate}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <EnrollmentFlowsStoryHeader
            theme={theme}
            flowTitle={
              <AdminDisplayHeading theme={theme} as="h1" size="canvas">
                {isNew ? "New program" : selectedProgram?.name ?? "Programs"}
              </AdminDisplayHeading>
            }
            actions={
              editable ? (
                <>
                  {!isNew && selectedProgram ? (
                    <AdminButton
                      theme={theme}
                      variant="danger"
                      size="compact"
                      onClick={() => setDeleteOpen(true)}
                      disabled={saving || deleting}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </AdminButton>
                  ) : null}
                  <AdminButton
                    theme={theme}
                    variant="primary"
                    size="compact"
                    onClick={handleSave}
                    disabled={saving || !isProgramDirty}
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    {isNew ? "Create program" : "Save"}
                  </AdminButton>
                </>
              ) : null
            }
          />

          {!isNew && editable ? (
            <div className="shrink-0 bg-white px-5 sm:px-6">
              <TuitionSubTabBar
                theme={theme}
                tabs={PROGRAM_EDITOR_TABS}
                activeTab={activeEditorTab}
                onTabChange={setActiveEditorTab}
                ariaLabel="Program editor sections"
                testIdPrefix="program-editor"
              />
            </div>
          ) : null}

          <div
            className="flex-1 overflow-y-auto p-5 sm:p-6"
            style={{ backgroundColor: BUILDER_CANVAS_BG }}
          >
            {error ? (
              <p
                className="mb-4 rounded-md border px-3 py-2.5 text-sm"
                style={{
                  borderColor: C.errorBorder,
                  backgroundColor: C.surface,
                  color: C.error,
                }}
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <AnimatePresence mode="wait">
              {editable ? (
                <motion.div
                  key={`${canvasKey}-${activeEditorTab}`}
                  className="mx-auto max-w-xl space-y-4"
                  {...builderCanvasTransition}
                >
                  {activeEditorTab === "details" || isNew ? (
                    <>
                      <BuilderSectionIntro
                        C={C}
                        theme={theme}
                        eyebrow="Program details"
                        title={isNew ? "Set up your program" : "Edit program"}
                        subtitle="Define the enrollment period families apply to. Link it to an application form on Enrollment Flows."
                      />

                      <BuilderQuestionCard C={C} tone="accent" question="Program name">
                        <input
                          type="text"
                          value={editable.name}
                          onChange={(e) =>
                            setEditable((prev) =>
                              prev ? { ...prev, name: e.target.value } : prev,
                            )
                          }
                          placeholder="e.g. School Year 2026–27"
                          style={inputStyle(C)}
                        />
                      </BuilderQuestionCard>

                      <BuilderQuestionCard
                        C={C}
                        tone="accent"
                        question="Description"
                        helper="Optional. Shown internally to help your team distinguish programs."
                      >
                        <textarea
                          rows={3}
                          value={editable.description}
                          onChange={(e) =>
                            setEditable((prev) =>
                              prev ? { ...prev, description: e.target.value } : prev,
                            )
                          }
                          placeholder="e.g. Friday enrichment program for K–2 families"
                          style={{ ...inputStyle(C), resize: "vertical" }}
                        />
                      </BuilderQuestionCard>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <BuilderQuestionCard C={C} tone="accent" question="Type">
                          <SchoolAdminSelect
                            C={C}
                            value={editable.type}
                            onChange={(value) =>
                              setEditable((prev) =>
                                prev ? { ...prev, type: value as ProgramType } : prev,
                              )
                            }
                            options={PROGRAM_TYPE_OPTIONS.map((option) => ({
                              value: option.value,
                              label: option.label,
                            }))}
                            ariaLabel="Program type"
                          />
                        </BuilderQuestionCard>

                        <BuilderQuestionCard C={C} tone="accent" question="Status">
                          <SchoolAdminSelect
                            C={C}
                            value={editable.status}
                            onChange={(value) =>
                              setEditable((prev) =>
                                prev
                                  ? { ...prev, status: value as ProgramStatus }
                                  : prev,
                              )
                            }
                            options={PROGRAM_STATUS_OPTIONS.map((option) => ({
                              value: option.value,
                              label: option.label,
                            }))}
                            ariaLabel="Program status"
                          />
                        </BuilderQuestionCard>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <BuilderQuestionCard C={C} tone="accent" question="Start date">
                          <SchoolAdminDatePicker
                            id="program-start-date"
                            C={C}
                            value={editable.startDate}
                            onChange={(value) =>
                              setEditable((prev) =>
                                prev ? { ...prev, startDate: value } : prev,
                              )
                            }
                            maxDate={
                              editable.endDate || schoolAdminDateRangeBounds().maxDate
                            }
                            placeholder="Select start date"
                          />
                        </BuilderQuestionCard>

                        <BuilderQuestionCard C={C} tone="accent" question="End date">
                          <SchoolAdminDatePicker
                            id="program-end-date"
                            C={C}
                            value={editable.endDate}
                            onChange={(value) =>
                              setEditable((prev) =>
                                prev ? { ...prev, endDate: value } : prev,
                              )
                            }
                            minDate={
                              editable.startDate || schoolAdminDateRangeBounds().minDate
                            }
                            placeholder="Select end date"
                          />
                        </BuilderQuestionCard>
                      </div>

                      <BuilderQuestionCard
                        C={C}
                        tone="accent"
                        question="Capacity"
                        helper="Optional maximum number of enrolled students."
                      >
                        <input
                          type="number"
                          min={1}
                          value={editable.capacity}
                          onChange={(e) =>
                            setEditable((prev) =>
                              prev ? { ...prev, capacity: e.target.value } : prev,
                            )
                          }
                          placeholder="Optional"
                          style={inputStyle(C)}
                        />
                      </BuilderQuestionCard>

                      {!isNew && selectedProgram ? (
                        <p className="text-xs" style={{ color: C.textTertiary }}>
                          {programTypeLabel(selectedProgram.type)} · Updated{" "}
                          {new Date(selectedProgram.updated_at).toLocaleDateString()}
                        </p>
                      ) : null}

                      <AdminSaveStateBar theme={theme}>
                        Next, link this program on{" "}
                        <Link
                          href={flowsPath}
                          className="font-extrabold underline-offset-2 hover:underline"
                          style={{ color: "#487354" }}
                        >
                          Enrollment Flows
                        </Link>
                        .
                      </AdminSaveStateBar>
                    </>
                  ) : (
                    <ProgramParentPortalSettingsCard
                      C={C}
                      theme={theme}
                      branding={branding}
                      organizationId={organizationId}
                      programName={editable.name}
                      orgFeatures={orgFeatures}
                      schoolSlug={slug}
                      schoolName={branding.logo.alt || slug}
                      portalSlug={selectedProgram?.portal_slug ?? null}
                      editor={editable.parentPortalEditor}
                      onChange={(parentPortalEditor) =>
                        setEditable((prev) =>
                          prev ? { ...prev, parentPortalEditor } : prev,
                        )
                      }
                    />
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ConfirmDialog
        C={C}
        open={deleteOpen}
        title="Delete program?"
        description="This cannot be undone. Programs linked to applications cannot be deleted."
        confirmLabel="Delete program"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => {
          if (!deleting) setDeleteOpen(false);
        }}
      />
    </EnrollmentFlowsStoryShell>
  );
}
