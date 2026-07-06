"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Eye, EyeOff, Link2, Loader2, Save, Send } from "lucide-react";
import {
  createApplyForm,
  duplicateForm,
  isApplyFormSlug,
  isPublicSlugAvailable,
  listApplicationForms,
  listPrograms,
  publicApplicationFormPath,
  publishForm,
  unpublishForm,
  updateApplicationForm,
  type ProgramOption,
} from "@/lib/admissions/application-forms";
import {
  createEnrollmentChecklistTemplate,
  listEnrollmentChecklistTemplates,
  type EnrollmentChecklistTemplate,
} from "@/lib/admissions/enrollment-checklist-templates";
import { orgPaymentsReadyForFees } from "@/lib/stripe/organization-payment-account";
import {
  emptyApplicationSection,
  formatFormUpdatedAt,
  normalizePublicSlug,
  validateApplicationFormSchema,
  validatePublicSlug,
  type ApplicationFormFeeConfig,
  type ApplicationFormSchema,
  type ApplicationFormVersion,
} from "@/lib/admissions/application-form-schema";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";
import ApplicationFormFocusCanvas from "./ApplicationFormFocusCanvas";
import ApplicationFormList, {
  type FlowListSelection,
} from "./ApplicationFormList";
import { StatusBadge } from "./ApplicationFormListBadges";
import ApplicationFormOutline from "./ApplicationFormOutline";
import ApplicationFormPreview from "./ApplicationFormPreview";
import EnrollmentChecklistStubEditor from "./EnrollmentChecklistStubEditor";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
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
  publicSlug: string;
  schema: ApplicationFormSchema;
  feeConfig: ApplicationFormFeeConfig;
};

function toEditableState(form: ApplicationFormVersion): EditableFormState {
  return {
    title: form.title,
    intro: form.intro ?? "",
    programId: form.program_id,
    publicSlug: form.public_slug ?? "",
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
  const [checklists, setChecklists] = useState<EnrollmentChecklistTemplate[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [selection, setSelection] = useState<FlowListSelection>(null);
  const [editable, setEditable] = useState<EditableFormState | null>(null);
  const [focus, setFocus] = useState<BuilderFocus>(DEFAULT_BUILDER_FOCUS);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedPulse, setSavedPulse] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [setupHighlight, setSetupHighlight] = useState<"publicSlug" | null>(null);
  const [unpublishOpen, setUnpublishOpen] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [stripePaymentsReady, setStripePaymentsReady] = useState(true);

  const selectedForm =
    selection?.kind === "apply"
      ? (forms.find((f) => f.id === selection.id) ?? null)
      : null;
  const selectedChecklist =
    selection?.kind === "checklist"
      ? (checklists.find((c) => c.id === selection.id) ?? null)
      : null;
  const hasApplyForm = forms.some(
    (form) => isApplyFormSlug(form.public_slug) && form.status !== "archived",
  );
  const hasEnrollmentChecklist = checklists.some(
    (checklist) => checklist.status !== "archived",
  );
  const isApplyFormSelected = isApplyFormSlug(selectedForm?.public_slug);
  const isArchived = selectedForm?.status === "archived";
  const isDraft = selectedForm?.status === "draft";
  const isPublished = selectedForm?.status === "published";
  const readOnly = isArchived;
  const publishedPublicUrl =
    isPublished && selectedForm.public_slug
      ? publicApplicationFormPath(slug, selectedForm.public_slug)
      : null;

  const loadForms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [formRows, checklistRows, programRows, paymentsReady] = await Promise.all([
        listApplicationForms(supabase, organizationId),
        listEnrollmentChecklistTemplates(supabase, organizationId),
        listPrograms(supabase, organizationId),
        orgPaymentsReadyForFees(supabase, organizationId),
      ]);
      setForms(formRows);
      setChecklists(checklistRows);
      setPrograms(programRows);
      setStripePaymentsReady(paymentsReady);
      setSelection((prev) => {
        if (
          prev?.kind === "apply" &&
          formRows.some((form) => form.id === prev.id)
        ) {
          return prev;
        }
        if (
          prev?.kind === "checklist" &&
          checklistRows.some((checklist) => checklist.id === prev.id)
        ) {
          return prev;
        }
        if (formRows[0]) return { kind: "apply", id: formRows[0].id };
        if (checklistRows[0]) return { kind: "checklist", id: checklistRows[0].id };
        return null;
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
    setSetupHighlight(null);
  }, [selectedForm?.id, selectedForm?.updated_at, selectedForm?.status]);

  const focusSlugSetup = (errorMessage: string) => {
    setFocus({ kind: "setup" });
    setSetupHighlight("publicSlug");
    setError(errorMessage);
  };

  const isSlugRelatedError = (message: string) =>
    /slug/i.test(message);

  const handleEditableChange = (patch: Partial<EditableFormState>) => {
    if ("publicSlug" in patch) {
      setSetupHighlight(null);
      setError(null);
    }
    setEditable((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const buildSaveInput = () => {
    if (!editable) return null;
    return {
      title: editable.title,
      intro: editable.intro.trim() || null,
      program_id: editable.programId,
      public_slug: editable.publicSlug.trim()
        ? normalizePublicSlug(editable.publicSlug)
        : null,
      schema: editable.schema,
      fee_config: editable.feeConfig,
    };
  };

  const validateSlugForSave = async (): Promise<boolean> => {
    if (!selectedForm || !editable) return false;

    const slugValue = editable.publicSlug.trim()
      ? editable.publicSlug
      : isPublished
        ? selectedForm.public_slug
        : null;

    if (isPublished && !slugValue) {
      focusSlugSetup("A public URL slug is required for published forms.");
      return false;
    }

    const slugError = slugValue ? validatePublicSlug(slugValue) : null;
    if (slugError) {
      focusSlugSetup(slugError);
      return false;
    }

    if (slugValue) {
      const normalized = normalizePublicSlug(slugValue);
      const available = await isPublicSlugAvailable(
        supabase,
        organizationId,
        normalized,
        selectedForm.id,
      );
      if (!available) {
        focusSlugSetup(`The slug "${normalized}" is already used by another form.`);
        return false;
      }
    }

    return true;
  };

  const handleCreateApply = async () => {
    setCreating(true);
    setError(null);
    try {
      const created = await createApplyForm(supabase, organizationId);
      setForms((prev) => [created, ...prev]);
      setSelection({ kind: "apply", id: created.id });
      setFocus(DEFAULT_BUILDER_FOCUS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create apply form.");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateChecklist = async () => {
    setCreating(true);
    setError(null);
    try {
      const created = await createEnrollmentChecklistTemplate(supabase, organizationId);
      setChecklists((prev) => [created, ...prev]);
      setSelection({ kind: "checklist", id: created.id });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create enrollment checklist.",
      );
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
      setSelection({ kind: "apply", id: copy.id });
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

    const slugOk = await validateSlugForSave();
    if (!slugOk) return;

    const saveInput = buildSaveInput();
    if (!saveInput) return;

    setSaving(true);
    setError(null);
    try {
      const updated = await updateApplicationForm(supabase, selectedForm.id, saveInput);
      setForms((prev) =>
        prev.map((f) => (f.id === updated.id ? updated : f)),
      );
      setSavedPulse(true);
      setTimeout(() => setSavedPulse(false), 1500);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save form.";
      if (isSlugRelatedError(message)) {
        focusSlugSetup(message);
      } else {
        setError(message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedForm || !isDraft) return;

    const validationErrors = validateApplicationFormSchema(
      editable?.schema ?? selectedForm.schema,
    );
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    const slugError = validatePublicSlug(editable?.publicSlug ?? selectedForm.public_slug);
    if (slugError) {
      focusSlugSetup(slugError);
      return;
    }

    const normalized = normalizePublicSlug(
      editable?.publicSlug ?? selectedForm.public_slug ?? "",
    );
    const available = await isPublicSlugAvailable(
      supabase,
      organizationId,
      normalized,
      selectedForm.id,
    );
    if (!available) {
      focusSlugSetup(`The slug "${normalized}" is already used by another form.`);
      return;
    }

    setPublishing(true);
    setSetupHighlight(null);
    setError(null);
    try {
      const saveInput = buildSaveInput();
      if (saveInput) {
        await updateApplicationForm(supabase, selectedForm.id, saveInput);
      }
      const published = await publishForm(supabase, selectedForm.id);
      await loadForms();
      setSelection({ kind: "apply", id: published.id });
      setSetupHighlight(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to publish form.";
      if (isSlugRelatedError(message)) {
        focusSlugSetup(message);
      } else {
        setError(message);
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!selectedForm || !isPublished) return;

    setUnpublishing(true);
    setError(null);
    try {
      const unpublished = await unpublishForm(supabase, selectedForm.id);
      setForms((prev) =>
        prev.map((f) => (f.id === unpublished.id ? unpublished : f)),
      );
      setUnpublishOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unpublish form.");
    } finally {
      setUnpublishing(false);
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

  const handleCopyPublicLink = async () => {
    if (!publishedPublicUrl) return;
    const absoluteUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${publishedPublicUrl}`
        : publishedPublicUrl;
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1500);
    } catch {
      setError("Could not copy link to clipboard.");
    }
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
        checklists={checklists}
        selected={selection}
        creating={creating}
        hasApplyForm={hasApplyForm}
        hasEnrollmentChecklist={hasEnrollmentChecklist}
        onSelect={setSelection}
        onCreateApply={handleCreateApply}
        onCreateChecklist={handleCreateChecklist}
      />

      {selectedChecklist ? (
        <EnrollmentChecklistStubEditor
          branding={branding}
          template={selectedChecklist}
        />
      ) : selectedForm && editable ? (
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
              {publishedPublicUrl ? (
                <button
                  type="button"
                  onClick={handleCopyPublicLink}
                  className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold"
                  style={{
                    border: `1px solid ${C.border}`,
                    color: copiedLink ? C.success : C.textSecondary,
                    backgroundColor: copiedLink ? C.successBg : C.bg,
                  }}
                >
                  <Link2 className="h-3.5 w-3.5" />
                  {copiedLink ? "Copied" : "Copy link"}
                </button>
              ) : null}
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
                !isApplyFormSelected ? (
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
                    Duplicate
                  </button>
                ) : null
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
                    {savedPulse ? "Saved" : isPublished ? "Save" : "Save draft"}
                  </button>
                  {isPublished ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setUnpublishOpen(true)}
                        className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold"
                        style={{
                          border: `1px solid ${C.errorBorder}`,
                          color: C.error,
                          backgroundColor: C.errorBg,
                        }}
                      >
                        <EyeOff className="h-3.5 w-3.5" />
                        Unpublish
                      </button>
                      {!isApplyFormSelected ? (
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
                          Duplicate
                        </button>
                      ) : null}
                    </>
                  ) : (
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
                  )}
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
              orgSlug={slug}
              readOnly={readOnly}
              setupHighlight={setupHighlight}
              slugError={setupHighlight === "publicSlug" ? error : null}
              stripePaymentsReady={stripePaymentsReady}
              onFocusChange={setFocus}
              onEditableChange={handleEditableChange}
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
        publicSlug={
          editable?.publicSlug.trim()
            ? normalizePublicSlug(editable.publicSlug)
            : selectedForm?.public_slug ?? null
        }
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

      <ConfirmDialog
        C={C}
        open={unpublishOpen}
        title="Unpublish this form?"
        description={
          publishedPublicUrl
            ? `Families will no longer be able to access it at ${publishedPublicUrl} until you publish again.`
            : "Families will no longer be able to access this form until you publish again."
        }
        confirmLabel="Unpublish"
        variant="destructive"
        loading={unpublishing}
        onConfirm={handleUnpublish}
        onClose={() => !unpublishing && setUnpublishOpen(false)}
      />
    </div>
  );
}
