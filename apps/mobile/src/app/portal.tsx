import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/auth-context';
import {
  getPortalHeading,
  getPortalLabel,
} from '@/lib/auth/resolve-portal';
import { Brand, Spacing } from '@/constants/theme';

export default function PortalScreen() {
  const router = useRouter();
  const { user, portalType, selectedSchool, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || !portalType)) {
      router.replace('/login');
    }
  }, [isLoading, user, portalType, router]);

  if (isLoading || !user || !portalType) {
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
          {getPortalHeading(portalType)}
        </ThemedText>
        <ThemedText type="small" color={Brand.textMuted} style={styles.subtext}>
          {getPortalLabel(portalType, selectedSchool?.name)}
        </ThemedText>
        {user.email ? (
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
    paddingHorizontal: Spacing.four,
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
