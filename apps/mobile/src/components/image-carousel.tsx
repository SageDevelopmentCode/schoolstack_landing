import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef } from 'react';
import {
  FlatList,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewToken,
} from 'react-native';

export type CarouselSlide = {
  image: ImageSourcePropType;
};

type ImageCarouselProps = {
  slides: CarouselSlide[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  autoAdvanceMs?: number;
};

export function ImageCarousel({
  slides,
  activeIndex,
  onIndexChange,
  autoAdvanceMs,
}: ImageCarouselProps) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<CarouselSlide>>(null);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

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
      const index = Math.round(event.nativeEvent.contentOffset.x / width);
      if (index >= 0 && index < slides.length) {
        onIndexChange(index);
      }
    },
    [onIndexChange, slides.length, width],
  );

  const renderItem = useCallback(
    ({ item }: { item: CarouselSlide }) => (
      <View style={{ width, height: '100%' }}>
        <Image source={item.image} style={styles.image} contentFit="cover" />
      </View>
    ),
    [width],
  );

  return (
    <View style={styles.container}>
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
          length: width,
          offset: width * index,
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
      <LinearGradient
        colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.85)']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
