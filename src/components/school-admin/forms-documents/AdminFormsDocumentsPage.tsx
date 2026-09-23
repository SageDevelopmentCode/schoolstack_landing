"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import AdminFormsDocumentsStoryHeader from "./AdminFormsDocumentsStoryHeader";
import TeacherFormCreateWizard from "@/components/school-teacher/forms-documents/TeacherFormCreateWizard";
import TeacherFormDetailSidebar from "@/components/school-teacher/forms-documents/TeacherFormDetailSidebar";
import TeacherFormSendModal from "@/components/school-teacher/forms-documents/TeacherFormSendModal";
import TeacherFormsDocumentsEmptyState from "@/components/school-teacher/forms-documents/TeacherFormsDocumentsEmptyState";
import TeacherFormFilterPill from "@/components/school-teacher/forms-documents/teacher-form-filter-pill";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import type { TeacherClassroomOption } from "@/lib/classroom-signups/types";
import { fetchAdminFormDownloadUrl } from "@/lib/school-admin/forms-documents/fetch-admin-form-download-url";
import type { AdminParentForm } from "@/lib/school-admin/forms-documents/types";
import { reportClientOperationalError } from "@/lib/operational-errors-client";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import {
  FORM_STATUS_LABELS,
  FORM_TYPE_LABELS,
  type TeacherFormFilterStatus,
  type TeacherFormSignatureRow,
  type TeacherParentForm,
} from "@/lib/school-teacher/forms-documents/types";
import {
  readFormIdFromUrl,
  resolveValidFormId,
  syncFormDetailUrl,
} from "@/lib/school-teacher/forms-documents/sync-form-url";
import {
  computeFormMetrics,
  filterFormsByStatus,
  formatAudienceLabel,
  formatFormDueDate,
  getFormProgressPercent,
  getSignatureRowsForForm,
} from "@/lib/school-teacher/forms-documents/utils";

const API_BASE = "/api/school-admin/forms-documents";

type CreatorFilter = "all" | "mine" | string;

type AdminFormsDocumentsPageProps = {
  organizationId: string;
  slug: string;
  staffMemberId: string | null;
  initialForms: AdminParentForm[];
  initialResponsesByFormId: Record<string, TeacherFormSignatureRow[]>;
  classroomOptions: TeacherClassroomOption[];
  initialFormId?: string;
};

function pageEnterVariants(reducedMotion: boolean): Variants {
  if (reducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.2 } },
      exit: { opacity: 0, transition: { duration: 0.15 } },
    };
  }

  return {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
    },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
  };
}

function statusChipVariant(
  status: AdminParentForm["status"],
): "success" | "warning" | "info" {
  switch (status) {
    case "active":
      return "success";
    case "archived":
      return "info";
    default:
      return "warning";
  }
}

function typeLabel(form: AdminParentForm): string {
  if (form.formType === "upload" && form.uploadFormat) {
    return form.uploadFormat.toUpperCase();
  }
  return FORM_TYPE_LABELS[form.formType];
}

function FormListRow({
  form,
  active,
  onOpen,
}: {
  form: AdminParentForm;
  active?: boolean;
  onOpen: () => void;
}) {
  const { theme } = useParentTheme();
  const progressPercent = getFormProgressPercent(form);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="grid w-full cursor-pointer grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#F7FAF7]"
      style={{
        borderColor: theme.line,
        backgroundColor: active ? "#EDF5EE" : undefined,
      }}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold" style={{ color: theme.ink }}>
          {form.title}
        </p>
        <p className="mt-0.5 text-xs" style={{ color: theme.muted }}>
          {formatAudienceLabel(form)}
        </p>
      </div>
      <p className="w-28 text-xs" style={{ color: theme.muted }}>
        {form.createdByName}
      </p>
      <ParentChip theme={theme} tone="info">{typeLabel(form)}</ParentChip>
      <div className="w-36">
        <p className="text-xs font-medium" style={{ color: theme.ink }}>
          {form.signedFamilies} / {form.totalFamilies} signed
        </p>
        <div
          className="mt-1 h-1.5 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: theme.line }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: theme.primary,
            }}
          />
        </div>
      </div>
      <p className="w-28 text-xs" style={{ color: theme.muted }}>
        {formatFormDueDate(form.dueDate)}
      </p>
      <ParentChip theme={theme} tone={statusChipVariant(form.status)}>
        {FORM_STATUS_LABELS[form.status]}
      </ParentChip>
    </button>
  );
}

function FormListCard({
  form,
  active,
  onOpen,
}: {
  form: AdminParentForm;
  active?: boolean;
  onOpen: () => void;
}) {
  const { theme } = useParentTheme();
  const progressPercent = getFormProgressPercent(form);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full cursor-pointer rounded-xl border p-4 text-left transition-colors hover:bg-[#F7FAF7]"
      style={{
        borderColor: active ? "#CCE0CF" : theme.line,
        backgroundColor: active ? "#EDF5EE" : theme.cream,
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-semibold" style={{ color: theme.ink }}>
          {form.title}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <ParentChip theme={theme} tone="info">{typeLabel(form)}</ParentChip>
          <ParentChip theme={theme} tone={statusChipVariant(form.status)}>
            {FORM_STATUS_LABELS[form.status]}
          </ParentChip>
        </div>
      </div>
      <p className="mt-1 text-xs" style={{ color: theme.muted }}>
        {form.createdByName} · {formatAudienceLabel(form)}
      </p>
      <p className="mt-1 text-xs" style={{ color: theme.muted }}>
        Due {formatFormDueDate(form.dueDate)}
      </p>
      <p className="mt-3 text-xs font-medium" style={{ color: theme.ink }}>
        {form.signedFamilies} / {form.totalFamilies} families signed
      </p>
      <div
        className="mt-1 h-1.5 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: theme.line }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: theme.primary,
          }}
        />
      </div>
    </button>
  );
}

export default function AdminFormsDocumentsPage(props: AdminFormsDocumentsPageProps) {
  const { theme } = useParentTheme();

  return (
    <Suspense
      fallback={
        <div
          className="flex items-center justify-center gap-2 py-12 text-sm"
          style={{ color: theme.muted }}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading forms…
        </div>
      }
    >
      <AdminFormsDocumentsPageContent {...props} />
    </Suspense>
  );
}

function AdminFormsDocumentsPageContent({
  organizationId,
  slug: _slug,
  staffMemberId,
  initialForms,
  initialResponsesByFormId,
  classroomOptions,
  initialFormId,
}: AdminFormsDocumentsPageProps) {
  const { theme } = useParentTheme();
  const reducedMotion = useReducedMotion() ?? false;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [forms, setForms] = useState<AdminParentForm[]>(initialForms);
  const [signatureRowsByFormId, setSignatureRowsByFormId] = useState<
    Record<string, TeacherFormSignatureRow[]>
  >(initialResponsesByFormId);
  const [filter, setFilter] = useState<TeacherFormFilterStatus>("all");
  const [creatorFilter, setCreatorFilter] = useState<CreatorFilter>("all");
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sendForm, setSendForm] = useState<AdminParentForm | null>(null);
  const [sidebarFormId, setSidebarFormId] = useState<string | null>(() =>
    resolveValidFormId(
      searchParams.get("form") ?? initialFormId ?? null,
      initialForms,
    ),
  );

  const creatorOptions = useMemo(() => {
    const byId = new Map<string, string>();
    for (const form of forms) {
      byId.set(form.createdByStaffMemberId, form.createdByName);
    }
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

  const selectedForm = useMemo(
    () => forms.find((form) => form.id === sidebarFormId) ?? null,
    [forms, sidebarFormId],
  );

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

  const pageVariants = pageEnterVariants(reducedMotion);

  const handleFormPublished = useCallback(
    (form: TeacherParentForm, signatureRows: TeacherFormSignatureRow[]) => {
      const adminForm = form as AdminParentForm;
      setForms((current) =>
        current.some((entry) => entry.id === adminForm.id)
          ? current.map((entry) => (entry.id === adminForm.id ? adminForm : entry))
          : [adminForm, ...current],
      );
      setSignatureRowsByFormId((current) => ({
        ...current,
        [adminForm.id]: signatureRows,
      }));
      setCreating(false);
      setSidebarFormId(adminForm.id);
      syncFormDetailUrl(pathname, adminForm.id);
    },
    [pathname],
  );

  const handleFormSavedDraft = useCallback((form: TeacherParentForm) => {
    const adminForm = form as AdminParentForm;
    setForms((current) =>
      current.some((entry) => entry.id === adminForm.id)
        ? current.map((entry) => (entry.id === adminForm.id ? adminForm : entry))
        : [adminForm, ...current],
    );
    setCreating(false);
  }, []);

  const refreshFormDetail = useCallback(
    async (formId: string) => {
      setDetailLoading(true);
      try {
        const response = await fetch(
          `${API_BASE}/${formId}?organizationId=${encodeURIComponent(organizationId)}`,
        );
        const payload = (await response.json()) as {
          form?: AdminParentForm;
          signatureRows?: TeacherFormSignatureRow[];
        };
        if (!response.ok || !payload.form) return;
        setForms((current) =>
          current.map((entry) => (entry.id === formId ? payload.form! : entry)),
        );
        if (payload.signatureRows) {
          setSignatureRowsByFormId((current) => ({
            ...current,
            [formId]: payload.signatureRows!,
          }));
        }
      } catch (error) {
        void reportClientOperationalError({
          organizationId,
          operation: "forms_documents.load_detail",
          error: error instanceof Error ? error.message : "Failed to load form detail.",
        });
      } finally {
        setDetailLoading(false);
      }
    },
    [organizationId],
  );

  const openSidebar = useCallback(
    (formId: string) => {
      setSidebarFormId(formId);
      syncFormDetailUrl(pathname, formId);
      const hasSignatureRows = (signatureRowsByFormId[formId] ?? []).length > 0;
      if (!hasSignatureRows) {
        void refreshFormDetail(formId);
      }
    },
    [pathname, refreshFormDetail, signatureRowsByFormId],
  );

  useEffect(() => {
    const onPopState = () => {
      setSidebarFormId(resolveValidFormId(readFormIdFromUrl(), forms));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [forms]);

  useEffect(() => {
    if (!sidebarFormId) return;
    const hasSignatureRows = (signatureRowsByFormId[sidebarFormId] ?? []).length > 0;
    if (hasSignatureRows) return;
    queueMicrotask(() => {
      void refreshFormDetail(sidebarFormId);
    });
  }, [sidebarFormId, refreshFormDetail, signatureRowsByFormId]);

  const handleArchive = useCallback(
    async (formId: string) => {
      if (actionLoading) return;
      setActionLoading(true);
      try {
        const response = await fetch(`${API_BASE}/${formId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            action: "archive",
          }),
        });
        const payload = (await response.json()) as {
          form?: AdminParentForm;
          error?: string;
        };
        if (!response.ok || !payload.form) {
          throw new Error(payload.error ?? "Failed to archive form.");
        }
        setForms((current) =>
          current.map((entry) => (entry.id === formId ? payload.form! : entry)),
        );
      } catch (error) {
        void reportClientOperationalError({
          organizationId,
          operation: "forms_documents.archive",
          error: error instanceof Error ? error.message : "Failed to archive form.",
        });
      } finally {
        setActionLoading(false);
      }
    },
    [actionLoading, organizationId],
  );

  const handleDuplicate = useCallback(
    async (formId: string) => {
      if (actionLoading) return;
      setActionLoading(true);
      try {
        const response = await fetch(`${API_BASE}/${formId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            action: "duplicate",
          }),
        });
        const payload = (await response.json()) as {
          form?: AdminParentForm;
          error?: string;
        };
        if (!response.ok || !payload.form) {
          throw new Error(payload.error ?? "Failed to duplicate form.");
        }
        setForms((current) => [payload.form!, ...current]);
        setSidebarFormId(payload.form!.id);
        syncFormDetailUrl(pathname, payload.form!.id);
      } catch (error) {
        void reportClientOperationalError({
          organizationId,
          operation: "forms_documents.duplicate",
          error: error instanceof Error ? error.message : "Failed to duplicate form.",
        });
      } finally {
        setActionLoading(false);
      }
    },
    [actionLoading, organizationId, pathname],
  );

  const handleDownload = useCallback(
    async (formId: string) => {
      try {
        const signedUrl = await fetchAdminFormDownloadUrl(formId, organizationId);
        window.open(signedUrl, "_blank", "noopener,noreferrer");
      } catch (error) {
        void reportClientOperationalError({
          organizationId,
          operation: "forms_documents.download",
          error: error instanceof Error ? error.message : "Failed to download form.",
        });
      }
    },
    [organizationId],
  );

  const closeSidebar = useCallback(() => {
    setSidebarFormId(null);
    syncFormDetailUrl(pathname, null);
  }, [pathname]);

  const handleSendRequest = useCallback((form: TeacherParentForm) => {
    const adminForm = form as AdminParentForm;
    if (adminForm.audienceType === "unassigned") {
      setSendForm(adminForm);
      return;
    }

    void (async () => {
      if (actionLoading) return;
      setActionLoading(true);
      try {
        const response = await fetch(`${API_BASE}/${adminForm.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            update: { status: "active" },
          }),
        });
        const payload = (await response.json()) as {
          form?: AdminParentForm;
          signatureRows?: TeacherFormSignatureRow[];
          error?: string;
        };
        if (!response.ok || !payload.form) {
          throw new Error(payload.error ?? "Failed to send form.");
        }
        setForms((current) =>
          current.map((entry) => (entry.id === adminForm.id ? payload.form! : entry)),
        );
        if (payload.signatureRows) {
          setSignatureRowsByFormId((current) => ({
            ...current,
            [adminForm.id]: payload.signatureRows!,
          }));
        }
      } catch (error) {
        void reportClientOperationalError({
          organizationId,
          operation: "forms_documents.send",
          error: error instanceof Error ? error.message : "Failed to send form.",
        });
      } finally {
        setActionLoading(false);
      }
    })();
  }, [actionLoading, organizationId]);

  const handleSendConfirm = useCallback(
    async (payload: {
      audienceType: import("@/lib/school-teacher/forms-documents/types").TeacherFormAudienceType;
      classroomIds: string[];
      familyIds: string[];
      dueDate: string | null;
    }) => {
      if (!sendForm || actionLoading) return;
      setActionLoading(true);
      try {
        const response = await fetch(`${API_BASE}/${sendForm.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            update: {
              status: "active",
              audienceType: payload.audienceType,
              classroomIds: payload.classroomIds,
              familyIds: payload.familyIds,
              dueDate: payload.dueDate,
            },
          }),
        });
        const result = (await response.json()) as {
          form?: AdminParentForm;
          signatureRows?: TeacherFormSignatureRow[];
          error?: string;
        };
        if (!response.ok || !result.form) {
          throw new Error(result.error ?? "Failed to send form.");
        }
        setForms((current) =>
          current.map((entry) => (entry.id === sendForm.id ? result.form! : entry)),
        );
        if (result.signatureRows) {
          setSignatureRowsByFormId((current) => ({
            ...current,
            [sendForm.id]: result.signatureRows!,
          }));
        }
        setSendForm(null);
      } catch (error) {
        void reportClientOperationalError({
          organizationId,
          operation: "forms_documents.send",
          error: error instanceof Error ? error.message : "Failed to send form.",
        });
      } finally {
        setActionLoading(false);
      }
    },
    [actionLoading, organizationId, sendForm],
  );

  return (
    <div className={PORTAL_HOME_CONTAINER_CLASS}>
      <AnimatePresence mode="wait" initial={false}>
        {creating ? (
          <motion.div
            key="create-wizard"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <TeacherFormCreateWizard
              organizationId={organizationId}
              classroomOptions={classroomOptions}
              apiBasePath={API_BASE}
              familySearchApiPath={`${API_BASE}/families`}
              allowSelectAllClassrooms
              operationalErrorSurface="school_admin"
              onCancel={() => setCreating(false)}
              onPublished={handleFormPublished}
              onSaveDraft={handleFormSavedDraft}
            />
          </motion.div>
        ) : (
          <motion.div
            key="form-list"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <AdminFormsDocumentsStoryHeader
              theme={theme}
              onCreate={() => setCreating(true)}
            />

            {forms.length > 0 ? (
              <>
                <div className="mb-6 grid gap-3 sm:grid-cols-3">
                  <AdminMetricCard
                    theme={theme}
                    label="Active forms"
                    value={String(metrics.activeCount)}
                    accent="forest"
                  />
                  <AdminMetricCard
                    theme={theme}
                    label="Pending signatures"
                    value={String(metrics.pendingSignatures)}
                    accent="sky"
                  />
                  <AdminMetricCard
                    theme={theme}
                    label="Completed this month"
                    value={String(metrics.completedThisMonth)}
                    accent="gold"
                  />
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {(
                    [
                      ["all", "All"],
                      ["draft", "Draft"],
                      ["active", "Active"],
                      ["archived", "Archived"],
                    ] as const
                  ).map(([key, label]) => (
                    <TeacherFormFilterPill
                      key={key}
                      theme={theme}
                      active={filter === key}
                      label={label}
                      count={statusCounts[key]}
                      onClick={() => setFilter(key)}
                    />
                  ))}
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: theme.muted }}>
                    Created by
                  </span>
                  <TeacherFormFilterPill
                    theme={theme}
                    active={creatorFilter === "all"}
                    label="All"
                    onClick={() => setCreatorFilter("all")}
                  />
                  {staffMemberId ? (
                    <TeacherFormFilterPill
                      theme={theme}
                      active={creatorFilter === "mine"}
                      label="Mine"
                      onClick={() => setCreatorFilter("mine")}
                    />
                  ) : null}
                  {creatorOptions.map((creator) => (
                    <TeacherFormFilterPill
                      key={creator.id}
                      theme={theme}
                      active={creatorFilter === creator.id}
                      label={creator.name}
                      onClick={() => setCreatorFilter(creator.id)}
                    />
                  ))}
                </div>
              </>
            ) : null}

            {forms.length === 0 ? (
              <TeacherFormsDocumentsEmptyState
                theme={theme}
                onCreate={() => setCreating(true)}
              />
            ) : filteredForms.length === 0 ? (
              <ParentCard theme={theme} className="text-center !py-12">
                <FileText
                  className="mx-auto mb-3 h-8 w-8"
                  style={{ color: theme.muted }}
                />
                <p className="text-sm" style={{ color: theme.muted }}>
                  No forms match this filter.
                </p>
              </ParentCard>
            ) : (
              <>
                <AdminCard theme={theme} padding="none" className="hidden lg:block">
                  <div
                    className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-3 border-b px-4 py-3 text-[11px] font-semibold uppercase tracking-wide"
                    style={{ borderColor: theme.line, color: theme.muted }}
                  >
                    <span>Form</span>
                    <span>Created by</span>
                    <span>Type</span>
                    <span>Progress</span>
                    <span>Due</span>
                    <span>Status</span>
                  </div>
                  {filteredForms.map((form) => (
                    <FormListRow
                      key={form.id}
                      form={form}
                      active={form.id === sidebarFormId}
                      onOpen={() => openSidebar(form.id)}
                    />
                  ))}
                </AdminCard>

                <div className="flex flex-col gap-3 lg:hidden">
                  {filteredForms.map((form) => (
                    <FormListCard
                      key={form.id}
                      form={form}
                      active={form.id === sidebarFormId}
                      onOpen={() => openSidebar(form.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <TeacherFormDetailSidebar
        theme={theme}
        open={sidebarFormId != null}
        form={selectedForm}
        organizationId={organizationId}
        detailLoading={detailLoading}
        signatureRows={
          sidebarFormId
            ? getSignatureRowsForForm(sidebarFormId, signatureRowsByFormId)
            : []
        }
        actionLoading={actionLoading}
        onClose={closeSidebar}
        onArchive={handleArchive}
        onDuplicate={handleDuplicate}
        onDownload={handleDownload}
        onSend={handleSendRequest}
        fetchDownloadUrl={fetchAdminFormDownloadUrl}
      />

      {sendForm ? (
        <TeacherFormSendModal
          theme={theme}
          open={sendForm != null}
          form={sendForm}
          organizationId={organizationId}
          classroomOptions={classroomOptions}
          familySearchApiPath={`${API_BASE}/families`}
          allowSelectAllClassrooms
          loading={actionLoading}
          onClose={() => setSendForm(null)}
          onSend={handleSendConfirm}
        />
      ) : null}
    </div>
  );
}
