import { useEffect, useMemo } from 'react';
import type { User } from '@supabase/supabase-js';
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
import { useParentPortalContext } from '@/contexts/parent-portal-context';
import { isParentHomeFridayBranchEnabled } from '@/lib/parent/parent-features';
import { isParentFeatureEnabled } from '@/lib/parent/parent-features';
import { resolveMobileMoreMenuFeatureKeys } from '@/lib/parent/mobile-parent-portal-nav';
import {
  PARENT_MORE_MENU_META,
  parentMoreMenuItemIdForFeatureKey,
} from '@/lib/parent/parent-more-menu-meta';
import type { ParentMoreMenuItemId } from '@/lib/parent/parent-nav';
import {
  ParentPortalMoreMenuItemsSkeleton,
  ParentPortalProgramSwitcherCardSkeleton,
} from '@/components/parent/parent-portal-program-chrome-skeleton';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentMoreMenuSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (itemId: ParentMoreMenuItemId) => void;
  onSelectAccount: () => void;
};

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
  const {
    contexts,
    activeContext,
    activeProgramSlug,
    showSwitcher,
    switchToContext,
    activePortalFeatures,
    isLoading: portalContextsLoading,
    programsByPortalSlug,
  } = useParentPortalContext();

  const programPortalFeaturesPending = Boolean(
    activeProgramSlug &&
      (portalContextsLoading || !programsByPortalSlug[activeProgramSlug]),
  );

  const displayName = useMemo(() => {
    const profileName = homeData?.userProfile.displayName?.trim();
    if (profileName) return profileName;
    return user ? getDisplayName(user) : '';
  }, [homeData?.userProfile.displayName, user]);

  const portalFeatureRecord = activePortalFeatures?.parent ?? homeData?.features?.parent;

  const visibleMenuItemIds = useMemo(() => {
    if (programPortalFeaturesPending) {
      return [] as ParentMoreMenuItemId[];
    }

    if (!portalFeatureRecord) {
      return Object.keys(PARENT_MORE_MENU_META) as ParentMoreMenuItemId[];
    }

    const featureKeys = resolveMobileMoreMenuFeatureKeys({
      mode: activeProgramSlug ? 'program' : 'main',
      parentFeatures: portalFeatureRecord as Parameters<
        typeof resolveMobileMoreMenuFeatureKeys
      >[0]['parentFeatures'],
      portalNav: activePortalFeatures?.featureNav as Parameters<
        typeof resolveMobileMoreMenuFeatureKeys
      >[0]['portalNav'],
      coopMode: activePortalFeatures?.coopMode,
    });

    const ids = featureKeys.map((key) => parentMoreMenuItemIdForFeatureKey(key));

    if (
      isParentHomeFridayBranchEnabled({
        parent: portalFeatureRecord,
        parent_home: homeData?.features?.parent_home,
      }) &&
      ids.includes('friday-branch') === false &&
      isParentFeatureEnabled({ parent: portalFeatureRecord }, 'friday_branch')
    ) {
      ids.push('friday-branch');
    }

    return ids.filter((id) => {
      if (id === 'friday-branch') {
        return isParentHomeFridayBranchEnabled({
          parent: portalFeatureRecord,
          parent_home: homeData?.features?.parent_home,
        });
      }
      return true;
    });
  }, [
    activePortalFeatures,
    activeProgramSlug,
    homeData?.features?.parent_home,
    portalFeatureRecord,
    programPortalFeaturesPending,
  ]);

  const visibleMenuItems = useMemo(
    () =>
      visibleMenuItemIds
        .map((id) => ({ id, ...PARENT_MORE_MENU_META[id] }))
        .filter((item) => item.label),
    [visibleMenuItemIds],
  );

  useEffect(() => {
    if (visible) {
      ensureLoaded();
    }
  }, [visible, ensureLoaded]);

  return (
    <StoryMoreMenuSheetShell visible={visible} onClose={onClose}>
      <StoryMoreMenuHeader
        kicker={activePortalFeatures?.coopMode ? 'Co-op program portal' : 'Family portal'}
        title="More"
        subtitle="Children and account settings"
      />

      {portalContextsLoading ? <ParentPortalProgramSwitcherCardSkeleton /> : null}

      {!portalContextsLoading && showSwitcher && activeContext ? (
        <StoryCard compact style={styles.programCard}>
          <Text style={[styles.programKicker, { color: theme.muted }]}>Program</Text>
          {contexts.map((context) => {
            const isCurrent = context.id === activeContext.id;
            return (
              <Pressable
                key={context.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isCurrent }}
                onPress={() => {
                  if (!isCurrent) {
                    onClose();
                    switchToContext(context);
                  }
                }}
                style={({ pressed }) => [
                  styles.programRow,
                  isCurrent && { backgroundColor: theme.primarySoft },
                  pressed && !isCurrent && styles.pressed,
                ]}>
                {isCurrent ? (
                  <Ionicons name="checkmark" size={18} color={theme.primary} />
                ) : (
                  <View style={styles.programRowSpacer} />
                )}
                <Text
                  style={[
                    styles.programLabel,
                    { color: isCurrent ? theme.primary : theme.ink },
                  ]}
                  numberOfLines={2}>
                  {context.label}
                </Text>
              </Pressable>
            );
          })}
        </StoryCard>
      ) : null}

      {programPortalFeaturesPending ? (
        <ParentPortalMoreMenuItemsSkeleton />
      ) : (
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
      )}

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
  programCard: {
    padding: StoryCardPadding,
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  programKicker: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: Spacing.one,
  },
  programRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: 8,
  },
  programRowSpacer: {
    width: 18,
  },
  programLabel: {
    flex: 1,
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
  },
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
