import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MudKitchenLogo } from '@/components/mudkitchen-logo';
import { OrganizationLogo } from '@/components/organization-logo';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { Story, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
type PreAuthScreenShellProps = {
  kicker?: string;
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

export function PreAuthScreenShell({
  kicker,
  heading,
  subtext,
  error,
  onBack,
  backLabel = '← Back',
  backDisabled = false,
  schoolLogo,
  showMudKitchenLogo = false,
  headingTestID,
  children,
  footer,
  contentStyle,
}: PreAuthScreenShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: Math.max(insets.bottom, Spacing.three) },
      ]}
      style={styles.wrapper}>
      <View style={[styles.card, contentStyle]}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            disabled={backDisabled}
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
            <Text style={styles.backLabel}>{backLabel}</Text>
          </Pressable>
        ) : null}

        {schoolLogo ? (
          <OrganizationLogo
            variant="header"
            logoSrc={schoolLogo.logoSrc}
            logoAlt={schoolLogo.logoAlt}
            name={schoolLogo.name}
            style={styles.schoolLogo}
          />
        ) : showMudKitchenLogo ? (
          <MudKitchenLogo size="md" style={styles.logo} />
        ) : null}

        {kicker ? <StorySectionKicker>{kicker}</StorySectionKicker> : null}

        <StoryDisplayHeading testID={headingTestID} accessibilityLabel={heading}>
          {heading}
        </StoryDisplayHeading>

        <Text style={styles.subtext}>{subtext}</Text>

        {error ? <StoryErrorBanner message={error} style={styles.error} /> : null}

        <View style={styles.content}>{children}</View>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  scrollContent: {
    flexGrow: 1,
  },
  card: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.three,
    paddingVertical: 4,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: Story.muted,
  },
  logo: {
    marginBottom: Spacing.five,
  },
  schoolLogo: {
    width: 160,
    height: 40,
    marginBottom: Spacing.five,
  },
  subtext: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: Story.muted,
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  error: {
    marginBottom: Spacing.three,
  },
  content: {
    gap: Spacing.three,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.five,
  },
});
