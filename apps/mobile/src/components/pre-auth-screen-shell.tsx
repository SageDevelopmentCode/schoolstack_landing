import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MudKitchenLogo } from '@/components/mudkitchen-logo';
import { OrganizationLogo } from '@/components/organization-logo';
import { GInlineBanner } from '@/components/parent/garden/fields';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GPressable } from '@/components/parent/garden/ui';
import { MudKitchenGardenThemeProvider } from '@/components/pre-auth/mudkitchen-garden-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Brand } from '@/constants/theme';
import { isMobileE2e } from '@/lib/e2e';
import { calmEnter } from '@/lib/motion/portal-motion';

type PreAuthScreenShellProps = {
  heading: string;
  subtext: string;
  error?: string | null;
  onBack?: () => void;
  backLabel?: string;
  backDisabled?: boolean;
  schoolLogo?: {
    logoSrc: string;
    logoAlt: string;
    name: string;
  };
  showMudKitchenLogo?: boolean;
  headingTestID?: string;
  children: ReactNode;
  footer?: ReactNode;
  contentStyle?: ViewStyle;
};

/**
 * Calm Garden frame for MudKitchen-owned sign-in screens: cream page, Bricolage
 * title, the form on one paper card, quiet secondary routes underneath.
 */
export function PreAuthScreenShell({
  heading,
  subtext,
  error,
  onBack,
  backLabel = 'Back',
  backDisabled = false,
  schoolLogo,
  showMudKitchenLogo = false,
  headingTestID,
  children,
  footer,
  contentStyle,
}: PreAuthScreenShellProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const cardEntering =
    reduceMotion || isMobileE2e ? undefined : calmEnter();

  return (
    <MudKitchenGardenThemeProvider>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}
        style={styles.wrapper}>
        <View style={[styles.body, contentStyle]}>
          {onBack || showMudKitchenLogo ? (
            <View style={styles.headerRow}>
              {onBack ? (
                <GPressable
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                  accessibilityState={{ disabled: backDisabled }}
                  disabled={backDisabled}
                  haptic="select"
                  hitSlop={10}
                  onPress={onBack}
                  style={[styles.backButton, backDisabled && styles.backDisabled]}>
                  <Ionicons name="arrow-back" size={18} color={Garden.ink} />
                  <Text style={styles.backLabel}>{backLabel.replace(/^←\s*/, '')}</Text>
                </GPressable>
              ) : (
                <View />
              )}
              {showMudKitchenLogo && !schoolLogo ? <MudKitchenLogo size="sm" style={styles.headerLogo} /> : null}
            </View>
          ) : null}

          {schoolLogo ? (
            <OrganizationLogo
              variant="header"
              logoSrc={schoolLogo.logoSrc}
              logoAlt={schoolLogo.logoAlt}
              name={schoolLogo.name}
              style={styles.schoolLogo}
            />
          ) : null}

          <Text
            testID={headingTestID}
            accessibilityRole="header"
            accessibilityLabel={heading}
            style={styles.heading}>
            {heading}
          </Text>

          <Text style={styles.subtext}>{subtext}</Text>

          {error ? (
            <View style={styles.error}>
              <GInlineBanner tone="error" title={error} />
            </View>
          ) : null}

          <Animated.View entering={cardEntering} style={styles.card}>
            {children}
          </Animated.View>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </ScrollView>
    </MudKitchenGardenThemeProvider>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Garden.cream,
  },
  scrollContent: {
    flexGrow: 1,
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    marginBottom: 28,
  },
  backButton: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 12,
    paddingRight: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Garden.ink15,
    backgroundColor: Garden.paper,
  },
  headerLogo: {
    alignSelf: 'center',
  },
  backDisabled: {
    opacity: 0.5,
  },
  backLabel: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    color: Garden.ink,
  },
  schoolLogo: {
    width: 160,
    height: 40,
    marginBottom: 24,
  },
  heading: {
    fontFamily: GardenFonts.display,
    fontSize: 32,
    lineHeight: 35,
    letterSpacing: -1,
    color: Garden.ink,
  },
  subtext: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 15,
    lineHeight: 22,
    color: Garden.soft,
    marginTop: 10,
    marginBottom: 22,
  },
  error: {
    marginBottom: 16,
  },
  card: {
    gap: 16,
    padding: 18,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Garden.ink10,
    backgroundColor: Garden.paper,
    shadowColor: Brand.text,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 22,
    elevation: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 28,
  },
});
