import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
  type ScrollView,
} from 'react-native';
import { ParentFormBuilderFields } from '@/components/parent/forms-documents/parent-form-builder-fields';
import { ParentFormDetailSkeleton } from '@/components/parent/forms-documents/parent-form-detail-skeleton';
import { ParentFormSignatureField } from '@/components/parent/forms-documents/parent-form-signature-field';
import { ParentKeyboardAwareScrollView } from '@/components/parent/parent-keyboard-aware-scroll-view';
import { ParentEmbeddedPdfPreview } from '@/components/parent/shared/parent-embedded-pdf-preview';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentBilling } from '@/contexts/parent-billing-context';
import { useParentFormsDocuments } from '@/contexts/parent-forms-documents-context';
import { useParentHome } from '@/contexts/parent-home-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import type { ParentFormDetail } from '@/lib/parent/parent-forms-documents-types';
import {
  areBuilderFieldValuesComplete,
  formatFormDueDate,
  formatFormSignedDate,
  parseStoredSignerName,
} from '@/lib/parent/parent-forms-documents-utils';
import {
  fetchParentFormDetail,
  fetchParentFormDownloadUrl,
  submitParentFormResponse,
} from '@/lib/parent/parent-portal-api';
import { buildEmbeddedPdfViewerUrl } from '@/lib/school-bulletin/bulletin-format';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type ParentFormDetailScreenProps = {
  slug: string;
  organizationId: string;
  formId: string;
};

export function ParentFormDetailScreen({
  slug: _slug,
  organizationId,
  formId,
}: ParentFormDetailScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { applySubmittedForm } = useParentFormsDocuments();
  const { applySignedForm } = useParentHome();
  const { applySignedAgreement } = useParentBilling();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [detail, setDetail] = useState<ParentFormDetail | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string | boolean | string[]>>(
    {},
  );
  const [signerName, setSignerName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const scrollSignatureIntoView = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  const loadDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setPreviewUrl(null);

    try {
      const payload = await fetchParentFormDetail(organizationId, formId);
      setDetail(payload);
      setSignerName(parseStoredSignerName(payload.response.responses));
      setFieldValues({});

      if (payload.form.formType === 'upload' && payload.form.uploadFormat === 'pdf') {
        const download = await fetchParentFormDownloadUrl(organizationId, formId);
        setPreviewUrl(buildEmbeddedPdfViewerUrl(download.signedUrl));
      }
    } catch (loadError) {
      reportError('parent_forms_documents.detail', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Failed to load form.');
    } finally {
      setIsLoading(false);
    }
  }, [formId, organizationId, reportError]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const isSigned = detail?.response.status === 'signed';
  const builderFields = detail?.form.fields ?? [];
  const bodyBuilderFields = useMemo(
    () => builderFields.filter((field) => field.type !== 'signature'),
    [builderFields],
  );
  const bodySignatureFields = useMemo(
    () => builderFields.filter((field) => field.type === 'signature'),
    [builderFields],
  );
  const bodySignatureField = bodySignatureFields[0] ?? null;

  const canSign = useMemo(() => {
    if (!detail || isSigned || isSubmitting) return false;

    if (detail.form.formType === 'upload') {
      if (!detail.form.requireSignature) return true;
      return signerName.trim().length > 0;
    }

    if (detail.form.formType === 'builder') {
      return areBuilderFieldValuesComplete(builderFields, fieldValues);
    }

    return false;
  }, [builderFields, detail, fieldValues, isSigned, isSubmitting, signerName]);

  const submitActionLabel =
    detail?.form.formType === 'upload' && !detail.form.requireSignature
      ? 'Acknowledge'
      : 'Sign now';

  const handleOpenDocx = async () => {
    try {
      const download = await fetchParentFormDownloadUrl(organizationId, formId);
      await Linking.openURL(download.signedUrl);
    } catch (openError) {
      reportError('parent_forms_documents.open_docx', openError);
      Alert.alert(
        'Could not open document',
        openError instanceof Error ? openError.message : 'Please try again.',
      );
    }
  };

  const handleSubmit = async () => {
    if (!detail || !canSign) return;

    setIsSubmitting(true);
    try {
      const payload = await submitParentFormResponse(organizationId, formId, {
        signerName:
          detail.form.formType === 'upload'
            ? signerName.trim() || undefined
            : bodySignatureField
              ? String(fieldValues[bodySignatureField.id] ?? '').trim() || undefined
              : undefined,
        fieldValues: detail.form.formType === 'builder' ? fieldValues : undefined,
      });
      setDetail(payload);
      applySubmittedForm(payload);
      applySignedForm(payload);
      applySignedAgreement(payload);
      Alert.alert('Form signed', 'Your response has been saved.');
      router.back();
    } catch (submitError) {
      reportError('parent_forms_documents.submit', submitError);
      Alert.alert(
        'Could not sign form',
        submitError instanceof Error ? submitError.message : 'Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <ParentFormDetailSkeleton />;
  }

  if (error || !detail) {
    return (
      <View style={[styles.centered, { backgroundColor: Story.paper }]}>
        <StoryErrorBanner message={error ?? 'Form not found.'} />
      </View>
    );
  }

  const statusTone = isSigned ? 'success' : detail.response.status === 'overdue' ? 'alert' : 'warning';
  const statusLabel = isSigned
    ? 'Signed'
    : detail.response.status === 'overdue'
      ? 'Overdue'
      : 'Needs action';

  const webViewMinHeight = keyboardVisible ? 180 : 360;

  return (
    <ParentKeyboardAwareScrollView
      ref={scrollRef}
      style={{ backgroundColor: Story.paper }}
      contentContainerStyle={styles.content}>
      <StorySectionKicker>Forms &amp; documents</StorySectionKicker>
      <View style={styles.titleRow}>
        <StoryDisplayHeading size="section">{detail.form.title}</StoryDisplayHeading>
        <StoryChip tone={statusTone} label={statusLabel} />
      </View>

      {detail.response.studentNames.length > 0 ? (
        <Text style={[styles.meta, { color: theme.muted }]}>
          {detail.response.studentNames.join(', ')}
        </Text>
      ) : null}

      {detail.form.dueDate && !isSigned ? (
        <Text style={[styles.meta, { color: theme.muted }]}>
          Due {formatFormDueDate(detail.form.dueDate)}
        </Text>
      ) : null}

      {isSigned && detail.response.signedAt ? (
        <Text style={[styles.meta, { color: theme.muted }]}>
          Signed on {formatFormSignedDate(detail.response.signedAt)}
        </Text>
      ) : null}

      {detail.form.description ? (
        <StoryCard style={styles.card}>
          <Text style={[styles.description, { color: theme.ink }]}>{detail.form.description}</Text>
        </StoryCard>
      ) : null}

      {detail.form.formType === 'upload' ? (
        <StoryCard style={[styles.previewCard, { minHeight: webViewMinHeight }]}>
          {previewUrl ? (
            <ParentEmbeddedPdfPreview
              url={previewUrl}
              title={detail.form.title}
              minHeight={webViewMinHeight}
            />
          ) : (
            <View style={styles.docxBanner}>
              <Text style={[styles.meta, { color: theme.muted }]}>
                This document needs to be reviewed in your browser before signing.
              </Text>
              <StoryButton label="Open document" onPress={() => void handleOpenDocx()} />
            </View>
          )}
        </StoryCard>
      ) : (
        <StoryCard style={styles.card}>
          <ParentFormBuilderFields
            fields={bodyBuilderFields}
            values={fieldValues}
            onChange={(fieldId, value) =>
              setFieldValues((current) => ({ ...current, [fieldId]: value }))
            }
            disabled={isSigned}
            storedResponses={detail.response.responses}
          />
        </StoryCard>
      )}

      {!isSigned ? (
        <StoryCard style={[styles.card, styles.signCard]}>
          {detail.form.formType === 'upload' && detail.form.requireSignature ? (
            <ParentFormSignatureField
              value={signerName}
              onChange={setSignerName}
              onFocus={scrollSignatureIntoView}
            />
          ) : null}

          {detail.form.formType === 'builder' && bodySignatureField ? (
            <ParentFormBuilderFields
              fields={[bodySignatureField]}
              values={fieldValues}
              onChange={(fieldId, value) =>
                setFieldValues((current) => ({ ...current, [fieldId]: value }))
              }
              disabled={false}
            />
          ) : null}

          <StoryButton
            label={isSubmitting ? 'Signing…' : submitActionLabel}
            trailingIcon={
              isSubmitting ? <ActivityIndicator color="#FFFFFF" size="small" /> : undefined
            }
            onPress={() => void handleSubmit()}
            disabled={!canSign || isSubmitting}
            style={styles.submitButton}
          />
        </StoryCard>
      ) : (
        <StoryCard style={styles.card}>
          <Text style={[styles.meta, { color: theme.muted }]}>
            Signed by {parseStoredSignerName(detail.response.responses) || 'you'}
          </Text>
        </StoryCard>
      )}
    </ParentKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
  },
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 20,
  },
  card: {
    padding: StoryCardPadding,
  },
  signCard: {
    marginTop: Spacing.two,
  },
  previewCard: {
    padding: 0,
    overflow: 'hidden',
    minHeight: 360,
  },
  docxBanner: {
    padding: StoryCardPadding,
    gap: Spacing.three,
  },
  description: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 22,
  },
  submitButton: {
    marginTop: Spacing.four,
  },
});
