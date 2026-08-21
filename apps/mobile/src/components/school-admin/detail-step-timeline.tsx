import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';

export type DetailStepTimelineStatus = 'not_started' | 'in_progress' | 'completed' | 'waived';

export type DetailStepTimelineItem = {
  id: string;
  title: string;
  status: DetailStepTimelineStatus;
  kindLabel?: string;
  meta?: string;
  optional?: boolean;
};

type DetailStepTimelineProps = {
  items: DetailStepTimelineItem[];
  showStatusText?: boolean;
  rowSpacing?: number;
};

function statusLabel(status: DetailStepTimelineStatus): string {
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

function statusColor(status: DetailStepTimelineStatus, theme: ReturnType<typeof useAdminTheme>): string {
  switch (status) {
    case 'completed':
    case 'waived':
      return theme.success;
    case 'in_progress':
      return theme.info;
    default:
      return theme.textTertiary;
  }
}

function StepStatusDot({
  status,
  theme,
}: {
  status: DetailStepTimelineStatus;
  theme: ReturnType<typeof useAdminTheme>;
}) {
  if (status === 'completed') {
    return (
      <View style={[styles.dotLarge, { backgroundColor: theme.success }]}>
        <ThemedText type="smallBold" style={{ color: '#FFFFFF', fontSize: 10 }}>
          ✓
        </ThemedText>
      </View>
    );
  }

  if (status === 'in_progress') {
    return (
      <View
        style={[
          styles.dotLarge,
          {
            backgroundColor: theme.accentLight,
            borderWidth: 2,
            borderColor: theme.accent,
          },
        ]}
      />
    );
  }

  if (status === 'waived') {
    return (
      <View
        style={[
          styles.dotLarge,
          { backgroundColor: theme.elevated, borderWidth: 1, borderColor: theme.border },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.dotLarge,
        { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
      ]}
    />
  );
}

export function DetailStepTimeline({
  items,
  showStatusText = true,
  rowSpacing = Spacing.three,
}: DetailStepTimelineProps) {
  const theme = useAdminTheme();

  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const connectorColor =
          item.status === 'completed' || item.status === 'waived'
            ? theme.success
            : item.status === 'in_progress'
              ? theme.accent
              : theme.border;

        return (
          <View key={item.id} style={styles.row}>
            <View style={styles.timelineColumn}>
              <StepStatusDot status={item.status} theme={theme} />
              {!isLast ? (
                <View style={[styles.connector, { backgroundColor: connectorColor }]} />
              ) : null}
            </View>
            <View
              style={[
                styles.content,
                !isLast && { paddingBottom: rowSpacing },
              ]}>
              <View style={styles.titleRow}>
                <ThemedText type="smallBold" style={{ color: theme.textPrimary, flex: 1 }}>
                  {index + 1}. {item.title}
                </ThemedText>
                {showStatusText ? (
                  <ThemedText type="small" style={{ color: statusColor(item.status, theme) }}>
                    {statusLabel(item.status)}
                  </ThemedText>
                ) : null}
              </View>
              {item.kindLabel ? (
                <ThemedText type="small" style={{ color: theme.textTertiary }}>
                  {item.kindLabel}
                  {item.optional ? ' · Optional' : ''}
                </ThemedText>
              ) : null}
              {item.meta ? (
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {item.meta}
                </ThemedText>
              ) : null}
            </View>
          </View>
        );
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
    gap: 12,
  },
  timelineColumn: {
    width: 28,
    alignItems: 'center',
  },
  dotLarge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connector: {
    flex: 1,
    width: 2,
    marginTop: 4,
    marginBottom: -4,
  },
  content: {
    flex: 1,
    paddingTop: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginBottom: 4,
  },
});
