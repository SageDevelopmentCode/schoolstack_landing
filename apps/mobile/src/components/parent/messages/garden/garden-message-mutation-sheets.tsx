import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GChip, GOutlineButton, GPressable, GToyButton } from '@/components/parent/garden/ui';
import type { MessageThreadMutations } from '@/lib/messages/use-message-thread-mutations';

type Props = Pick<
  MessageThreadMutations,
  | 'actionTarget'
  | 'closeActionSheet'
  | 'handleActionEdit'
  | 'handleActionDelete'
  | 'deleteTarget'
  | 'closeDeleteConfirm'
  | 'confirmDelete'
  | 'deleting'
> & {
  /** Shown inside the confirm sheet (toasts render behind open sheets). */
  deleteError?: string | null;
};

function preview(body: string | undefined): string | null {
  const text = body?.trim();
  if (!text) return null;
  return text.length > 120 ? `${text.slice(0, 117)}…` : text;
}

/** Garden edit / delete flow for your own message (same state machine as the shared overlays). */
export function GardenMessageMutationSheets({
  actionTarget,
  closeActionSheet,
  handleActionEdit,
  handleActionDelete,
  deleteTarget,
  closeDeleteConfirm,
  confirmDelete,
  deleting,
  deleteError = null,
}: Props) {
  const accent = useGardenAccent();
  const actionPreview = preview(actionTarget?.body);
  const deletePreview = preview(deleteTarget?.body);

  return (
    <>
      <GSheet
        visible={actionTarget !== null}
        onClose={closeActionSheet}
        kicker="Your message"
        title="What would you like to do?">
        {actionPreview ? (
          <View style={[styles.quote, { borderLeftColor: accent.clay }]}>
            <Text style={styles.quoteText} numberOfLines={3}>
              {actionPreview}
            </Text>
          </View>
        ) : null}
        <GPressable
          accessibilityLabel="Edit"
          accessibilityHint="Puts the message back in the box so you can change it"
          haptic="select"
          onPress={() => {
            handleActionEdit();
            closeActionSheet();
          }}
          style={styles.action}>
          <View style={[styles.actionIcon, { backgroundColor: Garden.sky }]}>
            <Ionicons name="pencil" size={18} color={Garden.ink} />
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.actionTitle}>Edit</Text>
            <Text style={styles.actionMeta}>Fix a typo or add something. It’ll show “(Edited)”.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Garden.ink25} />
        </GPressable>
        <GPressable
          accessibilityLabel="Delete"
          accessibilityHint="Asks you to confirm before deleting"
          haptic="select"
          onPress={() => {
            handleActionDelete();
            closeActionSheet();
          }}
          style={styles.action}>
          <View style={[styles.actionIcon, { backgroundColor: Garden.peach }]}>
            <Ionicons name="trash-outline" size={18} color="#7E4533" />
          </View>
          <View style={styles.actionCopy}>
            <Text style={[styles.actionTitle, styles.danger]}>Delete</Text>
            <Text style={styles.actionMeta}>Everyone will see “Message deleted”.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Garden.ink25} />
        </GPressable>
      </GSheet>

      <GSheet
        visible={deleteTarget !== null}
        onClose={closeDeleteConfirm}
        accessibilityLabel="Close delete confirmation"
        kicker="Please confirm"
        title="Delete message?"
        subtitle="This can’t be undone. Everyone in the conversation will see “Message deleted”."
        headerAside={deleteError ? <GChip label="Not deleted" tone="alert" icon="alert-circle" /> : undefined}>
        {deletePreview ? (
          <View style={[styles.quote, styles.quoteDanger]}>
            <Text style={styles.quoteText} numberOfLines={3}>
              {deletePreview}
            </Text>
          </View>
        ) : null}
        {deleteError ? (
          <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.errorNote}>
            <Ionicons name="alert-circle" size={18} color="#7E4533" />
            <Text style={styles.errorText}>
              Couldn’t delete that message. {deleteError} Try again, or keep it for now.
            </Text>
          </View>
        ) : null}
        <View style={styles.confirmRow}>
          <GToyButton
            label={deleting ? 'Deleting…' : deleteError ? 'Try again' : 'Delete message'}
            accessibilityLabel="Delete"
            icon="trash-outline"
            loading={deleting}
            onPress={() => {
              void confirmDelete();
            }}
          />
          {!deleting ? (
            <GOutlineButton label="Keep it" accessibilityLabel="Cancel" onPress={closeDeleteConfirm} />
          ) : null}
        </View>
      </GSheet>
    </>
  );
}

const styles = StyleSheet.create({
  quote: {
    borderLeftWidth: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Garden.white,
  },
  quoteDanger: {
    borderLeftColor: '#C2694F',
  },
  quoteText: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 20,
    color: Garden.ink,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.white,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Garden.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCopy: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 16,
    lineHeight: 21,
    color: Garden.ink,
  },
  danger: {
    color: '#7E4533',
  },
  actionMeta: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: Garden.soft,
  },
  errorNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: Garden.peach,
  },
  errorText: {
    flex: 1,
    fontFamily: GardenFonts.bodyBold,
    fontSize: 13,
    lineHeight: 18,
    color: '#7E4533',
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 4,
    paddingBottom: 12,
  },
});
