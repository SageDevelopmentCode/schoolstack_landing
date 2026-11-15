import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { GardenToastProvider } from '@/components/parent/garden/toast';
import { Garden } from '@/components/parent/garden/tokens';
import { CommitteeUnreadRefreshProvider } from '@/contexts/committee-unread-refresh-context';
import { detailStackAnimation } from '@/lib/motion/portal-motion';

/**
 * Teacher committees share the parent Garden screens, so this stack mounts the
 * Garden toast provider (the parent shell mounts it for parents). The layout
 * already pads content above the tab bar, so the default offset clears it.
 */
export default function TeacherCommitteesLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <GardenToastProvider>
        <CommitteeUnreadRefreshProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: detailStackAnimation(),
              contentStyle: { backgroundColor: Garden.cream },
            }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="explore/[committeeId]" />
            <Stack.Screen name="workspace/[committeeId]" />
            <Stack.Screen name="workspace/[committeeId]/project/[projectId]" />
          </Stack>
        </CommitteeUnreadRefreshProvider>
      </GardenToastProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
