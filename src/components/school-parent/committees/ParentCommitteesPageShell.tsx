"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { ParentCommitteesInitialData } from "@/lib/committees/load-parent-committees-data";
import ParentCommitteesPage from "./ParentCommitteesPage";

type ParentCommitteesPageShellProps = {
  organizationId: string;
  schoolSlug: string;
  schoolName: string;
  branding: OrganizationBranding;
  guardianName: string;
  previewMode?: boolean;
  initialData?: ParentCommitteesInitialData;
};

function ParentCommitteesPageFallback() {
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

export default function ParentCommitteesPageShell(props: ParentCommitteesPageShellProps) {
  return (
    <Suspense fallback={<ParentCommitteesPageFallback />}>
      <ParentCommitteesPage {...props} />
    </Suspense>
  );
}
