import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OrganizationLogo } from '@/components/organization-logo';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { SchoolAdminThemeProvider, useAdminTheme } from '@/contexts/admin-theme-context';
import { useAuth } from '@/contexts/auth-context';
import {
  getParentMobileGateCopy,
  type ParentMobileGateCopy,
} from '@/lib/admissions/parent-portal-access';
import { schoolApplyUrl } from '@/lib/admissions/school-apply-url';
import { adminCardShadow, buildPlatformAdminTheme } from '@/lib/organization-settings/build-admin-theme';
import { toOrganizationBranding, type LiveOrganization } from '@/lib/organizations';
import { resolveOrganizationAssetUrl } from '@/lib/resolve-asset-url';
import { getSupabaseClient } from '@/lib/supabase';

const DEFAULT_GATE_COPY: ParentMobileGateCopy = {
  title: 'Continue on the web',
  body: 'The mobile app is available once your family is enrolled. Please finish your application or enrollment in your browser to continue.',
  ctaLabel: 'Continue application',
};

const MAX_CONTENT_WIDTH = 400;

type ParentApplyWebGateContentProps = {
  selectedSchool: LiveOrganization;
  gateCopy: ParentMobileGateCopy;
  copyLoading: boolean;
  onOpenApply: () => void;
  onSignOut: () => void;
};

function ParentApplyWebGateContent({
  selectedSchool,
  gateCopy,
  copyLoading,
  onOpenApply,
  onSignOut,
}: ParentApplyWebGateContentProps) {
  const theme = useAdminTheme();
  const logoSrc = resolveOrganizationAssetUrl(selectedSchool.branding.logoSrc);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar style="dark" />
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <OrganizationLogo
          logoSrc={logoSrc}
          logoAlt={selectedSchool.branding.logoAlt}
          name={selectedSchool.name}
        />
        <ThemedText
          type="smallBold"
          numberOfLines={1}
          style={[styles.schoolName, { color: theme.textPrimary }]}>
          {selectedSchool.name}
        </ThemedText>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.centeredContent}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
              adminCardShadow(theme),
            ]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.accentGlow }]}>
              <Ionicons name="laptop-outline" size={24} color={theme.accent} />
            </View>

            <View style={[styles.badge, { backgroundColor: theme.accentLight }]}>
              <ThemedText type="smallBold" style={{ color: theme.accent }}>
                Finish on the web
              </ThemedText>
            </View>

            {copyLoading ? (
              <ActivityIndicator color={theme.accent} style={styles.copyLoader} />
            ) : (
              <>
                <ThemedText type="title" style={[styles.title, { color: theme.textPrimary }]}>
                  {gateCopy.title}
                </ThemedText>
                <ThemedText type="small" style={[styles.body, { color: theme.textSecondary }]}>
                  {gateCopy.body}
                </ThemedText>
              </>
            )}

            <PrimaryButton
              label={gateCopy.ctaLabel}
              variant="accent"
              onPress={onOpenApply}
              disabled={copyLoading}
              style={styles.ctaButton}
            />
          </View>

          <PrimaryButton
            label="Sign out"
            variant="surface"
            onPress={onSignOut}
            style={[styles.signOutButton, { borderColor: theme.border }]}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ParentApplyWebGateScreen() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { user, portalType, selectedSchool, isLoading, signOut } = useAuth();
  const [gateCopy, setGateCopy] = useState<ParentMobileGateCopy>(DEFAULT_GATE_COPY);
  const [copyLoading, setCopyLoading] = useState(true);
  const loadingTheme = useMemo(() => buildPlatformAdminTheme(), []);

  useEffect(() => {
    if (isLoading) return;

    if (!user || portalType !== 'parent_apply' || !selectedSchool) {
      router.replace(user && portalType ? '/portal' : '/login');
      return;
    }
  }, [isLoading, user, portalType, selectedSchool, router]);

  useEffect(() => {
    if (!user || !selectedSchool || portalType !== 'parent_apply') {
      setCopyLoading(false);
      return;
    }

    const userId = user.id;
    const organizationId = selectedSchool.id;
    const schoolName = selectedSchool.name;
    let cancelled = false;

    async function loadCopy() {
      setCopyLoading(true);
      try {
        const copy = await getParentMobileGateCopy(
          supabase,
          userId,
          organizationId,
          schoolName,
        );
        if (!cancelled) {
          setGateCopy(copy);
        }
      } catch {
        if (!cancelled) {
          setGateCopy({
            ...DEFAULT_GATE_COPY,
            body: `The ${schoolName} mobile app is available once your family is enrolled. Please finish your application or enrollment in your browser to continue.`,
          });
        }
      } finally {
        if (!cancelled) {
          setCopyLoading(false);
        }
      }
    }

    void loadCopy();

    return () => {
      cancelled = true;
    };
  }, [portalType, selectedSchool, supabase, user]);

  const handleOpenApply = useCallback(async () => {
    if (!selectedSchool) return;
    await openBrowserAsync(schoolApplyUrl(selectedSchool.slug), {
      presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
    });
  }, [selectedSchool]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.replace('/');
  }, [router, signOut]);

  if (isLoading || !user || portalType !== 'parent_apply' || !selectedSchool) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: loadingTheme.bg }]}>
        <ActivityIndicator color={loadingTheme.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SchoolAdminThemeProvider branding={toOrganizationBranding(selectedSchool.branding)}>
      <ParentApplyWebGateContent
        selectedSchool={selectedSchool}
        gateCopy={gateCopy}
        copyLoading={copyLoading}
        onOpenApply={() => void handleOpenApply()}
        onSignOut={() => void handleSignOut()}
      />
    </SchoolAdminThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  schoolName: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  centeredContent: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    gap: Spacing.four,
  },
  card: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.three,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
  },
  copyLoader: {
    marginVertical: Spacing.two,
  },
  title: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
    lineHeight: 22,
  },
  ctaButton: {
    width: '100%',
    marginTop: Spacing.two,
  },
  signOutButton: {
    width: '100%',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
