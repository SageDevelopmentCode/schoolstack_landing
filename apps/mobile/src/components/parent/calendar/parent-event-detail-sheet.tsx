import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StoryChip } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { formatEventTimeRange } from '@/lib/school-events/calendar-time';
import type { OrganizationEvent } from '@/lib/school-events/types';
import {
  eventTypeChipTone,
  formatLongEventDate,
  SCHOOL_EVENT_TYPE_LABELS,
} from '@/lib/parent/parent-calendar-agenda-utils';

type ParentEventDetailSheetProps = {
  visible: boolean;
  event: OrganizationEvent | null;
  onClose: () => void;
};

export function ParentEventDetailSheet({ visible, event, onClose }: ParentEventDetailSheetProps) {
  const theme = useParentTheme();
  const insets = useSafeAreaInsets();

  if (!event) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.white, paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View
            style={[
              styles.hero,
              {
                backgroundColor: theme.primarySoft,
                borderBottomColor: theme.line,
              },
            ]}>
            <View style={styles.heroTop}>
              <StoryChip
                tone={eventTypeChipTone(event.type)}
                label={SCHOOL_EVENT_TYPE_LABELS[event.type]}
              />
              <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
                <Ionicons name="close" size={22} color={theme.muted} />
              </Pressable>
            </View>
            <StoryDisplayHeading size="section" style={styles.title}>
              {event.title}
            </StoryDisplayHeading>
          </View>

          <View style={styles.details}>
            <DetailField theme={theme} label="Date" value={formatLongEventDate(event.date)} />
            <DetailField theme={theme} label="Time" value={formatEventTimeRange(event)} />
            {event.location ? (
              <DetailField theme={theme} label="Location" value={event.location} icon="location-outline" />
            ) : null}
            {event.description ? (
              <DetailField
                theme={theme}
                label="Details"
                value={event.description}
                muted
                multiline
              />
            ) : null}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function DetailField({
  theme,
  label,
  value,
  icon,
  multiline,
  muted,
}: {
  theme: ReturnType<typeof useParentTheme>;
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  multiline?: boolean;
  muted?: boolean;
}) {
  return (
    <View style={styles.detailField}>
      <Text style={[styles.detailKicker, { color: theme.muted }]}>{label}</Text>
      <View style={styles.detailValueRow}>
        {icon ? <Ionicons name={icon} size={14} color={theme.muted} style={styles.detailIcon} /> : null}
        <Text
          style={[
            styles.detailValue,
            multiline ? styles.detailValueMultiline : null,
            { color: muted ? theme.muted : theme.ink },
          ]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.six,
  },
  hero: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
  },
  details: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.five,
    gap: Spacing.four,
  },
  detailField: {
    gap: 6,
  },
  detailKicker: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  detailIcon: {
    marginTop: 2,
  },
  detailValue: {
    flex: 1,
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  detailValueMultiline: {
    fontFamily: StoryFonts.body,
    lineHeight: 22,
  },
});
