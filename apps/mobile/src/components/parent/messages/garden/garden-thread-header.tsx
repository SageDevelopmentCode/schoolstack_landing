import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GChip, GKicker, GPressable } from '@/components/parent/garden/ui';
import { MessagesAvatar } from '@/components/school-admin/messages/messages-avatar';
import { MessagesDualAvatar } from '@/components/school-admin/messages/messages-dual-avatar';
import { MAX_ATTACHMENT_MB_LABEL } from '@/lib/messages/parent-messages-feedback';
import { MAX_MESSAGE_ATTACHMENTS } from '@/lib/messages/constants';
import { isMudKitchenSupportListThread } from '@/lib/messages/platform-support';
import type { MessageParticipantKind, MessageThreadDetail } from '@/lib/messages/types';

const KIND_LABEL: Record<MessageParticipantKind, string> = {
  family: 'Family',
  guardian: 'Family',
  staff_member: 'Teacher',
  school_office: 'School office',
  platform_support: 'MudKitchen Support',
};

function ThreadAvatar({ thread, size }: { thread: MessageThreadDetail; size: 'md' | 'lg' }) {
  const support = isMudKitchenSupportListThread(thread);
  if (thread.listAvatars?.length === 2) {
    return <MessagesDualAvatar avatars={thread.listAvatars} size={size} />;
  }
  return (
    <MessagesAvatar
      name={thread.title}
      color={thread.color}
      photoUrl={thread.photoUrl}
      size={size}
      photoBackgroundColor={support && thread.photoUrl ? Garden.white : undefined}
      photoContentFit={support && thread.photoUrl ? 'contain' : 'cover'}
    />
  );
}

function DetailsSheet({
  thread,
  visible,
  onClose,
}: {
  thread: MessageThreadDetail;
  visible: boolean;
  onClose: () => void;
}) {
  const kinds = Array.from(
    new Set(thread.participants.map((participant) => KIND_LABEL[participant.kind])),
  );
  const people = thread.listAvatars?.map((avatar) => avatar.name) ?? [];
  const students = thread.subtitleStudents ?? [];

  return (
    <GSheet
      visible={visible}
      onClose={onClose}
      title={thread.title}
      subtitle={thread.subtitle}>
      <View style={styles.detailCard}>
        <ThreadAvatar thread={thread} size="lg" />
        <View style={styles.detailCopy}>
          <Text style={styles.detailTitle}>{thread.title}</Text>
          {thread.subject ? <Text style={styles.detailMeta}>{thread.subject}</Text> : null}
        </View>
      </View>

      {people.length > 0 || kinds.length > 0 ? (
        <View style={styles.section}>
          <GKicker>Who’s here</GKicker>
          <View style={styles.chips}>
            {people.map((name) => (
              <GChip key={`p-${name}`} label={name} icon="person" tone="info" />
            ))}
            {kinds.map((kind) => (
              <GChip key={`k-${kind}`} label={kind} tone="neutral" />
            ))}
          </View>
        </View>
      ) : null}

      {students.length > 0 ? (
        <View style={styles.section}>
          <GKicker>About</GKicker>
          <View style={styles.chips}>
            {students.map((student) => (
              <GChip key={student.id} label={student.name} icon="happy-outline" tone="success" />
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <GKicker>Tips</GKicker>
        <View style={styles.tip}>
          <Ionicons name="hand-left-outline" size={16} color={Garden.ink} />
          <Text style={styles.tipText}>Press and hold your own message to edit or delete it.</Text>
        </View>
        <View style={styles.tip}>
          <Ionicons name="attach" size={16} color={Garden.ink} />
          <Text style={styles.tipText}>
            Attach up to {MAX_MESSAGE_ATTACHMENTS} photos or files per message, up to{' '}
            {MAX_ATTACHMENT_MB_LABEL} each.
          </Text>
        </View>
      </View>
    </GSheet>
  );
}

/** Garden conversation header: 44pt back, avatar + Bricolage title, details button. */
export function GardenThreadHeader({ thread }: { thread: MessageThreadDetail }) {
  const router = useRouter();
  const accent = useGardenAccent();
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <View style={styles.header}>
      <GPressable
        accessibilityLabel="Back to Messages"
        onPress={() => router.back()}
        hitSlop={8}
        style={styles.back}>
        <Ionicons name="chevron-back" size={22} color={accent.clayDeep} />
      </GPressable>

      <GPressable
        accessibilityLabel={`Conversation details for ${thread.title}`}
        accessibilityHint="Shows who is in this conversation"
        onPress={() => setDetailsOpen(true)}
        pressedScale={0.98}
        style={styles.center}>
        <ThreadAvatar thread={thread} size="md" />
        <View style={styles.titleBlock}>
          <Text accessibilityRole="header" style={styles.title} numberOfLines={1}>
            {thread.title}
          </Text>
          {thread.subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {thread.subtitle}
            </Text>
          ) : null}
        </View>
      </GPressable>

      <GPressable
        accessibilityLabel="Conversation details"
        onPress={() => setDetailsOpen(true)}
        style={styles.info}>
        <Ionicons name="information-circle-outline" size={22} color={Garden.ink} />
      </GPressable>

      <DetailsSheet thread={thread} visible={detailsOpen} onClose={() => setDetailsOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: Garden.cream,
    borderBottomWidth: 1.5,
    borderBottomColor: Garden.ink10,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: GardenFonts.display,
    fontSize: 19,
    lineHeight: 23,
    letterSpacing: -0.4,
    color: Garden.ink,
  },
  subtitle: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 17,
    color: Garden.soft,
  },
  info: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Garden.ink15,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.white,
  },
  detailCopy: {
    flex: 1,
    gap: 2,
  },
  detailTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 16,
    lineHeight: 21,
    color: Garden.ink,
  },
  detailMeta: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: Garden.soft,
  },
  section: {
    gap: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 20,
    color: Garden.ink,
  },
});
