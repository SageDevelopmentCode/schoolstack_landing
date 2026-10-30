import {
  listApplicationFormSummaries,
} from "@/lib/admissions/application-forms";
import { listEnrollmentChecklistTemplates } from "@/lib/admissions/enrollment-checklist-templates";
import type { EnrollmentChecklistTemplate } from "@/lib/admissions/enrollment-checklist-templates";
import type { ApplicationFormVersion } from "@/lib/admissions/application-form-schema";
import {
  listProgramsDetailed,
  type ProgramStatus,
  type ProgramType,
} from "@/lib/admissions/programs";
import { orgPaymentsReadyForFees } from "@/lib/stripe/organization-payment-account";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export type EnrollmentFlowProgramSummary = {
  id: string;
  name: string;
  type: ProgramType;
  status: ProgramStatus;
  start_date: string | null;
  end_date: string | null;
};

export type EnrollmentFlowsListData = {
  forms: ApplicationFormVersion[];
  checklists: EnrollmentChecklistTemplate[];
  programs: EnrollmentFlowProgramSummary[];
  stripePaymentsReady: boolean;
};

export async function loadEnrollmentFlowsListData(
  organizationId: string,
): Promise<EnrollmentFlowsListData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [forms, checklists, programRows, stripePaymentsReady] = await Promise.all([
    listApplicationFormSummaries(supabase, organizationId),
    listEnrollmentChecklistTemplates(supabase, organizationId),
    listProgramsDetailed(supabase, organizationId),
    orgPaymentsReadyForFees(supabase, organizationId),
  ]);

  const programs: EnrollmentFlowProgramSummary[] = programRows.map((program) => ({
    id: program.id,
    name: program.name,
    type: program.type,
    status: program.status,
    start_date: program.start_date,
    end_date: program.end_date,
  }));

  return {
    forms,
    checklists,
    programs,
    stripePaymentsReady,
  };
}
