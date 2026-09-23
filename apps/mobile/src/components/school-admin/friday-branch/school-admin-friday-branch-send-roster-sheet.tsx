import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { StoryButton } from '@/components/story/story-button';
import { AdmissionsFilterPill } from '@/components/school-admin/admissions/admissions-filter-pill';
import { StoryTextField } from '@/components/story/story-text-field';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { createSchoolAdminErrorReporter } from '@/lib/mobile-error-reporter';
import {
  fetchFridayBranchRosterEmailPreview,
  MAX_ROSTER_RECIPIENTS,
  normalizeRosterEmails,
  sendFridayBranchClassRoster,
} from '@/lib/school-admin/friday-branch/friday-branch-api';
import type { FridayBranchRosterEmailPreview } from '@/lib/school-admin/friday-branch/friday-branch-types';
import { StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

type SchoolAdminFridayBranchSendRosterSheetProps = {
  visible: boolean;
  organizationId: string;
  classId: string | null;
  className: string;
  slotTime: string;
  onClose: () => void;
};

export function SchoolAdminFridayBranchSendRosterSheet({
  visible,
  organizationId,
  classId,
  className,
  slotTime,
  onClose,
}: SchoolAdminFridayBranchSendRosterSheetProps) {
  const theme = useParentTheme();
  const reportError = createSchoolAdminErrorReporter(organizationId);
  const [emailDraft, setEmailDraft] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [preview, setPreview] = useState<FridayBranchRosterEmailPreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!visible) {
      setEmailDraft('');
      setRecipients([]);
      setEmailError(null);
      setSending(false);
      setPreview(null);
      setShowPreview(false);
      setPreviewLoading(false);
    }
  }, [classId, visible]);

  const addRecipient = () => {
    const trimmed = emailDraft.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setEmailError('Enter a valid email address.');
      return;
    }
    if (recipients.includes(trimmed)) {
      setEmailError('That email is already added.');
      return;
    }
    if (recipients.length >= MAX_ROSTER_RECIPIENTS) {
      setEmailError(`You can send to up to ${MAX_ROSTER_RECIPIENTS} recipients.`);
      return;
    }
    setRecipients(normalizeRosterEmails([...recipients, trimmed]));
    setEmailDraft('');
    setEmailError(null);
  };

  const loadPreview = async () => {
    if (!classId) return;
    setPreviewLoading(true);
    try {
      const payload = await fetchFridayBranchRosterEmailPreview(organizationId, classId);
      setPreview(payload);
      setShowPreview(true);
    } catch (error) {
      reportError('friday_branch.roster.preview', error);
      Alert.alert(
        'Preview failed',
        error instanceof Error ? error.message : 'Failed to load roster email preview.',
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSend = async () => {
    if (!classId || sending) return;
    if (recipients.length === 0) {
      setEmailError('Add at least one recipient.');
      return;
    }

    setSending(true);
    try {
      await sendFridayBranchClassRoster(organizationId, classId, recipients);
      Alert.alert('Roster sent', 'The class roster email was sent.');
      onClose();
    } catch (error) {
      reportError('friday_branch.roster.send', error);
      Alert.alert(
        'Send failed',
        error instanceof Error ? error.message : 'Failed to send roster email.',
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <StoryBottomSheet visible={visible} onClose={onClose} accessibilityLabel="Close send roster">
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.ink }]}>Send roster</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          {className} · {slotTime}
        </Text>

        <StoryTextField
          label="Recipient email"
          value={emailDraft}
          onChangeText={(value) => {
            setEmailDraft(value);
            setEmailError(null);
          }}
          placeholder="teacher@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {emailError ? <Text style={[styles.error, { color: theme.alert }]}>{emailError}</Text> : null}

        <StoryButton label="Add recipient" variant="outline" previewSafe onPress={addRecipient} />

        {recipients.length > 0 ? (
          <View style={styles.recipientRow}>
            {recipients.map((email) => (
              <AdmissionsFilterPill
                key={email}
                label={email}
                active
                onPress={() => setRecipients(recipients.filter((entry) => entry !== email))}
              />
            ))}
          </View>
        ) : null}

        <StoryButton
          label={previewLoading ? 'Loading preview…' : 'Preview email'}
          variant="outline"
          previewSafe
          disabled={previewLoading || !classId}
          onPress={() => void loadPreview()}
        />

        {showPreview && preview ? (
          <View style={styles.previewCard}>
            <Text style={[styles.previewSubject, { color: theme.ink }]}>{preview.subject}</Text>
            <WebView
              originWhitelist={['*']}
              source={{ html: preview.html }}
              style={styles.webview}
              scrollEnabled
            />
          </View>
        ) : null}

        <StoryButton
          label={sending ? 'Sending…' : 'Send roster'}
          previewSafe
          disabled={sending || recipients.length === 0}
          onPress={() => void handleSend()}
        />
      </ScrollView>
    </StoryBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
    marginTop: -Spacing.two,
  },
  error: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  recipientRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  previewCard: {
    gap: Spacing.two,
  },
  previewSubject: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  webview: {
    height: 220,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
});
