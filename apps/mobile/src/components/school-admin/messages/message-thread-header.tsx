import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MessagesAvatar } from '@/components/school-admin/messages/messages-avatar';
import { MessagesDualAvatar } from '@/components/school-admin/messages/messages-dual-avatar';
import { ThemedText } from '@/components/themed-text';
import { StoryFonts } from '@/constants/story-theme';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { useOptionalParentTheme } from '@/contexts/parent-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import type { MessagesLayoutVariant } from '@/lib/messages/messages-layout-variant';
import { isStoryMessagesVariant } from '@/lib/messages/messages-layout-variant';
import type { MessageThreadSummary } from '@/lib/messages/types';

type MessageThreadHeaderProps = {
  thread: Pick<
    MessageThreadSummary,
    'title' | 'subtitle' | 'color' | 'photoUrl' | 'listAvatars'
  >;
  backLabel?: string;
  variant?: MessagesLayoutVariant;
};

export function MessageThreadHeader({
  thread,
  backLabel = 'Messages',
  variant = 'default',
}: MessageThreadHeaderProps) {
  const theme = useAdminTheme();
  const parentTheme = useOptionalParentTheme();
  const parentStory = isStoryMessagesVariant(variant) && parentTheme;
  const router = useRouter();

  const backgroundColor = parentStory ? parentTheme.paper : theme.surface;
  const borderColor = parentStory ? parentTheme.line : theme.border;
  const accentColor = parentStory ? parentTheme.primary : theme.accent;
  const titleColor = parentStory ? parentTheme.ink : theme.textPrimary;
  const subtitleColor = parentStory ? parentTheme.muted : theme.textSecondary;

  return (
    <View style={[styles.container, { borderBottomColor: borderColor, backgroundColor }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Back to ${backLabel}`}
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
        <Ionicons name="chevron-back" size={20} color={accentColor} />
        {parentStory ? (
          <Text style={[styles.backLabel, { color: accentColor }]}>{backLabel}</Text>
        ) : (
          <ThemedText type="small" style={{ color: accentColor }}>
            {backLabel}
          </ThemedText>
        )}
      </Pressable>
      <View style={styles.center}>
        {thread.listAvatars?.length === 2 ? (
          <MessagesDualAvatar avatars={thread.listAvatars} size="sm" />
        ) : (
          <MessagesAvatar
            name={thread.title}
            color={thread.color}
            photoUrl={thread.photoUrl}
            size="sm"
          />
        )}
        <View style={styles.titleBlock}>
          {parentStory ? (
            <>
              <Text style={[styles.storyTitle, { color: titleColor }]} numberOfLines={1}>
                {thread.title}
              </Text>
              {thread.subtitle ? (
                <Text style={[styles.storySubtitle, { color: subtitleColor }]} numberOfLines={1}>
                  {thread.subtitle}
                </Text>
              ) : null}
            </>
          ) : (
            <>
              <ThemedText type="smallBold" numberOfLines={1} style={{ color: titleColor }}>
                {thread.title}
              </ThemedText>
              {thread.subtitle ? (
                <ThemedText type="small" numberOfLines={1} style={{ color: subtitleColor }}>
                  {thread.subtitle}
                </ThemedText>
              ) : null}
            </>
          )}
        </View>
      </View>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 100,
  },
  backLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  titleBlock: {
    flexShrink: 1,
    maxWidth: 180,
  },
  storyTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  storySubtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  spacer: {
    minWidth: 100,
  },
});
