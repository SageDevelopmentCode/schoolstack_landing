import { Slot, usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AnimatedTabContent } from '@/components/animated-tab-content';
import {
  PLATFORM_ADMIN_FLOATING_TAB_BAR_HEIGHT,
  PlatformAdminFloatingTabBar,
} from '@/components/platform-admin/platform-admin-floating-tab-bar';
import { StoryTextLink } from '@/components/story/story-text-link';
import { ParentThemeProvider } from '@/contexts/parent-theme-context';
import { useAuth } from '@/contexts/auth-context';
import { Story } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { DEFAULT_BRANDING } from '@/lib/organization-settings/merge-branding';
import {
  getPlatformAdminActiveTab,
  platformAdminTabRoute,
  type PlatformAdminTab,
} from '@/lib/platform-admin/platform-admin-nav';

function PlatformAdminLayoutContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, portalType, signOut, isLoading: authLoading } = useAuth();

  const activeTab = getPlatformAdminActiveTab(pathname);
  const showTabBar = activeTab !== null;

  useEffect(() => {
    if (!authLoading && (!user || portalType !== 'platform_admin')) {
      router.replace('/');
    }
  }, [authLoading, user, portalType, router]);

  const handleTabChange = (tab: PlatformAdminTab) => {
    router.replace(platformAdminTabRoute(tab));
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  if (authLoading || !user || portalType !== 'platform_admin') {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator color={Story.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.toolbar}>
        <View style={styles.toolbarSpacer} />
        <StoryTextLink label="Sign out" onPress={() => void handleSignOut()} />
      </View>
      <View
        style={[
          styles.content,
          showTabBar ? { paddingBottom: PLATFORM_ADMIN_FLOATING_TAB_BAR_HEIGHT } : null,
        ]}>
        <AnimatedTabContent transitionKey={showTabBar ? activeTab : null}>
          <Slot />
        </AnimatedTabContent>
      </View>
      {showTabBar && activeTab ? (
        <PlatformAdminFloatingTabBar activeTab={activeTab} onChange={handleTabChange} />
      ) : null}
    </SafeAreaView>
  );
}

export default function PlatformAdminLayout() {
  return (
    <ParentThemeProvider branding={DEFAULT_BRANDING}>
      <PlatformAdminLayoutContent />
    </ParentThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Story.paper,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.one,
  },
  toolbarSpacer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
