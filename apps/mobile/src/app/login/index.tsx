import { useObserve } from '@/lib/mobile-observe';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SchoolLoginExperience } from '@/components/school-login-experience';
import { Garden } from '@/components/parent/garden/tokens';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { markInteractive } = useObserve();

  useEffect(() => {
    markInteractive();
  }, [markInteractive]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
        style={styles.keyboardView}>
        <SchoolLoginExperience />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Garden.cream,
  },
  keyboardView: {
    flex: 1,
  },
});
