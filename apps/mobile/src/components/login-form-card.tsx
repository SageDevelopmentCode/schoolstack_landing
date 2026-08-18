import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MudKitchenLogo } from '@/components/mudkitchen-logo';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Brand, Fonts, Radius, Spacing } from '@/constants/theme';

export function LoginFormCard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: Math.max(insets.bottom, Spacing.three) },
      ]}
      style={styles.wrapper}>
      <View style={styles.card}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
          <ThemedText type="linkPrimary" style={styles.backLabel}>
            ← Back
          </ThemedText>
        </Pressable>

        <MudKitchenLogo size="md" style={styles.logo} />

        <ThemedText type="title" style={styles.heading}>
          Sign in to continue
        </ThemedText>
        <ThemedText type="small" color={Brand.textMuted} style={styles.subtext}>
          Enter the email you use with your school. We&apos;ll send you a one-time code.
        </ThemedText>

        <View style={styles.field}>
          <ThemedText type="label">Email</ThemedText>
          <TextInput
            accessibilityLabel="Email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor={Brand.textMuted}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <PrimaryButton
          label="Continue"
          variant="accent"
          disabled={!email.trim()}
          style={styles.submitButton}
        />

        <Pressable accessibilityRole="button" style={styles.passwordLink}>
          <ThemedText type="linkPrimary" style={styles.passwordLinkText}>
            Use password instead
          </ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Brand.bg,
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
    fontSize: 14,
    color: Brand.textMuted,
  },
  logo: {
    marginBottom: Spacing.five,
  },
  heading: {
    marginBottom: Spacing.two,
  },
  subtext: {
    marginBottom: Spacing.four,
    lineHeight: 20,
  },
  field: {
    gap: 6,
    marginBottom: Spacing.four,
  },
  input: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Brand.text,
    backgroundColor: Brand.input,
    borderWidth: 1,
    borderColor: Brand.inputBorder,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  submitButton: {
    width: '100%',
    shadowColor: Brand.accent,
  },
  passwordLink: {
    alignItems: 'center',
    marginTop: Spacing.three,
    paddingVertical: Spacing.two,
  },
  passwordLinkText: {
    fontSize: 14,
  },
});
