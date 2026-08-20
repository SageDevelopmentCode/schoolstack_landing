import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import type { AdmissionsSetupStepStatus } from '@/lib/school-admin/admissions-setup-status';

type SetupStepTimelineProps = {
  items: Array<{
    id: string;
    title: string;
    description: string;
    status: AdmissionsSetupStepStatus;
  }>;
  activeItemId: string | null;
};

function stepStatusLabel(status: AdmissionsSetupStepStatus): string {
  switch (status) {
    case 'completed':
      return 'Complete';
    case 'in_progress':
      return 'In progress';
    default:
      return 'Not started';
  }
}

export function SetupStepTimeline({ items, activeItemId }: SetupStepTimelineProps) {
  const theme = useAdminTheme();

  function stepStatusColor(status: AdmissionsSetupStepStatus): string {
    switch (status) {
      case 'completed':
        return theme.success;
      case 'in_progress':
        return theme.info;
      default:
        return theme.textTertiary;
    }
  }

  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const isActive = item.id === activeItemId;
        const isLast = index === items.length - 1;
        const isComplete = item.status === 'completed';

        return (
          <View key={item.id} style={styles.row}>
            <View style={styles.timelineColumn}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: theme.border },
                  isComplete && { backgroundColor: theme.success },
                  isActive && !isComplete && { backgroundColor: theme.accent },
                ]}
              />
              {!isLast ? <View style={[styles.line, { backgroundColor: theme.border }]} /> : null}
            </View>
            <View style={[styles.content, !isLast && styles.contentSpaced]}>
              <View style={styles.titleRow}>
                <ThemedText type="smallBold" style={{ color: theme.textPrimary, flex: 1 }}>
                  {item.title}
                </ThemedText>
                <ThemedText type="small" style={{ color: stepStatusColor(item.status) }}>
                  {stepStatusLabel(item.status)}
                </ThemedText>
              </View>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {item.description}
              </ThemedText>
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
    width: 16,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  line: {
    flex: 1,
    width: 2,
    marginTop: 4,
    marginBottom: -4,
  },
  content: {
    flex: 1,
  },
  contentSpaced: {
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
});
