export const MAX_FAMILY_NOTIFICATION_EMAILS = 3;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FamilyNotificationSource =
  | 'configured'
  | 'guardian_email'
  | 'primary_email'
  | 'auth_email';

export type FamilyNotificationEmailSettings = {
  loginEmail: string | null;
  configuredEmails: string[];
  effectiveEmails: string[];
  sources: FamilyNotificationSource[];
};

export type FamilyNotificationContext = {
  notification_emails?: string[] | null;
  primary_email?: string | null;
};

export type GuardianNotificationContext = {
  email?: string | null;
  user_id?: string | null;
};

export function dedupeEmails(emails: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of emails) {
    const email = raw.trim().toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);
    result.push(email);
  }
  return result;
}

export function normalizeNotificationEmails(input: string[]): {
  emails: string[];
  error: string | null;
} {
  const emails = dedupeEmails(input);

  if (emails.length > MAX_FAMILY_NOTIFICATION_EMAILS) {
    return {
      emails,
      error: `Add at most ${MAX_FAMILY_NOTIFICATION_EMAILS} notification emails.`,
    };
  }

  for (const email of emails) {
    if (!EMAIL_PATTERN.test(email)) {
      return {
        emails,
        error: `"${email}" is not a valid email address.`,
      };
    }
  }

  return { emails, error: null };
}

export function getDisplayNotificationEmails(
  configuredEmails: string[],
  loginEmail: string | null,
): string[] {
  if (configuredEmails.length > 0) {
    return configuredEmails;
  }

  const normalizedLogin = loginEmail?.trim().toLowerCase() ?? '';
  return normalizedLogin ? [normalizedLogin] : [];
}

export function resolveFamilyNotificationEmails(
  family: FamilyNotificationContext,
  _guardians: GuardianNotificationContext[],
  authEmails: string[] = [],
): { emails: string[]; sources: FamilyNotificationSource[] } {
  const configured = dedupeEmails(
    Array.isArray(family.notification_emails) ? family.notification_emails : [],
  );

  if (configured.length > 0) {
    return {
      emails: configured,
      sources: configured.map(() => 'configured' as const),
    };
  }

  const linkedAuthEmails = dedupeEmails(authEmails.filter(Boolean));
  if (linkedAuthEmails.length > 0) {
    return {
      emails: linkedAuthEmails,
      sources: linkedAuthEmails.map(() => 'auth_email' as const),
    };
  }

  return { emails: [], sources: [] };
}
