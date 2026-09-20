import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ParentChildRecordWorkspace } from '@/components/parent/children/parent-child-record-workspace';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { useParentHome } from '@/contexts/parent-home-context';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { extractStudentFromResponses } from '@/lib/admissions/apply-system-fields';
import { applicationStatusLabel } from '@/lib/admissions/application-status-ui';
import {
  isParentChildRecordSection,
  type ChildProfileData,
  type ParentChildRecordSection,
} from '@/lib/parent/parent-children-utils';
import { fetchParentChildProfile, type FamilyChildOverview } from '@/lib/parent/parent-portal-api';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type ParentChildDetailScreenProps = {
  slug: string;
  applicationId: string;
  organizationId: string;
  initialSection?: string | null;
  initialEnrollmentItemId?: string | null;
  initialEnrollmentSectionId?: string | null;
};

function resolveInitialSection(section: string | null | undefined): ParentChildRecordSection {
  if (isParentChildRecordSection(section) && section !== 'health') {
    return section;
  }
  return 'application';
}

export function ParentChildDetailScreen({
  slug: _slug,
  applicationId,
  organizationId,
  initialSection,
  initialEnrollmentItemId,
  initialEnrollmentSectionId,
}: ParentChildDetailScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { data: homeData } = useParentHome();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [profile, setProfile] = useState<ChildProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ParentChildRecordSection>(
    resolveInitialSection(initialSection),
  );

  const childOverview = useMemo((): FamilyChildOverview | null => {
    const fromHome =
      homeData?.familyChildren.find((child) => child.applicationId === applicationId) ?? null;
    if (fromHome) return fromHome;
    if (!profile?.application) return null;

    const student = extractStudentFromResponses(profile.application.responses);
    const studentName = student
      ? `${student.firstName} ${student.lastName}`.trim()
      : 'Student';

    return {
      applicationId,
      studentId: profile.application.studentId,
      studentName,
      profilePhotoUrl: profile.application.profilePhotoUrl,
      grade: student?.grade ?? null,
      status: profile.application.status,
      statusLabel: applicationStatusLabel(profile.application.status),
      isEnrolled: profile.application.status === 'enrolled',
      checklistProgress: null,
    };
  }, [applicationId, homeData?.familyChildren, profile?.application]);

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);

    try {
      const loadedProfile = await fetchParentChildProfile(applicationId, organizationId);
      setProfile(loadedProfile);
      setActiveSection(resolveInitialSection(initialSection));
    } catch (error) {
      reportError('parent_children_load_profile', error, {
        entityType: 'application',
        entityId: applicationId,
      });
      setProfileError(
        error instanceof Error ? error.message : 'Failed to load student profile.',
      );
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, [applicationId, initialSection, organizationId, reportError]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handlePhotoUpdated = useCallback((profilePhotoUrl: string) => {
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        application: { ...prev.application, profilePhotoUrl },
      };
    });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: Story.paper }]}>
      <View style={[styles.header, { borderBottomColor: theme.line, backgroundColor: theme.white }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to My children"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
          <Ionicons name="chevron-back" size={20} color={theme.primary} />
          <Text style={[styles.backLabel, { color: theme.primary }]}>My children</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.ink }]}>School record</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {profileLoading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={theme.primary} />
            <Text style={[styles.loadingCopy, { color: theme.muted }]}>Loading profile…</Text>
          </View>
        ) : profileError ? (
          <Text style={[styles.errorCopy, { color: theme.alert }]}>{profileError}</Text>
        ) : profile?.application && childOverview ? (
          <ParentChildRecordWorkspace
            childOverview={childOverview}
            application={profile.application}
            checklist={profile.checklist}
            assignedTeachers={profile.assignedTeachers}
            organizationId={organizationId}
            activeSection={activeSection}
            initialEnrollmentItemId={initialEnrollmentItemId}
            initialEnrollmentSectionId={initialEnrollmentSectionId}
            onSectionChange={setActiveSection}
            onChecklistUpdated={(nextChecklist) => {
              setProfile((prev) => (prev ? { ...prev, checklist: nextChecklist } : prev));
            }}
            onPhotoUpdated={handlePhotoUpdated}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 110,
  },
  backLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  headerTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  headerSpacer: {
    minWidth: 110,
  },
  scrollContent: {
    padding: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
  },
  loadingBlock: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  loadingCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  errorCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
