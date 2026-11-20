/**
 * LOCAL ONLY: seeds a fictional "Your School" on the local Supabase stack so the real mobile app can be
 * screenshotted for Marketing Studio ads (public/images/marketing/app-screens/). Never run against a
 * hosted project: it refuses any NEXT_PUBLIC_SUPABASE_URL that isn't 127.0.0.1 / localhost.
 *
 * Re-runnable: it deletes the `your-school` org (cascades) and rebuilds it.
 *
 * Run from the repo root, with local Supabase up (`supabase start`) and `.env.e2e.local` pointing at it:
 *   npx tsx --tsconfig tsconfig.json --require ./src/test/integration/mock-server-only.cjs scripts/seed-your-school-marketing-local.ts
 *
 * Local test accounts (all fictional; password below is a local test value only):
 *   Parent:       sarah@your-school.test   (Sarah Mitchell; Emma & Liam)
 *   Teacher:      maya@your-school.test    (Maya Rivera, Little Learners)
 *   School admin: morgan@your-school.test  (Morgan Ellis)
 *   Password:     YourSchoolLocal2026!
 */
import fs from "node:fs";
import dotenv from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";
import { buildApplySystemSection, emptyApplyCustomSection } from "@/lib/admissions/apply-system-fields";
import { createProgram } from "@/lib/admissions/programs";
import { DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
import { buildParticipantSignature } from "@/lib/messages/participant-signature";
import { YOUR_SCHOOL_ADMIN_COLORS, YOUR_SCHOOL_NAME } from "@/data/school-demos/your-school-demo";

const SLUG = "your-school";
const PASSWORD = "YourSchoolLocal2026!";
const PARENT_EMAIL = "sarah@your-school.test";
const TEACHER_EMAIL = "maya@your-school.test";
const ADMIN_EMAIL = "morgan@your-school.test";

if (fs.existsSync(".env.e2e.local")) dotenv.config({ path: ".env.e2e.local", override: true });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
if (!/^http:\/\/(127\.0\.0\.1|localhost):54321\/?$/.test(url)) {
  throw new Error(`Refusing to seed: NEXT_PUBLIC_SUPABASE_URL is "${url}", not the local stack.`);
}
if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY (local).");

const db: SupabaseClient = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws as never },
});

function check<T>(res: { data: T; error: unknown }, what: string): T {
  if (res.error) throw new Error(`${what}: ${JSON.stringify(res.error)}`);
  return res.data;
}

async function ensureUser(email: string): Promise<string> {
  for (let page = 1; ; page += 1) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email);
    if (hit) {
      const { error: updateError } = await db.auth.admin.updateUserById(hit.id, { password: PASSWORD, email_confirm: true });
      if (updateError) throw updateError;
      return hit.id;
    }
    if (data.users.length < 200) break;
  }
  const { data, error } = await db.auth.admin.createUser({ email, password: PASSWORD, email_confirm: true });
  if (error || !data.user) throw error ?? new Error(`createUser ${email}`);
  return data.user.id;
}

const iso = (d: string) => new Date(`${d}T15:00:00Z`).toISOString();

async function main() {
  // ---- org (rebuild from scratch)
  await db.from("organizations").delete().eq("slug", SLUG);
  const org = check(
    await db.from("organizations").insert({ slug: SLUG, name: YOUR_SCHOOL_NAME, status: "live", timezone: "America/Chicago", plan: "custom" }).select("id").single(),
    "organization",
  ) as { id: string };
  const orgId = org.id;

  const features = {
    ...DEFAULT_FEATURES,
    teacher: { ...DEFAULT_FEATURES.teacher, dashboard: true, my_students: true, my_hours: true, messages: true, calendar: true, attendance: true, feed: true, forms_documents: true, classroom_signups: false, committees: false, payroll: false },
    parent: {
      ...DEFAULT_FEATURES.parent,
      portal: true,
      billing: true,
      messages: true,
      calendar: true,
      attendance: true,
      feed: true,
      children: true,
      forms_documents: true,
      committees: false,
      classroom_signups: false,
      curriculum: false,
      supply_list: false,
      teaching_schedule: false,
      friday_branch: false,
    },
  };
  check(
    await db.from("organization_settings").upsert({
      organization_id: orgId,
      branding: {
        colors: { ...YOUR_SCHOOL_ADMIN_COLORS },
        logo: { src: "/images/marketing/your-school-logo.png", alt: YOUR_SCHOOL_NAME, width: 220, height: 52 },
        typography: { headingFont: "", bodyFont: "" },
      },
      features,
    }),
    "settings",
  );

  // ---- people
  const parentUserId = await ensureUser(PARENT_EMAIL);
  const teacherUserId = await ensureUser(TEACHER_EMAIL);
  const adminUserId = await ensureUser(ADMIN_EMAIL);
  check(
    await db.from("organization_memberships").insert([
      { organization_id: orgId, user_id: parentUserId, role: "parent", status: "active" },
      { organization_id: orgId, user_id: teacherUserId, role: "teacher", status: "active" },
      { organization_id: orgId, user_id: adminUserId, role: "admin", status: "active" },
    ]),
    "memberships",
  );
  await db.auth.admin.updateUserById(parentUserId, { user_metadata: { full_name: "Sarah Mitchell", first_name: "Sarah" } });
  await db.auth.admin.updateUserById(teacherUserId, { user_metadata: { full_name: "Maya Rivera", first_name: "Maya" } });
  await db.auth.admin.updateUserById(adminUserId, { user_metadata: { full_name: "Morgan Ellis", first_name: "Morgan" } });

  const staff = check(
    await db
      .from("staff_members")
      .insert([
        { organization_id: orgId, user_id: teacherUserId, first_name: "Maya", last_name: "Rivera", email: TEACHER_EMAIL, role_title: "Lead Teacher", status: "active" },
        { organization_id: orgId, user_id: adminUserId, first_name: "Morgan", last_name: "Ellis", email: ADMIN_EMAIL, role_title: "Founder & Director", status: "active" },
      ])
      .select("id, email"),
    "staff",
  ) as Array<{ id: string; email: string }>;
  const teacherStaffId = staff.find((s) => s.email === TEACHER_EMAIL)!.id;

  // ---- programs + classroom
  const little = await createProgram(db, orgId, { name: "Little Learners", type: "school_year", status: "open" });
  const lower = await createProgram(db, orgId, { name: "Lower School", type: "school_year", status: "open" });
  const classroom = check(
    await db.from("classrooms").insert({ organization_id: orgId, program_id: little.id, name: "Little Learners", status: "open" }).select("id").single(),
    "classroom",
  ) as { id: string };
  check(await db.from("classroom_staff_assignments").insert({ organization_id: orgId, classroom_id: classroom.id, staff_member_id: teacherStaffId }), "classroom staff");

  // ---- families
  type Kid = { first: string; programId: string; dob: string; grade: string };
  async function family(last: string, guardianFirst: string, email: string, kids: Kid[], userId?: string) {
    const fam = check(
      await db.from("families").insert({ organization_id: orgId, name: `${last} Family`, primary_email: email }).select("id").single(),
      "family",
    ) as { id: string };
    const guardian = check(
      await db
        .from("guardians")
        .insert({ organization_id: orgId, family_id: fam.id, user_id: userId ?? null, first_name: guardianFirst, last_name: last, email, relationship: "parent" })
        .select("id")
        .single(),
      "guardian",
    ) as { id: string };
    const students: Array<{ id: string; enrollmentId: string; programId: string; first: string }> = [];
    for (const kid of kids) {
      const student = check(
        await db
          .from("students")
          .insert({ organization_id: orgId, family_id: fam.id, first_name: kid.first, last_name: last, date_of_birth: kid.dob, grade: kid.grade, status: "active", photo_media_consent: "full" })
          .select("id")
          .single(),
        "student",
      ) as { id: string };
      const enrollment = check(
        await db
          .from("enrollments")
          .insert({
            organization_id: orgId,
            student_id: student.id,
            program_id: kid.programId,
            classroom_id: kid.programId === little.id ? classroom.id : null,
            status: "enrolled",
            enrolled_at: iso("2026-08-10"),
          })
          .select("id")
          .single(),
        "enrollment",
      ) as { id: string };
      if (kid.programId === little.id) {
        check(await db.from("enrollment_classrooms").insert({ organization_id: orgId, enrollment_id: enrollment.id, classroom_id: classroom.id }), "enrollment classroom");
        check(await db.from("student_teacher_assignments").insert({ organization_id: orgId, student_id: student.id, staff_member_id: teacherStaffId }), "teacher assignment");
      }
      students.push({ id: student.id, enrollmentId: enrollment.id, programId: kid.programId, first: kid.first });
    }
    return { familyId: fam.id, guardianId: guardian.id, students };
  }

  const mitchell = await family(
    "Mitchell",
    "Sarah",
    PARENT_EMAIL,
    [
      { first: "Emma", programId: little.id, dob: "2021-04-12", grade: "k" },
      { first: "Liam", programId: lower.id, dob: "2018-09-03", grade: "2" },
    ],
    parentUserId,
  );
  const classmates = [
    ["Chen", "Lily", "Ava"],
    ["Patel", "Raj", "Noah"],
    ["Johnson", "Dana", "Mia"],
    ["Garcia", "Luis", "Leo"],
    ["Kim", "Grace", "Zoe"],
  ];
  const others = [];
  for (const [last, parent, kid] of classmates) {
    others.push(await family(last, parent, `${parent.toLowerCase()}.${last.toLowerCase()}@example.test`, [{ first: kid, programId: little.id, dob: "2021-06-01", grade: "k" }]));
  }

  // ---- attendance today (a roll call in progress: 4 of 6 marked)
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());
  const marked = [mitchell.students[0], others[0].students[0], others[1].students[0], others[2].students[0]];
  const markedFamilies = [mitchell.familyId, others[0].familyId, others[1].familyId, others[2].familyId];
  check(
    await db.from("student_attendance_records").insert(
      marked.map((s, i) => ({
        organization_id: orgId,
        student_id: s.id,
        family_id: markedFamilies[i],
        attendance_date: today,
        status: i === 3 ? "absent" : "present",
        // morning drop-off, school time (America/Chicago = UTC−6 in November)
        present_at: i === 3 ? null : new Date(`${today}T13:${String(52 + i * 3).padStart(2, "0")}:00Z`).toISOString(),
        absent_at: i === 3 ? new Date(`${today}T14:30:00Z`).toISOString() : null,
        recorded_by_user_id: teacherUserId,
      })),
    ),
    "attendance",
  );

  // ---- tuition: autopay on, Emma's installment due, Liam's activity fee
  const ratePlan = check(
    await db.from("tuition_rate_plans").insert({ organization_id: orgId, program_id: little.id, name: "Little Learners 2026–27", billing_basis: "annual", amount_cents: 1250000, status: "active", effective_start: "2026-08-01" }).select("id").single(),
    "rate plan",
  ) as { id: string };
  const ratePlanLower = check(
    await db.from("tuition_rate_plans").insert({ organization_id: orgId, program_id: lower.id, name: "Lower School 2026–27", billing_basis: "annual", amount_cents: 1450000, status: "active", effective_start: "2026-08-01" }).select("id").single(),
    "rate plan lower",
  ) as { id: string };
  const payPlan = check(
    await db.from("tuition_payment_plans").insert({ organization_id: orgId, rate_plan_id: ratePlan.id, name: "10 monthly payments", installment_count: 10, installment_amount_cents: 125000, billing_day_of_month: 15, is_default: true }).select("id").single(),
    "payment plan",
  ) as { id: string };
  const payPlanLower = check(
    await db.from("tuition_payment_plans").insert({ organization_id: orgId, rate_plan_id: ratePlanLower.id, name: "10 monthly payments", installment_count: 10, installment_amount_cents: 145000, billing_day_of_month: 15, is_default: true }).select("id").single(),
    "payment plan lower",
  ) as { id: string };
  const [emma, liam] = mitchell.students;
  const assignEmma = check(
    await db.from("tuition_enrollment_assignments").insert({ organization_id: orgId, enrollment_id: emma.enrollmentId, family_id: mitchell.familyId, rate_plan_id: ratePlan.id, payment_plan_id: payPlan.id, assignment_source: "default", status: "active", effective_start: "2026-08-01" }).select("id").single(),
    "assignment emma",
  ) as { id: string };
  const assignLiam = check(
    await db.from("tuition_enrollment_assignments").insert({ organization_id: orgId, enrollment_id: liam.enrollmentId, family_id: mitchell.familyId, rate_plan_id: ratePlanLower.id, payment_plan_id: payPlanLower.id, assignment_source: "default", status: "active", effective_start: "2026-08-01" }).select("id").single(),
    "assignment liam",
  ) as { id: string };
  const billing = check(
    await db.from("tuition_billing_accounts").insert({ organization_id: orgId, family_id: mitchell.familyId, autopay_enabled: true, default_payment_method_id: "pm_your_school_demo", billing_email: PARENT_EMAIL, status: "active" }).select("id").single(),
    "billing account",
  ) as { id: string };
  check(
    await db.from("family_payment_methods").insert({ organization_id: orgId, family_id: mitchell.familyId, billing_account_id: billing.id, guardian_id: mitchell.guardianId, stripe_payment_method_id: "pm_your_school_demo", brand: "visa", last4: "4242", exp_month: 8, exp_year: 2029, is_default: true }),
    "payment method",
  );
  const charge = (assignmentId: string, label: string, cents: number, due: string, status: string, n: number | null, type = "tuition") => ({
    organization_id: orgId,
    assignment_id: assignmentId,
    family_id: mitchell.familyId,
    guardian_id: mitchell.guardianId,
    label,
    base_amount_cents: cents,
    amount_cents: cents,
    paid_cents: status === "paid" ? cents : 0,
    due_date: due,
    status,
    charge_type: type,
    installment_number: n,
    sent_at: status === "scheduled" ? null : iso(due),
    paid_at: status === "paid" ? iso(due) : null,
  });
  check(
    await db.from("tuition_charges").insert([
      charge(assignEmma.id, "Tuition installment — Emma", 125000, "2026-09-15", "paid", 1),
      charge(assignEmma.id, "Tuition installment — Emma", 125000, "2026-10-15", "paid", 2),
      charge(assignEmma.id, "Tuition installment — Emma", 125000, "2026-11-15", "paid", 3),
      charge(assignEmma.id, "Tuition installment — Emma", 125000, "2026-12-15", "scheduled", 4),
      charge(assignLiam.id, "Tuition installment — Liam", 145000, "2026-11-15", "paid", 3),
      charge(assignLiam.id, "Tuition installment — Liam", 145000, "2026-12-15", "scheduled", 4),
      charge(assignLiam.id, "Activity fee — Liam", 7500, "2026-12-01", "sent", null, "fee"),
    ]),
    "charges",
  );

  // ---- a form to sign
  const form = check(
    await db
      .from("teacher_parent_forms")
      .insert({
        organization_id: orgId,
        created_by_staff_member_id: teacherStaffId,
        title: "Photo Release Form",
        description: "Let us share classroom photos with families in the app.",
        form_type: "builder",
        status: "active",
        audience_type: "classrooms",
        classroom_ids: [classroom.id],
        family_ids: [],
        require_signature: true,
        config: { fields: [] },
        due_date: "2026-12-04",
        total_families: 6,
        signed_families: 3,
        published_at: iso("2026-11-16"),
      })
      .select("id")
      .single(),
    "form",
  ) as { id: string };
  const formFamilies = [mitchell.familyId, ...others.map((o) => o.familyId)];
  check(
    await db.from("teacher_parent_form_responses").insert(
      formFamilies.map((familyId, i) => ({
        organization_id: orgId,
        form_id: form.id,
        family_id: familyId,
        status: i >= 3 ? "signed" : "pending",
        signed_at: i >= 3 ? iso("2026-11-17") : null,
      })),
    ),
    "form responses",
  );

  // ---- calendar
  check(
    await db.from("organization_events").insert([
      { organization_id: orgId, title: "Parent coffee morning", event_date: "2026-11-24", is_all_day: false, event_time: "8:15 AM", event_type: "community", location: "Front porch" },
      { organization_id: orgId, title: "No school — Thanksgiving break", event_date: "2026-11-26", is_all_day: true, event_type: "no_school" },
      { organization_id: orgId, title: "Field trip — botanical garden", event_date: "2026-12-04", is_all_day: false, event_time: "9:00 AM", end_time: "1:00 PM", event_type: "field_trip", location: "City Botanical Garden", program_id: little.id },
      { organization_id: orgId, title: "Winter art showcase", event_date: "2026-12-11", is_all_day: false, event_time: "4:00 PM", event_type: "community", location: "Main room" },
    ]),
    "events",
  );

  // ---- a message thread: teacher ↔ Sarah (parent threads are keyed on the guardian)
  const participants = [
    { kind: "guardian" as const, guardianId: mitchell.guardianId },
    { kind: "staff_member" as const, staffMemberId: teacherStaffId },
  ];
  const thread = check(
    await db
      .from("message_threads")
      .insert({ organization_id: orgId, subject: "Emma's week", participant_signature: buildParticipantSignature(participants as never), last_message_at: new Date().toISOString(), program_id: null })
      .select("id")
      .single(),
    "thread",
  ) as { id: string };
  check(
    await db.from("message_thread_participants").insert([
      { thread_id: thread.id, organization_id: orgId, participant_kind: "guardian", guardian_id: mitchell.guardianId },
      { thread_id: thread.id, organization_id: orgId, participant_kind: "staff_member", staff_member_id: teacherStaffId },
    ]),
    "participants",
  );
  const minutesAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString();
  check(
    await db.from("portal_messages").insert([
      { thread_id: thread.id, organization_id: orgId, body: "Emma painted the most amazing sunflower today 🌻 It's drying on the art wall for pickup.", sender_user_id: teacherUserId, sender_kind: "staff_member", sender_staff_member_id: teacherStaffId, created_at: minutesAgo(190) },
      { thread_id: thread.id, organization_id: orgId, body: "She told us all about it at dinner! Thank you for sharing.", sender_user_id: parentUserId, sender_kind: "guardian", sender_guardian_id: mitchell.guardianId, created_at: minutesAgo(150) },
      { thread_id: thread.id, organization_id: orgId, body: "Quick reminder: the photo release form is due before the field trip on Dec 4.", sender_user_id: teacherUserId, sender_kind: "staff_member", sender_staff_member_id: teacherStaffId, created_at: minutesAgo(25) },
    ]),
    "messages",
  );

  // ---- admissions pipeline for the admin dashboard
  const formVersion = check(
    await db
      .from("application_form_versions")
      .insert({
        organization_id: orgId,
        program_id: little.id,
        form_kind: "apply",
        version: 1,
        status: "published",
        title: "Apply to Your School",
        public_slug: "apply",
        schema: { sections: [buildApplySystemSection(), emptyApplyCustomSection()], acknowledgments: [] },
        fee_config: { enabled: false, label: "Application fee", amount_cents: 0, required_to_submit: true },
        published_at: new Date().toISOString(),
      })
      .select("id")
      .single(),
    "form version",
  ) as { id: string };
  const applicants: Array<[string, string, string, string, number]> = [
    ["Nguyen", "Hana", "Theo", "submitted", 1],
    ["Brooks", "Jamal", "Ruby", "submitted", 2],
    ["Silva", "Ana", "Mateo", "under_review", 4],
    ["Walsh", "Erin", "Finn", "observation", 6],
    ["Okafor", "Chidi", "Ada", "accepted", 9],
  ];
  for (const [last, parent, kid, status, daysAgo] of applicants) {
    const email = `${parent.toLowerCase()}.${last.toLowerCase()}@example.test`;
    const fam = check(await db.from("families").insert({ organization_id: orgId, name: `${last} Family`, primary_email: email }).select("id").single(), "applicant family") as { id: string };
    const guardian = check(
      await db.from("guardians").insert({ organization_id: orgId, family_id: fam.id, first_name: parent, last_name: last, email, relationship: "parent" }).select("id").single(),
      "applicant guardian",
    ) as { id: string };
    const student = check(
      await db.from("students").insert({ organization_id: orgId, family_id: fam.id, first_name: kid, last_name: last, date_of_birth: "2021-03-01", grade: "k", status: "prospect" }).select("id").single(),
      "applicant student",
    ) as { id: string };
    const submittedAt = new Date(Date.now() - daysAgo * 86400000).toISOString();
    check(
      await db.from("applications").insert({
        organization_id: orgId,
        program_id: little.id,
        form_version_id: formVersion.id,
        family_id: fam.id,
        student_id: student.id,
        primary_guardian_id: guardian.id,
        status,
        fee_status: "not_required",
        submitted_at: submittedAt,
        created_at: submittedAt,
        responses: { student_first_name: kid, student_last_name: last, student_date_of_birth: "2021-03-01", student_grade: "k" },
      }),
      "application",
    );
  }

  console.log(`Seeded ${YOUR_SCHOOL_NAME} (${SLUG}) on ${url}: org ${orgId}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
