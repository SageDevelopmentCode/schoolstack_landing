import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { OrganizationSelector } from '@/components/organization-selector';
import { OrganizationSelectorSkeleton } from '@/components/organization-selector-skeleton';
import { PreAuthScreenShell } from '@/components/pre-auth-screen-shell';
import {
  completeSchoolSignIn,
  useAuth,
} from '@/contexts/auth-context';
import { PortalAccessError } from '@/lib/auth/resolve-portal';
import { resolveMobileSchoolAfterAuth } from '@/lib/auth/list-accessible-organizations';
import { markExplicitMobileSignOut } from '@/lib/auth/mobile-explicit-sign-out';
import { logMobileAuthSignedIn } from '@/lib/mobile-activity';
import {
  fetchLiveOrganizationsBySlugs,
  type LiveOrganization,
} from '@/lib/organizations';
import { getSupabaseClient } from '@/lib/supabase';

const NO_ACCESS_MESSAGE =
  'You do not have access to any schools for this account. Try signing in with a different account.';

type ChooseSchoolExperienceProps = {
  /** When true, back navigates to the previous screen instead of signing out. */
  switchingSchool?: boolean;
  onBack?: () => void;
};

export function ChooseSchoolExperience({
  switchingSchool = false,
  onBack,
}: ChooseSchoolExperienceProps) {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { user, setResolvedPortal, signOut, isLoading: authLoading } = useAuth();

  const [organizations, setOrganizations] = useState<LiveOrganization[]>([]);
  const [accessibleSlugs, setAccessibleSlugs] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const finishSignIn = useCallback(
    async (organization: LiveOrganization) => {
      if (!user?.id) {
        throw new Error('You must be signed in to continue.');
      }

      const portal = await completeSchoolSignIn(user.id, organization);
      await setResolvedPortal(portal);
      void logMobileAuthSignedIn(portal);
      router.replace('/portal');
    },
    [router, setResolvedPortal, user?.id],
  );

  const loadSchools = useCallback(async () => {
    if (!user?.id) {
      setError('You must be signed in to continue.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await resolveMobileSchoolAfterAuth(supabase, user.id);

      if (result.kind === 'none') {
        setAccessibleSlugs([]);
        setOrganizations([]);
        setError(NO_ACCESS_MESSAGE);
        return;
      }

      if (result.kind === 'single') {
        const orgs = await fetchLiveOrganizationsBySlugs([result.slug]);
        const organization = orgs[0];
        if (!organization) {
          setError('School not found. Please try again.');
          return;
        }
        await finishSignIn(organization);
        return;
      }

      setAccessibleSlugs(result.slugs);
      const orgs = await fetchLiveOrganizationsBySlugs(result.slugs);
      setOrganizations(orgs);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load your schools right now.',
      );
    } finally {
      setLoading(false);
    }
  }, [finishSignIn, supabase, user?.id]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
      return;
    }
    if (!user) return;
    void loadSchools();
  }, [authLoading, loadSchools, router, user]);

  const handleOrganizationSelect = useCallback(
    async (organization: LiveOrganization) => {
      setIsSubmitting(true);
      setError(null);

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

  const handleBack = useCallback(async () => {
    if (onBack) {
      onBack();
      return;
    }

    if (switchingSchool && router.canGoBack()) {
      router.back();
      return;
    }

    await signOut();
    router.replace('/login');
  }, [onBack, router, signOut, switchingSchool]);

  const heading = switchingSchool ? 'Switch school' : 'Choose your school';
  const subtext = switchingSchool
    ? 'Open a different school you have access to.'
    : 'Choose which school to open.';

  return (
    <PreAuthScreenShell
      heading={heading}
      headingTestID="choose-school-heading"
      subtext={subtext}
      error={error}
      onBack={handleBack}
      backDisabled={isSubmitting || loading}
      showMudKitchenLogo>
      {loading ? (
        <OrganizationSelectorSkeleton rowCount={2} />
      ) : (
        <OrganizationSelector
          organizations={organizations}
          accessibleSlugs={accessibleSlugs}
          onSelect={handleOrganizationSelect}
          disabled={isSubmitting}
        />
      )}
    </PreAuthScreenShell>
  );
}
