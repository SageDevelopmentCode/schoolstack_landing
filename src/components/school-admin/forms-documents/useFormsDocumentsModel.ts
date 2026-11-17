"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAdminAction, NOT_SAVED } from "@/components/school-admin/garden/useAdminAction";
import { adminToast } from "@/lib/school-admin/admin-toast";
import { fetchAdminFormDownloadUrl } from "@/lib/school-admin/forms-documents/fetch-admin-form-download-url";
import type { AdminParentForm } from "@/lib/school-admin/forms-documents/types";
import { reportClientOperationalError } from "@/lib/operational-errors-client";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import type {
  TeacherFormAudienceType,
  TeacherFormFilterStatus,
  TeacherFormSignatureRow,
  TeacherParentForm,
  TeacherParentFormCategory,
} from "@/lib/school-teacher/forms-documents/types";
import { readFormIdFromUrl, resolveValidFormId, syncFormDetailUrl } from "@/lib/school-teacher/forms-documents/sync-form-url";
import { computeFormMetrics, filterFormsByStatus } from "@/lib/school-teacher/forms-documents/utils";

/*
 * Forms & Documents view-model (admin Garden, Tuition → Agreements, and the
 * staff portal's Forms tab via `apiBase` + `surface`). Same endpoints and URL
 * sync as before; every action has its own pending state, a success toast,
 * and an error toast with Retry. `previewMode` blocks every write.
 */

export const FORMS_API_BASE = "/api/school-admin/forms-documents";

export type CreatorFilter = "all" | "mine" | string;

export type FormsSendPayload = {
  audienceType: TeacherFormAudienceType;
  classroomIds: string[];
  familyIds: string[];
  dueDate: string | null;
};

function buildFormsApiQuery(organizationId: string, category: TeacherParentFormCategory): string {
  const params = new URLSearchParams({ organizationId });
  if (category !== "general") params.set("category", category);
  return params.toString();
}

function buildFormsPatchBody(
  organizationId: string,
  category: TeacherParentFormCategory,
  payload: Record<string, unknown>,
): string {
  return JSON.stringify({ organizationId, ...(category !== "general" ? { category } : {}), ...payload });
}

export function useFormsDocumentsModel({
  organizationId,
  staffMemberId,
  initialForms,
  initialResponsesByFormId,
  initialFormId,
  category,
  syncUrl,
  onFamiliesChanged,
  noun,
  apiBase = FORMS_API_BASE,
  fetchDownloadUrl = fetchAdminFormDownloadUrl,
  surface = "school_admin",
  previewMode = false,
}: {
  organizationId: string;
  staffMemberId: string | null;
  initialForms: AdminParentForm[];
  initialResponsesByFormId: Record<string, TeacherFormSignatureRow[]>;
  initialFormId?: string;
  category: TeacherParentFormCategory;
  syncUrl: boolean;
  onFamiliesChanged?: () => void;
  /** "form" or "agreement" (toast copy). */
  noun: string;
  /** Forms API root (staff portal: /api/teacher-portal/forms-documents). */
  apiBase?: string;
  fetchDownloadUrl?: (formId: string, organizationId: string) => Promise<string>;
  /** Where operational errors are reported. */
  surface?: "school_admin" | "teacher_portal";
  previewMode?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const apiQuery = buildFormsApiQuery(organizationId, category);
  const action = useAdminAction();
  const onFamiliesChangedRef = useRef(onFamiliesChanged);
  useEffect(() => {
    onFamiliesChangedRef.current = onFamiliesChanged;
  }, [onFamiliesChanged]);

  const [forms, setForms] = useState<AdminParentForm[]>(initialForms);
  const [signatureRowsByFormId, setSignatureRowsByFormId] =
    useState<Record<string, TeacherFormSignatureRow[]>>(initialResponsesByFormId);
  const [filter, setFilter] = useState<TeacherFormFilterStatus>("all");
  const [creatorFilter, setCreatorFilter] = useState<CreatorFilter>("all");
  const [creating, setCreating] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [sendForm, setSendForm] = useState<AdminParentForm | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<AdminParentForm | null>(null);
  const [sidebarFormId, setSidebarFormId] = useState<string | null>(() =>
    resolveValidFormId(searchParams.get("form") ?? initialFormId ?? null, initialForms),
  );

  const creatorOptions = useMemo(() => {
    const byId = new Map<string, string>();
    for (const form of forms) byId.set(form.createdByStaffMemberId, form.createdByName);
    return [...byId.entries()].map(([id, name]) => ({ id, name }));
  }, [forms]);

  const creatorScopedForms = useMemo(() => {
    if (creatorFilter === "all") return forms;
    if (creatorFilter === "mine") {
      if (!staffMemberId) return [];
      return forms.filter((form) => form.createdByStaffMemberId === staffMemberId);
    }
    return forms.filter((form) => form.createdByStaffMemberId === creatorFilter);
  }, [creatorFilter, forms, staffMemberId]);

  const selectedForm = useMemo(() => forms.find((form) => form.id === sidebarFormId) ?? null, [forms, sidebarFormId]);
  const metrics = useMemo(() => computeFormMetrics(creatorScopedForms), [creatorScopedForms]);
  const filteredForms = useMemo(
    () => filterFormsByStatus(creatorScopedForms, filter) as AdminParentForm[],
    [creatorScopedForms, filter],
  );
  const statusCounts = useMemo(
    () => ({
      all: creatorScopedForms.length,
      draft: creatorScopedForms.filter((form) => form.status === "draft").length,
      active: creatorScopedForms.filter((form) => form.status === "active").length,
      archived: creatorScopedForms.filter((form) => form.status === "archived").length,
    }),
    [creatorScopedForms],
  );
  const drafts = useMemo(() => forms.filter((form) => form.status === "draft"), [forms]);

  const upsertForm = useCallback((form: AdminParentForm) => {
    setForms((current) =>
      current.some((entry) => entry.id === form.id)
        ? current.map((entry) => (entry.id === form.id ? form : entry))
        : [form, ...current],
    );
  }, []);

  const report = useCallback(
    (operation: string, error: unknown, fallback: string) => {
      if (surface === "teacher_portal") {
        void reportPortalOperationalError("teacher_portal", { organizationId, operation, error: "" }, error);
        return;
      }
      void reportClientOperationalError({
        organizationId,
        operation,
        error: error instanceof Error ? error.message : fallback,
      });
    },
    [organizationId, surface],
  );

  /* ---- create wizard ---- */
  const handleFormPublished = useCallback(
    (form: TeacherParentForm, signatureRows: TeacherFormSignatureRow[]) => {
      const adminForm = form as AdminParentForm;
      upsertForm(adminForm);
      setSignatureRowsByFormId((current) => ({ ...current, [adminForm.id]: signatureRows }));
      setCreating(false);
      setSidebarFormId(adminForm.id);
      if (syncUrl) syncFormDetailUrl(pathname, adminForm.id);
      action.flash(adminForm.id);
      adminToast.success(`${adminForm.title} sent.`, {
        id: `forms-published-${adminForm.id}`,
        description: `${adminForm.totalFamilies} ${adminForm.totalFamilies === 1 ? "family" : "families"} can now open it and sign.`,
      });
      onFamiliesChangedRef.current?.();
    },
    [action, pathname, syncUrl, upsertForm],
  );

  const handleFormSavedDraft = useCallback(
    (form: TeacherParentForm) => {
      const adminForm = form as AdminParentForm;
      upsertForm(adminForm);
      setCreating(false);
      action.flash(adminForm.id);
      adminToast.success(`${adminForm.title} saved as a draft.`, {
        id: `forms-draft-${adminForm.id}`,
        description: `Open it from the list and choose Send when it's ready.`,
      });
    },
    [action, upsertForm],
  );

  /* ---- detail ---- */
  const refreshFormDetail = useCallback(
    async (formId: string) => {
      setDetailLoading(true);
      setDetailError(null);
      try {
        const response = await fetch(`${apiBase}/${formId}?${apiQuery}`);
        const payload = (await response.json().catch(() => ({}))) as {
          form?: AdminParentForm;
          signatureRows?: TeacherFormSignatureRow[];
          error?: string;
        };
        if (!response.ok || !payload.form) throw new Error(payload.error ?? "Failed to load form detail.");
        setForms((current) => current.map((entry) => (entry.id === formId ? payload.form! : entry)));
        if (payload.signatureRows) {
          setSignatureRowsByFormId((current) => ({ ...current, [formId]: payload.signatureRows! }));
        }
      } catch (error) {
        setDetailError(error instanceof Error ? error.message : "Failed to load form detail.");
        report("forms_documents.load_detail", error, "Failed to load form detail.");
      } finally {
        setDetailLoading(false);
      }
    },
    [apiBase, apiQuery, report],
  );

  const openSidebar = useCallback(
    (formId: string) => {
      setSidebarFormId(formId);
      setDetailError(null);
      if (syncUrl) syncFormDetailUrl(pathname, formId);
    },
    [pathname, syncUrl],
  );

  const closeSidebar = useCallback(() => {
    setSidebarFormId(null);
    if (syncUrl) syncFormDetailUrl(pathname, null);
  }, [pathname, syncUrl]);

  useEffect(() => {
    const onPopState = () => setSidebarFormId(resolveValidFormId(readFormIdFromUrl(), forms));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [forms]);

  // Load signatures once per opened form. (Before, a form with no signature
  // rows yet, e.g. a draft, refetched in a loop.)
  const fetchedDetailRef = useRef(new Set<string>());
  useEffect(() => {
    if (!sidebarFormId || previewMode) return;
    if ((signatureRowsByFormId[sidebarFormId] ?? []).length > 0) return;
    if (fetchedDetailRef.current.has(sidebarFormId)) return;
    fetchedDetailRef.current.add(sidebarFormId);
    queueMicrotask(() => {
      void refreshFormDetail(sidebarFormId);
    });
  }, [previewMode, sidebarFormId, refreshFormDetail, signatureRowsByFormId]);

  /* ---- actions ---- */
  const patchForm = useCallback(
    async (formId: string, payload: Record<string, unknown>, fallback: string) => {
      if (previewMode) throw new Error("Editing is off in preview.");
      const response = await fetch(`${apiBase}/${formId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: buildFormsPatchBody(organizationId, category, payload),
      });
      const result = (await response.json().catch(() => ({}))) as {
        form?: AdminParentForm;
        signatureRows?: TeacherFormSignatureRow[];
        error?: string;
      };
      if (!response.ok || !result.form) throw new Error(result.error ?? fallback);
      return result as { form: AdminParentForm; signatureRows?: TeacherFormSignatureRow[] };
    },
    [apiBase, category, organizationId, previewMode],
  );

  const requestArchive = useCallback(
    (formId: string) => {
      if (previewMode) return;
      setArchiveTarget(forms.find((f) => f.id === formId) ?? null);
    },
    [forms, previewMode],
  );

  const confirmArchive = useCallback(async () => {
    const form = archiveTarget;
    if (!form) return;
    await action.run(
      async () => {
        try {
          const { form: next } = await patchForm(form.id, { action: "archive" }, "Failed to archive form.");
          setForms((current) => current.map((entry) => (entry.id === form.id ? next : entry)));
          // Close here (not after run) so a toast Retry that succeeds closes the dialog too.
          setArchiveTarget(null);
        } catch (error) {
          report("forms_documents.archive", error, "Failed to archive form.");
          throw error;
        }
      },
      {
        key: `forms-archive-${form.id}`,
        id: `forms-archive-${form.id}`,
        flashKey: form.id,
        success: { title: `${form.title} archived.`, description: "Find it under the Archived filter." },
        error: { title: `Couldn't archive the ${noun}.`, description: `${form.title} is unchanged.`, fallback: "Failed to archive form." },
      },
    );
  }, [action, archiveTarget, noun, patchForm, report]);

  const duplicate = useCallback(
    async (formId: string) => {
      const source = forms.find((f) => f.id === formId);
      await action.run(
        async () => {
          try {
            const { form } = await patchForm(formId, { action: "duplicate" }, "Failed to duplicate form.");
            setForms((current) => [form, ...current]);
            setSidebarFormId(form.id);
            if (syncUrl) syncFormDetailUrl(pathname, form.id);
            return form;
          } catch (error) {
            report("forms_documents.duplicate", error, "Failed to duplicate form.");
            throw error;
          }
        },
        {
          key: `forms-duplicate-${formId}`,
          id: `forms-duplicate-${formId}`,
          success: (form) => ({
            title: `Copy of ${source?.title ?? `this ${noun}`} created.`,
            description: `“${form.title}” is open now. Edit it, then send it when it's ready.`,
          }),
          error: { title: `Couldn't duplicate the ${noun}.`, description: NOT_SAVED, fallback: "Failed to duplicate form." },
        },
      );
    },
    [action, forms, noun, pathname, patchForm, report, syncUrl],
  );

  const download = useCallback(
    async (formId: string) => {
      await action.run(
        async () => {
          try {
            const signedUrl = await fetchDownloadUrl(formId, organizationId);
            window.open(signedUrl, "_blank", "noopener,noreferrer");
          } catch (error) {
            report("forms_documents.download", error, "Failed to download form.");
            throw error;
          }
        },
        {
          key: `forms-download-${formId}`,
          id: `forms-download-${formId}`,
          success: null,
          error: { title: "Couldn't open the download.", description: "Try again in a moment.", fallback: "Failed to download form." },
        },
      );
    },
    [action, fetchDownloadUrl, organizationId, report],
  );

  const sendNow = useCallback(
    async (form: AdminParentForm, update: Record<string, unknown>, closeSendModal = false) => {
      return action.run(
        async () => {
          try {
            const result = await patchForm(form.id, { update }, "Failed to send form.");
            setForms((current) => current.map((entry) => (entry.id === form.id ? result.form : entry)));
            // Close inside the action so a successful toast Retry closes the modal too.
            if (closeSendModal) setSendForm(null);
            if (result.signatureRows) {
              setSignatureRowsByFormId((current) => ({ ...current, [form.id]: result.signatureRows! }));
            }
            onFamiliesChangedRef.current?.();
            return result.form;
          } catch (error) {
            report("forms_documents.send", error, "Failed to send form.");
            throw error;
          }
        },
        {
          key: `forms-send-${form.id}`,
          id: `forms-send-${form.id}`,
          flashKey: form.id,
          success: (next) => ({
            title: `${next.title} sent.`,
            description: `${next.totalFamilies} ${next.totalFamilies === 1 ? "family" : "families"} can now open it and sign.`,
          }),
          error: { title: `Couldn't send the ${noun}.`, description: `${form.title} is still a draft.`, fallback: "Failed to send form." },
        },
      );
    },
    [action, noun, patchForm, report],
  );

  const handleSendRequest = useCallback(
    (form: TeacherParentForm) => {
      const adminForm = form as AdminParentForm;
      if (previewMode) return;
      if (adminForm.audienceType === "unassigned") {
        setSendForm(adminForm);
        return;
      }
      if (action.pendingKey) return;
      void sendNow(adminForm, { status: "active" });
    },
    [action.pendingKey, previewMode, sendNow],
  );

  const handleSendConfirm = useCallback(
    async (payload: FormsSendPayload) => {
      if (!sendForm || action.pendingKey) return;
      await sendNow(
        sendForm,
        {
          status: "active",
          audienceType: payload.audienceType,
          classroomIds: payload.classroomIds,
          familyIds: payload.familyIds,
          dueDate: payload.dueDate,
        },
        true,
      );
    },
    [action.pendingKey, sendForm, sendNow],
  );

  return {
    forms,
    filteredForms,
    drafts,
    metrics,
    statusCounts,
    filter,
    setFilter,
    creatorFilter,
    setCreatorFilter,
    creatorOptions,
    creating,
    previewMode,
    startCreate: () => {
      if (!previewMode) setCreating(true);
    },
    cancelCreate: () => setCreating(false),
    handleFormPublished,
    handleFormSavedDraft,
    sidebarFormId,
    selectedForm,
    signatureRowsByFormId,
    openSidebar,
    closeSidebar,
    detailLoading,
    detailError,
    retryDetail: () => {
      if (sidebarFormId) void refreshFormDetail(sidebarFormId);
    },
    actionLoading: action.pendingKey != null,
    pendingKey: action.pendingKey,
    flashId: action.lastSavedKey,
    requestArchive,
    archiveTarget,
    cancelArchive: () => setArchiveTarget(null),
    confirmArchive,
    archiving: action.pendingKey?.startsWith("forms-archive-") ?? false,
    duplicate,
    download,
    handleSendRequest,
    sendForm,
    closeSend: () => setSendForm(null),
    handleSendConfirm,
    sending: action.pendingKey?.startsWith("forms-send-") ?? false,
  };
}

export type FormsDocumentsModel = ReturnType<typeof useFormsDocumentsModel>;
