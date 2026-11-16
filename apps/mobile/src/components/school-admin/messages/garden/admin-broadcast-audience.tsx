import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GPressable } from '@/components/parent/garden/ui';
import { MessagesAvatar } from '@/components/school-admin/messages/messages-avatar';
import { STUDENT_GRADE_OPTIONS } from '@/lib/admissions/apply-system-fields';
import type {
  AdminBroadcastAudienceState,
  AdminBroadcastOptionClassroom,
  AdminBroadcastOptionProgram,
} from '@/lib/messages/admin-broadcast';
import { filterContactsByAudience, filterContactsForPicker } from '@/lib/messages/contact-filters';
import type { MessageContact } from '@/lib/messages/types';

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

/** Parent contacts only (same as the Story picker's helper). */
export function parentContactsForBroadcast(contacts: MessageContact[]): MessageContact[] {
  return filterContactsByAudience(contacts, 'parents');
}

function Section({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        {/* Literal uppercase: Maestro waits for "PROGRAM". */}
        <Text style={styles.sectionTitle}>{title}</Text>
        {count > 0 ? <Text style={styles.sectionCount}>{count} selected</Text> : null}
      </View>
      {children}
    </View>
  );
}

function ToggleChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const accent = useGardenAccent();
  return (
    <GPressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      haptic="select"
      onPress={onPress}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: accent.clay, borderColor: accent.clay }
          : { backgroundColor: Garden.white, borderColor: Garden.ink15 },
      ]}>
      {selected ? <Ionicons name="checkmark" size={14} color={Garden.white} /> : null}
      <Text style={[styles.chipLabel, { color: selected ? Garden.white : Garden.ink }]} numberOfLines={1}>
        {label}
      </Text>
    </GPressable>
  );
}

function ChipRow<T>({
  items,
  selectedIds,
  getKey,
  getLabel,
  onToggle,
}: {
  items: readonly T[];
  selectedIds: string[];
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
  onToggle: (id: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.chipRow}>
      {items.map((item) => {
        const id = getKey(item);
        return (
          <ToggleChip key={id} label={getLabel(item)} selected={selectedIds.includes(id)} onPress={() => onToggle(id)} />
        );
      })}
    </ScrollView>
  );
}

/**
 * Garden bulk-message audience: Program / Class / Grade chips and individual
 * parents (searchable checkbox rows). Same audience state and helpers as the
 * Story `AdminMessagesAudiencePicker`.
 */
export function AdminBroadcastAudience({
  audience,
  onAudienceChange,
  programs,
  classrooms,
  parentContacts,
  header,
}: {
  audience: AdminBroadcastAudienceState;
  onAudienceChange: (next: AdminBroadcastAudienceState) => void;
  programs: AdminBroadcastOptionProgram[];
  classrooms: AdminBroadcastOptionClassroom[];
  parentContacts: MessageContact[];
  /** Rendered above the filters (e.g. a status banner). */
  header?: ReactNode;
}) {
  const accent = useGardenAccent();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredParents = useMemo(
    () => filterContactsForPicker(parentContacts, 'parents', searchQuery),
    [parentContacts, searchQuery],
  );

  const update = useCallback(
    (patch: Partial<AdminBroadcastAudienceState>) => onAudienceChange({ ...audience, ...patch }),
    [audience, onAudienceChange],
  );

  const listHeader = (
    <View style={styles.sections}>
      {header}
      <Section title="PROGRAM" count={audience.programIds.length}>
        {programs.length === 0 ? (
          <Text style={styles.hint}>No programs available.</Text>
        ) : (
          <ChipRow
            items={programs}
            selectedIds={audience.programIds}
            getKey={(program) => program.id}
            getLabel={(program) => program.name}
            onToggle={(id) => update({ programIds: toggleValue(audience.programIds, id) })}
          />
        )}
      </Section>

      <Section title="CLASS / GROUP" count={audience.classroomIds.length}>
        {classrooms.length === 0 ? (
          <Text style={styles.hint}>No classes available.</Text>
        ) : (
          <ChipRow
            items={classrooms}
            selectedIds={audience.classroomIds}
            getKey={(classroom) => classroom.id}
            getLabel={(classroom) =>
              classroom.programName ? `${classroom.name} · ${classroom.programName}` : classroom.name
            }
            onToggle={(id) => update({ classroomIds: toggleValue(audience.classroomIds, id) })}
          />
        )}
      </Section>

      <Section title="GRADE" count={audience.gradeValues.length}>
        <ChipRow
          items={STUDENT_GRADE_OPTIONS}
          selectedIds={audience.gradeValues}
          getKey={(grade) => grade.value}
          getLabel={(grade) => grade.label}
          onToggle={(value) => update({ gradeValues: toggleValue(audience.gradeValues, value) })}
        />
      </Section>

      <Section title="INDIVIDUAL PARENTS" count={audience.guardianIds.length}>
        <View style={styles.search}>
          <Ionicons name="search" size={15} color={Garden.soft} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search parents"
            placeholderTextColor={Garden.ink60}
            accessibilityLabel="Search parents"
            autoCorrect={false}
            autoCapitalize="none"
            style={styles.searchInput}
          />
        </View>
      </Section>
    </View>
  );

  return (
    <FlatList
      data={filteredParents}
      keyExtractor={(contact) => contact.key}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={<Text style={styles.empty}>No parents match this search.</Text>}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={Separator}
      renderItem={({ item: contact }) => {
        const selected = contact.guardianId != null && audience.guardianIds.includes(contact.guardianId);
        return (
          <GPressable
            accessibilityRole="checkbox"
            accessibilityLabel={`${contact.name}${contact.subtitle ? `, ${contact.subtitle}` : ''}`}
            accessibilityState={{ checked: selected }}
            haptic="select"
            pressedScale={0.985}
            onPress={() => {
              if (!contact.guardianId) return;
              update({ guardianIds: toggleValue(audience.guardianIds, contact.guardianId) });
            }}
            style={[
              styles.parentRow,
              selected
                ? { borderColor: accent.clay, backgroundColor: accent.wash }
                : { borderColor: Garden.ink12, backgroundColor: Garden.white },
            ]}>
            <View
              style={[
                styles.check,
                selected
                  ? { backgroundColor: accent.clay, borderColor: accent.clay }
                  : { backgroundColor: Garden.white, borderColor: Garden.ink25 },
              ]}>
              {selected ? <Ionicons name="checkmark" size={13} color={Garden.white} /> : null}
            </View>
            <MessagesAvatar name={contact.name} color={contact.color} photoUrl={contact.profilePhotoUrl} size="sm" />
            <View style={styles.parentText}>
              <Text style={styles.parentName} numberOfLines={1}>
                {contact.name}
              </Text>
              {contact.subtitle ? (
                <Text style={styles.parentSubtitle} numberOfLines={2}>
                  {contact.subtitle}
                </Text>
              ) : null}
            </View>
          </GPressable>
        );
      }}
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
  sections: { gap: 18, marginBottom: 10 },
  section: { gap: 8 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 11.5, letterSpacing: 1.6, color: Garden.soft },
  sectionCount: { fontFamily: GardenFonts.bodyExtra, fontSize: 12, color: Garden.forest },
  hint: { fontFamily: GardenFonts.bodySemi, fontSize: 13.5, color: Garden.soft },
  chipRow: { gap: 8, paddingRight: 8 },
  chip: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    maxWidth: 260,
  },
  chipLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 46,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, fontFamily: GardenFonts.bodySemi, fontSize: 16, color: Garden.ink, paddingVertical: 10 },
  separator: { height: 8 },
  parentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  check: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  parentText: { flex: 1, minWidth: 0, gap: 2 },
  parentName: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  parentSubtitle: { fontFamily: GardenFonts.bodySemi, fontSize: 12.5, color: Garden.soft },
  empty: { fontFamily: GardenFonts.bodySemi, fontSize: 14, color: Garden.soft, textAlign: 'center', paddingVertical: 16 },
});
