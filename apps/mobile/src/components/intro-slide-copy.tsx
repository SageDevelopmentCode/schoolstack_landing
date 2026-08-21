import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { PageDots } from '@/components/page-dots';
import { ThemedText } from '@/components/themed-text';
import { INTRO_SLIDES } from '@/constants/intro-slides';
import { Brand, Spacing } from '@/constants/theme';

type IntroSlideCopyProps = {
  activeIndex: number;
};

const isCi = process.env.CI === 'true';
const slideEntering = isCi ? undefined : FadeIn.duration(350);
const slideExiting = isCi ? undefined : FadeOut.duration(250);

export function IntroSlideCopy({ activeIndex }: IntroSlideCopyProps) {
  const slide = INTRO_SLIDES[activeIndex];

  return (
    <View style={styles.container}>
      <Animated.View
        key={activeIndex}
        entering={slideEntering}
        exiting={slideExiting}
        style={styles.copy}>
        <ThemedText type="title" style={styles.headline}>
          {slide.headlineLead}
        </ThemedText>
        <ThemedText type="displayAccent" style={styles.headlineAccent}>
          {slide.headlineAccent}
        </ThemedText>
      </Animated.View>

      <PageDots count={INTRO_SLIDES.length} activeIndex={activeIndex} variant="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  copy: {
    gap: 4,
  },
  headline: {
    color: Brand.white,
    fontSize: 26,
    lineHeight: 32,
  },
  headlineAccent: {
    color: Brand.claySoft,
    fontSize: 26,
    lineHeight: 32,
  },
});
