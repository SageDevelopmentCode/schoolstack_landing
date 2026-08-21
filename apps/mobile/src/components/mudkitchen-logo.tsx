import { Image } from 'expo-image';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand } from '@/constants/theme';

type MudKitchenLogoProps = {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md';
  style?: ViewStyle;
};

export function MudKitchenLogo({ variant = 'light', size = 'md', style }: MudKitchenLogoProps) {
  const isDark = variant === 'dark';
  const logoSize = size === 'sm' ? 20 : 24;
  const textColor = isDark ? Brand.white : Brand.clay;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.badge, isDark ? styles.badgeDark : styles.badgeLight]}>
        <Image
          source={require('@/assets/images/logo.webp')}
          style={{ width: logoSize, height: logoSize }}
          contentFit="contain"
        />
        <ThemedText
          type="logo"
          style={[styles.wordmark, { color: textColor, fontSize: size === 'sm' ? 14 : 16 }]}>
          MudKitchen
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  badgeLight: {
    backgroundColor: Brand.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeDark: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  wordmark: {
    fontWeight: '600',
  },
});
