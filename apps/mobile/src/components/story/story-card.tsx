import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import { Story, StoryRadius, storyCardShadow } from '@/constants/story-theme';
import { useOptionalParentTheme } from '@/contexts/parent-theme-context';

type StoryCardVariant = 'default' | 'today' | 'primary';

type StoryCardProps = ViewProps & {
  compact?: boolean;
  variant?: StoryCardVariant;
  style?: ViewStyle;
};

export function StoryCard({
  children,
  compact = false,
  variant = 'default',
  style,
  ...rest
}: StoryCardProps) {
  const theme = useOptionalParentTheme();
  const primaryColor = theme?.primary ?? Story.primary;
  const borderRadius = compact ? StoryRadius.cardCompact : StoryRadius.card;

  if (variant === 'today') {
    return (
      <LinearGradient
        colors={['#FFFDF6', '#F2F8EF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          styles.gradientCard,
          { borderRadius },
          storyCardShadow(),
          style,
        ]}
        {...rest}>
        {children}
      </LinearGradient>
    );
  }

  if (variant === 'primary') {
    return (
      <View
        style={[
          styles.card,
          styles.primaryCard,
          { borderRadius, backgroundColor: primaryColor, borderColor: 'transparent' },
          storyCardShadow(),
          style,
        ]}
        {...rest}>
        {children}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        { borderRadius, backgroundColor: Story.white, borderColor: Story.line },
        storyCardShadow(),
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  gradientCard: {
    borderColor: 'rgba(74, 97, 82, 0.1)',
  },
  primaryCard: {
    borderWidth: 0,
  },
});
