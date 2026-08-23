import { Ionicons } from '@expo/vector-icons';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import { schoolApplyUrl } from '@/lib/admissions/school-apply-url';
import { adminCardShadow } from '@/lib/organization-settings/build-admin-theme';

type ParentPlaceholderScreenProps = {
  slug: string;
  schoolName: string;
  title: string;
  description?: string;
  showApplicationsCta?: boolean;
};

export function ParentPlaceholderScreen({
  slug,
  schoolName,
  title,
  description,
  showApplicationsCta = false,
}: ParentPlaceholderScreenProps) {
  const theme = useAdminTheme();

  const handleOpenApplications = async () => {
    await openBrowserAsync(schoolApplyUrl(slug), {
      presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            ...adminCardShadow(theme),
          },
        ]}>
        <View style={[styles.iconCircle, { backgroundColor: theme.accentLight }]}>
          <Ionicons name="construct-outline" size={28} color={theme.accent} />
        </View>
        <ThemedText type="title" style={[styles.title, { color: theme.textPrimary }]}>
          {title}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
          {description ??
            `${title} is coming soon in the ${schoolName} mobile app. Check back for updates.`}
        </ThemedText>
        {showApplicationsCta ? (
          <PrimaryButton
            label="Open application dashboard"
            onPress={() => void handleOpenApplications()}
            style={styles.cta}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
    alignItems: 'center',
    gap: Spacing.three,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  cta: {
    marginTop: Spacing.two,
    width: '100%',
  },
});
