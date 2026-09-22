import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { usePortalPreview } from '@/lib/portal-preview-gating';

const PORTAL_HOME_HEADER_HORIZONTAL_PADDING = SCREEN_HORIZONTAL_PADDING + Spacing.two;

type PortalHomeHeaderShellProps = {
  children: ReactNode;
};

export function PortalHomeHeaderShell({ children }: PortalHomeHeaderShellProps) {
  const theme = useParentTheme();
  const insets = useSafeAreaInsets();
  const { isPreview } = usePortalPreview();

  return (
    <LinearGradient
      colors={[theme.primaryDark, theme.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[
        styles.shell,
        isPreview
          ? {
              marginTop: 0,
              paddingTop: Spacing.four,
            }
          : {
              marginTop: -insets.top,
              paddingTop: insets.top + Spacing.four,
            },
      ]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  shell: {
    paddingHorizontal: PORTAL_HOME_HEADER_HORIZONTAL_PADDING,
    paddingBottom: Spacing.four,
  },
});
