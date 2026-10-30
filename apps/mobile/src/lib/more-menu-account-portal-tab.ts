import {
  useAccountPortalSwitcherVisibility,
} from '@/components/account-portal-switcher-panel';
import {
  usePreviewAccountPortalSwitcherVisibility,
} from '@/components/platform-admin/preview-account-portal-switcher-panel';
import { useAuth } from '@/contexts/auth-context';
import { resolveMoreMenuAccountPortalTabState } from '@/lib/more-menu-account-portal-tab-state';

export { resolveMoreMenuAccountPortalTabState } from '@/lib/more-menu-account-portal-tab-state';

export function useMoreMenuAccountPortalTab(
  organizationId: string | null | undefined,
  slug: string | null | undefined,
  sheetVisible: boolean,
): {
  accountPortalTabLoading: boolean;
  showAccountPortalTab: boolean;
  showAccountPortalSwitcher: boolean;
} {
  const { previewSession } = useAuth();
  const previewEnabled = sheetVisible && Boolean(previewSession);
  const liveEnabled = sheetVisible && !previewSession;

  const live = useAccountPortalSwitcherVisibility(organizationId, slug, liveEnabled);
  const preview = usePreviewAccountPortalSwitcherVisibility(previewEnabled);

  return resolveMoreMenuAccountPortalTabState({
    previewSession,
    sheetVisible,
    live,
    preview,
  });
}
