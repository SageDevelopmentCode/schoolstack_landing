"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import AdminHeader from "@/components/admin/AdminHeader";

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
    <div className="min-h-screen bg-bg pt-20 pb-28 px-6">
      <AdminHeader variant="minimal" />

      <div className="max-w-[420px] mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-[clamp(1.85rem,4.5vw,2.6rem)] leading-[1.05] text-text">
            Admin{" "}
            <em style={{ color: "var(--color-clay)", fontStyle: "italic" }}>
              sign in
            </em>
          </h1>
          <p className="text-[15px] text-text-muted font-secondary mt-3 leading-relaxed">
            Internal tools for the MudKitchen team.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-xl p-8 shadow-sm space-y-5"
        >
          {error && (
            <div className="text-sm text-clay bg-clay-soft/30 border border-clay/30 rounded-lg px-4 py-3 font-secondary">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-[13px] font-medium font-secondary text-text-muted"
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
              className="h-12 px-4 rounded-lg border border-border bg-bg text-[14px] font-secondary text-text placeholder:text-text-faint focus:outline-none focus:border-accent transition-colors duration-150 w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-[13px] font-medium font-secondary text-text-muted"
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
              className="h-12 px-4 rounded-lg border border-border bg-bg text-[14px] font-secondary text-text placeholder:text-text-faint focus:outline-none focus:border-accent transition-colors duration-150 w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-clay text-white rounded-pill h-12 text-sm font-medium font-secondary hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{ backgroundColor: "var(--color-clay)" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen bg-bg pt-20 pb-28 px-6">
      <AdminHeader variant="minimal" />
      <div className="max-w-[420px] mx-auto">
        <div className="h-8 w-48 bg-border/40 rounded animate-pulse mb-8" />
        <div className="bg-surface border border-border rounded-xl p-8 shadow-sm space-y-5">
          <div className="h-12 bg-border/30 rounded-lg animate-pulse" />
          <div className="h-12 bg-border/30 rounded-lg animate-pulse" />
          <div className="h-12 bg-border/30 rounded-lg animate-pulse" />
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
