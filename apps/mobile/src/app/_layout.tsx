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
import { View } from 'react-native';

import { SplashOverlay } from '@/components/splash-overlay';
import { AuthProvider } from '@/contexts/auth-context';
import { Brand } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

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
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Brand.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="portal" options={{ animation: 'fade' }} />
        <Stack.Screen name="platform-admin" options={{ animation: 'fade' }} />
        <Stack.Screen name="school-admin" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </AuthProvider>
  );
}
