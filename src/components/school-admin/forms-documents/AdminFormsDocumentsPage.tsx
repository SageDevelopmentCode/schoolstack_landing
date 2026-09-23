"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
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
      <FormsDocumentsWorkspace category="general" {...props} />
    </Suspense>
  );
}
