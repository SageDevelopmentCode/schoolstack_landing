import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ClassroomSignupTimeSlot } from '@/lib/parent/parent-classroom-signups-types';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type ParentClassroomSignupSlotCardProps = {
  slot: ClassroomSignupTimeSlot;
  fillCount: number;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  readOnly?: boolean;
};

function formatTimeRange(start: string, end: string): string {
  const format = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };
  return `${format(start)} – ${format(end)}`;
}

export function ParentClassroomSignupSlotCard({
  slot,
  fillCount,
  selected = false,
  disabled = false,
  onSelect,
  readOnly = false,
}: ParentClassroomSignupSlotCardProps) {
  const theme = useParentTheme();
  const isFull = fillCount >= slot.capacity;
  const isTaken = isFull && !selected;
  const interactive = !readOnly && onSelect && !isTaken;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !interactive || disabled }}
      disabled={!interactive || disabled}
      onPress={interactive ? onSelect : undefined}
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: selected ? theme.primary : '#DCE4DC',
          backgroundColor: selected ? theme.primarySoft : '#FFFFFF',
          opacity: isTaken ? 0.65 : 1,
        },
        pressed && interactive && { opacity: 0.9 },
      ]}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={[styles.label, { color: theme.ink }]}>{slot.label}</Text>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={14} color="#76828A" />
            <Text style={styles.time}>{formatTimeRange(slot.startTime, slot.endTime)}</Text>
          </View>
          {slot.date ? (
            <Text style={styles.date}>
              {new Date(`${slot.date}T12:00:00`).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          ) : null}
        </View>
        {selected ? (
          <View style={[styles.check, { backgroundColor: theme.primary }]}>
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          </View>
        ) : (
          <Text style={styles.fillCount}>
            {fillCount}/{slot.capacity}
          </Text>
        )}
      </View>
      {isTaken ? <Text style={styles.fullLabel}>Full</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 14,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    color: '#76828A',
  },
  date: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    color: '#76828A',
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fillCount: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    color: '#76828A',
  },
  fullLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    color: '#76828A',
  },
});
