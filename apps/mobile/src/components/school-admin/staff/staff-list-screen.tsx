import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ADMIN_LIST_HORIZONTAL_PADDING, AdminListSeparator } from '@/components/school-admin/admin-list-layout';
import { StaffFormSheet } from '@/components/school-admin/staff/staff-form-sheet';
import { StaffListItem } from '@/components/school-admin/staff/staff-list-item';
import { StaffListSkeleton } from '@/components/school-admin/staff/staff-list-skeleton';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { fetchStaffMembers, type StaffMemberRecord } from '@/lib/school-admin-api';
import { formatStaffApiError } from '@/lib/school-admin/staff-labels';

type StaffListScreenProps = {
  slug: string;
};

function matchesSearch(member: StaffMemberRecord, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [
    member.firstName,
    member.lastName,
    member.email ?? '',
    member.roleTitle ?? '',
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalized);
}

function ListSeparator() {
  return <AdminListSeparator />;
}

export function StaffListScreen({ slug }: StaffListScreenProps) {
  const theme = useAdminTheme();
  const router = useRouter();

  const [staffMembers, setStaffMembers] = useState<StaffMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  const loadStaff = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setLoading(true);
      }
      setError(null);
      try {
        const members = await fetchStaffMembers(slug);
        setStaffMembers(members);
      } catch (loadError) {
        setError(formatStaffApiError(loadError, 'Failed to load staff.'));
        setStaffMembers([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [slug],
  );

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  const filteredStaff = useMemo(
    () => staffMembers.filter((member) => matchesSearch(member, searchQuery)),
    [searchQuery, staffMembers],
  );

  const handlePressMember = (member: StaffMemberRecord) => {
    router.push(`/school-admin/${slug}/more/staff/${member.id}`);
  };

  const handleCreated = (staffMemberId: string) => {
    void loadStaff({ silent: true });
    router.push(`/school-admin/${slug}/more/staff/${staffMemberId}`);
  };

  const listHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        <ThemedText type="title" style={{ color: theme.textPrimary }}>
          Staff
        </ThemedText>

        <View
          style={[
            styles.searchField,
            {
              backgroundColor: theme.input,
              borderColor: theme.inputBorder,
            },
          ]}>
          <Ionicons name="search" size={18} color={theme.textTertiary} />
          <TextInput
            accessibilityLabel="Search staff"
            placeholder="Search staff..."
            placeholderTextColor={theme.textTertiary}
            style={[styles.searchInput, { color: theme.textPrimary }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add staff"
          onPress={() => setAddSheetOpen(true)}
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: theme.accentLight, borderColor: theme.accent },
            pressed && { opacity: 0.85 },
          ]}>
          <Ionicons name="add" size={18} color={theme.accent} />
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            Add staff
          </ThemedText>
        </Pressable>

        {error ? (
          <ThemedText type="small" style={{ color: theme.error }}>
            {error}
          </ThemedText>
        ) : null}
      </View>
    ),
    [error, searchQuery, theme],
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.titleWrap}>
          <ThemedText type="title" style={{ color: theme.textPrimary }}>
            Staff
          </ThemedText>
        </View>
        <StaffListSkeleton />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <FlatList
        data={filteredStaff}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={ListSeparator}
        ListHeaderComponent={listHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void loadStaff({ silent: true });
            }}
            tintColor={theme.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
              {staffMembers.length === 0
                ? 'No staff yet. Add your first team member to give them portal access.'
                : 'No staff match your search.'}
            </ThemedText>
            {staffMembers.length === 0 ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setAddSheetOpen(true)}
                style={({ pressed }) => [styles.emptyLink, pressed && { opacity: 0.7 }]}>
                <ThemedText type="smallBold" style={{ color: theme.accent }}>
                  Add staff
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <StaffListItem
            member={item}
            onPress={handlePressMember}
          />
        )}
      />

      <StaffFormSheet
        visible={addSheetOpen}
        slug={slug}
        onClose={() => setAddSheetOpen(false)}
        onCreated={handleCreated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleWrap: {
    paddingHorizontal: ADMIN_LIST_HORIZONTAL_PADDING,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  listContent: {
    paddingHorizontal: ADMIN_LIST_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
    flexGrow: 1,
  },
  listHeader: {
    gap: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.body,
    paddingVertical: 0,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.two,
  },
  emptyState: {
    paddingTop: Spacing.six,
    gap: Spacing.three,
    alignItems: 'center',
  },
  emptyLink: {
    paddingVertical: Spacing.one,
  },
});
