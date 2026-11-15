"use client";

import { Suspense, useMemo } from "react";
import { Plus } from "lucide-react";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import { gBtnOutlineSm } from "@/components/school-parent/garden/ui";
import {
  AdminGardenPage,
  AdminGardenPageHeader,
  AdminGardenPageSkeleton,
} from "@/components/school-admin/garden/kit";
import type { TeacherClassroomOption } from "@/lib/classroom-signups/types";
import type { AdminParentForm } from "@/lib/school-admin/forms-documents/types";
import type { TeacherFormSignatureRow } from "@/lib/school-teacher/forms-documents/types";
import FormsDocumentsWorkspace from "./FormsDocumentsWorkspace";

type AdminFormsDocumentsPageProps = {
  organizationId: string;
  slug: string;
  staffMemberId: string | null;
  initialForms: AdminParentForm[];
  initialResponsesByFormId: Record<string, TeacherFormSignatureRow[]>;
  classroomOptions: TeacherClassroomOption[];
  initialFormId?: string;
};

function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

/** Admin → My School → Forms & Documents (Garden). */
export default function AdminFormsDocumentsPage(props: AdminFormsDocumentsPageProps) {
  const { theme } = useParentTheme();
  const { initialForms } = props;
  const subtitle = useMemo(() => {
    if (initialForms.length === 0) return "View all teacher forms and publish school-wide forms to classrooms.";
    const active = initialForms.filter((f) => f.status === "active").length;
    const drafts = initialForms.filter((f) => f.status === "draft").length;
    return [plural(initialForms.length, "form"), `${active} active`, drafts ? plural(drafts, "draft") : null]
      .filter(Boolean)
      .join(" · ");
  }, [initialForms]);

  return (
    <AdminGardenPage theme={theme} data-testid="admin-forms-documents-page">
      <Suspense fallback={<AdminGardenPageSkeleton label="Loading forms" layout="table" />}>
        <FormsDocumentsWorkspace
          category="general"
          {...props}
          header={({ onCreate }) => (
            <AdminGardenPageHeader
              kicker="My school"
              title={
                <>
                  Family <span className="text-[var(--sf-clay)]">forms</span>
                </>
              }
              subtitle={subtitle}
              actions={
                initialForms.length > 0 ? (
                  <button type="button" className={gBtnOutlineSm} onClick={onCreate} data-testid="forms-create">
                    <Plus className="h-4 w-4" aria-hidden />
                    Create form
                  </button>
                ) : null
              }
            />
          )}
          emptyState={{
            kicker: "Family forms",
            title: "Create your first form",
            createLabel: "Create form",
          }}
        />
      </Suspense>
    </AdminGardenPage>
  );
}
