import { StyleSheet, Text, View } from 'react-native';

import { ParentHomeDashboard } from '@/components/parent/home/parent-home-dashboard';
import { useParentHomeScreenController } from '@/components/parent/home/use-parent-home-screen-controller';
import { ParentHomeSkeleton } from '@/components/parent/parent-home-skeleton';
import { StoryButton } from '@/components/story/story-button';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

type ParentHomeScreenProps = {
  slug: string;
};

export function ParentHomeScreen({ slug }: ParentHomeScreenProps) {
  const theme = useParentTheme();
  const controller = useParentHomeScreenController(slug);

  if (controller.status === 'loading') {
    return <ParentHomeSkeleton />;
  }

  if (controller.status === 'error') {
    return (
      <View style={[styles.centered, { backgroundColor: Story.paper }]}>
        <Text style={[styles.errorText, { color: theme.muted }]}>{controller.error}</Text>
        <StoryButton
          label="Try again"
          previewSafe
          onPress={() => void controller.refresh()}
          style={styles.retry}
        />
      </View>
    );
  }

  if (controller.status !== 'ready') return null;

  return <ParentHomeDashboard {...controller.dashboardProps} />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    gap: Spacing.three,
  },
  retry: {
    minWidth: 140,
    alignSelf: 'center',
  },
  errorText: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
