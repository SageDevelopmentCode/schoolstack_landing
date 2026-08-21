import { StyleSheet, View } from 'react-native';

import { Brand } from '@/constants/theme';

type PageDotsProps = {
  count: number;
  activeIndex: number;
  variant?: 'light' | 'dark';
};

export function PageDots({ count, activeIndex, variant = 'light' }: PageDotsProps) {
  const activeColor = variant === 'light' ? Brand.white : Brand.accent;
  const inactiveColor =
    variant === 'light' ? 'rgba(255,255,255,0.35)' : 'rgba(46,74,60,0.25)';

  return (
    <View style={styles.container}>
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === activeIndex
              ? [styles.dotActive, { backgroundColor: activeColor }]
              : [styles.dotInactive, { backgroundColor: inactiveColor }],
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 16,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
  },
  dotInactive: {
    width: 6,
  },
});
