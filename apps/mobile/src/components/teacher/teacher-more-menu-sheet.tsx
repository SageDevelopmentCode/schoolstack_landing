import type { User } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';
import { useTeacherHome } from '@/contexts/teacher-home-context';
import { isTeacherFeatureEnabled } from '@/lib/teacher/teacher-features';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  AccountPortalSwitcherPanel,
  useAccountPortalSwitcherVisibility,
} from '@/components/account-portal-switcher-panel';
import { MessagesAvatar } from '@/components/school-admin/messages/messages-avatar';
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
import { useParentTheme } from '@/contexts/parent-theme-context';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { portalTypeToAccountPortalId } from '@/lib/auth/school-portal-options-types';
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
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user, portalType, selectedSchool } = useAuth();
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

  const [activeTab, setActiveTab] = useState<MoreMenuTabId>('menu');
  const organizationId = selectedSchool?.id;
  const { showAccountPortalSection } = useAccountPortalSwitcherVisibility(
    organizationId,
    slug,
    visible,
  );
  const tabs = useMemo(
    () => buildMoreMenuTabs({ showAccountPortal: showAccountPortalSection, showProgram: false }),
    [showAccountPortalSection],
  );
  const useSectionTabs = shouldShowMoreMenuSectionTabs(tabs);

  useEffect(() => {
    if (visible && organizationId && slug) {
      void prefetchSchoolPortalOptions(organizationId, slug);
    }
  }, [organizationId, slug, visible]);

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
        kicker="Staff portal"
        title="More"
        subtitle="Classroom tools and account"
      />

      {useSectionTabs ? (
        <StoryMoreMenuSectionTabs tabs={tabs} activeId={activeTab} onChange={setActiveTab} />
      ) : null}

      <StoryMoreMenuTabPanel visible={showAccountPortalPanel && Boolean(organizationId && slug)}>
        {organizationId && slug ? (
          <AccountPortalSwitcherPanel
            organizationId={organizationId}
            slug={slug}
            currentPortalId={portalTypeToAccountPortalId(portalType)}
            enabled={visible}
            onAfterSelect={onClose}
          />
        ) : null}
      </StoryMoreMenuTabPanel>

      <StoryMoreMenuTabPanel visible={showMenuPanel}>
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
      </StoryMoreMenuTabPanel>
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
