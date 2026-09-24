"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import FormsDocumentsWorkspace from "@/components/school-admin/forms-documents/FormsDocumentsWorkspace";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import { ParentThemeProvider } from "@/components/school-parent/ParentThemeContext";
import type { AdminParentForm } from "@/lib/school-admin/forms-documents/types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { TeacherClassroomOption } from "@/lib/classroom-signups/types";
import type { TeacherFormSignatureRow } from "@/lib/school-teacher/forms-documents/types";
import { reportClientOperationalError } from "@/lib/operational-errors-client";

const API_BASE = "/api/school-admin/forms-documents";

type TuitionFormsPanelProps = {
  organizationId: string;
  branding: OrganizationBranding;
  onFamiliesChanged?: () => void;
};

type TuitionFormsPanelData = {
  forms: AdminParentForm[];
  responsesByFormId: Record<string, TeacherFormSignatureRow[]>;
  classroomOptions: TeacherClassroomOption[];
  staffMemberId: string | null;
};

async function fetchTuitionFormsPanelData(
  organizationId: string,
): Promise<TuitionFormsPanelData> {
  const params = new URLSearchParams({
    organizationId,
    category: "tuition",
  });
  const response = await fetch(`${API_BASE}?${params}`);
  const payload = (await response.json()) as TuitionFormsPanelData & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load tuition forms.");
  }
  return {
    forms: payload.forms ?? [],
    responsesByFormId: payload.responsesByFormId ?? {},
    classroomOptions: payload.classroomOptions ?? [],
    staffMemberId: payload.staffMemberId ?? null,
  };
}

export default function TuitionFormsPanel({
  organizationId,
  branding,
  onFamiliesChanged,
}: TuitionFormsPanelProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const [data, setData] = useState<TuitionFormsPanelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextData = await fetchTuitionFormsPanelData(organizationId);
      setData(nextData);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Failed to load tuition forms.";
      setError(message);
      void reportClientOperationalError({
        organizationId,
        operation: "tuition.forms.load_panel",
        error: message,
      });
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadData();
    });
  }, [loadData]);

  if (loading) {
    return (
      <div
        data-testid="tuition-forms-loading"
        className="flex items-center justify-center gap-2 py-16 text-sm"
        style={{ color: theme.muted }}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading agreements…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border px-4 py-8 text-center" style={{ borderColor: theme.line }}>
        <p className="text-sm" style={{ color: theme.muted }}>
          {error ?? "Failed to load tuition forms."}
        </p>
      </div>
    );
  }

  return (
    <ParentThemeProvider branding={branding}>
      <Suspense
        fallback={
          <div
            className="flex items-center justify-center gap-2 py-12 text-sm"
            style={{ color: theme.muted }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading agreements…
          </div>
        }
      >
        <FormsDocumentsWorkspace
          organizationId={organizationId}
          staffMemberId={data.staffMemberId}
          initialForms={data.forms}
          initialResponsesByFormId={data.responsesByFormId}
          classroomOptions={data.classroomOptions}
          category="tuition"
          audienceMode="families_only"
          syncUrl={false}
          showCreatorFilter={false}
          containerClassName=""
          metricsLabels={{
            active: "Active agreements",
            pending: "Pending signatures",
            completed: "Signed this month",
          }}
          emptyState={{
            kicker: "Tuition agreements",
            title: "Create your first agreement",
            description:
              "Upload a service-for-tuition agreement or build a custom form, then assign it to specific families.",
            createLabel: "New agreement",
          }}
          onFamiliesChanged={onFamiliesChanged}
          header={({ onCreate }) => (
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <AdminSectionKicker theme={theme}>Tuition</AdminSectionKicker>
                <AdminDisplayHeading theme={theme} as="h2" size="section" className="mt-1">
                  Agreements
                </AdminDisplayHeading>
                <p className="mt-2 text-sm" style={{ color: theme.muted }}>
                  Publish agreements for families to review and sign from billing.
                </p>
              </div>
              <AdminButton
                theme={theme}
                variant="primary"
                data-testid="tuition-forms-new-agreement"
                onClick={onCreate}
              >
                <Plus className="h-4 w-4" />
                New agreement
              </AdminButton>
            </div>
          )}
        />
      </Suspense>
    </ParentThemeProvider>
  );
}
