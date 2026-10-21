import { useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ChooseSchoolExperience } from '@/components/choose-school-experience';
import { parseChooseSchoolSlugsParam } from '@/lib/auth/parse-choose-school-slugs-param';
import { Story } from '@/constants/story-theme';

export default function ChooseSchoolScreen() {
  const router = useRouter();
  const { mode, slugs, source } = useLocalSearchParams<{
    mode?: string;
    slugs?: string;
    source?: string;
  }>();
  const switchingSchool = mode === 'switch';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ChooseSchoolExperience
          initialSlugs={parseChooseSchoolSlugsParam(slugs)}
          expectSlugsFromRoute={source === 'portal'}
          switchingSchool={switchingSchool}
          onBack={
            switchingSchool
              ? () => {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace('/portal');
                  }
                }
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
