import { StoryChip } from '@/components/story/story-chip';
import type { StoryChipTone } from '@/components/story/story-chip';
import type { StaffPortalLoginStatus } from '@/lib/school-admin/staff-labels';

type StaffPortalLoginBadgeProps = {
  status: StaffPortalLoginStatus | null | undefined;
  compact?: boolean;
};

function resolveChip(
  status: StaffPortalLoginStatus,
): { tone: StoryChipTone; label: string } {
  if (!status.accountLinked) {
    return { tone: 'warning', label: 'No account' };
  }
  if (!status.hasEverSignedIn) {
    return { tone: 'info', label: 'Never signed in' };
  }
  return { tone: 'success', label: 'Portal active' };
}

function formatLastSignIn(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function StaffPortalLoginBadge({ status, compact = false }: StaffPortalLoginBadgeProps) {
  if (!status) {
    return <StoryChip tone="info" label="—" />;
  }

  const chip = resolveChip(status);

  if (compact) {
    return <StoryChip tone={chip.tone} label={chip.label} />;
  }

  if (status.hasEverSignedIn && status.lastSignInAt) {
    return (
      <StoryChip
        tone={chip.tone}
        label={`${chip.label} · ${formatLastSignIn(status.lastSignInAt)}`}
      />
    );
  }

  return <StoryChip tone={chip.tone} label={chip.label} />;
}
