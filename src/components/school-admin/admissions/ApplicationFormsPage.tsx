"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Save, Send } from "lucide-react";
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
  applySystemSchemaChanged,
  ensureApplySystemSchema,
  isSystemSection,
  validateApplySystemSchema,
} from "@/lib/admissions/apply-system-fields";
import {
  createEnrollmentChecklistTemplate,
  getEnrollmentChecklistWithItems,
  listEnrollmentChecklistTemplates,
  publishEnrollmentChecklistTemplate,
  saveEnrollmentChecklistItems,
  unpublishEnrollmentChecklistTemplate,
  updateEnrollmentChecklistTemplate,
  validateEnrollmentChecklistItems,
  ensureUniqueChecklistItemKeys,
  hasDuplicateChecklistItemKeys,
  type EnrollmentChecklistTemplate,
} from "@/lib/admissions/enrollment-checklist-templates";
import {
  summarizeEnrollmentDocumentChanges,
  type EnrollmentDocumentChange,
} from "@/lib/admissions/enrollment-checklist-document-changes";
import type { EnrollmentChecklistItem } from "@/lib/admissions/enrollment-checklist-schema";
import { buildChecklistPreviewItems } from "@/lib/admissions/enrollment-checklist-variants";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { orgPaymentsReadyForFees } from "@/lib/stripe/organization-payment-account";
import {
  emptyApplicationSection,
  normalizeApplicationFormNotificationConfig,
  normalizePublicSlug,
  validateApplicationFormNotificationConfig,
  validateApplicationFormSchema,
  validatePublicSlug,
  type ApplicationFormSchema,
  type ApplicationFormVersion,
} from "@/lib/admissions/application-form-schema";
import { buildAdminThemeTokens, type AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";
import AdmissionsFamilyAccessGuideButton from "./AdmissionsFamilyAccessGuide";
import ApplicationFormEditorToolbar from "./ApplicationFormEditorToolbar";
import ChecklistProgramDropdown from "./ChecklistProgramDropdown";
import ApplicationFormFocusCanvas from "./ApplicationFormFocusCanvas";
import EnrollmentFlowsSidebar from "./EnrollmentFlowsSidebar";
import EnrollmentFlowsEmptyState from "./EnrollmentFlowsEmptyState";
import type { FlowListSelection } from "./enrollment-flow-selection";
import { StatusIcon } from "./ApplicationFormListBadges";
import ApplicationFormOutline from "./ApplicationFormOutline";
import ApplicationFormPreview from "./ApplicationFormPreview";
import ChecklistPreviewMenuButton from "./ChecklistPreviewMenuButton";
import EnrollmentChecklistBuilder from "./EnrollmentChecklistBuilder";
import EnrollmentChecklistPreview from "./EnrollmentChecklistPreview";
import EnrollmentChecklistResignConfirmDialog from "./EnrollmentChecklistResignConfirmDialog";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import {
  SchoolAdminCanvasSkeleton,
  SchoolAdminSplitPaneSkeleton,
} from "@/components/school-admin/skeletons";
import {
  DEFAULT_BUILDER_FOCUS,
  type BuilderFocus,
} from "./builder-focus";
import {
  isUnexpectedOperationalError,
  parseOperationalError,
  reportClientOperationalError,
} from "@/lib/operational-errors-client";
import {
  serializeChecklistEditableState,
  serializeEditableFormState,
  type ChecklistEditableSnapshot,
  type EditableFormSnapshot,
} from "@/lib/admissions/editable-snapshots";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";

type ApplicationFormsPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  schoolName: string;
  slug: string;
};

type EditableFormState = EditableFormSnapshot;

type ChecklistEditableState = ChecklistEditableSnapshot;

type PendingChecklistAction = "save" | "publish";

function parseChecklistSavedSnapshot(
  snapshot: string | null,
): ChecklistEditableState | null {
  if (!snapshot) return null;
  try {
    return JSON.parse(snapshot) as ChecklistEditableState;
  } catch {
    return null;
  }
}

async function requestEnrollmentAgreementResignForChanges(
  templateId: string,
  documentChanges: EnrollmentDocumentChange[],
  message?: string,
): Promise<void> {
  for (const change of documentChanges) {
    if (!change.documentTemplateId) continue;

    const response = await fetch(
      `/api/admissions/enrollment-checklist-templates/${templateId}/request-resign`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentTemplateId: change.documentTemplateId,
          sectionIds: change.changedSections.map((section) => section.sectionId),
          message,
        }),
      },
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      throw new Error(payload?.error ?? "Failed to request enrollment agreement re-sign.");
    }
  }
}

function isPaymentsSetupError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("connect stripe") ||
    normalized.includes("payments before publishing")
  );
}

function PaymentsSetupErrorMessage({
  message,
  orgSlug,
  C,
}: {
  message: string;
  orgSlug: string;
  C: AdminThemeTokens;
}) {
  if (!isPaymentsSetupError(message)) {
    return <>{message}</>;
  }

  return (
    <>
      {message}{" "}
      <Link
        href={schoolAdminPath(orgSlug, "admissions", "payments")}
        className="font-medium underline underline-offset-2"
        style={{ color: C.accent }}
      >
        Set up payments
      </Link>
    </>
  );
}

function cloneChecklistItems(items: EnrollmentChecklistItem[]): EnrollmentChecklistItem[] {
  return items.map((item) => ({
    ...item,
    metadata: { ...item.metadata },
    document: item.document
      ? item.document.kind === "pdf"
        ? { ...item.document }
        : {
            ...item.document,
            sections: item.document.sections.map((section) => ({ ...section })),
            consentOptions: item.document.consentOptions?.map((option) => ({
              ...option,
            })),
          }
      : undefined,
    formSchema: item.formSchema
      ? {
          ...item.formSchema,
          fields: item.formSchema.fields.map((field) => ({
            ...field,
            options: field.options ? [...field.options] : undefined,
          })),
        }
      : undefined,
    fileUpload: item.fileUpload ? { ...item.fileUpload } : undefined,
    payment: item.payment
      ? {
          ...item.payment,
          lineItems: item.payment.lineItems?.map((lineItem) => ({ ...lineItem })),
        }
      : undefined,
    acknowledgment: item.acknowledgment
      ? {
          ...item.acknowledgment,
          options: item.acknowledgment.options?.map((option) => ({ ...option })),
        }
      : undefined,
  }));
}

function formatSupabaseError(err: unknown, fallback: string): string {
  const parsed = parseOperationalError(err);
  return parsed.message === "Unknown error" ? fallback : parsed.message;
}

async function reportChecklistOperationalError(
  organizationId: string,
  operation: string,
  checklistId: string,
  err: unknown,
) {
  const parsed = parseOperationalError(err);
  await reportClientOperationalError({
    organizationId,
    operation,
    error: parsed.message,
    code: parsed.code,
    details: parsed.details,
    entityType: "enrollment_checklist_template",
    entityId: checklistId,
    notify: isUnexpectedOperationalError(err),
  });
}

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
    postSubmitConfig: {
      actions: form.post_submit_config.actions.map((action) => ({ ...action })),
    },
    notificationConfig: normalizeApplicationFormNotificationConfig({
      submission_notify_emails: [
        ...form.notification_config.submission_notify_emails,
      ],
      draft_reminders: { ...form.notification_config.draft_reminders },
    }),
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

function EnrollmentChecklistProgramGate({
  C,
  slug,
  programs,
  programId,
  onProgramChange,
}: {
  C: AdminThemeTokens;
  slug: string;
  programs: ProgramOption[];
  programId: string | null;
  onProgramChange: (programId: string | null) => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
      {programs.length === 0 ? (
        <div className="max-w-sm">
          <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
            Create a program first
          </p>
          <p className="mt-1 text-xs" style={{ color: C.textSecondary }}>
            You need at least one program before setting up this enrollment checklist.
          </p>
          <a
            href={schoolAdminPath(slug, "admissions", "programs")}
            className="mt-4 inline-flex rounded-sm px-4 py-2 text-xs font-semibold text-white"
            style={{ backgroundColor: C.accent }}
          >
            Go to Programs
          </a>
        </div>
      ) : (
        <div className="max-w-sm">
          <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
            Select a program
          </p>
          <p className="mt-1 text-xs" style={{ color: C.textSecondary }}>
            Choose a program before adding checklist items.
          </p>
          <SchoolAdminSelect
            C={C}
            value={programId ?? ""}
            onChange={(value) => onProgramChange(value || null)}
            options={programs.map((program) => ({
              value: program.id,
              label: program.name,
            }))}
            placeholder="Select a program"
            ariaLabel="Program"
            className="mt-4 w-full max-w-xs"
            triggerClassName="text-xs font-medium"
          />
        </div>
      )}
    </div>
  );
}

function resolveFlowSelection(
  formRows: ApplicationFormVersion[],
  checklistRows: EnrollmentChecklistTemplate[],
  flowParam: string | null,
  previous: FlowListSelection,
): FlowListSelection {
  const applyForm = formRows.find(
    (form) => isApplyFormSlug(form.public_slug) && form.status !== "archived",
  );
  const checklist = checklistRows.find((row) => row.status !== "archived");

  if (flowParam === "checklist" && checklist) {
    return { kind: "checklist", id: checklist.id };
  }
  if (flowParam === "apply" && applyForm) {
    return { kind: "apply", id: applyForm.id };
  }

  if (
    previous?.kind === "apply" &&
    formRows.some((form) => form.id === previous.id)
  ) {
    return previous;
  }
  if (
    previous?.kind === "checklist" &&
    checklistRows.some((row) => row.id === previous.id)
  ) {
    return previous;
  }

  if (applyForm) return { kind: "apply", id: applyForm.id };
  if (checklist) return { kind: "checklist", id: checklist.id };
  if (formRows[0]) return { kind: "apply", id: formRows[0].id };
  if (checklistRows[0]) return { kind: "checklist", id: checklistRows[0].id };
  return null;
}

export default function ApplicationFormsPage({
  organizationId,
  branding,
  schoolName,
  slug,
}: ApplicationFormsPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();
  const flowParam = searchParams.get("flow");

  const [forms, setForms] = useState<ApplicationFormVersion[]>([]);
  const [checklists, setChecklists] = useState<EnrollmentChecklistTemplate[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [selection, setSelection] = useState<FlowListSelection>(null);
  const [editable, setEditable] = useState<EditableFormState | null>(null);
  const [focus, setFocus] = useState<BuilderFocus>(DEFAULT_BUILDER_FOCUS);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [checklistPreviewOpen, setChecklistPreviewOpen] = useState(false);
  const [checklistPreviewInitialItemId, setChecklistPreviewInitialItemId] = useState<
    string | undefined
  >();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupHighlight, setSetupHighlight] = useState<"publicSlug" | null>(null);
  const [unpublishOpen, setUnpublishOpen] = useState(false);
  const [checklistUnpublishOpen, setChecklistUnpublishOpen] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [stripePaymentsReady, setStripePaymentsReady] = useState(true);
  const [checklistEditable, setChecklistEditable] = useState<ChecklistEditableState | null>(
    null,
  );
  const [applySavedSnapshot, setApplySavedSnapshot] = useState<string | null>(null);
  const [checklistSavedSnapshot, setChecklistSavedSnapshot] = useState<string | null>(
    null,
  );
  const [checklistResignDialogOpen, setChecklistResignDialogOpen] = useState(false);
  const [pendingChecklistAction, setPendingChecklistAction] =
    useState<PendingChecklistAction | null>(null);
  const [pendingDocumentChanges, setPendingDocumentChanges] = useState<
    EnrollmentDocumentChange[]
  >([]);
  const [flowsSidebarOpen, setFlowsSidebarOpen] = useState(false);
  const isApplyDirtyRef = useRef(false);
  const isChecklistDirtyRef = useRef(false);

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
  const checklistIsArchived = selectedChecklist?.status === "archived";
  const checklistIsDraft = selectedChecklist?.status === "draft";
  const checklistIsPublished = selectedChecklist?.status === "published";
  const checklistReadOnly = checklistIsArchived;

  const checklistPreviewItems = useMemo(() => {
    if (!checklistEditable) return [];
    return buildChecklistPreviewItems(
      checklistEditable.items,
      checklistPreviewInitialItemId,
    );
  }, [checklistEditable, checklistPreviewInitialItemId]);

  const openChecklistPreview = useCallback((initialItemId?: string) => {
    setChecklistPreviewInitialItemId(initialItemId);
    setChecklistPreviewOpen(true);
  }, []);

  const isApplyDirty = useMemo(() => {
    if (!editable || !applySavedSnapshot) return false;
    return serializeEditableFormState(editable) !== applySavedSnapshot;
  }, [editable, applySavedSnapshot]);

  const isChecklistDirty = useMemo(() => {
    if (!checklistEditable || !checklistSavedSnapshot) return false;
    return (
      serializeChecklistEditableState(checklistEditable) !== checklistSavedSnapshot
    );
  }, [checklistEditable, checklistSavedSnapshot]);

  const isDirty =
    selection?.kind === "apply"
      ? isApplyDirty
      : selection?.kind === "checklist"
        ? isChecklistDirty
        : false;

  const guardEnabled =
    (selection?.kind === "apply" && editable !== null) ||
    (selection?.kind === "checklist" && checklistEditable !== null);

  const { dialogOpen: leaveDialogOpen, requestAction, confirmLeave, cancelLeave } =
    useUnsavedChangesGuard({ isDirty, enabled: guardEnabled });

  useEffect(() => {
    isApplyDirtyRef.current = isApplyDirty;
  }, [isApplyDirty]);

  useEffect(() => {
    isChecklistDirtyRef.current = isChecklistDirty;
  }, [isChecklistDirty]);

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
      setSelection((prev) =>
        resolveFlowSelection(formRows, checklistRows, flowParam, prev),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load forms.");
    } finally {
      setLoading(false);
    }
  }, [flowParam, organizationId, supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadForms();
    });
  }, [loadForms]);

  const selectedApplyFormId =
    selection?.kind === "apply" ? selection.id : null;

  useEffect(() => {
    queueMicrotask(() => {
      setFocus(DEFAULT_BUILDER_FOCUS);
      setSetupHighlight(null);
      setApplySavedSnapshot(null);
    });
  }, [selectedApplyFormId]);

  const selectedChecklistId =
    selection?.kind === "checklist" ? selection.id : null;

  useEffect(() => {
    queueMicrotask(() => setChecklistSavedSnapshot(null));
  }, [selectedChecklistId]);

  useEffect(() => {
    if (!selectedChecklist) {
      queueMicrotask(() => setChecklistEditable(null));
      return;
    }

    const checklist = selectedChecklist;
    let cancelled = false;

    async function syncChecklistEditable() {
      try {
        const loaded = await getEnrollmentChecklistWithItems(supabase, checklist.id);
        if (cancelled) return;

        const items = loaded?.items ?? [];

        if (!isChecklistDirtyRef.current) {
          const nextChecklist: ChecklistEditableState = {
            name: checklist.name,
            programId: checklist.programId,
            items: cloneChecklistItems(items),
          };
          setChecklistEditable(nextChecklist);
          setChecklistSavedSnapshot(serializeChecklistEditableState(nextChecklist));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load enrollment checklist.",
          );
        }
      }
    }

    void syncChecklistEditable();

    return () => {
      cancelled = true;
    };
  }, [
    selectedChecklist?.id,
    selectedChecklist?.updatedAt,
    selectedChecklist?.status,
    supabase,
  ]);

  useEffect(() => {
    if (!selectedForm) {
      queueMicrotask(() => setEditable(null));
      return;
    }

    const form = selectedForm;
    let cancelled = false;

    async function syncEditable() {
      let next = toEditableState(form);
      const isApply = isApplyFormSlug(form.public_slug);

      if (isApply) {
        const ensured = ensureApplySystemSchema(next.schema);
        if (applySystemSchemaChanged(next.schema, ensured)) {
          next = { ...next, schema: ensured };
          if (form.status !== "archived") {
            try {
              const updated = await updateApplicationForm(supabase, form.id, {
                schema: ensured,
              });
              if (cancelled) return;
              setForms((prev) =>
                prev.map((row) => (row.id === updated.id ? updated : row)),
              );
              next = toEditableState(updated);
            } catch (err) {
              if (!cancelled) {
                setError(
                  err instanceof Error
                    ? err.message
                    : "Failed to upgrade apply form schema.",
                );
              }
            }
          }
        }
      }

      if (cancelled) return;
      if (!isApplyDirtyRef.current) {
        setEditable(next);
        setApplySavedSnapshot(serializeEditableFormState(next));
      }
    }

    void syncEditable();

    return () => {
      cancelled = true;
    };
  }, [
    selectedForm?.id,
    selectedForm?.updated_at,
    selectedForm?.status,
    supabase,
  ]);

  const focusSlugSetup = (errorMessage: string) => {
    setFocus({ kind: "setup" });
    setSetupHighlight("publicSlug");
    setError(errorMessage);
  };

  const isSlugRelatedError = (message: string) =>
    /slug/i.test(message);

  const handleEditableChange = (patch: Partial<EditableFormState>) => {
    if (isApplyFormSelected && "publicSlug" in patch) {
      return;
    }
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
      post_submit_config: editable.postSubmitConfig,
      notification_config: normalizeApplicationFormNotificationConfig(
        editable.notificationConfig,
      ),
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

  const performCreateApply = async () => {
    setCreating(true);
    setError(null);
    try {
      const created = await createApplyForm(supabase, organizationId);
      setForms((prev) => [created, ...prev]);
      setSelection({ kind: "apply", id: created.id });
      setFocus(DEFAULT_BUILDER_FOCUS);
      setFlowsSidebarOpen(false);
      adminToast.success("Application form created");
    } catch (err) {
      const message = formatActionError(err, "Failed to create apply form.");
      setError(message);
      adminToast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateApply = () => {
    requestAction(() => {
      void performCreateApply();
    });
  };

  const performCreateChecklist = async () => {
    setCreating(true);
    setError(null);
    try {
      const created = await createEnrollmentChecklistTemplate(supabase, organizationId);
      setChecklists((prev) => [created, ...prev]);
      setSelection({ kind: "checklist", id: created.id });
      setFlowsSidebarOpen(false);
      adminToast.success("Enrollment checklist created");
    } catch (err) {
      const message = formatActionError(err, "Failed to create enrollment checklist.");
      setError(message);
      adminToast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateChecklist = () => {
    requestAction(() => {
      void performCreateChecklist();
    });
  };

  const performDuplicate = async () => {
    if (!selectedForm) return;
    setCreating(true);
    setError(null);
    try {
      const copy = await duplicateForm(supabase, selectedForm.id);
      setForms((prev) => [copy, ...prev]);
      setSelection({ kind: "apply", id: copy.id });
      setFocus(DEFAULT_BUILDER_FOCUS);
      adminToast.success("Form duplicated");
    } catch (err) {
      const message = formatActionError(err, "Failed to duplicate form.");
      setError(message);
      adminToast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = () => {
    requestAction(() => {
      void performDuplicate();
    });
  };

  const handleSelect = (nextSelection: FlowListSelection) => {
    requestAction(() => {
      setSelection(nextSelection);
      setFlowsSidebarOpen(false);
    });
  };

  const toggleFlowsSidebar = () => {
    setFlowsSidebarOpen((open) => !open);
  };

  const handleSave = async () => {
    if (!selectedForm || !editable || readOnly) return;

    const validationErrors = [
      ...validateApplicationFormSchema(editable.schema),
      ...(isApplyFormSelected ? validateApplySystemSchema(editable.schema) : []),
    ];
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    const slugOk = await validateSlugForSave();
    if (!slugOk) return;

    const notificationError = validateApplicationFormNotificationConfig(
      normalizeApplicationFormNotificationConfig(editable.notificationConfig),
    );
    if (notificationError) {
      setError(notificationError);
      return;
    }

    const saveInput = buildSaveInput();
    if (!saveInput) return;

    setSaving(true);
    setError(null);
    try {
      const updated = await updateApplicationForm(
        supabase,
        selectedForm.id,
        saveInput,
        { logActivity: true },
      );
      setForms((prev) =>
        prev.map((f) => (f.id === updated.id ? updated : f)),
      );
      const nextEditable = toEditableState(updated);
      setEditable(nextEditable);
      setApplySavedSnapshot(serializeEditableFormState(nextEditable));
      adminToast.success(isPublished ? "Form saved" : "Draft saved");
    } catch (err) {
      const message = formatActionError(err, "Failed to save form.");
      if (isSlugRelatedError(message)) {
        focusSlugSetup(message);
      } else {
        setError(message);
      }
      adminToast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedForm || !isDraft) return;

    const validationErrors = [
      ...validateApplicationFormSchema(editable?.schema ?? selectedForm.schema),
      ...(isApplyFormSelected
        ? validateApplySystemSchema(editable?.schema ?? selectedForm.schema)
        : []),
    ];
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

    const notificationError = validateApplicationFormNotificationConfig(
      normalizeApplicationFormNotificationConfig(
        editable?.notificationConfig ?? selectedForm.notification_config,
      ),
    );
    if (notificationError) {
      setError(notificationError);
      return;
    }

    setPublishing(true);
    setSetupHighlight(null);
    setError(null);
    try {
      const saveInput = buildSaveInput();
      if (saveInput) {
        await updateApplicationForm(supabase, selectedForm.id, saveInput, {
          logActivity: true,
        });
      }
      const published = await publishForm(supabase, selectedForm.id);
      const nextEditable = toEditableState(published);
      setEditable(nextEditable);
      setApplySavedSnapshot(serializeEditableFormState(nextEditable));
      await loadForms();
      setSelection({ kind: "apply", id: published.id });
      setSetupHighlight(null);
      adminToast.success("Form published");
    } catch (err) {
      const message = formatActionError(err, "Failed to publish form.");
      if (isSlugRelatedError(message)) {
        focusSlugSetup(message);
      } else {
        setError(message);
      }
      adminToast.error(message);
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
      adminToast.success("Form unpublished");
    } catch (err) {
      const message = formatActionError(err, "Failed to unpublish form.");
      setError(message);
      adminToast.error(message);
    } finally {
      setUnpublishing(false);
    }
  };

  const handleChecklistEditableChange = (patch: Partial<ChecklistEditableState>) => {
    setChecklistEditable((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleChecklistItemsChange = (items: EnrollmentChecklistItem[]) => {
    setChecklistEditable((prev) => (prev ? { ...prev, items } : prev));
  };

  const persistChecklistSave = async (options?: {
    requireResign?: boolean;
    documentChanges?: EnrollmentDocumentChange[];
    message?: string;
  }) => {
    if (!selectedChecklist || !checklistEditable || checklistReadOnly) return;

    const itemsToSave = ensureUniqueChecklistItemKeys(checklistEditable.items);
    if (hasDuplicateChecklistItemKeys(checklistEditable.items)) {
      setChecklistEditable((prev) =>
        prev ? { ...prev, items: itemsToSave } : prev,
      );
    }

    setSaving(true);
    setError(null);
    try {
      const updatedTemplate = await updateEnrollmentChecklistTemplate(
        supabase,
        selectedChecklist.id,
        {
          name: checklistEditable.name,
          program_id: checklistEditable.programId,
        },
        { logActivity: true },
      );
      const savedItems = await saveEnrollmentChecklistItems(
        supabase,
        selectedChecklist.id,
        itemsToSave,
      );

      if (options?.requireResign && options.documentChanges?.length) {
        await requestEnrollmentAgreementResignForChanges(
          selectedChecklist.id,
          options.documentChanges,
          options.message,
        );
      }

      setChecklists((prev) =>
        prev.map((checklist) =>
          checklist.id === updatedTemplate.id ? updatedTemplate : checklist,
        ),
      );
      const nextChecklist: ChecklistEditableState = {
        name: updatedTemplate.name,
        programId: updatedTemplate.programId,
        items: savedItems,
      };
      setChecklistEditable(nextChecklist);
      setChecklistSavedSnapshot(serializeChecklistEditableState(nextChecklist));
      adminToast.success(
        options?.requireResign
          ? "Checklist saved and families notified to re-sign"
          : checklistIsPublished
            ? "Checklist saved"
            : "Checklist draft saved",
      );
    } catch (err) {
      const message = formatSupabaseError(err, "Failed to save checklist.");
      setError(message);
      adminToast.error(message);
      void reportChecklistOperationalError(
        organizationId,
        "checklist.save",
        selectedChecklist.id,
        err,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChecklistSave = async () => {
    if (!selectedChecklist || !checklistEditable || checklistReadOnly) return;

    const savedState = parseChecklistSavedSnapshot(checklistSavedSnapshot);
    const documentChanges = savedState
      ? summarizeEnrollmentDocumentChanges(
          savedState.items,
          checklistEditable.items,
        )
      : [];

    if (documentChanges.length > 0) {
      setPendingDocumentChanges(documentChanges);
      setPendingChecklistAction("save");
      setChecklistResignDialogOpen(true);
      return;
    }

    await persistChecklistSave();
  };

  const handleChecklistResignDialogConfirm = async (input: {
    requireResign: boolean;
    message?: string;
  }) => {
    const action = pendingChecklistAction;
    const documentChanges = pendingDocumentChanges;
    setChecklistResignDialogOpen(false);
    setPendingChecklistAction(null);
    setPendingDocumentChanges([]);

    if (!action) return;

    if (action === "save") {
      await persistChecklistSave({
        requireResign: input.requireResign,
        documentChanges,
        message: input.message,
      });
      return;
    }

    await persistChecklistPublish({
      requireResign: input.requireResign,
      documentChanges,
      message: input.message,
    });
  };

  const persistChecklistPublish = async (options?: {
    requireResign?: boolean;
    documentChanges?: EnrollmentDocumentChange[];
    message?: string;
  }) => {
    if (!selectedChecklist || !checklistEditable || !checklistIsDraft) return;

    const validationErrors = validateEnrollmentChecklistItems(checklistEditable.items, {
      paymentsReady: stripePaymentsReady,
    });
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    if (!checklistEditable.programId) {
      setError(
        "Link this checklist to a program before publishing. Families cannot enroll until a program is selected.",
      );
      return;
    }

    setPublishing(true);
    setError(null);
    try {
      await updateEnrollmentChecklistTemplate(supabase, selectedChecklist.id, {
        name: checklistEditable.name,
        program_id: checklistEditable.programId,
      });
      await saveEnrollmentChecklistItems(
        supabase,
        selectedChecklist.id,
        checklistEditable.items,
      );

      if (options?.requireResign && options.documentChanges?.length) {
        await requestEnrollmentAgreementResignForChanges(
          selectedChecklist.id,
          options.documentChanges,
          options.message,
        );
      }

      const published = await publishEnrollmentChecklistTemplate(
        supabase,
        selectedChecklist.id,
      );
      const loaded = await getEnrollmentChecklistWithItems(supabase, published.id);
      setChecklists((prev) =>
        prev.map((checklist) =>
          checklist.id === published.id ? published : checklist,
        ),
      );
      if (loaded) {
        const nextChecklist: ChecklistEditableState = {
          name: published.name,
          programId: published.programId,
          items: loaded.items,
        };
        setChecklistEditable(nextChecklist);
        setChecklistSavedSnapshot(serializeChecklistEditableState(nextChecklist));
      }
      await loadForms();
      setSelection({ kind: "checklist", id: published.id });
      adminToast.success(
        options?.requireResign
          ? "Checklist published and families notified to re-sign"
          : "Checklist published",
      );
    } catch (err) {
      const message = formatSupabaseError(err, "Failed to publish checklist.");
      setError(message);
      adminToast.error(message);
      void reportChecklistOperationalError(
        organizationId,
        "checklist.publish",
        selectedChecklist.id,
        err,
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleChecklistPublish = async () => {
    if (!selectedChecklist || !checklistEditable || !checklistIsDraft) return;

    const savedState = parseChecklistSavedSnapshot(checklistSavedSnapshot);
    const documentChanges = savedState
      ? summarizeEnrollmentDocumentChanges(
          savedState.items,
          checklistEditable.items,
        )
      : [];

    if (documentChanges.length > 0) {
      setPendingDocumentChanges(documentChanges);
      setPendingChecklistAction("publish");
      setChecklistResignDialogOpen(true);
      return;
    }

    await persistChecklistPublish();
  };

  const handleChecklistUnpublish = async () => {
    if (!selectedChecklist || !checklistIsPublished) return;

    setUnpublishing(true);
    setError(null);
    try {
      const unpublished = await unpublishEnrollmentChecklistTemplate(
        supabase,
        selectedChecklist.id,
      );
      setChecklists((prev) =>
        prev.map((checklist) =>
          checklist.id === unpublished.id ? unpublished : checklist,
        ),
      );
      setChecklistUnpublishOpen(false);
      adminToast.success("Checklist unpublished");
    } catch (err) {
      const message = formatSupabaseError(err, "Failed to unpublish checklist.");
      setError(message);
      adminToast.error(message);
      void reportChecklistOperationalError(
        organizationId,
        "checklist.unpublish",
        selectedChecklist.id,
        err,
      );
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
      adminToast.success("Link copied");
    } catch {
      const message = "Could not copy link to clipboard.";
      setError(message);
      adminToast.error(message);
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
    if (isApplyFormSelected) {
      const step = editable?.schema.sections.find((section) => section.id === stepId);
      if (step && isSystemSection(step)) return;
    }
    updateSchema((schema) => ({
      ...schema,
      sections: schema.sections.filter((s) => s.id !== stepId),
    }));
    setFocus(DEFAULT_BUILDER_FOCUS);
  };

  const reorderSteps = (sections: ApplicationFormSchema["sections"]) => {
    if (isApplyFormSelected) {
      const systemStep = sections.find(isSystemSection);
      const otherSteps = sections.filter((section) => !isSystemSection(section));
      updateSchema((schema) => ({
        ...schema,
        sections: systemStep ? [systemStep, ...otherSteps] : sections,
      }));
      return;
    }
    updateSchema((schema) => ({ ...schema, sections }));
  };

  if (loading) {
    return <SchoolAdminSplitPaneSkeleton C={C} label="Loading enrollment flows" />;
  }

  const hasFlows = forms.length > 0 || checklists.length > 0;

  const flowsSidebarProps = {
    C,
    open: flowsSidebarOpen,
    forms,
    checklists,
    selected: selection,
    creating,
    hasApplyForm,
    hasEnrollmentChecklist,
    onClose: () => setFlowsSidebarOpen(false),
    onSelect: handleSelect,
    onCreateApply: handleCreateApply,
    onCreateChecklist: handleCreateChecklist,
  };

  const flowsSidebarToggle = (
    <button
      type="button"
      onClick={toggleFlowsSidebar}
      className="shrink-0 rounded-sm px-3 py-1.5 text-xs font-semibold"
      style={getAdminButtonStyle(C, "secondary")}
    >
      Switch form
    </button>
  );

  if (!hasFlows) {
    return (
      <EnrollmentFlowsEmptyState
        C={C}
        creating={creating}
        onCreateApply={handleCreateApply}
        onCreateChecklist={handleCreateChecklist}
      />
    );
  }

  return (
    <div className="flex h-full overflow-hidden" style={{ backgroundColor: C.bg }}>
      {selectedChecklist && checklistEditable ? (
        <div
          className="flex flex-1 flex-col overflow-hidden"
          style={{ backgroundColor: C.surface }}
        >
          <div
            className="flex flex-shrink-0 flex-wrap items-center gap-3 border-b px-5 py-3"
            style={{ borderColor: C.border }}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <input
                  type="text"
                  value={checklistEditable.name}
                  onChange={(e) =>
                    handleChecklistEditableChange({ name: e.target.value })
                  }
                  disabled={checklistReadOnly}
                  className="min-w-0 flex-1 truncate bg-transparent text-base font-semibold outline-none"
                  style={{ color: C.textPrimary }}
                  placeholder="Enrollment checklist"
                />
                <StatusIcon status={selectedChecklist.status} variant="plain" size="lg" />
                {flowsSidebarToggle}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <AdmissionsFamilyAccessGuideButton
                variant="checklist"
                C={C}
                schoolSlug={slug}
              />
              <ChecklistPreviewMenuButton
                C={C}
                orgSlug={slug}
                checklistId={selectedChecklist.id}
                disabled={!checklistEditable.items.length}
                isDirty={isChecklistDirty}
                onPreviewHere={() => openChecklistPreview()}
              />
              <ChecklistProgramDropdown
                C={C}
                programs={programs}
                programId={checklistEditable.programId}
                readOnly={checklistReadOnly}
                onChange={(programId) =>
                  handleChecklistEditableChange({ programId })
                }
              />
              {checklistReadOnly ? null : (
                <>
                  <button
                    type="button"
                    onClick={handleChecklistSave}
                    disabled={saving || !isChecklistDirty}
                    className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                    style={getAdminButtonStyle(C, "primary")}
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    {checklistIsPublished ? "Save" : "Save draft"}
                  </button>
                  {checklistIsPublished ? (
                    <button
                      type="button"
                      onClick={() => setChecklistUnpublishOpen(true)}
                      className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold"
                      style={getAdminButtonStyle(C, "danger")}
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      Unpublish
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleChecklistPublish}
                      disabled={publishing}
                      className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold text-white"
                      style={getAdminButtonStyle(C, "primary")}
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

          {error && selection?.kind === "checklist" ? (
            <div
              className="mx-5 mt-3 rounded-md px-3 py-2 text-xs"
              style={{
                backgroundColor: C.errorBg,
                color: C.error,
                border: `1px solid ${C.errorBorder}`,
              }}
            >
              <PaymentsSetupErrorMessage message={error} orgSlug={slug} C={C} />
            </div>
          ) : null}

          {checklistEditable.programId || checklistReadOnly ? (
            <EnrollmentChecklistBuilder
              branding={branding}
              schoolName={schoolName}
              organizationId={organizationId}
              template={selectedChecklist}
              orgSlug={slug}
              stripePaymentsReady={stripePaymentsReady}
              items={checklistEditable.items}
              isDirty={isChecklistDirty}
              onItemsChange={handleChecklistItemsChange}
              onPreviewItem={openChecklistPreview}
              readOnly={checklistReadOnly}
            />
          ) : (
            <EnrollmentChecklistProgramGate
              C={C}
              slug={slug}
              programs={programs}
              programId={checklistEditable.programId}
              onProgramChange={(programId) =>
                handleChecklistEditableChange({ programId })
              }
            />
          )}
        </div>
      ) : selectedChecklist ? (
        <SchoolAdminCanvasSkeleton C={C} label="Loading enrollment checklist" />
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
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p
                  className="truncate text-base font-semibold"
                  style={{ color: C.textPrimary }}
                >
                  {editable.title || "Untitled form"}
                </p>
                <StatusIcon status={selectedForm.status} variant="plain" size="lg" />
                {flowsSidebarToggle}
              </div>
            </div>

            <ApplicationFormEditorToolbar
              C={C}
              schoolSlug={slug}
              readOnly={readOnly}
              isPublished={isPublished}
              publishedPublicUrl={publishedPublicUrl}
              saving={saving}
              isApplyDirty={isApplyDirty}
              isApplyFormSelected={isApplyFormSelected}
              publishing={publishing}
              creating={creating}
              onSave={handleSave}
              onPublish={handlePublish}
              onUnpublish={() => setUnpublishOpen(true)}
              onCopyPublicLink={handleCopyPublicLink}
              onPreview={() => setPreviewOpen(true)}
              onDuplicate={handleDuplicate}
            />
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
              <PaymentsSetupErrorMessage message={error} orgSlug={slug} C={C} />
            </div>
          )}

          <div className="flex flex-1 overflow-hidden">
            <ApplicationFormOutline
              C={C}
              sections={editable.schema.sections}
              focus={focus}
              readOnly={readOnly}
              lockSystemStep={isApplyFormSelected}
              postSubmitActionCount={editable.postSubmitConfig.actions.length}
              onFocusChange={setFocus}
              onReorderSteps={reorderSteps}
              onAddStep={addStep}
              onPreview={() => setPreviewOpen(true)}
            />

            <ApplicationFormFocusCanvas
              C={C}
              focus={focus}
              editable={editable}
              programs={programs}
              orgSlug={slug}
              organizationId={organizationId}
              readOnly={readOnly}
              lockSystemFields={isApplyFormSelected}
              lockApplySlug={isApplyFormSelected}
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
        <SchoolAdminCanvasSkeleton C={C} label="Loading form editor" />
      )}

      <EnrollmentChecklistPreview
        open={checklistPreviewOpen}
        onClose={() => setChecklistPreviewOpen(false)}
        branding={branding}
        schoolName={schoolName}
        slug={slug}
        enrollmentPath={selectedChecklist?.enrollmentPath ?? "enrollment"}
        title={checklistEditable?.name ?? selectedChecklist?.name ?? "Enrollment checklist"}
        items={checklistPreviewItems}
        allItems={checklistEditable?.items}
        initialItemId={checklistPreviewInitialItemId}
      />

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

      <EnrollmentChecklistResignConfirmDialog
        C={C}
        open={checklistResignDialogOpen}
        documentChanges={pendingDocumentChanges}
        loading={saving || publishing}
        onConfirm={handleChecklistResignDialogConfirm}
        onClose={() => {
          if (!saving && !publishing) {
            setChecklistResignDialogOpen(false);
            setPendingChecklistAction(null);
            setPendingDocumentChanges([]);
          }
        }}
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

      <ConfirmDialog
        C={C}
        open={checklistUnpublishOpen}
        title="Unpublish this checklist?"
        description="Families will not be able to access this enrollment checklist until you publish again."
        confirmLabel="Unpublish"
        variant="destructive"
        loading={unpublishing}
        onConfirm={handleChecklistUnpublish}
        onClose={() => !unpublishing && setChecklistUnpublishOpen(false)}
      />

      <ConfirmDialog
        C={C}
        open={leaveDialogOpen}
        title="Unsaved changes"
        description="You have unsaved changes. If you leave now, your changes will be lost."
        confirmLabel="Leave without saving"
        cancelLabel="Keep editing"
        variant="destructive"
        onConfirm={confirmLeave}
        onClose={cancelLeave}
      />

      <EnrollmentFlowsSidebar {...flowsSidebarProps} />
    </div>
  );
}
