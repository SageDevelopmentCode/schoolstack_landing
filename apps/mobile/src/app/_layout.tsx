import { useFonts } from 'expo-font';
import { Observe, ObserveRoot } from 'expo-observe';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { LogBox, View } from 'react-native';

import { AuthSessionGuard } from '@/components/auth-session-guard';
import { SentryNavigationTracker } from '@/components/sentry-navigation-tracker';
import { MobileGlobalErrorReportingBridge } from '@/components/mobile-global-error-reporting-bridge';
import { MobileOperationalScreenLayout } from '@/components/mobile-operational-screen-layout';
import { OtaUpdateManager } from '@/components/ota-update-manager';
import { StoryToastProvider } from '@/components/story/story-toast';
import { SupabaseAuthLifecycle } from '@/components/supabase-auth-lifecycle';
import { PushNotificationManager } from '@/components/push-notification-manager';
import { SplashOverlay } from '@/components/splash-overlay';
import { AuthProvider } from '@/contexts/auth-context';
import { PortalTransitionProvider } from '@/contexts/portal-transition-context';
import { APP_FONTS } from '@/constants/app-fonts';
import { Brand } from '@/constants/theme';
import { isMobileE2e } from '@/lib/e2e';
import { initMobileSentry, Sentry } from '@/lib/sentry';

initMobileSentry();

Observe.configure({
  integrations: {
    'expo-router': {
      filteredParams: ['token', 'access_token', 'refresh_token', 'code', 'state'],
    },
  },
});

SplashScreen.preventAutoHideAsync();

if (isMobileE2e) {
  LogBox.ignoreAllLogs();
}

function RootLayout() {
  const [fontsLoaded] = useFonts(APP_FONTS);

  if (!fontsLoaded && !isMobileE2e) {
    return <View style={{ flex: 1, backgroundColor: Brand.bg }} />;
  }

  return (
    <AuthProvider>
      <PortalTransitionProvider>
        <StoryToastProvider>
        <SentryNavigationTracker />
        <MobileGlobalErrorReportingBridge />
        <AuthSessionGuard />
        <SupabaseAuthLifecycle />
        <OtaUpdateManager />
        <PushNotificationManager />
        <SplashOverlay />
        <Stack
        screenLayout={MobileOperationalScreenLayout}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Brand.bg },
          animation: isMobileE2e ? 'none' : undefined,
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="login"
          options={{ animation: isMobileE2e ? 'none' : 'slide_from_right' }}
        />
        <Stack.Screen name="portal" options={{ animation: isMobileE2e ? 'none' : 'fade' }} />
        <Stack.Screen
          name="parent-apply-gate"
          options={{ animation: isMobileE2e ? 'none' : 'fade' }}
        />
        <Stack.Screen
          name="platform-admin"
          options={{ animation: isMobileE2e ? 'none' : 'fade' }}
        />
        <Stack.Screen
          name="school-admin/[slug]"
          options={{ animation: isMobileE2e ? 'none' : 'slide_from_right' }}
        />
        <Stack.Screen
          name="parent/[slug]"
          options={{ animation: isMobileE2e ? 'none' : 'slide_from_right' }}
        />
        <Stack.Screen
          name="teacher/[slug]"
          options={{ animation: isMobileE2e ? 'none' : 'slide_from_right' }}
        />
        <Stack.Screen name="stripe-checkout" options={{ animation: 'none' }} />
        <Stack.Screen name="dev/sheet-gallery" options={{ animation: 'none' }} />
        </Stack>
        </StoryToastProvider>
      </PortalTransitionProvider>
    </AuthProvider>
  );
}

export default ObserveRoot.wrap(Sentry.wrap(RootLayout));
