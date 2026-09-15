import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryChip, type StoryChipTone } from '@/components/story/story-chip';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

export type StoryStepTimelineStatus = 'not_started' | 'in_progress' | 'completed' | 'waived';

export type StoryStepTimelineItem = {
  id: string;
  title: string;
  status: StoryStepTimelineStatus;
  kindLabel?: string;
  meta?: string;
  optional?: boolean;
};

type StoryStepTimelineProps = {
  items: StoryStepTimelineItem[];
  showStatusText?: boolean;
  onItemPress?: (id: string) => void;
  activeItemId?: string;
};

function statusLabel(status: StoryStepTimelineStatus): string {
  switch (status) {
    case 'completed':
      return 'Complete';
    case 'in_progress':
      return 'In progress';
    case 'waived':
      return 'Waived';
    default:
      return 'Not started';
  }
}

function statusTone(status: StoryStepTimelineStatus): StoryChipTone {
  switch (status) {
    case 'completed':
    case 'waived':
      return 'success';
    case 'in_progress':
      return 'info';
    default:
      return 'warning';
  }
}

function StepStatusIcon({
  status,
  theme,
}: {
  status: StoryStepTimelineStatus;
  theme: ReturnType<typeof useParentTheme>;
}) {
  if (status === 'completed' || status === 'waived') {
    return (
      <View style={[styles.iconWrap, { backgroundColor: `${theme.success}22` }]}>
        <Ionicons name="checkmark" size={16} color={theme.success} />
      </View>
    );
  }

  if (status === 'in_progress') {
    return (
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: theme.primarySoft,
            borderWidth: 2,
            borderColor: theme.primary,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.iconWrap,
        {
          backgroundColor: theme.white,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.line,
        },
      ]}
    />
  );
}

export function StoryStepTimeline({
  items,
  showStatusText = true,
  onItemPress,
  activeItemId,
}: StoryStepTimelineProps) {
  const theme = useParentTheme();

  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isActive = activeItemId === item.id;
        const subtitleParts = [
          item.kindLabel,
          item.optional ? 'Optional' : null,
        ].filter(Boolean);

        const rowContent = (
          <View
            style={[
              styles.row,
              !isFirst && styles.rowBordered,
              { borderTopColor: theme.line },
              isActive && { backgroundColor: theme.primarySoft },
            ]}>
            <StepStatusIcon status={item.status} theme={theme} />
            <View style={styles.copy}>
              <Text style={[styles.title, { color: theme.ink }]} numberOfLines={2}>
                {item.title}
              </Text>
              {subtitleParts.length > 0 ? (
                <Text style={[styles.subtitle, { color: theme.muted }]} numberOfLines={1}>
                  {subtitleParts.join(' · ')}
                </Text>
              ) : null}
              {item.meta ? (
                <Text style={[styles.meta, { color: theme.muted }]} numberOfLines={2}>
                  {item.meta}
                </Text>
              ) : null}
            </View>
            {showStatusText ? (
              <StoryChip tone={statusTone(item.status)} label={statusLabel(item.status)} />
            ) : null}
            {onItemPress ? (
              <Ionicons name="chevron-forward" size={16} color={theme.muted} />
            ) : null}
          </View>
        );

        if (onItemPress) {
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() => onItemPress(item.id)}
              style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
              {rowContent}
            </Pressable>
          );
        }

        return <View key={item.id}>{rowContent}</View>;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderRadius: 12,
    paddingHorizontal: 2,
  },
  rowBordered: {
    borderTopWidth: StyleSheet.hairlineWidth,
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
    gap: 2,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
});
