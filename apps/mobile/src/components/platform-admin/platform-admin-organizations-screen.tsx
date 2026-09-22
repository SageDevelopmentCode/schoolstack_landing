import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { OrganizationSelectorSkeleton } from '@/components/organization-selector-skeleton';
import { OrganizationStatusFilters } from '@/components/platform-admin/organization-status-filters';
import { OrganizationStoryListItem } from '@/components/platform-admin/organization-story-list-item';
import {
  PLATFORM_ADMIN_FLOATING_TAB_BAR_HEIGHT,
} from '@/components/platform-admin/platform-admin-floating-tab-bar';
import { PlatformAdminOrganizationsStoryHeader } from '@/components/platform-admin/platform-admin-organizations-story-header';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { useAuth } from '@/contexts/auth-context';
import type { AdminOrganization, OrganizationStatus } from '@/lib/organizations';
import { listAllOrganizations } from '@/lib/organizations';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';

export function PlatformAdminOrganizationsScreen() {
  const theme = useParentTheme();
  const router = useRouter();
  const { user, enterSchoolAsPlatformAdmin } = useAuth();

  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrganizationStatus | ''>('');

  const loadOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAllOrganizations();
      setOrganizations(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load organizations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrganizations();
  }, [loadOrganizations]);

  const counts = useMemo(() => {
    return organizations.reduce(
      (acc, org) => {
        acc[org.status] = (acc[org.status] ?? 0) + 1;
        return acc;
      },
      {} as Partial<Record<OrganizationStatus, number>>,
    );
  }, [organizations]);

  const filteredOrganizations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return organizations.filter((organization) => {
      if (statusFilter && organization.status !== statusFilter) return false;
      if (!normalizedQuery) return true;
      return (
        organization.name.toLowerCase().includes(normalizedQuery) ||
        organization.slug.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [organizations, query, statusFilter]);

  const handleSelectOrganization = async (organization: AdminOrganization) => {
    await enterSchoolAsPlatformAdmin(organization);
    router.push(`/school-admin/${organization.slug}/dashboard`);
  };

  const listHeader = (
    <View style={styles.headerBlock}>
      <Animated.View entering={FadeInDown.duration(350)}>
        <PlatformAdminOrganizationsStoryHeader
          totalCount={organizations.length}
          email={user?.email}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(40).duration(350)}>
        <View
          style={[
            styles.searchField,
            {
              backgroundColor: theme.white,
              borderColor: Story.line,
            },
          ]}>
          <Ionicons name="search" size={18} color={theme.muted} />
          <TextInput
            accessibilityLabel="Search organizations"
            placeholder="Search schools…"
            placeholderTextColor={theme.muted}
            style={[styles.searchInput, { color: theme.ink }]}
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </Animated.View>

      {organizations.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(80).duration(350)}>
          <OrganizationStatusFilters
            activeStatus={statusFilter}
            counts={counts}
            onChange={setStatusFilter}
          />
        </Animated.View>
      ) : null}

      {error ? <StoryErrorBanner message={error} /> : null}
    </View>
  );

  if (loading && organizations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Animated.View entering={FadeInDown.duration(350)} style={styles.loadingHeader}>
            <PlatformAdminOrganizationsStoryHeader totalCount={0} email={user?.email} />
          </Animated.View>
          <OrganizationSelectorSkeleton rowCount={4} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredOrganizations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>
              {organizations.length === 0
                ? 'No organizations found.'
                : statusFilter
                  ? `No ${statusFilter} organizations match your filters.`
                  : 'No organizations match your search.'}
            </Text>
            {error ? (
              <Pressable accessibilityRole="button" onPress={() => void loadOrganizations()}>
                <Text style={[styles.retryLink, { color: theme.primary }]}>Try again</Text>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index * 30, 180)).duration(220)}>
            <OrganizationStoryListItem organization={item} onPress={handleSelectOrganization} />
          </Animated.View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  loadingContent: {
    flex: 1,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
    gap: Spacing.four,
  },
  loadingHeader: {
    paddingBottom: Spacing.two,
  },
  headerBlock: {
    gap: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: StoryFonts.body,
    padding: 0,
  },
  listContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: PLATFORM_ADMIN_FLOATING_TAB_BAR_HEIGHT + Spacing.five,
    flexGrow: 1,
  },
  separator: {
    height: Spacing.two,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
    gap: Spacing.two,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  retryLink: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
  },
});
