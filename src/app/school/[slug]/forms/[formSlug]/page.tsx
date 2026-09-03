import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ApplicationFormSetupRequired from "@/components/admissions/ApplicationFormSetupRequired";
import CanonicalApplyEntryClient from "@/components/admissions/CanonicalApplyEntryClient";
import { loadApplyProgramPickerData } from "@/components/admissions/ApplyProgramPicker";
import PublicApplicationFormClient from "@/components/admissions/PublicApplicationFormClient";
import type { ApplicationFormVersion } from "@/lib/admissions/application-form-schema";
import {
  getPublishedApplicationFormBySlug,
  isCanonicalApplyEntrySlug,
  listPublishedApplyForms,
} from "@/lib/admissions/application-forms";
import { getEnabledTourAuthEntryOption } from "@/lib/organization-settings/apply-auth-entry";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; formSlug: string }>;
};

type ResolvedApplyEntry =
  | ApplicationFormVersion
  | { kind: "picker"; forms: ApplicationFormVersion[] }
  | null;

function isApplyProgramPicker(
  entry: NonNullable<ResolvedApplyEntry>,
): entry is { kind: "picker"; forms: ApplicationFormVersion[] } {
  return "kind" in entry && entry.kind === "picker";
}

async function resolvePublishedApplyEntry(
  supabase: ReturnType<typeof createClient>,
  organizationId: string,
  formSlug: string,
): Promise<ResolvedApplyEntry> {
  if (!isCanonicalApplyEntrySlug(formSlug)) {
    return getPublishedApplicationFormBySlug(supabase, organizationId, formSlug);
  }

  const publishedApplyForms = await listPublishedApplyForms(supabase, organizationId);
  if (publishedApplyForms.length === 0) {
    return null;
  }
  if (publishedApplyForms.length === 1) {
    return publishedApplyForms[0];
  }

  return { kind: "picker" as const, forms: publishedApplyForms };
}

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

  const resolved = await resolvePublishedApplyEntry(supabase, org.id, formSlug);

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

  const resolved = await resolvePublishedApplyEntry(supabase, org.id, formSlug);

  if (!resolved) {
    notFound();
  }

  if (isApplyProgramPicker(resolved)) {
    const { programsById } = await loadApplyProgramPickerData(supabase, org.id);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const hasGuardianForOrg = user
      ? await userHasGuardianForOrg(supabase, user.id, org.id)
      : false;
    const tourEntryOption = getEnabledTourAuthEntryOption(org.features);

    return (
      <Suspense>
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
      </Suspense>
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
    <Suspense>
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
    </Suspense>
  );
}
