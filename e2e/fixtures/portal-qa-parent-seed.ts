import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createProgram } from "@/lib/admissions/programs";
import { insertProgramCoopSupplyItem } from "@/lib/admissions/program-coop-supply-list-storage";
import { insertProgramCoopTeachingScheduleWeek } from "@/lib/admissions/program-coop-teaching-schedule-storage";
import { newCoopTeachingScheduleWeek } from "@/lib/admissions/program-coop-teaching-schedule-mock";
import { E2E_PARENT_EMAIL, E2E_STAFF_EMAIL } from "./constants";

const E2E_COOP_PROGRAM_NAME = "E2E Co-op Program";
const E2E_COOP_PORTAL_SLUG = "e2e-coop";
const E2E_CLASSROOM_SIGNUP_TITLE = "E2E Classroom Volunteer Signup";
const E2E_PARENT_FORM_TITLE = "E2E Parent Portal Form";
const E2E_FRIDAY_CLASS_NAME = "E2E Friday Branch Class";

export type PortalQaParentSeedResult = {
  programs: { coop: { id: string; slug: string } };
  classroomSignups: { openSignupId: string };
  parentPublishedFormId: string;
  fridayBranch: { classId: string };
};

async function getFamilyIdByParentEmail(
  admin: SupabaseClient,
  organizationId: string,
  email: string,
): Promise<string> {
  const { data, error } = await admin
    .from("families")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("primary_email", email)
    .maybeSingle();
  if (error) throw error;
  if (!data?.id) {
    throw new Error(`E2E family not found for ${email}`);
  }
  return String(data.id);
}

async function getStaffMemberId(
  admin: SupabaseClient,
  organizationId: string,
  staffEmail: string,
): Promise<string> {
  const { data, error } = await admin
    .from("staff_members")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("email", staffEmail)
    .maybeSingle();
  if (error) throw error;
  if (!data?.id) {
    throw new Error(`E2E staff member not found for ${staffEmail}`);
  }
  return String(data.id);
}

async function getEnrolledStudentForFamily(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
  schoolProgramId: string,
): Promise<string> {
  const { data: students, error: studentsError } = await admin
    .from("students")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("family_id", familyId)
    .limit(1);
  if (studentsError) throw studentsError;
  const studentId = students?.[0]?.id as string | undefined;
  if (!studentId) {
    throw new Error("E2E parent family has no student for portal QA seed.");
  }

  const { data: enrollment, error: enrollmentError } = await admin
    .from("enrollments")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("student_id", studentId)
    .eq("program_id", schoolProgramId)
    .eq("status", "enrolled")
    .maybeSingle();
  if (enrollmentError) throw enrollmentError;
  if (!enrollment?.id) {
    throw new Error("E2E student is not enrolled — run ensureE2eParentEnrolledAccess first.");
  }

  return studentId;
}

async function ensureE2eCoopProgram(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
  studentId: string,
): Promise<{ id: string; slug: string }> {
  const { data: existing, error: lookupError } = await admin
    .from("programs")
    .select("id, portal_slug")
    .eq("organization_id", organizationId)
    .eq("portal_slug", E2E_COOP_PORTAL_SLUG)
    .maybeSingle();
  if (lookupError) throw lookupError;

  let programId = existing?.id as string | undefined;
  let portalSlug = existing?.portal_slug as string | undefined;

  if (!programId) {
    const program = await createProgram(admin, organizationId, {
      name: E2E_COOP_PROGRAM_NAME,
      type: "school_year",
      status: "open",
      parent_portal_settings: {
        mode: "isolated",
        coop_mode: true,
        label: "E2E Co-op",
        features: {
          portal: true,
          curriculum: true,
          supply_list: true,
          teaching_schedule: true,
        },
      },
    });
    programId = program.id;
    portalSlug = program.portal_slug;

    const { error: slugError } = await admin
      .from("programs")
      .update({ portal_slug: E2E_COOP_PORTAL_SLUG })
      .eq("id", programId);
    if (slugError) throw slugError;
    portalSlug = E2E_COOP_PORTAL_SLUG;
  }

  const { data: existingEnrollment, error: enrollmentLookupError } = await admin
    .from("enrollments")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("student_id", studentId)
    .eq("program_id", programId)
    .maybeSingle();
  if (enrollmentLookupError) throw enrollmentLookupError;

  if (!existingEnrollment?.id) {
    const { error: enrollmentInsertError } = await admin.from("enrollments").insert({
      organization_id: organizationId,
      student_id: studentId,
      program_id: programId,
      status: "enrolled",
    });
    if (enrollmentInsertError) throw enrollmentInsertError;
  }

  const ctx = { organizationId, programId };
  const { count: curriculumCount, error: curriculumCountError } = await admin
    .from("program_coop_curriculum")
    .select("id", { count: "exact", head: true })
    .eq("program_id", programId);
  if (curriculumCountError) throw curriculumCountError;
  if ((curriculumCount ?? 0) === 0) {
    const { error: curriculumError } = await admin.from("program_coop_curriculum").insert({
      program_id: programId,
      organization_id: organizationId,
      storage_path: `${organizationId}/${programId}/e2e-curriculum-guide.pdf`,
      file_name: "e2e-curriculum-guide.pdf",
      file_size_bytes: 1024,
      display_name: "E2E Curriculum Guide",
      sort_order: 0,
    });
    if (curriculumError) throw curriculumError;
  }

  const { count: supplyCount, error: supplyCountError } = await admin
    .from("program_coop_supply_items")
    .select("id", { count: "exact", head: true })
    .eq("program_id", programId);
  if (supplyCountError) throw supplyCountError;
  if ((supplyCount ?? 0) === 0) {
    await insertProgramCoopSupplyItem(admin, ctx, {
      name: "E2E Paper towels",
      quantityLabel: "2 rolls",
    });
  }

  const { count: weekCount, error: weekCountError } = await admin
    .from("program_coop_teaching_schedule_weeks")
    .select("id", { count: "exact", head: true })
    .eq("program_id", programId);
  if (weekCountError) throw weekCountError;
  if ((weekCount ?? 0) === 0) {
    await insertProgramCoopTeachingScheduleWeek(admin, ctx, {
      ...newCoopTeachingScheduleWeek(),
      weekName: "E2E Teaching Week",
      startDate: "2026-09-01",
      endDate: "2026-09-05",
      seasonalTheme: "Portal QA co-op week",
      characterLesson: "Community",
    });
  }

  return { id: programId, slug: portalSlug ?? E2E_COOP_PORTAL_SLUG };
}

async function ensureE2eClassroomSignup(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  studentId: string,
): Promise<string> {
  const { data: existing, error: lookupError } = await admin
    .from("classroom_signups")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("title", E2E_CLASSROOM_SIGNUP_TITLE)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing?.id) return String(existing.id);

  const { data: existingAssignment, error: assignmentLookupError } = await admin
    .from("student_teacher_assignments")
    .select("id")
    .eq("student_id", studentId)
    .eq("staff_member_id", staffMemberId)
    .maybeSingle();
  if (assignmentLookupError) throw assignmentLookupError;
  if (!existingAssignment?.id) {
    const { error: insertAssignmentError } = await admin
      .from("student_teacher_assignments")
      .insert({
        organization_id: organizationId,
        staff_member_id: staffMemberId,
        student_id: studentId,
      });
    if (insertAssignmentError) throw insertAssignmentError;
  }

  const now = new Date().toISOString();
  const { data: signup, error: signupError } = await admin
    .from("classroom_signups")
    .insert({
      organization_id: organizationId,
      created_by_staff_member_id: staffMemberId,
      title: E2E_CLASSROOM_SIGNUP_TITLE,
      description: "E2E open volunteer signup for portal QA.",
      signup_type: "open",
      audience: "assigned",
      status: "open",
      published_at: now,
      config: {},
    })
    .select("id")
    .single();
  if (signupError) throw signupError;
  return String(signup.id);
}

async function ensureE2eParentPublishedForm(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  familyId: string,
): Promise<string> {
  const { data: existing, error: lookupError } = await admin
    .from("teacher_parent_forms")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("title", E2E_PARENT_FORM_TITLE)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing?.id) return String(existing.id);

  const now = new Date().toISOString();
  const { data: form, error: formError } = await admin
    .from("teacher_parent_forms")
    .insert({
      organization_id: organizationId,
      created_by_staff_member_id: staffMemberId,
      title: E2E_PARENT_FORM_TITLE,
      description: "Sign for portal QA.",
      form_type: "builder",
      status: "active",
      audience_type: "families",
      family_ids: [familyId],
      classroom_ids: [],
      require_signature: false,
      config: { fields: [] },
      total_families: 1,
      signed_families: 0,
      published_at: now,
      form_category: "general",
    })
    .select("id")
    .single();
  if (formError) throw formError;

  const formId = String(form.id);
  const { error: responseError } = await admin.from("teacher_parent_form_responses").upsert(
    {
      organization_id: organizationId,
      form_id: formId,
      family_id: familyId,
      student_ids: [],
      status: "pending",
      responses: {},
    },
    { onConflict: "form_id,family_id" },
  );
  if (responseError) throw responseError;

  return formId;
}

async function ensureE2eFridayBranchClass(
  admin: SupabaseClient,
  organizationId: string,
): Promise<string> {
  const { data: existingClass, error: existingClassError } = await admin
    .from("friday_branch_classes")
    .select("id")
    .eq("name", E2E_FRIDAY_CLASS_NAME)
    .limit(1)
    .maybeSingle();
  if (existingClassError) throw existingClassError;
  if (existingClass?.id) return String(existingClass.id);

  const blockId = randomUUID();
  const slotId = randomUUID();
  const classId = randomUUID();

  const { error: saveError } = await admin.rpc("save_friday_branch_schedule", {
    p_organization_id: organizationId,
    p_blocks: [
      {
        id: blockId,
        label: "E2E Friday Block",
        start_date: "2026-09-01",
        end_date: "2026-12-15",
        accent: "sky",
        description: "Portal QA",
        status: "current",
        sort_order: 0,
        slots: [
          {
            id: slotId,
            time: "10:00 AM",
            sort_order: 0,
            classes: [
              {
                id: classId,
                name: E2E_FRIDAY_CLASS_NAME,
                location: "Studio",
                age_group: "K-2",
                teacher: "E2E Staff",
                family_visible: true,
                capacity: 12,
                sort_order: 0,
              },
            ],
          },
        ],
      },
    ],
  });
  if (saveError) throw saveError;

  const { data: row, error: classError } = await admin
    .from("friday_branch_classes")
    .select("id")
    .eq("id", classId)
    .maybeSingle();
  if (classError) throw classError;
  if (row?.id) return String(row.id);

  const { data: byName, error: byNameError } = await admin
    .from("friday_branch_classes")
    .select("id")
    .eq("name", E2E_FRIDAY_CLASS_NAME)
    .limit(1)
    .maybeSingle();
  if (byNameError) throw byNameError;
  if (byName?.id) return String(byName.id);

  throw new Error("Friday Branch class seed failed.");
}

async function ensureE2eAttendanceRecord(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
  studentId: string,
): Promise<void> {
  const attendanceDate = "2026-09-15";
  const { error } = await admin.from("student_attendance_records").upsert(
    {
      organization_id: organizationId,
      student_id: studentId,
      family_id: familyId,
      attendance_date: attendanceDate,
      status: "present",
      present_at: new Date(`${attendanceDate}T14:00:00.000Z`).toISOString(),
    },
    { onConflict: "student_id,attendance_date" },
  );
  if (error) throw error;
}

export async function seedPortalQaParentFixtures(
  admin: SupabaseClient,
  organizationId: string,
  schoolProgramId: string,
): Promise<PortalQaParentSeedResult> {
  const familyId = await getFamilyIdByParentEmail(admin, organizationId, E2E_PARENT_EMAIL);
  const staffMemberId = await getStaffMemberId(admin, organizationId, E2E_STAFF_EMAIL);
  const studentId = await getEnrolledStudentForFamily(
    admin,
    organizationId,
    familyId,
    schoolProgramId,
  );

  const coop = await ensureE2eCoopProgram(admin, organizationId, familyId, studentId);
  const openSignupId = await ensureE2eClassroomSignup(
    admin,
    organizationId,
    staffMemberId,
    studentId,
  );
  const parentPublishedFormId = await ensureE2eParentPublishedForm(
    admin,
    organizationId,
    staffMemberId,
    familyId,
  );
  const classId = await ensureE2eFridayBranchClass(admin, organizationId);
  await ensureE2eAttendanceRecord(admin, organizationId, familyId, studentId);

  return {
    programs: { coop },
    classroomSignups: { openSignupId },
    parentPublishedFormId,
    fridayBranch: { classId },
  };
}
