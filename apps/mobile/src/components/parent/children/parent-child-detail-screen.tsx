import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ChildRecordView } from '@/components/parent/children/garden/child-record-view';
import { ChildRecordSkeleton } from '@/components/parent/children/garden/parent-children-garden-skeleton';
import { GCelebrate } from '@/components/parent/garden/celebrate';
import { GBackHeader } from '@/components/parent/garden/back-header';
import { useGardenPullRefresh } from '@/components/parent/garden/feedback';
import { Garden, useGardenAccent } from '@/components/parent/garden/tokens';
import { GErrorCard } from '@/components/parent/garden/ui';
import { useParentHome } from '@/contexts/parent-home-context';
import { extractStudentFromResponses } from '@/lib/admissions/apply-system-fields';
import { applicationStatusLabel } from '@/lib/admissions/application-status-ui';
import {
  childFirstName,
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
  return isParentChildRecordSection(section) ? section : 'application';
}

/** One child's school record, pushed from deep links (health, pickup, a checklist item…). */
export function ParentChildDetailScreen({
  applicationId,
  organizationId,
  initialSection,
  initialEnrollmentItemId,
  initialEnrollmentSectionId,
}: ParentChildDetailScreenProps) {
  const router = useRouter();
  const accent = useGardenAccent();
  const { data: homeData, refresh: refreshHome } = useParentHome();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [profile, setProfile] = useState<ChildProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ParentChildRecordSection>(
    resolveInitialSection(initialSection),
  );
  const [celebrationKey, setCelebrationKey] = useState<string | null>(null);

  const childOverview = useMemo((): FamilyChildOverview | null => {
    const fromHome = homeData?.familyChildren.find((c) => c.applicationId === applicationId) ?? null;
    if (fromHome) return fromHome;
    if (!profile?.application) return null;
    const student = extractStudentFromResponses(profile.application.responses);
    return {
      applicationId,
      studentId: profile.application.studentId,
      studentName: student ? `${student.firstName} ${student.lastName}`.trim() : 'Student',
      profilePhotoUrl: profile.application.profilePhotoUrl,
      grade: student?.grade ?? null,
      status: profile.application.status,
      statusLabel: applicationStatusLabel(profile.application.status),
      isEnrolled: profile.application.status === 'enrolled',
      checklistProgress: null,
    };
  }, [applicationId, homeData?.familyChildren, profile?.application]);

  const loadProfile = useCallback(
    async (resetSection = true) => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const loaded = await fetchParentChildProfile(applicationId, organizationId);
        setProfile(loaded);
        if (resetSection) setActiveSection(resolveInitialSection(initialSection));
      } catch (error) {
        reportError('parent_children_load_profile', error, {
          entityType: 'application',
          entityId: applicationId,
        });
        setProfileError(error instanceof Error ? error.message : 'Failed to load student profile.');
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    },
    [applicationId, initialSection, organizationId, reportError],
  );

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const refresh = useCallback(async () => {
    await Promise.all([loadProfile(false), refreshHome()]);
  }, [loadProfile, refreshHome]);

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh,
    error: profileError,
    label: 'School record',
    id: 'child-record-refresh',
  });

  const onCelebrate = useCallback((key: string) => setCelebrationKey(key), []);
  const firstName = childOverview ? childFirstName(childOverview.studentName) : null;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={pullRefreshing}
            onRefresh={() => void onPullRefresh()}
            tintColor={accent.clay}
          />
        }>
        <GBackHeader
          backLabel="My children"
          backAccessibilityLabel="Back to My children"
          onBack={() => router.back()}
          title={firstName ? `${firstName}'s record` : 'School record'}
          accentWord={firstName}
        />
        {profileLoading && !profile ? (
          <ChildRecordSkeleton />
        ) : profileError && !profile ? (
          <GErrorCard
            title="We couldn't load this record"
            message={`${profileError} Check your connection, then try again.`}
            onRetry={() => void loadProfile()}
          />
        ) : profile?.application && childOverview ? (
          <ChildRecordView
            profile={profile}
            showOverview={false}
            childOverview={childOverview}
            organizationId={organizationId}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            initialEnrollmentItemId={initialEnrollmentItemId}
            initialEnrollmentSectionId={initialEnrollmentSectionId}
            onChecklistUpdated={(next) => setProfile((prev) => (prev ? { ...prev, checklist: next } : prev))}
            onPhotoUpdated={(url) =>
              setProfile((prev) =>
                prev ? { ...prev, application: { ...prev.application, profilePhotoUrl: url } } : prev,
              )
            }
            refresh={refreshHome}
            onCelebrate={onCelebrate}
          />
        ) : null}
      </ScrollView>
      {celebrationKey ? <GCelebrate active celebrationKey={celebrationKey} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 48, gap: 16 },
});
