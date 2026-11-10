import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HomeShell from "@/components/home/HomeShell";
import { BRIGHT_NAV_OFFSET } from "@/components/home/bright-styles";
import TryFreeHeadline from "@/components/try/TryFreeHeadline";
import TryFreeSchoolForm from "@/components/try/TryFreeSchoolForm";
import { resolveAuthenticatedLogin } from "@/lib/auth/login-destination";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Try MudKitchen for free",
  description:
    "Create a free MudKitchen school dashboard. Confirm your email with a code on this page.",
};

export default async function TryPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    let destination: string | null = null;
    try {
      const result = await resolveAuthenticatedLogin(supabase, user.id);
      if (result.ok && "needsSchoolSelection" in result) {
        destination = "/login";
      } else if (result.ok && "href" in result && result.href) {
        destination = result.href;
      }
    } catch {
      destination = null;
    }

    if (destination) {
      redirect(destination);
    }
  }

  return (
    <HomeShell className="bg-white">
      <main className={`${BRIGHT_NAV_OFFSET} mx-auto w-full max-w-lg px-5 pb-24 sm:px-6`}>
        <TryFreeHeadline />
        <p className="mt-4 text-base leading-relaxed text-[#5c564e] sm:text-lg">
          Tell us your school name and email. We&apos;ll send a 6-digit code to this
          page, then open your dashboard.
        </p>
        <TryFreeSchoolForm />
      </main>
    </HomeShell>
  );
}
