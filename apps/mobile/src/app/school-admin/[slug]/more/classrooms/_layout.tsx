import { Stack } from 'expo-router';

export default function ClassroomsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[classroomId]" />
    </Stack>
  );
}
