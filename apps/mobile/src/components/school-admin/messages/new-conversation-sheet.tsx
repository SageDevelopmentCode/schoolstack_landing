import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MessagesAvatar } from '@/components/school-admin/messages/messages-avatar';
import {
  MESSAGES_SEARCH_FIELD_BG,
} from '@/components/parent/messages/messages-layout';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { ThemedText } from '@/components/themed-text';
import { StoryFonts } from '@/constants/story-theme';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { useOptionalParentTheme } from '@/contexts/parent-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import type { MessagesLayoutVariant } from '@/lib/messages/messages-layout-variant';
import { isStoryMessagesVariant } from '@/lib/messages/messages-layout-variant';
import type { MessageContact } from '@/lib/messages/types';

type NewConversationSheetProps = {
  visible: boolean;
  contacts: MessageContact[];
  onClose: () => void;
  onSelect: (contact: MessageContact) => void;
  variant?: MessagesLayoutVariant;
};

function matchesContact(contact: MessageContact, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return [contact.name, contact.subtitle ?? ''].join(' ').toLowerCase().includes(normalized);
}

export function NewConversationSheet({
  visible,
  contacts,
  onClose,
  onSelect,
  variant = 'default',
}: NewConversationSheetProps) {
  const theme = useAdminTheme();
  const parentTheme = useOptionalParentTheme();
  const parentStory = isStoryMessagesVariant(variant) && parentTheme;
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = useMemo(
    () => contacts.filter((contact) => matchesContact(contact, searchQuery)),
    [contacts, searchQuery],
  );

  const backgroundColor = parentStory ? parentTheme.paper : theme.bg;
  const surfaceColor = parentStory ? parentTheme.white : theme.bg;
  const borderColor = parentStory ? parentTheme.line : theme.border;
  const accentColor = parentStory ? parentTheme.primary : theme.accent;
  const textPrimary = parentStory ? parentTheme.ink : theme.textPrimary;
  const textSecondary = parentStory ? parentTheme.muted : theme.textSecondary;
  const textTertiary = parentStory ? parentTheme.muted : theme.textTertiary;
  const searchBg = parentStory ? MESSAGES_SEARCH_FIELD_BG : theme.input;
  const searchBorder = parentStory ? parentTheme.line : theme.inputBorder;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: borderColor, backgroundColor: surfaceColor }]}>
          <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
            {parentStory ? (
              <Text style={[styles.cancelLabel, { color: accentColor }]}>Cancel</Text>
            ) : (
              <ThemedText type="small" style={{ color: accentColor }}>
                Cancel
              </ThemedText>
            )}
          </Pressable>
          {parentStory ? (
            <StoryDisplayHeading size="section" style={styles.sheetTitle}>
              New message
            </StoryDisplayHeading>
          ) : (
            <ThemedText type="smallBold" style={{ color: textPrimary }}>
              New message
            </ThemedText>
          )}
          <View style={styles.headerSpacer} />
        </View>

        <View
          style={[
            styles.searchWrap,
            {
              backgroundColor: searchBg,
              borderColor: searchBorder,
            },
          ]}>
          <Ionicons name="search" size={18} color={textTertiary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search contacts"
            placeholderTextColor={textTertiary}
            autoCorrect={false}
            style={[
              styles.searchInput,
              {
                color: textPrimary,
                fontFamily: parentStory ? StoryFonts.body : Fonts.body,
              },
            ]}
          />
        </View>

        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          style={{ backgroundColor: surfaceColor }}
          ListEmptyComponent={
            parentStory ? (
              <Text style={[styles.emptyText, { color: textTertiary }]}>No contacts found.</Text>
            ) : (
              <ThemedText type="small" style={{ color: textTertiary, textAlign: 'center', marginTop: 24 }}>
                No contacts found.
              </ThemedText>
            )
          }
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              onPress={() => onSelect(item)}
              style={({ pressed }) => [
                styles.contactRow,
                { borderBottomColor: borderColor, opacity: pressed ? 0.85 : 1 },
              ]}>
              <MessagesAvatar
                name={item.name}
                color={item.color}
                photoUrl={item.profilePhotoUrl}
                size="sm"
              />
              <View style={styles.contactText}>
                {parentStory ? (
                  <>
                    <Text style={[styles.contactName, { color: textPrimary }]}>{item.name}</Text>
                    {item.subtitle ? (
                      <Text style={[styles.contactSubtitle, { color: textSecondary }]} numberOfLines={2}>
                        {item.subtitle}
                      </Text>
                    ) : null}
                  </>
                ) : (
                  <>
                    <ThemedText type="smallBold" style={{ color: textPrimary }}>
                      {item.name}
                    </ThemedText>
                    {item.subtitle ? (
                      <ThemedText type="small" numberOfLines={2} style={{ color: textSecondary }}>
                        {item.subtitle}
                      </ThemedText>
                    ) : null}
                  </>
                )}
              </View>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSpacer: {
    width: 48,
  },
  sheetTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  cancelLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginHorizontal: Spacing.four,
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 4,
  },
  listContent: {
    paddingBottom: Spacing.six,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  contactText: {
    flex: 1,
    gap: 2,
  },
  contactName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  contactSubtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyText: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 24,
  },
});
