import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { GInlineBanner } from '@/components/parent/garden/fields';
import { useGardenToast } from '@/components/parent/garden/toast';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import {
  GCard,
  GHand,
  GOutlineButton,
  GPressable,
  GSkeleton,
} from '@/components/parent/garden/ui';
import { calmFadeIn } from '@/lib/motion/portal-motion';
import type { ParentCoopCurriculumDiscussionMessage } from '@/lib/parent/parent-portal-api';

function messageTime(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * The guide's discussion: a Show/Hide header, chat bubbles (yours on the
 * accent wash), then the composer. Read-only previews see the thread only.
 */
export function CurriculumDiscussionCard({
  guideName,
  open,
  onToggle,
  messages,
  loading,
  currentGuardianId,
  readOnly,
  onSend,
  onComposerFocus,
  index,
}: {
  guideName: string;
  open: boolean;
  onToggle: () => void;
  messages: ParentCoopCurriculumDiscussionMessage[];
  loading: boolean;
  currentGuardianId: string | null;
  readOnly: boolean;
  onSend: (body: string) => Promise<boolean>;
  onComposerFocus: () => void;
  index: number;
}) {
  const accent = useGardenAccent();
  const toast = useGardenToast();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [focused, setFocused] = useState(false);

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    const ok = await onSend(body);
    setSending(false);
    if (ok) {
      setDraft('');
    } else {
      toast.error("Couldn't send your message", {
        id: 'coop-curriculum-send',
        description: 'Your message is still in the box. Check your connection, then try again.',
        action: { label: 'Try again', onPress: () => void send() },
      });
    }
  };

  return (
    <GCard index={index} testID="parent-coop-curriculum-discussion" style={styles.card}>
      <GPressable
        accessibilityLabel={open ? 'Hide discussion' : 'Show discussion'}
        accessibilityHint={`Messages about ${guideName}`}
        accessibilityState={{ expanded: open }}
        haptic="select"
        pressedScale={0.99}
        onPress={onToggle}
        style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: Garden.sky }]}>
          <Ionicons name="chatbubbles-outline" size={19} color={Garden.ink} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title} accessibilityRole="header">
            Discussion
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {open && !loading && messages.length > 0
              ? `${messages.length} ${messages.length === 1 ? 'message' : 'messages'} about this guide`
              : 'Questions and notes about this guide'}
          </Text>
        </View>
        <Text style={[styles.toggle, { color: accent.clayDeep }]}>{open ? 'Hide' : 'Show'}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={accent.clayDeep} />
      </GPressable>

      {open ? (
        <Animated.View entering={calmFadeIn()} style={styles.body}>
          {loading ? (
            <View style={styles.thread} accessibilityLabel="Loading messages" accessible>
              <GSkeleton style={styles.bubbleSkeleton} />
              <GSkeleton style={[styles.bubbleSkeleton, styles.bubbleSkeletonMine]} />
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No messages yet. Start the conversation.</Text>
              <GHand>Ask the first question</GHand>
            </View>
          ) : (
            <View style={styles.thread}>
              {messages.map((message) => {
                const mine = message.senderGuardianId === currentGuardianId;
                const when = messageTime(message.createdAt);
                return (
                  <View
                    key={message.id}
                    accessible
                    accessibilityLabel={`${mine ? 'You' : message.senderDisplayName}${when ? `, ${when}` : ''}: ${message.body}`}
                    style={[
                      styles.bubble,
                      mine
                        ? styles.bubbleMine
                        : styles.bubbleOther,
                    ]}>
                    <View style={styles.bubbleMeta}>
                      <Text style={styles.author} numberOfLines={1}>
                        {message.senderDisplayName}
                        {mine ? ' (you)' : ''}
                      </Text>
                      {when ? <Text style={styles.when}>{when}</Text> : null}
                    </View>
                    <Text style={styles.message}>{message.body}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {readOnly ? (
            <GInlineBanner tone="info" title="Preview mode" description="Posting is turned off here." />
          ) : (
            <View style={styles.composer}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Write a message…"
                placeholderTextColor={Garden.ink60}
                accessibilityLabel={`Message about ${guideName}`}
                multiline
                onFocus={() => {
                  setFocused(true);
                  onComposerFocus();
                }}
                onBlur={() => setFocused(false)}
                style={[
                  styles.input,
                  {
                    borderColor: focused ? accent.clay : Garden.ink15,
                    borderWidth: focused ? 2 : 1.5,
                  },
                ]}
              />
              <GOutlineButton
                label={sending ? 'Sending…' : 'Send'}
                icon="send"
                accessibilityLabel="Send message"
                onPress={() => void send()}
                style={[styles.send, (!draft.trim() || sending) && styles.sendInactive]}
              />
            </View>
          )}
        </Animated.View>
      ) : null}
    </GCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: 0, overflow: 'hidden' },
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: Garden.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1, minWidth: 0, gap: 1 },
  title: {
    fontFamily: GardenFonts.display,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.4,
    color: Garden.ink,
  },
  subtitle: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft },
  toggle: { fontFamily: GardenFonts.bodyExtra, fontSize: 14 },
  body: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: Garden.ink10,
  },
  thread: { gap: 10, paddingTop: 12 },
  bubble: { maxWidth: '88%', borderRadius: 18, borderWidth: 1.5, padding: 12, gap: 4 },
  // A fixed pastel: the accent wash reads grey on purple schools.
  bubbleMine: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
    backgroundColor: Garden.lav,
    borderColor: Garden.ink10,
  },
  bubbleOther: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
    backgroundColor: Garden.paper,
    borderColor: Garden.ink10,
  },
  bubbleMeta: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  author: { flexShrink: 1, fontFamily: GardenFonts.bodyExtra, fontSize: 13, color: Garden.ink },
  when: { fontFamily: GardenFonts.bodySemi, fontSize: 12, color: Garden.soft },
  message: { fontFamily: GardenFonts.bodySemi, fontSize: 15, lineHeight: 21, color: Garden.ink },
  bubbleSkeleton: { width: '70%', height: 54, borderRadius: 18 },
  bubbleSkeletonMine: { alignSelf: 'flex-end', width: '55%' },
  empty: { paddingTop: 12, gap: 4 },
  emptyText: { fontFamily: GardenFonts.bodySemi, fontSize: 15, lineHeight: 21, color: Garden.soft },
  composer: { gap: 10 },
  input: {
    minHeight: 88,
    maxHeight: 180,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: Garden.paper,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 16,
    lineHeight: 22,
    color: Garden.ink,
    textAlignVertical: 'top',
  },
  send: { alignSelf: 'flex-end', minHeight: 44 },
  sendInactive: { opacity: 0.5 },
});

