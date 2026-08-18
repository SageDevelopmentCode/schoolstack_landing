import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Brand, Fonts } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'body'
    | 'display'
    | 'displayLarge'
    | 'displayAccent'
    | 'title'
    | 'subtitle'
    | 'small'
    | 'smallBold'
    | 'label'
    | 'badge'
    | 'button'
    | 'logo'
    | 'link'
    | 'linkPrimary'
    | 'code';
  color?: string;
};

export function ThemedText({ style, type = 'default', color, ...rest }: ThemedTextProps) {
  return (
    <Text
      style={[
        { color: color ?? Brand.text },
        type === 'default' && styles.default,
        type === 'body' && styles.body,
        type === 'display' && styles.display,
        type === 'displayLarge' && styles.displayLarge,
        type === 'displayAccent' && styles.displayAccent,
        type === 'title' && styles.title,
        type === 'subtitle' && styles.subtitle,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'label' && styles.label,
        type === 'badge' && styles.badge,
        type === 'button' && styles.button,
        type === 'logo' && styles.logo,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  body: {
    fontFamily: Fonts.body,
    fontSize: 17,
    lineHeight: 26,
    color: `${Brand.accent}CC`,
  },
  display: {
    fontFamily: Fonts.display,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '500',
    color: Brand.accent,
  },
  displayLarge: {
    fontFamily: Fonts.display,
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '500',
    color: Brand.accent,
  },
  displayAccent: {
    fontFamily: Fonts.displayItalic,
    fontSize: 32,
    lineHeight: 36,
    fontStyle: 'italic',
    color: Brand.clay,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '500',
    color: Brand.accent,
  },
  subtitle: {
    fontFamily: Fonts.display,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '500',
    color: Brand.accent,
  },
  small: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  smallBold: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  label: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: Brand.text,
  },
  badge: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: Brand.badgeGreenText,
  },
  button: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  logo: {
    fontFamily: Fonts.display,
    fontWeight: '600',
    color: Brand.clay,
  },
  link: {
    fontFamily: Fonts.body,
    lineHeight: 20,
    fontSize: 14,
    color: Brand.textMuted,
  },
  linkPrimary: {
    fontFamily: Fonts.bodyMedium,
    lineHeight: 20,
    fontSize: 14,
    color: Brand.accent,
    fontWeight: '500',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: '700', default: '500' }),
    fontSize: 12,
  },
});
