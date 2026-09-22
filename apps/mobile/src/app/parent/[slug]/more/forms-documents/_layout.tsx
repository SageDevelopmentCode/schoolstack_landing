import { Stack } from 'expo-router';

export default function ParentFormsDocumentsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[formId]" />
    </Stack>
  );
}
