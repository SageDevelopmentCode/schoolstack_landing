import { createClient } from "@supabase/supabase-js";
import ws from "ws";

export type CreateAdminClientOptions = {
  fetch?: typeof fetch;
};

export function createAdminClient(options?: CreateAdminClientOptions) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: options?.fetch ? { fetch: options.fetch } : undefined,
    realtime: {
      // ws constructor types differ from Supabase's WebSocketLikeConstructor
      transport: ws as never,
    },
  });
}
