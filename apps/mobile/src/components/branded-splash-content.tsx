import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand } from '@/constants/theme';

const LOGO_SIZE = 128;

type BrandedSplashContentProps = {
  variant?: 'inline' | 'overlay';
  showActivityIndicator?: boolean;
};

export function BrandedSplashContent({
  variant = 'inline',
  showActivityIndicator = false,
}: BrandedSplashContentProps) {
  const rootStyle = variant === 'overlay' ? styles.rootOverlay : styles.rootInline;

  return (
    <View style={rootStyle}>
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
        {showActivityIndicator ? (
          <ActivityIndicator color={Brand.accent} style={styles.spinner} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootInline: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rootOverlay: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  spinner: {
    marginTop: 4,
  },
});
