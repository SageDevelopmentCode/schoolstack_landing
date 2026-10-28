import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryFonts } from '@/constants/story-theme';
import { Brand, Spacing } from '@/constants/theme';
import { reportMobileGlobalOperationalError } from '@/lib/mobile-global-error-reporting';

type MobileOperationalErrorBoundaryProps = {
  children: ReactNode;
  pathname?: string;
  onGoBack?: () => void;
};

type MobileOperationalErrorBoundaryState = {
  hasError: boolean;
};

export class MobileOperationalErrorBoundary extends Component<
  MobileOperationalErrorBoundaryProps,
  MobileOperationalErrorBoundaryState
> {
  state: MobileOperationalErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): MobileOperationalErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const pathname = this.props.pathname?.trim();
    reportMobileGlobalOperationalError('react_render_error', error, {
      details: info.componentStack?.trim().slice(0, 2000),
      metadata: pathname ? { pathname } : undefined,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.fallback}>
          <Text style={styles.fallbackTitle}>Something went wrong</Text>
          <Text style={styles.fallbackCopy}>
            This screen could not be displayed. You can go back and try again.
          </Text>
          {this.props.onGoBack ? (
            <Pressable
              accessibilityRole="button"
              onPress={this.props.onGoBack}
              style={({ pressed }) => [styles.goBackButton, pressed && styles.goBackButtonPressed]}>
              <Text style={styles.goBackLabel}>Go back</Text>
            </Pressable>
          ) : null}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    backgroundColor: Brand.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
    gap: Spacing.three,
  },
  fallbackTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 17,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },
  fallbackCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: '#64748B',
    textAlign: 'center',
  },
  goBackButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  goBackButtonPressed: {
    opacity: 0.85,
  },
  goBackLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
});
