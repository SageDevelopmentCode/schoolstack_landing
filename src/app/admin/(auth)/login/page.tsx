"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import AdminHeader from "@/components/admin/AdminHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import ButtonLoadingLabel, {
  BUTTON_LOADING_LAYOUT_CLASS,
} from "@/components/ui/ButtonLoadingLabel";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className="admin-app min-h-screen bg-admin-bg pt-20 pb-28 px-6">
      <AdminHeader variant="minimal" />

      <div className="max-w-[420px] mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-admin-text">
            Admin sign in
          </h1>
          <p className="text-sm text-admin-muted mt-2">
            Internal tools for the MudKitchen team.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-admin-surface border border-admin-border rounded-admin-md p-8 shadow-sm space-y-5"
        >
          {error ? (
            <div className="text-sm text-admin-error bg-admin-error-bg border border-admin-error-border rounded-admin-md px-4 py-3">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-admin-muted"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 px-3 rounded-admin-md border border-admin-border bg-admin-bg text-sm text-admin-text placeholder:text-admin-faint focus:outline-none focus:ring-2 focus:ring-admin-accent/30 w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-admin-muted"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 px-3 rounded-admin-md border border-admin-border bg-admin-bg text-sm text-admin-text placeholder:text-admin-faint focus:outline-none focus:ring-2 focus:ring-admin-accent/30 w-full"
            />
          </div>

          <AdminButton
            type="submit"
            variant="primary"
            disabled={loading}
            className={`w-full h-11 ${BUTTON_LOADING_LAYOUT_CLASS}`}
          >
            <ButtonLoadingLabel loading={loading} loadingLabel="Signing in…">
              Sign in
            </ButtonLoadingLabel>
          </AdminButton>
        </form>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="admin-app min-h-screen bg-admin-bg pt-20 pb-28 px-6">
      <AdminHeader variant="minimal" />
      <div className="max-w-[420px] mx-auto">
        <div className="h-8 w-48 bg-admin-border/40 rounded-admin-sm animate-pulse mb-8" />
        <div className="bg-admin-surface border border-admin-border rounded-admin-md p-8 shadow-sm space-y-5">
          <div className="h-11 bg-admin-border/30 rounded-admin-md animate-pulse" />
          <div className="h-11 bg-admin-border/30 rounded-admin-md animate-pulse" />
          <div className="h-11 bg-admin-border/30 rounded-admin-md animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
