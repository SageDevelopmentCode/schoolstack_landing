import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef } from 'react';
import { StyleSheet, Text, View, type ScrollView, type TextInput } from 'react-native';

import {
  formDateLine,
  formStatusChip,
  joinStudentNames,
} from '@/components/parent/forms-documents/garden/forms-garden-ui';
import { GardenFormFields } from '@/components/parent/forms-documents/garden/garden-form-fields';
import { GardenSignatureField } from '@/components/parent/forms-documents/garden/garden-signature-field';
import { ParentFormDetailGardenSkeleton } from '@/components/parent/forms-documents/garden/parent-forms-garden-skeletons';
import { useParentFormDetailFeedback } from '@/components/parent/forms-documents/garden/use-parent-form-detail-feedback';
import type { ParentFormDetailScreenController } from '@/components/parent/forms-documents/garden/use-parent-form-detail-screen-controller';
import { GBackHeader } from '@/components/parent/garden/back-header';
import { GStepList } from '@/components/parent/garden/steps';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import {
  GCard,
  GChip,
  GErrorCard,
  GIcon,
  GOutlineButton,
  GTick,
  GToyButton,
  gText,
} from '@/components/parent/garden/ui';
import { ParentKeyboardAwareScrollView } from '@/components/parent/parent-keyboard-aware-scroll-view';
import { ParentEmbeddedPdfPreview } from '@/components/parent/shared/parent-embedded-pdf-preview';
import { parseStoredSignerName } from '@/lib/parent/parent-forms-documents-utils';

/**
 * One parent form in Garden: header with status, signing steps, the document
 * (PDF inline, DOCX in the browser) or the builder questions, then the sign
 * card with a hint line and the one toy button. Signed forms show a mint
 * "All done" card and their stored answers.
 */
export function ParentFormDetailGardenScreen({
  controller,
}: {
  controller: ParentFormDetailScreenController;
}) {
  const accent = useGardenAccent();
  const scrollRef = useRef<ScrollView>(null);
  const signatureRef = useRef<TextInput>(null);
  const bodyY = useRef(0);
  const signY = useRef(0);

  const scrollTo = useCallback((y: number) => {
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
  }, []);
  const scrollToFields = useCallback(() => scrollTo(bodyY.current), [scrollTo]);
  const scrollToSign = useCallback(() => scrollTo(signY.current), [scrollTo]);
  const scrollSignatureIntoView = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, []);
  const focusSignature = useCallback(() => {
    scrollSignatureIntoView();
    signatureRef.current?.focus();
  }, [scrollSignatureIntoView]);

  const feedback = useParentFormDetailFeedback(controller, {
    scrollToFields,
    scrollToSign,
    focusSignature,
  });

  if (controller.isLoading) {
    return (
      <>
        <StatusBar style="dark" />
        <ParentFormDetailGardenSkeleton onBack={controller.onBack} />
      </>
    );
  }

  const { detail } = controller;

  if (controller.error || !detail) {
    return (
      <View style={[styles.root, styles.padded]} testID="parent-form-detail-screen">
        <StatusBar style="dark" />
        <GBackHeader
          backLabel="Forms"
          backAccessibilityLabel="Back to forms"
          onBack={controller.onBack}
          title="Form"
        />
        <GErrorCard
          title="We couldn't load this form"
          message={`${controller.error ?? 'Form not found.'} Check your connection, then try again.`}
          onRetry={controller.retry}
        />
      </View>
    );
  }

  const { isSigned, isAcknowledge } = controller;
  const isUpload = detail.form.formType === 'upload';
  const chip = formStatusChip(detail);
  const subtitle = [joinStudentNames(detail.response.studentNames) || null, formDateLine(detail)]
    .filter(Boolean)
    .join(' · ');
  const webViewMinHeight = feedback.keyboardVisible ? 180 : 360;
  const signedBy = parseStoredSignerName(detail.response.responses) || 'you';
  const builderSignatureField = isUpload ? null : controller.bodySignatureField;
  const hasSignatureField = isUpload ? detail.form.requireSignature : Boolean(builderSignatureField);

  return (
    <View style={styles.root} testID="parent-form-detail-screen">
      <StatusBar style="dark" />
      <ParentKeyboardAwareScrollView ref={scrollRef} contentContainerStyle={styles.content}>
        <GBackHeader
          backLabel="Forms"
          backAccessibilityLabel="Back to forms"
          onBack={controller.onBack}
          title={detail.form.title}
          subtitle={subtitle || null}
          aside={<GChip label={chip.label} tone={chip.tone} />}
        />

        {isSigned ? (
          <GCard index={1} testID="parent-form-signed-card">
            <View style={styles.signedRow} accessibilityRole="summary">
              <GTick size={40} />
              <View style={styles.flex}>
                <Text style={styles.signedTitle}>
                  {isAcknowledge
                    ? "All done — you've acknowledged this form."
                    : 'All done — this form is signed.'}
                </Text>
                <Text style={[gText.meta, { color: Garden.forest }]}>Signed by {signedBy}</Text>
              </View>
            </View>
          </GCard>
        ) : (
          <GCard title="Your steps" index={1}>
            <GStepList steps={feedback.steps} accessibilityLabel="Signing steps" />
          </GCard>
        )}

        {detail.form.description ? (
          <GCard index={2} tone="paper">
            <Text style={gText.body}>{detail.form.description}</Text>
          </GCard>
        ) : null}

        <View
          onLayout={(event) => {
            bodyY.current = event.nativeEvent.layout.y;
          }}>
          {isUpload ? (
            controller.previewUrl ? (
              <GCard index={3} style={styles.previewCard} bodyStyle={{ minHeight: webViewMinHeight }}>
                <ParentEmbeddedPdfPreview
                  url={controller.previewUrl}
                  title={detail.form.title}
                  minHeight={webViewMinHeight}
                  reportEntityType="parent_form"
                  reportEntityId={controller.formId}
                />
              </GCard>
            ) : (
              <GCard index={3} title="The document">
                <View style={[styles.noteTile, { backgroundColor: Garden.sky }]}>
                  <GIcon name="document-text-outline" size="sm" />
                  <Text style={[gText.body, styles.flex]}>
                    Review this document in your browser before signing.
                  </Text>
                </View>
                <GOutlineButton
                  label="Open document"
                  icon="open-outline"
                  accessibilityLabel={`Open document: ${detail.form.title}`}
                  onPress={() => void feedback.openDocument()}
                  style={styles.openDoc}
                />
              </GCard>
            )
          ) : controller.bodyBuilderFields.length > 0 ? (
            <GCard
              index={3}
              title={isSigned ? 'Your answers' : 'Answer the questions'}>
              <GardenFormFields
                fields={controller.bodyBuilderFields}
                values={controller.fieldValues}
                onChange={controller.setFieldValue}
                disabled={isSigned}
                storedResponses={detail.response.responses}
                invalidIds={feedback.invalidIds}
              />
            </GCard>
          ) : null}
        </View>

        {!isSigned ? (
          <View
            onLayout={(event) => {
              signY.current = event.nativeEvent.layout.y;
            }}>
            <GCard
              index={4}
              title={isAcknowledge ? 'Acknowledge' : 'Sign'}
              testID="parent-form-sign-card">
              {isUpload && detail.form.requireSignature ? (
                <GardenSignatureField
                  ref={signatureRef}
                  testID="parent-form-signature-input"
                  value={controller.signerName}
                  onChange={controller.setSignerName}
                  onFocus={scrollSignatureIntoView}
                  onSubmit={feedback.onPrimary}
                  invalid={feedback.signatureInvalid}
                />
              ) : null}

              {builderSignatureField ? (
                <GardenSignatureField
                  ref={signatureRef}
                  testID="parent-form-signature-input"
                  label={builderSignatureField.label}
                  value={String(controller.fieldValues[builderSignatureField.id] ?? '')}
                  onChange={(next) => controller.setFieldValue(builderSignatureField.id, next)}
                  onFocus={scrollSignatureIntoView}
                  onSubmit={feedback.onPrimary}
                  invalid={feedback.signatureInvalid}
                />
              ) : null}

              <View
                style={[styles.hintRow, hasSignatureField && styles.hintSpaced]}
                accessibilityLiveRegion="polite">
                <View
                  style={[
                    styles.hintDot,
                    { backgroundColor: feedback.ready ? Garden.forest : accent.clay },
                  ]}
                />
                <Text style={styles.hint} testID="parent-form-detail-hint">
                  {feedback.hint}
                </Text>
              </View>

              <GToyButton
                testID="parent-form-submit"
                label={controller.submitActionLabel}
                icon={isAcknowledge ? 'checkmark' : 'create-outline'}
                size="md"
                fullWidth
                loading={controller.isSubmitting}
                accessibilityHint={feedback.hint}
                onPress={feedback.onPrimary}
                style={styles.submit}
              />
            </GCard>
          </View>
        ) : null}
      </ParentKeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  padded: { paddingHorizontal: 16, paddingTop: 12, gap: 16 },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 48, gap: 16 },
  flex: { flex: 1, minWidth: 0 },
  signedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 20,
    backgroundColor: Garden.mint,
    padding: 16,
  },
  signedTitle: {
    fontFamily: GardenFonts.display,
    fontSize: 19,
    lineHeight: 24,
    color: Garden.ink,
    letterSpacing: -0.3,
  },
  previewCard: { padding: 0, overflow: 'hidden' },
  noteTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    padding: 14,
  },
  openDoc: { alignSelf: 'flex-start', marginTop: 14 },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hintSpaced: { marginTop: 18 },
  hintDot: { width: 10, height: 10, borderRadius: 5 },
  hint: { flex: 1, fontFamily: GardenFonts.bodyExtra, fontSize: 13.5, color: Garden.ink },
  submit: { marginTop: 14 },
});
