import type { SupabaseClient } from "@supabase/supabase-js";
import { APPLY_FORM_PUBLIC_SLUG } from "@/lib/admissions/application-forms";
import { ENROLLMENT_CHECKLIST_PATH } from "@/lib/admissions/enrollment-checklist-templates";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import {
  getOrganizationPaymentAccount,
  isPaymentReady,
  type OrganizationPaymentAccount,
} from "@/lib/stripe/organization-payment-account";

export type AdmissionsSetupStepId =
  | "programs"
  | "stripe"
  | "apply_form"
  | "enrollment_checklist"
  | "go_live";

export type AdmissionsSetupStepStatus =
  | "not_started"
  | "in_progress"
  | "completed";

export type AdmissionsSetupStep = {
  id: AdmissionsSetupStepId;
  title: string;
  description: string;
  status: AdmissionsSetupStepStatus;
  href: string;
};

export type AdmissionsSetupStatus = {
  steps: AdmissionsSetupStep[];
  completedCount: number;
  totalCount: number;
  firstIncompleteStepId: AdmissionsSetupStepId | null;
  applyFormPublicPath: string | null;
};

export type AdmissionsSetupRawData = {
  hasPrograms: boolean;
  paymentAccount: OrganizationPaymentAccount | null;
  applyFormStatus: "none" | "draft" | "published";
  applyFormPublicSlug: string | null;
  checklistStatus: "none" | "draft" | "published";
  checklistItemCount: number;
  hasSubmissions: boolean;
};

export function computeProgramsStepStatus(
  hasPrograms: boolean,
): AdmissionsSetupStepStatus {
  return hasPrograms ? "completed" : "not_started";
}

export function computeStripeStepStatus(
  account: OrganizationPaymentAccount | null,
): AdmissionsSetupStepStatus {
  if (!account?.stripeConnectAccountId) return "not_started";
  if (isPaymentReady(account)) return "completed";
  return "in_progress";
}

export function computeApplyFormStepStatus(
  status: "none" | "draft" | "published",
): AdmissionsSetupStepStatus {
  if (status === "published") return "completed";
  if (status === "draft") return "in_progress";
  return "not_started";
}

export function computeChecklistStepStatus(
  status: "none" | "draft" | "published",
  itemCount: number,
): AdmissionsSetupStepStatus {
  if (status === "published" && itemCount >= 1) return "completed";
  if (status === "draft" || status === "published") return "in_progress";
  return "not_started";
}

export function computeGoLiveStepStatus(
  applyFormPublished: boolean,
  checklistPublished: boolean,
  hasSubmissions: boolean,
): AdmissionsSetupStepStatus {
  if (!applyFormPublished || !checklistPublished) return "not_started";
  if (hasSubmissions) return "completed";
  return "in_progress";
}

export function buildAdmissionsSetupStatus(
  slug: string,
  data: AdmissionsSetupRawData,
): AdmissionsSetupStatus {
  const programsStatus = computeProgramsStepStatus(data.hasPrograms);
  const stripeStatus = computeStripeStepStatus(data.paymentAccount);
  const applyFormStatus = computeApplyFormStepStatus(data.applyFormStatus);
  const checklistStatus = computeChecklistStepStatus(
    data.checklistStatus,
    data.checklistItemCount,
  );
  const applyFormPublished = data.applyFormStatus === "published";
  const checklistPublished =
    data.checklistStatus === "published" && data.checklistItemCount >= 1;
  const goLiveStatus = computeGoLiveStepStatus(
    applyFormPublished,
    checklistPublished,
    data.hasSubmissions,
  );

  const flowsPath = schoolAdminPath(slug, "admissions", "flows");
  const steps: AdmissionsSetupStep[] = [
    {
      id: "programs",
      title: "Set up programs",
      description:
        "Add the programs families can apply to, such as grade levels or school years.",
      status: programsStatus,
      href: schoolAdminPath(slug, "admissions", "programs"),
    },
    {
      id: "stripe",
      title: "Connect Stripe",
      description:
        "Connect your school's Stripe account to collect application and enrollment fees.",
      status: stripeStatus,
      href: schoolAdminPath(slug, "admissions", "payments"),
    },
    {
      id: "apply_form",
      title: "Create your apply form",
      description:
        "Build the form families fill out when they apply to your school.",
      status: applyFormStatus,
      href: `${flowsPath}?flow=apply`,
    },
    {
      id: "enrollment_checklist",
      title: "Create enrollment checklist",
      description:
        "Set up the steps accepted families complete before enrollment is finalized.",
      status: checklistStatus,
      href: `${flowsPath}?flow=checklist`,
    },
    {
      id: "go_live",
      title: "Go live",
      description:
        "Share your apply link with families and review incoming submissions.",
      status: goLiveStatus,
      href: schoolAdminPath(slug, "admissions", "submissions"),
    },
  ];

  const completedCount = steps.filter((step) => step.status === "completed").length;
  const firstIncompleteStepId =
    steps.find((step) => step.status !== "completed")?.id ?? null;

  const applyFormPublicPath =
    applyFormPublished && data.applyFormPublicSlug
      ? `/school/${slug}/forms/${data.applyFormPublicSlug}`
      : null;

  return {
    steps,
    completedCount,
    totalCount: steps.length,
    firstIncompleteStepId,
    applyFormPublicPath,
  };
}

export async function fetchAdmissionsSetupStatus(
  supabase: SupabaseClient,
  organizationId: string,
  slug: string,
): Promise<AdmissionsSetupStatus> {
  const [
    programsResult,
    paymentAccount,
    applyFormResult,
    checklistResult,
    submissionsResult,
  ] = await Promise.all([
    supabase
      .from("programs")
      .select("id")
      .eq("organization_id", organizationId)
      .limit(1),
    getOrganizationPaymentAccount(supabase, organizationId),
    supabase
      .from("application_form_versions")
      .select("status, public_slug")
      .eq("organization_id", organizationId)
      .eq("public_slug", APPLY_FORM_PUBLIC_SLUG)
      .in("status", ["draft", "published"])
      .limit(1)
      .maybeSingle(),
    supabase
      .from("enrollment_checklist_templates")
      .select("id, status, enrollment_checklist_template_items(id)")
      .eq("organization_id", organizationId)
      .eq("enrollment_path", ENROLLMENT_CHECKLIST_PATH)
      .in("status", ["draft", "published"])
      .limit(1)
      .maybeSingle(),
    supabase
      .from("applications")
      .select("id")
      .eq("organization_id", organizationId)
      .limit(1),
  ]);

  if (programsResult.error) throw programsResult.error;
  if (applyFormResult.error) throw applyFormResult.error;
  if (checklistResult.error) throw checklistResult.error;
  if (submissionsResult.error) throw submissionsResult.error;

  const checklistRow = checklistResult.data as
    | {
        status?: string;
        enrollment_checklist_template_items?: Array<{ id: string }>;
      }
    | null;

  const rawData: AdmissionsSetupRawData = {
    hasPrograms: (programsResult.data ?? []).length > 0,
    paymentAccount,
    applyFormStatus: normalizeApplyFormStatus(applyFormResult.data?.status),
    applyFormPublicSlug:
      typeof applyFormResult.data?.public_slug === "string"
        ? applyFormResult.data.public_slug
        : null,
    checklistStatus: normalizeChecklistStatus(checklistRow?.status),
    checklistItemCount: checklistRow?.enrollment_checklist_template_items?.length ?? 0,
    hasSubmissions: (submissionsResult.data ?? []).length > 0,
  };

  return buildAdmissionsSetupStatus(slug, rawData);
}

function normalizeApplyFormStatus(
  status: string | undefined,
): "none" | "draft" | "published" {
  if (status === "draft" || status === "published") return status;
  return "none";
}

function normalizeChecklistStatus(
  status: string | undefined,
): "none" | "draft" | "published" {
  if (status === "draft" || status === "published") return status;
  return "none";
}
