import { useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePortalPreview } from '@/lib/portal-preview-gating';

/**
 * Portal screens sit inside their layout's SafeAreaView, which pads the top edge. This style
 * pulls a screen's background up under the status bar so the cream runs to the top of the phone.
 *
 * During an impersonation preview the layout draws the "Previewing as … · Exit preview" banner
 * at the top of the safe area, so the top bleed is skipped there; otherwise the screen would be
 * drawn over the banner and hide the only way out of the preview.
 *
 * `bottom: true` also runs the background under the home indicator (full-screen detail routes
 * with the tab bar hidden). That part is kept in previews; the banner only sits at the top.
 */
export function useStatusBarBleed(options?: { bottom?: boolean }): ViewStyle {
  const insets = useSafeAreaInsets();
  const { isPreview } = usePortalPreview();
  const bottom = options?.bottom ?? false;

  return useMemo(() => {
    const style: ViewStyle = isPreview
      ? {}
      : { marginTop: -insets.top, paddingTop: insets.top };
    if (bottom) style.marginBottom = -insets.bottom;
    return style;
  }, [bottom, insets.bottom, insets.top, isPreview]);
}
