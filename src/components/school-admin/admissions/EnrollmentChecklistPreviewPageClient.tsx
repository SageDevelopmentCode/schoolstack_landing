"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EnrollmentChecklistPreviewContent } from "./EnrollmentChecklistPreviewContent";
import { buildChecklistPreviewItems } from "@/lib/admissions/enrollment-checklist-variants";
import type { EnrollmentChecklistItem } from "@/lib/admissions/enrollment-checklist-schema";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type EnrollmentChecklistPreviewPageClientProps = {
  branding: OrganizationBranding;
  schoolName: string;
  slug: string;
  enrollmentPath: string;
  title: string;
  items: EnrollmentChecklistItem[];
  initialItemId?: string;
};

export default function EnrollmentChecklistPreviewPageClient({
  branding,
  schoolName,
  slug,
  enrollmentPath,
  title,
  items,
  initialItemId,
}: EnrollmentChecklistPreviewPageClientProps) {
  const C = buildAdminThemeTokens(branding);
  const previewItems = buildChecklistPreviewItems(items, initialItemId);
  const editorHref = `${schoolAdminPath(slug, "admissions", "flows")}?flow=checklist`;

  return (
    <div className="flex h-dvh flex-col">
      <EnrollmentChecklistPreviewContent
        branding={branding}
        schoolName={schoolName}
        slug={slug}
        enrollmentPath={enrollmentPath}
        title={title}
        items={previewItems}
        allItems={items}
        initialItemId={initialItemId}
        headerAction={
          <Link
            href={editorHref}
            className="flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium"
            style={getAdminButtonStyle(C, "neutral")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to editor
          </Link>
        }
      />
    </div>
  );
}
