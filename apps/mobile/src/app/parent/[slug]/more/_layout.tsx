import { Stack } from 'expo-router';

import { detailStackAnimation } from '@/lib/motion/portal-motion';

export default function ParentMoreLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: detailStackAnimation(),
      }}
    />
  );
}
