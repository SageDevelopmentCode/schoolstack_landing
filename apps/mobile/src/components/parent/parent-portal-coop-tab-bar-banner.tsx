import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { PARENT_FLOATING_TAB_BAR_HEIGHT } from '@/components/parent/parent-floating-tab-bar';

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
  const accent = useGardenAccent();
  const label = formatCoopTabBarBannerLabel(programLabel);

  return (
    <View pointerEvents="none" style={styles.bar}>
      <View
        accessible
        accessibilityRole="text"
        accessibilityLabel={label}
        style={styles.chip}>
        <Ionicons name="leaf" size={13} color={accent.clayDeep} />
        <Text style={[styles.text, { color: Garden.ink }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignSelf: 'stretch',
    width: '100%',
    height: PARENT_COOP_TAB_BAR_BANNER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
    height: 26,
    paddingHorizontal: 12,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: Garden.ink,
    backgroundColor: Garden.butter,
  },
  text: {
    flexShrink: 1,
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 12,
    lineHeight: 16,
  },
});

export function resolveParentBottomChromeHeight(showCoopBanner: boolean): number {
  return (
    PARENT_FLOATING_TAB_BAR_HEIGHT + (showCoopBanner ? PARENT_COOP_TAB_BAR_BANNER_HEIGHT : 0)
  );
}
