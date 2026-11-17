import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { OrganizationLogo } from '@/components/organization-logo';
import { organizationSelectorEmptyMessage } from '@/components/organization-selector-empty-message';
import { GTextField } from '@/components/parent/garden/fields';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GPressable } from '@/components/parent/garden/ui';
import type { LiveOrganization } from '@/lib/organizations';

type OrganizationSelectorProps = {
  organizations: LiveOrganization[];
  onSelect: (organization: LiveOrganization) => void;
  accessibleSlugs?: string[] | null;
  disabled?: boolean;
};

function OrganizationRow({
  item,
  disabled,
  onSelect,
}: {
  item: LiveOrganization;
  disabled: boolean;
  onSelect: (organization: LiveOrganization) => void;
}) {
  return (
    <GPressable
      accessibilityLabel={item.name}
      accessibilityHint="Opens this school"
      accessibilityState={{ disabled }}
      disabled={disabled}
      haptic="press"
      onPress={() => onSelect(item)}
      style={[styles.row, disabled && styles.rowDisabled]}>
      <View style={styles.logoFrame}>
        <OrganizationLogo
          logoSrc={item.branding.logoSrc}
          logoAlt={item.branding.logoAlt}
          name={item.name}
          style={styles.logo}
        />
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {item.name}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={Garden.soft} />
    </GPressable>
  );
}

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
    const emptyMessage = organizationSelectorEmptyMessage(accessibleSlugs);

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {showSearch ? (
        <GTextField
          label="Search schools"
          accessibilityLabel="Search schools"
          placeholder="Search schools…"
          autoCapitalize="none"
          value={query}
          onChangeText={setQuery}
          disabled={disabled}
        />
      ) : null}

      <FlatList
        data={filteredOrganizations}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No schools match your search.</Text>
        }
        renderItem={({ item }) => (
          <OrganizationRow item={item} disabled={disabled} onSelect={onSelect} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 16,
  },
  row: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Garden.ink10,
    backgroundColor: Garden.white,
  },
  rowDisabled: {
    opacity: 0.6,
  },
  logoFrame: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Garden.paper,
    borderWidth: 1,
    borderColor: Garden.ink10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 34,
    height: 34,
  },
  name: {
    flex: 1,
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 16,
    lineHeight: 21,
    color: Garden.ink,
  },
  separator: {
    height: 10,
  },
  emptyState: {
    padding: 24,
    borderRadius: 22,
    backgroundColor: Garden.paper,
    borderWidth: 1,
    borderColor: Garden.ink10,
  },
  emptyText: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 20,
    color: Garden.soft,
    textAlign: 'center',
  },
});
