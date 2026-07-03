"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Eye, Loader2, Save, Send } from "lucide-react";
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
  type ApplicationFormFeeConfig,
  type ApplicationFormSchema,
  type ApplicationFormVersion,
} from "@/lib/admissions/application-form-schema";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";
import ApplicationFormFocusCanvas from "./ApplicationFormFocusCanvas";
import ApplicationFormList, { StatusBadge } from "./ApplicationFormList";
import ApplicationFormOutline from "./ApplicationFormOutline";
import ApplicationFormPreview from "./ApplicationFormPreview";
import {
  DEFAULT_BUILDER_FOCUS,
  type BuilderFocus,
} from "./builder-focus";

type ApplicationFormsPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  schoolName: string;
  slug: string;
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

function sanitizeFocus(
  focus: BuilderFocus,
  schema: ApplicationFormSchema,
): BuilderFocus {
  if (focus.kind === "step" || focus.kind === "field") {
    const step = schema.sections.find((s) => s.id === focus.stepId);
    if (!step) return DEFAULT_BUILDER_FOCUS;
    if (focus.kind === "field") {
      const field = step.fields.find((f) => f.id === focus.fieldId);
      if (!field) return { kind: "step", stepId: step.id };
    }
  }
  return focus;
}

export default function ApplicationFormsPage({
  organizationId,
  branding,
  schoolName,
  slug,
}: ApplicationFormsPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);

  const [forms, setForms] = useState<ApplicationFormVersion[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editable, setEditable] = useState<EditableFormState | null>(null);
  const [focus, setFocus] = useState<BuilderFocus>(DEFAULT_BUILDER_FOCUS);
  const [previewOpen, setPreviewOpen] = useState(false);
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
    const next = toEditableState(selectedForm);
    setEditable(next);
    setFocus(DEFAULT_BUILDER_FOCUS);
  }, [selectedForm?.id, selectedForm?.updated_at, selectedForm?.status]);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const created = await createDraftForm(supabase, organizationId);
      setForms((prev) => [created, ...prev]);
      setSelectedId(created.id);
      setFocus(DEFAULT_BUILDER_FOCUS);
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
      setFocus(DEFAULT_BUILDER_FOCUS);
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

  const updateSchema = (
    updater: (schema: ApplicationFormSchema) => ApplicationFormSchema,
  ) => {
    setEditable((prev) => {
      if (!prev) return prev;
      const schema = updater(prev.schema);
      setFocus((current) => sanitizeFocus(current, schema));
      return { ...prev, schema };
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
    setFocus({ kind: "step", stepId: section.id });
  };

  const deleteStep = (stepId: string) => {
    updateSchema((schema) => ({
      ...schema,
      sections: schema.sections.filter((s) => s.id !== stepId),
    }));
    setFocus(DEFAULT_BUILDER_FOCUS);
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
              <p
                className="truncate text-base font-semibold"
                style={{ color: C.textPrimary }}
              >
                {editable.title || "Untitled form"}
              </p>
              <div
                className="mt-1 flex flex-wrap items-center gap-2 text-[11px]"
                style={{ color: C.textTertiary }}
              >
                <StatusBadge C={C} status={selectedForm.status} />
                <span>Version {selectedForm.version}</span>
                <span>Updated {formatFormUpdatedAt(selectedForm.updated_at)}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold"
                style={{
                  border: `1px solid ${C.border}`,
                  color: C.textSecondary,
                  backgroundColor: C.bg,
                }}
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </button>
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

          <div className="flex flex-1 overflow-hidden">
            <ApplicationFormOutline
              C={C}
              sections={editable.schema.sections}
              focus={focus}
              readOnly={readOnly}
              onFocusChange={setFocus}
              onReorderSteps={(sections) =>
                updateSchema((schema) => ({ ...schema, sections }))
              }
              onAddStep={addStep}
              onPreview={() => setPreviewOpen(true)}
            />

            <ApplicationFormFocusCanvas
              C={C}
              focus={focus}
              editable={editable}
              programs={programs}
              readOnly={readOnly}
              onFocusChange={setFocus}
              onEditableChange={(patch) =>
                setEditable((prev) => (prev ? { ...prev, ...patch } : prev))
              }
              onUpdateSchema={updateSchema}
              onDeleteStep={deleteStep}
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
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        branding={branding}
        schoolName={schoolName}
        slug={slug}
        title={editable?.title ?? selectedForm?.title ?? "Application"}
        intro={
          editable?.intro.trim()
            ? editable.intro
            : selectedForm?.intro ?? null
        }
        schema={
          editable?.schema ??
          selectedForm?.schema ?? { sections: [], acknowledgments: [] }
        }
        feeConfig={
          editable?.feeConfig ??
          selectedForm?.fee_config ?? { enabled: false }
        }
      />
    </div>
  );
}
