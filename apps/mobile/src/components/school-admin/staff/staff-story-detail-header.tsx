import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { StaffAvatar } from '@/components/school-admin/staff/staff-avatar';
import { StoryChip } from '@/components/story/story-chip';
import type { StoryChipTone } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { StaffEmploymentStatus } from '@/lib/school-admin-api';
import { employmentStatusLabel } from '@/lib/school-admin/staff-labels';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

function employmentChipTone(status: StaffEmploymentStatus): StoryChipTone {
  if (status === 'active') return 'success';
  if (status === 'on_leave') return 'info';
  return 'warning';
}

type StaffStoryDetailHeaderProps = {
  staffName: string;
  employmentStatus: StaffEmploymentStatus;
  subtitle: string;
  isEditing: boolean;
  saveLoading: boolean;
  actionLoading: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
};

export function StaffStoryDetailHeader({
  staffName,
  employmentStatus,
  subtitle,
  isEditing,
  saveLoading,
  actionLoading,
  onEdit,
  onCancel,
  onSave,
}: StaffStoryDetailHeaderProps) {
  const theme = useParentTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: Story.paper, borderBottomColor: Story.line }]}>
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to staff"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
          <Ionicons name="chevron-back" size={20} color={theme.primary} />
          <Text style={[styles.backLabel, { color: theme.primary }]}>Staff</Text>
        </Pressable>

        {!isEditing ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit staff member"
            disabled={actionLoading || saveLoading}
            onPress={onEdit}
            style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.7 }]}>
            <Text style={[styles.actionLabel, { color: theme.primary }]}>Edit profile</Text>
          </Pressable>
        ) : (
          <View style={styles.editActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel editing"
              disabled={saveLoading}
              onPress={onCancel}
              style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.7 }]}>
              <Text style={[styles.cancelLabel, { color: theme.muted }]}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save changes"
              disabled={saveLoading}
              onPress={onSave}
              style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.7 }]}>
              {saveLoading ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Text style={[styles.actionLabel, { color: theme.primary }]}>Save</Text>
              )}
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.hero}>
        <StaffAvatar name={staffName} size="lg" />
        <View style={styles.heroCopy}>
          <StorySectionKicker style={styles.kicker}>Staff record</StorySectionKicker>
          <View style={styles.titleRow}>
            <StoryDisplayHeading size="section" style={styles.title}>
              {staffName}
            </StoryDisplayHeading>
            <StoryChip
              tone={employmentChipTone(employmentStatus)}
              label={employmentStatusLabel(employmentStatus)}
            />
          </View>
          <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  actionButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
  actionLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
  },
  cancelLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  heroCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  kicker: {
    marginBottom: 0,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    flexShrink: 1,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
