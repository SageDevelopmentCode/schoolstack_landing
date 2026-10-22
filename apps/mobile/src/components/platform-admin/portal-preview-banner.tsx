import { StyleSheet, Text, View } from 'react-native';

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
      <Text style={styles.title} numberOfLines={1}>
        Previewing as {previewSession.subjectLabel} · Read-only
      </Text>
      <StoryTextLink
        label="Exit preview"
        onPress={onExit}
        variant="primary"
        hitSlop={8}
        style={styles.exit}
      />
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
    paddingVertical: Spacing.one,
    backgroundColor: '#F5F0FF',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD6FE',
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    color: '#4C1D95',
  },
  exit: {
    paddingVertical: 0,
  },
});
