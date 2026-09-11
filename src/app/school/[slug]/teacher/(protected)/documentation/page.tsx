import { cookies } from "next/headers";
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TeacherDocumentationPage from "@/components/school-teacher/TeacherDocumentationPage";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import {
  isTeacherPortalEnabled,
  teacherDocumentationPath,
} from "@/lib/organization-settings/teacher-routes";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isTeacherPortalEnabled(org.features)) {
    return { title: "School Not Found" };
  }

  return {
    title: `How-to guides · ${org.name} Staff Portal`,
  };
}

export default async function SchoolTeacherDocumentationRoute({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isTeacherPortalEnabled(org.features)) {
    notFound();
  }

  const documentationBasePath = teacherDocumentationPath(slug);
  const bulletinEnabled = Boolean(org.features.admin?.bulletin);

  return (
    <Suspense fallback={null}>
      <TeacherDocumentationPage
        slug={slug}
        schoolName={org.name}
        branding={org.branding}
        features={org.features}
        bulletinEnabled={bulletinEnabled}
        documentationBasePath={documentationBasePath}
      />
    </Suspense>
  );
}
