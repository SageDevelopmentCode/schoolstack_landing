import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  familyPreviewBasePath,
} from "@/lib/admissions/family-preview-access";
import {
  familyHasEnrolledAccess,
} from "@/lib/admissions/family-preview-server-cache";
import { isParentPortalEnabled } from "@/lib/organization-settings/parent-routes";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string; familyId: string }>;
};

export default async function FamilyPreviewParentLayout({
  children,
  params,
}: LayoutProps) {
  const { slug, familyId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  if (!isParentPortalEnabled(org.features)) {
    redirect(familyPreviewBasePath(slug, familyId));
  }

  const hasEnrolledAccess = await familyHasEnrolledAccess(
    supabase,
    org.id,
    familyId,
  );
  if (!hasEnrolledAccess) {
    redirect(familyPreviewBasePath(slug, familyId));
  }

  return children;
}
