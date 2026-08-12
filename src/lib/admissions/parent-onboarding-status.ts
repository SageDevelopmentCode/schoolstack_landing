import type { SupabaseClient } from "@supabase/supabase-js";
import { listChargesForFamily } from "@/lib/tuition/charges";
import { familyHasOpenTuitionInstallments } from "@/lib/tuition/family-checklist-responses";
import {
  getAutoCompletionType,
  getParentOnboardingItems,
  resolveParentOnboardingItems,
  type ParentOnboardingCompletionStatus,
  type ParentOnboardingItem,
  type ResolvedParentOnboardingItem,
} from "@/lib/organization-settings/parent-onboarding";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";

function needsBillingCheck(items: ParentOnboardingItem[]): boolean {
  return items.some((item) => getAutoCompletionType(item.target) === "billing");
}

function needsMessagesCheck(items: ParentOnboardingItem[]): boolean {
  return items.some((item) => getAutoCompletionType(item.target) === "messages");
}

function needsCommitteesCheck(items: ParentOnboardingItem[]): boolean {
  return items.some((item) => getAutoCompletionType(item.target) === "committees");
}

async function checkBillingComplete(
  supabase: SupabaseClient,
  familyId: string,
): Promise<boolean> {
  const charges = await listChargesForFamily(supabase, familyId);
  return !familyHasOpenTuitionInstallments(charges);
}

async function checkMessagesComplete(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("portal_messages")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("sender_user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}

async function checkCommitteesComplete(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("committee_members")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}

export async function loadParentOnboardingStatus(input: {
  supabase: SupabaseClient;
  organizationId: string;
  familyId: string;
  userId: string;
  items: ParentOnboardingItem[];
}): Promise<ParentOnboardingCompletionStatus> {
  const status: ParentOnboardingCompletionStatus = {
    billing: false,
    messages: false,
    committees: false,
  };

  const checks: Promise<void>[] = [];

  if (needsBillingCheck(input.items)) {
    checks.push(
      checkBillingComplete(input.supabase, input.familyId).then((complete) => {
        status.billing = complete;
      }),
    );
  }

  if (needsMessagesCheck(input.items)) {
    checks.push(
      checkMessagesComplete(
        input.supabase,
        input.organizationId,
        input.userId,
      ).then((complete) => {
        status.messages = complete;
      }),
    );
  }

  if (needsCommitteesCheck(input.items)) {
    checks.push(
      checkCommitteesComplete(
        input.supabase,
        input.organizationId,
        input.userId,
      ).then((complete) => {
        status.committees = complete;
      }),
    );
  }

  await Promise.all(checks);

  return status;
}

export async function loadResolvedParentOnboardingItems(input: {
  supabase: SupabaseClient;
  organizationId: string;
  familyId: string;
  userId: string;
  slug: string;
  features: OrganizationFeatures;
  previewBasePath?: string;
}): Promise<ResolvedParentOnboardingItem[]> {
  const items = getParentOnboardingItems(input.features);
  const completion = await loadParentOnboardingStatus({
    supabase: input.supabase,
    organizationId: input.organizationId,
    familyId: input.familyId,
    userId: input.userId,
    items,
  });

  return resolveParentOnboardingItems({
    slug: input.slug,
    features: input.features,
    completion,
    previewBasePath: input.previewBasePath,
  });
}
