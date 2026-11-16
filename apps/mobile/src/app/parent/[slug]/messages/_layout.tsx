import { Stack } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Garden } from '@/components/parent/garden/tokens';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { detailStackAnimation } from '@/lib/motion/portal-motion';

export default function ParentMessagesLayout() {
  const theme = useParentTheme();
  const insets = useSafeAreaInsets();

  // Stack screens are clipped, so the cream is pulled up under the status bar here
  // (the parent layout's SafeAreaView pads the top edge).
  return (
    <View
      style={{
        flex: 1,
        marginTop: -insets.top,
        paddingTop: insets.top,
        backgroundColor: Garden.cream,
      }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: detailStackAnimation(),
          contentStyle: { backgroundColor: Garden.cream },
          headerStyle: { backgroundColor: theme.white },
          headerTintColor: theme.primary,
          headerTitleStyle: { color: theme.ink },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="[threadId]" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
