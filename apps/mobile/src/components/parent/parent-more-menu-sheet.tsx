import type { User } from '@supabase/supabase-js';
import { useEffect, useMemo } from 'react';
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
import { useParentHome } from '@/contexts/parent-home-context';
import type { ParentMoreMenuItemId } from '@/lib/parent/parent-nav';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentMoreMenuSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (itemId: ParentMoreMenuItemId) => void;
  onSelectAccount: () => void;
};

const MENU_ITEMS: {
  id: ParentMoreMenuItemId;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    id: 'attendance',
    label: 'Attendance',
    subtitle: 'Child attendance history',
    icon: 'clipboard-outline',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
  },
  {
    id: 'children',
    label: 'My children',
    subtitle: 'Profiles and details',
    icon: 'people-outline',
    iconBg: '#FFE4E6',
    iconColor: '#E11D48',
  },
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
    subtitle: 'Help teachers with volunteer requests',
    icon: 'clipboard-outline',
    iconBg: '#E9F2EA',
    iconColor: '#3D6B4F',
  },
  {
    id: 'forms-documents',
    label: 'Forms & documents',
    subtitle: 'View and sign school forms',
    icon: 'document-text-outline',
    iconBg: '#E2E8F0',
    iconColor: '#475569',
  },
  {
    id: 'notifications',
    label: 'Notification settings',
    subtitle: 'Family email preferences',
    icon: 'notifications-outline',
    iconBg: '#E0F2FE',
    iconColor: '#0284C7',
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

export function ParentMoreMenuSheet({
  visible,
  onClose,
  onSelect,
  onSelectAccount,
}: ParentMoreMenuSheetProps) {
  const theme = useParentTheme();
  const { user } = useAuth();
  const { data: homeData, ensureLoaded } = useParentHome();
  const displayName = useMemo(() => {
    const profileName = homeData?.userProfile.displayName?.trim();
    if (profileName) return profileName;
    return user ? getDisplayName(user) : '';
  }, [homeData?.userProfile.displayName, user]);

  useEffect(() => {
    if (visible) {
      ensureLoaded();
    }
  }, [visible, ensureLoaded]);

  return (
    <StoryMoreMenuSheetShell visible={visible} onClose={onClose}>
      <StoryMoreMenuHeader
        kicker="Family portal"
        title="More"
        subtitle="Children and account settings"
      />

      <StoryMoreMenuItemsCard>
        {MENU_ITEMS.map((item, index) => (
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
            <MessagesAvatar
              name={displayName}
              color={theme.primary}
              photoUrl={homeData?.userProfile.profilePhotoUrl}
              size="md"
            />
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
