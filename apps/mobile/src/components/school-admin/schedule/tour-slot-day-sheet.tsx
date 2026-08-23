import { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
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
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();
  const [activePeriod, setActivePeriod] = useState<AdmissionsTimeSlotPeriod>('morning');

  const activeGroup = useMemo(
    () => ADMISSIONS_TIME_SLOT_GROUPS.find((group) => group.id === activePeriod) ?? ADMISSIONS_TIME_SLOT_GROUPS[0],
    [activePeriod],
  );

  if (!date) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable accessibilityRole="button" onPress={onClose}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              Done
            </ThemedText>
          </Pressable>
          <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
            Tour slots
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title" style={{ color: theme.textPrimary }}>
            {formatDateOnlyLabel(date)}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textTertiary }}>
            Tap a time to open or close it for family booking.
          </ThemedText>

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
                      backgroundColor: active ? theme.accentLight : theme.surface,
                      borderColor: active ? theme.accent : theme.border,
                    },
                  ]}>
                  <ThemedText type="smallBold" style={{ color: active ? theme.accent : theme.textSecondary }}>
                    {group.label}
                  </ThemedText>
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
                          ? theme.accentLight
                          : theme.surface,
                      borderColor: isOpen ? theme.accent : theme.border,
                      opacity: disabled ? 0.7 : 1,
                    },
                  ]}>
                  {isToggling ? (
                    <ActivityIndicator size="small" color={theme.accent} />
                  ) : (
                    <ThemedText
                      type="small"
                      style={{
                        color: isBooked ? theme.warning : isOpen ? theme.accent : theme.textSecondary,
                      }}>
                      {timeSlot}
                    </ThemedText>
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
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
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
});
