import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ApplicationFormSetupRequired from "@/components/admissions/ApplicationFormSetupRequired";
import CanonicalApplyEntryClient from "@/components/admissions/CanonicalApplyEntryClient";
import { loadProgramsByIdForApplyForms } from "@/components/admissions/ApplyProgramPicker";
import PublicApplicationFormClient from "@/components/admissions/PublicApplicationFormClient";
import { getEnabledTourAuthEntryOption } from "@/lib/organization-settings/apply-auth-entry";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import {
  isApplyProgramPicker,
  resolvePublishedApplyEntryCached,
} from "@/lib/admissions/resolve-published-apply-entry";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; formSlug: string }>;
};

async function userHasGuardianForOrg(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("guardians")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, formSlug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    return { title: "School Not Found" };
  }

  const resolved = await resolvePublishedApplyEntryCached(org.id, formSlug);

  if (!resolved) {
    return { title: "Application Not Found" };
  }

  if (isApplyProgramPicker(resolved)) {
    return {
      title: `Apply | ${org.name}`,
      description: `Choose a program to apply to ${org.name}.`,
    };
  }

  const form = resolved;
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

  const resolved = await resolvePublishedApplyEntryCached(org.id, formSlug);

  if (!resolved) {
    notFound();
  }

  if (isApplyProgramPicker(resolved)) {
    const [{ data: { user } }, programsById] = await Promise.all([
      supabase.auth.getUser(),
      loadProgramsByIdForApplyForms(supabase, org.id, resolved.forms),
    ]);
    const hasGuardianForOrg = user
      ? await userHasGuardianForOrg(supabase, user.id, org.id)
      : false;
    const tourEntryOption = getEnabledTourAuthEntryOption(org.features);

    return (
      <CanonicalApplyEntryClient
        branding={org.branding}
        schoolName={org.name}
        schoolSlug={slug}
        organizationId={org.id}
        forms={resolved.forms}
        programsById={programsById}
        tourEntryOption={tourEntryOption}
        serverAuthState={user ? "authenticated" : "unauthenticated"}
        hasGuardianForOrg={hasGuardianForOrg}
      />
    );
  }

  const form = resolved;

  if (!form.program_id) {
    return (
      <ApplicationFormSetupRequired
        branding={org.branding}
        schoolName={org.name}
        formTitle={form.title}
      />
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tourEntryOption = getEnabledTourAuthEntryOption(org.features);

  return (
    <PublicApplicationFormClient
      branding={org.branding}
      schoolName={org.name}
      schoolSlug={slug}
      title={form.title}
      intro={form.intro}
      schema={form.schema}
      feeConfig={form.fee_config}
      organizationId={org.id}
      formVersionId={form.id}
      shellLayout="embedded"
      serverAuthState={user ? "authenticated" : "unauthenticated"}
      tourEntryOption={tourEntryOption}
    />
  );
}
