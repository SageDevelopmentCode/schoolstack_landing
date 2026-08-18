import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MudKitchenLogo } from '@/components/mudkitchen-logo';
import { OrganizationLogo } from '@/components/organization-logo';
import { OrganizationSelector } from '@/components/organization-selector';
import { OrganizationSelectorSkeleton } from '@/components/organization-selector-skeleton';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { VerificationCodeInput } from '@/components/verification-code-input';
import {
  completeSchoolSignIn,
  useAuth,
} from '@/contexts/auth-context';
import { PortalAccessError } from '@/lib/auth/resolve-portal';
import { listLiveOrganizations, type LiveOrganization } from '@/lib/organizations';
import { getSupabaseClient } from '@/lib/supabase';
import { Brand, Fonts, Radius, Spacing } from '@/constants/theme';

const RESEND_COOLDOWN_SECONDS = 30;

type LoginPhase = 'select_org' | 'email' | 'verify' | 'password';

export function SchoolLoginExperience() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const supabase = getSupabaseClient();
  const { user, portalType, setResolvedPortal, isLoading: authLoading } = useAuth();

  const [phase, setPhase] = useState<LoginPhase>('select_org');
  const [organizations, setOrganizations] = useState<LiveOrganization[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [selectedOrganization, setSelectedOrganization] = useState<LiveOrganization | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const normalizedCode = code.replace(/\D/g, '').slice(0, 6);

  useEffect(() => {
    let cancelled = false;

    async function loadOrganizations() {
      try {
        const orgs = await listLiveOrganizations();
        if (!cancelled) {
          setOrganizations(orgs);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load schools right now.',
          );
        }
      } finally {
        if (!cancelled) {
          setOrgsLoading(false);
        }
      }
    }

    void loadOrganizations();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!authLoading && user && portalType) {
      router.replace('/portal');
    }
  }, [authLoading, user, portalType, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const goToPhase = useCallback((nextPhase: LoginPhase) => {
    setPhase(nextPhase);
    setError(null);
  }, []);

  const finishSignIn = useCallback(
    async (organization: LiveOrganization, signedInUserId?: string) => {
      const userId = signedInUserId ?? user?.id;
      if (!userId) {
        throw new Error('You must be signed in to continue.');
      }

      const portal = await completeSchoolSignIn(userId, organization);
      await setResolvedPortal(portal);
      router.replace('/portal');
    },
    [router, setResolvedPortal, user],
  );

  const handleOrganizationSelect = useCallback(
    async (organization: LiveOrganization) => {
      setSelectedOrganization(organization);
      setError(null);
      setIsSubmitting(true);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          await finishSignIn(organization, session.user.id);
          return;
        }

        goToPhase('email');
      } catch (selectError) {
        if (selectError instanceof PortalAccessError) {
          await supabase.auth.signOut();
        }
        setError(
          selectError instanceof Error
            ? selectError.message
            : 'Unable to continue with this school.',
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [finishSignIn, goToPhase, supabase.auth],
  );

  const sendOtp = useCallback(async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        shouldCreateUser: false,
      },
    });

    if (otpError) {
      throw new Error(otpError.message);
    }

    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  }, [email, supabase.auth]);

  const handleEmailSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await sendOtp();
      goToPhase('verify');
      setCode('');
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Failed to send verification code.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifySubmit = async () => {
    if (!selectedOrganization) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: normalizedCode,
        type: 'email',
      });

      if (verifyError) {
        throw new Error(verifyError.message);
      }

      const {
        data: { user: signedInUser },
      } = await supabase.auth.getUser();

      if (!signedInUser) {
        throw new Error('Sign in failed. Please try again.');
      }

      const portal = await completeSchoolSignIn(signedInUser.id, selectedOrganization);
      await setResolvedPortal(portal);
      router.replace('/portal');
    } catch (submitError) {
      if (submitError instanceof PortalAccessError) {
        await supabase.auth.signOut();
      }
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Verification failed. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!selectedOrganization) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      const {
        data: { user: signedInUser },
      } = await supabase.auth.getUser();

      if (!signedInUser) {
        throw new Error('Sign in failed. Please try again.');
      }

      const portal = await completeSchoolSignIn(signedInUser.id, selectedOrganization);
      await setResolvedPortal(portal);
      router.replace('/portal');
    } catch (submitError) {
      if (submitError instanceof PortalAccessError) {
        await supabase.auth.signOut();
      }
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Sign in failed. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await sendOtp();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Failed to resend verification code.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToOrganizations = () => {
    setSelectedOrganization(null);
    setEmail('');
    setPassword('');
    setCode('');
    goToPhase('select_org');
  };

  const handleBackToEmail = () => {
    setCode('');
    goToPhase('email');
  };

  const heading =
    phase === 'select_org'
      ? 'Sign in to your school'
      : phase === 'email' || phase === 'password'
        ? 'Sign in to continue'
        : 'Check your email';

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: Math.max(insets.bottom, Spacing.three) },
      ]}
      style={styles.wrapper}>
      <View style={styles.card}>
        {phase !== 'select_org' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            disabled={isSubmitting}
            onPress={
              phase === 'email' || phase === 'password'
                ? handleBackToOrganizations
                : handleBackToEmail
            }
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
            <ThemedText type="link" style={styles.backLabel}>
              ← Back
            </ThemedText>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
            <ThemedText type="link" style={styles.backLabel}>
              ← Back
            </ThemedText>
          </Pressable>
        )}

        {selectedOrganization?.branding.logoSrc ? (
          <OrganizationLogo
            variant="header"
            logoSrc={selectedOrganization.branding.logoSrc}
            logoAlt={selectedOrganization.branding.logoAlt}
            name={selectedOrganization.name}
            style={styles.schoolLogo}
          />
        ) : phase === 'select_org' ? (
          <MudKitchenLogo size="md" style={styles.logo} />
        ) : null}

        <ThemedText type="title" style={styles.heading}>
          {heading}
        </ThemedText>

        <ThemedText type="small" color={Brand.textMuted} style={styles.subtext}>
          {phase === 'select_org'
            ? 'Choose your school to continue to your portal.'
            : phase === 'email'
              ? `Enter the email you use with ${selectedOrganization?.name}. We'll send you a one-time code.`
              : phase === 'password'
                ? 'Sign in with your email and password.'
                : `We sent a 6-digit code to ${email.trim().toLowerCase()}. If it doesn't arrive within a minute, check your spam or junk folder.`}
        </ThemedText>

        {error ? (
          <View style={styles.errorBox}>
            <ThemedText type="small" style={styles.errorText}>
              {error}
            </ThemedText>
          </View>
        ) : null}

        {phase === 'select_org' && orgsLoading ? (
          <OrganizationSelectorSkeleton rowCount={3} />
        ) : phase === 'select_org' ? (
          <OrganizationSelector
            organizations={organizations}
            onSelect={handleOrganizationSelect}
            disabled={isSubmitting}
          />
        ) : null}

        {phase === 'email' ? (
          <View style={styles.formSection}>
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

            <PrimaryButton
              label={isSubmitting ? 'Sending code…' : 'Send verification code'}
              variant="accent"
              disabled={!email.trim() || isSubmitting}
              onPress={handleEmailSubmit}
              style={styles.submitButton}
            />

            <Pressable
              accessibilityRole="button"
              onPress={() => goToPhase('password')}
              disabled={isSubmitting}
              style={styles.passwordLink}>
              <ThemedText type="linkPrimary" style={styles.passwordLinkText}>
                Use password instead
              </ThemedText>
            </Pressable>
          </View>
        ) : null}

        {phase === 'password' ? (
          <View style={styles.formSection}>
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
              onPress={handlePasswordSubmit}
              style={styles.submitButton}
            />

            <Pressable
              accessibilityRole="button"
              onPress={() => goToPhase('email')}
              disabled={isSubmitting}
              style={styles.passwordLink}>
              <ThemedText type="linkPrimary" style={styles.passwordLinkText}>
                Use email code instead
              </ThemedText>
            </Pressable>
          </View>
        ) : null}

        {phase === 'verify' ? (
          <View style={styles.formSection}>
            <VerificationCodeInput
              value={code}
              onChange={setCode}
              disabled={isSubmitting}
            />

            <PrimaryButton
              label={isSubmitting ? 'Verifying…' : 'Continue'}
              variant="accent"
              disabled={normalizedCode.length < 6 || isSubmitting}
              onPress={handleVerifySubmit}
              style={styles.submitButton}
            />

            <View style={styles.verifyActions}>
              <Pressable accessibilityRole="button" onPress={handleBackToEmail}>
                <ThemedText type="link" style={styles.verifyActionText}>
                  Use a different email
                </ThemedText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={handleResendCode}
                disabled={resendCooldown > 0 || isSubmitting}>
                <ThemedText
                  type="linkPrimary"
                  style={[
                    styles.verifyActionText,
                    (resendCooldown > 0 || isSubmitting) && styles.disabledLink,
                  ]}>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        ) : null}

        {phase === 'select_org' && !orgsLoading ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/login/admin')}
            style={styles.adminLink}>
            <ThemedText type="linkPrimary" style={styles.adminLinkText}>
              Admin sign in
            </ThemedText>
          </Pressable>
        ) : null}
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
  },
  logo: {
    marginBottom: Spacing.five,
  },
  schoolLogo: {
    width: 160,
    height: 40,
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
  formSection: {
    gap: Spacing.three,
  },
  field: {
    gap: 6,
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
    paddingVertical: Spacing.two,
  },
  passwordLinkText: {
    fontSize: 14,
  },
  verifyActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  verifyActionText: {
    fontSize: 14,
  },
  disabledLink: {
    opacity: 0.6,
  },
  adminLink: {
    alignItems: 'center',
    marginTop: Spacing.five,
    paddingVertical: Spacing.two,
  },
  adminLinkText: {
    fontSize: 14,
  },
});
