import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { DEFAULT_BRANDING, DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
import { buildApplySystemSection, emptyApplyCustomSection } from "@/lib/admissions/apply-system-fields";
import {
  E2E_ADMIN_EMAIL,
  E2E_NONADMIN_EMAIL,
  E2E_OTHER_PARENT_EMAIL,
  E2E_PARENT_EMAIL,
  E2E_TEST_PASSWORD,
  TEST_ORG_SLUG,
} from "./constants";

type TestUserSpec = {
  email: string;
  password: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`E2E seed aborted: missing ${name}`);
  }
  return value;
}

function createAdminClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      realtime: {
        // ws constructor types differ from Supabase's WebSocketLikeConstructor
        transport: ws as never,
      },
    },
  );
}

function runDbQuery(sql: string): void {
  const file = path.join(os.tmpdir(), `schoolstack-e2e-${process.pid}.sql`);
  fs.writeFileSync(file, sql, "utf8");

  try {
    execSync(`supabase db query --file ${JSON.stringify(file)}`, {
      stdio: "pipe",
      encoding: "utf8",
    });
  } finally {
    fs.unlinkSync(file);
  }
}

function sqlJson(value: unknown): string {
  return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
}

async function findUserIdByEmail(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;

    const match = data.users.find(
      (user) => user.email?.trim().toLowerCase() === normalized,
    );
    if (match) return match.id;

    if (data.users.length < 200) break;
    page += 1;
  }

  return null;
}

async function ensureAuthUser(
  admin: ReturnType<typeof createAdminClient>,
  { email, password }: TestUserSpec,
): Promise<string> {
  const existingId = await findUserIdByEmail(admin, email);

  if (existingId) {
    const { error } = await admin.auth.admin.updateUserById(existingId, {
      password,
      email_confirm: true,
    });
    if (error) throw error;
    return existingId;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  if (!data.user) {
    throw new Error(`Failed to create E2E user for ${email}`);
  }

  return data.user.id;
}

async function getOrganizationId(
  admin: ReturnType<typeof createAdminClient>,
): Promise<string> {
  const { data, error } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", TEST_ORG_SLUG)
    .maybeSingle();

  if (error) throw error;
  if (!data?.id) {
    throw new Error(
      `E2E seed aborted: organization "${TEST_ORG_SLUG}" not found. Run supabase db reset.`,
    );
  }

  return data.id;
}

type ApplicationFormContext = {
  programId: string;
  formVersionId: string;
};

async function ensureE2eApplicationFormContext(
  admin: ReturnType<typeof createAdminClient>,
  organizationId: string,
): Promise<ApplicationFormContext> {
  const { data: existingProgram, error: programLookupError } = await admin
    .from("programs")
    .select("id")
    .eq("organization_id", organizationId)
    .limit(1)
    .maybeSingle();

  if (programLookupError) throw programLookupError;

  let programId = existingProgram?.id as string | undefined;
  if (!programId) {
    const { data: program, error: programInsertError } = await admin
      .from("programs")
      .insert({
        organization_id: organizationId,
        name: "E2E Program",
        type: "school_year",
        status: "open",
      })
      .select("id")
      .single();

    if (programInsertError) throw programInsertError;
    programId = program.id as string;
  }

  const { data: existingForms, error: formLookupError } = await admin
    .from("application_form_versions")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("public_slug", "apply")
    .in("status", ["draft", "published"])
    .order("version", { ascending: false })
    .limit(1);

  if (formLookupError) throw formLookupError;

  let formVersionId = existingForms?.[0]?.id as string | undefined;
  const e2eFormFeeConfig = {
    enabled: false,
    label: "Application fee",
    amount_cents: 0,
    required_to_submit: true,
  };
  const e2eFormSchema = {
    sections: [buildApplySystemSection(), emptyApplyCustomSection()],
    acknowledgments: [],
  };

  if (!formVersionId) {
    const { data: formVersion, error: formInsertError } = await admin
      .from("application_form_versions")
      .insert({
        organization_id: organizationId,
        program_id: programId,
        version: 1,
        status: "published",
        title: "E2E Application",
        public_slug: "apply",
        schema: e2eFormSchema,
        fee_config: e2eFormFeeConfig,
        published_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (formInsertError) throw formInsertError;
    formVersionId = formVersion.id as string;
  } else {
    const { error: formUpdateError } = await admin
      .from("application_form_versions")
      .update({
        public_slug: "apply",
        schema: e2eFormSchema,
        fee_config: e2eFormFeeConfig,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", formVersionId);

    if (formUpdateError) throw formUpdateError;
  }

  return { programId, formVersionId };
}

async function ensureE2eFeeApplicationFormContext(
  admin: ReturnType<typeof createAdminClient>,
  organizationId: string,
  programId: string,
): Promise<string> {
  const { data: existingForm, error: formLookupError } = await admin
    .from("application_form_versions")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("public_slug", "apply-with-fee")
    .in("status", ["draft", "published"])
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (formLookupError) throw formLookupError;

  const e2eFormSchema = {
    sections: [buildApplySystemSection(), emptyApplyCustomSection()],
    acknowledgments: [],
  };
  const e2eFormFeeConfig = {
    enabled: true,
    label: "Application fee",
    amount_cents: 5000,
    required_to_submit: true,
  };

  if (existingForm?.id) {
    const { error: formUpdateError } = await admin
      .from("application_form_versions")
      .update({
        schema: e2eFormSchema,
        fee_config: e2eFormFeeConfig,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", existingForm.id);

    if (formUpdateError) throw formUpdateError;
    return String(existingForm.id);
  }

  const { data: maxVersionRow, error: versionLookupError } = await admin
    .from("application_form_versions")
    .select("version")
    .eq("organization_id", organizationId)
    .eq("program_id", programId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (versionLookupError) throw versionLookupError;

  const nextVersion = Number(maxVersionRow?.version ?? 0) + 1;

  const { data: formVersion, error: formInsertError } = await admin
    .from("application_form_versions")
    .insert({
      organization_id: organizationId,
      program_id: programId,
      version: nextVersion,
      status: "published",
      title: "E2E Application With Fee",
      public_slug: "apply-with-fee",
      schema: e2eFormSchema,
      fee_config: e2eFormFeeConfig,
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (formInsertError) throw formInsertError;
  return String(formVersion.id);
}

async function ensureE2ePaymentAccount(
  admin: ReturnType<typeof createAdminClient>,
  organizationId: string,
): Promise<void> {
  const { error } = await admin.from("organization_payment_accounts").upsert(
    {
      organization_id: organizationId,
      stripe_connect_account_id: "acct_test_e2e_connect",
      onboarding_status: "complete",
      charges_enabled: true,
      payouts_enabled: true,
    },
    { onConflict: "organization_id" },
  );

  if (error) throw error;
}

async function seedNoFeeDraftApplication(
  admin: ReturnType<typeof createAdminClient>,
  input: {
    organizationId: string;
    userId: string;
    email: string;
    formContext: ApplicationFormContext;
  },
): Promise<string> {
  const { data: family, error: familyError } = await admin
    .from("families")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("primary_email", input.email)
    .maybeSingle();

  if (familyError) throw familyError;
  if (!family?.id) {
    throw new Error(`E2E no-fee draft seed aborted: family not found for ${input.email}`);
  }

  const { data: guardian, error: guardianError } = await admin
    .from("guardians")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (guardianError) throw guardianError;
  if (!guardian?.id) {
    throw new Error(`E2E no-fee draft seed aborted: guardian not found for ${input.email}`);
  }

  const { data: existingDraft, error: existingDraftError } = await admin
    .from("applications")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("created_by_user_id", input.userId)
    .eq("form_version_id", input.formContext.formVersionId)
    .eq("status", "draft")
    .maybeSingle();

  if (existingDraftError) throw existingDraftError;

  const responses = {
    student_first_name: "NoFee",
    student_last_name: "Draft",
    student_date_of_birth: "2020-07-20",
    student_grade: "k",
  };

  if (existingDraft?.id) {
    const { error: updateError } = await admin
      .from("applications")
      .update({
        fee_status: "not_required",
        responses,
        acknowledgments: {},
      })
      .eq("id", existingDraft.id);

    if (updateError) throw updateError;
    return String(existingDraft.id);
  }

  const { data: application, error: applicationError } = await admin
    .from("applications")
    .insert({
      organization_id: input.organizationId,
      program_id: input.formContext.programId,
      form_version_id: input.formContext.formVersionId,
      family_id: family.id,
      primary_guardian_id: guardian.id,
      created_by_user_id: input.userId,
      status: "draft",
      fee_status: "not_required",
      responses,
      acknowledgments: {},
    })
    .select("id")
    .single();

  if (applicationError) throw applicationError;
  return String(application.id);
}

async function seedFeePendingDraftApplication(
  admin: ReturnType<typeof createAdminClient>,
  input: {
    organizationId: string;
    userId: string;
    email: string;
    formContext: ApplicationFormContext & { feeFormVersionId: string };
  },
): Promise<string> {
  const { data: family, error: familyError } = await admin
    .from("families")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("primary_email", input.email)
    .maybeSingle();

  if (familyError) throw familyError;
  if (!family?.id) {
    throw new Error(`E2E fee draft seed aborted: family not found for ${input.email}`);
  }

  const { data: guardian, error: guardianError } = await admin
    .from("guardians")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (guardianError) throw guardianError;
  if (!guardian?.id) {
    throw new Error(`E2E fee draft seed aborted: guardian not found for ${input.email}`);
  }

  const { data: existingDraft, error: existingDraftError } = await admin
    .from("applications")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("created_by_user_id", input.userId)
    .eq("form_version_id", input.formContext.feeFormVersionId)
    .eq("status", "draft")
    .maybeSingle();

  if (existingDraftError) throw existingDraftError;

  const responses = {
    student_first_name: "Fee",
    student_last_name: "Pending",
    student_date_of_birth: "2020-07-20",
    student_grade: "k",
  };

  if (existingDraft?.id) {
    const { error: updateError } = await admin
      .from("applications")
      .update({
        fee_status: "pending",
        responses,
        acknowledgments: {},
      })
      .eq("id", existingDraft.id);

    if (updateError) throw updateError;
    return String(existingDraft.id);
  }

  const { data: application, error: applicationError } = await admin
    .from("applications")
    .insert({
      organization_id: input.organizationId,
      program_id: input.formContext.programId,
      form_version_id: input.formContext.feeFormVersionId,
      family_id: family.id,
      primary_guardian_id: guardian.id,
      created_by_user_id: input.userId,
      status: "draft",
      fee_status: "pending",
      responses,
      acknowledgments: {},
    })
    .select("id")
    .single();

  if (applicationError) throw applicationError;
  return String(application.id);
}

type SeedParentApplicationInput = {
  organizationId: string;
  userId: string;
  email: string;
  familyName: string;
  studentName: string;
  formContext: ApplicationFormContext;
};

async function seedParentApplication(
  admin: ReturnType<typeof createAdminClient>,
  {
    organizationId,
    userId,
    email,
    familyName,
    studentName,
    formContext,
  }: SeedParentApplicationInput,
): Promise<string> {
  const { error: membershipError } = await admin
    .from("organization_memberships")
    .upsert(
      {
        organization_id: organizationId,
        user_id: userId,
        role: "parent",
        status: "active",
      },
      { onConflict: "organization_id,user_id" },
    );

  if (membershipError) throw membershipError;

  const { data: existingFamily, error: familyLookupError } = await admin
    .from("families")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("primary_email", email)
    .maybeSingle();

  if (familyLookupError) throw familyLookupError;

  let familyId = existingFamily?.id as string | undefined;
  if (!familyId) {
    const { data: family, error: familyInsertError } = await admin
      .from("families")
      .insert({
        organization_id: organizationId,
        name: familyName,
        primary_email: email,
      })
      .select("id")
      .single();

    if (familyInsertError) throw familyInsertError;
    familyId = family.id as string;
  }

  const { data: existingGuardian, error: guardianLookupError } = await admin
    .from("guardians")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (guardianLookupError) throw guardianLookupError;

  let guardianId = existingGuardian?.id as string | undefined;
  if (!guardianId) {
    const { data: guardian, error: guardianInsertError } = await admin
      .from("guardians")
      .insert({
        organization_id: organizationId,
        family_id: familyId,
        user_id: userId,
        first_name: "E2E",
        last_name: "Parent",
        email,
        relationship: "parent",
      })
      .select("id")
      .single();

    if (guardianInsertError) throw guardianInsertError;
    guardianId = guardian.id as string;
  }

  const [studentFirstName, ...studentLastParts] = studentName.split(" ");
  const studentLastName = studentLastParts.join(" ") || "Student";
  const responses = {
    student_first_name: studentFirstName,
    student_last_name: studentLastName,
  };

  await admin
    .from("applications")
    .delete()
    .eq("organization_id", organizationId)
    .eq("created_by_user_id", userId);

  const { data: application, error: applicationInsertError } = await admin
    .from("applications")
    .insert({
      organization_id: organizationId,
      program_id: formContext.programId,
      form_version_id: formContext.formVersionId,
      family_id: familyId,
      primary_guardian_id: guardianId,
      created_by_user_id: userId,
      status: "submitted",
      submitted_at: new Date().toISOString(),
      responses,
    })
    .select("id")
    .single();

  if (applicationInsertError) throw applicationInsertError;
  if (!application?.id) {
    throw new Error(`Failed to seed application for ${email}`);
  }

  return application.id as string;
}

async function seedAdditionalSubmittedApplication(
  admin: ReturnType<typeof createAdminClient>,
  {
    organizationId,
    userId,
    email,
    studentName,
    formContext,
  }: Omit<SeedParentApplicationInput, "familyName">,
): Promise<string> {
  const { data: family, error: familyLookupError } = await admin
    .from("families")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("primary_email", email)
    .maybeSingle();

  if (familyLookupError) throw familyLookupError;
  if (!family?.id) {
    throw new Error(`E2E additional application seed aborted: family not found for ${email}`);
  }

  const { data: guardian, error: guardianLookupError } = await admin
    .from("guardians")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (guardianLookupError) throw guardianLookupError;
  if (!guardian?.id) {
    throw new Error(`E2E additional application seed aborted: guardian not found for ${email}`);
  }

  const [studentFirstName, ...studentLastParts] = studentName.split(" ");
  const studentLastName = studentLastParts.join(" ") || "Student";
  const responses = {
    student_first_name: studentFirstName,
    student_last_name: studentLastName,
    student_date_of_birth: "2020-07-20",
    student_grade: "k",
  };

  const { data: application, error: applicationInsertError } = await admin
    .from("applications")
    .insert({
      organization_id: organizationId,
      program_id: formContext.programId,
      form_version_id: formContext.formVersionId,
      family_id: family.id,
      primary_guardian_id: guardian.id,
      created_by_user_id: userId,
      status: "submitted",
      submitted_at: new Date().toISOString(),
      responses,
    })
    .select("id")
    .single();

  if (applicationInsertError) throw applicationInsertError;
  if (!application?.id) {
    throw new Error(`Failed to seed additional application for ${email}`);
  }

  return application.id as string;
}

const SEED_MANIFEST_PATH = path.join(process.cwd(), "e2e/.seed-manifest.json");

export type E2eSeedManifest = {
  organizationId: string;
  forms: {
    default: string;
    withFee: string;
  };
  applications: {
    alphaChild: string;
    betaChild: string;
    enrollTarget: string;
    feePendingDraft: string;
    noFeeDraft: string;
  };
};

function writeSeedManifest(manifest: E2eSeedManifest): void {
  fs.mkdirSync(path.dirname(SEED_MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(SEED_MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

export async function seedE2eDatabase(): Promise<void> {
  const admin = createAdminClient();
  const organizationId = await getOrganizationId(admin);

  const { error: liveStatusError } = await admin
    .from("organizations")
    .update({ status: "live" })
    .eq("id", organizationId);

  if (liveStatusError) throw liveStatusError;

  const adminUserId = await ensureAuthUser(admin, {
    email: E2E_ADMIN_EMAIL,
    password: E2E_TEST_PASSWORD,
  });
  const parentUserId = await ensureAuthUser(admin, {
    email: E2E_PARENT_EMAIL,
    password: E2E_TEST_PASSWORD,
  });
  const otherParentUserId = await ensureAuthUser(admin, {
    email: E2E_OTHER_PARENT_EMAIL,
    password: E2E_TEST_PASSWORD,
  });
  await ensureAuthUser(admin, {
    email: E2E_NONADMIN_EMAIL,
    password: E2E_TEST_PASSWORD,
  });

  runDbQuery(`
    insert into public.organization_settings (organization_id, branding, features)
    values (
      '${organizationId}',
      ${sqlJson(DEFAULT_BRANDING)},
      ${sqlJson(DEFAULT_FEATURES)}
    )
    on conflict (organization_id) do update
    set branding = excluded.branding,
        features = excluded.features;
  `);

  runDbQuery(`
    insert into public.organization_memberships (
      organization_id,
      user_id,
      role,
      status
    )
    values (
      '${organizationId}',
      '${adminUserId}',
      'admin',
      'active'
    )
    on conflict (organization_id, user_id) do update
    set role = excluded.role,
        status = excluded.status;
  `);

  runDbQuery(`
    insert into public.families (
      organization_id,
      name,
      primary_email
    )
    select
      '${organizationId}',
      'E2E Test Family',
      '${E2E_PARENT_EMAIL}'
    where not exists (
      select 1
      from public.families
      where organization_id = '${organizationId}'
        and primary_email = '${E2E_PARENT_EMAIL}'
    );
  `);

  runDbQuery(`
    insert into public.guardians (
      organization_id,
      family_id,
      user_id,
      first_name,
      last_name,
      email,
      relationship
    )
    select
      '${organizationId}',
      f.id,
      '${parentUserId}',
      'E2E',
      'Parent',
      '${E2E_PARENT_EMAIL}',
      'parent'
    from public.families f
    where f.organization_id = '${organizationId}'
      and f.primary_email = '${E2E_PARENT_EMAIL}'
      and not exists (
        select 1
        from public.guardians g
        where g.organization_id = '${organizationId}'
          and g.user_id = '${parentUserId}'
      )
    limit 1;
  `);

  runDbQuery(`
    update public.guardians
    set
      family_id = f.id,
      email = '${E2E_PARENT_EMAIL}'
  from public.families f
  where guardians.organization_id = '${organizationId}'
    and guardians.user_id = '${parentUserId}'
    and f.organization_id = '${organizationId}'
    and f.primary_email = '${E2E_PARENT_EMAIL}';
  `);

  const formContext = await ensureE2eApplicationFormContext(admin, organizationId);
  const feeFormVersionId = await ensureE2eFeeApplicationFormContext(
    admin,
    organizationId,
    formContext.programId,
  );
  await ensureE2ePaymentAccount(admin, organizationId);

  const alphaChildApplicationId = await seedParentApplication(admin, {
    organizationId,
    userId: parentUserId,
    email: E2E_PARENT_EMAIL,
    familyName: "E2E Parent A Family",
    studentName: "Alpha Child",
    formContext,
  });

  const betaChildApplicationId = await seedParentApplication(admin, {
    organizationId,
    userId: otherParentUserId,
    email: E2E_OTHER_PARENT_EMAIL,
    familyName: "E2E Parent B Family",
    studentName: "Beta Child",
    formContext,
  });

  const enrollTargetApplicationId = await seedAdditionalSubmittedApplication(admin, {
    organizationId,
    userId: otherParentUserId,
    email: E2E_OTHER_PARENT_EMAIL,
    studentName: "Gamma Child",
    formContext,
  });

  const feePendingDraftApplicationId = await seedFeePendingDraftApplication(admin, {
    organizationId,
    userId: parentUserId,
    email: E2E_PARENT_EMAIL,
    formContext: { ...formContext, feeFormVersionId },
  });

  const noFeeDraftApplicationId = await seedNoFeeDraftApplication(admin, {
    organizationId,
    userId: parentUserId,
    email: E2E_PARENT_EMAIL,
    formContext,
  });

  writeSeedManifest({
    organizationId,
    forms: {
      default: formContext.formVersionId,
      withFee: feeFormVersionId,
    },
    applications: {
      alphaChild: alphaChildApplicationId,
      betaChild: betaChildApplicationId,
      enrollTarget: enrollTargetApplicationId,
      feePendingDraft: feePendingDraftApplicationId,
      noFeeDraft: noFeeDraftApplicationId,
    },
  });
}
