import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { OrganizationListItem } from '@/components/platform-admin/organization-list-item';
import { OrganizationStatusFilters } from '@/components/platform-admin/organization-status-filters';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { useAuth } from '@/contexts/auth-context';
import type { AdminOrganization, OrganizationStatus } from '@/lib/organizations';
import { listAllOrganizations } from '@/lib/organizations';
import { Fonts, Radius, Spacing } from '@/constants/theme';

export function PlatformAdminOrganizationsScreen() {
  const theme = useAdminTheme();
  const router = useRouter();
  const { user, portalType, enterSchoolAsPlatformAdmin, signOut, isLoading: authLoading } =
    useAuth();

  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrganizationStatus | ''>('');

  useEffect(() => {
    if (!authLoading && (!user || portalType !== 'platform_admin')) {
      router.replace('/login/admin');
    }
  }, [authLoading, user, portalType, router]);

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

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  if (authLoading || !user || portalType !== 'platform_admin') {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
        <ActivityIndicator color={theme.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <ThemedText type="badge" style={{ color: theme.accent }}>
          Platform Admin
        </ThemedText>
        <ThemedText type="title" style={[styles.heading, { color: theme.textPrimary }]}>
          Organizations
        </ThemedText>
        {user.email ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {user.email}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.filters}>
        <TextInput
          accessibilityLabel="Search organizations"
          placeholder="Search schools…"
          placeholderTextColor={theme.textTertiary}
          style={[
            styles.searchInput,
            {
              color: theme.textPrimary,
              backgroundColor: theme.input,
              borderColor: theme.inputBorder,
            },
          ]}
          value={query}
          onChangeText={setQuery}
        />
        <OrganizationStatusFilters
          activeStatus={statusFilter}
          counts={counts}
          onChange={setStatusFilter}
        />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.accent} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            {error}
          </ThemedText>
          <Pressable accessibilityRole="button" onPress={() => void loadOrganizations()}>
            <ThemedText type="linkPrimary" style={{ color: theme.accent }}>
              Try again
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredOrganizations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                No organizations found.
              </ThemedText>
            </View>
          }
          renderItem={({ item }) => (
            <OrganizationListItem organization={item} onPress={handleSelectOrganization} />
          )}
        />
      )}

      <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.bg }]}>
        <PrimaryButton label="Sign out" variant="surface" onPress={handleSignOut} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  heading: {
    marginTop: Spacing.one,
  },
  filters: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  searchInput: {
    fontFamily: Fonts.body,
    fontSize: 15,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: Spacing.two,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  separator: {
    height: Spacing.two,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  footer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
