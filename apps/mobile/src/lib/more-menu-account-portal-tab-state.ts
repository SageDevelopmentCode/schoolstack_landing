export function resolveMoreMenuAccountPortalTabState(input: {
  previewSession: unknown;
  sheetVisible: boolean;
  live: {
    portalOptionsEnabled: boolean;
    loading: boolean;
    showSwitcher: boolean;
    showAccountPortalSection: boolean;
  };
  preview: {
    loading: boolean;
    showPreviewAccountPortalSection: boolean;
  };
}): {
  accountPortalTabLoading: boolean;
  showAccountPortalTab: boolean;
  showAccountPortalSwitcher: boolean;
} {
  const previewEnabled = input.sheetVisible && Boolean(input.previewSession);

  if (input.previewSession) {
    const showSwitcher = input.preview.showPreviewAccountPortalSection;
    return {
      accountPortalTabLoading: input.preview.loading,
      showAccountPortalTab: previewEnabled && (input.preview.loading || showSwitcher),
      showAccountPortalSwitcher: showSwitcher,
    };
  }

  return {
    accountPortalTabLoading: input.live.loading,
    showAccountPortalTab:
      input.live.portalOptionsEnabled && (input.live.loading || input.live.showSwitcher),
    showAccountPortalSwitcher: input.live.showAccountPortalSection,
  };
}
