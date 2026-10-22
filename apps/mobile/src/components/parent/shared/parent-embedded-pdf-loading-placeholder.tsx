import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Story, StoryRadius } from '@/constants/story-theme';

type ParentEmbeddedPdfLoadingPlaceholderProps = {
  style?: StyleProp<ViewStyle>;
};

export function ParentEmbeddedPdfLoadingPlaceholder({
  style,
}: ParentEmbeddedPdfLoadingPlaceholderProps) {
  return (
    <View style={[styles.block, style]}>
      <View style={styles.inner} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    ...StyleSheet.absoluteFill,
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.85)',
    padding: 16,
  },
  inner: {
    flex: 1,
    borderRadius: StoryRadius.cardCompact,
    backgroundColor: Story.line,
    opacity: 0.55,
  },
});
