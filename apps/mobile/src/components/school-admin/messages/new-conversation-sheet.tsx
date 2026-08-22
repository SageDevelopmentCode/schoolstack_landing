import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MessagesAvatar } from '@/components/school-admin/messages/messages-avatar';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import type { MessageContact } from '@/lib/messages/types';

type NewConversationSheetProps = {
  visible: boolean;
  contacts: MessageContact[];
  onClose: () => void;
  onSelect: (contact: MessageContact) => void;
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
}: NewConversationSheetProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = useMemo(
    () => contacts.filter((contact) => matchesContact(contact, searchQuery)),
    [contacts, searchQuery],
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              Cancel
            </ThemedText>
          </Pressable>
          <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
            New message
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <View
          style={[
            styles.searchWrap,
            {
              backgroundColor: theme.input,
              borderColor: theme.inputBorder,
            },
          ]}>
          <Ionicons name="search" size={18} color={theme.textTertiary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search contacts"
            placeholderTextColor={theme.textTertiary}
            autoCorrect={false}
            style={[styles.searchInput, { color: theme.textPrimary, fontFamily: Fonts.body }]}
          />
        </View>

        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <ThemedText type="small" style={{ color: theme.textTertiary, textAlign: 'center', marginTop: 24 }}>
              No contacts found.
            </ThemedText>
          }
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              onPress={() => onSelect(item)}
              style={({ pressed }) => [
                styles.contactRow,
                { borderBottomColor: theme.border, opacity: pressed ? 0.85 : 1 },
              ]}>
              <MessagesAvatar
                name={item.name}
                color={item.color}
                photoUrl={item.profilePhotoUrl}
                size="sm"
              />
              <View style={styles.contactText}>
                <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                  {item.name}
                </ThemedText>
                {item.subtitle ? (
                  <ThemedText type="small" numberOfLines={2} style={{ color: theme.textSecondary }}>
                    {item.subtitle}
                  </ThemedText>
                ) : null}
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
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSpacer: {
    width: 48,
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
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  contactText: {
    flex: 1,
    gap: 2,
  },
});
