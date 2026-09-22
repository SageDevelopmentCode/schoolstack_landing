import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryTextLink } from '@/components/story/story-text-link';
import { useAuth } from '@/contexts/auth-context';
import { StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

type PortalPreviewBannerProps = {
  onExit: () => void;
};

export function PortalPreviewBanner({ onExit }: PortalPreviewBannerProps) {
  const { previewSession } = useAuth();

  if (!previewSession) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={2}>
          Previewing as {previewSession.subjectLabel}
        </Text>
        <Text style={styles.subtitle}>Read-only</Text>
      </View>
      <StoryTextLink label="Exit preview" onPress={onExit} variant="primary" />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.two,
    backgroundColor: '#F5F0FF',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD6FE',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: '#4C1D95',
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
    lineHeight: 14,
    color: '#6D28D9',
    textTransform: 'uppercase',
    letterSpacing: 0.44,
  },
});
