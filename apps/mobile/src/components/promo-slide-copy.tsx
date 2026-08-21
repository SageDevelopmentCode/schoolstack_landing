import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { PageDots } from '@/components/page-dots';
import { ThemedText } from '@/components/themed-text';
import { PROMO_SLIDES } from '@/constants/promo-slides';
import { Brand } from '@/constants/theme';

type PromoSlideCopyProps = {
  activeSlide: number;
  variant?: 'default' | 'compact';
};

export function PromoSlideCopy({ activeSlide, variant = 'default' }: PromoSlideCopyProps) {
  const slide = PROMO_SLIDES[activeSlide];
  const isCompact = variant === 'compact';

  return (
    <View style={styles.container}>
      <Animated.View
        key={activeSlide}
        entering={FadeIn.duration(350)}
        exiting={FadeOut.duration(250)}
        style={styles.copy}>
        {!isCompact ? (
          <View style={styles.badge}>
            <ThemedText type="badge" style={styles.badgeText}>
              {slide.badge}
            </ThemedText>
          </View>
        ) : null}

        {isCompact ? (
          <ThemedText type="title" style={styles.headlineCompact} numberOfLines={2}>
            {slide.headlineLead}{' '}
            <ThemedText type="displayAccent" style={styles.headlineAccentInline}>
              {slide.headlineAccent}
            </ThemedText>
          </ThemedText>
        ) : (
          <>
            <ThemedText type="title" style={styles.headline}>
              {slide.headlineLead}
            </ThemedText>
            <ThemedText type="displayAccent" style={styles.headlineAccent}>
              {slide.headlineAccent}
            </ThemedText>
            <ThemedText type="small" style={styles.subtext} numberOfLines={3}>
              {slide.subtext}
            </ThemedText>
          </>
        )}
      </Animated.View>

      <PageDots count={PROMO_SLIDES.length} activeIndex={activeSlide} variant="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  copy: {
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  badgeText: {
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1.2,
  },
  headline: {
    color: Brand.white,
    fontSize: 22,
    lineHeight: 28,
  },
  headlineCompact: {
    color: Brand.white,
    fontSize: 20,
    lineHeight: 26,
  },
  headlineAccent: {
    color: Brand.claySoft,
    fontSize: 22,
    lineHeight: 28,
    marginTop: 2,
  },
  headlineAccentInline: {
    color: Brand.claySoft,
    fontSize: 20,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  subtext: {
    color: 'rgba(255,255,255,0.75)',
    marginTop: 12,
    lineHeight: 20,
  },
});
