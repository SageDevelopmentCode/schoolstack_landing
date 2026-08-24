import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import { formatEventTimeRange } from '@/lib/school-events/calendar-time';
import { getEventDisplayStyle, SCHOOL_EVENT_TYPE_LABELS } from '@/lib/school-events/event-labels';
import type { OrganizationEvent } from '@/lib/school-events/types';

type ParentEventDetailSheetProps = {
  visible: boolean;
  event: OrganizationEvent | null;
  onClose: () => void;
};

function formatLongEventDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(year, (month ?? 1) - 1, day ?? 1);
  return parsed.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ParentEventDetailSheet({ visible, event, onClose }: ParentEventDetailSheetProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();

  if (!event) return null;
  const colors = getEventDisplayStyle(event);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              Close
            </ThemedText>
          </Pressable>
          <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
            Event details
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View
            style={[
              styles.hero,
              {
                backgroundColor: `${colors.text}12`,
                borderBottomColor: `${colors.text}30`,
              },
            ]}>
            <View style={[styles.typeBadge, { backgroundColor: colors.bg }]}>
              <ThemedText type="badge" style={{ color: colors.text, fontSize: 10 }}>
                {SCHOOL_EVENT_TYPE_LABELS[event.type].toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText type="title" style={{ color: theme.textPrimary, marginTop: Spacing.two }}>
              {event.title}
            </ThemedText>
          </View>

          <View style={styles.details}>
            <DetailRow
              icon="calendar-outline"
              label="Date"
              value={formatLongEventDate(event.date)}
            />
            <DetailRow
              icon="time-outline"
              label="Time"
              value={formatEventTimeRange(event)}
            />
            {event.location ? (
              <DetailRow icon="location-outline" label="Location" value={event.location} />
            ) : null}
            {event.description ? (
              <DetailRow
                icon="document-text-outline"
                label="Description"
                value={event.description}
                multiline
              />
            ) : null}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function DetailRow({
  icon,
  label,
  value,
  multiline,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  multiline?: boolean;
}) {
  const theme = useAdminTheme();

  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLabelRow}>
        <Ionicons name={icon} size={16} color={theme.textTertiary} />
        <ThemedText type="smallBold" style={{ color: theme.textTertiary }}>
          {label}
        </ThemedText>
      </View>
      <ThemedText
        type="small"
        style={{ color: theme.textPrimary, lineHeight: multiline ? 20 : undefined }}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    paddingBottom: Spacing.six,
  },
  hero: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
    borderBottomWidth: 2,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
  },
  details: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  detailRow: {
    gap: Spacing.one,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
