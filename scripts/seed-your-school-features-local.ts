/**
 * LOCAL ONLY: companion to scripts/seed-your-school-marketing-local.ts. Adds lived-in data for every
 * MudKitchen feature (bulletin, photos, newsletters, committees, classroom signups, staff hours, forms &
 * documents, health, authorized pickup, tours, tuition for more families, transactions, more staff,
 * a second classroom, more messages and events) so the real web portal and mobile app can be
 * screenshotted for the marketing Features page (public/images/features/).
 *
 * Never run against a hosted project: it refuses any NEXT_PUBLIC_SUPABASE_URL that isn't 127.0.0.1 / localhost.
 *
 * Run the base seed first (it rebuilds the `your-school` org), then this one, from the repo root:
 *   npx tsx --tsconfig tsconfig.json --require ./src/test/integration/mock-server-only.cjs scripts/seed-your-school-marketing-local.ts
 *   npx tsx --tsconfig tsconfig.json --require ./src/test/integration/mock-server-only.cjs scripts/seed-your-school-features-local.ts
 *
 * Re-runnable: it deletes the rows it adds (by fixed emails / titles, or whole tables the base seed never
 * writes) before inserting them again. Dates are relative to today (America/Chicago).
 * Accounts are the base seed's (sarah@ / maya@ / morgan@ / jordan@your-school.test).
 */
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import sharp from "sharp";
import { jsPDF } from "jspdf";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";
import { DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
import { buildParticipantSignature } from "@/lib/messages/participant-signature";
import { createCommitteeFromTemplate } from "@/lib/committees/committees";
import { createStudentHealthItem } from "@/lib/student-health/mutations";
import { createSampleEdition } from "@/lib/school-admin/newsletter/newsletter-sample";
import { createNewsletterId } from "@/lib/school-admin/newsletter/newsletter-types";
import { YOUR_SCHOOL_ADMIN_COLORS, YOUR_SCHOOL_NAME } from "@/data/school-demos/your-school-demo";

const SLUG = "your-school";
const TZ = "America/Chicago";

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

// ---------- dates (school time, America/Chicago = UTC−6 in Nov–Mar)
const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
const dateObj = (d: string) => new Date(`${d}T12:00:00Z`);
const addDays = (d: string, n: number) => {
  const x = dateObj(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
};
const weekday = (d: string) => dateObj(d).getUTCDay(); // 0 Sun … 6 Sat
/** Local Chicago wall time → ISO (fixed −6h; fine for Nov–Feb captures). */
const at = (d: string, hm: string) => {
  const [h, m] = hm.split(":").map(Number);
  const x = new Date(`${d}T00:00:00Z`);
  x.setUTCHours(h + 6, m, 0, 0);
  return x.toISOString();
};
/** Previous N school days (Mon–Fri) strictly before today, oldest first. */
function pastSchoolDays(n: number): string[] {
  const out: string[] = [];
  let d = addDays(todayStr, -1);
  while (out.length < n) {
    if (weekday(d) !== 0 && weekday(d) !== 6) out.unshift(d);
    d = addDays(d, -1);
  }
  return out;
}
/** Next weekday on/after `d` with the given day-of-week. */
function nextDow(d: string, dow: number): string {
  let x = d;
  while (weekday(x) !== dow) x = addDays(x, 1);
  return x;
}
const monthStart = `${todayStr.slice(0, 7)}-01`;
const nextMonthStart = (() => {
  const x = dateObj(monthStart);
  x.setUTCMonth(x.getUTCMonth() + 1);
  return x.toISOString().slice(0, 10);
})();
const inMonth = (start: string, day: number) => `${start.slice(0, 8)}${String(day).padStart(2, "0")}`;

// ---------- fixed markers for re-runs
const NEW_STAFF = [
  { first: "Priya", last: "Shah", email: "priya.shah@your-school.test", title: "Lower School Lead Teacher" },
  { first: "Ben", last: "Carter", email: "ben.carter@your-school.test", title: "Teaching Assistant" },
];
const NEW_FAMILIES = [
  { last: "Rossi", parent: "Marco", kid: "Sofia", grade: "2", dob: "2018-05-11" },
  { last: "Bennett", parent: "Claire", kid: "Jack", grade: "3", dob: "2017-10-02" },
  { last: "Alvarez", parent: "Rosa", kid: "Elena", grade: "1", dob: "2019-08-21" },
];
const EXPLORERS = "Explorers";
const MY_EVENT_TITLES = [
  "Harvest potluck",
  "Picture day",
  "No school — Day after Thanksgiving",
  "Lower School book share",
  "Parent–teacher conferences",
  "Winter sing-along",
  "Last day before winter break",
  "No school — Winter break",
];
const MY_THREAD_SUBJECTS = ["Coat drive drop-off", "Ava's inhaler refill", "December tuition question", "Pickup change Friday", "Noah's reading", "Conference times"];
const MY_FORM_TITLES = ["Field trip permission slip — Botanical garden", "Family Handbook 2026–27"];

async function findUserId(email: string): Promise<string> {
  for (let page = 1; ; page += 1) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email);
    if (hit) return hit.id;
    if (data.users.length < 200) break;
  }
  throw new Error(`User ${email} not found — run the base seed first.`);
}

async function uploadBytes(bucket: string, objectPath: string, bytes: Buffer, contentType: string) {
  const { error } = await db.storage.from(bucket).upload(objectPath, bytes, { contentType, upsert: true });
  if (error) throw new Error(`upload ${bucket}/${objectPath}: ${error.message}`);
}

async function removePrefix(bucket: string, prefix: string) {
  // storage list is one level deep; gallery/forms use <org>/<kind>/<id>/<file>
  const { data: dirs } = await db.storage.from(bucket).list(prefix, { limit: 1000 });
  for (const dir of dirs ?? []) {
    const sub = `${prefix}/${dir.name}`;
    const { data: files } = await db.storage.from(bucket).list(sub, { limit: 1000 });
    const paths = (files ?? []).map((f) => `${sub}/${f.name}`);
    if (paths.length) await db.storage.from(bucket).remove(paths);
  }
}

function buildHandbookPdf(): Buffer {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(`${YOUR_SCHOOL_NAME} Family Handbook`, 56, 80);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("2026–27 School Year", 56, 104);
  const sections: Array<[string, string]> = [
    ["Our days", "Drop-off opens at 7:45 AM. Morning circle begins at 8:15 AM. Pickup is 3:00–3:30 PM."],
    ["Outdoor time", "We go outside in nearly all weather. Please pack rain boots and a warm layer every day."],
    ["Health & allergies", "Keep your child's allergies and medications up to date in the parent app."],
    ["Authorized pickup", "Only adults listed in the app may pick up your child. Add or change contacts any time."],
    ["Tuition", "Tuition is billed monthly on the 15th. Autopay is available in Billing."],
    ["Communication", "Message teachers and the office in the app. Weekly newsletters arrive on Fridays."],
  ];
  let y = 150;
  for (const [title, body] of sections) {
    doc.setFont("helvetica", "bold");
    doc.text(title, 56, y);
    doc.setFont("helvetica", "normal");
    doc.text(doc.splitTextToSize(body, 500), 56, y + 18);
    y += 64;
  }
  return Buffer.from(doc.output("arraybuffer"));
}

async function main() {
  const org = check(await db.from("organizations").select("id").eq("slug", SLUG).maybeSingle(), "org") as { id: string } | null;
  if (!org) throw new Error("your-school org not found — run the base seed first.");
  const orgId = org.id;

  const parentUserId = await findUserId("sarah@your-school.test");
  const teacherUserId = await findUserId("maya@your-school.test");
  const adminUserId = await findUserId("morgan@your-school.test");
  const applicantUserId = await findUserId("jordan@your-school.test");

  // ---------- cleanup of this script's rows
  for (const table of [
    "school_bulletin_posts",
    "school_gallery_photos",
    "school_newsletter_editions",
    "committees",
    "classroom_signups",
    "staff_work_time_entries",
    "staff_hours_adjustment_requests",
    "student_health_items",
    "student_authorized_pickup_contacts",
    "admissions_scheduled_visits",
    "application_payments",
    "admissions_availability_slots",
  ]) {
    check(await db.from(table).delete().eq("organization_id", orgId), `clean ${table}`);
  }
  check(await db.from("committee_join_requests").delete().eq("organization_id", orgId), "clean join requests");
  check(await db.from("organization_events").delete().eq("organization_id", orgId).in("title", MY_EVENT_TITLES), "clean events");
  check(await db.from("message_threads").delete().eq("organization_id", orgId).in("subject", MY_THREAD_SUBJECTS), "clean threads");
  check(await db.from("teacher_parent_forms").delete().eq("organization_id", orgId).in("title", MY_FORM_TITLES), "clean forms");
  check(await db.from("families").delete().eq("organization_id", orgId).in("primary_email", NEW_FAMILIES.map((f) => `${f.parent.toLowerCase()}.${f.last.toLowerCase()}@example.test`)), "clean families");
  check(await db.from("staff_members").delete().eq("organization_id", orgId).in("email", NEW_STAFF.map((s) => s.email)), "clean staff");
  check(await db.from("classrooms").delete().eq("organization_id", orgId).eq("name", EXPLORERS), "clean classroom");
  // past attendance (keep today's roll call from the base seed)
  check(await db.from("student_attendance_records").delete().eq("organization_id", orgId).lt("attendance_date", todayStr), "clean attendance");
  await removePrefix("school-gallery-files", `${orgId}/gallery`);
  await removePrefix("teacher-parent-form-files", `${orgId}/forms`);

  // ---------- features: everything on (Friday Branch, co-op program tools, marketing and payroll stay off)
  const features = {
    ...DEFAULT_FEATURES,
    admin: { ...DEFAULT_FEATURES.admin, bulletin: true, finances: true, photos: true, committees: true, communication: true, schedule: true, messages: true, notifications: true, marketing: false },
    teacher: { ...DEFAULT_FEATURES.teacher, dashboard: true, my_students: true, classroom_signups: true, my_hours: true, messages: true, calendar: true, attendance: true, feed: true, forms_documents: true, committees: true, newsletters: true, payroll: false },
    parent: {
      ...DEFAULT_FEATURES.parent,
      portal: true,
      billing: true,
      messages: true,
      calendar: true,
      attendance: true,
      feed: true,
      children: true,
      committees: true,
      classroom_signups: true,
      forms_documents: true,
      newsletters: true,
      curriculum: false,
      supply_list: false,
      teaching_schedule: false,
      friday_branch: false,
    },
    parent_home: { friday_branch: false },
  };
  check(await db.from("organization_settings").update({ features }).eq("organization_id", orgId), "features");
  // a connected (fictional) Stripe account so setup checklists read as done; no Stripe calls are made from the seed
  check(await db.from("organization_payment_accounts").delete().eq("stripe_connect_account_id", "acct_demo_your_school"), "clean payment account");
  check(await db.from("organization_payment_accounts").upsert({ organization_id: orgId, stripe_connect_account_id: "acct_demo_your_school", onboarding_status: "complete", charges_enabled: true, payouts_enabled: true }), "payment account");

  // ---------- look up base rows
  const programs = check(await db.from("programs").select("id, name").eq("organization_id", orgId), "programs") as Array<{ id: string; name: string }>;
  const little = programs.find((p) => p.name === "Little Learners")!;
  const lower = programs.find((p) => p.name === "Lower School")!;
  const littleRoom = check(await db.from("classrooms").select("id").eq("organization_id", orgId).eq("name", "Little Learners").single(), "LL room") as { id: string };
  const staffRows = check(await db.from("staff_members").select("id, email, first_name").eq("organization_id", orgId), "staff") as Array<{ id: string; email: string; first_name: string }>;
  const mayaStaffId = staffRows.find((s) => s.email === "maya@your-school.test")!.id;
  const morganStaffId = staffRows.find((s) => s.email === "morgan@your-school.test")!.id;
  type FamRow = { id: string; name: string; primary_email: string };
  const fams = check(await db.from("families").select("id, name, primary_email").eq("organization_id", orgId), "families") as FamRow[];
  const famBy = (last: string) => fams.find((f) => f.name === `${last} Family`)!;
  type GuardianRow = { id: string; family_id: string; first_name: string; last_name: string; user_id: string | null; email: string };
  const guardians = check(await db.from("guardians").select("id, family_id, first_name, last_name, user_id, email").eq("organization_id", orgId), "guardians") as GuardianRow[];
  const guardianOf = (familyId: string) => guardians.find((g) => g.family_id === familyId)!;
  type StudentRow = { id: string; family_id: string; first_name: string; last_name: string; status: string };
  const students = check(await db.from("students").select("id, family_id, first_name, last_name, status").eq("organization_id", orgId), "students") as StudentRow[];
  const kid = (first: string, last: string) => students.find((s) => s.first_name === first && s.last_name === last)!;
  const enrollments = check(await db.from("enrollments").select("id, student_id, program_id, classroom_id, status").eq("organization_id", orgId), "enrollments") as Array<{ id: string; student_id: string; program_id: string; classroom_id: string | null; status: string }>;

  const mitchell = famBy("Mitchell");
  const sarahGuardian = guardianOf(mitchell.id);
  const emma = kid("Emma", "Mitchell");
  const liam = kid("Liam", "Mitchell");
  const park = famBy("Park");
  const nora = kid("Nora", "Park");

  // ---------- staff (4 total) + second classroom
  const newStaff = check(
    await db
      .from("staff_members")
      .insert(NEW_STAFF.map((s) => ({ organization_id: orgId, first_name: s.first, last_name: s.last, email: s.email, role_title: s.title, status: "active" })))
      .select("id, email"),
    "new staff",
  ) as Array<{ id: string; email: string }>;
  const priyaStaffId = newStaff.find((s) => s.email.startsWith("priya"))!.id;
  const benStaffId = newStaff.find((s) => s.email.startsWith("ben"))!.id;
  const explorers = check(
    await db.from("classrooms").insert({ organization_id: orgId, program_id: lower.id, name: EXPLORERS, status: "open" }).select("id").single(),
    "explorers",
  ) as { id: string };
  check(
    await db.from("classroom_staff_assignments").insert([
      { organization_id: orgId, classroom_id: explorers.id, staff_member_id: priyaStaffId, role: "lead" },
      { organization_id: orgId, classroom_id: littleRoom.id, staff_member_id: benStaffId, role: "assistant" },
    ]),
    "classroom staff",
  );
  check(await db.from("classroom_staff_assignments").update({ role: "lead" }).eq("classroom_id", littleRoom.id).eq("staff_member_id", mayaStaffId), "maya lead");

  // Lower School families: Liam & Nora move into Explorers, plus three new families
  const explorerKids: StudentRow[] = [liam, nora];
  for (const f of NEW_FAMILIES) {
    const email = `${f.parent.toLowerCase()}.${f.last.toLowerCase()}@example.test`;
    const fam = check(await db.from("families").insert({ organization_id: orgId, name: `${f.last} Family`, primary_email: email }).select("id, name, primary_email").single(), "new family") as FamRow;
    fams.push(fam);
    const g = check(
      await db.from("guardians").insert({ organization_id: orgId, family_id: fam.id, first_name: f.parent, last_name: f.last, email, relationship: "parent" }).select("id, family_id, first_name, last_name, user_id, email").single(),
      "new guardian",
    ) as GuardianRow;
    guardians.push(g);
    const s = check(
      await db.from("students").insert({ organization_id: orgId, family_id: fam.id, first_name: f.kid, last_name: f.last, date_of_birth: f.dob, grade: f.grade, status: "active", photo_media_consent: "full" }).select("id, family_id, first_name, last_name, status").single(),
      "new student",
    ) as StudentRow;
    students.push(s);
    const e = check(
      await db.from("enrollments").insert({ organization_id: orgId, student_id: s.id, program_id: lower.id, classroom_id: explorers.id, status: "enrolled", enrolled_at: at("2026-08-10", "09:00") }).select("id, student_id, program_id, classroom_id, status").single(),
      "new enrollment",
    ) as (typeof enrollments)[number];
    enrollments.push(e);
    explorerKids.push(s);
  }
  for (const s of explorerKids) {
    const e = enrollments.find((x) => x.student_id === s.id && x.status === "enrolled")!;
    check(await db.from("enrollments").update({ classroom_id: explorers.id }).eq("id", e.id), "move enrollment");
    e.classroom_id = explorers.id;
    check(await db.from("enrollment_classrooms").delete().eq("enrollment_id", e.id), "clear enrollment classroom");
    check(await db.from("enrollment_classrooms").insert({ organization_id: orgId, enrollment_id: e.id, classroom_id: explorers.id }), "enrollment classroom");
    check(await db.from("student_teacher_assignments").delete().eq("student_id", s.id), "clear teacher assignment");
    check(await db.from("student_teacher_assignments").insert({ organization_id: orgId, student_id: s.id, staff_member_id: priyaStaffId }), "teacher assignment");
  }

  // roster dates: everyone joined at the start of the year, not on seed day
  check(await db.from("enrollments").update({ created_at: at("2026-08-10", "09:00"), enrolled_at: at("2026-08-10", "09:00") }).eq("organization_id", orgId).eq("status", "enrolled"), "enrollment dates");
  check(await db.from("students").update({ created_at: at("2026-08-10", "09:00") }).eq("organization_id", orgId).eq("status", "active"), "student dates");
  const littleKids = students.filter((s) => enrollments.some((e) => e.student_id === s.id && e.classroom_id === littleRoom.id && e.status === "enrolled"));
  const allEnrolled = [...littleKids, ...explorerKids];

  // ---------- enrollment setup: a $500 deposit fee on the Little Learners checklist, and a Lower School checklist
  check(await db.from("fee_definitions").delete().eq("organization_id", orgId).eq("code", "enrollment_deposit"), "clean fee");
  const depositFee = check(
    await db.from("fee_definitions").insert({ organization_id: orgId, program_id: little.id, code: "enrollment_deposit", label: "Enrollment deposit", amount_cents: 50000, currency: "usd", active: true }).select("id").single(),
    "deposit fee",
  ) as { id: string };
  const llTemplate = check(await db.from("enrollment_checklist_templates").select("id").eq("organization_id", orgId).eq("program_id", little.id).single(), "LL template") as { id: string };
  // the app's setup checks look for enrollment_path "enrollment" (the base seed wrote "standard")
  check(await db.from("enrollment_checklist_templates").update({ enrollment_path: "enrollment" }).eq("id", llTemplate.id), "LL template path");
  check(await db.from("enrollment_checklist_template_items").update({ fee_definition_id: depositFee.id }).eq("template_id", llTemplate.id).eq("item_key", "deposit"), "deposit item fee");
  check(await db.from("enrollment_checklist_templates").delete().eq("organization_id", orgId).eq("name", "Lower School enrollment"), "clean lower template");
  const lowerTemplate = check(
    await db.from("enrollment_checklist_templates").insert({ organization_id: orgId, program_id: lower.id, name: "Lower School enrollment", enrollment_path: "enrollment", status: "published" }).select("id").single(),
    "lower template",
  ) as { id: string };
  const llItems = check(await db.from("enrollment_checklist_template_items").select("item_key, sort_order, label, type, required").eq("template_id", llTemplate.id), "LL items") as Array<Record<string, unknown>>;
  check(await db.from("enrollment_checklist_template_items").insert(llItems.filter((x) => x.item_key !== "deposit").map((x) => ({ ...x, template_id: lowerTemplate.id, organization_id: orgId }))), "lower items");

  // ---------- enrolled applications: the parent app lists children from applications, so every enrolled
  // student gets an "enrolled" application (Lower School gets its own published apply form).
  check(await db.from("applications").delete().eq("organization_id", orgId).eq("status", "enrolled"), "clean enrolled apps");
  check(await db.from("application_form_versions").delete().eq("organization_id", orgId).eq("public_slug", "apply-lower-school"), "clean lower form");
  const llForm = check(await db.from("application_form_versions").select("*").eq("organization_id", orgId).eq("program_id", little.id).eq("form_kind", "apply").single(), "LL form") as Record<string, unknown>;
  const { id: _llId, created_at: _c, updated_at: _u, ...llFormRest } = llForm;
  const lowerForm = check(
    await db.from("application_form_versions").insert({ ...llFormRest, program_id: lower.id, title: "Apply to Lower School", public_slug: "apply-lower-school", published_at: at("2026-03-01", "09:00") }).select("id").single(),
    "lower form",
  ) as { id: string };
  for (const [i, s] of allEnrolled.entries()) {
    const e = enrollments.find((x) => x.student_id === s.id && x.status === "enrolled")!;
    const submitted = at(addDays("2026-03-02", i * 6), "20:15");
    const full = check(await db.from("students").select("date_of_birth, grade").eq("id", s.id).single(), "student dob") as { date_of_birth: string; grade: string };
    check(
      await db.from("applications").insert({
        organization_id: orgId,
        program_id: e.program_id,
        form_version_id: e.program_id === little.id ? String(llForm.id) : lowerForm.id,
        family_id: s.family_id,
        student_id: s.id,
        primary_guardian_id: guardianOf(s.family_id).id,
        status: "enrolled",
        fee_status: "not_required",
        submitted_at: submitted,
        created_at: submitted,
        updated_at: at(addDays("2026-08-01", i), "10:00"),
        responses: { student_first_name: s.first_name, student_last_name: s.last_name, student_date_of_birth: full.date_of_birth, student_grade: full.grade },
      }),
      "enrolled application",
    );
  }

  // ---------- media permissions (a realistic mix)
  check(await db.from("students").update({ photo_media_consent: "limited", photo_media_consent_updated_at: at("2026-08-20", "10:00") }).eq("id", kid("Noah", "Patel").id), "consent noah");
  check(await db.from("students").update({ photo_media_consent: "none", photo_media_consent_updated_at: at("2026-08-22", "10:00") }).eq("id", kid("Zoe", "Kim").id), "consent zoe");

  // ---------- health + authorized pickup
  const healthCtx = (studentId: string, guardianId: string | null) => ({ organizationId: orgId, studentId, userId: guardianId ? parentUserId : adminUserId, guardianId });
  await createStudentHealthItem(db, healthCtx(emma.id, sarahGuardian.id), {
    itemType: "allergy",
    values: { allergen: "Peanuts", severity: "high", treatmentNotes: "EpiPen in the red pouch in her backpack. Call Sarah right away." },
  });
  await createStudentHealthItem(db, healthCtx(liam.id, sarahGuardian.id), {
    itemType: "update",
    values: { title: "Recovering from a cold", details: "Might need a quiet rest after lunch this week.", startDate: addDays(todayStr, -3), endDate: addDays(todayStr, 4) },
  });
  const ava = kid("Ava", "Chen");
  await createStudentHealthItem(db, healthCtx(ava.id, null), {
    itemType: "medication",
    values: { name: "Albuterol inhaler", dose: "2 puffs", timeOfDay: "Before outdoor play", daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday"], instructions: "Only if she's wheezing. Note it in the app.", startDate: "2026-09-01", endDate: null, ongoing: true },
  });
  await createStudentHealthItem(db, healthCtx(kid("Leo", "Garcia").id, null), {
    itemType: "allergy",
    values: { allergen: "Dairy", severity: "medium", treatmentNotes: "Oat milk is in the classroom fridge." },
  });
  check(
    await db.from("student_authorized_pickup_contacts").insert([
      { organization_id: orgId, student_id: emma.id, family_id: mitchell.id, first_name: "David", last_name: "Mitchell", relationship: "Father", phone: "(555) 014-2231", is_active: true, created_by_guardian_id: sarahGuardian.id, created_by_user_id: parentUserId },
      { organization_id: orgId, student_id: emma.id, family_id: mitchell.id, first_name: "Ruth", last_name: "Mitchell", relationship: "Grandmother", phone: "(555) 014-8820", notes: "Picks up on Fridays", is_active: true, created_by_guardian_id: sarahGuardian.id, created_by_user_id: parentUserId },
      { organization_id: orgId, student_id: liam.id, family_id: mitchell.id, first_name: "David", last_name: "Mitchell", relationship: "Father", phone: "(555) 014-2231", is_active: true, created_by_guardian_id: sarahGuardian.id, created_by_user_id: parentUserId },
      { organization_id: orgId, student_id: liam.id, family_id: mitchell.id, first_name: "Ruth", last_name: "Mitchell", relationship: "Grandmother", phone: "(555) 014-8820", notes: "Picks up on Fridays", is_active: true, created_by_guardian_id: sarahGuardian.id, created_by_user_id: parentUserId },
    ]),
    "pickup contacts",
  );

  // ---------- attendance history: last 10 school days for every enrolled student
  const days = pastSchoolDays(10);
  const attendanceRows: Array<Record<string, unknown>> = [];
  days.forEach((d, di) => {
    allEnrolled.forEach((s, si) => {
      const absent = (di === 3 && si === 2) || (di === 7 && si === 5) || (di === 8 && s.id === liam.id);
      const g = guardianOf(s.family_id);
      const arrive = `07:${String(48 + ((si * 3 + di) % 11)).padStart(2, "0")}`;
      const leave = `15:${String(5 + ((si * 4 + di) % 25)).padStart(2, "0")}`;
      attendanceRows.push({
        organization_id: orgId,
        student_id: s.id,
        family_id: s.family_id,
        attendance_date: d,
        status: absent ? "absent" : "picked_up",
        present_at: absent ? null : at(d, arrive),
        absent_at: absent ? at(d, "08:30") : null,
        picked_up_at: absent ? null : at(d, leave),
        picked_up_by_guardian_id: absent ? null : g.id,
        picked_up_by_name: absent ? null : `${g.first_name} ${g.last_name}`,
        note: absent ? (s.id === liam.id ? "Home with a cold" : "Family trip") : null,
        recorded_by_user_id: teacherUserId,
      });
    });
  });
  check(await db.from("student_attendance_records").insert(attendanceRows), "attendance history");

  // ---------- staff hours: last 10 school days for 4 staff, + one pending adjustment request
  const hours: Array<Record<string, unknown>> = [];
  const shifts: Array<[string, string, string]> = [
    [mayaStaffId, "07:40", "15:50"],
    [priyaStaffId, "07:45", "16:05"],
    [benStaffId, "08:00", "14:30"],
    [morganStaffId, "08:15", "17:00"],
  ];
  days.forEach((d, di) => {
    shifts.forEach(([staffId, start, end], si) => {
      if (si === 2 && di % 5 === 4) return; // Ben is off Fridays
      const jitter = (di * 7 + si * 3) % 9;
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);
      const inAt = at(d, `${String(sh).padStart(2, "0")}:${String(sm + jitter).padStart(2, "0")}`);
      const outAt = at(d, `${String(eh).padStart(2, "0")}:${String((em + jitter * 2) % 60).padStart(2, "0")}`);
      hours.push({ organization_id: orgId, staff_member_id: staffId, work_date: d, clock_in_at: inAt, clock_out_at: outAt, recorded_by_user_id: staffId === mayaStaffId ? teacherUserId : null });
    });
  });
  hours.push(
    { organization_id: orgId, staff_member_id: mayaStaffId, work_date: todayStr, clock_in_at: at(todayStr, "07:42"), clock_out_at: null, recorded_by_user_id: teacherUserId },
    { organization_id: orgId, staff_member_id: priyaStaffId, work_date: todayStr, clock_in_at: at(todayStr, "07:51"), clock_out_at: null, recorded_by_user_id: null },
    { organization_id: orgId, staff_member_id: benStaffId, work_date: todayStr, clock_in_at: at(todayStr, "08:03"), clock_out_at: at(todayStr, "14:30"), recorded_by_user_id: null },
    { organization_id: orgId, staff_member_id: morganStaffId, work_date: todayStr, clock_in_at: at(todayStr, "08:20"), clock_out_at: null, recorded_by_user_id: adminUserId },
  );
  check(await db.from("staff_work_time_entries").insert(hours), "staff hours");
  const adjDay = days[days.length - 2];
  check(
    await db.from("staff_hours_adjustment_requests").insert({
      organization_id: orgId,
      staff_member_id: mayaStaffId,
      work_date: adjDay,
      status: "pending",
      note: "Forgot to clock out after the parent coffee setup — I left at 4:45.",
      proposed_sessions: [{ clockIn: "07:40", clockOut: "16:45" }],
      previous_sessions: [{ clockIn: "07:40", clockOut: "15:50" }],
      submitted_by_user_id: teacherUserId,
    }),
    "adjustment request",
  );

  // ---------- calendar: more events this month and next
  check(
    await db.from("organization_events").insert([
      { organization_id: orgId, title: "Harvest potluck", event_date: addDays(todayStr, -2), is_all_day: false, event_time: "5:30 PM", end_time: "7:00 PM", event_type: "community", location: "Garden pavilion", description: "Bring a dish to share — we'll provide plates and cider." },
      { organization_id: orgId, title: "Picture day", event_date: nextDow(addDays(todayStr, 1), 1), is_all_day: false, event_time: "8:30 AM", end_time: "11:30 AM", event_type: "academic", location: "Library nook" },
      { organization_id: orgId, title: "No school — Day after Thanksgiving", event_date: "2026-11-27", is_all_day: true, event_type: "no_school" },
      { organization_id: orgId, title: "Lower School book share", event_date: inMonth(nextMonthStart, 2), is_all_day: false, event_time: "2:15 PM", event_type: "academic", location: "Explorers room", program_id: lower.id },
      { organization_id: orgId, title: "Parent–teacher conferences", event_date: inMonth(nextMonthStart, 8), is_all_day: false, event_time: "12:30 PM", end_time: "5:00 PM", event_type: "academic", location: "Classrooms", description: "Sign up for a 20-minute slot with your child's teacher." },
      { organization_id: orgId, title: "Winter sing-along", event_date: inMonth(nextMonthStart, 16), is_all_day: false, event_time: "9:30 AM", event_type: "community", location: "Main room" },
      { organization_id: orgId, title: "Last day before winter break", event_date: inMonth(nextMonthStart, 18), is_all_day: false, event_time: "12:00 PM", event_type: "other", description: "Early dismissal at noon." },
      { organization_id: orgId, title: "No school — Winter break", event_date: inMonth(nextMonthStart, 21), is_all_day: true, event_type: "no_school" },
    ]),
    "events",
  );

  // ---------- tours / visits on the admin schedule
  const apps = check(await db.from("applications").select("id, family_id, status").eq("organization_id", orgId), "apps") as Array<{ id: string; family_id: string; status: string }>;
  // open tour times: Tue & Thu mornings for the next three weeks (skipping Thanksgiving)
  const tourSlots: Array<Record<string, unknown>> = [];
  for (let i = 1; i <= 21; i += 1) {
    const d = addDays(todayStr, i);
    if ((weekday(d) !== 2 && weekday(d) !== 4) || d === "2026-11-26") continue;
    for (const t of ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM"]) tourSlots.push({ organization_id: orgId, date: d, time_slot: t, tour_booking_mode: "exclusive" });
  }
  check(await db.from("admissions_availability_slots").insert(tourSlots), "tour slots");
  const silvaApp = apps.find((a) => a.family_id === famBy("Silva").id)!;
  const walshApp = apps.find((a) => a.family_id === famBy("Walsh").id)!;
  check(
    await db.from("admissions_scheduled_visits").insert([
      { organization_id: orgId, post_submit_action_id: "public:schedule_campus_tour", action_type: "schedule_campus_tour", booking_source: "public", scheduling_mode: "time_slot", scheduled_date: nextDow(addDays(todayStr, 1), 2), start_time_slot: "9:30 AM", duration_minutes: 45, status: "scheduled", registrant: { contactEmail: "olivia.grant@example.test", answers: { contact_name: "Olivia Grant", children: [{ name: "Max", age: "5" }] } } },
      { organization_id: orgId, post_submit_action_id: "public:schedule_campus_tour", action_type: "schedule_campus_tour", booking_source: "public", scheduling_mode: "time_slot", scheduled_date: nextDow(addDays(todayStr, 1), 4) === "2026-11-26" ? inMonth(nextMonthStart, 3) : nextDow(addDays(todayStr, 1), 4), start_time_slot: "10:00 AM", duration_minutes: 45, status: "scheduled", registrant: { contactEmail: "sam.reyes@example.test", answers: { contact_name: "Sam Reyes", children: [{ name: "Isla", age: "6" }] } } },
      { organization_id: orgId, application_id: silvaApp.id, family_id: silvaApp.family_id, post_submit_action_id: "schedule_family_interview", action_type: "schedule_family_interview", booking_source: "application", scheduling_mode: "time_slot", scheduled_date: inMonth(nextMonthStart, 1), start_time_slot: "1:00 PM", duration_minutes: 30, status: "scheduled" },
      { organization_id: orgId, application_id: walshApp.id, family_id: walshApp.family_id, post_submit_action_id: "schedule_observation_day", action_type: "schedule_observation_day", booking_source: "application", scheduling_mode: "whole_day", scheduled_date: inMonth(nextMonthStart, 4), start_time_slot: "8:00 AM", duration_minutes: 420, visit_day_count: 1, status: "scheduled" },
    ]),
    "visits",
  );

  // ---------- bulletin (3 posts; newest first acts as the pinned/top item)
  check(
    await db.from("school_bulletin_posts").insert([
      { organization_id: orgId, title: "Winter coat drive starts Monday", body: "We're collecting gently used coats, hats and mittens for families in our neighborhood. Drop them in the basket by the front porch through December 12. Thank you for your kindness!", status: "published", audiences: ["school_wide"], program_ids: [], published_at: at(addDays(todayStr, -1), "09:00"), expires_at: at(inMonth(nextMonthStart, 12), "23:00"), created_by: morganStaffId },
      { organization_id: orgId, title: "Picture day is Monday", body: "Photos start at 8:30 AM in the library nook. Retakes are on December 9. Order forms went home in folders.", status: "published", audiences: ["parents"], program_ids: [], published_at: at(addDays(todayStr, -3), "15:30"), created_by: morganStaffId },
      { organization_id: orgId, title: "Conference sign-up sheet is live", body: "Please add your available conference blocks for December 8 by Wednesday. Rooms and timings are on the staff calendar.", status: "published", audiences: ["teachers"], program_ids: [], published_at: at(addDays(todayStr, -2), "16:00"), created_by: morganStaffId },
    ]),
    "bulletin",
  );

  // ---------- photos: 12 photos over 3 days
  const repoImg = (p: string) => path.join(process.cwd(), "public", p);
  const photoDays: Array<[string, string[]]> = [
    [days[days.length - 1], ["images/stock/ImageFour.jpg", "images/stock/ImageFive.jpg", "images/stock/ImageSeven.jpg", "images/stock/ImageFourteen.jpg"]],
    [days[days.length - 3], ["images/sagefield/garden.jpg", "images/sagefield/mud-kitchen.jpg", "images/stock/ImageThree.jpg", "images/stock/ImageEight.jpg"]],
    [days[days.length - 7], ["images/stock/ImageTen.jpg", "images/stock/ImageTwelve.jpg", "images/stock/ImageThirteen.jpg", "images/sagefield/kids-running.jpg"]],
  ];
  const galleryIds: string[] = [];
  let photoIndex = 0;
  for (const [photoDate, files] of photoDays) {
    const batchId = crypto.randomUUID();
    for (const file of files) {
      const id = crypto.randomUUID();
      const bytes = await sharp(repoImg(file)).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 84 }).toBuffer();
      const fileName = `${path.basename(file, path.extname(file)).toLowerCase()}.jpg`;
      const storagePath = `${orgId}/gallery/${id}/${fileName}`;
      await uploadBytes("school-gallery-files", storagePath, bytes, "image/jpeg");
      check(
        await db.from("school_gallery_photos").insert({
          id,
          organization_id: orgId,
          photo_date: photoDate,
          storage_path: storagePath,
          file_name: fileName,
          mime_type: "image/jpeg",
          size_bytes: bytes.length,
          upload_batch_id: batchId,
          uploaded_by: photoIndex % 3 === 0 ? adminUserId : teacherUserId,
          created_at: at(photoDate, `15:${String(10 + photoIndex).padStart(2, "0")}`),
        }),
        "gallery photo",
      );
      galleryIds.push(id);
      photoIndex += 1;
    }
  }

  // ---------- newsletters: one published (last week), one draft (this week)
  const primary = (YOUR_SCHOOL_ADMIN_COLORS as { primary?: string }).primary ?? "#3F6B4F";
  const contentOf = (e: ReturnType<typeof createSampleEdition>["editions"][number]) => ({
    layout: "storybook",
    sections: e.sections,
    storyBlocks: e.storyBlocks,
    teacherUpdates: e.teacherUpdates,
    events: e.events,
    reminders: e.reminders,
    photos: e.photos.map(({ src: _src, ...rest }) => ({ ...rest, src: "" })),
    coverGalleryPhotoId: e.coverGalleryPhotoId,
  });
  const lastWeekMon = nextDow(addDays(todayStr, -6), 1); // the school week that just ended
  const thisWeekMon = nextDow(todayStr, 1); // the coming week (draft)
  const published = createSampleEdition(YOUR_SCHOOL_NAME, primary).editions[0];
  published.title = "A week of small discoveries";
  published.events = [
    { id: createNewsletterId(), title: "Picture day", date: nextDow(addDays(todayStr, 1), 1), time: "8:30 AM", note: "Retakes are on December 9." },
    { id: createNewsletterId(), title: "Field trip — botanical garden", date: "2026-12-04", time: "9:00 AM", note: "Permission slips are in the app." },
  ];
  published.photos = galleryIds.slice(0, 4).map((gid, i) => ({ id: createNewsletterId(), src: "", caption: ["Climbing day in the forest", "Building a stick fort", "Snack under the big oak", "Tree-top explorers"][i], galleryPhotoId: gid }));
  published.coverGalleryPhotoId = galleryIds[4];
  published.teacherUpdates = {};
  const draft = createSampleEdition(YOUR_SCHOOL_NAME, primary).editions[0];
  draft.title = "Gratitude week";
  draft.storyBlocks.forEach((b) => {
    if (b.kind === "welcome") b.value = "Dear families,\n\nThis short week we're talking about thankfulness — for friends, for helpers, and for our garden.";
    if (b.kind === "learning") b.value = "how seeds travel and what plants need through the winter";
  });
  draft.events = [{ id: createNewsletterId(), title: "Winter art showcase", date: "2026-12-11", time: "4:00 PM", note: "Families welcome in the main room." }];
  draft.photos = galleryIds.slice(4, 7).map((gid, i) => ({ id: createNewsletterId(), src: "", caption: ["Harvesting the last carrots", "Mud kitchen soup", "Seed sorting"][i], galleryPhotoId: gid }));
  draft.coverGalleryPhotoId = galleryIds[8];
  check(
    await db.from("school_newsletter_editions").insert([
      { organization_id: orgId, title: published.title, week: lastWeekMon, week_end: addDays(lastWeekMon, 4), status: "published", published_at: at(addDays(lastWeekMon, 4), "15:00"), content: contentOf(published), created_by: morganStaffId },
      { organization_id: orgId, title: draft.title, week: thisWeekMon, week_end: addDays(thisWeekMon, 4), status: "draft", content: contentOf(draft), created_by: morganStaffId },
    ]),
    "newsletters",
  );

  // ---------- committees: 3 with members, tasks, events, messages and a pending join request
  const term = { termLabel: "2026–27 School Year", termStart: "2026-08-15", termEnd: "2027-05-31" };
  const garden = await createCommitteeFromTemplate(db, orgId, { platformSlug: "annual-volunteer", name: "Garden Crew", description: "Keeps our raised beds, compost and mud kitchen growing all year.", ...term } as never);
  const events = await createCommitteeFromTemplate(db, orgId, { platformSlug: "event", name: "Family Events Committee", description: "Plans potlucks, the winter showcase and the spring picnic.", ...term } as never);
  const fundraising = await createCommitteeFromTemplate(db, orgId, { platformSlug: "hybrid", name: "Fundraising Committee", description: "Runs the book fair and the spring garden sale.", ...term } as never);
  const g = (last: string) => guardianOf(famBy(last).id);
  type MemberSpec = { name: string; email: string; role: string; guardianId?: string; userId?: string | null; staffId?: string };
  async function addMembers(committeeId: string, members: MemberSpec[]) {
    return check(
      await db
        .from("committee_members")
        .insert(members.map((m) => ({ committee_id: committeeId, organization_id: orgId, display_name: m.name, email: m.email, role: m.role, guardian_id: m.guardianId ?? null, user_id: m.userId ?? null, staff_member_id: m.staffId ?? null, status: "active", term_start: term.termStart, term_end: term.termEnd })))
        .select("id, display_name"),
      "committee members",
    ) as Array<{ id: string; display_name: string }>;
  }
  const gardenMembers = await addMembers(garden.id, [
    { name: "Sarah Mitchell", email: "sarah@your-school.test", role: "lead", guardianId: sarahGuardian.id, userId: parentUserId },
    { name: "Lily Chen", email: g("Chen").email, role: "member", guardianId: g("Chen").id },
    { name: "Luis Garcia", email: g("Garcia").email, role: "member", guardianId: g("Garcia").id },
    { name: "Maya Rivera", email: "maya@your-school.test", role: "faculty_liaison", userId: teacherUserId, staffId: mayaStaffId },
  ]);
  await addMembers(events.id, [
    { name: "Dana Johnson", email: g("Johnson").email, role: "lead", guardianId: g("Johnson").id },
    { name: "Grace Kim", email: g("Kim").email, role: "member", guardianId: g("Kim").id },
    { name: "Sarah Mitchell", email: "sarah@your-school.test", role: "member", guardianId: sarahGuardian.id, userId: parentUserId },
    { name: "Priya Shah", email: "priya.shah@your-school.test", role: "faculty_liaison", staffId: priyaStaffId },
  ]);
  await addMembers(fundraising.id, [
    { name: "Raj Patel", email: g("Patel").email, role: "lead", guardianId: g("Patel").id },
    { name: "Claire Bennett", email: g("Bennett").email, role: "member", guardianId: g("Bennett").id },
  ]);
  const byName = (n: string) => gardenMembers.find((m) => m.display_name === n)!.id;
  check(
    await db.from("committee_tasks").insert([
      { committee_id: garden.id, title: "Order winter cover crop seed", group_key: "annual_fall", status: "done", assignee_member_id: byName("Lily Chen"), due_date: addDays(todayStr, -6), sort_order: 0 },
      { committee_id: garden.id, title: "Mulch the raised beds", group_key: "annual_fall", status: "in_progress", assignee_member_id: byName("Luis Garcia"), due_date: addDays(todayStr, 5), sort_order: 1 },
      { committee_id: garden.id, title: "Plan the spring seedling sale", group_key: "annual_spring", status: "open", due_date: inMonth(nextMonthStart, 15), sort_order: 2 },
      { committee_id: garden.id, title: "Restock mud kitchen pots and spoons", group_key: "general", status: "claimed", assignee_member_id: byName("Sarah Mitchell"), due_date: addDays(todayStr, 9), sort_order: 3 },
    ]),
    "committee tasks",
  );
  check(
    await db.from("committee_events").insert([
      { committee_id: garden.id, title: "Garden work morning", event_date: addDays(todayStr, 6), event_time: "8:30 AM", event_type: "service", location: "Raised beds" },
      { committee_id: garden.id, title: "Committee check-in", event_date: inMonth(nextMonthStart, 10), event_time: "6:30 PM", event_type: "meeting", location: "Video call" },
    ]),
    "committee events",
  );
  check(
    await db.from("committee_messages").insert([
      { committee_id: garden.id, sender_member_id: byName("Lily Chen"), body: "Cover crop seed arrived! It's in the shed by the door.", created_at: at(addDays(todayStr, -2), "10:12") },
      { committee_id: garden.id, sender_member_id: byName("Maya Rivera"), body: "The kids would love to help plant it on Tuesday morning if anyone can join.", created_at: at(addDays(todayStr, -2), "13:40") },
      { committee_id: garden.id, sender_member_id: byName("Sarah Mitchell"), body: "I can be there at 8:30 with extra gloves.", created_at: at(addDays(todayStr, -1), "19:05") },
    ]),
    "committee messages",
  );
  const parkGuardian = guardianOf(park.id);
  check(
    await db.from("committee_join_requests").insert({ organization_id: orgId, committee_id: events.id, user_id: applicantUserId, guardian_id: parkGuardian.id, grade: "1", note: "Happy to help with set-up and photos at the winter showcase!", status: "pending" }),
    "join request",
  );

  // ---------- classroom signups (Maya, Little Learners)
  const fridays = [nextDow(addDays(todayStr, 1), 5), addDays(nextDow(addDays(todayStr, 1), 5), 7), addDays(nextDow(addDays(todayStr, 1), 5), 14)].map((d) => (d === "2026-11-27" ? addDays(d, 7) : d));
  const uniqFridays = [...new Set(fridays)];
  const label = (d: string) => new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "UTC" }).format(dateObj(d));
  const slots = uniqFridays.flatMap((d, i) => [
    { id: `slot-${i}-a`, label: label(d), date: d, startTime: "08:30", endTime: "08:50", capacity: 1 },
    { id: `slot-${i}-b`, label: label(d), date: d, startTime: "08:50", endTime: "09:10", capacity: 1 },
  ]);
  const reading = check(
    await db
      .from("classroom_signups")
      .insert({
        organization_id: orgId,
        created_by_staff_member_id: mayaStaffId,
        title: "Reading buddies — December",
        description: "Join us on Friday mornings for a 20-minute read-aloud with a small group. Bring a favorite picture book!",
        signup_type: "time_slots",
        audience: "classroom",
        classroom_id: littleRoom.id,
        classroom_ids: [littleRoom.id],
        family_count: littleKids.length,
        status: "open",
        response_deadline: at(addDays(uniqFridays[0], -1), "23:59"),
        config: { slots, allowMultipleSelections: false, audienceClassroomNames: ["Little Learners"] },
        published_at: at(addDays(todayStr, -4), "16:00"),
      })
      .select("id")
      .single(),
    "reading signup",
  ) as { id: string };
  const roles = [
    { id: "role-setup", name: "Set-up crew", description: "Arrange chairs and hang artwork (3:00–3:45 PM).", quantityNeeded: 3 },
    { id: "role-snacks", name: "Snack table", description: "Bring a snack to share and help serve.", quantityNeeded: 4 },
    { id: "role-photos", name: "Photographer", description: "Take photos for the newsletter.", quantityNeeded: 1 },
    { id: "role-cleanup", name: "Clean-up crew", description: "Stay 20 minutes after to tidy up.", quantityNeeded: 2 },
  ];
  const showcase = check(
    await db
      .from("classroom_signups")
      .insert({
        organization_id: orgId,
        created_by_staff_member_id: mayaStaffId,
        title: "Winter art showcase helpers",
        description: "Our showcase is December 11 at 4:00 PM. Pick a way to help — every bit counts!",
        signup_type: "roles",
        audience: "classroom",
        classroom_id: littleRoom.id,
        classroom_ids: [littleRoom.id],
        family_count: littleKids.length,
        status: "open",
        response_deadline: at("2026-12-07", "23:59"),
        config: { roles, allowMultipleSelections: true, audienceClassroomNames: ["Little Learners"] },
        published_at: at(addDays(todayStr, -6), "15:30"),
      })
      .select("id")
      .single(),
    "showcase signup",
  ) as { id: string };
  const resp = (signupId: string, last: string, first: string, slotIds: string[], roleIds: string[], note: string | null, daysAgo: number) => {
    const s = kid(first, last);
    return { organization_id: orgId, signup_id: signupId, family_id: s.family_id, student_id: s.id, selected_slot_ids: slotIds, selected_role_ids: roleIds, note, status: "confirmed", created_at: at(addDays(todayStr, -daysAgo), "19:30") };
  };
  check(
    await db.from("classroom_signup_responses").insert([
      resp(reading.id, "Chen", "Ava", ["slot-0-a"], [], "We'll bring The Snowy Day!", 3),
      resp(reading.id, "Patel", "Noah", ["slot-1-a"], [], null, 2),
      resp(reading.id, "Garcia", "Leo", ["slot-0-b"], [], null, 1),
      resp(showcase.id, "Mitchell", "Emma", [], ["role-snacks", "role-photos"], "Happy to bring fruit skewers.", 4),
      resp(showcase.id, "Johnson", "Mia", [], ["role-setup"], null, 3),
      resp(showcase.id, "Kim", "Zoe", [], ["role-snacks"], null, 2),
      resp(showcase.id, "Garcia", "Leo", [], ["role-cleanup"], null, 1),
    ]),
    "signup responses",
  );

  // ---------- forms & documents
  // base Photo Release Form: give it real fields and per-family student names
  const photoForm = check(await db.from("teacher_parent_forms").select("id").eq("organization_id", orgId).eq("title", "Photo Release Form").single(), "photo form") as { id: string };
  check(
    await db
      .from("teacher_parent_forms")
      .update({
        config: {
          classroomNames: ["Little Learners"],
          fields: [
            { id: "consent", type: "multiple_choice", label: "May we share photos of your child with families in the app?", required: true, options: ["Yes, any photos", "Group photos only", "No photos"] },
            { id: "newsletter", type: "checkbox", label: "Photos may appear in the weekly newsletter", required: false },
            { id: "signature", type: "signature", label: "Parent or guardian signature", required: true, locked: true },
          ],
        },
        total_families: littleKids.length,
      })
      .eq("id", photoForm.id),
    "photo form fields",
  );
  for (const s of littleKids) {
    check(await db.from("teacher_parent_form_responses").update({ student_ids: [s.id] }).eq("form_id", photoForm.id).eq("family_id", s.family_id), "photo form students");
  }
  const tripForm = check(
    await db
      .from("teacher_parent_forms")
      .insert({
        organization_id: orgId,
        created_by_staff_member_id: mayaStaffId,
        title: MY_FORM_TITLES[0],
        description: "We're visiting the City Botanical Garden on December 4, 9:00 AM–1:00 PM. Please sign so your child can come along.",
        form_type: "builder",
        form_category: "general",
        status: "active",
        audience_type: "classrooms",
        classroom_ids: [littleRoom.id],
        family_ids: [],
        require_signature: true,
        config: {
          classroomNames: ["Little Learners"],
          fields: [
            { id: "permission", type: "checkbox", label: "My child may attend the field trip to the City Botanical Garden", required: true },
            { id: "chaperone", type: "multiple_choice", label: "Can you chaperone?", required: false, options: ["Yes", "No", "Maybe"] },
            { id: "notes", type: "long_text", label: "Anything we should know for the day? (allergies, motion sickness…)", required: false },
            { id: "signature", type: "signature", label: "Parent or guardian signature", required: true, locked: true },
          ],
        },
        due_date: "2026-12-02",
        total_families: littleKids.length,
        signed_families: 2,
        published_at: at(addDays(todayStr, -2), "16:10"),
      })
      .select("id")
      .single(),
    "trip form",
  ) as { id: string };
  check(
    await db.from("teacher_parent_form_responses").insert(
      littleKids.map((s, i) => {
        const signed = s.last_name === "Chen" || s.last_name === "Kim";
        return { organization_id: orgId, form_id: tripForm.id, family_id: s.family_id, student_ids: [s.id], status: signed ? "signed" : "pending", signed_at: signed ? at(addDays(todayStr, -1), `20:${String(10 + i).padStart(2, "0")}`) : null, responses: signed ? { permission: true, chaperone: i % 2 ? "Yes" : "Maybe" } : {} };
      }),
    ),
    "trip responses",
  );
  // Handbook PDF for every family, needs a signature to acknowledge
  const handbookId = crypto.randomUUID();
  const handbookPath = `${orgId}/forms/${handbookId}/${crypto.randomUUID()}_Family-Handbook-2026-27.pdf`;
  const pdf = buildHandbookPdf();
  await uploadBytes("teacher-parent-form-files", handbookPath, pdf, "application/pdf");
  const handbookFamilies = [...new Set(allEnrolled.map((s) => s.family_id))];
  check(
    await db.from("teacher_parent_forms").insert({
      id: handbookId,
      organization_id: orgId,
      created_by_staff_member_id: morganStaffId,
      title: MY_FORM_TITLES[1],
      description: "Our day-to-day guide: drop-off and pickup, outdoor time, health, tuition and communication. Please read and sign.",
      form_type: "upload",
      form_category: "general",
      status: "active",
      audience_type: "classrooms",
      classroom_ids: [littleRoom.id, explorers.id],
      family_ids: [],
      require_signature: true,
      config: { classroomNames: ["Little Learners", EXPLORERS], upload: { storagePath: handbookPath, fileName: "Family-Handbook-2026-27.pdf", fileSizeBytes: pdf.length, mimeType: "application/pdf", uploadFormat: "pdf" } },
      due_date: inMonth(nextMonthStart, 5),
      total_families: handbookFamilies.length,
      signed_families: handbookFamilies.length - 3,
      published_at: at("2026-08-12", "10:00"),
    }),
    "handbook form",
  );
  check(
    await db.from("teacher_parent_form_responses").insert(
      handbookFamilies.map((familyId, i) => {
        const pending = i >= handbookFamilies.length - 3 && familyId !== mitchell.id;
        return { organization_id: orgId, form_id: handbookId, family_id: familyId, student_ids: allEnrolled.filter((s) => s.family_id === familyId).map((s) => s.id), status: pending ? "pending" : "signed", signed_at: pending ? null : at(addDays("2026-08-14", i), "19:00") };
      }),
    ),
    "handbook responses",
  );

  // ---------- messages: office threads (admin inbox) + another teacher thread
  // portal_messages.sender_user_id is required, so classmate guardians who message get a fictional local login.
  async function guardianUserId(guardianId: string): Promise<string> {
    const gr = guardians.find((x) => x.id === guardianId)!;
    if (gr.user_id) return gr.user_id;
    const email = gr.email.toLowerCase();
    let uid: string | null = null;
    for (let page = 1; !uid; page += 1) {
      const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      uid = data.users.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
      if (data.users.length < 200) break;
    }
    if (!uid) {
      const { data, error } = await db.auth.admin.createUser({ email, password: crypto.randomUUID(), email_confirm: true, user_metadata: { full_name: `${gr.first_name} ${gr.last_name}`, first_name: gr.first_name } });
      if (error || !data.user) throw error ?? new Error(`createUser ${email}`);
      uid = data.user.id;
    }
    check(await db.from("guardians").update({ user_id: uid }).eq("id", gr.id), "guardian user");
    await db.from("organization_memberships").upsert({ organization_id: orgId, user_id: uid, role: "parent", status: "active" }, { onConflict: "organization_id,user_id", ignoreDuplicates: true });
    gr.user_id = uid;
    return uid;
  }
  async function thread(subject: string, participants: Array<{ kind: "guardian"; guardianId: string } | { kind: "staff_member"; staffMemberId: string } | { kind: "school_office" }>, msgs: Array<{ from: "guardian" | "staff" | "office"; body: string; at: string; guardianId?: string; userId?: string | null; staffId?: string }>) {
    const last = msgs[msgs.length - 1].at;
    const t = check(
      await db.from("message_threads").insert({ organization_id: orgId, subject, participant_signature: buildParticipantSignature(participants as never), last_message_at: last, program_id: null }).select("id").single(),
      "thread",
    ) as { id: string };
    check(
      await db.from("message_thread_participants").insert(
        participants.map((p) =>
          p.kind === "guardian"
            ? { thread_id: t.id, organization_id: orgId, participant_kind: "guardian", guardian_id: p.guardianId }
            : p.kind === "staff_member"
              ? { thread_id: t.id, organization_id: orgId, participant_kind: "staff_member", staff_member_id: p.staffMemberId }
              : { thread_id: t.id, organization_id: orgId, participant_kind: "school_office" },
        ),
      ),
      "thread participants",
    );
    for (const m of msgs) if (m.from === "guardian" && !m.userId) m.userId = await guardianUserId(m.guardianId!);
    check(
      await db.from("portal_messages").insert(
        msgs.map((m) => ({
          thread_id: t.id,
          organization_id: orgId,
          body: m.body,
          created_at: m.at,
          sender_user_id: m.userId ?? null,
          sender_kind: m.from === "guardian" ? "guardian" : m.from === "office" ? "org_admin" : "staff_member",
          sender_guardian_id: m.from === "guardian" ? m.guardianId : null,
          sender_staff_member_id: m.from === "staff" ? m.staffId : null,
        })),
      ),
      "thread messages",
    );
  }
  const y1 = addDays(todayStr, -1);
  const y2 = addDays(todayStr, -2);
  const y3 = addDays(todayStr, -3);
  const office = { kind: "school_office" as const };
  await thread("Coat drive drop-off", [{ kind: "guardian", guardianId: g("Chen").id }, office], [
    { from: "guardian", guardianId: g("Chen").id, body: "Hi! Can we drop coats off before 8 tomorrow, or is the porch basket only out during the day?", at: at(y1, "18:20") },
    { from: "office", userId: adminUserId, body: "The basket is out from 7:45 AM — leave them any time after that. Thank you, Lily!", at: at(y1, "18:42") },
    { from: "guardian", guardianId: g("Chen").id, body: "Perfect, we have three bags ready 🧥", at: at(todayStr, "07:05") },
  ]);
  await thread("December tuition question", [{ kind: "guardian", guardianId: sarahGuardian.id }, office], [
    { from: "guardian", guardianId: sarahGuardian.id, userId: parentUserId, body: "Quick question — does autopay pull Liam's activity fee too, or should I pay that one separately?", at: at(y2, "20:15") },
    { from: "office", userId: adminUserId, body: "Autopay covers tuition installments. The $75 activity fee is a one-time charge — you can pay it from Billing whenever it suits you.", at: at(y1, "08:40") },
  ]);
  await thread("Pickup change Friday", [{ kind: "guardian", guardianId: g("Patel").id }, office], [
    { from: "guardian", guardianId: g("Patel").id, body: "Noah's grandpa will pick him up on Friday. He's already on our pickup list.", at: at(y2, "12:05") },
    { from: "office", userId: adminUserId, body: "Got it — we'll let Maya know. See you Friday!", at: at(y2, "12:30") },
  ]);
  await thread("Ava's inhaler refill", [{ kind: "guardian", guardianId: g("Chen").id }, { kind: "staff_member", staffMemberId: mayaStaffId }], [
    { from: "staff", staffId: mayaStaffId, userId: teacherUserId, body: "Ava's inhaler is getting low — could you send a refill next week?", at: at(y3, "14:50") },
    { from: "guardian", guardianId: g("Chen").id, body: "Thanks for the heads up! I'll drop one off Monday.", at: at(y3, "17:22") },
  ]);
  await thread("Noah's reading", [{ kind: "guardian", guardianId: g("Patel").id }, { kind: "staff_member", staffMemberId: mayaStaffId }], [
    { from: "guardian", guardianId: g("Patel").id, body: "Noah has been asking to read to his little sister every night!", at: at(y1, "19:40") },
    { from: "staff", staffId: mayaStaffId, userId: teacherUserId, body: "That's wonderful — he's been so proud of his reading buddy sessions too.", at: at(todayStr, "07:55") },
  ]);
  await thread("Conference times", [{ kind: "staff_member", staffMemberId: mayaStaffId }, office], [
    { from: "staff", staffId: mayaStaffId, userId: teacherUserId, body: "Could I take the 12:30–3:00 block for conferences on the 8th?", at: at(y2, "16:10") },
    { from: "office", userId: adminUserId, body: "Yes — it's yours. I'll add it to the staff calendar.", at: at(y2, "16:35") },
  ]);

  // ---------- tuition for the other enrolled families + payment records (admin Tuition / Transactions)
  const ratePlans = check(await db.from("tuition_rate_plans").select("id, program_id").eq("organization_id", orgId), "rate plans") as Array<{ id: string; program_id: string }>;
  const payPlans = check(await db.from("tuition_payment_plans").select("id, rate_plan_id, installment_amount_cents").eq("organization_id", orgId), "pay plans") as Array<{ id: string; rate_plan_id: string; installment_amount_cents: number }>;
  const otherKids = allEnrolled.filter((s) => s.family_id !== mitchell.id);
  // re-runs: clear tuition rows this script added for the other families (Mitchell's come from the base seed)
  check(await db.from("tuition_charges").delete().eq("organization_id", orgId).neq("family_id", mitchell.id), "clean charges");
  check(await db.from("tuition_enrollment_assignments").delete().eq("organization_id", orgId).neq("family_id", mitchell.id), "clean assignments");
  check(await db.from("tuition_billing_accounts").delete().eq("organization_id", orgId).neq("family_id", mitchell.id), "clean billing accounts");
  const months: Array<[string, number]> = [["2026-09-15", 1], ["2026-10-15", 2], ["2026-11-15", 3], ["2026-12-15", 4]];
  const paymentRows: Array<Record<string, unknown>> = [];
  for (const [si, s] of otherKids.entries()) {
    const e = enrollments.find((x) => x.student_id === s.id && x.status === "enrolled")!;
    const rp = ratePlans.find((r) => r.program_id === e.program_id)!;
    const pp = payPlans.find((p) => p.rate_plan_id === rp.id)!;
    const gd = guardianOf(s.family_id);
    const autopay = si % 3 !== 2;
    const existing = check(await db.from("tuition_billing_accounts").select("id").eq("family_id", s.family_id).maybeSingle(), "billing acct?") as { id: string } | null;
    if (!existing) {
      check(await db.from("tuition_billing_accounts").insert({ organization_id: orgId, family_id: s.family_id, autopay_enabled: autopay, default_payment_method_id: autopay ? `pm_demo_${si}` : null, billing_email: gd.email, status: "active" }), "billing acct");
    }
    const assignment = check(
      await db.from("tuition_enrollment_assignments").insert({ organization_id: orgId, enrollment_id: e.id, family_id: s.family_id, rate_plan_id: rp.id, payment_plan_id: pp.id, assignment_source: "default", status: "active", effective_start: "2026-08-01" }).select("id").single(),
      "assignment",
    ) as { id: string };
    for (const [due, n] of months) {
      const isPast = due < todayStr;
      const overdue = isPast && n === 3 && si === 4;
      const status = !isPast ? "scheduled" : overdue ? "overdue" : "paid";
      const charge = check(
        await db
          .from("tuition_charges")
          .insert({
            organization_id: orgId,
            assignment_id: assignment.id,
            family_id: s.family_id,
            guardian_id: gd.id,
            label: `Tuition installment — ${s.first_name}`,
            base_amount_cents: pp.installment_amount_cents,
            amount_cents: pp.installment_amount_cents,
            paid_cents: status === "paid" ? pp.installment_amount_cents : 0,
            due_date: due,
            status,
            charge_type: "tuition",
            installment_number: n,
            sent_at: isPast ? at(addDays(due, -7), "09:00") : null,
            paid_at: status === "paid" ? at(addDays(due, si % 2), "06:00") : null,
          })
          .select("id")
          .single(),
        "charge",
      ) as { id: string };
      if (status === "paid") {
        const card = si % 2 === 0;
        const fee = card ? Math.round(pp.installment_amount_cents * 0.029 + 30) : Math.min(500, Math.round(pp.installment_amount_cents * 0.008));
        paymentRows.push({ organization_id: orgId, family_id: s.family_id, tuition_charge_id: charge.id, payment_type: "tuition", label: `Tuition installment — ${s.first_name}`, amount_cents: pp.installment_amount_cents, amount_applied_cents: pp.installment_amount_cents, charged_amount_cents: pp.installment_amount_cents, processing_fee_cents: fee, payment_method_type: card ? "card" : "us_bank_account", status: "succeeded", stripe_payment_intent_id: `pi_demo_${si}_${n}`, created_at: at(addDays(due, si % 2), "06:00"), paid_at: at(addDays(due, si % 2), "06:00") });
      }
    }
  }
  // Mitchell's paid installments (autopay card) + Liam's activity fee still open
  const mitchellPaid = check(await db.from("tuition_charges").select("id, label, amount_cents, paid_at, due_date").eq("family_id", mitchell.id).eq("status", "paid"), "mitchell paid") as Array<{ id: string; label: string; amount_cents: number; paid_at: string; due_date: string }>;
  for (const c of mitchellPaid) {
    paymentRows.push({ organization_id: orgId, family_id: mitchell.id, payer_user_id: parentUserId, tuition_charge_id: c.id, payment_type: "tuition", label: c.label, amount_cents: c.amount_cents, amount_applied_cents: c.amount_cents, charged_amount_cents: c.amount_cents, processing_fee_cents: Math.round(c.amount_cents * 0.029 + 30), payment_method_type: "card", status: "succeeded", stripe_payment_intent_id: `pi_demo_mitchell_${c.due_date}`, created_at: c.paid_at, paid_at: c.paid_at });
  }
  // application fees + an enrollment deposit + a failed payment
  for (const [i, a] of apps.filter((x) => x.status !== "enrolling").slice(0, 3).entries()) {
    paymentRows.push({ organization_id: orgId, application_id: a.id, family_id: a.family_id, payment_type: "application_fee", label: "Application fee", amount_cents: 7500, charged_amount_cents: 7500, processing_fee_cents: 248, payment_method_type: "card", status: "succeeded", stripe_payment_intent_id: `pi_demo_app_${i}`, created_at: at(addDays(todayStr, -(i * 3 + 2)), "20:00"), paid_at: at(addDays(todayStr, -(i * 3 + 2)), "20:00") });
  }
  const owenApp = apps.find((a) => a.status === "enrolling");
  if (owenApp) {
    paymentRows.push({ organization_id: orgId, application_id: owenApp.id, family_id: owenApp.family_id, payer_user_id: applicantUserId, payment_type: "enrollment_checklist", label: "Enrollment deposit", amount_cents: 50000, charged_amount_cents: 50000, processing_fee_cents: 0, payment_method_type: "us_bank_account", status: "failed", stripe_payment_intent_id: "pi_demo_deposit_failed", created_at: at(addDays(todayStr, -1), "11:00") });
  }
  check(await db.from("application_payments").insert(paymentRows), "payments");

  console.log(`Added feature data to ${YOUR_SCHOOL_NAME} (${SLUG}) on ${url}: ${allEnrolled.length} enrolled students, ${galleryIds.length} photos, ${hours.length} time entries, ${paymentRows.length} payments.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
