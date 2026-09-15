import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ClassroomSignupRole } from '@/lib/parent/parent-classroom-signups-types';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type ParentClassroomSignupRoleCardProps = {
  role: ClassroomSignupRole;
  fillCount: number;
  selected?: boolean;
  disabled?: boolean;
  onToggle?: () => void;
  readOnly?: boolean;
};

export function ParentClassroomSignupRoleCard({
  role,
  fillCount,
  selected = false,
  disabled = false,
  onToggle,
  readOnly = false,
}: ParentClassroomSignupRoleCardProps) {
  const theme = useParentTheme();
  const isFull = fillCount >= role.quantityNeeded;
  const isTaken = isFull && !selected;
  const interactive = !readOnly && onToggle && !isTaken;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !interactive || disabled }}
      disabled={!interactive || disabled}
      onPress={interactive ? onToggle : undefined}
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
          <Text style={[styles.name, { color: theme.ink }]}>{role.name}</Text>
          {role.description ? (
            <Text style={styles.description}>{role.description}</Text>
          ) : null}
        </View>
        {selected ? (
          <View style={[styles.check, { backgroundColor: theme.primary }]}>
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          </View>
        ) : (
          <Text style={styles.fillCount}>
            {fillCount}/{role.quantityNeeded}
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
  name: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    color: '#76828A',
    lineHeight: 18,
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
