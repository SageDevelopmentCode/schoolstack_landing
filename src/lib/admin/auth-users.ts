import type { SupabaseClient } from "@supabase/supabase-js";

export type ResolvedAuthUser = {
  id: string;
  email: string;
  created: boolean;
};

export async function findUserByEmail(
  admin: SupabaseClient,
  email: string,
): Promise<{ id: string; email: string | undefined } | null> {
  const normalizedEmail = email.trim().toLowerCase();
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw error;
    }

    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === normalizedEmail,
    );

    if (user) {
      return { id: user.id, email: user.email };
    }

    if (data.users.length < perPage) {
      break;
    }

    page += 1;
  }

  return null;
}

export async function createOrGetConfirmedAuthUser(
  admin: SupabaseClient,
  input: {
    email: string;
    firstName: string;
    lastName: string;
  },
): Promise<ResolvedAuthUser> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = await findUserByEmail(admin, normalizedEmail);

  if (existing) {
    return {
      id: existing.id,
      email: existing.email ?? normalizedEmail,
      created: false,
    };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: normalizedEmail,
    email_confirm: true,
    user_metadata: {
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Failed to create auth user.");
  }

  return {
    id: data.user.id,
    email: data.user.email ?? normalizedEmail,
    created: true,
  };
}
