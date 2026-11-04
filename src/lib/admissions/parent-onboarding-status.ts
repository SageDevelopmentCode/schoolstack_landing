import type { SupabaseClient } from "@supabase/supabase-js";
import { listFamilyChildrenForHomeByFamilyId } from "@/lib/admissions/family-preview-access";
import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";
import { listChargesForFamily } from "@/lib/tuition/charges";
import { familyHasOpenTuitionInstallments } from "@/lib/tuition/family-checklist-responses";
import {
  getAutoCompletionType,
  getParentOnboardingItems,
  resolveParentOnboardingItems,
  type ParentOnboardingCompletionStatus,
  type ResolvedParentOnboardingItem,
} from "@/lib/organization-settings/parent-onboarding";
import type {
  OrganizationFeatures,
  ParentOnboardingItem,
} from "@/lib/organization-settings/types";
import { familyHasAnyAuthorizedPickupContacts } from "@/lib/authorized-pickup/family-has-pickup-contacts";
import { loadStudentHealthProfilesForStudents } from "@/lib/student-health/load-student-health-profile";
import {
  emptyStudentHealthProfile,
  studentHasStandingHealthItems,
} from "@/lib/student-health/types";

function needsBillingCheck(items: ParentOnboardingItem[]): boolean {
  return items.some((item) => getAutoCompletionType(item.target) === "billing");
}

function needsMessagesCheck(items: ParentOnboardingItem[]): boolean {
  return items.some((item) => getAutoCompletionType(item.target) === "messages");
}

function needsCommitteesCheck(items: ParentOnboardingItem[]): boolean {
  return items.some((item) => getAutoCompletionType(item.target) === "committees");
}

function needsChildrenCheck(items: ParentOnboardingItem[]): boolean {
  return items.some((item) => getAutoCompletionType(item.target) === "children");
}

function needsHealthCheck(items: ParentOnboardingItem[]): boolean {
  return items.some((item) => getAutoCompletionType(item.target) === "health");
}

function needsPickupCheck(items: ParentOnboardingItem[]): boolean {
  return items.some((item) => getAutoCompletionType(item.target) === "pickup");
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

async function checkChildrenPhotosComplete(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
  familyChildren?: FamilyChildOverview[],
): Promise<boolean> {
  const children =
    familyChildren ??
    (await listFamilyChildrenForHomeByFamilyId(supabase, organizationId, familyId));
  const uploadableChildren = children.filter((child) => child.studentId);

  if (uploadableChildren.length === 0) return false;

  return uploadableChildren.some((child) => Boolean(child.profilePhotoUrl?.trim()));
}

async function checkHealthComplete(
  supabase: SupabaseClient,
  organizationId: string,
  familyChildren: FamilyChildOverview[],
): Promise<boolean> {
  const studentIds = familyChildren
    .map((child) => child.studentId)
    .filter((studentId): studentId is string => Boolean(studentId));

  if (studentIds.length === 0) return false;

  const profiles = await loadStudentHealthProfilesForStudents(
    supabase,
    organizationId,
    studentIds,
  );

  return studentIds.some((studentId) =>
    studentHasStandingHealthItems(profiles[studentId] ?? emptyStudentHealthProfile()),
  );
}

async function checkPickupComplete(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
  familyChildren: FamilyChildOverview[],
): Promise<boolean> {
  const studentIds = familyChildren
    .map((child) => child.studentId)
    .filter((studentId): studentId is string => Boolean(studentId));

  return familyHasAnyAuthorizedPickupContacts(
    supabase,
    organizationId,
    familyId,
    studentIds,
  );
}

export async function loadParentOnboardingStatus(input: {
  supabase: SupabaseClient;
  organizationId: string;
  familyId: string;
  userId: string;
  items: ParentOnboardingItem[];
  familyChildren?: FamilyChildOverview[];
  familyChildrenPromise?: Promise<FamilyChildOverview[]>;
}): Promise<ParentOnboardingCompletionStatus> {
  const status: ParentOnboardingCompletionStatus = {
    billing: false,
    messages: false,
    committees: false,
    children: false,
    health: false,
    pickup: false,
  };

  const familyChildrenPromise =
    input.familyChildrenPromise ??
    (input.familyChildren
      ? Promise.resolve(input.familyChildren)
      : listFamilyChildrenForHomeByFamilyId(
          input.supabase,
          input.organizationId,
          input.familyId,
        ));

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

  if (needsChildrenCheck(input.items)) {
    checks.push(
      familyChildrenPromise.then((familyChildren) =>
        checkChildrenPhotosComplete(
          input.supabase,
          input.organizationId,
          input.familyId,
          familyChildren,
        ),
      ).then((complete) => {
        status.children = complete;
      }),
    );
  }

  if (needsHealthCheck(input.items)) {
    checks.push(
      familyChildrenPromise
        .then((familyChildren) =>
          checkHealthComplete(input.supabase, input.organizationId, familyChildren),
        )
        .then((complete) => {
          status.health = complete;
        }),
    );
  }

  if (needsPickupCheck(input.items)) {
    checks.push(
      familyChildrenPromise
        .then((familyChildren) =>
          checkPickupComplete(
            input.supabase,
            input.organizationId,
            input.familyId,
            familyChildren,
          ),
        )
        .then((complete) => {
          status.pickup = complete;
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
  familyChildren?: FamilyChildOverview[];
  familyChildrenPromise?: Promise<FamilyChildOverview[]>;
}): Promise<ResolvedParentOnboardingItem[]> {
  const items = getParentOnboardingItems(input.features);
  const familyChildrenPromise =
    input.familyChildrenPromise ??
    (input.familyChildren
      ? Promise.resolve(input.familyChildren)
      : listFamilyChildrenForHomeByFamilyId(
          input.supabase,
          input.organizationId,
          input.familyId,
        ));

  const [familyChildren, completion] = await Promise.all([
    familyChildrenPromise,
    loadParentOnboardingStatus({
      supabase: input.supabase,
      organizationId: input.organizationId,
      familyId: input.familyId,
      userId: input.userId,
      items,
      familyChildrenPromise,
    }),
  ]);

  return resolveParentOnboardingItems({
    slug: input.slug,
    features: input.features,
    completion,
    previewBasePath: input.previewBasePath,
    familyChildren,
  });
}
