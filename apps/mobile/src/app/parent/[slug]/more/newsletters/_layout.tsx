import { Stack } from 'expo-router';

export default function ParentNewslettersLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[editionId]" />
    </Stack>
  );
}
