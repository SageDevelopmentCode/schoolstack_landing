import {
  Lora_500Medium,
  Lora_500Medium_Italic,
} from '@expo-google-fonts/lora';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { LogBox, View } from 'react-native';

import { SplashOverlay } from '@/components/splash-overlay';
import { AuthProvider } from '@/contexts/auth-context';
import { Brand } from '@/constants/theme';
import { isMobileE2e } from '@/lib/e2e';

SplashScreen.preventAutoHideAsync();

if (isMobileE2e) {
  LogBox.ignoreAllLogs();
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Lora_500Medium,
    Lora_500Medium_Italic,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: Brand.bg }} />;
  }

  return (
    <AuthProvider>
      <SplashOverlay />
      <Stack
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
          name="platform-admin"
          options={{ animation: isMobileE2e ? 'none' : 'fade' }}
        />
        <Stack.Screen
          name="school-admin/[slug]"
          options={{ animation: isMobileE2e ? 'none' : 'slide_from_right' }}
        />
      </Stack>
    </AuthProvider>
  );
}
