import { StyleSheet, Text, View } from 'react-native';

import { PARENT_FLOATING_TAB_BAR_HEIGHT } from '@/components/parent/parent-floating-tab-bar';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

export const PARENT_COOP_TAB_BAR_BANNER_HEIGHT = 34;

export function formatCoopTabBarBannerLabel(programLabel: string): string {
  const trimmed = programLabel.trim();
  if (!trimmed) return 'Viewing Co-op';
  if (/co-op/i.test(trimmed)) {
    return `Viewing ${trimmed}`;
  }
  return `Viewing ${trimmed} Co-op`;
}

export function shouldShowParentCoopTabBarBanner(input: {
  showSwitcher: boolean;
  hasActiveContext: boolean;
  coopMode: boolean;
  programLabel?: string;
}): boolean {
  if (!input.showSwitcher || !input.hasActiveContext) return false;
  if (!input.coopMode) return false;
  return Boolean(input.programLabel?.trim());
}

type ParentPortalCoopTabBarBannerProps = {
  programLabel: string;
};

export function ParentPortalCoopTabBarBanner({ programLabel }: ParentPortalCoopTabBarBannerProps) {
  const theme = useParentTheme();
  const label = formatCoopTabBarBannerLabel(programLabel);

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={label}
      style={[
        styles.bar,
        {
          backgroundColor: theme.primarySoft,
          borderColor: theme.line,
        },
      ]}>
      <Text style={[styles.text, { color: theme.primary }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    maxWidth: 400,
    height: PARENT_COOP_TAB_BAR_BANNER_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  text: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export function resolveParentBottomChromeHeight(showCoopBanner: boolean): number {
  return (
    PARENT_FLOATING_TAB_BAR_HEIGHT + (showCoopBanner ? PARENT_COOP_TAB_BAR_BANNER_HEIGHT : 0)
  );
}
