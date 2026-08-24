import { useAdminTheme } from '@/contexts/admin-theme-context';
import type { StaffPortalLoginStatus } from '@/lib/school-admin/staff-labels';
import { StatusBadge } from '@/components/ui/status-badge';

type StaffPortalLoginBadgeProps = {
  status: StaffPortalLoginStatus | null | undefined;
  compact?: boolean;
};

function resolveBadgeColors(
  status: StaffPortalLoginStatus,
  theme: ReturnType<typeof useAdminTheme>,
): { backgroundColor: string; color: string } {
  if (!status.accountLinked) {
    return { backgroundColor: theme.warningBg, color: theme.warning };
  }
  if (!status.hasEverSignedIn) {
    return { backgroundColor: theme.infoBg, color: theme.info };
  }
  return { backgroundColor: theme.successBg, color: theme.success };
}

function resolveLabel(status: StaffPortalLoginStatus): string {
  if (!status.accountLinked) return 'No account';
  if (!status.hasEverSignedIn) return 'Never signed in';
  return 'Signed in';
}

function formatLastSignIn(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function StaffPortalLoginBadge({ status, compact = false }: StaffPortalLoginBadgeProps) {
  const theme = useAdminTheme();

  if (!status) {
    return <StatusBadge label="—" colors={{ backgroundColor: theme.elevated, color: theme.textTertiary }} />;
  }

  const colors = resolveBadgeColors(status, theme);
  const label = resolveLabel(status);

  if (compact) {
    return <StatusBadge label={label} colors={colors} />;
  }

  if (status.hasEverSignedIn && status.lastSignInAt) {
    return (
      <StatusBadge
        label={`${label} · ${formatLastSignIn(status.lastSignInAt)}`}
        colors={colors}
      />
    );
  }

  return <StatusBadge label={label} colors={colors} />;
}
