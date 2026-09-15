import type { User } from '@supabase/supabase-js';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { TEACHER_FLOATING_TAB_BAR_HEIGHT } from '@/components/teacher/teacher-floating-tab-bar';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { useAuth } from '@/contexts/auth-context';
import { MessagesAvatar } from '@/components/school-admin/messages/messages-avatar';

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

export function TeacherAccountScreen() {
  const router = useRouter();
  const theme = useAdminTheme();
  const { user, signOut } = useAuth();

  const displayName = useMemo(() => (user ? getDisplayName(user) : ''), [user]);
  const email = user?.email ?? '';

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
          { paddingBottom: TEACHER_FLOATING_TAB_BAR_HEIGHT + Spacing.six },
        ]}>
        <View style={styles.profileSection}>
          <MessagesAvatar name={displayName} color={theme.accent} size="lg" />
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
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
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
