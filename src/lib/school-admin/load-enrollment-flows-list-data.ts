import {
  listApplicationFormSummaries,
  listPrograms,
} from "@/lib/admissions/application-forms";
import { listEnrollmentChecklistTemplates } from "@/lib/admissions/enrollment-checklist-templates";
import type { EnrollmentChecklistTemplate } from "@/lib/admissions/enrollment-checklist-templates";
import type { ApplicationFormVersion } from "@/lib/admissions/application-form-schema";
import type { ProgramOption } from "@/lib/admissions/programs";
import { orgPaymentsReadyForFees } from "@/lib/stripe/organization-payment-account";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export type EnrollmentFlowsListData = {
  forms: ApplicationFormVersion[];
  checklists: EnrollmentChecklistTemplate[];
  programs: ProgramOption[];
  stripePaymentsReady: boolean;
};

export async function loadEnrollmentFlowsListData(
  organizationId: string,
): Promise<EnrollmentFlowsListData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [forms, checklists, programs, stripePaymentsReady] = await Promise.all([
    listApplicationFormSummaries(supabase, organizationId),
    listEnrollmentChecklistTemplates(supabase, organizationId),
    listPrograms(supabase, organizationId),
    orgPaymentsReadyForFees(supabase, organizationId),
  ]);

  return {
    forms,
    checklists,
    programs,
    stripePaymentsReady,
  };
}
