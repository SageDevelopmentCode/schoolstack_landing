import type { User } from '@supabase/supabase-js';
import { useMemo } from 'react';
import { useTeacherHome } from '@/contexts/teacher-home-context';
import { isTeacherFeatureEnabled } from '@/lib/teacher/teacher-features';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { MessagesAvatar } from '@/components/school-admin/messages/messages-avatar';
import { StoryCard } from '@/components/story/story-card';
import { StoryMoreMenuHeader } from '@/components/story/more/story-more-menu-header';
import { StoryMoreMenuIcon } from '@/components/story/more/story-more-menu-icon';
import { StoryMoreMenuItemRow } from '@/components/story/more/story-more-menu-item-row';
import { StoryMoreMenuItemsCard } from '@/components/story/more/story-more-menu-items-card';
import { StoryMoreMenuSheetShell } from '@/components/story/more/story-more-menu-sheet-shell';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { useAuth } from '@/contexts/auth-context';
import type { TeacherMoreMenuItemId } from '@/lib/teacher/teacher-nav';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type TeacherMoreMenuSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (itemId: TeacherMoreMenuItemId) => void;
  onSelectAccount: () => void;
};

const MENU_ITEMS: {
  id: TeacherMoreMenuItemId;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    id: 'committees',
    label: 'Committees',
    subtitle: 'Volunteer participation',
    icon: 'heart-outline',
    iconBg: '#FCE7F3',
    iconColor: '#DB2777',
  },
  {
    id: 'classroom-signups',
    label: 'Classroom signups',
    subtitle: 'Volunteer and event signups',
    icon: 'clipboard-outline',
    iconBg: '#E9F2EA',
    iconColor: '#3D6B4F',
  },
  {
    id: 'my-hours',
    label: 'My Hours',
    subtitle: 'Track your work hours',
    icon: 'time-outline',
    iconBg: '#EDE9FE',
    iconColor: '#7C3AED',
  },
  {
    id: 'attendance',
    label: 'Attendance',
    subtitle: 'Student attendance records',
    icon: 'clipboard-outline',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
  },
];

function getDisplayName(user: User): string {
  const fullName = user.user_metadata?.full_name;
  if (typeof fullName === 'string' && fullName.trim()) {
    return fullName.trim();
  }
  const emailLocalPart = user.email?.split('@')[0]?.trim();
  if (emailLocalPart) {
    return emailLocalPart;
  }
  return 'Account';
}

export function TeacherMoreMenuSheet({
  visible,
  onClose,
  onSelect,
  onSelectAccount,
}: TeacherMoreMenuSheetProps) {
  const theme = useParentTheme();
  const { user } = useAuth();
  const { data } = useTeacherHome();
  const displayName = useMemo(() => (user ? getDisplayName(user) : ''), [user]);
  const attendanceEnabled = isTeacherFeatureEnabled(data?.features, 'attendance');
  const committeesEnabled = isTeacherFeatureEnabled(data?.features, 'committees');
  const visibleMenuItems = useMemo(
    () =>
      MENU_ITEMS.filter((item) => {
        if (item.id === 'attendance') return attendanceEnabled;
        if (item.id === 'committees') return committeesEnabled;
        return true;
      }),
    [attendanceEnabled, committeesEnabled],
  );

  return (
    <StoryMoreMenuSheetShell visible={visible} onClose={onClose}>
      <StoryMoreMenuHeader
        kicker="Staff portal"
        title="More"
        subtitle="Classroom tools and account"
      />

      <StoryMoreMenuItemsCard>
        {visibleMenuItems.map((item, index) => (
          <StoryMoreMenuItemRow
            key={item.id}
            isFirst={index === 0}
            label={item.label}
            subtitle={item.subtitle}
            onPress={() => onSelect(item.id)}
            icon={
              <StoryMoreMenuIcon
                name={item.icon}
                iconBg={item.iconBg}
                iconColor={item.iconColor}
              />
            }
          />
        ))}
      </StoryMoreMenuItemsCard>

      {user ? (
        <StoryCard compact style={styles.accountCard}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Account for ${displayName}`}
            onPress={onSelectAccount}
            style={({ pressed }) => [styles.accountRow, pressed && styles.pressed]}>
            <MessagesAvatar name={displayName} color={theme.primary} size="md" />
            <View style={styles.accountCopy}>
              <Text style={[styles.accountName, { color: theme.ink }]}>{displayName}</Text>
              <Text style={[styles.accountMeta, { color: theme.muted }]}>Account settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.muted} />
          </Pressable>
        </StoryCard>
      ) : null}
    </StoryMoreMenuSheetShell>
  );
}

const styles = StyleSheet.create({
  accountCard: {
    padding: StoryCardPadding,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.85,
  },
  accountCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  accountName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  accountMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
});
