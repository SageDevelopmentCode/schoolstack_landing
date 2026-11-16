import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GChip, GKicker, GPressable, GSkeleton } from '@/components/parent/garden/ui';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { MessagesAvatar } from '@/components/school-admin/messages/messages-avatar';
import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';
import { haptic } from '@/lib/haptics';
import { AdminFilterChips } from '@/components/school-admin/garden/admin-ui';
import {
  countContactsByAudience,
  filterContactsForPicker,
  getContactPickerEmptyMessage,
  type MessageContactAudienceFilter,
} from '@/lib/messages/contact-filters';
import type { MessageContact, MessageContactKind } from '@/lib/messages/types';

const GROUP_ORDER: MessageContactKind[] = ['school_office', 'staff_member', 'guardian', 'platform_support'];
const GROUP_LABEL: Record<MessageContactKind, string> = {
  school_office: 'School office',
  staff_member: 'Staff',
  guardian: 'Parents',
  platform_support: 'MudKitchen',
};

export type NewConversationNotice = { tone: 'error' | 'info'; title: string; message: string };

type AdminNewConversationSheetProps = {
  visible: boolean;
  contacts: MessageContact[];
  loadingContacts?: boolean;
  /** Contact keys that already have a conversation ("Open conversation" vs "Start"). */
  existingContactKeys: ReadonlySet<string>;
  /** The contact being opened / created right now (row spinner, others disabled). */
  startingContactKey: string | null;
  notice: NewConversationNotice | null;
  onClose: () => void;
  onSelect: (contact: MessageContact) => void;
};

function StepPills() {
  const accent = useGardenAccent();
  return (
    <View
      accessible
      accessibilityLabel="Step 1 of 2: choose who. Step 2: write your message."
      style={styles.steps}>
      <View style={[styles.stepActive, { backgroundColor: accent.clay }]}>
        <View style={styles.stepNumberActive}>
          <Text style={[styles.stepNumberActiveText, { color: accent.clayDeep }]}>1</Text>
        </View>
        <Text style={styles.stepActiveLabel}>Choose who</Text>
      </View>
      <Ionicons name="arrow-forward" size={14} color={Garden.ink25} />
      <View style={styles.stepNext}>
        <View style={styles.stepNumberNext}>
          <Text style={styles.stepNumberNextText}>2</Text>
        </View>
        <Text style={styles.stepNextLabel}>Write your message</Text>
      </View>
    </View>
  );
}

/**
 * Admin Garden "Start a conversation" sheet (fork of the parent
 * `GardenNewConversationSheet`). Same device-proven keyboard path as the Story
 * `NewConversationSheet` (`scrollable={false}` + `keyboardAvoiding` + keyboard
 * lift), the admin All / Parents / Staff audience filter and its copy
 * (`getContactPickerEmptyMessage`, e.g. "No contacts match this filter"), and
 * every E2E hook: `new-conversation-sheet`, `new-conversation-search-input`,
 * "Search contacts", "Contact audience" and "Cancel".
 */
export function AdminNewConversationSheet({
  visible,
  contacts,
  loadingContacts = false,
  existingContactKeys,
  startingContactKey,
  notice,
  onClose,
  onSelect,
}: AdminNewConversationSheetProps) {
  const accent = useGardenAccent();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const keyboardLift = Math.max(0, keyboardHeight - insets.bottom);
  const [searchQuery, setSearchQuery] = useState('');
  const [audienceFilter, setAudienceFilter] = useState<MessageContactAudienceFilter>('all');
  const [wasVisible, setWasVisible] = useState(visible);
  const busy = startingContactKey !== null;

  // Reset search + filter when the sheet closes (previous-value pattern, no effect).
  if (wasVisible !== visible) {
    setWasVisible(visible);
    if (!visible) {
      setSearchQuery('');
      setAudienceFilter('all');
    }
  }

  const counts = useMemo(() => countContactsByAudience(contacts), [contacts]);
  const sections = useMemo(() => {
    const filtered = filterContactsForPicker(contacts, audienceFilter, searchQuery);
    return GROUP_ORDER.map((kind) => ({
      kind,
      title: GROUP_LABEL[kind],
      data: filtered.filter((contact) => contact.kind === kind),
    })).filter((section) => section.data.length > 0);
  }, [audienceFilter, contacts, searchQuery]);
  const hasSearch = searchQuery.trim().length > 0;
  const emptyMessage = getContactPickerEmptyMessage(audienceFilter, hasSearch);

  return (
    <BottomSheetShell
      visible={visible}
      onClose={busy ? () => {} : onClose}
      accessibilityLabel="Close new message"
      scrollable={false}
      keyboardAvoiding
      keyboardShouldPersistTaps="handled"
      bottomInset={insets.bottom + 8}
      backgroundColor={Garden.cream}
      borderColor={Garden.ink12}
      handleColor={Garden.ink25}
      maxHeight="92%"
      sheetStyle={styles.sheet}
      header={
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerCopy}>
              <Text accessibilityRole="header" style={styles.title}>
                Start a conversation
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              disabled={busy}
              hitSlop={8}
              onPress={() => {
                haptic.tap();
                onClose();
              }}
              style={({ pressed }) => [styles.cancel, pressed && styles.pressed, busy && styles.dim]}>
              <Text style={[styles.cancelLabel, { color: accent.clayDeep }]}>Cancel</Text>
            </Pressable>
          </View>
          <StepPills />
        </View>
      }>
      <View style={styles.toolbar} testID="new-conversation-sheet">
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={Garden.soft} />
          <TextInput
            testID="new-conversation-search-input"
            accessibilityLabel="Search contacts"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search contacts"
            placeholderTextColor={Garden.ink60}
            autoCorrect={false}
            returnKeyType="search"
            style={styles.searchInput}
          />
          {hasSearch ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={10}
              onPress={() => {
                haptic.select();
                setSearchQuery('');
              }}>
              <Ionicons name="close-circle" size={18} color={Garden.ink60} />
            </Pressable>
          ) : null}
        </View>

        <AdminFilterChips
          accessibilityLabel="Contact audience"
          items={[
            { id: 'all', label: 'All', count: counts.all },
            { id: 'parents', label: 'Parents', count: counts.parents },
            { id: 'staff', label: 'Staff', count: counts.staff },
          ]}
          activeId={audienceFilter}
          onChange={setAudienceFilter}
        />

        {notice ? (
          <View
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            style={[
              styles.notice,
              { backgroundColor: notice.tone === 'error' ? Garden.peach : Garden.sky },
            ]}>
            <Ionicons
              name={notice.tone === 'error' ? 'alert-circle' : 'information-circle'}
              size={18}
              color={notice.tone === 'error' ? '#7E4533' : '#24507A'}
            />
            <View style={styles.noticeCopy}>
              <Text style={styles.noticeTitle}>{notice.title}</Text>
              <Text style={styles.noticeText}>{notice.message}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.hint}>
            Message one parent or staff member. If you already have a conversation with them, we’ll open it.
          </Text>
        )}
      </View>

      {loadingContacts ? (
        <View accessibilityLabel="Loading contacts" style={styles.skeletons}>
          {[0, 1, 2, 3].map((i) => (
            <GSkeleton key={i} style={styles.skeletonRow} />
          ))}
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.key}
          stickySectionHeadersEnabled
          keyboardShouldPersistTaps="handled"
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            keyboardLift > 0 ? { paddingBottom: keyboardLift + 48 } : null,
          ]}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <GKicker>{section.title}</GKicker>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{emptyMessage}</Text>
              {hasSearch || audienceFilter !== 'all' ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Show everyone"
                  hitSlop={8}
                  onPress={() => {
                    haptic.select();
                    setSearchQuery('');
                    setAudienceFilter('all');
                  }}>
                  <Text style={[styles.emptyHint, { color: accent.clayDeep }]}>Show everyone</Text>
                </Pressable>
              ) : null}
            </View>
          }
          renderItem={({ item }) => {
            const existing = existingContactKeys.has(item.key);
            const starting = startingContactKey === item.key;
            return (
              <GPressable
                accessibilityLabel={`${item.name}${item.subtitle ? `, ${item.subtitle}` : ''}. ${
                  existing ? 'Open conversation' : 'Start a conversation'
                }`}
                accessibilityState={{ disabled: busy, busy: starting }}
                disabled={busy}
                haptic="select"
                onPress={() => onSelect(item)}
                style={[
                  styles.contactRow,
                  starting ? { borderColor: accent.clay, backgroundColor: accent.wash } : null,
                  busy && !starting ? styles.dim : null,
                ]}>
                <MessagesAvatar
                  name={item.name}
                  color={item.color}
                  photoUrl={item.profilePhotoUrl}
                  size="lg"
                  photoBackgroundColor={item.kind === 'platform_support' ? Garden.white : undefined}
                  photoContentFit={item.kind === 'platform_support' ? 'contain' : 'cover'}
                />
                <View style={styles.contactText}>
                  <Text style={styles.contactName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.subtitle ? (
                    <Text style={styles.contactSubtitle} numberOfLines={2}>
                      {item.subtitle}
                    </Text>
                  ) : null}
                </View>
                {starting ? (
                  <View style={styles.trailing}>
                    <ActivityIndicator size="small" color={accent.clayDeep} />
                    <Text style={[styles.startLabel, { color: accent.clayDeep }]}>
                      {existing ? 'Opening…' : 'Starting…'}
                    </Text>
                  </View>
                ) : existing ? (
                  <GChip label="Open conversation" tone="info" />
                ) : (
                  <View style={styles.trailing}>
                    <Text style={[styles.startLabel, { color: accent.clayDeep }]}>Start</Text>
                    <Ionicons name="arrow-forward" size={14} color={accent.clayDeep} />
                  </View>
                )}
              </GPressable>
            );
          }}
        />
      )}
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  sheet: {
    minHeight: '60%',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 14,
    gap: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: Garden.ink10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: GardenFonts.display,
    fontSize: 24,
    lineHeight: 27,
    letterSpacing: -0.6,
    color: Garden.ink,
  },
  cancel: {
    minHeight: 44,
    minWidth: 64,
    paddingHorizontal: 12,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Garden.ink25,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
  dim: {
    opacity: 0.5,
  },
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  stepActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: 12,
    borderRadius: 999,
  },
  stepNumberActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberActiveText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11,
  },
  stepActiveLabel: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 12.5,
    color: Garden.white,
  },
  stepNext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 3,
    paddingLeft: 3,
    paddingRight: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Garden.ink15,
    backgroundColor: Garden.white,
  },
  stepNumberNext: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Garden.ink25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberNextText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11,
    color: Garden.ink60,
  },
  stepNextLabel: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 12.5,
    color: Garden.ink60,
  },
  toolbar: {
    flexGrow: 0,
    flexShrink: 0,
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Garden.ink15,
    backgroundColor: Garden.white,
  },
  searchInput: {
    flex: 1,
    minHeight: 28,
    paddingVertical: 4,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 16,
    color: Garden.ink,
  },
  hint: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: Garden.soft,
    paddingHorizontal: 4,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 16,
  },
  noticeCopy: {
    flex: 1,
    gap: 2,
  },
  noticeTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    lineHeight: 19,
    color: Garden.ink,
  },
  noticeText: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: Garden.ink65,
  },
  skeletons: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
  skeletonRow: {
    height: 68,
    borderRadius: 18,
  },
  list: {
    flexGrow: 1,
    maxHeight: 480,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    gap: 8,
  },
  sectionHeader: {
    backgroundColor: Garden.cream,
    paddingTop: 12,
    paddingBottom: 6,
    paddingHorizontal: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 68,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.white,
  },
  contactText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  contactName: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    lineHeight: 20,
    color: Garden.ink,
  },
  contactSubtitle: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: Garden.soft,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  startLabel: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 13,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 28,
    gap: 4,
  },
  emptyText: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 15,
    lineHeight: 20,
    color: Garden.soft,
    textAlign: 'center',
  },
  emptyHint: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: Garden.soft,
    textAlign: 'center',
  },
});
