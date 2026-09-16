"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import TeacherFormCreateWizard from "./TeacherFormCreateWizard";
import TeacherFormDetailSidebar from "./TeacherFormDetailSidebar";
import TeacherFormsDocumentsEmptyState from "./TeacherFormsDocumentsEmptyState";
import TeacherFormsDocumentsStoryHeader from "./TeacherFormsDocumentsStoryHeader";
import TeacherFormFilterPill from "./teacher-form-filter-pill";
import type { TeacherClassroomOption } from "@/lib/classroom-signups/types";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import {
  FORM_STATUS_LABELS,
  FORM_TYPE_LABELS,
  type TeacherFormFilterStatus,
  type TeacherFormSignatureRow,
  type TeacherParentForm,
} from "@/lib/school-teacher/forms-documents/types";
import { fetchTeacherFormDownloadUrl } from "@/lib/school-teacher/forms-documents/fetch-teacher-form-download-url";
import {
  computeFormMetrics,
  filterFormsByStatus,
  formatClassroomNames,
  formatFormDueDate,
  getFormProgressPercent,
  getSignatureRowsForForm,
} from "@/lib/school-teacher/forms-documents/utils";

type TeacherFormsDocumentsPageProps = {
  organizationId: string;
  slug: string;
  staffMemberId: string | null;
  initialForms: TeacherParentForm[];
  initialResponsesByFormId: Record<string, TeacherFormSignatureRow[]>;
  classroomOptions: TeacherClassroomOption[];
  previewMode?: boolean;
  initialFormId?: string;
  uploadPreviewUrlsByFormId?: Record<string, string>;
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
  status: TeacherParentForm["status"],
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

function typeLabel(form: TeacherParentForm): string {
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
  form: TeacherParentForm;
  active?: boolean;
  onOpen: () => void;
}) {
  const { theme } = useParentTheme();
  const progressPercent = getFormProgressPercent(form);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="grid w-full cursor-pointer grid-cols-[1fr_auto_auto_auto_auto] items-center gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#F7FAF7]"
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
          {formatClassroomNames(form.classroomNames)}
        </p>
      </div>
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
  form: TeacherParentForm;
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
        {formatClassroomNames(form.classroomNames)} · Due {formatFormDueDate(form.dueDate)}
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

export default function TeacherFormsDocumentsPage(props: TeacherFormsDocumentsPageProps) {
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
      <TeacherFormsDocumentsPageContent {...props} />
    </Suspense>
  );
}

function TeacherFormsDocumentsPageContent({
  organizationId,
  slug: _slug,
  staffMemberId: _staffMemberId,
  initialForms,
  initialResponsesByFormId,
  classroomOptions,
  previewMode = false,
  initialFormId,
  uploadPreviewUrlsByFormId,
}: TeacherFormsDocumentsPageProps) {
  const { theme } = useParentTheme();
  const reducedMotion = useReducedMotion() ?? false;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [forms, setForms] = useState<TeacherParentForm[]>(initialForms);
  const [signatureRowsByFormId, setSignatureRowsByFormId] = useState<
    Record<string, TeacherFormSignatureRow[]>
  >(initialResponsesByFormId);
  const [filter, setFilter] = useState<TeacherFormFilterStatus>("all");
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const formParam = searchParams.get("form") ?? initialFormId ?? null;

  const selectedFormId = useMemo(() => {
    if (!formParam) return null;
    return forms.some((form) => form.id === formParam) ? formParam : null;
  }, [formParam, forms]);

  const setFormParam = useCallback(
    (formId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (formId) params.set("form", formId);
      else params.delete("form");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const selectedForm = useMemo(
    () => forms.find((form) => form.id === selectedFormId) ?? null,
    [forms, selectedFormId],
  );

  const metrics = useMemo(() => computeFormMetrics(forms), [forms]);

  const filteredForms = useMemo(
    () => filterFormsByStatus(forms, filter),
    [forms, filter],
  );

  const statusCounts = useMemo(
    () => ({
      all: forms.length,
      draft: forms.filter((form) => form.status === "draft").length,
      active: forms.filter((form) => form.status === "active").length,
      archived: forms.filter((form) => form.status === "archived").length,
    }),
    [forms],
  );

  const pageVariants = pageEnterVariants(reducedMotion);

  const handleFormPublished = useCallback(
    (form: TeacherParentForm, signatureRows: TeacherFormSignatureRow[]) => {
      setForms((current) =>
        current.some((entry) => entry.id === form.id)
          ? current.map((entry) => (entry.id === form.id ? form : entry))
          : [form, ...current],
      );
      setSignatureRowsByFormId((current) => ({
        ...current,
        [form.id]: signatureRows,
      }));
      setCreating(false);
      setFormParam(form.id);
    },
    [setFormParam],
  );

  const handleFormSavedDraft = useCallback((form: TeacherParentForm) => {
    setForms((current) =>
      current.some((entry) => entry.id === form.id)
        ? current.map((entry) => (entry.id === form.id ? form : entry))
        : [form, ...current],
    );
    setCreating(false);
  }, []);

  const refreshFormDetail = useCallback(
    async (formId: string) => {
      if (previewMode) return;
      setDetailLoading(true);
      try {
        const response = await fetch(
          `/api/teacher-portal/forms-documents/${formId}?organizationId=${encodeURIComponent(organizationId)}`,
        );
        const payload = (await response.json()) as {
          form?: TeacherParentForm;
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
        void reportPortalOperationalError(
          "teacher_portal",
          {
            organizationId,
            operation: "forms_documents.load_detail",
            error: "",
          },
          error,
        );
      } finally {
        setDetailLoading(false);
      }
    },
    [organizationId, previewMode],
  );

  const openSidebar = useCallback(
    (formId: string) => {
      setFormParam(formId);
      const hasSignatureRows = (signatureRowsByFormId[formId] ?? []).length > 0;
      if (!hasSignatureRows) {
        void refreshFormDetail(formId);
      }
    },
    [refreshFormDetail, setFormParam, signatureRowsByFormId],
  );

  useEffect(() => {
    if (!selectedFormId || previewMode) return;
    const hasSignatureRows = (signatureRowsByFormId[selectedFormId] ?? []).length > 0;
    if (hasSignatureRows) return;
    queueMicrotask(() => {
      void refreshFormDetail(selectedFormId);
    });
  }, [selectedFormId, previewMode, refreshFormDetail, signatureRowsByFormId]);

  const handleArchive = useCallback(
    async (formId: string) => {
      if (previewMode || actionLoading) return;
      setActionLoading(true);
      try {
        const response = await fetch(`/api/teacher-portal/forms-documents/${formId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            action: "archive",
          }),
        });
        const payload = (await response.json()) as {
          form?: TeacherParentForm;
          error?: string;
        };
        if (!response.ok || !payload.form) {
          throw new Error(payload.error ?? "Failed to archive form.");
        }
        setForms((current) =>
          current.map((entry) => (entry.id === formId ? payload.form! : entry)),
        );
      } catch (error) {
        void reportPortalOperationalError(
          "teacher_portal",
          {
            organizationId,
            operation: "forms_documents.archive",
            error: "",
          },
          error,
        );
      } finally {
        setActionLoading(false);
      }
    },
    [actionLoading, organizationId, previewMode],
  );

  const handleDuplicate = useCallback(
    async (formId: string) => {
      if (previewMode || actionLoading) return;
      setActionLoading(true);
      try {
        const response = await fetch(`/api/teacher-portal/forms-documents/${formId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            action: "duplicate",
          }),
        });
        const payload = (await response.json()) as {
          form?: TeacherParentForm;
          error?: string;
        };
        if (!response.ok || !payload.form) {
          throw new Error(payload.error ?? "Failed to duplicate form.");
        }
        setForms((current) => [payload.form!, ...current]);
        setFormParam(payload.form!.id);
      } catch (error) {
        void reportPortalOperationalError(
          "teacher_portal",
          {
            organizationId,
            operation: "forms_documents.duplicate",
            error: "",
          },
          error,
        );
      } finally {
        setActionLoading(false);
      }
    },
    [actionLoading, organizationId, previewMode, setFormParam],
  );

  const handleDownload = useCallback(
    async (formId: string) => {
      if (previewMode) return;
      try {
        const signedUrl = await fetchTeacherFormDownloadUrl(formId, organizationId);
        window.open(signedUrl, "_blank", "noopener,noreferrer");
      } catch (error) {
        void reportPortalOperationalError(
          "teacher_portal",
          {
            organizationId,
            operation: "forms_documents.download",
            error: "",
          },
          error,
        );
      }
    },
    [organizationId, previewMode],
  );

  const closeSidebar = useCallback(() => {
    setFormParam(null);
  }, [setFormParam]);

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
            <TeacherFormsDocumentsStoryHeader
              theme={theme}
              previewMode={previewMode}
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
              </>
            ) : null}

            {forms.length === 0 ? (
              <TeacherFormsDocumentsEmptyState
                theme={theme}
                previewMode={previewMode}
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
                <AdminCard theme={theme} padding="none" className="hidden md:block">
                  <div
                    className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 border-b px-4 py-3 text-[11px] font-semibold uppercase tracking-wide"
                    style={{ borderColor: theme.line, color: theme.muted }}
                  >
                    <span>Form</span>
                    <span>Type</span>
                    <span>Progress</span>
                    <span>Due</span>
                    <span>Status</span>
                  </div>
                  {filteredForms.map((form) => (
                    <FormListRow
                      key={form.id}
                      form={form}
                      active={form.id === selectedFormId}
                      onOpen={() => openSidebar(form.id)}
                    />
                  ))}
                </AdminCard>

                <div className="flex flex-col gap-3 md:hidden">
                  {filteredForms.map((form) => (
                    <FormListCard
                      key={form.id}
                      form={form}
                      active={form.id === selectedFormId}
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
        open={selectedFormId != null}
        form={selectedForm}
        organizationId={organizationId}
        detailLoading={detailLoading}
        signatureRows={
          selectedFormId
            ? getSignatureRowsForForm(selectedFormId, signatureRowsByFormId)
            : []
        }
        previewMode={previewMode}
        previewUrl={
          selectedFormId
            ? (uploadPreviewUrlsByFormId?.[selectedFormId] ?? null)
            : null
        }
        actionLoading={actionLoading}
        onClose={closeSidebar}
        onArchive={handleArchive}
        onDuplicate={handleDuplicate}
        onDownload={handleDownload}
      />
    </div>
  );
}
