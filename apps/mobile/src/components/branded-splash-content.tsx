import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand } from '@/constants/theme';

const LOGO_SIZE = 128;

export function BrandedSplashContent() {
  return (
    <>
      <LinearGradient
        colors={[Brand.surface, Brand.bg, Brand.claySoft]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <View style={styles.pedestal}>
          <Image
            style={styles.logo}
            source={require('@/assets/images/logo.png')}
            contentFit="contain"
          />
        </View>
        <ThemedText type="logo" style={styles.wordmark}>
          MudKitchen
        </ThemedText>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: 20,
  },
  pedestal: {
    width: LOGO_SIZE + 32,
    height: LOGO_SIZE + 32,
    borderRadius: (LOGO_SIZE + 32) / 2,
    backgroundColor: Brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  wordmark: {
    fontSize: 28,
  },
});
