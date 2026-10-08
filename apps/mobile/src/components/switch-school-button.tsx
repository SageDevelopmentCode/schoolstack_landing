import { useRouter } from 'expo-router';
import { StyleSheet, type ViewStyle } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { useAuth } from '@/contexts/auth-context';
import { useCanSwitchSchool } from '@/lib/auth/use-can-switch-school';

type SwitchSchoolButtonProps = {
  style?: ViewStyle;
};

export function SwitchSchoolButton({ style }: SwitchSchoolButtonProps) {
  const router = useRouter();
  const { user, switchSchool, previewSession, isPlatformAdminSession } = useAuth();
  const canSwitch = useCanSwitchSchool(user?.id);

  if (!canSwitch || previewSession || isPlatformAdminSession) {
    return null;
  }

  const handlePress = async () => {
    await switchSchool();
    router.replace('/login/choose-school?mode=switch');
  };

  return (
    <PrimaryButton
      label="Switch school"
      variant="surface"
      onPress={() => void handlePress()}
      style={[styles.button, style]}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
  },
});
