import type { User } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  AccountPortalSwitcherPanel,
  useAccountPortalSwitcherVisibility,
} from '@/components/account-portal-switcher-panel';
import { AccountDeletionRequest } from '@/components/account-deletion-request';
import { AccountLegalLinks } from '@/components/account-legal-links';
import { MessagesAvatar } from '@/components/school-admin/messages/messages-avatar';
import { OrganizationLogo } from '@/components/organization-logo';
import { StoryCard } from '@/components/story/story-card';
import { StoryMoreMenuHeader } from '@/components/story/more/story-more-menu-header';
import { StoryMoreMenuIcon } from '@/components/story/more/story-more-menu-icon';
import { StoryMoreMenuItemRow } from '@/components/story/more/story-more-menu-item-row';
import { StoryMoreMenuItemsCard } from '@/components/story/more/story-more-menu-items-card';
import { StoryMoreMenuSectionTabs } from '@/components/story/more/story-more-menu-section-tabs';
import { StoryMoreMenuTabPanel } from '@/components/story/more/story-more-menu-tab-panel';
import { StoryMoreMenuSheetShell } from '@/components/story/more/story-more-menu-sheet-shell';
import {
  buildMoreMenuTabs,
  shouldShowMoreMenuSectionTabs,
  type MoreMenuTabId,
} from '@/lib/more-menu-tab-ids';
import { prefetchSchoolPortalOptions } from '@/lib/auth/use-school-portal-options';
import { StoryTextLink } from '@/components/story/story-text-link';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { useAuth } from '@/contexts/auth-context';
import { useCanSwitchSchool } from '@/lib/auth/use-can-switch-school';
import { useSchoolAdminFeatures } from '@/contexts/school-admin-features-context';
import { getAccountRoleLabel } from '@/lib/auth/resolve-portal';
import { portalTypeToAccountPortalId } from '@/lib/auth/school-portal-options-types';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

export type MoreMenuItemId =
  | 'transactions'
  | 'schedule'
  | 'staff'
  | 'classrooms'
  | 'bulletin'
  | 'attendance'
  | 'committees'
  | 'friday-branch';

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
    id: 'committees',
    label: 'Committees',
    subtitle: 'Volunteer groups and join requests',
    icon: 'heart-outline',
    iconBg: '#FCE7F3',
    iconColor: '#DB2777',
  },
  {
    id: 'friday-branch',
    label: 'Friday Branch',
    subtitle: 'Program schedule and rosters',
    icon: 'calendar-outline',
    iconBg: '#EDE9FE',
    iconColor: '#7C3AED',
  },
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
  const {
    user,
    portalType,
    isPlatformAdminSession,
    selectedSchool,
    exitSchoolAdmin,
    signOut,
    switchSchool,
    previewSession,
  } = useAuth();
  const canSwitchSchool = useCanSwitchSchool(user?.id);
  const { fridayBranchEnabled } = useSchoolAdminFeatures();
  const displayName = useMemo(() => (user ? getDisplayName(user) : ''), [user]);
  const roleLabel = useMemo(
    () => getAccountRoleLabel(portalType, isPlatformAdminSession),
    [portalType, isPlatformAdminSession],
  );
  const visibleMenuItems = useMemo(
    () =>
      MENU_ITEMS.filter((item) => {
        if (item.id === 'friday-branch') return fridayBranchEnabled;
        return true;
      }),
    [fridayBranchEnabled],
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

  const handleSwitchSchool = async () => {
    onClose();
    await switchSchool();
    router.replace('/login/choose-school?mode=switch');
  };

  const [activeTab, setActiveTab] = useState<MoreMenuTabId>('menu');
  const { showAccountPortalSection } = useAccountPortalSwitcherVisibility(
    selectedSchool?.id,
    selectedSchool?.slug,
    visible,
  );
  const tabs = useMemo(
    () => buildMoreMenuTabs({ showAccountPortal: showAccountPortalSection, showProgram: false }),
    [showAccountPortalSection],
  );
  const useSectionTabs = shouldShowMoreMenuSectionTabs(tabs);

  useEffect(() => {
    if (visible && selectedSchool?.id && selectedSchool.slug) {
      void prefetchSchoolPortalOptions(selectedSchool.id, selectedSchool.slug);
    }
  }, [selectedSchool?.id, selectedSchool?.slug, visible]);

  useEffect(() => {
    if (visible) {
      setActiveTab('menu');
    }
  }, [visible]);

  const showMenuPanel = !useSectionTabs || activeTab === 'menu';
  const showAccountPortalPanel = useSectionTabs && activeTab === 'account_portal';

  return (
    <StoryMoreMenuSheetShell visible={visible} onClose={onClose}>
      <StoryMoreMenuHeader
        kicker="School workspace"
        title="More"
        subtitle="Finances, scheduling, and school operations"
      />

      {useSectionTabs ? (
        <StoryMoreMenuSectionTabs tabs={tabs} activeId={activeTab} onChange={setActiveTab} />
      ) : null}

      <StoryMoreMenuTabPanel visible={showAccountPortalPanel && Boolean(selectedSchool)}>
        {selectedSchool ? (
          <AccountPortalSwitcherPanel
            organizationId={selectedSchool.id}
            slug={selectedSchool.slug}
            currentPortalId={portalTypeToAccountPortalId(portalType)}
            enabled={visible}
            onAfterSelect={onClose}
          />
        ) : null}
      </StoryMoreMenuTabPanel>

      <StoryMoreMenuTabPanel visible={showMenuPanel}>
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
            <View style={styles.accountActions}>
              {canSwitchSchool && !previewSession && !isPlatformAdminSession ? (
                <StoryTextLink
                  label="Switch school"
                  onPress={() => void handleSwitchSchool()}
                  accessibilityLabel="Switch school"
                />
              ) : null}
              <StoryTextLink
                label="Sign out"
                onPress={() => void handleSignOut()}
                accessibilityLabel="Sign out"
                style={styles.signOutLink}
              />
            </View>
          </View>
          {selectedSchool?.id ? (
            <AccountDeletionRequest
              organizationId={selectedSchool.id}
              portal="admin"
              sourcePagePath="/school-admin/more"
            />
          ) : null}
          <AccountLegalLinks />
        </StoryCard>
      ) : null}
      </StoryMoreMenuTabPanel>
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
  accountActions: {
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  signOutLink: {
    paddingVertical: 0,
    flexShrink: 0,
  },
});
