import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { getFirstParentNavPath } from "@/lib/organization-settings/parent-nav";
import {
  schoolParentPath,
  schoolProgramParentPath,
} from "@/lib/organization-settings/parent-routes";
import {
  loadProgramParentPortalContext,
} from "@/lib/admissions/program-parent-portal-access";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; programSlug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, programSlug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);
  const programContext = org
    ? await loadProgramParentPortalContext({
        supabase,
        organizationId: org.id,
        schoolSlug: slug,
        programSlug,
        orgFeatures: org.features,
      })
    : null;

  if (!org || !programContext) {
    return { title: "School Not Found" };
  }

  return {
    title: `${programContext.displayLabel} · ${org.name} Parent Portal`,
  };
}

export default async function SchoolProgramParentIndexPage({ params }: PageProps) {
  const { slug, programSlug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  const programContext = await loadProgramParentPortalContext({
    supabase,
    organizationId: org.id,
    schoolSlug: slug,
    programSlug,
    orgFeatures: org.features,
  });

  if (!programContext) {
    notFound();
  }

  const firstPath = getFirstParentNavPath(
    slug,
    programContext.effectiveFeatures.parent,
    programContext.effectiveFeatures.feature_nav?.parent,
    programContext.parentNavBasePath,
  );

  if (firstPath) {
    redirect(
      schoolProgramParentPath(
        slug,
        programSlug,
        firstPath.feature,
        firstPath.subtab,
      ),
    );
  }

  redirect(schoolParentPath(slug, "portal"));
}
