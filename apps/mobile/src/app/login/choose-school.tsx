import { useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ChooseSchoolExperience } from '@/components/choose-school-experience';
import { Story } from '@/constants/story-theme';

export default function ChooseSchoolScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const switchingSchool = mode === 'switch';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ChooseSchoolExperience
          switchingSchool={switchingSchool}
          onBack={
            switchingSchool && router.canGoBack()
              ? () => router.back()
              : undefined
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  keyboardView: {
    flex: 1,
  },
});
