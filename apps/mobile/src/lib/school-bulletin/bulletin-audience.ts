import type { BulletinAudience } from '@/lib/school-bulletin/types';

const VALID_AUDIENCES: BulletinAudience[] = ['school_wide', 'parents', 'teachers', 'program'];

export function normalizeBulletinAudiences(
  audiences: BulletinAudience[] | null | undefined,
): BulletinAudience[] {
  if (!audiences?.length) return ['school_wide'];
  const unique = [...new Set(audiences.filter((value) => VALID_AUDIENCES.includes(value)))];
  return unique.length > 0 ? unique : ['school_wide'];
}

export function normalizeBulletinProgramIds(programIds: string[] | null | undefined): string[] {
  if (!programIds?.length) return [];
  return [...new Set(programIds.map((id) => String(id)).filter(Boolean))];
}

const AUDIENCE_LABELS: Record<BulletinAudience, string> = {
  school_wide: 'School-wide',
  parents: 'All families',
  teachers: 'Teachers only',
  program: 'Program families',
};

export function formatBulletinAudiencesLabel(
  audiences: BulletinAudience[],
  programNameById: ReadonlyMap<string, string>,
  programIds: string[] = [],
): string {
  const normalizedAudiences = normalizeBulletinAudiences(audiences);
  const normalizedProgramIds = normalizeBulletinProgramIds(programIds);
  const parts: string[] = [];

  for (const audience of normalizedAudiences) {
    if (audience === 'parents' && normalizedProgramIds.length > 0) {
      for (const programId of normalizedProgramIds) {
        parts.push(`${programNameById.get(programId) ?? 'Program'} families`);
      }
      continue;
    }

    if (audience === 'program') {
      if (normalizedProgramIds.length === 0) {
        parts.push(AUDIENCE_LABELS.program);
      } else {
        for (const programId of normalizedProgramIds) {
          parts.push(`${programNameById.get(programId) ?? 'Program'} families`);
        }
      }
      continue;
    }

    parts.push(AUDIENCE_LABELS[audience]);
  }

  return parts.length > 0 ? parts.join(' · ') : 'School-wide';
}

export function resolveBulletinDisplayStatus(
  post: { status: string; publishedAt?: string; expiresAt?: string },
  now = new Date(),
) {
  if (post.status === 'archived') return 'archived' as const;
  if (post.status === 'draft') return 'draft' as const;

  if (post.publishedAt) {
    const publishedAt = new Date(post.publishedAt);
    if (publishedAt > now) return 'scheduled' as const;
  }

  if (post.expiresAt) {
    const expiresAt = new Date(post.expiresAt);
    if (expiresAt <= now) return 'expired' as const;
  }

  if (post.status === 'published') return 'active' as const;
  return 'draft' as const;
}

export function audiencesIncludeProgramTargeting(audiences: BulletinAudience[]): boolean {
  const normalized = normalizeBulletinAudiences(audiences);
  return normalized.includes('parents') || normalized.includes('program');
}

export function programSelectionRequired(audiences: BulletinAudience[]): boolean {
  return normalizeBulletinAudiences(audiences).includes('program');
}

export function toggleAudienceSelection(
  current: BulletinAudience[],
  audience: BulletinAudience,
): BulletinAudience[] {
  if (current.includes(audience)) {
    if (current.length === 1) return current;
    return current.filter((value) => value !== audience);
  }
  return [...current, audience];
}

export function toggleProgramSelection(current: string[], programId: string): string[] {
  if (current.includes(programId)) {
    return current.filter((id) => id !== programId);
  }
  return [...current, programId];
}

export function formatBulletinPostDate(value?: string): string {
  if (!value) return 'Not scheduled';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function toDateTimeLocalValue(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function fromDateTimeLocalValue(value: string): string | null {
  if (!value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export const AUDIENCE_OPTIONS: {
  value: BulletinAudience;
  label: string;
  description: string;
}[] = [
  {
    value: 'school_wide',
    label: 'School-wide',
    description: 'Visible to all families and teachers',
  },
  {
    value: 'parents',
    label: 'Parents',
    description: 'Families only; optionally limit to specific program portals',
  },
  {
    value: 'teachers',
    label: 'Teachers',
    description: 'Staff only',
  },
  {
    value: 'program',
    label: 'Program families',
    description: 'Families in selected program portals',
  },
];

export function displayStatusLabel(
  status: ReturnType<typeof resolveBulletinDisplayStatus>,
): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'scheduled':
      return 'Scheduled';
    case 'expired':
      return 'Expired';
    case 'archived':
      return 'Archived';
    default:
      return 'Draft';
  }
}

export function displayStatusTone(
  status: ReturnType<typeof resolveBulletinDisplayStatus>,
): 'success' | 'info' | 'warning' | 'alert' {
  switch (status) {
    case 'active':
      return 'success';
    case 'scheduled':
      return 'info';
    case 'expired':
      return 'warning';
    case 'archived':
      return 'alert';
    default:
      return 'info';
  }
}
