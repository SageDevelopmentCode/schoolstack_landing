"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Reorder } from "framer-motion";
import { Copy, Layers, Loader2, Save, Send } from "lucide-react";
import {
  createDraftForm,
  duplicateForm,
  listApplicationForms,
  listPrograms,
  publishForm,
  updateDraftForm,
  type ProgramOption,
} from "@/lib/admissions/application-forms";
import {
  emptyApplicationSection,
  formatFormUpdatedAt,
  validateApplicationFormSchema,
  type ApplicationField,
  type ApplicationFormFeeConfig,
  type ApplicationFormSchema,
  type ApplicationFormVersion,
} from "@/lib/admissions/application-form-schema";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";
import ApplicationFormAcknowledgmentsEditor from "./ApplicationFormAcknowledgmentsEditor";
import ApplicationFormFeePanel from "./ApplicationFormFeePanel";
import ApplicationFormList, { StatusBadge } from "./ApplicationFormList";
import ApplicationFormPreview from "./ApplicationFormPreview";
import ApplicationFormSectionEditor, {
  AddSectionButton,
} from "./ApplicationFormSectionEditor";

type ApplicationFormsPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
};

type EditableFormState = {
  title: string;
  intro: string;
  programId: string | null;
  schema: ApplicationFormSchema;
  feeConfig: ApplicationFormFeeConfig;
};

function toEditableState(form: ApplicationFormVersion): EditableFormState {
  return {
    title: form.title,
    intro: form.intro ?? "",
    programId: form.program_id,
    schema: {
      sections: form.schema.sections.map((section) => ({
        ...section,
        fields: section.fields.map((field) => ({
          ...field,
          options: field.options ? [...field.options] : undefined,
        })),
      })),
      acknowledgments: form.schema.acknowledgments.map((ack) => ({ ...ack })),
    },
    feeConfig: { ...form.fee_config },
  };
}

export default function ApplicationFormsPage({
  organizationId,
  branding,
}: ApplicationFormsPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);

  const [forms, setForms] = useState<ApplicationFormVersion[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editable, setEditable] = useState<EditableFormState | null>(null);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [previewStepId, setPreviewStepId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedPulse, setSavedPulse] = useState(false);

  const selectedForm = forms.find((f) => f.id === selectedId) ?? null;
  const readOnly = selectedForm?.status !== "draft";

  const loadForms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [formRows, programRows] = await Promise.all([
        listApplicationForms(supabase, organizationId),
        listPrograms(supabase, organizationId),
      ]);
      setForms(formRows);
      setPrograms(programRows);
      setSelectedId((prev) => {
        if (prev && formRows.some((f) => f.id === prev)) return prev;
        return formRows[0]?.id ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load forms.");
    } finally {
      setLoading(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  useEffect(() => {
    if (!selectedForm) {
      setEditable(null);
      return;
    }
    setEditable(toEditableState(selectedForm));
    setExpandedStepId(null);
  }, [selectedForm?.id, selectedForm?.updated_at, selectedForm?.status]);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const created = await createDraftForm(supabase, organizationId);
      setForms((prev) => [created, ...prev]);
      setSelectedId(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create form.");
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async () => {
    if (!selectedForm) return;
    setCreating(true);
    setError(null);
    try {
      const copy = await duplicateForm(supabase, selectedForm.id);
      setForms((prev) => [copy, ...prev]);
      setSelectedId(copy.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to duplicate form.");
    } finally {
      setCreating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedForm || !editable || readOnly) return;

    const validationErrors = validateApplicationFormSchema(editable.schema);
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await updateDraftForm(supabase, selectedForm.id, {
        title: editable.title,
        intro: editable.intro.trim() || null,
        program_id: editable.programId,
        schema: editable.schema,
        fee_config: editable.feeConfig,
      });
      setForms((prev) =>
        prev.map((f) => (f.id === updated.id ? updated : f)),
      );
      setSavedPulse(true);
      setTimeout(() => setSavedPulse(false), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save form.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedForm || readOnly) return;

    const validationErrors = validateApplicationFormSchema(
      editable?.schema ?? selectedForm.schema,
    );
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    setPublishing(true);
    setError(null);
    try {
      if (editable) {
        await updateDraftForm(supabase, selectedForm.id, {
          title: editable.title,
          intro: editable.intro.trim() || null,
          program_id: editable.programId,
          schema: editable.schema,
          fee_config: editable.feeConfig,
        });
      }
      const published = await publishForm(supabase, selectedForm.id);
      await loadForms();
      setSelectedId(published.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish form.");
    } finally {
      setPublishing(false);
    }
  };

  const updateSchema = (updater: (schema: ApplicationFormSchema) => ApplicationFormSchema) => {
    setEditable((prev) => {
      if (!prev) return prev;
      return { ...prev, schema: updater(prev.schema) };
    });
  };

  const addStep = () => {
    const section = emptyApplicationSection(
      `Step ${(editable?.schema.sections.length ?? 0) + 1}`,
    );
    updateSchema((schema) => ({
      ...schema,
      sections: [...schema.sections, section],
    }));
    setExpandedStepId(section.id);
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.sm,
    fontSize: "13px",
    padding: "8px 10px",
    width: "100%",
    boxSizing: "border-box",
  };

  if (loading) {
    return (
      <div
        className="flex h-full items-center justify-center gap-2 text-sm"
        style={{ color: C.textSecondary }}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading application forms…
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden" style={{ backgroundColor: C.bg }}>
      <ApplicationFormList
        C={C}
        forms={forms}
        selectedId={selectedId}
        creating={creating}
        onSelect={setSelectedId}
        onCreate={handleCreate}
      />

      {selectedForm && editable ? (
        <div
          className="flex flex-1 flex-col overflow-hidden"
          style={{ backgroundColor: C.surface }}
        >
          <div
            className="flex flex-shrink-0 flex-wrap items-center gap-3 border-b px-5 py-3"
            style={{ borderColor: C.border }}
          >
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={editable.title}
                disabled={readOnly}
                onChange={(e) =>
                  setEditable((prev) =>
                    prev ? { ...prev, title: e.target.value } : prev,
                  )
                }
                className="w-full text-base font-semibold outline-none bg-transparent"
                style={{ color: C.textPrimary }}
              />
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]" style={{ color: C.textTertiary }}>
                <StatusBadge C={C} status={selectedForm.status} />
                <span>Version {selectedForm.version}</span>
                <span>Updated {formatFormUpdatedAt(selectedForm.updated_at)}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {readOnly ? (
                <button
                  type="button"
                  onClick={handleDuplicate}
                  disabled={creating}
                  className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold"
                  style={{
                    border: `1px solid ${C.border}`,
                    color: C.textSecondary,
                    backgroundColor: C.bg,
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Duplicate to edit
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold"
                    style={{
                      border: `1px solid ${C.secondaryBtnBorder}`,
                      color: C.accent,
                      backgroundColor: savedPulse ? C.successBg : C.accentLight,
                    }}
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    {savedPulse ? "Saved" : "Save draft"}
                  </button>
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={publishing}
                    className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold text-white"
                    style={{ backgroundColor: C.accent }}
                  >
                    {publishing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    Publish
                  </button>
                </>
              )}
            </div>
          </div>

          {error && (
            <div
              className="mx-5 mt-3 rounded-md px-3 py-2 text-xs"
              style={{
                backgroundColor: C.errorBg,
                color: C.error,
                border: `1px solid ${C.errorBorder}`,
              }}
            >
              {error}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  className="mb-1 block text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: C.textTertiary }}
                >
                  Intro paragraph (optional)
                </label>
                <textarea
                  rows={3}
                  value={editable.intro}
                  disabled={readOnly}
                  onChange={(e) =>
                    setEditable((prev) =>
                      prev ? { ...prev, intro: e.target.value } : prev,
                    )
                  }
                  placeholder="Shown on the first screen of the apply flow"
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
              <div>
                <label
                  className="mb-1 block text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: C.textTertiary }}
                >
                  Program (optional)
                </label>
                <select
                  value={editable.programId ?? ""}
                  disabled={readOnly}
                  onChange={(e) =>
                    setEditable((prev) =>
                      prev
                        ? {
                            ...prev,
                            programId: e.target.value || null,
                          }
                        : prev,
                    )
                  }
                  style={inputStyle}
                >
                  <option value="">All programs (org default)</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[10px]" style={{ color: C.textTertiary }}>
                  Only one published form per program scope. Use different programs
                  to run multiple live application forms.
                </p>
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <Layers className="h-4 w-4" style={{ color: C.accent }} />
                <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  Form steps
                </span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                  style={{ backgroundColor: C.accentLight, color: C.accent }}
                >
                  {editable.schema.sections.length}
                </span>
              </div>
              <p className="mb-4 text-[11px]" style={{ color: C.textTertiary }}>
                Families complete these pages in order. Each step is one screen of
                questions.
              </p>

              {editable.schema.sections.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center rounded-sm py-10"
                  style={{ border: `2px dashed ${C.border}`, color: C.textTertiary }}
                >
                  <p className="mb-3 text-[11px]">No form steps yet.</p>
                  {!readOnly && <AddSectionButton C={C} onClick={addStep} />}
                </div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={editable.schema.sections}
                  onReorder={(sections) =>
                    !readOnly &&
                    updateSchema((schema) => ({ ...schema, sections }))
                  }
                  className="flex flex-col"
                  as="div"
                >
                  {editable.schema.sections.map((step, stepIdx) => (
                    <ApplicationFormSectionEditor
                      key={step.id}
                      C={C}
                      step={step}
                      stepIdx={stepIdx}
                      totalSteps={editable.schema.sections.length}
                      isExpanded={expandedStepId === step.id}
                      readOnly={readOnly}
                      onToggleExpand={() =>
                        setExpandedStepId((prev) =>
                          prev === step.id ? null : step.id,
                        )
                      }
                      onPreview={() => setPreviewStepId(step.id)}
                      updateStepTitle={(stepId, title) =>
                        updateSchema((schema) => ({
                          ...schema,
                          sections: schema.sections.map((s) =>
                            s.id === stepId ? { ...s, title } : s,
                          ),
                        }))
                      }
                      updateStepDescription={(stepId, description) =>
                        updateSchema((schema) => ({
                          ...schema,
                          sections: schema.sections.map((s) =>
                            s.id === stepId ? { ...s, description } : s,
                          ),
                        }))
                      }
                      deleteStep={(stepId) =>
                        updateSchema((schema) => ({
                          ...schema,
                          sections: schema.sections.filter((s) => s.id !== stepId),
                        }))
                      }
                      addField={(stepId, field) =>
                        updateSchema((schema) => ({
                          ...schema,
                          sections: schema.sections.map((s) =>
                            s.id === stepId
                              ? { ...s, fields: [...s.fields, field] }
                              : s,
                          ),
                        }))
                      }
                      updateField={(stepId, fieldId, patch) =>
                        updateSchema((schema) => ({
                          ...schema,
                          sections: schema.sections.map((s) =>
                            s.id === stepId
                              ? {
                                  ...s,
                                  fields: s.fields.map((f) =>
                                    f.id === fieldId ? { ...f, ...patch } : f,
                                  ),
                                }
                              : s,
                          ),
                        }))
                      }
                      deleteField={(stepId, fieldId) =>
                        updateSchema((schema) => ({
                          ...schema,
                          sections: schema.sections.map((s) =>
                            s.id === stepId
                              ? {
                                  ...s,
                                  fields: s.fields.filter((f) => f.id !== fieldId),
                                }
                              : s,
                          ),
                        }))
                      }
                      setStepFieldsOrder={(stepId, fields) =>
                        updateSchema((schema) => ({
                          ...schema,
                          sections: schema.sections.map((s) =>
                            s.id === stepId ? { ...s, fields } : s,
                          ),
                        }))
                      }
                    />
                  ))}
                </Reorder.Group>
              )}

              {!readOnly && editable.schema.sections.length > 0 && (
                <AddSectionButton C={C} onClick={addStep} />
              )}
            </div>

            <ApplicationFormFeePanel
              C={C}
              feeConfig={editable.feeConfig}
              readOnly={readOnly}
              onChange={(feeConfig) =>
                setEditable((prev) => (prev ? { ...prev, feeConfig } : prev))
              }
            />

            <ApplicationFormAcknowledgmentsEditor
              C={C}
              acknowledgments={editable.schema.acknowledgments}
              readOnly={readOnly}
              onChange={(acknowledgments) =>
                updateSchema((schema) => ({ ...schema, acknowledgments }))
              }
            />
          </div>
        </div>
      ) : (
        <div
          className="flex flex-1 items-center justify-center text-sm"
          style={{ color: C.textSecondary }}
        >
          Select or create an application form to begin.
        </div>
      )}

      <ApplicationFormPreview
        C={C}
        title={editable?.title ?? selectedForm?.title ?? "Application"}
        intro={editable?.intro ?? selectedForm?.intro ?? null}
        schema={editable?.schema ?? selectedForm?.schema ?? { sections: [], acknowledgments: [] }}
        open={previewStepId !== null}
        initialStepId={previewStepId}
        onClose={() => setPreviewStepId(null)}
      />
    </div>
  );
}
