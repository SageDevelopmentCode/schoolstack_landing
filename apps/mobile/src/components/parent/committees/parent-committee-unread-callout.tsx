import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

function formatUnreadBadge(count: number): string {
  if (count > 99) return '99+';
  return String(count);
}

type ParentCommitteeUnreadCalloutProps = {
  unreadCount: number;
  sectionLabels?: string[];
};

export function ParentCommitteeUnreadCallout({
  unreadCount,
  sectionLabels,
}: ParentCommitteeUnreadCalloutProps) {
  const theme = useParentTheme();
  const primaryLabel =
    unreadCount === 1 ? '1 unread update' : `${unreadCount} unread updates`;
  const sectionsHint =
    sectionLabels && sectionLabels.length > 0 ? sectionLabels.join(' · ') : null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.primarySoft,
          borderColor: `${theme.primary}33`,
        },
      ]}
      accessibilityLabel={`${primaryLabel}${sectionsHint ? `: ${sectionsHint}` : ''}`}>
      <View style={[styles.iconWrap, { backgroundColor: theme.white }]}>
        <Ionicons name="notifications-outline" size={16} color={theme.primary} />
      </View>
      <View style={styles.copyBlock}>
        <Text style={[styles.primaryLabel, { color: theme.ink }]}>{primaryLabel}</Text>
        {sectionsHint ? (
          <Text style={[styles.sectionsHint, { color: theme.muted }]}>{sectionsHint}</Text>
        ) : null}
      </View>
      <View style={[styles.countPill, { backgroundColor: theme.primary }]}>
        <Text style={styles.countText}>{formatUnreadBadge(unreadCount)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    marginBottom: Spacing.three,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  primaryLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionsHint: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  countPill: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
