import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ImpersonateSchoolRow } from '@/components/platform-admin/impersonate/impersonate-subject-row';
import {
  PLATFORM_ADMIN_FLOATING_TAB_BAR_HEIGHT,
} from '@/components/platform-admin/platform-admin-floating-tab-bar';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { AdminOrganization } from '@/lib/organizations';
import { listAllOrganizations } from '@/lib/organizations';
import { impersonateSubjectRoute } from '@/lib/platform-admin/impersonate-nav';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';

export function PlatformAdminImpersonateSchoolsScreen() {
  const theme = useParentTheme();
  const router = useRouter();

  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [orgError, setOrgError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const loadOrganizations = useCallback(async () => {
    setLoadingOrgs(true);
    setOrgError(null);
    try {
      const data = await listAllOrganizations();
      setOrganizations(data);
    } catch (loadError) {
      setOrgError(loadError instanceof Error ? loadError.message : 'Failed to load organizations.');
    } finally {
      setLoadingOrgs(false);
    }
  }, []);

  useEffect(() => {
    void loadOrganizations();
  }, [loadOrganizations]);

  const filteredOrganizations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return organizations;
    return organizations.filter(
      (organization) =>
        organization.name.toLowerCase().includes(normalizedQuery) ||
        organization.slug.toLowerCase().includes(normalizedQuery),
    );
  }, [organizations, query]);

  const handleSelectSchool = (organization: AdminOrganization) => {
    router.push(impersonateSubjectRoute(organization.id) as never);
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: PLATFORM_ADMIN_FLOATING_TAB_BAR_HEIGHT + Spacing.five },
      ]}
      style={styles.container}
      keyboardShouldPersistTaps="handled">
      <View style={styles.headerBlock}>
        <StorySectionKicker style={styles.kicker}>Platform Admin</StorySectionKicker>
        <StoryDisplayHeading size="display">Impersonate</StoryDisplayHeading>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Preview school admin, teacher, and parent mobile portals read-only.
        </Text>
      </View>

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
          accessibilityLabel="Search schools"
          placeholder="Search schools…"
          placeholderTextColor={theme.muted}
          style={[styles.searchInput, { color: theme.ink }]}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {orgError ? <StoryErrorBanner message={orgError} /> : null}

      {loadingOrgs ? (
        <ActivityIndicator color={theme.primary} style={styles.orgSpinner} />
      ) : (
        <View style={styles.schoolList}>
          {filteredOrganizations.map((organization) => (
            <ImpersonateSchoolRow
              key={organization.id}
              organizationName={organization.name}
              organizationSlug={organization.slug}
              onPress={() => handleSelectSchool(organization)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  scrollContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
    gap: Spacing.four,
  },
  headerBlock: {
    gap: Spacing.two,
  },
  kicker: {
    marginBottom: 0,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 15,
    lineHeight: 22,
    marginTop: Spacing.one,
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
  orgSpinner: {
    marginVertical: Spacing.four,
  },
  schoolList: {
    gap: Spacing.two,
  },
});
