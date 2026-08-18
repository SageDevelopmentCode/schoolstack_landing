import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { OrganizationLogo } from '@/components/organization-logo';
import { ThemedText } from '@/components/themed-text';
import type { LiveOrganization } from '@/lib/organizations';
import { Brand, Fonts, Radius, Spacing } from '@/constants/theme';

type OrganizationSelectorProps = {
  organizations: LiveOrganization[];
  onSelect: (organization: LiveOrganization) => void;
  accessibleSlugs?: string[] | null;
  disabled?: boolean;
};

export function OrganizationSelector({
  organizations,
  onSelect,
  accessibleSlugs = null,
  disabled = false,
}: OrganizationSelectorProps) {
  const [query, setQuery] = useState('');

  const visibleOrganizations = useMemo(() => {
    if (!accessibleSlugs) {
      return organizations;
    }

    const allowed = new Set(accessibleSlugs);
    return organizations.filter((organization) => allowed.has(organization.slug));
  }, [accessibleSlugs, organizations]);

  const filteredOrganizations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return visibleOrganizations;

    return visibleOrganizations.filter(
      (organization) =>
        organization.name.toLowerCase().includes(normalizedQuery) ||
        organization.slug.toLowerCase().includes(normalizedQuery),
    );
  }, [query, visibleOrganizations]);

  const showSearch = visibleOrganizations.length > 4;

  if (visibleOrganizations.length === 0) {
    return (
      <View style={styles.emptyState}>
        <ThemedText type="small" color={Brand.textMuted} style={styles.emptyText}>
          {accessibleSlugs
            ? 'You do not have access to any schools for this account. Try signing in with a different account.'
            : 'No schools are available for sign-in right now. Please check back later.'}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {showSearch ? (
        <TextInput
          accessibilityLabel="Search schools"
          placeholder="Search schools…"
          placeholderTextColor={Brand.textMuted}
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          editable={!disabled}
        />
      ) : null}

      <FlatList
        data={filteredOrganizations}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <ThemedText type="small" color={Brand.textMuted} style={styles.emptyText}>
            No schools match your search.
          </ThemedText>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            disabled={disabled}
            onPress={() => onSelect(item)}
            style={({ pressed }) => [
              styles.row,
              pressed && !disabled && styles.rowPressed,
              disabled && styles.rowDisabled,
            ]}>
            <OrganizationLogo
              logoSrc={item.branding.logoSrc}
              logoAlt={item.branding.logoAlt}
              name={item.name}
              style={styles.logo}
            />
            <ThemedText type="smallBold" style={styles.name}>
              {item.name}
            </ThemedText>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.three,
  },
  searchInput: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Brand.text,
    backgroundColor: Brand.input,
    borderWidth: 1,
    borderColor: Brand.inputBorder,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.surface,
  },
  rowPressed: {
    opacity: 0.85,
  },
  rowDisabled: {
    opacity: 0.6,
  },
  logo: {
    width: 36,
    height: 36,
  },
  name: {
    flex: 1,
  },
  separator: {
    height: Spacing.two,
  },
  emptyState: {
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: Radius.lg,
    backgroundColor: Brand.surface,
    padding: Spacing.four,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
