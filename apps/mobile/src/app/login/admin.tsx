import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { MudKitchenLogo } from '@/components/mudkitchen-logo';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import {
  completePlatformAdminSignIn,
  useAuth,
} from '@/contexts/auth-context';
import { PortalAccessError } from '@/lib/auth/resolve-portal';
import { getSupabaseClient } from '@/lib/supabase';
import { Brand, Fonts, Radius, Spacing } from '@/constants/theme';

export default function AdminLoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const supabase = getSupabaseClient();
  const { setResolvedPortal } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Sign in failed. Please try again.');
      }

      const portal = await completePlatformAdminSignIn(user.id);
      await setResolvedPortal(portal);
      router.replace('/portal');
    } catch (submitError) {
      await supabase.auth.signOut();
      setError(
        submitError instanceof PortalAccessError || submitError instanceof Error
          ? submitError.message
          : 'Sign in failed. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, Spacing.three) },
          ]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
            <ThemedText type="link" style={styles.backLabel}>
              ← Back
            </ThemedText>
          </Pressable>

          <MudKitchenLogo size="md" style={styles.logo} />

          <ThemedText type="title" style={styles.heading}>
            Admin sign in
          </ThemedText>
          <ThemedText type="small" color={Brand.textMuted} style={styles.subtext}>
            Internal tools for the MudKitchen team.
          </ThemedText>

          {error ? (
            <View style={styles.errorBox}>
              <ThemedText type="small" style={styles.errorText}>
                {error}
              </ThemedText>
            </View>
          ) : null}

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
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.field}>
            <ThemedText type="label">Password</ThemedText>
            <TextInput
              accessibilityLabel="Password"
              autoCapitalize="none"
              autoComplete="current-password"
              secureTextEntry
              placeholder="Your password"
              placeholderTextColor={Brand.textMuted}
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              editable={!isSubmitting}
            />
          </View>

          <PrimaryButton
            label={isSubmitting ? 'Signing in…' : 'Sign in'}
            variant="accent"
            disabled={!email.trim() || !password || isSubmitting}
            onPress={handleSubmit}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.bg,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  errorBox: {
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.surface,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: Spacing.three,
  },
  errorText: {
    color: '#b42318',
    lineHeight: 20,
  },
  field: {
    gap: 6,
    marginBottom: Spacing.three,
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
    marginTop: Spacing.two,
    shadowColor: Brand.accent,
  },
});
