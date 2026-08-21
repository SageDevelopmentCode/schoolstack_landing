import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type ImageStyle, type StyleProp } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Radius } from '@/constants/theme';

type OrganizationLogoProps = {
  logoSrc: string;
  logoAlt: string;
  name: string;
  variant?: 'inline' | 'header';
  style?: StyleProp<ImageStyle>;
};

export function OrganizationLogo({
  logoSrc,
  logoAlt,
  name,
  variant = 'inline',
  style,
}: OrganizationLogoProps) {
  const [imageError, setImageError] = useState(false);
  const isHeader = variant === 'header';
  const logoStyle = isHeader ? styles.headerLogo : styles.inlineLogo;
  const fallbackStyle = isHeader ? styles.headerFallback : styles.inlineFallback;

  if (!logoSrc || imageError) {
    return (
      <View style={[fallbackStyle, style]}>
        <ThemedText
          type={isHeader ? 'smallBold' : 'smallBold'}
          color={Brand.accent}
          style={isHeader ? styles.headerFallbackText : undefined}>
          {name.charAt(0)}
        </ThemedText>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: logoSrc }}
      style={[logoStyle, style]}
      contentFit="contain"
      accessibilityLabel={logoAlt || name}
      onError={() => setImageError(true)}
    />
  );
}

const styles = StyleSheet.create({
  inlineLogo: {
    width: 36,
    height: 36,
  },
  inlineFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.badgeGreen,
  },
  headerLogo: {
    width: 160,
    height: 40,
  },
  headerFallback: {
    width: 160,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.badgeGreen,
  },
  headerFallbackText: {
    fontSize: 18,
  },
});
