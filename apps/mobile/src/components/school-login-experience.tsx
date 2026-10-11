import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { OrganizationSelector } from '@/components/organization-selector';
import { OrganizationSelectorSkeleton } from '@/components/organization-selector-skeleton';
import { PreAuthLinkRow } from '@/components/pre-auth-link-row';
import { PreAuthScreenShell } from '@/components/pre-auth-screen-shell';
import { StoryButton } from '@/components/story/story-button';
import { StoryTextField } from '@/components/story/story-text-field';
import { StoryTextLink } from '@/components/story/story-text-link';
import { VerificationCodeInput } from '@/components/verification-code-input';
import {
  completeSchoolSignIn,
  useAuth,
} from '@/contexts/auth-context';
import { resolveMobileSchoolAfterAuth } from '@/lib/auth/list-accessible-organizations';
import { PortalAccessError } from '@/lib/auth/resolve-portal';
import {
  fetchLiveOrganizationsBySlugs,
  type LiveOrganization,
} from '@/lib/organizations';
import { markExplicitMobileSignOut } from '@/lib/auth/mobile-explicit-sign-out';
import { logMobileAuthSignedIn } from '@/lib/mobile-activity';
import { getSupabaseClient } from '@/lib/supabase';
import { Spacing } from '@/constants/theme';

const RESEND_COOLDOWN_SECONDS = 30;

const NO_SCHOOL_ACCESS_MESSAGE =
  'You do not have access to any schools for this account. Try signing in with a different account.';

type LoginPhase = 'select_org' | 'email' | 'verify' | 'password';

export function SchoolLoginExperience() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { user, portalType, setResolvedPortal, signOut, isLoading: authLoading } = useAuth();

  const [phase, setPhase] = useState<LoginPhase>('email');
  const [organizations, setOrganizations] = useState<LiveOrganization[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [accessibleSlugs, setAccessibleSlugs] = useState<string[] | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<LiveOrganization | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const sessionResumeAttemptedRef = useRef(false);

  const normalizedCode = code.replace(/\D/g, '').slice(0, 6);

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
      void logMobileAuthSignedIn(portal);
      router.replace('/portal');
    },
    [router, setResolvedPortal, user],
  );

  const loadOrganizationsForSlugs = useCallback(async (slugs: string[]) => {
    setOrgsLoading(true);
    try {
      const orgs = await fetchLiveOrganizationsBySlugs(slugs);
      setOrganizations(orgs);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load schools right now.',
      );
    } finally {
      setOrgsLoading(false);
    }
  }, []);

  const continueAfterAuthentication = useCallback(
    async (signedInUserId: string, authMethod?: 'otp' | 'password') => {
      const result = await resolveMobileSchoolAfterAuth(supabase, signedInUserId);

      if (result.kind === 'none') {
        markExplicitMobileSignOut();
        await supabase.auth.signOut();
        setError(NO_SCHOOL_ACCESS_MESSAGE);
        goToPhase('email');
        return;
      }

      if (result.kind === 'single') {
        const orgs = await fetchLiveOrganizationsBySlugs([result.slug]);
        const organization = orgs[0];
        if (!organization) {
          throw new Error('School not found. Please try again.');
        }
        setSelectedOrganization(organization);
        const portal = await completeSchoolSignIn(signedInUserId, organization);
        await setResolvedPortal(portal);
        void logMobileAuthSignedIn(portal, authMethod ? { method: authMethod } : undefined);
        router.replace('/portal');
        return;
      }

      setAccessibleSlugs(result.slugs);
      await loadOrganizationsForSlugs(result.slugs);
      goToPhase('select_org');
    },
    [goToPhase, loadOrganizationsForSlugs, router, setResolvedPortal, supabase],
  );

  useEffect(() => {
    if (authLoading || !user || portalType || sessionResumeAttemptedRef.current) {
      return;
    }

    sessionResumeAttemptedRef.current = true;
    setIsSubmitting(true);

    void continueAfterAuthentication(user.id)
      .catch((resumeError) => {
        setError(
          resumeError instanceof Error
            ? resumeError.message
            : 'Unable to continue with your existing session.',
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [authLoading, continueAfterAuthentication, portalType, user]);

  const handleOrganizationSelect = useCallback(
    async (organization: LiveOrganization) => {
      setSelectedOrganization(organization);
      setError(null);
      setIsSubmitting(true);

      try {
        await finishSignIn(organization);
      } catch (selectError) {
        if (selectError instanceof PortalAccessError) {
          markExplicitMobileSignOut();
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
    [finishSignIn, supabase.auth],
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

      await continueAfterAuthentication(signedInUser.id, 'otp');
    } catch (submitError) {
      if (submitError instanceof PortalAccessError) {
        markExplicitMobileSignOut();
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

      await continueAfterAuthentication(signedInUser.id, 'password');
    } catch (submitError) {
      if (submitError instanceof PortalAccessError) {
        markExplicitMobileSignOut();
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

  const handleBackFromSchoolPicker = async () => {
    setSelectedOrganization(null);
    setAccessibleSlugs(null);
    setOrganizations([]);
    setEmail('');
    setPassword('');
    setCode('');
    await signOut();
    goToPhase('email');
  };

  const handleBackToEmail = () => {
    setCode('');
    goToPhase('email');
  };

  const isPostAuthSchoolPicker = phase === 'select_org' && accessibleSlugs !== null;

  const heading =
    phase === 'select_org'
      ? 'Choose your school'
      : phase === 'email' || phase === 'password'
        ? 'Sign in to your school'
        : 'Check your email';

  const subtext =
    phase === 'select_org'
      ? 'Choose which school to open.'
      : phase === 'email'
        ? "Enter the email you use with your school. We'll send you a one-time code."
        : phase === 'password'
          ? 'Sign in with your email and password.'
          : `We sent a 6-digit code to ${email.trim().toLowerCase()}. If it doesn't arrive within a minute, check your spam or junk folder.`;

  const handleBack =
    phase === 'email' || phase === 'password'
      ? () => router.back()
      : phase === 'select_org'
        ? handleBackFromSchoolPicker
        : handleBackToEmail;

  const showMudKitchenLogo =
    phase === 'email' || phase === 'password' || (phase === 'select_org' && !selectedOrganization);

  const loginFooter =
    phase === 'email'
      ? (
          <PreAuthLinkRow
            items={[
              {
                label: 'Use password',
                icon: 'key-outline',
                accessibilityLabel: 'Use password instead',
                onPress: () => goToPhase('password'),
                disabled: isSubmitting,
              },
              {
                label: 'Admin login',
                icon: 'shield-outline',
                accessibilityLabel: 'Admin sign in',
                onPress: () => router.push('/login/admin'),
                disabled: isSubmitting,
              },
            ]}
          />
        )
      : phase === 'password'
        ? (
            <PreAuthLinkRow
              items={[
                {
                  label: 'Use email code instead',
                  onPress: () => goToPhase('email'),
                  disabled: isSubmitting,
                },
              ]}
            />
          )
        : undefined;

  return (
    <PreAuthScreenShell
      heading={heading}
      headingTestID="school-login-heading"
      subtext={subtext}
      error={error}
      onBack={handleBack}
      backDisabled={isSubmitting}
      showMudKitchenLogo={showMudKitchenLogo}
      schoolLogo={
        selectedOrganization?.branding.logoSrc
          ? {
              logoSrc: selectedOrganization.branding.logoSrc,
              logoAlt: selectedOrganization.branding.logoAlt,
              name: selectedOrganization.name,
            }
          : undefined
      }
      footer={loginFooter}>
      {phase === 'select_org' && orgsLoading ? (
        <OrganizationSelectorSkeleton rowCount={3} />
      ) : phase === 'select_org' ? (
        <OrganizationSelector
          organizations={organizations}
          accessibleSlugs={isPostAuthSchoolPicker ? accessibleSlugs : null}
          onSelect={handleOrganizationSelect}
          disabled={isSubmitting}
        />
      ) : null}

      {phase === 'email' ? (
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

          <StoryButton
            label={isSubmitting ? 'Sending code…' : 'Send verification code'}
            disabled={!email.trim() || isSubmitting}
            onPress={handleEmailSubmit}
          />
        </View>
      ) : null}

      {phase === 'password' ? (
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
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            editable={!isSubmitting}
          />

          <StoryButton
            label={isSubmitting ? 'Signing in…' : 'Sign in'}
            disabled={!email.trim() || !password || isSubmitting}
            onPress={handlePasswordSubmit}
          />
        </View>
      ) : null}

      {phase === 'verify' ? (
        <View style={styles.formSection}>
          <VerificationCodeInput
            value={code}
            onChange={setCode}
            disabled={isSubmitting}
          />

          <StoryButton
            label={isSubmitting ? 'Verifying…' : 'Continue'}
            disabled={normalizedCode.length < 6 || isSubmitting}
            onPress={handleVerifySubmit}
          />

          <View style={styles.verifyActions}>
            <StoryTextLink
              label="Use a different email"
              variant="muted"
              onPress={handleBackToEmail}
            />
            <StoryTextLink
              label={resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              onPress={handleResendCode}
              disabled={resendCooldown > 0 || isSubmitting}
            />
          </View>
        </View>
      ) : null}
    </PreAuthScreenShell>
  );
}

const styles = StyleSheet.create({
  formSection: {
    gap: Spacing.three,
  },
  verifyActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
