import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { PageDots } from '@/components/page-dots';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { INTRO_SLIDES } from '@/constants/intro-slides';
import { Story, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { isMobileE2e } from '@/lib/e2e';

type IntroSlideCopyProps = {
  activeIndex: number;
  variant?: 'paper' | 'overlay';
};

const slideEntering = isMobileE2e ? undefined : FadeIn.duration(350);
const slideExiting = isMobileE2e ? undefined : FadeOut.duration(250);

export function IntroSlideCopy({ activeIndex, variant: _variant = 'paper' }: IntroSlideCopyProps) {
  const slide = INTRO_SLIDES[activeIndex];

  return (
    <View style={styles.container}>
      <Animated.View
        key={activeIndex}
        entering={slideEntering}
        exiting={slideExiting}
        style={styles.copy}>
        <StorySectionKicker>School management</StorySectionKicker>
        <StoryDisplayHeading size="section" style={styles.headline}>
          {slide.headlineLead}
        </StoryDisplayHeading>
        <Text style={styles.headlineAccent}>{slide.headlineAccent}</Text>
      </Animated.View>

      <PageDots count={INTRO_SLIDES.length} activeIndex={activeIndex} variant="story" />
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
    marginBottom: 0,
  },
  headlineAccent: {
    fontFamily: StoryFonts.display,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
    letterSpacing: -0.72,
    color: Story.primary,
    fontStyle: 'italic',
  },
});
