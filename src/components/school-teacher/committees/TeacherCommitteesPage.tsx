"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import PortalCommitteesPage from "@/components/portal-committees/PortalCommitteesPage";
import type { TeacherCommitteesInitialData } from "@/lib/committees/load-teacher-committees-data";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type TeacherCommitteesPageProps = {
  organizationId: string;
  schoolSlug: string;
  schoolName: string;
  branding: OrganizationBranding;
  staffName: string;
  previewMode?: boolean;
  initialData?: TeacherCommitteesInitialData;
};

function TeacherCommitteesPageFallback() {
  return (
    <div
      className="flex items-center justify-center gap-2 py-12 text-sm"
      style={{ color: "#65777F" }}
    >
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading committees…
    </div>
  );
}

export default function TeacherCommitteesPage(props: TeacherCommitteesPageProps) {
  const { staffName, ...rest } = props;

  return (
    <Suspense fallback={<TeacherCommitteesPageFallback />}>
      <PortalCommitteesPage
        {...rest}
        requesterName={staffName}
        apiNamespace="teacher-portal"
        operationalSurface="teacher_portal"
        showGradeField={false}
      />
    </Suspense>
  );
}
