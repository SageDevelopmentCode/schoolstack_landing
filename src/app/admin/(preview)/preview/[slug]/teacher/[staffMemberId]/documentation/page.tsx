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
import { staffPreviewBasePath } from "@/lib/staff/staff-preview-access";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; staffMemberId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isTeacherPortalEnabled(org.features)) {
    return { title: "Preview Not Found" };
  }

  return {
    title: `How-to guides · ${org.name} Staff Preview`,
  };
}

export default async function StaffTeacherPreviewDocumentationPage({
  params,
}: PageProps) {
  const { slug, staffMemberId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isTeacherPortalEnabled(org.features)) {
    notFound();
  }

  const teacherBasePath = staffPreviewBasePath(slug, staffMemberId);
  const documentationBasePath = teacherDocumentationPath(slug, { teacherBasePath });
  const bulletinEnabled = Boolean(org.features.admin?.bulletin);

  return (
    <Suspense fallback={null}>
      <TeacherDocumentationPage
        slug={slug}
        schoolName={org.name}
        branding={org.branding}
        features={org.features}
        bulletinEnabled={bulletinEnabled}
        teacherBasePath={teacherBasePath}
        documentationBasePath={documentationBasePath}
      />
    </Suspense>
  );
}
