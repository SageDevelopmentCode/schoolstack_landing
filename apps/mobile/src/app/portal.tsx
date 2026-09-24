import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/auth-context';
import { resolveAuthRecoveryRoute } from '@/lib/auth/auth-recovery';
import {
  resolvePortalRecovery,
  shouldShowPortalLoadingSpinner,
} from '@/lib/auth/portal-recovery';
import {
  getPortalHeading,
  getPortalLabel,
} from '@/lib/auth/resolve-portal';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Brand, Spacing } from '@/constants/theme';

export default function PortalScreen() {
  const router = useRouter();
  const { user, portalType, selectedSchool, isLoading, signOut, restorePortalState } = useAuth();
  const [restoringPortal, setRestoringPortal] = useState(false);
  const restoreAttemptedRef = useRef(false);

  const recoveryDecision = useMemo(
    () =>
      resolvePortalRecovery({
        isLoading,
        restoringPortal,
        user,
        portalType,
        selectedSchool,
        restoreAttempted: restoreAttemptedRef.current,
      }),
    [isLoading, portalType, restoringPortal, selectedSchool, user],
  );

  useEffect(() => {
    if (recoveryDecision.action === 'recovery_route') {
      void resolveAuthRecoveryRoute().then((route) => {
        router.replace(route);
      });
      return;
    }

    if (recoveryDecision.action === 'login') {
      router.replace('/login');
      return;
    }

    if (recoveryDecision.action === 'restore') {
      restoreAttemptedRef.current = true;
      setRestoringPortal(true);
      void restorePortalState().finally(() => {
        setRestoringPortal(false);
      });
      return;
    }

    if (recoveryDecision.action === 'navigate') {
      router.replace(recoveryDecision.route);
    }
  }, [recoveryDecision, restorePortalState, router]);

  if (shouldShowPortalLoadingSpinner(recoveryDecision)) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color={Brand.accent} />
      </SafeAreaView>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <ThemedText type="badge" style={styles.badge}>
          Signed in
        </ThemedText>
        <ThemedText type="title" style={styles.heading}>
          {portalType ? getPortalHeading(portalType) : 'Portal'}
        </ThemedText>
        <ThemedText type="small" color={Brand.textMuted} style={styles.subtext}>
          {portalType ? getPortalLabel(portalType, selectedSchool?.name) : 'Choose a school to continue.'}
        </ThemedText>
        {user?.email ? (
          <ThemedText type="small" color={Brand.textMuted} style={styles.email}>
            {user.email}
          </ThemedText>
        ) : null}

        <PrimaryButton
          label="Sign out"
          variant="surface"
          onPress={handleSignOut}
          style={styles.signOutButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.bg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.six,
    gap: Spacing.two,
  },
  badge: {
    alignSelf: 'flex-start',
  },
  heading: {
    marginTop: Spacing.two,
  },
  subtext: {
    lineHeight: 22,
    marginTop: Spacing.two,
  },
  email: {
    marginTop: Spacing.two,
  },
  signOutButton: {
    marginTop: 'auto',
    marginBottom: Spacing.four,
    width: '100%',
  },
});
