import { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';
import {
  ADMISSIONS_TIME_SLOT_GROUPS,
  formatDateOnlyLabel,
  type AdmissionsAvailabilitySlotKey,
  type AdmissionsTimeSlotPeriod,
  availabilitySlotKey,
} from '@/lib/admissions/admissions-availability';

type TourSlotDaySheetProps = {
  visible: boolean;
  date: string | null;
  readOnly: boolean;
  openSlots: Set<AdmissionsAvailabilitySlotKey>;
  occupiedSlots: Set<AdmissionsAvailabilitySlotKey>;
  togglingKey: string | null;
  onClose: () => void;
  onToggleSlot: (timeSlot: string, open: boolean) => void;
};

export function TourSlotDaySheet({
  visible,
  date,
  readOnly,
  openSlots,
  occupiedSlots,
  togglingKey,
  onClose,
  onToggleSlot,
}: TourSlotDaySheetProps) {
  const theme = useParentTheme();
  const insets = useSafeAreaInsets();
  const [activePeriod, setActivePeriod] = useState<AdmissionsTimeSlotPeriod>('morning');

  const activeGroup = useMemo(
    () => ADMISSIONS_TIME_SLOT_GROUPS.find((group) => group.id === activePeriod) ?? ADMISSIONS_TIME_SLOT_GROUPS[0],
    [activePeriod],
  );

  if (!date) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: Story.paper, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: theme.line }]}>
          <Pressable accessibilityRole="button" onPress={onClose}>
            <Text style={[styles.headerAction, { color: theme.primary }]}>Done</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.ink }]}>Tour slots</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <StorySectionKicker style={styles.kicker}>Availability</StorySectionKicker>
          <StoryDisplayHeading size="section">{formatDateOnlyLabel(date)}</StoryDisplayHeading>
          <Text style={[styles.helperCopy, { color: theme.muted }]}>
            Tap a time to open or close it for family booking.
          </Text>

          <View style={styles.segmentRow}>
            {ADMISSIONS_TIME_SLOT_GROUPS.map((group) => {
              const active = group.id === activePeriod;
              return (
                <Pressable
                  key={group.id}
                  accessibilityRole="button"
                  onPress={() => setActivePeriod(group.id)}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: active ? theme.primarySoft : theme.white,
                      borderColor: active ? theme.primary : theme.line,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.segmentLabel,
                      { color: active ? theme.primary : theme.muted },
                    ]}>
                    {group.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.slotGrid}>
            {activeGroup.slots.map((timeSlot) => {
              const key = availabilitySlotKey(date, timeSlot);
              const isOpen = openSlots.has(key);
              const isBooked = occupiedSlots.has(key);
              const isToggling = togglingKey === key;
              const disabled = readOnly || isBooked;

              return (
                <Pressable
                  key={timeSlot}
                  accessibilityRole="button"
                  disabled={disabled || isToggling}
                  onPress={() => onToggleSlot(timeSlot, !isOpen)}
                  style={[
                    styles.slotChip,
                    {
                      backgroundColor: isBooked
                        ? theme.warningBg
                        : isOpen
                          ? theme.primarySoft
                          : theme.white,
                      borderColor: isOpen ? theme.primary : theme.line,
                      opacity: disabled ? 0.7 : 1,
                    },
                  ]}>
                  {isToggling ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <Text
                      style={[
                        styles.slotLabel,
                        {
                          color: isBooked ? theme.warning : isOpen ? theme.primary : theme.muted,
                        },
                      ]}>
                      {timeSlot}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </Modal>
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
  headerSpacer: {
    width: 40,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  kicker: {
    marginBottom: 0,
  },
  helperCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  segment: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  segmentLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '700',
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  slotChip: {
    minWidth: '30%',
    flexGrow: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  slotLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '600',
  },
});
