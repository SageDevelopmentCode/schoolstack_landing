import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  MESSAGES_SEARCH_FIELD_BG,
} from '@/components/parent/messages/messages-layout';
import { MessagesAvatar } from '@/components/school-admin/messages/messages-avatar';
import {
  AdminMessagesBroadcastChip,
  type BroadcastChipVariant,
} from '@/components/school-admin/messages/admin-messages-broadcast-chip';
import { STUDENT_GRADE_OPTIONS } from '@/lib/admissions/apply-system-fields';
import type {
  AdminBroadcastAudienceState,
  AdminBroadcastOptionClassroom,
  AdminBroadcastOptionProgram,
} from '@/lib/messages/admin-broadcast';
import { filterContactsByAudience, filterContactsForPicker } from '@/lib/messages/contact-filters';
import type { MessageContact } from '@/lib/messages/types';
import type { MobileParentTheme } from '@/lib/organization-settings/parent-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type AdminMessagesAudiencePickerProps = {
  theme: MobileParentTheme;
  audience: AdminBroadcastAudienceState;
  onAudienceChange: (next: AdminBroadcastAudienceState) => void;
  programs: AdminBroadcastOptionProgram[];
  classrooms: AdminBroadcastOptionClassroom[];
  parentContacts: MessageContact[];
};

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

function FilterSection({
  title,
  children,
  theme,
}: {
  title: string;
  children: React.ReactNode;
  theme: MobileParentTheme;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.muted }]}>{title}</Text>
      {children}
    </View>
  );
}

function HorizontalChipRow<T>({
  items,
  selectedIds,
  getKey,
  getLabel,
  onToggle,
  variant,
  theme,
}: {
  items: T[];
  selectedIds: string[];
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
  onToggle: (id: string) => void;
  variant: BroadcastChipVariant;
  theme: MobileParentTheme;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.chipScrollContent}>
      {items.map((item) => {
        const id = getKey(item);
        return (
          <AdminMessagesBroadcastChip
            key={id}
            label={getLabel(item)}
            selected={selectedIds.includes(id)}
            variant={variant}
            theme={theme}
            onPress={() => onToggle(id)}
          />
        );
      })}
    </ScrollView>
  );
}

function ParentSelectIndicator({
  selected,
  theme,
}: {
  selected: boolean;
  theme: MobileParentTheme;
}) {
  return (
    <View
      style={[
        styles.selectIndicator,
        {
          borderColor: selected ? theme.primary : theme.line,
          backgroundColor: selected ? theme.primary : 'transparent',
        },
      ]}>
      {selected ? <Ionicons name="checkmark" size={12} color="#FFFFFF" /> : null}
    </View>
  );
}

function ParentSelectRow({
  contact,
  selected,
  onToggle,
  theme,
}: {
  contact: MessageContact;
  selected: boolean;
  onToggle: () => void;
  theme: MobileParentTheme;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onToggle}
      style={({ pressed }) => [
        styles.parentRow,
        {
          borderColor: selected ? theme.primary : theme.line,
          backgroundColor: selected ? theme.primarySoft : theme.white,
          opacity: pressed ? 0.9 : 1,
        },
      ]}>
      <ParentSelectIndicator selected={selected} theme={theme} />
      <MessagesAvatar
        name={contact.name}
        color={contact.color}
        photoUrl={contact.profilePhotoUrl}
        size="sm"
      />
      <View style={styles.parentText}>
        <Text style={[styles.parentName, { color: theme.ink }]} numberOfLines={1}>
          {contact.name}
        </Text>
        {contact.subtitle ? (
          <Text style={[styles.parentSubtitle, { color: theme.muted }]} numberOfLines={2}>
            {contact.subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function AudienceListHeader({
  theme,
  audience,
  programs,
  classrooms,
  searchQuery,
  onSearchQueryChange,
  onAudienceChange,
}: {
  theme: MobileParentTheme;
  audience: AdminBroadcastAudienceState;
  programs: AdminBroadcastOptionProgram[];
  classrooms: AdminBroadcastOptionClassroom[];
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onAudienceChange: (next: AdminBroadcastAudienceState) => void;
}) {
  const updateAudience = (patch: Partial<AdminBroadcastAudienceState>) => {
    onAudienceChange({ ...audience, ...patch });
  };

  return (
    <View style={styles.headerSections}>
      <FilterSection title="PROGRAM" theme={theme}>
        {programs.length === 0 ? (
          <Text style={[styles.emptyHint, { color: theme.muted }]}>No programs available.</Text>
        ) : (
          <HorizontalChipRow
            items={programs}
            selectedIds={audience.programIds}
            getKey={(program) => program.id}
            getLabel={(program) => program.name}
            onToggle={(id) => updateAudience({ programIds: toggleValue(audience.programIds, id) })}
            variant="program"
            theme={theme}
          />
        )}
      </FilterSection>

      <FilterSection title="CLASS / GROUP" theme={theme}>
        {classrooms.length === 0 ? (
          <Text style={[styles.emptyHint, { color: theme.muted }]}>No classes available.</Text>
        ) : (
          <HorizontalChipRow
            items={classrooms}
            selectedIds={audience.classroomIds}
            getKey={(classroom) => classroom.id}
            getLabel={(classroom) =>
              classroom.programName ? `${classroom.name} · ${classroom.programName}` : classroom.name
            }
            onToggle={(id) =>
              updateAudience({ classroomIds: toggleValue(audience.classroomIds, id) })
            }
            variant="classroom"
            theme={theme}
          />
        )}
      </FilterSection>

      <FilterSection title="GRADE" theme={theme}>
        <HorizontalChipRow
          items={STUDENT_GRADE_OPTIONS}
          selectedIds={audience.gradeValues}
          getKey={(grade) => grade.value}
          getLabel={(grade) => grade.label}
          onToggle={(value) =>
            updateAudience({ gradeValues: toggleValue(audience.gradeValues, value) })
          }
          variant="grade"
          theme={theme}
        />
      </FilterSection>

      <FilterSection title="INDIVIDUAL PARENTS" theme={theme}>
        <View
          style={[
            styles.searchWrap,
            { backgroundColor: MESSAGES_SEARCH_FIELD_BG, borderColor: theme.line },
          ]}>
          <Ionicons name="search" size={14} color={theme.muted} />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchQueryChange}
            placeholder="Search parents"
            placeholderTextColor={theme.muted}
            autoCorrect={false}
            autoCapitalize="none"
            style={[styles.searchInput, { color: theme.ink }]}
          />
        </View>
      </FilterSection>
    </View>
  );
}

export function AdminMessagesAudiencePicker({
  theme,
  audience,
  onAudienceChange,
  programs,
  classrooms,
  parentContacts,
}: AdminMessagesAudiencePickerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredParents = useMemo(
    () => filterContactsForPicker(parentContacts, 'parents', searchQuery),
    [parentContacts, searchQuery],
  );

  const updateAudience = useCallback(
    (next: AdminBroadcastAudienceState) => {
      onAudienceChange(next);
    },
    [onAudienceChange],
  );

  const renderListHeader = useCallback(
    () => (
      <AudienceListHeader
        theme={theme}
        audience={audience}
        programs={programs}
        classrooms={classrooms}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onAudienceChange={updateAudience}
      />
    ),
    [audience, classrooms, programs, searchQuery, theme, updateAudience],
  );

  const renderParentRow = useCallback(
    ({ item: contact }: { item: MessageContact }) => {
      const selected =
        contact.guardianId != null && audience.guardianIds.includes(contact.guardianId);
      return (
        <ParentSelectRow
          contact={contact}
          selected={selected}
          onToggle={() => {
            if (!contact.guardianId) return;
            onAudienceChange({
              ...audience,
              guardianIds: toggleValue(audience.guardianIds, contact.guardianId),
            });
          }}
          theme={theme}
        />
      );
    },
    [audience, onAudienceChange, theme],
  );

  const listEmpty = useMemo(
    () => (
      <Text style={[styles.emptyParents, { color: theme.muted }]}>
        No parents match this search.
      </Text>
    ),
    [theme.muted],
  );

  return (
    <FlatList
      data={filteredParents}
      keyExtractor={(contact) => contact.key}
      ListHeaderComponent={renderListHeader}
      ListEmptyComponent={listEmpty}
      renderItem={renderParentRow}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={styles.parentSeparator} />}
      style={styles.list}
      contentContainerStyle={styles.listContent}
    />
  );
}

/** Parent contacts only — used by broadcast sheet. */
export function filterParentContactsForBroadcast(contacts: MessageContact[]): MessageContact[] {
  return filterContactsByAudience(contacts, 'parents');
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    flexGrow: 1,
  },
  headerSections: {
    gap: Spacing.six,
    paddingBottom: Spacing.four,
  },
  section: {
    gap: Spacing.three,
  },
  sectionTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    lineHeight: 14,
  },
  chipScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingRight: Spacing.two,
  },
  emptyHint: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontFamily: StoryFonts.body,
    fontSize: 16,
    paddingVertical: 2,
  },
  parentSeparator: {
    height: Spacing.two,
  },
  parentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  selectIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parentText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  parentName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  parentSubtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyParents: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingVertical: Spacing.six,
  },
});
