import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import SchoolParentComingSoon from "@/components/school-parent/SchoolParentComingSoon";
import SchoolParentPageShell from "@/components/school-parent/SchoolParentPageShell";
import ParentCalendarPageShell from "@/components/school-parent/calendar/ParentCalendarPageShell";
import ParentCalendarPreviewEventsLoader from "@/components/school-parent/calendar/ParentCalendarPreviewEventsLoader";
import ParentHomePageShell from "@/components/school-parent/home/ParentHomePageShell";
import ParentHomePreviewContentLoader from "@/components/school-parent/home/ParentHomePreviewContentLoader";
import ParentMessagesPage from "@/components/school-parent/ParentMessagesPage";
import ParentChildrenPage from "@/components/school-parent/ParentChildrenPage";
import ParentCurriculumPage from "@/components/school-parent/curriculum/ParentCurriculumPage";
import {
  familyPreviewBasePath,
  familyPreviewParentBasePath,
  familyPreviewProgramParentPath,
  listFamilyChildrenForHomeByFamilyId,
} from "@/lib/admissions/family-preview-access";
import { loadProgramParentPortalContext } from "@/lib/admissions/program-parent-portal-access";
import { getFamilyPreviewProfile } from "@/lib/admissions/family-preview-server-cache";
import { loadParentMessagesPreviewInbox } from "@/lib/messages/parent-messages";
import { buildParentQuickActions } from "@/lib/organization-settings/parent-home";
import { getParentPageLabel } from "@/lib/organization-settings/parent-nav";
import {
  getEnabledFeatureNavChildren,
  mergePortalFeatureNav,
} from "@/lib/organization-settings/feature-nav";
import { isParentFeatureEnabled } from "@/lib/organization-settings/parent-routes";
import { fetchParentPortalHomeMetaFromRpc } from "@/lib/parent-portal/parent-portal-home-meta";
import { listUpcomingEventsForOrg } from "@/lib/school-events/events";
import {
  mainPortalAudienceScope,
  programPortalAudienceScope,
} from "@/lib/school-events/event-audience";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { loadHomeBulletinPosts } from "@/lib/school-bulletin/posts";
import { filterFamilyChildrenForProgramPortal } from "@/components/school-parent/children/parent-children-utils";
import { loadStudentHealthProfilesForStudents } from "@/lib/student-health/load-student-health-profile";
import { listProgramCoopCurriculumDiscussionMessages } from "@/lib/admissions/program-coop-curriculum-discussion";
import { getProgramCoopCurriculum } from "@/lib/admissions/program-coop-curriculum-storage";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; familyId: string; programSlug: string; feature: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, familyId, programSlug, feature } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);
  const previewParentBasePath = familyPreviewParentBasePath(slug, familyId);
  const programContext = org
    ? await loadProgramParentPortalContext({
        supabase,
        organizationId: org.id,
        schoolSlug: slug,
        programSlug,
        orgFeatures: org.features,
        previewParentBasePath,
      })
    : null;

  if (
    !org ||
    !programContext ||
    !isParentFeatureEnabled(programContext.effectiveFeatures, feature)
  ) {
    return { title: "Preview Not Found" };
  }

  const pageName = getParentPageLabel(
    feature,
    programContext.effectiveFeatures.feature_nav?.parent,
  );

  return {
    title: `${pageName} · ${org.name} Parent Preview`,
  };
}

export default async function FamilyPreviewProgramParentFeaturePage({
  params,
}: PageProps) {
  const { slug, familyId, programSlug, feature } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  const previewBasePath = familyPreviewBasePath(slug, familyId);
  const previewParentBasePath = familyPreviewParentBasePath(slug, familyId);
  const programContext = await loadProgramParentPortalContext({
    supabase,
    organizationId: org.id,
    schoolSlug: slug,
    programSlug,
    orgFeatures: org.features,
    previewParentBasePath,
  });

  if (
    !programContext ||
    !isParentFeatureEnabled(programContext.effectiveFeatures, feature)
  ) {
    notFound();
  }

  const features = programContext.effectiveFeatures;
  const portalNav = mergePortalFeatureNav("parent", features.feature_nav?.parent);
  const children = getEnabledFeatureNavChildren("parent", feature, portalNav);

  if (children.length > 0) {
    redirect(
      familyPreviewProgramParentPath(
        slug,
        familyId,
        programSlug,
        feature,
        children[0].key,
      ),
    );
  }

  const pageName = getParentPageLabel(feature, features.feature_nav?.parent);
  const userProfile = await getFamilyPreviewProfile(supabase, org.id, familyId);
  const admin = createAdminClient();

  if (feature === "portal") {
    const bulletinEnabled = Boolean(org.features.admin?.bulletin);
    const [upcomingEvents, homeMeta, bulletinPosts] = await Promise.all([
      listUpcomingEventsForOrg(
        admin,
        org.id,
        3,
        programPortalAudienceScope(programContext.programId),
      ),
      fetchParentPortalHomeMetaFromRpc(supabase, org.id, familyId),
      loadHomeBulletinPosts({
        supabase: admin,
        signedUrlClient: admin,
        organizationId: org.id,
        bulletinEnabled,
        viewer: "parent",
        programId: programContext.programId,
      }),
    ]);
    const quickActions = buildParentQuickActions(
      slug,
      features,
      programContext.parentNavBasePath,
    );

    return (
      <SchoolParentPageShell title={pageName}>
        <ParentHomePageShell
          branding={org.branding}
          schoolSlug={slug}
          organizationId={org.id}
          familyId={familyId}
          userProfile={userProfile}
          quickActions={quickActions}
          upcomingEvents={upcomingEvents}
          homeMeta={homeMeta}
          previewMode
          previewBasePath={previewBasePath}
          programPortalLabel={programContext.displayLabel}
          programId={programContext.programId}
          schoolName={org.name}
          coopModeEnabled={programContext.coopMode}
          bulletinEnabled={bulletinEnabled}
          bulletinPosts={bulletinPosts}
        >
          <Suspense fallback={null}>
            <ParentHomePreviewContentLoader
              organizationId={org.id}
              familyId={familyId}
              slug={slug}
              features={features}
              previewBasePath={programContext.parentNavBasePath}
              programId={programContext.programId}
              coopModeEnabled={programContext.coopMode}
            />
          </Suspense>
        </ParentHomePageShell>
      </SchoolParentPageShell>
    );
  }

  if (feature === "messages") {
    const { data: guardian } = await admin
      .from("guardians")
      .select("user_id")
      .eq("organization_id", org.id)
      .eq("family_id", familyId)
      .not("user_id", "is", null)
      .limit(1)
      .maybeSingle();

    const previewUserId =
      guardian?.user_id != null ? String(guardian.user_id) : "preview-user";

    const initialInbox = await loadParentMessagesPreviewInbox(
      admin,
      org.id,
      familyId,
      org.name,
      previewUserId,
      { programId: programContext.programId },
    );

    return (
      <SchoolParentPageShell title={pageName} layout="embedded">
        <ParentMessagesPage
          organizationId={org.id}
          organizationSlug={slug}
          schoolName={org.name}
          branding={org.branding}
          familyId={familyId}
          guardianId={initialInbox.guardianId}
          programId={programContext.programId}
          previewMode
          initialInbox={initialInbox}
        />
      </SchoolParentPageShell>
    );
  }

  if (feature === "calendar") {
    const calendarAudienceScope = programPortalAudienceScope(
      programContext.programId,
    );
    return (
      <SchoolParentPageShell title={pageName} layout="embedded">
        <ParentCalendarPageShell
          organizationId={org.id}
          organizationSlug={slug}
          branding={org.branding}
          previewMode
          programId={programContext.programId}
        >
          <Suspense fallback={null}>
            <ParentCalendarPreviewEventsLoader
              organizationId={org.id}
              audienceScope={calendarAudienceScope}
            />
          </Suspense>
        </ParentCalendarPageShell>
      </SchoolParentPageShell>
    );
  }

  if (feature === "children") {
    const allFamilyChildren = await listFamilyChildrenForHomeByFamilyId(
      admin,
      org.id,
      familyId,
    );
    const familyChildren = filterFamilyChildrenForProgramPortal(
      allFamilyChildren,
      programContext.programId,
    );

    const studentIds = familyChildren
      .map((child) => child.studentId)
      .filter((studentId): studentId is string => Boolean(studentId));

    const initialHealthProfiles =
      studentIds.length > 0
        ? await loadStudentHealthProfilesForStudents(admin, org.id, studentIds)
        : {};

    return (
      <SchoolParentPageShell title={pageName}>
        <ParentChildrenPage
          branding={org.branding}
          schoolName={org.name}
          schoolSlug={slug}
          organizationId={org.id}
          familyChildren={familyChildren}
          userProfile={userProfile}
          initialHealthProfiles={initialHealthProfiles}
          previewBasePath={previewBasePath}
          previewMode
          programPortalLabel={programContext.displayLabel}
        />
      </SchoolParentPageShell>
    );
  }

  if (feature === "curriculum") {
    if (!programContext.coopMode) {
      notFound();
    }

    const { data: previewGuardian } = await admin
      .from("guardians")
      .select("id")
      .eq("organization_id", org.id)
      .eq("family_id", familyId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const [curriculum, discussionMessages] = await Promise.all([
      getProgramCoopCurriculum(admin, programContext.programId),
      listProgramCoopCurriculumDiscussionMessages(admin, {
        organizationId: org.id,
        programId: programContext.programId,
      }),
    ]);

    return (
      <SchoolParentPageShell title={pageName} layout="embedded">
        <ParentCurriculumPage
          organizationId={org.id}
          programId={programContext.programId}
          curriculum={curriculum}
          initialDiscussionMessages={discussionMessages}
          currentGuardianId={previewGuardian?.id ? String(previewGuardian.id) : null}
          previewMode
        />
      </SchoolParentPageShell>
    );
  }

  return (
    <SchoolParentPageShell title={pageName}>
      <SchoolParentComingSoon
        branding={org.branding}
        schoolSlug={slug}
        schoolName={org.name}
        organizationId={org.id}
        featureKey={feature}
        featureLabel={pageName}
        userProfile={userProfile}
      />
    </SchoolParentPageShell>
  );
}
