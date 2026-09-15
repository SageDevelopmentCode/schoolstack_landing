import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ParentClassroomSignupResponseForm } from '@/components/parent/classroom-signups/parent-classroom-signup-response-form';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentClassroomSignups } from '@/contexts/parent-classroom-signups-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type {
  ClassroomSignup,
  ClassroomSignupResponse,
  ParentClassroomSignupStudentOption,
} from '@/lib/parent/parent-classroom-signups-types';
import { SIGNUP_TYPE_LABELS } from '@/lib/parent/parent-classroom-signups-types';
import { formatSignupDeadline } from '@/lib/parent/parent-classroom-signups-utils';
import { fetchParentClassroomSignupDetail } from '@/lib/parent/parent-portal-api';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type ParentClassroomSignupDetailScreenProps = {
  slug: string;
  organizationId: string;
  signupId: string;
};

export function ParentClassroomSignupDetailScreen({
  slug: _slug,
  organizationId,
  signupId,
}: ParentClassroomSignupDetailScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { applySubmittedResponse, applyWithdrawnResponse } = useParentClassroomSignups();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [signup, setSignup] = useState<ClassroomSignup | null>(null);
  const [responses, setResponses] = useState<ClassroomSignupResponse[]>([]);
  const [familyResponse, setFamilyResponse] = useState<ClassroomSignupResponse | null>(null);
  const [studentOptions, setStudentOptions] = useState<ParentClassroomSignupStudentOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const detail = await fetchParentClassroomSignupDetail(organizationId, signupId);
      setSignup(detail.signup);
      setResponses(detail.responses);
      setFamilyResponse(detail.familyResponse);
      setStudentOptions(detail.studentOptions);
    } catch (loadError) {
      reportError('classroom_signups.detail', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Failed to load signup.');
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, reportError, signupId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const hasConfirmedResponse = familyResponse?.status === 'confirmed';
  const canViewClosedSignup = signup?.status === 'closed' && hasConfirmedResponse;
  const canRespond = signup?.status === 'open';
  const canShowContent = signup && (canRespond || canViewClosedSignup);
  const formReadOnly = signup?.status === 'closed';
  const deadline = signup ? formatSignupDeadline(signup.responseDeadline) : null;

  const handleSubmitted = useCallback(
    (response: ClassroomSignupResponse, allResponses: ClassroomSignupResponse[]) => {
      setFamilyResponse(response);
      setResponses(allResponses);
      applySubmittedResponse(signupId, response);
    },
    [applySubmittedResponse, signupId],
  );

  const handleWithdrawn = useCallback(
    (_familyId: string, allResponses: ClassroomSignupResponse[]) => {
      setFamilyResponse(null);
      setResponses(allResponses);
      applyWithdrawnResponse(signupId);
    },
    [applyWithdrawnResponse, signupId],
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
        <Ionicons name="chevron-back" size={20} color={theme.primary} />
        <Text style={[styles.backLabel, { color: theme.primary }]}>Classroom signups</Text>
      </Pressable>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : error ? (
        <StoryErrorBanner message={error} />
      ) : signup ? (
        <>
          <View style={styles.header}>
            <StorySectionKicker>Help in the classroom</StorySectionKicker>
            <StoryDisplayHeading size="display">{signup.title}</StoryDisplayHeading>
            <Text style={[styles.meta, { color: theme.muted }]}>
              From {signup.teacherName}
              {signup.classroomName ? ` · ${signup.classroomName}` : ''}
            </Text>
          </View>

          {!canShowContent ? (
            <Text style={[styles.body, { color: theme.ink }]}>
              This signup is no longer accepting responses.
            </Text>
          ) : (
            <>
              <View style={styles.metaRow}>
                <Text style={[styles.metaDetail, { color: theme.muted }]}>
                  {SIGNUP_TYPE_LABELS[signup.signupType]}
                </Text>
                {deadline ? (
                  <Text style={[styles.metaDetail, { color: theme.muted }]}>
                    Sign up by {deadline}
                  </Text>
                ) : null}
              </View>

              <Text style={[styles.description, { color: '#5D6D73' }]}>{signup.description}</Text>

              <View style={styles.formSection}>
                <Text style={[styles.formHeading, { color: theme.ink }]}>
                  {formReadOnly ? 'Your signup' : 'Your response'}
                </Text>
                <ParentClassroomSignupResponseForm
                  organizationId={organizationId}
                  signup={signup}
                  existingResponse={familyResponse}
                  allResponses={responses}
                  studentOptions={studentOptions}
                  readOnly={formReadOnly}
                  onSubmitted={handleSubmitted}
                  onWithdrawn={handleWithdrawn}
                />
              </View>
            </>
          )}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
  },
  backLabel: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 15,
    fontWeight: '500',
  },
  loading: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
  },
  header: {
    gap: 4,
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  metaDetail: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  body: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  description: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 22,
  },
  formSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Story.line,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  formHeading: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 14,
    fontWeight: '600',
  },
});
