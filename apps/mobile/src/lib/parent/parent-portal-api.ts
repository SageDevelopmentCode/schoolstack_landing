import {
  assertApiAuthenticated,
  getApiAuthHeaders,
  throwUnauthorized,
} from '@/lib/auth/auth-session';
import { resolveChecklistProgress } from '@/lib/admissions/enrollment-checklist';
import type { ChildProfileData } from '@/lib/parent/parent-children-utils';
import type {
  Committee,
  ParentCommitteeBrowseItem,
  ParentCommitteeListItem,
} from '@/lib/parent/parent-committees-types';
import type {
  ClassroomSignupResponse,
  ParentClassroomSignupDetail,
  ParentClassroomSignupsPageBundle,
  ParentSignupAttentionItem,
} from '@/lib/parent/parent-classroom-signups-types';
import type { OrganizationBranding } from '@/lib/organization-settings/types';
import type { OrganizationEvent, ParentCalendarInitialData } from '@/lib/school-events/types';
import type { BulletinPost } from '@/lib/school-bulletin/types';

const siteUrl = process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://trymudkitchen.com';

type FetchParentApiOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
};

export async function fetchParentApi<T>(
  path: string,
  options: FetchParentApiOptions = {},
): Promise<T> {
  const response = await fetch(`${siteUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: await getApiAuthHeaders(options.body !== undefined),
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  await assertApiAuthenticated(response);
  if (!response.ok) {
    throw new Error(typeof payload.error === 'string' ? payload.error : 'Request failed.');
  }

  return payload;
}

/** Non-critical parent API fetch — 401 throws without signing the user out. */
export async function fetchParentApiSoft<T>(
  path: string,
  options: FetchParentApiOptions = {},
): Promise<T> {
  const response = await fetch(`${siteUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: await getApiAuthHeaders(options.body !== undefined),
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (response.status === 401) {
    throwUnauthorized();
  }
  if (!response.ok) {
    throw new Error(typeof payload.error === 'string' ? payload.error : 'Request failed.');
  }

  return payload;
}

export async function submitParentSupportRequest(
  input: import('@/lib/support-request').SubmitPortalSupportRequestInput,
): Promise<void> {
  const formData = new FormData();
  formData.append('organizationId', input.organizationId);
  formData.append('topic', input.topic);
  formData.append('description', input.description.trim());

  if (input.sourcePagePath?.trim()) {
    formData.append('sourcePagePath', input.sourcePagePath.trim());
  }

  for (const file of input.attachments ?? []) {
    formData.append('attachments', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType ?? 'application/octet-stream',
    } as unknown as Blob);
  }

  await fetchParentApiFormData('/api/parent-portal/support-requests', formData);
}

export async function fetchParentApiFormData<T>(
  path: string,
  formData: FormData,
  method: 'POST' | 'PATCH' = 'POST',
): Promise<T> {
  const response = await fetch(`${siteUrl}${path}`, {
    method,
    headers: await getApiAuthHeaders(false),
    body: formData,
  });

  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  await assertApiAuthenticated(response);
  if (!response.ok) {
    throw new Error(typeof payload.error === 'string' ? payload.error : 'Request failed.');
  }

  return payload;
}

export type FamilyUserProfile = {
  email: string;
  displayName: string;
  profilePhotoUrl: string | null;
};

export type FamilyChildOverview = {
  applicationId: string;
  studentId: string | null;
  studentName: string;
  profilePhotoUrl: string | null;
  grade: string | null;
  status: string;
  statusLabel: string;
  isEnrolled: boolean;
  checklistProgress: { completed: number; total: number } | null;
};

export type ParentQuickAction = {
  key: string;
  label: string;
  href: string;
  iconSlug: string;
  enabled: boolean;
};

export type ResolvedParentOnboardingItem = {
  id: string;
  label: string;
  icon?: string;
  target: string;
  href: string;
  completed: boolean;
  autoTracked: boolean;
};

export type EnrollmentAgreementAmendmentBannerItem = {
  applicationId: string;
  studentName: string;
  checklistItemLabel: string;
  amendmentNotice: string;
  enrollmentHref: string;
};

export type EnrollmentAgreementIncompleteBannerItem = {
  applicationId: string;
  studentName: string;
  checklistItemLabel: string;
  enrollmentHref: string;
};

export type ParentFormAttentionItem = {
  formId: string;
  formTitle: string;
  studentNames: string[];
  dueDate: string | null;
  formsHref: string;
};

export type ParentFormHomeSnapshotItem = {
  formId: string;
  formTitle: string;
  studentNames: string[];
  listStatus: 'needs_action' | 'signed';
  responseStatus: 'pending' | 'overdue' | 'signed';
  dueDate: string | null;
  signedAt: string | null;
  formsHref: string;
};

export type ParentFormHomeSnapshot = {
  counts: { all: number; needsAction: number; signed: number };
  items: ParentFormHomeSnapshotItem[];
  formsPageHref: string;
};

export type ParentHomeData = {
  branding: OrganizationBranding;
  schoolSlug: string;
  schoolName: string;
  organizationId: string;
  userProfile: FamilyUserProfile;
  familyChildren: FamilyChildOverview[];
  quickActions: ParentQuickAction[];
  onboardingItems: ResolvedParentOnboardingItem[];
  upcomingEvents: OrganizationEvent[];
  enrollmentAmendmentBannerItems: EnrollmentAgreementAmendmentBannerItem[];
  enrollmentIncompleteBannerItems?: EnrollmentAgreementIncompleteBannerItem[];
  formAttentionItems?: ParentFormAttentionItem[];
  formSnapshot?: ParentFormHomeSnapshot | null;
  bulletinEnabled: boolean;
  bulletinPosts: BulletinPost[];
};

export function normalizeParentHomeData(data: ParentHomeData): ParentHomeData {
  return {
    ...data,
    bulletinEnabled: data.bulletinEnabled ?? false,
    bulletinPosts: data.bulletinPosts ?? [],
  };
}

export async function fetchParentHomeData(
  organizationId: string,
  slug: string,
): Promise<ParentHomeData> {
  const query = new URLSearchParams({ organizationId, slug }).toString();
  const payload = await fetchParentApi<ParentHomeData>(`/api/parent-portal/home?${query}`);
  return normalizeParentHomeData(payload);
}

export type ParentAssignedTeacher = {
  id: string;
  name: string;
  roleTitle: string | null;
  profilePhotoUrl: string | null;
};

export async function fetchAssignedTeachersForStudent(
  organizationId: string,
  studentId: string,
): Promise<ParentAssignedTeacher[]> {
  const query = new URLSearchParams({ organizationId }).toString();
  const payload = await fetchParentApiSoft<{ teachers: ParentAssignedTeacher[] }>(
    `/api/parent-portal/students/${encodeURIComponent(studentId)}/teachers?${query}`,
  );
  return payload.teachers ?? [];
}

export async function fetchParentChildProfile(
  applicationId: string,
  organizationId: string,
): Promise<ChildProfileData> {
  const query = new URLSearchParams({ organizationId }).toString();
  const payload = await fetchParentApi<{ profile: ChildProfileData }>(
    `/api/parent-portal/children/${encodeURIComponent(applicationId)}/profile?${query}`,
  );
  if (!payload.profile?.application) {
    throw new Error('Could not load this student profile.');
  }
  const profile = payload.profile;
  return {
    ...profile,
    application: {
      ...profile.application,
      feeStatus: profile.application.feeStatus ?? 'not_required',
    },
    checklist: profile.checklist
      ? {
          ...profile.checklist,
          progress: resolveChecklistProgress(profile.checklist),
        }
      : null,
  };
}

export type ParentCalendarData = ParentCalendarInitialData & {
  timezone: string;
};

export async function fetchParentCalendarData(
  organizationId: string,
  slug: string,
): Promise<ParentCalendarData> {
  const query = new URLSearchParams({ organizationId, slug }).toString();
  return fetchParentApi<ParentCalendarData>(`/api/parent-portal/calendar?${query}`);
}

export async function fetchParentMessagesUnreadCount(
  organizationId: string,
  schoolName: string,
): Promise<number> {
  const query = new URLSearchParams({ organizationId, schoolName }).toString();
  const payload = await fetchParentApi<{ unreadCount?: number }>(
    `/api/parent-portal/messages/unread-count?${query}`,
  );
  return payload.unreadCount ?? 0;
}

export type ChargeStatus =
  | 'scheduled'
  | 'sent'
  | 'paid'
  | 'overdue'
  | 'waived'
  | 'void';

export type ChargeType = 'tuition' | 'fee' | 'adjustment_credit' | 'late_fee';

export type TuitionCharge = {
  id: string;
  organizationId: string;
  assignmentId: string;
  familyId: string;
  guardianId: string | null;
  label: string;
  baseAmountCents: number;
  amountCents: number;
  paidCents: number;
  currency: string;
  dueDate: string;
  status: ChargeStatus;
  chargeType: ChargeType;
  installmentNumber: number | null;
  sentAt: string | null;
  paidAt: string | null;
  createdAt: string;
};

export type ParentTuitionPaymentRecord = {
  id: string;
  organizationId: string;
  familyId: string;
  tuitionChargeId: string | null;
  label: string | null;
  amountCents: number;
  chargedAmountCents: number | null;
  processingFeeCents: number | null;
  paymentMethodType: 'card' | 'us_bank_account' | null;
  stripeCheckoutSessionId: string | null;
  status: string;
  paidAt: string | null;
  createdAt: string;
  studentFirstName: string | null;
  enrollmentId: string | null;
};

export type SavedPaymentMethodSummary = {
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
};

export type FamilyBillingReadinessState =
  | 'ready'
  | 'needs_assignment'
  | 'needs_payment_plan'
  | 'no_charges';

export type FamilyBillingReadiness = {
  state: FamilyBillingReadinessState;
  enrollmentChecklistHref: string | null;
  childrenNames: string[];
};

export type ParentBillingNextCharge = {
  label: string;
  dueDate: string;
  amountCents: number;
};

export type TuitionPaymentPlanSummary = {
  id: string;
  organizationId: string;
  ratePlanId: string;
  name: string;
  installmentCount: number;
  installmentAmountCents: number;
  billingDayOfMonth: number | null;
  isDefault: boolean;
};

export type TuitionRateTierSummary = {
  id: string;
  label: string;
  amountCents: number;
  isDefault: boolean;
};

export type TuitionFeeComponentSummary = {
  id: string;
  label: string;
  amountCents: number;
  timing: 'enrollment' | 'first_installment' | 'annual';
};

export type TuitionEnrollmentAssignmentSummary = {
  id: string;
  organizationId: string;
  enrollmentId: string;
  familyId: string;
  ratePlanId: string;
  rateTierId: string | null;
  paymentPlanId: string;
  effectiveStart: string | null;
  effectiveEnd: string | null;
  status: string;
};

export type RatePlanWithDetailsSummary = {
  id: string;
  name: string;
  amountCents: number;
  effectiveStart: string | null;
  effectiveEnd: string | null;
  paymentPlans: TuitionPaymentPlanSummary[];
  feeComponents: TuitionFeeComponentSummary[];
  tiers: TuitionRateTierSummary[];
};

export type EnrollmentTuitionSelectionContext = {
  assignment: TuitionEnrollmentAssignmentSummary;
  ratePlan: RatePlanWithDetailsSummary;
};

export type FamilyTuitionSelectionItem = {
  studentName: string;
  context: EnrollmentTuitionSelectionContext;
};

export type TuitionAdjustment = {
  id: string;
  organizationId: string;
  assignmentId: string;
  scope: string;
  adjustmentType: string;
  valuePercent: number | null;
  valueCents: number | null;
  reason: string;
  status: string;
};

export type ParentBillingChildView = {
  childKey: string;
  studentName: string;
  assignmentId: string | null;
  annualTuitionCents: number;
  balanceDueCents: number;
  totalRemainingCents: number;
  nextCharge: ParentBillingNextCharge | null;
  nextChargeId: string | null;
  status: 'needs_schedule' | 'ready' | 'no_assignment';
  selectionItem: FamilyTuitionSelectionItem | null;
  paymentPlanLabel: string | null;
};

export type ParentBillingFamilySummary = {
  balanceDueCents: number;
  totalRemainingCents: number;
  familyTotalRemainingCents: number | null;
  annualTuitionCents: number;
  nextCharge: ParentBillingNextCharge | null;
  hasPendingSchedule: boolean;
  children: ParentBillingChildView[];
};

export type ParentBillingData = {
  branding: OrganizationBranding;
  schoolSlug: string;
  schoolName: string;
  organizationId: string;
  familyId: string;
  charges: TuitionCharge[];
  allFamilyCharges: TuitionCharge[];
  payments: ParentTuitionPaymentRecord[];
  adjustments: TuitionAdjustment[];
  readiness: FamilyBillingReadiness;
  familySummary: ParentBillingFamilySummary;
  autopayEnabled: boolean;
  savedPaymentMethod: SavedPaymentMethodSummary | null;
  recentAutopayFailure: { createdAt: string; summary: string } | null;
  guardianId: string | null;
  hasBillingSplit: boolean;
  initialChildKey: string | null;
  showTaxCreditPaymentBanner: boolean;
};

export type CheckoutPaymentMethod = 'card' | 'us_bank_account';

export async function fetchParentBillingData(
  organizationId: string,
  slug: string,
): Promise<ParentBillingData> {
  const query = new URLSearchParams({ organizationId, slug }).toString();
  return fetchParentApi<ParentBillingData>(`/api/parent-portal/billing?${query}`);
}

export async function createTuitionCheckout(
  chargeId: string,
  input: {
    paymentMethod: CheckoutPaymentMethod;
    orgSlug: string;
    amountCents?: number;
  },
): Promise<{ checkoutUrl: string }> {
  return fetchParentApi<{ checkoutUrl: string }>(
    `/api/tuition/charges/${chargeId}/checkout`,
    {
      method: 'POST',
      body: { ...input, returnTo: 'mobile' },
    },
  );
}

export async function createCombinedTuitionCheckout(input: {
  chargeIds: string[];
  paymentMethod: CheckoutPaymentMethod;
  orgSlug: string;
}): Promise<{ checkoutUrl: string }> {
  return fetchParentApi<{ checkoutUrl: string }>(
    '/api/tuition/charges/combined-checkout',
    {
      method: 'POST',
      body: { ...input, returnTo: 'mobile' },
    },
  );
}

export async function createPaymentMethodSetup(input: {
  organizationId: string;
  familyId: string;
  orgSlug: string;
}): Promise<{ checkoutUrl: string }> {
  return fetchParentApi<{ checkoutUrl: string }>('/api/tuition/payment-method/setup', {
    method: 'POST',
    body: { ...input, returnTo: 'mobile' },
  });
}

export async function setAutopayEnabled(input: {
  organizationId: string;
  familyId: string;
  enabled: boolean;
}): Promise<void> {
  await fetchParentApi('/api/tuition/autopay', {
    method: 'POST',
    body: input,
  });
}

export async function saveEnrollmentPaymentPlan(
  enrollmentId: string,
  paymentPlanId: string,
): Promise<void> {
  await fetchParentApi(`/api/tuition/enrollments/${enrollmentId}/payment-plan`, {
    method: 'POST',
    body: { paymentPlanId },
  });
}

export type ParentNotificationSettings = {
  familyId: string;
  loginEmail: string | null;
  configuredEmails: string[];
  effectiveEmails: string[];
  sources: string[];
};

export async function fetchParentNotificationSettings(
  organizationId: string,
): Promise<ParentNotificationSettings> {
  return fetchParentApi<ParentNotificationSettings>(
    `/api/parent-portal/notification-settings?organizationId=${encodeURIComponent(organizationId)}`,
  );
}

export async function updateParentNotificationSettings(
  organizationId: string,
  emails: string[],
): Promise<ParentNotificationSettings> {
  return fetchParentApi<ParentNotificationSettings>('/api/parent-portal/notification-settings', {
    method: 'PATCH',
    body: { organizationId, emails },
  });
}

export type {
  Committee,
  ParentCommitteeBrowseItem,
  ParentCommitteeListItem,
  ParentCommitteesData,
} from '@/lib/parent/parent-committees-types';

export async function fetchParentCommitteesBrowse(
  organizationId: string,
): Promise<ParentCommitteeBrowseItem[]> {
  const query = new URLSearchParams({ organizationId }).toString();
  const payload = await fetchParentApi<{ committees: ParentCommitteeBrowseItem[] }>(
    `/api/parent-portal/committees/browse?${query}`,
  );
  return payload.committees ?? [];
}

export async function fetchParentCommitteesMine(
  organizationId: string,
): Promise<ParentCommitteeListItem[]> {
  const query = new URLSearchParams({ organizationId }).toString();
  const payload = await fetchParentApi<{ committees: ParentCommitteeListItem[] }>(
    `/api/parent-portal/committees/mine?${query}`,
  );
  return payload.committees ?? [];
}

export async function fetchParentCommitteeWorkspace(
  organizationId: string,
  committeeId: string,
): Promise<Committee> {
  const query = new URLSearchParams({ organizationId }).toString();
  const payload = await fetchParentApi<{ committee: Committee }>(
    `/api/parent-portal/committees/${committeeId}?${query}`,
  );
  if (!payload.committee) {
    throw new Error('Committee not found.');
  }
  return payload.committee;
}

export type SubmitCommitteeJoinRequestInput = {
  organizationId: string;
  committeeId: string;
  schoolSlug: string;
  schoolName: string;
  committeeName: string;
  preferredDutyRoleId?: string | null;
  grade?: string | null;
  note?: string | null;
};

export async function submitCommitteeJoinRequest(
  input: SubmitCommitteeJoinRequestInput,
): Promise<void> {
  await fetchParentApi('/api/parent-portal/committees/join-requests', {
    method: 'POST',
    body: input,
  });
}

export async function withdrawCommitteeJoinRequest(
  requestId: string,
  organizationId: string,
  committeeName: string,
  guardianName: string,
): Promise<void> {
  const query = new URLSearchParams({
    organizationId,
    committeeName,
    guardianName,
  }).toString();
  await fetchParentApi(`/api/parent-portal/committees/join-requests/${requestId}?${query}`, {
    method: 'DELETE',
  });
}

export type {
  ClassroomSignup,
  ClassroomSignupResponse,
  ParentClassroomSignupDetail,
  ParentClassroomSignupsPageBundle,
  ParentSignupAttentionItem,
} from '@/lib/parent/parent-classroom-signups-types';

export async function fetchParentClassroomSignups(
  organizationId: string,
): Promise<ParentClassroomSignupsPageBundle> {
  const query = new URLSearchParams({ organizationId }).toString();
  return fetchParentApi<ParentClassroomSignupsPageBundle>(
    `/api/parent-portal/classroom-signups?${query}`,
  );
}

export async function fetchParentClassroomSignupDetail(
  organizationId: string,
  signupId: string,
): Promise<ParentClassroomSignupDetail> {
  const query = new URLSearchParams({ organizationId }).toString();
  return fetchParentApi<ParentClassroomSignupDetail>(
    `/api/parent-portal/classroom-signups/${encodeURIComponent(signupId)}?${query}`,
  );
}

export type SubmitParentClassroomSignupInput = {
  organizationId: string;
  studentId: string;
  selectedSlotIds?: string[];
  selectedRoleIds?: string[];
  note?: string | null;
};

export async function submitParentClassroomSignupResponse(
  signupId: string,
  input: SubmitParentClassroomSignupInput,
): Promise<ClassroomSignupResponse> {
  const payload = await fetchParentApi<{ response: ClassroomSignupResponse }>(
    `/api/parent-portal/classroom-signups/${encodeURIComponent(signupId)}`,
    {
      method: 'POST',
      body: input,
    },
  );
  if (!payload.response) {
    throw new Error('Failed to submit response.');
  }
  return payload.response;
}

export async function withdrawParentClassroomSignupResponse(
  organizationId: string,
  signupId: string,
): Promise<ClassroomSignupResponse> {
  const query = new URLSearchParams({ organizationId }).toString();
  const payload = await fetchParentApi<{ response: ClassroomSignupResponse }>(
    `/api/parent-portal/classroom-signups/${encodeURIComponent(signupId)}?${query}`,
    { method: 'DELETE' },
  );
  if (!payload.response) {
    throw new Error('Failed to withdraw response.');
  }
  return payload.response;
}

export async function fetchParentSignupAttentionItems(
  organizationId: string,
): Promise<ParentSignupAttentionItem[]> {
  const query = new URLSearchParams({ organizationId }).toString();
  const payload = await fetchParentApiSoft<{ items: ParentSignupAttentionItem[] }>(
    `/api/parent-portal/signups/attention?${query}`,
  );
  return payload.items ?? [];
}
