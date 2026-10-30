import { resolveMoreMenuAccountPortalTabState } from '@/lib/more-menu-account-portal-tab-state';

describe('resolveMoreMenuAccountPortalTabState', () => {
  it('shows live account tab while portal options are loading', () => {
    const result = resolveMoreMenuAccountPortalTabState({
      previewSession: null,
      sheetVisible: true,
      live: {
        portalOptionsEnabled: true,
        loading: true,
        showSwitcher: false,
        showAccountPortalSection: false,
      },
      preview: { loading: false, showPreviewAccountPortalSection: false },
    });

    expect(result.accountPortalTabLoading).toBe(true);
    expect(result.showAccountPortalTab).toBe(true);
    expect(result.showAccountPortalSwitcher).toBe(false);
  });

  it('shows preview account tab while preview portal options are loading', () => {
    const result = resolveMoreMenuAccountPortalTabState({
      previewSession: { portal: 'parent' },
      sheetVisible: true,
      live: {
        portalOptionsEnabled: false,
        loading: false,
        showSwitcher: false,
        showAccountPortalSection: false,
      },
      preview: { loading: true, showPreviewAccountPortalSection: false },
    });

    expect(result.accountPortalTabLoading).toBe(true);
    expect(result.showAccountPortalTab).toBe(true);
    expect(result.showAccountPortalSwitcher).toBe(false);
  });

  it('hides preview account tab when sheet is closed', () => {
    const result = resolveMoreMenuAccountPortalTabState({
      previewSession: { portal: 'parent' },
      sheetVisible: false,
      live: {
        portalOptionsEnabled: false,
        loading: false,
        showSwitcher: false,
        showAccountPortalSection: false,
      },
      preview: { loading: true, showPreviewAccountPortalSection: false },
    });

    expect(result.showAccountPortalTab).toBe(false);
  });
});
