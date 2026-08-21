import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { DetailProgressBar } from '@/components/school-admin/detail-progress-bar';
import { StatusBadge } from '@/components/ui/status-badge';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import {
  applicationStatusBadgeStyle,
  enrollmentProgressBadgeStyle,
} from '@/lib/admissions/application-status-ui';
import {
  formatShortDate,
  type FamilyAdmissionTimelineEvent,
} from '@/lib/admissions/application-submissions';
import { Spacing } from '@/constants/theme';

type AdmissionHistoryTimelineProps = {
  events: FamilyAdmissionTimelineEvent[];
  currentApplicationId: string;
  currentApplicationStatus: string;
  onSelect: (applicationId: string) => void;
};

const TIMELINE_ICONS: Record<
  FamilyAdmissionTimelineEvent['kind'],
  keyof typeof Ionicons.glyphMap
> = {
  created: 'document-text-outline',
  draft: 'create-outline',
  submitted: 'send-outline',
  fee_paid: 'card-outline',
  enrollment: 'clipboard-outline',
};

function isViewingEvent(
  event: FamilyAdmissionTimelineEvent,
  events: FamilyAdmissionTimelineEvent[],
  currentApplicationId: string,
  currentApplicationStatus: string,
): boolean {
  if (event.applicationId !== currentApplicationId) {
    return false;
  }

  if (currentApplicationStatus === 'enrolling') {
    return event.kind === 'enrollment';
  }

  if (currentApplicationStatus === 'draft') {
    return event.kind === 'draft';
  }

  const appEvents = events.filter(
    (entry) => entry.applicationId === currentApplicationId && entry.kind !== 'enrollment',
  );
  const hasSubmitted = appEvents.some((entry) => entry.kind === 'submitted');
  const viewingKind = hasSubmitted ? 'submitted' : 'created';

  return event.kind === viewingKind;
}

function eventBadgeColors(
  event: FamilyAdmissionTimelineEvent,
  theme: ReturnType<typeof useAdminTheme>,
) {
  if (event.kind === 'enrollment' && event.enrollmentTone) {
    return enrollmentProgressBadgeStyle(event.enrollmentTone, theme);
  }

  if (event.applicationBadgeStatus) {
    return applicationStatusBadgeStyle(event.applicationBadgeStatus, theme);
  }

  return undefined;
}

export function AdmissionHistoryTimeline({
  events,
  currentApplicationId,
  currentApplicationStatus,
  onSelect,
}: AdmissionHistoryTimelineProps) {
  const theme = useAdminTheme();

  return (
    <View style={styles.container}>
      {events.map((event, index) => {
        const isViewing = isViewingEvent(
          event,
          events,
          currentApplicationId,
          currentApplicationStatus,
        );
        const iconName = TIMELINE_ICONS[event.kind];
        const badgeColors = eventBadgeColors(event, theme);
        const showConnector = index < events.length - 1;

        return (
          <View key={event.id} style={styles.row}>
            <View style={styles.iconColumn}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: isViewing ? theme.accentLight : theme.surface,
                    borderColor: isViewing ? theme.accent : theme.border,
                    borderWidth: isViewing ? 2 : 1,
                  },
                ]}>
                <Ionicons
                  name={iconName}
                  size={14}
                  color={isViewing ? theme.accent : theme.textTertiary}
                />
              </View>
              {showConnector ? (
                <View style={[styles.connector, { backgroundColor: theme.border }]} />
              ) : null}
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={isViewing}
              onPress={() => onSelect(event.applicationId)}
              style={[
                styles.card,
                {
                  borderColor: isViewing ? theme.accent : theme.border,
                  backgroundColor: isViewing ? theme.accentLight : theme.surface,
                  opacity: isViewing ? 1 : 0.95,
                },
              ]}>
              <ThemedText type="small" style={{ color: theme.textTertiary }}>
                {formatShortDate(event.occurredAt)}
              </ThemedText>

              <View style={styles.titleRow}>
                <ThemedText type="smallBold" style={{ color: theme.textPrimary, flex: 1 }}>
                  {event.title}
                </ThemedText>
                {event.statusLabel && badgeColors ? (
                  <StatusBadge label={event.statusLabel} colors={badgeColors} />
                ) : null}
                {isViewing ? (
                  <View style={[styles.viewingPill, { backgroundColor: theme.surface }]}>
                    <ThemedText type="smallBold" style={{ color: theme.accent, fontSize: 10 }}>
                      Viewing
                    </ThemedText>
                  </View>
                ) : null}
              </View>

              {event.subtitle ? (
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {event.subtitle}
                </ThemedText>
              ) : null}

              {event.kind === 'enrollment' && event.enrollmentProgress ? (
                <View style={styles.progressWrap}>
                  <DetailProgressBar
                    completed={event.enrollmentProgress.completed}
                    total={event.enrollmentProgress.total}
                    label="Required items"
                  />
                </View>
              ) : event.progressLabel ? (
                <ThemedText type="small" style={{ color: theme.textTertiary }}>
                  {event.progressLabel}
                </ThemedText>
              ) : null}
            </Pressable>
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
    gap: Spacing.three,
  },
  iconColumn: {
    alignItems: 'center',
    width: 28,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  connector: {
    width: 1,
    flex: 1,
    minHeight: 16,
    marginVertical: 4,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: 4,
    marginBottom: Spacing.three,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: 2,
  },
  viewingPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  progressWrap: {
    marginTop: Spacing.two,
  },
});
