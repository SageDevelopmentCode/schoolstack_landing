"use client";

import { Suspense } from "react";
import { Loader2, Plus } from "lucide-react";
import FormsDocumentsWorkspace from "@/components/school-admin/forms-documents/FormsDocumentsWorkspace";
import { AdminGardenSkin } from "@/components/school-admin/garden/skin";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { gBtnPopSm } from "@/components/school-parent/garden/ui";
import type { TeacherClassroomOption } from "@/lib/classroom-signups/types";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import type { AdminParentForm } from "@/lib/school-admin/forms-documents/types";
import { fetchTeacherFormDownloadUrl } from "@/lib/school-teacher/forms-documents/fetch-teacher-form-download-url";
import type { TeacherFormSignatureRow, TeacherParentForm } from "@/lib/school-teacher/forms-documents/types";

const API_BASE = "/api/teacher-portal/forms-documents";

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
  /** `false`: the open form stays in local state, never in `?form=` (marketing demos). */
  syncUrl?: boolean;
};

/**
 * Staff Forms & documents (Garden). The same workspace as admin Forms
 * (`FormsDocumentsWorkspace` + `useFormsDocumentsModel`) pointed at the
 * teacher API: draft lead strip, linked figures, status filters, signature
 * progress per row, create wizard, detail drawer, send modal and an archive
 * confirm, with a toast (and Retry on errors) for every action.
 */
export default function TeacherFormsDocumentsPage(props: TeacherFormsDocumentsPageProps) {
  const { theme } = useParentTheme();
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center gap-2 py-12 text-sm" style={{ color: theme.muted }}>
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
  slug,
  staffMemberId,
  initialForms,
  initialResponsesByFormId,
  classroomOptions,
  previewMode = false,
  initialFormId,
  uploadPreviewUrlsByFormId,
  syncUrl = true,
}: TeacherFormsDocumentsPageProps) {
  const { theme } = useParentTheme();

  return (
    <ParentGardenFrame theme={theme} className="bg-[var(--sf-cream)]">
      <AdminGardenSkin theme={theme}>
        <div className={`sf-admin-garden-skin ${PORTAL_HOME_CONTAINER_CLASS}`} data-testid="teacher-forms-documents-page">
          <FormsDocumentsWorkspace
            organizationId={organizationId}
            slug={slug}
            staffMemberId={staffMemberId}
            initialForms={initialForms as AdminParentForm[]}
            initialResponsesByFormId={initialResponsesByFormId}
            classroomOptions={classroomOptions}
            initialFormId={initialFormId}
            category="general"
            apiBase={API_BASE}
            syncUrl={syncUrl}
            fetchDownloadUrl={fetchTeacherFormDownloadUrl}
            surface="teacher_portal"
            previewMode={previewMode}
            uploadPreviewUrlsByFormId={uploadPreviewUrlsByFormId}
            rowTestIdPrefix="teacher-form-row"
            showCreatorFilter={false}
            showCreatorColumn={false}
            allowSelectAllClassrooms={false}
            emptyState={{
              kicker: "Family forms",
              title: "Create your first form",
              description:
                "Upload a PDF or build a form for families in your classrooms to review and sign — like field trip permissions or photo releases.",
            }}
            header={({ onCreate }) => (
              <ParentGardenPageHeader
                title={
                  <>
                    Forms <span className="text-[var(--sf-clay)]">&amp; documents</span>
                  </>
                }
                subtitle="Create forms for families in your classrooms to review and sign. Open a form to see who has signed."
                actions={
                  <button
                    type="button"
                    className={gBtnPopSm}
                    onClick={onCreate}
                    disabled={previewMode}
                    title={previewMode ? "Creating forms is off in preview" : undefined}
                    data-testid="teacher-forms-create"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    Create form
                  </button>
                }
              />
            )}
          />
        </div>
      </AdminGardenSkin>
    </ParentGardenFrame>
  );
}
