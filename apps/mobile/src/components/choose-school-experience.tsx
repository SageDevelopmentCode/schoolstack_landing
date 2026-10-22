import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { OrganizationSelector } from '@/components/organization-selector';
import { OrganizationSelectorSkeleton } from '@/components/organization-selector-skeleton';
import { PreAuthScreenShell } from '@/components/pre-auth-screen-shell';
import { StoryButton } from '@/components/story/story-button';
import {
  completeSchoolSignIn,
  useAuth,
} from '@/contexts/auth-context';
import { normalizeAuthErrorMessage } from '@/lib/auth/auth-error-message';
import {
  NO_SCHOOL_ACCESS_MESSAGE,
  SCHOOLS_LOAD_FAILED_MESSAGE,
} from '@/lib/auth/complete-accessible-school-sign-in';
import {
  filterAccessibleOrganizationsBySlugs,
  listAccessibleLiveOrganizations,
} from '@/lib/auth/list-accessible-organizations';
import { PortalAccessError, resolvePlatformAdmin } from '@/lib/auth/resolve-portal';
import { markExplicitMobileSignOut } from '@/lib/auth/mobile-explicit-sign-out';
import { logMobileAuthSignedIn } from '@/lib/mobile-activity';
import type { LiveOrganization } from '@/lib/organizations';
import { clearAllPersistedPortalCaches } from '@/lib/portal-cache';
import { getSupabaseClient } from '@/lib/supabase';
import { Spacing } from '@/constants/theme';

type ChooseSchoolExperienceProps = {
  /** When true, back navigates to the previous screen instead of signing out. */
  switchingSchool?: boolean;
  onBack?: () => void;
  /** Slugs from portal post-auth (filter the accessible org list). */
  initialSlugs?: string[] | null;
  /** Wait for route slugs param before loading (portal navigation). */
  expectSlugsFromRoute?: boolean;
};

export function ChooseSchoolExperience({
  switchingSchool = false,
  onBack,
  initialSlugs = null,
  expectSlugsFromRoute = false,
}: ChooseSchoolExperienceProps) {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { user, setResolvedPortal, signOut, isLoading: authLoading } = useAuth();
  const loadGenerationRef = useRef(0);

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
      await clearAllPersistedPortalCaches();
      await setResolvedPortal(portal, user.id);
      void logMobileAuthSignedIn(portal, {
        freshSignIn: !switchingSchool,
      });
      router.replace('/portal');
    },
    [router, setResolvedPortal, switchingSchool, user?.id],
  );

  const handleNoSchoolAccess = useCallback(async () => {
    markExplicitMobileSignOut();
    await signOut();
    router.replace('/login');
  }, [router, signOut]);

  const goToPlatformAdminHome = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      return false;
    }

    try {
      const portal = await resolvePlatformAdmin(supabase, user.id);
      await setResolvedPortal(portal, user.id);
      router.replace('/platform-admin/organizations');
      return true;
    } catch (redirectError) {
      if (redirectError instanceof PortalAccessError) {
        return false;
      }
      throw redirectError;
    }
  }, [router, setResolvedPortal, supabase, user?.id]);

  const applyOrganizations = useCallback(
    async (allAccessible: LiveOrganization[], slugFilter: string[] | null) => {
      const slugs =
        slugFilter && slugFilter.length > 0
          ? slugFilter
          : allAccessible.map((organization) => organization.slug);
      const orgs =
        slugFilter && slugFilter.length > 0
          ? filterAccessibleOrganizationsBySlugs(allAccessible, slugFilter)
          : allAccessible;

      setAccessibleSlugs(slugs);
      setOrganizations(orgs);

      if (slugs.length > 0 && orgs.length === 0) {
        setError(SCHOOLS_LOAD_FAILED_MESSAGE);
        return;
      }

      if (slugs.length === 1) {
        const organization = orgs[0];
        if (!organization) {
          setError(SCHOOLS_LOAD_FAILED_MESSAGE);
          return;
        }
        await finishSignIn(organization);
      }
    },
    [finishSignIn],
  );

  const loadSchools = useCallback(async () => {
    if (!user?.id) {
      setError('You must be signed in to continue.');
      setLoading(false);
      return;
    }

    if (expectSlugsFromRoute && (!initialSlugs || initialSlugs.length === 0)) {
      return;
    }

    const loadGeneration = loadGenerationRef.current + 1;
    loadGenerationRef.current = loadGeneration;

    setLoading(true);
    setError(null);

    try {
      const allAccessible = await listAccessibleLiveOrganizations(supabase, user.id);

      if (loadGeneration !== loadGenerationRef.current) {
        return;
      }

      if (allAccessible.length === 0) {
        setAccessibleSlugs([]);
        setOrganizations([]);
        setError(NO_SCHOOL_ACCESS_MESSAGE);
        await handleNoSchoolAccess();
        return;
      }

      const slugFilter =
        initialSlugs && initialSlugs.length > 0 ? initialSlugs : null;
      await applyOrganizations(allAccessible, slugFilter);
    } catch (loadError) {
      if (loadGeneration !== loadGenerationRef.current) {
        return;
      }
      setError(
        loadError instanceof Error
          ? loadError.message
          : SCHOOLS_LOAD_FAILED_MESSAGE,
      );
    } finally {
      if (loadGeneration === loadGenerationRef.current) {
        setLoading(false);
      }
    }
  }, [
    applyOrganizations,
    expectSlugsFromRoute,
    handleNoSchoolAccess,
    initialSlugs,
    supabase,
    user?.id,
  ]);

  const bootstrapChooseSchool = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const redirected = await goToPlatformAdminHome();
      if (!redirected) {
        await loadSchools();
      }
    } catch (bootstrapError) {
      setError(
        normalizeAuthErrorMessage(bootstrapError, SCHOOLS_LOAD_FAILED_MESSAGE),
      );
      setLoading(false);
    }
  }, [goToPlatformAdminHome, loadSchools]);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!switchingSchool) {
      void bootstrapChooseSchool();
      return;
    }
    void loadSchools();
  }, [authLoading, bootstrapChooseSchool, loadSchools, router, switchingSchool, user]);

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

    if (switchingSchool) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/portal');
      }
      return;
    }

    let redirected = false;
    try {
      redirected = await goToPlatformAdminHome();
    } catch {
      redirected = false;
    }

    if (redirected) {
      return;
    }

    await signOut();
    router.replace('/login');
  }, [goToPlatformAdminHome, onBack, router, signOut, switchingSchool]);

  const heading = switchingSchool ? 'Switch school' : 'Choose your school';
  const subtext = switchingSchool
    ? 'Open a different school you have access to.'
    : 'Choose which school to open.';

  const showSelector = !loading && !(error && organizations.length === 0);

  return (
    <PreAuthScreenShell
      heading={heading}
      headingTestID="choose-school-heading"
      subtext={subtext}
      error={error}
      onBack={handleBack}
      backDisabled={isSubmitting || loading}
      showMudKitchenLogo
      footer={
        error && !loading ? (
          <View style={styles.footer}>
            <StoryButton
              label="Try again"
              onPress={() => void bootstrapChooseSchool()}
              disabled={isSubmitting || loading}
            />
          </View>
        ) : undefined
      }>
      {loading ? (
        <OrganizationSelectorSkeleton rowCount={2} />
      ) : showSelector ? (
        <OrganizationSelector
          organizations={organizations}
          accessibleSlugs={accessibleSlugs}
          onSelect={handleOrganizationSelect}
          disabled={isSubmitting}
        />
      ) : null}
    </PreAuthScreenShell>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: Spacing.three,
  },
});
