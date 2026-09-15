import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
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
  const theme = useParentTheme();
  const insets = useSafeAreaInsets();

  if (!event) return null;
  const colors = getEventDisplayStyle(event);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: Story.paper, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: theme.line }]}>
          <Pressable accessibilityRole="button" onPress={onClose}>
            <Text style={[styles.headerAction, { color: theme.primary }]}>Close</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.ink }]}>Event details</Text>
          <Pressable accessibilityRole="button" onPress={onEdit}>
            <Text style={[styles.headerAction, { color: theme.primary }]}>Edit</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <StorySectionKicker style={styles.kicker}>School event</StorySectionKicker>
          <StoryDisplayHeading size="section">{event.title}</StoryDisplayHeading>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeLabel, { color: colors.text }]}>
              {SCHOOL_EVENT_TYPE_LABELS[event.type]}
            </Text>
          </View>

          <DetailRow label="Date" value={event.date} />
          <DetailRow label="Time" value={formatEventTimeRange(event)} />
          {event.location ? <DetailRow label="Location" value={event.location} /> : null}
          {event.description ? <DetailRow label="Description" value={event.description} /> : null}

          <Pressable
            accessibilityRole="button"
            disabled={deleting}
            onPress={onDelete}
            style={[styles.deleteButton, { borderColor: theme.alert }]}>
            <Text style={[styles.deleteLabel, { color: theme.alert }]}>
              {deleting ? 'Deleting…' : 'Delete event'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const theme = useParentTheme();
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: theme.ink }]}>{value}</Text>
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
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerAction: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  kicker: {
    marginBottom: 0,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
  },
  badgeLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '700',
  },
  detailRow: {
    gap: 4,
  },
  detailLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.44,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  deleteButton: {
    marginTop: Spacing.four,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  deleteLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '700',
  },
});
