import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import { formatEventTimeRange } from '@/lib/school-events/calendar-time';
import { getEventDisplayStyle, SCHOOL_EVENT_TYPE_LABELS } from '@/lib/school-events/event-labels';
import type { OrganizationEvent } from '@/lib/school-events/types';

type SchoolEventDetailSheetProps = {
  visible: boolean;
  event: OrganizationEvent | null;
  deleting: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function SchoolEventDetailSheet({
  visible,
  event,
  deleting,
  onClose,
  onEdit,
  onDelete,
}: SchoolEventDetailSheetProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();

  if (!event) return null;
  const colors = getEventDisplayStyle(event);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable accessibilityRole="button" onPress={onClose}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              Close
            </ThemedText>
          </Pressable>
          <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
            Event details
          </ThemedText>
          <Pressable accessibilityRole="button" onPress={onEdit}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              Edit
            </ThemedText>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title" style={{ color: theme.textPrimary }}>
            {event.title}
          </ThemedText>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <ThemedText type="small" style={{ color: colors.text }}>
              {SCHOOL_EVENT_TYPE_LABELS[event.type]}
            </ThemedText>
          </View>

          <DetailRow label="Date" value={event.date} />
          <DetailRow label="Time" value={formatEventTimeRange(event)} />
          {event.location ? <DetailRow label="Location" value={event.location} /> : null}
          {event.description ? <DetailRow label="Description" value={event.description} /> : null}

          <Pressable
            accessibilityRole="button"
            disabled={deleting}
            onPress={onDelete}
            style={[styles.deleteButton, { borderColor: theme.error }]}>
            <ThemedText type="smallBold" style={{ color: theme.error }}>
              {deleting ? 'Deleting…' : 'Delete event'}
            </ThemedText>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const theme = useAdminTheme();
  return (
    <View style={styles.detailRow}>
      <ThemedText type="smallBold" style={{ color: theme.textTertiary }}>
        {label}
      </ThemedText>
      <ThemedText type="small" style={{ color: theme.textPrimary }}>
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
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
  },
  detailRow: {
    gap: 4,
  },
  deleteButton: {
    marginTop: Spacing.four,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
});
