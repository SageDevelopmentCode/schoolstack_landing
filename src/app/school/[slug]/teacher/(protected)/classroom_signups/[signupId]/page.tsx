import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  isTeacherFeatureEnabled,
  teacherClassroomSignupPath,
} from "@/lib/organization-settings/teacher-routes";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; signupId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isTeacherFeatureEnabled(org.features, "classroom_signups")) {
    return { title: "School Not Found" };
  }

  return {
    title: `Classroom signup · ${org.name} Teacher Portal`,
  };
}

export default async function TeacherClassroomSignupDetailRoute({
  params,
}: PageProps) {
  const { slug, signupId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isTeacherFeatureEnabled(org.features, "classroom_signups")) {
    notFound();
  }

  redirect(teacherClassroomSignupPath(slug, signupId));
}
