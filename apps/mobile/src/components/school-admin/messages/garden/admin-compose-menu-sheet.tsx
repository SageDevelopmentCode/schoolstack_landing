import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GPressable } from '@/components/parent/garden/ui';
import { AdminIconChip } from '@/components/school-admin/garden/admin-ui';

function OptionRow({
  icon,
  tint,
  title,
  description,
  onPress,
  testID,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  title: string;
  description: string;
  onPress: () => void;
  testID: string;
}) {
  return (
    <GPressable
      testID={testID}
      accessibilityLabel={title}
      accessibilityHint={description}
      pressedScale={0.985}
      onPress={onPress}
      style={styles.row}>
      <AdminIconChip name={icon} tint={tint} size={44} />
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
    </GPressable>
  );
}

/**
 * "New message" choice sheet: one conversation or a bulk message. Same testIDs
 * and labels as the Story `AdminMessagesComposeMenuSheet`; Bulk is hidden when
 * `onBulkMessage` is missing (read-only preview). The next sheet opens from
 * `onDismissed`, after this one has finished closing.
 */
export function AdminComposeMenuSheet({
  visible,
  onClose,
  onDismissed,
  onNewConversation,
  onBulkMessage,
}: {
  visible: boolean;
  onClose: () => void;
  onDismissed?: () => void;
  onNewConversation: () => void;
  onBulkMessage?: () => void;
}) {
  return (
    <GSheet
      visible={visible}
      onClose={onClose}
      onDismissed={onDismissed}
      accessibilityLabel="Close compose options"
      title="New message"
      subtitle="Start a one-to-one thread or message a group of parents.">
      <View style={styles.rows}>
        <OptionRow
          testID="admin-messages-new-conversation"
          icon="chatbubble-ellipses-outline"
          tint={Garden.peach}
          title="New conversation"
          description="Message one parent or staff member"
          onPress={onNewConversation}
        />
        {onBulkMessage ? (
          <OptionRow
            testID="admin-messages-bulk-message"
            icon="people-outline"
            tint={Garden.sky}
            title="Bulk message"
            description="Filter by program, class, grade, or parents"
            onPress={onBulkMessage}
          />
        ) : null}
      </View>
    </GSheet>
  );
}

const styles = StyleSheet.create({
  rows: { gap: 10, paddingBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 72,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.white,
  },
  copy: { flex: 1, gap: 2 },
  title: { fontFamily: GardenFonts.bodyExtra, fontSize: 16, color: Garden.ink },
  description: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
});
