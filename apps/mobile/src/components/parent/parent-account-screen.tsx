import type { User } from '@supabase/supabase-js';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EditableProfilePhoto } from '@/components/parent/children/editable-profile-photo';
import { PARENT_FLOATING_TAB_BAR_HEIGHT } from '@/components/parent/parent-floating-tab-bar';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { useAuth } from '@/contexts/auth-context';
import { useParentHome } from '@/contexts/parent-home-context';
import {
  GuardianProfilePhotoUploadError,
  uploadGuardianProfilePhotoFromParent,
} from '@/lib/parent/upload-guardian-profile-photo';

function getDisplayName(user: User): string {
  const fullName = user.user_metadata?.full_name;
  if (typeof fullName === 'string' && fullName.trim()) {
    return fullName.trim();
  }
  const emailLocalPart = user.email?.split('@')[0]?.trim();
  if (emailLocalPart) {
    return emailLocalPart;
  }
  return 'Account';
}

export function ParentAccountScreen() {
  const router = useRouter();
  const theme = useAdminTheme();
  const { user, signOut, selectedSchool } = useAuth();
  const { data: homeData, refresh } = useParentHome();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const displayName = useMemo(() => {
    const profileName = homeData?.userProfile.displayName?.trim();
    if (profileName) return profileName;
    return user ? getDisplayName(user) : '';
  }, [homeData?.userProfile.displayName, user]);

  const email = useMemo(() => {
    const profileEmail = homeData?.userProfile.email?.trim();
    if (profileEmail) return profileEmail;
    return user?.email ?? '';
  }, [homeData?.userProfile.email, user?.email]);

  useEffect(() => {
    setProfilePhotoUrl(homeData?.userProfile.profilePhotoUrl ?? null);
  }, [homeData?.userProfile.profilePhotoUrl]);

  const handlePhotoSelected = useCallback(
    async (uri: string, mimeType?: string) => {
      const organizationId = selectedSchool?.id;
      if (!organizationId) return;

      setPhotoUploading(true);
      try {
        const nextUrl = await uploadGuardianProfilePhotoFromParent({
          organizationId,
          uri,
          mimeType,
        });
        setProfilePhotoUrl(nextUrl);
        void refresh();
      } catch (error) {
        const message =
          error instanceof GuardianProfilePhotoUploadError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Failed to upload photo.';
        Alert.alert('Photo upload failed', message);
      } finally {
        setPhotoUploading(false);
      }
    },
    [refresh, selectedSchool?.id],
  );

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View
        style={[
          styles.header,
          { borderBottomColor: theme.border, backgroundColor: theme.surface },
        ]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
          <Ionicons name="chevron-back" size={20} color={theme.accent} />
          <ThemedText type="small" style={{ color: theme.accent }}>
            More
          </ThemedText>
        </Pressable>
        <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
          Account
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: PARENT_FLOATING_TAB_BAR_HEIGHT + Spacing.six },
        ]}>
        <View style={styles.profileSection}>
          <EditableProfilePhoto
            name={displayName}
            photoUrl={profilePhotoUrl}
            size={96}
            shape="circle"
            editable
            uploading={photoUploading}
            showEditHint
            onPhotoSelected={(uri, mimeType) => void handlePhotoSelected(uri, mimeType)}
          />
          <ThemedText type="title" style={{ color: theme.textPrimary, textAlign: 'center' }}>
            {displayName}
          </ThemedText>
          {email ? (
            <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
              {email}
            </ThemedText>
          ) : null}
        </View>

        <PrimaryButton
          label="Sign out"
          variant="surface"
          onPress={() => void handleSignOut()}
          style={styles.signOutButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 80,
  },
  headerSpacer: {
    minWidth: 80,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    gap: Spacing.five,
  },
  profileSection: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  signOutButton: {
    marginTop: Spacing.two,
  },
});
