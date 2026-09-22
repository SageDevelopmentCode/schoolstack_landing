import { getApiAuthHeaders, throwUnauthorized } from '@/lib/auth/auth-session';

const siteUrl = process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://trymudkitchen.com';

export type EnrollmentChecklistItemPatchBody = {
  responses?: Record<string, unknown>;
  signerName?: string;
  draft?: boolean;
  acknowledgeAgreementAmendment?: boolean;
  agreementSection?: {
    sectionId: string;
    signerName: string;
    consentValue?: string;
  };
};

export type EnrollmentChecklistItemPatchResult = {
  status?: string;
  responses?: Record<string, unknown>;
  resumeSectionId?: string;
};

export type EnrollmentChecklistCheckoutResult = {
  checkoutUrl: string;
};

async function fetchEnrollmentApi<T>(
  path: string,
  options?: { method?: string; body?: unknown },
): Promise<T> {
  const headers = await getApiAuthHeaders();
  if (!headers.Authorization) {
    throwUnauthorized();
  }

  const response = await fetch(`${siteUrl}${path}`, {
    method: options?.method ?? 'GET',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? 'Request failed.');
  }
  return payload;
}

export async function patchEnrollmentChecklistItem(
  instanceId: string,
  body: EnrollmentChecklistItemPatchBody,
): Promise<EnrollmentChecklistItemPatchResult> {
  return fetchEnrollmentApi<EnrollmentChecklistItemPatchResult>(
    `/api/admissions/enrollment-checklist-items/${encodeURIComponent(instanceId)}`,
    { method: 'PATCH', body },
  );
}

export async function createEnrollmentChecklistCheckout(
  instanceId: string,
  body?: { paymentMethod?: string },
): Promise<EnrollmentChecklistCheckoutResult> {
  return fetchEnrollmentApi<EnrollmentChecklistCheckoutResult>(
    `/api/admissions/enrollment-checklist-items/${encodeURIComponent(instanceId)}/checkout`,
    { method: 'POST', body: body ?? {} },
  );
}

export async function saveEnrollmentChecklistActiveItem(
  checklistId: string,
  templateItemId: string,
): Promise<void> {
  await fetchEnrollmentApi(
    `/api/admissions/enrollment-checklists/${encodeURIComponent(checklistId)}`,
    {
      method: 'PATCH',
      body: { lastActiveTemplateItemId: templateItemId },
    },
  );
}
