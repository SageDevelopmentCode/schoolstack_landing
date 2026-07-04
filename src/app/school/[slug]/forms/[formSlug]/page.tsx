import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PublicApplicationFormClient from "@/components/admissions/PublicApplicationFormClient";
import { getPublishedApplicationFormBySlug } from "@/lib/admissions/application-forms";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; formSlug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, formSlug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    return { title: "School Not Found" };
  }

  const form = await getPublishedApplicationFormBySlug(
    supabase,
    org.id,
    formSlug,
  );

  if (!form) {
    return { title: "Application Not Found" };
  }

  return {
    title: `${form.title} | ${org.name}`,
    description: form.intro ?? `Apply to ${org.name}`,
  };
}

export default async function PublicApplicationFormPage({ params }: PageProps) {
  const { slug, formSlug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  const form = await getPublishedApplicationFormBySlug(
    supabase,
    org.id,
    formSlug,
  );

  if (!form) {
    notFound();
  }

  return (
    <PublicApplicationFormClient
      branding={org.branding}
      schoolName={org.name}
      title={form.title}
      intro={form.intro}
      schema={form.schema}
      feeConfig={form.fee_config}
      organizationId={org.id}
      formVersionId={form.id}
    />
  );
}
