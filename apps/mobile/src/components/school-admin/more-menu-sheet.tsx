import type { User } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { MessagesAvatar } from '@/components/school-admin/messages/messages-avatar';
import { OrganizationLogo } from '@/components/organization-logo';
import { StoryCard } from '@/components/story/story-card';
import { StoryMoreMenuHeader } from '@/components/story/more/story-more-menu-header';
import { StoryMoreMenuIcon } from '@/components/story/more/story-more-menu-icon';
import { StoryMoreMenuItemRow } from '@/components/story/more/story-more-menu-item-row';
import { StoryMoreMenuItemsCard } from '@/components/story/more/story-more-menu-items-card';
import { StoryMoreMenuSheetShell } from '@/components/story/more/story-more-menu-sheet-shell';
import { StoryTextLink } from '@/components/story/story-text-link';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { useAuth } from '@/contexts/auth-context';
import { getAccountRoleLabel } from '@/lib/auth/resolve-portal';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

export type MoreMenuItemId =
  | 'transactions'
  | 'schedule'
  | 'staff'
  | 'classrooms'
  | 'bulletin'
  | 'attendance';

type MoreMenuSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (itemId: MoreMenuItemId) => void;
};

const MENU_ITEMS: {
  id: MoreMenuItemId;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    id: 'transactions',
    label: 'Transactions',
    subtitle: 'Payment history',
    icon: 'card-outline',
    iconBg: '#D1FAE5',
    iconColor: '#059669',
  },
  {
    id: 'schedule',
    label: 'Schedule',
    subtitle: 'Tours, events, and visits',
    icon: 'calendar-outline',
    iconBg: '#EDE9FE',
    iconColor: '#7C3AED',
  },
  {
    id: 'attendance',
    label: 'Attendance',
    subtitle: "Today's roster and pickup",
    icon: 'clipboard-outline',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
  },
  {
    id: 'bulletin',
    label: 'Bulletin',
    subtitle: 'Announcements and flyers',
    icon: 'megaphone-outline',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
  },
  {
    id: 'staff',
    label: 'Staff',
    subtitle: 'Roster and portal access',
    icon: 'people-outline',
    iconBg: '#FFE4E6',
    iconColor: '#E11D48',
  },
  {
    id: 'classrooms',
    label: 'Classrooms',
    subtitle: 'Rosters and lead teachers',
    icon: 'school-outline',
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

export function MoreMenuSheet({ visible, onClose, onSelect }: MoreMenuSheetProps) {
  const router = useRouter();
  const theme = useParentTheme();
  const { user, portalType, isPlatformAdminSession, selectedSchool, exitSchoolAdmin, signOut } =
    useAuth();
  const displayName = useMemo(() => (user ? getDisplayName(user) : ''), [user]);
  const roleLabel = useMemo(
    () => getAccountRoleLabel(portalType, isPlatformAdminSession),
    [portalType, isPlatformAdminSession],
  );

  const handleSignOut = async () => {
    onClose();
    await signOut();
    router.replace('/login/admin');
  };

  const handleBackToOrganizations = async () => {
    onClose();
    await exitSchoolAdmin();
    router.replace('/platform-admin/organizations');
  };

  return (
    <StoryMoreMenuSheetShell visible={visible} onClose={onClose}>
      <StoryMoreMenuHeader
        kicker="School workspace"
        title="More"
        subtitle="Finances, scheduling, and school operations"
      />

      {isPlatformAdminSession && selectedSchool ? (
        <View style={styles.platformBanner}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to organizations"
            onPress={() => void handleBackToOrganizations()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <Ionicons name="chevron-back" size={18} color="#42694F" />
            <Text style={styles.backLabel}>Organizations</Text>
          </Pressable>
          <View accessibilityLabel={selectedSchool.name}>
            <OrganizationLogo
              logoSrc={selectedSchool.branding.logoSrc}
              logoAlt={selectedSchool.branding.logoAlt}
              name={selectedSchool.name}
            />
          </View>
        </View>
      ) : null}

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
          <View style={styles.accountRow}>
            <MessagesAvatar name={displayName} color={theme.primary} size="md" />
            <View style={styles.accountCopy}>
              <Text style={[styles.accountName, { color: theme.ink }]}>{displayName}</Text>
              {roleLabel ? (
                <Text style={[styles.accountMeta, { color: theme.muted }]}>{roleLabel}</Text>
              ) : null}
              {user.email ? (
                <Text style={[styles.accountMeta, { color: theme.muted }]} numberOfLines={1}>
                  {user.email}
                </Text>
              ) : null}
            </View>
            <StoryTextLink
              label="Sign out"
              onPress={() => void handleSignOut()}
              accessibilityLabel="Sign out"
              style={styles.signOutLink}
            />
          </View>
        </StoryCard>
      ) : null}
    </StoryMoreMenuSheetShell>
  );
}

const styles = StyleSheet.create({
  platformBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EAF4EB',
    borderColor: '#C7DFCB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: -4,
  },
  backLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    color: '#42694F',
  },
  pressed: {
    opacity: 0.7,
  },
  accountCard: {
    padding: StoryCardPadding,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
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
  signOutLink: {
    paddingVertical: 0,
    flexShrink: 0,
  },
});
