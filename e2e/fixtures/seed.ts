import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { DEFAULT_BRANDING, DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
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
    sections: [
      {
        id: "e2e-section-student",
        title: "Student information",
        fields: [
          {
            id: "student_first_name",
            label: "First Name",
            type: "text",
            required: true,
            width: "full",
          },
        ],
      },
    ],
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
): Promise<void> {
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

  const { error: applicationInsertError } = await admin.from("applications").insert({
    organization_id: organizationId,
    program_id: formContext.programId,
    form_version_id: formContext.formVersionId,
    family_id: familyId,
    primary_guardian_id: guardianId,
    created_by_user_id: userId,
    status: "submitted",
    submitted_at: new Date().toISOString(),
    responses,
  });

  if (applicationInsertError) throw applicationInsertError;
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

  await seedParentApplication(admin, {
    organizationId,
    userId: parentUserId,
    email: E2E_PARENT_EMAIL,
    familyName: "E2E Parent A Family",
    studentName: "Alpha Child",
    formContext,
  });

  await seedParentApplication(admin, {
    organizationId,
    userId: otherParentUserId,
    email: E2E_OTHER_PARENT_EMAIL,
    familyName: "E2E Parent B Family",
    studentName: "Beta Child",
    formContext,
  });
}
