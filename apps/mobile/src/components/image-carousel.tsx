import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  ImageSourcePropType,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewToken,
} from 'react-native';

import { Story } from '@/constants/story-theme';

export type CarouselSlide = {
  image: ImageSourcePropType;
};

type ImageCarouselProps = {
  slides: CarouselSlide[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  autoAdvanceMs?: number;
  variant?: 'fullscreen' | 'embedded';
  height?: number;
  scrim?: 'dark' | 'story' | 'none';
};

export function ImageCarousel({
  slides,
  activeIndex,
  onIndexChange,
  autoAdvanceMs,
  variant = 'fullscreen',
  height = 240,
  scrim = 'dark',
}: ImageCarouselProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(windowWidth);
  const listRef = useRef<FlatList<CarouselSlide>>(null);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  const isEmbedded = variant === 'embedded';
  const slideWidth = isEmbedded ? containerWidth : windowWidth;

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth > 0) {
      setContainerWidth(nextWidth);
    }
  }, []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const index = viewableItems[0]?.index;
      if (index != null && index !== activeIndexRef.current) {
        onIndexChange(index);
      }
    },
    [onIndexChange],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;

  useEffect(() => {
    if (!autoAdvanceMs) return;

    const id = setInterval(() => {
      const next = (activeIndexRef.current + 1) % slides.length;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      onIndexChange(next);
    }, autoAdvanceMs);

    return () => clearInterval(id);
  }, [autoAdvanceMs, slides.length, onIndexChange]);

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
      if (index >= 0 && index < slides.length) {
        onIndexChange(index);
      }
    },
    [onIndexChange, slides.length, slideWidth],
  );

  const scrimGradient = useMemo(() => {
    if (scrim === 'story') {
      return {
        colors: ['transparent', 'rgba(248,248,243,0.92)', Story.paper] as const,
        locations: [0.38, 0.71, 1] as const,
      };
    }

    if (scrim === 'dark') {
      return {
        colors: ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.85)'] as const,
        locations: [0, 0.55, 1] as const,
      };
    }

    return null;
  }, [scrim]);

  const renderItem = useCallback(
    ({ item }: { item: CarouselSlide }) => (
      <View style={{ width: slideWidth, height: '100%' }}>
        <Image source={item.image} style={styles.image} contentFit="cover" />
      </View>
    ),
    [slideWidth],
  );

  return (
    <View
      onLayout={isEmbedded ? onLayout : undefined}
      style={[
        styles.container,
        isEmbedded ? { height, backgroundColor: 'transparent' } : styles.fullscreen,
      ]}>
      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => String(index)}
        renderItem={renderItem}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: slideWidth,
          offset: slideWidth * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          listRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: true,
          });
        }}
        style={styles.list}
      />
      {!isEmbedded && scrimGradient ? (
        <LinearGradient
          colors={scrimGradient.colors}
          locations={scrimGradient.locations}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  fullscreen: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  list: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
