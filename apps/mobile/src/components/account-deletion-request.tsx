import { useCallback, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { resolveWebUrl } from '@/lib/admissions/school-apply-url';
import { submitParentSupportRequest } from '@/lib/parent/parent-portal-api';
import { submitAdminSupportRequest } from '@/lib/school-admin/support-request';
import { submitTeacherSupportRequest } from '@/lib/teacher/teacher-portal-api';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type AccountDeletionPortal = 'parent' | 'teacher' | 'admin';

type AccountDeletionRequestProps = {
  organizationId: string;
  portal: AccountDeletionPortal;
  sourcePagePath: string;
};

const DEFAULT_DESCRIPTION =
  'Please delete my MudKitchen account and remove my login access.';

async function submitDeletionRequest(
  portal: AccountDeletionPortal,
  organizationId: string,
  sourcePagePath: string,
): Promise<void> {
  const input = {
    organizationId,
    topic: 'account-deletion' as const,
    description: DEFAULT_DESCRIPTION,
    sourcePagePath,
  };

  switch (portal) {
    case 'parent':
      await submitParentSupportRequest(input);
      return;
    case 'teacher':
      await submitTeacherSupportRequest(input);
      return;
    case 'admin':
      await submitAdminSupportRequest(input);
      return;
  }
}

export function AccountDeletionRequest({
  organizationId,
  portal,
  sourcePagePath,
}: AccountDeletionRequestProps) {
  const theme = useAdminTheme();
  const { reportError } = useMobileErrorReporter(organizationId);
  const [submitting, setSubmitting] = useState(false);

  const handleLearnMore = useCallback(() => {
    void Linking.openURL(resolveWebUrl('/account-deletion'));
  }, []);

  const handleRequestDeletion = useCallback(() => {
    Alert.alert(
      'Request account deletion?',
      'We will remove your MudKitchen login, push notification tokens, and profile photo. School records such as applications, enrollment, messages, and billing history are controlled by your school and are not deleted automatically.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request deletion',
          style: 'destructive',
          onPress: () => {
            setSubmitting(true);
            void submitDeletionRequest(portal, organizationId, sourcePagePath)
              .then(() => {
                Alert.alert(
                  'Request received',
                  'We received your account deletion request and will follow up by email — usually within one business day.',
                );
              })
              .catch((error) => {
                reportError('account_deletion_request', error, {
                  metadata: { portal },
                });
                Alert.alert(
                  'Request failed',
                  error instanceof Error
                    ? error.message
                    : 'Failed to submit your request. Please try again.',
                );
              })
              .finally(() => {
                setSubmitting(false);
              });
          },
        },
      ],
    );
  }, [organizationId, portal, reportError, sourcePagePath]);

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
        Delete account
      </ThemedText>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        Request removal of your MudKitchen login. School-held records may require
        contacting your school directly.
      </ThemedText>
      <PrimaryButton
        label={submitting ? 'Submitting…' : 'Request account deletion'}
        variant="surface"
        disabled={submitting}
        onPress={handleRequestDeletion}
        style={styles.button}
      />
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Learn more about account deletion"
        onPress={handleLearnMore}
        hitSlop={8}>
        <Text style={[styles.learnMore, { color: theme.accent }]}>Learn more</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  button: {
    marginTop: Spacing.one,
  },
  learnMore: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
