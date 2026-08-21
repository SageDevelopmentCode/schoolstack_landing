import { StyleSheet, View } from 'react-native';

import { ImageCarousel } from '@/components/image-carousel';
import { AUTH_GATE_SLIDE_INTERVAL_MS, PROMO_SLIDES } from '@/constants/promo-slides';

type PromoSlideshowProps = {
  activeSlide: number;
  onSlideChange: (index: number) => void;
};

export function PromoSlideshow({ activeSlide, onSlideChange }: PromoSlideshowProps) {
  return (
    <View style={styles.container}>
      <ImageCarousel
        slides={PROMO_SLIDES}
        activeIndex={activeSlide}
        onIndexChange={onSlideChange}
        autoAdvanceMs={AUTH_GATE_SLIDE_INTERVAL_MS}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
  },
});
