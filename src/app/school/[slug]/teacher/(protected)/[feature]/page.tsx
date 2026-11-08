import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import type { ComponentType } from "react";
import SchoolTeacherComingSoon from "@/components/school-teacher/SchoolTeacherComingSoon";
import TeacherFeaturePageFallback from "@/components/school-teacher/TeacherFeaturePageFallback";
import { getTeacherPageLabel } from "@/lib/organization-settings/teacher-nav";
import { isTeacherFeatureEnabled } from "@/lib/organization-settings/teacher-routes";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { loadTeacherMessagesPageData } from "@/lib/messages/load-messages-page-data";
import { loadTeacherMyStudentsPageData } from "@/lib/school-teacher/load-my-students-page-data";
import { loadTeacherDashboardInitialData } from "@/lib/school-teacher/load-teacher-dashboard-data";
import { loadTeacherCalendarInitialData } from "@/lib/school-events/load-teacher-calendar-data";
import { loadTeacherCommitteesInitialData } from "@/lib/committees/load-teacher-committees-data";
import { loadTeacherClassroomSignupsPageData } from "@/lib/classroom-signups/load-classroom-signups-page-data";
import {
  emptyTeacherMyHoursPageData,
  loadTeacherMyHoursPageData,
} from "@/lib/school-teacher/my-hours/load-teacher-my-hours-data";
import { loadTeacherFormsDocumentsPageData } from "@/lib/school-teacher/forms-documents/load-forms-documents-page-data";
import { getStaffPortalRoleForUser } from "@/lib/staff/teacher-portal-access";
import {
  getCachedStaffMemberIdForUser,
  getCachedStaffUserProfile,
  getTeacherPortalPageUser,
} from "@/lib/staff/teacher-portal-access-request";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { isSchoolGalleryEnabled } from "@/lib/school-gallery/gallery-enabled";
import { isSchoolGalleryFeatureKey } from "@/lib/school-gallery/gallery-nav";

const dynamicFeaturePage = <P extends object>(
  importer: () => Promise<{ default: ComponentType<P> }>,
) => nextDynamic(importer, { loading: () => <TeacherFeaturePageFallback /> });

const TeacherDashboardPage = dynamicFeaturePage(
  () => import("@/components/school-teacher/TeacherDashboardPage"),
);

const TeacherMyStudentsPage = dynamicFeaturePage(
  () => import("@/components/school-teacher/TeacherMyStudentsPage"),
);

const TeacherMessagesPage = dynamicFeaturePage(
  () => import("@/components/school-teacher/TeacherMessagesPage"),
);

const SchoolGalleryPage = dynamicFeaturePage(
  () => import("@/components/school-gallery/SchoolGalleryPage"),
);

const TeacherCalendarPage = dynamicFeaturePage(
  () => import("@/components/school-teacher/TeacherCalendarPage"),
);

const TeacherClassroomSignupsPage = dynamicFeaturePage(
  () =>
    import(
      "@/components/classroom-signups/teacher/TeacherClassroomSignupsPage"
    ),
);

const TeacherFormsDocumentsPage = dynamicFeaturePage(
  () =>
    import(
      "@/components/school-teacher/forms-documents/TeacherFormsDocumentsPage"
    ),
);

const TeacherAttendancePage = dynamicFeaturePage(
  () => import("@/components/school-teacher/TeacherAttendancePage"),
);

const TeacherCommitteesPage = dynamicFeaturePage(
  () => import("@/components/school-teacher/committees/TeacherCommitteesPage"),
);

const TeacherMyHoursPage = dynamicFeaturePage(
  () => import("@/components/school-teacher/my-hours/TeacherMyHoursPage"),
);

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; feature: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, feature } = await params;
  const org = await fetchOrganizationWithSettings(slug);

  if (!org) {
    return { title: "School Not Found" };
  }

  if (isSchoolGalleryFeatureKey(feature)) {
    if (!isSchoolGalleryEnabled(org.features)) {
      return { title: "School Not Found" };
    }
    return {
      title: `Photos · ${org.name} Staff`,
    };
  }

  if (!isTeacherFeatureEnabled(org.features, feature)) {
    return { title: "School Not Found" };
  }

  const pageName = getTeacherPageLabel(
    feature,
    org.features.feature_nav?.teacher,
  );

  return {
    title: `${pageName} · ${org.name} Staff`,
  };
}

export default async function SchoolTeacherFeaturePage({
  params,
  searchParams,
}: PageProps) {
  const { slug, feature } = await params;
  const resolvedSearchParams = await searchParams;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(slug);

  if (!org) {
    notFound();
  }

  if (isSchoolGalleryFeatureKey(feature)) {
    if (!isSchoolGalleryEnabled(org.features)) {
      notFound();
    }
    const user = await getTeacherPortalPageUser(org.id);
    return (
      <div className="mx-auto max-w-[1200px] px-[clamp(20px,4vw,48px)] py-8">
        <h1 className="mb-6 text-2xl font-semibold text-[#1F2A2E]">Photos</h1>
        <SchoolGalleryPage
          organizationId={org.id}
          slug={slug}
          portal="teacher"
          readOnly={false}
          currentUserId={user.id}
          branding={org.branding}
        />
      </div>
    );
  }

  if (!isTeacherFeatureEnabled(org.features, feature)) {
    notFound();
  }

  const pageName = getTeacherPageLabel(
    feature,
    org.features.feature_nav?.teacher,
  );

  if (feature === "dashboard") {
    const user = await getTeacherPortalPageUser(org.id);
    const staffMemberIdPromise = getCachedStaffMemberIdForUser(user.id, org.id);

    const [userProfile, staffMember, portalRole, staffMemberId, initialSummary] =
      await Promise.all([
        getCachedStaffUserProfile(user.id, org.id),
        supabase
          .from("staff_members")
          .select("role_title")
          .eq("organization_id", org.id)
          .eq("user_id", user.id)
          .maybeSingle(),
        getStaffPortalRoleForUser(supabase, user.id, org.id),
        staffMemberIdPromise,
        staffMemberIdPromise.then((staffMemberId) =>
          loadTeacherDashboardInitialData({
            organizationId: org.id,
            slug,
            features: org.features,
            userId: user.id,
            schoolName: org.name,
            staffMemberId,
          }),
        ),
      ]);

    return (
      <TeacherDashboardPage
        organizationId={org.id}
        slug={slug}
        schoolName={org.name}
        branding={org.branding}
        features={org.features}
        userProfile={userProfile}
        roleTitle={
          typeof staffMember.data?.role_title === "string"
            ? staffMember.data.role_title
            : null
        }
        portalRole={portalRole}
        initialSummary={initialSummary}
      />
    );
  }

  if (feature === "my_students") {
    const user = await getTeacherPortalPageUser(org.id);
    const initialData = await loadTeacherMyStudentsPageData(org.id, user.id);

    return (
      <TeacherMyStudentsPage
        organizationId={org.id}
        branding={org.branding}
        slug={slug}
        staffMemberId={initialData.staffMemberId}
        initialStudents={initialData.students}
        initialClassrooms={initialData.staffClassrooms}
      />
    );
  }

  if (feature === "messages") {
    const user = await getTeacherPortalPageUser(org.id);
    const staffMemberId = await getCachedStaffMemberIdForUser(user.id, org.id);
    const admin = createAdminClient();
    const initialInbox = staffMemberId
      ? await loadTeacherMessagesPageData(
          admin,
          org.id,
          user.id,
          staffMemberId,
          org.name,
        )
      : { threads: [], contacts: [] };

    return (
      <TeacherMessagesPage
        organizationId={org.id}
        organizationSlug={slug}
        schoolName={org.name}
        branding={org.branding}
        staffMemberId={staffMemberId}
        initialInbox={initialInbox}
      />
    );
  }

  if (feature === "calendar") {
    const user = await getTeacherPortalPageUser(org.id);
    const initialData = await loadTeacherCalendarInitialData({
      organizationId: org.id,
      userId: user.id,
    });

    return (
      <TeacherCalendarPage
        branding={org.branding}
        initialData={initialData}
        organizationId={org.id}
      />
    );
  }

  if (feature === "forms_documents") {
    const user = await getTeacherPortalPageUser(org.id);
    const staffMemberId = await getCachedStaffMemberIdForUser(user.id, org.id);
    const admin = createAdminClient();
    const pageData =
      staffMemberId != null
        ? await loadTeacherFormsDocumentsPageData(admin, org.id, staffMemberId)
        : { forms: [], responsesByFormId: {}, classroomOptions: [] };

    return (
      <TeacherFormsDocumentsPage
        organizationId={org.id}
        slug={slug}
        staffMemberId={staffMemberId}
        initialForms={pageData.forms}
        initialResponsesByFormId={pageData.responsesByFormId}
        classroomOptions={pageData.classroomOptions}
      />
    );
  }

  if (feature === "attendance") {
    await getTeacherPortalPageUser(org.id);

    return (
      <TeacherAttendancePage
        organizationId={org.id}
        branding={org.branding}
        slug={slug}
      />
    );
  }

  if (feature === "committees") {
    const user = await getTeacherPortalPageUser(org.id);
    const selectedCommitteeId =
      typeof resolvedSearchParams.committee === "string"
        ? resolvedSearchParams.committee
        : null;
    const [userProfile, initialData] = await Promise.all([
      getCachedStaffUserProfile(user.id, org.id),
      loadTeacherCommitteesInitialData({
        organizationId: org.id,
        userId: user.id,
        selectedCommitteeId,
      }),
    ]);
    const staffName = userProfile.displayName || user.email || "Staff member";

    return (
      <TeacherCommitteesPage
        organizationId={org.id}
        schoolSlug={slug}
        schoolName={org.name}
        branding={org.branding}
        staffName={staffName}
        initialData={initialData}
      />
    );
  }

  if (feature === "classroom_signups") {
    const user = await getTeacherPortalPageUser(org.id);
    const [userProfile, staffMemberId] = await Promise.all([
      getCachedStaffUserProfile(user.id, org.id),
      getCachedStaffMemberIdForUser(user.id, org.id),
    ]);

    const admin = createAdminClient();
    const pageData =
      staffMemberId != null
        ? await loadTeacherClassroomSignupsPageData(admin, org.id, staffMemberId)
        : {
            signups: [],
            responsesBySignupId: {},
            classroomOptions: [],
            assignedFamilyCount: 0,
          };

    return (
      <TeacherClassroomSignupsPage
        slug={slug}
        organizationId={org.id}
        teacherName={userProfile.displayName}
        staffMemberId={staffMemberId}
        initialSignups={pageData.signups}
        initialResponsesBySignupId={pageData.responsesBySignupId}
        classroomOptions={pageData.classroomOptions}
        assignedFamilyCount={pageData.assignedFamilyCount}
      />
    );
  }

  if (feature === "my_hours") {
    const user = await getTeacherPortalPageUser(org.id);
    const staffMemberId = await getCachedStaffMemberIdForUser(user.id, org.id);

    const admin = createAdminClient();
    const initialData =
      staffMemberId != null
        ? await loadTeacherMyHoursPageData(admin, org.id, staffMemberId)
        : emptyTeacherMyHoursPageData("America/Denver");

    return (
      <TeacherMyHoursPage
        branding={org.branding}
        organizationId={org.id}
        slug={slug}
        initialData={initialData}
      />
    );
  }

  return (
    <SchoolTeacherComingSoon branding={org.branding} featureLabel={pageName} />
  );
}
