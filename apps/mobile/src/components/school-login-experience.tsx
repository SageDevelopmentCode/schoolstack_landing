import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { OrganizationSelector } from '@/components/organization-selector';
import { OrganizationSelectorSkeleton } from '@/components/organization-selector-skeleton';
import { PreAuthScreenShell } from '@/components/pre-auth-screen-shell';
import { StoryButton } from '@/components/story/story-button';
import { StoryTextField } from '@/components/story/story-text-field';
import { StoryTextLink } from '@/components/story/story-text-link';
import { VerificationCodeInput } from '@/components/verification-code-input';
import {
  completeSchoolSignIn,
  useAuth,
} from '@/contexts/auth-context';
import { PortalAccessError } from '@/lib/auth/resolve-portal';
import { listLiveOrganizations, type LiveOrganization } from '@/lib/organizations';
import { getSupabaseClient } from '@/lib/supabase';
import { Spacing } from '@/constants/theme';

const RESEND_COOLDOWN_SECONDS = 30;

type LoginPhase = 'select_org' | 'email' | 'verify' | 'password';

export function SchoolLoginExperience() {
  const router = useRouter();
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

  const subtext =
    phase === 'select_org'
      ? 'Choose your school to continue to your portal.'
      : phase === 'email'
        ? `Enter the email you use with ${selectedOrganization?.name}. We'll send you a one-time code.`
        : phase === 'password'
          ? 'Sign in with your email and password.'
          : `We sent a 6-digit code to ${email.trim().toLowerCase()}. If it doesn't arrive within a minute, check your spam or junk folder.`;

  const handleBack =
    phase === 'select_org'
      ? () => router.back()
      : phase === 'email' || phase === 'password'
        ? handleBackToOrganizations
        : handleBackToEmail;

  return (
    <PreAuthScreenShell
      kicker={phase === 'select_org' ? 'Sign in' : undefined}
      heading={heading}
      headingTestID="school-login-heading"
      subtext={subtext}
      error={error}
      onBack={handleBack}
      backDisabled={isSubmitting}
      showMudKitchenLogo={phase === 'select_org'}
      schoolLogo={
        selectedOrganization?.branding.logoSrc
          ? {
              logoSrc: selectedOrganization.branding.logoSrc,
              logoAlt: selectedOrganization.branding.logoAlt,
              name: selectedOrganization.name,
            }
          : undefined
      }
      footer={
        phase === 'select_org' && !orgsLoading
          ? (
              <StoryTextLink
                label="Admin sign in"
                onPress={() => router.push('/login/admin')}
              />
            )
          : undefined
      }>
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

          <StoryTextLink
            label="Use password instead"
            onPress={() => goToPhase('password')}
            disabled={isSubmitting}
            style={styles.centeredLink}
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
            onPress={handlePasswordSubmit}
          />

          <StoryTextLink
            label="Use email code instead"
            onPress={() => goToPhase('email')}
            disabled={isSubmitting}
            style={styles.centeredLink}
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
  centeredLink: {
    alignSelf: 'center',
  },
  verifyActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
