import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { PreAuthScreenShell } from '@/components/pre-auth-screen-shell';
import { StoryButton } from '@/components/story/story-button';
import { StoryTextField } from '@/components/story/story-text-field';
import {
  completePlatformAdminSignIn,
  useAuth,
} from '@/contexts/auth-context';
import { markExplicitMobileSignOut } from '@/lib/auth/mobile-explicit-sign-out';
import { PortalAccessError } from '@/lib/auth/resolve-portal';
import { getSupabaseClient } from '@/lib/supabase';
import { Story } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

export default function AdminLoginScreen() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { setResolvedPortal } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/login');
    }
  };

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
      router.replace('/platform-admin/organizations');
    } catch (submitError) {
      markExplicitMobileSignOut();
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
        <PreAuthScreenShell
          kicker="Internal"
          heading="Admin sign in"
          subtext="Internal tools for the MudKitchen team."
          error={error}
          onBack={handleBack}
          showMudKitchenLogo>
          <View style={styles.formSection}>
            <StoryTextField
              label="Email"
              accessibilityLabel="Email"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              editable={!isSubmitting}
            />

            <StoryTextField
              label="Password"
              accessibilityLabel="Password"
              autoCapitalize="none"
              autoComplete="current-password"
              secureTextEntry
              placeholder="Your password"
              value={password}
              onChangeText={setPassword}
              editable={!isSubmitting}
            />

            <StoryButton
              label={isSubmitting ? 'Signing in…' : 'Sign in'}
              disabled={!email.trim() || !password || isSubmitting}
              onPress={handleSubmit}
            />
          </View>
        </PreAuthScreenShell>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  keyboardView: {
    flex: 1,
  },
  formSection: {
    gap: Spacing.three,
  },
});
