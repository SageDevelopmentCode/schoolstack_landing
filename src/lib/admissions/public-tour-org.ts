import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdmissionsOrgSettings } from "./admissions-org-settings";
import {
  isPublicTourEnabled,
  parsePublicTourPageSettings,
  resolvePublicTourFields,
  resolvePublicTourHeadline,
  resolvePublicTourIntro,
  type PublicTourFieldDefinition,
} from "./public-tour-settings";

export type PublicTourOrgContext = {
  organizationId: string;
  slug: string;
  name: string;
  enabled: boolean;
  headline: string;
  intro: string;
  fields: PublicTourFieldDefinition[];
};

export async function loadPublicTourOrgBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<PublicTourOrgContext | null> {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) return null;

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id, slug, name, status")
    .eq("slug", normalizedSlug)
    .maybeSingle();

  if (orgError) throw orgError;
  if (!org || org.status === "churned") return null;

  const admissions = await getAdmissionsOrgSettings(supabase, String(org.id));
  const publicTour = parsePublicTourPageSettings(admissions.publicTour);

  return {
    organizationId: String(org.id),
    slug: String(org.slug),
    name: String(org.name),
    enabled: isPublicTourEnabled(publicTour),
    headline: resolvePublicTourHeadline(publicTour),
    intro: resolvePublicTourIntro(publicTour),
    fields: resolvePublicTourFields(publicTour),
  };
}

export function publicTourConfigResponse(context: PublicTourOrgContext) {
  return {
    schoolName: context.name,
    schoolSlug: context.slug,
    headline: context.headline,
    intro: context.intro,
    fields: context.fields,
  };
}
