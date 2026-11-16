import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import { GInlineBanner } from '@/components/parent/garden/fields';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GChip, GKicker, GLink, GOutlineButton, GPressable, GSkeleton, GToyButton } from '@/components/parent/garden/ui';
import { AdminSheetHeader, type AdminSheetNotice } from '@/components/school-admin/garden/admin-sheet';
import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { haptic } from '@/lib/haptics';
import { haveSameIds, requestCloseIfClean } from '@/lib/unsaved-changes';

export type AdminPickerItem = {
  id: string;
  title: string;
  meta?: string | null;
  /** Group label; rows are grouped in the order groups first appear. */
  group?: string | null;
  /** Extra text matched by search (grade, programs…). */
  searchText?: string;
  leading?: ReactNode;
};

type Row = { key: string; type: 'header'; label: string } | { key: string; type: 'item'; item: AdminPickerItem };

/**
 * Garden picker sheet (replaces the Story staff / student / classroom
 * pickers). Search, checkbox (`multi`) or radio (`single`) rows, optional
 * group headers, skeleton + load error with Try again, live footer status
 * and one toy Save. Save resolves `true` when it saved; on `false` the sheet
 * stays open so the in-sheet `notice` can say what didn't change.
 */
export function AdminPickerSheet({
  visible,
  onClose,
  title,
  subtitle,
  items,
  mode = 'multi',
  initialSelectedIds = EMPTY,
  loading = false,
  loadError = null,
  onRetryLoad,
  saving = false,
  notice = null,
  searchPlaceholder,
  searchAccessibilityLabel,
  emptyText,
  noMatchText = 'Nothing matches your search.',
  helper,
  top,
  saveLabel,
  savingLabel = 'Saving…',
  selectionNoun = 'selected',
  requireSelection = true,
  extraDirty = false,
  onSave,
  testID,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string | null;
  items: AdminPickerItem[];
  mode?: 'multi' | 'single';
  initialSelectedIds?: string[];
  loading?: boolean;
  loadError?: string | null;
  onRetryLoad?: () => void;
  saving?: boolean;
  notice?: AdminSheetNotice | null;
  searchPlaceholder: string;
  searchAccessibilityLabel?: string;
  emptyText: string;
  noMatchText?: string;
  helper?: string | null;
  /** Above the search (e.g. role chips). */
  top?: ReactNode;
  /** Button label from the selection count, e.g. (n) => `Assign (${n})`. */
  saveLabel: (count: number) => string;
  savingLabel?: string;
  /** Footer noun: "3 selected · not saved yet". */
  selectionNoun?: string;
  /** Save needs at least one selection (add pickers). */
  requireSelection?: boolean;
  /** Something outside the list changed (e.g. role chips). */
  extraDirty?: boolean;
  onSave: (ids: string[]) => Promise<boolean>;
  testID?: string;
}) {
  const accent = useGardenAccent();
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [query, setQuery] = useState('');
  const [openedWith, setOpenedWith] = useState({ visible, ids: initialSelectedIds });

  // Reset each time the sheet opens (previous-value pattern, no effect).
  if (openedWith.visible !== visible || (visible && !haveSameIds(openedWith.ids, initialSelectedIds) && !saving)) {
    setOpenedWith({ visible, ids: initialSelectedIds });
    if (visible) {
      setSelectedIds(initialSelectedIds);
      setQuery('');
    }
  }

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matches = items.filter((item) => {
      if (!normalized) return true;
      return [item.title, item.meta ?? '', item.group ?? '', item.searchText ?? '']
        .join(' ')
        .toLowerCase()
        .includes(normalized);
    });
    const hasGroups = matches.some((item) => item.group);
    if (!hasGroups) return matches.map<Row>((item) => ({ key: item.id, type: 'item', item }));
    const order: string[] = [];
    const byGroup = new Map<string, AdminPickerItem[]>();
    for (const item of matches) {
      const group = item.group ?? 'Other';
      if (!byGroup.has(group)) {
        byGroup.set(group, []);
        order.push(group);
      }
      byGroup.get(group)!.push(item);
    }
    const result: Row[] = [];
    for (const group of order) {
      result.push({ key: `header-${group}`, type: 'header', label: group });
      for (const item of byGroup.get(group)!) result.push({ key: item.id, type: 'item', item });
    }
    return result;
  }, [items, query]);

  const toggle = useCallback(
    (id: string) => {
      haptic.select();
      if (mode === 'single') {
        setSelectedIds([id]);
        return;
      }
      setSelectedIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
    },
    [mode],
  );

  const isDirty = extraDirty || !haveSameIds(selectedIds, initialSelectedIds);
  const count = selectedIds.length;
  const canSave = isDirty && !loading && !loadError && (!requireSelection || count > 0);

  const requestClose = useCallback(() => {
    if (saving) return;
    requestCloseIfClean({ isDirty, onClose });
  }, [isDirty, onClose, saving]);

  const statusLine = saving
    ? savingLabel
    : count > 0
      ? `${count} ${selectionNoun}${isDirty ? ' · not saved yet' : ''}`
      : mode === 'single'
        ? 'Pick one'
        : 'Tap to select';

  const showEmpty = !loading && !loadError && items.length === 0;

  return (
    <BottomSheetShell
      visible={visible}
      onClose={requestClose}
      scrollable={false}
      keyboardShouldPersistTaps="handled"
      accessibilityLabel={`Close ${title}`}
      backgroundColor={Garden.cream}
      borderColor={Garden.ink12}
      handleColor={Garden.ink25}
      maxHeight="88%"
      enableDragToDismiss={!isDirty && !saving}
      sheetStyle={styles.sheet}
      header={
        <View testID={testID}>
          <AdminSheetHeader
            title={title}
            subtitle={subtitle}
            aside={isDirty && !saving ? <GChip label="Changed" tone="warning" /> : null}
            onClose={requestClose}
          />
        </View>
      }
      footer={
        <View style={styles.footer}>
          <Text style={styles.footerStatus} accessibilityLiveRegion="polite">
            {statusLine}
          </Text>
          <View style={styles.footerButtons}>
            <GOutlineButton label="Cancel" onPress={requestClose} />
            <GToyButton
              label={saving ? savingLabel : saveLabel(count)}
              icon="checkmark"
              loading={saving}
              disabled={!canSave || saving}
              onPress={() => void onSave(selectedIds)}
            />
          </View>
        </View>
      }>
      {notice ? <GInlineBanner tone={notice.tone} title={notice.title} description={notice.description} /> : null}
      {top}
      {loadError && !loading ? (
        <GInlineBanner
          tone="error"
          title="Couldn't load the list"
          description={loadError}
          action={onRetryLoad ? <GLink label="Try again" icon="refresh" onPress={onRetryLoad} /> : undefined}
        />
      ) : loading ? (
        <View style={styles.skeletonList} accessibilityLabel="Loading">
          {Array.from({ length: 5 }, (_, index) => (
            <GSkeleton key={index} style={styles.skeletonOption} />
          ))}
        </View>
      ) : showEmpty ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={24} color={Garden.soft} />
          <Text style={styles.emptyCopy}>{emptyText}</Text>
        </View>
      ) : (
        <>
          {helper ? <Text style={styles.helper}>{helper}</Text> : null}
          <View style={styles.search}>
            <Ionicons name="search" size={16} color={Garden.soft} />
            <TextInput
              accessibilityLabel={searchAccessibilityLabel ?? searchPlaceholder}
              placeholder={searchPlaceholder}
              placeholderTextColor={Garden.soft}
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
            />
          </View>
          <FlatList
            data={rows}
            keyExtractor={(row) => row.key}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            renderItem={({ item: row }) => {
              if (row.type === 'header') return <GKicker style={styles.groupLabel}>{row.label}</GKicker>;
              const { item } = row;
              const selected = selectedIds.includes(item.id);
              return (
                <GPressable
                  accessibilityRole={mode === 'single' ? 'radio' : 'checkbox'}
                  accessibilityLabel={item.meta ? `${item.title}. ${item.meta}` : item.title}
                  accessibilityState={mode === 'single' ? { selected, disabled: saving } : { checked: selected, disabled: saving }}
                  disabled={saving}
                  haptic="none"
                  pressedScale={0.985}
                  onPress={() => toggle(item.id)}
                  style={[
                    styles.option,
                    selected
                      ? { borderColor: accent.clay, backgroundColor: accent.wash }
                      : { borderColor: Garden.ink12, backgroundColor: Garden.white },
                  ]}>
                  {item.leading}
                  <View style={styles.optionCopy}>
                    <Text style={styles.optionTitle}>{item.title}</Text>
                    {item.meta ? <Text style={styles.optionMeta}>{item.meta}</Text> : null}
                  </View>
                  <View
                    style={[
                      mode === 'single' ? styles.radio : styles.check,
                      selected
                        ? { backgroundColor: accent.clay, borderColor: accent.clay }
                        : { backgroundColor: Garden.white, borderColor: Garden.ink25 },
                    ]}>
                    {selected ? <Ionicons name="checkmark" size={15} color={Garden.white} /> : null}
                  </View>
                </GPressable>
              );
            }}
            ListEmptyComponent={<Text style={styles.emptyCopy}>{noMatchText}</Text>}
          />
        </>
      )}
    </BottomSheetShell>
  );
}

const EMPTY: string[] = [];

const styles = StyleSheet.create({
  sheet: { paddingHorizontal: 16, gap: 12 },
  helper: { fontFamily: GardenFonts.bodySemi, fontSize: 13.5, lineHeight: 19, color: Garden.soft },
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
  list: { flex: 1 },
  groupLabel: { marginTop: 10, marginBottom: 6 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  optionCopy: { flex: 1, gap: 2 },
  optionTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  optionMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  skeletonList: { gap: 8 },
  skeletonOption: { height: 56, borderRadius: 16 },
  emptyState: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  emptyCopy: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 20,
    color: Garden.soft,
    textAlign: 'center',
    paddingVertical: 8,
  },
  footer: { gap: 10, paddingTop: 12, borderTopWidth: 1.5, borderTopColor: Garden.ink10 },
  footerStatus: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.soft },
  footerButtons: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10 },
});
