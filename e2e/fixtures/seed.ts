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

export async function seedE2eDatabase(): Promise<void> {
  const admin = createAdminClient();
  const organizationId = await getOrganizationId(admin);

  const adminUserId = await ensureAuthUser(admin, {
    email: E2E_ADMIN_EMAIL,
    password: E2E_TEST_PASSWORD,
  });
  const parentUserId = await ensureAuthUser(admin, {
    email: E2E_PARENT_EMAIL,
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
}
