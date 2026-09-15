import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type StoryAttentionItemProps = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  iconBg?: string;
  urgent?: boolean;
  isFirst?: boolean;
};

export function StoryAttentionItem({
  icon,
  title,
  subtitle,
  iconBg,
  urgent = false,
  isFirst = false,
}: StoryAttentionItemProps) {
  const theme = useParentTheme();
  const showSubtitle = Boolean(subtitle?.trim());
  const resolvedIconBg = urgent ? `${theme.alert}22` : (iconBg ?? '#F7E5DE');

  const content = (
    <View style={[styles.row, showSubtitle ? styles.rowStart : styles.rowCenter]}>
      <View style={[styles.iconWrap, { backgroundColor: resolvedIconBg }]}>{icon}</View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.ink }]}>{title}</Text>
        {showSubtitle ? (
          <Text style={[styles.subtitle, { color: urgent ? theme.muted : '#76828A' }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );

  if (urgent) {
    return (
      <View
        style={[
          styles.urgentWrap,
          { backgroundColor: theme.alertBg, borderColor: `${theme.alert}40` },
        ]}>
        {content}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.defaultWrap,
        !isFirst && styles.defaultWrapBordered,
        { borderTopColor: '#E7EBE2' },
      ]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  rowStart: {
    alignItems: 'flex-start',
  },
  rowCenter: {
    alignItems: 'center',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  urgentWrap: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: Spacing.two,
  },
  defaultWrap: {
    paddingVertical: 12,
  },
  defaultWrapBordered: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
